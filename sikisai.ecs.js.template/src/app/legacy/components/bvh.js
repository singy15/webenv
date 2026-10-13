import component from "./component.js";
const Component = component.Component;
import task from "../tasks/task.js";
const Task = task.Task;
const TaskPriorities = task.TaskPriorities;
import vector from "../vector.js";
const v$ = vector.Vector.$;
import killable from "./killable.js";
import physics from "./physics.js";
import list from "../list.js";
import profiler from "./profiler.js";

let tree = null;

class BvhAABB {
  constructor(l, t, r, b) {
    this.l = l;
    this.t = t;
    this.r = r;
    this.b = b;
  }

  intersect(y) {
    let x = this;
    return x.l <= y.r && y.l <= x.r && x.t <= y.b && y.t <= x.b;
  }

  contains(y) {
    let x = this;
    return x.l <= y.l && x.t <= y.t && y.r <= x.r && y.b <= x.b;
  }

  area() {
    return (this.r - this.l) * (this.b - this.t);
  }

  draw(fill = "transparent") {
    let a = this;
    gadpt.rect(a.l, a.t, a.r, a.b, {
      strokeStyle: `rgba(255,255,255,1.0)`,
      fillStyle: fill,
      lineWidth: 0.1,
    });
  }

  distance2(x, y) {
    // let cx = this.l + (this.r - this.l) / 2,
    //   cy = this.t + (this.b - this.t) / 2;
    // return (cx - x) ** 2 + (cy - y) ** 2;

    // ai coded
    let dx = 0;
    if (x < this.l) dx = this.l - x;
    else if (x > this.r) dx = x - this.r;

    let dy = 0;
    if (y < this.t) dy = this.t - y;
    else if (y > this.b) dy = y - this.b;

    return dx * dx + dy * dy;
  }

  static combine(x, y) {
    return new BvhAABB(
      Math.min(x.l, y.l),
      Math.min(x.t, y.t),
      Math.max(x.r, y.r),
      Math.max(x.b, y.b),
    );
  }
}

class BvhNode {
  constructor(aabb, entity) {
    this.aabb = aabb;
    this.entity = entity;
    this.p = null;
    this.l = null;
    this.r = null;
    this.h = 0;
  }

  isLeaf() {
    return !this.l && !this.r;
  }
}

class BvhTree {
  constructor() {
    this.root = null;
  }

  insert(aabb, entity) {
    let node = new BvhNode(aabb, entity);

    if (!this.root) {
      this.root = node;
      return node;
    }

    let cur = this.root;
    while (!cur.isLeaf()) {
      let costL = BvhAABB.combine(node.aabb, cur.l.aabb).area();
      let costR = BvhAABB.combine(node.aabb, cur.r.aabb).area();
      if (costL < costR) {
        cur = cur.l;
      } else {
        cur = cur.r;
      }
    }

    let oldPar = cur.p;
    let newPar = new BvhNode(BvhAABB.combine(cur.aabb, node.aabb), null);
    newPar.p = oldPar;
    newPar.l = cur;
    newPar.r = node;
    newPar.h = cur.h + 1;

    cur.p = newPar;
    node.p = newPar;

    if (!oldPar) {
      this.root = newPar;
    } else {
      if (oldPar.l == cur) {
        oldPar.l = newPar;
      } else {
        oldPar.r = newPar;
      }
    }

    this._sync(newPar);

    return node;
  }

  remove(node) {
    if (node === this.root) {
      this.root = null;
      return;
    }

    const p = node.p;
    const grand = p.p;
    const sibling = p.l == node ? p.r : p.l;

    if (!grand) {
      this.root = sibling;
      sibling.p = null;
    } else {
      if (grand.l == p) grand.l = sibling;
      else grand.r = sibling;
      sibling.p = grand;
      this._sync(grand);
    }
  }

  query(aabb, callback) {
    if (!this.root) return;
    const stack = [this.root];
    while (stack.length) {
      const node = stack.pop();
      if (!node.aabb.intersect(aabb)) continue;

      if (node.isLeaf()) {
        callback(node.entity);
      } else {
        stack.push(node.l);
        stack.push(node.r);
      }
    }
  }

  nearest(x, y, callback, filter, min, max) {
    // if (!this.root) return;
    if (!this.root) {
      if (typeof callback === "function") callback(null, null);
      return;
    }

    const stack = [this.root];
    let dist = null;
    let nearest = null;
    let mv = v$(x, y);
    let dmin = min !== undefined ? min * min : 0;
    let dmax = max !== undefined ? max * max : Infinity;
    while (stack.length) {
      const node = stack.pop();
      if (node.isLeaf()) {
        let d = node.entity.physics.p.dup().sub(mv).norm2();
        const filterResult = filter
          ? filter(node.entity, d, nearest?.entity)
          : true;
        if (filterResult) {
          // let d = node.aabb.distance2(x, y);
          if (dmin <= d && d <= dmax && (dist == null || d < dist)) {
            dist = d;
            nearest = node;
          }
        }
      } else {
        let dl = node.l.aabb.distance2(x, y);
        let dr = node.r.aabb.distance2(x, y);
        // if (dist == null || dl < dist) {
        //   stack.push(node.l);
        // }
        // if (dist == null || dr < dist) {
        //   stack.push(node.r);
        // }

        if (dl < dr) {
          if (dist == null || dl <= dist) stack.push(node.l);
          if (dist == null || dr <= dist) stack.push(node.r);
        } else {
          if (dist == null || dr <= dist) stack.push(node.r);
          if (dist == null || dl <= dist) stack.push(node.l);
        }

        // if (dl < dr) {
        //   stack.push(node.l);
        // } else if (dl > dr) {
        //   stack.push(node.r);
        // } else {
        //   stack.push(node.l);
        //   stack.push(node.r);
        // }
      }
    }

    if (nearest == null) {
      callback(null, null);
    } else {
      callback(nearest.entity, Math.sqrt(dist));
    }
  }

