"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var event_type_1 = require("../dom/event/event-type");
var vector_2d_1 = require("../math/geometry/vector-2d");
var add_dom_event_listener_1 = require("../dom/event/add-dom-event-listener");
var filter_until_false_1 = require("../array/filter-until-false");
var filter_until_first_1 = require("../array/filter-until-first");
var frame_1 = require("../frame");
var render_loop_1 = require("../render-loop");
var zero_vector_2d_1 = require("../math/geometry/zero-vector-2d");
var GESTURE_TIME_LIMIT = 1000;
var POSITION_LIMIT = 100;
var CursorPosition = (function () {
    function CursorPosition(position, pressed) {
        this.position_ = position;
        this.pressed_ = pressed;
        this.frame_ = frame_1.frame.getFrame();
        this.time_ = new Date();
    }
    CursorPosition.fromXY = function (x, y, pressed) {
        return new this(new vector_2d_1.Vector2d(x, y), pressed);
    };
    CursorPosition.prototype.getFrame = function () {
        return this.frame_;
    };
    CursorPosition.prototype.isForFrame = function () {
        var frames = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            frames[_i] = arguments[_i];
        }
        return frames.indexOf(this.getFrame()) !== -1;
    };
    CursorPosition.prototype.isPressed = function () {
        return this.pressed_;
    };
    CursorPosition.prototype.getPosition = function () {
        return this.position_;
    };
    CursorPosition.prototype.getTime = function () {
        return this.time_;
    };
    return CursorPosition;
}());
var ZERO_POSITION = new CursorPosition(zero_vector_2d_1.ZERO_VECTOR_2D, false);
var CursorData = (function () {
    function CursorData(currentPosition) {
        if (currentPosition === void 0) { currentPosition = ZERO_POSITION; }
        var pastPositions = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            pastPositions[_i - 1] = arguments[_i];
        }
        this.positions_ = [currentPosition].concat(pastPositions);
    }
    CursorData.prototype.update = function (position) {
        return new (CursorData.bind.apply(CursorData, [void 0, position].concat(this.positions_.slice(0, POSITION_LIMIT - 1))))();
    };
    CursorData.prototype.getLatestPosition = function () {
        return this.positions_[0];
    };
    CursorData.prototype.getPosition = function () {
        return this.getLatestPosition().getPosition();
    };
    CursorData.prototype.getFrameDelta = function () {
        return this.getFrameDelta_(false);
    };
    CursorData.prototype.getPressedFrameDelta = function () {
        return this.getFrameDelta_(true);
    };
    CursorData.prototype.getFrameDelta_ = function (usePressedPositionsOnly) {
        var positions = this.getPositionsForFrameDelta_(usePressedPositionsOnly);
        return positions.length === 0 ?
            zero_vector_2d_1.ZERO_VECTOR_2D : vector_2d_1.Vector2d.sumDeltas.apply(vector_2d_1.Vector2d, positions.map(function (position) { return position.getPosition(); }));
    };
    CursorData.prototype.getPositionsForFrameDelta_ = function (usePressedPositionsOnly) {
        var currentFrame = frame_1.frame.getFrame();
        if (!this.getLatestPosition().isForFrame(currentFrame)) {
            return [];
        }
        var isPreviousFrame = function (position) { return !position.isForFrame(currentFrame); };
        var positionsToConsider = filter_until_first_1.filterUntilFirst(this.positions_, isPreviousFrame);
        if (usePressedPositionsOnly) {
            var isPressed = function (position) { return position.isPressed(); };
            return filter_until_false_1.filterUntilFalse(positionsToConsider, isPressed);
        }
        else {
            return positionsToConsider;
        }
    };
    CursorData.prototype.getGestureDelta = function () {
        return CursorData.getGestureDeltaFromPositions_.apply(CursorData, this.positions_);
    };
    CursorData.prototype.getPressedGestureDelta = function () {
        return CursorData.getGestureDeltaFromPositions_.apply(CursorData, this.getPressedGesturePositions_());
    };
    CursorData.prototype.getLastFrameVelocity = function () {
        var framesWithTimeDifference = this.getFramesWithTimeDifference_();
        var firstFrame = framesWithTimeDifference[0];
        var lastFrame = framesWithTimeDifference.slice(-1)[0];
        var frameDeltaInSeconds = (firstFrame.getTime().valueOf() - lastFrame.getTime().valueOf()) /
            1000;
        return this.getLastFrameDelta().scale(1 / frameDeltaInSeconds);
    };
    CursorData.prototype.getLastFrameDelta = function () {
        var framesWithTimeDifference = this.getFramesWithTimeDifference_();
        var firstFrame = framesWithTimeDifference[0];
        var lastFrame = framesWithTimeDifference.slice(-1)[0];
        return firstFrame.getPosition().subtract(lastFrame.getPosition());
    };
    CursorData.prototype.getFramesWithTimeDifference_ = function () {
        var firstPosition = this.positions_[0];
        var positionWithDifference = this.positions_
            .find(function (position) {
            return position.getTime().valueOf() !==
                firstPosition.getTime().valueOf();
        });
        return this.positions_
            .slice(0, this.positions_.indexOf(positionWithDifference) + 1);
    };
    CursorData.prototype.getPressedGesturePositions_ = function () {
        var currentTime = new Date().valueOf();
        var conditionFn = function (position) {
            var timeDiff = currentTime - position.getTime().valueOf();
            return timeDiff < GESTURE_TIME_LIMIT && position.isPressed();
        };
        return filter_until_false_1.filterUntilFalse(this.positions_, conditionFn);
    };
    CursorData.getGestureDeltaFromPositions_ = function () {
        var positions = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            positions[_i] = arguments[_i];
        }
        var deltas = vector_2d_1.Vector2d.getDeltas.apply(vector_2d_1.Vector2d, positions.map(function (position) { return position.getPosition(); }));
        var scaledDeltas = deltas.map(function (delta, index) { return delta.scale((deltas.length - index) / deltas.length); });
        return vector_2d_1.Vector2d.add.apply(vector_2d_1.Vector2d, scaledDeltas);
    };
    return CursorData;
}());
var Cursor = (function () {
    function Cursor() {
        this.clientPosition = new CursorData();
        this.pagePosition = new CursorData();
        this.screenPosition = new CursorData();
        this.pressed = false;
        this.frame = 0;
        this.init_();
    }
    Cursor.prototype.init_ = function () {
        var _this = this;
        add_dom_event_listener_1.addDomEventListener(window, event_type_1.EventType.CURSOR_DOWN, function (event) { return _this.updatePress_(event, true); });
        add_dom_event_listener_1.addDomEventListener(window, event_type_1.EventType.CURSOR_UP, function (event) { return _this.updatePress_(event, false); });
        add_dom_event_listener_1.addDomEventListener(window, event_type_1.EventType.CURSOR_MOVE, function (event) { return _this.updatePosition_(event); });
    };
    Cursor.getSingleton = function () {
        return this.singleton = this.singleton || new this();
    };
    Cursor.prototype.isPressed = function () {
        return this.pressed;
    };
    Cursor.prototype.getClient = function () {
        return this.clientPosition;
    };
    Cursor.prototype.getPage = function () {
        return this.pagePosition;
    };
    Cursor.prototype.getScreen = function () {
        return this.screenPosition;
    };
    Cursor.prototype.updatePress_ = function (event, isPressed) {
        this.pressed = isPressed;
        this.updatePosition_(event);
    };
    Cursor.prototype.updatePosition_ = function (event) {
        if (event instanceof MouseEvent) {
            this.updatePositionFromEvent_(event);
        }
        else if (event instanceof TouchEvent) {
            this.updatePositionFromTouchEvent_(event);
        }
    };
    Cursor.prototype.updatePositionFromTouchEvent_ = function (touchEvent) {
        if (touchEvent.touches.length > 0) {
            this.updatePositionFromEvent_(touchEvent.touches[0]);
        }
        else {
            this.endTouch_();
        }
    };
    Cursor.prototype.endTouch_ = function () {
        var _this = this;
        render_loop_1.renderLoop.premeasure(function () {
            _this.pagePosition = _this.duplicatePosition_(_this.pagePosition);
            _this.clientPosition = _this.duplicatePosition_(_this.clientPosition);
            _this.screenPosition = _this.duplicatePosition_(_this.screenPosition);
        });
    };
    Cursor.prototype.updatePositionFromEvent_ = function (event) {
        var _this = this;
        render_loop_1.renderLoop.premeasure(function () {
            _this.pagePosition =
                _this.updatePositionWithXY_(_this.pagePosition, event.pageX, event.pageY);
            _this.clientPosition =
                _this.updatePositionWithXY_(_this.clientPosition, event.clientX, event.clientY);
            _this.screenPosition =
                _this.updatePositionWithXY_(_this.screenPosition, event.screenX, event.screenY);
        });
    };
    Cursor.prototype.duplicatePosition_ = function (position) {
        return position.update(new CursorPosition(position.getPosition(), this.isPressed()));
    };
    Cursor.prototype.updatePositionWithXY_ = function (position, xValue, yValue) {
        return position.update(CursorPosition.fromXY(xValue, yValue, this.isPressed()));
    };
    return Cursor;
}());
var cursor = Cursor.getSingleton();
exports.cursor = cursor;
//# sourceMappingURL=cursor.js.map