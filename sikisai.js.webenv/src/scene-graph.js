import scene from "./scene.js";
import linkedList from "./linked-list.js";
import graph from "./graph/graph.js";
import vector from "./vector.js";
const v$ = vector.Vector.$;

class SceneGraph extends scene.Scene {
  constructor(gadpt, iadpt, fpsc, aadpt) {
    super();
    this.gadpt = gadpt;
    this.iadpt = iadpt;
    this.fpsc = fpsc;
    this.aadpt = aadpt;
    this.g = null;
  }

  init() {
    super.init();
    this.g = new graph.Graph();
    let n1 = this.g.createNode({ x: 100, y: 100 });
    let n2 = this.g.createNode({ x: 100, y: 200 });
    let n3 = this.g.createNode({ x: 200, y: 200 });
    let n4 = this.g.createNode({ x: 300, y: 250 });
    n1.connectTo(n2);
    n2.connectTo(n3);
    n3.connectTo(n1);
    n3.connectTo(n4);
  }

  update() {
    let iadpt = this.iadpt;

    super.update();

    for (let i = 0; i < this.fpsc.updateFrames; i++) {
      this.tick();
    }
  }

  tick() {
    let iadpt = this.iadpt;
  }

  // moveCamera() {
  //   let iadpt = this.iadpt;
  //   let camspd = iadpt.keydown(32) ? 45.0 : 15.0;
  //   if (iadpt.keydown(87)) {
  //     this.gadpt.moveCamera(0, -camspd);
  //   }
  //   if (iadpt.keydown(83)) {
  //     this.gadpt.moveCamera(0, camspd);
  //   }
  //   if (iadpt.keydown(65)) {
  //     this.gadpt.moveCamera(-camspd, 0);
  //   }
  //   if (iadpt.keydown(68)) {
  //     this.gadpt.moveCamera(camspd, 0);
  //   }
  // }

  draw() {
    let gadpt = this.gadpt;
    let iadpt = this.iadpt;

    gadpt.withoutCamera(() => {
      this.clearScreen(gadpt);
    });

    let r = 15.0;

    this.g.getNodes().forEach((n) => {
      let v = n.getValue();
      let p = v$(v.x, v.y);

      gadpt.arc(p.x, p.y, r, {
        strokeStyle: `rgba(255,255,255,1.0)`,
        fillStyle: `transparent`,
      });

      n.getConnectedTo().forEach((c) => {
        let cv = c.getValue();
        let p2 = v$(cv.x, cv.y);
        let vv = p2.dup().sub(p).normalize().mult(r);
        let pa = p.dup().add(vv);
        let pb = p2.dup().sub(vv);

        gadpt.line(pa.x, pa.y, pb.x, pb.y, {
          strokeStyle: `rgba(255,255,255,1.0)`,
        });
      });
    });

    //// alternative
    // for (let i = as.iter("default"), e = i.begin(); e; e = i.next()) {
    //   e.draw();
    // }
  }

  clearScreen(gadpt) {
    gadpt.rect(0, 0, gadpt.width(), gadpt.height(), {
      // fillStyle: "rgba(0,0,0,1.0)",
      fillStyle: "rgba(0,0,0,0.2)",
    });
  }
}

export default {
  SceneGraph: SceneGraph,
};
