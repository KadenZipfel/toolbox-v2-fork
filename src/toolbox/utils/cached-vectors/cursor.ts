import {EventType} from '../dom/event/event-type';
import {Vector2d} from '../math/geometry/vector-2d';
import {addDomEventListener} from '../dom/event/add-dom-event-listener';
import {filterUntilFalse} from '../array/filter-until-false';
import {filterUntilFirst} from '../array/filter-until-first';
import {frame} from '../frame';
import {renderLoop} from '../render-loop';
import {ZERO_VECTOR_2D} from "../math/geometry/zero-vector-2d";

const GESTURE_TIME_LIMIT: number = 1000; // Time limit in ms
const POSITION_LIMIT: number = 100;

interface ICursorEvent {
  clientX: number;
  clientY: number;
  pageX: number;
  pageY: number;
  screenX: number;
  screenY: number;
}

class CursorPosition {
  private readonly position_: Vector2d;
  private readonly pressed_: boolean;
  private readonly frame_: number;
  private readonly time_: Date;

  constructor(position: Vector2d, pressed: boolean) {
    this.position_ = position;
    this.pressed_ = pressed;
    this.frame_ = frame.getFrame();
    this.time_ = new Date();
  }

  static fromXY(x: number, y: number, pressed: boolean): CursorPosition {
    return new this(new Vector2d(x, y), pressed);
  }

  getFrame(): number {
    return this.frame_;
  }

  isForFrame(...frames: number[]): boolean {
    return frames.indexOf(this.getFrame()) !== -1;
  }

  isPressed(): boolean {
    return this.pressed_;
  }

  getPosition(): Vector2d {
    return this.position_;
  }

  getTime(): Date {
    return this.time_;
  }
}

const ZERO_POSITION: CursorPosition = new CursorPosition(ZERO_VECTOR_2D, false);
class CursorData {
  private readonly positions_: CursorPosition[];

  constructor(
    currentPosition: CursorPosition = ZERO_POSITION,
    ...pastPositions: CursorPosition[]
  ) {
    this.positions_ = [currentPosition, ...pastPositions];
  }

  public update(position: CursorPosition): CursorData {
    return new CursorData(
      position, ...this.positions_.slice(0, POSITION_LIMIT - 1));
  }

  private getLatestPosition(): CursorPosition {
    return this.positions_[0];
  }

  public getPosition(): Vector2d {
    return this.getLatestPosition().getPosition();
  }

  public getFrameDelta(): Vector2d {
    return this.getFrameDelta_(false);
  }

  public getPressedFrameDelta(): Vector2d {
    return this.getFrameDelta_(true);
  }

  private getFrameDelta_(usePressedPositionsOnly: boolean): Vector2d {
    const positions: CursorPosition[] =
      this.getPositionsForFrameDelta_(usePressedPositionsOnly);
    return positions.length === 0 ?
      ZERO_VECTOR_2D :
      Vector2d.sumDeltas<Vector2d>(
        ...positions.map((position) => position.getPosition()));
  }

  private getPositionsForFrameDelta_(
    usePressedPositionsOnly: boolean
  ): CursorPosition[] {
    const currentFrame = frame.getFrame();

    // If the latest frame is not the current one then we have no delta to
    // report.
    if (!this.getLatestPosition().isForFrame(currentFrame)) {
      return [];
    }

    const isPreviousFrame =
      (position: CursorPosition) => !position.isForFrame(currentFrame);
    const positionsToConsider =
      filterUntilFirst(this.positions_, isPreviousFrame);

    if (usePressedPositionsOnly) {
      const isPressed = (position: CursorPosition) => position.isPressed();
      return filterUntilFalse(positionsToConsider, isPressed);
    } else {
      return positionsToConsider;
    }

  }

  public getGestureDelta(): Vector2d {
    return CursorData.getGestureDeltaFromPositions_(...this.positions_);
  }

  public getPressedGestureDelta(): Vector2d {
    return CursorData.getGestureDeltaFromPositions_(
      ...this.getPressedGesturePositions_());
  }

  public getLastFrameVelocity(): Vector2d {
    const framesWithTimeDifference = this.getFramesWithTimeDifference_();
    const firstFrame = framesWithTimeDifference[0];
    const lastFrame = framesWithTimeDifference.slice(-1)[0];
    const frameDeltaInSeconds =
      (firstFrame.getTime().valueOf() - lastFrame.getTime().valueOf()) /
      1000;
    return this.getLastFrameDelta().scale(1/frameDeltaInSeconds);
  }

