class FSM {
  constructor(context, initialState) {
    if (!initialState) throw new Error("initial state not set.");
    this.context = context;
    this.state = initialState;
  }

  run() {
    let nextState = this.state.run(this.context);
    if (nextState) {
      this.state = nextState;
    }
  }
}

class State {
  constructor(fn, name = "") {
    this.fn = fn;
    this.name = name;
  }

  run(context) {
    return this.fn(context);
  }
}

export default {
  FSM,
  State,
};
