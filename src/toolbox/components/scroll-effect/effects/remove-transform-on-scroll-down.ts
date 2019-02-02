import {IEffect} from "./ieffect";
import {Scroll} from "../../../utils/cached-vectors/scroll";
import {setStyle} from "../../../utils/dom/style/set-style";
import {renderLoop} from "../../../utils/render-loop";

// This can be used to only display a header on scroll down.
// To set this up place a header with a transform that slides it up
// and out of view. Then when scrolling down and the transform is removed the
// header will be displayed.

class RemoveTransformOnScrollDown implements IEffect {
  readonly minimumScrollDistance_: number;

  constructor(minimumScrollDistance: number = 0) {
    this.minimumScrollDistance_ = minimumScrollDistance;
  }

  public run(
    target: HTMLElement, distance: number, distanceAsPercent: number
  ): void {
    if (
      distance > this.minimumScrollDistance_ &&
      Scroll.getSingleton().isScrollingDown()
    ) {
      renderLoop.scrollMutate(() => setStyle(target, 'transform', 'none'));
    } else {
      renderLoop.scrollMutate(() => setStyle(target, 'transform', ''));
    }
  }

  destroy() {}
}

export {RemoveTransformOnScrollDown}
