import * as monaco from "monaco-editor";
import appApi from "./app.js";

export default class ModelRepository {
  constructor() {
    this.models = {}; // path -> model
    this.viewStates = {}; // path -> model
    this.saveTimeouts = {}; // path -> timeout
  }

  async requestModel(appOid, filePath) {
    if (!filePath || filePath === "")
      throw new Error(`invalid path [${filePath}]`);

    let model = this.models[filePath];

    // if exists, return model.
    if (model) return model;

    // if not exists, create one.
    const files = (await appApi.getAppByOid(appOid)).files;
    for (let i = 0; i < files.length; i++) {
      const file = await appApi.getFile(files[i]);

      // search file
      if (filePath === file.path) {
        const path = file.path;

        const uri = monaco.Uri.parse("file://" + path);

        let language = "text";
        let ext = path.split(".");
        if (ext.length > 0 && appApi.languageByExtension(ext.slice(-1)[0])) {
          language = appApi.languageByExtension(ext.slice(-1)[0]);
        }

        // create and save model
        model = monaco.editor.createModel(file.text, language, uri);

        // set save handler
        // model.onDidChangeContent((event) => {
        //   // setSaveTimeoutEx(tabitem, model);
        // });

        // save model
        this.models[path] = model;

        return model;
      }
    }

    throw new Error(`no file matching path [${filePath}]`);
  }

  saveViewState(filePath, viewState) {
    this.viewStates[filePath] = viewState;
  }

  getViewState(filePath) {
    return this.viewStates[filePath];
  }

  reset() {
    for (const model of monaco.editor.getModels()) {
      model.dispose();
    }
    this.models = {};
    this.viewStates = {};
  }
}
