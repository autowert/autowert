import { logger } from './logger';

process.on('uncaughtException', (err, origin) => {
  console.info('=== Unhandled Exception '.padEnd(process.stderr.columns - 2 || 40, '='));

  logger.fatal({ err, origin }, 'Caught uncaught Exception');

  console.info('=== End Unhandled Exception '.padEnd(process.stderr.columns - 2 || 40, '='));
});

export { };
