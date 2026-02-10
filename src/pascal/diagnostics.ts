import { copyInStateRecord, InStateRecord } from "./input_state";

export interface DateTimeState {
  sysTime: number;
  sysDay: number;
  sysMonth: number;
  sysYear: number;
  eqtbInt: number[];
}

export function fixDateAndTime(state: DateTimeState): void {
  state.sysTime = 12 * 60;
  state.sysDay = 4;
  state.sysMonth = 7;
  state.sysYear = 1776;
  state.eqtbInt[5288] = state.sysTime;
  state.eqtbInt[5289] = state.sysDay;
  state.eqtbInt[5290] = state.sysMonth;
  state.eqtbInt[5291] = state.sysYear;
}

export interface BeginDiagnosticState {
  oldSetting: number;
  selector: number;
  eqtbInt: number[];
  history: number;
}

export function beginDiagnostic(state: BeginDiagnosticState): void {
  state.oldSetting = state.selector;
  if (state.eqtbInt[5297] <= 0 && state.selector === 19) {
    state.selector -= 1;
    if (state.history === 0) {
      state.history = 1;
    }
  }
}

export interface EndDiagnosticState {
  oldSetting: number;
  selector: number;
}

export interface EndDiagnosticOps {
  printNl: (s: number) => void;
  printLn: () => void;
}

export function endDiagnostic(
  blankLine: boolean,
  state: EndDiagnosticState,
  ops: EndDiagnosticOps,
): void {
  ops.printNl(339);
  if (blankLine) {
    ops.printLn();
  }
  state.selector = state.oldSetting;
}

export interface LengthParamOps {
  printEsc: (s: number) => void;
  print: (s: number) => void;
}

export function printLengthParam(n: number, ops: LengthParamOps): void {
  if (n >= 0 && n <= 20) {
    ops.printEsc(481 + n);
  } else {
    ops.print(502);
  }
}

export interface ParamOps {
  printEsc: (s: number) => void;
  print: (s: number) => void;
}

export function printParam(n: number, ops: ParamOps): void {
  if (n >= 0 && n <= 54) {
    ops.printEsc(423 + n);
    return;
  }
  if (n >= 56 && n <= 63) {
    ops.printEsc(1320 + (n - 56));
    return;
  }

  switch (n) {
    case 55:
      ops.printEsc(1319);
      break;
    case 64:
      ops.printEsc(1366);
      break;
    default:
      ops.print(478);
      break;
  }
}

export interface PrintGroupState {
  curGroup: number;
  curLevel: number;
  savePtr: number;
  saveStackInt: number[];
}

export interface PrintGroupOps {
  print: (s: number) => void;
  printInt: (n: number) => void;
  printChar: (c: number) => void;
}

export function printGroup(
  e: boolean,
  state: PrintGroupState,
  ops: PrintGroupOps,
): void {
  switch (state.curGroup) {
    case 0:
      ops.print(1328);
      return;
    case 1:
    case 14:
      if (state.curGroup === 14) {
        ops.print(1329);
      }
      ops.print(1330);
      break;
    case 2:
    case 3:
      if (state.curGroup === 3) {
        ops.print(1331);
      }
      ops.print(1072);
      break;
    case 4:
      ops.print(979);
      break;
    case 5:
      ops.print(1071);
      break;
    case 6:
    case 7:
      if (state.curGroup === 7) {
        ops.print(1332);
      }
      ops.print(1333);
      break;
    case 8:
      ops.print(401);
      break;
    case 10:
      ops.print(1334);
      break;
    case 11:
      ops.print(331);
      break;
    case 12:
      ops.print(543);
      break;
    case 9:
    case 13:
    case 15:
    case 16:
      ops.print(346);
      if (state.curGroup === 13) {
        ops.print(1335);
      } else if (state.curGroup === 15) {
        ops.print(1336);
      } else if (state.curGroup === 16) {
        ops.print(1337);
      }
      break;
    default:
      break;
  }

  ops.print(1338);
  ops.printInt(state.curLevel);
  ops.printChar(41);
  if (state.saveStackInt[state.savePtr - 1] !== 0) {
    if (e) {
      ops.print(367);
    } else {
      ops.print(267);
    }
    ops.printInt(state.saveStackInt[state.savePtr - 1]);
  }
}

export interface PrintModeOps {
  print: (s: number) => void;
}

