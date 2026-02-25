const DEVMODE = true;

class List {
  constructor() {
    this.head = null;
    this.tail = null;
    this.cnt = 0;
  }

  append(val) {
    return this.insertAfter(this.tail, val);
  }

  push(val) {
    return this.insertAfter(this.tail, val);
  }

  prepend(val) {
    return this.insertBefore(this.head, val);
  }

  unshift(val) {
    return this.insertBefore(this.head, val);
  }

  pop() {
    if (this.tail == null) {
      return null;
    } else {
      let retval = this.tail.value;
      this.removeNode(this.tail);
      return retval;
    }
  }

  shift() {
    if (this.head == null) {
      return null;
    } else {
      let retval = this.head.value;
      this.removeNode(this.head);
      return retval;
    }
  }

  _insert(node, val, before = true) {
    let el = new ListNode();
    el.value = val;

    let plc1 = "";
    let plc2 = "";
    let plc3 = "";

    if (node == null) {
      this.head = el;
      this.tail = el;
    } else {
      if (before) {
        plc1 = "next";
        plc2 = "prev";
        plc3 = "head";
      } else if (!before) {
        plc1 = "prev";
        plc2 = "next";
        plc3 = "tail";
      }

      el[plc1] = node;
      el[plc2] = node[plc2];
      if (node[plc2]) {
        node[plc2][plc1] = el;
      }
      node[plc2] = el;

      if (this[plc3] == node) {
        this[plc3] = el;
      }
    }

    this.cnt = this.cnt + 1;

    return el;
  }

  insertAfter(node, val) {
    return this._insert(node, val, false);
  }

  insertBefore(node, val) {
    return this._insert(node, val, true);
  }

  removeNode(el) {
    if (!(el instanceof ListNode)) throw new Error("invalid operation");
    if (el == this.head) this.head = el.next;
    if (el == this.tail) this.tail = el.prev;
    if (el.prev) el.prev.next = el.next;
    if (el.next) el.next.prev = el.prev;
    // don't set null to el.prev and el.next
    // when removeNode while loop using iterator,
    // iterator cannot get next element pointer.
    this.cnt = this.cnt - 1;
  }

  remove(el) {
    for (let i = this.iter(), e = i.begin(); i.current; e = i.next()) {
      if (el == e) {
        this.removeNode(i.currNode());
        break;
      }
    }
  }

  iter() {
    return new ListIterator(this.head);
  }

  iterFrom(startFrom) {
    return new ListIterator(startFrom);
  }

  each(fn, startFrom = null, stopIfFalsyReturn = false) {
    let n = 0;
    for (
      let i = startFrom == null ? this.iter() : this.iterFrom(startFrom),
        e = i.begin();
      i.current;
      e = i.next()
    ) {
      if (
        !fn(/*element*/ e, /*iterator*/ i, /*list*/ this, /*index*/ n) &&
        stopIfFalsyReturn
      )
        break;
      n++;
    }
  }

  async eachAwait(fn, startFrom = null, stopIfFalsyReturn = false) {
    let n = 0;
    for (
      let i = startFrom == null ? this.iter() : this.iterFrom(startFrom),
        e = i.begin();
      i.current;
      e = i.next()
    ) {
      let retval = await fn(
        /*element*/ e,
        /*iterator*/ i,
        /*list*/ this,
        /*index*/ n,
      );
      if (!retval && stopIfFalsyReturn) break;
      n++;
    }
  }

  forEach(fn) {
    let n = 0;
    for (let i = this.iter(), e = i.begin(); i.current; e = i.next()) {
      fn(/*element*/ e, /*index*/ n, /*iterator*/ i, /*list*/ this);
      n++;
    }
  }

  filter(fn) {
    let n = 0;
    let list = new List();
    for (let i = this.iter(), e = i.begin(); i.current; e = i.next()) {
      if (fn(/*element*/ e, /*iterator*/ i, /*list*/ this, /*index*/ n)) {
        list.append(e);
      }
      n++;
    }
    return list;
  }

  map(fn) {
    let n = 0;
    let list = new List();
    for (let i = this.iter(), e = i.begin(); i.current; e = i.next()) {
      list.append(
        fn(/*element*/ e, /*iterator*/ i, /*list*/ this, /*index*/ n),
      );
      n++;
    }
    return list;
  }

  reduce(fn, initialValue) {
    let n = 0;
    let last = initialValue;
    for (let i = this.iter(), e = i.begin(); i.current; e = i.next()) {
      last = fn(
        /*last*/ last,
        /*element*/ e,
        /*iterator*/ i,
        /*list*/ this,
        /*index*/ n,
      );
      n++;
    }
    return last;
  }

