const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const test = require("node:test");
const {
  aClose,
  aOpenIn,
  aOpenOut,
  bClose,
  bOpenIn,
  bOpenOut,
  wClose,
  wOpenIn,
  wOpenOut,
} = require("../dist/src/pascal/file_io.js");

function withTempDir(fn) {
  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "etex-port-"));
  try {
    fn(tempDir);
  } finally {
    fs.rmSync(tempDir, { recursive: true, force: true });
  }
}

test("open in routines mirror Pascal reset semantics", () => {
  withTempDir((tempDir) => {
    const existing = path.join(tempDir, "existing.txt");
    const missing = path.join(tempDir, "missing.txt");
    fs.writeFileSync(existing, "abc", "utf8");

    const fa = { fd: null };
    assert.equal(aOpenIn(fa, existing), true);
    aClose(fa);
    assert.equal(aOpenIn(fa, missing), false);

    const fb = { fd: null };
    assert.equal(bOpenIn(fb, existing), true);
    bClose(fb);
    assert.equal(bOpenIn(fb, missing), false);

    const fw = { fd: null };
    assert.equal(wOpenIn(fw, existing), true);
    wClose(fw);
    assert.equal(wOpenIn(fw, missing), false);
  });
});

test("open out routines mirror Pascal rewrite semantics", () => {
  withTempDir((tempDir) => {
    const outA = path.join(tempDir, "out-a.txt");
    const outB = path.join(tempDir, "out-b.bin");
    const outW = path.join(tempDir, "out-w.bin");

    const fa = { fd: null };
    assert.equal(aOpenOut(fa, outA), true);
    aClose(fa);
    assert.equal(fs.existsSync(outA), true);

    const fb = { fd: null };
    assert.equal(bOpenOut(fb, outB), true);
    bClose(fb);
    assert.equal(fs.existsSync(outB), true);

    const fw = { fd: null };
    assert.equal(wOpenOut(fw, outW), true);
    wClose(fw);
    assert.equal(fs.existsSync(outW), true);
  });
});

test("close routines clear file descriptor", () => {
  withTempDir((tempDir) => {
    const file = path.join(tempDir, "file.txt");
    fs.writeFileSync(file, "x", "utf8");

    const fa = { fd: null };
    assert.equal(aOpenIn(fa, file), true);
    assert.notEqual(fa.fd, null);
    aClose(fa);
    assert.equal(fa.fd, null);

    const fb = { fd: null };
    assert.equal(bOpenIn(fb, file), true);
    assert.notEqual(fb.fd, null);
    bClose(fb);
    assert.equal(fb.fd, null);

    const fw = { fd: null };
    assert.equal(wOpenIn(fw, file), true);
    assert.notEqual(fw.fd, null);
    wClose(fw);
    assert.equal(fw.fd, null);
  });
});
