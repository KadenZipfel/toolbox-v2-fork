import {renderLoop} from "../../render-loop";

function removeClassIfPresent(
  element: Element,
  ...classesToRemove: string[]
): void {
  renderLoop.mutate(() => element.classList.remove(...classesToRemove));
}

export {removeClassIfPresent};
