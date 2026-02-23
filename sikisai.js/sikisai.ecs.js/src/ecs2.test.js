import ecs from "./ecs.js";
const Registry = ecs.Registry;
const EntityRef = ecs.EntityRef;
const MapSparseSet = ecs.MapSparseSet;
const ArraySparseSet = ecs.ArraySparseSet;
const Archtype = ecs.Archtype;

import vector from "./vector.js";
const v$ = vector.Vector.$;
import list from "./list.js";

class PositionComponent {
  constructor() {
    this.x = 0;
    this.y = 0;
  }
}

class PhysicsComponent {
  constructor() {
    this.p = v$(0.0, 0.0);
    this.v = v$(0.0, 0.0);
    this.a = v$(0.0, 0.0);
  }
}

class Test1Component {}

describe("Registry", function () {
  beforeEach(function () {
    this.reg = new Registry();
  });
  it("constructor", function () {
    expect(this.reg._currentEntityId).toBe(0);
    expect(this.reg._componentStores).toEqual(new Map());
  });
  it("createEntity", function () {
    expect(this.reg.createEntity()).toBe(1);
    expect(this.reg.createEntity()).toBe(2);
  });
  it("addComponent", function () {
    const e1 = this.reg.createEntity();
    const c1 = new PositionComponent();
    const c2 = new PhysicsComponent();
    this.reg.addComponent(e1, c1, c2);
    expect(this.reg._componentStores[PositionComponent]).not.toBeNull();
    expect(this.reg._componentStores[PhysicsComponent]).not.toBeNull();
    expect(() => {
      this.reg.addComponent(e1, new PositionComponent());
    }).toThrow();
    expect(() => {
      this.reg.addComponent(e1, new PhysicsComponent());
    }).toThrow();
  });
  it("getComponent", function () {
    const e1 = this.reg.createEntity();
    const c1 = new PositionComponent();
    this.reg.addComponent(e1, c1);
    expect(this.reg.getComponent(e1, PositionComponent)).toBe(c1);
  });
  it("Performance create 10000 entities in 1 frame", function () {
    // pending();
    const st = performance.now();
    for (let i = 0; i < 10000; i++) {
      let e = this.reg.createEntity();
    }
    const ed = performance.now();
    expect(ed - st).toBeLessThan(1000 / 60);
  });
  it("Performance create 500 entities and add 50 component for each entity in 1 frame", function () {
    // pending();

    function createClass() {
      return class {
        constructor(value) {
          this.value = value;
        }
      };
    }

    let clss = [];
    for (let i = 0; i < 50; i++) {
      clss.push(createClass());
    }

    const st = performance.now();
    let total = 0;
    for (let i = 0; i < 500; i++) {
      let e = this.reg.createEntity();
      const ss = performance.now();
      let cls = clss.map((c) => new c());
      this.reg.addComponent(e, ...cls);
      const ee = performance.now();
      total += ee - ss;
    }
    const ed = performance.now();
    console.log(this.reg._archtypes);
    console.log(total);
    expect(ed - st).toBeLessThan((1000 / 60) * 1);
  });
  it("queryEntity", function () {
    // pending();
    const c1 = Math.floor(Math.random() * 1000);
    for (let i = 0; i < c1; i++) {
      const e = this.reg.createEntity();
      this.reg.addComponent(e, new PhysicsComponent());
    }
    const c2 = Math.floor(Math.random() * 1000);
    for (let i = 0; i < c2; i++) {
      const e = this.reg.createEntity();
      this.reg.addComponent(e, new PositionComponent());
    }
    const c3 = Math.floor(Math.random() * 1000);
    for (let i = 0; i < c3; i++) {
      const e = this.reg.createEntity();
      this.reg.addComponent(e, new PhysicsComponent(), new PositionComponent());
    }

    expect(this.reg.queryEntity(true, PhysicsComponent).length).toBe(c1);
    expect(this.reg.queryEntity(false, PhysicsComponent).length).toBe(c1 + c3);
    expect(
      this.reg.queryEntity(true, PhysicsComponent, PositionComponent).length,
    ).toBe(c3);
  });
});

describe("Archtype", function () {
  beforeEach(function () {
    this.reg = new Registry();
  });
  it("constructor", function () {
    const arch = new Archtype([PositionComponent, PhysicsComponent]);
    expect(arch._componentCtors.size).toBe(2);
    const e1 = this.reg.createEntity();
    this.reg.addComponent(e1, new PositionComponent());
    expect(arch.match(this.reg.getComponentCtorList(e1))).toBe(false);
    this.reg.addComponent(e1, new PhysicsComponent());
    expect(arch.match(this.reg.getComponentCtorList(e1))).toBe(true);
    this.reg.addComponent(e1, new Test1Component());
    expect(arch.match(this.reg.getComponentCtorList(e1))).toBe(false);
  });
});

