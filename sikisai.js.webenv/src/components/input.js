import component from "../component.js";
const Component = component.Component;
import task from "../task.js";
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
}

export default {
  InputComponent,
};
