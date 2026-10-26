import { TimerComponent } from "../components/timer.js";

export function updateTimer(registry) {
  for (const q of registry.query(false, TimerComponent)) {
    const timer = registry.getComponent(q.id, TimerComponent);
    timer.t++;
    if (timer.onTrigger && timer.t >= timer.tmax) {
      timer.onTrigger(q.id, registry);
      timer.onTrigger = null;
    }
  }
}
