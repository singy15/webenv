<script setup>
import { unref, ref, reactive, onMounted, nextTick } from "vue";
import * as monaco from "monaco-editor";
import editorWorker from "monaco-editor/esm/vs/editor/editor.worker?worker&inline";
import jsonWorker from "monaco-editor/esm/vs/language/json/json.worker?worker&inline";
import cssWorker from "monaco-editor/esm/vs/language/css/css.worker?worker&inline";
import htmlWorker from "monaco-editor/esm/vs/language/html/html.worker?worker&inline";
import tsWorker from "monaco-editor/esm/vs/language/typescript/ts.worker?worker&inline";
import uuid4 from "../uuid4.js";
import prettier from "prettier/standalone";
import prettierPluginHtml from "prettier/plugins/html";
import prettierPluginEstree from "prettier/plugins/estree";
import prettierPluginBabel from "prettier/plugins/babel";
import storageUtil from "../storage-util.js";
import { get, set, clear, del } from "idb-keyval";
import bundler from "../bundler.js";
import { initialize, build } from "../lib/esbuild-wasm.browser.min.js";
import moment from "moment";

const fontSize = ref(storageUtil.getStorage("fontSize", 13));

async function initializeIdb() {
  let catalogue = null;
  catalogue = await get(`webenv/catalogue`);
  if (catalogue) return;

  // initialize store
  await set(`webenv/catalogue`, []);

  let example1 = await createApp("example1");
  await addApp(example1);
  await setApp(example1);

  let main = await createFile("/main.js");
  main.text = `console.log("it works!");`;
  await addFile(example1.oid, main);

  let index = await createFile("/index.html");
  index.text = `<!DOCTYPE html>
<html>
<head>
<style>
{{{ style }}}
</style>
</head>
<body>
  it works!
<script type="module" crossorigin>
{{{ script }}}
<\/script>
</body>
</html>
`;
  await addFile(example1.oid, index);

  // let apps = await get("webenv/apps");
  // console.log(apps);
  // if (!apps) {
  //   let exampleapp1 = {
  //     oid: uuid4(),
  //     name: "exampleapp1",
  //     files: [
  //       { oid: uuid4(), path: "/main.js" },
  //       { oid: uuid4(), path: "/components/killable.js" },
  //       { oid: uuid4(), path: "/entity/player.js" },
  //     ],
  //   };
  //   await set("webenv/apps", [exampleapp1]);
  //   for (let i = 0; i < exampleapp1.files.length; i++) {
  //     let s = exampleapp1.files[i];
  //     await set(`webenv/files/${s.oid}`, s.path);
  //   }
  // }
}

async function resetIdb() {
  await clear();
  await initializeIdb();
}

async function onCreateNewApp() {
  let name = prompt();
  if (!name) return;
  let newApp = await createApp(name);
  await addApp(newApp);

  let main = await createFile("/main.js");
  main.text = `console.log("it works!");`;
  await addFile(newApp.oid, main);

  let index = await createFile("/index.html");
  index.text = `<!DOCTYPE html>
<html>
<head>
<style>
{{{ style }}}
</style>
</head>
<body>
  it works!
<script type="module" crossorigin>
{{{ script }}}
<\/script>
</body>
</html>
`;
  await addFile(newApp.oid, index);

  await getSessionList();
}

async function createApp(name) {
  return {
    oid: uuid4(),
    name: name,
    files: [],
  };
}

async function addApp(app) {
  await addCatalogue(app.oid);
  await setApp(app);
}

async function addCatalogue(oid) {
  let catalogue = await get(`webenv/catalogue`);
  catalogue.push(oid);
  await set(`webenv/catalogue`, catalogue);
}

async function getAppByOid(oid) {
  return await get(`webenv/apps/${oid}`);
}

async function setApp(app) {
  return await set(`webenv/apps/${app.oid}`, app);
}

async function createFile(path) {
  return {
    oid: uuid4(),
    path: path,
    text: path,
    binary: false,
  };
}

function deleteTabByHandle(handle) {
  let idx = null;
  tabs.tabitems.forEach((t, i) => {
    if (t.oid === handle) idx = i;
  });
  if (idx == null) return;
  tabs.tabitems = tabs.tabitems.filter((t) => t.oid !== handle);
  nextTick(() => {
    // tabitem.editor.getModel().dispose();
    // tabitem.editor.dispose();
    if (idx > 0) {
      tabs.selected = tabs.tabitems[idx - 1];
    } else if (tabs.tabitems.length > 0) {
      tabs.selected = tabs.tabitems[0];
    }
  });
}

async function onCreateNewFile() {
  //console.log("item", selectedItem.value);

  if (!selectedItem.value) return;

  if (selectedItem.value.file) {
    let file = await getFile(selectedItem.value.handle);
    let path = prompt();
    if (path == null || path === undefined) return;
    if (path === "") {
      // remove
      if (!confirm(`Delete "${file.path}", will you continue?`)) return;
      await removeFile(currentApp.value, file);
      deleteTabByHandle(file.oid);
    } else {
      // rename
      file.path = path;
      await setFile(file);
      deleteTabByHandle(file.oid);
    }
  } else {
    // create
    let appOid = currentApp.value;
    let path = prompt();
    if (!path) return;
    let newFile = await createFile(path);
    await addFile(appOid, newFile);
  }
  await openDirectory();
}

async function addFile(appOid, file) {
  let app = await getAppByOid(appOid);
  app.files.push(file.oid);
  await setApp(app);
  await setFile(file);
}

