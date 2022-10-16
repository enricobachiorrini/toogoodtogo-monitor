export enum State {
  WAIT = "WAIT",
  TERMS = "TERMS",
}

export interface Response {
  state: State;
  polling_id: string;
}
