function asNumber(value, fallback) {
  if (value === undefined || value === null) {
    return fallback;
  }
  return Number(value);
}

function maxArrayLength(values) {
  let max = 0;
  for (const value of values) {
    if (Array.isArray(value) && value.length > max) {
      max = value.length;
    }
  }
  return max;
}

function zeroTwoHalves() {
  return {
    rh: 0,
    lh: 0,
    b0: 0,
    b1: 0,
  };
}

function zeroFourQuarters() {
  return {
    b0: 0,
    b1: 0,
    b2: 0,
    b3: 0,
  };
}

function zeroMemoryWord() {
  return {
    int: 0,
    gr: 0,
    hh: zeroTwoHalves(),
    qqqq: zeroFourQuarters(),
  };
}

function zeroListStateRecord() {
  return {
    modeField: 0,
    headField: 0,
    tailField: 0,
    eTeXAuxField: 0,
    pgField: 0,
    mlField: 0,
    auxField: zeroMemoryWord(),
  };
}

function copyTwoHalves(value) {
  const source = value && typeof value === "object" ? value : {};
  return {
    rh: asNumber(source.rh, 0),
    lh: asNumber(source.lh, 0),
    b0: asNumber(source.b0, 0),
    b1: asNumber(source.b1, 0),
  };
}

function copyFourQuarters(value) {
  const source = value && typeof value === "object" ? value : {};
  return {
    b0: asNumber(source.b0, 0),
    b1: asNumber(source.b1, 0),
    b2: asNumber(source.b2, 0),
    b3: asNumber(source.b3, 0),
  };
}

function copyMemoryWord(value) {
  const source = value && typeof value === "object" ? value : {};
  return {
    int: asNumber(source.int, 0),
    gr: asNumber(source.gr, 0),
    hh: copyTwoHalves(source.hh),
    qqqq: copyFourQuarters(source.qqqq),
  };
}

function copyListStateRecord(value) {
  const source = value && typeof value === "object" ? value : {};
  return {
    modeField: asNumber(source.modeField, 0),
    headField: asNumber(source.headField, 0),
    tailField: asNumber(source.tailField, 0),
    eTeXAuxField: asNumber(source.eTeXAuxField, 0),
    pgField: asNumber(source.pgField, 0),
    mlField: asNumber(source.mlField, 0),
    auxField: copyMemoryWord(source.auxField),
  };
}

function memoryWordsFromComponents(components, options = {}) {
  const source = components && typeof components === "object" ? components : {};
  const base = Array.isArray(source.base) ? source.base : [];
  let size = maxArrayLength([
    base,
    source.b0,
    source.b1,
    source.b2,
    source.b3,
    source.int,
    source.lh,
    source.rh,
    source.gr,
  ]);

  const minSize = asNumber(options.minSize, 0);
  if (size > 0 && minSize > 0 && size < minSize) {
    size = minSize;
  }

  if (size === 0) {
    return [];
  }

  const out = new Array(size);
  for (let i = 0; i < size; i += 1) {
    out[i] = i < base.length ? copyMemoryWord(base[i]) : zeroMemoryWord();
  }

  for (let i = 0; i < size; i += 1) {
    const word = out[i];
    if (Array.isArray(source.b0)) {
      word.hh.b0 = asNumber(source.b0[i], word.hh.b0);
      word.qqqq.b0 = asNumber(source.b0[i], word.qqqq.b0);
    }
    if (Array.isArray(source.b1)) {
      word.hh.b1 = asNumber(source.b1[i], word.hh.b1);
      word.qqqq.b1 = asNumber(source.b1[i], word.qqqq.b1);
    }
    if (Array.isArray(source.b2)) {
      word.qqqq.b2 = asNumber(source.b2[i], word.qqqq.b2);
    }
    if (Array.isArray(source.b3)) {
      word.qqqq.b3 = asNumber(source.b3[i], word.qqqq.b3);
    }
    if (Array.isArray(source.int)) {
      word.int = asNumber(source.int[i], word.int);
    }
    if (Array.isArray(source.lh)) {
      word.hh.lh = asNumber(source.lh[i], word.hh.lh);
    }
    if (Array.isArray(source.rh)) {
      word.hh.rh = asNumber(source.rh[i], word.hh.rh);
    }
    if (Array.isArray(source.gr)) {
      word.gr = asNumber(source.gr[i], word.gr);
    }
  }

  return out;
}

function twoHalvesFromComponents(components) {
  const source = components && typeof components === "object" ? components : {};
  const base = Array.isArray(source.base) ? source.base : [];
  const size = maxArrayLength([base, source.b0, source.b1, source.lh, source.rh]);
  if (size === 0) {
    return [];
  }

  const out = new Array(size);
  for (let i = 0; i < size; i += 1) {
    out[i] = i < base.length ? copyTwoHalves(base[i]) : zeroTwoHalves();
  }

  for (let i = 0; i < size; i += 1) {
    const halves = out[i];
    if (Array.isArray(source.b0)) {
      halves.b0 = asNumber(source.b0[i], halves.b0);
    }
    if (Array.isArray(source.b1)) {
      halves.b1 = asNumber(source.b1[i], halves.b1);
    }
    if (Array.isArray(source.lh)) {
      halves.lh = asNumber(source.lh[i], halves.lh);
    }
    if (Array.isArray(source.rh)) {
      halves.rh = asNumber(source.rh[i], halves.rh);
    }
  }

  return out;
}

