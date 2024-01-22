import { type BaseCommand } from './BaseCommand';

import { kitCommand } from './kitCommand';
import { kitlistCommand } from './kitlistCommand';
import { blacklistCommand } from './blacklistCommand';
import { opKitCommand } from './opkitCommand';
import { voidtpCommand } from './voidtpCommand';
import { portalCommand } from './portalCommand';
import { echestCommand } from './echestCommand';
import { lyricsCommand } from './lyricsCommand';

export const commands: BaseCommand[] = [
  kitCommand,
  kitlistCommand,

  blacklistCommand,

  opKitCommand,
  voidtpCommand,

  portalCommand,
  echestCommand,
  lyricsCommand,
];
