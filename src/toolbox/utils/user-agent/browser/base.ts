import {contains} from "../../string/contains";
import {USER_AGENT_STRING} from "../string";

type Offset = [string, number];

abstract class Browser {
  protected static name_: string;
  protected static uaidsWithOffsets_: [string, Offset[]][];

  public static getAsCSSModifier() {
    return this.name_.toLowerCase().replace(/\s/, '-');
  }

  protected static getUaids_(): string[] {
    return this.uaidsWithOffsets_.map(([uaid, x]: [string, Offset[]]) => uaid);
  }

  public static isCurrentBrowser(): boolean {
    return this.getUaids_().some(
      (uaid: string) => contains(USER_AGENT_STRING, uaid));
  }

  public static getVersion(): number {
    const [uaid, offsets]: [string, Offset[]] =
      this.uaidsWithOffsets_
        .find(
          ([uaid, x]: [string, Offset[]]) => contains(USER_AGENT_STRING, uaid));

    const offset: Offset =
      offsets
        .find(
          (offset: Offset) => contains(USER_AGENT_STRING, <string>offset[0]));

    const range: [number, number] =
      [USER_AGENT_STRING.indexOf(<string>offset[0]), <number>offset[1]];

    const rawVersion = USER_AGENT_STRING.substring(range[0], range[1]);

    const trimmedVersion: string =
      rawVersion.split(';')[0].split(' ')[0].split(')')[0];
    return parseFloat(trimmedVersion);
  }

  public static getMajorVersion(): number {
    return Math.floor(this.getVersion());
  }
}

export {Browser, Offset};