function fourQuartersFromComponents(components) {
  const source = components && typeof components === "object" ? components : {};
  const base = Array.isArray(source.base) ? source.base : [];
  const size = maxArrayLength([base, source.b0, source.b1, source.b2, source.b3]);
  if (size === 0) {
    return [];
  }

  const out = new Array(size);
  for (let i = 0; i < size; i += 1) {
    out[i] = i < base.length ? copyFourQuarters(base[i]) : zeroFourQuarters();
  }

  for (let i = 0; i < size; i += 1) {
    const quarters = out[i];
    if (Array.isArray(source.b0)) {
      quarters.b0 = asNumber(source.b0[i], quarters.b0);
    }
    if (Array.isArray(source.b1)) {
      quarters.b1 = asNumber(source.b1[i], quarters.b1);
    }
    if (Array.isArray(source.b2)) {
      quarters.b2 = asNumber(source.b2[i], quarters.b2);
    }
    if (Array.isArray(source.b3)) {
      quarters.b3 = asNumber(source.b3[i], quarters.b3);
    }
  }

  return out;
}

function listStateRecordFromComponents(components) {
  const source = components && typeof components === "object" ? components : {};
  const base = source.base && typeof source.base === "object" ? source.base : null;
  const out = base ? copyListStateRecord(base) : zeroListStateRecord();

  out.modeField = asNumber(source.modeField, out.modeField);
  out.headField = asNumber(source.headField, out.headField);
  out.tailField = asNumber(source.tailField, out.tailField);
  out.eTeXAuxField = asNumber(source.eTeXAuxField, out.eTeXAuxField);
  out.pgField = asNumber(source.pgField, out.pgField);
  out.mlField = asNumber(source.mlField, out.mlField);
  out.auxField.int = asNumber(source.auxInt, out.auxField.int);
  out.auxField.hh.lh = asNumber(source.auxLh, out.auxField.hh.lh);
  out.auxField.hh.rh = asNumber(source.auxRh, out.auxField.hh.rh);

  return out;
}

function listStateArrayFromComponents(components, options = {}) {
  const source = components && typeof components === "object" ? components : {};
  const base = Array.isArray(source.base) ? source.base : [];
  let size = maxArrayLength([
    base,
    source.modeField,
    source.headField,
    source.tailField,
    source.eTeXAuxField,
    source.pgField,
    source.mlField,
    source.auxInt,
    source.auxLh,
    source.auxRh,
  ]);

  const nestPtr = asNumber(options.nestPtr, -1);
  if (nestPtr >= 0 && nestPtr + 1 > size) {
    size = nestPtr + 1;
  }

  if (size === 0) {
    return [];
  }

  const out = new Array(size);
  for (let i = 0; i < size; i += 1) {
    out[i] = i < base.length ? copyListStateRecord(base[i]) : zeroListStateRecord();
  }

  for (let i = 0; i < size; i += 1) {
    const row = out[i];
    if (Array.isArray(source.modeField)) {
      row.modeField = asNumber(source.modeField[i], row.modeField);
    }
    if (Array.isArray(source.headField)) {
      row.headField = asNumber(source.headField[i], row.headField);
    }
    if (Array.isArray(source.tailField)) {
      row.tailField = asNumber(source.tailField[i], row.tailField);
    }
    if (Array.isArray(source.eTeXAuxField)) {
      row.eTeXAuxField = asNumber(source.eTeXAuxField[i], row.eTeXAuxField);
    }
    if (Array.isArray(source.pgField)) {
      row.pgField = asNumber(source.pgField[i], row.pgField);
    }
    if (Array.isArray(source.mlField)) {
      row.mlField = asNumber(source.mlField[i], row.mlField);
    }
    if (Array.isArray(source.auxInt)) {
      row.auxField.int = asNumber(source.auxInt[i], row.auxField.int);
    }
    if (Array.isArray(source.auxLh)) {
      row.auxField.hh.lh = asNumber(source.auxLh[i], row.auxField.hh.lh);
    }
    if (Array.isArray(source.auxRh)) {
      row.auxField.hh.rh = asNumber(source.auxRh[i], row.auxField.hh.rh);
    }
  }

  return out;
}

module.exports = {
  copyFourQuarters,
  copyListStateRecord,
  copyMemoryWord,
  copyTwoHalves,
  fourQuartersFromComponents,
  listStateArrayFromComponents,
  listStateRecordFromComponents,
  memoryWordsFromComponents,
  twoHalvesFromComponents,
  zeroFourQuarters,
  zeroListStateRecord,
  zeroMemoryWord,
  zeroTwoHalves,
};
