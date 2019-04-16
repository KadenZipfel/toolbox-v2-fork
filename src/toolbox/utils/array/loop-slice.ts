import {getSign} from "../math/get-sign";

function wrapIndex(index: number, length: number): number {
  if (index < 0) {
    return length + (index % length);
  } else {
    return index % length;
  }
}

function loopSlice<T>(
  values: T[], startIndex: number, endIndex: number, direction: number
): T[] {
  const result: T[] = [];
  const length = values.length;
  const increment = getSign(direction);
  let index = wrapIndex(startIndex, length);
  while (index !== endIndex) {
    result.push(values[index]);
    index = wrapIndex(index + increment, length);
  }

  return result;
}

export {loopSlice};
