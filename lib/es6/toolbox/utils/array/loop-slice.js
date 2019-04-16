import { getSign } from "../math/get-sign";
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
    var increment = getSign(direction);
    var index = wrapIndex(startIndex, length);
    while (index !== endIndex) {
        result.push(values[index]);
        index = wrapIndex(index + increment, length);
    }
    return result;
}
export { loopSlice };
//# sourceMappingURL=loop-slice.js.map