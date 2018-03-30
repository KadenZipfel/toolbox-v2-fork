goog.module('toolbox.are_equal');var module = module || {id: 'toolbox/are-equal.js'};

function areEqual(target) {
    var values = [];
    for (var _i = 1; _i < arguments.length; _i++) {
        values[_i - 1] = arguments[_i];
    }
    return values.every(function (value) { return target === value; });
}
exports.areEqual = areEqual;
//# sourceMappingURL=are-equal.js.map