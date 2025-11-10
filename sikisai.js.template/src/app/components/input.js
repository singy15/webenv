import component from "./component.js";
const Component = component.Component;
import task from "../tasks/task.js";
const Task = task.Task;
const TaskPriorities = task.TaskPriorities;
import vector from "../vector.js";
const v$ = vector.Vector.$;
import killable from "./killable.js";

class InputComponent extends Component {
  constructor(entity, iadpt) {
    super(entity);
    this.iadpt = iadpt;
  }

  keydown(code) {
    return this.iadpt.keydown(code);
  }

  keypush(code) {
    return this.iadpt.keypush(code);
  }

  mousepush(code) {
    return this.iadpt.mousepush(code);
  }
  
  mousedown(code) {
    return this.iadpt.mousedown(code);
  }

  mouseX() {
    return this.iadpt.mouseX();
  }

  mouseY() {
    return this.iadpt.mouseY();
  }
}

export default {
  InputComponent,
};
