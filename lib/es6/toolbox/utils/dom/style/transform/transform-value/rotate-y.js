var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
import { TransformValueBase } from "./transform-value-base";
import { CSS_ROTATION_CALC_FORMULA_ALLOWED_UNITS, CssRotationCalcFormula } from "../../css-rotation-calc-formula";
import { flatten } from "../../../../array/flatten";
import { generateFilledArray } from "../../../../array/generate-filled-array";
var RotateY = (function (_super) {
    __extends(RotateY, _super);
    function RotateY() {
        var values = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            values[_i] = arguments[_i];
        }
        return _super.call(this, 'rotateY', values) || this;
    }
    RotateY.fromNumbers = function () {
        var values = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            values[_i] = arguments[_i];
        }
        return new (RotateY.bind.apply(RotateY, [void 0].concat(values)))();
    };
    RotateY.fromStyleString = function (value) {
        return new (RotateY.bind.apply(RotateY, [void 0].concat(flatten(TransformValueBase.styleStringToValues(value)
            .map(function (value) { return CssRotationCalcFormula.fromStyleString(value); })
            .map(function (formula) { return formula.toNumbers(); })))))();
    };
    RotateY.prototype.toStyleString = function () {
        var value = CssRotationCalcFormula.fromNumbers.apply(CssRotationCalcFormula, this.values_).toStyleString();
        return this.keyword_ + "(" + value + ")";
    };
    RotateY.getDefaultValue = function () {
        return new (RotateY.bind.apply(RotateY, [void 0].concat(generateFilledArray(RotateY.valuesLength, function () { return 0; }))))();
    };
    RotateY.valuesLength = CSS_ROTATION_CALC_FORMULA_ALLOWED_UNITS.length;
    return RotateY;
}(TransformValueBase));
export { RotateY };
//# sourceMappingURL=rotate-y.js.map