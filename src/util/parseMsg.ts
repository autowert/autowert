export const parseMsg = (message: string) => {
  const [_cmd, ...parts] = message.split(' ');
  const cmd = _cmd.toLowerCase();

  const args: string[] = [];
  const flags: Record<string, string | boolean | number> = {};
  for (const part of parts) {
    if (part.startsWith('--')) {
      const str = part.slice(2);

      const [match, _key, _val] = str.match(/^(.+?)(?:=(.*))?$/)!;
      const key = _key.toLowerCase();

      let val: boolean | number | string;
      if (_val === undefined) val = true;
      else if (_val === '') val = '';
      else if (_val.toLowerCase() === 'true') val = true;
      else if (_val.toLowerCase() === 'false') val = false;
      else if (/^-?[\d\.]+$/.test(_val)) val = Number(_val);
      else val = _val;

      flags[key] = val;
    } else {
      args.push(part);
    }
  }

  return { cmd, args, flags }
}

export type ParsedMsg = ReturnType<typeof parseMsg>;
