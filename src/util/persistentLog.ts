import { createWriteStream } from 'fs';
import { format } from 'util';
const writeStream = createWriteStream('latest.log', { flags: 'a' });

const _console: any = global.console;
global.console = <typeof _console>Object.fromEntries(
  Object.keys(_console)
    .map<any>((key) => [
      key,
      typeof _console[key] === 'function'
        ? (...args: any[]) => {
          _console[key as keyof typeof _console](...args);
          writeStream.write(format(key, ...args) + '\n');
        }
        : _console[key]
    ])
)
