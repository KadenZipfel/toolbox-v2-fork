import {Browser, Offset} from "./base";

class Opera extends Browser {
  protected static name_: string = 'Opera';
  protected static uaidsWithOffsets_: [string, Offset[]][] =
    [
      ['Opera', [['Version', 8], ['Opera', 6]]],
      ['OPR', [['OPR', 4]]],
    ];
}

export {Opera};
