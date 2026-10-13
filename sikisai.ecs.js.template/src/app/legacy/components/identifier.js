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

let identifierMapping = {};

class IdentifierComponent extends Component {
  constructor(entity, identifier = "", name = "") {
    super(entity, killable.KillableComponent);
    this.identifier = identifier;
    this.name = name;

    this.setId(identifier);

    let task = new Task(TaskPriorities.update, (task) => {
      if (entity.killable.killed) {
        task.kill();
        return;
      }
      this.run();
    });

    task.onKill = () => {
      if (this.identifier !== "") {
        delete identifierMapping[this.identifier];
      }
    };
  }

  run() {}

  setId(identifier) {
    this.identifier = identifier;
    if (this.identifier !== "") {
      identifierMapping[this.identifier] = this.entity;
    }
  }

  getId() {
    return this.identifier;
  }

  setName(name) {
    this.name = name;
  }

  getName() {
    return this.name;
  }

  static getById(identifier) {
    return identifierMapping[identifier];
  }
}

export default {
  IdentifierComponent,
};
