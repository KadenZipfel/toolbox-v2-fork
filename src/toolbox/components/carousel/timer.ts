import {renderLoop} from '../../utils/render-loop';
import {Carousel} from "./carousel";

const DEFAULT_INTERVAL: number = 5000;

class CarouselTimer {
  private readonly interval_: number;
  private readonly carousel_: Carousel;
  private lastActionTime_: number;
  private destroyed_: boolean;
  private paused_: boolean;
  private pausedOffset_: number;

  constructor(carousel: Carousel, interval: number = DEFAULT_INTERVAL) {
    this.carousel_ = carousel;
    this.interval_ = interval;
    this.lastActionTime_ = new Date().valueOf();
    this.paused_ = false;
    this.pausedOffset_ = 0;
    this.init_();
  }

  private init_(): void {
    this.startTimeout_();
  }

  private startTimeout_(): void {
    if (this.paused_ || this.destroyed_) {
      return;
    }

    renderLoop.measure(() => {
      if (new Date().valueOf() > +this.lastActionTime_ + this.interval_) {
        this.carousel_.next();
      }
      if (!this.carousel_.isIdle()) {
        this.lastActionTime_ = new Date().valueOf();
      }
      renderLoop.mutate(() => this.startTimeout_());
    });
  }

  public pause() {
    if (this.paused_) {
      return;
    }

    this.paused_ = true;
    this.pausedOffset_ = new Date().valueOf() - this.lastActionTime_;
  }

  public stop() {
    this.pause();
    this.pausedOffset_ = 0;
  }

  public play() {
    if (!this.paused_) {
      return; // Makes multiple calls when playing safe
    }
    this.lastActionTime_ = new Date().valueOf() - this.pausedOffset_;
    this.paused_ = false;
    this.pausedOffset_ = 0;
    this.startTimeout_();
  }

  public destroy() {
    this.destroyed_ = true;
  }
}

export {CarouselTimer};
