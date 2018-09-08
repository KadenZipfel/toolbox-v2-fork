"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var render_loop_1 = require("../../../utils/render-loop");
var dynamic_default_1 = require("../../../utils/map/dynamic-default");
var set_style_1 = require("../../../utils/dom/style/set-style");
var FRAME_STEP = 0.1;
var VideoScrubByPlay = (function () {
    function VideoScrubByPlay(getForwardsVideoFunction, getBackwardsVideoFunction, _a) {
        var _b = _a === void 0 ? {} : _a, _c = _b.playStartOffset, playStartOffset = _c === void 0 ? 0 : _c, _d = _b.playEndOffset, playEndOffset = _d === void 0 ? 0 : _d;
        this.getForwardsVideo_ = getForwardsVideoFunction;
        this.getBackwardsVideo_ = getBackwardsVideoFunction;
        this.targetPercentages_ =
            dynamic_default_1.DynamicDefaultMap.usingFunction(function () { return 0; });
        this.destroyed_ = false;
        this.wasPlayingForwards_ = true;
        this.playStartOffset_ = playStartOffset;
        this.playEndOffset_ = playEndOffset;
        this.metadataHandledVideos_ = new Set();
        this.render_();
    }
    VideoScrubByPlay.prototype.run = function (target, distance, distanceAsPercent) {
        this.targetPercentages_.set(target, distanceAsPercent);
    };
    VideoScrubByPlay.getTargetTime_ = function (video, percentage, startOffset, endOffset) {
        var viableDuration = video.duration - startOffset - endOffset;
        var rawTargetTime = startOffset +
            Math.round(viableDuration * percentage * 1000) / 1000;
        return Math.min(rawTargetTime, video.duration);
    };
    VideoScrubByPlay.prototype.render_ = function () {
        var _this = this;
        if (this.destroyed_) {
            return;
        }
        render_loop_1.renderLoop.mutate(function () {
            render_loop_1.renderLoop.cleanup(function () { return _this.render_(); });
            Array.from(_this.targetPercentages_.entries())
                .forEach(function (_a) {
                var target = _a[0], percentage = _a[1];
                var forwardsVideo = _this.getForwardsVideo_(target);
                var backwardsVideo = _this.getBackwardsVideo_(target);
                var primaryVideo;
                var secondaryVideo;
                var targetTime;
                if (isNaN(forwardsVideo.duration) || isNaN(backwardsVideo.duration)) {
                    return;
                }
                var forwardsTargetTime = VideoScrubByPlay.getTargetTime_(forwardsVideo, percentage, _this.playStartOffset_, _this.playEndOffset_);
                var backwardsTargetTime = VideoScrubByPlay.getTargetTime_(backwardsVideo, (1 - percentage), _this.playEndOffset_, _this.playStartOffset_);
                var forwardsGap = forwardsTargetTime - forwardsVideo.currentTime;
                var backwardsGap = backwardsTargetTime - backwardsVideo.currentTime;
                var playForwards;
                if (Math.abs(forwardsGap - backwardsGap) > FRAME_STEP) {
                    playForwards = forwardsGap > backwardsGap;
                }
                else {
                    playForwards = _this.wasPlayingForwards_;
                }
                if (playForwards) {
                    targetTime = forwardsTargetTime;
                    primaryVideo = forwardsVideo;
                    secondaryVideo = backwardsVideo;
                }
                else {
                    targetTime = backwardsTargetTime;
                    primaryVideo = backwardsVideo;
                    secondaryVideo = forwardsVideo;
                }
                if (playForwards !== _this.wasPlayingForwards_) {
                    secondaryVideo
                        .removeEventListener('canplay', _this.bufferedHandler_);
                    primaryVideo
                        .removeEventListener('canplay', _this.bufferedHandler_);
                    _this.bufferedHandler_ = function () {
                        render_loop_1.renderLoop.mutate(function () {
                            set_style_1.setStyle(primaryVideo, 'opacity', '1');
                            set_style_1.setStyle(secondaryVideo, 'opacity', '0');
                            primaryVideo.play();
                        });
                        primaryVideo
                            .removeEventListener('canplay', _this.bufferedHandler_);
                        _this.bufferedHandler_ = null;
                    };
                    primaryVideo.addEventListener('canplay', _this.bufferedHandler_);
                    primaryVideo.currentTime =
                        primaryVideo.duration - secondaryVideo.currentTime;
                }
                else {
                    secondaryVideo.currentTime =
                        secondaryVideo.duration - primaryVideo.currentTime;
                }
                if (!secondaryVideo.paused) {
                    secondaryVideo.pause();
                }
                if (isNaN(targetTime) || isNaN(primaryVideo.currentTime) ||
                    primaryVideo.currentTime >= targetTime) {
                    if (!primaryVideo.paused) {
                        primaryVideo.pause();
                    }
                }
                else if (_this.bufferedHandler_ === null && primaryVideo.paused) {
                    primaryVideo.play();
                }
                _this.wasPlayingForwards_ = playForwards;
            });
        });
    };
    VideoScrubByPlay.prototype.destroy = function () {
        this.destroyed_ = true;
    };
    return VideoScrubByPlay;
}());
exports.VideoScrubByPlay = VideoScrubByPlay;
//# sourceMappingURL=video-scrub-by-play.js.map