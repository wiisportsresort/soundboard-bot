import * as Discord from 'discord.js';
import { Store } from './store';

export interface GuildConfig {
  prefix: string;
}

export interface GuildQueue {
  sounds: Sound[];
  voiceChannel?: Discord.VoiceChannel;
  textChannel?: Discord.TextChannel;
  voiceConnection?: Discord.VoiceConnection;
  playing: boolean;
}

export interface Sound {
  uuid: string;
  mimeType: string;
  id: string;
}

export interface CmdArgs {
  msg: Discord.Message | Discord.PartialMessage;
  args: Array<string>;
  cmd: string;
  configStore: Store<GuildConfig>;
  queueStore: Store<GuildQueue>;
  soundStore: Store<Sound>;
  client: Discord.Client;
}
