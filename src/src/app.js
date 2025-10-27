import { get, set, clear, del } from "idb-keyval";
import uuid4 from "./uuid4.js";

// add object to catalogue.
async function addCatalogue(oid) {
  let catalogue = await get(`webenv/catalogue`);
  catalogue.push(oid);
  await set(`webenv/catalogue`, catalogue);
}

// create application
async function createApp(name) {
  return {
    oid: uuid4(),
    name: name,
    files: [],
  };
}

// add application to catalogue.
async function addApp(app) {
  await addCatalogue(app.oid);
  await setApp(app);
}

async function getAppByOid(oid) {
  return await get(`webenv/apps/${oid}`);
}

async function setApp(app) {
  return await set(`webenv/apps/${app.oid}`, app);
}

// create new file as text file.
async function createFile(path) {
  return {
    oid: uuid4(),
    path: path,
    text: path,
    binary: false,
  };
}

// delete file from idb.
async function delFile(file) {
  if (file.binary) {
    await del(`webenv/bins/${file.oid}`);
  }
  return await del(`webenv/files/${file.oid}`);
}

async function getFile(oid) {
  return await get(`webenv/files/${oid}`);
}

async function setFile(file) {
  return await set(`webenv/files/${file.oid}`, file);
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

export default {
  createApp,
  createFile,
  addCatalogue,
  setApp,
  getAppByOid,
  addApp,
  delFile,
  getFile,
  setFile,
  addFile,
  removeFile,
};
