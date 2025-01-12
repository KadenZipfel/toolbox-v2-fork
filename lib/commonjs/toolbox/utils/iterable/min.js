"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var max_1 = require("./max");
function min(iterable, scoreFn) {
    return max_1.max(iterable, function (value) { return -scoreFn(value); });
}
exports.min = min;
//# sourceMappingURL=min.js.map