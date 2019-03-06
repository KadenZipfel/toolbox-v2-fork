import {DynamicDefaultMap} from './map/dynamic-default';

class RenderStep {
  public static readonly CLEANUP = Symbol('Cleanup');
  public static readonly FRAME_COUNT = Symbol('Frame Count');
  public static readonly MEASURE = Symbol('Measure');
  public static readonly PHYSICS = Symbol('Physics');
  public static readonly MUTATE = Symbol('Mutate');
  public static readonly PRE_MEASURE = Symbol('Pre-measure');
}

const STEP_ORDER: Array<symbol> = [
  RenderStep.FRAME_COUNT,
  RenderStep.PRE_MEASURE,
  RenderStep.MEASURE,
  RenderStep.PHYSICS,
  RenderStep.MUTATE,
  RenderStep.CLEANUP,
];

class RenderFunctionID {
  private readonly step_: symbol;

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

  private lastRun_: Date;
  private currentRun_: Date;
  private scheduledFns_: Map<symbol, RenderFunctionMap>;
  private rafCallback_: number;

  constructor() {
    this.rafCallback_ = null;
    this.scheduledFns_ = new Map<symbol, RenderFunctionMap>();
    this.lastRun_ = new Date();
    this.init_();
  }

  private init_() {
    // Manually setup map instead of using DynamicDefault to avoid performance
    // overhead.
    STEP_ORDER.forEach((step) => this.scheduledFns_.set(step, new Map()));

    // Trigger updates on scroll
    window.addEventListener(
      'scroll', () => {this.scrollLoop_();}, {capture: false, passive: true});
    this.frameLoop_();
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

  public physics(fn: RenderFunction): RenderFunctionID {
    return this.addFnToStep_(fn, RenderStep.PHYSICS);
  }

  public mutate(fn: RenderFunction): RenderFunctionID {
    return this.addFnToStep_(fn, RenderStep.MUTATE);
  }

  public cleanup(fn: RenderFunction): RenderFunctionID {
    return this.addFnToStep_(fn, RenderStep.CLEANUP);
  }

  private addFnToStep_(fn: RenderFunction, step: symbol): RenderFunctionID {
    const renderFn = new RenderFunctionID(step);
    this.scheduledFns_.get(step).set(renderFn, fn);
    return renderFn;
  }

  /**
   * Runs all functions in the render loop.
   *
   * Use with caution!
   * Calling this manually should be avoided if at all possible.
   */
  public runLoop(): void {
    this.currentRun_ = new Date();
    this.runFns_();
    this.lastRun_ = this.currentRun_;
  }

  private scrollLoop_() {
    window.cancelAnimationFrame(this.rafCallback_);
    this.runLoop();
    this.rafCallback_ =
      window.requestAnimationFrame(() => {this.frameLoop_();})
  }

  private frameLoop_() {
    this.runLoop();
    this.rafCallback_ =
      window.requestAnimationFrame(() => {this.frameLoop_();})
  }

  private static getTimeUntilNextRun_(nextRun: number): number {
    return nextRun - <number>new Date().valueOf();
  }

  /**
   * Returns the time since the last render loop in milliseconds
   */
  public getElapsedMilliseconds(): number {
    return this.currentRun_.valueOf() - this.lastRun_.valueOf();
  }

  public getElapsedSeconds(): number {
    return this.getElapsedMilliseconds() / 1000;
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

  /** DEPRECATED */

  public runScrollLoop(): void {
    console.log('"runScrollLoop" is deprecated. Scroll and frame loops have been consolidated to avoid conflicts. Please use "runLoop" instead.');
    this.runLoop();
  }

  public scrollPremeasure(fn: RenderFunction): RenderFunctionID {
    console.log('"renderLoop.scrollPremeasure" is deprecated. Please use "renderLoop.premeasure" instead');
    return this.premeasure(fn);
  }

  public scrollMeasure(fn: RenderFunction): RenderFunctionID {
    console.log('"renderLoop.scrollMeasure" is deprecated. Please use "renderLoop.measure" instead');
    return this.measure(fn);
  }

  public scrollMutate(fn: RenderFunction): RenderFunctionID {
    console.log('"renderLoop.scrollMutate" is deprecated. Please use "renderLoop.mutate" instead');
    return this.mutate(fn);
  }

  public scrollCleanup(fn: RenderFunction): RenderFunctionID {
    console.log('"renderLoop.cleanup" is deprecated. Please use "renderLoop.cleanup" instead');
    return this.cleanup(fn);
  }

  public anyMutate(fn: RenderFunction): RenderFunctionID {
    console.log('"renderLoop.anyMutate" is deprecated. Please use "renderLoop.mutate" instead');
    return this.mutate(fn);
  }

  public setFps(): void {
    console.log('"renderLoop.setFps" has been deprecated to remove timeout processing. "renderLoop" now runs at maximal frame rate.')
  }

  public getFps(): void {
    console.log('"renderLoop.getFps" has been deprecated to remove timeout processing. "renderLoop" now runs at maximal frame rate.')
  }

  public getMsPerFrame(): void {
    console.log('"renderLoop.getMsPerFrame" has been deprecated to remove timeout processing. "renderLoop" now runs at maximal frame rate.')
  }

  public getTargetFrameLength(): void {
    console.log('"renderLoop.getTargetFrameLength" has been deprecated to remove timeout processing. "renderLoop" now runs at maximal frame rate.')
  }
}

const renderLoop = RenderLoop.getSingleton();
export {renderLoop};
