import { TimerComponent } from "../components/timer.js";

export function updateTimer(registry) {
  for (const entity of registry.query(false, TimerComponent)) {
    const timer = registry.getComponent(entity, TimerComponent);
    timer.t++;
    if (timer.onTrigger && timer.t >= timer.tmax) {
      timer.onTrigger(entity, registry);
      timer.onTrigger = null;
    }
  }
}
