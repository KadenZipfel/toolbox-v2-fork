import { DynamicDefaultMap } from '../map/dynamic-default';
import { MultiValueDynamicDefaultMap } from '../map/multi-value-dynamic-default';
import { Vector } from '../math/geometry/vector';
import { renderLoop } from '../render-loop';
var VALUE_LIMIT = 2;
var caches = DynamicDefaultMap.usingFunction(function (Class) {
    return MultiValueDynamicDefaultMap.usingFunction(function () {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        return new (Class.bind.apply(Class, [void 0].concat(args)))();
    });
});
var CachedElementVector = (function () {
    function CachedElementVector(element) {
        if (element === void 0) { element = null; }
        var args = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            args[_i - 1] = arguments[_i];
        }
        var instanceByElement = caches.get(this.constructor);
        if (instanceByElement.has([element].concat(args))) {
            if (element) {
                console.error('Please use getForElement instead of new.');
            }
            else {
                console.error('Please use getSingleton instead of new.');
            }
        }
        this.element = element;
        this.values = [new (this[Symbol.species].getVectorClass())()];
        this.init();
    }
    CachedElementVector.getVectorClass = function () {
        return Vector;
    };
    CachedElementVector.prototype.init = function () {
        var _this = this;
        renderLoop.measure(function () { return _this.measureValues(); });
        this.render();
    };
    CachedElementVector.prototype.getLastValue = function () {
        return this.values.slice(-1)[0];
    };
    CachedElementVector.prototype.getValues = function () {
        console.error('getValues must be overridden by child class');
        return [];
    };
    CachedElementVector.prototype.getCurrentVector = function () {
        return new ((_a = (this[Symbol.species].getVectorClass())).bind.apply(_a, [void 0].concat(this.getValues())))();
        var _a;
    };
    CachedElementVector.prototype.render = function () {
        var _this = this;
        renderLoop.premeasure(function () {
            _this.measureValues();
            renderLoop.cleanup(function () { return _this.render(); });
        });
    };
    CachedElementVector.prototype.measureValues = function () {
        this.values =
            this.values
                .slice(-(this[Symbol.species].getValueLimit() - 1))
                .concat([this.getCurrentVector()]);
    };
    CachedElementVector.prototype.getCurrentAndLastValue = function () {
        return this.values.slice(-2);
    };
    CachedElementVector.prototype.getDelta = function () {
        var values = this.getCurrentAndLastValue();
        return this[Symbol.species].getVectorClass()
            .subtract(values[0], values[1]);
    };
    CachedElementVector.prototype.hasChanged = function () {
        return !(_a = this[Symbol.species].getVectorClass()).areEqual.apply(_a, this.getCurrentAndLastValue());
        var _a;
    };
    CachedElementVector.getValueLimit = function () {
        return VALUE_LIMIT;
    };
    CachedElementVector.getForElement = function () {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        return (_a = caches.get(this)).get.apply(_a, args);
        var _a;
    };
    CachedElementVector.getSingleton = function () {
        return caches.get(this).get(null);
    };
    Object.defineProperty(CachedElementVector.prototype, Symbol.species, {
        get: function () {
            return this.constructor;
        },
        enumerable: true,
        configurable: true
    });
    return CachedElementVector;
}());
export { CachedElementVector };
//# sourceMappingURL=cached-element-vector.js.map