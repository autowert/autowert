import type { Plugin as BotPlugin } from 'mineflayer';
import type { PCChunk as ChunkColumn } from 'prismarine-chunk';
import mc from 'minecraft-protocol';
import { Vec3 } from 'vec3';

export const botProxyPlugin: BotPlugin = (bot) => {
  const server = mc.createServer({
    "online-mode": false,

    version: '1.12.2',
    maxPlayers: 1,

    host: '127.0.0.1',
    port: 10001,

    motd: 'bot viewer'
  });

  bot.once('end', () => {
    for (const client of Object.values(server.clients)) {
      client.end('bot disconnected');
    }
    server.close();
  });

  server.on('login', async (client) => {
    if (Object.keys(server.clients).length > server.maxPlayers) {
      client.end('server is full');
      return;
    }

    const addr = client.socket.remoteAddress + ':' + client.socket.remotePort;
    console.log(`${client.username} connected (${addr})`);

    client.on('end', (reason) => {
      console.log(`${client.username} disconnected (${addr})`);
    });

    client.write('login', {
      // entityId: client.id,
      entityId: bot.entity.id,
      levelType: 'default',
      gameMode: bot.game.gameMode,
      dimension: bot.game.dimension,
      difficulty: bot.settings.difficulty,
      maxPlayers: server.maxPlayers,
      reducedDebugInfo: false,
    });

    client.write('position', {
      x: bot.entity.position.x,
      y: bot.entity.position.y,
      z: bot.entity.position.z,
      yaw: bot.entity.yaw,
      pitch: bot.entity.pitch,
      // onGround: true,
      flags: 0x00
    });

    await bot.waitForChunksToLoad();

    const chunks: [string, ChunkColumn][] = Object.entries(bot.world.async.columns);
    for (const [chunkPosKey, chunkColumn] of chunks) {
      const [chunkX, chunkZ] = chunkPosKey.split(',').map(Number);
      const chunkPos = new Vec3(chunkX * 16, 0, chunkZ * 16);

      const dump = chunkColumn.dump();

      client.write('map_chunk', {
        x: chunkX,
        z: chunkZ,
        groundUp: true,
        bitMap: chunkColumn.getMask(),
        chunkData: dump,
        blockEntities: Object.values(chunkColumn.blockEntities)
      });
    }

    client.botServerIsReady = true;
  });

  bot._client.on('packet', (data, meta) => {
    for (const client of Object.values(server.clients)) {
      if (!client.botServerIsReady) {
        continue;
      }

      client.write(meta.name, data);
    }
  });
};

declare module 'minecraft-protocol' {
  interface ServerClient {
    botServerIsReady?: boolean;
  }
}

declare module 'prismarine-chunk' {
  interface PCChunk {
    blockEntities: Record<string, any>;
  }
}
