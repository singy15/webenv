import component from "../component.js";
const Component = component.Component;

class KillableComponent extends Component {
  constructor(entity) {
    super(entity);
    this.killed = false;
  }

  kill() {
    this.killed = true;
  }
}

export default {
  KillableComponent: KillableComponent,
};
