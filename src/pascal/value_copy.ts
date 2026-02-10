export interface TwoHalves {
  lh: number;
  rh: number;
  b0: number;
  b1: number;
}

export interface FourQuarters {
  b0: number;
  b1: number;
  b2: number;
  b3: number;
}

export interface MemoryWord {
  int: number;
  gr: number;
  hh: TwoHalves;
  qqqq: FourQuarters;
}

export function copyTwoHalves(value: TwoHalves): TwoHalves {
  return {
    lh: value.lh,
    rh: value.rh,
    b0: value.b0,
    b1: value.b1,
  };
}

export function copyFourQuarters(value: FourQuarters): FourQuarters {
  return {
    b0: value.b0,
    b1: value.b1,
    b2: value.b2,
    b3: value.b3,
  };
}

export function copyMemoryWord(value: MemoryWord): MemoryWord {
  return {
    int: value.int,
    gr: value.gr,
    hh: copyTwoHalves(value.hh),
    qqqq: copyFourQuarters(value.qqqq),
  };
}