async function removeFile(appOid, file) {
  let app = await getAppByOid(appOid);
  app.files = app.files.filter((e) => e !== file.oid);
  await setApp(app);
  await delFile(file);
}

async function getFile(oid) {
  return await get(`webenv/files/${oid}`);
}

async function setFile(file) {
  return await set(`webenv/files/${file.oid}`, file);
}

async function delFile(file) {
  if (file.binary) {
    await del(`webenv/bins/${file.oid}`);
  }
  return await del(`webenv/files/${file.oid}`);
}

//resetIdb();
initializeIdb();

let currentApp = ref(null);

// async function setCurrentApp() {
//   currentApp = (await get("webenv/apps"))[0];
// }
// setCurrentApp();

self.MonacoEnvironment = {
  getWorker(_, label) {
    if (label === "json") {
      return new jsonWorker();
    }
    if (label === "css" || label === "scss" || label === "less") {
      return new cssWorker();
    }
    if (label === "html" || label === "handlebars" || label === "razor") {
      return new htmlWorker();
    }
    if (label === "typescript" || label === "javascript") {
      return new tsWorker();
    }
    return new editorWorker();
  },
};

// defineProps({
//   msg: String,
// })

const editorMonaco = ref(null);
let editorMonacoObj = null;

// set theme
monaco.editor.setTheme("vs-dark");

let ps;
let formatVue;
let formatJs;
(async () => {
  ps = prettier; //await import('prettier/standalone');
  const plugins = [
    prettierPluginHtml, //await import('prettier/plugins/html'),
    prettierPluginEstree, //await import('prettier/plugins/estree'),
    prettierPluginBabel, //await import('prettier/plugins/babel'),
  ];

  /*
  console.log(await ps.format(`
<div>
            <span>aaa</span>
</div>
`, { parser: "html", plugins, tabWidth: 2 }));


  console.log(await ps.format(`
function foo() {
          console.log(1234);
}
`, { parser: "babel", plugins, tabWidth: 2 }));
  */

  formatVue = async (srcText) => {
    return await ps.format(srcText, {
      parser: "vue",
      plugins,
      tabWidth: 2,
    });
  };

  formatJs = async (srcText) => {
    return await ps.format(srcText, {
      parser: "babel",
      plugins,
      tabWidth: 2,
    });
  };
})();

function createMonacoEditor(
  targetElement,
  onChange,
  language,
  initialValue = null,
) {
  let editor = monaco.editor.create(targetElement, {
    value: initialValue != null ? initialValue : "",
    language: language,
    automaticLayout: true,
    fontSize: fontSize.value,
    tabSize: 2,
  });

  // set tab width
  editor.getModel().updateOptions({ tabSize: 2 });

  // // add listener
  // editor.getModel().onDidChangeContent((event) => {
  //   onChange(editor, event);
  // });

  // setup formatter
  setTimeout(() => {
    // console.log("vue formatter loaded!");
    monaco.languages.registerDocumentFormattingEditProvider("html", {
      async provideDocumentFormattingEdits(model) {
        let text = await formatVue(model.getValue());
        return [
          {
            range: model.getFullModelRange(),
            text,
          },
        ];
      },
    });
  }, 1000);

  setTimeout(() => {
    // console.log("js formatter loaded!");
    monaco.languages.registerDocumentFormattingEditProvider("javascript", {
      async provideDocumentFormattingEdits(model) {
        let text = await formatJs(model.getValue());
        return [
          {
            range: model.getFullModelRange(),
            text,
          },
        ];
      },
    });
  }, 1000);

  return editor;
}

onMounted(() => {
  /*
  editorMonacoObj = createMonacoEditor(editorMonaco.value,
    (ed, event) => {
      // console.log(ed.getValue());
      editor.text = ed.getValue();
      setSaveTimeout();
    },
    "javascript");
  */
  // openLastDirectory();
});

function languageByExtension(extension) {
  let langs = {
    js: "javascript",
    html: "html",
    vue: "html",
    css: "css",
    txt: "txt",
  };
  return langs[extension];
}

const count = ref(0);

const treelist = ref([]);

const hdir = ref(null);
/*
const editor = reactive({
  text: "",
  hfile: null,
  name: "untitled",
  entry: null,
});
*/

const cssExplorerWidth = ref(`20em`);
const cssEditorWidth = ref(`calc(100% - 18em)`);

async function openDirectory() {
  // hdir.value = await window.showDirectoryPicker({ mode: "readwrite" });
  // await set("directory", hdir.value);
  // if (currentSession.value) {
  //   currentSession.value.dir = hdir.value;
  // }
  //
  //
  // treelist.value = [];
  // let workspace = {
  //   name: "workspace",
  //   handle: hdir.value,
  //   file: false,
  //   level: 0,
  //   parent: null,
  //   expand: false,
  // };
  // treelist.value.push(workspace);
  //
  // expandTree(workspace);

  let appOid = currentApp.value;
  localStorage.setItem(`webenv/curappid`, appOid);
  let app = await getAppByOid(appOid);

  treelist.value = [];
  let workspace = {
    name: "workspace",
    handle: null, //hdir.value,
    file: false,
    level: 0,
    parent: null,
    expand: true,
  };
  treelist.value.push(workspace);

  let files = app.files;
  let unsorted = [];
  for (let i = 0; i < files.length; i++) {
    let fileOid = files[i];
    let file = await getFile(fileOid);
    unsorted.push({
      name: file.path,
      handle: file.oid,
      file: true,
      level: 1,
      parent: workspace,
      expand: false,
    });
  }

  // sort by pathname
  unsorted.sort((a, b) => {
    if (a.name > b.name) {
      return 1;
    } else if (a.name < b.name) {
      return -1;
    } else {
      return 0;
    }
  });

  unsorted.forEach((x) => {
    treelist.value.push(x);
  });

  //console.log(treelist.value);
}

