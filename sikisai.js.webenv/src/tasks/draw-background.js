import task from "../task.js";
const Task = task.Task;
const TaskPriorities = task.TaskPriorities;
import imageRepository from "../image-repository.js";

class TaskDrawBackground extends Task {
  constructor(gadpt) {
    super(TaskPriorities.draw + 8000);
    this.gadpt = gadpt;
    let irepo = new imageRepository.ImageRepository(gadpt);
    this.image = irepo.fetch("gwgrp.png");
    this.t = 0;
  }

  run() {
    let g = this.gadpt;
    this.t++;
    for (let y = 0; y < 9; y++) {
      for (let x = 0; x < 9; x++) {
        g.draw(
          this.image,
          Math.round(x * 64),
          y * 64 + Math.round((this.t % 64) - 32),
          {
            sx: 512,
            sy: 0,
            swidth: 64,
            sheight: 64,
            smoothig: false,
            globalAlpha: 1.0,
          },
        );
      }
    }
  }
}

export default {
  TaskDrawBackground,
};