export function printMode(m: number, ops: PrintModeOps): void {
  if (m > 0) {
    switch (Math.trunc(m / 101)) {
      case 0:
        ops.print(358);
        break;
      case 1:
        ops.print(359);
        break;
      case 2:
        ops.print(360);
        break;
      default:
        break;
    }
  } else if (m === 0) {
    ops.print(361);
  } else {
    switch (Math.trunc((-m) / 101)) {
      case 0:
        ops.print(362);
        break;
      case 1:
        ops.print(363);
        break;
      case 2:
        ops.print(346);
        break;
      default:
        break;
    }
  }
  ops.print(364);
}

export interface PrintCmdChrState {
  memLh: number[];
  memB0: number[];
  memRh: number[];
  fontName: number[];
  fontSize: number[];
  fontDsize: number[];
}

export interface PrintCmdChrOps {
  print: (s: number) => void;
  printEsc: (s: number) => void;
  printInt: (n: number) => void;
  printChar: (c: number) => void;
  printSkipParam: (n: number) => void;
  printParam: (n: number) => void;
  printLengthParam: (n: number) => void;
  printSaNum: (q: number) => void;
  printStyle: (c: number) => void;
  printHex: (n: number) => void;
  printSize: (s: number) => void;
  slowPrint: (s: number) => void;
  printScaled: (s: number) => void;
}

