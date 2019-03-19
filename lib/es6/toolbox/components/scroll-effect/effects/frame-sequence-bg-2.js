import { renderLoop } from "../../../utils/render-loop";
import { percentToIndex } from "../../../utils/array/percent-to-index";
import { flatten } from "../../../utils/array/flatten";
import { zip } from "../../../utils/array/zip";
import { loadImage } from "../../../utils/loading/load-image";
import { styleStringToMap } from "../../../utils/dom/style/style-string-to-map";
import { setStylesFromMap } from "../../../utils/dom/style/set-styles-from-map";
import { min } from "../../../utils/array/min";
import { NumericRange } from "../../../utils/math/numeric-range";
var DEFAULT_FRAME_STYLE = "\n  display: none;\n  position: absolute;\n  top: 0;\n  left: 0;\n  right: 0;\n  bottom: 0;\n  width: 100%;\n  height: 100%;\n  opacity: 0;\n";
var TargetState = (function () {
    function TargetState(desiredFrame, backFrame, frontFrame, distanceAsPercent) {
        this.desiredFrame = desiredFrame;
        this.backFrame = backFrame;
        this.frontFrame = frontFrame;
        this.distanceAsPercent = distanceAsPercent;
    }
    return TargetState;
}());
var FrameSequenceBg2 = (function () {
    function FrameSequenceBg2(frames, container, _a) {
        var _b = _a === void 0 ? {} : _a, _c = _b.createFrameFunction, createFrameFunction = _c === void 0 ? function () { return document.createElement('div'); } : _c, _d = _b.startLoadingImmediately, startLoadingImmediately = _d === void 0 ? true : _d;
        this.targetStates_ = new Map();
        this.imageUrlsInOrder_ = frames;
        this.frameElements_ =
            frames.map(function (frame, frameIndex) { return createFrameFunction(frameIndex); });
        this.framesToLoadInOrder_ =
            FrameSequenceBg2.generateFrameLoadOrder(frames.length);
        this.framesToLoadInOrderIndex_ = 0;
        this.loadedFrames_ = new Set();
        this.container_ = container;
        this.loadingPaused_ = !startLoadingImmediately;
        this.isLoading_ = false;
        this.init_();
    }
    FrameSequenceBg2.prototype.stopLoading = function () {
        this.loadingPaused_ = true;
    };
    FrameSequenceBg2.prototype.startLoading = function () {
        this.loadingPaused_ = false;
        if (!this.isLoading_) {
            this.loadNextImage_();
        }
    };
    FrameSequenceBg2.prototype.init_ = function () {
        this.setupFrames_();
        this.startLoadingImages_();
    };
    FrameSequenceBg2.prototype.setupFrames_ = function () {
        var _this = this;
        var defaultStyles = styleStringToMap(DEFAULT_FRAME_STYLE);
        this.frameElements_
            .forEach(function (frame) {
            setStylesFromMap(frame, defaultStyles);
            _this.container_.appendChild(frame);
        });
    };
    FrameSequenceBg2.prototype.startLoadingImages_ = function () {
        this.loadNextImage_();
    };
    FrameSequenceBg2.prototype.loadNextImage_ = function () {
        var _this = this;
        if (this.framesToLoadInOrderIndex_ >= this.framesToLoadInOrder_.length) {
            return;
        }
        if (this.loadingPaused_) {
            return;
        }
        var frameToLoad = this.framesToLoadInOrder_[this.framesToLoadInOrderIndex_];
        this.isLoading_ = true;
        this.loadImage_(frameToLoad).then(function () { return _this.isLoading_ = false; });
    };
    FrameSequenceBg2.prototype.loadImage_ = function (frameToLoad) {
        var _this = this;
        var frameUrl = this.imageUrlsInOrder_[frameToLoad];
        this.isLoading_ = true;
        return loadImage(frameUrl)
            .then(function (loadedImage) {
            _this.isLoading_ = false;
            _this.loadedFrames_.add(frameToLoad);
            setStylesFromMap(_this.frameElements_[frameToLoad], new Map([_this.getBackgroundImageStyle_(frameToLoad)]));
            _this.targetStates_.forEach(function (targetState, target) {
                var desiredFrame = targetState.desiredFrame;
                if (desiredFrame === frameToLoad) {
                    _this.updateWithLoadedFrame_(target, desiredFrame);
                    _this.targetStates_.delete(target);
                }
                else {
                    var mustUpdate = FrameSequenceBg2
                        .requiresUpdateForNewFrame_(frameToLoad, targetState);
                    if (mustUpdate) {
                        _this.updateWithMissingFrame_(target, targetState.distanceAsPercent, desiredFrame);
                    }
                }
            });
            _this.framesToLoadInOrderIndex_++;
            _this.loadNextImage_();
        }, function () {
            _this.isLoading_ = false;
            _this.framesToLoadInOrderIndex_++;
            _this.loadNextImage_();
        });
    };
    FrameSequenceBg2.requiresUpdateForNewFrame_ = function (newFrame, targetState) {
        return (targetState.backFrame < newFrame &&
            newFrame < targetState.desiredFrame) || (targetState.desiredFrame < newFrame &&
            newFrame < targetState.frontFrame);
    };
    FrameSequenceBg2.generateFrameLoadOrder = function (length) {
        var allValues = [];
        for (var i = 1; i < length - 1; i++) {
            allValues.push(i);
        }
        return [0, length - 1].concat(this.generateFrameLoadOrderLoop_(allValues));
    };
    FrameSequenceBg2.generateFrameLoadOrderLoop_ = function (remaining) {
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
    FrameSequenceBg2.prototype.getPreviousLoadedFrame_ = function (targetFrame) {
        return this.getClosestFrame_(this.getPreviousLoadedFrames_(targetFrame), targetFrame);
    };
    FrameSequenceBg2.prototype.getPreviousLoadedFrames_ = function (targetFrame) {
        return this.getLoadedFramesByCondition_(function (frame) { return frame < targetFrame; });
    };
    FrameSequenceBg2.prototype.getNextLoadedFrame_ = function (targetFrame) {
        return this.getClosestFrame_(this.getNextLoadedFrames_(targetFrame), targetFrame);
    };
    FrameSequenceBg2.prototype.getClosestFrame_ = function (candidateFrames, targetFrame) {
        return min(candidateFrames, function (frame) { return Math.abs(targetFrame - frame); });
    };
    FrameSequenceBg2.prototype.getNextLoadedFrames_ = function (targetFrame) {
        return this.getLoadedFramesByCondition_(function (frame) { return frame > targetFrame; });
    };
    FrameSequenceBg2.prototype.getLoadedFramesByCondition_ = function (condition) {
        return Array.from(this.loadedFrames_).filter(condition);
    };
    FrameSequenceBg2.prototype.run = function (target, distance, distanceAsPercent) {
        var targetFrame = percentToIndex(distanceAsPercent, this.imageUrlsInOrder_);
        if (this.loadedFrames_.has(targetFrame)) {
            this.updateWithLoadedFrame_(target, targetFrame);
        }
        else {
            this.updateWithMissingFrame_(target, distanceAsPercent, targetFrame);
        }
    };
    FrameSequenceBg2.prototype.updateWithLoadedFrame_ = function (target, targetFrame) {
        this.targetStates_.delete(target);
        this.clearFrames_(new Set([targetFrame]));
        this.setFrameOpacity_(targetFrame, '1');
    };
    FrameSequenceBg2.prototype.getBackgroundImageStyle_ = function (frame) {
        return ['background-image', "url(" + this.imageUrlsInOrder_[frame] + ")"];
    };
    FrameSequenceBg2.prototype.clearFrames_ = function (rawExceptions) {
        var _this = this;
        if (rawExceptions === void 0) { rawExceptions = null; }
        var exceptions = rawExceptions || new Set();
        renderLoop.anyMutate(function () {
            for (var i = 0; i < _this.frameElements_.length; i++) {
                if (exceptions.has(i)) {
                    continue;
                }
                _this.frameElements_[i].style.display = 'none';
            }
        });
    };
    FrameSequenceBg2.prototype.setFrameOpacity_ = function (frame, opacity) {
        var _this = this;
        if (typeof frame === 'undefined') {
            return;
        }
        renderLoop.anyMutate(function () {
            _this.frameElements_[frame].style.display = 'block';
            _this.frameElements_[frame].style.opacity = opacity;
        });
    };
    FrameSequenceBg2.prototype.updateWithMissingFrame_ = function (target, distanceAsPercent, targetFrame) {
        var frontFrame = this.getNextLoadedFrame_(targetFrame);
        var backFrame = this.getPreviousLoadedFrame_(targetFrame);
        var opacity = this.getFrontFrameCrossfadeOpacity_(distanceAsPercent, frontFrame, backFrame);
        this.clearFrames_(new Set([backFrame, frontFrame]));
        this.updateBackFrameWithMissingFrame_(backFrame);
        this.updateFrontFrameWithMissingFrame_(frontFrame, opacity);
        this.targetStates_.set(target, new TargetState(targetFrame, backFrame, frontFrame, distanceAsPercent));
    };
    FrameSequenceBg2.prototype.getFrontFrameCrossfadeOpacity_ = function (distanceAsPercent, frontFrame, backFrame) {
        var frontPercent = frontFrame / this.imageUrlsInOrder_.length;
        var backPercent = backFrame / this.imageUrlsInOrder_.length;
        var percentageRange = new NumericRange(backPercent, frontPercent);
        return percentageRange.getValueAsPercent(distanceAsPercent);
    };
    FrameSequenceBg2.prototype.updateBackFrameWithMissingFrame_ = function (frame) {
        this.setFrameOpacity_(frame, '1');
    };
    FrameSequenceBg2.prototype.updateFrontFrameWithMissingFrame_ = function (frame, opacity) {
        this.setFrameOpacity_(frame, "" + opacity);
    };
    FrameSequenceBg2.prototype.destroy = function () {
        var _this = this;
        this.loadedFrames_.clear();
        this.frameElements_
            .forEach(function (frameElement) { return _this.container_.removeChild(frameElement); });
    };
    return FrameSequenceBg2;
}());
export { FrameSequenceBg2 };
//# sourceMappingURL=frame-sequence-bg-2.js.map