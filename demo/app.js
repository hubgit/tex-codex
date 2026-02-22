const compileBtn = document.querySelector("#compile-btn");
const statusPill = document.querySelector("#status-pill");
const sourceTextInput = document.querySelector("#source-text");
const transcriptPre = document.querySelector("#transcript");
const logOutputPre = document.querySelector("#log-output");
const fileList = document.querySelector("#file-list");
const svgOutput = document.querySelector("#svg-output");
const DEFAULT_TEXMF_BASE_URL = "https://texlive.hubmed.org/texmf-dist/";

let workerReady = false;
let nextRequestId = 1;
const pending = new Map();
const dvisvgmState = {
  module: null,
  initPromise: null,
  texmfBaseUrl: "",
  texmfByBasename: null,
  texmfByUrl: new Map(),
  activeLogSink: null,
};
let svgPreviewUrls = [];

const worker = new Worker(new URL("./worker-loader.js", import.meta.url), { type: "module" });

function canCompile() {
  return workerReady;
}

function syncCompileButton(isBusy = false) {
  compileBtn.disabled = isBusy || !canCompile();
}

function setStatus(label, klass) {
  statusPill.textContent = label;
  statusPill.className = `status ${klass}`;
}

function setBusy(isBusy) {
  syncCompileButton(isBusy);
  if (isBusy) {
    setStatus("Compiling…", "status-busy");
  }
}

function appendText(base, extra) {
  if (!extra) {
    return base;
  }
  return base ? `${base}\n${extra}` : extra;
}

function appendStreamingText(node, extra) {
  if (!extra) {
    return;
  }
  node.textContent += extra;
  node.scrollTop = node.scrollHeight;
}

function bytesFromOutput(bytesLike) {
  return bytesLike instanceof Uint8Array ? bytesLike : new Uint8Array(bytesLike);
}

function normalizeTexmfBaseUrl(rawUrl) {
  return rawUrl.replace(/\/+$/u, "");
}

function parseLsR(text) {
  const byBasename = new Map();
  let currentDir = "";
  for (const rawLine of text.split(/\r?\n/u)) {
    const line = rawLine.trim();
    if (!line || line.startsWith("%")) {
      continue;
    }
    if (line.endsWith(":")) {
      let dir = line.slice(0, -1);
      if (dir.startsWith("./")) {
        dir = dir.slice(2);
      }
      currentDir = dir === "." ? "" : dir;
      continue;
    }
    const relative = currentDir ? `${currentDir}/${line}` : line;
    const basename = line.split("/").pop() || line;
    const prev = byBasename.get(basename) || [];
    if (!prev.includes(relative)) {
      prev.push(relative);
    }
    byBasename.set(basename, prev);
  }
  return byBasename;
}

async function loadTexmfFileMap(texmfBaseUrl) {
  const normalizedBaseUrl = normalizeTexmfBaseUrl(texmfBaseUrl);
  const cached = dvisvgmState.texmfByUrl.get(normalizedBaseUrl);
  if (cached) {
    return cached;
  }
  const response = await fetch(`${normalizedBaseUrl}/ls-R`);
  if (!response.ok) {
    throw new Error(`Failed to load dvisvgm ls-R index: ${response.status} ${response.statusText}`);
  }
  const text = await response.text();
  const parsed = parseLsR(text);
  dvisvgmState.texmfByUrl.set(normalizedBaseUrl, parsed);
  return parsed;
}

function encodeTexmfPath(path) {
  return path
    .split("/")
    .filter(Boolean)
    .map((segment) => encodeURIComponent(segment))
    .join("/");
}

function fetchBinarySync(url) {
  const xhr = new XMLHttpRequest();
  xhr.open("GET", url, false);
  xhr.overrideMimeType("text/plain; charset=x-user-defined");
  xhr.send();
  if (xhr.status !== 200) {
    return null;
  }
  const raw = xhr.responseText || "";
  const data = new Uint8Array(raw.length);
  for (let i = 0; i < raw.length; i += 1) {
    data[i] = raw.charCodeAt(i) & 0xff;
  }
  return data;
}

