import {NumericRange} from "../../utils/math/numeric-range";
import {getVisibleYPosition} from "../../utils/dom/position/vertical/get-visible-y-position";
import {renderLoop} from "../../utils/render-loop";
import {getVisibleDistanceFromRoot} from "../../utils/dom/position/get-visible-distance-from-root";
import {Vector2d} from "../../utils/math/geometry/vector-2d";
import {getVisibleDistanceBetweenElements} from "../../utils/dom/position/get-visible-distance-between-elements";
import {Scroll} from "../../utils/cached-vectors/scroll";
import {Dimensions2d} from "../../utils/math/geometry/dimensions-2d";

/**
 * Positions the the element could be sticking to within the container.
 *
 * How the target element is positioned by sticky will change depending on
 * whether its container is showing its top, middle or bottom most prominently.
 *
 * @hidden
 */
class ContainerPosition {
  public static TOP: Symbol = Symbol('top');
  public static MIDDLE: Symbol = Symbol('middle');
  public static BOTTOM: Symbol = Symbol('bottom');
}

/**
 * Simulates `position: sticky` when native support isn't available due to
 * `overflow: hidden` on parent elements.
 */
class Sticky {
  private readonly container_: HTMLElement;
  private readonly target_: HTMLElement;
  private destroyed_: boolean;
  private lastPosition_: Symbol;
  private lastWindowDimensions_: Dimensions2d;

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
    this.lastPosition_ = null;
    this.destroyed_ = false;
    this.lastWindowDimensions_ = Dimensions2d.fromInnerWindow();
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

  private getPosition_(shouldPin: boolean, yPosition: number): Symbol {
    if (shouldPin) {
      return ContainerPosition.MIDDLE;
    } else if (yPosition < 0) {
      return ContainerPosition.BOTTOM;
    } else {
      return ContainerPosition.TOP;
    }
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
    const shouldPin = new NumericRange(0, maxDistance).contains(-yPosition);
    const position = this.getPosition_(shouldPin, yPosition);
    const windowDimensions = Dimensions2d.fromInnerWindow();

    // Skip duplicating work
    if (this.lastPosition_ === position) {
      return;
    }

    // Determine if the target should stick
    if (position === ContainerPosition.TOP) {
      this.positionTop_();
    }
    else {
      if (
        this.lastPosition_ !== ContainerPosition.TOP ||
        !this.lastWindowDimensions_.equals(windowDimensions)
      ) {
        this.positionTop_(); // Necessary thrashing. :(
      }

      const oldPositionFromContainer =
        getVisibleDistanceBetweenElements(this.target_, this.container_);
      const oldPositionFromWindow =
        getVisibleDistanceFromRoot(this.target_);
      const originalSizing = Dimensions2d.fromElementOffset(this.target_);


      if (position === ContainerPosition.MIDDLE) {
        this.positionMiddle_();
      }
      else if (position === ContainerPosition.BOTTOM) {
        this.positionBottom_();
      }

      // More necessary thrashing :(
      const newPositionFromWindow =
        getVisibleDistanceFromRoot(this.target_);

      const desiredPositionFromWindow =
        new Vector2d(oldPositionFromWindow.x, oldPositionFromContainer.y);
      const finalAdjustment =
        newPositionFromWindow.subtract(desiredPositionFromWindow);

      // Avoid thrashing the final update
      renderLoop.scrollMutate(() => {
        finalAdjustment.positionElementByTranslation(this.target_);
        originalSizing.sizeElement(this.target_);
      });
    }

    this.lastPosition_ = position;
    this.lastWindowDimensions_ = windowDimensions;
  }

  private positionTop_(): void {
    this.target_.style.position = '';
    this.target_.style.width = '';
    this.target_.style.height = '';
    this.target_.style.transform = '';
  }

  private positionMiddle_(): void {
    this.target_.style.position = 'fixed';
  }

  private positionBottom_(): void {
    this.target_.style.position = 'absolute';
  }

  public destroy() {
    this.destroyed_ = true;
  }
}

export {Sticky};
