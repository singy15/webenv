import xorshiftRandom from "../xorshift-random.js";

import task from "../tasks/task.js";
const Task = task.Task;
const TaskPriorities = task.TaskPriorities;

import vector from "../vector.js";
const v$ = vector.Vector.$;

class TaskDrawBackground extends Task {
  constructor(gadpt, image) {
    super(TaskPriorities.draw + 8000);
    this.gadpt = gadpt;
    this.image = image;
  }

  drawStarfield(scale) {
    let ga = this.gadpt;
    let size = 500; //ga.width();
    let cm = ga.camera();
    let ov = v$(cm.x, cm.y);
    let cv = v$(cm.x, cm.y).mult(scale);
    let nv = v$(Math.floor(cv.x / size), Math.floor(cv.y / size));
    let stars = [];
    for (let y = nv.y - 2; y <= nv.y + 2; y++) {
      for (let x = nv.x - 2; x <= nv.x + 2; x++) {
        let seed = y * 10000 + x;
        let rnd = new xorshiftRandom.XorshiftRandom(seed);
        let cnt = rnd.nextInt(1, 20);
        for (let i = 0; i < cnt; i++) {
          // stars.push(v$(x * size + size / 2.0, y * size + size / 2.0));
          stars.push(
            v$(
              x * size + rnd.nextInt(0, size),
              y * size + rnd.nextInt(0, size),
            ),
          );
        }
      }
    }

    ga.withoutCamera(() => {
      stars.forEach((s) => {
        //let sv = s.dup().add(ov).sub(cv); for global
        let sv = s.dup().sub(cv);
        let x = Math.floor(sv.x),
          y = Math.floor(sv.y);
        ga.rect(x, y, x + 1, y + 1, {
          fillStyle: `rgba(255,255,255,${scale * 10.0})`,
          strokeStyle: `transparent`,
        });
      });
    });
  }

  run() {
    let g = this.gadpt;
    let cam = g.camera();

    let cs = 500;
    let nx = Math.floor(cam.x / cs);
    let ny = Math.floor(cam.y / cs);

    let style = {
      strokeStyle: `rgba(100,100,100,0.5)`,
      lineWidth: 1.0,
    };

    for (let y = ny - 1; y < ny + 3; y++) {
      g.line(
        Math.floor((nx - 1) * cs),
        Math.floor(y * cs),
        Math.floor((nx + 3) * cs),
        Math.floor(y * cs),
        style,
      );
    }
    for (let x = nx - 1; x < nx + 3; x++) {
      g.line(
        Math.floor(x * cs),
        Math.floor((ny - 1) * cs),
        Math.floor(x * cs),
        Math.floor((ny + 3) * cs),
        style,
      );
    }

    for (let y = ny - 1; y < ny + 3; y++) {
      for (let x = nx - 1; x < nx + 3; x++) {
        // g.text(`${x},${y}`, x * cs + cs / 2.0, y * cs + cs / 2.0, {
        //   textAlign: "center",
        //   fillStyle: `rgba(200,200,200,0.5)`,
        //   lineWidth: 0.5,
        //   strokeStyle: `transparent`,
        //   font: "24px k8x12S",
        // });
      }
    }

    //this.drawStarfield(2);
    //this.drawStarfield(1.0);
    this.drawStarfield(0.1);
    this.drawStarfield(0.05);
  }
}

export default {
  TaskDrawBackground,
};
