import {NumericRange} from "../../utils/math/numeric-range";
import {getVisibleYPosition} from "../../utils/dom/position/vertical/get-visible-y-position";
import {renderLoop} from "../../utils/render-loop";
import {Vector2d} from "../../utils/math/geometry/vector-2d";
import {translate2dOnScrollLoop} from "../../utils/dom/position/translate-2d-on-scroll-loop";

/**
 * Simulates `position: sticky` when native support isn't available due to
 * `overflow: hidden` on parent elements.
 */
class Sticky {
  private readonly container_: HTMLElement;
  private readonly target_: HTMLElement;
  private destroyed_: boolean;
  private totalYAdded_: number;

  /**
   * @param target The Element to position as if it were "position: sticky"'d
   *
   *
   * @param container Element to treat as the target's offset parent.
   *
   * Essentially the element that the target should be sticky'd to.
   */
  constructor (target: HTMLElement, container: HTMLElement) {
    this.container_ = container;
    this.target_ = target;
    this.destroyed_ = false;
    this.totalYAdded_ = 0;
    this.init_();
  }

  private init_(): void {
    this.measure_();
    this.renderLoop_();
  }

  private renderLoop_(): void {
    if (this.destroyed_) {
      return;
    }

    renderLoop.scrollMeasure(() => this.measure_());
  }

  // Split out so it can be run on initial load
  private measure_(): void {
    if (this.destroyed_) {
      return;
    }

    renderLoop.scrollCleanup(() => this.renderLoop_());

    const yPosition: number = getVisibleYPosition(this.container_);
    const maxDistance: number =
      this.container_.offsetHeight -
      this.target_.offsetHeight -
      this.target_.offsetTop;

    const rawChange = Math.abs(yPosition) - this.totalYAdded_;
    const clampedChange =
      new NumericRange(-this.totalYAdded_, maxDistance - this.totalYAdded_)
        .clamp(rawChange);

    translate2dOnScrollLoop(this.target_, new Vector2d(0, clampedChange));

    this.totalYAdded_ += clampedChange;
  }

  public destroy() {
    this.destroyed_ = true;
  }
}

export {Sticky};