export function printCmdChr(
  cmd: number,
  chrCode: number,
  state: PrintCmdChrState,
  ops: PrintCmdChrOps,
): void {
  let n = 0;
  switch (cmd) {
    case 1:
      ops.print(564);
      ops.print(chrCode);
      break;
    case 2:
      ops.print(565);
      ops.print(chrCode);
      break;
    case 3:
      ops.print(566);
      ops.print(chrCode);
      break;
    case 6:
      ops.print(567);
      ops.print(chrCode);
      break;
    case 7:
      ops.print(568);
      ops.print(chrCode);
      break;
    case 8:
      ops.print(569);
      ops.print(chrCode);
      break;
    case 9:
      ops.print(570);
      break;
    case 10:
      ops.print(571);
      ops.print(chrCode);
      break;
    case 11:
      ops.print(572);
      ops.print(chrCode);
      break;
    case 12:
      ops.print(573);
      ops.print(chrCode);
      break;
    case 75:
    case 76:
      if (chrCode < 2900) {
        ops.printSkipParam(chrCode - 2882);
      } else if (chrCode < 3156) {
        ops.printEsc(398);
        ops.printInt(chrCode - 2900);
      } else {
        ops.printEsc(399);
        ops.printInt(chrCode - 3156);
      }
      break;
    case 72:
      if (chrCode >= 3423) {
        ops.printEsc(410);
        ops.printInt(chrCode - 3423);
      } else {
        switch (chrCode) {
          case 3413:
            ops.printEsc(401);
            break;
          case 3414:
            ops.printEsc(402);
            break;
          case 3415:
            ops.printEsc(403);
            break;
          case 3416:
            ops.printEsc(404);
            break;
          case 3417:
            ops.printEsc(405);
            break;
          case 3418:
            ops.printEsc(406);
            break;
          case 3419:
            ops.printEsc(407);
            break;
          case 3420:
            ops.printEsc(408);
            break;
          case 3422:
            ops.printEsc(1318);
            break;
          default:
            ops.printEsc(409);
            break;
        }
      }
      break;
    case 73:
      if (chrCode < 5333) {
        ops.printParam(chrCode - 5268);
      } else {
        ops.printEsc(479);
        ops.printInt(chrCode - 5333);
      }
      break;
    case 74:
      if (chrCode < 5866) {
        ops.printLengthParam(chrCode - 5845);
      } else {
        ops.printEsc(503);
        ops.printInt(chrCode - 5866);
      }
      break;
    case 45:
      ops.printEsc(511);
      break;
    case 90:
      ops.printEsc(512);
      break;
    case 40:
      ops.printEsc(513);
      break;
    case 41:
      ops.printEsc(514);
      break;
    case 77:
      ops.printEsc(522);
      break;
    case 61:
      ops.printEsc(515);
      break;
    case 42:
      ops.printEsc(535);
      break;
    case 16:
      ops.printEsc(516);
      break;
    case 107:
      ops.printEsc(507);
      break;
    case 88:
      ops.printEsc(521);
      break;
    case 15:
      ops.printEsc(517);
      break;
    case 92:
      ops.printEsc(518);
      break;
    case 67:
      ops.printEsc(508);
      break;
    case 62:
      ops.printEsc(519);
      break;
    case 64:
      ops.printEsc(32);
      break;
    case 102:
      if (chrCode === 0) {
        ops.printEsc(520);
      } else {
        ops.printEsc(784);
      }
      break;
    case 32:
      ops.printEsc(523);
      break;
    case 36:
      ops.printEsc(524);
      break;
    case 39:
      ops.printEsc(525);
      break;
    case 37:
      ops.printEsc(331);
      break;
    case 44:
      ops.printEsc(47);
      break;
    case 18:
      ops.printEsc(354);
      if (chrCode > 0) {
        ops.printChar(115);
      }
      break;
    case 46:
      ops.printEsc(526);
      break;
    case 17:
      ops.printEsc(527);
      break;
    case 54:
      ops.printEsc(528);
      break;
    case 91:
      ops.printEsc(529);
      break;
    case 34:
      ops.printEsc(530);
      break;
    case 65:
      ops.printEsc(531);
      break;
    case 103:
      ops.printEsc(532);
      break;
    case 55:
      ops.printEsc(336);
      break;
    case 63:
      ops.printEsc(533);
      break;
    case 66:
      ops.printEsc(537);
      break;
    case 96:
      if (chrCode === 0) {
        ops.printEsc(538);
      } else {
        ops.printEsc(1381);
      }
      break;
    case 0:
      ops.printEsc(539);
      break;
    case 98:
      ops.printEsc(540);
      break;
    case 80:
      ops.printEsc(536);
      break;
    case 84:
      switch (chrCode) {
        case 3412:
          ops.printEsc(534);
          break;
        case 3679:
          ops.printEsc(1415);
          break;
        case 3680:
          ops.printEsc(1416);
          break;
        case 3681:
          ops.printEsc(1417);
          break;
        case 3682:
          ops.printEsc(1418);
          break;
        default:
          break;
      }
      break;
    case 109:
      if (chrCode === 0) {
        ops.printEsc(541);
      } else if (chrCode === 1) {
        ops.printEsc(1356);
      } else {
        ops.printEsc(1357);
      }
      break;
    case 71:
      ops.printEsc(410);
      if (chrCode !== 0) {
        ops.printSaNum(chrCode);
      }
      break;
    case 38:
      ops.printEsc(355);
      break;
    case 33:
      if (chrCode === 0) {
        ops.printEsc(542);
      } else {
        switch (chrCode) {
          case 6:
            ops.printEsc(1367);
            break;
          case 7:
            ops.printEsc(1368);
            break;
          case 10:
            ops.printEsc(1369);
            break;
          default:
            ops.printEsc(1370);
            break;
        }
      }
      break;
    case 56:
      ops.printEsc(543);
      break;
    case 35:
      ops.printEsc(544);
      break;
    case 13:
      ops.printEsc(606);
      break;
    case 104:
      if (chrCode === 0) {
        ops.printEsc(638);
      } else if (chrCode === 2) {
        ops.printEsc(1379);
      } else {
        ops.printEsc(639);
      }
      break;
    case 110:
      switch (chrCode % 5) {
        case 1:
          ops.printEsc(641);
          break;
        case 2:
          ops.printEsc(642);
          break;
        case 3:
          ops.printEsc(643);
          break;
        case 4:
          ops.printEsc(644);
          break;
        default:
          ops.printEsc(640);
          break;
      }
      if (chrCode >= 5) {
        ops.printChar(115);
      }
      break;
    case 89:
      if (chrCode < 0 || chrCode > 19) {
        cmd = Math.trunc((state.memB0[chrCode] ?? 0) / 16);
      } else {
        cmd = chrCode;
        chrCode = 0;
      }
      if (cmd === 0) {
        ops.printEsc(479);
      } else if (cmd === 1) {
        ops.printEsc(503);
      } else if (cmd === 2) {
        ops.printEsc(398);
      } else {
        ops.printEsc(399);
      }
      if (chrCode !== 0) {
        ops.printSaNum(chrCode);
      }
      break;
    case 79:
      if (chrCode === 1) {
        ops.printEsc(678);
      } else {
        ops.printEsc(677);
      }
      break;
    case 82:
      if (chrCode === 0) {
        ops.printEsc(679);
      } else if (chrCode === 2) {
        ops.printEsc(1362);
      } else {
        ops.printEsc(680);
      }
      break;
    case 83:
      if (chrCode === 1) {
        ops.printEsc(681);
      } else if (chrCode === 3) {
        ops.printEsc(682);
      } else {
        ops.printEsc(683);
      }
      break;
    case 70:
      switch (chrCode) {
        case 0:
          ops.printEsc(684);
          break;
        case 1:
          ops.printEsc(685);
          break;
        case 2:
          ops.printEsc(686);
          break;
        case 4:
          ops.printEsc(687);
          break;
        case 3:
          ops.printEsc(1315);
          break;
        case 6:
          ops.printEsc(1316);
          break;
        case 7:
          ops.printEsc(1341);
          break;
        case 8:
          ops.printEsc(1342);
          break;
        case 9:
          ops.printEsc(1343);
          break;
        case 10:
          ops.printEsc(1344);
          break;
        case 11:
          ops.printEsc(1345);
          break;
        case 14:
          ops.printEsc(1346);
          break;
        case 15:
          ops.printEsc(1347);
          break;
        case 16:
          ops.printEsc(1348);
          break;
        case 17:
          ops.printEsc(1349);
          break;
        case 18:
          ops.printEsc(1350);
          break;
        case 19:
          ops.printEsc(1351);
          break;
        case 20:
          ops.printEsc(1352);
          break;
        case 25:
          ops.printEsc(1390);
          break;
        case 26:
          ops.printEsc(1391);
          break;
        case 27:
          ops.printEsc(1392);
          break;
        case 28:
          ops.printEsc(1393);
          break;
        case 12:
          ops.printEsc(1398);
          break;
        case 13:
          ops.printEsc(1399);
          break;
        case 21:
          ops.printEsc(1400);
          break;
        case 22:
          ops.printEsc(1401);
          break;
        case 23:
          ops.printEsc(1402);
          break;
        case 24:
          ops.printEsc(1403);
          break;
        default:
          ops.printEsc(688);
          break;
      }
      break;
    case 108:
      switch (chrCode) {
        case 0:
          ops.printEsc(744);
          break;
        case 1:
          ops.printEsc(745);
          break;
        case 2:
          ops.printEsc(746);
          break;
        case 3:
          ops.printEsc(747);
          break;
        case 4:
          ops.printEsc(748);
          break;
        case 5:
          ops.printEsc(750);
          break;
        default:
          ops.printEsc(749);
          break;
      }
      break;
    case 105:
      if (chrCode >= 32) {
        ops.printEsc(784);
      }
      switch (chrCode % 32) {
        case 1:
          ops.printEsc(768);
          break;
        case 2:
          ops.printEsc(769);
          break;
        case 3:
          ops.printEsc(770);
          break;
        case 4:
          ops.printEsc(771);
          break;
        case 5:
          ops.printEsc(772);
          break;
        case 6:
          ops.printEsc(773);
          break;
        case 7:
          ops.printEsc(774);
          break;
        case 8:
          ops.printEsc(775);
          break;
        case 9:
          ops.printEsc(776);
          break;
        case 10:
          ops.printEsc(777);
          break;
        case 11:
          ops.printEsc(778);
          break;
        case 12:
          ops.printEsc(779);
          break;
        case 13:
          ops.printEsc(780);
          break;
        case 14:
          ops.printEsc(781);
          break;
        case 15:
          ops.printEsc(782);
          break;
        case 16:
          ops.printEsc(783);
          break;
        case 17:
          ops.printEsc(1382);
          break;
        case 18:
          ops.printEsc(1383);
          break;
        case 19:
          ops.printEsc(1384);
          break;
        default:
          ops.printEsc(767);
          break;
      }
      break;
    case 106:
      if (chrCode === 2) {
        ops.printEsc(785);
      } else if (chrCode === 4) {
        ops.printEsc(786);
      } else {
        ops.printEsc(787);
      }
      break;
    case 4:
      if (chrCode === 256) {
        ops.printEsc(910);
      } else {
        ops.print(914);
        ops.print(chrCode);
      }
      break;
    case 5:
      if (chrCode === 257) {
        ops.printEsc(911);
      } else {
        ops.printEsc(912);
      }
      break;
    case 81:
      switch (chrCode) {
        case 0:
          ops.printEsc(982);
          break;
        case 1:
          ops.printEsc(983);
          break;
        case 2:
          ops.printEsc(984);
          break;
        case 3:
          ops.printEsc(985);
          break;
        case 4:
          ops.printEsc(986);
          break;
        case 5:
          ops.printEsc(987);
          break;
        case 6:
          ops.printEsc(988);
          break;
        default:
          ops.printEsc(989);
          break;
      }
      break;
    case 14:
      if (chrCode === 1) {
        ops.printEsc(1037);
      } else {
        ops.printEsc(344);
      }
      break;
    case 26:
      switch (chrCode) {
        case 4:
          ops.printEsc(1038);
          break;
        case 0:
          ops.printEsc(1039);
          break;
        case 1:
          ops.printEsc(1040);
          break;
        case 2:
          ops.printEsc(1041);
          break;
        default:
          ops.printEsc(1042);
          break;
      }
      break;
    case 27:
      switch (chrCode) {
        case 4:
          ops.printEsc(1043);
          break;
        case 0:
          ops.printEsc(1044);
          break;
        case 1:
          ops.printEsc(1045);
          break;
        case 2:
          ops.printEsc(1046);
          break;
        default:
          ops.printEsc(1047);
          break;
      }
      break;
    case 28:
      ops.printEsc(337);
      break;
    case 29:
      ops.printEsc(341);
      break;
    case 30:
      ops.printEsc(343);
      break;
    case 21:
      if (chrCode === 1) {
        ops.printEsc(1065);
      } else {
        ops.printEsc(1066);
      }
      break;
    case 22:
      if (chrCode === 1) {
        ops.printEsc(1067);
      } else {
        ops.printEsc(1068);
      }
      break;
    case 20:
      switch (chrCode) {
        case 0:
          ops.printEsc(412);
          break;
        case 1:
          ops.printEsc(1069);
          break;
        case 2:
          ops.printEsc(1070);
          break;
        case 3:
          ops.printEsc(977);
          break;
        case 4:
          ops.printEsc(1071);
          break;
        case 5:
          ops.printEsc(979);
          break;
        default:
          ops.printEsc(1072);
          break;
      }
      break;
    case 31:
      if (chrCode === 100) {
        ops.printEsc(1074);
      } else if (chrCode === 101) {
        ops.printEsc(1075);
      } else if (chrCode === 102) {
        ops.printEsc(1076);
      } else {
        ops.printEsc(1073);
      }
      break;
    case 43:
      if (chrCode === 0) {
        ops.printEsc(1093);
      } else {
        ops.printEsc(1092);
      }
      break;
    case 25:
      if (chrCode === 10) {
        ops.printEsc(1104);
      } else if (chrCode === 11) {
        ops.printEsc(1103);
      } else {
        ops.printEsc(1102);
      }
      break;
    case 23:
      if (chrCode === 1) {
        ops.printEsc(1106);
      } else {
        ops.printEsc(1105);
      }
      break;
    case 24:
      if (chrCode === 1) {
        ops.printEsc(1108);
      } else if (chrCode === 2) {
        ops.printEsc(1413);
      } else if (chrCode === 3) {
        ops.printEsc(1414);
      } else {
        ops.printEsc(1107);
      }
      break;
    case 47:
      if (chrCode === 1) {
        ops.printEsc(45);
      } else {
        ops.printEsc(352);
      }
      break;
    case 48:
      if (chrCode === 1) {
        ops.printEsc(1140);
      } else {
        ops.printEsc(1139);
      }
      break;
    case 50:
      switch (chrCode) {
        case 16:
          ops.printEsc(877);
          break;
        case 17:
          ops.printEsc(878);
          break;
        case 18:
          ops.printEsc(879);
          break;
        case 19:
          ops.printEsc(880);
          break;
        case 20:
          ops.printEsc(881);
          break;
        case 21:
          ops.printEsc(882);
          break;
        case 22:
          ops.printEsc(883);
          break;
        case 23:
          ops.printEsc(884);
          break;
        case 26:
          ops.printEsc(886);
          break;
        default:
          ops.printEsc(885);
          break;
      }
      break;
    case 51:
      if (chrCode === 1) {
        ops.printEsc(890);
      } else if (chrCode === 2) {
        ops.printEsc(891);
      } else {
        ops.printEsc(1141);
      }
      break;
    case 53:
      ops.printStyle(chrCode);
      break;
    case 52:
      switch (chrCode) {
        case 1:
          ops.printEsc(1160);
          break;
        case 2:
          ops.printEsc(1161);
          break;
        case 3:
          ops.printEsc(1162);
          break;
        case 4:
          ops.printEsc(1163);
          break;
        case 5:
          ops.printEsc(1164);
          break;
        default:
          ops.printEsc(1159);
          break;
      }
      break;
    case 49:
      if (chrCode === 30) {
        ops.printEsc(887);
      } else if (chrCode === 1) {
        ops.printEsc(889);
      } else {
        ops.printEsc(888);
      }
      break;
    case 93:
      if (chrCode === 1) {
        ops.printEsc(1184);
      } else if (chrCode === 2) {
        ops.printEsc(1185);
      } else if (chrCode === 8) {
        ops.printEsc(1198);
      } else {
        ops.printEsc(1186);
      }
      break;
    case 97:
      if (chrCode === 0) {
        ops.printEsc(1187);
      } else if (chrCode === 1) {
        ops.printEsc(1188);
      } else if (chrCode === 2) {
        ops.printEsc(1189);
      } else {
        ops.printEsc(1190);
      }
      break;
    case 94:
      if (chrCode !== 0) {
        ops.printEsc(1208);
      } else {
        ops.printEsc(1207);
      }
      break;
    case 95:
      switch (chrCode) {
        case 0:
          ops.printEsc(1209);
          break;
        case 1:
          ops.printEsc(1210);
          break;
        case 2:
          ops.printEsc(1211);
          break;
        case 3:
          ops.printEsc(1212);
          break;
        case 4:
          ops.printEsc(1213);
          break;
        case 5:
          ops.printEsc(1214);
          break;
        default:
          ops.printEsc(1215);
          break;
      }
      break;
    case 68:
      ops.printEsc(516);
      ops.printHex(chrCode);
      break;
    case 69:
      ops.printEsc(527);
      ops.printHex(chrCode);
      break;
    case 85:
      if (chrCode === 3988) {
        ops.printEsc(418);
      } else if (chrCode === 5012) {
        ops.printEsc(422);
      } else if (chrCode === 4244) {
        ops.printEsc(419);
      } else if (chrCode === 4500) {
        ops.printEsc(420);
      } else if (chrCode === 4756) {
        ops.printEsc(421);
      } else {
        ops.printEsc(480);
      }
      break;
    case 86:
      ops.printSize(chrCode - 3940);
      break;
    case 99:
      if (chrCode === 1) {
        ops.printEsc(965);
      } else {
        ops.printEsc(953);
      }
      break;
    case 78:
      if (chrCode === 0) {
        ops.printEsc(1233);
      } else {
        ops.printEsc(1234);
      }
      break;
    case 87:
      ops.print(1242);
      ops.slowPrint(state.fontName[chrCode] ?? 0);
      if ((state.fontSize[chrCode] ?? 0) !== (state.fontDsize[chrCode] ?? 0)) {
        ops.print(751);
        ops.printScaled(state.fontSize[chrCode] ?? 0);
        ops.print(400);
      }
      break;
    case 100:
      switch (chrCode) {
        case 0:
          ops.printEsc(275);
          break;
        case 1:
          ops.printEsc(276);
          break;
        case 2:
          ops.printEsc(277);
          break;
        default:
          ops.printEsc(1243);
          break;
      }
      break;
    case 60:
      if (chrCode === 0) {
        ops.printEsc(1245);
      } else {
        ops.printEsc(1244);
      }
      break;
    case 58:
      if (chrCode === 0) {
        ops.printEsc(1246);
      } else {
        ops.printEsc(1247);
      }
      break;
    case 57:
      if (chrCode === 4244) {
        ops.printEsc(1253);
      } else {
        ops.printEsc(1254);
      }
      break;
    case 19:
      switch (chrCode) {
        case 1:
          ops.printEsc(1256);
          break;
        case 2:
          ops.printEsc(1257);
          break;
        case 3:
          ops.printEsc(1258);
          break;
        case 4:
          ops.printEsc(1353);
          break;
        case 5:
          ops.printEsc(1355);
          break;
        case 6:
          ops.printEsc(1358);
          break;
        default:
          ops.printEsc(1255);
          break;
      }
      break;
    case 101:
      ops.print(1265);
      break;
    case 111:
    case 112:
    case 113:
    case 114:
      n = cmd - 111;
      if ((state.memLh[state.memRh[chrCode] ?? 0] ?? 0) === 3585) {
        n += 4;
      }
      if (Math.trunc(n / 4) % 2 === 1) {
        ops.printEsc(1198);
      }
      if (n % 2 === 1) {
        ops.printEsc(1184);
      }
      if (Math.trunc(n / 2) % 2 === 1) {
        ops.printEsc(1185);
      }
      if (n > 0) {
        ops.printChar(32);
      }
      ops.print(1266);
      break;
    case 115:
      ops.printEsc(1267);
      break;
    case 59:
      switch (chrCode) {
        case 0:
          ops.printEsc(1299);
          break;
        case 1:
          ops.printEsc(603);
          break;
        case 2:
          ops.printEsc(1300);
          break;
        case 3:
          ops.printEsc(1301);
          break;
        case 4:
          ops.printEsc(1302);
          break;
        case 5:
          ops.printEsc(1303);
          break;
        default:
          ops.print(1304);
          break;
      }
      break;
    default:
      ops.print(574);
      break;
  }
}

