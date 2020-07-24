import * as Discord from 'discord.js';
import { Store } from './store';
import { GuildConfig, GuildQueue, Sound, CmdArgs } from './types';
import { commands } from './commands';
import * as dotenv from 'dotenv';
// import * as path from 'path';

dotenv.config();

const client = new Discord.Client();

const configStore = new Store<GuildConfig>({
  path: 'data/config.yaml',
  dataLanguage: 'yaml',
  writeOnSet: true,
  readImmediately: true,
});
const queueStore = new Store<GuildQueue>({
  path: 'data/queue.yaml',
  dataLanguage: 'yaml',
});
const soundStore = new Store<Sound>({
  path: 'sounds/sounds.yaml',
  dataLanguage: 'yaml',
  readImmediately: true,
  writeOnSet: true,
});

client.on('message', async (msg: Discord.Message) => {
  if (msg.author.bot) return;
  // don't respond to DMs
  if (!msg.guild) return;

  configStore.setIfUnset(msg.guild.id, { prefix: '~' });
  queueStore.setIfUnset(msg.guild.id, { sounds: [], playing: false });

  const config = configStore.get(msg.guild.id);
  if (!msg.content.startsWith(config.prefix)) return;

  const [cmd, ...args] = msg.content
    .slice(config.prefix.length)
    .split(' ')
    .map(v => v.toLowerCase());

  const commandClass = commands.find(v => v.cmd === cmd);
  if (!commandClass) return;

  return commandClass.executor({
    msg,
    cmd,
    args,
    client,
    configStore,
    queueStore,
    soundStore,
  });
});

client
  .on('warn', console.warn)
  .on('error', console.error)
  .on('debug', console.info)
  .on('disconnect', () => console.log('client disconnected'))
  .on('ready', () => console.log(`${client.user?.tag} ready`))
  .login(process.env.DISCORD_TOKEN);