  public getLastFrameDelta(): Vector2d {
    const framesWithTimeDifference = this.getFramesWithTimeDifference_();
    const firstFrame = framesWithTimeDifference[0];
    const lastFrame = framesWithTimeDifference.slice(-1)[0];
    return firstFrame.getPosition().subtract(lastFrame.getPosition());
  }

  private getFramesWithTimeDifference_(): CursorPosition[] {
    const firstPosition = this.positions_[0];
    const positionWithDifference =
      this.positions_
        .find(
          (position) => {
            return position.getTime().valueOf() !==
              firstPosition.getTime().valueOf();
          });
    return this.positions_
      .slice(0, this.positions_.indexOf(positionWithDifference) + 1);
  }

  private getPressedGesturePositions_(): CursorPosition[] {
    const currentTime: number = new Date().valueOf();
    const conditionFn =
      (position: CursorPosition) => {
        const timeDiff = currentTime - position.getTime().valueOf();
        return timeDiff < GESTURE_TIME_LIMIT && position.isPressed();
      };

    return filterUntilFalse(this.positions_, conditionFn);
  }

  public static getGestureDeltaFromPositions_(
    ...positions: CursorPosition[]
  ): Vector2d {
    const deltas: Vector2d[] =
      Vector2d.getDeltas<Vector2d>(
        ...positions.map((position: CursorPosition) => position.getPosition()));
    const scaledDeltas: Vector2d[] =
      deltas.map(
        (delta, index) => delta.scale((deltas.length - index) / deltas.length));
    return Vector2d.add<Vector2d>(...scaledDeltas);
  }
}

class Cursor {
  public static singleton: Cursor;
  private frame: number;
  private clientPosition: CursorData;
  private pagePosition: CursorData;
  private screenPosition: CursorData;
  private pressed: boolean;

  constructor() {
    this.clientPosition = new CursorData();
    this.pagePosition = new CursorData();
    this.screenPosition = new CursorData();
    this.pressed = false;
    this.frame = 0;
    this.init_();
  }

  private init_() {
    addDomEventListener(
      window, EventType.CURSOR_DOWN,
      (event: MouseEvent|TouchEvent) => this.updatePress_(event, true));
    addDomEventListener(
      window, EventType.CURSOR_UP,
      (event: MouseEvent|TouchEvent) => this.updatePress_(event, false));
    addDomEventListener(
      window, EventType.CURSOR_MOVE,
      (event: MouseEvent|TouchEvent) => this.updatePosition_(event));
  }

  public static getSingleton(): Cursor {
    return this.singleton = this.singleton || new this();
  }

  public isPressed(): boolean {
    return this.pressed;
  }

  public getClient(): CursorData {
    return this.clientPosition;
  }

  public getPage(): CursorData {
    return this.pagePosition;
  }

  public getScreen(): CursorData {
    return this.screenPosition;
  }

  private updatePress_(event: MouseEvent|TouchEvent, isPressed: boolean): void {
    this.pressed = isPressed;
    this.updatePosition_(event);
  }

  private updatePosition_(event: MouseEvent|TouchEvent): void {
    if (event instanceof MouseEvent) {
      this.updatePositionFromEvent_(event);
    } else if (event instanceof TouchEvent) {
      this.updatePositionFromTouchEvent_(event);
    }
  }

  private updatePositionFromTouchEvent_(touchEvent: TouchEvent): void {
    if (touchEvent.touches.length > 0) {
      this.updatePositionFromEvent_(touchEvent.touches[0]);
    } else {
      this.endTouch_();
    }
  }

  private endTouch_(): void {
    renderLoop.premeasure(() => {
      this.pagePosition = this.duplicatePosition_(this.pagePosition);
      this.clientPosition = this.duplicatePosition_(this.clientPosition);
      this.screenPosition = this.duplicatePosition_(this.screenPosition);
    });
  }

  private updatePositionFromEvent_(event: ICursorEvent): void {
    renderLoop.premeasure(() => {
      this.pagePosition =
        this.updatePositionWithXY_(
          this.pagePosition, event.pageX, event.pageY);

      this.clientPosition =
        this.updatePositionWithXY_(
          this.clientPosition, event.clientX, event.clientY);

      this.screenPosition =
        this.updatePositionWithXY_(
          this.screenPosition, event.screenX, event.screenY);
    });
  }

  duplicatePosition_(position: CursorData): CursorData {
    return position.update(
      new CursorPosition(position.getPosition(), this.isPressed()));
  }

  updatePositionWithXY_(position: CursorData, xValue: number, yValue: number) {
    return position.update(
      CursorPosition.fromXY(xValue, yValue, this.isPressed()));
  }
}

const cursor = Cursor.getSingleton();

export {cursor};
