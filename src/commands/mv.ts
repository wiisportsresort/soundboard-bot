import { Message } from 'discord.js';
import { Command } from '.';
import { CmdArgs } from '../types';

export class CommandMv implements Command {
  cmd = 'mv';
  docs = {
    usage: 'mv <oldId> <newId>',
    description: 'rename a sound!!!',
  };
  async executor(cmdArgs: CmdArgs): Promise<void | Message> {
    const { msg, args, soundStore } = cmdArgs;
    const [oldId, newId] = args;

    if (!oldId || !newId) {
      msg.channel.send(`yo i need 2 arguments`)
    }

    const sound = soundStore.get(oldId);
    if (!sound) return msg.channel.send("i couldn't find a sound with that id bro...");

    soundStore.set(newId, { id: newId, mimeType: sound.mimeType, uuid: sound.uuid });
    soundStore.once('write', () => soundStore.delete(oldId));

    return msg.channel.send(`the sound at ${oldId} was moved to ${newId}!`)
  }
}