async function openLastDirectory() {
  /*
  const lastHdir = await get("directory");
  if (lastHdir) {
    hdir.value = lastHdir;
  } else {
    return;
  }

  treelist.value = [];
  let workspace = {
    name: "workspace",
    handle: hdir.value,
    file: false,
    level: 0,
    parent: null,
    expand: false,
  };
  treelist.value.push(workspace);

  expandTree(workspace);
*/

  let app = (await get("webenv/apps"))[0];

  treelist.value = [];
  let workspace = {
    name: "workspace",
    handle: null, //hdir.value,
    file: false,
    level: 0,
    parent: null,
    expand: true,
  };
  treelist.value.push(workspace);

  // console.log("open", app);

  app.files.forEach((f) => {
    treelist.value.push({
      name: f.path,
      handle: f.oid,
      file: true,
      level: 1,
      parent: workspace,
      expand: false,
    });
  });

  // for await (let [name, handle] of hdir.value) {
  //   treelist.value.push({
  //     name: name,
  //     handle: handle,
  //     file: handle.kind === "file",
  //     level: workspace.level + 1,
  //     parent: workspace,
  //     expand: false
  //   });
  // }
}

window.debugDirectoryHandle = async () => {
  return await get("directory");
};

async function deleteEntry() {
  if (!editor.entry) return;
  if (!editor.entry.file) return;
  if (!editor.entry.parent) return;

  if (!window.confirm("Delete opened file, are you sure?")) return;

  // editor.entry.parent.removeEntry(editor.entry.name);
  editor.entry.handle.remove();
}

const editorTextarea = ref(null);
function onTab() {
  let obj = editorTextarea.value;
  var cursorPosition = obj.selectionStart;
  var cursorLeft = obj.value.substr(0, cursorPosition);
  var cursorRight = obj.value.substr(cursorPosition, obj.value.length);
  obj.value = cursorLeft + "  " + cursorRight;
  obj.selectionEnd = cursorPosition + 2;
}

async function saveFile(hfile, text) {
  let writableStream = await hfile.createWritable();
  await writableStream.write(text);
  await writableStream.close();
  // console.log("file saved");
}

async function expandTree(item) {
  let idx = treelist.value.indexOf(item);
  let subtree = [];
  let subtreeDirs = [];
  for await (let [name, handle] of item.handle) {
    let addTarget = handle.kind === "file" ? subtree : subtreeDirs;
    addTarget.push({
      name: name,
      handle: handle,
      file: handle.kind === "file",
      level: item.level + 1,
      parent: item,
      expand: false,
    });
  }

  subtree.sort((a, b) => {
    return a.name === b.name ? 0 : a.name > b.name ? 1 : -1;
  });
  subtreeDirs.sort((a, b) => {
    return a.name === b.name ? 0 : a.name > b.name ? 1 : -1;
  });

  treelist.value.splice(idx + 1, 0, ...[...subtreeDirs, ...subtree]);
  item.expand = true;
}

function prompt() {
  return window.prompt();
}

async function foldTree(item) {
  if (item.file) return;
  let children = treelist.value.filter((i) => i.parent == item);
  children.forEach(foldTree);
  treelist.value = treelist.value.filter((i) => i.parent != item);
  item.expand = false;
}

async function toggleTreeExpand(item) {
  if (item.expand) {
    foldTree(item);
  } else {
    expandTree(item);
  }
}

const selectedItem = ref(null);

async function clickTreeItem(item) {
  if (item.file) {
    openFile(item);
  }

  selectedItem.value = item;
}

function setSaveTimeout(tabitem, force = false) {
  if (!autosaveEnabled.value && !force) return;

  if (tabitem.timeoutSave) {
    clearTimeout(tabitem.timeoutSave);
  }

  // set save timeout
  tabitem.timeoutSave = setTimeout(async () => {
    let file = await getFile(tabitem.oid);
    file.text = tabitem.editor.getValue();
    await setFile(file);

    // clear timeout state
    tabitem.timeoutSave = null;

    // set modified state
    let ti = tabs.tabitems.filter((t) => t.oid === tabitem.oid)[0];
    if (ti) {
      ti.modified = false;
    }

    // build
    await buildForDebug(currentApp.value);
  }, 2000);
}

const autosaveEnabled = ref(false);

// let tabfirst = { entry: { name: "Main.vue", hfile: null, }, preview: false, };
const tabs = reactive({
  tabitems: [
    // tabfirst,
    // { entry: { name: "index.html", hfile: null, }, preview: false, },
    // { entry: { name: "vite.svg", hfile: null, }, preview: false, },
  ],
  selected: null, //tabfirst,
});

async function addTab(item) {
  const file = await item.handle.getFile();
  const reader = new FileReader();
  reader.addEventListener("load", () => {
    // editor.text = reader.result;
    let ext = item.name.split(".");
    if (ext.length > 0 && languageByExtension(ext.slice(-1)[0])) {
      var model = editorMonacoObj.getModel();
      monaco.editor.setModelLanguage(
        model,
        languageByExtension(ext.slice(-1)[0]),
      );
    }
    editorMonacoObj.setValue(reader.result);
  });
  reader.readAsText(file);
}

