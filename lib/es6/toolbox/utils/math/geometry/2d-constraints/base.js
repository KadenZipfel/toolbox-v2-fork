var Constraint2d = (function () {
    function Constraint2d() {
    }
    Constraint2d.prototype.constrain = function (delta) {
        console.warn('constrain() is not overridden from base case');
        return delta;
    };
    Constraint2d.applyConstraints = function (delta, constraints) {
        return constraints.reduce(function (result, constraint) { return constraint.constrain(result); }, delta);
    };
    return Constraint2d;
}());
export { Constraint2d };
//# sourceMappingURL=base.js.map