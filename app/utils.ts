import { Sender } from "./domain";
import jwt_decode, { JwtPayload } from "jwt-decode";

type AppToken = JwtPayload & {
  username: string | undefined;
};

export const getSenderFromToken = (token: string): Sender => {
  const decoded = jwt_decode<AppToken>(token);
  return {
    username: decoded.username || "",
    id: decoded.sub || "",
  };
};