// async function openFile(item) {
//   //editor.hfile = item.handle;
//   //editor.name = item.name;
//   //editor.entry = item;
//
//   let existing = tabs.tabitems.filter((t) => t.entry == item);
//   if (existing.length > 0) {
//     tabs.selected = existing[0];
//     return;
//   }
//
//   let tabitem = {
//     oid: uuid4(),
//     entry: item,
//     preview: false,
//     modified: false,
//   };
//
//   tabs.tabitems.push(tabitem);
//   tabs.selected = tabitem;
//   let ti = tabs.tabitems[tabs.tabitems.indexOf(tabitem)];
//
//   nextTick(async () => {
//     const file = await item.handle.getFile();
//     const reader = new FileReader();
//     reader.addEventListener("load", () => {
//       // editor.text = reader.result;
//
//       let ext = item.name.split(".");
//
//       let language = "text";
//
//       if (ext.length > 0 && languageByExtension(ext.slice(-1)[0])) {
//         // var model = editor.getModel();
//         // monaco.editor.setModelLanguage(model, languageByExtension(ext.slice(-1)[0]));
//         language = languageByExtension(ext.slice(-1)[0]);
//       }
//
//       let editor = createMonacoEditor(
//         /*editorMonaco.value[tabs.tabitems.indexOf(tabitem)], */
//         document.querySelector(`#editor-${ti.oid}`),
//         (ed, val) => {
//           ti.modified = true;
//           setSaveTimeout(tabitem);
//         },
//         language,
//       );
//       tabitem.editor = editor;
//
//       editor.setValue(reader.result);
//
//       // add listener
//       editor.getModel().onDidChangeContent((event) => {
//         ((ed, val) => {
//           ti.modified = true;
//           setSaveTimeout(tabitem);
//         })(editor, event);
//       });
//     });
//     reader.readAsText(file);
//   });
// }

async function openFile(item) {
  let existing = tabs.tabitems.filter((t) => t.oid == item.handle);
  if (existing.length > 0) {
    tabs.selected = existing[0];
    return;
  }

  let tabitem = {
    oid: item.handle,
    entry: item,
    preview: false,
    modified: false,
  };

  tabs.tabitems.push(tabitem);
  tabs.selected = tabitem;
  let ti = tabs.tabitems[tabs.tabitems.indexOf(tabitem)];

  nextTick(async () => {
    let ext = item.name.split(".");

    let language = "text";

    if (ext.length > 0 && languageByExtension(ext.slice(-1)[0])) {
      // var model = editor.getModel();
      // monaco.editor.setModelLanguage(model, languageByExtension(ext.slice(-1)[0]));
      language = languageByExtension(ext.slice(-1)[0]);
    }

    let editor = createMonacoEditor(
      /*editorMonaco.value[tabs.tabitems.indexOf(tabitem)], */
      document.querySelector(`#editor-${ti.oid}`),
      (ed, val) => {
        ti.modified = true;
        setSaveTimeout(tabitem);
      },
      language,
    );
    tabitem.editor = editor;

    let file = await get(`webenv/files/${item.handle}`);
    editor.setValue(file.text);

    // add listener
    editor.getModel().onDidChangeContent((event) => {
      ((ed, val) => {
        ti.modified = true;
        setSaveTimeout(tabitem);
      })(editor, event);
    });
  });
}

function clickTab(tabitem) {
  tabs.selected = tabitem;
}

function deleteTab(tabitem) {
  let idx = tabs.tabitems.indexOf(tabitem);
  tabs.tabitems = tabs.tabitems.filter((t) => t != tabitem);
  nextTick(() => {
    // tabitem.editor.getModel().dispose();
    // tabitem.editor.dispose();
    if (idx > 0) {
      tabs.selected = tabs.tabitems[idx - 1];
    } else if (tabs.tabitems.length > 0) {
      tabs.selected = tabs.tabitems[0];
    }
  });
}

const showConfig = ref(false);

function changeFontSize(value) {
  try {
    let ivalue = parseInt(value, 10);
    fontSize.value = ivalue;
    storageUtil.setStorage("fontSize", fontSize.value);
  } catch (ex) {}
}

function openConfig() {
  showConfig.value = true;
}

function closeConfig() {
  showConfig.value = false;
}

const currentSession = ref(null);

async function saveSession() {
  let sessions = await get("sessions");
  if (!sessions) {
    sessions = [];
  }
  if (currentSession.value == null) {
    let sessionName = prompt();
    if (sessionName === undefined || sessionName === "") return;
    sessions.push({
      id: uuid4(),
      name: sessionName,
      dir: hdir.value,
    });
  } else {
    let session = sessions.filter((s) => s.id === currentSession.value.id)[0];
    session.dir = hdir.value;
  }
  await set("sessions", sessions);

  getSessionList();
}

let sessionList = ref([]);

async function getSessionList() {
  let catalogue = await get("webenv/catalogue");
  let apps = [];
  for (let i = 0; i < catalogue.length; i++) {
    apps.push(await get(`webenv/apps/${catalogue[i]}`));
  }
  sessionList.value = apps;
}

getSessionList();

async function openSession(session) {
  // const lastHdir = session.dir;
  // hdir.value = lastHdir;
  // treelist.value = [];
  // let workspace = {
  //   name: "workspace",
  //   handle: hdir.value,
  //   file: false,
  //   level: 0,
  //   parent: null,
  //   expand: false,
  // };
  // treelist.value.push(workspace);
  //
  // expandTree(workspace);
  //
  // currentSession.value = session;

  currentApp.value = session.oid;
  openDirectory();
}

