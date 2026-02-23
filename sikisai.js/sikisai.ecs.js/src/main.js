console.log("it works!");
await devidb.set("test", "ok");
console.log(await devidb.get("test"));
