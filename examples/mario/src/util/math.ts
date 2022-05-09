/*
 * A magic number that determiines how to map real-world math to
 * pixels. For example, we can use this value to scale earth's
 * gravity (9.8 m/s^2) into a reasonable value in our game world.
 */
export const PIXELS_PER_UNIT = 400;
export const unitify: (value: number) => number = (value: number) =>
  PIXELS_PER_UNIT * value;

export function easeOutSine(x: number): number {
  return Math.sin((x * Math.PI) / 2);
}

/*
 * Following two methods are used for collision detection to
 * determine which side of a rectangle collided first.
 *
 * By assuming a particular side hit first, we can deduce the
 * yassumed (or xassumed) value and calculate via the vector
 * value where the rectangle would've been when the rectangle's
 * y-position was equal to yassumed.
 *
 * From that position, if we can project vertically (or horizontally),
 * we know we've found the side that truly collided first.
 *
 * NOTE: There are other collision detection methods that are
 * simpler but are susceptible to incorrect decisions at high speeds.
 * Still, we should probaby change our detection to use those methods,
 * because Mario isn't really moving at lightning speed :)
 */

/*
 * Given two rectangles, can the first one be
 * translated up or down and hit the second?
 *
 */
export function canProjectVertically(
  yassumed: number,
  x1: number,
  w1: number,
  vx1: number,
  y1: number,
  vy1: number,
  x2: number,
  w2: number
) {
  let elapsed = (y1 - yassumed) / vy1;
  let x1prime = -(elapsed * vx1 - x1);
  return x1prime < x2 + w2 && x1prime + w1 > x2;
}

/*
 * Given two rectangles, can the first one be
 * translated left or right and hit the second?
 */
export function canProjectHorizontally(
  xassumed: number,
  x1: number,
  vx1: number,
  y1: number,
  h1: number,
  vy1: number,
  y2: number,
  h2: number
) {
  let elapsed = (x1 - xassumed) / vx1;
  let y1prime = -(elapsed * vy1 - y1);
  return y1prime + h1 > y2 && y1prime < y2 + h2;
}

export class Point {
  constructor(public x: number, public y: number) {}

  public extendsBelow(line: Line, u: number): boolean {
    return (
      this.x >= line.a.x &&
      this.x <= line.b.x &&
      this.y <= line.a.y &&
      this.y + u > line.a.y
    );
  }
}

export class Line {
  constructor(public a: Point, public b: Point) {}
}
