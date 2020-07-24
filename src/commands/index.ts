import { Message } from 'discord.js';
import { CmdArgs } from '../types';
import { CommandAdd } from './add';
import { CommandHelp } from './help';
import { CommandLs } from './ls';
import { CommandMv } from './mv';
import { CommandPlay } from './play';
import { CommandPrefix } from './prefix';
import { CommandRm } from './rm';
import { CommandAbout } from './about';
import { CommandSkip } from './skip';
import { CommandStop } from './stop';

export interface Command {
  cmd: string;
  executor: (args: CmdArgs) => Promise<void | Message>;
  docs: {
    usage: string;
    description: string;
  };
}

export const commands: Command[] = [
  new CommandAbout(),
  new CommandAdd(),
  new CommandHelp(),
  new CommandLs(),
  new CommandMv(),
  new CommandPlay(),
  new CommandPrefix(),
  new CommandRm(),
  new CommandSkip(),
  new CommandStop(),
];
