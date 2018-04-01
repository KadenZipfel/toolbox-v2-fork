"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var range_1 = require("../../range");
var get_visible_distance_between_elements_1 = require("./get-visible-distance-between-elements");
function getVisibleWidth(target, container) {
    if (container === void 0) { container = null; }
    var distance = get_visible_distance_between_elements_1.getVisibleDistanceBetweenElements(target, container);
    var containerWidth = container ? container.offsetWidth : window.innerWidth;
    var visibleXRange = new range_1.Range(0, containerWidth);
    var startX = visibleXRange.clamp(distance.x);
    var endX = visibleXRange.clamp(distance.x + target.offsetWidth);
    return endX - startX;
}
exports.getVisibleWidth = getVisibleWidth;
//# sourceMappingURL=get-visible-width.js.map