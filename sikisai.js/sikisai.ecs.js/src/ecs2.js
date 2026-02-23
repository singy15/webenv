class Registry {
  constructor() {
    this._currentEntityId = 0;
    this._componentStores = new Map();
    this._entityComponentCtorMap = new Map();
    this._entities = new Map();
    this._queryCache = [];
    this._archtypes = [];
    this._entityArchtype = new Map();
  }

  createEntity() {
    const eid = ++this._currentEntityId;
    this._entityComponentCtorMap.set(eid, []);
    this._entities.set(eid, eid);
    return eid;
  }

  addComponent(entity, ...components) {
    //// add components
    for (let component of components) {
      let store = this._componentStores.get(component.constructor);
      if (!store) {
        store = new Map();
        this._componentStores.set(component.constructor, store);
      }
      if (store.has(entity))
        throw new Error(
          `Entity [${entity} already has ${component.constructor.name}]`,
        );
      store.set(entity, component);
      this._entityComponentCtorMap.get(entity).push(component.constructor);
    }

    //// archtype identification
    let identifiedArchtype = null;
    const componentCtors = this.getComponentCtorList(entity);
    for (let archtype of this._archtypes) {
      // find existing archtype
      if (archtype.match(componentCtors)) {
        identifiedArchtype = archtype;
        break;
      }
    }
    if (!identifiedArchtype) {
      // create new archtype
      identifiedArchtype = new Archtype(componentCtors);
      this._archtypes.push(identifiedArchtype);
    }

    //// delete entity -> archtype map
    const curArchtype = this._entityArchtype.get(entity);
    if (curArchtype != identifiedArchtype) {
      if (curArchtype) curArchtype.deleteEntry(entity);
    }

    //// entry entity -> archtype map
    this._entityArchtype.set(entity, identifiedArchtype);

    //// entry archtype entities
    identifiedArchtype.addEntry(entity);

    return entity;
  }

  getComponent(entity, componentCtor) {
    let c = this._componentStores.get(componentCtor)?.get(entity);
    if (!c) {
      throw new Error(
        `Component [${componentCtor.name}] for entity id=${entity} not found`,
      );
    }
    return c;
  }

  deleteEntity(entity) {
    const components = this._entityComponentCtorMap.getEntry(entity);
    for (let ctor of components) {
      delete this._componentStores[ctor][entity];
    }
    this._entityComponentCtorMap.deleteEntry(entity);
    this._entities.deleteEntry(entity);
  }

  queryEntity(exact, ...requiredComponentCtors) {
    const result = [];
    ENTRIES: for (let eid of this._entities.values()) {
      for (let ctor of requiredComponentCtors) {
        const store = this._componentStores.get(ctor);
        if (!store) continue ENTRIES;
        if (!store.has(eid)) continue ENTRIES;
      }
      if (
        exact &&
        requiredComponentCtors.length !==
          this._entityComponentCtorMap.get(eid).length
      )
        continue;
      result.push(eid);
    }
    return result;
  }

  getComponentCtorList(entity) {
    if (!this._entityComponentCtorMap.has(entity))
      throw new Error(
        `Entity [${entity}] is not found in entity - componentCtor mapping.`,
      );
    return this._entityComponentCtorMap.get(entity);
  }
}

class MapSparseSet {
  constructor() {
    this._dense = [];
    this._data = [];
    this._sparse = new Map();
  }

  addEntry(id, val) {
    if (this.exists(id)) throw new Error(`Entry [${id}] is already registered`);
    this._sparse.set(id, this._dense.length);
    this._dense.push(id);
    this._data.push(val);
  }

  getEntry(id) {
    if (!this.exists(id)) throw new Error(`Entry [${id}] is not registered`);
    return this._data[this._sparse.get(id)];
  }

  exists(id) {
    // return this._sparse.get(id) !== undefined;
    const idx = this._sparse.get(id);
    return idx !== undefined && idx !== -1;
  }

  deleteEntry(id) {
    const idx = this._sparse.get(id);
    const tailIdx = this._dense.length - 1;
    if (idx !== tailIdx) {
      this._sparse.set(this._dense[tailIdx], idx);
      this._dense[idx] = this._dense[tailIdx];
      this._data[idx] = this._data[tailIdx];
    }
    this._dense.pop();
    this._data.pop();
    // this._sparse.delete(id);
    this._sparse.set(id, -1);
  }

