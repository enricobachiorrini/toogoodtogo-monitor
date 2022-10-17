import Dinero from "dinero.js";
import { EmbedBuilder, WebhookClient } from "discord.js";
import moment from "moment";
import { Item } from "../types/Bucket";
import { Notifier } from "./notifier";
import { Status } from "../types/Status";
import { computeColor } from "../utils/computeColor";

export class DiscordNotifier extends Notifier {
  client: WebhookClient;

  constructor(webhookURL: string) {
    super();
    this.client = new WebhookClient({ url: webhookURL });
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

    const embed = new EmbedBuilder()
      .setAuthor({
        name: item.store.store_name,
        iconURL: item.store.logo_picture.current_url,
      })
      .setDescription(name)
      .setThumbnail(item.item.cover_picture.current_url)
      .setColor(computeColor(status))
      .addFields(
        { name: "Status", value: status, inline: true },
        {
          name: "Cost",
          value: price,
          inline: true,
        },
        { name: "Stock", value: stock, inline: true },
        { name: "Collection", value: collection, inline: true }
      );

    this.client.send({
      username: "TooGoodToGo",
      avatarURL:
        "https://i.ibb.co/Q93ZQXj/TGTG-Icon-White-Cirle-1988x1988px-RGB.png",
      embeds: [embed],
    });
  }
}
