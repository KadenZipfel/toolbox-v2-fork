import { getVisibleDistanceBetweenElements } from "./get-visible-distance-between-elements";
function getVisibleDistanceBetweenElementCenters(target, container) {
    if (container === void 0) { container = null; }
    return getVisibleDistanceBetweenElements(target, container) +
        (target.offsetHeight / 2) -
        (container !== null ? container.offsetHeight : window.innerHeight) / 2;
}
export { getVisibleDistanceBetweenElementCenters };
//# sourceMappingURL=get-visible-distance-between-element-centers.js.map