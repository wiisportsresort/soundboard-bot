import { Message } from 'discord.js';
import * as fse from 'fs-extra';
import * as mime from 'mime-types';
import { Command } from '.';
import { CmdArgs } from '../types';
import { resolvePath } from '../util';

export class CommandRm implements Command {
  cmd = 'rm';
  docs = {
    usage: 'rm <id>',
    description: 'remove a sound!!!',
  };
  async executor(cmdArgs: CmdArgs): Promise<void | Message> {
    const { msg, args, soundStore } = cmdArgs;
    const id = args[0];

    if (!id) return msg.channel.send('yo i need something to delete')

    const sound = soundStore.get(id);
    if (!sound) return msg.channel.send("i couldn't find a sound with that id bro...");

    const extension = mime.extension(sound.mimeType);
    const filename = resolvePath('sounds/' + `${sound.uuid}${extension ? '.' + extension : ''}`);

    fse.removeSync(filename);

    soundStore.delete(id);

    return msg.channel.send(`the sound ${id} was deleted, goodbey!`)

  }
}
