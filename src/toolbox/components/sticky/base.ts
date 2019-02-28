import {NumericRange} from "../../utils/math/numeric-range";
import {getVisibleYPosition} from "../../utils/dom/position/vertical/get-visible-y-position";
import {renderLoop} from "../../utils/render-loop";
import {getOffsetFromAncestor} from "../../utils/dom/position/get-offset-from-ancestor";
import {Vector2d} from "../../utils/math/geometry/vector-2d";
import {Dimensions2d} from "../../utils/math/geometry/dimensions-2d";
import {getVisibleDistanceBetweenElements} from "../../utils/dom/position/get-visible-distance-between-elements";
import {getVisibleDistanceFromRoot} from "../../utils/dom/position/get-visible-distance-from-root";
import {getCommonOffsetAncestor} from "../../utils/dom/position/get-common-offset-ancestor";

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
  private readonly clone_: HTMLElement;
  private commonOffsetAncestor_: HTMLElement;
  private destroyed_: boolean;
  private lastPosition_: Symbol;

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
    this.clone_ = document.createElement(target.tagName);
    this.commonOffsetAncestor_ = null;
    this.init_();
  }

  private init_(): void {
    this.clone_.innerHTML = this.target_.innerHTML;
    this.clone_.style.visibility = 'hidden';
    this.target_.style.position = 'absolute';
    this.target_.style.top = '0';
    this.target_.style.left = '0';
    this.target_.style.width = '';
    this.target_.style.height = '';
    this.target_.style.margin = '0';
    this.target_.style.padding = '0';
    this.commonOffsetAncestor_ =
      getCommonOffsetAncestor(this.clone_, this.target_);

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

  private static getPosition_(shouldPin: boolean, yPosition: number): Symbol {
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
    const yPosition: number = getVisibleYPosition(this.container_);
    const maxDistance: number =
      this.container_.offsetHeight -
      this.clone_.offsetHeight -
      this.clone_.offsetTop;
    const shouldPin = new NumericRange(0, maxDistance).contains(-yPosition);
    const position = Sticky.getPosition_(shouldPin, yPosition);

    const cloneDistanceFromAncestor =
      getVisibleDistanceBetweenElements(this.clone_, this.commonOffsetAncestor_);
    const cloneDistanceFromRoot = getVisibleDistanceFromRoot(this.clone_);
    const cloneStyle = window.getComputedStyle(this.clone_);


    // Skip duplicating work
    if (this.lastPosition_ === position) {
      return;
    }

    renderLoop.scrollMutate(() => {
      this.applyCloneStylesToTarget_(cloneStyle);

      // Determine if the target should stick
      if (position === ContainerPosition.TOP) {
        this.target_.style.position = 'absolute';
        cloneDistanceFromAncestor.positionElementByTranslation(this.target_);
      }
      else if (position === ContainerPosition.MIDDLE) {
        this.target_.style.position = 'fixed';
        cloneDistanceFromRoot.positionElementByTranslation(this.target_);
      }
      else if (position === ContainerPosition.BOTTOM) {
        this.target_.style.position = 'absolute';
        cloneDistanceFromAncestor
          .add(new Vector2d(0, maxDistance))
          .positionElementByTranslation(this.target_);
      }

      this.lastPosition_ = position;
    });
  }

  private applyCloneStylesToTarget_(cloneStyles: CSSStyleDeclaration): void {
    this.target_.style.margin = '0';
    this.target_.style.top = '0';
    this.target_.style.bottom = '0';
    this.target_.style.left = '0';
    this.target_.style.right = '0';
    this.target_.style.padding = cloneStyles.padding;
    this.target_.style.width = cloneStyles.width;
    this.target_.style.height = cloneStyles.height;
    this.target_.style.border = cloneStyles.border;
  }

  public destroy() {
    this.destroyed_ = true;
  }
}

export {Sticky};
