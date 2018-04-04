import { getClosestToCenter } from '../position/get-closest-to-center';
import { frameMemoize } from "../../frame-memoize";
import { isAbove } from "../position/is-above";
import { getDisplayedAnchors } from "./get-displayed-anchors";
function getCurrentAnchorFromLimitedSet_(limitedQuerySelector, getCurrentAnchor) {
    return frameMemoize(function (querySelector) {
        var baseResult = getCurrentAnchor(querySelector);
        var limitedCandidates = getDisplayedAnchors(limitedQuerySelector);
        if (limitedCandidates.indexOf(baseResult) !== -1) {
            return baseResult;
        }
        var resultsAboveBase = limitedCandidates.filter(function (candidate) { return isAbove(candidate, baseResult); });
        return getClosestToCenter(resultsAboveBase);
    });
}
var getCurrentAnchorFromLimitedSet = frameMemoize(getCurrentAnchorFromLimitedSet_);
export { getCurrentAnchorFromLimitedSet };
//# sourceMappingURL=get-current-anchor-from-limited-set.js.map