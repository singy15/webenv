export class Repository<S> {
  rows: { [K in keyof S]?: S[K][] } = {};

  _ensure<K extends keyof S>(tableName: K): S[K][] {
    let target = this.rows[tableName];
    if (!target) {
      target = [];
      this.rows[tableName] = target;
    }
    return target;
  }

  _fetch<K extends keyof S>(tableName: K, condition: (r: S[K]) => boolean): S[K][] {
    return this._ensure(tableName).filter(condition);
  }

  insert<K extends keyof S>(tableName: K, insertRows: S[K][]) {
    const target: S[K][] = this._ensure(tableName);
    insertRows.forEach(r => target.push(r));
  }

  select<K extends keyof S>(tableName: K, condition: (r: S[K]) => boolean): S[K][] {
    return this._fetch(tableName, condition).map(r => ({ ...r }));
  }

  single<K extends keyof S>(tableName: K, condition: (r: S[K]) => boolean): S[K] | undefined {
    const candidates = this._fetch(tableName, condition);
    if (candidates.length > 1) throw new Error(`Multiple rows found [${candidates.length}]`);
    return candidates[0];
  }

  update<K extends keyof S>(tableName: K, diff: Partial<S[K]>, condition: (r: S[K]) => boolean): number {
    const targets = this._fetch(tableName, condition);
    targets.forEach(r => { Object.assign(r, diff) });
    return targets.length;
  }

  remove<K extends keyof S>(tableName: K, condition: (r: S[K]) => boolean): number {
    const rows = this._ensure(tableName);
    const remainders = rows.filter((r) => !condition(r));
    this.rows[tableName] = remainders;
    return rows.length - remainders.length;
  }
}

// how to use
/*
type Item = {
  id: number;
  name: string;
}

const Tables = {
  Item: "item"
} as const;

type Schema = {
  [Tables.Item]: Item
}

function main() {
  const repo = new Repository<Schema>();
  repo.insert(Tables.Item, [{ id: 1, name: "ITEM1" }]);
}
*/
