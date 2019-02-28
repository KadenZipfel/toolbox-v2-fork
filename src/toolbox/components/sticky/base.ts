import {NumericRange} from "../../utils/math/numeric-range";
import {getVisibleYPosition} from "../../utils/dom/position/vertical/get-visible-y-position";
import {renderLoop} from "../../utils/render-loop";
import {getOffsetFromAncestor} from "../../utils/dom/position/get-offset-from-ancestor";
import {Vector2d} from "../../utils/math/geometry/vector-2d";
import {Dimensions2d} from "../../utils/math/geometry/dimensions-2d";

/**
 * TODO(Angus)
 *
 * Use the target's computed style and apply it as inline styles to a div.
 * Stick that div into the container in place of the target when the target is fixed.
 * Remove that div from the container when the target stops being fixed.
 * This should keep the container's sizing constant.
 *
 * Translate the element based on the
 *
 * .... screw all that.
 *
 *
 * Here's the new rules:
 *
 * Container size should be independent of the Sticky element.
 * Which is to say that if the sticky element can change the computed style of
 * its container, this component WILL NOT WORK.
 *
 * On load add a fixed div that per-frame matches the dimensions of the
 * given container. Fixed div will stay fixed at top: 0 and left: 0 but will
 * apply a translateX to match the left edge of the container.
 *
 * When in the MIDDLE position, append the target to the fixed div.
 * In other positions append the target to the original parent.
 *
 * Remove the need to specify the container, assume it is always the offsetParent
 * of the target.
 *
 * WON'T WORK. STICKY KEEPS OTHER ELEMENTS IN FLOW, SO WE HAVE TO KEEP THEM IN FLOW.
 *
 *
 * NEW NEW PLAN: !!!!!
 *
 * Clone target. Place clone in-place of target with visibility: hidden
 *
 * Keep clone inner-html up to date per frame.
 *
 * Position target absolutely. Use left-right to keep it on top of clone.
 *
 * When in MIDDLE position it fixed and match the width/height to the clone.
 *
 * Should prevent emergency thrashing and provide a basis to pull MIDDLE values
 * from.
 *
 */

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
  private lastContainerDimensions_: Dimensions2d;
  private appliedVector_: Vector2d;
  private cachedTargetOffsetTop_: number;

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
    this.appliedVector_ = new Vector2d(0, 0);
    this.lastWindowDimensions_ = Dimensions2d.fromInnerWindow();
    this.lastContainerDimensions_ = Dimensions2d.fromElementOffset(container);
    this.cachedTargetOffsetTop_ = this.target_.offsetTop;
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

    renderLoop.scrollMeasure(() => {
      renderLoop.scrollCleanup(() => this.renderLoop_());
      this.measure_()
    });
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
    const windowDimensions_ = Dimensions2d.fromInnerWindow();
    const containerDimensions_ =
      Dimensions2d.fromElementOffset(this.container_);

    if (
      windowDimensions_ != this.lastWindowDimensions_ ||
      containerDimensions_ != this.lastContainerDimensions_
    ) {
      this.clearInlineStyles_();
      this.cachedTargetOffsetTop_ = this.target_.offsetTop;
    }

    const yPosition: number = getVisibleYPosition(this.container_);
    const maxDistance: number =
      this.container_.offsetHeight -
      this.target_.offsetHeight -
      this.cachedTargetOffsetTop_;
    const shouldPin = new NumericRange(0, maxDistance).contains(-yPosition);
    const position = this.getPosition_(shouldPin, yPosition);
    const containerXOffset: number =
      getOffsetFromAncestor(this.container_, null).x;

    // Skip duplicating work
    if (this.lastPosition_ === position) {
      return;
    }

    renderLoop.scrollMutate(() => {
      // Determine if the target should stick
      if (position === ContainerPosition.TOP) {
        this.positionTop_();
      }
      else if (position === ContainerPosition.MIDDLE) {
        this.positionMiddle_(containerXOffset);
      }
      else if (position === ContainerPosition.BOTTOM) {
        this.positionBottom_(maxDistance);
      }

      this.lastPosition_ = position;
    });
  }

  private clearInlineStyles_(): void {
    this.target_.style.position = '';
    this.target_.style.transform = '';
  }

  private positionTop_(): void {
    this.clearInlineStyles_();
  }

  private positionMiddle_(containerXOffset: number): void {
    this.target_.style.position = 'fixed';
    this.target_.style.transform = `translateX(${containerXOffset}px)`;
  }

  private positionBottom_(maxDistance: number): void {
    this.target_.style.position = 'absolute';
    this.target_.style.transform = `translateY(${maxDistance}px)`;
  }

  public destroy() {
    this.destroyed_ = true;
  }
}

export {Sticky};
