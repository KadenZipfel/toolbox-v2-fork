"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var numeric_range_1 = require("../../utils/math/numeric-range");
var get_visible_y_position_1 = require("../../utils/dom/position/vertical/get-visible-y-position");
var render_loop_1 = require("../../utils/render-loop");
var vector_2d_1 = require("../../utils/math/geometry/vector-2d");
var translate_2d_on_scroll_loop_1 = require("../../utils/dom/position/translate-2d-on-scroll-loop");
var Sticky = (function () {
    function Sticky(target, container) {
        this.container_ = container;
        this.target_ = target;
        this.destroyed_ = false;
        this.totalYAdded_ = 0;
        this.init_();
    }
    Sticky.prototype.init_ = function () {
        this.measure_();
        this.renderLoop_();
    };
    Sticky.prototype.renderLoop_ = function () {
        var _this = this;
        if (this.destroyed_) {
            return;
        }
        render_loop_1.renderLoop.scrollMeasure(function () { return _this.measure_(); });
    };
    Sticky.prototype.measure_ = function () {
        var _this = this;
        if (this.destroyed_) {
            return;
        }
        render_loop_1.renderLoop.scrollCleanup(function () { return _this.renderLoop_(); });
        var yPosition = get_visible_y_position_1.getVisibleYPosition(this.container_);
        var maxDistance = this.container_.offsetHeight -
            this.target_.offsetHeight -
            this.target_.offsetTop;
        var rawChange = Math.abs(yPosition) - this.totalYAdded_;
        var clampedChange = new numeric_range_1.NumericRange(-this.totalYAdded_, maxDistance - this.totalYAdded_)
            .clamp(rawChange);
        translate_2d_on_scroll_loop_1.translate2dOnScrollLoop(this.target_, new vector_2d_1.Vector2d(0, clampedChange));
        this.totalYAdded_ += clampedChange;
    };
    Sticky.prototype.destroy = function () {
        this.destroyed_ = true;
    };
    return Sticky;
}());
exports.Sticky = Sticky;
//# sourceMappingURL=base.js.map