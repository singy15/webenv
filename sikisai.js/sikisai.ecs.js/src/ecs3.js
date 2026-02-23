const EntityState = {
  Deleted: 0,
  Active: 1,
  Inactive: 2,
  Deleting: 3,
};

const DEVMODE = true;

class Registry {
  constructor(maxEntityCount = 10000) {
    this._currentEntityId = 0;
    this._maxEntityCount = maxEntityCount;

    const initArray = (fn) => {
      return Array.from({ length: maxEntityCount }, fn);
    };

    this._compCtorToCompStoreMap = new Map();
    this._entityToCompCtorListMap = initArray(() => []);
    this._entityState = initArray(() => EntityState.Deleted);
    this._entityArchtype = initArray(() => null);

    // this._entities = new Map();
    // this._queryCache = [];
    this._archtypes = [];
  }

  createEntity() {
    const entityId = ++this._currentEntityId;
    this._entityState[entityId] = EntityState.Active;
    this._entityToCompCtorListMap[entityId] = [];
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
      this._entityToCompCtorListMap[entity].push(ctor);
    }

    //// archtype identification
    let identifiedArchtype = null;
    const ctors = this._entityToCompCtorListMap[entity];
    for (let archtype of this._archtypes) {
      // find existing archtype
      if (archtype.match(ctors)) {
        identifiedArchtype = archtype;
        break;
      }
    }
    if (!identifiedArchtype) {
      // create new archtype
      identifiedArchtype = new Archtype(ctors, this._maxEntityCount);
      this._archtypes.push(identifiedArchtype);
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

  deleteEntity(entity) {
    if (this._entityState[entity] === EntityState.Deleted)
      throw new Error(`Entity [${entity}] is already deleted.`);
    const ctors = this._entityToCompCtorListMap[entity];
    for (let ctor of ctors) {
      this._compCtorToCompStoreMap.get(ctor).delete(entity);
    }
    this._entityToCompCtorListMap[entity].length = 0;
    this._entityState[entity] = EntityState.Deleted;
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
        requiredComponentCtors.length !==
          this._entityToCompCtorListMap[e].length
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

  getComponentCtorList(entity) {
    if (DEVMODE && !this.isEntityNotDeleted(entity))
      throw new Error(
        `Entity [${entity}] is not found in entity - componentCtor mapping.`,
      );
    return this._entityToCompCtorListMap[entity];
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

class Archtype {
  constructor(componentCtors, maxEntityCount = 10000) {
    this._maxEntityCount = maxEntityCount;
    this._componentCtors = new Set();
    for (let ctor of componentCtors) {
      this._componentCtors.add(ctor);
    }
    this._entities = new ArraySparseSet(this._maxEntityCount);
  }

  match(componentCtors, exact = true) {
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
    if (exact && matched !== this._componentCtors.size) return false;
    return true;
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

export default {
  Registry,
  ArraySparseSet,
  Archtype,
  EntityRef,
  EntityState,
};
