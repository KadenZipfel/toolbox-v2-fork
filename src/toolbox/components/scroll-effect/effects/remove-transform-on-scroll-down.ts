import {IEffect} from "./ieffect";
import {Scroll} from "../../../utils/cached-vectors/scroll";
import {setStyle} from "../../../utils/dom/style/set-style";

// This can be used to only display a header on scroll down.
// To set this up place a header with a transform that slides it up
// and out of view. Then when scrolling down and the transform is removed the
// header will be displayed.

class RemoveTransformOnScrollDown implements IEffect {
  private minimumScrollDistance_: number;

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
      setStyle(target, 'transform', 'none');
    } else {
      setStyle(target, 'transform', '');
    }
  }

  destroy() {}
}

export {RemoveTransformOnScrollDown}
