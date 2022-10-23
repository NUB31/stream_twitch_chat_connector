import { getSettings } from "./helpers/config";
import socket from "./helpers/socket";
import tmi from "tmi.js";

main();

async function main() {
  const settings = getSettings();

  const clientOptions: tmi.Options = {
    options: { debug: true },
    channels: [settings.TWITCH_CHANNEL_NAME],
  };

  try {
    if (
      settings.TWITCH_API_KEY.split("oauth:").length >= 2 &&
      settings.TWITCH_API_KEY.split("oauth:")[1] !== ""
    ) {
      clientOptions.identity = {
        username: settings.TWITCH_BOT_NAME,
        password: settings.TWITCH_API_KEY,
      };
    }
  } catch (err) {
    console.error(err);
  }

  let client: tmi.Client;
  client = new tmi.Client(clientOptions);

  try {
    await client.connect();
  } catch (err) {
    console.warn(
      "Could not connect. This is probably because of a problem with your API key. Restarting without authentication"
    );
    client = new tmi.Client({
      options: { debug: true },
      channels: [settings.TWITCH_CHANNEL_NAME],
    });
    client.connect();
  }

  client.on("message", async (channel, tags, message, self) => {
    // If message is from the bot, do not do anything
    if (self) return;

    // Remove whitespace from the message
    message = message.trim();

    // If message is not a command
    if (!(message[0] === "!")) return;

    // Get the command and the command content
    const command = message.toLowerCase().split(" ")[0];
    const content = message.substring(command.length + 1);

    // Do different things based on the command
    switch (command) {
      // Say yo if someone says hi to the bot
      case "!hello":
      case "!hi":
      case "!yo":
        try {
          return await client.say(channel, `@${tags.username}, Yo!`);
        } catch (err) {}
        break;

      // Check if user is mod, pauses the playlist after the current song
      case "!pause":
        if (
          tags.mod !== true &&
          channel.toLowerCase() !== `#${tags["display-name"]?.toLowerCase()}`
        ) {
          try {
            return await client.say(
              channel,
              `@${tags.username}, Only mods can use this command`
            );
          } catch (err) {}
        } else {
          return socket.emit("music/pause", "", async (res: any) => {
            if (!res.message) return;
            try {
              console.log(res.message);
              return await client.say(
                channel,
                `@${tags.username}, ${res.message}`
              );
            } catch (err) {}
          });
        }
        break;

      // Check if user is mod, resumes the playlist
      case "!resume":
        if (
          tags.mod !== true &&
          channel.toLowerCase() !== `#${tags["display-name"]?.toLowerCase()}`
        ) {
          try {
            return await client.say(
              channel,
              `@${tags.username}, Only mods can use this command`
            );
          } catch (err) {}
        } else {
          return socket.emit("music/resume", "", async (res: any) => {
            if (!res.message) return;
            try {
              console.log(res.message);
              return await client.say(
                channel,
                `@${tags.username}, ${res.message}`
              );
            } catch (err) {}
          });
        }
        break;

      // Kills current song
      case "!skip":
        if (
          tags.mod !== true &&
          channel.toLowerCase() !== `#${tags["display-name"]?.toLowerCase()}`
        ) {
          try {
            return await client.say(
              channel,
              `@${tags.username}, Only mods can use this command`
            );
          } catch (err) {}
        } else {
          return socket.emit("music/skip", "", async (res: any) => {
            if (!res.message) return;
            try {
              console.log(res.message);
              return await client.say(
                channel,
                `@${tags.username}, ${res.message}`
              );
            } catch (err) {}
          });
        }
        break;

      case "!add":
        if (
          tags.mod !== true &&
          channel.toLowerCase() !== `#${tags["display-name"]?.toLowerCase()}`
        ) {
          try {
            return await client.say(
              channel,
              `@${tags.username}, Only mods can use this command`
            );
          } catch (err) {}
        } else {
          // Add the video to the queue after the vid is downloaded (else there could be a problem with playing a non downloaded song)
          return socket.emit("music/add", content, async (res: any) => {
            if (!res.message) return;
            try {
              console.log(res.message);
              return await client.say(
                channel,
                `@${tags.username}, ${res.message}`
              );
            } catch (err) {}
          });
        }
        break;

      // Add a song to the queue
      case "!play":
        // Add the video to the queue after the vid is downloaded (else there could be a problem with playing a non downloaded song)
        return socket.emit("music/play", content, async (res: any) => {
          if (!res.message) return;
          try {
            console.log(res.message);
            await client.say(channel, `@${tags.username}, ${res.message}`);
          } catch (err) {}
        });

      // If command is not in switch, respond thereafter
      default:
        // return await client.say(
        try {
          return await client.say(
            channel,
            `@${tags.username}, ${command} is not a valid command`
          );
        } catch (err) {}
        break;
    }
  });
}