function kpseLoadFileRemote(namePtr) {
  const module = dvisvgmState.module;
  const fileMap = dvisvgmState.texmfByBasename;
  if (!module || !fileMap || !dvisvgmState.texmfBaseUrl) {
    return 0;
  }

  let requestedName = module.UTF8ToString(namePtr) || "";
  requestedName = requestedName.replace(/^\/+/u, "").replace(/^\.\/+/u, "");
  if (!requestedName) {
    return 0;
  }

  const virtualPath = `/${requestedName}`;
  if (module.FS.analyzePath(virtualPath).exists) {
    return 1;
  }

  const basename = requestedName.split("/").pop() || requestedName;
  const seen = new Set();
  const candidates = [];
  const addCandidate = (candidate) => {
    const normalized = String(candidate || "").replace(/^\.\/+/u, "").replace(/^\/+/u, "");
    if (!normalized || seen.has(normalized)) {
      return;
    }
    seen.add(normalized);
    candidates.push(normalized);
  };

  addCandidate(requestedName);
  const mapped = fileMap.get(basename) || [];
  for (const entry of mapped) {
    addCandidate(entry);
  }

  for (const candidate of candidates) {
    const encoded = encodeTexmfPath(candidate);
    const sourceUrl = `${dvisvgmState.texmfBaseUrl}/${encoded}`;
    const bytes = fetchBinarySync(sourceUrl);
    if (!bytes) {
      continue;
    }
    const dirEnd = virtualPath.lastIndexOf("/");
    if (dirEnd > 0) {
      module.FS.mkdirTree(virtualPath.slice(0, dirEnd));
    }
    module.FS.writeFile(virtualPath, bytes);
    return 1;
  }

  return 0;
}

async function ensureDvisvgm(texmfBaseUrl) {
  const normalizedBaseUrl = normalizeTexmfBaseUrl(texmfBaseUrl);
  dvisvgmState.texmfBaseUrl = normalizedBaseUrl;
  dvisvgmState.texmfByBasename = await loadTexmfFileMap(normalizedBaseUrl);

  if (dvisvgmState.module) {
    return dvisvgmState.module;
  }
  if (!dvisvgmState.initPromise) {
    const createDvisvgm = await import("https://git.macropus.org/dvisvgm/dvisvgm.js").then(m => m.default)
    dvisvgmState.initPromise = createDvisvgm({
      print: (line) => {
        if (dvisvgmState.activeLogSink) {
          dvisvgmState.activeLogSink.push(String(line));
        }
      },
      printErr: (line) => {
        if (dvisvgmState.activeLogSink) {
          dvisvgmState.activeLogSink.push(`ERR: ${String(line)}`);
        }
      },
      kpse_load_file_remote: (namePtr, format) => {
        void format;
        return kpseLoadFileRemote(namePtr);
      },
    })
      .then((module) => {
        dvisvgmState.module = module;
        return module;
      })
      .catch((error) => {
        dvisvgmState.initPromise = null;
        throw error;
      });
  }
  return dvisvgmState.initPromise;
}

function findDviFile(outputFiles, preferredPath) {
  if (preferredPath && Object.prototype.hasOwnProperty.call(outputFiles, preferredPath)) {
    return preferredPath;
  }
  const fallback = Object.keys(outputFiles).find((name) => name.toLowerCase().endsWith(".dvi"));
  return fallback || null;
}

function extractPageNumber(fileName) {
  const match = fileName.match(/(\d+)(?=\.svg$)/u);
  return match ? Number.parseInt(match[1], 10) : Number.NaN;
}

function dviToSvgName(dviPath, pageFileName) {
  const pageNumber = extractPageNumber(pageFileName);
  const stem = dviPath.replace(/\.dvi$/iu, "");
  if (Number.isFinite(pageNumber)) {
    return `${stem}-page-${pageNumber}.svg`;
  }
  return `${stem}-${pageFileName}`;
}

