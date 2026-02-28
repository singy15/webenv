import { PhysicsComponent } from "../components/physics.js";
import { SparkComponent } from "../components/spark.js";

function drawSpark(registry, gadpt) {
  for (let entity of registry.query(false, SparkComponent, PhysicsComponent)) {
    const ph = registry.getComponent(entity, PhysicsComponent);
    const size = 1;
    gadpt.rect(ph.p.x - size, ph.p.y - size, ph.p.x + size, ph.p.y + size, {
      fillStyle: `rgba(255,255,255,1.0)`,
      strokeStyle: `transparent`,
    });
  }
}

export { drawSpark };

