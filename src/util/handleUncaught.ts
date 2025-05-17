process.on('uncaughtException', (err, origin) => {
  console.info('=== Unhandled Exception '.padEnd(process.stderr.columns - 2 || 40, '='));

  console.error('caught unhandled exception:', err);
  console.error('error origin:', origin);

  console.info('=== End Unhandled Exception '.padEnd(process.stderr.columns - 2 || 40, '='));
});

export { };
