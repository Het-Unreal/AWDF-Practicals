import { lazy } from 'react';

/**
 * Wraps dynamic import with a configurable minimum delay to prevent
 * jarring UI flickering on fast connections during chunk loading.
 */
export function lazyWithDelay(importFunc, delayMs = 300) {
  return lazy(() =>
    Promise.all([
      importFunc(),
      new Promise((resolve) => setTimeout(resolve, delayMs)),
    ]).then(([moduleExports]) => moduleExports)
  );
}
