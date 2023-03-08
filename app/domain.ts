import moment from "moment";

export type Sender = {
  id: string;
  username: string;
};

export type Location = {
  lat: number;
  long: number;
};

export type Message = {
  id: string;
  content: string;
  sender: Sender;
  location: Location;
  createdAt: moment.Moment;
};

export type PendingMessage = {
  tempId: string;
  content: string;
  sender: Sender;
  location: Location;
  retries: number;
};

export const isMessage = (
  value: Message | PendingMessage
): value is Message => {
  return value.hasOwnProperty("id");
};

export const hashPendingMessage = (pending: PendingMessage): string => {
  return (
    `${pending.content}${pending.location.long}${pending.location.lat}` +
    `${pending.sender.id}${pending.sender.username}`
  );
};