async function modifyApplication(app) {
  //console.log("modify", app);

  let newName = prompt();
  if (newName == null || newName === undefined) return;

  let apl = await getAppByOid(app.oid);

  //console.log("modifing...", apl);

  if (newName === "") {
    // delete app
    //console.log("delete");

    if (!confirm(`Delete "${apl.name}", will you continue?`)) return;

    for (let i = 0; i < apl.files.length; i++) {
      await del(`webenv/files/${apl.files[i]}`);
    }
    await del(`webenv/apps/${apl.oid}`);
    let catalogue = await get(`webenv/catalogue`);
    await set(
      `webenv/catalogue`,
      catalogue.filter((e) => e !== apl.oid),
    );
  } else {
    // rename app
    //console.log("rename");
    apl.name = newName;
    await setApp(apl);
  }

  await getSessionList();
}

async function buildForDebug(appOid) {
  let bundled = await bundler.build(appOid);
  await set(`webenv/debug/index`, bundled);
  let ver = moment().format(`YYYYMMDDHHmmss`);
  localStorage.setItem(`webenv/debug/version`, ver);
  console.log("build", ver);
}

function htmlToBase64DataURI_UTF8(html) {
  const encoder = new TextEncoder();
  const uint8Array = encoder.encode(html);

  // Uint8Array -> Base64
  let binary = "";
  for (let i = 0; i < uint8Array.length; i++) {
    binary += String.fromCharCode(uint8Array[i]);
  }
  const base64 = btoa(binary);

  return `data:text/html;base64,${base64}`;
}

// async function exportFiles() {
//   let dhandle = await window.showDirectoryPicker({ mode: "readwrite" });
//
//   let virtualFiles = [
//     { path: "/x.js", text: "abc1" },
//     { path: "/foo/a.js", text: "abc2" },
//     { path: "/foo/bar/b.js", text: "abc3" },
//   ];
//
//   // �u/�v�����[�g�Ƃ��āAvirtualFiles�Œ�`���ꂽ���ׂẴt�@�C����
//   // �t�@�C���V�X�e���ɏ����o���R�[�h
// }

async function exportFiles() {
  let dhandle = await window.showDirectoryPicker({ mode: "readwrite" });

  let app = await getAppByOid(currentApp.value);

  await buildForDebug(app.oid);
  let bundled = await get(`webenv/debug/index`);

  let virtualFiles = [
    { path: "/dist/index.html", text: bundled },
    // { path: "/x.js", text: "abc1" },
    // { path: "/foo/a.js", text: "abc2" },
    // { path: "/foo/bar/b.js", text: "abc3" },
  ];

  for (let i = 0; i < app.files.length; i++) {
    let foid = app.files[i];
    let file = await getFile(foid);
    virtualFiles.push({
      path: "/src" + file.path,
      text: file.text,
      binary: file.binary,
      oid: file.oid,
    });
  }

  //console.log(virtualFiles);

  for (const file of virtualFiles) {
    const parts = file.path.split("/").filter(Boolean); // ["foo", "a.js"] �Ȃ�
    const filename = parts.pop();
    let currentDir = dhandle;

    for (const part of parts) {
      currentDir = await currentDir.getDirectoryHandle(part, { create: true });
    }

    const fileHandle = await currentDir.getFileHandle(filename, {
      create: true,
    });
    const writable = await fileHandle.createWritable();
    if (file.binary) {
      await writable.write(await get(`webenv/bins/${file.oid}`));
    } else {
      await writable.write(file.text);
    }
    await writable.close();
  }

  window.alert("Export completed.");
}

async function importFiles() {
  const dhandle = await window.showDirectoryPicker({ mode: "read" });

  const virtualFiles = [];

  async function readDir(dirHandle, currentPath) {
    for await (const [name, handle] of dirHandle.entries()) {
      const fullPath = `${currentPath}/${name}`;
      if (handle.kind === "file") {
        const file = await handle.getFile();

        const extension = file.name.split(".").pop().toLowerCase();

        let isBinary = determineIfBinary(extension);
        if (isBinary == null) {
          isBinary = confirm(
            `Unknown extension "${extension}", import as binary file?`,
          );
          addKnownExtensionMapping(extension, isBinary);
        }

        const text = await file.text();
        virtualFiles.push({
          path: fullPath,
          text: isBinary ? "" : text,
          binary: isBinary,
          file: file,
        });
      } else if (handle.kind === "directory") {
        await readDir(handle, fullPath);
      }
    }
  }

  await readDir(dhandle, "");

  //console.log(virtualFiles);

  let app = await getAppByOid(currentApp.value);
  let existingFiles = [];
  for (let i = 0; i < app.files.length; i++) {
    //console.log(i);
    let f = await getFile(app.files[i]);
    existingFiles.push({
      oid: app.files[i],
      path: f.path,
    });
  }

  for (let i = 0; i < virtualFiles.length; i++) {
    let f = virtualFiles[i];

    let fileAlreadyExists = false;
    let exists = existingFiles.filter((e) => e.path === f.path);
    if (exists.length > 0) {
      fileAlreadyExists = true;
    }

    if (fileAlreadyExists) {
      let msg = `The file "${f.path}" is already exists.
Would you like to overwrite it?
(If you choose cancel, the file will not imported.)`;
      let conf = confirm(msg);
      if (!conf) continue;
    }

    let file = null;
    if (fileAlreadyExists) {
      file = await getFile(exists[0].oid);
    } else {
      file = await createFile(f.path);
    }

    file.text = f.text;
    file.binary = f.binary;
    if (f.binary) {
      await setBinary(file.oid, f.file);
    }

    if (fileAlreadyExists) {
      await setFile(file);
    } else {
      await addFile(currentApp.value, file);
    }
  }

  alert("Import completed.");

  await openDirectory(currentApp.value);
}

