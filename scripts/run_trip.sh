#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(CDPATH= cd -- "$(dirname -- "${BASH_SOURCE[0]}")/.." && pwd)"

SUITE="both"
ASSETS_DIR="${TRIP_ASSETS_DIR:-$ROOT_DIR/triptrap}"
WORK_ROOT="${TRIP_WORK_ROOT:-$ROOT_DIR/.trip-work}"
KEEP_WORK=0
VERBOSE=0
STRICT_CANONICAL="${TRIP_STRICT_CANONICAL:-0}"

TRIP_BASELINE_BIN="${TRIP_BASELINE_BIN:-$(command -v initex || command -v tex || true)}"
TRIP_CANDIDATE_BIN="${TRIP_CANDIDATE_BIN:-$ROOT_DIR/bin/initex}"
ETRIP_BASELINE_BIN="${ETRIP_BASELINE_BIN:-$(command -v etex || true)}"
ETRIP_CANDIDATE_BIN="${ETRIP_CANDIDATE_BIN:-$ROOT_DIR/bin/initex}"

usage() {
  cat <<'EOF'
Usage: scripts/run_trip.sh [options]

Run TRIP/e-TRIP compatibility checks by diffing this port against a baseline TeX engine.

Options:
  --suite trip|etrip|both   Which suite(s) to run (default: both)
  --assets DIR              Directory containing trip/etrip assets (default: ./triptrap)
  --workdir DIR             Workspace for run artifacts (default: ./.trip-work)
  --keep-work               Keep work directories even when all checks pass
  --verbose                 Print executed commands
  --strict-canonical        Fail when canonical references mismatch
  -h, --help                Show this help text

Environment overrides:
  TRIP_BASELINE_BIN         Baseline TRIP engine (default: initex, falling back to tex)
  TRIP_CANDIDATE_BIN        Candidate TRIP engine (default: ./bin/initex)
  ETRIP_BASELINE_BIN        Baseline e-TRIP engine (default: etex)
  ETRIP_CANDIDATE_BIN       Candidate e-TRIP engine (default: ./bin/initex)
  TRIP_ASSETS_DIR           Same as --assets
  TRIP_WORK_ROOT            Same as --workdir
  TRIP_STRICT_CANONICAL     Set to 1 to fail on canonical mismatches

Expected assets:
  trip.tex, trip.tfm
  etrip.tex, etrip.tfm

Optional canonical references:
  trip.log, trip.typ, etrip.log, etrip.typ
EOF
}

log() {
  printf 'trip-harness: %s\n' "$*" >&2
}

die() {
  log "$*"
  exit 1
}

debug() {
  if [ "$VERBOSE" -eq 1 ]; then
    log "$*"
  fi
}

while [ "$#" -gt 0 ]; do
  case "$1" in
    --suite)
      [ "$#" -ge 2 ] || die "missing value for --suite"
      SUITE="$2"
      shift 2
      ;;
    --assets)
      [ "$#" -ge 2 ] || die "missing value for --assets"
      ASSETS_DIR="$2"
      shift 2
      ;;
    --workdir)
      [ "$#" -ge 2 ] || die "missing value for --workdir"
      WORK_ROOT="$2"
      shift 2
      ;;
    --keep-work)
      KEEP_WORK=1
      shift
      ;;
    --verbose)
      VERBOSE=1
      shift
      ;;
    --strict-canonical)
      STRICT_CANONICAL=1
      shift
      ;;
    -h|--help)
      usage
      exit 0
      ;;
    *)
      die "unknown option: $1"
      ;;
  esac
done

case "$SUITE" in
  trip|etrip|both) ;;
  *) die "invalid --suite value: $SUITE" ;;
esac

command -v diff >/dev/null 2>&1 || die "missing required command: diff"
command -v sed >/dev/null 2>&1 || die "missing required command: sed"
command -v dvitype >/dev/null 2>&1 || die "missing required command: dvitype"

[ -d "$ASSETS_DIR" ] || die "assets directory not found: $ASSETS_DIR"
if [ "$SUITE" = "trip" ] || [ "$SUITE" = "both" ]; then
  [ -n "$TRIP_BASELINE_BIN" ] || die "could not resolve baseline TRIP engine (initex/tex)"
  [ -x "$TRIP_CANDIDATE_BIN" ] || die "candidate TRIP engine is not executable: $TRIP_CANDIDATE_BIN"
