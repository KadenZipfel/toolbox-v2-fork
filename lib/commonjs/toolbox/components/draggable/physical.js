"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var base_1 = require("./base");
var _2d_1 = require("../physical/2d");
var vector_2d_1 = require("../../utils/math/geometry/vector-2d");
var event_handler_1 = require("../../utils/event/event-handler");
var drag_start_1 = require("./events/drag-start");
var drag_end_1 = require("./events/drag-end");
var drag_1 = require("./events/drag");
var move_event_1 = require("../physical/move-event");
var defaultPhysicallyDraggableConfig = {
    acceleration: new vector_2d_1.Vector2d(0, 0),
    accelerationExponent: .5,
    draggableConstraints: [],
    maxVelocity: 10,
    physicalConstraints: [],
};
var PhysicallyDraggable = (function () {
    function PhysicallyDraggable(target, _a) {
        var _b = _a.acceleration, acceleration = _b === void 0 ? defaultPhysicallyDraggableConfig.acceleration : _b, _c = _a.accelerationExponent, accelerationExponent = _c === void 0 ? defaultPhysicallyDraggableConfig.accelerationExponent : _c, _d = _a.draggableConstraints, draggableConstraints = _d === void 0 ? defaultPhysicallyDraggableConfig.draggableConstraints : _d, _e = _a.maxVelocity, maxVelocity = _e === void 0 ? defaultPhysicallyDraggableConfig.maxVelocity : _e, _f = _a.physicalConstraints, physicalConstraints = _f === void 0 ? defaultPhysicallyDraggableConfig.physicalConstraints : _f;
        this.physical2d_ =
            new _2d_1.Physical2D(target, {
                acceleration: acceleration,
                accelerationExponent: accelerationExponent,
                constraints: physicalConstraints,
                maxVelocity: maxVelocity,
            });
        this.draggable_ =
            new base_1.Draggable(target, { constraints: draggableConstraints });
        this.init_();
    }
    PhysicallyDraggable.prototype.init_ = function () {
        var _this = this;
        event_handler_1.eventHandler.addListener(this.draggable_, drag_start_1.DragStart, function (event) {
            _this.physical2d_.disable();
            event_handler_1.eventHandler.dispatchEvent(new drag_start_1.DragStart(_this));
        });
        event_handler_1.eventHandler.addListener(this.draggable_, drag_1.Drag, function (event) {
            _this.physical2d_.setVelocity(event.getDelta());
            event_handler_1.eventHandler
                .dispatchEvent(new drag_1.Drag(_this, _this.getElement(), event.getDelta()));
        });
        event_handler_1.eventHandler.addListener(this.physical2d_, move_event_1.Move, function (event) {
            return event_handler_1.eventHandler
                .dispatchEvent(new move_event_1.Move(_this, _this.getElement(), event.getVector()));
        });
        event_handler_1.eventHandler.addListener(this.draggable_, drag_end_1.DragEnd, function (event) {
            _this.physical2d_.enable();
            event_handler_1.eventHandler.dispatchEvent(new drag_end_1.DragEnd(_this));
        });
    };
    PhysicallyDraggable.prototype.getElement = function () {
        return this.draggable_.getElement();
    };
    return PhysicallyDraggable;
}());
exports.PhysicallyDraggable = PhysicallyDraggable;
//# sourceMappingURL=physical.js.map