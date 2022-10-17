import { Item } from "../types/Bucket";
import { Status } from "../types/Status";

export abstract class Notifier {
  abstract notify(item: Item, status: Status): Promise<void>;
}
