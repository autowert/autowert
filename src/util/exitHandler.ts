const beforeExit = new Set<() => void | Promise<void>>();

/** @returns {() => void} function to release the exit handler */
export function registerExitHandler(callback: () => void | Promise<void>) {
  beforeExit.add(callback);
  return () => {
    beforeExit.delete(callback);
  };
}

let isExiting = false;
async function onExit(reason: string, signal?: NodeJS.Signals) {
  if(isExiting) {
    console.log(`Already exiting, ignoring ${reason}`);
    return;
  }

  console.log(`Gracefully exiting because of ${reason}`);
  isExiting = true;


  let hasError = false;

  console.log(`Calling ${beforeExit.size} beforeExit handlers...`);

  const values = [];
  for (const callback of beforeExit) {
    try {
      const value = callback();
      if (value instanceof Promise) {
        const handled = value.catch((err) => {
          console.error('error in async beforeExit handler', err);
          hasError = true;
        });

        values.push(handled);
      }
    } catch (err) {
      console.error('error in synchronous beforeExit handler', err);
      hasError = true;
    }
  }

  await Promise.all(values);

  process.exit(hasError ? 1 : 0);
}

process.on('SIGINT', onExit.bind(null, 'SIGINT'));
process.on('SIGTERM', onExit.bind(null, 'SIGTERM'));
process.on('SIGHUP', onExit.bind(null, 'SIGHUP'));
process.on('SIGBREAK', onExit.bind(null, 'SIGBREAK'));

export function exit() {
  onExit('exit() called');
}