  *entries() {
    for (let i = 0; i < this._data.length; i++) {
      yield this._data[i];
    }
  }

  *keys() {
    for (let i = 0; i < this._dense.length; i++) {
      yield this._dense[i];
    }
  }
}

class ArraySparseSet {
  constructor(initialSize) {
    if (!initialSize) {
      throw new Error(`Initial sparse array size not designated`);
    }
    this._dense = [];
    this._data = [];
    this._sparse = new Array(initialSize).fill(-1);
  }

  addEntry(id, val) {
    this.checkSparseBounds(id);
    if (this.exists(id)) throw new Error(`Entry [${id}] is already registered`);
    this._sparse[id] = this._dense.length;
    this._dense.push(id);
    this._data.push(val);
  }

  getEntry(id) {
    this.checkSparseBounds(id);
    if (!this.exists(id)) throw new Error(`Entry [${id}] is not registered`);
    return this._data[this._sparse[id]];
  }

  checkSparseBounds(id) {
    if (id < 0 || id > this._sparse.length - 1)
      throw new Error(`Sparse array bounds exceeded [${id}]`);
  }

  exists(id) {
    this.checkSparseBounds(id);
    const idx = this._sparse[id];
    return idx !== undefined && idx !== -1;
  }

  deleteEntry(id) {
    this.checkSparseBounds(id);
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

  *entries() {
    for (let i = 0; i < this._data.length; i++) {
      yield this._data[i];
    }
  }

  *keys() {
    for (let i = 0; i < this._dense.length; i++) {
      yield this._dense[i];
    }
  }
}

class FastSparseSet {
  constructor(initialSize) {
    if (!initialSize) {
      throw new Error(`Initial sparse array size not designated`);
    }
    // this._dense = new list.List();
    this._data = new list.List();
    this._sparse = new Array(initialSize).fill(null);
  }

  addEntry(id, val) {
    this.checkSparseBounds(id);
    if (this.exists(id)) throw new Error(`Entry [${id}] is already registered`);
    // this._dense.push(id);
    const node = this._data.append(val);
    this._sparse[id] = node;
  }

  getEntry(id) {
    this.checkSparseBounds(id);
    if (!this.exists(id)) throw new Error(`Entry [${id}] is not registered`);
    return this._sparse[id].value;
  }

  checkSparseBounds(id) {
    if (id < 0 || id > this._sparse.length - 1)
      throw new Error(`Sparse array bounds exceeded [${id}]`);
  }

  exists(id) {
    this.checkSparseBounds(id);
    const idx = this._sparse[id];
    return idx !== undefined && idx !== null;
  }

  deleteEntry(id) {
    this.checkSparseBounds(id);
    const node = this._sparse[id];
    this._data.removeNode(node);
    // const tailIdx = this._dense.length - 1;
    // if (idx !== tailIdx) {
    //   this._sparse[this._dense[tailIdx]] = idx;
    //   // this._dense[idx] = this._dense[tailIdx];
    //   this._data[idx] = this._data[tailIdx];
    // }
    // this._dense.pop();
    // this._data.pop();

    this._sparse[id] = null;
  }

  // *entries() {
  //   for (let i = 0; i < this._data.length; i++) {
  //     yield this._data[i];
  //   }
  // }

  // *keys() {
  //   for (let i = 0; i < this._dense.length; i++) {
  //     yield this._dense[i];
  //   }
  // }
}

class EntityRef {
  constructor(id) {
    this._id = id;
  }

  getId() {
    return this._id;
  }
}

class Archtype {
  constructor(componentCtors) {
    this._componentCtors = new Set();
    for (let ctor of componentCtors) {
      this._componentCtors.add(ctor);
    }
    this._entities = new Map();
  }

  match(componentCtors) {
    if (!componentCtors || componentCtors.length === 0) {
      throw new Error(
        `Component matching failure, component list has no component`,
      );
    }
    let matched = 0;
    for (let ctor of componentCtors) {
      if (!this._componentCtors.has(ctor)) {
        return false;
      }
      matched++;
    }
    if (matched !== this._componentCtors.size) return false;
    return true;
  }

  addEntry(entity) {
    this._entities.set(entity, entity);
  }

  deleteEntry(entity) {
    this._entities.delete(entity);
  }
}

export default {
  Registry,
  MapSparseSet,
  ArraySparseSet,
  FastSparseSet,
  Archtype,
  EntityRef,
};