fi
if [ "$SUITE" = "etrip" ] || [ "$SUITE" = "both" ]; then
  [ -n "$ETRIP_BASELINE_BIN" ] || die "could not resolve baseline e-TRIP engine (etex)"
  [ -x "$ETRIP_CANDIDATE_BIN" ] || die "candidate e-TRIP engine is not executable: $ETRIP_CANDIDATE_BIN"
fi

require_assets() {
  local suite="$1"
  [ -f "$ASSETS_DIR/$suite.tex" ] || die "missing required asset: $ASSETS_DIR/$suite.tex"
  [ -f "$ASSETS_DIR/$suite.tfm" ] || die "missing required asset: $ASSETS_DIR/$suite.tfm"
}

copy_suite_assets() {
  local suite="$1"
  local out_dir="$2"
  mkdir -p "$out_dir"

  cp "$ASSETS_DIR/$suite.tex" "$out_dir/"
  cp "$ASSETS_DIR/$suite.tfm" "$out_dir/"

  if [ -f "$ASSETS_DIR/$suite.pl" ]; then
    cp "$ASSETS_DIR/$suite.pl" "$out_dir/"
  fi

  shopt -s nullglob
  local in_files=("$ASSETS_DIR/$suite"[0-9]*.in)
  shopt -u nullglob
  if [ "${#in_files[@]}" -gt 0 ]; then
    cp "${in_files[@]}" "$out_dir/"
  fi

  local extra
  for extra in TEX.POOL tex.pool etex.pool plain.tex hyphen.tex; do
    if [ -f "$ASSETS_DIR/$extra" ]; then
      cp "$ASSETS_DIR/$extra" "$out_dir/"
    fi
  done
}

pick_output_file() {
  local dir="$1"
  local stem="$2"
  local ext="$3"

  local preferred="$dir/$stem.$ext"
  if [ -f "$preferred" ]; then
    printf '%s\n' "$preferred"
    return 0
  fi

  local texput="$dir/texput.$ext"
  if [ -f "$texput" ]; then
    printf '%s\n' "$texput"
    return 0
  fi

  local -a candidates=()
  local file
  shopt -s nullglob
  for file in "$dir"/*."$ext"; do
    if [ -f "$file" ]; then
      candidates+=("$file")
    fi
  done
  shopt -u nullglob

  if [ "${#candidates[@]}" -gt 1 ]; then
    local sorted
    sorted="$(printf '%s\n' "${candidates[@]}" | sort)"
    candidates=()
    while IFS= read -r file; do
      candidates+=("$file")
    done <<< "$sorted"
  fi

  if [ "${#candidates[@]}" -eq 1 ]; then
    printf '%s\n' "${candidates[0]}"
    return 0
  fi

  if [ "${#candidates[@]}" -gt 1 ]; then
    local c
    for c in "${candidates[@]}"; do
      case "$(basename "$c")" in
        "$stem".*|"$stem"_*|"$stem"-*)
          printf '%s\n' "$c"
          return 0
          ;;
      esac
    done
  fi

  return 1
}

normalize_text_lines() {
  local input="$1"
  local output="$2"
  sed -E \
    -e 's/\r$//' \
    -e 's/[[:space:]]+$//' \
    -e '/^This is /d' \
    -e '/^ entering extended mode$/d' \
    -e '/^[[:space:]]*restricted [\\]write18 enabled\\.$/d' \
    -e '/^[[:space:]]*%&-line parsing enabled\\.$/d' \
    -e '/write18 enabled\\.$/d' \
    -e '/%&-line parsing enabled\\.$/d' \
    -e '/^\*\*Sorry, I.can.t find.*format.*$/d' \
    -e '/^I can.t find the PLAIN format file!$/d' \
    -e '/^Transcript written on /d' \
    -e '/^Output written on /d' \
    -e '/^[[:space:]]*[0-9]+ strings of total length [0-9]+$/d' \
    -e '/^[[:space:]]*[0-9]+ strings out of /d' \
    -e '/^[[:space:]]*[0-9]+ string characters out of /d' \
    -e '/^[[:space:]]*[0-9]+ words of memory out of /d' \
    -e '/^[[:space:]]*[0-9]+ multiletter control sequences out of /d' \
    -e '/^[[:space:]]*[0-9]+ words of font info for [0-9]+ fonts, out of /d' \
    -e '/^[[:space:]]*[0-9]+ hyphenation exception out of /d' \
    -e '/^[[:space:]]*[0-9]+ hyphenation exceptions out of /d' \
    -e '/^[[:space:]]*[0-9]+i,[[:space:]]*[0-9]+n,[[:space:]]*[0-9]+p,[[:space:]]*[0-9]+b,[[:space:]]*[0-9]+s stack positions out of /d' \
    -e 's/glue set [+-]?[0-9]+(\.[0-9]+)?/glue set <ratio>/g' \
    "$input" \
    | awk 'index($0, "write18 enabled.") == 0 && index($0, "%&-line parsing enabled.") == 0' \
    > "$output"
}

normalize_dvitype_text() {
  local input="$1"
  local output="$2"
  sed -E \
    -e 's/\r$//' \
    -e '/^This is DVItype,/d' \
    -e '/^Options selected:/d' \
    -e "/^' .* output [0-9]/d" \
    -e '/^Postamble starts at byte /d' \
    -e '/^maxv=.*totalpages=/d' \
    -e 's/^([[:space:]]*Starting page = \*)\.[^ ]*/\1/' \
    -e 's/^([[:space:]]*[0-9]+: beginning of page -?[0-9]+)\.[^ ]*/\1/' \
    -e 's/\b(right4|down4|y4|y0)[[:space:]]+-?[0-9]+/\1 <n>/g' \
    "$input" > "$output"
}