  count() {
    return this.cnt;
  }

  first() {
    return this.head ? this.head.value : null;
  }

  firstNode() {
    return this.head;
  }

  last() {
    return this.tail ? this.tail.value : null;
  }

  lastNode() {
    return this.tail;
  }
}

class ListNode {
  constructor() {
    this.prev = null;
    this.next = null;
    this.value = null;
  }
}

class ListIterator {
  constructor(head) {
    this.head = head;
    this.current = null;
  }

  val() {
    return this.current ? this.current.value : null;
  }

  begin() {
    this.beginNode();
    return this.val();
  }

  beginNode() {
    this.current = this.head;
    return this.current;
  }

  curr() {
    return this.val();
  }

  currNode() {
    return this.current;
  }

  next() {
    this.nextNode();
    return this.val();
  }

  nextNode() {
    this.current = this.current.next;
    return this.current;
  }

  reset() {
    this.current = this.head;
  }
}

const TaskPriorities = {
  Initialize: 30000,
  Update: 20000,
  Draw: 10000,
};

class TaskManager {
  constructor() {
    this._repository = new List();
    this._lastPointer = {};
  }

  register(task) {
    let startFrom = null;

    if (this._lastPointer[task.priority]) {
      // if last pointer found, use it as first node for iterator
      startFrom = this._lastPointer[task.priority];
    } else {
      // if last pointer not found, use nearest pointer as first node for iterator
      for (let p in this._lastPointer) {
        if (this._lastPointer[p] == null) continue;
        let pi = parseInt(p, 10);
        if (pi <= task.priority) {
          startFrom = this._lastPointer[pi];
        }
      }
    }

    if (startFrom != null) {
      this._repository.each(
        (e, i, l, n) => {
          if (task.priority >= e.priority) {
            this._lastPointer[task.priority] = l.insertBefore(
              i.currNode(),
              task,
            );
            return false;
          }
          return true;
        },
        startFrom,
        true,
      );
    } else {
      this._lastPointer[task.priority] = this._repository.append(task);
    }
  }

  runAll() {
    this._repository.each((e, i, l, n) => {
      if (e.killed) {
        if (this._lastPointer[e.priority] == i.currNode()) {
          if (
            i.currNode().prev &&
            i.currNode().prev.value.priority === e.priority
          ) {
            this._lastPointer[e.priority] = i.currNode().prev;
          } else {
            this._lastPointer[e.priority] = null;
          }
        }
        l.removeNode(i.currNode());
        return;
      }
      // try {
      e.run();
      // } catch (e) {
      // console.error(e);
      // }
    });
  }

  clearAll() {
    this._repository.each((e, i, l, n) => {
      e.kill();
    });
    this._repository = new List();
    this._lastPointer = {};
  }

  count() {
    return this._repository.count();
  }

  pointer() {
    return this._lastPointer;
  }

  repository() {
    return this._repository;
  }
}

class Task {
  constructor(manager, priority, fn = null) {
    this.priority = priority;
    this.fn = fn;
    this.killed = false;
    this.onKill = () => {};
    manager.register(this);
  }

  run() {
    if (this.fn) {
      this.fn(this);
    }
  }

  kill() {
    this.killed = true;
    this.onKill();
  }
}

class ArraySparseSet {
  constructor(size) {
    if (!size) {
      throw new Error(`Initial sparse array size not designated`);
    }
    this._size = size;
    this._dense = [];
    this._data = [];
    this._sparse = new Array(this._size).fill(-1);
  }

  set(id, val) {
    if (DEVMODE) this.checkSparseBounds(id);
    if (this.has(id)) throw new Error(`Entry [${id}] is already registered`);
    this._sparse[id] = this._dense.length;
    this._dense.push(id);
    this._data.push(val);
  }

  get(id) {
    if (DEVMODE) this.checkSparseBounds(id);
    if (!this.has(id)) throw new Error(`Entry [${id}] is not registered`);
    return this._data[this._sparse[id]];
  }

  has(id) {
    if (DEVMODE) this.checkSparseBounds(id);
    const idx = this._sparse[id];
    return idx !== undefined && idx !== -1;
  }

