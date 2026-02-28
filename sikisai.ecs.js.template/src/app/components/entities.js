import component from "./component.js";
const Component = component.Component;
import task from "../tasks/task.js";
const Task = task.Task;
const TaskPriorities = task.TaskPriorities;
import vector from "../vector.js";
const v$ = vector.Vector.$;
import killable from "./killable.js";
import list from "../list.js";

let entities = new list.List();
let groupedEntities = {};

class EntitiesComponent extends Component {
  constructor(entity) {
    super(entity, killable.KillableComponent);

    this.group = "";
    this.node = null;
    this.groupNode = null;

    let task = new Task(TaskPriorities.update, (task) => {
      if (entity.killable.killed) {
        task.kill();
        return;
      }
      this.run();
    });

    task.onKill = () => {
      // XXX: list's immediate node removal can be used here.
      entities.removeNode(this.node);
      // entities.each((e, i, l, n) => {
      //   if (e === this.entity) {
      //     l.removeNode(i.currNode());
      //     return;
      //   }
      // });

      if (this.group !== "") {
        groupedEntities[this.group].removeNode(this.groupNode);
        // groupedEntities[this.group].each((e, i, l, n) => {
        //   if (e === this.entity) {
        //     l.removeNode(i.currNode());
        //     return;
        //   }
        // });
      }

      // XXX: this causes collision bug, why?
      // collisions.removeNode(this.node);
    };

    this.node = entities.append(this.entity);
  }

  run() {}

  setGroup(group) {
    if (this.group !== "") {
      groupedEntities[this.group].removeNode(this.groupNode);
      groupedEntities[this.group].each((e, i, l, n) => {
        if (e === this.entity) {
          l.removeNode(i.currNode());
          return;
        }
      });
    }

    this.group = group;

    if (!groupedEntities[group]) groupedEntities[group] = new list.List();
    this.groupNode = groupedEntities[group].append(this.entity);
  }

  getGroup() {
    return this.group;
  }

  static getAll() {
    let ls = [];
    entities.each((e, i, l, n) => {
      ls.push(e);
    });
    return ls;
  }

  static getAllGroup(group) {
    let ls = [];
    if (!groupedEntities[group]) return ls;
    groupedEntities[group].each((e, i, l, n) => {
      ls.push(e);
    });
    return ls;
  }

  static count() {
    return entities.count();
  }

  static countGroup(group) {
    if (!groupedEntities[group]) return 0;
    return groupedEntities[group].count();
  }
}

export default {
  EntitiesComponent,
};
