import { MessageEmbed, MessageEmbedOptions } from 'discord.js';

export class Embed extends MessageEmbed {
  constructor(data?: MessageEmbed | MessageEmbedOptions) {
    super(data);
    this.setColor(0x1e90ff);
    this.setAuthor('your mom');
    this.setFooter(`epic bot | ${Date.now()}`);
  }
}
