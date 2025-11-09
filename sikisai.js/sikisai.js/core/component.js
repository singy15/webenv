class Component {
  static toRegistrationName(constructorName) {
    let base = constructorName.replace("Component", "");
    return base.charAt(0).toLowerCase() + base.slice(1);
  }

  static registrationName() {
    return Component.toRegistrationName(this.name);
  }

  static expect(entity, ...expectations) {
    expectations.forEach((e) => {
      if (!entity[e.registrationName()]) {
        throw new Error(`Component dependency error: ${e.registrationName()}`);
      }
    });
  }

  constructor(entity, ...dependencies) {
    this.entity = entity;

    if (!entity.components) {
      entity.components = [];
    }

    dependencies.forEach((d) => {
      if (!this.entity[d.registrationName()]) {
        throw new Error(`Component dependency error: ${d.registrationName()}`);
      }
    });

    let registrationName = this.constructor.registrationName();
    entity.components.push(this);
    entity[registrationName] = this;
  }

  registerAs(newName) {
    let oldName = this.constructor.registrationName();
    delete this.entity[oldName];
    this.entity[newName] = this;
  }

  run() {}
}

export default {
  Component: Component,
};
