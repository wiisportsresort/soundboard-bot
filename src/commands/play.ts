import { Message, TextChannel, VoiceChannel, VoiceState } from 'discord.js';
import * as fse from 'fs-extra';
import * as mime from 'mime-types';
import { Command } from '.';
import { CmdArgs } from '../types';
import { resolvePath } from '../util';

export class CommandPlay implements Command {
  cmd = 'play';
  docs = {
    usage: 'play <id>',
    description: 'Play a file, referenced by its ID.',
  };
  private messages = {
    errNotInVoiceChannel: "you aren't in voice channel bro...",
    errNoSoundId: 'yo i need something to play',
    errCannotConnect: "i can't connect to that channel bro...",
    errCannotSpeak: "i can't speak in that channel bro...",
    errSoundNotFound: "i couldn't find a sound with that id bro...",
    infoNowPlaying: 'i be playing %ID% now',
    infoAddedToQueue: 'added %ID% to queue position %INDEX%',
  };
  async executor(cmdArgs: CmdArgs): Promise<void | Message> {
    const { msg, client, args, soundStore, queueStore } = cmdArgs;
    const voice = msg.member?.voice;
    const id = args[0];

    if (!voice?.channel) return msg.channel.send(this.messages.errNotInVoiceChannel);
    if (!id) return msg.channel.send(this.messages.errNoSoundId);

    const permissions = voice.channel.permissionsFor(client.user?.id as string);
    if (!permissions?.has('CONNECT')) return msg.channel.send(this.messages.errCannotConnect);
    if (!permissions?.has('SPEAK')) return msg.channel.send(this.messages.errCannotSpeak);

    // retrieve sound filename and mime type
    const sound = soundStore.get(id);
    if (!sound) return msg.channel.send(this.messages.errSoundNotFound);

    const queue = queueStore.get(msg.guild?.id as string);
    queue.sounds.push(sound);
    queue.textChannel = msg.channel as TextChannel;
    queueStore.set(msg.guild?.id as string, queue);
    if (!queue.playing) this.playSound(cmdArgs);
    else
      msg.channel.send(
        this.messages.infoAddedToQueue
          .replace('%ID%', sound.id)
          .replace('%INDEX%', (queue.sounds.length + 1).toString())
      );
  }

  async playSound(cmdArgs: CmdArgs) {
    const { msg, queueStore } = cmdArgs;

    const voice = msg.member?.voice as VoiceState;
    const voiceChannel = voice.channel as VoiceChannel;

    const queue = queueStore.get(msg.guild?.id as string);

    const sound = queue.sounds.shift();

    if (!sound) {
      // no more sounds
      queue.voiceConnection?.disconnect();
      queue.playing = false;
      queueStore.set(msg.guild?.id as string, queue);
      return;
    }

    const extension = mime.extension(sound.mimeType);
    const filename = resolvePath('sounds/' + `${sound.uuid}${extension ? '.' + extension : ''}`);
    const stream = fse.createReadStream(filename);

    if (!queue.playing) {
      queue.voiceChannel = voiceChannel;
      await voice.setSelfDeaf(true);
      queue.voiceConnection = await voiceChannel.join();
      queue.playing = true;
      queueStore.set(msg.guild?.id as string, queue);
    }

    queue.textChannel?.send(this.messages.infoNowPlaying.replace('%ID%', sound.id));
    queue.voiceConnection?.play(stream).on('finish', (info: any) => {
      console.info(`sound ${sound.id} ended with info ${info}`);
      this.playSound(cmdArgs);
    });
  }
}

/*

async function handleVideo({video, msg, voiceChannel, playlist = false}) {
  const queue = queueStore.get(msg.guild.id);
  console.log(`Playing video ${video.title}.`);
  const song = {
    id: video.id,
    title: Discord.Util.escapeMarkdown(video.title),
    url: `https://www.youtube.com/watch?v=${video.id}`
  };



    queue.songs.push(song);


    try {
      let connection = await voiceChannel.join();
      queue.connection = connection;
      msg.guild.members.get(client.user.id).setDeaf(true);
      play(msg.guild, queueConstruct.songs[0]);
    } catch (error) {
      // Clear queue map and send error
      console.error(error);
      queueStore.delete(msg.guild.id);
      return msg.channel.send(bot.cannotConnectF(error));
    }


  // If a queue exists already
  else {
    // Add the song
    queue.sounds.push(song);
    console.log(`sound length: ${queue.sounds.length}`);

    // Do not send text if there is a playlist
    if (!playlist) return msg.channel.send('a');
    else return;
  }

  return;
}

async function play(guild, sound) {
  const queue = queueStore.get(guild.id);

  // After no more songs, disconnect and delete guild queue
  if (!sound) {
    queue.voiceChannel.leave();
    queueStore.delete(guild.id);
    return;
  }

  console.log(`Queue length: ${queue.sounds.length}`);

  const dispatcher = queue.connection
    .play()
    .on('end', reason => {
      if (reason === 'Stream is not generating quickly enough.') console.log('Song ended.');
      else console.log(reason);
      queue.sounds.shift();
      play(guild, queue.sounds[0]);
    })
    .on('error', (err: any) => console.error)
    .on('disconnect', () => console.log(bot.voiceDisconnect));

  queue.textChannel.send(bot.playF(sound.title));
}

*/
