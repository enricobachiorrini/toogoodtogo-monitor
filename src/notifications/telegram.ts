import Dinero from "dinero.js";
import moment from "moment";
import { Telegraf } from "telegraf";
import { Item } from "../types/Bucket";
import { Notifier } from "./notifier";
import { Status } from "../types/Status";

export class TelegramNotifier extends Notifier {
  bot: Telegraf;
  chatId: string;

  constructor(token: string, chatId: string) {
    super();
    this.bot = new Telegraf(token);
    this.chatId = chatId;
  }

  async notify(item: Item, status: Status) {
    const name = item.item.name ? item.item.name : "Magic Bag";
    const price = Dinero({
      amount: item.item.price_including_taxes.minor_units,
      currency: item.item.price_including_taxes.code,
    }).toFormat("$0,0.00");
    const stock = item.items_available.toString();
    const collection = item.pickup_interval
      ? moment(item.pickup_interval.start).calendar()
      : "N/A";

    this.bot.telegram.sendMessage(
      this.chatId,
      `[${status}] ${item.store.store_name}
${name}
${price}
Stock: ${stock}
Collection ${collection}`
    );
  }
}
