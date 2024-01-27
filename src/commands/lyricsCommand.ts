import { TPCommand } from './TPCommand';

import axios from 'axios';
import { TaskGetWritableBook } from '../tasks/items/taskGetWritableBook';
import { TaskCustomFunction } from '../tasks/taskCustomFunction';

const MAX_CHARS = 19;
const MAX_LINES = 14;

export const lyricsCommand = new TPCommand({
  name: 'lyrics',
  description: 'Teleports to you with a lyrics book.',
  usage: '<title> [from <author>]',

  prefixOverwrite: /.*/,

  adminOnly: true,

  execute: async ({ args }) => {
    if (!args.length) {
      return {
        success: false,
        chatResponse: 'Usage: lyrics <title> [from <author>]',
      };
    }

    const [title, artist] = args.join(' ').split(/from/i);

    const apiUrl = `https://lyrist.vercel.app/api/${encodeURIComponent(title)}${artist ? '/' + encodeURIComponent(artist) : ''}`;
    const lyricsPromise = axios.get(apiUrl); // request is awaited when they accepted the tp request

    return {
      beforeTPTask: new TaskGetWritableBook(),
      TPYTask: new TaskCustomFunction(async (bot) => {
        const { data: song } = await lyricsPromise;
        if (!song || !song.lyrics) throw new Error('no lyrics found');

        const text: string = song.lyrics;

        const headlines: string[] = text.match(/\[.+?\]/g) || [];
        const parts = text.split(/\[.+?\]/);

        if (parts[0]) headlines.unshift('');
        else parts.shift();

        const pages: string[] = [];
        for (const [index, part] of parts.entries()) {
          const headline = headlines[index];

          const lines: string[] = [
            headline,
            ...part.split('\n').filter(Boolean),
          ];

          let totalLines = 0;
          let page = [];

          for (const line of lines) {
            const lineCount = Math.ceil(line.length / MAX_CHARS);
            totalLines += lineCount;

            if (totalLines > MAX_LINES) {
              pages.push(page.join('\n'));

              totalLines = lineCount;
              page = [];
            }

            page.push(line);
          }
          if (page.length) pages.push(page.join('\n'));
        }

        const shouldSign = pages.length <= 15;
        const title = `${song.title} (${song.artist})`.slice(0, 32);
        if (!shouldSign) pages.unshift(title);

        await bot.useWritableBook(
          pages.map((page) => page.replace(/[^ -~\näöü]/gi, '*')),
          shouldSign ? title.replace(/[^ -~\näöü]/gi, '*') || 'lyrics' : null,
          { drop: true },
        );
      })
    }
  },
});