export interface ShowCurCmdChrState {
  curListModeField: number;
  shownMode: number;
  curCmd: number;
  curChr: number;
  eqtbInt: number[];
  curIf: number;
  ifLine: number;
  line: number;
  condPtr: number;
  memRh: number[];
}

export interface ShowCurCmdChrOps {
  beginDiagnostic: () => void;
  printNl: (s: number) => void;
  printMode: (m: number) => void;
  print: (s: number) => void;
  printCmdChr: (cmd: number, chrCode: number) => void;
  printChar: (c: number) => void;
  printInt: (n: number) => void;
  endDiagnostic: (blankLine: boolean) => void;
}

export function showCurCmdChr(
  state: ShowCurCmdChrState,
  ops: ShowCurCmdChrOps,
): void {
  ops.beginDiagnostic();
  ops.printNl(123);
  if (state.curListModeField !== state.shownMode) {
    ops.printMode(state.curListModeField);
    ops.print(575);
    state.shownMode = state.curListModeField;
  }

  ops.printCmdChr(state.curCmd, state.curChr);

  if (state.eqtbInt[5325] > 0 && state.curCmd >= 105 && state.curCmd <= 106) {
    ops.print(575);

    let n: number;
    let l: number;
    if (state.curCmd === 106) {
      ops.printCmdChr(105, state.curIf);
      ops.printChar(32);
      n = 0;
      l = state.ifLine;
    } else {
      n = 1;
      l = state.line;
    }

    let p = state.condPtr;
    while (p !== 0) {
      n += 1;
      p = state.memRh[p];
    }

    ops.print(576);
    ops.printInt(n);
    ops.printChar(41);
    if (l !== 0) {
      ops.print(1359);
      ops.printInt(l);
    }
  }

  ops.printChar(125);
  ops.endDiagnostic(false);
}

