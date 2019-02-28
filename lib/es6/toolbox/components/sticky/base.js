import { NumericRange } from "../../utils/math/numeric-range";
import { getVisibleYPosition } from "../../utils/dom/position/vertical/get-visible-y-position";
import { renderLoop } from "../../utils/render-loop";
import { getVisibleDistanceFromRoot } from "../../utils/dom/position/get-visible-distance-from-root";
import { Vector2d } from "../../utils/math/geometry/vector-2d";
import { Dimensions2d } from "../../utils/math/geometry/dimensions-2d";
var ContainerPosition = (function () {
    function ContainerPosition() {
    }
    ContainerPosition.TOP = Symbol('top');
    ContainerPosition.MIDDLE = Symbol('middle');
    ContainerPosition.BOTTOM = Symbol('bottom');
    return ContainerPosition;
}());
var Sticky = (function () {
    function Sticky(target, container) {
        this.container_ = container;
        this.target_ = target;
        this.lastPosition_ = null;
        this.destroyed_ = false;
        this.lastWindowDimensions_ = Dimensions2d.fromInnerWindow();
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
    Sticky.prototype.getPosition_ = function (shouldPin, yPosition) {
        if (shouldPin) {
            return ContainerPosition.MIDDLE;
        }
        else if (yPosition < 0) {
            return ContainerPosition.BOTTOM;
        }
        else {
            return ContainerPosition.TOP;
        }
    };
    Sticky.prototype.measure_ = function () {
        var _this = this;
        if (this.destroyed_) {
            return;
        }
        renderLoop.scrollCleanup(function () { return _this.renderLoop_(); });
        var yPosition = getVisibleYPosition(this.container_);
        var maxDistance = this.container_.offsetHeight -
            this.target_.offsetHeight;
        var shouldPin = new NumericRange(0, maxDistance).contains(-yPosition);
        var position = this.getPosition_(shouldPin, yPosition);
        var windowDimensions = Dimensions2d.fromInnerWindow();
        var desiredMiddleTop = this.target_.offsetTop;
        renderLoop.scrollPremeasure(function () {
            _this.lastPosition_ = position;
            _this.lastWindowDimensions_ = windowDimensions;
        });
        if (this.lastPosition_ === position &&
            (position === ContainerPosition.TOP ||
                this.lastWindowDimensions_.equals(windowDimensions))) {
            return;
        }
        if (position === ContainerPosition.TOP) {
            this.positionTop_();
        }
        else if (position === ContainerPosition.BOTTOM) {
            this.positionBottom_(maxDistance);
        }
        else if (position === ContainerPosition.MIDDLE) {
            if (!this.lastWindowDimensions_.equals(windowDimensions)) {
                this.positionTop_();
            }
            var oldPositionFromWindow = getVisibleDistanceFromRoot(this.target_);
            var originalSizing_1 = Dimensions2d.fromElementOffset(this.target_);
            var desiredPositionFromWindow_1 = new Vector2d(oldPositionFromWindow.x, desiredMiddleTop);
            renderLoop.scrollMutate(function () {
                _this.positionMiddle_();
                desiredPositionFromWindow_1.positionElementByTranslation(_this.target_);
                originalSizing_1.sizeElement(_this.target_);
            });
        }
    };
    Sticky.prototype.positionTop_ = function () {
        var _this = this;
        renderLoop.scrollMutate(function () {
            _this.clearStyles_();
        });
    };
    Sticky.prototype.positionMiddle_ = function () {
        this.target_.style.position = 'fixed';
        this.target_.style.margin = '0';
        this.target_.style.top = '0';
        this.target_.style.left = '0';
    };
    Sticky.prototype.positionBottom_ = function (maxDistance) {
        var _this = this;
        renderLoop.scrollMutate(function () {
            _this.clearStyles_();
            _this.target_.style.transform = "translateY(" + maxDistance + "px)";
            _this.target_.style.marginTop = '0';
        });
    };
    Sticky.prototype.clearStyles_ = function () {
        this.target_.style.position = '';
        this.target_.style.width = '';
        this.target_.style.height = '';
        this.target_.style.transform = '';
        this.target_.style.margin = '';
        this.target_.style.marginTop = '';
        this.target_.style.top = '';
        this.target_.style.left = '';
    };
    Sticky.prototype.destroy = function () {
        this.destroyed_ = true;
    };
    return Sticky;
}());
export { Sticky };
//# sourceMappingURL=base.js.map