xdescribe("MapSparseSet", function () {
  beforeEach(function () {
    this.mss = new MapSparseSet();
  });
  it("constructor", function () {
    expect(this.mss._dense.length).toBe(0);
    expect(this.mss._sparse.size).toBe(0);
    expect(this.mss._data.length).toBe(0);
  });
  it("addEntry", function () {
    this.mss.addEntry(1, { a: 1, b: 2 });
    expect(this.mss._dense.length).toBe(1);
    expect(this.mss._data.length).toBe(1);
    expect(this.mss._sparse.size).toBe(1);
    this.mss.addEntry(2, { a: 2, b: 3 });
    expect(this.mss._dense.length).toBe(2);
    expect(this.mss._data.length).toBe(2);
    expect(this.mss._sparse.size).toBe(2);
    expect(this.mss._dense[0]).toBe(1);
    expect(this.mss._dense[1]).toBe(2);
    expect(this.mss._data[0].a).toBe(1);
    expect(this.mss._data[1].a).toBe(2);
    expect(this.mss._sparse.get(1)).toBe(0);
    expect(this.mss._sparse.get(2)).toBe(1);
    expect(() => {
      this.mss.addEntry(1, { a: 2 });
    }).toThrow();
  });
  it("getEntry", function () {
    this.mss.addEntry(1, { a: 1, b: 2 });
    this.mss.addEntry(2, { a: 2, b: 4 });
    this.mss.addEntry(3, { a: 3, b: 6 });
    expect(this.mss.getEntry(2).b).toBe(4);
    expect(() => {
      this.mss.getEntry(5);
    }).toThrow();
  });
  it("deleteEntry", function () {
    this.mss.addEntry(1, { a: 1, b: 2 });
    this.mss.addEntry(2, { a: 2, b: 4 });
    this.mss.addEntry(3, { a: 3, b: 6 });
    this.mss.deleteEntry(2);
    expect(this.mss.exists(2)).toBe(false);
    expect(() => {
      this.mss.getEntry(2);
    }).toThrow();
    this.mss.addEntry(2, { a: 4, b: 8 });
    expect(this.mss.getEntry(2).a).toBe(4);
  });
  it("entries", function () {
    this.mss.addEntry(1, { a: 1, b: 2 });
    this.mss.addEntry(2, { a: 2, b: 4 });
    this.mss.addEntry(3, { a: 3, b: 6 });
    let i = 0;
    for (let entry of this.mss.entries()) {
      expect(entry.a).toBe(i + 1);
      i++;
    }
  });
  it("keys", function () {
    this.mss.addEntry(1, { a: 1, b: 2 });
    this.mss.addEntry(2, { a: 2, b: 4 });
    this.mss.addEntry(3, { a: 3, b: 6 });
    let i = 0;
    for (let key of this.mss.keys()) {
      expect(key).toBe(i + 1);
      i++;
    }
  });
  it("performance", function () {
    pending();
    const s1 = performance.now();
    const map1 = new Map();
    for (let i = 0; i < 10000; i++) {
      map1.set(i, i);
    }
    for (let i = 0; i < 10000; i++) {
      map1.get(i);
    }
    const e1 = performance.now();

    const s2 = performance.now();
    const map2 = new MapSparseSet();
    for (let i = 0; i < 10000; i++) {
      map2.addEntry(i, i);
    }
    for (let i = 0; i < 10000; i++) {
      map2.getEntry(i);
    }
    const e2 = performance.now();

    expect(e2 - s2).toBeLessThan(e1 - s1);
  });
});

