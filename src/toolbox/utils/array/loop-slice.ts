import {getSign} from "../math/get-sign";

function loopSlice<T>(
  values: T[], startIndex: number, endIndex: number, direction: number
): T[] {
  const result: T[] = [];
  const length = values.length;
  const increment = getSign(direction);
  let index = startIndex;
  while (index !== endIndex) {
    result.push(values[index]);
    index = (index + increment) % length;
  }

  return result;
}

export {loopSlice};
