import {renderLoop} from "../../../utils/render-loop";
import {IEffect} from "./i-effect";
import {setStyle} from "../../../utils/dom/style/set-style";
import {percentToIndex} from "../../../utils/array/percent-to-index";
import {flatten} from "../../../utils/array/flatten";
import {zip} from "../../../utils/array/zip";

class FrameSequenceBg implements IEffect {
  private readonly imageUrlsInOrder_: string[];
  private readonly loadedImageUrlIndices_: Set<number>;
  private readonly indicesToLoadInOrder_: number[];

  constructor(frames: string[]) {
    this.imageUrlsInOrder_ = frames;
    this.loadedImageUrlIndices_ = new Set<number>();
    this.indicesToLoadInOrder_ =
      FrameSequenceBg.generateFrameLoadOrder(frames.length);
  }

  public static generateFrameLoadOrder(length: number): number[] {
    const allValues = [];
    for (let i = 1; i < length - 1; i++) {
      allValues.push(i);
    }
    return [0, length - 1, ...this.generateFrameLoadOrderLoop_(allValues)];
  }

  private static generateFrameLoadOrderLoop_(remaining: number[]): number[] {
    if (remaining.length <= 1) {
      return remaining;
    }

    const middle = Math.floor((remaining.length - 1) / 2);
    const left = remaining.slice(0, middle);
    const right = remaining.slice(middle + 1);
    return [
      remaining[middle],
      ...flatten(
        zip(
          this.generateFrameLoadOrderLoop_(left),
          this.generateFrameLoadOrderLoop_(right)
        )
      )
    ];
  }

  public run(
    target: HTMLElement, distance: number, distanceAsPercent: number
  ): void {
    const frame = percentToIndex(distanceAsPercent, this.imageUrlsInOrder_);
    renderLoop.mutate(
      () => setStyle(
        target, 'background-image', `url(${this.imageUrlsInOrder_[frame]})`));
  }

  destroy() {}
}

export {FrameSequenceBg}