generate_normalized_dvitype() {
  local dvi_file="$1"
  local output="$2"
  local output_dir
  output_dir="$(CDPATH= cd -- "$(dirname -- "$output")" && pwd)"
  local output_base
  output_base="$(basename -- "$output")"
  local raw="$output_dir/$output_base.raw"
  local stderr_file="$output_dir/$output_base.stderr"

  local dvi_dir
  dvi_dir="$(dirname -- "$dvi_file")"
  local dvi_name
  dvi_name="$(basename -- "$dvi_file")"
  if ! (
    cd "$dvi_dir" || exit 70
    dvitype -output-level=2 -dpi=72.27 "$dvi_name" >"$raw" 2>"$stderr_file"
  ); then
    return 1
  fi
  normalize_dvitype_text "$raw" "$output"
}

mark_canonical_mismatch() {
  local suite_failed_ref="$1"
  local suite_canonical_ref="$2"
  local diff_path="$3"
  printf -v "$suite_canonical_ref" '%s' 1
  if [ "$STRICT_CANONICAL" -eq 1 ]; then
    printf -v "$suite_failed_ref" '%s' 1
  else
    log "canonical mismatch retained for review (strict mode off): $diff_path"
  fi
}

run_engine() {
  local run_dir="$1"
  local tag="$2"
  local input_file="$3"
  shift 3
  local -a cmd=("$@")
  debug "[$tag] ${cmd[*]}"
  set +e
  (
    cd "$run_dir" || exit 70
    if [ -n "$input_file" ]; then
      "${cmd[@]}" <"$input_file" >"$tag.stdout" 2>"$tag.stderr"
    else
      "${cmd[@]}" < /dev/null >"$tag.stdout" 2>"$tag.stderr"
    fi
  )
  local rc=$?
  set -e
  printf '%s\n' "$rc" >"$run_dir/$tag.exit"
  return "$rc"
}

ensure_plain_fallback_format() {
  local run_dir="$1"
  shift
  local -a cmd=("$@")
  local fallback_fmt="$run_dir/TeXformats:plain.fmt"

  if [ -f "$fallback_fmt" ]; then
    return 0
  fi

  printf '*\\dump\n' >"$run_dir/.plainfmt.in"
  if ! run_engine "$run_dir" "candidate.fallbackfmt" ".plainfmt.in" "${cmd[@]}"; then
    log "candidate fallback fmt bootstrap exited nonzero (rc=$(cat "$run_dir/candidate.fallbackfmt.exit")) - checking artifacts"
  fi

  local generated_fmt=""
  if generated_fmt="$(pick_output_file "$run_dir" "texput" fmt)"; then
    cp "$generated_fmt" "$fallback_fmt"
    return 0
  fi
  if generated_fmt="$(pick_output_file "$run_dir" "plain" fmt)"; then
    cp "$generated_fmt" "$fallback_fmt"
    return 0
  fi

  log "warning: could not bootstrap fallback plain format in $run_dir"
  return 1
}

