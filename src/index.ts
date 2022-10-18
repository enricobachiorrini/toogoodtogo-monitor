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
        alias: "e",
        type: "string",
        describe: "The email to be monitored",
        demandOption: true,
      },
      delay: {
        alias: "d",
        type: "number",
        describe: "Monitor delay",
        default: 5000,
      },
      proxy: {
        alias: "p",
        type: "string",
        describe: "Proxies",
      },
      discord: {
        type: "array",
        describe: "Discord webhooks for notifications",
      },
      "telegram-token": {
        type: "string",
        describe: "Telegram API token",
        implies: ["telegram-chat"],
      },
      "telegram-chat": {
        type: "array",
        describe: "Telegram chat ID(s)",
        implies: ["telegram-token"],
      },
    })
    .help("h")
    .alias("h", "help");

  const argv = await parser.argv;

  const discordNotifiers = argv.discord
    ? argv.discord
        .filter((webhook): webhook is string => typeof webhook == "string")
        .map((webhook) => new DiscordNotifier(webhook))
    : [];

  const telegramNotifiers = argv.telegramChat
    ? argv.telegramChat.map(
        (chatId) => new TelegramNotifier(argv.telegramToken!, chatId)
      )
    : [];

  const notifiers = [...discordNotifiers, ...telegramNotifiers];

  const monitor = new TGTGMonitor({
    email: argv.email,
    notifiers: notifiers,
    proxy: argv.proxy,
  });
  await monitor.start(argv.delay);
}

main();
