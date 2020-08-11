import { Message } from 'discord.js';
import { CmdArgs } from '../types';
import { CommandAbout } from './about';
import { CommandAdd } from './add';
import { CommandHelp } from './help';
import { CommandJoke } from './joke';
import { CommandLs } from './ls';
import { CommandMv } from './mv';
import { CommandPlay } from './play';
import { CommandPrefix } from './prefix';
import { CommandRm } from './rm';
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
  new CommandJoke(),
  new CommandMv(),
  new CommandPlay(),
  new CommandPrefix(),
  new CommandRm(),
  new CommandSkip(),
  new CommandStop(),
];
