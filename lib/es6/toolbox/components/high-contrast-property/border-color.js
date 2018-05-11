var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
import { HighContrastProperty } from "./base";
var HighContrastBorderColor = (function (_super) {
    __extends(HighContrastBorderColor, _super);
    function HighContrastBorderColor() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    HighContrastBorderColor.getProperty = function () {
        return 'border-color';
    };
    return HighContrastBorderColor;
}(HighContrastProperty));
export { HighContrastBorderColor };
//# sourceMappingURL=border-color.js.map