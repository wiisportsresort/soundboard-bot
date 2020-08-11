import axios from 'axios';
import * as cheerio from 'cheerio';
import { Message } from 'discord.js';
import { Command } from '.';
import { CmdArgs } from '../types';

export class CommandJoke implements Command {
  cmd = 'joke';
  docs = {
    usage: 'joke',
    description: 'Get a joke from Codepen',
  };
  getJoke() {
    return new Promise<string>(async (resolve, reject) => {
      const res = await axios('https://codepen.io/pen/').catch(err => reject(err));

      if (!res) return reject();
      if (res.status !== 200) return reject();

      resolve(cheerio.load(res.data)('#loading-text').html()?.replace('\n', ''));
    });
  }
  async executor({ msg }: CmdArgs): Promise<void | Message> {
    try {
      const joke = await this.getJoke();
      return msg.channel.send(joke);
    } catch (err) {
      return msg.channel.send(`Error getting joke, error message: \n\`\`\`\n${err}\n\`\`\``);
    }
  }
}
