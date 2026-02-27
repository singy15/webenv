import ecs from "./ecs.js";
const Registry = ecs.Registry;
const ArraySparseSet = ecs.ArraySparseSet;
const Archetype = ecs.Archetype;
const EntityState = ecs.EntityState;
const ComponentIdManager = ecs.ComponentIdManager;
const Task = ecs.Task;
const TaskManager = ecs.TaskManager;
const TaskPriority = ecs.TaskPriority;

import vector from "./vector.js";
const v$ = vector.Vector.$;

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

class TestTask extends Task {
  constructor(manager, ls, add, priority) {
    super(manager, priority);
    this.ls = ls;
    this.add = add;
  }

  run() {
    this.ls.push(this.add);
  }
}

describe("Registry", function () {
  beforeEach(function () {
    this.reg = new Registry(10000);
  });
  it("constructor", function () {
    expect(this.reg._currentEntityId).toBe(0);
    expect(this.reg._compCtorToCompStoreMap).toEqual(new Map());
    expect(this.reg._maxEntityCount).toBe(10000);
  });
  it("createEntity", function () {
    expect(this.reg.createEntity()).toBe(0);
    expect(this.reg.createEntity()).toBe(1);
    expect(this.reg._entityToCompCtorSetMap[1]).not.toBeNull();
    expect(this.reg._entityToCompCtorSetMap[2]).not.toBeNull();
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
    expect(this.reg._archetypes.length).toBe(2);
  });
  it("removeComponent", function () {
    const e1 = this.reg.createEntity();
    const c1 = new PositionComponent();
    const c2 = new PhysicsComponent();
    this.reg.addComponent(e1, c1, c2);
    this.reg.removeComponent(e1, PhysicsComponent);
    expect(this.reg._compCtorToCompStoreMap.get(PhysicsComponent).has(e1)).toBe(
      false,
    );
    expect(
      this.reg._compCtorToCompStoreMap.get(PositionComponent).has(e1),
    ).toBe(true);
  });
  it("getComponent", function () {
    const e1 = this.reg.createEntity();
    const c1 = new PositionComponent();
    this.reg.addComponent(e1, c1);
    expect(this.reg.getComponent(e1, PositionComponent)).toBe(c1);
    expect(this.reg.getComponent(e1, PhysicsComponent)).toBe(null);
  });
  it("_destroyEntity", function () {
    const e1 = this.reg.createEntity();
    this.reg.addComponent(e1, new PositionComponent());
    const e2 = this.reg.createEntity();
    this.reg.addComponent(e2, new PositionComponent());
    const e3 = this.reg.createEntity();
    this.reg.addComponent(e3, new PositionComponent());
    this.reg._destroyEntity(e2);
    expect(this.reg.isEntityActive(e1)).toBe(true);
    expect(this.reg.isEntityActive(e2)).toBe(false);
    expect(this.reg.isEntityActive(e3)).toBe(true);
    expect(this.reg._archetypes[0].entities().length).toBe(2);
  });
  it("deleteEntity", function () {
    const e1 = this.reg.createEntity();
    this.reg.deleteEntity(e1);
    expect(this.reg._entityState[e1]).toBe(EntityState.Deleting);
    expect(this.reg._entityDeleting.length).toBe(1);
  });
  it("batchDestoryEntity", function () {
    const e1 = this.reg.createEntity();
    this.reg.deleteEntity(e1);
    const e2 = this.reg.createEntity();
    this.reg.deleteEntity(e2);
    expect(this.reg._entityDeleting.length).toBe(2);
    this.reg._batchDestroyEntity();
    // expect(this.reg._entityDeleting.length).toBe(0);
    // expect(this.reg._entityFreelist.length).toBe(2);
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
  it("Performance create 50 entities and add 50 component for each entity in 1 frame", function () {
    // pending();

    const nEntity = 50;
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

    expect(this.reg._archetypes.length).toBe(3);
  });
  it("archetype base queries", function () {
    const c1 = Math.floor(Math.random() * 10);
    for (let i = 0; i < c1; i++) {
      const e = this.reg.createEntity();
      this.reg.addComponent(e, new PhysicsComponent());
    }
    const c2 = Math.floor(Math.random() * 10);
    for (let i = 0; i < c2; i++) {
      const e = this.reg.createEntity();
      this.reg.addComponent(e, new PositionComponent());
    }

    const d1 = Math.floor(Math.random() * 5);
    for (let i = 0; i < d1; i++) {
      this.reg.deleteEntity(i);
    }

    {
      let i = 0;
      for (const entity of this.reg.query(true, PhysicsComponent)) {
        i++;
      }
      expect(i).toBe(c1 - d1);
    }

    {
      let i = 0;
      this.reg.queryEach(
        true,
        (e, a) => {
          i++;
        },
        PhysicsComponent,
      );
      expect(i).toBe(c1 - d1);
    }
  });
  it("tasks", function () {
    const state = { a: 1 };
    const t1 = this.reg.registerTask(() => {
      state.a = state.a + 1;
    }, TaskPriority.Update + 100);
    const t2 = this.reg.registerTask(() => {
      state.a = state.a * 2;
    }, TaskPriority.Update + 200);
    this.reg.runAllTask();
    expect(state.a).toBe(3);
    this.reg.deleteTask(t2);
    this.reg.runAllTask();
    expect(state.a).toBe(4);
    this.reg.clearAllTask();
    this.reg.runAllTask();
    expect(state.a).toBe(4);
  });
  it("update", function () {
    let i = 0;
    const t1 = this.reg.registerTask((task) => {
      i++;
    }, TaskPriority.Update);
    this.reg.update(3);
    expect(i).toBe(3);
    this.reg.deleteTask(t1);
    this.reg.update(3);
    expect(i).toBe(3);
  });
  it("toRef", function () {
    const e1 = this.reg.createEntity();
    const er1 = this.reg.toRef(e1);
    expect(er1.getId()).toBe(0);
    expect(er1.getGen()).toBe(0);
    for (let i = 0; i < 10000 - 1; i++) {
      this.reg.createEntity();
    }
    this.reg.deleteEntity(e1);
    this.reg.update();
    let e1g2 = this.reg.createEntity();
    let er1g2 = this.reg.toRef(e1g2);
    expect(e1g2).toBe(0);
    expect(er1g2.getId()).toBe(0);
    expect(er1g2.getGen()).toBe(1);
  });
  it("isEntityRefActive", function () {
    const e1 = this.reg.createEntity();
    const er1 = this.reg.toRef(e1);
    expect(er1.getId()).toBe(0);
    expect(er1.getGen()).toBe(0);
    this.reg.update();
    expect(this.reg.isEntityRefActive(er1)).toBe(true);
    this.reg.deleteEntity(e1);
    expect(this.reg.isEntityRefActive(er1)).toBe(false);
    this.reg.update();
    expect(this.reg.isEntityRefActive(er1)).toBe(false);
  });
});

describe("Archetype", function () {
  beforeEach(function () {
    this.reg = new Registry();
  });
  it("constructor", function () {
    ComponentIdManager.clear();
    const arch = new Archetype([PositionComponent, PhysicsComponent]);
    expect(arch._componentCtorSet.size).toBe(2);
    const e1 = this.reg.createEntity();
    this.reg.addComponent(e1, new PositionComponent());
    expect(arch.match(this.reg.getComponentCtorSet(e1))).toBe(false);
    this.reg.addComponent(e1, new PhysicsComponent());
    expect(arch.match(this.reg.getComponentCtorSet(e1))).toBe(true);
    this.reg.addComponent(e1, new Test1Component());
    expect(arch.match(this.reg.getComponentCtorSet(e1))).toBe(false);

    expect(arch.match([PositionComponent])).toBe(false);
    expect(arch.match([PositionComponent], false)).toBe(true);

    const cset = new Set();
    cset.add(PositionComponent);
    cset.add(PhysicsComponent);
    const arch2 = new Archetype(cset);
    let id1 = ComponentIdManager.getId(PositionComponent);
    let id2 = ComponentIdManager.getId(PhysicsComponent);
    expect(arch2._key).toEqual([id1, id2].sort());
  });
  it("isSame", function () {
    const arch1 = [PositionComponent, PhysicsComponent];
    const query1 = [PositionComponent, PhysicsComponent];
    expect(
      Archetype.isSame(Archetype.toKey(query1), Archetype.toKey(arch1), true),
    ).toBe(true);
    const query2 = [PositionComponent];
    expect(
      Archetype.isSame(Archetype.toKey(query2), Archetype.toKey(arch1), true),
    ).toBe(false);
    const query3 = [PhysicsComponent];
    expect(
      Archetype.isSame(Archetype.toKey(query3), Archetype.toKey(arch1), true),
    ).toBe(false);
    expect(
      Archetype.isSame(Archetype.toKey(query3), Archetype.toKey(arch1), false),
    ).toBe(true);
    const query4 = [PositionComponent, PhysicsComponent, Test1Component];
    expect(
      Archetype.isSame(Archetype.toKey(query4), Archetype.toKey(arch1), true),
    ).toBe(false);
    expect(
      Archetype.isSame(Archetype.toKey(query4), Archetype.toKey(arch1), false),
    ).toBe(false);
  });
  it("toKey/toKeyStr", function () {
    ComponentIdManager.clear();
    const cset = new Set();
    [PositionComponent, PhysicsComponent].forEach((c) => cset.add(c));
    const arch = new Archetype(cset);
    expect(Archetype.toKey(cset)).toEqual([1, 2]);
    expect(Archetype.toKeyStr(cset)).toEqual("1,2");
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

describe("ComponentIdManager", function () {
  it("getId", function () {
    ComponentIdManager.clear();
    expect(ComponentIdManager.getId(PhysicsComponent)).toBe(1);
    expect(ComponentIdManager.getId(PositionComponent)).toBe(2);
    expect(ComponentIdManager.getId(PhysicsComponent)).toBe(1);
  });
});

describe("Integration Test", function () {
  it("Registry", function () {
    ComponentIdManager.clear();
    const reg = new Registry(10000);

    const e1 = reg.createEntity();
    let ph1 = new PhysicsComponent();
    let po1 = new PositionComponent();
    reg.addComponent(e1, ph1, po1);

    for (const e of reg.query(true, PhysicsComponent, PositionComponent)) {
      const ph = reg.getComponent(e1, PhysicsComponent);
      const po = reg.getComponent(e1, PositionComponent);
      ph.v.add(v$(1.0, 2.0));
      ph.p.add(ph.v);
      po.x = ph.p.x;
      po.y = ph.p.y;
    }

    expect(ph1.v.x).toBe(1.0);
    expect(ph1.v.y).toBe(2.0);
    expect(ph1.p.x).toBe(1.0);
    expect(ph1.p.y).toBe(2.0);
    expect(po1.x).toBe(1.0);
    expect(po1.y).toBe(2.0);
  });

  it("IT2", function () {
    const registry = new Registry(15000);
    for (let i = 0; i < 10000; i++) {
      const e = registry.createEntity();
      registry.addComponent(e, PositionComponent);
    }

    const s = performance.now();
    for (let frame = 0; frame < 60 * 12; frame++) {
      for (const e of registry.query(false, PositionComponent)) {
        if (Math.random() < 0.01) registry.deleteEntity(e);
      }

      registry.update();
    }
    const e = performance.now();
    console.log("IT2", e - s);
  });
});

describe("task.js", () => {
  beforeEach(function () {
    this.tm = new TaskManager();
  });

  it("TaskManager", function () {
    let ls = [];
    let t1 = new TestTask(this.tm, ls, 3, 100);
    let t2 = new TestTask(this.tm, ls, 1, 200);
    let t3 = new TestTask(this.tm, ls, 2, 150);
    let t4 = new TestTask(this.tm, ls, 4, 50);

    let ts = [t2, t3, t1, t4];
    this.tm.repository().each((e, i, l, n) => {
      expect(e).toBe(ts[n]);
    });

    this.tm.runAll();
    expect(ls).toEqual([1, 2, 3, 4]);

    this.tm.clearAll();
    expect(this.tm.repository().count()).toBe(0);
  });
});
