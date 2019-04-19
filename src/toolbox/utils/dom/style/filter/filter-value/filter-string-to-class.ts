import {IFilterValueStatic} from "./i-filter-value";
import {Blur} from "./blur";

const filterStringToClass: Map<string, IFilterValueStatic> =
  new Map<string, IFilterValueStatic>([
    ['blur', Blur],
  ]);

export {filterStringToClass};
