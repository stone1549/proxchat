import { Sender } from "./domain";
import jwt_decode, { JwtPayload } from "jwt-decode";
import { DateTime } from "luxon";

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

export enum Units {
  ft = "ft",
  mi = "mi",
  m = "m",
  km = "km",
}

export enum UnitSystems {
  metric = "metric",
  standard = "standard",
}

export const StandardUnits = [Units.ft, Units.mi];
export const MetricUnits = [Units.m, Units.km];

export const convertToMeters = (value: number, units: Units) => {
  switch (units) {
    case Units.m:
      return value;
    case Units.km:
      return value * 1000;
    case Units.ft:
      return value * 0.304;
    case Units.mi:
      return value * 1609.344;
    default:
      throw new Error("unhandled unit");
  }
};

export const roundTo = (value: number, places: number) =>
  Math.round(value * 10 ** places) / 10 ** places;

export const convertToDesiredUnits = (
  value: number,
  units: Units,
  desiredUnits: Units
) => {
  switch (units) {
    case Units.m:
      switch (desiredUnits) {
        case Units.ft:
          return value * 3.28084;
        case Units.km:
          return value / 1000;
        case Units.mi:
          return value / 1609.344;
        case Units.m:
          return value;
        default:
          throw new Error("unsupported unit type");
      }
    case Units.km:
      switch (desiredUnits) {
        case Units.ft:
          return value * 3280.8398950131;
        case Units.km:
          return value;
        case Units.mi:
          return value * 1.609344;
        case Units.m:
          return value * 1000;
        default:
          throw new Error("unsupported unit type");
      }
    case Units.ft:
      switch (desiredUnits) {
        case Units.ft:
          return value;
        case Units.km:
          return value * 0.0003048;
        case Units.mi:
          return value * 0.0001894;
        case Units.m:
          return value * 0.304;
        default:
          throw new Error("unsupported unit type");
      }
    case Units.mi:
      switch (desiredUnits) {
        case Units.ft:
          return value * 5280;
        case Units.km:
          return value * 1.609344;
        case Units.mi:
          return value;
        case Units.m:
          return value * 1609.344;
        default:
          throw new Error("unsupported unit type");
      }
    default:
      throw new Error("unhandled unit");
  }
};

export const dateTimeReviver: (key: string, value: any) => any = (
  key,
  value
) => {
  if (typeof value === "string") {
    const dt = DateTime.fromISO(value);
    if (dt.isValid) {
      return dt;
    }
  }
  return value;
};