export interface ShowContextState {
  basePtr: number;
  inputPtr: number;
  inputStack: InStateRecord[];
  curInput: InStateRecord;
  eqtbInt: number[];
  inOpen: number;
  line: number;
  lineStack: number[];
  buffer: number[];
  memRh: number[];
  selector: number;
  tally: number;
  trickBuf: number[];
  trickCount: number;
  firstCount: number;
  errorLine: number;
  halfErrorLine: number;
  contextNn: number;
}

export interface ShowContextOps {
  printNl: (s: number) => void;
  print: (s: number) => void;
  printInt: (n: number) => void;
  printChar: (c: number) => void;
  printLn: () => void;
  printCs: (p: number) => void;
  showTokenList: (p: number, q: number, l: number) => number[];
}

function trickPrint(c: number, state: ShowContextState): void {
  if (state.tally < state.trickCount) {
    state.trickBuf[state.tally % state.errorLine] = c;
  }
  state.tally += 1;
}

export function showContext(
  state: ShowContextState,
  ops: ShowContextOps,
): void {
  const emitNl = (s: number) => {
    ops.printNl(s);
    state.tally += 1;
  };
  const emit = (s: number) => {
    ops.print(s);
    state.tally += 1;
  };
  const emitInt = (n: number) => {
    ops.printInt(n);
    state.tally += 1;
  };
  const emitChar = (c: number) => {
    ops.printChar(c);
    state.tally += 1;
  };
  const emitLn = () => {
    ops.printLn();
    state.tally += 1;
  };
  const emitCs = (p: number) => {
    ops.printCs(p);
    state.tally += 1;
  };

  state.basePtr = state.inputPtr;
  state.inputStack[state.basePtr] = copyInStateRecord(state.curInput);

  let nn = -1;
  let bottomLine = false;

  while (true) {
    state.curInput = copyInStateRecord(state.inputStack[state.basePtr]);
    if (
      state.curInput.stateField !== 0 &&
      (state.curInput.nameField > 19 || state.basePtr === 0)
    ) {
      bottomLine = true;
    }

    if (
      state.basePtr === state.inputPtr ||
      bottomLine ||
      nn < state.eqtbInt[5322]
    ) {
      if (
        state.basePtr === state.inputPtr ||
        state.curInput.stateField !== 0 ||
        state.curInput.indexField !== 3 ||
        state.curInput.locField !== 0
      ) {
        state.tally = 0;
        const oldSetting = state.selector;
        let l = 0;

        if (state.curInput.stateField !== 0) {
          if (state.curInput.nameField <= 17) {
            if (state.curInput.nameField === 0) {
              if (state.basePtr === 0) {
                emitNl(582);
              } else {
                emitNl(583);
              }
            } else {
              emitNl(584);
              if (state.curInput.nameField === 17) {
                emitChar(42);
              } else {
                emitInt(state.curInput.nameField - 1);
              }
              emitChar(62);
            }
          } else {
            emitNl(585);
            if (state.curInput.indexField === state.inOpen) {
              emitInt(state.line);
            } else {
              emitInt(state.lineStack[state.curInput.indexField + 1]);
            }
          }
          emitChar(32);

          l = state.tally;
          state.tally = 0;
          state.selector = 20;
          state.trickCount = 1000000;

          const j =
            state.buffer[state.curInput.limitField] === state.eqtbInt[5316]
              ? state.curInput.limitField
              : state.curInput.limitField + 1;
          if (j > 0) {
            for (let i = state.curInput.startField; i <= j - 1; i += 1) {
              if (i === state.curInput.locField) {
                state.firstCount = state.tally;
                state.trickCount =
                  state.tally + 1 + state.errorLine - state.halfErrorLine;
                if (state.trickCount < state.errorLine) {
                  state.trickCount = state.errorLine;
                }
              }
              trickPrint(state.buffer[i], state);
            }
          }
        } else {
          switch (state.curInput.indexField) {
            case 0:
              emitNl(586);
              break;
            case 1:
            case 2:
              emitNl(587);
              break;
            case 3:
              if (state.curInput.locField === 0) {
                emitNl(588);
              } else {
                emitNl(589);
              }
              break;
            case 4:
              emitNl(590);
              break;
            case 5:
              emitLn();
              emitCs(state.curInput.nameField);
              break;
            case 6:
              emitNl(591);
              break;
            case 7:
              emitNl(592);
              break;
            case 8:
              emitNl(593);
              break;
            case 9:
              emitNl(594);
              break;
            case 10:
              emitNl(595);
              break;
            case 11:
              emitNl(596);
              break;
            case 12:
              emitNl(597);
              break;
            case 13:
              emitNl(598);
              break;
            case 14:
              emitNl(599);
              break;
            case 15:
              emitNl(600);
              break;
            case 16:
              emitNl(601);
              break;
            default:
              emitNl(63);
              break;
          }

          l = state.tally;
          state.tally = 0;
          state.selector = 20;
          state.trickCount = 1000000;
          const tokenChars =
            state.curInput.indexField < 5
              ? ops.showTokenList(
                  state.curInput.startField,
                  state.curInput.locField,
                  100000,
                )
              : ops.showTokenList(
                  state.memRh[state.curInput.startField],
                  state.curInput.locField,
                  100000,
                );
          for (const c of tokenChars) {
            trickPrint(c, state);
          }
        }

        state.selector = oldSetting;

        if (state.trickCount === 1000000) {
          state.firstCount = state.tally;
          state.trickCount =
            state.tally + 1 + state.errorLine - state.halfErrorLine;
          if (state.trickCount < state.errorLine) {
            state.trickCount = state.errorLine;
          }
        }

        let m: number;
        if (state.tally < state.trickCount) {
          m = state.tally - state.firstCount;
        } else {
          m = state.trickCount - state.firstCount;
        }

        let p: number;
        let n: number;
        if (l + state.firstCount <= state.halfErrorLine) {
          p = 0;
          n = l + state.firstCount;
        } else {
          emit(278);
          p = l + state.firstCount - state.halfErrorLine + 3;
          n = state.halfErrorLine;
        }

        for (let q = p; q <= state.firstCount - 1; q += 1) {
          emitChar(state.trickBuf[q % state.errorLine]);
        }
        emitLn();

        for (let q = 1; q <= n; q += 1) {
          emitChar(32);
        }
        if (m + n <= state.errorLine) {
          p = state.firstCount + m;
        } else {
          p = state.firstCount + (state.errorLine - n - 3);
        }

        for (let q = state.firstCount; q <= p - 1; q += 1) {
          emitChar(state.trickBuf[q % state.errorLine]);
        }
        if (m + n > state.errorLine) {
          emit(278);
        }

        nn += 1;
      }
    } else if (nn === state.eqtbInt[5322]) {
      emitNl(278);
      nn += 1;
    }

    if (bottomLine) {
      break;
    }
    state.basePtr -= 1;
  }

  state.contextNn = nn;
  state.curInput = copyInStateRecord(state.inputStack[state.inputPtr]);
}
