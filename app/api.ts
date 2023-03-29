import Config from "react-native-config";
import { Gender } from "./domain";

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

export const refreshToken = async (token: string): Promise<TokenResp> => {
  const response = await fetch(`${Config.AUTH_SERVICE_URL}/session`, {
    method: "GET",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  if (response.ok) {
    return await response.json();
  } else {
    const err = await response.json();
    throw new AuthError(err.status, err.message);
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
  password: string,
  gender: keyof typeof Gender,
  age: number,
  topics: Set<string>
): Promise<TokenResp> => {
  console.log(
    JSON.stringify({
      email,
      username,
      password,
      profile: { gender, age, topics: [...topics] },
    })
  );
  const response = await fetch(`${Config.AUTH_SERVICE_URL}/user`, {
    method: "PUT",
    body: JSON.stringify({
      email,
      username,
      password,
      profile: { gender, age, topics: [...topics] },
    }),
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
