import { logger } from './logger';

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
  if (isExiting) {
    logger.warn({ isExiting, currentReason: reason }, 'Exit function called while already exiting, ignoring');
    return;
  }

  logger.info({ reason }, 'Gracefully exiting');
  isExiting = true;

  let hasError = false;

  logger.debug({ handlerCount: beforeExit.size }, 'Inovking beforeExit handlers');

  const values = [];
  for (const callback of beforeExit) {
    try {
      const value = callback();
      if (value instanceof Promise) {
        const handled = value.catch((err) => {
          logger.error(err, 'Error in async beforeExit handler');
          hasError = true;
        });

        values.push(handled);
      }
    } catch (err) {
      logger.error(err, 'Error in synchronous beforeExit handler');
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
