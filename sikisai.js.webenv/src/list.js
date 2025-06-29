class List {
  constructor() {
    this.head = null;
    this.tail = null;
    this.cnt = 0;
  }

  append(val) {
    return this.insertAfter(this.tail, val);
  }

  prepend(val) {
    return this.insertBefore(this.head, val);
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
    if (el == this.head) this.head = el.next;
    if (el == this.tail) this.tail = el.prev;
    if (el.prev) el.prev.next = el.next;
    if (el.next) el.next.prev = el.prev;

    this.cnt = this.cnt - 1;
  }

  remove(el) {
    for (let i = this.iter(), e = i.begin(); e; e = i.next()) {
      if (el == e) {
        this.removeNode(i.currNode());
        break;
      }
    }
  }

  iter() {
    return new ListIterator(this.head);
  }

  each(fn) {
    let n = 0;
    for (let i = this.iter(), e = i.begin(); e; e = i.next()) {
      fn(/*element*/ e, /*iterator*/ i, /*list*/ this, /*index*/ n);
      n++;
    }
  }

  filter(fn) {
    let n = 0;
    let list = new List();
    for (let i = this.iter(), e = i.begin(); e; e = i.next()) {
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
    for (let i = this.iter(), e = i.begin(); e; e = i.next()) {
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
    for (let i = this.iter(), e = i.begin(); e; e = i.next()) {
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

export default {
  List: List,
};
