function getParentElements(
  element: HTMLElement, terminusAncestor: HTMLElement = null
): HTMLElement[] {
  if (!element || element === terminusAncestor) {
    return [];
  }
  return [element].concat(
    getParentElements(<HTMLElement>element.parentElement, terminusAncestor));
}

export {getParentElements};
