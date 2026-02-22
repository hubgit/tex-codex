import type { TeXStateSlice } from "./state_slices";
export interface ArithmeticState extends TeXStateSlice<"arithError" | "remainder" | "dig">{
}

export function createArithmeticState(): ArithmeticState {
  return {
    arithError: false,
    remainder: 0,
    dig: new Array(23).fill(0),
  };
}

export function pascalDiv(numerator: number, denominator: number): number {
  if (denominator === 0) {
    throw new RangeError("division by zero");
  }

  return Math.trunc(numerator / denominator);
}

export function pascalMod(numerator: number, denominator: number): number {
  return numerator - pascalDiv(numerator, denominator) * denominator;
}

export function isOdd(value: number): boolean {
  return value % 2 !== 0;
}