xdescribe("ArraySparseSet", function () {
  beforeEach(function () {
    this.mss = new ArraySparseSet(10000);
  });
  it("constructor", function () {
    expect(this.mss._dense.length).toBe(0);
    expect(this.mss._sparse.length).toBe(10000);
    expect(this.mss._data.length).toBe(0);
  });
  it("addEntry", function () {
    this.mss.addEntry(1, { a: 1, b: 2 });
    expect(this.mss._dense.length).toBe(1);
    expect(this.mss._data.length).toBe(1);
    expect(this.mss._sparse[1]).toBe(0);
    this.mss.addEntry(2, { a: 2, b: 3 });
    expect(this.mss._dense.length).toBe(2);
    expect(this.mss._data.length).toBe(2);
    expect(this.mss._sparse[2]).toBe(1);
    expect(this.mss._dense[0]).toBe(1);
    expect(this.mss._dense[1]).toBe(2);
    expect(this.mss._data[0].a).toBe(1);
    expect(this.mss._data[1].a).toBe(2);
    expect(() => {
      this.mss.addEntry(1, { a: 2 });
    }).toThrow();
  });
  it("getEntry", function () {
    this.mss.addEntry(1, { a: 1, b: 2 });
    this.mss.addEntry(2, { a: 2, b: 4 });
    this.mss.addEntry(3, { a: 3, b: 6 });
    expect(this.mss.getEntry(2).b).toBe(4);
    expect(() => {
      this.mss.getEntry(5);
    }).toThrow();
  });
  it("deleteEntry", function () {
    this.mss.addEntry(1, { a: 1, b: 2 });
    this.mss.addEntry(2, { a: 2, b: 4 });
    this.mss.addEntry(3, { a: 3, b: 6 });
    this.mss.deleteEntry(2);
    expect(this.mss.exists(2)).toBe(false);
    expect(() => {
      this.mss.getEntry(2);
    }).toThrow();
    this.mss.addEntry(2, { a: 4, b: 8 });
    expect(this.mss.getEntry(2).a).toBe(4);
  });
  it("entries", function () {
    this.mss.addEntry(1, { a: 1, b: 2 });
    this.mss.addEntry(2, { a: 2, b: 4 });
    this.mss.addEntry(3, { a: 3, b: 6 });
    let i = 0;
    for (let entry of this.mss.entries()) {
      expect(entry.a).toBe(i + 1);
      i++;
    }
  });
  it("keys", function () {
    this.mss.addEntry(1, { a: 1, b: 2 });
    this.mss.addEntry(2, { a: 2, b: 4 });
    this.mss.addEntry(3, { a: 3, b: 6 });
    let i = 0;
    for (let key of this.mss.keys()) {
      expect(key).toBe(i + 1);
      i++;
    }
  });
});

xdescribe("FastSparseSet", function () {
  beforeEach(function () {
    this.mss = new FastSparseSet(10000);
  });
  it("constructor", function () {
    // expect(this.mss._dense.count()).toBe(0);
    expect(this.mss._sparse.length).toBe(10000);
    expect(this.mss._data.count()).toBe(0);
  });
  it("addEntry", function () {
    this.mss.addEntry(1, { a: 1, b: 2 });
    expect(this.mss._data.count()).toBe(1);
    expect(this.mss._sparse[1]).not.toBeNull();
    expect(this.mss._sparse[1].value.b).toBe(2);
    this.mss.addEntry(2, { a: 2, b: 3 });
    expect(this.mss._data.count()).toBe(2);
    expect(this.mss._sparse[2]).not.toBeNull();
    expect(this.mss._sparse[2].value.b).toBe(3);
    expect(() => {
      this.mss.addEntry(1, { a: 2 });
    }).toThrow();
  });
  it("getEntry", function () {
    this.mss.addEntry(1, { a: 1, b: 2 });
    this.mss.addEntry(2, { a: 2, b: 4 });
    this.mss.addEntry(3, { a: 3, b: 6 });
    expect(this.mss.getEntry(2).b).toBe(4);
    expect(() => {
      this.mss.getEntry(5);
    }).toThrow();
  });
  it("deleteEntry", function () {
    this.mss.addEntry(1, { a: 1, b: 2 });
    this.mss.addEntry(2, { a: 2, b: 4 });
    this.mss.addEntry(3, { a: 3, b: 6 });
    this.mss.deleteEntry(2);
    expect(this.mss.exists(2)).toBe(false);
    expect(() => {
      this.mss.getEntry(2);
    }).toThrow();
    this.mss.addEntry(2, { a: 4, b: 8 });
    expect(this.mss.getEntry(2).a).toBe(4);
  });
  // it("entries", function () {
  //   this.mss.addEntry(1, { a: 1, b: 2 });
  //   this.mss.addEntry(2, { a: 2, b: 4 });
  //   this.mss.addEntry(3, { a: 3, b: 6 });
  //   let i = 0;
  //   for (let entry of this.mss.entries()) {
  //     expect(entry.a).toBe(i + 1);
  //     i++;
  //   }
  // });
  // it("keys", function () {
  //   this.mss.addEntry(1, { a: 1, b: 2 });
  //   this.mss.addEntry(2, { a: 2, b: 4 });
  //   this.mss.addEntry(3, { a: 3, b: 6 });
  //   let i = 0;
  //   for (let key of this.mss.keys()) {
  //     expect(key).toBe(i + 1);
  //     i++;
  //   }
  // });
});
