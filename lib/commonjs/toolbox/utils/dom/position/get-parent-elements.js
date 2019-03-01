"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function getParentElements(element, terminusAncestor) {
    if (terminusAncestor === void 0) { terminusAncestor = null; }
    if (!element || element === terminusAncestor) {
        return [];
    }
    return [element].concat(getParentElements(element.parentElement, terminusAncestor));
}
exports.getParentElements = getParentElements;
//# sourceMappingURL=get-parent-elements.js.map