async function convertDviOutputs(outputFiles, dviFile, texmfBaseUrl) {
  const sourceDvi = findDviFile(outputFiles, dviFile);
  if (!sourceDvi) {
    return { outputFiles, note: "", logLines: [] };
  }

  const logLines = [];
  dvisvgmState.activeLogSink = logLines;
  try {
    const module = await ensureDvisvgm(texmfBaseUrl);
    const dviBytes = bytesFromOutput(outputFiles[sourceDvi]);
    for (const name of module.FS.readdir("/")) {
      if (name === "input.dvi" || /^page-\d+\.svg$/iu.test(name)) {
        try {
          module.FS.unlink(`/${name}`);
        } catch (_error) {
          // Best-effort cleanup between conversions.
        }
      }
    }

    module.FS.writeFile("/input.dvi", dviBytes);
    module.callMain(["-n", "-p", "1-", "/input.dvi", "-o", "/page-%p.svg"]);

    const pageSvgFiles = module.FS.readdir("/")
      .filter((name) => /^page-\d+\.svg$/iu.test(name))
      .sort((a, b) => extractPageNumber(a) - extractPageNumber(b));

    if (pageSvgFiles.length === 0) {
      throw new Error("dvisvgm produced no SVG output files");
    }

    const mergedOutputFiles = { ...outputFiles };
    for (const pageFile of pageSvgFiles) {
      mergedOutputFiles[dviToSvgName(sourceDvi, pageFile)] = module.FS.readFile(`/${pageFile}`);
    }

    return {
      outputFiles: mergedOutputFiles,
      note: `dvisvgm converted ${pageSvgFiles.length} page(s) from ${sourceDvi}`,
      logLines,
    };
  } finally {
    dvisvgmState.activeLogSink = null;
  }
}

