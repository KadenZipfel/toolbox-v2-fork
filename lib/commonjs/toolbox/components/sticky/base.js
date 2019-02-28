"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var numeric_range_1 = require("../../utils/math/numeric-range");
var get_visible_y_position_1 = require("../../utils/dom/position/vertical/get-visible-y-position");
var render_loop_1 = require("../../utils/render-loop");
var get_visible_distance_from_root_1 = require("../../utils/dom/position/get-visible-distance-from-root");
var vector_2d_1 = require("../../utils/math/geometry/vector-2d");
var get_visible_distance_between_elements_1 = require("../../utils/dom/position/get-visible-distance-between-elements");
var dimensions_2d_1 = require("../../utils/math/geometry/dimensions-2d");
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
        this.lastWindowDimensions_ = dimensions_2d_1.Dimensions2d.fromInnerWindow();
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
        render_loop_1.renderLoop.scrollCleanup(function () { return _this.renderLoop_(); });
        var yPosition = get_visible_y_position_1.getVisibleYPosition(this.container_);
        var maxDistance = this.container_.offsetHeight -
            this.target_.offsetHeight -
            this.target_.offsetTop;
        var shouldPin = new numeric_range_1.NumericRange(0, maxDistance).contains(-yPosition);
        var position = this.getPosition_(shouldPin, yPosition);
        var windowDimensions = dimensions_2d_1.Dimensions2d.fromInnerWindow();
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
            var oldPositionFromContainer = get_visible_distance_between_elements_1.getVisibleDistanceBetweenElements(this.target_, this.container_);
            var oldPositionFromWindow = get_visible_distance_from_root_1.getVisibleDistanceFromRoot(this.target_);
            var originalSizing_1 = dimensions_2d_1.Dimensions2d.fromElementOffset(this.target_);
            if (position === ContainerPosition.MIDDLE) {
                this.positionMiddle_();
            }
            else if (position === ContainerPosition.BOTTOM) {
                this.positionBottom_();
            }
            var newPositionFromWindow = get_visible_distance_from_root_1.getVisibleDistanceFromRoot(this.target_);
            var desiredPositionFromWindow = new vector_2d_1.Vector2d(oldPositionFromWindow.x, oldPositionFromContainer.y);
            var finalAdjustment_1 = newPositionFromWindow.subtract(desiredPositionFromWindow);
            render_loop_1.renderLoop.scrollMutate(function () {
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
exports.Sticky = Sticky;
//# sourceMappingURL=base.js.map