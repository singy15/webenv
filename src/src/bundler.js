import * as esbuild from "esbuild-wasm";
import { get, set } from "idb-keyval";
import mustache from "mustache";
import wasmUrl from "./esbuild.wasm?url";
import storageUtil from "./storage-util.js";

let bundlerInitialized = false;
let esbuildContexts = {};

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

async function build(appOid) {
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
      Object.keys(importMapping).forEach((k) => {
        build.onResolve({ filter: new RegExp("^" + k + "$") }, (args) => {
          return {
            path: importMapping[k],
            namespace: "virtual",
          };
        });
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
          let text = await (await fetch(args.path)).text();
          const contents = text;
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
          let text = await (await fetch(args.path)).text();
          const contents = text;
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

  let startupFilePath = await get(`webenv/startup`);
  const htmlTemplate = virtualFiles[startupFilePath];

  if (!htmlTemplate) {
    throw new Error("index.html not exists!");
  }

  if (!virtualFiles["/main.js"]) {
    throw new Error("main.js not exists!");
  }

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

    let js = (await context.rebuild()).outputFiles[0].text;
    mustacheScripts[e.key] = js;
  }

  // const js = (
  //   await esbuild.build({
  //     entryPoints: ["/main.js"],
  //     bundle: true,
  //     write: false,
  //     minify: false,
  //     minifyIdentifiers: false,
  //     minifyWhitespace: true,
  //     minifySyntax: true,
  //     plugins: [virtualPlugin],
  //     loader: {
  //       ".png": "dataurl",
  //     },
  //   })
  // ).outputFiles[0].text;

  for (let i = 0; i < buildStyles.length; i++) {
    let e = buildStyles[i];
    let css = await esbuild.transform(virtualFiles[e.path], {
      minify: true,
      loader: "css",
    });
    mustacheScripts[e.key] = css.code;
  }

  // const stylingTransformResult = await esbuild.transform(
  //   virtualFiles["/style.css"] ?? "",
  //   {
  //     minify: true,
  //     loader: "css",
  //   },
  // );
  // const style = stylingTransformResult.code;

  // reload script
  // const reloadScript = `
  // (() => {
  //   let ver = localStorage.getItem("webenv/debug/version");
  //   setInterval(() => {
  //     let now = localStorage.getItem("webenv/debug/version");
  //     if(now > ver) {
  //       ver = now;
  //       location.reload();
  //     }
  //   }, 1000);
  // })()`;
  const reloadScript = "";

  const model = {
    // script: js + " " + reloadScript,
    // style: style,
    //reloadScript: reloadScript,
  };

  Object.keys(mustacheScripts).forEach((k) => {
    model[k] = mustacheScripts[k];
  });

  const htmlView = mustache.render(htmlTemplate, model);

  return htmlView;
}

export default {
  build: build,
};
