"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var get_sign_1 = require("../math/get-sign");
function wrapIndex(index, length) {
    if (index < 0) {
        return length + (index % length);
    }
    else {
        return index % length;
    }
}
function loopSlice(values, startIndex, endIndex, direction) {
    var result = [];
    var length = values.length;
    var increment = get_sign_1.getSign(direction);
    var index = wrapIndex(startIndex, length);
    while (index !== endIndex) {
        result.push(values[index]);
        index = wrapIndex(index + increment, length);
    }
    return result;
}
exports.loopSlice = loopSlice;
//# sourceMappingURL=loop-slice.js.map