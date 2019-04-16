import {getVisibleDistanceBetweenElements} from "./get-visible-distance-between-elements";

function getVisibleDistanceBetweenElementCenters(
  target: HTMLElement,
  container: HTMLElement = null
): number {
  return getVisibleDistanceBetweenElements(target, container) +
    (target.offsetHeight / 2) -
    (container !== null ? container.offsetHeight : window.innerHeight) / 2;
}

export {getVisibleDistanceBetweenElementCenters};