async function runDebug() {
  /*
  // openAbout();

  await buildForDebug(currentApp.value);
  // window.open(`/debug`, "_blank", "noreferrer");

  // debug using url
  let src = await get(`webenv/debug/index`);
  let url = htmlToBase64DataURI_UTF8(src);
  // window.open(url, "_blank", "noreferrer");

  // debug using objecturl
  const blob = new Blob([src], { type: "text/html" });
  const objurl = URL.createObjectURL(blob);
  window.open(objurl, "_blank");
  */

  window.open(location.href + "debug", "_blank");
}

async function setBinary(oid, blob) {
  await set(`webenv/bins/${oid}`, blob);
}

let knownExtensionMapping = {
  binary: ["jpeg", "png", "gif", "bmp", "mpg", "wav", "mp3", "glb"],
  nonBinary: [
    "txt",
    "js",
    "ts",
    "css",
    "scss",
    "vue",
    "json",
    "html",
    "config",
    "xml",
  ],
};

function determineIfBinary(extension) {
  let ext = extension.toLowerCase();
  if (knownExtensionMapping.binary.indexOf(ext) >= 0) return true;
  if (knownExtensionMapping.nonBinary.indexOf(ext) >= 0) return false;
  return null;
}

function addKnownExtensionMapping(extension, isBinary) {
  let ext = extension.toLowerCase();
  if (isBinary !== true && isBinary !== false)
    throw new Error("invalid parameter");
  if (determineIfBinary(extension) != null)
    throw new Error("invalid operation");
  if (isBinary) {
    knownExtensionMapping.binary.push(ext);
  } else {
    knownExtensionMapping.nonBinary.push(ext);
  }
}

async function uploadFile() {
  try {
    const fileHandles = await window.showOpenFilePicker({ multiple: true });

    const files = await Promise.all(
      fileHandles.map((handle) => handle.getFile()),
    );

    let app = await getAppByOid(currentApp.value);
    let existingFiles = [];
    for (let i = 0; i < app.files.length; i++) {
      let f = await getFile(app.files[i]);
      existingFiles.push({
        oid: app.files[i],
        path: f.path,
      });
    }

    for (let i = 0; i < files.length; i++) {
      let file = files[i];

      const extension = file.name.split(".").pop().toLowerCase();

      let newpath = "/" + file.name;

      let fileAlreadyExists = false;
      let exists = existingFiles.filter((e) => e.path === newpath);
      if (exists.length > 0) {
        fileAlreadyExists = true;
      }

      if (fileAlreadyExists) {
        let msg = `The file "${newpath}" is already exists.
Would you like to overwrite it?
(If you choose cancel, the file will not imported.)`;
        let conf = confirm(msg);
        if (!conf) continue;
      }

      let newfile = null;
      if (fileAlreadyExists) {
        newfile = await getFile(exists[0].oid);
      } else {
        newfile = await createFile(newpath);
      }

      let isBinary = determineIfBinary(extension);
      if (isBinary == null) {
        isBinary = confirm(
          `Unknown extension "${extension}", import as binary file?`,
        );
        addKnownExtensionMapping(extension, isBinary);
      }

      if (isBinary) {
        newfile.text = "";
        newfile.binary = true;
        await setBinary(newfile.oid, file);
      } else {
        const text = await file.text();
        newfile.text = text;
      }

      if (fileAlreadyExists) {
        await setFile(newfile);
      } else {
        await addFile(currentApp.value, newfile);
      }

      await openDirectory();
    }
  } catch (err) {
    console.error("failed to load file", err);
  }

  //try {
  //  const [fileHandle] = await window.showOpenFilePicker();
  //
  //  const file = await fileHandle.getFile();
  //  const contents = await file.text();
  //
  //  let path = window.prompt("path", `/${file.name}`);
  //
  //  let newfile = await createFile(path);
  //
  //  newfile.text = contents;
  //
  //  console.log(newfile);
  //
  //  await addFile(currentApp.value, newfile);
  //} catch (err) {
  //  console.error("failed to load file", err);
  //}
}

window.iset = set;
window.iget = get;
window.saveSession = saveSession;

function createDebugWindow() {
  let existing = document.querySelector("#debug-window");
  if (existing) existing.remove();
  //<iframe rel="iframe" style="position:fixed; top:calc(50vw - 300px); left:calc(50vw - 400px); width:800px; height:600px; border:solid 1px #fff; z-index:9999;"></iframe>
  const htmlString =
    '<iframe id="iframe" style="position:fixed; top:calc(50vh - 300px); left:calc(50vw - 400px); width:800px; height:600px; border:solid 1px #fff; z-index:9999;"></iframe>';
  const wrapper = document.createElement("div");
  wrapper.id = "debuug-window";
  wrapper.innerHTML = htmlString;
  document.body.appendChild(wrapper);
}

function openUrlInDebugWindow(url) {
  let iframe = document.querySelector("#iframe");
  iframe.src = url;
}

//createDebugWindow();
//openUrlInDebugWindow("https://ja.wikipedia.org/wiki/%E3%82%B9%E3%83%BC%E3%83%91%E3%83%BC%E3%83%9E%E3%83%AA%E3%83%B3_%E3%82%B9%E3%83%94%E3%83%83%E3%83%88%E3%83%95%E3%82%A1%E3%82%A4%E3%82%A2");

function getModeFromUrl() {
  // console.log(window.location.href);
  let urls = window.location.href.split("?");
  if (urls.length === 1) return;
  const params = new URLSearchParams(urls[1]);
  const value = params.get("debugmode");
  if (value === "on") {
    console.log("debugmode on");
  } else {
    console.log("debugmode off");
  }
}

