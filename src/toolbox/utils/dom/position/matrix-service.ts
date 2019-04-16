import {Matrix} from './matrix';
import {DynamicDefaultMap} from "../../map/dynamic-default";
import {renderLoop} from "../../render-loop";

class MatrixService {
  private static singleton_: MatrixService = null;
  private cleanMatrix_: DynamicDefaultMap<HTMLElement, Matrix>;
  private alteredMatrix_: DynamicDefaultMap<HTMLElement, Matrix>;

  constructor() {
    this.cleanMatrix_ =
      DynamicDefaultMap.usingFunction(
        (element: HTMLElement) => Matrix.fromElementTransform(element));
    this.alteredMatrix_ =
      DynamicDefaultMap.usingFunction(
        (element: HTMLElement) => Matrix.fromElementTransform(element));
    this.init_();
  }

  private init_() {
    this.renderLoop_();
  }

  public getCleanMatrix(element: HTMLElement) {
    return this.cleanMatrix_.get(element);
  }

  public getAlteredMatrix(element: HTMLElement) {
    return this.alteredMatrix_.get(element);
  }

  public translate(element: HTMLElement, vector: {x: number, y: number}): void {
    this.alteredMatrix_.set(
      element, this.alteredMatrix_.get(element).translate(vector));
  }

  private renderLoop_() {
    renderLoop.anyMutate(() => {
      const entries = this.alteredMatrix_.entries();

      let nextEntry = entries.next();
      while (!nextEntry.done) {
        const [element, alteredMatrix] = nextEntry.value;
        alteredMatrix.applyToElementTransform(element);

        nextEntry = entries.next();
      }

      renderLoop.anyCleanup(() => {
        this.cleanMatrix_.clear();
        this.alteredMatrix_.clear();
        this.renderLoop_();
      });
    });
  }

  public static getSingleton(): MatrixService {
    return this.singleton_ = this.singleton_ || new this();
  }
}

export {MatrixService};