  delete(id) {
    if (DEVMODE) this.checkSparseBounds(id);
    const idx = this._sparse[id];
    const tailIdx = this._dense.length - 1;
    if (idx !== tailIdx) {
      this._sparse[this._dense[tailIdx]] = idx;
      this._dense[idx] = this._dense[tailIdx];
      this._data[idx] = this._data[tailIdx];
    }
    this._dense.pop();
    this._data.pop();
    this._sparse[id] = -1;
  }

  checkSparseBounds(id) {
    if (id < 0 || id > this._size - 1)
      throw new Error(`Sparse array bounds exceeded [${id}]`);
  }

  entries() {
    return this._data;
  }

  keys() {
    return this._dense;
  }
}

class EntityRef {
  constructor(id) {
    this._id = id;
  }

  getId() {
    return this._id;
  }
}

class ComponentIdManager {
  static _currId = 0;
  static _ids = new Map();

  static getId(ctor) {
    if (!this._ids.has(ctor)) this._ids.set(ctor, ++this._currId);
    return this._ids.get(ctor);
  }

  static clear() {
    this._currId = 0;
    this._ids.clear();
  }
}

class Archtype {
  static toKey(componentCtorSet) {
    const ctors = [];
    for (const ctor of componentCtorSet) {
      ctors.push(ComponentIdManager.getId(ctor));
    }
    return ctors.sort();
  }

  static toKeyStr(componentCtorSet) {
    return this.toKey(componentCtorSet).join(",");
  }

  static isSame(queryKey, archKey, exact = true) {
    if (exact && archKey.length !== queryKey.length) return false;
    let i = 0,
      j = 0;
    while (i < archKey.length && j < queryKey.length) {
      if (archKey[i] === queryKey[j]) {
        i++;
        j++;
      } else if (archKey[i] < queryKey[j]) i++;
      else return false;
    }
    return j === queryKey.length;
  }

  constructor(componentCtorSet, maxEntityCount = 10000) {
    this._maxEntityCount = maxEntityCount;
    this._componentCtorSet = new Set();
    for (let ctor of componentCtorSet) {
      this._componentCtorSet.add(ctor);
    }
    this._key = Archtype.toKey(componentCtorSet);
    this._entities = new ArraySparseSet(this._maxEntityCount);
  }

  match(componentCtorSet, exact = true) {
    return Archtype.isSame(Archtype.toKey(componentCtorSet), this._key, exact);
  }

  addEntry(entity) {
    this._entities.set(entity, entity);
  }

  deleteEntry(entity) {
    this._entities.delete(entity);
  }

  entities() {
    return this._entities.keys();
  }
}

const EntityState = {
  Deleted: 0,
  Active: 1,
  Inactive: 2,
  Deleting: 3,
};

class Registry {
  constructor(maxEntityCount = 10000) {
    this._currentEntityId = 0;
    this._maxEntityCount = maxEntityCount;

    const initArray = (fn) => {
      return Array.from({ length: maxEntityCount }, fn);
    };

    this._compCtorToCompStoreMap = new Map();
    this._entityToCompCtorSetMap = initArray(() => new Set());
    this._entityState = initArray(() => EntityState.Deleted);
    this._entityArchtype = initArray(() => null);
    this._entityGen = initArray(() => 0);
    this._entityFreelist = [];
    this._entityDeleting = [];
    this._archtypes = [];
    this._archtypeKeyStrToArchtype = new Map();
  }

  createEntity() {
    let entityId;
    if (entityId >= this._maxEntityCount) {
      if (this._entityFreelist.length === 0) {
        throw new Error(`Maximum acttive entity count exceeded.`);
      }
      entityId = this._entityFreelist.pop();
    } else {
      entityId = this._currentEntityId++;
    }
    this._entityState[entityId] = EntityState.Active;
    this._entityToCompCtorSetMap[entityId].clear();
    return entityId;
  }