// getModeFromUrl();

function openAbout() {
  window.open(window.location.href + "about", "_blank");
}
</script>

<template>
  <div class="container root flex-row" :style="{ fontSize: `${fontSize}px` }">
    <div class="tree child w10 bc-gray bl bt bb flex-col">
      <div class="p1" style="position:sticky; top:0; background-color:#242424;">
        <div class="child flex-row">
          <span
            class="clickable"
            @click="
              cssExplorerWidth = cssExplorerWidth === '20em' ? '3.5em' : '20em';
              cssEditorWidth =
                cssEditorWidth === 'calc(100% - 18em)'
                  ? 'calc(100% - 2em)'
                  : 'calc(100% - 18em)';
            "
          >
            <svg
              style="width:20px; line-height:20px;"
              viewBox="0 0 64 64"
              width="20"
              height="20"
            >
              <path
                d="M14,19 L49,19 M14,32 L49,32 M14,45 L49,45"
                style="fill:none;stroke:#888;stroke-width:5;"
              />
            </svg>
          </span>
          <span
            class="clickable ml1"
            @click="uploadFile"
            v-if="cssExplorerWidth === '20em'"
          >
            <svg
              style="width:20px; line-height:20px;"
              viewBox="0 0 64 64"
              width="20"
              height="20"
            >
              <path
                d="M16,32 L48,32 M32,16 L32,48"
                style="fill:none;stroke:#888;stroke-width:8;stroke-linecap:butt;"
              />
            </svg>
          </span>
          <span
            class="clickable ml1"
            @click="onCreateNewFile"
            v-if="cssExplorerWidth === '20em'"
          >
            <svg
              style="width:20px; line-height:20px;"
              viewBox="0 0 64 64"
              width="20"
              height="20"
            >
              <path
                d="M43,10 L52,19 L44,26 L36,18 z"
                style="fill:#888;stroke:none;"
              />
              <path
                d="M33,20 L42,29 L25,46 L14,48 L16,37 z"
                style="fill:#888;stroke:none;"
              />
            </svg>
          </span>
          <!--
          <span class="clickable button1 ml1" @click="deleteEntry">Delete</span>
          -->
          <span
            class="clickable ml1"
            @click="openConfig"
            v-if="cssExplorerWidth === '20em'"
          >
            <svg
              style="width:20px; height:20px; line-height:20px;"
              viewBox="0 0 64 64"
              width="20"
              height="20"
            >
              <path
                d="M25,14 L17,13 L13,17 L14,25 L 8,29 L 8,35 L14,39 L13,47 L17,51 L25,50 L29,56 L35,56 L39,50 L47,51 L51,47 L50,39 L56,35 L56,29 L50,25 L51,17 L47,13 L39,14 L35, 8 L29, 8 M27.4,20.9 A12.0,12.0 0,0,1 36.6,43.1 A12.0,12.0 0,0,1 27.4,20.9 z"
                style="fill:#888;stroke:none;"
              />
            </svg>
          </span>
          <span
            class="clickable ml1"
            @click="autosaveEnabled = !autosaveEnabled"
            v-if="cssExplorerWidth === '20em'"
          >
            <svg
              style="width:20px; height:20px; line-height:20px;"
              viewBox="0 0 64 64"
              width="20"
              height="20"
              v-if="autosaveEnabled"
            >
              <path
                d="M40,4 L16,36 L32,36 L24,60 L48,28 L32,28 z"
                style="fill:#eee;stroke:#ccc;stroke-width:0;stroke-linecap:round;stroke-linejoin:round;"
              />
            </svg>

            <svg
              style="width:20px; height:20px; line-height:20px;"
              viewBox="0 0 64 64"
              width="20"
              height="20"
              v-if="!autosaveEnabled"
            >
              <path
                d="M40,4 L16,36 L32,36 L24,60 L48,28 L32,28 z"
                style="fill:#888;stroke:#888;stroke-width:0;stroke-linecap:round;stroke-linejoin:round;"
              />
            </svg>
          </span>

          <span
            class="clickable ml1"
            @click="importFiles"
            v-if="cssExplorerWidth === '20em'"
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M18.5 20L18.5 14M18.5 14L21 16.5M18.5 14L16 16.5"
                stroke="#888"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
              <path
                d="M12 19H5C3.89543 19 3 18.1046 3 17V7C3 5.89543 3.89543 5 5 5H9.58579C9.851 5 10.1054 5.10536 10.2929 5.29289L12 7H19C20.1046 7 21 7.89543 21 9V11"
                stroke="#888"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
            </svg>
          </span>

          <span
            class="clickable ml1"
            @click="exportFiles"
            v-if="cssExplorerWidth === '20em'"
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M20 15V18C20 19.1046 19.1046 20 18 20H6C4.89543 20 4 19.1046 4 18L4 15M8 11L12 15M12 15L16 11M12 15V3"
                stroke="#888"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
            </svg>
          </span>

          <span
            class="clickable ml1"
            @click="runDebug"
            v-if="cssExplorerWidth === '20em'"
          >
            <svg
              fill="#888"
              width="20"
              height="20"
              viewBox="0 0 32 32"
              version="1.1"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M5.92 24.096q0 1.088 0.928 1.728 0.512 0.288 1.088 0.288 0.448 0 0.896-0.224l16.16-8.064q0.48-0.256 0.8-0.736t0.288-1.088-0.288-1.056-0.8-0.736l-16.16-8.064q-0.448-0.224-0.896-0.224-0.544 0-1.088 0.288-0.928 0.608-0.928 1.728v16.16z"
              ></path>
            </svg>
          </span>
        </div>
      </div>
      <br />
      <template v-if="cssExplorerWidth === '20em'">
        <div
          v-for="item in treelist"
          class="clickable ml1"
          @click="clickTreeItem(item)"
        >
          <span style="color:#777">{{
            "&nbsp;|&nbsp;".repeat(item.level)
          }}</span>
          <span
            v-if="!item.file"
            class="folder"
            @click.stop="toggleTreeExpand(item)"
          >
            {{ item.expand ? "-" : "+" }}&nbsp;
          </span>
          <span
            :style="{ textDecoration: selectedItem == item ? 'underline' : '' }"
            >&nbsp;{{ item.name }}</span
          >
          {{ item.file ? "" : "/" }}
        </div>
      </template>
    </div>
    <div class="editor child w20 p1 bc-gray bl bt bb br flex-col">
      <div class="child flex-row">
        <div
          :class="[
            'tabitem',
            'clickable',
            'br',
            'bc-gray',
            tabitem != tabs.selected ? 'bb' : '',
          ]"
          v-for="tabitem in tabs.tabitems"
          @click="clickTab(tabitem)"
        >
          <span class="tabname"
            >{{ tabitem.modified ? "*" : "" }}{{ tabitem.entry.name }}</span
          >
          <span v-if="tabs.selected == tabitem" @click.stop="deleteTab(tabitem)"
            >X</span
          >
        </div>
        <!--
        <div class="tabitem br bb bc-gray">index.html</div>
        <div class="tabitem br bb bc-gray">vite.svg</div>
        -->
      </div>
      <template v-for="tabitem in tabs.tabitems" :key="tabitem.oid">
        <div
          :id="`editor-${tabitem.oid}`"
          :style="{
            width: `100%`,
            height: `calc(100% - 1.5em)`,
            display: tabitem == tabs.selected ? `inherit` : `none`,
          }"
          @keydown.ctrl.s.prevent.stop="setSaveTimeout(tabitem, true)"
        ></div>
      </template>
      <template v-if="tabs.tabitems.length === 0">
        <div
          :style="{
            width: `100%`,
            height: `calc(100% - 1.5em)`,
          }"
        >
          <div style="margin:1.5em">
            <p>applications</p>
            <ul>
              <template v-for="session in sessionList">
                <li
                  class="clickable"
                  @click.left="openSession(session)"
                  @click.right.prevent="modifyApplication(session)"
                >
                  {{ session.name }} ({{ session.oid }})
                </li>
              </template>
              <li>
                <span class="clickable" @click="onCreateNewApp">NEW</span>
              </li>
            </ul>
          </div>
        </div>
      </template>
    </div>
  </div>

  <div v-if="showConfig" class="config-screen-container">
    <div class="config-container">
      <span>Configuration</span>
      <br />
      <label
        >FontSize:&nbsp;
        <input
          :value="fontSize"
          @change="changeFontSize($event.target.value)"
        />
      </label>
      <br />
      <span class="clickable button1" @click="closeConfig">Close</span>
    </div>
  </div>
