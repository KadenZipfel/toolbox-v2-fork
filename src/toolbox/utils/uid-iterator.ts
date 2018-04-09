class UidIterator implements IterableIterator<number> {
  private counter_: number = 0;

  next(value?: any): IteratorResult<number> {
    this.counter_++;
    return {
      value: this.counter_,
      done: this.counter_ >= Number.MAX_VALUE,
    }
  }

  [Symbol.iterator](): UidIterator {
    return this;
  }
}

export {UidIterator};
