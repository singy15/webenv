function genUuid4() {
  let str = "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".split("");
  for (let i = 0, len = str.length; i < len; i++) {
    switch (str[i]) {
      case "x":
        str[i] = Math.floor(Math.random() * 16).toString(16);
        break;
      case "y":
        str[i] = (Math.floor(Math.random() * 4) + 8).toString(16);
        break;
    }
  }
  return str.join("");
}

export default {
  genUuid4: genUuid4,
};
