import { NumericRange } from "../../utils/math/numeric-range";
import { getVisibleYPosition } from "../../utils/dom/position/vertical/get-visible-y-position";
import { renderLoop } from "../../utils/render-loop";
import { Vector2d } from "../../utils/math/geometry/vector-2d";
import { translate2dOnScrollLoop } from "../../utils/dom/position/translate-2d-on-scroll-loop";
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
        renderLoop.scrollMeasure(function () { return _this.measure_(); });
    };
    Sticky.prototype.measure_ = function () {
        var _this = this;
        if (this.destroyed_) {
            return;
        }
        renderLoop.scrollCleanup(function () { return _this.renderLoop_(); });
        var yPosition = getVisibleYPosition(this.container_);
        var maxDistance = this.container_.offsetHeight -
            this.target_.offsetHeight -
            this.target_.offsetTop;
        var rawChange = Math.abs(yPosition) - this.totalYAdded_;
        var clampedChange = new NumericRange(-this.totalYAdded_, maxDistance - this.totalYAdded_)
            .clamp(rawChange);
        translate2dOnScrollLoop(this.target_, new Vector2d(0, clampedChange));
        this.totalYAdded_ += clampedChange;
    };
    Sticky.prototype.destroy = function () {
        this.destroyed_ = true;
    };
    return Sticky;
}());
export { Sticky };
//# sourceMappingURL=base.js.map