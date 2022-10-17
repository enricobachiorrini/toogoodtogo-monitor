import "dotenv/config";
import { TGTGMonitor } from "./monitor";
import { DiscordNotifier } from "./notifications/discord";
import { TelegramNotifier } from "./notifications/telegram";

async function main() {
  if (!process.env.EMAIL) throw new Error("An email is required to continue.");

  let notifiers = [];
  if (process.env.DISCORD_WEBHOOK)
    notifiers.push(new DiscordNotifier(process.env.DISCORD_WEBHOOK));
  if (process.env.TELEGRAM_BOT_TOKEN && process.env.TELEGRAM_CHAT_ID)
    notifiers.push(
      new TelegramNotifier(
        process.env.TELEGRAM_BOT_TOKEN,
        process.env.TELEGRAM_CHAT_ID
      )
    );

  const monitor = new TGTGMonitor({
    email: process.env.EMAIL,
    notifiers: notifiers,
  });
  await monitor.start();
}

main();
