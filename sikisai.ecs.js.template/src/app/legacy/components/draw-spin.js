import component from "./component.js";
const Component = component.Component;
import task from "../tasks/task.js";
const Task = task.Task;
const TaskPriorities = task.TaskPriorities;
import vector from "../vector.js";
const v$ = vector.Vector.$;
import killable from "./killable.js";
import physics from "./physics.js";

class DrawSpinComponent extends Component {
  constructor(entity, gadpt, image, spin) {
    super(entity, killable.KillableComponent, physics.PhysicsComponent);
    this.gadpt = gadpt;
    this.image = image;
    this.spin = spin ?? {
      row: 1,
      column: 1,
      scale: 1.0,
    };
    this.history = [];
    this.t = 0;
    new Task(TaskPriorities.draw, (task) => {
      if (entity.killable.killed) {
        task.kill();
        return;
      }
      this.run();
    });
  }

  run() {
    if(this.image.image === undefined) {
      return;
    }
    let g = this.gadpt;
    let p = this.entity.physics.p;

    let spin = this.spin;
    let w = this.image.image.width;
    let h = this.image.image.height;
    let cw = w / spin.column;
    let ch = h / spin.row;
    let cam = g.getCamera();
    let margin = 2.0;
    let tl = v$(cam.x - cw * margin, cam.y - ch * margin);
    let br = tl.dup().add(v$(g.width() + cw * margin, g.height() + ch * margin));
    if (tl.x > p.x || tl.y > p.y || br.x < p.x || br.y < p.y) {
      return;
    }

    let phys = this.entity.physics;

    let n = spin.row * spin.column;
    let np = (Math.PI * 2.0) / n;
    let pi2 = Math.PI * 2.0;
    let r = phys.r + Math.PI / 2.0;
    let na = r - Math.floor(r / pi2) * pi2;
    let cf = Math.round(na / np);
    if (cf >= n) {
      cf = 0;
    }

    this.history.push(cf);
    if (this.history.length > 4) {
      this.history.shift();
    }

    let findMajority = (nums) => {
      const counts = {};

      for (let num of nums) {
        if (counts[num]) {
          counts[num]++;
        } else {
          counts[num] = 1;
        }
      }

      let majority = null;
      let maxCount = 0;
      for (let num in counts) {
        if (counts[num] > maxCount) {
          maxCount = counts[num];
          majority = Number(num);
        }
      }

      return majority;
    };

    let nf = findMajority(this.history);

    // let nf = Math.floor(na / np);
    let x = nf % spin.column;
    let y = Math.floor(nf / spin.row);
    g.draw(this.image, p.x, p.y, {
      sx: x * cw,
      sy: y * ch,
      swidth: cw,
      sheight: ch,
      smoothing: false,
      scaleX: spin.scale,
      scaleY: spin.scale,
    });

    this.t++;
  }

  forceResetAngleHistory() {
    this.history = [];
  }
}

export default {
  DrawSpinComponent,
};
