import { Message } from 'discord.js';
import * as fse from 'fs-extra';
import * as http from 'http';
import * as https from 'https';
import * as mime from 'mime-types';
// @ts-ignore
import * as randomWords from 'random-words';
import { v4 as uuidv4 } from 'uuid';
import { Command } from '.';
import { Store } from '../store';
import { CmdArgs, Sound } from '../types';
import { resolvePath } from '../util';

const audioMimeTypes = [
  'audio/basic',
  'auido/L24',
  'audio/mid',
  'audio/mpeg',
  'audio/mp4',
  'audio/x-aiff',
  'audio/x-mpegurl',
  'audio/vnd.rn-realaudio',
  'audio/ogg',
  'audio/vorbis',
  'audio/vnd.wav',
];

export class CommandAdd implements Command {
  cmd = 'add';
  docs = {
    usage: 'add <url> [id]',
    description:
      'Add a sound file to the database, with either a randomly generated or a predefined id. ' +
      'To play the given sound, use the `play` command with the `id` from this command. The audio' +
      ' must be in mp3 format.',
  };
  private messages = {
    errNoUrl: 'yo i need a url to download the sound from',
    errInvalidUrl: 'invalid url bro...',
    infoDownloadingFile: 'downloading file...',
    err4xx5xx: 'sorry bro, i got a `%CODE%` from that url.',
    errNotAudio: "yo, that doesn't look like an audio file (content type `%TYPE%`)",
    errUnsupportedMimeType:
      "sorry bro, i don't understand the content type `%TYPE%`. try converting it to mp3 (`audio/mpeg`).",
    infoDone:
      'ok i got the file, the id is `%ID%` (uuid `%UUID%`); use the play commmand with the id to play this file.',
  };
  async executor(cmdArgs: CmdArgs): Promise<void | Message> {
    const { msg, args, soundStore } = cmdArgs;

    const url = args[0];
    if (!url) return msg.channel.send(this.messages.errNoUrl);
    const urlRegExp = /[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/;
    if (!urlRegExp.test(url)) return msg.channel.send(this.messages.errInvalidUrl);

    const id = args[1] ?? (randomWords(2) as string[]).join('-');

    msg.channel.send(this.messages.infoDownloadingFile);
    return msg.channel.send(await this.getSound(url, id, soundStore));
  }

  // download the file, determine mime type, save to sounds/uuid.ext
  getSound(url: string, id: string, soundStore: Store<Sound>): Promise<string> {
    return new Promise(resolve => {
      const requestModule = url.includes('https://') ? https : http;
      requestModule.get(url, response => {
        response.statusCode = response.statusCode ?? 200;
        if (response.statusCode >= 400 && response.statusCode <= 599) {
          // 4xx/5xx error here
          resolve(this.messages.err4xx5xx.replace('%CODE%', response.statusCode.toString()));
        }

        if (!audioMimeTypes.includes(response.headers['content-type'] as string)) {
          resolve(
            this.messages.errNotAudio.replace('%TYPE%', response.headers['content-type'] as string)
          );
          return;
        }

        if (response.headers['content-type'] !== 'audio/mpeg') {
          // TODO support m4a, aac, wav, ogg, etc.
          resolve(
            this.messages.errUnsupportedMimeType.replace(
              '%TYPE%',
              response.headers['content-type'] as string
            )
          );
          return;
        }

        const existing = fse
          .readdirSync(resolvePath('sounds'))
          // remove extension
          .map(v => /.+(?=\..+)/.exec(v.toString()))
          .map(v => v?.toString());
        let uuid = uuidv4();
        while (existing.includes(uuid)) uuid = uuidv4();

        const extension = mime.extension(response.headers['content-type'] as string);
        const filename = `${uuid}${extension ? '.' + extension : ''}`;
        const file = fse.createWriteStream(resolvePath(`sounds/${filename}`));

        response.pipe(file);

        soundStore.set(id, { uuid, mimeType: response.headers['content-type'] as string, id });

        resolve(this.messages.infoDone.replace('%ID', id).replace('%UUID%', uuid));
      });
    });
  }
}

/*
const file = fs.createWriteStream("file.jpg");
const request = http.get("http://i3.ytimg.com/vi/J---aiyznGQ/mqdefault.jpg", function(response) {
  response.pipe(file);
});
*/
