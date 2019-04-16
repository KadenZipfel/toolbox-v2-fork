import { Matrix } from './matrix';
import { DynamicDefaultMap } from "../../map/dynamic-default";
import { renderLoop } from "../../render-loop";
var MatrixService = (function () {
    function MatrixService() {
        this.cleanMatrix_ =
            DynamicDefaultMap.usingFunction(function (element) { return Matrix.fromElementTransform(element); });
        this.alteredMatrix_ =
            DynamicDefaultMap.usingFunction(function (element) { return Matrix.fromElementTransform(element); });
        this.init_();
    }
    MatrixService.prototype.init_ = function () {
        this.renderLoop_();
    };
    MatrixService.prototype.getCleanMatrix = function (element) {
        return this.cleanMatrix_.get(element);
    };
    MatrixService.prototype.getAlteredMatrix = function (element) {
        return this.alteredMatrix_.get(element);
    };
    MatrixService.prototype.translate = function (element, vector) {
        this.alteredMatrix_.set(element, this.alteredMatrix_.get(element).translate(vector));
    };
    MatrixService.prototype.renderLoop_ = function () {
        var _this = this;
        renderLoop.anyMutate(function () {
            var entries = _this.alteredMatrix_.entries();
            var nextEntry = entries.next();
            while (!nextEntry.done) {
                var _a = nextEntry.value, element = _a[0], alteredMatrix = _a[1];
                alteredMatrix.applyToElementTransform(element);
                nextEntry = entries.next();
            }
            renderLoop.anyCleanup(function () {
                _this.cleanMatrix_.clear();
                _this.alteredMatrix_.clear();
                _this.renderLoop_();
            });
        });
    };
    MatrixService.getSingleton = function () {
        return this.singleton_ = this.singleton_ || new this();
    };
    MatrixService.singleton_ = null;
    return MatrixService;
}());
export { MatrixService };
//# sourceMappingURL=matrix-service.js.map