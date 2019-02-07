"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var scroll_1 = require("../../cached-vectors/scroll");
var vector_2d_1 = require("../../math/geometry/vector-2d");
var get_style_1 = require("../style/get-style");
var scroll = scroll_1.Scroll.getSingleton();
function getVisibleDistanceFromRoot_(element) {
    if (!element || element === document.body) {
        return scroll.getPosition().invert();
    }
    else if (get_style_1.getStyle(element, 'position') === 'fixed') {
        return vector_2d_1.Vector2d.fromElementOffset(element);
    }
    else {
        return vector_2d_1.Vector2d.add(vector_2d_1.Vector2d.fromElementOffset(element), vector_2d_1.Vector2d.fromElementTransform(element), vector_2d_1.Vector2d.fromElementScroll(element).invert(), getVisibleDistanceFromRoot_(element.offsetParent));
    }
}
function getVisibleDistanceFromRoot(element) {
    if (get_style_1.getStyle(element, 'position') === 'fixed') {
        return vector_2d_1.Vector2d.fromElementOffset(element);
    }
    return vector_2d_1.Vector2d.add(vector_2d_1.Vector2d.fromElementOffset(element), vector_2d_1.Vector2d.fromElementTransform(element), getVisibleDistanceFromRoot_(element.offsetParent));
}
exports.getVisibleDistanceFromRoot = getVisibleDistanceFromRoot;
//# sourceMappingURL=get-visible-distance-from-root.js.map