compare_norm_files() {
  local label="$1"
  local left="$2"
  local right="$3"
  local diff_out="$4"
  if diff -u "$left" "$right" >"$diff_out"; then
    log "$label: OK"
    return 0
  fi
  log "$label: mismatch (diff: $diff_out)"
  return 1
}

run_suite() {
  local suite="$1"

  require_assets "$suite"

  local suite_root="$WORK_ROOT/$suite"
  local base_dir="$suite_root/baseline"
  local cand_dir="$suite_root/candidate"
  local norm_dir="$suite_root/normalized"

  rm -rf "$suite_root"
  mkdir -p "$base_dir" "$cand_dir" "$norm_dir"

  copy_suite_assets "$suite" "$base_dir"
  copy_suite_assets "$suite" "$cand_dir"

  local -a baseline_cmd
  local -a candidate_cmd
  local input_phase1=""
  local input_phase2=""
  if [ "$suite" = "trip" ]; then
    baseline_cmd=("$TRIP_BASELINE_BIN")
    candidate_cmd=("$TRIP_CANDIDATE_BIN")
    input_phase1="trip1.in"
    input_phase2="trip2.in"
  else
    baseline_cmd=("$ETRIP_BASELINE_BIN" "-ini")
    candidate_cmd=("$ETRIP_CANDIDATE_BIN")
    printf '*etrip\n' >"$base_dir/etrip1.in"
    printf '&etrip etrip\n' >"$base_dir/etrip2.in"
    printf '*etrip\n' >"$cand_dir/etrip1.in"
    printf '&etrip etrip\n' >"$cand_dir/etrip2.in"
    input_phase1="etrip1.in"
    input_phase2="etrip2.in"
  fi

  if [ "$suite" = "etrip" ]; then
    ensure_plain_fallback_format "$cand_dir" "${candidate_cmd[@]}" || true
  fi

  if ! run_engine "$base_dir" "baseline.phase1" "$input_phase1" "${baseline_cmd[@]}"; then
    log "$suite baseline phase1 run exited nonzero (rc=$(cat "$base_dir/baseline.phase1.exit")) - continuing with artifact checks"
  fi
  local base_phase1_log
  base_phase1_log="$(pick_output_file "$base_dir" "$suite" log)" || die "missing baseline phase1 log for $suite"
  cp "$base_phase1_log" "$base_dir/baseline.phase1.log"

  if ! run_engine "$base_dir" "baseline.phase2" "$input_phase2" "${baseline_cmd[@]}"; then
    log "$suite baseline phase2 run exited nonzero (rc=$(cat "$base_dir/baseline.phase2.exit")) - continuing with artifact checks"
  fi
  local base_phase2_log
  base_phase2_log="$(pick_output_file "$base_dir" "$suite" log)" || die "missing baseline phase2 log for $suite"
  cp "$base_phase2_log" "$base_dir/baseline.phase2.log"
  local base_phase2_dvi=""
  if base_phase2_dvi="$(pick_output_file "$base_dir" "$suite" dvi)"; then
    cp "$base_phase2_dvi" "$base_dir/baseline.phase2.dvi"
    base_phase2_dvi="$base_dir/baseline.phase2.dvi"
  else
    base_phase2_dvi=""
  fi

  if ! run_engine "$cand_dir" "candidate.phase1" "$input_phase1" "${candidate_cmd[@]}"; then
    log "$suite candidate phase1 run exited nonzero (rc=$(cat "$cand_dir/candidate.phase1.exit")) - continuing with artifact checks"
  fi
  local cand_phase1_log
  cand_phase1_log="$(pick_output_file "$cand_dir" "$suite" log)" || die "missing candidate phase1 log for $suite"
  cp "$cand_phase1_log" "$cand_dir/candidate.phase1.log"

  if ! run_engine "$cand_dir" "candidate.phase2" "$input_phase2" "${candidate_cmd[@]}"; then
    log "$suite candidate phase2 run exited nonzero (rc=$(cat "$cand_dir/candidate.phase2.exit")) - continuing with artifact checks"
  fi
  local cand_phase2_log
  cand_phase2_log="$(pick_output_file "$cand_dir" "$suite" log)" || die "missing candidate phase2 log for $suite"
  cp "$cand_phase2_log" "$cand_dir/candidate.phase2.log"
  local cand_phase2_dvi=""
  if cand_phase2_dvi="$(pick_output_file "$cand_dir" "$suite" dvi)"; then
    cp "$cand_phase2_dvi" "$cand_dir/candidate.phase2.dvi"
    cand_phase2_dvi="$cand_dir/candidate.phase2.dvi"
  else
    cand_phase2_dvi=""
  fi

  local has_dvi=1
  if [ -z "$base_phase2_dvi" ]; then
    has_dvi=0
  fi
  if [ -z "$cand_phase2_dvi" ]; then
    if [ "$has_dvi" -eq 1 ]; then
      die "missing candidate dvi for $suite"
    fi
    has_dvi=0
  fi
  if [ "$has_dvi" -eq 0 ] && [ -n "$base_phase2_dvi" ]; then
    die "missing candidate dvi for $suite"
  fi
  if [ "$has_dvi" -eq 0 ] && [ -n "$cand_phase2_dvi" ]; then
    die "missing baseline dvi for $suite"
  fi

  normalize_text_lines "$base_dir/baseline.phase1.stdout" "$norm_dir/baseline.phase1.stdout.norm"
  normalize_text_lines "$cand_dir/candidate.phase1.stdout" "$norm_dir/candidate.phase1.stdout.norm"
  normalize_text_lines "$base_dir/baseline.phase2.stdout" "$norm_dir/baseline.phase2.stdout.norm"
  normalize_text_lines "$cand_dir/candidate.phase2.stdout" "$norm_dir/candidate.phase2.stdout.norm"

  normalize_text_lines "$base_dir/baseline.phase1.log" "$norm_dir/baseline.phase1.log.norm"
  normalize_text_lines "$cand_dir/candidate.phase1.log" "$norm_dir/candidate.phase1.log.norm"
  normalize_text_lines "$base_dir/baseline.phase2.log" "$norm_dir/baseline.phase2.log.norm"
  normalize_text_lines "$cand_dir/candidate.phase2.log" "$norm_dir/candidate.phase2.log.norm"

  local suite_failed=0
  local suite_had_canonical_mismatch=0
  local dvi_norm_ready=0
  if [ "$has_dvi" -eq 1 ]; then
    local dvi_norm_failed=0
    if ! generate_normalized_dvitype "$base_phase2_dvi" "$norm_dir/baseline.dvitype.norm"; then
      log "failed to run dvitype on baseline dvi for $suite (see $norm_dir/baseline.dvitype.norm.stderr)"
      dvi_norm_failed=1
      suite_failed=1
    fi
    if ! generate_normalized_dvitype "$cand_phase2_dvi" "$norm_dir/candidate.dvitype.norm"; then
      log "failed to run dvitype on candidate dvi for $suite (see $norm_dir/candidate.dvitype.norm.stderr)"
      dvi_norm_failed=1
      suite_failed=1
    fi
    if [ "$dvi_norm_failed" -eq 0 ]; then
      dvi_norm_ready=1
    fi
  fi

  compare_norm_files \
    "$suite phase1 stdout (baseline vs candidate)" \
    "$norm_dir/baseline.phase1.stdout.norm" \
    "$norm_dir/candidate.phase1.stdout.norm" \
    "$suite_root/phase1-stdout.diff" || suite_failed=1

  compare_norm_files \
    "$suite phase2 stdout (baseline vs candidate)" \
    "$norm_dir/baseline.phase2.stdout.norm" \
    "$norm_dir/candidate.phase2.stdout.norm" \
    "$suite_root/phase2-stdout.diff" || suite_failed=1

  compare_norm_files \
    "$suite phase1 log (baseline vs candidate)" \
    "$norm_dir/baseline.phase1.log.norm" \
    "$norm_dir/candidate.phase1.log.norm" \
    "$suite_root/phase1-log.diff" || suite_failed=1

  compare_norm_files \
    "$suite phase2 log (baseline vs candidate)" \
    "$norm_dir/baseline.phase2.log.norm" \
    "$norm_dir/candidate.phase2.log.norm" \
    "$suite_root/phase2-log.diff" || suite_failed=1

  if [ "$dvi_norm_ready" -eq 1 ]; then
    compare_norm_files \
      "$suite dvitype (baseline vs candidate)" \
      "$norm_dir/baseline.dvitype.norm" \
      "$norm_dir/candidate.dvitype.norm" \
      "$suite_root/dvitype.diff" || suite_failed=1
  elif [ "$has_dvi" -eq 1 ]; then
    log "$suite produced dvi files, but dvitype failed on at least one run (skipping dvitype diff)"
  else
    log "$suite produced no dvi in baseline/candidate (skipping dvitype diff)"
  fi

  if [ -f "$ASSETS_DIR/${suite}in.log" ]; then
    normalize_text_lines "$ASSETS_DIR/${suite}in.log" "$norm_dir/canonical.phase1.log.norm"
    compare_norm_files \
      "$suite phase1 log (candidate vs canonical)" \
      "$norm_dir/canonical.phase1.log.norm" \
      "$norm_dir/candidate.phase1.log.norm" \
      "$suite_root/phase1-log-canonical.diff" || mark_canonical_mismatch suite_failed suite_had_canonical_mismatch "$suite_root/phase1-log-canonical.diff"
  else
    log "$suite canonical phase1 log not found at $ASSETS_DIR/${suite}in.log (skipping canonical phase1 log diff)"
  fi

  if [ -f "$ASSETS_DIR/$suite.log" ]; then
    normalize_text_lines "$ASSETS_DIR/$suite.log" "$norm_dir/canonical.phase2.log.norm"
    compare_norm_files \
      "$suite phase2 log (candidate vs canonical)" \
      "$norm_dir/canonical.phase2.log.norm" \
      "$norm_dir/candidate.phase2.log.norm" \
      "$suite_root/phase2-log-canonical.diff" || mark_canonical_mismatch suite_failed suite_had_canonical_mismatch "$suite_root/phase2-log-canonical.diff"
  else
    log "$suite canonical phase2 log not found at $ASSETS_DIR/$suite.log (skipping canonical phase2 log diff)"
  fi

  if [ -f "$ASSETS_DIR/$suite.typ" ] && [ "$dvi_norm_ready" -eq 1 ]; then
    normalize_dvitype_text "$ASSETS_DIR/$suite.typ" "$norm_dir/canonical.dvitype.norm"
    compare_norm_files \
      "$suite dvitype (candidate vs canonical)" \
      "$norm_dir/canonical.dvitype.norm" \
      "$norm_dir/candidate.dvitype.norm" \
      "$suite_root/dvitype-canonical.diff" || mark_canonical_mismatch suite_failed suite_had_canonical_mismatch "$suite_root/dvitype-canonical.diff"
  elif [ -f "$ASSETS_DIR/$suite.typ" ] && [ "$has_dvi" -eq 1 ]; then
    log "$suite canonical dvitype present but candidate/baseline dvi could not be parsed by dvitype"
  elif [ -f "$ASSETS_DIR/$suite.typ" ]; then
    log "$suite canonical dvitype present but no candidate dvi to compare"
  else
    log "$suite canonical dvitype not found at $ASSETS_DIR/$suite.typ (skipping canonical dvitype diff)"
  fi

  if [ "$suite_failed" -eq 0 ]; then
    log "$suite: PASS"
    if [ "$KEEP_WORK" -eq 0 ] && [ "$suite_had_canonical_mismatch" -eq 0 ]; then
      rm -rf "$suite_root"
    elif [ "$KEEP_WORK" -eq 0 ]; then
      log "$suite: retained artifacts in $suite_root (canonical mismatches)"
    fi
    return 0
  fi

  log "$suite: FAIL (artifacts kept in $suite_root)"
  return 1
}

mkdir -p "$WORK_ROOT"

failures=0
if [ "$SUITE" = "trip" ] || [ "$SUITE" = "both" ]; then
  if ! run_suite "trip"; then
    failures=$((failures + 1))
  fi
fi
if [ "$SUITE" = "etrip" ] || [ "$SUITE" = "both" ]; then
  if ! run_suite "etrip"; then
    failures=$((failures + 1))
  fi
fi

if [ "$failures" -ne 0 ]; then
  die "completed with $failures failing suite(s)"
fi

if [ "$KEEP_WORK" -eq 0 ] && [ -d "$WORK_ROOT" ]; then
  rmdir "$WORK_ROOT" 2>/dev/null || true
fi

log "all requested suites passed"
