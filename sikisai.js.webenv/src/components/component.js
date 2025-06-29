class Component {
  static registrationName(constructorName) {
    let base = constructorName.replace("Component", "");
    return base.charAt(0).toLowerCase() + base.slice(1);
  }

  constructor(entity, ...dependencies) {
    this.entity = entity;

    if (!entity.components) {
      entity.components = [];
    }

    dependencies.forEach((d) => {
      if (!this.entity[Component.registrationName(d.name)]) {
        throw new Error("Component dependency error");
      }
    });

    let registrationName = Component.registrationName(this.constructor.name);
    entity.components.push(this);
    entity[registrationName] = this;
  }

  run() {}
}

export default {
  Component: Component,
};
