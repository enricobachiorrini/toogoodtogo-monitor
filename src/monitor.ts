import { EmbedBuilder, WebhookClient } from "discord.js";
import { TGTGClient } from "./client";
import { Item } from "./types/Bucket";
import { Status } from "./types/Status";
import { logger } from "./utils/logger";
import { sleep } from "./utils/sleep";
import Dinero from "dinero.js";
import moment from "moment";

export class TGTGMonitor {
  email: string;
  client: TGTGClient;
  favorites?: Item[];
  webhookClient: WebhookClient;

  constructor({ email, webhookURL }: { email: string; webhookURL: string }) {
    this.email = email;
    this.client = new TGTGClient();
    this.webhookClient = new WebhookClient({ url: webhookURL });
  }

  private computeChanges(previous: Item[], current: Item[]) {
    const added = current.filter(
      (curr) => !previous.some((prev) => prev.item.item_id == curr.item.item_id)
    );
    const removed = previous.filter(
      (prev) => !current.some((curr) => curr.item.item_id == prev.item.item_id)
    );
    const unchanged = current.filter((curr) =>
      previous.some((prev) => prev.item.item_id == curr.item.item_id)
    );
    return {
      added,
      removed,
      unchanged,
    };
  }

  async start(delay: number = 5000) {
    logger.info(`Starting monitor with delay ${delay} ms.`);

    await this.client.login(this.email);

    while (true) {
      const favorites = await this.client.getFavorites();

      if (this.favorites) {
        const changes = this.computeChanges(this.favorites, favorites);

        for (const current of changes.added) {
          logger.info(`Added ${current.display_name}.`);
          this.notify(current, Status.ADDED);
        }

        for (const previous of changes.removed) {
          logger.info(`Removed ${previous.display_name}.`);
          this.notify(previous, Status.REMOVED);
        }

        for (const current of changes.unchanged) {
          const previous = this.favorites.find(
            (previous) => previous.item.item_id == current.item.item_id
          );

          if (!previous)
            throw new Error("Could not find matching previous item.");

          if (previous.items_available == 0 && current.items_available > 0) {
            logger.info(`Restocked ${current.display_name}.`);
            this.notify(current, Status.RESTOCKED);
          } else if (
            previous.items_available > 0 &&
            current.items_available == 0
          ) {
            logger.info(`Sold out ${current.display_name}.`);
            this.notify(current, Status.SOLD_OUT);
          }
        }
      }

      this.favorites = favorites;
      await sleep(delay);
    }
  }

  computeColor(status: Status) {
    switch (status) {
      case Status.ADDED: {
        return "Blue";
      }
      case Status.REMOVED: {
        return "Orange";
      }
      case Status.SOLD_OUT: {
        return "Red";
      }
      case Status.RESTOCKED: {
        return "Green";
      }
    }
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
      .setColor(this.computeColor(status))
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

    this.webhookClient.send({
      embeds: [embed],
    });
  }
}
