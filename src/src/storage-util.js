// const endpoint = import.meta.env.VITE_API_ENDPOINT;
let storageBaseKey = "nanoedit";

function getStorage(key, defaultValue) {
  let val = localStorage.getItem(`${storageBaseKey}/${key}`);
  if (
    val === "undefined" ||
    val === "null" ||
    val == null ||
    val === undefined
  ) {
    return defaultValue;
  } else {
    return JSON.parse(val);
  }
}

function setStorage(key, obj) {
  localStorage.setItem(`${storageBaseKey}/${key}`, JSON.stringify(obj));
}

export default {
  getStorage: getStorage,
  setStorage: setStorage,
};
