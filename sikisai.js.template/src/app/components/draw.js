import component from "./component.js";
const Component = component.Component;
import task from "../tasks/task.js";
const Task = task.Task;
const TaskPriorities = task.TaskPriorities;
import vector from "../vector.js";
const v$ = vector.Vector.$;
import killable from "./killable.js";
import physics from "./physics.js";
import imageRepository from "../image-repository.js";

class DrawComponent extends Component {
  constructor(entity, gadpt, region, anim) {
    super(entity, killable.KillableComponent, physics.PhysicsComponent);
    this.gadpt = gadpt;
    let irepo = new imageRepository.ImageRepository(gadpt);
    this.image = irepo.fetch("gwgrp.png");
    this.region = region;
    this.anim = anim ?? {
      frames: 0,
      interval: 0,
      frameOffsetX: 0,
      frameOffsetY: 0,
    };
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
    let g = this.gadpt;
    let p = this.entity.physics.p;
    // g.arc(p.x, p.y, 16.0, {
    //   fillStyle: `rgba(255,255,255,1.0)`,
    // });
    let r = this.region;
    
    let curFrame = 0;
    let aox = 0;
    let aoy = 0;
    if(this.anim.frames > 0) {
      curFrame = Math.floor(this.t / this.anim.interval) % this.anim.frames;
      aox = curFrame * this.anim.frameOffsetX;
      aoy = curFrame * this.anim.frameOffsetY;
    }
    g.draw(this.image, Math.round(p.x), Math.round(p.y), {
      sx: r.sx + aox,
      sy: r.sy + aoy,
      swidth: r.swidth,
      sheight: r.sheight,
      smoothig: r.smoothing,
      globalAlpha:
        r.globalAlpha instanceof Function ? r.globalAlpha() : r.globalAlpha,
      scaleX: r.scaleX,
      scaleY: r.scaleY,
      angle: this.entity.physics.r,
    });

    this.t ++;
  }
}

export default {
  DrawComponent,
};
