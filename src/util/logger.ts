import { pino, transport, type TransportTargetOptions } from 'pino';
import type { PrettyOptions } from 'pino-pretty';

import { once } from 'node:events';
import { version, platform, arch, cwd } from 'node:process';
import { hostname, cpus } from 'node:os';

import { registerExitHandler } from './exitHandler';

import { additionalLogTargets } from '../../config';

const destination = transport({
  targets: [
    {
      target: 'pino/file',
      level: 'debug',
      options: {
        destination: 'latest.log',
        append: true,
        sync: true,
      },
    },
    {
      target: 'pino-pretty',
      level: process.env.PINO_LOG_LEVEL ?? 'info',
      options: <TransportTargetOptions['options'] & PrettyOptions>{
        sync: true,
        translateTime: 'SYS:HH:MM:ss.L',
      },
    },
    ...additionalLogTargets,
  ],
});

export const logger = pino({
  level: process.env.PINO_LOG_LEVEL || 'debug',
  formatters: {
    bindings() {
      return {};
    },
  },
}, destination);

const releaseExitHandler = registerExitHandler(() => once(destination, 'ready').then(() => { }));
destination.once('ready', releaseExitHandler);

export function pick<T extends object>(obj: T, ...keys: Array<keyof T>) {
  return Object.fromEntries(keys.map(key => [key, obj[key]]));
}

export function omit<T extends object>(obj: T, ...keys: Array<keyof T>) {
  return Object.fromEntries(
    Object.entries(obj).filter(([key]) => !(<string[]>keys).includes(key))
  );
}

logger.info({
  version,
  platform,
  arch,
  hostname: hostname(),
  cores: cpus().length,
  cwd: cwd(),
}, 'STARTUP');
