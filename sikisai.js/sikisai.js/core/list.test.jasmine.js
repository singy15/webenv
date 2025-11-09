import list from "./list.js";

describe("list.js", () => {
  beforeEach(function () {});

  it("first/last/firstNode/lastNode", function () {
    let ls = new list.List();

    expect(ls.first()).toBeNull();
    expect(ls.firstNode()).toBeNull();
    expect(ls.last()).toBeNull();
    expect(ls.lastNode()).toBeNull();

    ls.append(1);
    ls.append(2);
    ls.append(3);

    expect(ls.first()).toBe(1);
    expect(ls.firstNode().value).toBe(1);
    expect(ls.last()).toBe(3);
    expect(ls.lastNode().value).toBe(3);
  });

  it("push/unshift/pop/shift", function () {
    let ls = new list.List();
    
    ls.append(2);
    ls.push(3);
    ls.unshift(1);
    
    expect(ls.last()).toBe(3);
    expect(ls.first()).toBe(1);

    expect(ls.shift()).toBe(1);
    expect(ls.first()).toBe(2);
    expect(ls.pop()).toBe(3);
    expect(ls.last()).toBe(2);
  });
});
