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
import { CSS_CALC_FORMULA_ALLOWED_UNITS, CssCalcFormula } from "../../css-calc-formula";
import { flatten } from "../../../../array/flatten";
import { getSubarraysOfLength } from "../../../../array/get-subarrays-of-length";
import { generateFilledArray } from "../../../../array/generate-filled-array";
var calcValueLength = CSS_CALC_FORMULA_ALLOWED_UNITS.length;
var Translate = (function (_super) {
    __extends(Translate, _super);
    function Translate() {
        var rawValues = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            rawValues[_i] = arguments[_i];
        }
        var _this = this;
        var values = rawValues.length === calcValueLength ? rawValues.concat(generateFilledArray(calcValueLength, function () { return 0; })) :
            rawValues;
        _this = _super.call(this, 'translate', values) || this;
        return _this;
    }
    Translate.fromNumbers = function () {
        var values = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            values[_i] = arguments[_i];
        }
        return new (Translate.bind.apply(Translate, [void 0].concat(values)))();
    };
    Translate.fromStyleString = function (value) {
        return new (Translate.bind.apply(Translate, [void 0].concat(flatten(TransformValueBase.styleStringToValues(value)
            .map(function (value) { return CssCalcFormula.fromStyleString(value); })
            .map(function (formula) { return formula.toNumbers(); })))))();
    };
    Translate.prototype.toStyleString = function () {
        var values = getSubarraysOfLength(this.values_, calcValueLength)
            .map(function (subValues) { return CssCalcFormula.fromNumbers.apply(CssCalcFormula, subValues); })
            .map(function (formula) { return formula.toStyleString(); });
        return this.keyword_ + "(" + values.join(',') + ")";
    };
    Translate.getDefaultValue = function () {
        return new (Translate.bind.apply(Translate, [void 0].concat(generateFilledArray(Translate.valuesLength, function () { return 0; }))))();
    };
    Translate.valuesLength = calcValueLength * 2;
    return Translate;
}(TransformValueBase));
export { Translate };
//# sourceMappingURL=translate.js.map