</template>

<style scoped>
.root {
  width: 100%;
  height: 100%;
}

.container {
  display: flex;
}

.child {
  display: flex;
}

.w10 {
  width: 10em;
}

.w12 {
  width: 12em;
}

.w20 {
  width: 20em;
}

.w18 {
  width: 18em;
}

.h10 {
  height: 10em;
}

.h20 {
  height: 20em;
}

.p1 {
  padding: 1em;
}

.pr2 {
  padding-right: 2em;
}

.m1 {
  margin: 1em;
}

.bg-red {
  background-color: red;
}

.bc-light {
  border-color: #ccc !important;
}

.bc-gray {
  border-color: #888 !important;
}

.bl {
  border-left: solid 1px;
}

.br {
  border-right: solid 1px;
}

.bt {
  border-top: solid 1px;
}

.bb {
  border-bottom: solid 1px;
}

.flex-row {
  flex-direction: row;
}

.flex-col {
  flex-direction: column;
}

.tree {
  width: v-bind(cssExplorerWidth);
  /* font-family: monospace; */
  overflow: auto;
  white-space: pre;
}

.editor {
  width: v-bind(cssEditorWidth);
  padding: 0;
}

.editor-textarea {
  width: 100%;
  height: 100%;
  border: none;
  background-color: #333;
  resize: none;
  outline: none;
  white-space: pre;
  font-size: 0.95em;
  line-height: 1.2em;
}

.clickable {
  cursor: pointer;
}

.button1 {
  display: inline-block;
  min-width: 3em;
  background-color: #444;
  text-align: center;
  vertical-align: middle;
  font-size: 0.9em;
  padding: 3px;
}

.ml1 {
  margin-left: 0.75em;
}

.ml2 {
  margin-left: 2em;
}

.mr1 {
  margin-right: 1em;
}

.mt1 {
  margin-top: 1em;
}

.mb1 {
  margin-bottom: 1em;
}

.folder {
  display: inline-block;
  width: 1em;
  text-align: center;
}

.tabitem {
  display: flex;
  align-items: center;
  height: 2em;
  text-align: center;
  vertical-align: middle;
  box-sizing: border-box;
  padding: 0 1em;
}

.tabname {
  padding-right: 0.5em;
}

.config-screen-container {
  position: fixed;
  left: 0;
  right: 0;
  top: 0;
  bottom: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
}

.config-container {
  background-color: #333;
  border: solid 1px #555;
  z-index: 99999;
  padding: 10px;
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
}
</style>
