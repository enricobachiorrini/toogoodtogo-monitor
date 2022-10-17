import "dotenv/config";
import yargs from "yargs";
import { TGTGMonitor } from "./monitor";
import { DiscordNotifier } from "./notifications/discord";
import { TelegramNotifier } from "./notifications/telegram";
import { logger } from "./utils/logger";

async function main() {
  const parser = yargs
    .options({
      email: {
        type: "string",
        alias: "e",
        describe: "The email to be monitored",
        demandOption: true,
      },
      delay: {
        type: "number",
        alias: "d",
        describe: "Monitor delay",
        default: 5000,
      },
      proxy: {
        type: "string",
        alias: "p",
        describe: "Proxies",
      },
      discord: {
        type: "array",
        describe: "Discord webhooks for notifications",
        default: [],
      },
      telegram: {
        type: "array",
        describe: "Telegram API key and chat id for notifications",
        default: [],
      },
    })
    .help("h")
    .alias("h", "help");

  const argv = await parser.argv;

  const discordNotifiers = argv.discord.map((discord) => {
    // check if webhook url is fine
    return new DiscordNotifier(discord);
  });
  const telegramNotifiers = argv.telegram.map((telegram) => {
    // check if format is fine
    return new TelegramNotifier(telegram, telegram);
  });
  const notifiers = [...discordNotifiers, ...telegramNotifiers];

  const monitor = new TGTGMonitor({
    email: argv.email,
    notifiers: notifiers,
    proxy: argv.proxy,
  });
  await monitor.start(argv.delay);
}

main();
