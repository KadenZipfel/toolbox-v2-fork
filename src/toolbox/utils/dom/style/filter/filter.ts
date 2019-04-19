import {ICssStyleValueInstance} from "../interfaces/css-style-value";
import {IFilterValueInstance, IFilterValueStatic} from "./filter-value/i-filter-value";
import {getContentInFirstSetOfParentheses} from "../../../string/get-content-in-first-set-of-parentheses";
import {validFilterStrings} from "./filter-value/valid-filter-strings";
import {filterStringToClass} from "./filter-value/filter-string-to-class";
import {trim} from "../../../string/trim";

class Filter implements ICssStyleValueInstance {
  ['constructor']: typeof Filter;

  private readonly filterValues_: IFilterValueInstance[];

  constructor(filters: IFilterValueInstance[]) {
    this.filterValues_ = filters;
  }

  public getTransformValues(): IFilterValueInstance[] {
    return this.filterValues_.slice();
  }

  public getTransformValueClasses(): IFilterValueStatic[] {
    return this.filterValues_
      .map((transformValue) => transformValue.constructor);
  }

  public static fromStyleString(rawString: string): Filter {
    let remainingString = rawString;
    const filters: IFilterValueInstance[] = [];

    while (remainingString.length > 0) {
      const value = getContentInFirstSetOfParentheses(remainingString);
      const valueIndex = remainingString.indexOf(value);
      const transformFunction = remainingString.slice(0, valueIndex - 1);

      if (!validFilterStrings.has(transformFunction)) {
        throw new Error(
          `Unsupported transform function "${transformFunction}" provided to ` +
          `Toolbox Transform.`
        );
      }

      const TransformClass = filterStringToClass.get(transformFunction);

      const fullTransformValue =
        remainingString.slice(0, valueIndex + value.length + 1);
      const transform =
        TransformClass.fromStyleString(fullTransformValue);
      filters.push(<IFilterValueInstance>transform);

      remainingString = trim(remainingString.slice(fullTransformValue.length));
    }

    return new Filter(filters);
  }

  public toStyleString(): string {
    return this.filterValues_
      .map((transform) => transform.toStyleString())
      .join(' ');
  }

}

export {Filter};