  _sync(node) {
    let cur = node;
    while (cur) {
      cur.aabb = BvhAABB.combine(cur.l.aabb, cur.r.aabb);
      cur.h = 1 + Math.max(cur.l.h, cur.r.h);
      cur = cur.p;
    }
  }
}

class BvhComponent extends Component {
  constructor(entity, gadpt) {
    super(entity, killable.KillableComponent, physics.PhysicsComponent);
    this.radius = 4.0;
    this.handler = (self, they) => {};
    this.gadpt = gadpt;
    this.attributes = {};
    this.bitmask = 0b0; // 0b1 -> ships
    this.enabled = true;
    this.tag = "default";
    this.handler = (a, b) => {};
    this.last = null;
    this.groups = [];
    this.checkGroups = [];
    this.node = null;

    let task = new Task(TaskPriorities.update, (task) => {
      if (entity.killable.killed) {
        task.kill();
        // if (this.node) {
        //   unreg(this.lastK, this.node);
        // }
        // if (this.last) {
        //   unreg(this.entity, this.last);
        // }
        return;
      }
      this.run();
    });

    // let drawTask = new Task(TaskPriorities.draw - 9000, (task) => {
    //   if (entity.killable.killed) {
    //     drawTask.kill();
    //     // if (this.node) {
    //     //   unreg(this.lastK, this.node);
    //     // }
    //     return;
    //   }
    //   this.draw();
    // });

    task.onKill = () => {
      // XXX: o(1) node removal can be used here.
      // but this causes collision bug, why?
      // collisions.removeNode(this.node);
      //collisions.each((e, i, l, n) => {
      //  if (e.entity === this.entity) {
      //    l.removeNode(i.currNode());
      //    return;
      //  }
      //});
      // if (this.last) {
      //   unreg(this.entity, this.last);
      // }
      if (this.node != null) {
        tree.remove(this.node);
      }
    };
  }

  addGroup(group) {
    this.groups.push(group);
  }

  addCheckGroup(group) {
    this.checkGroups.push(group);
  }

  draw() {
    // let p = this.entity.physics.p;
    // let l = this.last;
    // if (l != null) {
    //   if (l.small) {
    //     this.gadpt.text(`${l?.small},${l?.x},${l?.y}`, p.x, p.y);
    //   } else {
    //     this.gadpt.text(
    //       `${l?.small},${l?.nl},${l?.nt},${l?.nr},${l?.nb}`,
    //       p.x,
    //       p.y,
    //     );
    //   }
    // }

    let p = this.entity.physics.p;
    let ga = this.gadpt;
    if (this.node) {
      let aabb = this.node.aabb;
      ga.rect(aabb.l, aabb.t, aabb.r, aabb.b, {
        strokeStyle: `rgba(255,255,255,0.5)`,
        fillStyle: `transparent`,
      });
    }
  }

  run() {
    profiler.ProfilerComponent.start("bvh");

    let p = this.entity.physics.p;
    let margin = 5.0;
    let half = this.radius + margin;

    if (
      this.node != null &&
      (Math.abs(p.x - half - this.node.aabb.l) > margin ||
        Math.abs(p.y - half - this.node.aabb.t) > margin)
    ) {
      tree.remove(this.node);
      this.node = null;
    }

    if (this.node == null) {
      this.node = tree.insert(
        new BvhAABB(p.x - half, p.y - half, p.x + half, p.y + half),
        this.entity,
      );
    }

    tree.query(this.node.aabb, (they) => {
      this.handler(this.entity, they);
    });

    profiler.ProfilerComponent.stop("bvh");
  }

  static initialize(ga) {
    tree = new BvhTree();

    // 衝突判定タスク
    let task = new Task(TaskPriorities.draw + 100, (task) => {
      // timer++;
      // if (timer > 0 && timer % 180 === 0) {
      //   Object.keys(space).forEach((k) => {
      //     if (space[k].count() === 0) {
      //       delete space[k];
      //     }
      //   });
      // }
      // let es = new Set();
      // Object.keys(cells).forEach((k) => {
      //   cells[k].forEach((e) => {
      //     es.add(e);
      //   });
      // });
      // let textStyle = {
      //   fillStyle: `rgba(255,255,255,1.0)`,
      //   font: "system 10px",
      //   strokeStyle: `transparent`,
      //   textAlign: "right",
      // };
      // ga.withoutCamera(() => {
      //   ga.text(`OBJ:${tree.root?.h}`, ga.width() - 20, 160, textStyle);
      // });
    });
  }

  static nearest(x, y, callback, filter, min, max) {
    tree.nearest(x, y, callback, filter, min, max);
  }

  static query(aabb, callback) {
    tree.query(aabb, callback);
  }

  setRadius(radius) {
    this.radius = radius;
  }

  getRadius() {
    return this.radius;
  }

  setTag(tag) {
    this.tag = tag;
  }

  getTag() {
    return this.tag;
  }

  setAttr(attr) {
    this.attributes[attr] = true;
  }

  getAttr(attr) {
    return this.attributes[attr];
  }

  enable() {
    this.enabled = true;
  }

  disable() {
    this.enabled = false;
  }

  setBitmask(bitmask) {
    this.bitmask = bitmask;
  }

  getBitmask() {
    return this.bitmask;
  }

  setHandler(handler) {
    this.handler = handler;
  }

  clearHandler() {
    this.handler = (a, b) => {};
  }
}

export default {
  BvhComponent,
};
