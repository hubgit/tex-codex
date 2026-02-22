import { ArithmeticState, isOdd, pascalDiv, pascalMod } from "./runtime";

export function half(x: number): number {
  if (isOdd(x)) {
    return pascalDiv(x + 1, 2);
  }

  return pascalDiv(x, 2);
}

export function round(x: number): number {
  // TeX WEB calls Pascal's builtin round(...); for Knuth-era Pascal this is
  // ties-away-from-zero (not IEEE ties-to-even). Keep this behavior.
  if (x >= 0) {
    return Math.floor(x + 0.5);
  }
  return -Math.floor(-x + 0.5);
}

export function roundDecimals(k: number, state: ArithmeticState): number {
  let a = 0;

  while (k > 0) {
    k -= 1;
    a = pascalDiv(a + state.dig[k] * 131072, 10);
  }

  return pascalDiv(a + 1, 2);
}

export function multAndAdd(
  n: number,
  x: number,
  y: number,
  maxAnswer: number,
  state: ArithmeticState,
): number {
  if (n < 0) {
    x = -x;
    n = -n;
  }

  if (n === 0) {
    return y;
  }

  if (
    x <= pascalDiv(maxAnswer - y, n) &&
    -x <= pascalDiv(maxAnswer + y, n)
  ) {
    return n * x + y;
  }

  state.arithError = true;
  return 0;
}

export function xOverN(x: number, n: number, state: ArithmeticState): number {
  let negative = false;
  let result: number;

  if (n === 0) {
    state.arithError = true;
    state.remainder = x;
    return 0;
  }

  if (n < 0) {
    x = -x;
    n = -n;
    negative = true;
  }

  if (x >= 0) {
    result = pascalDiv(x, n);
    state.remainder = pascalMod(x, n);
  } else {
    result = -pascalDiv(-x, n);
    state.remainder = -pascalMod(-x, n);
  }

  if (negative) {
    state.remainder = -state.remainder;
  }

  return result;
}

export function xnOverD(
  x: number,
  n: number,
  d: number,
  state: ArithmeticState,
): number {
  let positive = true;
  let t: number;
  let u: number;
  const vBase: number = 32768;
  let v: number;

  if (x < 0) {
    x = -x;
    positive = false;
  }

  t = pascalMod(x, vBase) * n;
  u = pascalDiv(x, vBase) * n + pascalDiv(t, vBase);
  v = pascalMod(u, d) * vBase + pascalMod(t, vBase);

  if (pascalDiv(u, d) >= vBase) {
    state.arithError = true;
  } else {
    u = vBase * pascalDiv(u, d) + pascalDiv(v, d);
  }

  if (positive) {
    state.remainder = pascalMod(v, d);
    return u;
  }

  state.remainder = -pascalMod(v, d);
  return -u;
}

export function badness(t: number, s: number): number {
  let r: number;

  if (t === 0) {
    return 0;
  }

  if (s <= 0) {
    return 10000;
  }

  if (t <= 7230584) {
    r = pascalDiv(t * 297, s);
  } else if (s >= 1663497) {
    r = pascalDiv(t, pascalDiv(s, 297));
  } else {
    r = t;
  }

  if (r > 1290) {
    return 10000;
  }

  return pascalDiv(r * r * r + 131072, 262144);
}

export function addOrSub(
  x: number,
  y: number,
  maxAnswer: number,
  negative: boolean,
  state: ArithmeticState,
): number {
  let a: number;

  if (negative) {
    y = -y;
  }

  if (x >= 0) {
    if (y <= maxAnswer - x) {
      a = x + y;
    } else {
      state.arithError = true;
      a = 0;
    }
  } else if (y >= -maxAnswer - x) {
    a = x + y;
  } else {
    state.arithError = true;
    a = 0;
  }

  return a;
}

export function quotient(n: number, d: number, state: ArithmeticState): number {
  let negative: boolean;
  let a: number;

  if (d === 0) {
    state.arithError = true;
    return 0;
  }

  if (d > 0) {
    negative = false;
  } else {
    d = -d;
    negative = true;
  }

  if (n < 0) {
    n = -n;
    negative = !negative;
  }

  a = pascalDiv(n, d);
  n = n - a * d;
  d = n - d;

  if (d + n >= 0) {
    a = a + 1;
  }

  if (negative) {
    a = -a;
  }

  return a;
}

export function fract(
  x: number,
  n: number,
  d: number,
  maxAnswer: number,
  state: ArithmeticState,
): number {
  let negative: boolean;
  let a: number;
  let f: number;
  let h: number;
  let r: number;
  let t: number;

  if (d === 0) {
    state.arithError = true;
    return 0;
  }

  a = 0;

  if (d > 0) {
    negative = false;
  } else {
    d = -d;
    negative = true;
  }

  if (x < 0) {
    x = -x;
    negative = !negative;
  } else if (x === 0) {
    return 0;
  }

  if (n < 0) {
    n = -n;
    negative = !negative;
  }

  t = pascalDiv(n, d);

  if (t > pascalDiv(maxAnswer, x)) {
    state.arithError = true;
    return 0;
  }

  a = t * x;
  n = n - t * d;

  if (n !== 0) {
    t = pascalDiv(x, d);

    if (t > pascalDiv(maxAnswer - a, n)) {
      state.arithError = true;
      return 0;
    }

    a = a + t * n;
    x = x - t * d;

    if (x !== 0) {
      if (x < n) {
        t = x;
        x = n;
        n = t;
      }

      f = 0;
      r = pascalDiv(d, 2) - d;
      h = -r;

      while (true) {
        if (isOdd(n)) {
          r = r + x;
          if (r >= 0) {
            r = r - d;
            f = f + 1;
          }
        }

        n = pascalDiv(n, 2);
        if (n === 0) {
          break;
        }

        if (x < h) {
          x = x + x;
        } else {
          t = x - d;
          x = t + x;
          f = f + n;

          if (x < n) {
            if (x === 0) {
              break;
            }

            t = x;
            x = n;
            n = t;
          }
        }
      }

      if (f > maxAnswer - a) {
        state.arithError = true;
        return 0;
      }

      a = a + f;
    }
  }

  if (negative) {
    a = -a;
  }

  return a;
}

export function normMin(h: number): number {
  if (h <= 0) {
    return 1;
  }

  if (h >= 63) {
    return 63;
  }

  return h;
}
