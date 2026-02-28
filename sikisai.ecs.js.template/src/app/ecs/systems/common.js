export function clearScreen(gadpt) {
  gadpt.withoutCamera(() => {
    gadpt.rect(0.0, 0.0, gadpt.width(), gadpt.height(), {
      fillStyle: `rgba(0,0,0,1.0)`,
    });
  });
}

export function entityMonitorSystem(registry, gadpt) {
  const entityCount = registry.count(false);
  gadpt.withoutCamera(() => {
    gadpt.text(`ENTITY COUNT:${entityCount}`, gadpt.width(), 10, {
      font: `system 7px`,
      textAlign: `right`,
    });
  });
}
