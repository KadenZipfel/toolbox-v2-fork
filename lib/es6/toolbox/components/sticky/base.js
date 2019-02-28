import { NumericRange } from "../../utils/math/numeric-range";
import { getVisibleYPosition } from "../../utils/dom/position/vertical/get-visible-y-position";
import { renderLoop } from "../../utils/render-loop";
import { getVisibleDistanceFromRoot } from "../../utils/dom/position/get-visible-distance-from-root";
import { Vector2d } from "../../utils/math/geometry/vector-2d";
import { getVisibleDistanceBetweenElements } from "../../utils/dom/position/get-visible-distance-between-elements";
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
            this.target_.offsetHeight -
            this.target_.offsetTop;
        var shouldPin = new NumericRange(0, maxDistance).contains(-yPosition);
        var position = this.getPosition_(shouldPin, yPosition);
        var windowDimensions = Dimensions2d.fromInnerWindow();
        if (this.lastPosition_ === position) {
            return;
        }
        if (position === ContainerPosition.TOP) {
            this.positionTop_();
        }
        else {
            if (this.lastPosition_ !== ContainerPosition.TOP ||
                !this.lastWindowDimensions_.equals(windowDimensions)) {
                this.positionTop_();
            }
            var oldPositionFromContainer = getVisibleDistanceBetweenElements(this.target_, this.container_);
            var oldPositionFromWindow = getVisibleDistanceFromRoot(this.target_);
            var originalSizing_1 = Dimensions2d.fromElementOffset(this.target_);
            if (position === ContainerPosition.MIDDLE) {
                this.positionMiddle_();
            }
            else if (position === ContainerPosition.BOTTOM) {
                this.positionBottom_();
            }
            var newPositionFromWindow = getVisibleDistanceFromRoot(this.target_);
            var desiredPositionFromWindow = new Vector2d(oldPositionFromWindow.x, oldPositionFromContainer.y);
            var finalAdjustment_1 = newPositionFromWindow.subtract(desiredPositionFromWindow);
            renderLoop.scrollMutate(function () {
                finalAdjustment_1.positionElementByTranslation(_this.target_);
                originalSizing_1.sizeElement(_this.target_);
            });
        }
        this.lastPosition_ = position;
        this.lastWindowDimensions_ = windowDimensions;
    };
    Sticky.prototype.positionTop_ = function () {
        this.target_.style.position = '';
        this.target_.style.width = '';
        this.target_.style.height = '';
        this.target_.style.transform = '';
    };
    Sticky.prototype.positionMiddle_ = function () {
        this.target_.style.position = 'fixed';
    };
    Sticky.prototype.positionBottom_ = function () {
        this.target_.style.position = 'absolute';
    };
    Sticky.prototype.destroy = function () {
        this.destroyed_ = true;
    };
    return Sticky;
}());
export { Sticky };
//# sourceMappingURL=base.js.map