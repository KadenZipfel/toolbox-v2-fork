import { FrameSequenceBg } from "./frame-sequence-bg";
import { expect } from 'chai';
import 'mocha';

describe('FrameSequenceBg', () => {
  describe('generateFrameLoadOrder', () => {
    const tests: any[] = [
      [9, [0,8,4,2,6,1,5,3,7]],
    ];
    tests.forEach(([testInput, expectedResult]) => {
      it(`should return ${JSON.stringify(expectedResult)} for ${JSON.stringify(testInput)}`, () => {
        const result = FrameSequenceBg.generateFrameLoadOrder(testInput);
        expect(result).to.have.ordered.members(expectedResult);
        expect(result.length).to.equal(expectedResult.length);
      });
    });
  });
});
