import moment from "moment";
import { Location, Message } from "./domain";
import Config from "react-native-config";

export class AuthError extends Error {
  public status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
    // 👇️ because we are extending a built-in class
    Object.setPrototypeOf(this, AuthError.prototype);
  }
}

export type TokenResp = {
  token: string;
  username: string;
};

export const auth = async (
  email: string,
  password: string
): Promise<TokenResp> => {
  const response = await fetch(`${Config.AUTH_SERVICE_URL}/session`, {
    method: "PUT",
    body: JSON.stringify({ email, password }),
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
  });

  if (response.ok) {
    return await response.json();
  } else {
    const err = await response.json();
    throw new AuthError(err.status, err.message);
  }
};

export class ChatError extends Error {
  public status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
    // 👇️ because we are extending a built-in class
    Object.setPrototypeOf(this, ChatError.prototype);
  }
}

export const pollChat = async (
  position: Location,
  radius: number,
  after: moment.Moment,
  token: string
): Promise<Array<Message>> => {
  const response = await fetch(
    `${Config.MESSAGE_SERVICE_URL}/messages?radius=${radius}&after=${
      after.valueOf() + 1
    }` +
      `&lat=${position.lat}&long=${position.long}&limit=${Config.MESSAGE_LIMIT}`,
    {
      method: "GET",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    }
  );

  if (response.ok) {
    const messages = await response.json();
    const results: Array<Message> = [];
    for (const message of messages) {
      results.push({
        id: message.id as string,
        content: message.content as string,
        sender: {
          id: message.sender.id as string,
          username: message.sender.username as string,
        },
        location: {
          long: message.location.long as number,
          lat: message.location.lat,
        },
        createdAt: moment(message.createdAt as moment.Moment),
        clientId: message.clientId,
      });
    }

    return results;
  } else if (response.status === 401) {
    const err = await response.json();
    throw new AuthError(err.status, err.message);
  } else if (response.status) {
    const err = await response.json();
    throw new ChatError(err.status, err.message);
  } else {
    throw new ChatError(0, "Uknown error");
  }
};

export class MessageError extends Error {
  public status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
    // 👇️ because we are extending a built-in class
    Object.setPrototypeOf(this, MessageError.prototype);
  }
}

export const send = async (
  message: string,
  location: Location,
  clientId: string,
  token: string
): Promise<Message> => {
  const response = await fetch(`${Config.MESSAGE_SERVICE_URL}/messages`, {
    method: "PUT",
    body: JSON.stringify({
      content: message,
      location: { lat: location.lat, long: location.long },
      clientId: clientId,
    }),
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  if (response.ok) {
    return (await response.json()) as Message;
  } else if (response.status === 401) {
    const err = await response.json();
    throw new AuthError(err.status, err.message);
  } else {
    const err = await response.json();
    throw new MessageError(err.status, err.message);
  }
};

export class SignupError extends Error {
  public status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
    // 👇️ because we are extending a built-in class
    Object.setPrototypeOf(this, SignupError.prototype);
  }
}

export const signup = async (
  email: string,
  username: string,
  password: string
): Promise<TokenResp> => {
  const response = await fetch(`${Config.AUTH_SERVICE_URL}/user`, {
    method: "PUT",
    body: JSON.stringify({ email, username, password }),
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
  });

  if (response.ok) {
    return (await response.json()) as TokenResp;
  } else {
    const err = await response.json();
    throw new SignupError(err.status, err.message);
  }
};
