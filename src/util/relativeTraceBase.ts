import { cwd } from 'process';

const _prepareStackTrace = Error.prepareStackTrace;
Error.prepareStackTrace = function () {
  // @ts-ignore this and arguments are correctly passed
  const result = _prepareStackTrace?.apply(this, arguments);
  return typeof result === 'string'
    ? result.replaceAll(cwd(), 'autowert-bot .')
    : result;
}
