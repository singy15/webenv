import component from "./component.js";
const Component = component.Component;
import task from "../tasks/task.js";
const Task = task.Task;
const TaskPriorities = task.TaskPriorities;
import vector from "../vector.js";
const v$ = vector.Vector.$;
import killable from "./killable.js";
import physics from "./physics.js";
// import imageRepository from "../image-repository.js";

class SimpleDrawComponent extends Component {
  constructor(entity, gadpt, image, region, anim, priority = 0) {
    super(entity, killable.KillableComponent, physics.PhysicsComponent);
    this.gadpt = gadpt;
    // let irepo = new imageRepository.ImageRepository(gadpt);
    this.image = image;
    this.region = region;
    this.anim = anim ?? {
      frames: 0,
      interval: 0,
      frameOffsetX: 0,
      frameOffsetY: 0,
      columns: 0,
    };
    this.t = 0;
    new Task(TaskPriorities.draw + priority, (task) => {
      if (entity.killable.killed) {
        task.kill();
        return;
      }
      this.run();
    });
  }

  run() {
    let g = this.gadpt;
    let p = this.entity.physics.p;
    // g.arc(p.x, p.y, 16.0, {
    //   fillStyle: `rgba(255,255,255,1.0)`,
    // });
    let r = this.region;

    let curFrame = 0;
    let aox = 0;
    let aoy = 0;
    let anim = this.anim;
    if (anim.frames > 0) {
      curFrame = Math.floor(this.t / anim.interval) % anim.frames;
      aox = (curFrame % anim.columns) * anim.frameOffsetX;
      aoy = Math.floor(curFrame / anim.columns) * anim.frameOffsetY;
    }

    //g.draw(this.image, Math.round(p.x), Math.round(p.y), {
    g.draw(this.image, p.x, p.y, {
      sx: r.sx + aox,
      sy: r.sy + aoy,
      swidth: r.swidth,
      sheight: r.sheight,
      smoothig: r.smoothing ?? true,
      globalAlpha:
        r.globalAlpha instanceof Function ? r.globalAlpha() : r.globalAlpha,
      //scaleX: r.scaleX,
      scaleX: r.scaleX instanceof Function ? r.scaleX() : r.scaleX,
      // scaleY: r.scaleY,
      scaleY: r.scaleY instanceof Function ? r.scaleY() : r.scaleY,
      angle: r.angle ?? this.entity.physics.v.rad() + Math.PI / 2.0,
    });

    this.t++;
  }
}

export default {
  SimpleDrawComponent,
};
