import "dotenv/config";
import { TGTGMonitor } from "./monitor";

async function main() {
  if (!process.env.EMAIL) throw new Error("An email is required to continue.");
  if (!process.env.WEBHOOK)
    throw new Error("A Discord webhook URL is required to continue.");

  const monitor = new TGTGMonitor({
    email: process.env.EMAIL,
    webhookURL: process.env.WEBHOOK,
  });
  await monitor.start();
}

main();
