import { Message } from 'discord.js';
import { Command, commands } from '.';
import { Embed } from '../embed';
import { CmdArgs } from '../types';

export class CommandHelp implements Command {
  cmd = 'help';
  docs = {
    usage: 'help',
    description: 'Show this message.',
  };
  async executor(cmdArgs: CmdArgs): Promise<void | Message> {
    const { msg, configStore } = cmdArgs;
    const config = configStore.get(msg.guild?.id as string);
    const embed = new Embed().setTitle('help!!!!!!1');
    for (const command of commands) {
      embed.addFields({
        name: `\`${config.prefix}${command.cmd}\``,
        value: `\`${command.docs.usage}\`\n${command.docs.description}`,
        inline: false,
      });
    }
    try {
      const dm = await msg.author?.createDM();
      if (!dm) throw new Error('RuntimeError: DM channel was null');
      dm?.send(embed);
      msg.channel.send('yo i dm\'d you the help message gg bro');
    } catch (err) {
      msg.channel.send('lmao i couldnt send the dm\n```\n' + err + '\n```');
    }
  }
}
