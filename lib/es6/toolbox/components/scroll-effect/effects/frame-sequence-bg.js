import { renderLoop } from "../../../utils/render-loop";
import { setStyle } from "../../../utils/dom/style/set-style";
import { percentToIndex } from "../../../utils/array/percent-to-index";
import { flatten } from "../../../utils/array/flatten";
import { zip } from "../../../utils/array/zip";
var FrameSequenceBg = (function () {
    function FrameSequenceBg(frames) {
        this.imageUrlsInOrder_ = frames;
        this.loadedImageUrlIndices_ = new Set();
        this.indicesToLoadInOrder_ =
            FrameSequenceBg.generateFrameLoadOrder(frames.length);
    }
    FrameSequenceBg.generateFrameLoadOrder = function (length) {
        var allValues = [];
        for (var i = 1; i < length - 1; i++) {
            allValues.push(i);
        }
        return [0, length].concat(this.generateFrameLoadOrderLoop_(allValues));
    };
    FrameSequenceBg.generateFrameLoadOrderLoop_ = function (remaining) {
        if (remaining.length <= 1) {
            return remaining;
        }
        var middle = Math.floor(remaining.length / 2);
        var left = remaining.slice(0, middle);
        var right = remaining.slice(middle + 2);
        return [
            remaining[middle]
        ].concat(flatten(zip(this.generateFrameLoadOrderLoop_(left), this.generateFrameLoadOrderLoop_(right))));
    };
    FrameSequenceBg.prototype.run = function (target, distance, distanceAsPercent) {
        var _this = this;
        var frame = percentToIndex(distanceAsPercent, this.imageUrlsInOrder_);
        renderLoop.mutate(function () { return setStyle(target, 'background-image', "url(" + _this.imageUrlsInOrder_[frame] + ")"); });
    };
    FrameSequenceBg.prototype.destroy = function () { };
    return FrameSequenceBg;
}());
export { FrameSequenceBg };
//# sourceMappingURL=frame-sequence-bg.js.map