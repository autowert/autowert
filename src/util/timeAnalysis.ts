/**
 * Starts a time analysis session for profiling code execution durations within a labeled group.
 * Returns a `trace` function that can be called with a label to mark the start of a new timing segment.
 * When called, `trace` will log the elapsed time since the previous label
 * Call `trace.stop()` to end the analysis and log the total elapsed time for the group.
 * @param groupLabel - A string label to identify the timing group in log output.
 * @returns A `trace` function. Call `trace(label)` to mark a segment, and `trace.stop()` to finish.
 * @example
 * ```typescript
 * const trace = startTimeAnalysis('MyProcess');
 * // ... some code
 * trace('Step 1');
 * // ... some more code
 * trace('Step 2');
 * // ... final code
 * trace.stop();
 * ```
 */
export function startTimeAnalysis(groupLabel: string) {
  const format = (label: string) => `[${groupLabel}] ${label.padEnd(20, ' ')}`;
  const startTime = performance.now();

  let currentLabel: string | undefined;
  let currentStartTime: number;
  function trace(label?: string) {
    if(currentLabel) {
      const endTime = performance.now();
      const dt = endTime - currentStartTime;
  
      console.log(format(currentLabel) + ':%c', 'font-weight: bold', dt.toFixed(2).padStart(10, ' ') + 'ms');
    }

    if(label) {
      currentLabel = label;
      currentStartTime = performance.now();
    } else {
      currentLabel = undefined;
    }
  };

  trace.stop = function stop() {
    trace();

    const endTime = performance.now();
    const dt = endTime - startTime;

    console.log(`[${groupLabel}] Time analysis took ${dt.toFixed(2)}ms!`);
  }

  return trace;
}
