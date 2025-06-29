import component from "../component.js";
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
  constructor(entity, gadpt, region) {
    super(entity, killable.KillableComponent, physics.PhysicsComponent);
    this.gadpt = gadpt;
    let irepo = new imageRepository.ImageRepository(gadpt);
    this.image = irepo.fetch("gwgrp.png");
    this.region = region;
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
    g.draw(this.image, Math.round(p.x), Math.round(p.y), {
      sx: r.sx,
      sy: r.sy,
      swidth: r.swidth,
      sheight: r.sheight,
      smoothig: r.smoothing,
      globalAlpha:
        r.globalAlpha instanceof Function ? r.globalAlpha() : r.globalAlpha,
      scaleX: r.scaleX,
      scaleY: r.scaleY,
      angle: this.entity.physics.r,
    });
  }
}

export default {
  DrawComponent,
};