  addComponent(entity, ...components) {
    //// add components
    for (let component of components) {
      const ctor = component.constructor;
      let store = this._compCtorToCompStoreMap.get(ctor);
      if (!store) {
        store = new ArraySparseSet(this._maxEntityCount);
        this._compCtorToCompStoreMap.set(ctor, store);
      }
      if (store.has(entity))
        throw new Error(`Entity [${entity} already has ${ctor.name}]`);
      store.set(entity, component);
      this._entityToCompCtorSetMap[entity].add(ctor);
    }

    //// archtype identification
    let identifiedArchtype = null;
    const ctorsSet = this._entityToCompCtorSetMap[entity];
    const keyStr = Archtype.toKeyStr(ctorsSet);
    if (this._archtypeKeyStrToArchtype.has(keyStr)) {
      identifiedArchtype = this._archtypeKeyStrToArchtype.get(keyStr);
    }
    if (!identifiedArchtype) {
      // create new archtype
      const newArchtype = new Archtype(ctorsSet, this._maxEntityCount);
      this._archtypes.push(newArchtype);
      this._archtypeKeyStrToArchtype.set(keyStr, newArchtype);
      identifiedArchtype = newArchtype;
    }

    //// delete entity -> archtype map
    const curArchtype = this._entityArchtype[entity];
    if (curArchtype != identifiedArchtype) {
      if (curArchtype) curArchtype.deleteEntry(entity);
    }

    //// entry entity -> archtype map
    this._entityArchtype[entity] = identifiedArchtype;

    //// entry archtype entities
    identifiedArchtype.addEntry(entity);

    return entity;
  }

  getComponent(entity, componentCtor) {
    let c = this._compCtorToCompStoreMap.get(componentCtor)?.get(entity);
    if (!c) {
      throw new Error(
        `Component [${componentCtor.name}] for entity id=${entity} not found`,
      );
    }
    return c;
  }

  _destroyEntity(entity) {
    if (this._entityState[entity] === EntityState.Deleted)
      throw new Error(`Entity [${entity}] is already deleted.`);
    const ctors = this._entityToCompCtorSetMap[entity];
    for (let ctor of ctors) {
      this._compCtorToCompStoreMap.get(ctor).delete(entity);
    }
    this._entityArchtype[entity]?.deleteEntry(entity);
    this._entityArchtype[entity] = null;
    this._entityToCompCtorSetMap[entity].clear();
    this._entityState[entity] = EntityState.Deleted;
    this._entityGen[entity]++;
    this._entityFreelist.push(entity);
  }

  deleteEntity(entity) {
    this._entityState[entity] = EntityState.Deleting;
    this._entityDeleting.push(entity);
  }

  _batchDestroyEntity() {
    for (const entity of this._entityDeleting) {
      this._destroyEntity(entity);
    }
  }

  isEntityActive(entity) {
    return this._entityState[entity] === EntityState.Active;
  }

  isEntityNotDeleted(entity) {
    return this._entityState[entity] !== EntityState.Deleted;
  }

  _queryEntity(exact, ...requiredComponentCtors) {
    if (requiredComponentCtors.length === 0)
      throw new Error(`Required component not designated`);
    let minCtor = requiredComponentCtors[0];
    let minLengths = this._compCtorToCompStoreMap.get(minCtor).keys().length;
    for (let ctor of requiredComponentCtors) {
      const len = this._compCtorToCompStoreMap.get(ctor).keys().length;
      if (len < minLengths) {
        minCtor = ctor;
        minLengths = len;
      }
    }

    const result = [];

    ENTRIES: for (let e of this._compCtorToCompStoreMap.get(minCtor).keys()) {
      for (let ctor of requiredComponentCtors) {
        if (ctor == minCtor) continue;
        const store = this._compCtorToCompStoreMap.get(ctor);
        if (!store) continue ENTRIES;
        if (!store.has(e)) continue ENTRIES;
      }
      if (
        exact &&
        requiredComponentCtors.length !== this._entityToCompCtorSetMap[e].size
      )
        continue;
      result.push(e);
    }

    return result;
  }

  _findArchtype(requiredComponentCtors, exact = true) {
    const matchedArchetypes = [];
    for (let archtype of this._archtypes) {
      if (archtype.match(requiredComponentCtors, exact)) {
        matchedArchetypes.push(archtype);
      }
    }
    return matchedArchetypes;
  }

  *query(exact, ...requiredComponentCtors) {
    for (const archtype of this._findArchtype(requiredComponentCtors, exact)) {
      yield* archtype.entities();
    }
  }

  count(exact, ...requiredComponentCtors) {
    let entityCount = 0;
    for (const archtype of this._findArchtype(requiredComponentCtors, exact)) {
      entityCount += archtype.entities().length;
    }
    return entityCount;
  }

  getComponentCtorSet(entity) {
    if (DEVMODE && !this.isEntityNotDeleted(entity))
      throw new Error(
        `Entity [${entity}] is not found in entity - componentCtor mapping.`,
      );
    return this._entityToCompCtorSetMap[entity];
  }
}

export default {
  List,
  TaskPriorities,
  Task,
  TaskManager,
  Registry,
  ArraySparseSet,
  Archtype,
  EntityRef,
  EntityState,
  ComponentIdManager,
};
