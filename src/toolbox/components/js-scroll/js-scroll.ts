import {Vector2d} from "../../utils/math/geometry/vector-2d";
import {applyScroll} from "../../utils/dom/position/apply-scroll";
import {UserAgent} from "../../utils/user-agent/user-agent";
import {IE} from "../../utils/user-agent/browser/ie";

const thirdEventListenerParam =
  UserAgent.getBrowser() === IE ?
    true : {passive: false, capture: true, once: false};

class JsScroll {
  private readonly wheelHandler_: (e: WheelEvent) => void;
  private initializationCount_: number;

  constructor() {
    this.initializationCount_ = 0;
    this.wheelHandler_ = (e) => this.scrollManually_(e);
  }

  public init(): void {
    if (this.initializationCount_ === 0) {
      window.addEventListener(
        'wheel', this.wheelHandler_, thirdEventListenerParam);
    }
    this.initializationCount_++;
  }

  private scrollManually_(e: WheelEvent): void {
    e.preventDefault();
    applyScroll(Vector2d.fromWheelEvent(e));
  }

  public destroy(): void {
    this.initializationCount_--;
    if (this.initializationCount_ === 0) {
      window.removeEventListener(
        'wheel', this.wheelHandler_, thirdEventListenerParam);
    }
  }
}

const jsScroll = new JsScroll();

export {jsScroll};
