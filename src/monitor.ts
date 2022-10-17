import { TGTGClient } from "./client";
import { Item } from "./types/Bucket";
import { Notifier } from "./notifications/notifier";
import { Status } from "./types/Status";
import { logger } from "./utils/logger";
import { sleep } from "./utils/sleep";

export class TGTGMonitor {
  email: string;
  notifiers: Notifier[];
  proxy?: string;
  client: TGTGClient;
  favorites?: Item[];

  constructor({
    email,
    notifiers,
    proxy,
  }: {
    email: string;
    notifiers: Notifier[];
    proxy?: string;
  }) {
    this.email = email;
    this.notifiers = notifiers;
    this.proxy = proxy;
    this.client = new TGTGClient({ proxy });
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

  async start(delay: number) {
    try {
      logger.info(`Starting monitor with delay ${delay} ms.`);

      await this.client.login(this.email);

      while (true) {
        const favorites = await this.client.getFavorites();

        if (this.favorites) {
          const changes = this.computeChanges(this.favorites, favorites);

          for (const current of changes.added) {
            logger.info(`Added ${current.display_name}.`);
            this.notifiers.forEach((notifier) =>
              notifier.notify(current, Status.ADDED)
            );
          }

          for (const previous of changes.removed) {
            logger.info(`Removed ${previous.display_name}.`);
            this.notifiers.forEach((notifier) =>
              notifier.notify(previous, Status.REMOVED)
            );
          }

          for (const current of changes.unchanged) {
            const previous = this.favorites.find(
              (previous) => previous.item.item_id == current.item.item_id
            );

            if (!previous)
              throw new Error("Could not find matching previous item.");

            if (previous.items_available == 0 && current.items_available > 0) {
              logger.info(`Restocked ${current.display_name}.`);
              this.notifiers.forEach((notifier) =>
                notifier.notify(current, Status.RESTOCKED)
              );
            } else if (
              previous.items_available > 0 &&
              current.items_available == 0
            ) {
              logger.info(`Sold out ${current.display_name}.`);
              this.notifiers.forEach((notifier) =>
                notifier.notify(current, Status.SOLD_OUT)
              );
            }
          }
        }

        this.favorites = favorites;
        await sleep(delay);
      }
    } catch (error) {
      if (error instanceof Error) {
        logger.error(error.message);
      } else {
        logger.error("An unknown error occurred.");
      }
      await sleep(delay);
    }
  }
}
