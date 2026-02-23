import ecs from "./ecs.js";
const Registry = ecs.Registry;
const EntityRef = ecs.EntityRef;
const ArraySparseSet = ecs.ArraySparseSet;
const Archtype = ecs.Archtype;
const EntityState = ecs.EntityState;

import vector from "./vector.js";
const v$ = vector.Vector.$;
import list from "./list.js";

class PositionComponent {
  static id = "position";
  constructor() {
    this.x = 0;
    this.y = 0;
  }
}

class PhysicsComponent {
  static id = "physics";
  constructor() {
    this.p = v$(0.0, 0.0);
    this.v = v$(0.0, 0.0);
    this.a = v$(0.0, 0.0);
  }
}

class Test1Component {
  static id = "test1";
}

describe("Registry", function () {
  beforeEach(function () {
    this.reg = new Registry();
  });
  it("constructor", function () {
    expect(this.reg._currentEntityId).toBe(0);
    expect(this.reg._compCtorToCompStoreMap).toEqual(new Map());
    expect(this.reg._maxEntityCount).toBe(10000);
  });
  it("createEntity", function () {
    expect(this.reg.createEntity()).toBe(1);
    expect(this.reg.createEntity()).toBe(2);
    expect(this.reg._entityToCompCtorListMap[1]).not.toBeNull();
    expect(this.reg._entityToCompCtorListMap[2]).not.toBeNull();
    expect(this.reg._entityState[1]).toBe(EntityState.Active);
  });
  it("addComponent", function () {
    const e1 = this.reg.createEntity();
    const c1 = new PositionComponent();
    const c2 = new PhysicsComponent();
    this.reg.addComponent(e1, c1, c2);
    expect(this.reg._compCtorToCompStoreMap[PositionComponent]).not.toBeNull();
    expect(this.reg._compCtorToCompStoreMap[PhysicsComponent]).not.toBeNull();
    expect(() => {
      this.reg.addComponent(e1, new PositionComponent());
    }).toThrow();
    expect(() => {
      this.reg.addComponent(e1, new PhysicsComponent());
    }).toThrow();
    const e2 = this.reg.createEntity();
    this.reg.addComponent(e2, new PhysicsComponent());
    expect(this.reg._archtypes.length).toBe(2);
  });
  it("getComponent", function () {
    const e1 = this.reg.createEntity();
    const c1 = new PositionComponent();
    this.reg.addComponent(e1, c1);
    expect(this.reg.getComponent(e1, PositionComponent)).toBe(c1);
  });
  it("deleteEntity", function () {
    const e1 = this.reg.createEntity();
    this.reg.addComponent(e1, new PositionComponent());
    const e2 = this.reg.createEntity();
    this.reg.addComponent(e2, new PositionComponent());
    const e3 = this.reg.createEntity();
    this.reg.addComponent(e3, new PositionComponent());
    this.reg.deleteEntity(e2);
    expect(this.reg.isEntityActive(e1)).toBe(true);
    expect(this.reg.isEntityActive(e2)).toBe(false);
    expect(this.reg.isEntityActive(e3)).toBe(true);
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
  xit("Performance create 100 entities and add 50 component for each entity in 1 frame", function () {
    // pending();

    const nEntity = 100;
    const nComponent = 50;

    function createClass() {
      return class {
        constructor(value) {
          this.value = value;
        }
      };
    }

    let clss = [];
    for (let i = 0; i < nComponent; i++) {
      clss.push(createClass());
    }

    const st = performance.now();
    let total = 0;
    for (let i = 0; i < nEntity; i++) {
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
  it("queries", function () {
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
      if (i % 2 === 0) {
        this.reg.addComponent(
          e,
          new PhysicsComponent(),
          new PositionComponent(),
        );
      } else {
        this.reg.addComponent(
          e,
          new PositionComponent(),
          new PhysicsComponent(),
        );
      }
    }

    console.log("physics", c1, "position", c2, "physics + position", c3);

    expect(this.reg._queryEntity(true, PhysicsComponent).length).toBe(c1);
    expect(this.reg._queryEntity(false, PhysicsComponent).length).toBe(c1 + c3);
    expect(
      this.reg._queryEntity(true, PhysicsComponent, PositionComponent).length,
    ).toBe(c3);

    {
      let i = 0;
      for (let e of this.reg.query(true, PhysicsComponent)) i++;
      expect(i).toBe(c1);
    }
    {
      let i = 0;
      for (let e of this.reg.query(true, PositionComponent)) i++;
      expect(i).toBe(c2);
    }
    {
      let i = 0;
      for (let e of this.reg.query(false, PhysicsComponent)) i++;
      expect(i).toBe(c1 + c3);
    }
    {
      let i = 0;
      for (let e of this.reg.query(true, PhysicsComponent, PositionComponent))
        i++;
      expect(i).toBe(c3);
    }
    {
      let i = 0;
      for (let e of this.reg.query(true, PositionComponent, PhysicsComponent))
        i++;
      expect(i).toBe(c3);
    }

    expect(this.reg._archtypes.length).toBe(3);
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

    expect(arch.match([PositionComponent])).toBe(false);
    expect(arch.match([PositionComponent], false)).toBe(true);
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

describe("ArraySparseSet", function () {
  beforeEach(function () {
    this.mss = new ArraySparseSet(10000);
  });
  it("constructor", function () {
    expect(this.mss._dense.length).toBe(0);
    expect(this.mss._sparse.length).toBe(10000);
    expect(this.mss._data.length).toBe(0);
  });
  it("est", function () {
    this.mss.set(1, { a: 1, b: 2 });
    expect(this.mss._dense.length).toBe(1);
    expect(this.mss._data.length).toBe(1);
    expect(this.mss._sparse[1]).toBe(0);
    this.mss.set(2, { a: 2, b: 3 });
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
    this.mss.set(1, { a: 1, b: 2 });
    this.mss.set(2, { a: 2, b: 4 });
    this.mss.set(3, { a: 3, b: 6 });
    expect(this.mss.get(2).b).toBe(4);
    expect(() => {
      this.mss.get(5);
    }).toThrow();
  });
  it("deleteEntry", function () {
    this.mss.set(1, { a: 1, b: 2 });
    this.mss.set(2, { a: 2, b: 4 });
    this.mss.set(3, { a: 3, b: 6 });
    this.mss.delete(2);
    expect(this.mss.has(2)).toBe(false);
    expect(() => {
      this.mss.get(2);
    }).toThrow();
    this.mss.set(2, { a: 4, b: 8 });
    expect(this.mss.get(2).a).toBe(4);
  });
  it("entries", function () {
    this.mss.set(1, { a: 1, b: 2 });
    this.mss.set(2, { a: 2, b: 4 });
    this.mss.set(3, { a: 3, b: 6 });
    let i = 0;
    for (let entry of this.mss.entries()) {
      expect(entry.a).toBe(i + 1);
      i++;
    }
  });
  it("keys", function () {
    this.mss.set(1, { a: 1, b: 2 });
    this.mss.set(2, { a: 2, b: 4 });
    this.mss.set(3, { a: 3, b: 6 });
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
