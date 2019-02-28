import { renderLoop } from "../../../utils/render-loop";
import { percentToIndex } from "../../../utils/array/percent-to-index";
import { flatten } from "../../../utils/array/flatten";
import { zip } from "../../../utils/array/zip";
import { loadImage } from "../../../utils/loading/load-image";
import { styleStringToMap } from "../../../utils/dom/style/style-string-to-map";
import { setStylesFromMap } from "../../../utils/dom/style/set-styles-from-map";
import { min } from "../../../utils/array/min";
import { NumericRange } from "../../../utils/math/numeric-range";
var DEFAULT_FRAME_STYLE = "\n  position: absolute;\n  top: 0;\n  left: 0;\n  right: 0;\n  bottom: 0;\n  width: 100%;\n  height: 100%;\n";
var FrameSequenceBg = (function () {
    function FrameSequenceBg(frames, container) {
        this.imageUrlsInOrder_ = frames;
        this.framesToLoadInOrder_ =
            FrameSequenceBg.generateFrameLoadOrder(frames.length);
        this.framesToLoadInOrderIndex_ = 0;
        this.loadedFrames_ = new Set();
        this.backFrame_ = document.createElement('div');
        this.frontFrame_ = document.createElement('div');
        this.container_ = container;
        this.init_();
    }
    FrameSequenceBg.prototype.init_ = function () {
        this.setupFrames_();
        this.startLoadingImages_();
    };
    FrameSequenceBg.prototype.getFrames_ = function () {
        return [this.backFrame_, this.frontFrame_];
    };
    FrameSequenceBg.prototype.setupFrames_ = function () {
        var _this = this;
        var defaultStyles = styleStringToMap(DEFAULT_FRAME_STYLE);
        this.getFrames_()
            .forEach(function (frame) {
            setStylesFromMap(frame, defaultStyles);
            _this.container_.appendChild(frame);
        });
    };
    FrameSequenceBg.prototype.startLoadingImages_ = function () {
        this.loadNextImage_();
    };
    FrameSequenceBg.prototype.loadNextImage_ = function () {
        var _this = this;
        if (this.framesToLoadInOrderIndex_ >= this.framesToLoadInOrder_.length) {
            return;
        }
        var frameToLoad = this.framesToLoadInOrder_[this.framesToLoadInOrderIndex_];
        var frameUrl = this.imageUrlsInOrder_[frameToLoad];
        loadImage(frameUrl)
            .then(function () {
            _this.framesToLoadInOrderIndex_++;
            _this.loadNextImage_();
            _this.loadedFrames_.add(frameToLoad);
        });
    };
    FrameSequenceBg.generateFrameLoadOrder = function (length) {
        var allValues = [];
        for (var i = 1; i < length - 1; i++) {
            allValues.push(i);
        }
        return [0, length - 1].concat(this.generateFrameLoadOrderLoop_(allValues));
    };
    FrameSequenceBg.generateFrameLoadOrderLoop_ = function (remaining) {
        if (remaining.length <= 1) {
            return remaining;
        }
        var middle = Math.floor((remaining.length - 1) / 2);
        var left = remaining.slice(0, middle);
        var right = remaining.slice(middle + 1);
        return [
            remaining[middle]
        ].concat(flatten(zip(this.generateFrameLoadOrderLoop_(left), this.generateFrameLoadOrderLoop_(right))));
    };
    FrameSequenceBg.prototype.getPreviousLoadedFrame_ = function (targetFrame) {
        return this.getClosestFrame_(this.getPreviousLoadedFrames_(targetFrame), targetFrame);
    };
    FrameSequenceBg.prototype.getPreviousLoadedFrames_ = function (targetFrame) {
        return this.getLoadedFramesByCondition_(function (frame) { return frame < targetFrame; });
    };
    FrameSequenceBg.prototype.getNextLoadedFrame_ = function (targetFrame) {
        return this.getClosestFrame_(this.getNextLoadedFrames_(targetFrame), targetFrame);
    };
    FrameSequenceBg.prototype.getClosestFrame_ = function (candidateFrames, targetFrame) {
        return min(candidateFrames, function (frame) { return Math.abs(targetFrame - frame); });
    };
    FrameSequenceBg.prototype.getNextLoadedFrames_ = function (targetFrame) {
        return this.getLoadedFramesByCondition_(function (frame) { return frame > targetFrame; });
    };
    FrameSequenceBg.prototype.getLoadedFramesByCondition_ = function (condition) {
        return Array.from(this.loadedFrames_).filter(condition);
    };
    FrameSequenceBg.prototype.run = function (target, distance, distanceAsPercent) {
        var _this = this;
        var targetFrame = percentToIndex(distanceAsPercent, this.imageUrlsInOrder_);
        var backFrameStyles = new Map();
        var frontFrameStyles = new Map();
        if (this.loadedFrames_.has(targetFrame)) {
            frontFrameStyles
                .set('background-image', "url(" + this.imageUrlsInOrder_[targetFrame] + ")");
            backFrameStyles.set('background-image', 'none');
            frontFrameStyles.set('opacity', '1');
            backFrameStyles.set('opacity', '0');
        }
        else {
            var frontFrame = this.getNextLoadedFrame_(targetFrame);
            var backFrame = this.getPreviousLoadedFrame_(targetFrame);
            var frontFramePercent = frontFrame / this.imageUrlsInOrder_.length;
            var backFramePercent = backFrame / this.imageUrlsInOrder_.length;
            var percentageRange = new NumericRange(backFramePercent, frontFramePercent);
            var opacitySplit = percentageRange.getValueAsPercent(distanceAsPercent);
            frontFrameStyles
                .set('background-image', "url(" + this.imageUrlsInOrder_[frontFrame] + ")");
            backFrameStyles
                .set('background-image', "url(" + this.imageUrlsInOrder_[backFrame] + ")");
            frontFrameStyles.set('opacity', '' + (opacitySplit));
            backFrameStyles.set('opacity', '' + (1 - opacitySplit));
        }
        renderLoop.scrollMutate(function () {
            setStylesFromMap(_this.backFrame_, backFrameStyles);
            setStylesFromMap(_this.frontFrame_, frontFrameStyles);
        });
    };
    FrameSequenceBg.prototype.destroy = function () { };
    return FrameSequenceBg;
}());
export { FrameSequenceBg };
//# sourceMappingURL=frame-sequence-bg.js.map