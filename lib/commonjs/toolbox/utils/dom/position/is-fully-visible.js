"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var is_percent_visible_1 = require("./is-percent-visible");
function isFullyVisible(target, container, factorInOpacity) {
    if (container === void 0) { container = null; }
    if (factorInOpacity === void 0) { factorInOpacity = false; }
    return is_percent_visible_1.isPercentVisible(target, 1, container, factorInOpacity);
}
exports.isFullyVisible = isFullyVisible;
//# sourceMappingURL=is-fully-visible.js.map