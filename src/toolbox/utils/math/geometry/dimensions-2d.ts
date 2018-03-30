import {Vector} from './vector';

class Dimensions2d extends Vector {
  constructor(width: number = 0, height: number = 0, ...args: number[]) {
    super(width, height, ...args);
  }

  public get width(): number {
    return this.getValues()[0];
  }

  public get height(): number {
    return this.getValues()[1];
  }

  public sizeElement(element: HTMLElement): void {
    element.style.width = `${this.width}px`;
    element.style.height = `${this.height}px`;
  }

  public static fromElementOffset<T extends Dimensions2d>(
    element: HTMLElement
  ): T {
    return <T>new this(element.offsetWidth, element.offsetHeight);
  }

  public getArea(): number{
    return this.width * this.height;
  }
}

export {Dimensions2d};