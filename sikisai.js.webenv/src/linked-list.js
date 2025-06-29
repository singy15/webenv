/*
  // Example: iterating over list (without groups).

  class FooActor() { print() { console.log("foo"); } }
  class BarActor() { print() { console.log("bar"); } }

  let l = new LinkedList();
  l.add(new FooActor(), "foo");
  l.add(new FooActor(), "foo");
  l.add(new BarActor()); // belongs to "default" group
  l.add(new BarActor()); // belongs to "default" group
  for(let i = l.iter(), e = i.begin(); e; e = i.next()) {
    e.value.print();
  }
*/

/*
  // Example: iterating over list (with groups).

  class FooActor() { printFoo() { console.log("foo"); } }
  class BarActor() { printBar() { console.log("bar"); } }

  let l = new LinkedList();
  l.add(new FooActor(), "foo");
  l.add(new FooActor(), "foo");
  l.add(new BarActor(), "bar");
  l.add(new BarActor(), "bar");
  for(let i = l.iter("bar"), e = i.begin(); e; e = i.next()) {
    e.printBar();
  }
*/

/*
  // Example: remove a element while iterating over list.

  class FooActor() { print() { console.log("foo"); } }

  let l = new LinkedList();
  l.add(new FooActor(), "foo");
  l.add(new FooActor(), "foo");
  l.add(new FooActor(), "foo");
  for(let i = l.iter(), e = i.begin(); e; e = i.next()) {
    if(Math.random(1.0) < 0.5) {
      l.remove(e);
      // or: faster when many groups
      // l.remove(i.curNode(), "foo");
      // or even more faster
      // l.removeNode(i.curNode());
      continue;
    }
    
    e.print();
  }
*/

class LinkedList {
  constructor() {
    this.head = null;
    this.tail = null;
    this.cnt = 0;

    this.headg = {};
    this.tailg = {};
    this.cntg = {};
  }

  add(val, group = "default") {
    let el = new LinedListNode();
    el.value = val;
    el.group = group;

    //// Update prev/next
    el.next = null;
    if (this.tail) {
      el.prev = this.tail;
      this.tail.next = el;
    }
    // grp
    el.nextg = null;
    if (this.tailg[group]) {
      el.prevg = this.tailg[group];
      this.tailg[group].nextg = el;
    }

    //// Update head
    if (!this.head) {
      this.head = el;
    }
    // grp
    if (!this.headg[group]) {
      this.headg[group] = el;
    }

    //// Update tail
    this.tail = el;
    // grp
    this.tailg[group] = el;

    //// Update cnt
    this.cnt = this.cnt + 1;
    // grp
    if (this.cntg[group] === undefined) {
      this.cntg[group] = 1;
    } else {
      this.cntg[group] = this.cntg[group] + 1;
    }
  }

  removeNode(el) {
    if (el == this.head) this.head = el.next;
    if (el == this.tail) this.tail = el.prev;
    if (el.prev) el.prev.next = el.next;
    if (el.next) el.next.prev = el.prev;

    let group = el.group;
    if (el == this.headg[group]) this.headg[group] = el.nextg;
    if (el == this.tailg[group]) this.tailg[group] = el.prevg;
    if (el.prevg) el.prevg.nextg = el.nextg;
    if (el.nextg) el.nextg.prevg = el.prevg;

    this.cnt = this.cnt - 1;
    this.cntg[group] = this.cntg[group] - 1;
  }

  remove(el, group = null) {
    for (let i = this.iter(group), e = i.begin(); e; e = i.next()) {
      if (el == e) {
        this.removeNode(i.currNode());
        break;
      }
    }
  }

  iter(group = null) {
    return new LinkedListIterator(group ? this.headg[group] : this.head, group);
  }

  each(fn, group = null) {
    let n = 0;
    for (let i = this.iter(group), e = i.begin(); e; e = i.next()) {
      fn(/*element*/ e, /*iterator*/ i, /*list*/ this, /*index*/ n);
      n++;
    }
  }

  filter(fn, group = null) {
    let n = 0;
    let list = new LinkedList();
    for (let i = this.iter(group), e = i.begin(); e; e = i.next()) {
      if (fn(/*element*/ e, /*iterator*/ i, /*list*/ this, /*index*/ n)) {
        list.add(e, group);
      }
      n++;
    }
    return list;
  }

  map(fn, group = null) {
    let n = 0;
    let list = new LinkedList();
    for (let i = this.iter(group), e = i.begin(); e; e = i.next()) {
      list.add(
        fn(/*element*/ e, /*iterator*/ i, /*list*/ this, /*index*/ n),
        group,
      );
      n++;
    }
    return list;
  }

  reduce(fn, initialValue, group = null) {
    let n = 0;
    let last = initialValue;
    for (let i = this.iter(group), e = i.begin(); e; e = i.next()) {
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

  count(group = null) {
    return group ? (this.cntg[group] ?? 0) : this.cnt;
  }
}

class LinedListNode {
  constructor() {
    this.prev = null;
    this.next = null;
    this.value = null;

    this.prevg = null;
    this.nextg = null;
    this.group = "default";
  }
}

class LinkedListIterator {
  constructor(head, group = null) {
    this.head = head;
    this.current = null;
    this.group = group;
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
    this.current = this.group ? this.current.nextg : this.current.next;
    return this.current;
  }

  reset() {
    this.current = this.head;
  }
}

export default {
  LinkedList: LinkedList,
};
