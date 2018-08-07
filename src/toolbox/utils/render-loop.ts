import {DynamicDefaultMap} from './map/dynamic-default';

class RenderStep {
  public static readonly CLEANUP = Symbol('Cleanup');
  public static readonly FRAME_COUNT = Symbol('Frame Count');
  public static readonly MEASURE = Symbol('Measure');
  public static readonly MUTATE = Symbol('Mutate');
  public static readonly PRE_MEASURE = Symbol('Pre-measure');
  public static readonly SCROLL_MEASURE = Symbol('Scroll-measure');
  public static readonly SCROLL_MUTATE = Symbol('Scroll-mutate');
  public static readonly SCROLL_CLEANUP = Symbol('Scroll-cleanup');
}

const STEP_ORDER: Array<symbol> = [
  RenderStep.FRAME_COUNT,
  RenderStep.PRE_MEASURE,
  RenderStep.MEASURE,
  RenderStep.MUTATE,
  RenderStep.CLEANUP,
];

const SCROLL_STEP_ORDER: Array<symbol> = [
  RenderStep.SCROLL_MEASURE,
  RenderStep.SCROLL_MUTATE,
  RenderStep.SCROLL_CLEANUP,
];

class RenderFunctionID {
  private step_: symbol;

  constructor(step: symbol) {
    this.step_ = step;
  }

  get step() {
    return this.step_;
  }
}

type RenderFunction = () => void;
type RenderFunctionMap = Map<RenderFunctionID, RenderFunction>;

class RenderLoop {
  private static singleton_: RenderLoop = null;

  private msPerFrame_: number;
  private scheduledFns_: DynamicDefaultMap<symbol, RenderFunctionMap>;

  constructor() {
    this.scheduledFns_ =
      DynamicDefaultMap
        .usingFunction<symbol, RenderFunctionMap>(
          (unused: symbol) => new Map<RenderFunctionID, RenderFunction>());
    this.msPerFrame_ = 0;
    window.addEventListener('scroll', () => this.runScrollLoop_());
    this.runLoop_();
  }

  public framecount(fn: RenderFunction): RenderFunctionID {
    return this.addFnToStep_(fn, RenderStep.FRAME_COUNT);
  }

  public premeasure(fn: RenderFunction): RenderFunctionID {
    return this.addFnToStep_(fn, RenderStep.PRE_MEASURE)
  }

  public measure(fn: RenderFunction): RenderFunctionID {
    return this.addFnToStep_(fn, RenderStep.MEASURE);
  }

  public mutate(fn: RenderFunction): RenderFunctionID {
    return this.addFnToStep_(fn, RenderStep.MUTATE);
  }

  public cleanup(fn: RenderFunction): RenderFunctionID {
    return this.addFnToStep_(fn, RenderStep.CLEANUP);
  }

  public scrollMeasure(fn: RenderFunction): RenderFunctionID {
    return this.addFnToStep_(fn, RenderStep.SCROLL_MEASURE);
  }

  public scrollMutate(fn: RenderFunction): RenderFunctionID {
    return this.addFnToStep_(fn, RenderStep.SCROLL_MUTATE);
  }

  scrollCleanup(fn: RenderFunction): RenderFunctionID {
    return this.addFnToStep_(fn, RenderStep.SCROLL_CLEANUP);
  }

  public setFps(fps: number): void {
    this.msPerFrame_ = 1000 / fps;
  }

  private addFnToStep_(fn: RenderFunction, step: symbol): RenderFunctionID {
    const renderFn = new RenderFunctionID(step);
    this.scheduledFns_.get(step).set(renderFn, fn);
    return renderFn;
  }

  private static getTimeUntilNextRun_(nextRun: number): number {
    return nextRun - <number>new Date().valueOf();
  }

  private runLoop_(): void {
    const nextRun = <number>new Date().valueOf() + this.msPerFrame_;
    this.runFns_();
    if (RenderLoop.getTimeUntilNextRun_(nextRun) > 2) {
      setTimeout(
        () => window.requestAnimationFrame(() => this.runLoop_()),
        RenderLoop.getTimeUntilNextRun_(nextRun));
    } else {
      window.requestAnimationFrame(() => this.runLoop_())
    }
  }

  private runScrollLoop_(): void {
    this.runScrollFns_();
  }

  private runScrollFns_(): void {
    SCROLL_STEP_ORDER.forEach((step) => this.runFnsForStep_(step));
  }

  private runFns_(): void {
    STEP_ORDER.forEach((step) => this.runFnsForStep_(step));
  }

  private runFnsForStep_(step: symbol): void {
    const fns = this.scheduledFns_.get(step).values();
    let nextFn;
    while (nextFn = fns.next().value) {
      nextFn();
    }
    this.scheduledFns_.set(step, new Map());
  }

  public clear(renderFn: RenderFunctionID): void {
    this.scheduledFns_.get(renderFn.step).delete(renderFn);
  }

  public static getSingleton(): RenderLoop {
    return RenderLoop.singleton_ = RenderLoop.singleton_ || new this();
  }
}

const renderLoop = RenderLoop.getSingleton();
export {renderLoop};