function renderFiles(outputFiles) {
  fileList.innerHTML = "";
  const entries = Object.entries(outputFiles)
    .filter(([name]) => !name.toLowerCase().endsWith(".svg"));
  if (entries.length === 0) {
    const empty = document.createElement("li");
    empty.textContent = "No non-SVG output files produced";
    fileList.append(empty);
    return;
  }

  entries
    .sort(([a], [b]) => a.localeCompare(b))
    .forEach(([name, bytesLike]) => {
      const bytes = bytesLike instanceof Uint8Array ? bytesLike : new Uint8Array(bytesLike);
      const item = document.createElement("li");
      const meta = document.createElement("span");
      meta.textContent = `${name} (${bytes.length.toLocaleString()} bytes)`;
      const button = document.createElement("button");
      button.type = "button";
      button.textContent = "Download";
      button.addEventListener("click", () => {
        const blob = new Blob([bytes], { type: "application/octet-stream" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = name.split("/").pop() || name;
        link.click();
        setTimeout(() => URL.revokeObjectURL(url), 4000);
      });
      item.append(meta, button);
      fileList.append(item);
    });
}

function clearSvgPreviews() {
  for (const url of svgPreviewUrls) {
    URL.revokeObjectURL(url);
  }
  svgPreviewUrls = [];
  svgOutput.innerHTML = "";
}

function renderSvgPreviews(outputFiles) {
  clearSvgPreviews();

  const svgEntries = Object.entries(outputFiles)
    .filter(([name]) => name.toLowerCase().endsWith(".svg"))
    .sort(([a], [b]) => a.localeCompare(b));

  if (svgEntries.length === 0) {
    const empty = document.createElement("p");
    empty.className = "svg-empty";
    empty.textContent = "No SVG output generated.";
    svgOutput.append(empty);
    return;
  }

  for (const [name, bytesLike] of svgEntries) {
    const bytes = bytesFromOutput(bytesLike);
    const item = document.createElement("article");
    item.className = "svg-card";

    const image = document.createElement("img");
    image.alt = name;
    image.loading = "lazy";
    const blob = new Blob([bytes], { type: "image/svg+xml" });
    const url = URL.createObjectURL(blob);
    svgPreviewUrls.push(url);
    image.src = url;

    item.append(image);
    svgOutput.append(item);
  }
}

async function runCompile() {
  if (!workerReady) {
    return;
  }

  transcriptPre.textContent = "";
  logOutputPre.textContent = "";
  clearSvgPreviews();
  setBusy(true);

  const entryFile = "main.tex";

  const options = {
    projectFiles: {
      [entryFile]: sourceTextInput.value,
    },
    entryFile,
    command: "\\input plain \\input main.tex",
    initex: true,
    texmfBaseUrl: DEFAULT_TEXMF_BASE_URL,
  };

  const requestId = nextRequestId;
  nextRequestId += 1;

  const resultPromise = new Promise((resolve, reject) => {
    pending.set(requestId, { resolve, reject, startedAt: performance.now() });
  });

  worker.postMessage({ type: "compile", id: requestId, options });

  try {
    const { result, elapsedMs } = await resultPromise;
    let outputFiles = result.outputFiles || {};
    let transcriptText = result.transcript || "";
    let logText = result.log || "";

    try {
      const conversion = await convertDviOutputs(outputFiles, result.dviFile, options.texmfBaseUrl);
      outputFiles = conversion.outputFiles;
      transcriptText = appendText(transcriptText, conversion.note);
      if (conversion.logLines.length > 0) {
        logText = appendText(logText, conversion.logLines.join("\n"));
      }
    } catch (error) {
      const message = `dvisvgm conversion failed: ${error instanceof Error ? error.message : String(error)}`;
      transcriptText = appendText(transcriptText, message);
      logText = appendText(logText, message);
    }

    renderFiles(outputFiles);
    renderSvgPreviews(outputFiles);
    transcriptPre.textContent = transcriptText;
    logOutputPre.textContent = logText;

    if (result.success) {
      setStatus(`OK (${Math.round(elapsedMs)} ms)`, "status-ok");
    } else {
      setStatus(`Engine error (${Math.round(elapsedMs)} ms)`, "status-error");
    }
  } catch (error) {
    setStatus("Compile failed", "status-error");
    transcriptPre.textContent = error instanceof Error ? error.message : String(error);
  } finally {
    syncCompileButton(false);
  }
}

worker.addEventListener("message", (event) => {
  const message = event.data;

  if (message?.type === "worker:ready") {
    workerReady = true;
    syncCompileButton(false);
    setStatus("Worker ready", "status-ready");
    return;
  }

  if (message?.type === "worker:error") {
    workerReady = false;
    syncCompileButton(false);
    setStatus("Worker bootstrap failed", "status-error");
    transcriptPre.textContent = String(message.error || "Unknown worker error");
    return;
  }

  if (message?.type === "compile:progress") {
    const request = pending.get(message.id);
    if (!request) {
      return;
    }
    appendStreamingText(
      transcriptPre,
      typeof message.transcriptDelta === "string" ? message.transcriptDelta : "",
    );
    appendStreamingText(
      logOutputPre,
      typeof message.logDelta === "string" ? message.logDelta : "",
    );
    return;
  }

  if (message?.type !== "compile:result") {
    return;
  }

  const request = pending.get(message.id);
  if (!request) {
    return;
  }
  pending.delete(message.id);

  const elapsedMs = performance.now() - request.startedAt;
  if (message.ok) {
    request.resolve({ result: message.result, elapsedMs });
  } else {
    request.reject(new Error(message.error || "Compile request failed"));
  }
});

worker.addEventListener("error", (event) => {
  setStatus("Worker runtime error", "status-error");
  transcriptPre.textContent = event.message || "Unknown worker runtime error";
  workerReady = false;
  syncCompileButton(false);
});

compileBtn.addEventListener("click", () => {
  void runCompile();
});
