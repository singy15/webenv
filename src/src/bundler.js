import * as esbuild from "./lib/esbuild-wasm.browser.min.js";
import { get, set } from "idb-keyval";
import mustache from "mustache";
import wasmUrl from "./esbuild.wasm?url";


let bundlerInitialized = false;

async function fileToUint8Array(file) {
  const arrayBuffer = await file.arrayBuffer();
  return new Uint8Array(arrayBuffer);
}

async function build(appOid) {
  let app = await get(`webenv/apps/${appOid}`);

  let files = [];
  let virtualFiles = {};
  let virtualFilesType = {}; // text or binary
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
  }

  //console.log("virtual", virtualFiles, virtualFilesType);

  const virtualPlugin = {
    name: "virtual-plugin",
    setup(build) {
      build.onResolve({ filter: /^[\.]+\/.*/ }, (args) => {
        //console.log("resolve1", args);

        let i = args.importer
          .split("/")
          .slice(0, args.importer.split("/").length - 1);
        let s = args.path.split("/");
        let p = [];
        s.forEach((e) => {
          //console.log("part", e);
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

        //console.log("resolved", absPath);

        return {
          //path,
          path: absPath,
          namespace: "virtual",
        };
      });

      build.onResolve({ filter: /^\/.*/ }, (args) => {
        //console.log("resolve2", args);

        const path = new URL(args.path, "file://" + args.resolveDir + "/")
          .pathname;
        //console.log(path);
        return {
          path,
          namespace: "virtual",
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

      build.onLoad({ filter: /^\/.*/, namespace: "virtual" }, (args) => {
        const contents = virtualFiles[args.path];
        const isBinary = virtualFilesType[args.path];
        if (!contents) throw new Error(`File not found: ${args.path}`);

        if (isBinary === "binary") {
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

  const htmlTemplate = virtualFiles["/index.html"];

  if (!htmlTemplate) {
    throw new Error("index.html not exists!");
  }

  if (!virtualFiles["/main.js"]) {
    throw new Error("main.js not exists!");
  }

  const js = (
    await esbuild.build({
      entryPoints: ["/main.js"],
      bundle: true,
      write: false,
      minify: false,
      minifyIdentifiers: false,
      minifyWhitespace: true,
      minifySyntax: true,
      plugins: [virtualPlugin],
      loader: {
        ".png": "dataurl",
        // ".gif": "dataurl",
        // ".jpeg": "dataurl",
        // ".bmp": "dataurl",
      },
    })
  ).outputFiles[0].text;

  //console.log(js);

  const transformOptions = {
    minify: true,
  };

  //const scriptTransformResult = await esbuild.transform(scriptInput, {
  //  ...transformOptions,
  //  loader: "js",
  //});
  //const script = scriptTransformResult.code;

  const stylingTransformResult = await esbuild.transform(
    virtualFiles["/style.css"] ?? "",
    {
      ...transformOptions,
      loader: "css",
    },
  );
  const style = stylingTransformResult.code;

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
    script: js + " " + reloadScript,
    style: style,
    //reloadScript: reloadScript,
  };

  const htmlView = mustache.render(htmlTemplate, model);

  return htmlView;
}

export default {
  build: build,
};
