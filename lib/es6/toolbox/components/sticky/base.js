import { NumericRange } from "../../utils/math/numeric-range";
import { getVisibleYPosition } from "../../utils/dom/position/vertical/get-visible-y-position";
import { renderLoop } from "../../utils/render-loop";
import { Vector2d } from "../../utils/math/geometry/vector-2d";
import { getVisibleDistanceBetweenElements } from "../../utils/dom/position/get-visible-distance-between-elements";
import { getVisibleDistanceFromRoot } from "../../utils/dom/position/get-visible-distance-from-root";
import { getCommonOffsetAncestor } from "../../utils/dom/position/get-common-offset-ancestor";
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
        this.clone_ = document.createElement(target.tagName);
        this.commonOffsetAncestor_ = null;
        this.init_();
    }
    Sticky.prototype.init_ = function () {
        this.clone_.innerHTML = this.target_.innerHTML;
        this.clone_.style.visibility = 'hidden';
        this.target_.style.position = 'absolute';
        this.target_.style.top = '0';
        this.target_.style.left = '0';
        this.target_.style.width = '';
        this.target_.style.height = '';
        this.target_.style.margin = '0';
        this.target_.style.padding = '0';
        this.commonOffsetAncestor_ =
            getCommonOffsetAncestor(this.clone_, this.target_);
        this.measure_();
        this.renderLoop_();
    };
    Sticky.prototype.renderLoop_ = function () {
        var _this = this;
        if (this.destroyed_) {
            return;
        }
        renderLoop.scrollMeasure(function () {
            renderLoop.scrollCleanup(function () { return _this.renderLoop_(); });
            _this.measure_();
        });
    };
    Sticky.getPosition_ = function (shouldPin, yPosition) {
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
        var yPosition = getVisibleYPosition(this.container_);
        var maxDistance = this.container_.offsetHeight -
            this.clone_.offsetHeight -
            this.clone_.offsetTop;
        var shouldPin = new NumericRange(0, maxDistance).contains(-yPosition);
        var position = Sticky.getPosition_(shouldPin, yPosition);
        var cloneDistanceFromAncestor = getVisibleDistanceBetweenElements(this.clone_, this.commonOffsetAncestor_);
        var cloneDistanceFromRoot = getVisibleDistanceFromRoot(this.clone_);
        var cloneStyle = window.getComputedStyle(this.clone_);
        if (this.lastPosition_ === position) {
            return;
        }
        renderLoop.scrollMutate(function () {
            _this.applyCloneStylesToTarget_(cloneStyle);
            if (position === ContainerPosition.TOP) {
                _this.target_.style.position = 'absolute';
                cloneDistanceFromAncestor.positionElementByTranslation(_this.target_);
            }
            else if (position === ContainerPosition.MIDDLE) {
                _this.target_.style.position = 'fixed';
                cloneDistanceFromRoot.positionElementByTranslation(_this.target_);
            }
            else if (position === ContainerPosition.BOTTOM) {
                _this.target_.style.position = 'absolute';
                cloneDistanceFromAncestor
                    .add(new Vector2d(0, maxDistance))
                    .positionElementByTranslation(_this.target_);
            }
            _this.lastPosition_ = position;
        });
    };
    Sticky.prototype.applyCloneStylesToTarget_ = function (cloneStyles) {
        this.target_.style.margin = '0';
        this.target_.style.top = '0';
        this.target_.style.bottom = '0';
        this.target_.style.left = '0';
        this.target_.style.right = '0';
        this.target_.style.padding = cloneStyles.padding;
        this.target_.style.width = cloneStyles.width;
        this.target_.style.height = cloneStyles.height;
        this.target_.style.border = cloneStyles.border;
    };
    Sticky.prototype.destroy = function () {
        this.destroyed_ = true;
    };
    return Sticky;
}());
export { Sticky };
//# sourceMappingURL=base.js.map