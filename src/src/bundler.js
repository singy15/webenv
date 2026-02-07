import * as esbuild from "esbuild-wasm";
import { get, set } from "idb-keyval";
import { md5 } from "js-md5";
import mustache from "mustache";
import wasmUrl from "./esbuild.wasm?url";
import storageUtil from "./storage-util.js";
import appApi from "./app.js";

let bundlerInitialized = false;
let esbuildContexts = {};
let lastEntryPointPath = null;

async function fileToUint8Array(file) {
  const arrayBuffer = await file.arrayBuffer();
  return new Uint8Array(arrayBuffer);
}

let importMapping = {};
let mustacheScripts = {};
let files = [];
let virtualFiles = {};
let virtualFilesType = {}; // text or binary
let buildScripts = [];
let buildStyles = [];

async function build(appOid, startup = null) {
  let app = await get(`webenv/apps/${appOid}`);

  // let resolve = async (path, appOid) => {
  //   let app = await get(`webenv/apps/${appOid}`);
  //   let content = null;
  //   for (let i = 0; i < app.files.length; i++) {
  //     let file = await get(`webenv/files/${app.files[i]}`);
  //     if(file.path !== path) continue;

  //     if (file.binary) {
  //       let bin = await get(`webenv/bins/${file.oid}`);
  //       content = await fileToUint8Array(bin);
  //     } else {
  //       content = file.text;
  //     }
  //     break;
  //   }
  //   return content;
  // };

  // let importMapping = {};
  // let mustacheScripts = {};
  // let files = [];
  // let virtualFiles = {};
  // let virtualFilesType = {}; // text or binary
  // let buildScripts = [];
  // let buildStyles = [];
  Object.keys(importMapping).forEach((key) => delete importMapping[key]);
  Object.keys(mustacheScripts).forEach((key) => delete mustacheScripts[key]);
  files.splice(0, files.length);
  Object.keys(virtualFiles).forEach((key) => delete virtualFiles[key]);
  Object.keys(virtualFilesType).forEach((key) => delete virtualFilesType[key]);
  buildScripts.splice(0, buildScripts.length);
  buildStyles.splice(0, buildStyles.length);

  for (let i = 0; i < app.files.length; i++) {
    let file = await get(`webenv/files/${app.files[i]}`);
    files.push(file);
    if (file.binary) {
      virtualFilesType[file.path] = "binary";
      let bin = await get(`webenv/bins/${file.oid}`);
      virtualFiles[file.path] = await fileToUint8Array(bin);
    } else {
      virtualFilesType[file.path] = "text";
      virtualFiles[file.path] = file.text;
    }

    let embedPattern = /@@@webenv.embed\((.+)\)/;
    if (!file.binary) {
      let match = file.text.match(embedPattern);
      if (match) {
        mustacheScripts[match[1]] = file.text;
      }
    }

    let patScript = /@@@webenv.script\((.*)\)/;
    if (file.path.endsWith(".js") && file.text.match(patScript)) {
      let match = file.text.match(patScript);
      buildScripts.push({ key: match[1], path: file.path });
    }

    let patStyle = /@@@webenv.style\((.*)\)/;
    if (file.path.endsWith(".css") && file.text.match(patStyle)) {
      let match = file.text.match(patStyle);
      buildStyles.push({ key: match[1], path: file.path });
    }

    let impat = /@@@webenv.importmap\((.*)\)/;
    if (file.path.endsWith(".js") && file.text.match(impat)) {
      let match = file.text.match(impat);
      importMapping[match[1]] = file.path;
    }
  }

  const virtualPlugin = {
    name: "virtual-plugin",
    setup(build) {
      // Object.keys(importMapping).forEach((k) => {
      //   build.onResolve({ filter: new RegExp("^" + k + "$") }, (args) => {
      //     return {
      //       path: importMapping[k],
      //       namespace: "virtual",
      //     };
      //   });
      // });

      build.onResolve({ filter: /.+/ }, (args) => {
        for (let k in importMapping) {
          if (args.path === k) {
            return {
              path: importMapping[k],
              namespace: "virtual",
            };
          }
        }
      });

      build.onResolve({ filter: /^[\.]+\/.*/ }, (args) => {
        let path = args.path;
        let optionMatch = path.match(/\?(.+)$/);
        let loaderOption = null;
        if (optionMatch) {
          path = path.substring(0, path.length - optionMatch[0].length);
          loaderOption = optionMatch[1];
        }

        let i = args.importer
          .split("/")
          .slice(0, args.importer.split("/").length - 1);
        let s = path.split("/");
        let p = [];
        s.forEach((e) => {
          if (e === ".") {
            p = p.concat(i);
          } else if (e === "..") {
            if (p.length > 0) {
              p = p.slice(0, p.length - 1);
            } else {
              p = p.concat(i);
              p = p.slice(0, p.length - 1);
            }
          } else {
            p = p.concat([e]);
          }
        });
        let absPath = p.join("/");

        return {
          path: absPath,
          namespace: "virtual",
          pluginData: { loader: loaderOption },
        };
      });

      build.onResolve({ filter: /^\/.*/ }, (args) => {
        let path = args.path;
        let optionMatch = path.match(/\?(.+)$/);
        let loaderOption = null;
        if (optionMatch) {
          path = path.substring(0, path.length - optionMatch[0].length);
          loaderOption = optionMatch[1];
        }

        const absPath = new URL(args.path, "file://" + args.resolveDir + "/")
          .pathname;

        return {
          path: absPath,
          namespace: "virtual",
          pluginData: { loader: loaderOption },
        };
      });

      build.onResolve({ filter: /^https:\/\/.*/ }, (args) => {
        const path = args.path;
        return {
          path,
          namespace: "virtual",
        };
      });

      build.onResolve({ filter: /^http:\/\/.*/ }, (args) => {
        const path = args.path;
        return {
          path,
          namespace: "virtual",
        };
      });

      build.onLoad({ filter: /^\/.*/, namespace: "virtual" }, async (args) => {
        const contents = virtualFiles[args.path];

        const isBinary = virtualFilesType[args.path];
        if (!contents) throw new Error(`File not found: ${args.path}`);

        if (args.pluginData?.loader) {
          return {
            contents,
            loader: args.pluginData.loader,
            resolveDir: ".",
          };
        } else if (isBinary === "binary") {
          return {
            contents,
            loader: "dataurl",
            resolveDir: ".",
          };
        } else {
          return {
            contents,
            loader: "js",
            resolveDir: ".",
          };
        }
      });

      build.onLoad(
        { filter: /https:\/\/.*/, namespace: "virtual" },
        async (args) => {
          let text = await (
            await fetch(args.path, { cache: "no-store" })
          ).text();
          const contents = text;
          console.log("https", "md5", md5(contents));
          if (!contents) throw new Error(`File not found: ${args.path}`);
          return {
            contents,
            loader: "js",
          };
        },
      );

      build.onLoad(
        { filter: /http:\/\/.*/, namespace: "virtual" },
        async (args) => {
          let text = await (
            await fetch(args.path, { cache: "no-store" })
          ).text();
          const contents = text;
          console.log("http", "md5", md5(contents));
          if (!contents) throw new Error(`File not found: ${args.path}`);
          return {
            contents,
            loader: "js",
          };
        },
      );
    },
  };

  if (!bundlerInitialized) {
    // const base64 = wasmUrl.split(',')[1];
    // const binary = Uint8Array.from(atob(base64), c => c.charCodeAt(0));
    //
    // const result = await WebAssembly.instantiate(binary.buffer);
    // console.log(result)
    await esbuild.initialize({
      wasmURL: wasmUrl,
      worker: true,
    });

    // await esbuild.initialize({
    //   wasmURL: "esbuild.wasm",
    //   worker: true,
    // });
    bundlerInitialized = true;
  }

  //let startupFilePath = await get(`webenv/startup`);
  let startupFilePath = startup;
  if (lastEntryPointPath !== startupFilePath) {
    esbuildContexts = {};
    lastEntryPointPath = startupFilePath;
  }
  const htmlTemplate = virtualFiles[startupFilePath];

  if (!htmlTemplate) {
    throw new Error("index.html not exists!");
  }

  // parse template
  let parser = new DOMParser();
  let doc = parser.parseFromString(htmlTemplate, "text/html");

  const pseudeBaseUrlForParsing = `https://localhost`;

  // get required js bundle from parsed template
  buildScripts.splice(0, buildScripts.length);
  let scriptKeyIdSeq = 0;
  let scripts = doc.querySelectorAll("script[inline]");
  scripts.forEach((script) => {
    // console.log(script, script.getAttribute("inline"));
    const url = new URL(
      pseudeBaseUrlForParsing + script.getAttribute("inline"),
    );
    const params = url.searchParams;
    // if (params.has("inline")) {
    scriptKeyIdSeq++;
    let mustacheVar = `__script${scriptKeyIdSeq}`;
    buildScripts.push({
      key: url.pathname,
      path: url.pathname,
      mustacheVar: mustacheVar,
    });
    script.removeAttribute("inline");
    script.textContent = `{{{ ${mustacheVar} }}}`;
    // }
  });

  let debugScripts = doc.querySelectorAll("script[debug]");
  debugScripts.forEach((dscript) => {
    let mustacheVar = `___debugScript`;
    mustacheScripts[mustacheVar] = `{
  let nextId = 0;
  const pending = {};

  window.addEventListener("message", e => {
    const { id, result } = e.data;
    if (pending[id]) {
      pending[id](result);
      delete pending[id];
    }
  });

  // debug indexeddb
  window.devidb = {};
  window.devidb.get = function(key) {
    return new Promise(resolve => {
      const id = nextId++;
      pending[id] = resolve;
      let type = "get";
      let val = null;
      parent.postMessage({ id, type, key, val }, "*");
    });
  };
  window.devidb.set = function(key, val) {
    return new Promise(resolve => {
      const id = nextId++;
      pending[id] = resolve;
      let type = "set";
      parent.postMessage({ id, type, key, val }, "*");
    });
  };
}`;
    dscript.removeAttribute("debug");
    dscript.textContent = `{{{ ${mustacheVar} }}}`;
  });

  // get cache script from parsed template
  let cacheScripts = doc.querySelectorAll('script[cache="true"]');
  for (let script of cacheScripts) {
    const url = new URL(script.getAttribute("src"));
    let cacheKey = `/@cache/${md5(script.getAttribute("src"))}`;
    let contents = null;
    if (virtualFiles[cacheKey]) {
      contents = virtualFiles[cacheKey];
    } else {
      let text = await (
        await fetch(script.getAttribute("src"), { cache: "no-store" })
      ).text();
      contents = text;
      virtualFiles[cacheKey] = contents;
      let newFile = await appApi.createFile(cacheKey);
      newFile.text = contents;
      await appApi.addFile(appOid, newFile);
    }
    scriptKeyIdSeq++;
    let mustacheVar = `__script${scriptKeyIdSeq}`;
    script.removeAttribute("cache");
    script.removeAttribute("src");
    script.textContent = `{{{ ${mustacheVar} }}}`;
    mustacheScripts[mustacheVar] = contents;
  }

  // get cache link from parsed template
  let cacheLinks = doc.querySelectorAll('link[cache="true"]');
  for (let link of cacheLinks) {
    const url = new URL(link.getAttribute("href"));
    let cacheKey = `/@cache/${md5(link.getAttribute("href"))}`;
    let contents = null;
    if (virtualFiles[cacheKey]) {
      contents = virtualFiles[cacheKey];
    } else {
      let text = await (
        await fetch(link.getAttribute("href"), { cache: "no-store" })
      ).text();
      contents = text;
      virtualFiles[cacheKey] = contents;
      let newFile = await appApi.createFile(cacheKey);
      newFile.text = contents;
      await appApi.addFile(appOid, newFile);
    }
    // scriptKeyIdSeq++;
    // let mustacheVar = `__script${scriptKeyIdSeq}`;
    link.removeAttribute("cache");

    function cssToDataURL(str) {
      const uint8 = new TextEncoder().encode(str);
      let binary = "";
      const chunkSize = 0x8000;
      for (let i = 0; i < uint8.length; i += chunkSize) {
        const chunk = uint8.subarray(i, i + chunkSize);
        binary += String.fromCharCode.apply(null, chunk);
      }
      return "data:text/css;base64," + btoa(binary);
    }

    link.setAttribute("href", cssToDataURL(contents));

    // link.removeAttribute("src");
    // link.textContent = `{{{ ${mustacheVar} }}}`;
    // mustacheScripts[mustacheVar] = contents;
  }

  // get required css bundle from parsed template
  buildStyles.splice(0, buildStyles.length);
  let styleKeyIdSeq = 0;
  let cssStyles = doc.querySelectorAll(`style[inline]`);
  cssStyles.forEach((cssStyle) => {
    // console.log(cssStyle, cssStyle.getAttribute("inline"));
    const url = new URL(
      pseudeBaseUrlForParsing + cssStyle.getAttribute("inline"),
    );
    const params = url.searchParams;
    // if (params.has("inline")) {
    styleKeyIdSeq++;
    let mustacheVar = `__style${styleKeyIdSeq}`;
    buildStyles.push({
      key: url.pathname,
      path: url.pathname,
      mustacheVar: mustacheVar,
    });
    cssStyle.removeAttribute("inline");
    cssStyle.textContent = `{{{ ${mustacheVar} }}}`;
    // }
  });

  // if (!virtualFiles["/main.js"]) {
  //   throw new Error("main.js not exists!");
  // }

  let minify = storageUtil.getStorage("minify", true);

  for (let i = 0; i < buildScripts.length; i++) {
    let e = buildScripts[i];

    let context = null;
    if (esbuildContexts[e.path]) {
      context = esbuildContexts[e.path];
    } else {
      context = await esbuild.context({
        format: "esm",
        entryPoints: [e.path],
        bundle: true,
        write: false,
        minify: minify,
        minifyIdentifiers: false,
        minifyWhitespace: true,
        minifySyntax: true,
        keepNames: true,
        treeShaking: true,
        //sourcemap: "inline",
        plugins: [virtualPlugin],
        loader: {
          ".png": "dataurl",
        },
      });
      esbuildContexts[e.path] = context;
    }

    console.log(`building [${e.path}]`);

    let result = (await context.rebuild());
    console.log(result);

    let js = result.outputFiles[0].text;
    mustacheScripts[e.mustacheVar] = js;
  }

  for (let i = 0; i < buildStyles.length; i++) {
    let e = buildStyles[i];
    /*
    function cssToDataURL(str) {
      const uint8 = new TextEncoder().encode(str);
      let binary = "";
      const chunkSize = 0x8000;
      for (let i = 0; i < uint8.length; i += chunkSize) {
        const chunk = uint8.subarray(i, i + chunkSize);
        binary += String.fromCharCode.apply(null, chunk);
      }
      return "data:text/css;base64," + btoa(binary);
    }

    const dataUrl = cssToDataURL(virtualFiles[e.path]);
    */
    mustacheScripts[e.mustacheVar] = virtualFiles[e.path];
  }

  // construct model
  const model = {};
  Object.keys(mustacheScripts).forEach((k) => {
    model[k] = mustacheScripts[k];
  });

  // rendering
  const serializer = new XMLSerializer();
  const htmlOut = serializer.serializeToString(doc);
  const htmlView = mustache.render(htmlOut, model);

  return htmlView;
}

export default {
  build: build,
};
