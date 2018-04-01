import {Constraint} from './base';
import {IDraggable} from "../interfaces";
import {Vector2d} from '../../../utils/math/geometry/vector-2d';

class FixedXConstraint extends Constraint {
  constrainDelta(draggable: IDraggable, delta: Vector2d) {
    return new Vector2d(delta.x, 0);
  }
}

export {FixedXConstraint};
