import { Status } from "../types/Status";

export function computeColor(status: Status) {
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
