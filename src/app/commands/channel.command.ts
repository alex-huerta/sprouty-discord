import { Command } from '../models/responder';
import { Client, GuildChannel, TextChannel } from 'discord.js';
import { ChannelCommandParsed, ChannelCommandParser } from '../parsers/channel-command.parser';
import { ChannelCommandValidator } from '../validators/channel-command.validator';
import { from, NEVER, Observable } from 'rxjs';
import { Config } from '../../config';
import { flatMap, tap } from 'rxjs/operators';
import { CommandError } from '../models/error';

class ChannelCommand implements Command {
  public readonly command: string = 'channel';
  public readonly parser: ChannelCommandParser = new ChannelCommandParser();
  public readonly validator: ChannelCommandValidator = new ChannelCommandValidator();

  public constructor(private client: Client) {}

  public respond({ guild, sourceChannel, channelName }: ChannelCommandParsed): Observable<GuildChannel> {
    return from(guild.createChannel(channelName, 'text')).pipe(
        flatMap((channel: TextChannel) => {
          const categoryChannelId = guild.channels.find(({ name }: GuildChannel) => name === Config.categoryChannel).id;
          return from(channel.setParent(categoryChannelId));
        }),
        tap((channel: TextChannel) => {
          return from(sourceChannel.send(`Channel ${channel} created!`));
        }),
    );
  }

  public respondError({ message, source }: CommandError): Observable<never> {
    return from(source._message.reply(`Error yo ${ message }`)).pipe(
        flatMap(() => NEVER),
    );
  }
}

export { ChannelCommand };
