import {frameMemoize} from "../../frame-memoize";
import {isFullyVisible} from "../position/is-fully-visible";
import {getAnchorElementFromHash} from "./get-anchor-element-from-hash";

function isAnchorElementFromHashFullyVisible_(): boolean {
  return getAnchorElementFromHash() ?
    isFullyVisible(getAnchorElementFromHash()) : false;
}

const isAnchorElementFromHashFullyVisible =
  frameMemoize(isAnchorElementFromHashFullyVisible_);

export {isAnchorElementFromHashFullyVisible};