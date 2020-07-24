import { Message } from 'discord.js';
import { Command } from '.';
import { CmdArgs } from '../types';

export class CommandLs implements Command {
  cmd = 'ls';
  docs = {
    usage: 'ls [pattern]',
    description: 'list the things!!!',
  };
  async executor(cmdArgs: CmdArgs): Promise<void | Message> {
    const { msg, args, soundStore } = cmdArgs;
    const sounds = Array.from(soundStore.values);
    const searchPattern = args[0];
    if (searchPattern) {
      const filered = sounds
        .filter(v => v.id.includes(searchPattern))
        .map(sound => `{id: ${sound.id}, uuid: ${sound.uuid}}`);
      msg.channel.send('sounds: `' + filered.join(', ') + '`');
    } else {
      msg.channel.send(
        'sounds: `' + sounds.map(sound => `{id: ${sound.id}, uuid: ${sound.uuid}}`).join(', ') + '`'
      );
    }
  }
}
