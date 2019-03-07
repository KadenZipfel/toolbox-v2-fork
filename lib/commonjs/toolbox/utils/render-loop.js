"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var RenderStep = (function () {
    function RenderStep() {
    }
    RenderStep.CLEANUP = Symbol('Cleanup');
    RenderStep.FRAME_COUNT = Symbol('Frame Count');
    RenderStep.MEASURE = Symbol('Measure');
    RenderStep.PHYSICS = Symbol('Physics');
    RenderStep.MUTATE = Symbol('Mutate');
    RenderStep.PRE_MEASURE = Symbol('Pre-measure');
    return RenderStep;
}());
var STEP_ORDER = [
    RenderStep.FRAME_COUNT,
    RenderStep.PRE_MEASURE,
    RenderStep.MEASURE,
    RenderStep.PHYSICS,
    RenderStep.MUTATE,
    RenderStep.CLEANUP,
];
var RenderFunctionID = (function () {
    function RenderFunctionID(step) {
        this.step_ = step;
    }
    Object.defineProperty(RenderFunctionID.prototype, "step", {
        get: function () {
            return this.step_;
        },
        enumerable: true,
        configurable: true
    });
    return RenderFunctionID;
}());
var RenderLoop = (function () {
    function RenderLoop() {
        var _this = this;
        this.rafCallback_ = null;
        this.scheduledFns_ = new Map();
        this.lastRun_ = performance.now();
        this.scrollCallbackFn_ = function () { _this.scrollLoop_(); };
        this.init_();
    }
    RenderLoop.prototype.init_ = function () {
        var _this = this;
        STEP_ORDER.forEach(function (step) { return _this.scheduledFns_.set(step, new Map()); });
        window.addEventListener('scroll', function () {
            _this.scrollLoop_();
        }, { capture: false, passive: true, once: true });
        this.frameLoop_(performance.now());
    };
    RenderLoop.prototype.framecount = function (fn) {
        return this.addFnToStep_(fn, RenderStep.FRAME_COUNT);
    };
    RenderLoop.prototype.premeasure = function (fn) {
        return this.addFnToStep_(fn, RenderStep.PRE_MEASURE);
    };
    RenderLoop.prototype.measure = function (fn) {
        return this.addFnToStep_(fn, RenderStep.MEASURE);
    };
    RenderLoop.prototype.physics = function (fn) {
        return this.addFnToStep_(fn, RenderStep.PHYSICS);
    };
    RenderLoop.prototype.mutate = function (fn) {
        return this.addFnToStep_(fn, RenderStep.MUTATE);
    };
    RenderLoop.prototype.cleanup = function (fn) {
        return this.addFnToStep_(fn, RenderStep.CLEANUP);
    };
    RenderLoop.prototype.addFnToStep_ = function (fn, step) {
        var renderFn = new RenderFunctionID(step);
        this.scheduledFns_.get(step).set(renderFn, fn);
        return renderFn;
    };
    RenderLoop.prototype.runLoop = function (currentTime) {
        if (currentTime === void 0) { currentTime = null; }
        this.currentRun_ = currentTime || performance.now();
        this.runFns_();
        this.lastRun_ = this.currentRun_;
    };
    RenderLoop.prototype.scrollLoop_ = function () {
        var currentTime = performance.now();
        if (currentTime - this.lastRun_ < 16) {
            return;
        }
        window.cancelAnimationFrame(this.rafCallback_);
        this.runLoop(currentTime);
        this.enableListeners_();
    };
    RenderLoop.prototype.enableListeners_ = function () {
        var _this = this;
        this.rafCallback_ =
            window.requestAnimationFrame(function (frameTime) { _this.frameLoop_(frameTime); });
        window.addEventListener('scroll', function () {
            _this.scrollLoop_();
        }, { capture: false, passive: true, once: true });
    };
    RenderLoop.prototype.frameLoop_ = function (currentTime) {
        this.runLoop(currentTime);
        this.enableListeners_();
    };
    RenderLoop.prototype.getElapsedMilliseconds = function () {
        return this.currentRun_ - this.lastRun_;
    };
    RenderLoop.prototype.getElapsedSeconds = function () {
        return this.getElapsedMilliseconds() / 1000;
    };
    RenderLoop.prototype.runFns_ = function () {
        var _this = this;
        STEP_ORDER.forEach(function (step) { return _this.runFnsForStep_(step); });
    };
    RenderLoop.prototype.runFnsForStep_ = function (step) {
        var fns = this.scheduledFns_.get(step).values();
        var nextFn;
        while (nextFn = fns.next().value) {
            nextFn();
        }
        this.scheduledFns_.set(step, new Map());
    };
    RenderLoop.prototype.clear = function (renderFn) {
        this.scheduledFns_.get(renderFn.step).delete(renderFn);
    };
    RenderLoop.getSingleton = function () {
        return RenderLoop.singleton_ = RenderLoop.singleton_ || new this();
    };
    RenderLoop.prototype.runScrollLoop = function () {
        console.log('"runScrollLoop" is deprecated. Scroll and frame loops have been consolidated to avoid conflicts. Please use "runLoop" instead.');
        this.runLoop();
    };
    RenderLoop.prototype.scrollPremeasure = function (fn) {
        console.log('"renderLoop.scrollPremeasure" is deprecated. Please use "renderLoop.premeasure" instead');
        return this.premeasure(fn);
    };
    RenderLoop.prototype.scrollMeasure = function (fn) {
        console.log('"renderLoop.scrollMeasure" is deprecated. Please use "renderLoop.measure" instead');
        return this.measure(fn);
    };
    RenderLoop.prototype.scrollMutate = function (fn) {
        console.log('"renderLoop.scrollMutate" is deprecated. Please use "renderLoop.mutate" instead');
        return this.mutate(fn);
    };
    RenderLoop.prototype.scrollCleanup = function (fn) {
        console.log('"renderLoop.cleanup" is deprecated. Please use "renderLoop.cleanup" instead');
        return this.cleanup(fn);
    };
    RenderLoop.prototype.anyMutate = function (fn) {
        console.log('"renderLoop.anyMutate" is deprecated. Please use "renderLoop.mutate" instead');
        return this.mutate(fn);
    };
    RenderLoop.prototype.setFps = function () {
        console.log('"renderLoop.setFps" has been deprecated to remove timeout processing. "renderLoop" now runs at maximal frame rate.');
    };
    RenderLoop.prototype.getFps = function () {
        console.log('"renderLoop.getFps" has been deprecated to remove timeout processing. "renderLoop" now runs at maximal frame rate.');
    };
    RenderLoop.prototype.getMsPerFrame = function () {
        console.log('"renderLoop.getMsPerFrame" has been deprecated to remove timeout processing. "renderLoop" now runs at maximal frame rate.');
    };
    RenderLoop.prototype.getTargetFrameLength = function () {
        console.log('"renderLoop.getTargetFrameLength" has been deprecated to remove timeout processing. "renderLoop" now runs at maximal frame rate.');
    };
    RenderLoop.singleton_ = null;
    return RenderLoop;
}());
var renderLoop = RenderLoop.getSingleton();
exports.renderLoop = renderLoop;
//# sourceMappingURL=render-loop.js.map