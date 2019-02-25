"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var render_loop_1 = require("../../../utils/render-loop");
var set_style_1 = require("../../../utils/dom/style/set-style");
var percent_to_index_1 = require("../../../utils/array/percent-to-index");
var flatten_1 = require("../../../utils/array/flatten");
var zip_1 = require("../../../utils/array/zip");
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
        ].concat(flatten_1.flatten(zip_1.zip(this.generateFrameLoadOrderLoop_(left), this.generateFrameLoadOrderLoop_(right))));
    };
    FrameSequenceBg.prototype.run = function (target, distance, distanceAsPercent) {
        var _this = this;
        var frame = percent_to_index_1.percentToIndex(distanceAsPercent, this.imageUrlsInOrder_);
        render_loop_1.renderLoop.mutate(function () { return set_style_1.setStyle(target, 'background-image', "url(" + _this.imageUrlsInOrder_[frame] + ")"); });
    };
    FrameSequenceBg.prototype.destroy = function () { };
    return FrameSequenceBg;
}());
exports.FrameSequenceBg = FrameSequenceBg;
//# sourceMappingURL=frame-sequence-bg.js.map