"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var dynamic_default_1 = require("./map/dynamic-default");
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
        this.running_ = false;
        this.scheduledFns_ =
            dynamic_default_1.DynamicDefaultMap
                .usingFunction(function (unused) { return new Map(); });
        this.msPerFrame_ = 33;
        this.lastRun_ = new Date();
        window.addEventListener('scroll', function () { return _this.runLoop(); });
        this.frameLoop_();
    }
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
    RenderLoop.prototype.setFps = function (fps) {
        this.msPerFrame_ = 1000 / fps;
    };
    RenderLoop.prototype.getFps = function () {
        return 1000 / this.msPerFrame_;
    };
    RenderLoop.prototype.getMsPerFrame = function () {
        return this.msPerFrame_;
    };
    RenderLoop.prototype.getTargetFrameLength = function () {
        return this.msPerFrame_;
    };
    RenderLoop.prototype.runLoop = function () {
        if (this.running_) {
            return;
        }
        this.running_ = true;
        this.currentRun_ = new Date();
        this.runFns_();
        this.lastRun_ = this.currentRun_;
        this.running_ = false;
    };
    RenderLoop.prototype.frameLoop_ = function () {
        var _this = this;
        this.runLoop();
        window.requestAnimationFrame(function () { return _this.frameLoop_(); });
    };
    RenderLoop.getTimeUntilNextRun_ = function (nextRun) {
        return nextRun - new Date().valueOf();
    };
    RenderLoop.prototype.getElapsedMilliseconds = function () {
        return this.currentRun_.valueOf() - this.lastRun_.valueOf();
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
    RenderLoop.singleton_ = null;
    return RenderLoop;
}());
var renderLoop = RenderLoop.getSingleton();
exports.renderLoop = renderLoop;
//# sourceMappingURL=render-loop.js.map