{4:}{9:}{$C-,A+,D-}{[$C+,D+]}{:9}

Program ETEX;

Label {6:}1,9998,9999;
{:6}

Const {11:}mem_max = 30000;
  mem_min = 0;
  buf_size = 500;
  error_line = 72;
  half_error_line = 42;
  max_print_line = 79;
  stack_size = 200;
  max_in_open = 6;
  font_max = 75;
  font_mem_size = 20000;
  param_size = 60;
  nest_size = 40;
  max_strings = 3000;
  string_vacancies = 8000;
  pool_size = 32000;
  save_size = 600;
  trie_size = 8000;
  trie_op_size = 500;
  dvi_buf_size = 800;
  file_name_size = 40;
  pool_name = 'TeXformats:TEX.POOL                     ';
{:11}

Type {18:}ASCII_code = 0..255;{:18}{25:}
  eight_bits = 0..255;
  alpha_file = packed file Of char;
  byte_file = packed file Of eight_bits;
{:25}{38:}
  pool_pointer = 0..pool_size;
  str_number = 0..max_strings;
  packed_ASCII_code = 0..255;{:38}{101:}
  scaled = integer;
  nonnegative_integer = 0..2147483647;
  small_number = 0..63;
{:101}{109:}
  glue_ratio = real;{:109}{113:}
  quarterword = 0..255;
  halfword = 0..65535;
  two_choices = 1..2;
  four_choices = 1..4;
  two_halves = packed Record
    rh: halfword;
    Case two_choices Of
      1: (lh:halfword);
      2: (b0:quarterword;b1:quarterword);
  End;
  four_quarters = packed Record
    b0: quarterword;
    b1: quarterword;
    b2: quarterword;
    b3: quarterword;
  End;
  memory_word = Record
    Case four_choices Of
      1: (int:integer);
      2: (gr:glue_ratio);
      3: (hh:two_halves);
      4: (qqqq:four_quarters);
  End;
  word_file = file Of memory_word;{:113}{150:}
  glue_ord = 0..3;
{:150}{212:}
  list_state_record = Record
    mode_field: -203..203;
    head_field,tail_field: halfword;
    eTeX_aux_field: halfword;
    pg_field,ml_field: integer;
    aux_field: memory_word;
  End;
{:212}{269:}
  group_code = 0..16;
{:269}{300:}
  in_state_record = Record
    state_field,index_field: quarterword;
    start_field,loc_field,limit_field,name_field: halfword;
  End;
{:300}{548:}
  internal_font_number = 0..font_max;
  font_index = 0..font_mem_size;{:548}{594:}
  dvi_index = 0..dvi_buf_size;
{:594}{920:}
  trie_pointer = 0..trie_size;{:920}{925:}
  hyph_pointer = 0..307;
{:925}{1409:}
  save_pointer = 0..save_size;{:1409}

Var {13:}bad: integer;
{:13}{20:}
  xord: array[char] Of ASCII_code;
  xchr: array[ASCII_code] Of char;
{:20}{26:}
  name_of_file: packed array[1..file_name_size] Of char;
  name_length: 0..file_name_size;
{:26}{30:}
  buffer: array[0..buf_size] Of ASCII_code;
  first: 0..buf_size;
  last: 0..buf_size;
  max_buf_stack: 0..buf_size;{:30}{32:}
  term_in: alpha_file;
  term_out: alpha_file;
{:32}{39:}
  str_pool: packed array[pool_pointer] Of packed_ASCII_code;
  str_start: array[str_number] Of pool_pointer;
  pool_ptr: pool_pointer;
  str_ptr: str_number;
  init_pool_ptr: pool_pointer;
  init_str_ptr: str_number;
{:39}{50:}
  pool_file: alpha_file;{:50}{54:}
  log_file: alpha_file;
  selector: 0..21;
  dig: array[0..22] Of 0..15;
  tally: integer;
  term_offset: 0..max_print_line;
  file_offset: 0..max_print_line;
  trick_buf: array[0..error_line] Of ASCII_code;
  trick_count: integer;
  first_count: integer;{:54}{73:}
  interaction: 0..3;
{:73}{76:}
  deletions_allowed: boolean;
  set_box_allowed: boolean;
  history: 0..3;
  error_count: -1..100;
{:76}{79:}
  help_line: array[0..5] Of str_number;
  help_ptr: 0..6;
  use_err_help: boolean;{:79}{96:}
  interrupt: integer;
  OK_to_interrupt: boolean;{:96}{104:}
  arith_error: boolean;
  remainder: scaled;
{:104}{115:}
  temp_ptr: halfword;
{:115}{116:}
  mem: array[mem_min..mem_max] Of memory_word;
  lo_mem_max: halfword;
  hi_mem_min: halfword;
{:116}{117:}
  var_used,dyn_used: integer;{:117}{118:}
  avail: halfword;
  mem_end: halfword;{:118}{124:}
  rover: halfword;
{:124}{165:}
{free:packed array[mem_min..mem_max]of boolean;
was_free:packed array[mem_min..mem_max]of boolean;
was_mem_end,was_lo_max,was_hi_min:halfword;panicking:boolean;}
{:165}{173:}
  font_in_short_display: integer;
{:173}{181:}
  depth_threshold: integer;
  breadth_max: integer;
{:181}{213:}
  nest: array[0..nest_size] Of list_state_record;
  nest_ptr: 0..nest_size;
  max_nest_stack: 0..nest_size;
  cur_list: list_state_record;
  shown_mode: -203..203;
{:213}{246:}
  old_setting: 0..21;
  sys_time,sys_day,sys_month,sys_year: integer;
{:246}{253:}
  eqtb: array[1..6121] Of memory_word;
  xeq_level: array[5268..6121] Of quarterword;
{:253}{256:}
  hash: array[514..2880] Of two_halves;
  hash_used: halfword;
  no_new_control_sequence: boolean;
  cs_count: integer;
{:256}{271:}
  save_stack: array[0..save_size] Of memory_word;
  save_ptr: 0..save_size;
  max_save_stack: 0..save_size;
  cur_level: quarterword;
  cur_group: group_code;
  cur_boundary: 0..save_size;
{:271}{286:}
  mag_set: integer;{:286}{297:}
  cur_cmd: eight_bits;
  cur_chr: halfword;
  cur_cs: halfword;
  cur_tok: halfword;
{:297}{301:}
  input_stack: array[0..stack_size] Of in_state_record;
  input_ptr: 0..stack_size;
  max_in_stack: 0..stack_size;
  cur_input: in_state_record;{:301}{304:}
  in_open: 0..max_in_open;
  open_parens: 0..max_in_open;
  input_file: array[1..max_in_open] Of alpha_file;
  line: integer;
  line_stack: array[1..max_in_open] Of integer;
{:304}{305:}
  scanner_status: 0..5;
  warning_index: halfword;
  def_ref: halfword;
{:305}{308:}
  param_stack: array[0..param_size] Of halfword;
  param_ptr: 0..param_size;
  max_param_stack: integer;
{:308}{309:}
  align_state: integer;{:309}{310:}
  base_ptr: 0..stack_size;
{:310}{333:}
  par_loc: halfword;
  par_token: halfword;
{:333}{361:}
  force_eof: boolean;
{:361}{382:}
  cur_mark: array[0..4] Of halfword;
{:382}{387:}
  long_state: 111..114;
{:387}{388:}
  pstack: array[0..8] Of halfword;{:388}{410:}
  cur_val: integer;
  cur_val_level: 0..5;{:410}{438:}
  radix: small_number;
{:438}{447:}
  cur_order: glue_ord;
{:447}{480:}
  read_file: array[0..15] Of alpha_file;
  read_open: array[0..16] Of 0..2;{:480}{489:}
  cond_ptr: halfword;
  if_limit: 0..4;
  cur_if: small_number;
  if_line: integer;
{:489}{493:}
  skip_line: integer;{:493}{512:}
  cur_name: str_number;
  cur_area: str_number;
  cur_ext: str_number;
{:512}{513:}
  area_delimiter: pool_pointer;
  ext_delimiter: pool_pointer;
{:513}{520:}
  TEX_format_default: packed array[1..20] Of char;
{:520}{527:}
  name_in_progress: boolean;
  job_name: str_number;
  log_opened: boolean;{:527}{532:}
  dvi_file: byte_file;
  output_file_name: str_number;
  log_name: str_number;
{:532}{539:}
  tfm_file: byte_file;
{:539}{549:}
  font_info: array[font_index] Of memory_word;
  fmem_ptr: font_index;
  font_ptr: internal_font_number;
  font_check: array[internal_font_number] Of four_quarters;
  font_size: array[internal_font_number] Of scaled;
  font_dsize: array[internal_font_number] Of scaled;
  font_params: array[internal_font_number] Of font_index;
  font_name: array[internal_font_number] Of str_number;
  font_area: array[internal_font_number] Of str_number;
  font_bc: array[internal_font_number] Of eight_bits;
  font_ec: array[internal_font_number] Of eight_bits;
  font_glue: array[internal_font_number] Of halfword;
  font_used: array[internal_font_number] Of boolean;
  hyphen_char: array[internal_font_number] Of integer;
  skew_char: array[internal_font_number] Of integer;
  bchar_label: array[internal_font_number] Of font_index;
  font_bchar: array[internal_font_number] Of 0..256;
  font_false_bchar: array[internal_font_number] Of 0..256;
{:549}{550:}
  char_base: array[internal_font_number] Of integer;
  width_base: array[internal_font_number] Of integer;
  height_base: array[internal_font_number] Of integer;
  depth_base: array[internal_font_number] Of integer;
  italic_base: array[internal_font_number] Of integer;
  lig_kern_base: array[internal_font_number] Of integer;
  kern_base: array[internal_font_number] Of integer;
  exten_base: array[internal_font_number] Of integer;
  param_base: array[internal_font_number] Of integer;
{:550}{555:}
  null_character: four_quarters;
{:555}{592:}
  total_pages: integer;
  max_v: scaled;
  max_h: scaled;
  max_push: integer;
  last_bop: integer;
  dead_cycles: integer;
  doing_leaders: boolean;
  c,f: quarterword;
  rule_ht,rule_dp,rule_wd: scaled;
  g: halfword;
  lq,lr: integer;
{:592}{595:}
  dvi_buf: array[dvi_index] Of eight_bits;
  half_buf: dvi_index;
  dvi_limit: dvi_index;
  dvi_ptr: dvi_index;
  dvi_offset: integer;
  dvi_gone: integer;{:595}{605:}
  down_ptr,right_ptr: halfword;
{:605}{616:}
  dvi_h,dvi_v: scaled;
  cur_h,cur_v: scaled;
  dvi_f: internal_font_number;
  cur_s: integer;
{:616}{646:}
  total_stretch,total_shrink: array[glue_ord] Of scaled;
  last_badness: integer;{:646}{647:}
  adjust_tail: halfword;
{:647}{661:}
  pack_begin_line: integer;{:661}{684:}
  empty_field: two_halves;
  null_delimiter: four_quarters;{:684}{719:}
  cur_mlist: halfword;
  cur_style: small_number;
  cur_size: small_number;
  cur_mu: scaled;
  mlist_penalties: boolean;{:719}{724:}
  cur_f: internal_font_number;
  cur_c: quarterword;
  cur_i: four_quarters;{:724}{764:}
  magic_offset: integer;
{:764}{770:}
  cur_align: halfword;
  cur_span: halfword;
  cur_loop: halfword;
  align_ptr: halfword;
  cur_head,cur_tail: halfword;
{:770}{814:}
  just_box: halfword;{:814}{821:}
  passive: halfword;
  printed_node: halfword;
  pass_number: halfword;
{:821}{823:}
  active_width: array[1..6] Of scaled;
  cur_active_width: array[1..6] Of scaled;
  background: array[1..6] Of scaled;
  break_width: array[1..6] Of scaled;
{:823}{825:}
  no_shrink_error_yet: boolean;{:825}{828:}
  cur_p: halfword;
  second_pass: boolean;
  final_pass: boolean;
  threshold: integer;
{:828}{833:}
  minimal_demerits: array[0..3] Of integer;
  minimum_demerits: integer;
  best_place: array[0..3] Of halfword;
  best_pl_line: array[0..3] Of halfword;{:833}{839:}
  disc_width: scaled;
{:839}{847:}
  easy_line: halfword;
  last_special_line: halfword;
  first_width: scaled;
  second_width: scaled;
  first_indent: scaled;
  second_indent: scaled;{:847}{872:}
  best_bet: halfword;
  fewest_demerits: integer;
  best_line: halfword;
  actual_looseness: integer;
  line_diff: integer;{:872}{892:}
  hc: array[0..65] Of 0..256;
  hn: 0..64;
  ha,hb: halfword;
  hf: internal_font_number;
  hu: array[0..63] Of 0..256;
  hyf_char: integer;
  cur_lang,init_cur_lang: ASCII_code;
  l_hyf,r_hyf,init_l_hyf,init_r_hyf: integer;
  hyf_bchar: halfword;
{:892}{900:}
  hyf: array[0..64] Of 0..9;
  init_list: halfword;
  init_lig: boolean;
  init_lft: boolean;{:900}{905:}
  hyphen_passed: small_number;
{:905}{907:}
  cur_l,cur_r: halfword;
  cur_q: halfword;
  lig_stack: halfword;
  ligature_present: boolean;
  lft_hit,rt_hit: boolean;
{:907}{921:}
  trie: array[trie_pointer] Of two_halves;
  hyf_distance: array[1..trie_op_size] Of small_number;
  hyf_num: array[1..trie_op_size] Of small_number;
  hyf_next: array[1..trie_op_size] Of quarterword;
  op_start: array[ASCII_code] Of 0..trie_op_size;
{:921}{926:}
  hyph_word: array[hyph_pointer] Of str_number;
  hyph_list: array[hyph_pointer] Of halfword;
  hyph_count: hyph_pointer;
{:926}{943:}
  trie_op_hash: array[-trie_op_size..trie_op_size] Of 0..
                trie_op_size;
  trie_used: array[ASCII_code] Of quarterword;
  trie_op_lang: array[1..trie_op_size] Of ASCII_code;
  trie_op_val: array[1..trie_op_size] Of quarterword;
  trie_op_ptr: 0..trie_op_size;
{:943}{947:}
  trie_c: packed array[trie_pointer] Of packed_ASCII_code;
  trie_o: packed array[trie_pointer] Of quarterword;
  trie_l: packed array[trie_pointer] Of trie_pointer;
  trie_r: packed array[trie_pointer] Of trie_pointer;
  trie_ptr: trie_pointer;
  trie_hash: packed array[trie_pointer] Of trie_pointer;
{:947}{950:}
  trie_taken: packed array[1..trie_size] Of boolean;
  trie_min: array[ASCII_code] Of trie_pointer;
  trie_max: trie_pointer;
  trie_not_ready: boolean;{:950}{971:}
  best_height_plus_depth: scaled;
{:971}{980:}
  page_tail: halfword;
  page_contents: 0..2;
  page_max_depth: scaled;
  best_page_break: halfword;
  least_page_cost: integer;
  best_size: scaled;
{:980}{982:}
  page_so_far: array[0..7] Of scaled;
  last_glue: halfword;
  last_penalty: integer;
  last_kern: scaled;
  last_node_type: integer;
  insert_penalties: integer;{:982}{989:}
  output_active: boolean;
{:989}{1032:}
  main_f: internal_font_number;
  main_i: four_quarters;
  main_j: four_quarters;
  main_k: font_index;
  main_p: halfword;
  main_s: integer;
  bchar: halfword;
  false_bchar: halfword;
  cancel_boundary: boolean;
  ins_disc: boolean;{:1032}{1074:}
  cur_box: halfword;
{:1074}{1266:}
  after_token: halfword;{:1266}{1281:}
  long_help_seen: boolean;
{:1281}{1299:}
  format_ident: str_number;{:1299}{1305:}
  fmt_file: word_file;
{:1305}{1331:}
  ready_already: integer;
{:1331}{1342:}
  write_file: array[0..15] Of alpha_file;
  write_open: array[0..17] Of boolean;{:1342}{1345:}
  write_loc: halfword;
{:1345}{1383:}
  eTeX_mode: 0..1;
{:1383}{1391:}
  eof_seen: array[1..max_in_open] Of boolean;
{:1391}{1436:}
  LR_ptr: halfword;
  LR_problems: integer;
  cur_dir: small_number;
{:1436}{1485:}
  pseudo_files: halfword;
{:1485}{1508:}
  grp_stack: array[0..max_in_open] Of save_pointer;
  if_stack: array[0..max_in_open] Of halfword;
{:1508}{1549:}
  max_reg_num: halfword;
  max_reg_help_line: str_number;
{:1549}{1551:}
  sa_root: array[0..6] Of halfword;
  cur_ptr: halfword;
  sa_null: memory_word;{:1551}{1570:}
  sa_chain: halfword;
  sa_level: quarterword;{:1570}{1577:}
  last_line_fill: halfword;
  do_last_line_fit: boolean;
  active_node_size: small_number;
  fill_width: array[0..2] Of scaled;
  best_pl_short: array[0..3] Of scaled;
  best_pl_glue: array[0..3] Of scaled;{:1577}{1593:}
  hyph_start: trie_pointer;
  hyph_index: trie_pointer;{:1593}{1594:}
  disc_ptr: array[1..3] Of halfword;
{:1594}
Procedure initialize;

Var {19:}i: integer;{:19}{163:}
  k: integer;
{:163}{927:}
  z: hyph_pointer;{:927}
Begin{8:}{21:}
  xchr[32] := ' ';
  xchr[33] := '!';
  xchr[34] := '"';
  xchr[35] := '#';
  xchr[36] := '$';
  xchr[37] := '%';
  xchr[38] := '&';
  xchr[39] := '''';
  xchr[40] := '(';
  xchr[41] := ')';
  xchr[42] := '*';
  xchr[43] := '+';
  xchr[44] := ',';
  xchr[45] := '-';
  xchr[46] := '.';
  xchr[47] := '/';
  xchr[48] := '0';
  xchr[49] := '1';
  xchr[50] := '2';
  xchr[51] := '3';
  xchr[52] := '4';
  xchr[53] := '5';
  xchr[54] := '6';
  xchr[55] := '7';
  xchr[56] := '8';
  xchr[57] := '9';
  xchr[58] := ':';
  xchr[59] := ';';
  xchr[60] := '<';
  xchr[61] := '=';
  xchr[62] := '>';
  xchr[63] := '?';
  xchr[64] := '@';
  xchr[65] := 'A';
  xchr[66] := 'B';
  xchr[67] := 'C';
  xchr[68] := 'D';
  xchr[69] := 'E';
  xchr[70] := 'F';
  xchr[71] := 'G';
  xchr[72] := 'H';
  xchr[73] := 'I';
  xchr[74] := 'J';
  xchr[75] := 'K';
  xchr[76] := 'L';
  xchr[77] := 'M';
  xchr[78] := 'N';
  xchr[79] := 'O';
  xchr[80] := 'P';
  xchr[81] := 'Q';
  xchr[82] := 'R';
  xchr[83] := 'S';
  xchr[84] := 'T';
  xchr[85] := 'U';
  xchr[86] := 'V';
  xchr[87] := 'W';
  xchr[88] := 'X';
  xchr[89] := 'Y';
  xchr[90] := 'Z';
  xchr[91] := '[';
  xchr[92] := '\';
  xchr[93] := ']';
  xchr[94] := '^';
  xchr[95] := '_';
  xchr[96] := '`';
  xchr[97] := 'a';
  xchr[98] := 'b';
  xchr[99] := 'c';
  xchr[100] := 'd';
  xchr[101] := 'e';
  xchr[102] := 'f';
  xchr[103] := 'g';
  xchr[104] := 'h';
  xchr[105] := 'i';
  xchr[106] := 'j';
  xchr[107] := 'k';
  xchr[108] := 'l';
  xchr[109] := 'm';
  xchr[110] := 'n';
  xchr[111] := 'o';
  xchr[112] := 'p';
  xchr[113] := 'q';
  xchr[114] := 'r';
  xchr[115] := 's';
  xchr[116] := 't';
  xchr[117] := 'u';
  xchr[118] := 'v';
  xchr[119] := 'w';
  xchr[120] := 'x';
  xchr[121] := 'y';
  xchr[122] := 'z';
  xchr[123] := '{';
  xchr[124] := '|';
  xchr[125] := '}';
  xchr[126] := '~';{:21}{23:}
  For i:=0 To 31 Do
    xchr[i] := ' ';
  For i:=127 To 255 Do
    xchr[i] := ' ';
{:23}{24:}
  For i:=0 To 255 Do
    xord[chr(i)] := 127;
  For i:=128 To 255 Do
    xord[xchr[i]] := i;
  For i:=0 To 126 Do
    xord[xchr[i]] := i;{:24}{74:}
  interaction := 3;
{:74}{77:}
  deletions_allowed := true;
  set_box_allowed := true;
  error_count := 0;
{:77}{80:}
  help_ptr := 0;
  use_err_help := false;{:80}{97:}
  interrupt := 0;
  OK_to_interrupt := true;{:97}{166:}
  {was_mem_end:=mem_min;
was_lo_max:=mem_min;was_hi_min:=mem_max;panicking:=false;}
{:166}{215:}
  nest_ptr := 0;
  max_nest_stack := 0;
  cur_list.mode_field := 1;
  cur_list.head_field := 29999;
  cur_list.tail_field := 29999;
  cur_list.eTeX_aux_field := 0;
  cur_list.aux_field.int := -65536000;
  cur_list.ml_field := 0;
  cur_list.pg_field := 0;
  shown_mode := 0;
{991:}
  page_contents := 0;
  page_tail := 29998;
  mem[29998].hh.rh := 0;
  last_glue := 65535;
  last_penalty := 0;
  last_kern := 0;
  last_node_type := -1;
  page_so_far[7] := 0;
  page_max_depth := 0{:991};
{:215}{254:}
  For k:=5268 To 6121 Do
    xeq_level[k] := 1;
{:254}{257:}
  no_new_control_sequence := true;
  hash[514].lh := 0;
  hash[514].rh := 0;
  For k:=515 To 2880 Do
    hash[k] := hash[514];
{:257}{272:}
  save_ptr := 0;
  cur_level := 1;
  cur_group := 0;
  cur_boundary := 0;
  max_save_stack := 0;{:272}{287:}
  mag_set := 0;{:287}{383:}
  cur_mark[0] := 0;
  cur_mark[1] := 0;
  cur_mark[2] := 0;
  cur_mark[3] := 0;
  cur_mark[4] := 0;
{:383}{439:}
  cur_val := 0;
  cur_val_level := 0;
  radix := 0;
  cur_order := 0;
{:439}{481:}
  For k:=0 To 16 Do
    read_open[k] := 2;{:481}{490:}
  cond_ptr := 0;
  if_limit := 0;
  cur_if := 0;
  if_line := 0;
{:490}{521:}
  TEX_format_default := 'TeXformats:plain.fmt';
{:521}{551:}
  For k:=0 To font_max Do
    font_used[k] := false;
{:551}{556:}
  null_character.b0 := 0;
  null_character.b1 := 0;
  null_character.b2 := 0;
  null_character.b3 := 0;{:556}{593:}
  total_pages := 0;
  max_v := 0;
  max_h := 0;
  max_push := 0;
  last_bop := -1;
  doing_leaders := false;
  dead_cycles := 0;
  cur_s := -1;{:593}{596:}
  half_buf := dvi_buf_size Div 2;
  dvi_limit := dvi_buf_size;
  dvi_ptr := 0;
  dvi_offset := 0;
  dvi_gone := 0;
{:596}{606:}
  down_ptr := 0;
  right_ptr := 0;{:606}{648:}
  adjust_tail := 0;
  last_badness := 0;{:648}{662:}
  pack_begin_line := 0;
{:662}{685:}
  empty_field.rh := 0;
  empty_field.lh := 0;
  null_delimiter.b0 := 0;
  null_delimiter.b1 := 0;
  null_delimiter.b2 := 0;
  null_delimiter.b3 := 0;
{:685}{771:}
  align_ptr := 0;
  cur_align := 0;
  cur_span := 0;
  cur_loop := 0;
  cur_head := 0;
  cur_tail := 0;
{:771}{928:}
  For z:=0 To 307 Do
    Begin
      hyph_word[z] := 0;
      hyph_list[z] := 0;
    End;
  hyph_count := 0;{:928}{990:}
  output_active := false;
  insert_penalties := 0;
{:990}{1033:}
  ligature_present := false;
  cancel_boundary := false;
  lft_hit := false;
  rt_hit := false;
  ins_disc := false;
{:1033}{1267:}
  after_token := 0;{:1267}{1282:}
  long_help_seen := false;
{:1282}{1300:}
  format_ident := 0;
{:1300}{1343:}
  For k:=0 To 17 Do
    write_open[k] := false;
{:1343}{1437:}
  LR_ptr := 0;
  LR_problems := 0;
  cur_dir := 0;
{:1437}{1486:}
  pseudo_files := 0;{:1486}{1552:}
  sa_root[6] := 0;
  sa_null.hh.lh := 0;
  sa_null.hh.rh := 0;{:1552}{1571:}
  sa_chain := 0;
  sa_level := 0;
{:1571}{1595:}
  disc_ptr[2] := 0;
  disc_ptr[3] := 0;
{:1595}{164:}
  For k:=1 To 19 Do
    mem[k].int := 0;
  k := 0;
  While k<=19 Do
    Begin
      mem[k].hh.rh := 1;
      mem[k].hh.b0 := 0;
      mem[k].hh.b1 := 0;
      k := k+4;
    End;
  mem[6].int := 65536;
  mem[4].hh.b0 := 1;
  mem[10].int := 65536;
  mem[8].hh.b0 := 2;
  mem[14].int := 65536;
  mem[12].hh.b0 := 1;
  mem[15].int := 65536;
  mem[12].hh.b1 := 1;
  mem[18].int := -65536;
  mem[16].hh.b0 := 1;
  rover := 20;
  mem[rover].hh.rh := 65535;
  mem[rover].hh.lh := 1000;
  mem[rover+1].hh.lh := rover;
  mem[rover+1].hh.rh := rover;
  lo_mem_max := rover+1000;
  mem[lo_mem_max].hh.rh := 0;
  mem[lo_mem_max].hh.lh := 0;
  For k:=29987 To 30000 Do
    mem[k] := mem[lo_mem_max];
{790:}
  mem[29990].hh.lh := 6714;{:790}{797:}
  mem[29991].hh.rh := 256;
  mem[29991].hh.lh := 0;{:797}{820:}
  mem[29993].hh.b0 := 1;
  mem[29994].hh.lh := 65535;
  mem[29993].hh.b1 := 0;
{:820}{981:}
  mem[30000].hh.b1 := 255;
  mem[30000].hh.b0 := 1;
  mem[30000].hh.rh := 30000;{:981}{988:}
  mem[29998].hh.b0 := 10;
  mem[29998].hh.b1 := 0;{:988};
  avail := 0;
  mem_end := 30000;
  hi_mem_min := 29987;
  var_used := 20;
  dyn_used := 14;{:164}{222:}
  eqtb[2881].hh.b0 := 101;
  eqtb[2881].hh.rh := 0;
  eqtb[2881].hh.b1 := 0;
  For k:=1 To 2880 Do
    eqtb[k] := eqtb[2881];{:222}{228:}
  eqtb[2882].hh.rh := 0;
  eqtb[2882].hh.b1 := 1;
  eqtb[2882].hh.b0 := 117;
  For k:=2883 To 3411 Do
    eqtb[k] := eqtb[2882];
  mem[0].hh.rh := mem[0].hh.rh+530;{:228}{232:}
  eqtb[3412].hh.rh := 0;
  eqtb[3412].hh.b0 := 118;
  eqtb[3412].hh.b1 := 1;
  For k:=3679 To 3682 Do
    eqtb[k] := eqtb[3412];
  For k:=3413 To 3678 Do
    eqtb[k] := eqtb[2881];
  eqtb[3683].hh.rh := 0;
  eqtb[3683].hh.b0 := 119;
  eqtb[3683].hh.b1 := 1;
  For k:=3684 To 3938 Do
    eqtb[k] := eqtb[3683];
  eqtb[3939].hh.rh := 0;
  eqtb[3939].hh.b0 := 120;
  eqtb[3939].hh.b1 := 1;
  For k:=3940 To 3987 Do
    eqtb[k] := eqtb[3939];
  eqtb[3988].hh.rh := 0;
  eqtb[3988].hh.b0 := 120;
  eqtb[3988].hh.b1 := 1;
  For k:=3989 To 5267 Do
    eqtb[k] := eqtb[3988];
  For k:=0 To 255 Do
    Begin
      eqtb[3988+k].hh.rh := 12;
      eqtb[5012+k].hh.rh := k+0;
      eqtb[4756+k].hh.rh := 1000;
    End;
  eqtb[4001].hh.rh := 5;
  eqtb[4020].hh.rh := 10;
  eqtb[4080].hh.rh := 0;
  eqtb[4025].hh.rh := 14;
  eqtb[4115].hh.rh := 15;
  eqtb[3988].hh.rh := 9;
  For k:=48 To 57 Do
    eqtb[5012+k].hh.rh := k+28672;
  For k:=65 To 90 Do
    Begin
      eqtb[3988+k].hh.rh := 11;
      eqtb[3988+k+32].hh.rh := 11;
      eqtb[5012+k].hh.rh := k+28928;
      eqtb[5012+k+32].hh.rh := k+28960;
      eqtb[4244+k].hh.rh := k+32;
      eqtb[4244+k+32].hh.rh := k+32;
      eqtb[4500+k].hh.rh := k;
      eqtb[4500+k+32].hh.rh := k;
      eqtb[4756+k].hh.rh := 999;
    End;
{:232}{240:}
  For k:=5268 To 5588 Do
    eqtb[k].int := 0;
  eqtb[5285].int := 1000;
  eqtb[5269].int := 10000;
  eqtb[5309].int := 1;
  eqtb[5308].int := 25;
  eqtb[5313].int := 92;
  eqtb[5316].int := 13;
  For k:=0 To 255 Do
    eqtb[5589+k].int := -1;
  eqtb[5635].int := 0;
{:240}{250:}
  For k:=5845 To 6121 Do
    eqtb[k].int := 0;
{:250}{258:}
  hash_used := 2614;
  cs_count := 0;
  eqtb[2623].hh.b0 := 116;
  hash[2623].rh := 505;{:258}{552:}
  font_ptr := 0;
  fmem_ptr := 7;
  font_name[0] := 812;
  font_area[0] := 339;
  hyphen_char[0] := 45;
  skew_char[0] := -1;
  bchar_label[0] := 0;
  font_bchar[0] := 256;
  font_false_bchar[0] := 256;
  font_bc[0] := 1;
  font_ec[0] := 0;
  font_size[0] := 0;
  font_dsize[0] := 0;
  char_base[0] := 0;
  width_base[0] := 0;
  height_base[0] := 0;
  depth_base[0] := 0;
  italic_base[0] := 0;
  lig_kern_base[0] := 0;
  kern_base[0] := 0;
  exten_base[0] := 0;
  font_glue[0] := 0;
  font_params[0] := 7;
  param_base[0] := -1;
  For k:=0 To 6 Do
    font_info[k].int := 0;
{:552}{946:}
  For k:=-trie_op_size To trie_op_size Do
    trie_op_hash[k] := 0;
  For k:=0 To 255 Do
    trie_used[k] := 0;
  trie_op_ptr := 0;
{:946}{951:}
  trie_not_ready := true;
  trie_l[0] := 0;
  trie_c[0] := 0;
  trie_ptr := 0;
{:951}{1216:}
  hash[2614].rh := 1206;{:1216}{1301:}
  format_ident := 1271;
{:1301}{1369:}
  hash[2622].rh := 1310;
  eqtb[2622].hh.b1 := 1;
  eqtb[2622].hh.b0 := 113;
  eqtb[2622].hh.rh := 0;{:1369}{1384:}
  eTeX_mode := 0;
{1547:}
  max_reg_num := 255;
  max_reg_help_line := 697;
{:1547}{:1384}{1553:}
  For i:=0 To 5 Do
    sa_root[i] := 0;
{:1553}{1589:}
  trie_r[0] := 0;
  hyph_start := 0;{:1589}{:8}
End;
{57:}
Procedure print_ln;
Begin
  Case selector Of
    19:
        Begin
          write_ln(term_out);
          write_ln(log_file);
          term_offset := 0;
          file_offset := 0;
        End;
    18:
        Begin
          write_ln(log_file);
          file_offset := 0;
        End;
    17:
        Begin
          write_ln(term_out);
          term_offset := 0;
        End;
    16,20,21:;
    others: write_ln(write_file[selector])
  End;
End;
{:57}{58:}
Procedure print_char(s:ASCII_code);

Label 10;
Begin
  If {244:}s=eqtb[5317].int{:244}Then If selector<20 Then
                                        Begin
                                          print_ln;
                                          goto 10;
                                        End;
  Case selector Of
    19:
        Begin
          write(term_out,xchr[s]);
          write(log_file,xchr[s]);
          term_offset := term_offset+1;
          file_offset := file_offset+1;
          If term_offset=max_print_line Then
            Begin
              write_ln(term_out);
              term_offset := 0;
            End;
          If file_offset=max_print_line Then
            Begin
              write_ln(log_file);
              file_offset := 0;
            End;
        End;
    18:
        Begin
          write(log_file,xchr[s]);
          file_offset := file_offset+1;
          If file_offset=max_print_line Then print_ln;
        End;
    17:
        Begin
          write(term_out,xchr[s]);
          term_offset := term_offset+1;
          If term_offset=max_print_line Then print_ln;
        End;
    16:;
    20: If tally<trick_count Then trick_buf[tally mod error_line] := s;
    21:
        Begin
          If pool_ptr<pool_size Then
            Begin
              str_pool[pool_ptr] := s;
              pool_ptr := pool_ptr+1;
            End;
        End;
    others: write(write_file[selector],xchr[s])
  End;
  tally := tally+1;
  10:
End;
{:58}{59:}
Procedure print(s:integer);

Label 10;

Var j: pool_pointer;
  nl: integer;
Begin
  If s>=str_ptr Then s := 260
  Else If s<256 Then If s<0 Then s := 260
  Else
    Begin
      If selector>20 Then
        Begin
          print_char(s);
          goto 10;
        End;
      If ({244:}s=eqtb[5317].int{:244})Then If selector<20 Then
                                              Begin
                                                print_ln;
                                                goto 10;
                                              End;
      nl := eqtb[5317].int;
      eqtb[5317].int := -1;
      j := str_start[s];
      While j<str_start[s+1] Do
        Begin
          print_char(str_pool[j]);
          j := j+1;
        End;
      eqtb[5317].int := nl;
      goto 10;
    End;
  j := str_start[s];
  While j<str_start[s+1] Do
    Begin
      print_char(str_pool[j]);
      j := j+1;
    End;
  10:
End;{:59}{60:}
Procedure slow_print(s:integer);

Var j: pool_pointer;
Begin
  If (s>=str_ptr)Or(s<256)Then print(s)
  Else
    Begin
      j := str_start[s];
      While j<str_start[s+1] Do
        Begin
          print(str_pool[j]);
          j := j+1;
        End;
    End;
End;
{:60}{62:}
Procedure print_nl(s:str_number);
Begin
  If ((term_offset>0)And(odd(selector)))Or((file_offset>0)And(
     selector>=18))Then print_ln;
  print(s);
End;
{:62}{63:}
Procedure print_esc(s:str_number);

Var c: integer;
Begin{243:}
  c := eqtb[5313].int{:243};
  If c>=0 Then If c<256 Then print(c);
  slow_print(s);
End;{:63}{64:}
Procedure print_the_digs(k:eight_bits);
Begin
  While k>0 Do
    Begin
      k := k-1;
      If dig[k]<10 Then print_char(48+dig[k])
      Else print_char(55+dig[k]);
    End;
End;{:64}{65:}
Procedure print_int(n:integer);

Var k: 0..23;
  m: integer;
Begin
  k := 0;
  If n<0 Then
    Begin
      print_char(45);
      If n>-100000000 Then n := -n
      Else
        Begin
          m := -1-n;
          n := m Div 10;
          m := (m Mod 10)+1;
          k := 1;
          If m<10 Then dig[0] := m
          Else
            Begin
              dig[0] := 0;
              n := n+1;
            End;
        End;
    End;
  Repeat
    dig[k] := n Mod 10;
    n := n Div 10;
    k := k+1;
  Until n=0;
  print_the_digs(k);
End;{:65}{262:}
Procedure print_cs(p:integer);
Begin
  If p<514 Then If p>=257 Then If p=513 Then
                                 Begin
                                   print_esc(507);
                                   print_esc(508);
                                   print_char(32);
                                 End
  Else
    Begin
      print_esc(p-257);
      If eqtb[3988+p-257].hh.rh=11 Then print_char(32);
    End
  Else If p<1 Then print_esc(509)
  Else print(p-1)
  Else If p>=2881 Then
         print_esc(509)
  Else If (hash[p].rh<0)Or(hash[p].rh>=str_ptr)Then print_esc
         (510)
  Else
    Begin
      print_esc(hash[p].rh);
      print_char(32);
    End;
End;
{:262}{263:}
Procedure sprint_cs(p:halfword);
Begin
  If p<514 Then If p<257 Then print(p-1)
  Else If p<513 Then print_esc
         (p-257)
  Else
    Begin
      print_esc(507);
      print_esc(508);
    End
  Else print_esc(hash[p].rh);
End;
{:263}{518:}
Procedure print_file_name(n,a,e:integer);
Begin
  slow_print(a);
  slow_print(n);
  slow_print(e);
End;
{:518}{699:}
Procedure print_size(s:integer);
Begin
  If s=0 Then print_esc(415)
  Else If s=16 Then print_esc(416)
  Else
    print_esc(417);
End;
{:699}{1355:}
Procedure print_write_whatsit(s:str_number;p:halfword);
Begin
  print_esc(s);
  If mem[p+1].hh.lh<16 Then print_int(mem[p+1].hh.lh)
  Else If mem[p+1].hh.
          lh=16 Then print_char(42)
  Else print_char(45);
End;
{:1355}{1557:}
Procedure print_sa_num(q:halfword);

Var n: halfword;
Begin
  If mem[q].hh.b0<32 Then n := mem[q+1].hh.rh
  Else
    Begin
      n := mem[q].hh.
           b0 Mod 16;
      q := mem[q].hh.rh;
      n := n+16*mem[q].hh.b0;
      q := mem[q].hh.rh;
      n := n+256*(mem[q].hh.b0+16*mem[mem[q].hh.rh].hh.b0);
    End;
  print_int(n);
End;
{:1557}{78:}
Procedure normalize_selector;
forward;
Procedure get_token;
forward;
Procedure term_input;
forward;
Procedure show_context;
forward;
Procedure begin_file_reading;
forward;
Procedure open_log_file;
forward;
Procedure close_files_and_terminate;
forward;
Procedure clear_for_error_prompt;
forward;
Procedure give_err_help;
forward;{procedure debug_help;forward;}{:78}{81:}
Procedure jump_out;
Begin
  goto 9998;
End;{:81}{82:}
Procedure error;

Label 22,10;

Var c: ASCII_code;
  s1,s2,s3,s4: integer;
Begin
  If history<2 Then history := 2;
  print_char(46);
  show_context;
  If interaction=3 Then{83:}While true Do
                              Begin
                                22: If interaction<>3 Then
                                      goto 10;
                                clear_for_error_prompt;
                                Begin;
                                  print(265);
                                  term_input;
                                End;
                                If last=first Then goto 10;
                                c := buffer[first];
                                If c>=97 Then c := c-32;
{84:}
                                Case c Of
                                  48,49,50,51,52,53,54,55,56,57: If deletions_allowed Then
{88:}
                                                                   Begin
                                                                     s1 := cur_tok;
                                                                     s2 := cur_cmd;
                                                                     s3 := cur_chr;
                                                                     s4 := align_state;
                                                                     align_state := 1000000;
                                                                     OK_to_interrupt := false;
                                                                     If (last>first+1)And(buffer[
                                                                        first+1]>=48)And(buffer[
                                                                        first+1]<=57)Then c :=
                                                                                               c*10+
                                                                                              buffer
                                                                                               [
                                                                                               first
                                                                                               +1]-
                                                                                               48*11
                                                                     Else c := c-48;
                                                                     While c>0 Do
                                                                       Begin
                                                                         get_token;
                                                                         c := c-1;
                                                                       End;
                                                                     cur_tok := s1;
                                                                     cur_cmd := s2;
                                                                     cur_chr := s3;
                                                                     align_state := s4;
                                                                     OK_to_interrupt := true;
                                                                     Begin
                                                                       help_ptr := 2;
                                                                       help_line[1] := 280;
                                                                       help_line[0] := 281;
                                                                     End;
                                                                     show_context;
                                                                     goto 22;
                                                                   End{:88};
{68:begin debug_help;goto 22;end;}
                                  69: If base_ptr>0 Then If input_stack[base_ptr].name_field>=256
                                                           Then
                                                           Begin
                                                             print_nl(266);
                                                             slow_print(input_stack[base_ptr].
                                                                        name_field);
                                                             print(267);
                                                             print_int(line);
                                                             interaction := 2;
                                                             jump_out;
                                                           End;
                                  72:{89:}
                                      Begin
                                        If use_err_help Then
                                          Begin
                                            give_err_help;
                                            use_err_help := false;
                                          End
                                        Else
                                          Begin
                                            If help_ptr=0 Then
                                              Begin
                                                help_ptr := 2;
                                                help_line[1] := 282;
                                                help_line[0] := 283;
                                              End;
                                            Repeat
                                              help_ptr := help_ptr-1;
                                              print(help_line[help_ptr]);
                                              print_ln;
                                            Until help_ptr=0;
                                          End;
                                        Begin
                                          help_ptr := 4;
                                          help_line[3] := 284;
                                          help_line[2] := 283;
                                          help_line[1] := 285;
                                          help_line[0] := 286;
                                        End;
                                        goto 22;
                                      End{:89};
                                  73:{87:}
                                      Begin
                                        begin_file_reading;
                                        If last>first+1 Then
                                          Begin
                                            cur_input.loc_field := first+1;
                                            buffer[first] := 32;
                                          End
                                        Else
                                          Begin
                                            Begin;
                                              print(279);
                                              term_input;
                                            End;
                                            cur_input.loc_field := first;
                                          End;
                                        first := last;
                                        cur_input.limit_field := last-1;
                                        goto 10;
                                      End{:87};
                                  81,82,83:{86:}
                                            Begin
                                              error_count := 0;
                                              interaction := 0+c-81;
                                              print(274);
                                              Case c Of
                                                81:
                                                    Begin
                                                      print_esc(275);
                                                      selector := selector-1;
                                                    End;
                                                82: print_esc(276);
                                                83: print_esc(277);
                                              End;
                                              print(278);
                                              print_ln;
                                              break(term_out);
                                              goto 10;
                                            End{:86};
                                  88:
                                      Begin
                                        interaction := 2;
                                        jump_out;
                                      End;
                                  others:
                                End;{85:}
                                Begin
                                  print(268);
                                  print_nl(269);
                                  print_nl(270);
                                  If base_ptr>0 Then If input_stack[base_ptr].name_field>=256 Then
                                                       print(
                                                             271);
                                  If deletions_allowed Then print_nl(272);
                                  print_nl(273);
                                End{:85}{:84};
                              End{:83};
  error_count := error_count+1;
  If error_count=100 Then
    Begin
      print_nl(264);
      history := 3;
      jump_out;
    End;
{90:}
  If interaction>0 Then selector := selector-1;
  If use_err_help Then
    Begin
      print_ln;
      give_err_help;
    End
  Else While help_ptr>0 Do
         Begin
           help_ptr := help_ptr-1;
           print_nl(help_line[help_ptr]);
         End;
  print_ln;
  If interaction>0 Then selector := selector+1;
  print_ln{:90};
  10:
End;
{:82}{93:}
Procedure fatal_error(s:str_number);
Begin
  normalize_selector;
  Begin
    If interaction=3 Then;
    print_nl(263);
    print(288);
  End;
  Begin
    help_ptr := 1;
    help_line[0] := s;
  End;
  Begin
    If interaction=3 Then interaction := 2;
    If log_opened Then error;
{if interaction>0 then debug_help;}
    history := 3;
    jump_out;
  End;
End;
{:93}{94:}
Procedure overflow(s:str_number;n:integer);
Begin
  normalize_selector;
  Begin
    If interaction=3 Then;
    print_nl(263);
    print(289);
  End;
  print(s);
  print_char(61);
  print_int(n);
  print_char(93);
  Begin
    help_ptr := 2;
    help_line[1] := 290;
    help_line[0] := 291;
  End;
  Begin
    If interaction=3 Then interaction := 2;
    If log_opened Then error;
{if interaction>0 then debug_help;}
    history := 3;
    jump_out;
  End;
End;
{:94}{95:}
Procedure confusion(s:str_number);
Begin
  normalize_selector;
  If history<2 Then
    Begin
      Begin
        If interaction=3 Then;
        print_nl(263);
        print(292);
      End;
      print(s);
      print_char(41);
      Begin
        help_ptr := 1;
        help_line[0] := 293;
      End;
    End
  Else
    Begin
      Begin
        If interaction=3 Then;
        print_nl(263);
        print(294);
      End;
      Begin
        help_ptr := 2;
        help_line[1] := 295;
        help_line[0] := 296;
      End;
    End;
  Begin
    If interaction=3 Then interaction := 2;
    If log_opened Then error;{if interaction>0 then debug_help;}
    history := 3;
    jump_out;
  End;
End;
{:95}{:4}{27:}
Function a_open_in(Var f:alpha_file): boolean;
Begin
  reset(f,name_of_file,'/O');
  a_open_in := erstat(f)=0;
End;
Function a_open_out(Var f:alpha_file): boolean;
Begin
  rewrite(f,name_of_file,'/O');
  a_open_out := erstat(f)=0;
End;
Function b_open_in(Var f:byte_file): boolean;
Begin
  reset(f,name_of_file,'/O');
  b_open_in := erstat(f)=0;
End;
Function b_open_out(Var f:byte_file): boolean;
Begin
  rewrite(f,name_of_file,'/O');
  b_open_out := erstat(f)=0;
End;
Function w_open_in(Var f:word_file): boolean;
Begin
  reset(f,name_of_file,'/O');
  w_open_in := erstat(f)=0;
End;
Function w_open_out(Var f:word_file): boolean;
Begin
  rewrite(f,name_of_file,'/O');
  w_open_out := erstat(f)=0;
End;
{:27}{28:}
Procedure a_close(Var f:alpha_file);
Begin
  close(f);
End;
Procedure b_close(Var f:byte_file);
Begin
  close(f);
End;
Procedure w_close(Var f:word_file);
Begin
  close(f);
End;
{:28}{31:}
Function input_ln(Var f:alpha_file;
                  bypass_eoln:boolean): boolean;

Var last_nonblank: 0..buf_size;
Begin
  If bypass_eoln Then If Not eof(f)Then get(f);
  last := first;
  If eof(f)Then input_ln := false
  Else
    Begin
      last_nonblank := first;
      While Not eoln(f) Do
        Begin
          If last>=max_buf_stack Then
            Begin
              max_buf_stack := last+1;
              If max_buf_stack=buf_size Then{35:}If format_ident=0 Then
                                                   Begin
                                                     write_ln
                                                     (term_out,'Buffer size exceeded!');
                                                     goto 9999;
                                                   End
              Else
                Begin
                  cur_input.loc_field := first;
                  cur_input.limit_field := last-1;
                  overflow(257,buf_size);
                End{:35};
            End;
          buffer[last] := xord[f^];
          get(f);
          last := last+1;
          If buffer[last-1]<>32 Then last_nonblank := last;
        End;
      last := last_nonblank;
      input_ln := true;
    End;
End;
{:31}{37:}
Function init_terminal: boolean;

Label 10;
Begin
  reset(term_in,'TTY:','/O/I');
  While true Do
    Begin;
      write(term_out,'**');
      break(term_out);
      If Not input_ln(term_in,true)Then
        Begin
          write_ln(term_out);
          write(term_out,'! End of file on the terminal... why?');
          init_terminal := false;
          goto 10;
        End;
      cur_input.loc_field := first;
      While (cur_input.loc_field<last)And(buffer[cur_input.loc_field]=32) Do
        cur_input.loc_field := cur_input.loc_field+1;
      If cur_input.loc_field<last Then
        Begin
          init_terminal := true;
          goto 10;
        End;
      write_ln(term_out,'Please type the name of your input file.');
    End;
  10:
End;{:37}{43:}
Function make_string: str_number;
Begin
  If str_ptr=max_strings Then overflow(259,max_strings-init_str_ptr)
  ;
  str_ptr := str_ptr+1;
  str_start[str_ptr] := pool_ptr;
  make_string := str_ptr-1;
End;{:43}{45:}
Function str_eq_buf(s:str_number;k:integer): boolean;

Label 45;

Var j: pool_pointer;
  result: boolean;
Begin
  j := str_start[s];
  While j<str_start[s+1] Do
    Begin
      If str_pool[j]<>buffer[k]Then
        Begin
          result := false;
          goto 45;
        End;
      j := j+1;
      k := k+1;
    End;
  result := true;
  45: str_eq_buf := result;
End;
{:45}{46:}
Function str_eq_str(s,t:str_number): boolean;

Label 45;

Var j,k: pool_pointer;
  result: boolean;
Begin
  result := false;
  If (str_start[s+1]-str_start[s])<>(str_start[t+1]-str_start[t])Then goto
    45;
  j := str_start[s];
  k := str_start[t];
  While j<str_start[s+1] Do
    Begin
      If str_pool[j]<>str_pool[k]Then goto 45;
      j := j+1;
      k := k+1;
    End;
  result := true;
  45: str_eq_str := result;
End;
{:46}{47:}
Function get_strings_started: boolean;

Label 30,10;

Var k,l: 0..255;
  m,n: char;
  g: str_number;
  a: integer;
  c: boolean;
Begin
  pool_ptr := 0;
  str_ptr := 0;
  str_start[0] := 0;
{48:}
  For k:=0 To 255 Do
    Begin
      If ({49:}(k<32)Or(k>126){:49})Then
        Begin
          Begin
            str_pool[pool_ptr] := 94;
            pool_ptr := pool_ptr+1;
          End;
          Begin
            str_pool[pool_ptr] := 94;
            pool_ptr := pool_ptr+1;
          End;
          If k<64 Then
            Begin
              str_pool[pool_ptr] := k+64;
              pool_ptr := pool_ptr+1;
            End
          Else If k<128 Then
                 Begin
                   str_pool[pool_ptr] := k-64;
                   pool_ptr := pool_ptr+1;
                 End
          Else
            Begin
              l := k Div 16;
              If l<10 Then
                Begin
                  str_pool[pool_ptr] := l+48;
                  pool_ptr := pool_ptr+1;
                End
              Else
                Begin
                  str_pool[pool_ptr] := l+87;
                  pool_ptr := pool_ptr+1;
                End;
              l := k Mod 16;
              If l<10 Then
                Begin
                  str_pool[pool_ptr] := l+48;
                  pool_ptr := pool_ptr+1;
                End
              Else
                Begin
                  str_pool[pool_ptr] := l+87;
                  pool_ptr := pool_ptr+1;
                End;
            End;
        End
      Else
        Begin
          str_pool[pool_ptr] := k;
          pool_ptr := pool_ptr+1;
        End;
      g := make_string;
    End{:48};
{51:}
  name_of_file := pool_name;
  If a_open_in(pool_file)Then
    Begin
      c := false;
      Repeat{52:}
        Begin
          If eof(pool_file)Then
            Begin;
              write_ln(term_out,'! TEX.POOL has no check sum.');
              a_close(pool_file);
              get_strings_started := false;
              goto 10;
            End;
          read(pool_file,m,n);
          If m='*'Then{53:}
            Begin
              a := 0;
              k := 1;
              While true Do
                Begin
                  If (xord[n]<48)Or(xord[n]>57)Then
                    Begin;
                      write_ln(term_out,'! TEX.POOL check sum doesn''t have nine digits.');
                      a_close(pool_file);
                      get_strings_started := false;
                      goto 10;
                    End;
                  a := 10*a+xord[n]-48;
                  If k=9 Then goto 30;
                  k := k+1;
                  read(pool_file,n);
                End;
              30: If a<>236367277 Then
                    Begin;
                      write_ln(term_out,'! TEX.POOL doesn''t match; TANGLE me again.');
                      a_close(pool_file);
                      get_strings_started := false;
                      goto 10;
                    End;
              c := true;
            End{:53}
          Else
            Begin
              If (xord[m]<48)Or(xord[m]>57)Or(xord[n]<48)Or(xord[n]>
                 57)Then
                Begin;
                  write_ln(term_out,'! TEX.POOL line doesn''t begin with two digits.');
                  a_close(pool_file);
                  get_strings_started := false;
                  goto 10;
                End;
              l := xord[m]*10+xord[n]-48*11;
              If pool_ptr+l+string_vacancies>pool_size Then
                Begin;
                  write_ln(term_out,'! You have to increase POOLSIZE.');
                  a_close(pool_file);
                  get_strings_started := false;
                  goto 10;
                End;
              For k:=1 To l Do
                Begin
                  If eoln(pool_file)Then m := ' '
                  Else read(pool_file,
                            m);
                  Begin
                    str_pool[pool_ptr] := xord[m];
                    pool_ptr := pool_ptr+1;
                  End;
                End;
              read_ln(pool_file);
              g := make_string;
            End;
        End{:52};
      Until c;
      a_close(pool_file);
      get_strings_started := true;
    End
  Else
    Begin;
      write_ln(term_out,'! I can''t read TEX.POOL.');
      a_close(pool_file);
      get_strings_started := false;
      goto 10;
    End{:51};
  10:
End;
{:47}{66:}
Procedure print_two(n:integer);
Begin
  n := abs(n)Mod 100;
  print_char(48+(n Div 10));
  print_char(48+(n Mod 10));
End;
{:66}{67:}
Procedure print_hex(n:integer);

Var k: 0..22;
Begin
  k := 0;
  print_char(34);
  Repeat
    dig[k] := n Mod 16;
    n := n Div 16;
    k := k+1;
  Until n=0;
  print_the_digs(k);
End;{:67}{69:}
Procedure print_roman_int(n:integer);

Label 10;

Var j,k: pool_pointer;
  u,v: nonnegative_integer;
Begin
  j := str_start[261];
  v := 1000;
  While true Do
    Begin
      While n>=v Do
        Begin
          print_char(str_pool[j]);
          n := n-v;
        End;
      If n<=0 Then goto 10;
      k := j+2;
      u := v Div(str_pool[k-1]-48);
      If str_pool[k-1]=50 Then
        Begin
          k := k+2;
          u := u Div(str_pool[k-1]-48);
        End;
      If n+u>=v Then
        Begin
          print_char(str_pool[k]);
          n := n+u;
        End
      Else
        Begin
          j := j+2;
          v := v Div(str_pool[j-1]-48);
        End;
    End;
  10:
End;
{:69}{70:}
Procedure print_current_string;

Var j: pool_pointer;
Begin
  j := str_start[str_ptr];
  While j<pool_ptr Do
    Begin
      print_char(str_pool[j]);
      j := j+1;
    End;
End;
{:70}{71:}
Procedure term_input;

Var k: 0..buf_size;
Begin
  break(term_out);
  If Not input_ln(term_in,true)Then fatal_error(262);
  term_offset := 0;
  selector := selector-1;
  If last<>first Then For k:=first To last-1 Do
                        print(buffer[k]);
  print_ln;
  selector := selector+1;
End;{:71}{91:}
Procedure int_error(n:integer);
Begin
  print(287);
  print_int(n);
  print_char(41);
  error;
End;
{:91}{92:}
Procedure normalize_selector;
Begin
  If log_opened Then selector := 19
  Else selector := 17;
  If job_name=0 Then open_log_file;
  If interaction=0 Then selector := selector-1;
End;
{:92}{98:}
Procedure pause_for_instructions;
Begin
  If OK_to_interrupt Then
    Begin
      interaction := 3;
      If (selector=18)Or(selector=16)Then selector := selector+1;
      Begin
        If interaction=3 Then;
        print_nl(263);
        print(297);
      End;
      Begin
        help_ptr := 3;
        help_line[2] := 298;
        help_line[1] := 299;
        help_line[0] := 300;
      End;
      deletions_allowed := false;
      error;
      deletions_allowed := true;
      interrupt := 0;
    End;
End;{:98}{100:}
Function half(x:integer): integer;
Begin
  If odd(x)Then half := (x+1)Div 2
  Else half := x Div 2;
End;
{:100}{102:}
Function round_decimals(k:small_number): scaled;

Var a: integer;
Begin
  a := 0;
  While k>0 Do
    Begin
      k := k-1;
      a := (a+dig[k]*131072)Div 10;
    End;
  round_decimals := (a+1)Div 2;
End;
{:102}{103:}
Procedure print_scaled(s:scaled);

Var delta: scaled;
Begin
  If s<0 Then
    Begin
      print_char(45);
      s := -s;
    End;
  print_int(s Div 65536);
  print_char(46);
  s := 10*(s Mod 65536)+5;
  delta := 10;
  Repeat
    If delta>65536 Then s := s-17232;
    print_char(48+(s Div 65536));
    s := 10*(s Mod 65536);
    delta := delta*10;
  Until s<=delta;
End;
{:103}{105:}
Function mult_and_add(n:integer;
                      x,y,max_answer:scaled): scaled;
Begin
  If n<0 Then
    Begin
      x := -x;
      n := -n;
    End;
  If n=0 Then mult_and_add := y
  Else If ((x<=(max_answer-y)Div n)And(-x<=(
          max_answer+y)Div n))Then mult_and_add := n*x+y
  Else
    Begin
      arith_error :=
                     true;
      mult_and_add := 0;
    End;
End;{:105}{106:}
Function x_over_n(x:scaled;
                  n:integer): scaled;

Var negative: boolean;
Begin
  negative := false;
  If n=0 Then
    Begin
      arith_error := true;
      x_over_n := 0;
      remainder := x;
    End
  Else
    Begin
      If n<0 Then
        Begin
          x := -x;
          n := -n;
          negative := true;
        End;
      If x>=0 Then
        Begin
          x_over_n := x Div n;
          remainder := x Mod n;
        End
      Else
        Begin
          x_over_n := -((-x)Div n);
          remainder := -((-x)Mod n);
        End;
    End;
  If negative Then remainder := -remainder;
End;
{:106}{107:}
Function xn_over_d(x:scaled;n,d:integer): scaled;

Var positive: boolean;
  t,u,v: nonnegative_integer;
Begin
  If x>=0 Then positive := true
  Else
    Begin
      x := -x;
      positive := false;
    End;
  t := (x Mod 32768)*n;
  u := (x Div 32768)*n+(t Div 32768);
  v := (u Mod d)*32768+(t Mod 32768);
  If u Div d>=32768 Then arith_error := true
  Else u := 32768*(u Div d)+(v Div
            d);
  If positive Then
    Begin
      xn_over_d := u;
      remainder := v Mod d;
    End
  Else
    Begin
      xn_over_d := -u;
      remainder := -(v Mod d);
    End;
End;
{:107}{108:}
Function badness(t,s:scaled): halfword;

Var r: integer;
Begin
  If t=0 Then badness := 0
  Else If s<=0 Then badness := 10000
  Else
    Begin
      If t<=7230584 Then r := (t*297)Div s
      Else If s>=1663497 Then r := t Div(s
                                   Div 297)
      Else r := t;
      If r>1290 Then badness := 10000
      Else badness := (r*r*r+131072)Div 262144;
    End;
End;{:108}{114:}
{procedure print_word(w:memory_word);
begin print_int(w.int);print_char(32);print_scaled(w.int);
print_char(32);print_scaled(round(65536*w.gr));print_ln;
print_int(w.hh.lh);print_char(61);print_int(w.hh.b0);print_char(58);
print_int(w.hh.b1);print_char(59);print_int(w.hh.rh);print_char(32);
print_int(w.qqqq.b0);print_char(58);print_int(w.qqqq.b1);print_char(58);
print_int(w.qqqq.b2);print_char(58);print_int(w.qqqq.b3);end;}
{:114}{119:}{292:}
Procedure show_token_list(p,q:integer;l:integer);

Label 10;

Var m,c: integer;
  match_chr: ASCII_code;
  n: ASCII_code;
Begin
  match_chr := 35;
  n := 48;
  tally := 0;
  While (p<>0)And(tally<l) Do
    Begin
      If p=q Then{320:}
        Begin
          first_count :=
                         tally;
          trick_count := tally+1+error_line-half_error_line;
          If trick_count<error_line Then trick_count := error_line;
        End{:320};
{293:}
      If (p<hi_mem_min)Or(p>mem_end)Then
        Begin
          print_esc(310);
          goto 10;
        End;
      If mem[p].hh.lh>=4095 Then print_cs(mem[p].hh.lh-4095)
      Else
        Begin
          m := mem[
               p].hh.lh Div 256;
          c := mem[p].hh.lh Mod 256;
          If mem[p].hh.lh<0 Then print_esc(562)
          Else{294:}Case m Of
                      1,2,3,4,7,8,10,
                      11,12: print(c);
                      6:
                         Begin
                           print(c);
                           print(c);
                         End;
                      5:
                         Begin
                           print(match_chr);
                           If c<=9 Then print_char(c+48)
                           Else
                             Begin
                               print_char(33);
                               goto 10;
                             End;
                         End;
                      13:
                          Begin
                            match_chr := c;
                            print(c);
                            n := n+1;
                            print_char(n);
                            If n>57 Then goto 10;
                          End;
                      14: If c=0 Then print(563);
                      others: print_esc(562)
            End{:294};
        End{:293};
      p := mem[p].hh.rh;
    End;
  If p<>0 Then print_esc(411);
  10:
End;{:292}{306:}
Procedure runaway;

Var p: halfword;
Begin
  If scanner_status>1 Then
    Begin
      print_nl(577);
      Case scanner_status Of
        2:
           Begin
             print(578);
             p := def_ref;
           End;
        3:
           Begin
             print(579);
             p := 29997;
           End;
        4:
           Begin
             print(580);
             p := 29996;
           End;
        5:
           Begin
             print(581);
             p := def_ref;
           End;
      End;
      print_char(63);
      print_ln;
      show_token_list(mem[p].hh.rh,0,error_line-10);
    End;
End;
{:306}{:119}{120:}
Function get_avail: halfword;

Var p: halfword;
Begin
  p := avail;
  If p<>0 Then avail := mem[avail].hh.rh
  Else If mem_end<mem_max Then
         Begin
           mem_end := mem_end+1;
           p := mem_end;
         End
  Else
    Begin
      hi_mem_min := hi_mem_min-1;
      p := hi_mem_min;
      If hi_mem_min<=lo_mem_max Then
        Begin
          runaway;
          overflow(301,mem_max+1-mem_min);
        End;
    End;
  mem[p].hh.rh := 0;
{dyn_used:=dyn_used+1;}
  get_avail := p;
End;
{:120}{123:}
Procedure flush_list(p:halfword);

Var q,r: halfword;
Begin
  If p<>0 Then
    Begin
      r := p;
      Repeat
        q := r;
        r := mem[r].hh.rh;
{dyn_used:=dyn_used-1;}
      Until r=0;
      mem[q].hh.rh := avail;
      avail := p;
    End;
End;
{:123}{125:}
Function get_node(s:integer): halfword;

Label 40,10,20;

Var p: halfword;
  q: halfword;
  r: integer;
  t: integer;
Begin
  20: p := rover;
  Repeat{127:}
    q := p+mem[p].hh.lh;
    While (mem[q].hh.rh=65535) Do
      Begin
        t := mem[q+1].hh.rh;
        If q=rover Then rover := t;
        mem[t+1].hh.lh := mem[q+1].hh.lh;
        mem[mem[q+1].hh.lh+1].hh.rh := t;
        q := q+mem[q].hh.lh;
      End;
    r := q-s;
    If r>p+1 Then{128:}
      Begin
        mem[p].hh.lh := r-p;
        rover := p;
        goto 40;
      End{:128};
    If r=p Then If mem[p+1].hh.rh<>p Then{129:}
                  Begin
                    rover := mem[p+1].hh.rh;
                    t := mem[p+1].hh.lh;
                    mem[rover+1].hh.lh := t;
                    mem[t+1].hh.rh := rover;
                    goto 40;
                  End{:129};
    mem[p].hh.lh := q-p{:127};
    p := mem[p+1].hh.rh;
  Until p=rover;
  If s=1073741824 Then
    Begin
      get_node := 65535;
      goto 10;
    End;
  If lo_mem_max+2<hi_mem_min Then If lo_mem_max+2<=65535 Then{126:}
                                    Begin
                                      If hi_mem_min-lo_mem_max>=1998 Then t := lo_mem_max+1000
                                      Else t :=
                                                lo_mem_max+1+(hi_mem_min-lo_mem_max)Div 2;
                                      p := mem[rover+1].hh.lh;
                                      q := lo_mem_max;
                                      mem[p+1].hh.rh := q;
                                      mem[rover+1].hh.lh := q;
                                      If t>65535 Then t := 65535;
                                      mem[q+1].hh.rh := rover;
                                      mem[q+1].hh.lh := p;
                                      mem[q].hh.rh := 65535;
                                      mem[q].hh.lh := t-lo_mem_max;
                                      lo_mem_max := t;
                                      mem[lo_mem_max].hh.rh := 0;
                                      mem[lo_mem_max].hh.lh := 0;
                                      rover := q;
                                      goto 20;
                                    End{:126};
  overflow(301,mem_max+1-mem_min);
  40: mem[r].hh.rh := 0;
{var_used:=var_used+s;}
  get_node := r;
  10:
End;
{:125}{130:}
Procedure free_node(p:halfword;s:halfword);

Var q: halfword;
Begin
  mem[p].hh.lh := s;
  mem[p].hh.rh := 65535;
  q := mem[rover+1].hh.lh;
  mem[p+1].hh.lh := q;
  mem[p+1].hh.rh := rover;
  mem[rover+1].hh.lh := p;
  mem[q+1].hh.rh := p;{var_used:=var_used-s;}
End;
{:130}{131:}
Procedure sort_avail;

Var p,q,r: halfword;
  old_rover: halfword;
Begin
  p := get_node(1073741824);
  p := mem[rover+1].hh.rh;
  mem[rover+1].hh.rh := 65535;
  old_rover := rover;
  While p<>old_rover Do{132:}
    If p<rover Then
      Begin
        q := p;
        p := mem[q+1].hh.rh;
        mem[q+1].hh.rh := rover;
        rover := q;
      End
    Else
      Begin
        q := rover;
        While mem[q+1].hh.rh<p Do
          q := mem[q+1].hh.rh;
        r := mem[p+1].hh.rh;
        mem[p+1].hh.rh := mem[q+1].hh.rh;
        mem[q+1].hh.rh := p;
        p := r;
      End{:132};
  p := rover;
  While mem[p+1].hh.rh<>65535 Do
    Begin
      mem[mem[p+1].hh.rh+1].hh.lh := p;
      p := mem[p+1].hh.rh;
    End;
  mem[p+1].hh.rh := rover;
  mem[rover+1].hh.lh := p;
End;
{:131}{136:}
Function new_null_box: halfword;

Var p: halfword;
Begin
  p := get_node(7);
  mem[p].hh.b0 := 0;
  mem[p].hh.b1 := 0;
  mem[p+1].int := 0;
  mem[p+2].int := 0;
  mem[p+3].int := 0;
  mem[p+4].int := 0;
  mem[p+5].hh.rh := 0;
  mem[p+5].hh.b0 := 0;
  mem[p+5].hh.b1 := 0;
  mem[p+6].gr := 0.0;
  new_null_box := p;
End;{:136}{139:}
Function new_rule: halfword;

Var p: halfword;
Begin
  p := get_node(4);
  mem[p].hh.b0 := 2;
  mem[p].hh.b1 := 0;
  mem[p+1].int := -1073741824;
  mem[p+2].int := -1073741824;
  mem[p+3].int := -1073741824;
  new_rule := p;
End;
{:139}{144:}
Function new_ligature(f,c:quarterword;q:halfword): halfword;

Var p: halfword;
Begin
  p := get_node(2);
  mem[p].hh.b0 := 6;
  mem[p+1].hh.b0 := f;
  mem[p+1].hh.b1 := c;
  mem[p+1].hh.rh := q;
  mem[p].hh.b1 := 0;
  new_ligature := p;
End;
Function new_lig_item(c:quarterword): halfword;

Var p: halfword;
Begin
  p := get_node(2);
  mem[p].hh.b1 := c;
  mem[p+1].hh.rh := 0;
  new_lig_item := p;
End;{:144}{145:}
Function new_disc: halfword;

Var p: halfword;
Begin
  p := get_node(2);
  mem[p].hh.b0 := 7;
  mem[p].hh.b1 := 0;
  mem[p+1].hh.lh := 0;
  mem[p+1].hh.rh := 0;
  new_disc := p;
End;
{:145}{147:}
Function new_math(w:scaled;s:small_number): halfword;

Var p: halfword;
Begin
  p := get_node(2);
  mem[p].hh.b0 := 9;
  mem[p].hh.b1 := s;
  mem[p+1].int := w;
  new_math := p;
End;
{:147}{151:}
Function new_spec(p:halfword): halfword;

Var q: halfword;
Begin
  q := get_node(4);
  mem[q] := mem[p];
  mem[q].hh.rh := 0;
  mem[q+1].int := mem[p+1].int;
  mem[q+2].int := mem[p+2].int;
  mem[q+3].int := mem[p+3].int;
  new_spec := q;
End;
{:151}{152:}
Function new_param_glue(n:small_number): halfword;

Var p: halfword;
  q: halfword;
Begin
  p := get_node(2);
  mem[p].hh.b0 := 10;
  mem[p].hh.b1 := n+1;
  mem[p+1].hh.rh := 0;
  q := {224:}eqtb[2882+n].hh.rh{:224};
  mem[p+1].hh.lh := q;
  mem[q].hh.rh := mem[q].hh.rh+1;
  new_param_glue := p;
End;
{:152}{153:}
Function new_glue(q:halfword): halfword;

Var p: halfword;
Begin
  p := get_node(2);
  mem[p].hh.b0 := 10;
  mem[p].hh.b1 := 0;
  mem[p+1].hh.rh := 0;
  mem[p+1].hh.lh := q;
  mem[q].hh.rh := mem[q].hh.rh+1;
  new_glue := p;
End;
{:153}{154:}
Function new_skip_param(n:small_number): halfword;

Var p: halfword;
Begin
  temp_ptr := new_spec({224:}eqtb[2882+n].hh.rh{:224});
  p := new_glue(temp_ptr);
  mem[temp_ptr].hh.rh := 0;
  mem[p].hh.b1 := n+1;
  new_skip_param := p;
End;{:154}{156:}
Function new_kern(w:scaled): halfword;

Var p: halfword;
Begin
  p := get_node(2);
  mem[p].hh.b0 := 11;
  mem[p].hh.b1 := 0;
  mem[p+1].int := w;
  new_kern := p;
End;
{:156}{158:}
Function new_penalty(m:integer): halfword;

Var p: halfword;
Begin
  p := get_node(2);
  mem[p].hh.b0 := 12;
  mem[p].hh.b1 := 0;
  mem[p+1].int := m;
  new_penalty := p;
End;{:158}{167:}
{procedure check_mem(print_locs:boolean);
label 31,32;var p,q:halfword;clobbered:boolean;
begin for p:=mem_min to lo_mem_max do free[p]:=false;
for p:=hi_mem_min to mem_end do free[p]:=false;[168:]p:=avail;q:=0;
clobbered:=false;
while p<>0 do begin if(p>mem_end)or(p<hi_mem_min)then clobbered:=true
else if free[p]then clobbered:=true;
if clobbered then begin print_nl(302);print_int(q);goto 31;end;
free[p]:=true;q:=p;p:=mem[q].hh.rh;end;31:[:168];[169:]p:=rover;q:=0;
clobbered:=false;
repeat if(p>=lo_mem_max)or(p<mem_min)then clobbered:=true else if(mem[p
+1].hh.rh>=lo_mem_max)or(mem[p+1].hh.rh<mem_min)then clobbered:=true
else if not((mem[p].hh.rh=65535))or(mem[p].hh.lh<2)or(p+mem[p].hh.lh>
lo_mem_max)or(mem[mem[p+1].hh.rh+1].hh.lh<>p)then clobbered:=true;
if clobbered then begin print_nl(303);print_int(q);goto 32;end;
for q:=p to p+mem[p].hh.lh-1 do begin if free[q]then begin print_nl(304)
;print_int(q);goto 32;end;free[q]:=true;end;q:=p;p:=mem[p+1].hh.rh;
until p=rover;32:[:169];[170:]p:=mem_min;
while p<=lo_mem_max do begin if(mem[p].hh.rh=65535)then begin print_nl(
305);print_int(p);end;while(p<=lo_mem_max)and not free[p]do p:=p+1;
while(p<=lo_mem_max)and free[p]do p:=p+1;end[:170];
if print_locs then[171:]begin print_nl(306);
for p:=mem_min to lo_mem_max do if not free[p]and((p>was_lo_max)or
was_free[p])then begin print_char(32);print_int(p);end;
for p:=hi_mem_min to mem_end do if not free[p]and((p<was_hi_min)or(p>
was_mem_end)or was_free[p])then begin print_char(32);print_int(p);end;
end[:171];for p:=mem_min to lo_mem_max do was_free[p]:=free[p];
for p:=hi_mem_min to mem_end do was_free[p]:=free[p];
was_mem_end:=mem_end;was_lo_max:=lo_mem_max;was_hi_min:=hi_mem_min;end;}
{:167}{172:}
{procedure search_mem(p:halfword);var q:integer;
begin for q:=mem_min to lo_mem_max do begin if mem[q].hh.rh=p then begin
print_nl(307);print_int(q);print_char(41);end;
if mem[q].hh.lh=p then begin print_nl(308);print_int(q);print_char(41);
end;end;
for q:=hi_mem_min to mem_end do begin if mem[q].hh.rh=p then begin
print_nl(307);print_int(q);print_char(41);end;
if mem[q].hh.lh=p then begin print_nl(308);print_int(q);print_char(41);
end;end;
[255:]for q:=1 to 3938 do begin if eqtb[q].hh.rh=p then begin print_nl(
504);print_int(q);print_char(41);end;end[:255];
[285:]if save_ptr>0 then for q:=0 to save_ptr-1 do begin if save_stack[q
].hh.rh=p then begin print_nl(554);print_int(q);print_char(41);end;
end[:285];
[933:]for q:=0 to 307 do begin if hyph_list[q]=p then begin print_nl(952
);print_int(q);print_char(41);end;end[:933];end;}
{:172}{174:}
Procedure short_display(p:integer);

Var n: integer;
Begin
  While p>mem_min Do
    Begin
      If (p>=hi_mem_min)Then
        Begin
          If p<=mem_end
            Then
            Begin
              If mem[p].hh.b0<>font_in_short_display Then
                Begin
                  If (mem[p].
                     hh.b0<0)Or(mem[p].hh.b0>font_max)Then print_char(42)
                  Else{267:}print_esc(
                                      hash[2624+mem[p].hh.b0].rh){:267};
                  print_char(32);
                  font_in_short_display := mem[p].hh.b0;
                End;
              print(mem[p].hh.b1-0);
            End;
        End
      Else{175:}Case mem[p].hh.b0 Of
                  0,1,3,8,4,5,13: print(309);
                  2: print_char(124);
                  10: If mem[p+1].hh.lh<>0 Then print_char(32);
                  9: If mem[p].hh.b1>=4 Then print(309)
                     Else print_char(36);
                  6: short_display(mem[p+1].hh.rh);
                  7:
                     Begin
                       short_display(mem[p+1].hh.lh);
                       short_display(mem[p+1].hh.rh);
                       n := mem[p].hh.b1;
                       While n>0 Do
                         Begin
                           If mem[p].hh.rh<>0 Then p := mem[p].hh.rh;
                           n := n-1;
                         End;
                     End;
                  others:
        End{:175};
      p := mem[p].hh.rh;
    End;
End;
{:174}{176:}
Procedure print_font_and_char(p:integer);
Begin
  If p>mem_end Then print_esc(310)
  Else
    Begin
      If (mem[p].hh.b0<0)Or(
         mem[p].hh.b0>font_max)Then print_char(42)
      Else{267:}print_esc(hash[2624+
                          mem[p].hh.b0].rh){:267};
      print_char(32);
      print(mem[p].hh.b1-0);
    End;
End;
Procedure print_mark(p:integer);
Begin
  print_char(123);
  If (p<hi_mem_min)Or(p>mem_end)Then print_esc(310)
  Else show_token_list(mem
                       [p].hh.rh,0,max_print_line-10);
  print_char(125);
End;
Procedure print_rule_dimen(d:scaled);
Begin
  If (d=-1073741824)Then print_char(42)
  Else print_scaled(d);
End;
{:176}{177:}
Procedure print_glue(d:scaled;order:integer;s:str_number);
Begin
  print_scaled(d);
  If (order<0)Or(order>3)Then print(311)
  Else If order>0 Then
         Begin
           print(
                 312);
           While order>1 Do
             Begin
               print_char(108);
               order := order-1;
             End;
         End
  Else If s<>0 Then print(s);
End;
{:177}{178:}
Procedure print_spec(p:integer;s:str_number);
Begin
  If (p<mem_min)Or(p>=lo_mem_max)Then print_char(42)
  Else
    Begin
      print_scaled(mem[p+1].int);
      If s<>0 Then print(s);
      If mem[p+2].int<>0 Then
        Begin
          print(313);
          print_glue(mem[p+2].int,mem[p].hh.b0,s);
        End;
      If mem[p+3].int<>0 Then
        Begin
          print(314);
          print_glue(mem[p+3].int,mem[p].hh.b1,s);
        End;
    End;
End;
{:178}{179:}{691:}
Procedure print_fam_and_char(p:halfword);
Begin
  print_esc(467);
  print_int(mem[p].hh.b0);
  print_char(32);
  print(mem[p].hh.b1-0);
End;
Procedure print_delimiter(p:halfword);

Var a: integer;
Begin
  a := mem[p].qqqq.b0*256+mem[p].qqqq.b1-0;
  a := a*4096+mem[p].qqqq.b2*256+mem[p].qqqq.b3-0;
  If a<0 Then print_int(a)
  Else print_hex(a);
End;
{:691}{692:}
Procedure show_info;
forward;
Procedure print_subsidiary_data(p:halfword;c:ASCII_code);
Begin
  If (pool_ptr-str_start[str_ptr])>=depth_threshold Then
    Begin
      If mem
         [p].hh.rh<>0 Then print(315);
    End
  Else
    Begin
      Begin
        str_pool[pool_ptr] := c;
        pool_ptr := pool_ptr+1;
      End;
      temp_ptr := p;
      Case mem[p].hh.rh Of
        1:
           Begin
             print_ln;
             print_current_string;
             print_fam_and_char(p);
           End;
        2: show_info;
        3: If mem[p].hh.lh=0 Then
             Begin
               print_ln;
               print_current_string;
               print(871);
             End
           Else show_info;
        others:
      End;
      pool_ptr := pool_ptr-1;
    End;
End;
{:692}{694:}
Procedure print_style(c:integer);
Begin
  Case c Div 2 Of
    0: print_esc(872);
    1: print_esc(873);
    2: print_esc(874);
    3: print_esc(875);
    others: print(876)
  End;
End;
{:694}{225:}
Procedure print_skip_param(n:integer);
Begin
  Case n Of
    0: print_esc(379);
    1: print_esc(380);
    2: print_esc(381);
    3: print_esc(382);
    4: print_esc(383);
    5: print_esc(384);
    6: print_esc(385);
    7: print_esc(386);
    8: print_esc(387);
    9: print_esc(388);
    10: print_esc(389);
    11: print_esc(390);
    12: print_esc(391);
    13: print_esc(392);
    14: print_esc(393);
    15: print_esc(394);
    16: print_esc(395);
    17: print_esc(396);
    others: print(397)
  End;
End;
{:225}{:179}{182:}
Procedure show_node_list(p:integer);

Label 10;

Var n: integer;
  g: real;
Begin
  If (pool_ptr-str_start[str_ptr])>depth_threshold Then
    Begin
      If p>0
        Then print(315);
      goto 10;
    End;
  n := 0;
  While p>mem_min Do
    Begin
      print_ln;
      print_current_string;
      If p>mem_end Then
        Begin
          print(316);
          goto 10;
        End;
      n := n+1;
      If n>breadth_max Then
        Begin
          print(317);
          goto 10;
        End;
{183:}
      If (p>=hi_mem_min)Then print_font_and_char(p)
      Else Case mem[p].hh.b0
             Of
             0,1,13:{184:}
                     Begin
                       If mem[p].hh.b0=0 Then print_esc(104)
                       Else If mem[p
                               ].hh.b0=1 Then print_esc(118)
                       Else print_esc(319);
                       print(320);
                       print_scaled(mem[p+3].int);
                       print_char(43);
                       print_scaled(mem[p+2].int);
                       print(321);
                       print_scaled(mem[p+1].int);
                       If mem[p].hh.b0=13 Then{185:}
                         Begin
                           If mem[p].hh.b1<>0 Then
                             Begin
                               print(
                                     287);
                               print_int(mem[p].hh.b1+1);
                               print(323);
                             End;
                           If mem[p+6].int<>0 Then
                             Begin
                               print(324);
                               print_glue(mem[p+6].int,mem[p+5].hh.b1,0);
                             End;
                           If mem[p+4].int<>0 Then
                             Begin
                               print(325);
                               print_glue(mem[p+4].int,mem[p+5].hh.b0,0);
                             End;
                         End{:185}
                       Else
                         Begin{186:}
                           g := mem[p+6].gr;
                           If (g<>0.0)And(mem[p+5].hh.b0<>0)Then
                             Begin
                               print(326);
                               If mem[p+5].hh.b0=2 Then print(327);
                               If abs(mem[p+6].int)<1048576 Then print(328)
                               Else If abs(g)>20000.0 Then
                                      Begin
                                        If g>0.0 Then print_char(62)
                                        Else print(329);
                                        print_glue(20000*65536,mem[p+5].hh.b1,0);
                                      End
                               Else print_glue(round(65536*g),mem[p+5].hh.b1,0);
                             End{:186};
                           If mem[p+4].int<>0 Then
                             Begin
                               print(322);
                               print_scaled(mem[p+4].int);
                             End;
                           If (eTeX_mode=1)Then{1435:}If (mem[p].hh.b0=0)And((mem[p].hh.b1-0)=2)Then
                                                        print(1371){:1435};
                         End;
                       Begin
                         Begin
                           str_pool[pool_ptr] := 46;
                           pool_ptr := pool_ptr+1;
                         End;
                         show_node_list(mem[p+5].hh.rh);
                         pool_ptr := pool_ptr-1;
                       End;
                     End{:184};
             2:{187:}
                Begin
                  print_esc(330);
                  print_rule_dimen(mem[p+3].int);
                  print_char(43);
                  print_rule_dimen(mem[p+2].int);
                  print(321);
                  print_rule_dimen(mem[p+1].int);
                End{:187};
             3:{188:}
                Begin
                  print_esc(331);
                  print_int(mem[p].hh.b1-0);
                  print(332);
                  print_scaled(mem[p+3].int);
                  print(333);
                  print_spec(mem[p+4].hh.rh,0);
                  print_char(44);
                  print_scaled(mem[p+2].int);
                  print(334);
                  print_int(mem[p+1].int);
                  Begin
                    Begin
                      str_pool[pool_ptr] := 46;
                      pool_ptr := pool_ptr+1;
                    End;
                    show_node_list(mem[p+4].hh.lh);
                    pool_ptr := pool_ptr-1;
                  End;
                End{:188};
             8:{1356:}Case mem[p].hh.b1 Of
                        0:
                           Begin
                             print_write_whatsit(1299,p);
                             print_char(61);
                             print_file_name(mem[p+1].hh.rh,mem[p+2].hh.lh,mem[p+2].hh.rh);
                           End;
                        1:
                           Begin
                             print_write_whatsit(603,p);
                             print_mark(mem[p+1].hh.rh);
                           End;
                        2: print_write_whatsit(1300,p);
                        3:
                           Begin
                             print_esc(1301);
                             print_mark(mem[p+1].hh.rh);
                           End;
                        4:
                           Begin
                             print_esc(1303);
                             print_int(mem[p+1].hh.rh);
                             print(1306);
                             print_int(mem[p+1].hh.b0);
                             print_char(44);
                             print_int(mem[p+1].hh.b1);
                             print_char(41);
                           End;
                        others: print(1307)
                End{:1356};
             10:{189:}If mem[p].hh.b1>=100 Then{190:}
                        Begin
                          print_esc(339);
                          If mem[p].hh.b1=101 Then print_char(99)
                          Else If mem[p].hh.b1=102 Then
                                 print_char(120);
                          print(340);
                          print_spec(mem[p+1].hh.lh,0);
                          Begin
                            Begin
                              str_pool[pool_ptr] := 46;
                              pool_ptr := pool_ptr+1;
                            End;
                            show_node_list(mem[p+1].hh.rh);
                            pool_ptr := pool_ptr-1;
                          End;
                        End{:190}
                 Else
                   Begin
                     print_esc(335);
                     If mem[p].hh.b1<>0 Then
                       Begin
                         print_char(40);
                         If mem[p].hh.b1<98 Then print_skip_param(mem[p].hh.b1-1)
                         Else If mem[p].
                                 hh.b1=98 Then print_esc(336)
                         Else print_esc(337);
                         print_char(41);
                       End;
                     If mem[p].hh.b1<>98 Then
                       Begin
                         print_char(32);
                         If mem[p].hh.b1<98 Then print_spec(mem[p+1].hh.lh,0)
                         Else print_spec(mem[
                                         p+1].hh.lh,338);
                       End;
                   End{:189};
             11:{191:}If mem[p].hh.b1<>99 Then
                        Begin
                          print_esc(341);
                          If mem[p].hh.b1<>0 Then print_char(32);
                          print_scaled(mem[p+1].int);
                          If mem[p].hh.b1=2 Then print(342);
                        End
                 Else
                   Begin
                     print_esc(343);
                     print_scaled(mem[p+1].int);
                     print(338);
                   End{:191};
             9:{192:}If mem[p].hh.b1>1 Then
                       Begin
                         If odd(mem[p].hh.b1)Then print_esc(
                                                            344)
                         Else print_esc(345);
                         If mem[p].hh.b1>8 Then print_char(82)
                         Else If mem[p].hh.b1>4 Then
                                print_char(76)
                         Else print_char(77);
                       End
                Else
                  Begin
                    print_esc(346);
                    If mem[p].hh.b1=0 Then print(347)
                    Else print(348);
                    If mem[p+1].int<>0 Then
                      Begin
                        print(349);
                        print_scaled(mem[p+1].int);
                      End;
                  End{:192};
             6:{193:}
                Begin
                  print_font_and_char(p+1);
                  print(350);
                  If mem[p].hh.b1>1 Then print_char(124);
                  font_in_short_display := mem[p+1].hh.b0;
                  short_display(mem[p+1].hh.rh);
                  If odd(mem[p].hh.b1)Then print_char(124);
                  print_char(41);
                End{:193};
             12:{194:}
                 Begin
                   print_esc(351);
                   print_int(mem[p+1].int);
                 End{:194};
             7:{195:}
                Begin
                  print_esc(352);
                  If mem[p].hh.b1>0 Then
                    Begin
                      print(353);
                      print_int(mem[p].hh.b1);
                    End;
                  Begin
                    Begin
                      str_pool[pool_ptr] := 46;
                      pool_ptr := pool_ptr+1;
                    End;
                    show_node_list(mem[p+1].hh.lh);
                    pool_ptr := pool_ptr-1;
                  End;
                  Begin
                    str_pool[pool_ptr] := 124;
                    pool_ptr := pool_ptr+1;
                  End;
                  show_node_list(mem[p+1].hh.rh);
                  pool_ptr := pool_ptr-1;
                End{:195};
             4:{196:}
                Begin
                  print_esc(354);
                  If mem[p+1].hh.lh<>0 Then
                    Begin
                      print_char(115);
                      print_int(mem[p+1].hh.lh);
                    End;
                  print_mark(mem[p+1].hh.rh);
                End{:196};
             5:{197:}
                Begin
                  print_esc(355);
                  Begin
                    Begin
                      str_pool[pool_ptr] := 46;
                      pool_ptr := pool_ptr+1;
                    End;
                    show_node_list(mem[p+1].int);
                    pool_ptr := pool_ptr-1;
                  End;
                End{:197};{690:}
             14: print_style(mem[p].hh.b1);
             15:{695:}
                 Begin
                   print_esc(528);
                   Begin
                     str_pool[pool_ptr] := 68;
                     pool_ptr := pool_ptr+1;
                   End;
                   show_node_list(mem[p+1].hh.lh);
                   pool_ptr := pool_ptr-1;
                   Begin
                     str_pool[pool_ptr] := 84;
                     pool_ptr := pool_ptr+1;
                   End;
                   show_node_list(mem[p+1].hh.rh);
                   pool_ptr := pool_ptr-1;
                   Begin
                     str_pool[pool_ptr] := 83;
                     pool_ptr := pool_ptr+1;
                   End;
                   show_node_list(mem[p+2].hh.lh);
                   pool_ptr := pool_ptr-1;
                   Begin
                     str_pool[pool_ptr] := 115;
                     pool_ptr := pool_ptr+1;
                   End;
                   show_node_list(mem[p+2].hh.rh);
                   pool_ptr := pool_ptr-1;
                 End{:695};
             16,17,18,19,20,21,22,23,24,27,26,29,28,30,31:{696:}
                                                           Begin
                                                             Case mem[p].hh.
                                                                  b0 Of
                                                               16: print_esc(877);
                                                               17: print_esc(878);
                                                               18: print_esc(879);
                                                               19: print_esc(880);
                                                               20: print_esc(881);
                                                               21: print_esc(882);
                                                               22: print_esc(883);
                                                               23: print_esc(884);
                                                               27: print_esc(885);
                                                               26: print_esc(886);
                                                               29: print_esc(543);
                                                               24:
                                                                   Begin
                                                                     print_esc(537);
                                                                     print_delimiter(p+4);
                                                                   End;
                                                               28:
                                                                   Begin
                                                                     print_esc(511);
                                                                     print_fam_and_char(p+4);
                                                                   End;
                                                               30:
                                                                   Begin
                                                                     print_esc(887);
                                                                     print_delimiter(p+1);
                                                                   End;
                                                               31:
                                                                   Begin
                                                                     If mem[p].hh.b1=0 Then
                                                                       print_esc(888)
                                                                     Else print_esc(889);
                                                                     print_delimiter(p+1);
                                                                   End;
                                                             End;
                                                             If mem[p].hh.b0<30 Then
                                                               Begin
                                                                 If mem[p].hh.b1<>0 Then If mem[p].
                                                                                            hh.b1=1
                                                                                           Then
                                                                                           print_esc
                                                                                           (890)
                                                                 Else print_esc(891);
                                                                 print_subsidiary_data(p+1,46);
                                                               End;
                                                             print_subsidiary_data(p+2,94);
                                                             print_subsidiary_data(p+3,95);
                                                           End{:696};
             25:{697:}
                 Begin
                   print_esc(892);
                   If mem[p+1].int=1073741824 Then print(893)
                   Else print_scaled(mem[p+1].int
                     );
                   If (mem[p+4].qqqq.b0<>0)Or(mem[p+4].qqqq.b1<>0)Or(mem[p+4].qqqq.b2<>0)Or(
                      mem[p+4].qqqq.b3<>0)Then
                     Begin
                       print(894);
                       print_delimiter(p+4);
                     End;
                   If (mem[p+5].qqqq.b0<>0)Or(mem[p+5].qqqq.b1<>0)Or(mem[p+5].qqqq.b2<>0)Or(
                      mem[p+5].qqqq.b3<>0)Then
                     Begin
                       print(895);
                       print_delimiter(p+5);
                     End;
                   print_subsidiary_data(p+2,92);
                   print_subsidiary_data(p+3,47);
                 End{:697};
{:690}
             others: print(318)
        End{:183};
      p := mem[p].hh.rh;
    End;
  10:
End;
{:182}{198:}
Procedure show_box(p:halfword);
Begin{236:}
  depth_threshold := eqtb[5293].int;
  breadth_max := eqtb[5292].int{:236};
  If breadth_max<=0 Then breadth_max := 5;
  If pool_ptr+depth_threshold>=pool_size Then depth_threshold := pool_size-
                                                                 pool_ptr-1;
  show_node_list(p);
  print_ln;
End;
{:198}{200:}
Procedure delete_token_ref(p:halfword);
Begin
  If mem[p].hh.lh=0 Then flush_list(p)
  Else mem[p].hh.lh := mem[p].hh.
                       lh-1;
End;{:200}{201:}
Procedure delete_glue_ref(p:halfword);
Begin
  If mem[p].hh.rh=0 Then free_node(p,4)
  Else mem[p].hh.rh := mem[p].hh.
                       rh-1;
End;{:201}{202:}
Procedure flush_node_list(p:halfword);

Label 30;

Var q: halfword;
Begin
  While p<>0 Do
    Begin
      q := mem[p].hh.rh;
      If (p>=hi_mem_min)Then
        Begin
          mem[p].hh.rh := avail;
          avail := p;
{dyn_used:=dyn_used-1;}
        End
      Else
        Begin
          Case mem[p].hh.b0 Of
            0,1,13:
                    Begin
                      flush_node_list(mem[p+5
                                      ].hh.rh);
                      free_node(p,7);
                      goto 30;
                    End;
            2:
               Begin
                 free_node(p,4);
                 goto 30;
               End;
            3:
               Begin
                 flush_node_list(mem[p+4].hh.lh);
                 delete_glue_ref(mem[p+4].hh.rh);
                 free_node(p,5);
                 goto 30;
               End;
            8:{1358:}
               Begin
                 Case mem[p].hh.b1 Of
                   0: free_node(p,3);
                   1,3:
                        Begin
                          delete_token_ref(mem[p+1].hh.rh);
                          free_node(p,2);
                          goto 30;
                        End;
                   2,4: free_node(p,2);
                   others: confusion(1309)
                 End;
                 goto 30;
               End{:1358};
            10:
                Begin
                  Begin
                    If mem[mem[p+1].hh.lh].hh.rh=0 Then free_node(mem[p+1].hh
                                                                  .lh,4)
                    Else mem[mem[p+1].hh.lh].hh.rh := mem[mem[p+1].hh.lh].hh.rh-1;
                  End;
                  If mem[p+1].hh.rh<>0 Then flush_node_list(mem[p+1].hh.rh);
                End;
            11,9,12:;
            6: flush_node_list(mem[p+1].hh.rh);
            4: delete_token_ref(mem[p+1].hh.rh);
            7:
               Begin
                 flush_node_list(mem[p+1].hh.lh);
                 flush_node_list(mem[p+1].hh.rh);
               End;
            5: flush_node_list(mem[p+1].int);{698:}
            14:
                Begin
                  free_node(p,3);
                  goto 30;
                End;
            15:
                Begin
                  flush_node_list(mem[p+1].hh.lh);
                  flush_node_list(mem[p+1].hh.rh);
                  flush_node_list(mem[p+2].hh.lh);
                  flush_node_list(mem[p+2].hh.rh);
                  free_node(p,3);
                  goto 30;
                End;
            16,17,18,19,20,21,22,23,24,27,26,29,28:
                                                    Begin
                                                      If mem[p+1].hh.rh>=2 Then
                                                        flush_node_list(mem[p+1].hh.lh);
                                                      If mem[p+2].hh.rh>=2 Then flush_node_list(mem[
                                                                                                p+2]
                                                                                                .hh.
                                                                                                lh);
                                                      If mem[p+3].hh.rh>=2 Then flush_node_list(mem[
                                                                                                p+3]
                                                                                                .hh.
                                                                                                lh);
                                                      If mem[p].hh.b0=24 Then free_node(p,5)
                                                      Else If mem[p].hh.b0=28 Then
                                                             free_node(p,5)
                                                      Else free_node(p,4);
                                                      goto 30;
                                                    End;
            30,31:
                   Begin
                     free_node(p,4);
                     goto 30;
                   End;
            25:
                Begin
                  flush_node_list(mem[p+2].hh.lh);
                  flush_node_list(mem[p+3].hh.lh);
                  free_node(p,6);
                  goto 30;
                End;
{:698}
            others: confusion(356)
          End;
          free_node(p,2);
          30:
        End;
      p := q;
    End;
End;
{:202}{204:}
Function copy_node_list(p:halfword): halfword;

Var h: halfword;
  q: halfword;
  r: halfword;
  words: 0..5;
Begin
  h := get_avail;
  q := h;
  While p<>0 Do
    Begin{205:}
      words := 1;
      If (p>=hi_mem_min)Then r := get_avail
      Else{206:}Case mem[p].hh.b0 Of
                  0,1,13
                  :
                    Begin
                      r := get_node(7);
                      mem[r+6] := mem[p+6];
                      mem[r+5] := mem[p+5];
                      mem[r+5].hh.rh := copy_node_list(mem[p+5].hh.rh);
                      words := 5;
                    End;
                  2:
                     Begin
                       r := get_node(4);
                       words := 4;
                     End;
                  3:
                     Begin
                       r := get_node(5);
                       mem[r+4] := mem[p+4];
                       mem[mem[p+4].hh.rh].hh.rh := mem[mem[p+4].hh.rh].hh.rh+1;
                       mem[r+4].hh.lh := copy_node_list(mem[p+4].hh.lh);
                       words := 4;
                     End;
                  8:{1357:}Case mem[p].hh.b1 Of
                             0:
                                Begin
                                  r := get_node(3);
                                  words := 3;
                                End;
                             1,3:
                                  Begin
                                    r := get_node(2);
                                    mem[mem[p+1].hh.rh].hh.lh := mem[mem[p+1].hh.rh].hh.lh+1;
                                    words := 2;
                                  End;
                             2,4:
                                  Begin
                                    r := get_node(2);
                                    words := 2;
                                  End;
                             others: confusion(1308)
                     End{:1357};
                  10:
                      Begin
                        r := get_node(2);
                        mem[mem[p+1].hh.lh].hh.rh := mem[mem[p+1].hh.lh].hh.rh+1;
                        mem[r+1].hh.lh := mem[p+1].hh.lh;
                        mem[r+1].hh.rh := copy_node_list(mem[p+1].hh.rh);
                      End;
                  11,9,12:
                           Begin
                             r := get_node(2);
                             words := 2;
                           End;
                  6:
                     Begin
                       r := get_node(2);
                       mem[r+1] := mem[p+1];
                       mem[r+1].hh.rh := copy_node_list(mem[p+1].hh.rh);
                     End;
                  7:
                     Begin
                       r := get_node(2);
                       mem[r+1].hh.lh := copy_node_list(mem[p+1].hh.lh);
                       mem[r+1].hh.rh := copy_node_list(mem[p+1].hh.rh);
                     End;
                  4:
                     Begin
                       r := get_node(2);
                       mem[mem[p+1].hh.rh].hh.lh := mem[mem[p+1].hh.rh].hh.lh+1;
                       words := 2;
                     End;
                  5:
                     Begin
                       r := get_node(2);
                       mem[r+1].int := copy_node_list(mem[p+1].int);
                     End;
                  others: confusion(357)
        End{:206};
      While words>0 Do
        Begin
          words := words-1;
          mem[r+words] := mem[p+words];
        End{:205};
      mem[q].hh.rh := r;
      q := r;
      p := mem[p].hh.rh;
    End;
  mem[q].hh.rh := 0;
  q := mem[h].hh.rh;
  Begin
    mem[h].hh.rh := avail;
    avail := h;{dyn_used:=dyn_used-1;}
  End;
  copy_node_list := q;
End;{:204}{211:}
Procedure print_mode(m:integer);
Begin
  If m>0 Then Case m Div(101) Of
                0: print(358);
                1: print(359);
                2: print(360);
    End
  Else If m=0 Then print(361)
  Else Case (-m)Div(101) Of
         0: print(362);
         1: print(363);
         2: print(346);
    End;
  print(364);
End;
{:211}{216:}
Procedure push_nest;
Begin
  If nest_ptr>max_nest_stack Then
    Begin
      max_nest_stack := nest_ptr;
      If nest_ptr=nest_size Then overflow(365,nest_size);
    End;
  nest[nest_ptr] := cur_list;
  nest_ptr := nest_ptr+1;
  cur_list.head_field := get_avail;
  cur_list.tail_field := cur_list.head_field;
  cur_list.pg_field := 0;
  cur_list.ml_field := line;
  cur_list.eTeX_aux_field := 0;
End;{:216}{217:}
Procedure pop_nest;
Begin
  Begin
    mem[cur_list.head_field].hh.rh := avail;
    avail := cur_list.head_field;{dyn_used:=dyn_used-1;}
  End;
  nest_ptr := nest_ptr-1;
  cur_list := nest[nest_ptr];
End;
{:217}{218:}
Procedure print_totals;
forward;
Procedure show_activities;

Var p: 0..nest_size;
  m: -203..203;
  a: memory_word;
  q,r: halfword;
  t: integer;
Begin
  nest[nest_ptr] := cur_list;
  print_nl(339);
  print_ln;
  For p:=nest_ptr Downto 0 Do
    Begin
      m := nest[p].mode_field;
      a := nest[p].aux_field;
      print_nl(366);
      print_mode(m);
      print(367);
      print_int(abs(nest[p].ml_field));
      If m=102 Then If nest[p].pg_field<>8585216 Then
                      Begin
                        print(368);
                        print_int(nest[p].pg_field Mod 65536);
                        print(369);
                        print_int(nest[p].pg_field Div 4194304);
                        print_char(44);
                        print_int((nest[p].pg_field Div 65536)mod 64);
                        print_char(41);
                      End;
      If nest[p].ml_field<0 Then print(370);
      If p=0 Then
        Begin{986:}
          If 29998<>page_tail Then
            Begin
              print_nl(992);
              If output_active Then print(993);
              show_box(mem[29998].hh.rh);
              If page_contents>0 Then
                Begin
                  print_nl(994);
                  print_totals;
                  print_nl(995);
                  print_scaled(page_so_far[0]);
                  r := mem[30000].hh.rh;
                  While r<>30000 Do
                    Begin
                      print_ln;
                      print_esc(331);
                      t := mem[r].hh.b1-0;
                      print_int(t);
                      print(996);
                      If eqtb[5333+t].int=1000 Then t := mem[r+3].int
                      Else t := x_over_n(mem[r+3].
                                int,1000)*eqtb[5333+t].int;
                      print_scaled(t);
                      If mem[r].hh.b0=1 Then
                        Begin
                          q := 29998;
                          t := 0;
                          Repeat
                            q := mem[q].hh.rh;
                            If (mem[q].hh.b0=3)And(mem[q].hh.b1=mem[r].hh.b1)Then t := t+1;
                          Until q=mem[r+1].hh.lh;
                          print(997);
                          print_int(t);
                          print(998);
                        End;
                      r := mem[r].hh.rh;
                    End;
                End;
            End{:986};
          If mem[29999].hh.rh<>0 Then print_nl(371);
        End;
      show_box(mem[nest[p].head_field].hh.rh);
{219:}
      Case abs(m)Div(101) Of
        0:
           Begin
             print_nl(372);
             If a.int<=-65536000 Then print(373)
             Else print_scaled(a.int);
             If nest[p].pg_field<>0 Then
               Begin
                 print(374);
                 print_int(nest[p].pg_field);
                 print(375);
                 If nest[p].pg_field<>1 Then print_char(115);
               End;
           End;
        1:
           Begin
             print_nl(376);
             print_int(a.hh.lh);
             If m>0 Then If a.hh.rh>0 Then
                           Begin
                             print(377);
                             print_int(a.hh.rh);
                           End;
           End;
        2: If a.int<>0 Then
             Begin
               print(378);
               show_box(a.int);
             End;
      End{:219};
    End;
End;{:218}{237:}
Procedure print_param(n:integer);
Begin
  Case n Of
    0: print_esc(423);
    1: print_esc(424);
    2: print_esc(425);
    3: print_esc(426);
    4: print_esc(427);
    5: print_esc(428);
    6: print_esc(429);
    7: print_esc(430);
    8: print_esc(431);
    9: print_esc(432);
    10: print_esc(433);
    11: print_esc(434);
    12: print_esc(435);
    13: print_esc(436);
    14: print_esc(437);
    15: print_esc(438);
    16: print_esc(439);
    17: print_esc(440);
    18: print_esc(441);
    19: print_esc(442);
    20: print_esc(443);
    21: print_esc(444);
    22: print_esc(445);
    23: print_esc(446);
    24: print_esc(447);
    25: print_esc(448);
    26: print_esc(449);
    27: print_esc(450);
    28: print_esc(451);
    29: print_esc(452);
    30: print_esc(453);
    31: print_esc(454);
    32: print_esc(455);
    33: print_esc(456);
    34: print_esc(457);
    35: print_esc(458);
    36: print_esc(459);
    37: print_esc(460);
    38: print_esc(461);
    39: print_esc(462);
    40: print_esc(463);
    41: print_esc(464);
    42: print_esc(465);
    43: print_esc(466);
    44: print_esc(467);
    45: print_esc(468);
    46: print_esc(469);
    47: print_esc(470);
    48: print_esc(471);
    49: print_esc(472);
    50: print_esc(473);
    51: print_esc(474);
    52: print_esc(475);
    53: print_esc(476);
    54: print_esc(477);
{1390:}
    55: print_esc(1319);
    56: print_esc(1320);
    57: print_esc(1321);
    58: print_esc(1322);
    59: print_esc(1323);
    60: print_esc(1324);
    61: print_esc(1325);
    62: print_esc(1326);
    63: print_esc(1327);
{:1390}{1431:}
    64: print_esc(1366);{:1431}
    others: print(478)
  End;
End;
{:237}{241:}
Procedure fix_date_and_time;
Begin
  sys_time := 12*60;
  sys_day := 4;
  sys_month := 7;
  sys_year := 1776;
  eqtb[5288].int := sys_time;
  eqtb[5289].int := sys_day;
  eqtb[5290].int := sys_month;
  eqtb[5291].int := sys_year;
End;{:241}{245:}
Procedure begin_diagnostic;
Begin
  old_setting := selector;
  If (eqtb[5297].int<=0)And(selector=19)Then
    Begin
      selector := selector-1;
      If history=0 Then history := 1;
    End;
End;
Procedure end_diagnostic(blank_line:boolean);
Begin
  print_nl(339);
  If blank_line Then print_ln;
  selector := old_setting;
End;
{:245}{247:}
Procedure print_length_param(n:integer);
Begin
  Case n Of
    0: print_esc(481);
    1: print_esc(482);
    2: print_esc(483);
    3: print_esc(484);
    4: print_esc(485);
    5: print_esc(486);
    6: print_esc(487);
    7: print_esc(488);
    8: print_esc(489);
    9: print_esc(490);
    10: print_esc(491);
    11: print_esc(492);
    12: print_esc(493);
    13: print_esc(494);
    14: print_esc(495);
    15: print_esc(496);
    16: print_esc(497);
    17: print_esc(498);
    18: print_esc(499);
    19: print_esc(500);
    20: print_esc(501);
    others: print(502)
  End;
End;
{:247}{252:}{298:}
Procedure print_cmd_chr(cmd:quarterword;
                        chr_code:halfword);

Var n: integer;
Begin
  Case cmd Of
    1:
       Begin
         print(564);
         print(chr_code);
       End;
    2:
       Begin
         print(565);
         print(chr_code);
       End;
    3:
       Begin
         print(566);
         print(chr_code);
       End;
    6:
       Begin
         print(567);
         print(chr_code);
       End;
    7:
       Begin
         print(568);
         print(chr_code);
       End;
    8:
       Begin
         print(569);
         print(chr_code);
       End;
    9: print(570);
    10:
        Begin
          print(571);
          print(chr_code);
        End;
    11:
        Begin
          print(572);
          print(chr_code);
        End;
    12:
        Begin
          print(573);
          print(chr_code);
        End;
{227:}
    75,76: If chr_code<2900 Then print_skip_param(chr_code-2882)
           Else If
                   chr_code<3156 Then
                  Begin
                    print_esc(398);
                    print_int(chr_code-2900);
                  End
           Else
             Begin
               print_esc(399);
               print_int(chr_code-3156);
             End;
{:227}{231:}
    72: If chr_code>=3423 Then
          Begin
            print_esc(410);
            print_int(chr_code-3423);
          End
        Else Case chr_code Of
               3413: print_esc(401);
               3414: print_esc(402);
               3415: print_esc(403);
               3416: print_esc(404);
               3417: print_esc(405);
               3418: print_esc(406);
               3419: print_esc(407);
               3420: print_esc(408);{1389:}
               3422: print_esc(1318);
{:1389}
               others: print_esc(409)
          End;
{:231}{239:}
    73: If chr_code<5333 Then print_param(chr_code-5268)
        Else
          Begin
            print_esc(479);
            print_int(chr_code-5333);
          End;
{:239}{249:}
    74: If chr_code<5866 Then print_length_param(chr_code-5845)
        Else
          Begin
            print_esc(503);
            print_int(chr_code-5866);
          End;
{:249}{266:}
    45: print_esc(511);
    90: print_esc(512);
    40: print_esc(513);
    41: print_esc(514);
    77: print_esc(522);
    61: print_esc(515);
    42: print_esc(535);
    16: print_esc(516);
    107: print_esc(507);
    88: print_esc(521);
    15: print_esc(517);
    92: print_esc(518);
    67: print_esc(508);
    62: print_esc(519);
    64: print_esc(32);
    102: If chr_code=0 Then print_esc(520){1498:}
         Else print_esc(784){:1498};
    32: print_esc(523);
    36: print_esc(524);
    39: print_esc(525);
    37: print_esc(331);
    44: print_esc(47);
    18:
        Begin
          print_esc(354);
          If chr_code>0 Then print_char(115);
        End;
    46: print_esc(526);
    17: print_esc(527);
    54: print_esc(528);
    91: print_esc(529);
    34: print_esc(530);
    65: print_esc(531);
    103: print_esc(532);
    55: print_esc(336);
    63: print_esc(533);
    66: print_esc(537);
    96: If chr_code=0 Then print_esc(538){1495:}
        Else print_esc(1381){:1495};
    0: print_esc(539);
    98: print_esc(540);
    80: print_esc(536);
    84: Case chr_code Of
          3412: print_esc(534);{1600:}
          3679: print_esc(1415);
          3680: print_esc(1416);
          3681: print_esc(1417);
          3682: print_esc(1418);
{:1600}
        End;
    109: If chr_code=0 Then print_esc(541){1418:}
         Else If chr_code=1 Then
                print_esc(1356)
         Else print_esc(1357){:1418};
    71:{1568:}
        Begin
          print_esc(410);
          If chr_code<>0 Then print_sa_num(chr_code);
        End{:1568};
    38: print_esc(355);
    33: If chr_code=0 Then print_esc(542){1433:}
        Else Case chr_code Of
               6:
                  print_esc(1367);
               7: print_esc(1368);
               10: print_esc(1369);
               others: print_esc(1370)
          End{:1433};
    56: print_esc(543);
    35: print_esc(544);
{:266}{335:}
    13: print_esc(606);
{:335}{377:}
    104: If chr_code=0 Then print_esc(638){1483:}
         Else If chr_code
                 =2 Then print_esc(1379){:1483}
         Else print_esc(639);
{:377}{385:}
    110:
         Begin
           Case (chr_code Mod 5) Of
             1: print_esc(641);
             2: print_esc(642);
             3: print_esc(643);
             4: print_esc(644);
             others: print_esc(640)
           End;
           If chr_code>=5 Then print_char(115);
         End;
{:385}{412:}
    89:{1567:}
        Begin
          If (chr_code<0)Or(chr_code>19)Then cmd := (mem[
                                                    chr_code].hh.b0 Div 16)
          Else
            Begin
              cmd := chr_code-0;
              chr_code := 0;
            End;
          If cmd=0 Then print_esc(479)
          Else If cmd=1 Then print_esc(503)
          Else If cmd
                  =2 Then print_esc(398)
          Else print_esc(399);
          If chr_code<>0 Then print_sa_num(chr_code);
        End{:1567};
{:412}{417:}
    79: If chr_code=1 Then print_esc(678)
        Else print_esc(677);
    82: If chr_code=0 Then print_esc(679){1424:}
        Else If chr_code=2 Then
               print_esc(1362){:1424}
        Else print_esc(680);
    83: If chr_code=1 Then print_esc(681)
        Else If chr_code=3 Then print_esc(
                                          682)
        Else print_esc(683);
    70: Case chr_code Of
          0: print_esc(684);
          1: print_esc(685);
          2: print_esc(686);
          4: print_esc(687);
{1381:}
          3: print_esc(1315);
          6: print_esc(1316);
{:1381}{1395:}
          7: print_esc(1341);
          8: print_esc(1342);
{:1395}{1398:}
          9: print_esc(1343);
          10: print_esc(1344);
          11: print_esc(1345);
{:1398}{1401:}
          14: print_esc(1346);
          15: print_esc(1347);
          16: print_esc(1348);
          17: print_esc(1349);{:1401}{1404:}
          18: print_esc(1350);
          19: print_esc(1351);
          20: print_esc(1352);{:1404}{1514:}
          25: print_esc(1390);
          26: print_esc(1391);
          27: print_esc(1392);
          28: print_esc(1393);{:1514}{1537:}
          12: print_esc(1398);
          13: print_esc(1399);
          21: print_esc(1400);
          22: print_esc(1401);
{:1537}{1541:}
          23: print_esc(1402);
          24: print_esc(1403);
{:1541}
          others: print_esc(688)
        End;
{:417}{469:}
    108: Case chr_code Of
           0: print_esc(744);
           1: print_esc(745);
           2: print_esc(746);
           3: print_esc(747);
           4: print_esc(748);
           5: print_esc(750);
           others: print_esc(749)
         End;
{:469}{488:}
    105:
         Begin
           If chr_code>=32 Then print_esc(784);
           Case chr_code Mod 32 Of
             1: print_esc(768);
             2: print_esc(769);
             3: print_esc(770);
             4: print_esc(771);
             5: print_esc(772);
             6: print_esc(773);
             7: print_esc(774);
             8: print_esc(775);
             9: print_esc(776);
             10: print_esc(777);
             11: print_esc(778);
             12: print_esc(779);
             13: print_esc(780);
             14: print_esc(781);
             15: print_esc(782);
             16: print_esc(783);{1499:}
             17: print_esc(1382);
             18: print_esc(1383);
             19: print_esc(1384);{:1499}
             others: print_esc(767)
           End;
         End;
{:488}{492:}
    106: If chr_code=2 Then print_esc(785)
         Else If chr_code=4 Then
                print_esc(786)
         Else print_esc(787);
{:492}{781:}
    4: If chr_code=256 Then print_esc(910)
       Else
         Begin
           print(914);
           print(chr_code);
         End;
    5: If chr_code=257 Then print_esc(911)
       Else print_esc(912);
{:781}{984:}
    81: Case chr_code Of
          0: print_esc(982);
          1: print_esc(983);
          2: print_esc(984);
          3: print_esc(985);
          4: print_esc(986);
          5: print_esc(987);
          6: print_esc(988);
          others: print_esc(989)
        End;
{:984}{1053:}
    14: If chr_code=1 Then print_esc(1037)
        Else print_esc(344);
{:1053}{1059:}
    26: Case chr_code Of
          4: print_esc(1038);
          0: print_esc(1039);
          1: print_esc(1040);
          2: print_esc(1041);
          others: print_esc(1042)
        End;
    27: Case chr_code Of
          4: print_esc(1043);
          0: print_esc(1044);
          1: print_esc(1045);
          2: print_esc(1046);
          others: print_esc(1047)
        End;
    28: print_esc(337);
    29: print_esc(341);
    30: print_esc(343);
{:1059}{1072:}
    21: If chr_code=1 Then print_esc(1065)
        Else print_esc(1066);
    22: If chr_code=1 Then print_esc(1067)
        Else print_esc(1068);
    20: Case chr_code Of
          0: print_esc(412);
          1: print_esc(1069);
          2: print_esc(1070);
          3: print_esc(977);
          4: print_esc(1071);
          5: print_esc(979);
          others: print_esc(1072)
        End;
    31: If chr_code=100 Then print_esc(1074)
        Else If chr_code=101 Then
               print_esc(1075)
        Else If chr_code=102 Then print_esc(1076)
        Else print_esc(
                       1073);
{:1072}{1089:}
    43: If chr_code=0 Then print_esc(1093)
        Else print_esc(1092);
{:1089}{1108:}
    25: If chr_code=10 Then print_esc(1104)
        Else If chr_code=11
               Then print_esc(1103)
        Else print_esc(1102);
    23: If chr_code=1 Then print_esc(1106)
        Else print_esc(1105);
    24: If chr_code=1 Then print_esc(1108){1597:}
        Else If chr_code=2 Then
               print_esc(1413)
        Else If chr_code=3 Then print_esc(1414){:1597}
        Else
          print_esc(1107);
{:1108}{1115:}
    47: If chr_code=1 Then print_esc(45)
        Else print_esc(352);
{:1115}{1143:}
    48: If chr_code=1 Then print_esc(1140)
        Else print_esc(1139);
{:1143}{1157:}
    50: Case chr_code Of
          16: print_esc(877);
          17: print_esc(878);
          18: print_esc(879);
          19: print_esc(880);
          20: print_esc(881);
          21: print_esc(882);
          22: print_esc(883);
          23: print_esc(884);
          26: print_esc(886);
          others: print_esc(885)
        End;
    51: If chr_code=1 Then print_esc(890)
        Else If chr_code=2 Then print_esc(
                                          891)
        Else print_esc(1141);{:1157}{1170:}
    53: print_style(chr_code);
{:1170}{1179:}
    52: Case chr_code Of
          1: print_esc(1160);
          2: print_esc(1161);
          3: print_esc(1162);
          4: print_esc(1163);
          5: print_esc(1164);
          others: print_esc(1159)
        End;
{:1179}{1189:}
    49: If chr_code=30 Then print_esc(887){1429:}
        Else If
                chr_code=1 Then print_esc(889){:1429}
        Else print_esc(888);
{:1189}{1209:}
    93: If chr_code=1 Then print_esc(1184)
        Else If chr_code=2
               Then print_esc(1185){1506:}
        Else If chr_code=8 Then print_esc(1198)
{:1506}
        Else print_esc(1186);
    97: If chr_code=0 Then print_esc(1187)
        Else If chr_code=1 Then print_esc(
                                          1188)
        Else If chr_code=2 Then print_esc(1189)
        Else print_esc(1190);
{:1209}{1220:}
    94: If chr_code<>0 Then print_esc(1208)
        Else print_esc(1207)
    ;{:1220}{1223:}
    95: Case chr_code Of
          0: print_esc(1209);
          1: print_esc(1210);
          2: print_esc(1211);
          3: print_esc(1212);
          4: print_esc(1213);
          5: print_esc(1214);
          others: print_esc(1215)
        End;
    68:
        Begin
          print_esc(516);
          print_hex(chr_code);
        End;
    69:
        Begin
          print_esc(527);
          print_hex(chr_code);
        End;
{:1223}{1231:}
    85: If chr_code=3988 Then print_esc(418)
        Else If chr_code=
                5012 Then print_esc(422)
        Else If chr_code=4244 Then print_esc(419)
        Else If
                chr_code=4500 Then print_esc(420)
        Else If chr_code=4756 Then print_esc(
                                             421)
        Else print_esc(480);
    86: print_size(chr_code-3940);
{:1231}{1251:}
    99: If chr_code=1 Then print_esc(965)
        Else print_esc(953);
{:1251}{1255:}
    78: If chr_code=0 Then print_esc(1233)
        Else print_esc(1234);
{:1255}{1261:}
    87:
        Begin
          print(1242);
          slow_print(font_name[chr_code]);
          If font_size[chr_code]<>font_dsize[chr_code]Then
            Begin
              print(751);
              print_scaled(font_size[chr_code]);
              print(400);
            End;
        End;
{:1261}{1263:}
    100: Case chr_code Of
           0: print_esc(275);
           1: print_esc(276);
           2: print_esc(277);
           others: print_esc(1243)
         End;
{:1263}{1273:}
    60: If chr_code=0 Then print_esc(1245)
        Else print_esc(1244);
{:1273}{1278:}
    58: If chr_code=0 Then print_esc(1246)
        Else print_esc(1247);
{:1278}{1287:}
    57: If chr_code=4244 Then print_esc(1253)
        Else print_esc(
                       1254);{:1287}{1292:}
    19: Case chr_code Of
          1: print_esc(1256);
          2: print_esc(1257);
          3: print_esc(1258);{1407:}
          4: print_esc(1353);
{:1407}{1416:}
          5: print_esc(1355);{:1416}{1421:}
          6: print_esc(1358);
{:1421}
          others: print_esc(1255)
        End;{:1292}{1295:}
    101: print(1265);
    111,112,113,114:
                     Begin
                       n := cmd-111;
                       If mem[mem[chr_code].hh.rh].hh.lh=3585 Then n := n+4;
                       If odd(n Div 4)Then print_esc(1198);
                       If odd(n)Then print_esc(1184);
                       If odd(n Div 2)Then print_esc(1185);
                       If n>0 Then print_char(32);
                       print(1266);
                     End;
    115: print_esc(1267);
{:1295}{1346:}
    59: Case chr_code Of
          0: print_esc(1299);
          1: print_esc(603);
          2: print_esc(1300);
          3: print_esc(1301);
          4: print_esc(1302);
          5: print_esc(1303);
          others: print(1304)
        End;{:1346}
    others: print(574)
  End;
End;
{:298}
{procedure show_eqtb(n:halfword);
begin if n<1 then print_char(63)else if n<2882 then[223:]begin sprint_cs
(n);print_char(61);print_cmd_chr(eqtb[n].hh.b0,eqtb[n].hh.rh);
if eqtb[n].hh.b0>=111 then begin print_char(58);
show_token_list(mem[eqtb[n].hh.rh].hh.rh,0,32);end;
end[:223]else if n<3412 then[229:]if n<2900 then begin print_skip_param(
n-2882);print_char(61);
if n<2897 then print_spec(eqtb[n].hh.rh,400)else print_spec(eqtb[n].hh.
rh,338);end else if n<3156 then begin print_esc(398);print_int(n-2900);
print_char(61);print_spec(eqtb[n].hh.rh,400);
end else begin print_esc(399);print_int(n-3156);print_char(61);
print_spec(eqtb[n].hh.rh,338);
end[:229]else if n<5268 then[233:]if(n=3412)or((n>=3679)and(n<3683))then
begin print_cmd_chr(84,n);print_char(61);
if eqtb[n].hh.rh=0 then print_char(48)else if n>3412 then begin
print_int(mem[eqtb[n].hh.rh+1].int);print_char(32);
print_int(mem[eqtb[n].hh.rh+2].int);
if mem[eqtb[n].hh.rh+1].int>1 then print_esc(411);
end else print_int(mem[eqtb[3412].hh.rh].hh.lh);
end else if n<3423 then begin print_cmd_chr(72,n);print_char(61);
if eqtb[n].hh.rh<>0 then show_token_list(mem[eqtb[n].hh.rh].hh.rh,0,32);
end else if n<3683 then begin print_esc(410);print_int(n-3423);
print_char(61);
if eqtb[n].hh.rh<>0 then show_token_list(mem[eqtb[n].hh.rh].hh.rh,0,32);
end else if n<3939 then begin print_esc(412);print_int(n-3683);
print_char(61);
if eqtb[n].hh.rh=0 then print(413)else begin depth_threshold:=0;
breadth_max:=1;show_node_list(eqtb[n].hh.rh);end;
end else if n<3988 then[234:]begin if n=3939 then print(414)else if n<
3956 then begin print_esc(415);print_int(n-3940);
end else if n<3972 then begin print_esc(416);print_int(n-3956);
end else begin print_esc(417);print_int(n-3972);end;print_char(61);
print_esc(hash[2624+eqtb[n].hh.rh].rh);
end[:234]else[235:]if n<5012 then begin if n<4244 then begin print_esc(
418);print_int(n-3988);end else if n<4500 then begin print_esc(419);
print_int(n-4244);end else if n<4756 then begin print_esc(420);
print_int(n-4500);end else begin print_esc(421);print_int(n-4756);end;
print_char(61);print_int(eqtb[n].hh.rh);end else begin print_esc(422);
print_int(n-5012);print_char(61);print_int(eqtb[n].hh.rh-0);
end[:235][:233]else if n<5845 then[242:]begin if n<5333 then print_param
(n-5268)else if n<5589 then begin print_esc(479);print_int(n-5333);
end else begin print_esc(480);print_int(n-5589);end;print_char(61);
print_int(eqtb[n].int);
end[:242]else if n<=6121 then[251:]begin if n<5866 then
print_length_param(n-5845)else begin print_esc(503);print_int(n-5866);
end;print_char(61);print_scaled(eqtb[n].int);print(400);
end[:251]else print_char(63);end;}
{:252}{259:}
Function id_lookup(j,l:integer): halfword;

Label 40;

Var h: integer;
  d: integer;
  p: halfword;
  k: halfword;
Begin{261:}
  h := buffer[j];
  For k:=j+1 To j+l-1 Do
    Begin
      h := h+h+buffer[k];
      While h>=1777 Do
        h := h-1777;
    End{:261};
  p := h+514;
  While true Do
    Begin
      If hash[p].rh>0 Then If (str_start[hash[p].rh+1]-
                              str_start[hash[p].rh])=l Then If str_eq_buf(hash[p].rh,j)Then goto 40;
      If hash[p].lh=0 Then
        Begin
          If no_new_control_sequence Then p := 2881
          Else
{260:}
            Begin
              If hash[p].rh>0 Then
                Begin
                  Repeat
                    If (hash_used=514)Then
                      overflow(506,2100);
                    hash_used := hash_used-1;
                  Until hash[hash_used].rh=0;
                  hash[p].lh := hash_used;
                  p := hash_used;
                End;
              Begin
                If pool_ptr+l>pool_size Then overflow(258,pool_size-init_pool_ptr)
                ;
              End;
              d := (pool_ptr-str_start[str_ptr]);
              While pool_ptr>str_start[str_ptr] Do
                Begin
                  pool_ptr := pool_ptr-1;
                  str_pool[pool_ptr+l] := str_pool[pool_ptr];
                End;
              For k:=j To j+l-1 Do
                Begin
                  str_pool[pool_ptr] := buffer[k];
                  pool_ptr := pool_ptr+1;
                End;
              hash[p].rh := make_string;
              pool_ptr := pool_ptr+d;
{cs_count:=cs_count+1;}
            End{:260};
          goto 40;
        End;
      p := hash[p].lh;
    End;
  40: id_lookup := p;
End;{:259}{264:}
Procedure primitive(s:str_number;
                    c:quarterword;o:halfword);

Var k: pool_pointer;
  j: 0..buf_size;
  l: small_number;
Begin
  If s<256 Then cur_val := s+257
  Else
    Begin
      k := str_start[s];
      l := str_start[s+1]-k;
      If first+l>buf_size+1 Then overflow(257,buf_size);
      For j:=0 To l-1 Do
        buffer[first+j] := str_pool[k+j];
      cur_val := id_lookup(first,l);
      Begin
        str_ptr := str_ptr-1;
        pool_ptr := str_start[str_ptr];
      End;
      hash[cur_val].rh := s;
    End;
  eqtb[cur_val].hh.b1 := 1;
  eqtb[cur_val].hh.b0 := c;
  eqtb[cur_val].hh.rh := o;
End;{:264}{268:}{284:}
{procedure restore_trace(p:halfword;s:str_number);
begin begin_diagnostic;print_char(123);print(s);print_char(32);
show_eqtb(p);print_char(125);end_diagnostic(false);end;}
{:284}{1392:}
Procedure print_group(e:boolean);

Label 10;
Begin
  Case cur_group Of
    0:
       Begin
         print(1328);
         goto 10;
       End;
    1,14:
          Begin
            If cur_group=14 Then print(1329);
            print(1330);
          End;
    2,3:
         Begin
           If cur_group=3 Then print(1331);
           print(1072);
         End;
    4: print(979);
    5: print(1071);
    6,7:
         Begin
           If cur_group=7 Then print(1332);
           print(1333);
         End;
    8: print(401);
    10: print(1334);
    11: print(331);
    12: print(543);
    9,13,15,16:
                Begin
                  print(346);
                  If cur_group=13 Then print(1335)
                  Else If cur_group=15 Then print(1336)
                  Else If cur_group=16 Then print(1337);
                End;
  End;
  print(1338);
  print_int(cur_level-0);
  print_char(41);
  If save_stack[save_ptr-1].int<>0 Then
    Begin
      If e Then print(367)
      Else
        print(267);
      print_int(save_stack[save_ptr-1].int);
    End;
  10:
End;
{:1392}{1393:}
{procedure group_trace(e:boolean);begin begin_diagnostic;
print_char(123);if e then print(1339)else print(1340);print_group(e);
print_char(125);end_diagnostic(false);end;}
{:1393}{1491:}
Function pseudo_input: boolean;

Var p: halfword;
  sz: integer;
  w: four_quarters;
  r: halfword;
Begin
  last := first;
  p := mem[pseudo_files].hh.lh;
  If p=0 Then pseudo_input := false
  Else
    Begin
      mem[pseudo_files].hh.lh := mem[
                                 p].hh.rh;
      sz := mem[p].hh.lh-0;
      If 4*sz-3>=buf_size-last Then{35:}If format_ident=0 Then
                                          Begin
                                            write_ln(
                                                     term_out,'Buffer size exceeded!');
                                            goto 9999;
                                          End
      Else
        Begin
          cur_input.loc_field := first;
          cur_input.limit_field := last-1;
          overflow(257,buf_size);
        End{:35};
      last := first;
      For r:=p+1 To p+sz-1 Do
        Begin
          w := mem[r].qqqq;
          buffer[last] := w.b0;
          buffer[last+1] := w.b1;
          buffer[last+2] := w.b2;
          buffer[last+3] := w.b3;
          last := last+4;
        End;
      If last>=max_buf_stack Then max_buf_stack := last+1;
      While (last>first)And(buffer[last-1]=32) Do
        last := last-1;
      free_node(p,sz);
      pseudo_input := true;
    End;
End;{:1491}{1492:}
Procedure pseudo_close;

Var p,q: halfword;
Begin
  p := mem[pseudo_files].hh.rh;
  q := mem[pseudo_files].hh.lh;
  Begin
    mem[pseudo_files].hh.rh := avail;
    avail := pseudo_files;{dyn_used:=dyn_used-1;}
  End;
  pseudo_files := p;
  While q<>0 Do
    Begin
      p := q;
      q := mem[p].hh.rh;
      free_node(p,mem[p].hh.lh-0);
    End;
End;{:1492}{1509:}
Procedure group_warning;

Var i: 0..max_in_open;
  w: boolean;
Begin
  base_ptr := input_ptr;
  input_stack[base_ptr] := cur_input;
  i := in_open;
  w := false;
  While (grp_stack[i]=cur_boundary)And(i>0) Do
    Begin{1510:}
      If eqtb[5327].int
         >0 Then
        Begin
          While (input_stack[base_ptr].state_field=0)Or(input_stack[
                base_ptr].index_field>i) Do
            base_ptr := base_ptr-1;
          If input_stack[base_ptr].name_field>17 Then w := true;
        End{:1510};
      grp_stack[i] := save_stack[save_ptr].hh.rh;
      i := i-1;
    End;
  If w Then
    Begin
      print_nl(1386);
      print_group(true);
      print(1387);
      print_ln;
      If eqtb[5327].int>1 Then show_context;
      If history=0 Then history := 1;
    End;
End;{:1509}{1511:}
Procedure if_warning;

Var i: 0..max_in_open;
  w: boolean;
Begin
  base_ptr := input_ptr;
  input_stack[base_ptr] := cur_input;
  i := in_open;
  w := false;
  While if_stack[i]=cond_ptr Do
    Begin{1510:}
      If eqtb[5327].int>0 Then
        Begin
          While (input_stack[base_ptr].state_field=0)Or(input_stack[base_ptr].
                index_field>i) Do
            base_ptr := base_ptr-1;
          If input_stack[base_ptr].name_field>17 Then w := true;
        End{:1510};
      if_stack[i] := mem[cond_ptr].hh.rh;
      i := i-1;
    End;
  If w Then
    Begin
      print_nl(1386);
      print_cmd_chr(105,cur_if);
      If if_line<>0 Then
        Begin
          print(1359);
          print_int(if_line);
        End;
      print(1387);
      print_ln;
      If eqtb[5327].int>1 Then show_context;
      If history=0 Then history := 1;
    End;
End;
{:1511}{1512:}
Procedure file_warning;

Var p: halfword;
  l: quarterword;
  c: quarterword;
  i: integer;
Begin
  p := save_ptr;
  l := cur_level;
  c := cur_group;
  save_ptr := cur_boundary;
  While grp_stack[in_open]<>save_ptr Do
    Begin
      cur_level := cur_level-1;
      print_nl(1388);
      print_group(true);
      print(1389);
      cur_group := save_stack[save_ptr].hh.b1;
      save_ptr := save_stack[save_ptr].hh.rh
    End;
  save_ptr := p;
  cur_level := l;
  cur_group := c;
  p := cond_ptr;
  l := if_limit;
  c := cur_if;
  i := if_line;
  While if_stack[in_open]<>cond_ptr Do
    Begin
      print_nl(1388);
      print_cmd_chr(105,cur_if);
      If if_limit=2 Then print_esc(787);
      If if_line<>0 Then
        Begin
          print(1359);
          print_int(if_line);
        End;
      print(1389);
      if_line := mem[cond_ptr+1].int;
      cur_if := mem[cond_ptr].hh.b1;
      if_limit := mem[cond_ptr].hh.b0;
      cond_ptr := mem[cond_ptr].hh.rh;
    End;
  cond_ptr := p;
  if_limit := l;
  cur_if := c;
  if_line := i;
  print_ln;
  If eqtb[5327].int>1 Then show_context;
  If history=0 Then history := 1;
End;
{:1512}{1556:}
Procedure delete_sa_ref(q:halfword);

Label 10;

Var p: halfword;
  i: small_number;
  s: small_number;
Begin
  mem[q+1].hh.lh := mem[q+1].hh.lh-1;
  If mem[q+1].hh.lh<>0 Then goto 10;
  If mem[q].hh.b0<32 Then If mem[q+2].int=0 Then s := 3
  Else goto 10
  Else
    Begin
      If mem[q].hh.b0<64 Then If mem[q+1].hh.rh=0 Then delete_glue_ref(0
                                )
      Else goto 10
      Else If mem[q+1].hh.rh<>0 Then goto 10;
      s := 2;
    End;
  Repeat
    i := mem[q].hh.b0 Mod 16;
    p := q;
    q := mem[p].hh.rh;
    free_node(p,s);
    If q=0 Then
      Begin
        sa_root[i] := 0;
        goto 10;
      End;
    Begin
      If odd(i)Then mem[q+(i Div 2)+1].hh.rh := 0
      Else mem[q+(i Div 2)+1].
        hh.lh := 0;
      mem[q].hh.b1 := mem[q].hh.b1-1;
    End;
    s := 9;
  Until mem[q].hh.b1>0;
  10:
End;{:1556}{1558:}
{procedure show_sa(p:halfword;s:str_number);
var t:small_number;begin begin_diagnostic;print_char(123);print(s);
print_char(32);
if p=0 then print_char(63)else begin t:=(mem[p].hh.b0 div 16);
if t<4 then print_cmd_chr(89,p)else if t=4 then begin print_esc(412);
print_sa_num(p);
end else if t=5 then print_cmd_chr(71,p)else print_char(63);
print_char(61);
if t=0 then print_int(mem[p+2].int)else if t=1 then begin print_scaled(
mem[p+2].int);print(400);end else begin p:=mem[p+1].hh.rh;
if t=2 then print_spec(p,400)else if t=3 then print_spec(p,338)else if t
=4 then if p=0 then print(413)else begin depth_threshold:=0;
breadth_max:=1;show_node_list(p);
end else if t=5 then begin if p<>0 then show_token_list(mem[p].hh.rh,0,
32);end else print_char(63);end;end;print_char(125);
end_diagnostic(false);end;}
{:1558}{1572:}
Procedure sa_save(p:halfword);

Var q: halfword;
  i: quarterword;
Begin
  If cur_level<>sa_level Then
    Begin
      If save_ptr>max_save_stack Then
        Begin
          max_save_stack := save_ptr;
          If max_save_stack>save_size-7 Then overflow(545,save_size);
        End;
      save_stack[save_ptr].hh.b0 := 4;
      save_stack[save_ptr].hh.b1 := sa_level;
      save_stack[save_ptr].hh.rh := sa_chain;
      save_ptr := save_ptr+1;
      sa_chain := 0;
      sa_level := cur_level;
    End;
  i := mem[p].hh.b0;
  If i<32 Then
    Begin
      If mem[p+2].int=0 Then
        Begin
          q := get_node(2);
          i := 96;
        End
      Else
        Begin
          q := get_node(3);
          mem[q+2].int := mem[p+2].int;
        End;
      mem[q+1].hh.rh := 0;
    End
  Else
    Begin
      q := get_node(2);
      mem[q+1].hh.rh := mem[p+1].hh.rh;
    End;
  mem[q+1].hh.lh := p;
  mem[q].hh.b0 := i;
  mem[q].hh.b1 := mem[p].hh.b1;
  mem[q].hh.rh := sa_chain;
  sa_chain := q;
  mem[p+1].hh.lh := mem[p+1].hh.lh+1;
End;
{:1572}{1573:}
Procedure sa_destroy(p:halfword);
Begin
  If mem[p].hh.b0<64 Then delete_glue_ref(mem[p+1].hh.rh)
  Else If mem
          [p+1].hh.rh<>0 Then If mem[p].hh.b0<80 Then flush_node_list(mem[p+1].hh.
                                                                      rh)
  Else delete_token_ref(mem[p+1].hh.rh);
End;
{:1573}{1574:}
Procedure sa_def(p:halfword;e:halfword);
Begin
  mem[p+1].hh.lh := mem[p+1].hh.lh+1;
  If mem[p+1].hh.rh=e Then
    Begin{if eqtb[5323].int>0 then show_sa(p,547);}
      sa_destroy(p);
    End
  Else
    Begin{if eqtb[5323].int>0 then show_sa(p,548);}
      If mem[p].hh.b1=cur_level Then sa_destroy(p)
      Else sa_save(p);
      mem[p].hh.b1 := cur_level;
      mem[p+1].hh.rh := e;
{if eqtb[5323].int>0 then show_sa(p,549);}
    End;
  delete_sa_ref(p);
End;
Procedure sa_w_def(p:halfword;w:integer);
Begin
  mem[p+1].hh.lh := mem[p+1].hh.lh+1;
  If mem[p+2].int=w Then
    Begin{if eqtb[5323].int>0 then show_sa(p,547);}
    End
  Else
    Begin{if eqtb[5323].int>0 then show_sa(p,548);}
      If mem[p].hh.b1<>cur_level Then sa_save(p);
      mem[p].hh.b1 := cur_level;
      mem[p+2].int := w;{if eqtb[5323].int>0 then show_sa(p,549);}
    End;
  delete_sa_ref(p);
End;{:1574}{1575:}
Procedure gsa_def(p:halfword;
                  e:halfword);
Begin
  mem[p+1].hh.lh := mem[p+1].hh.lh+1;
{if eqtb[5323].int>0 then show_sa(p,550);}
  sa_destroy(p);
  mem[p].hh.b1 := 1;
  mem[p+1].hh.rh := e;{if eqtb[5323].int>0 then show_sa(p,549);}
  delete_sa_ref(p);
End;
Procedure gsa_w_def(p:halfword;w:integer);
Begin
  mem[p+1].hh.lh := mem[p+1].hh.lh+1;
{if eqtb[5323].int>0 then show_sa(p,550);}
  mem[p].hh.b1 := 1;
  mem[p+2].int := w;{if eqtb[5323].int>0 then show_sa(p,549);}
  delete_sa_ref(p);
End;{:1575}{1576:}
Procedure sa_restore;

Var p: halfword;
Begin
  Repeat
    p := mem[sa_chain+1].hh.lh;
    If mem[p].hh.b1=1 Then
      Begin
        If mem[p].hh.b0>=32 Then sa_destroy(
                                            sa_chain);{if eqtb[5305].int>0 then show_sa(p,552);}
      End
    Else
      Begin
        If mem[p].hh.b0<32 Then If mem[sa_chain].hh.b0<32 Then
                                  mem[p+2].int := mem[sa_chain+2].int
        Else mem[p+2].int := 0
        Else
          Begin
            sa_destroy(p);
            mem[p+1].hh.rh := mem[sa_chain+1].hh.rh;
          End;
        mem[p].hh.b1 := mem[sa_chain].hh.b1;
{if eqtb[5305].int>0 then show_sa(p,553);}
      End;
    delete_sa_ref(p);
    p := sa_chain;
    sa_chain := mem[p].hh.rh;
    If mem[p].hh.b0<32 Then free_node(p,3)
    Else free_node(p,2);
  Until sa_chain=0;
End;
{:1576}{:268}{274:}
Procedure new_save_level(c:group_code);
Begin
  If save_ptr>max_save_stack Then
    Begin
      max_save_stack := save_ptr;
      If max_save_stack>save_size-7 Then overflow(545,save_size);
    End;
  If (eTeX_mode=1)Then
    Begin
      save_stack[save_ptr+0].int := line;
      save_ptr := save_ptr+1;
    End;
  save_stack[save_ptr].hh.b0 := 3;
  save_stack[save_ptr].hh.b1 := cur_group;
  save_stack[save_ptr].hh.rh := cur_boundary;
  If cur_level=255 Then overflow(546,255);
  cur_boundary := save_ptr;
  cur_group := c;{if eqtb[5324].int>0 then group_trace(false);}
  cur_level := cur_level+1;
  save_ptr := save_ptr+1;
End;
{:274}{275:}
Procedure eq_destroy(w:memory_word);

Var q: halfword;
Begin
  Case w.hh.b0 Of
    111,112,113,114: delete_token_ref(w.hh.rh);
    117: delete_glue_ref(w.hh.rh);
    118:
         Begin
           q := w.hh.rh;
           If q<>0 Then free_node(q,mem[q].hh.lh+mem[q].hh.lh+1);
         End;
    119: flush_node_list(w.hh.rh);
{1569:}
    71,89: If (w.hh.rh<0)Or(w.hh.rh>19)Then delete_sa_ref(w.hh.rh);
{:1569}
    others:
  End;
End;{:275}{276:}
Procedure eq_save(p:halfword;
                  l:quarterword);
Begin
  If save_ptr>max_save_stack Then
    Begin
      max_save_stack := save_ptr;
      If max_save_stack>save_size-7 Then overflow(545,save_size);
    End;
  If l=0 Then save_stack[save_ptr].hh.b0 := 1
  Else
    Begin
      save_stack[save_ptr
      ] := eqtb[p];
      save_ptr := save_ptr+1;
      save_stack[save_ptr].hh.b0 := 0;
    End;
  save_stack[save_ptr].hh.b1 := l;
  save_stack[save_ptr].hh.rh := p;
  save_ptr := save_ptr+1;
End;{:276}{277:}
Procedure eq_define(p:halfword;
                    t:quarterword;e:halfword);

Label 10;
Begin
  If (eTeX_mode=1)And(eqtb[p].hh.b0=t)And(eqtb[p].hh.rh=e)Then
    Begin{
if eqtb[5323].int>0 then restore_trace(p,547);}
      eq_destroy(eqtb[p]);
      goto 10;
    End;{if eqtb[5323].int>0 then restore_trace(p,548);}
  If eqtb[p].hh.b1=cur_level Then eq_destroy(eqtb[p])
  Else If cur_level>1
         Then eq_save(p,eqtb[p].hh.b1);
  eqtb[p].hh.b1 := cur_level;
  eqtb[p].hh.b0 := t;
  eqtb[p].hh.rh := e;{if eqtb[5323].int>0 then restore_trace(p,549);}
  10:
End;
{:277}{278:}
Procedure eq_word_define(p:halfword;w:integer);

Label 10;
Begin
  If (eTeX_mode=1)And(eqtb[p].int=w)Then
    Begin{if eqtb[5323].int>0
then restore_trace(p,547);}
      goto 10;
    End;
{if eqtb[5323].int>0 then restore_trace(p,548);}
  If xeq_level[p]<>cur_level Then
    Begin
      eq_save(p,xeq_level[p]);
      xeq_level[p] := cur_level;
    End;
  eqtb[p].int := w;
{if eqtb[5323].int>0 then restore_trace(p,549);}
  10:
End;
{:278}{279:}
Procedure geq_define(p:halfword;t:quarterword;e:halfword);
Begin{if eqtb[5323].int>0 then restore_trace(p,550);}
  Begin
    eq_destroy(eqtb[p]);
    eqtb[p].hh.b1 := 1;
    eqtb[p].hh.b0 := t;
    eqtb[p].hh.rh := e;
  End;{if eqtb[5323].int>0 then restore_trace(p,549);}
End;
Procedure geq_word_define(p:halfword;w:integer);
Begin{if eqtb[5323].int>0 then restore_trace(p,550);}
  Begin
    eqtb[p].int := w;
    xeq_level[p] := 1;
  End;
{if eqtb[5323].int>0 then restore_trace(p,549);}
End;
{:279}{280:}
Procedure save_for_after(t:halfword);
Begin
  If cur_level>1 Then
    Begin
      If save_ptr>max_save_stack Then
        Begin
          max_save_stack := save_ptr;
          If max_save_stack>save_size-7 Then overflow(545,save_size);
        End;
      save_stack[save_ptr].hh.b0 := 2;
      save_stack[save_ptr].hh.b1 := 0;
      save_stack[save_ptr].hh.rh := t;
      save_ptr := save_ptr+1;
    End;
End;
{:280}{281:}
Procedure back_input;
forward;
Procedure unsave;

Label 30;

Var p: halfword;
  l: quarterword;
  t: halfword;
  a: boolean;
Begin
  a := false;
  If cur_level>1 Then
    Begin
      cur_level := cur_level-1;
{282:}
      While true Do
        Begin
          save_ptr := save_ptr-1;
          If save_stack[save_ptr].hh.b0=3 Then goto 30;
          p := save_stack[save_ptr].hh.rh;
          If save_stack[save_ptr].hh.b0=2 Then{326:}
            Begin
              t := cur_tok;
              cur_tok := p;
              If a Then
                Begin
                  p := get_avail;
                  mem[p].hh.lh := cur_tok;
                  mem[p].hh.rh := cur_input.loc_field;
                  cur_input.loc_field := p;
                  cur_input.start_field := p;
                  If cur_tok<768 Then If cur_tok<512 Then align_state := align_state-1
                  Else
                    align_state := align_state+1;
                End
              Else
                Begin
                  back_input;
                  a := (eTeX_mode=1);
                End;
              cur_tok := t;
            End{:326}
          Else If save_stack[save_ptr].hh.b0=4 Then
                 Begin
                   sa_restore;
                   sa_chain := p;
                   sa_level := save_stack[save_ptr].hh.b1;
                 End
          Else
            Begin
              If save_stack[save_ptr].hh.b0=0 Then
                Begin
                  l := save_stack[
                       save_ptr].hh.b1;
                  save_ptr := save_ptr-1;
                End
              Else save_stack[save_ptr] := eqtb[2881];
{283:}
              If p<5268 Then If eqtb[p].hh.b1=1 Then
                               Begin
                                 eq_destroy(save_stack
                                            [save_ptr]);
                                 {if eqtb[5305].int>0 then restore_trace(p,552);}
                               End
              Else
                Begin
                  eq_destroy(eqtb[p]);
                  eqtb[p] := save_stack[save_ptr];
{if eqtb[5305].int>0 then restore_trace(p,553);}
                End
              Else If xeq_level[p]<>1 Then
                     Begin
                       eqtb[p] := save_stack[save_ptr];
                       xeq_level[p] := l;{if eqtb[5305].int>0 then restore_trace(p,553);}
                     End
              Else
                Begin{if eqtb[5305].int>0 then restore_trace(p,552);}
                End{:283};
            End;
        End;
      30:{if eqtb[5324].int>0 then group_trace(true);}
          If grp_stack[in_open]=cur_boundary Then group_warning;
      cur_group := save_stack[save_ptr].hh.b1;
      cur_boundary := save_stack[save_ptr].hh.rh;
      If (eTeX_mode=1)Then save_ptr := save_ptr-1{:282};
    End
  Else confusion(551);
End;{:281}{288:}
Procedure prepare_mag;
Begin
  If (mag_set>0)And(eqtb[5285].int<>mag_set)Then
    Begin
      Begin
        If
           interaction=3 Then;
        print_nl(263);
        print(555);
      End;
      print_int(eqtb[5285].int);
      print(556);
      print_nl(557);
      Begin
        help_ptr := 2;
        help_line[1] := 558;
        help_line[0] := 559;
      End;
      int_error(mag_set);
      geq_word_define(5285,mag_set);
    End;
  If (eqtb[5285].int<=0)Or(eqtb[5285].int>32768)Then
    Begin
      Begin
        If
           interaction=3 Then;
        print_nl(263);
        print(560);
      End;
      Begin
        help_ptr := 1;
        help_line[0] := 561;
      End;
      int_error(eqtb[5285].int);
      geq_word_define(5285,1000);
    End;
  mag_set := eqtb[5285].int;
End;
{:288}{295:}
Procedure token_show(p:halfword);
Begin
  If p<>0 Then show_token_list(mem[p].hh.rh,0,10000000);
End;
{:295}{296:}
Procedure print_meaning;
Begin
  print_cmd_chr(cur_cmd,cur_chr);
  If cur_cmd>=111 Then
    Begin
      print_char(58);
      print_ln;
      token_show(cur_chr);
    End
  Else If (cur_cmd=110)And(cur_chr<5)Then
         Begin
           print_char(58);
           print_ln;
           token_show(cur_mark[cur_chr]);
         End;
End;
{:296}{299:}
Procedure show_cur_cmd_chr;

Var n: integer;
  l: integer;
  p: halfword;
Begin
  begin_diagnostic;
  print_nl(123);
  If cur_list.mode_field<>shown_mode Then
    Begin
      print_mode(cur_list.
                 mode_field);
      print(575);
      shown_mode := cur_list.mode_field;
    End;
  print_cmd_chr(cur_cmd,cur_chr);
  If eqtb[5325].int>0 Then If cur_cmd>=105 Then If cur_cmd<=106 Then
                                                  Begin
                                                    print(575);
                                                    If cur_cmd=106 Then
                                                      Begin
                                                        print_cmd_chr(105,cur_if);
                                                        print_char(32);
                                                        n := 0;
                                                        l := if_line;
                                                      End
                                                    Else
                                                      Begin
                                                        n := 1;
                                                        l := line;
                                                      End;
                                                    p := cond_ptr;
                                                    While p<>0 Do
                                                      Begin
                                                        n := n+1;
                                                        p := mem[p].hh.rh;
                                                      End;
                                                    print(576);
                                                    print_int(n);
                                                    print_char(41);
                                                    If l<>0 Then
                                                      Begin
                                                        print(1359);
                                                        print_int(l);
                                                      End;
                                                  End;
  print_char(125);
  end_diagnostic(false);
End;
{:299}{311:}
Procedure show_context;

Label 30;

Var old_setting: 0..21;
  nn: integer;
  bottom_line: boolean;{315:}
  i: 0..buf_size;
  j: 0..buf_size;
  l: 0..half_error_line;
  m: integer;
  n: 0..error_line;
  p: integer;
  q: integer;
{:315}
Begin
  base_ptr := input_ptr;
  input_stack[base_ptr] := cur_input;
  nn := -1;
  bottom_line := false;
  While true Do
    Begin
      cur_input := input_stack[base_ptr];
      If (cur_input.state_field<>0)Then If (cur_input.name_field>19)Or(base_ptr=
                                           0)Then bottom_line := true;
      If (base_ptr=input_ptr)Or bottom_line Or(nn<eqtb[5322].int)Then{312:}
        Begin
          If (base_ptr=input_ptr)Or(cur_input.state_field<>0)Or(cur_input.
             index_field<>3)Or(cur_input.loc_field<>0)Then
            Begin
              tally := 0;
              old_setting := selector;
              If cur_input.state_field<>0 Then
                Begin{313:}
                  If cur_input.name_field<=17
                    Then If (cur_input.name_field=0)Then If base_ptr=0 Then print_nl(582)
                  Else
                    print_nl(583)
                  Else
                    Begin
                      print_nl(584);
                      If cur_input.name_field=17 Then print_char(42)
                      Else print_int(cur_input.
                                     name_field-1);
                      print_char(62);
                    End
                  Else
                    Begin
                      print_nl(585);
                      If cur_input.index_field=in_open Then print_int(line)
                      Else print_int(
                                     line_stack[cur_input.index_field+1]);
                    End;
                  print_char(32){:313};
{318:}
                  Begin
                    l := tally;
                    tally := 0;
                    selector := 20;
                    trick_count := 1000000;
                  End;
                  If buffer[cur_input.limit_field]=eqtb[5316].int Then j := cur_input.
                                                                            limit_field
                  Else j := cur_input.limit_field+1;
                  If j>0 Then For i:=cur_input.start_field To j-1 Do
                                Begin
                                  If i=cur_input.
                                     loc_field Then
                                    Begin
                                      first_count := tally;
                                      trick_count := tally+1+error_line-half_error_line;
                                      If trick_count<error_line Then trick_count := error_line;
                                    End;
                                  print(buffer[i]);
                                End{:318};
                End
              Else
                Begin{314:}
                  Case cur_input.index_field Of
                    0: print_nl(586);
                    1,2: print_nl(587);
                    3: If cur_input.loc_field=0 Then print_nl(588)
                       Else print_nl(589);
                    4: print_nl(590);
                    5:
                       Begin
                         print_ln;
                         print_cs(cur_input.name_field);
                       End;
                    6: print_nl(591);
                    7: print_nl(592);
                    8: print_nl(593);
                    9: print_nl(594);
                    10: print_nl(595);
                    11: print_nl(596);
                    12: print_nl(597);
                    13: print_nl(598);
                    14: print_nl(599);
                    15: print_nl(600);
                    16: print_nl(601);
                    others: print_nl(63)
                  End{:314};{319:}
                  Begin
                    l := tally;
                    tally := 0;
                    selector := 20;
                    trick_count := 1000000;
                  End;
                  If cur_input.index_field<5 Then show_token_list(cur_input.start_field,
                                                                  cur_input.loc_field,100000)
                  Else show_token_list(mem[cur_input.
                                       start_field].hh.rh,cur_input.loc_field,100000){:319};
                End;
              selector := old_setting;
{317:}
              If trick_count=1000000 Then
                Begin
                  first_count := tally;
                  trick_count := tally+1+error_line-half_error_line;
                  If trick_count<error_line Then trick_count := error_line;
                End;
              If tally<trick_count Then m := tally-first_count
              Else m := trick_count-
                        first_count;
              If l+first_count<=half_error_line Then
                Begin
                  p := 0;
                  n := l+first_count;
                End
              Else
                Begin
                  print(278);
                  p := l+first_count-half_error_line+3;
                  n := half_error_line;
                End;
              For q:=p To first_count-1 Do
                print_char(trick_buf[q Mod error_line]);
              print_ln;
              For q:=1 To n Do
                print_char(32);
              If m+n<=error_line Then p := first_count+m
              Else p := first_count+(error_line
                        -n-3);
              For q:=first_count To p-1 Do
                print_char(trick_buf[q Mod error_line]);
              If m+n>error_line Then print(278){:317};
              nn := nn+1;
            End;
        End{:312}
      Else If nn=eqtb[5322].int Then
             Begin
               print_nl(278);
               nn := nn+1;
             End;
      If bottom_line Then goto 30;
      base_ptr := base_ptr-1;
    End;
  30: cur_input := input_stack[input_ptr];
End;
{:311}{323:}
Procedure begin_token_list(p:halfword;t:quarterword);
Begin
  Begin
    If input_ptr>max_in_stack Then
      Begin
        max_in_stack := input_ptr
        ;
        If input_ptr=stack_size Then overflow(602,stack_size);
      End;
    input_stack[input_ptr] := cur_input;
    input_ptr := input_ptr+1;
  End;
  cur_input.state_field := 0;
  cur_input.start_field := p;
  cur_input.index_field := t;
  If t>=5 Then
    Begin
      mem[p].hh.lh := mem[p].hh.lh+1;
      If t=5 Then cur_input.limit_field := param_ptr
      Else
        Begin
          cur_input.
          loc_field := mem[p].hh.rh;
          If eqtb[5298].int>1 Then
            Begin
              begin_diagnostic;
              print_nl(339);
              Case t Of
                14: print_esc(354);
                16: print_esc(603);
                others: print_cmd_chr(72,t+3407)
              End;
              print(563);
              token_show(p);
              end_diagnostic(false);
            End;
        End;
    End
  Else cur_input.loc_field := p;
End;
{:323}{324:}
Procedure end_token_list;
Begin
  If cur_input.index_field>=3 Then
    Begin
      If cur_input.index_field<=4
        Then flush_list(cur_input.start_field)
      Else
        Begin
          delete_token_ref(
                           cur_input.start_field);
          If cur_input.index_field=5 Then While param_ptr>cur_input.limit_field Do
                                            Begin
                                              param_ptr := param_ptr-1;
                                              flush_list(param_stack[param_ptr]);
                                            End;
        End;
    End
  Else If cur_input.index_field=1 Then If align_state>500000 Then
                                         align_state := 0
  Else fatal_error(604);
  Begin
    input_ptr := input_ptr-1;
    cur_input := input_stack[input_ptr];
  End;
  Begin
    If interrupt<>0 Then pause_for_instructions;
  End;
End;
{:324}{325:}
Procedure back_input;

Var p: halfword;
Begin
  While (cur_input.state_field=0)And(cur_input.loc_field=0)And(
        cur_input.index_field<>2) Do
    end_token_list;
  p := get_avail;
  mem[p].hh.lh := cur_tok;
  If cur_tok<768 Then If cur_tok<512 Then align_state := align_state-1
  Else
    align_state := align_state+1;
  Begin
    If input_ptr>max_in_stack Then
      Begin
        max_in_stack := input_ptr;
        If input_ptr=stack_size Then overflow(602,stack_size);
      End;
    input_stack[input_ptr] := cur_input;
    input_ptr := input_ptr+1;
  End;
  cur_input.state_field := 0;
  cur_input.start_field := p;
  cur_input.index_field := 3;
  cur_input.loc_field := p;
End;
{:325}{327:}
Procedure back_error;
Begin
  OK_to_interrupt := false;
  back_input;
  OK_to_interrupt := true;
  error;
End;
Procedure ins_error;
Begin
  OK_to_interrupt := false;
  back_input;
  cur_input.index_field := 4;
  OK_to_interrupt := true;
  error;
End;
{:327}{328:}
Procedure begin_file_reading;
Begin
  If in_open=max_in_open Then overflow(605,max_in_open);
  If first=buf_size Then overflow(257,buf_size);
  in_open := in_open+1;
  Begin
    If input_ptr>max_in_stack Then
      Begin
        max_in_stack := input_ptr;
        If input_ptr=stack_size Then overflow(602,stack_size);
      End;
    input_stack[input_ptr] := cur_input;
    input_ptr := input_ptr+1;
  End;
  cur_input.index_field := in_open;
  eof_seen[cur_input.index_field] := false;
  grp_stack[cur_input.index_field] := cur_boundary;
  if_stack[cur_input.index_field] := cond_ptr;
  line_stack[cur_input.index_field] := line;
  cur_input.start_field := first;
  cur_input.state_field := 1;
  cur_input.name_field := 0;
End;
{:328}{329:}
Procedure end_file_reading;
Begin
  first := cur_input.start_field;
  line := line_stack[cur_input.index_field];
  If (cur_input.name_field=18)Or(cur_input.name_field=19)Then pseudo_close
  Else If cur_input.name_field>17 Then a_close(input_file[cur_input.
                                               index_field]);
  Begin
    input_ptr := input_ptr-1;
    cur_input := input_stack[input_ptr];
  End;
  in_open := in_open-1;
End;
{:329}{330:}
Procedure clear_for_error_prompt;
Begin
  While (cur_input.state_field<>0)And(cur_input.name_field=0)And(
        input_ptr>0)And(cur_input.loc_field>cur_input.limit_field) Do
    end_file_reading;
  print_ln;
  break_in(term_in,true);
End;
{:330}{336:}
Procedure check_outer_validity;

Var p: halfword;
  q: halfword;
Begin
  If scanner_status<>0 Then
    Begin
      deletions_allowed := false;
{337:}
      If cur_cs<>0 Then
        Begin
          If (cur_input.state_field=0)Or(cur_input.
             name_field<1)Or(cur_input.name_field>17)Then
            Begin
              p := get_avail;
              mem[p].hh.lh := 4095+cur_cs;
              begin_token_list(p,3);
            End;
          cur_cmd := 10;
          cur_chr := 32;
        End{:337};
      If scanner_status>1 Then{338:}
        Begin
          runaway;
          If cur_cs=0 Then
            Begin
              If interaction=3 Then;
              print_nl(263);
              print(613);
            End
          Else
            Begin
              cur_cs := 0;
              Begin
                If interaction=3 Then;
                print_nl(263);
                print(614);
              End;
            End;
          print(615);{339:}
          p := get_avail;
          Case scanner_status Of
            2:
               Begin
                 print(578);
                 mem[p].hh.lh := 637;
               End;
            3:
               Begin
                 print(621);
                 mem[p].hh.lh := par_token;
                 long_state := 113;
               End;
            4:
               Begin
                 print(580);
                 mem[p].hh.lh := 637;
                 q := p;
                 p := get_avail;
                 mem[p].hh.rh := q;
                 mem[p].hh.lh := 6710;
                 align_state := -1000000;
               End;
            5:
               Begin
                 print(581);
                 mem[p].hh.lh := 637;
               End;
          End;
          begin_token_list(p,4){:339};
          print(616);
          sprint_cs(warning_index);
          Begin
            help_ptr := 4;
            help_line[3] := 617;
            help_line[2] := 618;
            help_line[1] := 619;
            help_line[0] := 620;
          End;
          error;
        End{:338}
      Else
        Begin
          Begin
            If interaction=3 Then;
            print_nl(263);
            print(607);
          End;
          print_cmd_chr(105,cur_if);
          print(608);
          print_int(skip_line);
          Begin
            help_ptr := 3;
            help_line[2] := 609;
            help_line[1] := 610;
            help_line[0] := 611;
          End;
          If cur_cs<>0 Then cur_cs := 0
          Else help_line[2] := 612;
          cur_tok := 6713;
          ins_error;
        End;
      deletions_allowed := true;
    End;
End;
{:336}{340:}
Procedure firm_up_the_line;
forward;
{:340}{341:}
Procedure get_next;

Label 20,25,21,26,40,10;

Var k: 0..buf_size;
  t: halfword;
  cat: 0..15;
  c,cc: ASCII_code;
  d: 2..3;
Begin
  20: cur_cs := 0;
  If cur_input.state_field<>0 Then{343:}
    Begin
      25: If cur_input.loc_field<=
             cur_input.limit_field Then
            Begin
              cur_chr := buffer[cur_input.loc_field];
              cur_input.loc_field := cur_input.loc_field+1;
              21: cur_cmd := eqtb[3988+cur_chr].hh.rh;
{344:}
              Case cur_input.state_field+cur_cmd Of {345:}
                10,26,42,27,43{:345}:
                                      goto 25;
                1,17,33:{354:}
                         Begin
                           If cur_input.loc_field>cur_input.limit_field Then
                             cur_cs := 513
                           Else
                             Begin
                               26: k := cur_input.loc_field;
                               cur_chr := buffer[k];
                               cat := eqtb[3988+cur_chr].hh.rh;
                               k := k+1;
                               If cat=11 Then cur_input.state_field := 17
                               Else If cat=10 Then cur_input.
                                      state_field := 17
                               Else cur_input.state_field := 1;
                               If (cat=11)And(k<=cur_input.limit_field)Then{356:}
                                 Begin
                                   Repeat
                                     cur_chr :=
                                                buffer[k];
                                     cat := eqtb[3988+cur_chr].hh.rh;
                                     k := k+1;
                                   Until (cat<>11)Or(k>cur_input.limit_field);
{355:}
                                   Begin
                                     If buffer[k]=cur_chr Then If cat=7 Then If k<cur_input.
                                                                                limit_field Then
                                                                               Begin
                                                                                 c := buffer[k+1];
                                                                                 If c<128 Then
                                                                                   Begin
                                                                                     d := 2;
                                                                                     If (((c>=48)And
                                                                                        (c<=57))Or((
                                                                                        c>=97)And(c
                                                                                        <=102)))Then
                                                                                       If k+2<=
                                                                                          cur_input.

                                                                                         limit_field
                                                                                         Then
                                                                                         Begin
                                                                                           cc :=
                                                                                              buffer
                                                                                                 [k+
                                                                                                 2];
                                                                                           If (((cc
                                                                                              >=48)
                                                                                              And(cc
                                                                                              <=57))
                                                                                              Or((cc
                                                                                              >=97)
                                                                                              And(cc
                                                                                              <=102)
                                                                                              ))Then
                                                                                             d := d+
                                                                                                  1;
                                                                                         End;
                                                                                     If d>2 Then
                                                                                       Begin
                                                                                         If c<=57
                                                                                           Then
                                                                                           cur_chr
                                                                                           := c-48
                                                                                         Else
                                                                                           cur_chr
                                                                                           := c-87;
                                                                                         If cc<=57
                                                                                           Then
                                                                                           cur_chr
                                                                                           := 16*
                                                                                             cur_chr
                                                                                              +cc-48
                                                                                         Else
                                                                                           cur_chr
                                                                                           := 16*
                                                                                             cur_chr
                                                                                              +cc-87
                                                                                         ;
                                                                                         buffer[k-1]
                                                                                         := cur_chr;
                                                                                       End
                                                                                     Else If c<64
                                                                                            Then
                                                                                            buffer[k
                                                                                            -1] := c
                                                                                                   +
                                                                                                  64
                                                                                     Else buffer[k-1
                                                                                       ] := c-64;
                                                                                     cur_input.
                                                                                     limit_field :=
                                                                                           cur_input
                                                                                                   .
                                                                                         limit_field
                                                                                                   -
                                                                                                   d
                                                                                     ;
                                                                                     first := first-
                                                                                              d;
                                                                                     While k<=
                                                                                           cur_input
                                                                                           .
                                                                                         limit_field
                                                                                       Do
                                                                                       Begin
                                                                                         buffer[k]
                                                                                         := buffer[k
                                                                                            +d];
                                                                                         k := k+1;
                                                                                       End;
                                                                                     goto 26;
                                                                                   End;
                                                                               End;
                                   End{:355};
                                   If cat<>11 Then k := k-1;
                                   If k>cur_input.loc_field+1 Then
                                     Begin
                                       cur_cs := id_lookup(cur_input.
                                                 loc_field,k-cur_input.loc_field);
                                       cur_input.loc_field := k;
                                       goto 40;
                                     End;
                                 End{:356}
                               Else{355:}
                                 Begin
                                   If buffer[k]=cur_chr Then If cat=7 Then If k<
                                                                              cur_input.limit_field
                                                                             Then
                                                                             Begin
                                                                               c := buffer[k+1];
                                                                               If c<128 Then
                                                                                 Begin
                                                                                   d := 2;
                                                                                   If (((c>=48)And(c
                                                                                      <=57))Or((c>=
                                                                                      97)And(c<=102)
                                                                                      ))Then If k+2
                                                                                                <=
                                                                                           cur_input
                                                                                                .

                                                                                         limit_field
                                                                                               Then
                                                                                               Begin
                                                                                                 cc
                                                                                                 :=
                                                                                              buffer
                                                                                                   [
                                                                                                   k
                                                                                                   +
                                                                                                   2
                                                                                                   ]
                                                                                                 ;
                                                                                                 If
                                                                                                   (
                                                                                                   (
                                                                                                   (
                                                                                                  cc
                                                                                                  >=
                                                                                                  48
                                                                                                   )
                                                                                                 And
                                                                                                   (
                                                                                                  cc
                                                                                                  <=
                                                                                                  57
                                                                                                   )
                                                                                                   )
                                                                                                  Or
                                                                                                   (
                                                                                                   (
                                                                                                  cc
                                                                                                  >=
                                                                                                  97
                                                                                                   )
                                                                                                 And
                                                                                                   (
                                                                                                  cc
                                                                                                  <=
                                                                                                 102
                                                                                                   )
                                                                                                   )
                                                                                                   )
                                                                                                Then
                                                                                                   d
                                                                                                  :=
                                                                                                   d
                                                                                                   +
                                                                                                   1
                                                                                                 ;
                                                                                               End;
                                                                                   If d>2 Then
                                                                                     Begin
                                                                                       If c<=57 Then
                                                                                         cur_chr :=
                                                                                                   c
                                                                                                   -
                                                                                                  48
                                                                                       Else cur_chr
                                                                                         := c-87;
                                                                                       If cc<=57
                                                                                         Then
                                                                                         cur_chr :=
                                                                                                  16
                                                                                                   *
                                                                                             cur_chr
                                                                                                   +
                                                                                                  cc
                                                                                                   -
                                                                                                  48
                                                                                       Else cur_chr
                                                                                         := 16*
                                                                                            cur_chr+
                                                                                            cc-87;
                                                                                       buffer[k-1]
                                                                                       := cur_chr;
                                                                                     End
                                                                                   Else If c<64 Then
                                                                                          buffer[k-1
                                                                                          ] := c+64
                                                                                   Else buffer[k-1]
                                                                                     := c-64;
                                                                                   cur_input.
                                                                                   limit_field :=
                                                                                           cur_input
                                                                                                  .
                                                                                         limit_field
                                                                                                  -d
                                                                                   ;
                                                                                   first := first-d;
                                                                                   While k<=
                                                                                         cur_input.
                                                                                         limit_field
                                                                                     Do
                                                                                     Begin
                                                                                       buffer[k] :=
                                                                                              buffer
                                                                                                   [
                                                                                                   k
                                                                                                   +
                                                                                                   d
                                                                                                   ]
                                                                                       ;
                                                                                       k := k+1;
                                                                                     End;
                                                                                   goto 26;
                                                                                 End;
                                                                             End;
                                 End{:355};
                               cur_cs := 257+buffer[cur_input.loc_field];
                               cur_input.loc_field := cur_input.loc_field+1;
                             End;
                           40: cur_cmd := eqtb[cur_cs].hh.b0;
                           cur_chr := eqtb[cur_cs].hh.rh;
                           If cur_cmd>=113 Then check_outer_validity;
                         End{:354};
                14,30,46:{353:}
                          Begin
                            cur_cs := cur_chr+1;
                            cur_cmd := eqtb[cur_cs].hh.b0;
                            cur_chr := eqtb[cur_cs].hh.rh;
                            cur_input.state_field := 1;
                            If cur_cmd>=113 Then check_outer_validity;
                          End{:353};
                8,24,40:{352:}
                         Begin
                           If cur_chr=buffer[cur_input.loc_field]Then If
                                                                         cur_input.loc_field<
                                                                         cur_input.limit_field Then
                                                                        Begin
                                                                          c := buffer[cur_input
                                                                               .loc_field+1];
                                                                          If c<128 Then
                                                                            Begin
                                                                              cur_input.loc_field :=
                                                                                           cur_input
                                                                                                   .
                                                                                           loc_field
                                                                                                   +
                                                                                                   2
                                                                              ;
                                                                              If (((c>=48)And(c<=57)
                                                                                 )Or((c>=97)And(c<=
                                                                                 102)))Then If
                                                                                           cur_input
                                                                                               .
                                                                                           loc_field
                                                                                               <=
                                                                                           cur_input
                                                                                               .
                                                                                         limit_field
                                                                                              Then
                                                                                              Begin
                                                                                                cc
                                                                                                :=
                                                                                              buffer
                                                                                                   [
                                                                                           cur_input
                                                                                                   .
                                                                                           loc_field
                                                                                                   ]
                                                                                                ;
                                                                                                If (
                                                                                                   (
                                                                                                   (
                                                                                                  cc
                                                                                                  >=
                                                                                                  48
                                                                                                   )
                                                                                                 And
                                                                                                   (
                                                                                                  cc
                                                                                                  <=
                                                                                                  57
                                                                                                   )
                                                                                                   )
                                                                                                  Or
                                                                                                   (
                                                                                                   (
                                                                                                  cc
                                                                                                  >=
                                                                                                  97
                                                                                                   )
                                                                                                 And
                                                                                                   (
                                                                                                  cc
                                                                                                  <=
                                                                                                 102
                                                                                                   )
                                                                                                   )
                                                                                                   )
                                                                                                Then

                                                                                               Begin

                                                                                           cur_input
                                                                                                   .

                                                                                           loc_field
                                                                                                  :=
                                                                                           cur_input
                                                                                                   .
                                                                                           loc_field
                                                                                                   +
                                                                                                   1
                                                                                                   ;

                                                                                                  If
                                                                                                   c
                                                                                                  <=
                                                                                                  57
                                                                                                Then
                                                                                             cur_chr
                                                                                                  :=
                                                                                                   c
                                                                                                   -
                                                                                                  48

                                                                                                Else
                                                                                             cur_chr
                                                                                                  :=
                                                                                                   c
                                                                                                   -
                                                                                                  87
                                                                                                   ;

                                                                                                  If
                                                                                                  cc
                                                                                                  <=
                                                                                                  57
                                                                                                Then
                                                                                             cur_chr
                                                                                                  :=
                                                                                                  16
                                                                                                   *
                                                                                             cur_chr
                                                                                                   +
                                                                                                  cc
                                                                                                   -
                                                                                                  48

                                                                                                Else
                                                                                             cur_chr
                                                                                                  :=
                                                                                                  16
                                                                                                   *
                                                                                             cur_chr
                                                                                                   +
                                                                                                  cc
                                                                                                   -
                                                                                                  87
                                                                                                   ;

                                                                                                goto
                                                                                                  21
                                                                                                   ;

                                                                                                 End
                                                                                                ;
                                                                                              End;
                                                                              If c<64 Then cur_chr
                                                                                := c+64
                                                                              Else cur_chr := c-64;
                                                                              goto 21;
                                                                            End;
                                                                        End;
                           cur_input.state_field := 1;
                         End{:352};
                16,32,48:{346:}
                          Begin
                            Begin
                              If interaction=3 Then;
                              print_nl(263);
                              print(622);
                            End;
                            Begin
                              help_ptr := 2;
                              help_line[1] := 623;
                              help_line[0] := 624;
                            End;
                            deletions_allowed := false;
                            error;
                            deletions_allowed := true;
                            goto 20;
                          End{:346};{347:}
                11:{349:}
                    Begin
                      cur_input.state_field := 17;
                      cur_chr := 32;
                    End{:349};
                6:{348:}
                   Begin
                     cur_input.loc_field := cur_input.limit_field+1;
                     cur_cmd := 10;
                     cur_chr := 32;
                   End{:348};
                22,15,31,47:{350:}
                             Begin
                               cur_input.loc_field := cur_input.limit_field+1;
                               goto 25;
                             End{:350};
                38:{351:}
                    Begin
                      cur_input.loc_field := cur_input.limit_field+1;
                      cur_cs := par_loc;
                      cur_cmd := eqtb[cur_cs].hh.b0;
                      cur_chr := eqtb[cur_cs].hh.rh;
                      If cur_cmd>=113 Then check_outer_validity;
                    End{:351};
                2: align_state := align_state+1;
                18,34:
                       Begin
                         cur_input.state_field := 1;
                         align_state := align_state+1;
                       End;
                3: align_state := align_state-1;
                19,35:
                       Begin
                         cur_input.state_field := 1;
                         align_state := align_state-1;
                       End;
                20,21,23,25,28,29,36,37,39,41,44,45: cur_input.state_field := 1;
{:347}
                others:
              End{:344};
            End
          Else
            Begin
              cur_input.state_field := 33;
{360:}
              If cur_input.name_field>17 Then{362:}
                Begin
                  line := line+1;
                  first := cur_input.start_field;
                  If Not force_eof Then If cur_input.name_field<=19 Then
                                          Begin
                                            If
                                               pseudo_input Then firm_up_the_line
                                            Else If (eqtb[3422].hh.rh<>0)And Not
                                                    eof_seen[cur_input.index_field]Then
                                                   Begin
                                                     cur_input.limit_field := first-1
                                                     ;
                                                     eof_seen[cur_input.index_field] := true;
                                                     begin_token_list(eqtb[3422].hh.rh,15);
                                                     goto 20;
                                                   End
                                            Else force_eof := true;
                                          End
                  Else
                    Begin
                      If input_ln(input_file[cur_input.index_field],true)Then
                        firm_up_the_line
                      Else If (eqtb[3422].hh.rh<>0)And Not eof_seen[cur_input.
                              index_field]Then
                             Begin
                               cur_input.limit_field := first-1;
                               eof_seen[cur_input.index_field] := true;
                               begin_token_list(eqtb[3422].hh.rh,15);
                               goto 20;
                             End
                      Else force_eof := true;
                    End;
                  If force_eof Then
                    Begin
                      If eqtb[5327].int>0 Then If (grp_stack[in_open]<>
                                                  cur_boundary)Or(if_stack[in_open]<>cond_ptr)Then
                                                 file_warning;
                      If cur_input.name_field>=19 Then
                        Begin
                          print_char(41);
                          open_parens := open_parens-1;
                          break(term_out);
                        End;
                      force_eof := false;
                      end_file_reading;
                      check_outer_validity;
                      goto 20;
                    End;
                  If (eqtb[5316].int<0)Or(eqtb[5316].int>255)Then cur_input.limit_field :=
                                                                                           cur_input
                                                                                           .
                                                                                         limit_field
                                                                                           -1
                  Else buffer[cur_input.limit_field] := eqtb[5316].
                                                        int;
                  first := cur_input.limit_field+1;
                  cur_input.loc_field := cur_input.start_field;
                End{:362}
              Else
                Begin
                  If Not(cur_input.name_field=0)Then
                    Begin
                      cur_cmd := 0;
                      cur_chr := 0;
                      goto 10;
                    End;
                  If input_ptr>0 Then
                    Begin
                      end_file_reading;
                      goto 20;
                    End;
                  If selector<18 Then open_log_file;
                  If interaction>1 Then
                    Begin
                      If (eqtb[5316].int<0)Or(eqtb[5316].int>255)
                        Then cur_input.limit_field := cur_input.limit_field+1;
                      If cur_input.limit_field=cur_input.start_field Then print_nl(625);
                      print_ln;
                      first := cur_input.start_field;
                      Begin;
                        print(42);
                        term_input;
                      End;
                      cur_input.limit_field := last;
                      If (eqtb[5316].int<0)Or(eqtb[5316].int>255)Then cur_input.limit_field :=

                                                                                           cur_input
                                                                                               .
                                                                                         limit_field
                                                                                               -1
                      Else buffer[cur_input.limit_field] := eqtb[5316].
                                                            int;
                      first := cur_input.limit_field+1;
                      cur_input.loc_field := cur_input.start_field;
                    End
                  Else fatal_error(626);
                End{:360};
              Begin
                If interrupt<>0 Then pause_for_instructions;
              End;
              goto 25;
            End;
    End{:343}
  Else{357:}If cur_input.loc_field<>0 Then
              Begin
                t := mem[cur_input
                     .loc_field].hh.lh;
                cur_input.loc_field := mem[cur_input.loc_field].hh.rh;
                If t>=4095 Then
                  Begin
                    cur_cs := t-4095;
                    cur_cmd := eqtb[cur_cs].hh.b0;
                    cur_chr := eqtb[cur_cs].hh.rh;
                    If cur_cmd>=113 Then If cur_cmd=116 Then{358:}
                                           Begin
                                             cur_cs := mem[
                                                       cur_input.loc_field].hh.lh-4095;
                                             cur_input.loc_field := 0;
                                             cur_cmd := eqtb[cur_cs].hh.b0;
                                             cur_chr := eqtb[cur_cs].hh.rh;
                                             If cur_cmd>100 Then
                                               Begin
                                                 cur_cmd := 0;
                                                 cur_chr := 257;
                                               End;
                                           End{:358}
                    Else check_outer_validity;
                  End
                Else
                  Begin
                    cur_cmd := t Div 256;
                    cur_chr := t Mod 256;
                    Case cur_cmd Of
                      1: align_state := align_state+1;
                      2: align_state := align_state-1;
                      5:{359:}
                         Begin
                           begin_token_list(param_stack[cur_input.limit_field+cur_chr
                                            -1],0);
                           goto 20;
                         End{:359};
                      others:
                    End;
                  End;
              End
  Else
    Begin
      end_token_list;
      goto 20;
    End{:357};
{342:}
  If cur_cmd<=5 Then If cur_cmd>=4 Then If align_state=0 Then{789:}
                                          Begin
                                            If (scanner_status=4)Or(cur_align=0)Then fatal_error(604
                                              );
                                            cur_cmd := mem[cur_align+5].hh.lh;
                                            mem[cur_align+5].hh.lh := cur_chr;
                                            If cur_cmd=63 Then begin_token_list(29990,2)
                                            Else begin_token_list(mem[
                                                                  cur_align+2].int,2);
                                            align_state := 1000000;
                                            goto 20;
                                          End{:789}{:342};
  10:
End;
{:341}{363:}
Procedure firm_up_the_line;

Var k: 0..buf_size;
Begin
  cur_input.limit_field := last;
  If eqtb[5296].int>0 Then If interaction>1 Then
                             Begin;
                               print_ln;
                               If cur_input.start_field<cur_input.limit_field Then For k:=cur_input.
                                                                                       start_field
                                                                                       To cur_input.
                                                                                       limit_field-1
                                                                                     Do
                                                                                     print(buffer[k]
                                                                                     );
                               first := cur_input.limit_field;
                               Begin;
                                 print(627);
                                 term_input;
                               End;
                               If last>first Then
                                 Begin
                                   For k:=first To last-1 Do
                                     buffer[k+cur_input.
                                     start_field-first] := buffer[k];
                                   cur_input.limit_field := cur_input.start_field+last-first;
                                 End;
                             End;
End;
{:363}{365:}
Procedure get_token;
Begin
  no_new_control_sequence := false;
  get_next;
  no_new_control_sequence := true;
  If cur_cs=0 Then cur_tok := (cur_cmd*256)+cur_chr
  Else cur_tok := 4095+
                  cur_cs;
End;{:365}{366:}{389:}
Procedure macro_call;

Label 10,22,30,31,40;

Var r: halfword;
  p: halfword;
  q: halfword;
  s: halfword;
  t: halfword;
  u,v: halfword;
  rbrace_ptr: halfword;
  n: small_number;
  unbalance: halfword;
  m: halfword;
  ref_count: halfword;
  save_scanner_status: small_number;
  save_warning_index: halfword;
  match_chr: ASCII_code;
Begin
  save_scanner_status := scanner_status;
  save_warning_index := warning_index;
  warning_index := cur_cs;
  ref_count := cur_chr;
  r := mem[ref_count].hh.rh;
  n := 0;
  If eqtb[5298].int>0 Then{401:}
    Begin
      begin_diagnostic;
      print_ln;
      print_cs(warning_index);
      token_show(ref_count);
      end_diagnostic(false);
    End{:401};
  If mem[r].hh.lh=3585 Then r := mem[r].hh.rh;
  If mem[r].hh.lh<>3584 Then{391:}
    Begin
      scanner_status := 3;
      unbalance := 0;
      long_state := eqtb[cur_cs].hh.b0;
      If long_state>=113 Then long_state := long_state-2;
      Repeat
        mem[29997].hh.rh := 0;
        If (mem[r].hh.lh>3583)Or(mem[r].hh.lh<3328)Then s := 0
        Else
          Begin
            match_chr
            := mem[r].hh.lh-3328;
            s := mem[r].hh.rh;
            r := s;
            p := 29997;
            m := 0;
          End;
{392:}
        22: get_token;
        If cur_tok=mem[r].hh.lh Then{394:}
          Begin
            r := mem[r].hh.rh;
            If (mem[r].hh.lh>=3328)And(mem[r].hh.lh<=3584)Then
              Begin
                If cur_tok<512
                  Then align_state := align_state-1;
                goto 40;
              End
            Else goto 22;
          End{:394};
{397:}
        If s<>r Then If s=0 Then{398:}
                       Begin
                         Begin
                           If interaction=3 Then;
                           print_nl(263);
                           print(659);
                         End;
                         sprint_cs(warning_index);
                         print(660);
                         Begin
                           help_ptr := 4;
                           help_line[3] := 661;
                           help_line[2] := 662;
                           help_line[1] := 663;
                           help_line[0] := 664;
                         End;
                         error;
                         goto 10;
                       End{:398}
        Else
          Begin
            t := s;
            Repeat
              Begin
                q := get_avail;
                mem[p].hh.rh := q;
                mem[q].hh.lh := mem[t].hh.lh;
                p := q;
              End;
              m := m+1;
              u := mem[t].hh.rh;
              v := s;
              While true Do
                Begin
                  If u=r Then If cur_tok<>mem[v].hh.lh Then goto 30
                  Else
                    Begin
                      r := mem[v].hh.rh;
                      goto 22;
                    End;
                  If mem[u].hh.lh<>mem[v].hh.lh Then goto 30;
                  u := mem[u].hh.rh;
                  v := mem[v].hh.rh;
                End;
              30: t := mem[t].hh.rh;
            Until t=r;
            r := s;
          End{:397};
        If cur_tok=par_token Then If long_state<>112 Then{396:}
                                    Begin
                                      If
                                         long_state=111 Then
                                        Begin
                                          runaway;
                                          Begin
                                            If interaction=3 Then;
                                            print_nl(263);
                                            print(654);
                                          End;
                                          sprint_cs(warning_index);
                                          print(655);
                                          Begin
                                            help_ptr := 3;
                                            help_line[2] := 656;
                                            help_line[1] := 657;
                                            help_line[0] := 658;
                                          End;
                                          back_error;
                                        End;
                                      pstack[n] := mem[29997].hh.rh;
                                      align_state := align_state-unbalance;
                                      For m:=0 To n Do
                                        flush_list(pstack[m]);
                                      goto 10;
                                    End{:396};
        If cur_tok<768 Then If cur_tok<512 Then{399:}
                              Begin
                                unbalance := 1;
                                While true Do
                                  Begin
                                    Begin
                                      Begin
                                        q := avail;
                                        If q=0 Then q := get_avail
                                        Else
                                          Begin
                                            avail := mem[q].hh.rh;
                                            mem[q].hh.rh := 0;
{dyn_used:=dyn_used+1;}
                                          End;
                                      End;
                                      mem[p].hh.rh := q;
                                      mem[q].hh.lh := cur_tok;
                                      p := q;
                                    End;
                                    get_token;
                                    If cur_tok=par_token Then If long_state<>112 Then{396:}
                                                                Begin
                                                                  If
                                                                     long_state=111 Then
                                                                    Begin
                                                                      runaway;
                                                                      Begin
                                                                        If interaction=3 Then;
                                                                        print_nl(263);
                                                                        print(654);
                                                                      End;
                                                                      sprint_cs(warning_index);
                                                                      print(655);
                                                                      Begin
                                                                        help_ptr := 3;
                                                                        help_line[2] := 656;
                                                                        help_line[1] := 657;
                                                                        help_line[0] := 658;
                                                                      End;
                                                                      back_error;
                                                                    End;
                                                                  pstack[n] := mem[29997].hh.rh;
                                                                  align_state := align_state-
                                                                                 unbalance;
                                                                  For m:=0 To n Do
                                                                    flush_list(pstack[m]);
                                                                  goto 10;
                                                                End{:396};
                                    If cur_tok<768 Then If cur_tok<512 Then unbalance := unbalance+1
                                    Else
                                      Begin
                                        unbalance := unbalance-1;
                                        If unbalance=0 Then goto 31;
                                      End;
                                  End;
                                31: rbrace_ptr := p;
                                Begin
                                  q := get_avail;
                                  mem[p].hh.rh := q;
                                  mem[q].hh.lh := cur_tok;
                                  p := q;
                                End;
                              End{:399}
        Else{395:}
          Begin
            back_input;
            Begin
              If interaction=3 Then;
              print_nl(263);
              print(646);
            End;
            sprint_cs(warning_index);
            print(647);
            Begin
              help_ptr := 6;
              help_line[5] := 648;
              help_line[4] := 649;
              help_line[3] := 650;
              help_line[2] := 651;
              help_line[1] := 652;
              help_line[0] := 653;
            End;
            align_state := align_state+1;
            long_state := 111;
            cur_tok := par_token;
            ins_error;
            goto 22;
          End{:395}
        Else{393:}
          Begin
            If cur_tok=2592 Then If mem[r].hh.lh<=3584 Then
                                   If mem[r].hh.lh>=3328 Then goto 22;
            Begin
              q := get_avail;
              mem[p].hh.rh := q;
              mem[q].hh.lh := cur_tok;
              p := q;
            End;
          End{:393};
        m := m+1;
        If mem[r].hh.lh>3584 Then goto 22;
        If mem[r].hh.lh<3328 Then goto 22;
        40: If s<>0 Then{400:}
              Begin
                If (m=1)And(mem[p].hh.lh<768)Then
                  Begin
                    mem[
                    rbrace_ptr].hh.rh := 0;
                    Begin
                      mem[p].hh.rh := avail;
                      avail := p;
{dyn_used:=dyn_used-1;}
                    End;
                    p := mem[29997].hh.rh;
                    pstack[n] := mem[p].hh.rh;
                    Begin
                      mem[p].hh.rh := avail;
                      avail := p;{dyn_used:=dyn_used-1;}
                    End;
                  End
                Else pstack[n] := mem[29997].hh.rh;
                n := n+1;
                If eqtb[5298].int>0 Then
                  Begin
                    begin_diagnostic;
                    print_nl(match_chr);
                    print_int(n);
                    print(665);
                    show_token_list(pstack[n-1],0,1000);
                    end_diagnostic(false);
                  End;
              End{:400}{:392};
      Until mem[r].hh.lh=3584;
    End{:391};
{390:}
  While (cur_input.state_field=0)And(cur_input.loc_field=0)And(
        cur_input.index_field<>2) Do
    end_token_list;
  begin_token_list(ref_count,5);
  cur_input.name_field := warning_index;
  cur_input.loc_field := mem[r].hh.rh;
  If n>0 Then
    Begin
      If param_ptr+n>max_param_stack Then
        Begin
          max_param_stack := param_ptr+n;
          If max_param_stack>param_size Then overflow(645,param_size);
        End;
      For m:=0 To n-1 Do
        param_stack[param_ptr+m] := pstack[m];
      param_ptr := param_ptr+n;
    End{:390};
  10: scanner_status := save_scanner_status;
  warning_index := save_warning_index;
End;
{:389}{379:}
Procedure insert_relax;
Begin
  cur_tok := 4095+cur_cs;
  back_input;
  cur_tok := 6716;
  back_input;
  cur_input.index_field := 4;
End;
{:379}{1487:}
Procedure pseudo_start;
forward;
{:1487}{1545:}
Procedure scan_register_num;
forward;
{:1545}{1550:}
Procedure new_index(i:quarterword;q:halfword);

Var k: small_number;
Begin
  cur_ptr := get_node(9);
  mem[cur_ptr].hh.b0 := i;
  mem[cur_ptr].hh.b1 := 0;
  mem[cur_ptr].hh.rh := q;
  For k:=1 To 8 Do
    mem[cur_ptr+k] := sa_null;
End;
{:1550}{1554:}
Procedure find_sa_element(t:small_number;n:halfword;
                          w:boolean);

Label 45,46,47,48,49,10;

Var q: halfword;
  i: small_number;
Begin
  cur_ptr := sa_root[t];
  Begin
    If cur_ptr=0 Then If w Then goto 45
    Else goto 10;
  End;
  q := cur_ptr;
  i := n Div 4096;
  If odd(i)Then cur_ptr := mem[q+(i Div 2)+1].hh.rh
  Else cur_ptr := mem[q+(i
                  Div 2)+1].hh.lh;
  Begin
    If cur_ptr=0 Then If w Then goto 46
    Else goto 10;
  End;
  q := cur_ptr;
  i := (n Div 256)Mod 16;
  If odd(i)Then cur_ptr := mem[q+(i Div 2)+1].hh.rh
  Else cur_ptr := mem[q+(i
                  Div 2)+1].hh.lh;
  Begin
    If cur_ptr=0 Then If w Then goto 47
    Else goto 10;
  End;
  q := cur_ptr;
  i := (n Div 16)Mod 16;
  If odd(i)Then cur_ptr := mem[q+(i Div 2)+1].hh.rh
  Else cur_ptr := mem[q+(i
                  Div 2)+1].hh.lh;
  Begin
    If cur_ptr=0 Then If w Then goto 48
    Else goto 10;
  End;
  q := cur_ptr;
  i := n Mod 16;
  If odd(i)Then cur_ptr := mem[q+(i Div 2)+1].hh.rh
  Else cur_ptr := mem[q+(i
                  Div 2)+1].hh.lh;
  If (cur_ptr=0)And w Then goto 49;
  goto 10;
  45: new_index(t,0);
  sa_root[t] := cur_ptr;
  q := cur_ptr;
  i := n Div 4096;
  46: new_index(i,q);
  Begin
    If odd(i)Then mem[q+(i Div 2)+1].hh.rh := cur_ptr
    Else mem[q+(i Div
                2)+1].hh.lh := cur_ptr;
    mem[q].hh.b1 := mem[q].hh.b1+1;
  End;
  q := cur_ptr;
  i := (n Div 256)Mod 16;
  47: new_index(i,q);
  Begin
    If odd(i)Then mem[q+(i Div 2)+1].hh.rh := cur_ptr
    Else mem[q+(i Div
                2)+1].hh.lh := cur_ptr;
    mem[q].hh.b1 := mem[q].hh.b1+1;
  End;
  q := cur_ptr;
  i := (n Div 16)Mod 16;
  48: new_index(i,q);
  Begin
    If odd(i)Then mem[q+(i Div 2)+1].hh.rh := cur_ptr
    Else mem[q+(i Div
                2)+1].hh.lh := cur_ptr;
    mem[q].hh.b1 := mem[q].hh.b1+1;
  End;
  q := cur_ptr;
  i := n Mod 16;
  49:{1555:}If t=6 Then
              Begin
                cur_ptr := get_node(4);
                mem[cur_ptr+1] := sa_null;
                mem[cur_ptr+2] := sa_null;
                mem[cur_ptr+3] := sa_null;
              End
      Else
        Begin
          If t<=1 Then
            Begin
              cur_ptr := get_node(3);
              mem[cur_ptr+2].int := 0;
              mem[cur_ptr+1].hh.rh := n;
            End
          Else
            Begin
              cur_ptr := get_node(2);
              If t<=3 Then
                Begin
                  mem[cur_ptr+1].hh.rh := 0;
                  mem[0].hh.rh := mem[0].hh.rh+1;
                End
              Else mem[cur_ptr+1].hh.rh := 0;
            End;
          mem[cur_ptr+1].hh.lh := 0;
        End;
  mem[cur_ptr].hh.b0 := 16*t+i;
  mem[cur_ptr].hh.b1 := 1{:1555};
  mem[cur_ptr].hh.rh := q;
  Begin
    If odd(i)Then mem[q+(i Div 2)+1].hh.rh := cur_ptr
    Else mem[q+(i Div
                2)+1].hh.lh := cur_ptr;
    mem[q].hh.b1 := mem[q].hh.b1+1;
  End;
  10:
End;
{:1554}
Procedure pass_text;
forward;
Procedure start_input;
forward;
Procedure conditional;
forward;
Procedure get_x_token;
forward;
Procedure conv_toks;
forward;
Procedure ins_the_toks;
forward;
Procedure expand;

Label 21;

Var t: halfword;
  p,q,r: halfword;
  j: 0..buf_size;
  cv_backup: integer;
  cvl_backup,radix_backup,co_backup: small_number;
  backup_backup: halfword;
  save_scanner_status: small_number;
Begin
  cv_backup := cur_val;
  cvl_backup := cur_val_level;
  radix_backup := radix;
  co_backup := cur_order;
  backup_backup := mem[29987].hh.rh;
  21: If cur_cmd<111 Then{367:}
        Begin
          If eqtb[5304].int>1 Then
            show_cur_cmd_chr;
          Case cur_cmd Of
            110:{386:}
                 Begin
                   t := cur_chr Mod 5;
                   If cur_chr>=5 Then scan_register_num
                   Else cur_val := 0;
                   If cur_val=0 Then cur_ptr := cur_mark[t]
                   Else{1559:}
                     Begin
                       find_sa_element(6
                                       ,cur_val,false);
                       If cur_ptr<>0 Then If odd(t)Then cur_ptr := mem[cur_ptr+(t Div 2)+1].hh.rh
                       Else cur_ptr := mem[cur_ptr+(t Div 2)+1].hh.lh;
                     End{:1559};
                   If cur_ptr<>0 Then begin_token_list(cur_ptr,14);
                 End{:386};
            102: If cur_chr=0 Then{368:}
                   Begin
                     get_token;
                     t := cur_tok;
                     get_token;
                     If cur_cmd>100 Then expand
                     Else back_input;
                     cur_tok := t;
                     back_input;
                   End{:368}
                 Else{1500:}
                   Begin
                     get_token;
                     If (cur_cmd=105)And(cur_chr<>16)Then
                       Begin
                         cur_chr := cur_chr+32;
                         goto 21;
                       End;
                     Begin
                       If interaction=3 Then;
                       print_nl(263);
                       print(694);
                     End;
                     print_esc(784);
                     print(1385);
                     print_cmd_chr(cur_cmd,cur_chr);
                     print_char(39);
                     Begin
                       help_ptr := 1;
                       help_line[0] := 624;
                     End;
                     back_error;
                   End{:1500};
            103:{369:}
                 Begin
                   save_scanner_status := scanner_status;
                   scanner_status := 0;
                   get_token;
                   scanner_status := save_scanner_status;
                   t := cur_tok;
                   back_input;
                   If t>=4095 Then
                     Begin
                       p := get_avail;
                       mem[p].hh.lh := 6718;
                       mem[p].hh.rh := cur_input.loc_field;
                       cur_input.start_field := p;
                       cur_input.loc_field := p;
                     End;
                 End{:369};
            107:{372:}
                 Begin
                   r := get_avail;
                   p := r;
                   Repeat
                     get_x_token;
                     If cur_cs=0 Then
                       Begin
                         q := get_avail;
                         mem[p].hh.rh := q;
                         mem[q].hh.lh := cur_tok;
                         p := q;
                       End;
                   Until cur_cs<>0;
                   If cur_cmd<>67 Then{373:}
                     Begin
                       Begin
                         If interaction=3 Then;
                         print_nl(263);
                         print(634);
                       End;
                       print_esc(508);
                       print(635);
                       Begin
                         help_ptr := 2;
                         help_line[1] := 636;
                         help_line[0] := 637;
                       End;
                       back_error;
                     End{:373};{374:}
                   j := first;
                   p := mem[r].hh.rh;
                   While p<>0 Do
                     Begin
                       If j>=max_buf_stack Then
                         Begin
                           max_buf_stack := j+1;
                           If max_buf_stack=buf_size Then overflow(257,buf_size);
                         End;
                       buffer[j] := mem[p].hh.lh Mod 256;
                       j := j+1;
                       p := mem[p].hh.rh;
                     End;
                   If j>first+1 Then
                     Begin
                       no_new_control_sequence := false;
                       cur_cs := id_lookup(first,j-first);
                       no_new_control_sequence := true;
                     End
                   Else If j=first Then cur_cs := 513
                   Else cur_cs := 257+buffer[first]
{:374}             ;
                   flush_list(r);
                   If eqtb[cur_cs].hh.b0=101 Then
                     Begin
                       eq_define(cur_cs,0,256);
                     End;
                   cur_tok := cur_cs+4095;
                   back_input;
                 End{:372};
            108: conv_toks;
            109: ins_the_toks;
            105: conditional;
            106:{510:}
                 Begin
                   If eqtb[5325].int>0 Then If eqtb[5304].int<=1 Then
                                              show_cur_cmd_chr;
                   If cur_chr>if_limit Then If if_limit=1 Then insert_relax
                   Else
                     Begin
                       Begin
                         If interaction=3 Then;
                         print_nl(263);
                         print(788);
                       End;
                       print_cmd_chr(106,cur_chr);
                       Begin
                         help_ptr := 1;
                         help_line[0] := 789;
                       End;
                       error;
                     End
                   Else
                     Begin
                       While cur_chr<>2 Do
                         pass_text;
{496:}
                       Begin
                         If if_stack[in_open]=cond_ptr Then if_warning;
                         p := cond_ptr;
                         if_line := mem[p+1].int;
                         cur_if := mem[p].hh.b1;
                         if_limit := mem[p].hh.b0;
                         cond_ptr := mem[p].hh.rh;
                         free_node(p,2);
                       End{:496};
                     End;
                 End{:510};
            104:{378:}If cur_chr=1 Then force_eof := true{1484:}
                 Else If cur_chr=2 Then
                        pseudo_start{:1484}
                 Else If name_in_progress Then insert_relax
                 Else
                   start_input{:378};
            others:{370:}
                    Begin
                      Begin
                        If interaction=3 Then;
                        print_nl(263);
                        print(628);
                      End;
                      Begin
                        help_ptr := 5;
                        help_line[4] := 629;
                        help_line[3] := 630;
                        help_line[2] := 631;
                        help_line[1] := 632;
                        help_line[0] := 633;
                      End;
                      error;
                    End{:370}
          End;
        End{:367}
      Else If cur_cmd<115 Then macro_call
      Else{375:}
        Begin
          cur_tok :=
                     6715;
          back_input;
        End{:375};
  cur_val := cv_backup;
  cur_val_level := cvl_backup;
  radix := radix_backup;
  cur_order := co_backup;
  mem[29987].hh.rh := backup_backup;
End;{:366}{380:}
Procedure get_x_token;

Label 20,30;
Begin
  20: get_next;
  If cur_cmd<=100 Then goto 30;
  If cur_cmd>=111 Then If cur_cmd<115 Then macro_call
  Else
    Begin
      cur_cs :=
                2620;
      cur_cmd := 9;
      goto 30;
    End
  Else expand;
  goto 20;
  30: If cur_cs=0 Then cur_tok := (cur_cmd*256)+cur_chr
      Else cur_tok := 4095+
                      cur_cs;
End;{:380}{381:}
Procedure x_token;
Begin
  While cur_cmd>100 Do
    Begin
      expand;
      get_next;
    End;
  If cur_cs=0 Then cur_tok := (cur_cmd*256)+cur_chr
  Else cur_tok := 4095+
                  cur_cs;
End;{:381}{403:}
Procedure scan_left_brace;
Begin{404:}
  Repeat
    get_x_token;
  Until (cur_cmd<>10)And(cur_cmd<>0){:404};
  If cur_cmd<>1 Then
    Begin
      Begin
        If interaction=3 Then;
        print_nl(263);
        print(666);
      End;
      Begin
        help_ptr := 4;
        help_line[3] := 667;
        help_line[2] := 668;
        help_line[1] := 669;
        help_line[0] := 670;
      End;
      back_error;
      cur_tok := 379;
      cur_cmd := 1;
      cur_chr := 123;
      align_state := align_state+1;
    End;
End;
{:403}{405:}
Procedure scan_optional_equals;
Begin{406:}
  Repeat
    get_x_token;
  Until cur_cmd<>10{:406};
  If cur_tok<>3133 Then back_input;
End;
{:405}{407:}
Function scan_keyword(s:str_number): boolean;

Label 10;

Var p: halfword;
  q: halfword;
  k: pool_pointer;
Begin
  p := 29987;
  mem[p].hh.rh := 0;
  k := str_start[s];
  While k<str_start[s+1] Do
    Begin
      get_x_token;
      If (cur_cs=0)And((cur_chr=str_pool[k])Or(cur_chr=str_pool[k]-32))Then
        Begin
          Begin
            q := get_avail;
            mem[p].hh.rh := q;
            mem[q].hh.lh := cur_tok;
            p := q;
          End;
          k := k+1;
        End
      Else If (cur_cmd<>10)Or(p<>29987)Then
             Begin
               back_input;
               If p<>29987 Then begin_token_list(mem[29987].hh.rh,3);
               scan_keyword := false;
               goto 10;
             End;
    End;
  flush_list(mem[29987].hh.rh);
  scan_keyword := true;
  10:
End;{:407}{408:}
Procedure mu_error;
Begin
  Begin
    If interaction=3 Then;
    print_nl(263);
    print(671);
  End;
  Begin
    help_ptr := 1;
    help_line[0] := 672;
  End;
  error;
End;
{:408}{409:}
Procedure scan_int;
forward;
{433:}
Procedure scan_eight_bit_int;
Begin
  scan_int;
  If (cur_val<0)Or(cur_val>255)Then
    Begin
      Begin
        If interaction=3 Then;
        print_nl(263);
        print(696);
      End;
      Begin
        help_ptr := 2;
        help_line[1] := 697;
        help_line[0] := 698;
      End;
      int_error(cur_val);
      cur_val := 0;
    End;
End;
{:433}{434:}
Procedure scan_char_num;
Begin
  scan_int;
  If (cur_val<0)Or(cur_val>255)Then
    Begin
      Begin
        If interaction=3 Then;
        print_nl(263);
        print(699);
      End;
      Begin
        help_ptr := 2;
        help_line[1] := 700;
        help_line[0] := 698;
      End;
      int_error(cur_val);
      cur_val := 0;
    End;
End;
{:434}{435:}
Procedure scan_four_bit_int;
Begin
  scan_int;
  If (cur_val<0)Or(cur_val>15)Then
    Begin
      Begin
        If interaction=3 Then;
        print_nl(263);
        print(701);
      End;
      Begin
        help_ptr := 2;
        help_line[1] := 702;
        help_line[0] := 698;
      End;
      int_error(cur_val);
      cur_val := 0;
    End;
End;
{:435}{436:}
Procedure scan_fifteen_bit_int;
Begin
  scan_int;
  If (cur_val<0)Or(cur_val>32767)Then
    Begin
      Begin
        If interaction=3 Then;
        print_nl(263);
        print(703);
      End;
      Begin
        help_ptr := 2;
        help_line[1] := 704;
        help_line[0] := 698;
      End;
      int_error(cur_val);
      cur_val := 0;
    End;
End;
{:436}{437:}
Procedure scan_twenty_seven_bit_int;
Begin
  scan_int;
  If (cur_val<0)Or(cur_val>134217727)Then
    Begin
      Begin
        If interaction=3 Then
        ;
        print_nl(263);
        print(705);
      End;
      Begin
        help_ptr := 2;
        help_line[1] := 706;
        help_line[0] := 698;
      End;
      int_error(cur_val);
      cur_val := 0;
    End;
End;
{:437}{1546:}
Procedure scan_register_num;
Begin
  scan_int;
  If (cur_val<0)Or(cur_val>max_reg_num)Then
    Begin
      Begin
        If interaction=3
          Then;
        print_nl(263);
        print(696);
      End;
      Begin
        help_ptr := 2;
        help_line[1] := max_reg_help_line;
        help_line[0] := 698;
      End;
      int_error(cur_val);
      cur_val := 0;
    End;
End;
{:1546}{1413:}
Procedure scan_general_text;
forward;
{:1413}{1507:}
Procedure get_x_or_protected;

Label 10;
Begin
  While true Do
    Begin
      get_token;
      If cur_cmd<=100 Then goto 10;
      If (cur_cmd>=111)And(cur_cmd<115)Then If mem[mem[cur_chr].hh.rh].hh.lh=
                                               3585 Then goto 10;
      expand;
    End;
  10:
End;{:1507}{1516:}
Procedure scan_expr;
forward;{:1516}{1521:}
Procedure scan_normal_glue;
forward;
Procedure scan_mu_glue;
forward;{:1521}{577:}
Procedure scan_font_ident;

Var f: internal_font_number;
  m: halfword;
Begin{406:}
  Repeat
    get_x_token;
  Until cur_cmd<>10{:406};
  If cur_cmd=88 Then f := eqtb[3939].hh.rh
  Else If cur_cmd=87 Then f :=
                               cur_chr
  Else If cur_cmd=86 Then
         Begin
           m := cur_chr;
           scan_four_bit_int;
           f := eqtb[m+cur_val].hh.rh;
         End
  Else
    Begin
      Begin
        If interaction=3 Then;
        print_nl(263);
        print(828);
      End;
      Begin
        help_ptr := 2;
        help_line[1] := 829;
        help_line[0] := 830;
      End;
      back_error;
      f := 0;
    End;
  cur_val := f;
End;
{:577}{578:}
Procedure find_font_dimen(writing:boolean);

Var f: internal_font_number;
  n: integer;
Begin
  scan_int;
  n := cur_val;
  scan_font_ident;
  f := cur_val;
  If n<=0 Then cur_val := fmem_ptr
  Else
    Begin
      If writing And(n<=4)And(n>=2)
         And(font_glue[f]<>0)Then
        Begin
          delete_glue_ref(font_glue[f]);
          font_glue[f] := 0;
        End;
      If n>font_params[f]Then If f<font_ptr Then cur_val := fmem_ptr
      Else{580:}
        Begin
          Repeat
            If fmem_ptr=font_mem_size Then overflow(835,font_mem_size);
            font_info[fmem_ptr].int := 0;
            fmem_ptr := fmem_ptr+1;
            font_params[f] := font_params[f]+1;
          Until n=font_params[f];
          cur_val := fmem_ptr-1;
        End{:580}
      Else cur_val := n+param_base[f];
    End;
{579:}
  If cur_val=fmem_ptr Then
    Begin
      Begin
        If interaction=3 Then;
        print_nl(263);
        print(813);
      End;
      print_esc(hash[2624+f].rh);
      print(831);
      print_int(font_params[f]);
      print(832);
      Begin
        help_ptr := 2;
        help_line[1] := 833;
        help_line[0] := 834;
      End;
      error;
    End{:579};
End;
{:578}{:409}{413:}
Procedure scan_something_internal(level:small_number;
                                  negative:boolean);

Label 10;

Var m: halfword;
  q,r: halfword;
  tx: halfword;
  i: four_quarters;
  p: 0..nest_size;
Begin
  m := cur_chr;
  Case cur_cmd Of
    85:{414:}
        Begin
          scan_char_num;
          If m=5012 Then
            Begin
              cur_val := eqtb[5012+cur_val].hh.rh-0;
              cur_val_level := 0;
            End
          Else If m<5012 Then
                 Begin
                   cur_val := eqtb[m+cur_val].hh.rh;
                   cur_val_level := 0;
                 End
          Else
            Begin
              cur_val := eqtb[m+cur_val].int;
              cur_val_level := 0;
            End;
        End{:414};
    71,72,86,87,88:{415:}If level<>5 Then
                           Begin
                             Begin
                               If interaction=3 Then;
                               print_nl(263);
                               print(673);
                             End;
                             Begin
                               help_ptr := 3;
                               help_line[2] := 674;
                               help_line[1] := 675;
                               help_line[0] := 676;
                             End;
                             back_error;
                             Begin
                               cur_val := 0;
                               cur_val_level := 1;
                             End;
                           End
                    Else If cur_cmd<=72 Then
                           Begin
                             If cur_cmd<72 Then If m=0 Then
                                                  Begin
                                                    scan_register_num;
                                                    If cur_val<256 Then cur_val := eqtb[3423+cur_val
                                                                                   ].hh.rh
                                                    Else
                                                      Begin
                                                        find_sa_element(5,cur_val,false);
                                                        If cur_ptr=0 Then cur_val := 0
                                                        Else cur_val := mem[cur_ptr+1].hh.rh;
                                                      End;
                                                  End
                             Else cur_val := mem[m+1].hh.rh
                             Else cur_val := eqtb[m].hh.rh;
                             cur_val_level := 5;
                           End
                    Else
                      Begin
                        back_input;
                        scan_font_ident;
                        Begin
                          cur_val := 2624+cur_val;
                          cur_val_level := 4;
                        End;
                      End{:415};
    73:
        Begin
          cur_val := eqtb[m].int;
          cur_val_level := 0;
        End;
    74:
        Begin
          cur_val := eqtb[m].int;
          cur_val_level := 1;
        End;
    75:
        Begin
          cur_val := eqtb[m].hh.rh;
          cur_val_level := 2;
        End;
    76:
        Begin
          cur_val := eqtb[m].hh.rh;
          cur_val_level := 3;
        End;
    79:{418:}If abs(cur_list.mode_field)<>m Then
               Begin
                 Begin
                   If interaction=
                      3 Then;
                   print_nl(263);
                   print(689);
                 End;
                 print_cmd_chr(79,m);
                 Begin
                   help_ptr := 4;
                   help_line[3] := 690;
                   help_line[2] := 691;
                   help_line[1] := 692;
                   help_line[0] := 693;
                 End;
                 error;
                 If level<>5 Then
                   Begin
                     cur_val := 0;
                     cur_val_level := 1;
                   End
                 Else
                   Begin
                     cur_val := 0;
                     cur_val_level := 0;
                   End;
               End
        Else If m=1 Then
               Begin
                 cur_val := cur_list.aux_field.int;
                 cur_val_level := 1;
               End
        Else
          Begin
            cur_val := cur_list.aux_field.hh.lh;
            cur_val_level := 0;
          End{:418};
    80:{422:}If cur_list.mode_field=0 Then
               Begin
                 cur_val := 0;
                 cur_val_level := 0;
               End
        Else
          Begin
            nest[nest_ptr] := cur_list;
            p := nest_ptr;
            While abs(nest[p].mode_field)<>1 Do
              p := p-1;
            Begin
              cur_val := nest[p].pg_field;
              cur_val_level := 0;
            End;
          End{:422};
    82:{419:}
        Begin
          If m=0 Then cur_val := dead_cycles{1425:}
          Else If m=2 Then
                 cur_val := interaction{:1425}
          Else cur_val := insert_penalties;
          cur_val_level := 0;
        End{:419};
    81:{421:}
        Begin
          If (page_contents=0)And(Not output_active)Then If m=0 Then
                                                           cur_val := 1073741823
          Else cur_val := 0
          Else cur_val := page_so_far[m];
          cur_val_level := 1;
        End{:421};
    84:{423:}
        Begin
          If m>3412 Then{1601:}
            Begin
              scan_int;
              If (eqtb[m].hh.rh=0)Or(cur_val<0)Then cur_val := 0
              Else
                Begin
                  If cur_val>
                     mem[eqtb[m].hh.rh+1].int Then cur_val := mem[eqtb[m].hh.rh+1].int;
                  cur_val := mem[eqtb[m].hh.rh+cur_val+1].int;
                End;
            End{:1601}
          Else If eqtb[3412].hh.rh=0 Then cur_val := 0
          Else cur_val := mem[
                          eqtb[3412].hh.rh].hh.lh;
          cur_val_level := 0;
        End{:423};
    83:{420:}
        Begin
          scan_register_num;
          If cur_val<256 Then q := eqtb[3683+cur_val].hh.rh
          Else
            Begin
              find_sa_element(4,cur_val,false);
              If cur_ptr=0 Then q := 0
              Else q := mem[cur_ptr+1].hh.rh;
            End;
          If q=0 Then cur_val := 0
          Else cur_val := mem[q+m].int;
          cur_val_level := 1;
        End{:420};
    68,69:
           Begin
             cur_val := cur_chr;
             cur_val_level := 0;
           End;
    77:{425:}
        Begin
          find_font_dimen(false);
          font_info[fmem_ptr].int := 0;
          Begin
            cur_val := font_info[cur_val].int;
            cur_val_level := 1;
          End;
        End{:425};
    78:{426:}
        Begin
          scan_font_ident;
          If m=0 Then
            Begin
              cur_val := hyphen_char[cur_val];
              cur_val_level := 0;
            End
          Else
            Begin
              cur_val := skew_char[cur_val];
              cur_val_level := 0;
            End;
        End{:426};
    89:{427:}
        Begin
          If (m<0)Or(m>19)Then
            Begin
              cur_val_level := (mem[m].hh.b0
                               Div 16);
              If cur_val_level<2 Then cur_val := mem[m+2].int
              Else cur_val := mem[m+1].hh.
                              rh;
            End
          Else
            Begin
              scan_register_num;
              cur_val_level := m-0;
              If cur_val>255 Then
                Begin
                  find_sa_element(cur_val_level,cur_val,false);
                  If cur_ptr=0 Then If cur_val_level<2 Then cur_val := 0
                  Else cur_val := 0
                  Else If cur_val_level<2 Then cur_val := mem[cur_ptr+2].int
                  Else cur_val :=
                                  mem[cur_ptr+1].hh.rh;
                End
              Else Case cur_val_level Of
                     0: cur_val := eqtb[5333+cur_val].int;
                     1: cur_val := eqtb[5866+cur_val].int;
                     2: cur_val := eqtb[2900+cur_val].hh.rh;
                     3: cur_val := eqtb[3156+cur_val].hh.rh;
                End;
            End;
        End{:427};
    70:{424:}If m>=4 Then If m>=23 Then{1515:}
                            Begin
                              If m<24 Then
                                Begin
                                  Case
                                       m Of {1542:}
                                    23: scan_mu_glue;{:1542}
                                  End;
                                  cur_val_level := 2;
                                End
                              Else If m<25 Then
                                     Begin
                                       Case m Of {1543:}
                                         24: scan_normal_glue;
{:1543}
                                       End;
                                       cur_val_level := 3;
                                     End
                              Else
                                Begin
                                  cur_val_level := m-25;
                                  scan_expr;
                                End;
                              While cur_val_level>level Do
                                Begin
                                  If cur_val_level=2 Then
                                    Begin
                                      m :=
                                           cur_val;
                                      cur_val := mem[m+1].int;
                                      delete_glue_ref(m);
                                    End
                                  Else If cur_val_level=3 Then mu_error;
                                  cur_val_level := cur_val_level-1;
                                End;
                              If negative Then If cur_val_level>=2 Then
                                                 Begin
                                                   m := cur_val;
                                                   cur_val := new_spec(m);
                                                   delete_glue_ref(m);
{431:}
                                                   Begin
                                                     mem[cur_val+1].int := -mem[cur_val+1].int;
                                                     mem[cur_val+2].int := -mem[cur_val+2].int;
                                                     mem[cur_val+3].int := -mem[cur_val+3].int;
                                                   End{:431};
                                                 End
                              Else cur_val := -cur_val;
                              goto 10;
                            End{:1515}
        Else If m>=14 Then
               Begin
                 Case m Of {1402:}
                   14,15,16,17:
                                Begin
                                  scan_font_ident;
                                  q := cur_val;
                                  scan_char_num;
                                  If (font_bc[q]<=cur_val)And(font_ec[q]>=cur_val)Then
                                    Begin
                                      i := font_info[
                                           char_base[q]+cur_val+0].qqqq;
                                      Case m Of
                                        14: cur_val := font_info[width_base[q]+i.b0].int;
                                        15: cur_val := font_info[height_base[q]+(i.b1-0)Div 16].int;
                                        16: cur_val := font_info[depth_base[q]+(i.b1-0)Mod 16].int;
                                        17: cur_val := font_info[italic_base[q]+(i.b2-0)Div 4].int;
                                      End;
                                    End
                                  Else cur_val := 0;
                                End;{:1402}{1405:}
                   18,19,20:
                             Begin
                               q := cur_chr-18;
                               scan_int;
                               If (eqtb[3412].hh.rh=0)Or(cur_val<=0)Then cur_val := 0
                               Else
                                 Begin
                                   If q=2
                                     Then
                                     Begin
                                       q := cur_val Mod 2;
                                       cur_val := (cur_val+q)Div 2;
                                     End;
                                   If cur_val>mem[eqtb[3412].hh.rh].hh.lh Then cur_val := mem[eqtb[
                                                                                          3412].hh.
                                                                                          rh].hh.lh;
                                   cur_val := mem[eqtb[3412].hh.rh+2*cur_val-q].int;
                                 End;
                               cur_val_level := 1;
                             End;{:1405}{1539:}
                   21,22:
                          Begin
                            scan_normal_glue;
                            q := cur_val;
                            If m=21 Then cur_val := mem[q+2].int
                            Else cur_val := mem[q+3].int;
                            delete_glue_ref(q);
                          End;{:1539}
                 End;
                 cur_val_level := 1;
               End
        Else
          Begin
            Case m Of
              4: cur_val := line;
              5: cur_val := last_badness;
{1382:}
              6: cur_val := 2;{:1382}{1396:}
              7: cur_val := cur_level-1;
              8: cur_val := cur_group;{:1396}{1399:}
              9:
                 Begin
                   q := cond_ptr;
                   cur_val := 0;
                   While q<>0 Do
                     Begin
                       cur_val := cur_val+1;
                       q := mem[q].hh.rh;
                     End;
                 End;
              10: If cond_ptr=0 Then cur_val := 0
                  Else If cur_if<32 Then cur_val := cur_if
                                                    +1
                  Else cur_val := -(cur_if-31);
              11: If (if_limit=4)Or(if_limit=3)Then cur_val := 1
                  Else If if_limit=2 Then
                         cur_val := -1
                  Else cur_val := 0;{:1399}{1538:}
              12,13:
                     Begin
                       scan_normal_glue;
                       q := cur_val;
                       If m=12 Then cur_val := mem[q].hh.b0
                       Else cur_val := mem[q].hh.b1;
                       delete_glue_ref(q);
                     End;{:1538}
            End;
            cur_val_level := 0;
          End
        Else
          Begin
            If cur_chr=2 Then cur_val := 0
            Else cur_val := 0;
            tx := cur_list.tail_field;
            If Not(tx>=hi_mem_min)Then If (mem[tx].hh.b0=9)And(mem[tx].hh.b1=3)Then
                                         Begin
                                           r := cur_list.head_field;
                                           Repeat
                                             q := r;
                                             r := mem[q].hh.rh;
                                           Until r=tx;
                                           tx := q;
                                         End;
            If cur_chr=3 Then
              Begin
                cur_val_level := 0;
                If (tx=cur_list.head_field)Or(cur_list.mode_field=0)Then cur_val := -1;
              End
            Else cur_val_level := cur_chr;
            If Not(tx>=hi_mem_min)And(cur_list.mode_field<>0)Then Case cur_chr Of
                                                                    0:
                                                                       If mem[tx].hh.b0=12 Then
                                                                         cur_val := mem[tx+1].int;
                                                                    1: If mem[tx].hh.b0=11 Then
                                                                         cur_val := mem[tx+1].int;
                                                                    2: If mem[tx].hh.b0=10 Then
                                                                         Begin
                                                                           cur_val := mem[tx+1].hh.
                                                                                      lh;
                                                                           If mem[tx].hh.b1=99 Then
                                                                             cur_val_level := 3;
                                                                         End;
                                                                    3: If mem[tx].hh.b0<=13 Then
                                                                         cur_val := mem[tx].hh.b0+1
                                                                       Else cur_val := 15;
              End
            Else If (cur_list.mode_field=1)And(tx=cur_list.head_field)Then Case
                                                                                cur_chr Of
                                                                             0: cur_val :=
                                                                                        last_penalty
                                                                             ;
                                                                             1: cur_val := last_kern
                                                                             ;
                                                                             2: If last_glue<>65535
                                                                                  Then cur_val :=
                                                                                           last_glue
                                                                             ;
                                                                             3: cur_val :=
                                                                                      last_node_type
                                                                             ;
                   End;
          End{:424};
    others:{428:}
            Begin
              Begin
                If interaction=3 Then;
                print_nl(263);
                print(694);
              End;
              print_cmd_chr(cur_cmd,cur_chr);
              print(695);
              print_esc(541);
              Begin
                help_ptr := 1;
                help_line[0] := 693;
              End;
              error;
              If level<>5 Then
                Begin
                  cur_val := 0;
                  cur_val_level := 1;
                End
              Else
                Begin
                  cur_val := 0;
                  cur_val_level := 0;
                End;
            End{:428}
  End;
  While cur_val_level>level Do{429:}
    Begin
      If cur_val_level=2 Then cur_val
        := mem[cur_val+1].int
      Else If cur_val_level=3 Then mu_error;
      cur_val_level := cur_val_level-1;
    End{:429};
{430:}
  If negative Then If cur_val_level>=2 Then
                     Begin
                       cur_val := new_spec(
                                  cur_val);{431:}
                       Begin
                         mem[cur_val+1].int := -mem[cur_val+1].int;
                         mem[cur_val+2].int := -mem[cur_val+2].int;
                         mem[cur_val+3].int := -mem[cur_val+3].int;
                       End{:431};
                     End
  Else cur_val := -cur_val
  Else If (cur_val_level>=2)And(cur_val_level<=3
          )Then mem[cur_val].hh.rh := mem[cur_val].hh.rh+1{:430};
  10:
End;
{:413}{440:}
Procedure scan_int;

Label 30;

Var negative: boolean;
  m: integer;
  d: small_number;
  vacuous: boolean;
  OK_so_far: boolean;
Begin
  radix := 0;
  OK_so_far := true;{441:}
  negative := false;
  Repeat{406:}
    Repeat
      get_x_token;
    Until cur_cmd<>10{:406};
    If cur_tok=3117 Then
      Begin
        negative := Not negative;
        cur_tok := 3115;
      End;
  Until cur_tok<>3115{:441};
  If cur_tok=3168 Then{442:}
    Begin
      get_token;
      If cur_tok<4095 Then
        Begin
          cur_val := cur_chr;
          If cur_cmd<=2 Then If cur_cmd=2 Then align_state := align_state+1
          Else
            align_state := align_state-1;
        End
      Else If cur_tok<4352 Then cur_val := cur_tok-4096
      Else cur_val :=
                      cur_tok-4352;
      If cur_val>255 Then
        Begin
          Begin
            If interaction=3 Then;
            print_nl(263);
            print(707);
          End;
          Begin
            help_ptr := 2;
            help_line[1] := 708;
            help_line[0] := 709;
          End;
          cur_val := 48;
          back_error;
        End
      Else{443:}
        Begin
          get_x_token;
          If cur_cmd<>10 Then back_input;
        End{:443};
    End{:442}
  Else If (cur_cmd>=68)And(cur_cmd<=89)Then
         scan_something_internal(0,false)
  Else{444:}
    Begin
      radix := 10;
      m := 214748364;
      If cur_tok=3111 Then
        Begin
          radix := 8;
          m := 268435456;
          get_x_token;
        End
      Else If cur_tok=3106 Then
             Begin
               radix := 16;
               m := 134217728;
               get_x_token;
             End;
      vacuous := true;
      cur_val := 0;
{445:}
      While true Do
        Begin
          If (cur_tok<3120+radix)And(cur_tok>=3120)And(
             cur_tok<=3129)Then d := cur_tok-3120
          Else If radix=16 Then If (cur_tok<=
                                   2886)And(cur_tok>=2881)Then d := cur_tok-2871
          Else If (cur_tok<=3142)And(
                  cur_tok>=3137)Then d := cur_tok-3127
          Else goto 30
          Else goto 30;
          vacuous := false;
          If (cur_val>=m)And((cur_val>m)Or(d>7)Or(radix<>10))Then
            Begin
              If
                 OK_so_far Then
                Begin
                  Begin
                    If interaction=3 Then;
                    print_nl(263);
                    print(710);
                  End;
                  Begin
                    help_ptr := 2;
                    help_line[1] := 711;
                    help_line[0] := 712;
                  End;
                  error;
                  cur_val := 2147483647;
                  OK_so_far := false;
                End;
            End
          Else cur_val := cur_val*radix+d;
          get_x_token;
        End;
      30:{:445};
      If vacuous Then{446:}
        Begin
          Begin
            If interaction=3 Then;
            print_nl(263);
            print(673);
          End;
          Begin
            help_ptr := 3;
            help_line[2] := 674;
            help_line[1] := 675;
            help_line[0] := 676;
          End;
          back_error;
        End{:446}
      Else If cur_cmd<>10 Then back_input;
    End{:444};
  If negative Then cur_val := -cur_val;
End;
{:440}{448:}
Procedure scan_dimen(mu,inf,shortcut:boolean);

Label 30,31,32,40,45,88,89;

Var negative: boolean;
  f: integer;
{450:}
  num,denom: 1..65536;
  k,kk: small_number;
  p,q: halfword;
  v: scaled;
  save_cur_val: integer;{:450}
Begin
  f := 0;
  arith_error := false;
  cur_order := 0;
  negative := false;
  If Not shortcut Then
    Begin{441:}
      negative := false;
      Repeat{406:}
        Repeat
          get_x_token;
        Until cur_cmd<>10{:406};
        If cur_tok=3117 Then
          Begin
            negative := Not negative;
            cur_tok := 3115;
          End;
      Until cur_tok<>3115{:441};
      If (cur_cmd>=68)And(cur_cmd<=89)Then{449:}If mu Then
                                                  Begin
                                                    scan_something_internal(3,false);
{451:}
                                                    If cur_val_level>=2 Then
                                                      Begin
                                                        v := mem[cur_val+1].int;
                                                        delete_glue_ref(cur_val);
                                                        cur_val := v;
                                                      End{:451};
                                                    If cur_val_level=3 Then goto 89;
                                                    If cur_val_level<>0 Then mu_error;
                                                  End
      Else
        Begin
          scan_something_internal(1,false);
          If cur_val_level=1 Then goto 89;
        End{:449}
      Else
        Begin
          back_input;
          If cur_tok=3116 Then cur_tok := 3118;
          If cur_tok<>3118 Then scan_int
          Else
            Begin
              radix := 10;
              cur_val := 0;
            End;
          If cur_tok=3116 Then cur_tok := 3118;
          If (radix=10)And(cur_tok=3118)Then{452:}
            Begin
              k := 0;
              p := 0;
              get_token;
              While true Do
                Begin
                  get_x_token;
                  If (cur_tok>3129)Or(cur_tok<3120)Then goto 31;
                  If k<17 Then
                    Begin
                      q := get_avail;
                      mem[q].hh.rh := p;
                      mem[q].hh.lh := cur_tok-3120;
                      p := q;
                      k := k+1;
                    End;
                End;
              31: For kk:=k Downto 1 Do
                    Begin
                      dig[kk-1] := mem[p].hh.lh;
                      q := p;
                      p := mem[p].hh.rh;
                      Begin
                        mem[q].hh.rh := avail;
                        avail := q;
{dyn_used:=dyn_used-1;}
                      End;
                    End;
              f := round_decimals(k);
              If cur_cmd<>10 Then back_input;
            End{:452};
        End;
    End;
  If cur_val<0 Then
    Begin
      negative := Not negative;
      cur_val := -cur_val;
    End;
{453:}
  If inf Then{454:}If scan_keyword(312)Then
                     Begin
                       cur_order := 1;
                       While scan_keyword(108) Do
                         Begin
                           If cur_order=3 Then
                             Begin
                               Begin
                                 If
                                    interaction=3 Then;
                                 print_nl(263);
                                 print(714);
                               End;
                               print(715);
                               Begin
                                 help_ptr := 1;
                                 help_line[0] := 716;
                               End;
                               error;
                             End
                           Else cur_order := cur_order+1;
                         End;
                       goto 88;
                     End{:454};
{455:}
  save_cur_val := cur_val;{406:}
  Repeat
    get_x_token;
  Until cur_cmd<>10{:406};
  If (cur_cmd<68)Or(cur_cmd>89)Then back_input
  Else
    Begin
      If mu Then
        Begin
          scan_something_internal(3,false);
{451:}
          If cur_val_level>=2 Then
            Begin
              v := mem[cur_val+1].int;
              delete_glue_ref(cur_val);
              cur_val := v;
            End{:451};
          If cur_val_level<>3 Then mu_error;
        End
      Else scan_something_internal(1,false);
      v := cur_val;
      goto 40;
    End;
  If mu Then goto 45;
  If scan_keyword(717)Then v := ({558:}font_info[6+param_base[eqtb[3939].hh.
                                rh]].int{:558})
  Else If scan_keyword(718)Then v := ({559:}font_info[5+
                                     param_base[eqtb[3939].hh.rh]].int{:559})
  Else goto 45;
{443:}
  Begin
    get_x_token;
    If cur_cmd<>10 Then back_input;
  End{:443};
  40: cur_val := mult_and_add(save_cur_val,v,xn_over_d(v,f,65536),1073741823)
  ;
  goto 89;
  45:{:455};
  If mu Then{456:}If scan_keyword(338)Then goto 88
  Else
    Begin
      Begin
        If
           interaction=3 Then;
        print_nl(263);
        print(714);
      End;
      print(719);
      Begin
        help_ptr := 4;
        help_line[3] := 720;
        help_line[2] := 721;
        help_line[1] := 722;
        help_line[0] := 723;
      End;
      error;
      goto 88;
    End{:456};
  If scan_keyword(713)Then{457:}
    Begin
      prepare_mag;
      If eqtb[5285].int<>1000 Then
        Begin
          cur_val := xn_over_d(cur_val,1000,eqtb[
                     5285].int);
          f := (1000*f+65536*remainder)Div eqtb[5285].int;
          cur_val := cur_val+(f Div 65536);
          f := f Mod 65536;
        End;
    End{:457};
  If scan_keyword(400)Then goto 88;
{458:}
  If scan_keyword(724)Then
    Begin
      num := 7227;
      denom := 100;
    End
  Else If scan_keyword(725)Then
         Begin
           num := 12;
           denom := 1;
         End
  Else If scan_keyword(726)Then
         Begin
           num := 7227;
           denom := 254;
         End
  Else If scan_keyword(727)Then
         Begin
           num := 7227;
           denom := 2540;
         End
  Else If scan_keyword(728)Then
         Begin
           num := 7227;
           denom := 7200;
         End
  Else If scan_keyword(729)Then
         Begin
           num := 1238;
           denom := 1157;
         End
  Else If scan_keyword(730)Then
         Begin
           num := 14856;
           denom := 1157;
         End
  Else If scan_keyword(731)Then goto 30
  Else{459:}
    Begin
      Begin
        If
           interaction=3 Then;
        print_nl(263);
        print(714);
      End;
      print(732);
      Begin
        help_ptr := 6;
        help_line[5] := 733;
        help_line[4] := 734;
        help_line[3] := 735;
        help_line[2] := 721;
        help_line[1] := 722;
        help_line[0] := 723;
      End;
      error;
      goto 32;
    End{:459};
  cur_val := xn_over_d(cur_val,num,denom);
  f := (num*f+65536*remainder)Div denom;
  cur_val := cur_val+(f Div 65536);
  f := f Mod 65536;
  32:{:458};
  88: If cur_val>=16384 Then arith_error := true
      Else cur_val := cur_val*65536+
                      f;
  30:{:453};{443:}
  Begin
    get_x_token;
    If cur_cmd<>10 Then back_input;
  End{:443};
  89: If arith_error Or(abs(cur_val)>=1073741824)Then{460:}
        Begin
          Begin
            If
               interaction=3 Then;
            print_nl(263);
            print(736);
          End;
          Begin
            help_ptr := 2;
            help_line[1] := 737;
            help_line[0] := 738;
          End;
          error;
          cur_val := 1073741823;
          arith_error := false;
        End{:460};
  If negative Then cur_val := -cur_val;
End;
{:448}{461:}
Procedure scan_glue(level:small_number);

Label 10;

Var negative: boolean;
  q: halfword;
  mu: boolean;
Begin
  mu := (level=3);
{441:}
  negative := false;
  Repeat{406:}
    Repeat
      get_x_token;
    Until cur_cmd<>10{:406};
    If cur_tok=3117 Then
      Begin
        negative := Not negative;
        cur_tok := 3115;
      End;
  Until cur_tok<>3115{:441};
  If (cur_cmd>=68)And(cur_cmd<=89)Then
    Begin
      scan_something_internal(level,
                              negative);
      If cur_val_level>=2 Then
        Begin
          If cur_val_level<>level Then mu_error;
          goto 10;
        End;
      If cur_val_level=0 Then scan_dimen(mu,false,true)
      Else If level=3 Then
             mu_error;
    End
  Else
    Begin
      back_input;
      scan_dimen(mu,false,false);
      If negative Then cur_val := -cur_val;
    End;{462:}
  q := new_spec(0);
  mem[q+1].int := cur_val;
  If scan_keyword(739)Then
    Begin
      scan_dimen(mu,true,false);
      mem[q+2].int := cur_val;
      mem[q].hh.b0 := cur_order;
    End;
  If scan_keyword(740)Then
    Begin
      scan_dimen(mu,true,false);
      mem[q+3].int := cur_val;
      mem[q].hh.b1 := cur_order;
    End;
  cur_val := q{:462};
  10:
End;{1517:}{1528:}
Function add_or_sub(x,y,max_answer:integer;
                    negative:boolean): integer;

Var a: integer;
Begin
  If negative Then y := -y;
  If x>=0 Then If y<=max_answer-x Then a := x+y
  Else
    Begin
      arith_error := true
      ;
      a := 0;
    End
  Else If y>=-max_answer-x Then a := x+y
  Else
    Begin
      arith_error := true;
      a := 0;
    End;
  add_or_sub := a;
End;
{:1528}{1532:}
Function quotient(n,d:integer): integer;

Var negative: boolean;
  a: integer;
Begin
  If d=0 Then
    Begin
      arith_error := true;
      a := 0;
    End
  Else
    Begin
      If d>0 Then negative := false
      Else
        Begin
          d := -d;
          negative := true;
        End;
      If n<0 Then
        Begin
          n := -n;
          negative := Not negative;
        End;
      a := n Div d;
      n := n-a*d;
      d := n-d;
      If d+n>=0 Then a := a+1;
      If negative Then a := -a;
    End;
  quotient := a;
End;
{:1532}{1534:}
Function fract(x,n,d,max_answer:integer): integer;

Label 40,41,88,30;

Var negative: boolean;
  a: integer;
  f: integer;
  h: integer;
  r: integer;
  t: integer;
Begin
  If d=0 Then goto 88;
  a := 0;
  If d>0 Then negative := false
  Else
    Begin
      d := -d;
      negative := true;
    End;
  If x<0 Then
    Begin
      x := -x;
      negative := Not negative;
    End
  Else If x=0 Then goto 30;
  If n<0 Then
    Begin
      n := -n;
      negative := Not negative;
    End;
  t := n Div d;
  If t>max_answer Div x Then goto 88;
  a := t*x;
  n := n-t*d;
  If n=0 Then goto 40;
  t := x Div d;
  If t>(max_answer-a)Div n Then goto 88;
  a := a+t*n;
  x := x-t*d;
  If x=0 Then goto 40;
  If x<n Then
    Begin
      t := x;
      x := n;
      n := t;
    End;{1535:}
  f := 0;
  r := (d Div 2)-d;
  h := -r;
  While true Do
    Begin
      If odd(n)Then
        Begin
          r := r+x;
          If r>=0 Then
            Begin
              r := r-d;
              f := f+1;
            End;
        End;
      n := n Div 2;
      If n=0 Then goto 41;
      If x<h Then x := x+x
      Else
        Begin
          t := x-d;
          x := t+x;
          f := f+n;
          If x<n Then
            Begin
              If x=0 Then goto 41;
              t := x;
              x := n;
              n := t;
            End;
        End;
    End;
  41:{:1535}If f>(max_answer-a)Then goto 88;
  a := a+f;
  40: If negative Then a := -a;
  goto 30;
  88:
      Begin
        arith_error := true;
        a := 0;
      End;
  30: fract := a;
End;{:1534}
Procedure scan_expr;

Label 20,22,40;

Var a,b: boolean;
  l: small_number;
  r: small_number;
  s: small_number;
  o: small_number;
  e: integer;
  t: integer;
  f: integer;
  n: integer;
  p: halfword;
  q: halfword;
Begin
  l := cur_val_level;
  a := arith_error;
  b := false;
  p := 0;
  expand_depth_count := expand_depth_count+1;
  If expand_depth_count>=expand_depth Then overflow(1394,expand_depth);
{1518:}
  20: r := 0;
  e := 0;
  s := 0;
  t := 0;
  n := 0;
  22: If s=0 Then o := l
      Else o := 0;
{1520:}{406:}
  Repeat
    get_x_token;
  Until cur_cmd<>10{:406};
  If cur_tok=3112 Then{1523:}
    Begin
      q := get_node(4);
      mem[q].hh.rh := p;
      mem[q].hh.b0 := l;
      mem[q].hh.b1 := 4*s+r;
      mem[q+1].int := e;
      mem[q+2].int := t;
      mem[q+3].int := n;
      p := q;
      l := o;
      goto 20;
    End{:1523};
  back_input;
  If o=0 Then scan_int
  Else If o=1 Then scan_dimen(false,false,false)
  Else
    If o=2 Then scan_normal_glue
  Else scan_mu_glue;
  f := cur_val{:1520};
  40:{1519:}{406:}Repeat
                    get_x_token;
      Until cur_cmd<>10{:406};
  If cur_tok=3115 Then o := 1
  Else If cur_tok=3117 Then o := 2
  Else If cur_tok
          =3114 Then o := 3
  Else If cur_tok=3119 Then o := 4
  Else
    Begin
      o := 0;
      If p=0 Then
        Begin
          If cur_cmd<>0 Then back_input;
        End
      Else If cur_tok<>3113 Then
             Begin
               Begin
                 If interaction=3 Then;
                 print_nl(263);
                 print(1396);
               End;
               Begin
                 help_ptr := 1;
                 help_line[0] := 1397;
               End;
               back_error;
             End;
    End{:1519};
  arith_error := b;
{1525:}
  If (l=0)Or(s>2)Then
    Begin
      If (f>2147483647)Or(f<-2147483647)Then
        Begin
          arith_error := true;
          f := 0;
        End;
    End
  Else If l=1 Then
         Begin
           If abs(f)>1073741823 Then
             Begin
               arith_error :=
                              true;
               f := 0;
             End;
         End
  Else
    Begin
      If (abs(mem[f+1].int)>1073741823)Or(abs(mem[f+2].int)>
         1073741823)Or(abs(mem[f+3].int)>1073741823)Then
        Begin
          arith_error := true;
          delete_glue_ref(f);
          f := new_spec(0);
        End;
    End{:1525};
  Case s Of {1526:}
    0: If (l>=2)And(o<>0)Then
         Begin
           t := new_spec(f);
           delete_glue_ref(f);
           If mem[t+2].int=0 Then mem[t].hh.b0 := 0;
           If mem[t+3].int=0 Then mem[t].hh.b1 := 0;
         End
       Else t := f;
{:1526}{1530:}
    3: If o=4 Then
         Begin
           n := f;
           o := 5;
         End
       Else If l=0 Then t := mult_and_add(t,f,0,2147483647)
       Else If l=1 Then t
              := mult_and_add(t,f,0,1073741823)
       Else
         Begin
           mem[t+1].int := mult_and_add(
                           mem[t+1].int,f,0,1073741823);
           mem[t+2].int := mult_and_add(mem[t+2].int,f,0,1073741823);
           mem[t+3].int := mult_and_add(mem[t+3].int,f,0,1073741823);
         End;
{:1530}{1531:}
    4: If l<2 Then t := quotient(t,f)
       Else
         Begin
           mem[t+1].int :=
                           quotient(mem[t+1].int,f);
           mem[t+2].int := quotient(mem[t+2].int,f);
           mem[t+3].int := quotient(mem[t+3].int,f);
         End;
{:1531}{1533:}
    5: If l=0 Then t := fract(t,n,f,2147483647)
       Else If l=1 Then t
              := fract(t,n,f,1073741823)
       Else
         Begin
           mem[t+1].int := fract(mem[t+1].int,n,f
                           ,1073741823);
           mem[t+2].int := fract(mem[t+2].int,n,f,1073741823);
           mem[t+3].int := fract(mem[t+3].int,n,f,1073741823);
         End;{:1533}
  End;
  If o>2 Then s := o
  Else{1527:}
    Begin
      s := 0;
      If r=0 Then e := t
      Else If l=0 Then e := add_or_sub(e,t,2147483647,r=2)
      Else
        If l=1 Then e := add_or_sub(e,t,1073741823,r=2)
      Else{1529:}
        Begin
          mem[e+1].
          int := add_or_sub(mem[e+1].int,mem[t+1].int,1073741823,r=2);
          If mem[e].hh.b0=mem[t].hh.b0 Then mem[e+2].int := add_or_sub(mem[e+2].int,
                                                            mem[t+2].int,1073741823,r=2)
          Else If (mem[e].hh.b0<mem[t].hh.b0)And(mem[t
                  +2].int<>0)Then
                 Begin
                   mem[e+2].int := mem[t+2].int;
                   mem[e].hh.b0 := mem[t].hh.b0;
                 End;
          If mem[e].hh.b1=mem[t].hh.b1 Then mem[e+3].int := add_or_sub(mem[e+3].int,
                                                            mem[t+3].int,1073741823,r=2)
          Else If (mem[e].hh.b1<mem[t].hh.b1)And(mem[t
                  +3].int<>0)Then
                 Begin
                   mem[e+3].int := mem[t+3].int;
                   mem[e].hh.b1 := mem[t].hh.b1;
                 End;
          delete_glue_ref(t);
          If mem[e+2].int=0 Then mem[e].hh.b0 := 0;
          If mem[e+3].int=0 Then mem[e].hh.b1 := 0;
        End{:1529};
      r := o;
    End{:1527};
  b := arith_error;
  If o<>0 Then goto 22;
  If p<>0 Then{1524:}
    Begin
      f := e;
      q := p;
      e := mem[q+1].int;
      t := mem[q+2].int;
      n := mem[q+3].int;
      s := mem[q].hh.b1 Div 4;
      r := mem[q].hh.b1 Mod 4;
      l := mem[q].hh.b0;
      p := mem[q].hh.rh;
      free_node(q,4);
      goto 40;
    End{:1524}{:1518};
  expand_depth_count := expand_depth_count-1;
  If b Then
    Begin
      Begin
        If interaction=3 Then;
        print_nl(263);
        print(1223);
      End;
      Begin
        help_ptr := 2;
        help_line[1] := 1395;
        help_line[0] := 1225;
      End;
      error;
      If l>=2 Then
        Begin
          delete_glue_ref(e);
          e := 0;
          mem[e].hh.rh := mem[e].hh.rh+1;
        End
      Else e := 0;
    End;
  arith_error := a;
  cur_val := e;
  cur_val_level := l;
End;
{:1517}{1522:}
Procedure scan_normal_glue;
Begin
  scan_glue(2);
End;
Procedure scan_mu_glue;
Begin
  scan_glue(3);
End;
{:1522}{:461}{463:}
Function scan_rule_spec: halfword;

Label 21;

Var q: halfword;
Begin
  q := new_rule;
  If cur_cmd=35 Then mem[q+1].int := 26214
  Else
    Begin
      mem[q+3].int := 26214;
      mem[q+2].int := 0;
    End;
  21: If scan_keyword(741)Then
        Begin
          scan_dimen(false,false,false);
          mem[q+1].int := cur_val;
          goto 21;
        End;
  If scan_keyword(742)Then
    Begin
      scan_dimen(false,false,false);
      mem[q+3].int := cur_val;
      goto 21;
    End;
  If scan_keyword(743)Then
    Begin
      scan_dimen(false,false,false);
      mem[q+2].int := cur_val;
      goto 21;
    End;
  scan_rule_spec := q;
End;
{:463}{464:}{1414:}
Procedure scan_general_text;

Label 40;

Var s: 0..5;
  w: halfword;
  d: halfword;
  p: halfword;
  q: halfword;
  unbalance: halfword;
Begin
  s := scanner_status;
  w := warning_index;
  d := def_ref;
  scanner_status := 5;
  warning_index := cur_cs;
  def_ref := get_avail;
  mem[def_ref].hh.lh := 0;
  p := def_ref;
  scan_left_brace;
  unbalance := 1;
  While true Do
    Begin
      get_token;
      If cur_tok<768 Then If cur_cmd<2 Then unbalance := unbalance+1
      Else
        Begin
          unbalance := unbalance-1;
          If unbalance=0 Then goto 40;
        End;
      Begin
        q := get_avail;
        mem[p].hh.rh := q;
        mem[q].hh.lh := cur_tok;
        p := q;
      End;
    End;
  40: q := mem[def_ref].hh.rh;
  Begin
    mem[def_ref].hh.rh := avail;
    avail := def_ref;
{dyn_used:=dyn_used-1;}
  End;
  If q=0 Then cur_val := 29997
  Else cur_val := p;
  mem[29997].hh.rh := q;
  scanner_status := s;
  warning_index := w;
  def_ref := d;
End;
{:1414}{1488:}
Procedure pseudo_start;

Var old_setting: 0..21;
  s: str_number;
  l,m: pool_pointer;
  p,q,r: halfword;
  w: four_quarters;
  nl,sz: integer;
Begin
  scan_general_text;
  old_setting := selector;
  selector := 21;
  token_show(29997);
  selector := old_setting;
  flush_list(mem[29997].hh.rh);
  Begin
    If pool_ptr+1>pool_size Then overflow(258,pool_size-init_pool_ptr)
    ;
  End;
  s := make_string;{1489:}
  str_pool[pool_ptr] := 32;
  l := str_start[s];
  nl := eqtb[5317].int;
  p := get_avail;
  q := p;
  While l<pool_ptr Do
    Begin
      m := l;
      While (l<pool_ptr)And(str_pool[l]<>nl) Do
        l := l+1;
      sz := (l-m+7)Div 4;
      If sz=1 Then sz := 2;
      r := get_node(sz);
      mem[q].hh.rh := r;
      q := r;
      mem[q].hh.lh := sz+0;
      While sz>2 Do
        Begin
          sz := sz-1;
          r := r+1;
          w.b0 := str_pool[m]+0;
          w.b1 := str_pool[m+1]+0;
          w.b2 := str_pool[m+2]+0;
          w.b3 := str_pool[m+3]+0;
          mem[r].qqqq := w;
          m := m+4;
        End;
      w.b0 := 32;
      w.b1 := 32;
      w.b2 := 32;
      w.b3 := 32;
      If l>m Then
        Begin
          w.b0 := str_pool[m]+0;
          If l>m+1 Then
            Begin
              w.b1 := str_pool[m+1]+0;
              If l>m+2 Then
                Begin
                  w.b2 := str_pool[m+2]+0;
                  If l>m+3 Then w.b3 := str_pool[m+3]+0;
                End;
            End;
        End;
      mem[r+1].qqqq := w;
      If str_pool[l]=nl Then l := l+1;
    End;
  mem[p].hh.lh := mem[p].hh.rh;
  mem[p].hh.rh := pseudo_files;
  pseudo_files := p{:1489};
  Begin
    str_ptr := str_ptr-1;
    pool_ptr := str_start[str_ptr];
  End;
{1490:}
  begin_file_reading;
  line := 0;
  cur_input.limit_field := cur_input.start_field;
  cur_input.loc_field := cur_input.limit_field+1;
  If eqtb[5326].int>0 Then
    Begin
      If term_offset>max_print_line-3 Then
        print_ln
      Else If (term_offset>0)Or(file_offset>0)Then print_char(32);
      cur_input.name_field := 19;
      print(1380);
      open_parens := open_parens+1;
      break(term_out);
    End
  Else cur_input.name_field := 18{:1490};
End;
{:1488}
Function str_toks(b:pool_pointer): halfword;

Var p: halfword;
  q: halfword;
  t: halfword;
  k: pool_pointer;
Begin
  Begin
    If pool_ptr+1>pool_size Then overflow(258,pool_size-
                                          init_pool_ptr);
  End;
  p := 29997;
  mem[p].hh.rh := 0;
  k := b;
  While k<pool_ptr Do
    Begin
      t := str_pool[k];
      If t=32 Then t := 2592
      Else t := 3072+t;
      Begin
        Begin
          q := avail;
          If q=0 Then q := get_avail
          Else
            Begin
              avail := mem[q].hh.rh;
              mem[q].hh.rh := 0;
{dyn_used:=dyn_used+1;}
            End;
        End;
        mem[p].hh.rh := q;
        mem[q].hh.lh := t;
        p := q;
      End;
      k := k+1;
    End;
  pool_ptr := b;
  str_toks := p;
End;
{:464}{465:}
Function the_toks: halfword;

Label 10;

Var old_setting: 0..21;
  p,q,r: halfword;
  b: pool_pointer;
  c: small_number;
Begin{1419:}
  If odd(cur_chr)Then
    Begin
      c := cur_chr;
      scan_general_text;
      If c=1 Then the_toks := cur_val
      Else
        Begin
          old_setting := selector;
          selector := 21;
          b := pool_ptr;
          p := get_avail;
          mem[p].hh.rh := mem[29997].hh.rh;
          token_show(p);
          flush_list(p);
          selector := old_setting;
          the_toks := str_toks(b);
        End;
      goto 10;
    End{:1419};
  get_x_token;
  scan_something_internal(5,false);
  If cur_val_level>=4 Then{466:}
    Begin
      p := 29997;
      mem[p].hh.rh := 0;
      If cur_val_level=4 Then
        Begin
          q := get_avail;
          mem[p].hh.rh := q;
          mem[q].hh.lh := 4095+cur_val;
          p := q;
        End
      Else If cur_val<>0 Then
             Begin
               r := mem[cur_val].hh.rh;
               While r<>0 Do
                 Begin
                   Begin
                     Begin
                       q := avail;
                       If q=0 Then q := get_avail
                       Else
                         Begin
                           avail := mem[q].hh.rh;
                           mem[q].hh.rh := 0;
{dyn_used:=dyn_used+1;}
                         End;
                     End;
                     mem[p].hh.rh := q;
                     mem[q].hh.lh := mem[r].hh.lh;
                     p := q;
                   End;
                   r := mem[r].hh.rh;
                 End;
             End;
      the_toks := p;
    End{:466}
  Else
    Begin
      old_setting := selector;
      selector := 21;
      b := pool_ptr;
      Case cur_val_level Of
        0: print_int(cur_val);
        1:
           Begin
             print_scaled(cur_val);
             print(400);
           End;
        2:
           Begin
             print_spec(cur_val,400);
             delete_glue_ref(cur_val);
           End;
        3:
           Begin
             print_spec(cur_val,338);
             delete_glue_ref(cur_val);
           End;
      End;
      selector := old_setting;
      the_toks := str_toks(b);
    End;
  10:
End;
{:465}{467:}
Procedure ins_the_toks;
Begin
  mem[29988].hh.rh := the_toks;
  begin_token_list(mem[29997].hh.rh,4);
End;
{:467}{470:}
Procedure conv_toks;

Var old_setting: 0..21;
  c: 0..6;
  save_scanner_status: small_number;
  b: pool_pointer;
Begin
  c := cur_chr;
{471:}
  Case c Of
    0,1: scan_int;
    2,3:
         Begin
           save_scanner_status := scanner_status;
           scanner_status := 0;
           get_token;
           scanner_status := save_scanner_status;
         End;
    4: scan_font_ident;
    5:;
    6: If job_name=0 Then open_log_file;
  End{:471};
  old_setting := selector;
  selector := 21;
  b := pool_ptr;{472:}
  Case c Of
    0: print_int(cur_val);
    1: print_roman_int(cur_val);
    2: If cur_cs<>0 Then sprint_cs(cur_cs)
       Else print_char(cur_chr);
    3: print_meaning;
    4:
       Begin
         print(font_name[cur_val]);
         If font_size[cur_val]<>font_dsize[cur_val]Then
           Begin
             print(751);
             print_scaled(font_size[cur_val]);
             print(400);
           End;
       End;
    5: print(256);
    6: print(job_name);
  End{:472};
  selector := old_setting;
  mem[29988].hh.rh := str_toks(b);
  begin_token_list(mem[29997].hh.rh,4);
End;
{:470}{473:}
Function scan_toks(macro_def,xpand:boolean): halfword;

Label 40,22,30,31,32;

Var t: halfword;
  s: halfword;
  p: halfword;
  q: halfword;
  unbalance: halfword;
  hash_brace: halfword;
Begin
  If macro_def Then scanner_status := 2
  Else scanner_status := 5;
  warning_index := cur_cs;
  def_ref := get_avail;
  mem[def_ref].hh.lh := 0;
  p := def_ref;
  hash_brace := 0;
  t := 3120;
  If macro_def Then{474:}
    Begin
      While true Do
        Begin
          22: get_token;
          If cur_tok<768 Then goto 31;
          If cur_cmd=6 Then{476:}
            Begin
              s := 3328+cur_chr;
              get_token;
              If cur_tok<512 Then
                Begin
                  hash_brace := cur_tok;
                  Begin
                    q := get_avail;
                    mem[p].hh.rh := q;
                    mem[q].hh.lh := cur_tok;
                    p := q;
                  End;
                  Begin
                    q := get_avail;
                    mem[p].hh.rh := q;
                    mem[q].hh.lh := 3584;
                    p := q;
                  End;
                  goto 30;
                End;
              If t=3129 Then
                Begin
                  Begin
                    If interaction=3 Then;
                    print_nl(263);
                    print(754);
                  End;
                  Begin
                    help_ptr := 2;
                    help_line[1] := 755;
                    help_line[0] := 756;
                  End;
                  error;
                  goto 22;
                End
              Else
                Begin
                  t := t+1;
                  If cur_tok<>t Then
                    Begin
                      Begin
                        If interaction=3 Then;
                        print_nl(263);
                        print(757);
                      End;
                      Begin
                        help_ptr := 2;
                        help_line[1] := 758;
                        help_line[0] := 759;
                      End;
                      back_error;
                    End;
                  cur_tok := s;
                End;
            End{:476};
          Begin
            q := get_avail;
            mem[p].hh.rh := q;
            mem[q].hh.lh := cur_tok;
            p := q;
          End;
        End;
      31:
          Begin
            q := get_avail;
            mem[p].hh.rh := q;
            mem[q].hh.lh := 3584;
            p := q;
          End;
      If cur_cmd=2 Then{475:}
        Begin
          Begin
            If interaction=3 Then;
            print_nl(263);
            print(666);
          End;
          align_state := align_state+1;
          Begin
            help_ptr := 2;
            help_line[1] := 752;
            help_line[0] := 753;
          End;
          error;
          goto 40;
        End{:475};
      30:
    End{:474}
  Else scan_left_brace;{477:}
  unbalance := 1;
  While true Do
    Begin
      If xpand Then{478:}
        Begin
          While true Do
            Begin
              get_next;
              If cur_cmd>=111 Then If mem[mem[cur_chr].hh.rh].hh.lh=3585 Then
                                     Begin
                                       cur_cmd := 0;
                                       cur_chr := 257;
                                     End;
              If cur_cmd<=100 Then goto 32;
              If cur_cmd<>109 Then expand
              Else
                Begin
                  q := the_toks;
                  If mem[29997].hh.rh<>0 Then
                    Begin
                      mem[p].hh.rh := mem[29997].hh.rh;
                      p := q;
                    End;
                End;
            End;
          32: x_token
        End{:478}
      Else get_token;
      If cur_tok<768 Then If cur_cmd<2 Then unbalance := unbalance+1
      Else
        Begin
          unbalance := unbalance-1;
          If unbalance=0 Then goto 40;
        End
      Else If cur_cmd=6 Then If macro_def Then{479:}
                               Begin
                                 s := cur_tok;
                                 If xpand Then get_x_token
                                 Else get_token;
                                 If cur_cmd<>6 Then If (cur_tok<=3120)Or(cur_tok>t)Then
                                                      Begin
                                                        Begin
                                                          If
                                                             interaction=3 Then;
                                                          print_nl(263);
                                                          print(760);
                                                        End;
                                                        sprint_cs(warning_index);
                                                        Begin
                                                          help_ptr := 3;
                                                          help_line[2] := 761;
                                                          help_line[1] := 762;
                                                          help_line[0] := 763;
                                                        End;
                                                        back_error;
                                                        cur_tok := s;
                                                      End
                                 Else cur_tok := 1232+cur_chr;
                               End{:479};
      Begin
        q := get_avail;
        mem[p].hh.rh := q;
        mem[q].hh.lh := cur_tok;
        p := q;
      End;
    End{:477};
  40: scanner_status := 0;
  If hash_brace<>0 Then
    Begin
      q := get_avail;
      mem[p].hh.rh := q;
      mem[q].hh.lh := hash_brace;
      p := q;
    End;
  scan_toks := p;
End;
{:473}{482:}
Procedure read_toks(n:integer;r:halfword;j:halfword);

Label 30;

Var p: halfword;
  q: halfword;
  s: integer;
  m: small_number;
Begin
  scanner_status := 2;
  warning_index := r;
  def_ref := get_avail;
  mem[def_ref].hh.lh := 0;
  p := def_ref;
  Begin
    q := get_avail;
    mem[p].hh.rh := q;
    mem[q].hh.lh := 3584;
    p := q;
  End;
  If (n<0)Or(n>15)Then m := 16
  Else m := n;
  s := align_state;
  align_state := 1000000;
  Repeat{483:}
    begin_file_reading;
    cur_input.name_field := m+1;
    If read_open[m]=2 Then{484:}If interaction>1 Then If n<0 Then
                                                        Begin;
                                                          print(339);
                                                          term_input;
                                                        End
    Else
      Begin;
        print_ln;
        sprint_cs(r);
        Begin;
          print(61);
          term_input;
        End;
        n := -1;
      End
    Else fatal_error(764){:484}
    Else If read_open[m]=1 Then{485:}If
                                        input_ln(read_file[m],false)Then read_open[m] := 0
    Else
      Begin
        a_close(
                read_file[m]);
        read_open[m] := 2;
      End{:485}
    Else{486:}
      Begin
        If Not input_ln(read_file[m],true)Then
          Begin
            a_close(read_file[m]);
            read_open[m] := 2;
            If align_state<>1000000 Then
              Begin
                runaway;
                Begin
                  If interaction=3 Then;
                  print_nl(263);
                  print(765);
                End;
                print_esc(538);
                Begin
                  help_ptr := 1;
                  help_line[0] := 766;
                End;
                align_state := 1000000;
                cur_input.limit_field := 0;
                error;
              End;
          End;
      End{:486};
    cur_input.limit_field := last;
    If (eqtb[5316].int<0)Or(eqtb[5316].int>255)Then cur_input.limit_field :=
                                                                             cur_input.limit_field-1
    Else buffer[cur_input.limit_field] := eqtb[5316].
                                          int;
    first := cur_input.limit_field+1;
    cur_input.loc_field := cur_input.start_field;
    cur_input.state_field := 33;
{1496:}
    If j=1 Then
      Begin
        While cur_input.loc_field<=cur_input.
              limit_field Do
          Begin
            cur_chr := buffer[cur_input.loc_field];
            cur_input.loc_field := cur_input.loc_field+1;
            If cur_chr=32 Then cur_tok := 2592
            Else cur_tok := cur_chr+3072;
            Begin
              q := get_avail;
              mem[p].hh.rh := q;
              mem[q].hh.lh := cur_tok;
              p := q;
            End;
          End;
        goto 30;
      End{:1496};
    While true Do
      Begin
        get_token;
        If cur_tok=0 Then goto 30;
        If align_state<1000000 Then
          Begin
            Repeat
              get_token;
            Until cur_tok=0;
            align_state := 1000000;
            goto 30;
          End;
        Begin
          q := get_avail;
          mem[p].hh.rh := q;
          mem[q].hh.lh := cur_tok;
          p := q;
        End;
      End;
    30: end_file_reading{:483};
  Until align_state=1000000;
  cur_val := def_ref;
  scanner_status := 0;
  align_state := s;
End;{:482}{494:}
Procedure pass_text;

Label 30;

Var l: integer;
  save_scanner_status: small_number;
Begin
  save_scanner_status := scanner_status;
  scanner_status := 1;
  l := 0;
  skip_line := line;
  While true Do
    Begin
      get_next;
      If cur_cmd=106 Then
        Begin
          If l=0 Then goto 30;
          If cur_chr=2 Then l := l-1;
        End
      Else If cur_cmd=105 Then l := l+1;
    End;
  30: scanner_status := save_scanner_status;
  If eqtb[5325].int>0 Then show_cur_cmd_chr;
End;
{:494}{497:}
Procedure change_if_limit(l:small_number;p:halfword);

Label 10;

Var q: halfword;
Begin
  If p=cond_ptr Then if_limit := l
  Else
    Begin
      q := cond_ptr;
      While true Do
        Begin
          If q=0 Then confusion(767);
          If mem[q].hh.rh=p Then
            Begin
              mem[q].hh.b0 := l;
              goto 10;
            End;
          q := mem[q].hh.rh;
        End;
    End;
  10:
End;{:497}{498:}
Procedure conditional;

Label 10,50;

Var b: boolean;
  r: 60..62;
  m,n: integer;
  p,q: halfword;
  save_scanner_status: small_number;
  save_cond_ptr: halfword;
  this_if: small_number;
  is_unless: boolean;
Begin
  If eqtb[5325].int>0 Then If eqtb[5304].int<=1 Then
                             show_cur_cmd_chr;{495:}
  Begin
    p := get_node(2);
    mem[p].hh.rh := cond_ptr;
    mem[p].hh.b0 := if_limit;
    mem[p].hh.b1 := cur_if;
    mem[p+1].int := if_line;
    cond_ptr := p;
    cur_if := cur_chr;
    if_limit := 1;
    if_line := line;
  End{:495};
  save_cond_ptr := cond_ptr;
  is_unless := (cur_chr>=32);
  this_if := cur_chr Mod 32;
{501:}
  Case this_if Of
    0,1:{506:}
         Begin
           Begin
             get_x_token;
             If cur_cmd=0 Then If cur_chr=257 Then
                                 Begin
                                   cur_cmd := 13;
                                   cur_chr := cur_tok-4096;
                                 End;
           End;
           If (cur_cmd>13)Or(cur_chr>255)Then
             Begin
               m := 0;
               n := 256;
             End
           Else
             Begin
               m := cur_cmd;
               n := cur_chr;
             End;
           Begin
             get_x_token;
             If cur_cmd=0 Then If cur_chr=257 Then
                                 Begin
                                   cur_cmd := 13;
                                   cur_chr := cur_tok-4096;
                                 End;
           End;
           If (cur_cmd>13)Or(cur_chr>255)Then
             Begin
               cur_cmd := 0;
               cur_chr := 256;
             End;
           If this_if=0 Then b := (n=cur_chr)
           Else b := (m=cur_cmd);
         End{:506};
    2,3:{503:}
         Begin
           If this_if=2 Then scan_int
           Else scan_dimen(false,false,
                           false);
           n := cur_val;{406:}
           Repeat
             get_x_token;
           Until cur_cmd<>10{:406};
           If (cur_tok>=3132)And(cur_tok<=3134)Then r := cur_tok-3072
           Else
             Begin
               Begin
                 If interaction=3 Then;
                 print_nl(263);
                 print(792);
               End;
               print_cmd_chr(105,this_if);
               Begin
                 help_ptr := 1;
                 help_line[0] := 793;
               End;
               back_error;
               r := 61;
             End;
           If this_if=2 Then scan_int
           Else scan_dimen(false,false,false);
           Case r Of
             60: b := (n<cur_val);
             61: b := (n=cur_val);
             62: b := (n>cur_val);
           End;
         End{:503};
    4:{504:}
       Begin
         scan_int;
         b := odd(cur_val);
       End{:504};
    5: b := (abs(cur_list.mode_field)=1);
    6: b := (abs(cur_list.mode_field)=102);
    7: b := (abs(cur_list.mode_field)=203);
    8: b := (cur_list.mode_field<0);
    9,10,11:{505:}
             Begin
               scan_register_num;
               If cur_val<256 Then p := eqtb[3683+cur_val].hh.rh
               Else
                 Begin
                   find_sa_element(4,cur_val,false);
                   If cur_ptr=0 Then p := 0
                   Else p := mem[cur_ptr+1].hh.rh;
                 End;
               If this_if=9 Then b := (p=0)
               Else If p=0 Then b := false
               Else If this_if=10
                      Then b := (mem[p].hh.b0=0)
               Else b := (mem[p].hh.b0=1);
             End{:505};
    12:{507:}
        Begin
          save_scanner_status := scanner_status;
          scanner_status := 0;
          get_next;
          n := cur_cs;
          p := cur_cmd;
          q := cur_chr;
          get_next;
          If cur_cmd<>p Then b := false
          Else If cur_cmd<111 Then b := (cur_chr=q)
          Else
{508:}
            Begin
              p := mem[cur_chr].hh.rh;
              q := mem[eqtb[n].hh.rh].hh.rh;
              If p=q Then b := true
              Else
                Begin
                  While (p<>0)And(q<>0) Do
                    If mem[p].hh.lh<>
                       mem[q].hh.lh Then p := 0
                    Else
                      Begin
                        p := mem[p].hh.rh;
                        q := mem[q].hh.rh;
                      End;
                  b := ((p=0)And(q=0));
                End;
            End{:508};
          scanner_status := save_scanner_status;
        End{:507};
    13:
        Begin
          scan_four_bit_int;
          b := (read_open[cur_val]=2);
        End;
    14: b := true;
    15: b := false;
{1501:}
    17:
        Begin
          save_scanner_status := scanner_status;
          scanner_status := 0;
          get_next;
          b := (cur_cmd<>101);
          scanner_status := save_scanner_status;
        End;
{:1501}{1502:}
    18:
        Begin
          n := get_avail;
          p := n;
          Repeat
            get_x_token;
            If cur_cs=0 Then
              Begin
                q := get_avail;
                mem[p].hh.rh := q;
                mem[q].hh.lh := cur_tok;
                p := q;
              End;
          Until cur_cs<>0;
          If cur_cmd<>67 Then{373:}
            Begin
              Begin
                If interaction=3 Then;
                print_nl(263);
                print(634);
              End;
              print_esc(508);
              print(635);
              Begin
                help_ptr := 2;
                help_line[1] := 636;
                help_line[0] := 637;
              End;
              back_error;
            End{:373};{1503:}
          m := first;
          p := mem[n].hh.rh;
          While p<>0 Do
            Begin
              If m>=max_buf_stack Then
                Begin
                  max_buf_stack := m+1;
                  If max_buf_stack=buf_size Then overflow(257,buf_size);
                End;
              buffer[m] := mem[p].hh.lh Mod 256;
              m := m+1;
              p := mem[p].hh.rh;
            End;
          If m>first+1 Then cur_cs := id_lookup(first,m-first)
          Else If m=first Then
                 cur_cs := 513
          Else cur_cs := 257+buffer[first]{:1503};
          flush_list(n);
          b := (eqtb[cur_cs].hh.b0<>101);
        End;{:1502}{1504:}
    19:
        Begin
          scan_font_ident;
          n := cur_val;
          scan_char_num;
          If (font_bc[n]<=cur_val)And(font_ec[n]>=cur_val)Then b := (font_info[
                                                                    char_base[n]+cur_val+0].qqqq.b0>
                                                                    0)
          Else b := false;
        End;
{:1504}
    16:{509:}
        Begin
          scan_int;
          n := cur_val;
          If eqtb[5304].int>1 Then
            Begin
              begin_diagnostic;
              print(794);
              print_int(n);
              print_char(125);
              end_diagnostic(false);
            End;
          While n<>0 Do
            Begin
              pass_text;
              If cond_ptr=save_cond_ptr Then If cur_chr=4 Then n := n-1
              Else goto 50
              Else If cur_chr=2 Then{496:}
                     Begin
                       If if_stack[in_open]=cond_ptr Then
                         if_warning;
                       p := cond_ptr;
                       if_line := mem[p+1].int;
                       cur_if := mem[p].hh.b1;
                       if_limit := mem[p].hh.b0;
                       cond_ptr := mem[p].hh.rh;
                       free_node(p,2);
                     End{:496};
            End;
          change_if_limit(4,save_cond_ptr);
          goto 10;
        End{:509};
  End{:501};
  If is_unless Then b := Not b;
  If eqtb[5304].int>1 Then{502:}
    Begin
      begin_diagnostic;
      If b Then print(790)
      Else print(791);
      end_diagnostic(false);
    End{:502};
  If b Then
    Begin
      change_if_limit(3,save_cond_ptr);
      goto 10;
    End;
{500:}
  While true Do
    Begin
      pass_text;
      If cond_ptr=save_cond_ptr Then
        Begin
          If cur_chr<>4 Then goto 50;
          Begin
            If interaction=3 Then;
            print_nl(263);
            print(788);
          End;
          print_esc(786);
          Begin
            help_ptr := 1;
            help_line[0] := 789;
          End;
          error;
        End
      Else If cur_chr=2 Then{496:}
             Begin
               If if_stack[in_open]=cond_ptr Then
                 if_warning;
               p := cond_ptr;
               if_line := mem[p+1].int;
               cur_if := mem[p].hh.b1;
               if_limit := mem[p].hh.b0;
               cond_ptr := mem[p].hh.rh;
               free_node(p,2);
             End{:496};
    End{:500};
  50: If cur_chr=2 Then{496:}
        Begin
          If if_stack[in_open]=cond_ptr Then
            if_warning;
          p := cond_ptr;
          if_line := mem[p+1].int;
          cur_if := mem[p].hh.b1;
          if_limit := mem[p].hh.b0;
          cond_ptr := mem[p].hh.rh;
          free_node(p,2);
        End{:496}
      Else if_limit := 2;
  10:
End;{:498}{515:}
Procedure begin_name;
Begin
  area_delimiter := 0;
  ext_delimiter := 0;
End;
{:515}{516:}
Function more_name(c:ASCII_code): boolean;
Begin
  If c=32 Then more_name := false
  Else
    Begin
      Begin
        If pool_ptr+1>
           pool_size Then overflow(258,pool_size-init_pool_ptr);
      End;
      Begin
        str_pool[pool_ptr] := c;
        pool_ptr := pool_ptr+1;
      End;
      If (c=62)Or(c=58)Then
        Begin
          area_delimiter := (pool_ptr-str_start[str_ptr])
          ;
          ext_delimiter := 0;
        End
      Else If (c=46)And(ext_delimiter=0)Then ext_delimiter := (pool_ptr-
                                                              str_start[str_ptr]);
      more_name := true;
    End;
End;
{:516}{517:}
Procedure end_name;
Begin
  If str_ptr+3>max_strings Then overflow(259,max_strings-
                                         init_str_ptr);
  If area_delimiter=0 Then cur_area := 339
  Else
    Begin
      cur_area := str_ptr;
      str_start[str_ptr+1] := str_start[str_ptr]+area_delimiter;
      str_ptr := str_ptr+1;
    End;
  If ext_delimiter=0 Then
    Begin
      cur_ext := 339;
      cur_name := make_string;
    End
  Else
    Begin
      cur_name := str_ptr;
      str_start[str_ptr+1] := str_start[str_ptr]+ext_delimiter-area_delimiter-1;
      str_ptr := str_ptr+1;
      cur_ext := make_string;
    End;
End;
{:517}{519:}
Procedure pack_file_name(n,a,e:str_number);

Var k: integer;
  c: ASCII_code;
  j: pool_pointer;
Begin
  k := 0;
  For j:=str_start[a]To str_start[a+1]-1 Do
    Begin
      c := str_pool[j];
      k := k+1;
      If k<=file_name_size Then name_of_file[k] := xchr[c];
    End;
  For j:=str_start[n]To str_start[n+1]-1 Do
    Begin
      c := str_pool[j];
      k := k+1;
      If k<=file_name_size Then name_of_file[k] := xchr[c];
    End;
  For j:=str_start[e]To str_start[e+1]-1 Do
    Begin
      c := str_pool[j];
      k := k+1;
      If k<=file_name_size Then name_of_file[k] := xchr[c];
    End;
  If k<=file_name_size Then name_length := k
  Else name_length :=
                      file_name_size;
  For k:=name_length+1 To file_name_size Do
    name_of_file[k] := ' ';
End;
{:519}{523:}
Procedure pack_buffered_name(n:small_number;a,b:integer);

Var k: integer;
  c: ASCII_code;
  j: integer;
Begin
  If n+b-a+5>file_name_size Then b := a+file_name_size-n-5;
  k := 0;
  For j:=1 To n Do
    Begin
      c := xord[TEX_format_default[j]];
      k := k+1;
      If k<=file_name_size Then name_of_file[k] := xchr[c];
    End;
  For j:=a To b Do
    Begin
      c := buffer[j];
      k := k+1;
      If k<=file_name_size Then name_of_file[k] := xchr[c];
    End;
  For j:=17 To 20 Do
    Begin
      c := xord[TEX_format_default[j]];
      k := k+1;
      If k<=file_name_size Then name_of_file[k] := xchr[c];
    End;
  If k<=file_name_size Then name_length := k
  Else name_length :=
                      file_name_size;
  For k:=name_length+1 To file_name_size Do
    name_of_file[k] := ' ';
End;
{:523}{525:}
Function make_name_string: str_number;

Var k: 1..file_name_size;
Begin
  If (pool_ptr+name_length>pool_size)Or(str_ptr=max_strings)Or((
     pool_ptr-str_start[str_ptr])>0)Then make_name_string := 63
  Else
    Begin
      For
          k:=1 To name_length Do
        Begin
          str_pool[pool_ptr] := xord[name_of_file[k]];
          pool_ptr := pool_ptr+1;
        End;
      make_name_string := make_string;
    End;
End;
Function a_make_name_string(Var f:alpha_file): str_number;
Begin
  a_make_name_string := make_name_string;
End;
Function b_make_name_string(Var f:byte_file): str_number;
Begin
  b_make_name_string := make_name_string;
End;
Function w_make_name_string(Var f:word_file): str_number;
Begin
  w_make_name_string := make_name_string;
End;
{:525}{526:}
Procedure scan_file_name;

Label 30;
Begin
  name_in_progress := true;
  begin_name;{406:}
  Repeat
    get_x_token;
  Until cur_cmd<>10{:406};
  While true Do
    Begin
      If (cur_cmd>12)Or(cur_chr>255)Then
        Begin
          back_input;
          goto 30;
        End;
      If Not more_name(cur_chr)Then goto 30;
      get_x_token;
    End;
  30: end_name;
  name_in_progress := false;
End;
{:526}{529:}
Procedure pack_job_name(s:str_number);
Begin
  cur_area := 339;
  cur_ext := s;
  cur_name := job_name;
  pack_file_name(cur_name,cur_area,cur_ext);
End;{:529}{530:}
Procedure prompt_file_name(s,e:str_number);

Label 30;

Var k: 0..buf_size;
Begin
  If interaction=2 Then;
  If s=798 Then
    Begin
      If interaction=3 Then;
      print_nl(263);
      print(799);
    End
  Else
    Begin
      If interaction=3 Then;
      print_nl(263);
      print(800);
    End;
  print_file_name(cur_name,cur_area,cur_ext);
  print(801);
  If e=802 Then show_context;
  print_nl(803);
  print(s);
  If interaction<2 Then fatal_error(804);
  break_in(term_in,true);
  Begin;
    print(575);
    term_input;
  End;{531:}
  Begin
    begin_name;
    k := first;
    While (buffer[k]=32)And(k<last) Do
      k := k+1;
    While true Do
      Begin
        If k=last Then goto 30;
        If Not more_name(buffer[k])Then goto 30;
        k := k+1;
      End;
    30: end_name;
  End{:531};
  If cur_ext=339 Then cur_ext := e;
  pack_file_name(cur_name,cur_area,cur_ext);
End;
{:530}{534:}
Procedure open_log_file;

Var old_setting: 0..21;
  k: 0..buf_size;
  l: 0..buf_size;
  months: packed array[1..36] Of char;
Begin
  old_setting := selector;
  If job_name=0 Then job_name := 807;
  pack_job_name(808);
  While Not a_open_out(log_file) Do{535:}
    Begin
      selector := 17;
      prompt_file_name(810,808);
    End{:535};
  log_name := a_make_name_string(log_file);
  selector := 18;
  log_opened := true;
{536:}
  Begin
    write(log_file,'This is e-TeX, Version 3.141592653','-2.6');
    slow_print(format_ident);
    print(811);
    print_int(sys_day);
    print_char(32);
    months := 'JANFEBMARAPRMAYJUNJULAUGSEPOCTNOVDEC';
    For k:=3*sys_month-2 To 3*sys_month Do
      write(log_file,months[k]);
    print_char(32);
    print_int(sys_year);
    print_char(32);
    print_two(sys_time Div 60);
    print_char(58);
    print_two(sys_time Mod 60);
    If (eTeX_mode=1)Then
      Begin;
        write_ln(log_file);
        write(log_file,'entering extended mode');
      End;
  End{:536};
  input_stack[input_ptr] := cur_input;
  print_nl(809);
  l := input_stack[0].limit_field;
  If buffer[l]=eqtb[5316].int Then l := l-1;
  For k:=1 To l Do
    print(buffer[k]);
  print_ln;
  selector := old_setting+2;
End;
{:534}{537:}
Procedure start_input;

Label 30;
Begin
  scan_file_name;
  If cur_ext=339 Then cur_ext := 802;
  pack_file_name(cur_name,cur_area,cur_ext);
  While true Do
    Begin
      begin_file_reading;
      If a_open_in(input_file[cur_input.index_field])Then goto 30;
      If cur_area=339 Then
        Begin
          pack_file_name(cur_name,795,cur_ext);
          If a_open_in(input_file[cur_input.index_field])Then goto 30;
        End;
      end_file_reading;
      prompt_file_name(798,802);
    End;
  30: cur_input.name_field := a_make_name_string(input_file[cur_input.
                              index_field]);
  If job_name=0 Then
    Begin
      job_name := cur_name;
      open_log_file;
    End;
  If term_offset+(str_start[cur_input.name_field+1]-str_start[cur_input.
     name_field])>max_print_line-2 Then print_ln
  Else If (term_offset>0)Or(
          file_offset>0)Then print_char(32);
  print_char(40);
  open_parens := open_parens+1;
  slow_print(cur_input.name_field);
  break(term_out);
  cur_input.state_field := 33;
  If cur_input.name_field=str_ptr-1 Then
    Begin
      Begin
        str_ptr := str_ptr-1;
        pool_ptr := str_start[str_ptr];
      End;
      cur_input.name_field := cur_name;
    End;
{538:}
  Begin
    line := 1;
    If input_ln(input_file[cur_input.index_field],false)Then;
    firm_up_the_line;
    If (eqtb[5316].int<0)Or(eqtb[5316].int>255)Then cur_input.limit_field :=
                                                                             cur_input.limit_field-1
    Else buffer[cur_input.limit_field] := eqtb[5316].
                                          int;
    first := cur_input.limit_field+1;
    cur_input.loc_field := cur_input.start_field;
  End{:538};
End;
{:537}{560:}
Function read_font_info(u:halfword;nom,aire:str_number;
                        s:scaled): internal_font_number;

Label 30,11,45;

Var k: font_index;
  file_opened: boolean;
  lf,lh,bc,ec,nw,nh,nd,ni,nl,nk,ne,np: halfword;
  f: internal_font_number;
  g: internal_font_number;
  a,b,c,d: eight_bits;
  qw: four_quarters;
  sw: scaled;
  bch_label: integer;
  bchar: 0..256;
  z: scaled;
  alpha: integer;
  beta: 1..16;
Begin
  g := 0;{562:}{563:}
  file_opened := false;
  If aire=339 Then pack_file_name(nom,796,822)
  Else pack_file_name(nom,aire
                      ,822);
  If Not b_open_in(tfm_file)Then goto 11;
  file_opened := true{:563};
{565:}
  Begin
    Begin
      lf := tfm_file^;
      If lf>127 Then goto 11;
      get(tfm_file);
      lf := lf*256+tfm_file^;
    End;
    get(tfm_file);
    Begin
      lh := tfm_file^;
      If lh>127 Then goto 11;
      get(tfm_file);
      lh := lh*256+tfm_file^;
    End;
    get(tfm_file);
    Begin
      bc := tfm_file^;
      If bc>127 Then goto 11;
      get(tfm_file);
      bc := bc*256+tfm_file^;
    End;
    get(tfm_file);
    Begin
      ec := tfm_file^;
      If ec>127 Then goto 11;
      get(tfm_file);
      ec := ec*256+tfm_file^;
    End;
    If (bc>ec+1)Or(ec>255)Then goto 11;
    If bc>255 Then
      Begin
        bc := 1;
        ec := 0;
      End;
    get(tfm_file);
    Begin
      nw := tfm_file^;
      If nw>127 Then goto 11;
      get(tfm_file);
      nw := nw*256+tfm_file^;
    End;
    get(tfm_file);
    Begin
      nh := tfm_file^;
      If nh>127 Then goto 11;
      get(tfm_file);
      nh := nh*256+tfm_file^;
    End;
    get(tfm_file);
    Begin
      nd := tfm_file^;
      If nd>127 Then goto 11;
      get(tfm_file);
      nd := nd*256+tfm_file^;
    End;
    get(tfm_file);
    Begin
      ni := tfm_file^;
      If ni>127 Then goto 11;
      get(tfm_file);
      ni := ni*256+tfm_file^;
    End;
    get(tfm_file);
    Begin
      nl := tfm_file^;
      If nl>127 Then goto 11;
      get(tfm_file);
      nl := nl*256+tfm_file^;
    End;
    get(tfm_file);
    Begin
      nk := tfm_file^;
      If nk>127 Then goto 11;
      get(tfm_file);
      nk := nk*256+tfm_file^;
    End;
    get(tfm_file);
    Begin
      ne := tfm_file^;
      If ne>127 Then goto 11;
      get(tfm_file);
      ne := ne*256+tfm_file^;
    End;
    get(tfm_file);
    Begin
      np := tfm_file^;
      If np>127 Then goto 11;
      get(tfm_file);
      np := np*256+tfm_file^;
    End;
    If lf<>6+lh+(ec-bc+1)+nw+nh+nd+ni+nl+nk+ne+np Then goto 11;
    If (nw=0)Or(nh=0)Or(nd=0)Or(ni=0)Then goto 11;
  End{:565};
{566:}
  lf := lf-6-lh;
  If np<7 Then lf := lf+7-np;
  If (font_ptr=font_max)Or(fmem_ptr+lf>font_mem_size)Then{567:}
    Begin
      Begin
        If interaction=3 Then;
        print_nl(263);
        print(813);
      End;
      sprint_cs(u);
      print_char(61);
      print_file_name(nom,aire,339);
      If s>=0 Then
        Begin
          print(751);
          print_scaled(s);
          print(400);
        End
      Else If s<>-1000 Then
             Begin
               print(814);
               print_int(-s);
             End;
      print(823);
      Begin
        help_ptr := 4;
        help_line[3] := 824;
        help_line[2] := 825;
        help_line[1] := 826;
        help_line[0] := 827;
      End;
      error;
      goto 30;
    End{:567};
  f := font_ptr+1;
  char_base[f] := fmem_ptr-bc;
  width_base[f] := char_base[f]+ec+1;
  height_base[f] := width_base[f]+nw;
  depth_base[f] := height_base[f]+nh;
  italic_base[f] := depth_base[f]+nd;
  lig_kern_base[f] := italic_base[f]+ni;
  kern_base[f] := lig_kern_base[f]+nl-256*(128);
  exten_base[f] := kern_base[f]+256*(128)+nk;
  param_base[f] := exten_base[f]+ne{:566};{568:}
  Begin
    If lh<2 Then goto 11;
    Begin
      get(tfm_file);
      a := tfm_file^;
      qw.b0 := a+0;
      get(tfm_file);
      b := tfm_file^;
      qw.b1 := b+0;
      get(tfm_file);
      c := tfm_file^;
      qw.b2 := c+0;
      get(tfm_file);
      d := tfm_file^;
      qw.b3 := d+0;
      font_check[f] := qw;
    End;
    get(tfm_file);
    Begin
      z := tfm_file^;
      If z>127 Then goto 11;
      get(tfm_file);
      z := z*256+tfm_file^;
    End;
    get(tfm_file);
    z := z*256+tfm_file^;
    get(tfm_file);
    z := (z*16)+(tfm_file^Div 16);
    If z<65536 Then goto 11;
    While lh>2 Do
      Begin
        get(tfm_file);
        get(tfm_file);
        get(tfm_file);
        get(tfm_file);
        lh := lh-1;
      End;
    font_dsize[f] := z;
    If s<>-1000 Then If s>=0 Then z := s
    Else z := xn_over_d(z,-s,1000);
    font_size[f] := z;
  End{:568};
{569:}
  For k:=fmem_ptr To width_base[f]-1 Do
    Begin
      Begin
        get(tfm_file);
        a := tfm_file^;
        qw.b0 := a+0;
        get(tfm_file);
        b := tfm_file^;
        qw.b1 := b+0;
        get(tfm_file);
        c := tfm_file^;
        qw.b2 := c+0;
        get(tfm_file);
        d := tfm_file^;
        qw.b3 := d+0;
        font_info[k].qqqq := qw;
      End;
      If (a>=nw)Or(b Div 16>=nh)Or(b Mod 16>=nd)Or(c Div 4>=ni)Then goto 11;
      Case c Mod 4 Of
        1: If d>=nl Then goto 11;
        3: If d>=ne Then goto 11;
        2:{570:}
           Begin
             Begin
               If (d<bc)Or(d>ec)Then goto 11
             End;
             While d<k+bc-fmem_ptr Do
               Begin
                 qw := font_info[char_base[f]+d].qqqq;
                 If ((qw.b2-0)Mod 4)<>2 Then goto 45;
                 d := qw.b3-0;
               End;
             If d=k+bc-fmem_ptr Then goto 11;
             45:
           End{:570};
        others:
      End;
    End{:569};
{571:}
  Begin{572:}
    Begin
      alpha := 16;
      While z>=8388608 Do
        Begin
          z := z Div 2;
          alpha := alpha+alpha;
        End;
      beta := 256 Div alpha;
      alpha := alpha*z;
    End{:572};
    For k:=width_base[f]To lig_kern_base[f]-1 Do
      Begin
        get(tfm_file);
        a := tfm_file^;
        get(tfm_file);
        b := tfm_file^;
        get(tfm_file);
        c := tfm_file^;
        get(tfm_file);
        d := tfm_file^;
        sw := (((((d*z)Div 256)+(c*z))Div 256)+(b*z))Div beta;
        If a=0 Then font_info[k].int := sw
        Else If a=255 Then font_info[k].int := sw
                                               -alpha
        Else goto 11;
      End;
    If font_info[width_base[f]].int<>0 Then goto 11;
    If font_info[height_base[f]].int<>0 Then goto 11;
    If font_info[depth_base[f]].int<>0 Then goto 11;
    If font_info[italic_base[f]].int<>0 Then goto 11;
  End{:571};
{573:}
  bch_label := 32767;
  bchar := 256;
  If nl>0 Then
    Begin
      For k:=lig_kern_base[f]To kern_base[f]+256*(128)-1 Do
        Begin
          Begin
            get(tfm_file);
            a := tfm_file^;
            qw.b0 := a+0;
            get(tfm_file);
            b := tfm_file^;
            qw.b1 := b+0;
            get(tfm_file);
            c := tfm_file^;
            qw.b2 := c+0;
            get(tfm_file);
            d := tfm_file^;
            qw.b3 := d+0;
            font_info[k].qqqq := qw;
          End;
          If a>128 Then
            Begin
              If 256*c+d>=nl Then goto 11;
              If a=255 Then If k=lig_kern_base[f]Then bchar := b;
            End
          Else
            Begin
              If b<>bchar Then
                Begin
                  Begin
                    If (b<bc)Or(b>ec)Then goto 11
                  End;
                  qw := font_info[char_base[f]+b].qqqq;
                  If Not(qw.b0>0)Then goto 11;
                End;
              If c<128 Then
                Begin
                  Begin
                    If (d<bc)Or(d>ec)Then goto 11
                  End;
                  qw := font_info[char_base[f]+d].qqqq;
                  If Not(qw.b0>0)Then goto 11;
                End
              Else If 256*(c-128)+d>=nk Then goto 11;
              If a<128 Then If k-lig_kern_base[f]+a+1>=nl Then goto 11;
            End;
        End;
      If a=255 Then bch_label := 256*c+d;
    End;
  For k:=kern_base[f]+256*(128)To exten_base[f]-1 Do
    Begin
      get(tfm_file);
      a := tfm_file^;
      get(tfm_file);
      b := tfm_file^;
      get(tfm_file);
      c := tfm_file^;
      get(tfm_file);
      d := tfm_file^;
      sw := (((((d*z)Div 256)+(c*z))Div 256)+(b*z))Div beta;
      If a=0 Then font_info[k].int := sw
      Else If a=255 Then font_info[k].int := sw
                                             -alpha
      Else goto 11;
    End;{:573};
{574:}
  For k:=exten_base[f]To param_base[f]-1 Do
    Begin
      Begin
        get(tfm_file
        );
        a := tfm_file^;
        qw.b0 := a+0;
        get(tfm_file);
        b := tfm_file^;
        qw.b1 := b+0;
        get(tfm_file);
        c := tfm_file^;
        qw.b2 := c+0;
        get(tfm_file);
        d := tfm_file^;
        qw.b3 := d+0;
        font_info[k].qqqq := qw;
      End;
      If a<>0 Then
        Begin
          Begin
            If (a<bc)Or(a>ec)Then goto 11
          End;
          qw := font_info[char_base[f]+a].qqqq;
          If Not(qw.b0>0)Then goto 11;
        End;
      If b<>0 Then
        Begin
          Begin
            If (b<bc)Or(b>ec)Then goto 11
          End;
          qw := font_info[char_base[f]+b].qqqq;
          If Not(qw.b0>0)Then goto 11;
        End;
      If c<>0 Then
        Begin
          Begin
            If (c<bc)Or(c>ec)Then goto 11
          End;
          qw := font_info[char_base[f]+c].qqqq;
          If Not(qw.b0>0)Then goto 11;
        End;
      Begin
        Begin
          If (d<bc)Or(d>ec)Then goto 11
        End;
        qw := font_info[char_base[f]+d].qqqq;
        If Not(qw.b0>0)Then goto 11;
      End;
    End{:574};{575:}
  Begin
    For k:=1 To np Do
      If k=1 Then
        Begin
          get(tfm_file);
          sw := tfm_file^;
          If sw>127 Then sw := sw-256;
          get(tfm_file);
          sw := sw*256+tfm_file^;
          get(tfm_file);
          sw := sw*256+tfm_file^;
          get(tfm_file);
          font_info[param_base[f]].int := (sw*16)+(tfm_file^Div 16);
        End
      Else
        Begin
          get(tfm_file);
          a := tfm_file^;
          get(tfm_file);
          b := tfm_file^;
          get(tfm_file);
          c := tfm_file^;
          get(tfm_file);
          d := tfm_file^;
          sw := (((((d*z)Div 256)+(c*z))Div 256)+(b*z))Div beta;
          If a=0 Then font_info[param_base[f]+k-1].int := sw
          Else If a=255 Then
                 font_info[param_base[f]+k-1].int := sw-alpha
          Else goto 11;
        End;
    If eof(tfm_file)Then goto 11;
    For k:=np+1 To 7 Do
      font_info[param_base[f]+k-1].int := 0;
  End{:575};
{576:}
  If np>=7 Then font_params[f] := np
  Else font_params[f] := 7;
  hyphen_char[f] := eqtb[5314].int;
  skew_char[f] := eqtb[5315].int;
  If bch_label<nl Then bchar_label[f] := bch_label+lig_kern_base[f]
  Else
    bchar_label[f] := 0;
  font_bchar[f] := bchar+0;
  font_false_bchar[f] := bchar+0;
  If bchar<=ec Then If bchar>=bc Then
                      Begin
                        qw := font_info[char_base[f]+
                              bchar].qqqq;
                        If (qw.b0>0)Then font_false_bchar[f] := 256;
                      End;
  font_name[f] := nom;
  font_area[f] := aire;
  font_bc[f] := bc;
  font_ec[f] := ec;
  font_glue[f] := 0;
  char_base[f] := char_base[f]-0;
  width_base[f] := width_base[f]-0;
  lig_kern_base[f] := lig_kern_base[f]-0;
  kern_base[f] := kern_base[f]-0;
  exten_base[f] := exten_base[f]-0;
  param_base[f] := param_base[f]-1;
  fmem_ptr := fmem_ptr+lf;
  font_ptr := f;
  g := f;
  goto 30{:576}{:562};
  11:{561:}
      Begin
        If interaction=3 Then;
        print_nl(263);
        print(813);
      End;
  sprint_cs(u);
  print_char(61);
  print_file_name(nom,aire,339);
  If s>=0 Then
    Begin
      print(751);
      print_scaled(s);
      print(400);
    End
  Else If s<>-1000 Then
         Begin
           print(814);
           print_int(-s);
         End;
  If file_opened Then print(815)
  Else print(816);
  Begin
    help_ptr := 5;
    help_line[4] := 817;
    help_line[3] := 818;
    help_line[2] := 819;
    help_line[1] := 820;
    help_line[0] := 821;
  End;
  error{:561};
  30: If file_opened Then b_close(tfm_file);
  read_font_info := g;
End;
{:560}{581:}
Procedure char_warning(f:internal_font_number;c:eight_bits);

Var old_setting: integer;
Begin
  If eqtb[5303].int>0 Then
    Begin
      old_setting := eqtb[5297].int;
      If (eTeX_mode=1)And(eqtb[5303].int>1)Then eqtb[5297].int := 1;
      Begin
        begin_diagnostic;
        print_nl(836);
        print(c);
        print(837);
        slow_print(font_name[f]);
        print_char(33);
        end_diagnostic(false);
      End;
      eqtb[5297].int := old_setting;
    End;
End;
{:581}{582:}
Function new_character(f:internal_font_number;
                       c:eight_bits): halfword;

Label 10;

Var p: halfword;
Begin
  If font_bc[f]<=c Then If font_ec[f]>=c Then If (font_info[char_base
                                                 [f]+c+0].qqqq.b0>0)Then
                                                Begin
                                                  p := get_avail;
                                                  mem[p].hh.b0 := f;
                                                  mem[p].hh.b1 := c+0;
                                                  new_character := p;
                                                  goto 10;
                                                End;
  char_warning(f,c);
  new_character := 0;
  10:
End;{:582}{597:}
Procedure write_dvi(a,b:dvi_index);

Var k: dvi_index;
Begin
  For k:=a To b Do
    write(dvi_file,dvi_buf[k]);
End;
{:597}{598:}
Procedure dvi_swap;
Begin
  If dvi_limit=dvi_buf_size Then
    Begin
      write_dvi(0,half_buf-1);
      dvi_limit := half_buf;
      dvi_offset := dvi_offset+dvi_buf_size;
      dvi_ptr := 0;
    End
  Else
    Begin
      write_dvi(half_buf,dvi_buf_size-1);
      dvi_limit := dvi_buf_size;
    End;
  dvi_gone := dvi_gone+half_buf;
End;
{:598}{600:}
Procedure dvi_four(x:integer);
Begin
  If x>=0 Then
    Begin
      dvi_buf[dvi_ptr] := x Div 16777216;
      dvi_ptr := dvi_ptr+1;
      If dvi_ptr=dvi_limit Then dvi_swap;
    End
  Else
    Begin
      x := x+1073741824;
      x := x+1073741824;
      Begin
        dvi_buf[dvi_ptr] := (x Div 16777216)+128;
        dvi_ptr := dvi_ptr+1;
        If dvi_ptr=dvi_limit Then dvi_swap;
      End;
    End;
  x := x Mod 16777216;
  Begin
    dvi_buf[dvi_ptr] := x Div 65536;
    dvi_ptr := dvi_ptr+1;
    If dvi_ptr=dvi_limit Then dvi_swap;
  End;
  x := x Mod 65536;
  Begin
    dvi_buf[dvi_ptr] := x Div 256;
    dvi_ptr := dvi_ptr+1;
    If dvi_ptr=dvi_limit Then dvi_swap;
  End;
  Begin
    dvi_buf[dvi_ptr] := x Mod 256;
    dvi_ptr := dvi_ptr+1;
    If dvi_ptr=dvi_limit Then dvi_swap;
  End;
End;
{:600}{601:}
Procedure dvi_pop(l:integer);
Begin
  If (l=dvi_offset+dvi_ptr)And(dvi_ptr>0)Then dvi_ptr := dvi_ptr-1
  Else
    Begin
      dvi_buf[dvi_ptr] := 142;
      dvi_ptr := dvi_ptr+1;
      If dvi_ptr=dvi_limit Then dvi_swap;
    End;
End;
{:601}{602:}
Procedure dvi_font_def(f:internal_font_number);

Var k: pool_pointer;
Begin
  Begin
    dvi_buf[dvi_ptr] := 243;
    dvi_ptr := dvi_ptr+1;
    If dvi_ptr=dvi_limit Then dvi_swap;
  End;
  Begin
    dvi_buf[dvi_ptr] := f-1;
    dvi_ptr := dvi_ptr+1;
    If dvi_ptr=dvi_limit Then dvi_swap;
  End;
  Begin
    dvi_buf[dvi_ptr] := font_check[f].b0-0;
    dvi_ptr := dvi_ptr+1;
    If dvi_ptr=dvi_limit Then dvi_swap;
  End;
  Begin
    dvi_buf[dvi_ptr] := font_check[f].b1-0;
    dvi_ptr := dvi_ptr+1;
    If dvi_ptr=dvi_limit Then dvi_swap;
  End;
  Begin
    dvi_buf[dvi_ptr] := font_check[f].b2-0;
    dvi_ptr := dvi_ptr+1;
    If dvi_ptr=dvi_limit Then dvi_swap;
  End;
  Begin
    dvi_buf[dvi_ptr] := font_check[f].b3-0;
    dvi_ptr := dvi_ptr+1;
    If dvi_ptr=dvi_limit Then dvi_swap;
  End;
  dvi_four(font_size[f]);
  dvi_four(font_dsize[f]);
  Begin
    dvi_buf[dvi_ptr] := (str_start[font_area[f]+1]-str_start[font_area[f
                        ]]);
    dvi_ptr := dvi_ptr+1;
    If dvi_ptr=dvi_limit Then dvi_swap;
  End;
  Begin
    dvi_buf[dvi_ptr] := (str_start[font_name[f]+1]-str_start[font_name[f
                        ]]);
    dvi_ptr := dvi_ptr+1;
    If dvi_ptr=dvi_limit Then dvi_swap;
  End;
{603:}
  For k:=str_start[font_area[f]]To str_start[font_area[f]+1]-1 Do
    Begin
      dvi_buf[dvi_ptr] := str_pool[k];
      dvi_ptr := dvi_ptr+1;
      If dvi_ptr=dvi_limit Then dvi_swap;
    End;
  For k:=str_start[font_name[f]]To str_start[font_name[f]+1]-1 Do
    Begin
      dvi_buf[dvi_ptr] := str_pool[k];
      dvi_ptr := dvi_ptr+1;
      If dvi_ptr=dvi_limit Then dvi_swap;
    End{:603};
End;
{:602}{607:}
Procedure movement(w:scaled;o:eight_bits);

Label 10,40,45,2,1;

Var mstate: small_number;
  p,q: halfword;
  k: integer;
Begin
  q := get_node(3);
  mem[q+1].int := w;
  mem[q+2].int := dvi_offset+dvi_ptr;
  If o=157 Then
    Begin
      mem[q].hh.rh := down_ptr;
      down_ptr := q;
    End
  Else
    Begin
      mem[q].hh.rh := right_ptr;
      right_ptr := q;
    End;
{611:}
  p := mem[q].hh.rh;
  mstate := 0;
  While p<>0 Do
    Begin
      If mem[p+1].int=w Then{612:}Case mstate+mem[p].hh.lh
                                    Of
                                    3,4,15,16: If mem[p+2].int<dvi_gone Then goto 45
                                               Else{613:}
                                                 Begin
                                                   k :=
                                                        mem[p+2].int-dvi_offset;
                                                   If k<0 Then k := k+dvi_buf_size;
                                                   dvi_buf[k] := dvi_buf[k]+5;
                                                   mem[p].hh.lh := 1;
                                                   goto 40;
                                                 End{:613};
                                    5,9,11: If mem[p+2].int<dvi_gone Then goto 45
                                            Else{614:}
                                              Begin
                                                k := mem[p+2]
                                                     .int-dvi_offset;
                                                If k<0 Then k := k+dvi_buf_size;
                                                dvi_buf[k] := dvi_buf[k]+10;
                                                mem[p].hh.lh := 2;
                                                goto 40;
                                              End{:614};
                                    1,2,8,13: goto 40;
                                    others:
        End{:612}
      Else Case mstate+mem[p].hh.lh Of
             1: mstate := 6;
             2: mstate := 12;
             8,13: goto 45;
             others:
        End;
      p := mem[p].hh.rh;
    End;
  45:{:611};
{610:}
  mem[q].hh.lh := 3;
  If abs(w)>=8388608 Then
    Begin
      Begin
        dvi_buf[dvi_ptr] := o+3;
        dvi_ptr := dvi_ptr+1;
        If dvi_ptr=dvi_limit Then dvi_swap;
      End;
      dvi_four(w);
      goto 10;
    End;
  If abs(w)>=32768 Then
    Begin
      Begin
        dvi_buf[dvi_ptr] := o+2;
        dvi_ptr := dvi_ptr+1;
        If dvi_ptr=dvi_limit Then dvi_swap;
      End;
      If w<0 Then w := w+16777216;
      Begin
        dvi_buf[dvi_ptr] := w Div 65536;
        dvi_ptr := dvi_ptr+1;
        If dvi_ptr=dvi_limit Then dvi_swap;
      End;
      w := w Mod 65536;
      goto 2;
    End;
  If abs(w)>=128 Then
    Begin
      Begin
        dvi_buf[dvi_ptr] := o+1;
        dvi_ptr := dvi_ptr+1;
        If dvi_ptr=dvi_limit Then dvi_swap;
      End;
      If w<0 Then w := w+65536;
      goto 2;
    End;
  Begin
    dvi_buf[dvi_ptr] := o;
    dvi_ptr := dvi_ptr+1;
    If dvi_ptr=dvi_limit Then dvi_swap;
  End;
  If w<0 Then w := w+256;
  goto 1;
  2:
     Begin
       dvi_buf[dvi_ptr] := w Div 256;
       dvi_ptr := dvi_ptr+1;
       If dvi_ptr=dvi_limit Then dvi_swap;
     End;
  1:
     Begin
       dvi_buf[dvi_ptr] := w Mod 256;
       dvi_ptr := dvi_ptr+1;
       If dvi_ptr=dvi_limit Then dvi_swap;
     End;
  goto 10{:610};
  40:{609:}mem[q].hh.lh := mem[p].hh.lh;
  If mem[q].hh.lh=1 Then
    Begin
      Begin
        dvi_buf[dvi_ptr] := o+4;
        dvi_ptr := dvi_ptr+1;
        If dvi_ptr=dvi_limit Then dvi_swap;
      End;
      While mem[q].hh.rh<>p Do
        Begin
          q := mem[q].hh.rh;
          Case mem[q].hh.lh Of
            3: mem[q].hh.lh := 5;
            4: mem[q].hh.lh := 6;
            others:
          End;
        End;
    End
  Else
    Begin
      Begin
        dvi_buf[dvi_ptr] := o+9;
        dvi_ptr := dvi_ptr+1;
        If dvi_ptr=dvi_limit Then dvi_swap;
      End;
      While mem[q].hh.rh<>p Do
        Begin
          q := mem[q].hh.rh;
          Case mem[q].hh.lh Of
            3: mem[q].hh.lh := 4;
            5: mem[q].hh.lh := 6;
            others:
          End;
        End;
    End{:609};
  10:
End;{:607}{615:}
Procedure prune_movements(l:integer);

Label 30,10;

Var p: halfword;
Begin
  While down_ptr<>0 Do
    Begin
      If mem[down_ptr+2].int<l Then goto 30;
      p := down_ptr;
      down_ptr := mem[p].hh.rh;
      free_node(p,3);
    End;
  30: While right_ptr<>0 Do
        Begin
          If mem[right_ptr+2].int<l Then goto 10;
          p := right_ptr;
          right_ptr := mem[p].hh.rh;
          free_node(p,3);
        End;
  10:
End;
{:615}{618:}
Procedure vlist_out;
forward;
{:618}{619:}{1368:}
Procedure special_out(p:halfword);

Var old_setting: 0..21;
  k: pool_pointer;
Begin
  If cur_h<>dvi_h Then
    Begin
      movement(cur_h-dvi_h,143);
      dvi_h := cur_h;
    End;
  If cur_v<>dvi_v Then
    Begin
      movement(cur_v-dvi_v,157);
      dvi_v := cur_v;
    End;
  old_setting := selector;
  selector := 21;
  show_token_list(mem[mem[p+1].hh.rh].hh.rh,0,pool_size-pool_ptr);
  selector := old_setting;
  Begin
    If pool_ptr+1>pool_size Then overflow(258,pool_size-init_pool_ptr)
    ;
  End;
  If (pool_ptr-str_start[str_ptr])<256 Then
    Begin
      Begin
        dvi_buf[dvi_ptr] :=
                            239;
        dvi_ptr := dvi_ptr+1;
        If dvi_ptr=dvi_limit Then dvi_swap;
      End;
      Begin
        dvi_buf[dvi_ptr] := (pool_ptr-str_start[str_ptr]);
        dvi_ptr := dvi_ptr+1;
        If dvi_ptr=dvi_limit Then dvi_swap;
      End;
    End
  Else
    Begin
      Begin
        dvi_buf[dvi_ptr] := 242;
        dvi_ptr := dvi_ptr+1;
        If dvi_ptr=dvi_limit Then dvi_swap;
      End;
      dvi_four((pool_ptr-str_start[str_ptr]));
    End;
  For k:=str_start[str_ptr]To pool_ptr-1 Do
    Begin
      dvi_buf[dvi_ptr] :=
                          str_pool[k];
      dvi_ptr := dvi_ptr+1;
      If dvi_ptr=dvi_limit Then dvi_swap;
    End;
  pool_ptr := str_start[str_ptr];
End;
{:1368}{1370:}
Procedure write_out(p:halfword);

Var old_setting: 0..21;
  old_mode: integer;
  j: small_number;
  q,r: halfword;
Begin{1371:}
  q := get_avail;
  mem[q].hh.lh := 637;
  r := get_avail;
  mem[q].hh.rh := r;
  mem[r].hh.lh := 6717;
  begin_token_list(q,4);
  begin_token_list(mem[p+1].hh.rh,16);
  q := get_avail;
  mem[q].hh.lh := 379;
  begin_token_list(q,4);
  old_mode := cur_list.mode_field;
  cur_list.mode_field := 0;
  cur_cs := write_loc;
  q := scan_toks(false,true);
  get_token;
  If cur_tok<>6717 Then{1372:}
    Begin
      Begin
        If interaction=3 Then;
        print_nl(263);
        print(1311);
      End;
      Begin
        help_ptr := 2;
        help_line[1] := 1312;
        help_line[0] := 1024;
      End;
      error;
      Repeat
        get_token;
      Until cur_tok=6717;
    End{:1372};
  cur_list.mode_field := old_mode;
  end_token_list{:1371};
  old_setting := selector;
  j := mem[p+1].hh.lh;
  If write_open[j]Then selector := j
  Else
    Begin
      If (j=17)And(selector=19)Then
        selector := 18;
      print_nl(339);
    End;
  token_show(def_ref);
  print_ln;
  flush_list(def_ref);
  selector := old_setting;
End;
{:1370}{1373:}
Procedure out_what(p:halfword);

Var j: small_number;
Begin
  Case mem[p].hh.b1 Of
    0,1,2:{1374:}If Not doing_leaders Then
                   Begin
                     j := mem[p+1].hh.lh;
                     If mem[p].hh.b1=1 Then write_out(p)
                     Else
                       Begin
                         If write_open[j]Then
                           a_close(write_file[j]);
                         If mem[p].hh.b1=2 Then write_open[j] := false
                         Else If j<16 Then
                                Begin
                                  cur_name := mem[p+1].hh.rh;
                                  cur_area := mem[p+2].hh.lh;
                                  cur_ext := mem[p+2].hh.rh;
                                  If cur_ext=339 Then cur_ext := 802;
                                  pack_file_name(cur_name,cur_area,cur_ext);
                                  While Not a_open_out(write_file[j]) Do
                                    prompt_file_name(1314,802);
                                  write_open[j] := true;
                                End;
                       End;
                   End{:1374};
    3: special_out(p);
    4:;
    others: confusion(1313)
  End;
End;
{:1373}{1450:}
Function new_edge(s:small_number;w:scaled): halfword;

Var p: halfword;
Begin
  p := get_node(3);
  mem[p].hh.b0 := 14;
  mem[p].hh.b1 := s;
  mem[p+1].int := w;
  mem[p+2].int := 0;
  new_edge := p;
End;
{:1450}{1454:}
Function reverse(this_box,t:halfword;Var cur_g:scaled;
                 Var cur_glue:real): halfword;

Label 21,15,30;

Var l: halfword;
  p: halfword;
  q: halfword;
  g_order: glue_ord;
  g_sign: 0..2;
  glue_temp: real;
  m,n: halfword;
Begin
  g_order := mem[this_box+5].hh.b1;
  g_sign := mem[this_box+5].hh.b0;
  l := t;
  p := temp_ptr;
  m := 0;
  n := 0;
  While true Do
    Begin
      While p<>0 Do{1459:}
        21: If (p>=hi_mem_min)Then Repeat
                                     f := mem[p].hh.b0;
                                     c := mem[p].hh.b1;
                                     cur_h := cur_h+font_info[width_base[f]+font_info[char_base[f]+c
                                              ].qqqq.b0].
                                              int;
                                     q := mem[p].hh.rh;
                                     mem[p].hh.rh := l;
                                     l := p;
                                     p := q;
              Until Not(p>=hi_mem_min)
            Else{1460:}
              Begin
                q := mem[p].hh.rh;
                Case mem[p].hh.b0 Of
                  0,1,2,11: rule_wd := mem[p+1].int;
{1461:}
                  10:
                      Begin
                        g := mem[p+1].hh.lh;
                        rule_wd := mem[g+1].int-cur_g;
                        If g_sign<>0 Then
                          Begin
                            If g_sign=1 Then
                              Begin
                                If mem[g].hh.b0=g_order
                                  Then
                                  Begin
                                    cur_glue := cur_glue+mem[g+2].int;
                                    glue_temp := mem[this_box+6].gr*cur_glue;
                                    If glue_temp>1000000000.0 Then glue_temp := 1000000000.0
                                    Else If glue_temp
                                            <-1000000000.0 Then glue_temp := -1000000000.0;
                                    cur_g := round(glue_temp);
                                  End;
                              End
                            Else If mem[g].hh.b1=g_order Then
                                   Begin
                                     cur_glue := cur_glue-mem[g+3].
                                                 int;
                                     glue_temp := mem[this_box+6].gr*cur_glue;
                                     If glue_temp>1000000000.0 Then glue_temp := 1000000000.0
                                     Else If glue_temp
                                             <-1000000000.0 Then glue_temp := -1000000000.0;
                                     cur_g := round(glue_temp);
                                   End;
                          End;
                        rule_wd := rule_wd+cur_g;
{1430:}
                        If (((g_sign=1)And(mem[g].hh.b0=g_order))Or((g_sign=2)And(mem[g].
                           hh.b1=g_order)))Then
                          Begin
                            Begin
                              If mem[g].hh.rh=0 Then free_node(g,4)
                              Else mem[g].hh.rh := mem[g].hh.rh-1;
                            End;
                            If mem[p].hh.b1<100 Then
                              Begin
                                mem[p].hh.b0 := 11;
                                mem[p+1].int := rule_wd;
                              End
                            Else
                              Begin
                                g := get_node(4);
                                mem[g].hh.b0 := 4;
                                mem[g].hh.b1 := 4;
                                mem[g+1].int := rule_wd;
                                mem[g+2].int := 0;
                                mem[g+3].int := 0;
                                mem[p+1].hh.lh := g;
                              End;
                          End{:1430};
                      End;
{:1461}{1462:}
                  6:
                     Begin
                       flush_node_list(mem[p+1].hh.rh);
                       temp_ptr := p;
                       p := get_avail;
                       mem[p] := mem[temp_ptr+1];
                       mem[p].hh.rh := q;
                       free_node(temp_ptr,2);
                       goto 21;
                     End;
{:1462}{1463:}
                  9:
                     Begin
                       rule_wd := mem[p+1].int;
                       If odd(mem[p].hh.b1)Then If mem[LR_ptr].hh.lh<>(4*(mem[p].hh.b1 Div 4)+3
                                                   )Then
                                                  Begin
                                                    mem[p].hh.b0 := 11;
                                                    LR_problems := LR_problems+1;
                                                  End
                       Else
                         Begin
                           Begin
                             temp_ptr := LR_ptr;
                             LR_ptr := mem[temp_ptr].hh.rh;
                             Begin
                               mem[temp_ptr].hh.rh := avail;
                               avail := temp_ptr;{dyn_used:=dyn_used-1;}
                             End;
                           End;
                           If n>0 Then
                             Begin
                               n := n-1;
                               mem[p].hh.b1 := mem[p].hh.b1-1;
                             End
                           Else
                             Begin
                               mem[p].hh.b0 := 11;
                               If m>0 Then m := m-1
                               Else{1464:}
                                 Begin
                                   free_node(p,2);
                                   mem[t].hh.rh := q;
                                   mem[t+1].int := rule_wd;
                                   mem[t+2].int := -cur_h-rule_wd;
                                   goto 30;
                                 End{:1464};
                             End;
                         End
                       Else
                         Begin
                           Begin
                             temp_ptr := get_avail;
                             mem[temp_ptr].hh.lh := (4*(mem[p].hh.b1 Div 4)+3);
                             mem[temp_ptr].hh.rh := LR_ptr;
                             LR_ptr := temp_ptr;
                           End;
                           If (n>0)Or((mem[p].hh.b1 Div 8)<>cur_dir)Then
                             Begin
                               n := n+1;
                               mem[p].hh.b1 := mem[p].hh.b1+1;
                             End
                           Else
                             Begin
                               mem[p].hh.b0 := 11;
                               m := m+1;
                             End;
                         End;
                     End;{:1463}
                  14: confusion(1376);
                  others: goto 15
                End;
                cur_h := cur_h+rule_wd;
                15: mem[p].hh.rh := l;
                If mem[p].hh.b0=11 Then If (rule_wd=0)Or(l=0)Then
                                          Begin
                                            free_node(p,2);
                                            p := l;
                                          End;
                l := p;
                p := q;
              End{:1460}{:1459};
      If (t=0)And(m=0)And(n=0)Then goto 30;
      p := new_math(0,mem[LR_ptr].hh.lh);
      LR_problems := LR_problems+10000;
    End;
  30: reverse := l;
End;
{:1454}{1455:}
{[1456:]function new_segment(s:small_number;
f:halfword):halfword;var p:halfword;begin p:=get_node(3);
mem[p].hh.b0:=14;mem[p].hh.b1:=s;mem[p+1].int:=0;mem[p+2].hh.lh:=f;
mem[p+2].hh.rh:=f;new_segment:=p;end;
[:1456][1458:]function has_whatsit(p:halfword):boolean;label 10;
begin p:=mem[p+5].hh.rh;has_whatsit:=true;
while p<>0 do begin if not(p>=hi_mem_min)then case mem[p].hh.b0 of 0,1:
if has_whatsit(p)then goto 10;8:goto 10;others:end;p:=mem[p].hh.rh;end;
has_whatsit:=false;10:end;[:1458]function reverse(this_box,t:halfword;
var cur_g:scaled;var cur_glue:real):halfword;label 21,15,30;
var l:halfword;p:halfword;q:halfword;g_order:glue_ord;g_sign:0..2;
glue_temp:real;m,n:halfword;begin g_order:=mem[this_box+5].hh.b1;
g_sign:=mem[this_box+5].hh.b0;[1457:]begin end[:1457];l:=t;p:=temp_ptr;
m:=0;n:=0;
while true do begin while p<>0 do[1459:]21:if(p>=hi_mem_min)then repeat
f:=mem[p].hh.b0;c:=mem[p].hh.b1;
cur_h:=cur_h+font_info[width_base[f]+font_info[char_base[f]+c].qqqq.b0].
int;q:=mem[p].hh.rh;mem[p].hh.rh:=l;l:=p;p:=q;
until not(p>=hi_mem_min)else[1460:]begin q:=mem[p].hh.rh;
case mem[p].hh.b0 of 0,1,2,11:rule_wd:=mem[p+1].int;
[1461:]10:begin g:=mem[p+1].hh.lh;rule_wd:=mem[g+1].int-cur_g;
if g_sign<>0 then begin if g_sign=1 then begin if mem[g].hh.b0=g_order
then begin cur_glue:=cur_glue+mem[g+2].int;
glue_temp:=mem[this_box+6].gr*cur_glue;
if glue_temp>1000000000.0 then glue_temp:=1000000000.0 else if glue_temp
<-1000000000.0 then glue_temp:=-1000000000.0;cur_g:=round(glue_temp);
end;
end else if mem[g].hh.b1=g_order then begin cur_glue:=cur_glue-mem[g+3].
int;glue_temp:=mem[this_box+6].gr*cur_glue;
if glue_temp>1000000000.0 then glue_temp:=1000000000.0 else if glue_temp
<-1000000000.0 then glue_temp:=-1000000000.0;cur_g:=round(glue_temp);
end;end;rule_wd:=rule_wd+cur_g;
[1430:]if(((g_sign=1)and(mem[g].hh.b0=g_order))or((g_sign=2)and(mem[g].
hh.b1=g_order)))then begin begin if mem[g].hh.rh=0 then free_node(g,4)
else mem[g].hh.rh:=mem[g].hh.rh-1;end;
if mem[p].hh.b1<100 then begin mem[p].hh.b0:=11;mem[p+1].int:=rule_wd;
end else begin g:=get_node(4);mem[g].hh.b0:=4;mem[g].hh.b1:=4;
mem[g+1].int:=rule_wd;mem[g+2].int:=0;mem[g+3].int:=0;mem[p+1].hh.lh:=g;
end;end[:1430];end;
[:1461][1462:]6:begin flush_node_list(mem[p+1].hh.rh);temp_ptr:=p;
p:=get_avail;mem[p]:=mem[temp_ptr+1];mem[p].hh.rh:=q;
free_node(temp_ptr,2);goto 21;end;
[:1462][1463:]9:begin rule_wd:=mem[p+1].int;
if odd(mem[p].hh.b1)then if mem[LR_ptr].hh.lh<>(4*(mem[p].hh.b1 div 4)+3
)then begin mem[p].hh.b0:=11;LR_problems:=LR_problems+1;
end else begin begin temp_ptr:=LR_ptr;LR_ptr:=mem[temp_ptr].hh.rh;
begin mem[temp_ptr].hh.rh:=avail;avail:=temp_ptr;[dyn_used:=dyn_used-1;
]end;end;if n>0 then begin n:=n-1;mem[p].hh.b1:=mem[p].hh.b1-1;
end else begin mem[p].hh.b0:=11;
if m>0 then m:=m-1 else[1464:]begin free_node(p,2);mem[t].hh.rh:=q;
mem[t+1].int:=rule_wd;mem[t+2].int:=-cur_h-rule_wd;goto 30;end[:1464];
end;end else begin begin temp_ptr:=get_avail;
mem[temp_ptr].hh.lh:=(4*(mem[p].hh.b1 div 4)+3);
mem[temp_ptr].hh.rh:=LR_ptr;LR_ptr:=temp_ptr;end;
if(n>0)or((mem[p].hh.b1 div 8)<>cur_dir)then begin n:=n+1;
mem[p].hh.b1:=mem[p].hh.b1+1;end else begin mem[p].hh.b0:=11;m:=m+1;end;
end;end;[:1463]14:confusion(1376);others:goto 15 end;
cur_h:=cur_h+rule_wd;15:mem[p].hh.rh:=l;
if mem[p].hh.b0=11 then if(rule_wd=0)or(l=0)then begin free_node(p,2);
p:=l;end;l:=p;p:=q;end[:1460][:1459];
if(t=0)and(m=0)and(n=0)then goto 30;p:=new_math(0,mem[LR_ptr].hh.lh);
LR_problems:=LR_problems+10000;end;30:reverse:=l;end;}
{:1455}
Procedure hlist_out;

Label 21,13,14,15;

Var base_line: scaled;
  left_edge: scaled;
  save_h,save_v: scaled;
  this_box: halfword;
  g_order: glue_ord;
  g_sign: 0..2;
  p: halfword;
  save_loc: integer;
  leader_box: halfword;
  leader_wd: scaled;
  lx: scaled;
  outer_doing_leaders: boolean;
  edge: scaled;
  prev_p: halfword;
  glue_temp: real;
  cur_glue: real;
  cur_g: scaled;
Begin
  cur_g := 0;
  cur_glue := 0.0;
  this_box := temp_ptr;
  g_order := mem[this_box+5].hh.b1;
  g_sign := mem[this_box+5].hh.b0;
  p := mem[this_box+5].hh.rh;
  cur_s := cur_s+1;
  If cur_s>0 Then
    Begin
      dvi_buf[dvi_ptr] := 141;
      dvi_ptr := dvi_ptr+1;
      If dvi_ptr=dvi_limit Then dvi_swap;
    End;
  If cur_s>max_push Then max_push := cur_s;
  save_loc := dvi_offset+dvi_ptr;
  base_line := cur_v;
  prev_p := this_box+5;
{1445:}
  If (eTeX_mode=1)Then
    Begin{1441:}
      Begin
        temp_ptr := get_avail;
        mem[temp_ptr].hh.lh := 0;
        mem[temp_ptr].hh.rh := LR_ptr;
        LR_ptr := temp_ptr;
      End{:1441};
      If (mem[this_box].hh.b1-0)=2 Then If cur_dir=1 Then
                                          Begin
                                            cur_dir := 0;
                                            cur_h := cur_h-mem[this_box+1].int;
                                          End
      Else mem[this_box].hh.b1 := 0;
      If (cur_dir=1)And((mem[this_box].hh.b1-0)<>1)Then{1452:}
        Begin
          save_h :=
                    cur_h;
          temp_ptr := p;
          p := new_kern(0);
          mem[prev_p].hh.rh := p;
          cur_h := 0;
          mem[p].hh.rh := reverse(this_box,0,cur_g,cur_glue);
          mem[p+1].int := -cur_h;
          cur_h := save_h;
          mem[this_box].hh.b1 := 1;
        End{:1452};
    End{:1445};
  left_edge := cur_h;
  While p<>0 Do{620:}
    21: If (p>=hi_mem_min)Then
          Begin
            If cur_h<>dvi_h Then
              Begin
                movement(cur_h-dvi_h,143);
                dvi_h := cur_h;
              End;
            If cur_v<>dvi_v Then
              Begin
                movement(cur_v-dvi_v,157);
                dvi_v := cur_v;
              End;
            Repeat
              f := mem[p].hh.b0;
              c := mem[p].hh.b1;
              If f<>dvi_f Then{621:}
                Begin
                  If Not font_used[f]Then
                    Begin
                      dvi_font_def(f
                      );
                      font_used[f] := true;
                    End;
                  If f<=64 Then
                    Begin
                      dvi_buf[dvi_ptr] := f+170;
                      dvi_ptr := dvi_ptr+1;
                      If dvi_ptr=dvi_limit Then dvi_swap;
                    End
                  Else
                    Begin
                      Begin
                        dvi_buf[dvi_ptr] := 235;
                        dvi_ptr := dvi_ptr+1;
                        If dvi_ptr=dvi_limit Then dvi_swap;
                      End;
                      Begin
                        dvi_buf[dvi_ptr] := f-1;
                        dvi_ptr := dvi_ptr+1;
                        If dvi_ptr=dvi_limit Then dvi_swap;
                      End;
                    End;
                  dvi_f := f;
                End{:621};
              If c>=128 Then
                Begin
                  dvi_buf[dvi_ptr] := 128;
                  dvi_ptr := dvi_ptr+1;
                  If dvi_ptr=dvi_limit Then dvi_swap;
                End;
              Begin
                dvi_buf[dvi_ptr] := c-0;
                dvi_ptr := dvi_ptr+1;
                If dvi_ptr=dvi_limit Then dvi_swap;
              End;
              cur_h := cur_h+font_info[width_base[f]+font_info[char_base[f]+c].qqqq.b0].
                       int;
              prev_p := mem[prev_p].hh.rh;
              p := mem[p].hh.rh;
            Until Not(p>=hi_mem_min);
            dvi_h := cur_h;
          End
        Else{622:}
          Begin
            Case mem[p].hh.b0 Of
              0,1:{623:}If mem[p+5].hh.rh=0
                          Then cur_h := cur_h+mem[p+1].int
                   Else
                     Begin
                       save_h := dvi_h;
                       save_v := dvi_v;
                       cur_v := base_line+mem[p+4].int;
                       temp_ptr := p;
                       edge := cur_h+mem[p+1].int;
                       If cur_dir=1 Then cur_h := edge;
                       If mem[p].hh.b0=1 Then vlist_out
                       Else hlist_out;
                       dvi_h := save_h;
                       dvi_v := save_v;
                       cur_h := edge;
                       cur_v := base_line;
                     End{:623};
              2:
                 Begin
                   rule_ht := mem[p+3].int;
                   rule_dp := mem[p+2].int;
                   rule_wd := mem[p+1].int;
                   goto 14;
                 End;
              8:{1367:}out_what(p){:1367};
              10:{625:}
                  Begin
                    g := mem[p+1].hh.lh;
                    rule_wd := mem[g+1].int-cur_g;
                    If g_sign<>0 Then
                      Begin
                        If g_sign=1 Then
                          Begin
                            If mem[g].hh.b0=g_order
                              Then
                              Begin
                                cur_glue := cur_glue+mem[g+2].int;
                                glue_temp := mem[this_box+6].gr*cur_glue;
                                If glue_temp>1000000000.0 Then glue_temp := 1000000000.0
                                Else If glue_temp
                                        <-1000000000.0 Then glue_temp := -1000000000.0;
                                cur_g := round(glue_temp);
                              End;
                          End
                        Else If mem[g].hh.b1=g_order Then
                               Begin
                                 cur_glue := cur_glue-mem[g+3].
                                             int;
                                 glue_temp := mem[this_box+6].gr*cur_glue;
                                 If glue_temp>1000000000.0 Then glue_temp := 1000000000.0
                                 Else If glue_temp
                                         <-1000000000.0 Then glue_temp := -1000000000.0;
                                 cur_g := round(glue_temp);
                               End;
                      End;
                    rule_wd := rule_wd+cur_g;
                    If (eTeX_mode=1)Then{1430:}If (((g_sign=1)And(mem[g].hh.b0=g_order))Or((
                                                  g_sign=2)And(mem[g].hh.b1=g_order)))Then
                                                 Begin
                                                   Begin
                                                     If mem[g].hh.rh=0
                                                       Then free_node(g,4)
                                                     Else mem[g].hh.rh := mem[g].hh.rh-1;
                                                   End;
                                                   If mem[p].hh.b1<100 Then
                                                     Begin
                                                       mem[p].hh.b0 := 11;
                                                       mem[p+1].int := rule_wd;
                                                     End
                                                   Else
                                                     Begin
                                                       g := get_node(4);
                                                       mem[g].hh.b0 := 4;
                                                       mem[g].hh.b1 := 4;
                                                       mem[g+1].int := rule_wd;
                                                       mem[g+2].int := 0;
                                                       mem[g+3].int := 0;
                                                       mem[p+1].hh.lh := g;
                                                     End;
                                                 End{:1430};
                    If mem[p].hh.b1>=100 Then{626:}
                      Begin
                        leader_box := mem[p+1].hh.rh;
                        If mem[leader_box].hh.b0=2 Then
                          Begin
                            rule_ht := mem[leader_box+3].int;
                            rule_dp := mem[leader_box+2].int;
                            goto 14;
                          End;
                        leader_wd := mem[leader_box+1].int;
                        If (leader_wd>0)And(rule_wd>0)Then
                          Begin
                            rule_wd := rule_wd+10;
                            If cur_dir=1 Then cur_h := cur_h-10;
                            edge := cur_h+rule_wd;
                            lx := 0;
{627:}
                            If mem[p].hh.b1=100 Then
                              Begin
                                save_h := cur_h;
                                cur_h := left_edge+leader_wd*((cur_h-left_edge)Div leader_wd);
                                If cur_h<save_h Then cur_h := cur_h+leader_wd;
                              End
                            Else
                              Begin
                                lq := rule_wd Div leader_wd;
                                lr := rule_wd Mod leader_wd;
                                If mem[p].hh.b1=101 Then cur_h := cur_h+(lr Div 2)
                                Else
                                  Begin
                                    lx := lr Div(lq
                                          +1);
                                    cur_h := cur_h+((lr-(lq-1)*lx)Div 2);
                                  End;
                              End{:627};
                            While cur_h+leader_wd<=edge Do{628:}
                              Begin
                                cur_v := base_line+mem[
                                         leader_box+4].int;
                                If cur_v<>dvi_v Then
                                  Begin
                                    movement(cur_v-dvi_v,157);
                                    dvi_v := cur_v;
                                  End;
                                save_v := dvi_v;
                                If cur_h<>dvi_h Then
                                  Begin
                                    movement(cur_h-dvi_h,143);
                                    dvi_h := cur_h;
                                  End;
                                save_h := dvi_h;
                                temp_ptr := leader_box;
                                If cur_dir=1 Then cur_h := cur_h+leader_wd;
                                outer_doing_leaders := doing_leaders;
                                doing_leaders := true;
                                If mem[leader_box].hh.b0=1 Then vlist_out
                                Else hlist_out;
                                doing_leaders := outer_doing_leaders;
                                dvi_v := save_v;
                                dvi_h := save_h;
                                cur_v := base_line;
                                cur_h := save_h+leader_wd+lx;
                              End{:628};
                            If cur_dir=1 Then cur_h := edge
                            Else cur_h := edge-10;
                            goto 15;
                          End;
                      End{:626};
                    goto 13;
                  End{:625};
              11: cur_h := cur_h+mem[p+1].int;
              9:{1447:}
                 Begin
                   If (eTeX_mode=1)Then{1448:}
                     Begin
                       If odd(mem[p].hh.b1)Then
                         If mem[LR_ptr].hh.lh=(4*(mem[p].hh.b1 Div 4)+3)Then
                           Begin
                             temp_ptr :=
                                         LR_ptr;
                             LR_ptr := mem[temp_ptr].hh.rh;
                             Begin
                               mem[temp_ptr].hh.rh := avail;
                               avail := temp_ptr;{dyn_used:=dyn_used-1;}
                             End;
                           End
                       Else
                         Begin
                           If mem[p].hh.b1>4 Then LR_problems := LR_problems+1;
                         End
                       Else
                         Begin
                           Begin
                             temp_ptr := get_avail;
                             mem[temp_ptr].hh.lh := (4*(mem[p].hh.b1 Div 4)+3);
                             mem[temp_ptr].hh.rh := LR_ptr;
                             LR_ptr := temp_ptr;
                           End;
                           If (mem[p].hh.b1 Div 8)<>cur_dir Then{1453:}
                             Begin
                               save_h := cur_h;
                               temp_ptr := mem[p].hh.rh;
                               rule_wd := mem[p+1].int;
                               free_node(p,2);
                               cur_dir := 1-cur_dir;
                               p := new_edge(cur_dir,rule_wd);
                               mem[prev_p].hh.rh := p;
                               cur_h := cur_h-left_edge+rule_wd;
                               mem[p].hh.rh := reverse(this_box,new_edge(1-cur_dir,0),cur_g,cur_glue
                                               );
                               mem[p+2].int := cur_h;
                               cur_dir := 1-cur_dir;
                               cur_h := save_h;
                               goto 21;
                             End{:1453};
                         End;
                       mem[p].hh.b0 := 11;
                     End{:1448};
                   cur_h := cur_h+mem[p+1].int;
                 End{:1447};
              6:{652:}
                 Begin
                   mem[29988] := mem[p+1];
                   mem[29988].hh.rh := mem[p].hh.rh;
                   p := 29988;
                   goto 21;
                 End{:652};{1451:}
              14:
                  Begin
                    cur_h := cur_h+mem[p+1].int;
                    left_edge := cur_h+mem[p+2].int;
                    cur_dir := mem[p].hh.b1;
                  End;
{:1451}
              others:
            End;
            goto 15;
            14:{624:}If (rule_ht=-1073741824)Then rule_ht := mem[this_box+3].int;
            If (rule_dp=-1073741824)Then rule_dp := mem[this_box+2].int;
            rule_ht := rule_ht+rule_dp;
            If (rule_ht>0)And(rule_wd>0)Then
              Begin
                If cur_h<>dvi_h Then
                  Begin
                    movement(cur_h-dvi_h,143);
                    dvi_h := cur_h;
                  End;
                cur_v := base_line+rule_dp;
                If cur_v<>dvi_v Then
                  Begin
                    movement(cur_v-dvi_v,157);
                    dvi_v := cur_v;
                  End;
                Begin
                  dvi_buf[dvi_ptr] := 132;
                  dvi_ptr := dvi_ptr+1;
                  If dvi_ptr=dvi_limit Then dvi_swap;
                End;
                dvi_four(rule_ht);
                dvi_four(rule_wd);
                cur_v := base_line;
                dvi_h := dvi_h+rule_wd;
              End{:624};
            13: cur_h := cur_h+rule_wd;
            15: prev_p := p;
            p := mem[p].hh.rh;
          End{:622}{:620};
{1446:}
  If (eTeX_mode=1)Then
    Begin{1449:}
      Begin
        While mem[LR_ptr].hh.lh<>0
          Do
          Begin
            If mem[LR_ptr].hh.lh>4 Then LR_problems := LR_problems+10000;
            Begin
              temp_ptr := LR_ptr;
              LR_ptr := mem[temp_ptr].hh.rh;
              Begin
                mem[temp_ptr].hh.rh := avail;
                avail := temp_ptr;{dyn_used:=dyn_used-1;}
              End;
            End;
          End;
        Begin
          temp_ptr := LR_ptr;
          LR_ptr := mem[temp_ptr].hh.rh;
          Begin
            mem[temp_ptr].hh.rh := avail;
            avail := temp_ptr;{dyn_used:=dyn_used-1;}
          End;
        End;
      End{:1449};
      If (mem[this_box].hh.b1-0)=2 Then cur_dir := 1;
    End{:1446};
  prune_movements(save_loc);
  If cur_s>0 Then dvi_pop(save_loc);
  cur_s := cur_s-1;
End;{:619}{629:}
Procedure vlist_out;

Label 13,14,15;

Var left_edge: scaled;
  top_edge: scaled;
  save_h,save_v: scaled;
  this_box: halfword;
  g_order: glue_ord;
  g_sign: 0..2;
  p: halfword;
  save_loc: integer;
  leader_box: halfword;
  leader_ht: scaled;
  lx: scaled;
  outer_doing_leaders: boolean;
  edge: scaled;
  glue_temp: real;
  cur_glue: real;
  cur_g: scaled;
Begin
  cur_g := 0;
  cur_glue := 0.0;
  this_box := temp_ptr;
  g_order := mem[this_box+5].hh.b1;
  g_sign := mem[this_box+5].hh.b0;
  p := mem[this_box+5].hh.rh;
  cur_s := cur_s+1;
  If cur_s>0 Then
    Begin
      dvi_buf[dvi_ptr] := 141;
      dvi_ptr := dvi_ptr+1;
      If dvi_ptr=dvi_limit Then dvi_swap;
    End;
  If cur_s>max_push Then max_push := cur_s;
  save_loc := dvi_offset+dvi_ptr;
  left_edge := cur_h;
  cur_v := cur_v-mem[this_box+3].int;
  top_edge := cur_v;
  While p<>0 Do{630:}
    Begin
      If (p>=hi_mem_min)Then confusion(839)
      Else{631:}
        Begin
          Case mem[p].hh.b0 Of
            0,1:{632:}If mem[p+5].hh.rh=0 Then cur_v :=
                                                        cur_v+mem[p+3].int+mem[p+2].int
                 Else
                   Begin
                     cur_v := cur_v+mem[p+3].int;
                     If cur_v<>dvi_v Then
                       Begin
                         movement(cur_v-dvi_v,157);
                         dvi_v := cur_v;
                       End;
                     save_h := dvi_h;
                     save_v := dvi_v;
                     If cur_dir=1 Then cur_h := left_edge-mem[p+4].int
                     Else cur_h := left_edge+
                                   mem[p+4].int;
                     temp_ptr := p;
                     If mem[p].hh.b0=1 Then vlist_out
                     Else hlist_out;
                     dvi_h := save_h;
                     dvi_v := save_v;
                     cur_v := save_v+mem[p+2].int;
                     cur_h := left_edge;
                   End{:632};
            2:
               Begin
                 rule_ht := mem[p+3].int;
                 rule_dp := mem[p+2].int;
                 rule_wd := mem[p+1].int;
                 goto 14;
               End;
            8:{1366:}out_what(p){:1366};
            10:{634:}
                Begin
                  g := mem[p+1].hh.lh;
                  rule_ht := mem[g+1].int-cur_g;
                  If g_sign<>0 Then
                    Begin
                      If g_sign=1 Then
                        Begin
                          If mem[g].hh.b0=g_order
                            Then
                            Begin
                              cur_glue := cur_glue+mem[g+2].int;
                              glue_temp := mem[this_box+6].gr*cur_glue;
                              If glue_temp>1000000000.0 Then glue_temp := 1000000000.0
                              Else If glue_temp
                                      <-1000000000.0 Then glue_temp := -1000000000.0;
                              cur_g := round(glue_temp);
                            End;
                        End
                      Else If mem[g].hh.b1=g_order Then
                             Begin
                               cur_glue := cur_glue-mem[g+3].
                                           int;
                               glue_temp := mem[this_box+6].gr*cur_glue;
                               If glue_temp>1000000000.0 Then glue_temp := 1000000000.0
                               Else If glue_temp
                                       <-1000000000.0 Then glue_temp := -1000000000.0;
                               cur_g := round(glue_temp);
                             End;
                    End;
                  rule_ht := rule_ht+cur_g;
                  If mem[p].hh.b1>=100 Then{635:}
                    Begin
                      leader_box := mem[p+1].hh.rh;
                      If mem[leader_box].hh.b0=2 Then
                        Begin
                          rule_wd := mem[leader_box+1].int;
                          rule_dp := 0;
                          goto 14;
                        End;
                      leader_ht := mem[leader_box+3].int+mem[leader_box+2].int;
                      If (leader_ht>0)And(rule_ht>0)Then
                        Begin
                          rule_ht := rule_ht+10;
                          edge := cur_v+rule_ht;
                          lx := 0;
{636:}
                          If mem[p].hh.b1=100 Then
                            Begin
                              save_v := cur_v;
                              cur_v := top_edge+leader_ht*((cur_v-top_edge)Div leader_ht);
                              If cur_v<save_v Then cur_v := cur_v+leader_ht;
                            End
                          Else
                            Begin
                              lq := rule_ht Div leader_ht;
                              lr := rule_ht Mod leader_ht;
                              If mem[p].hh.b1=101 Then cur_v := cur_v+(lr Div 2)
                              Else
                                Begin
                                  lx := lr Div(lq
                                        +1);
                                  cur_v := cur_v+((lr-(lq-1)*lx)Div 2);
                                End;
                            End{:636};
                          While cur_v+leader_ht<=edge Do{637:}
                            Begin
                              If cur_dir=1 Then cur_h :=
                                                         left_edge-mem[leader_box+4].int
                              Else cur_h := left_edge+mem[leader_box+4].
                                            int;
                              If cur_h<>dvi_h Then
                                Begin
                                  movement(cur_h-dvi_h,143);
                                  dvi_h := cur_h;
                                End;
                              save_h := dvi_h;
                              cur_v := cur_v+mem[leader_box+3].int;
                              If cur_v<>dvi_v Then
                                Begin
                                  movement(cur_v-dvi_v,157);
                                  dvi_v := cur_v;
                                End;
                              save_v := dvi_v;
                              temp_ptr := leader_box;
                              outer_doing_leaders := doing_leaders;
                              doing_leaders := true;
                              If mem[leader_box].hh.b0=1 Then vlist_out
                              Else hlist_out;
                              doing_leaders := outer_doing_leaders;
                              dvi_v := save_v;
                              dvi_h := save_h;
                              cur_h := left_edge;
                              cur_v := save_v-mem[leader_box+3].int+leader_ht+lx;
                            End{:637};
                          cur_v := edge-10;
                          goto 15;
                        End;
                    End{:635};
                  goto 13;
                End{:634};
            11: cur_v := cur_v+mem[p+1].int;
            others:
          End;
          goto 15;
          14:{633:}If (rule_wd=-1073741824)Then rule_wd := mem[this_box+1].int;
          rule_ht := rule_ht+rule_dp;
          cur_v := cur_v+rule_ht;
          If (rule_ht>0)And(rule_wd>0)Then
            Begin
              If cur_dir=1 Then cur_h := cur_h-
                                         rule_wd;
              If cur_h<>dvi_h Then
                Begin
                  movement(cur_h-dvi_h,143);
                  dvi_h := cur_h;
                End;
              If cur_v<>dvi_v Then
                Begin
                  movement(cur_v-dvi_v,157);
                  dvi_v := cur_v;
                End;
              Begin
                dvi_buf[dvi_ptr] := 137;
                dvi_ptr := dvi_ptr+1;
                If dvi_ptr=dvi_limit Then dvi_swap;
              End;
              dvi_four(rule_ht);
              dvi_four(rule_wd);
              cur_h := left_edge;
            End;
          goto 15{:633};
          13: cur_v := cur_v+rule_ht;
        End{:631};
      15: p := mem[p].hh.rh;
    End{:630};
  prune_movements(save_loc);
  If cur_s>0 Then dvi_pop(save_loc);
  cur_s := cur_s-1;
End;{:629}{638:}
Procedure ship_out(p:halfword);

Label 30;

Var page_loc: integer;
  j,k: 0..9;
  s: pool_pointer;
  old_setting: 0..21;
Begin
  If eqtb[5302].int>0 Then
    Begin
      print_nl(339);
      print_ln;
      print(840);
    End;
  If term_offset>max_print_line-9 Then print_ln
  Else If (term_offset>0)Or(
          file_offset>0)Then print_char(32);
  print_char(91);
  j := 9;
  While (eqtb[5333+j].int=0)And(j>0) Do
    j := j-1;
  For k:=0 To j Do
    Begin
      print_int(eqtb[5333+k].int);
      If k<j Then print_char(46);
    End;
  break(term_out);
  If eqtb[5302].int>0 Then
    Begin
      print_char(93);
      begin_diagnostic;
      show_box(p);
      end_diagnostic(true);
    End;
{640:}{641:}
  If (mem[p+3].int>1073741823)Or(mem[p+2].int>1073741823)Or(mem
     [p+3].int+mem[p+2].int+eqtb[5864].int>1073741823)Or(mem[p+1].int+eqtb[
     5863].int>1073741823)Then
    Begin
      Begin
        If interaction=3 Then;
        print_nl(263);
        print(844);
      End;
      Begin
        help_ptr := 2;
        help_line[1] := 845;
        help_line[0] := 846;
      End;
      error;
      If eqtb[5302].int<=0 Then
        Begin
          begin_diagnostic;
          print_nl(847);
          show_box(p);
          end_diagnostic(true);
        End;
      goto 30;
    End;
  If mem[p+3].int+mem[p+2].int+eqtb[5864].int>max_v Then max_v := mem[p+3].
                                                                  int+mem[p+2].int+eqtb[5864].int;
  If mem[p+1].int+eqtb[5863].int>max_h Then max_h := mem[p+1].int+eqtb[5863]
                                                     .int{:641};{617:}
  dvi_h := 0;
  dvi_v := 0;
  cur_h := eqtb[5863].int;
  dvi_f := 0;
  If output_file_name=0 Then
    Begin
      If job_name=0 Then open_log_file;
      pack_job_name(805);
      While Not b_open_out(dvi_file) Do
        prompt_file_name(806,805);
      output_file_name := b_make_name_string(dvi_file);
    End;
  If total_pages=0 Then
    Begin
      Begin
        dvi_buf[dvi_ptr] := 247;
        dvi_ptr := dvi_ptr+1;
        If dvi_ptr=dvi_limit Then dvi_swap;
      End;
      Begin
        dvi_buf[dvi_ptr] := 2;
        dvi_ptr := dvi_ptr+1;
        If dvi_ptr=dvi_limit Then dvi_swap;
      End;
      dvi_four(25400000);
      dvi_four(473628672);
      prepare_mag;
      dvi_four(eqtb[5285].int);
      old_setting := selector;
      selector := 21;
      print(838);
      print_int(eqtb[5291].int);
      print_char(46);
      print_two(eqtb[5290].int);
      print_char(46);
      print_two(eqtb[5289].int);
      print_char(58);
      print_two(eqtb[5288].int Div 60);
      print_two(eqtb[5288].int Mod 60);
      selector := old_setting;
      Begin
        dvi_buf[dvi_ptr] := (pool_ptr-str_start[str_ptr]);
        dvi_ptr := dvi_ptr+1;
        If dvi_ptr=dvi_limit Then dvi_swap;
      End;
      For s:=str_start[str_ptr]To pool_ptr-1 Do
        Begin
          dvi_buf[dvi_ptr] :=
                              str_pool[s];
          dvi_ptr := dvi_ptr+1;
          If dvi_ptr=dvi_limit Then dvi_swap;
        End;
      pool_ptr := str_start[str_ptr];
    End{:617};
  page_loc := dvi_offset+dvi_ptr;
  Begin
    dvi_buf[dvi_ptr] := 139;
    dvi_ptr := dvi_ptr+1;
    If dvi_ptr=dvi_limit Then dvi_swap;
  End;
  For k:=0 To 9 Do
    dvi_four(eqtb[5333+k].int);
  dvi_four(last_bop);
  last_bop := page_loc;
  cur_v := mem[p+3].int+eqtb[5864].int;
  temp_ptr := p;
  If mem[p].hh.b0=1 Then vlist_out
  Else hlist_out;
  Begin
    dvi_buf[dvi_ptr] := 140;
    dvi_ptr := dvi_ptr+1;
    If dvi_ptr=dvi_limit Then dvi_swap;
  End;
  total_pages := total_pages+1;
  cur_s := -1;
  30:{:640};
  If (eTeX_mode=1)Then{1465:}
    Begin
      If LR_problems>0 Then
        Begin{1444:}
          Begin
            print_ln;
            print_nl(1373);
            print_int(LR_problems Div 10000);
            print(1374);
            print_int(LR_problems Mod 10000);
            print(1375);
            LR_problems := 0;
          End{:1444};
          print_char(41);
          print_ln;
        End;
      If (LR_ptr<>0)Or(cur_dir<>0)Then confusion(1377);
    End{:1465};
  If eqtb[5302].int<=0 Then print_char(93);
  dead_cycles := 0;
  break(term_out);
{639:}
{if eqtb[5299].int>1 then begin print_nl(841);print_int(var_used);
print_char(38);print_int(dyn_used);print_char(59);end;}
  flush_node_list(p);
{if eqtb[5299].int>1 then begin print(842);
print_int(var_used);print_char(38);print_int(dyn_used);print(843);
print_int(hi_mem_min-lo_mem_max-1);print_ln;end;}
  {:639};
End;
{:638}{645:}
Procedure scan_spec(c:group_code;three_codes:boolean);

Label 40;

Var s: integer;
  spec_code: 0..1;
Begin
  If three_codes Then s := save_stack[save_ptr+0].int;
  If scan_keyword(853)Then spec_code := 0
  Else If scan_keyword(854)Then
         spec_code := 1
  Else
    Begin
      spec_code := 1;
      cur_val := 0;
      goto 40;
    End;
  scan_dimen(false,false,false);
  40: If three_codes Then
        Begin
          save_stack[save_ptr+0].int := s;
          save_ptr := save_ptr+1;
        End;
  save_stack[save_ptr+0].int := spec_code;
  save_stack[save_ptr+1].int := cur_val;
  save_ptr := save_ptr+2;
  new_save_level(c);
  scan_left_brace;
End;
{:645}{649:}
Function hpack(p:halfword;w:scaled;m:small_number): halfword;

Label 21,50,10;

Var r: halfword;
  q: halfword;
  h,d,x: scaled;
  s: scaled;
  g: halfword;
  o: glue_ord;
  f: internal_font_number;
  i: four_quarters;
  hd: eight_bits;
Begin
  last_badness := 0;
  r := get_node(7);
  mem[r].hh.b0 := 0;
  mem[r].hh.b1 := 0;
  mem[r+4].int := 0;
  q := r+5;
  mem[q].hh.rh := p;
  h := 0;{650:}
  d := 0;
  x := 0;
  total_stretch[0] := 0;
  total_shrink[0] := 0;
  total_stretch[1] := 0;
  total_shrink[1] := 0;
  total_stretch[2] := 0;
  total_shrink[2] := 0;
  total_stretch[3] := 0;
  total_shrink[3] := 0{:650};
  If (eqtb[5332].int>0)Then{1441:}
    Begin
      temp_ptr := get_avail;
      mem[temp_ptr].hh.lh := 0;
      mem[temp_ptr].hh.rh := LR_ptr;
      LR_ptr := temp_ptr;
    End{:1441};
  While p<>0 Do{651:}
    Begin
      21: While (p>=hi_mem_min) Do{654:}
            Begin
              f := mem[p].
                   hh.b0;
              i := font_info[char_base[f]+mem[p].hh.b1].qqqq;
              hd := i.b1-0;
              x := x+font_info[width_base[f]+i.b0].int;
              s := font_info[height_base[f]+(hd)Div 16].int;
              If s>h Then h := s;
              s := font_info[depth_base[f]+(hd)Mod 16].int;
              If s>d Then d := s;
              p := mem[p].hh.rh;
            End{:654};
      If p<>0 Then
        Begin
          Case mem[p].hh.b0 Of
            0,1,2,13:{653:}
                      Begin
                        x := x+mem[p
                             +1].int;
                        If mem[p].hh.b0>=2 Then s := 0
                        Else s := mem[p+4].int;
                        If mem[p+3].int-s>h Then h := mem[p+3].int-s;
                        If mem[p+2].int+s>d Then d := mem[p+2].int+s;
                      End{:653};
            3,4,5: If adjust_tail<>0 Then{655:}
                     Begin
                       While mem[q].hh.rh<>p Do
                         q := mem[
                              q].hh.rh;
                       If mem[p].hh.b0=5 Then
                         Begin
                           mem[adjust_tail].hh.rh := mem[p+1].int;
                           While mem[adjust_tail].hh.rh<>0 Do
                             adjust_tail := mem[adjust_tail].hh.rh;
                           p := mem[p].hh.rh;
                           free_node(mem[q].hh.rh,2);
                         End
                       Else
                         Begin
                           mem[adjust_tail].hh.rh := p;
                           adjust_tail := p;
                           p := mem[p].hh.rh;
                         End;
                       mem[q].hh.rh := p;
                       p := q;
                     End{:655};
            8:{1360:}{:1360};
            10:{656:}
                Begin
                  g := mem[p+1].hh.lh;
                  x := x+mem[g+1].int;
                  o := mem[g].hh.b0;
                  total_stretch[o] := total_stretch[o]+mem[g+2].int;
                  o := mem[g].hh.b1;
                  total_shrink[o] := total_shrink[o]+mem[g+3].int;
                  If mem[p].hh.b1>=100 Then
                    Begin
                      g := mem[p+1].hh.rh;
                      If mem[g+3].int>h Then h := mem[g+3].int;
                      If mem[g+2].int>d Then d := mem[g+2].int;
                    End;
                End{:656};
            11: x := x+mem[p+1].int;
            9:
               Begin
                 x := x+mem[p+1].int;
                 If (eqtb[5332].int>0)Then{1442:}If odd(mem[p].hh.b1)Then If mem[LR_ptr].
                                                                             hh.lh=(4*(mem[p].hh.b1
                                                                             Div 4)+3)Then
                                                                            Begin
                                                                              temp_ptr := LR_ptr;
                                                                              LR_ptr := mem[temp_ptr
                                                                                        ].hh.rh;
                                                                              Begin
                                                                                mem[temp_ptr].hh.rh
                                                                                := avail;
                                                                                avail := temp_ptr;
                                                                             {dyn_used:=dyn_used-1;}
                                                                              End;
                                                                            End
                 Else
                   Begin
                     LR_problems := LR_problems+1;
                     mem[p].hh.b0 := 11;
                     mem[p].hh.b1 := 1;
                   End
                 Else
                   Begin
                     temp_ptr := get_avail;
                     mem[temp_ptr].hh.lh := (4*(mem[p].hh.b1 Div 4)+3);
                     mem[temp_ptr].hh.rh := LR_ptr;
                     LR_ptr := temp_ptr;
                   End{:1442};
               End;
            6:{652:}
               Begin
                 mem[29988] := mem[p+1];
                 mem[29988].hh.rh := mem[p].hh.rh;
                 p := 29988;
                 goto 21;
               End{:652};
            others:
          End;
          p := mem[p].hh.rh;
        End;
    End{:651};
  If adjust_tail<>0 Then mem[adjust_tail].hh.rh := 0;
  mem[r+3].int := h;
  mem[r+2].int := d;{657:}
  If m=1 Then w := x+w;
  mem[r+1].int := w;
  x := w-x;
  If x=0 Then
    Begin
      mem[r+5].hh.b0 := 0;
      mem[r+5].hh.b1 := 0;
      mem[r+6].gr := 0.0;
      goto 10;
    End
  Else If x>0 Then{658:}
         Begin{659:}
           If total_stretch[3]<>0 Then o := 3
           Else If total_stretch[2]<>0 Then o := 2
           Else If total_stretch[1]<>0 Then o
                  := 1
           Else o := 0{:659};
           mem[r+5].hh.b1 := o;
           mem[r+5].hh.b0 := 1;
           If total_stretch[o]<>0 Then mem[r+6].gr := x/total_stretch[o]
           Else
             Begin
               mem[r+5].hh.b0 := 0;
               mem[r+6].gr := 0.0;
             End;
           If o=0 Then If mem[r+5].hh.rh<>0 Then{660:}
                         Begin
                           last_badness := badness(x
                                           ,total_stretch[0]);
                           If last_badness>eqtb[5294].int Then
                             Begin
                               print_ln;
                               If last_badness>100 Then print_nl(855)
                               Else print_nl(856);
                               print(857);
                               print_int(last_badness);
                               goto 50;
                             End;
                         End{:660};
           goto 10;
         End{:658}
  Else{664:}
    Begin{665:}
      If total_shrink[3]<>0 Then o := 3
      Else If
              total_shrink[2]<>0 Then o := 2
      Else If total_shrink[1]<>0 Then o := 1
      Else o
        := 0{:665};
      mem[r+5].hh.b1 := o;
      mem[r+5].hh.b0 := 2;
      If total_shrink[o]<>0 Then mem[r+6].gr := (-x)/total_shrink[o]
      Else
        Begin
          mem[r+5].hh.b0 := 0;
          mem[r+6].gr := 0.0;
        End;
      If (total_shrink[o]<-x)And(o=0)And(mem[r+5].hh.rh<>0)Then
        Begin
          last_badness := 1000000;
          mem[r+6].gr := 1.0;
{666:}
          If (-x-total_shrink[0]>eqtb[5853].int)Or(eqtb[5294].int<100)Then
            Begin
              If (eqtb[5861].int>0)And(-x-total_shrink[0]>eqtb[5853].int)Then
                Begin
                  While mem[q].hh.rh<>0 Do
                    q := mem[q].hh.rh;
                  mem[q].hh.rh := new_rule;
                  mem[mem[q].hh.rh+1].int := eqtb[5861].int;
                End;
              print_ln;
              print_nl(863);
              print_scaled(-x-total_shrink[0]);
              print(864);
              goto 50;
            End{:666};
        End
      Else If o=0 Then If mem[r+5].hh.rh<>0 Then{667:}
                         Begin
                           last_badness :=
                                           badness(-x,total_shrink[0]);
                           If last_badness>eqtb[5294].int Then
                             Begin
                               print_ln;
                               print_nl(865);
                               print_int(last_badness);
                               goto 50;
                             End;
                         End{:667};
      goto 10;
    End{:664}{:657};
  50:{663:}If output_active Then print(858)
      Else
        Begin
          If pack_begin_line<>
             0 Then
            Begin
              If pack_begin_line>0 Then print(859)
              Else print(860);
              print_int(abs(pack_begin_line));
              print(861);
            End
          Else print(862);
          print_int(line);
        End;
  print_ln;
  font_in_short_display := 0;
  short_display(mem[r+5].hh.rh);
  print_ln;
  begin_diagnostic;
  show_box(r);
  end_diagnostic(true){:663};
  10: If (eqtb[5332].int>0)Then{1443:}
        Begin
          If mem[LR_ptr].hh.lh<>0 Then
            Begin
              While mem[q].hh.rh<>0 Do
                q := mem[q].hh.rh;
              Repeat
                temp_ptr := q;
                q := new_math(0,mem[LR_ptr].hh.lh);
                mem[temp_ptr].hh.rh := q;
                LR_problems := LR_problems+10000;
                Begin
                  temp_ptr := LR_ptr;
                  LR_ptr := mem[temp_ptr].hh.rh;
                  Begin
                    mem[temp_ptr].hh.rh := avail;
                    avail := temp_ptr;{dyn_used:=dyn_used-1;}
                  End;
                End;
              Until mem[LR_ptr].hh.lh=0;
            End;
          If LR_problems>0 Then
            Begin{1444:}
              Begin
                print_ln;
                print_nl(1373);
                print_int(LR_problems Div 10000);
                print(1374);
                print_int(LR_problems Mod 10000);
                print(1375);
                LR_problems := 0;
              End{:1444};
              goto 50;
            End;
          Begin
            temp_ptr := LR_ptr;
            LR_ptr := mem[temp_ptr].hh.rh;
            Begin
              mem[temp_ptr].hh.rh := avail;
              avail := temp_ptr;{dyn_used:=dyn_used-1;}
            End;
          End;
          If LR_ptr<>0 Then confusion(1372);
        End{:1443};
  hpack := r;
End;
{:649}{668:}
Function vpackage(p:halfword;h:scaled;m:small_number;
                  l:scaled): halfword;

Label 50,10;

Var r: halfword;
  w,d,x: scaled;
  s: scaled;
  g: halfword;
  o: glue_ord;
Begin
  last_badness := 0;
  r := get_node(7);
  mem[r].hh.b0 := 1;
  mem[r].hh.b1 := 0;
  mem[r+4].int := 0;
  mem[r+5].hh.rh := p;
  w := 0;
{650:}
  d := 0;
  x := 0;
  total_stretch[0] := 0;
  total_shrink[0] := 0;
  total_stretch[1] := 0;
  total_shrink[1] := 0;
  total_stretch[2] := 0;
  total_shrink[2] := 0;
  total_stretch[3] := 0;
  total_shrink[3] := 0{:650};
  While p<>0 Do{669:}
    Begin
      If (p>=hi_mem_min)Then confusion(866)
      Else Case
                mem[p].hh.b0 Of
             0,1,2,13:{670:}
                       Begin
                         x := x+d+mem[p+3].int;
                         d := mem[p+2].int;
                         If mem[p].hh.b0>=2 Then s := 0
                         Else s := mem[p+4].int;
                         If mem[p+1].int+s>w Then w := mem[p+1].int+s;
                       End{:670};
             8:{1359:}{:1359};
             10:{671:}
                 Begin
                   x := x+d;
                   d := 0;
                   g := mem[p+1].hh.lh;
                   x := x+mem[g+1].int;
                   o := mem[g].hh.b0;
                   total_stretch[o] := total_stretch[o]+mem[g+2].int;
                   o := mem[g].hh.b1;
                   total_shrink[o] := total_shrink[o]+mem[g+3].int;
                   If mem[p].hh.b1>=100 Then
                     Begin
                       g := mem[p+1].hh.rh;
                       If mem[g+1].int>w Then w := mem[g+1].int;
                     End;
                 End{:671};
             11:
                 Begin
                   x := x+d+mem[p+1].int;
                   d := 0;
                 End;
             others:
        End;
      p := mem[p].hh.rh;
    End{:669};
  mem[r+1].int := w;
  If d>l Then
    Begin
      x := x+d-l;
      mem[r+2].int := l;
    End
  Else mem[r+2].int := d;{672:}
  If m=1 Then h := x+h;
  mem[r+3].int := h;
  x := h-x;
  If x=0 Then
    Begin
      mem[r+5].hh.b0 := 0;
      mem[r+5].hh.b1 := 0;
      mem[r+6].gr := 0.0;
      goto 10;
    End
  Else If x>0 Then{673:}
         Begin{659:}
           If total_stretch[3]<>0 Then o := 3
           Else If total_stretch[2]<>0 Then o := 2
           Else If total_stretch[1]<>0 Then o
                  := 1
           Else o := 0{:659};
           mem[r+5].hh.b1 := o;
           mem[r+5].hh.b0 := 1;
           If total_stretch[o]<>0 Then mem[r+6].gr := x/total_stretch[o]
           Else
             Begin
               mem[r+5].hh.b0 := 0;
               mem[r+6].gr := 0.0;
             End;
           If o=0 Then If mem[r+5].hh.rh<>0 Then{674:}
                         Begin
                           last_badness := badness(x
                                           ,total_stretch[0]);
                           If last_badness>eqtb[5295].int Then
                             Begin
                               print_ln;
                               If last_badness>100 Then print_nl(855)
                               Else print_nl(856);
                               print(867);
                               print_int(last_badness);
                               goto 50;
                             End;
                         End{:674};
           goto 10;
         End{:673}
  Else{676:}
    Begin{665:}
      If total_shrink[3]<>0 Then o := 3
      Else If
              total_shrink[2]<>0 Then o := 2
      Else If total_shrink[1]<>0 Then o := 1
      Else o
        := 0{:665};
      mem[r+5].hh.b1 := o;
      mem[r+5].hh.b0 := 2;
      If total_shrink[o]<>0 Then mem[r+6].gr := (-x)/total_shrink[o]
      Else
        Begin
          mem[r+5].hh.b0 := 0;
          mem[r+6].gr := 0.0;
        End;
      If (total_shrink[o]<-x)And(o=0)And(mem[r+5].hh.rh<>0)Then
        Begin
          last_badness := 1000000;
          mem[r+6].gr := 1.0;
{677:}
          If (-x-total_shrink[0]>eqtb[5854].int)Or(eqtb[5295].int<100)Then
            Begin
              print_ln;
              print_nl(868);
              print_scaled(-x-total_shrink[0]);
              print(869);
              goto 50;
            End{:677};
        End
      Else If o=0 Then If mem[r+5].hh.rh<>0 Then{678:}
                         Begin
                           last_badness :=
                                           badness(-x,total_shrink[0]);
                           If last_badness>eqtb[5295].int Then
                             Begin
                               print_ln;
                               print_nl(870);
                               print_int(last_badness);
                               goto 50;
                             End;
                         End{:678};
      goto 10;
    End{:676}{:672};
  50:{675:}If output_active Then print(858)
      Else
        Begin
          If pack_begin_line<>
             0 Then
            Begin
              print(860);
              print_int(abs(pack_begin_line));
              print(861);
            End
          Else print(862);
          print_int(line);
          print_ln;
        End;
  begin_diagnostic;
  show_box(r);
  end_diagnostic(true){:675};
  10: vpackage := r;
End;
{:668}{679:}
Procedure append_to_vlist(b:halfword);

Var d: scaled;
  p: halfword;
Begin
  If cur_list.aux_field.int>-65536000 Then
    Begin
      d := mem[eqtb[2883].
           hh.rh+1].int-cur_list.aux_field.int-mem[b+3].int;
      If d<eqtb[5847].int Then p := new_param_glue(0)
      Else
        Begin
          p :=
               new_skip_param(1);
          mem[temp_ptr+1].int := d;
        End;
      mem[cur_list.tail_field].hh.rh := p;
      cur_list.tail_field := p;
    End;
  mem[cur_list.tail_field].hh.rh := b;
  cur_list.tail_field := b;
  cur_list.aux_field.int := mem[b+2].int;
End;
{:679}{686:}
Function new_noad: halfword;

Var p: halfword;
Begin
  p := get_node(4);
  mem[p].hh.b0 := 16;
  mem[p].hh.b1 := 0;
  mem[p+1].hh := empty_field;
  mem[p+3].hh := empty_field;
  mem[p+2].hh := empty_field;
  new_noad := p;
End;
{:686}{688:}
Function new_style(s:small_number): halfword;

Var p: halfword;
Begin
  p := get_node(3);
  mem[p].hh.b0 := 14;
  mem[p].hh.b1 := s;
  mem[p+1].int := 0;
  mem[p+2].int := 0;
  new_style := p;
End;
{:688}{689:}
Function new_choice: halfword;

Var p: halfword;
Begin
  p := get_node(3);
  mem[p].hh.b0 := 15;
  mem[p].hh.b1 := 0;
  mem[p+1].hh.lh := 0;
  mem[p+1].hh.rh := 0;
  mem[p+2].hh.lh := 0;
  mem[p+2].hh.rh := 0;
  new_choice := p;
End;
{:689}{693:}
Procedure show_info;
Begin
  show_node_list(mem[temp_ptr].hh.lh);
End;
{:693}{704:}
Function fraction_rule(t:scaled): halfword;

Var p: halfword;
Begin
  p := new_rule;
  mem[p+3].int := t;
  mem[p+2].int := 0;
  fraction_rule := p;
End;
{:704}{705:}
Function overbar(b:halfword;k,t:scaled): halfword;

Var p,q: halfword;
Begin
  p := new_kern(k);
  mem[p].hh.rh := b;
  q := fraction_rule(t);
  mem[q].hh.rh := p;
  p := new_kern(t);
  mem[p].hh.rh := q;
  overbar := vpackage(p,0,1,1073741823);
End;
{:705}{706:}{709:}
Function char_box(f:internal_font_number;
                  c:quarterword): halfword;

Var q: four_quarters;
  hd: eight_bits;
  b,p: halfword;
Begin
  q := font_info[char_base[f]+c].qqqq;
  hd := q.b1-0;
  b := new_null_box;
  mem[b+1].int := font_info[width_base[f]+q.b0].int+font_info[italic_base[f]
                  +(q.b2-0)Div 4].int;
  mem[b+3].int := font_info[height_base[f]+(hd)Div 16].int;
  mem[b+2].int := font_info[depth_base[f]+(hd)Mod 16].int;
  p := get_avail;
  mem[p].hh.b1 := c;
  mem[p].hh.b0 := f;
  mem[b+5].hh.rh := p;
  char_box := b;
End;
{:709}{711:}
Procedure stack_into_box(b:halfword;f:internal_font_number;
                         c:quarterword);

Var p: halfword;
Begin
  p := char_box(f,c);
  mem[p].hh.rh := mem[b+5].hh.rh;
  mem[b+5].hh.rh := p;
  mem[b+3].int := mem[p+3].int;
End;
{:711}{712:}
Function height_plus_depth(f:internal_font_number;
                           c:quarterword): scaled;

Var q: four_quarters;
  hd: eight_bits;
Begin
  q := font_info[char_base[f]+c].qqqq;
  hd := q.b1-0;
  height_plus_depth := font_info[height_base[f]+(hd)Div 16].int+font_info[
                       depth_base[f]+(hd)Mod 16].int;
End;
{:712}
Function var_delimiter(d:halfword;s:small_number;
                       v:scaled): halfword;

Label 40,22;

Var b: halfword;
  f,g: internal_font_number;
  c,x,y: quarterword;
  m,n: integer;
  u: scaled;
  w: scaled;
  q: four_quarters;
  hd: eight_bits;
  r: four_quarters;
  z: small_number;
  large_attempt: boolean;
Begin
  f := 0;
  w := 0;
  large_attempt := false;
  z := mem[d].qqqq.b0;
  x := mem[d].qqqq.b1;
  While true Do
    Begin{707:}
      If (z<>0)Or(x<>0)Then
        Begin
          z := z+s+16;
          Repeat
            z := z-16;
            g := eqtb[3940+z].hh.rh;
            If g<>0 Then{708:}
              Begin
                y := x;
                If (y-0>=font_bc[g])And(y-0<=font_ec[g])Then
                  Begin
                    22: q := font_info[
                             char_base[g]+y].qqqq;
                    If (q.b0>0)Then
                      Begin
                        If ((q.b2-0)Mod 4)=3 Then
                          Begin
                            f := g;
                            c := y;
                            goto 40;
                          End;
                        hd := q.b1-0;
                        u := font_info[height_base[g]+(hd)Div 16].int+font_info[depth_base[g]+(hd)
                             Mod 16].int;
                        If u>w Then
                          Begin
                            f := g;
                            c := y;
                            w := u;
                            If u>=v Then goto 40;
                          End;
                        If ((q.b2-0)Mod 4)=2 Then
                          Begin
                            y := q.b3;
                            goto 22;
                          End;
                      End;
                  End;
              End{:708};
          Until z<16;
        End{:707};
      If large_attempt Then goto 40;
      large_attempt := true;
      z := mem[d].qqqq.b2;
      x := mem[d].qqqq.b3;
    End;
  40: If f<>0 Then{710:}If ((q.b2-0)Mod 4)=3 Then{713:}
                          Begin
                            b := new_null_box
                            ;
                            mem[b].hh.b0 := 1;
                            r := font_info[exten_base[f]+q.b3].qqqq;{714:}
                            c := r.b3;
                            u := height_plus_depth(f,c);
                            w := 0;
                            q := font_info[char_base[f]+c].qqqq;
                            mem[b+1].int := font_info[width_base[f]+q.b0].int+font_info[italic_base[
                                            f]
                                            +(q.b2-0)Div 4].int;
                            c := r.b2;
                            If c<>0 Then w := w+height_plus_depth(f,c);
                            c := r.b1;
                            If c<>0 Then w := w+height_plus_depth(f,c);
                            c := r.b0;
                            If c<>0 Then w := w+height_plus_depth(f,c);
                            n := 0;
                            If u>0 Then While w<v Do
                                          Begin
                                            w := w+u;
                                            n := n+1;
                                            If r.b1<>0 Then w := w+u;
                                          End{:714};
                            c := r.b2;
                            If c<>0 Then stack_into_box(b,f,c);
                            c := r.b3;
                            For m:=1 To n Do
                              stack_into_box(b,f,c);
                            c := r.b1;
                            If c<>0 Then
                              Begin
                                stack_into_box(b,f,c);
                                c := r.b3;
                                For m:=1 To n Do
                                  stack_into_box(b,f,c);
                              End;
                            c := r.b0;
                            If c<>0 Then stack_into_box(b,f,c);
                            mem[b+2].int := w-mem[b+3].int;
                          End{:713}
      Else b := char_box(f,c){:710}
      Else
        Begin
          b := new_null_box;
          mem[b+1].int := eqtb[5856].int;
        End;
  mem[b+4].int := half(mem[b+3].int-mem[b+2].int)-font_info[22+param_base[
                  eqtb[3942+s].hh.rh]].int;
  var_delimiter := b;
End;
{:706}{715:}
Function rebox(b:halfword;w:scaled): halfword;

Var p: halfword;
  f: internal_font_number;
  v: scaled;
Begin
  If (mem[b+1].int<>w)And(mem[b+5].hh.rh<>0)Then
    Begin
      If mem[b].hh.
         b0=1 Then b := hpack(b,0,1);
      p := mem[b+5].hh.rh;
      If ((p>=hi_mem_min))And(mem[p].hh.rh=0)Then
        Begin
          f := mem[p].hh.b0;
          v := font_info[width_base[f]+font_info[char_base[f]+mem[p].hh.b1].qqqq.b0]
               .int;
          If v<>mem[b+1].int Then mem[p].hh.rh := new_kern(mem[b+1].int-v);
        End;
      free_node(b,7);
      b := new_glue(12);
      mem[b].hh.rh := p;
      While mem[p].hh.rh<>0 Do
        p := mem[p].hh.rh;
      mem[p].hh.rh := new_glue(12);
      rebox := hpack(b,w,0);
    End
  Else
    Begin
      mem[b+1].int := w;
      rebox := b;
    End;
End;
{:715}{716:}
Function math_glue(g:halfword;m:scaled): halfword;

Var p: halfword;
  n: integer;
  f: scaled;
Begin
  n := x_over_n(m,65536);
  f := remainder;
  If f<0 Then
    Begin
      n := n-1;
      f := f+65536;
    End;
  p := get_node(4);
  mem[p+1].int := mult_and_add(n,mem[g+1].int,xn_over_d(mem[g+1].int,f,65536
                  ),1073741823);
  mem[p].hh.b0 := mem[g].hh.b0;
  If mem[p].hh.b0=0 Then mem[p+2].int := mult_and_add(n,mem[g+2].int,
                                         xn_over_d(mem[g+2].int,f,65536),1073741823)
  Else mem[p+2].int := mem[g+2].
                       int;
  mem[p].hh.b1 := mem[g].hh.b1;
  If mem[p].hh.b1=0 Then mem[p+3].int := mult_and_add(n,mem[g+3].int,
                                         xn_over_d(mem[g+3].int,f,65536),1073741823)
  Else mem[p+3].int := mem[g+3].
                       int;
  math_glue := p;
End;{:716}{717:}
Procedure math_kern(p:halfword;
                    m:scaled);

Var n: integer;
  f: scaled;
Begin
  If mem[p].hh.b1=99 Then
    Begin
      n := x_over_n(m,65536);
      f := remainder;
      If f<0 Then
        Begin
          n := n-1;
          f := f+65536;
        End;
      mem[p+1].int := mult_and_add(n,mem[p+1].int,xn_over_d(mem[p+1].int,f,65536
                      ),1073741823);
      mem[p].hh.b1 := 1;
    End;
End;{:717}{718:}
Procedure flush_math;
Begin
  flush_node_list(mem[cur_list.head_field].hh.rh);
  flush_node_list(cur_list.aux_field.int);
  mem[cur_list.head_field].hh.rh := 0;
  cur_list.tail_field := cur_list.head_field;
  cur_list.aux_field.int := 0;
End;
{:718}{720:}
Procedure mlist_to_hlist;
forward;
Function clean_box(p:halfword;s:small_number): halfword;

Label 40;

Var q: halfword;
  save_style: small_number;
  x: halfword;
  r: halfword;
Begin
  Case mem[p].hh.rh Of
    1:
       Begin
         cur_mlist := new_noad;
         mem[cur_mlist+1] := mem[p];
       End;
    2:
       Begin
         q := mem[p].hh.lh;
         goto 40;
       End;
    3: cur_mlist := mem[p].hh.lh;
    others:
            Begin
              q := new_null_box;
              goto 40;
            End
  End;
  save_style := cur_style;
  cur_style := s;
  mlist_penalties := false;
  mlist_to_hlist;
  q := mem[29997].hh.rh;
  cur_style := save_style;
{703:}
  Begin
    If cur_style<4 Then cur_size := 0
    Else cur_size := 16*((
                     cur_style-2)Div 2);
    cur_mu := x_over_n(font_info[6+param_base[eqtb[3942+cur_size].hh.rh]].int,
              18);
  End{:703};
  40: If (q>=hi_mem_min)Or(q=0)Then x := hpack(q,0,1)
      Else If (mem[q].hh.rh=0)
              And(mem[q].hh.b0<=1)And(mem[q+4].int=0)Then x := q
      Else x := hpack(q,0,1);
{721:}
  q := mem[x+5].hh.rh;
  If (q>=hi_mem_min)Then
    Begin
      r := mem[q].hh.rh;
      If r<>0 Then If mem[r].hh.rh=0 Then If Not(r>=hi_mem_min)Then If mem[r].
                                                                       hh.b0=11 Then
                                                                      Begin
                                                                        free_node(r,2);
                                                                        mem[q].hh.rh := 0;
                                                                      End;
    End{:721};
  clean_box := x;
End;{:720}{722:}
Procedure fetch(a:halfword);
Begin
  cur_c := mem[a].hh.b1;
  cur_f := eqtb[3940+mem[a].hh.b0+cur_size].hh.rh;
  If cur_f=0 Then{723:}
    Begin
      Begin
        If interaction=3 Then;
        print_nl(263);
        print(339);
      End;
      print_size(cur_size);
      print_char(32);
      print_int(mem[a].hh.b0);
      print(896);
      print(cur_c-0);
      print_char(41);
      Begin
        help_ptr := 4;
        help_line[3] := 897;
        help_line[2] := 898;
        help_line[1] := 899;
        help_line[0] := 900;
      End;
      error;
      cur_i := null_character;
      mem[a].hh.rh := 0;
    End{:723}
  Else
    Begin
      If (cur_c-0>=font_bc[cur_f])And(cur_c-0<=font_ec[
         cur_f])Then cur_i := font_info[char_base[cur_f]+cur_c].qqqq
      Else cur_i :=
                    null_character;
      If Not((cur_i.b0>0))Then
        Begin
          char_warning(cur_f,cur_c-0);
          mem[a].hh.rh := 0;
          cur_i := null_character;
        End;
    End;
End;
{:722}{726:}{734:}
Procedure make_over(q:halfword);
Begin
  mem[q+1].hh.lh := overbar(clean_box(q+1,2*(cur_style Div 2)+1),3*
                    font_info[8+param_base[eqtb[3943+cur_size].hh.rh]].int,font_info[8+
                    param_base[eqtb[3943+cur_size].hh.rh]].int);
  mem[q+1].hh.rh := 2;
End;
{:734}{735:}
Procedure make_under(q:halfword);

Var p,x,y: halfword;
  delta: scaled;
Begin
  x := clean_box(q+1,cur_style);
  p := new_kern(3*font_info[8+param_base[eqtb[3943+cur_size].hh.rh]].int);
  mem[x].hh.rh := p;
  mem[p].hh.rh := fraction_rule(font_info[8+param_base[eqtb[3943+cur_size].
                  hh.rh]].int);
  y := vpackage(x,0,1,1073741823);
  delta := mem[y+3].int+mem[y+2].int+font_info[8+param_base[eqtb[3943+
           cur_size].hh.rh]].int;
  mem[y+3].int := mem[x+3].int;
  mem[y+2].int := delta-mem[y+3].int;
  mem[q+1].hh.lh := y;
  mem[q+1].hh.rh := 2;
End;{:735}{736:}
Procedure make_vcenter(q:halfword);

Var v: halfword;
  delta: scaled;
Begin
  v := mem[q+1].hh.lh;
  If mem[v].hh.b0<>1 Then confusion(543);
  delta := mem[v+3].int+mem[v+2].int;
  mem[v+3].int := font_info[22+param_base[eqtb[3942+cur_size].hh.rh]].int+
                  half(delta);
  mem[v+2].int := delta-mem[v+3].int;
End;
{:736}{737:}
Procedure make_radical(q:halfword);

Var x,y: halfword;
  delta,clr: scaled;
Begin
  x := clean_box(q+1,2*(cur_style Div 2)+1);
  If cur_style<2 Then clr := font_info[8+param_base[eqtb[3943+cur_size].hh.
                             rh]].int+(abs(font_info[5+param_base[eqtb[3942+cur_size].hh.rh]].int)
                             Div
                             4)
  Else
    Begin
      clr := font_info[8+param_base[eqtb[3943+cur_size].hh.rh]].int
      ;
      clr := clr+(abs(clr)Div 4);
    End;
  y := var_delimiter(q+4,cur_size,mem[x+3].int+mem[x+2].int+clr+font_info[8+
       param_base[eqtb[3943+cur_size].hh.rh]].int);
  delta := mem[y+2].int-(mem[x+3].int+mem[x+2].int+clr);
  If delta>0 Then clr := clr+half(delta);
  mem[y+4].int := -(mem[x+3].int+clr);
  mem[y].hh.rh := overbar(x,clr,mem[y+3].int);
  mem[q+1].hh.lh := hpack(y,0,1);
  mem[q+1].hh.rh := 2;
End;
{:737}{738:}
Procedure make_math_accent(q:halfword);

Label 30,31;

Var p,x,y: halfword;
  a: integer;
  c: quarterword;
  f: internal_font_number;
  i: four_quarters;
  s: scaled;
  h: scaled;
  delta: scaled;
  w: scaled;
Begin
  fetch(q+4);
  If (cur_i.b0>0)Then
    Begin
      i := cur_i;
      c := cur_c;
      f := cur_f;
{741:}
      s := 0;
      If mem[q+1].hh.rh=1 Then
        Begin
          fetch(q+1);
          If ((cur_i.b2-0)Mod 4)=1 Then
            Begin
              a := lig_kern_base[cur_f]+cur_i.b3;
              cur_i := font_info[a].qqqq;
              If cur_i.b0>128 Then
                Begin
                  a := lig_kern_base[cur_f]+256*cur_i.b2+cur_i.b3
                       +32768-256*(128);
                  cur_i := font_info[a].qqqq;
                End;
              While true Do
                Begin
                  If cur_i.b1-0=skew_char[cur_f]Then
                    Begin
                      If cur_i.b2
                         >=128 Then If cur_i.b0<=128 Then s := font_info[kern_base[cur_f]+256*cur_i
                                                               .b2+cur_i.b3].int;
                      goto 31;
                    End;
                  If cur_i.b0>=128 Then goto 31;
                  a := a+cur_i.b0+1;
                  cur_i := font_info[a].qqqq;
                End;
            End;
        End;
      31:{:741};
      x := clean_box(q+1,2*(cur_style Div 2)+1);
      w := mem[x+1].int;
      h := mem[x+3].int;
{740:}
      While true Do
        Begin
          If ((i.b2-0)Mod 4)<>2 Then goto 30;
          y := i.b3;
          i := font_info[char_base[f]+y].qqqq;
          If Not(i.b0>0)Then goto 30;
          If font_info[width_base[f]+i.b0].int>w Then goto 30;
          c := y;
        End;
      30:{:740};
      If h<font_info[5+param_base[f]].int Then delta := h
      Else delta := font_info[
                    5+param_base[f]].int;
      If (mem[q+2].hh.rh<>0)Or(mem[q+3].hh.rh<>0)Then If mem[q+1].hh.rh=1 Then
{742:}
                                                        Begin
                                                          flush_node_list(x);
                                                          x := new_noad;
                                                          mem[x+1] := mem[q+1];
                                                          mem[x+2] := mem[q+2];
                                                          mem[x+3] := mem[q+3];
                                                          mem[q+2].hh := empty_field;
                                                          mem[q+3].hh := empty_field;
                                                          mem[q+1].hh.rh := 3;
                                                          mem[q+1].hh.lh := x;
                                                          x := clean_box(q+1,cur_style);
                                                          delta := delta+mem[x+3].int-h;
                                                          h := mem[x+3].int;
                                                        End{:742};
      y := char_box(f,c);
      mem[y+4].int := s+half(w-mem[y+1].int);
      mem[y+1].int := 0;
      p := new_kern(-delta);
      mem[p].hh.rh := x;
      mem[y].hh.rh := p;
      y := vpackage(y,0,1,1073741823);
      mem[y+1].int := mem[x+1].int;
      If mem[y+3].int<h Then{739:}
        Begin
          p := new_kern(h-mem[y+3].int);
          mem[p].hh.rh := mem[y+5].hh.rh;
          mem[y+5].hh.rh := p;
          mem[y+3].int := h;
        End{:739};
      mem[q+1].hh.lh := y;
      mem[q+1].hh.rh := 2;
    End;
End;
{:738}{743:}
Procedure make_fraction(q:halfword);

Var p,v,x,y,z: halfword;
  delta,delta1,delta2,shift_up,shift_down,clr: scaled;
Begin
  If mem[q+1].int=1073741824 Then mem[q+1].int := font_info[8+
                                                  param_base[eqtb[3943+cur_size].hh.rh]].int;
{744:}
  x := clean_box(q+2,cur_style+2-2*(cur_style Div 6));
  z := clean_box(q+3,2*(cur_style Div 2)+3-2*(cur_style Div 6));
  If mem[x+1].int<mem[z+1].int Then x := rebox(x,mem[z+1].int)
  Else z := rebox(
            z,mem[x+1].int);
  If cur_style<2 Then
    Begin
      shift_up := font_info[8+param_base[eqtb[3942+
                  cur_size].hh.rh]].int;
      shift_down := font_info[11+param_base[eqtb[3942+cur_size].hh.rh]].int;
    End
  Else
    Begin
      shift_down := font_info[12+param_base[eqtb[3942+cur_size].
                    hh.rh]].int;
      If mem[q+1].int<>0 Then shift_up := font_info[9+param_base[eqtb[3942+
                                          cur_size].hh.rh]].int
      Else shift_up := font_info[10+param_base[eqtb[3942+
                       cur_size].hh.rh]].int;
    End{:744};
  If mem[q+1].int=0 Then{745:}
    Begin
      If cur_style<2 Then clr := 7*font_info[
                                 8+param_base[eqtb[3943+cur_size].hh.rh]].int
      Else clr := 3*font_info[8+
                  param_base[eqtb[3943+cur_size].hh.rh]].int;
      delta := half(clr-((shift_up-mem[x+2].int)-(mem[z+3].int-shift_down)));
      If delta>0 Then
        Begin
          shift_up := shift_up+delta;
          shift_down := shift_down+delta;
        End;
    End{:745}
  Else{746:}
    Begin
      If cur_style<2 Then clr := 3*mem[q+1].int
      Else
        clr := mem[q+1].int;
      delta := half(mem[q+1].int);
      delta1 := clr-((shift_up-mem[x+2].int)-(font_info[22+param_base[eqtb[3942+
                cur_size].hh.rh]].int+delta));
      delta2 := clr-((font_info[22+param_base[eqtb[3942+cur_size].hh.rh]].int-
                delta)-(mem[z+3].int-shift_down));
      If delta1>0 Then shift_up := shift_up+delta1;
      If delta2>0 Then shift_down := shift_down+delta2;
    End{:746};
{747:}
  v := new_null_box;
  mem[v].hh.b0 := 1;
  mem[v+3].int := shift_up+mem[x+3].int;
  mem[v+2].int := mem[z+2].int+shift_down;
  mem[v+1].int := mem[x+1].int;
  If mem[q+1].int=0 Then
    Begin
      p := new_kern((shift_up-mem[x+2].int)-(mem[z
           +3].int-shift_down));
      mem[p].hh.rh := z;
    End
  Else
    Begin
      y := fraction_rule(mem[q+1].int);
      p := new_kern((font_info[22+param_base[eqtb[3942+cur_size].hh.rh]].int-
           delta)-(mem[z+3].int-shift_down));
      mem[y].hh.rh := p;
      mem[p].hh.rh := z;
      p := new_kern((shift_up-mem[x+2].int)-(font_info[22+param_base[eqtb[3942+
           cur_size].hh.rh]].int+delta));
      mem[p].hh.rh := y;
    End;
  mem[x].hh.rh := p;
  mem[v+5].hh.rh := x{:747};
{748:}
  If cur_style<2 Then delta := font_info[20+param_base[eqtb[3942+
                               cur_size].hh.rh]].int
  Else delta := font_info[21+param_base[eqtb[3942+
                cur_size].hh.rh]].int;
  x := var_delimiter(q+4,cur_size,delta);
  mem[x].hh.rh := v;
  z := var_delimiter(q+5,cur_size,delta);
  mem[v].hh.rh := z;
  mem[q+1].int := hpack(x,0,1){:748};
End;
{:743}{749:}
Function make_op(q:halfword): scaled;

Var delta: scaled;
  p,v,x,y,z: halfword;
  c: quarterword;
  i: four_quarters;
  shift_up,shift_down: scaled;
Begin
  If (mem[q].hh.b1=0)And(cur_style<2)Then mem[q].hh.b1 := 1;
  If mem[q+1].hh.rh=1 Then
    Begin
      fetch(q+1);
      If (cur_style<2)And(((cur_i.b2-0)Mod 4)=2)Then
        Begin
          c := cur_i.b3;
          i := font_info[char_base[cur_f]+c].qqqq;
          If (i.b0>0)Then
            Begin
              cur_c := c;
              cur_i := i;
              mem[q+1].hh.b1 := c;
            End;
        End;
      delta := font_info[italic_base[cur_f]+(cur_i.b2-0)Div 4].int;
      x := clean_box(q+1,cur_style);
      If (mem[q+3].hh.rh<>0)And(mem[q].hh.b1<>1)Then mem[x+1].int := mem[x+1].int
                                                                     -delta;
      mem[x+4].int := half(mem[x+3].int-mem[x+2].int)-font_info[22+param_base[
                      eqtb[3942+cur_size].hh.rh]].int;
      mem[q+1].hh.rh := 2;
      mem[q+1].hh.lh := x;
    End
  Else delta := 0;
  If mem[q].hh.b1=1 Then{750:}
    Begin
      x := clean_box(q+2,2*(cur_style Div 4)
           +4+(cur_style Mod 2));
      y := clean_box(q+1,cur_style);
      z := clean_box(q+3,2*(cur_style Div 4)+5);
      v := new_null_box;
      mem[v].hh.b0 := 1;
      mem[v+1].int := mem[y+1].int;
      If mem[x+1].int>mem[v+1].int Then mem[v+1].int := mem[x+1].int;
      If mem[z+1].int>mem[v+1].int Then mem[v+1].int := mem[z+1].int;
      x := rebox(x,mem[v+1].int);
      y := rebox(y,mem[v+1].int);
      z := rebox(z,mem[v+1].int);
      mem[x+4].int := half(delta);
      mem[z+4].int := -mem[x+4].int;
      mem[v+3].int := mem[y+3].int;
      mem[v+2].int := mem[y+2].int;
{751:}
      If mem[q+2].hh.rh=0 Then
        Begin
          free_node(x,7);
          mem[v+5].hh.rh := y;
        End
      Else
        Begin
          shift_up := font_info[11+param_base[eqtb[3943+cur_size].hh.
                      rh]].int-mem[x+2].int;
          If shift_up<font_info[9+param_base[eqtb[3943+cur_size].hh.rh]].int Then
            shift_up := font_info[9+param_base[eqtb[3943+cur_size].hh.rh]].int;
          p := new_kern(shift_up);
          mem[p].hh.rh := y;
          mem[x].hh.rh := p;
          p := new_kern(font_info[13+param_base[eqtb[3943+cur_size].hh.rh]].int);
          mem[p].hh.rh := x;
          mem[v+5].hh.rh := p;
          mem[v+3].int := mem[v+3].int+font_info[13+param_base[eqtb[3943+cur_size].
                          hh.rh]].int+mem[x+3].int+mem[x+2].int+shift_up;
        End;
      If mem[q+3].hh.rh=0 Then free_node(z,7)
      Else
        Begin
          shift_down := font_info[
                        12+param_base[eqtb[3943+cur_size].hh.rh]].int-mem[z+3].int;
          If shift_down<font_info[10+param_base[eqtb[3943+cur_size].hh.rh]].int
            Then shift_down := font_info[10+param_base[eqtb[3943+cur_size].hh.rh]].int
          ;
          p := new_kern(shift_down);
          mem[y].hh.rh := p;
          mem[p].hh.rh := z;
          p := new_kern(font_info[13+param_base[eqtb[3943+cur_size].hh.rh]].int);
          mem[z].hh.rh := p;
          mem[v+2].int := mem[v+2].int+font_info[13+param_base[eqtb[3943+cur_size].
                          hh.rh]].int+mem[z+3].int+mem[z+2].int+shift_down;
        End{:751};
      mem[q+1].int := v;
    End{:750};
  make_op := delta;
End;
{:749}{752:}
Procedure make_ord(q:halfword);

Label 20,10;

Var a: integer;
  p,r: halfword;
Begin
  20: If mem[q+3].hh.rh=0 Then If mem[q+2].hh.rh=0 Then If mem[q+1].
                                                           hh.rh=1 Then
                                                          Begin
                                                            p := mem[q].hh.rh;
                                                            If p<>0 Then If (mem[p].hh.b0>=16)And(
                                                                            mem[p].hh.b0<=22)Then If
                                                                                                 mem
                                                                                                   [
                                                                                                   p
                                                                                                   +
                                                                                                   1
                                                                                                   ]
                                                                                                   .

                                                                                                  hh
                                                                                                   .
                                                                                                  rh
                                                                                                   =
                                                                                                   1
                                                                                                Then
                                                                                                  If
                                                                                                 mem
                                                                                                   [
                                                                                                   p
                                                                                                   +
                                                                                                   1
                                                                                                   ]
                                                                                                   .
                                                                                                  hh
                                                                                                   .
                                                                                                  b0
                                                                                                   =
                                                                                                 mem
                                                                                                   [
                                                                                                   q
                                                                                                   +
                                                                                                   1
                                                                                                   ]
                                                                                                   .
                                                                                                  hh
                                                                                                   .
                                                                                                  b0
                                                                                                Then

                                                                                               Begin

                                                                                                 mem
                                                                                                   [
                                                                                                   q
                                                                                                   +
                                                                                                   1
                                                                                                   ]
                                                                                                   .
                                                                                                  hh
                                                                                                   .
                                                                                                  rh

                                                                                                  :=
                                                                                                   4
                                                                                                   ;

                                                                                               fetch
                                                                                                   (
                                                                                                   q
                                                                                                   +
                                                                                                   1
                                                                                                   )
                                                                                                   ;

                                                                                                  If
                                                                                                   (
                                                                                                   (
                                                                                               cur_i
                                                                                                   .
                                                                                                  b2
                                                                                                   -
                                                                                                   0
                                                                                                   )
                                                                                                 Mod
                                                                                                   4
                                                                                                   )
                                                                                                   =
                                                                                                   1
                                                                                                Then

                                                                                               Begin

                                                                                                   a
                                                                                                  :=
                                                                                       lig_kern_base
                                                                                                   [
                                                                                               cur_f
                                                                                                   ]
                                                                                                   +
                                                                                               cur_i
                                                                                                   .
                                                                                                  b3
                                                                                                   ;

                                                                                               cur_c
                                                                                                  :=
                                                                                                 mem
                                                                                                   [
                                                                                                   p
                                                                                                   +
                                                                                                   1
                                                                                                   ]
                                                                                                   .
                                                                                                  hh
                                                                                                   .
                                                                                                  b1
                                                                                                   ;

                                                                                               cur_i
                                                                                                  :=
                                                                                           font_info
                                                                                                   [
                                                                                                   a
                                                                                                   ]
                                                                                                   .
                                                                                                qqqq
                                                                                                   ;

                                                                                                  If
                                                                                               cur_i
                                                                                                   .
                                                                                                  b0
                                                                                                   >
                                                                                                 128
                                                                                                Then

                                                                                               Begin

                                                                                                   a
                                                                                                  :=
                                                                                       lig_kern_base
                                                                                                   [
                                                                                               cur_f
                                                                                                   ]
                                                                                                   +
                                                                                                 256
                                                                                                   *
                                                                                               cur_i
                                                                                                   .
                                                                                                  b2
                                                                                                   +
                                                                                               cur_i
                                                                                                   .
                                                                                                  b3

                                                                                                   +
                                                                                               32768
                                                                                                   -
                                                                                                 256
                                                                                                   *
                                                                                                   (
                                                                                                 128
                                                                                                   )
                                                                                                   ;

                                                                                               cur_i
                                                                                                  :=
                                                                                           font_info
                                                                                                   [
                                                                                                   a
                                                                                                   ]
                                                                                                   .
                                                                                                qqqq
                                                                                                   ;

                                                                                                 End
                                                                                                   ;

                                                                                               While
                                                                                                true
                                                                                                  Do

                                                                                               Begin
                                                                                              {753:}

                                                                                                  If
                                                                                               cur_i
                                                                                                   .
                                                                                                  b1
                                                                                                   =
                                                                                               cur_c
                                                                                                Then
                                                                                                  If
                                                                                               cur_i
                                                                                                   .
                                                                                                  b0
                                                                                                  <=
                                                                                                 128
                                                                                                Then
                                                                                                  If

                                                                                               cur_i
                                                                                                   .
                                                                                                  b2
                                                                                                  >=
                                                                                                 128
                                                                                                Then

                                                                                               Begin

                                                                                                   p
                                                                                                  :=
                                                                                            new_kern
                                                                                                   (
                                                                                           font_info
                                                                                                   [
                                                                                           kern_base
                                                                                                   [
                                                                                               cur_f
                                                                                                   ]
                                                                                                   +
                                                                                                 256
                                                                                                   *

                                                                                               cur_i
                                                                                                   .
                                                                                                  b2
                                                                                                   +
                                                                                               cur_i
                                                                                                   .
                                                                                                  b3
                                                                                                   ]
                                                                                                   .
                                                                                                 int
                                                                                                   )
                                                                                                   ;

                                                                                                 mem
                                                                                                   [
                                                                                                   p
                                                                                                   ]
                                                                                                   .
                                                                                                  hh
                                                                                                   .
                                                                                                  rh
                                                                                                  :=
                                                                                                 mem
                                                                                                   [
                                                                                                   q
                                                                                                   ]
                                                                                                   .
                                                                                                  hh
                                                                                                   .
                                                                                                  rh
                                                                                                   ;

                                                                                                 mem
                                                                                                   [
                                                                                                   q
                                                                                                   ]
                                                                                                   .
                                                                                                  hh
                                                                                                   .
                                                                                                  rh
                                                                                                  :=
                                                                                                   p
                                                                                                   ;

                                                                                                goto
                                                                                                  10
                                                                                                   ;

                                                                                                 End

                                                                                                Else

                                                                                               Begin

                                                                                               Begin

                                                                                                  If
                                                                                           interrupt
                                                                                                  <>
                                                                                                   0
                                                                                                Then
                                                                              pause_for_instructions
                                                                                                   ;

                                                                                                 End
                                                                                                   ;

                                                                                                Case
                                                                                               cur_i
                                                                                                   .
                                                                                                  b2
                                                                                                  Of

                                                                                                   1
                                                                                                   ,
                                                                                                   5
                                                                                                   :
                                                                                                 mem
                                                                                                   [
                                                                                                   q
                                                                                                   +
                                                                                                   1
                                                                                                   ]
                                                                                                   .
                                                                                                  hh
                                                                                                   .
                                                                                                  b1
                                                                                                  :=
                                                                                               cur_i
                                                                                                   .
                                                                                                  b3
                                                                                                   ;

                                                                                                   2
                                                                                                   ,
                                                                                                   6
                                                                                                   :
                                                                                                 mem
                                                                                                   [
                                                                                                   p
                                                                                                   +
                                                                                                   1
                                                                                                   ]
                                                                                                   .
                                                                                                  hh
                                                                                                   .
                                                                                                  b1
                                                                                                  :=
                                                                                               cur_i
                                                                                                   .
                                                                                                  b3
                                                                                                   ;

                                                                                                   3
                                                                                                   ,
                                                                                                   7
                                                                                                   ,
                                                                                                  11
                                                                                                   :

                                                                                               Begin

                                                                                                   r
                                                                                                  :=
                                                                                            new_noad
                                                                                                   ;

                                                                                                 mem
                                                                                                   [
                                                                                                   r
                                                                                                   +
                                                                                                   1
                                                                                                   ]
                                                                                                   .
                                                                                                  hh
                                                                                                   .
                                                                                                  b1
                                                                                                  :=
                                                                                               cur_i
                                                                                                   .
                                                                                                  b3
                                                                                                   ;

                                                                                                 mem
                                                                                                   [
                                                                                                   r
                                                                                                   +
                                                                                                   1
                                                                                                   ]
                                                                                                   .
                                                                                                  hh
                                                                                                   .
                                                                                                  b0
                                                                                                  :=
                                                                                                 mem
                                                                                                   [
                                                                                                   q
                                                                                                   +
                                                                                                   1
                                                                                                   ]
                                                                                                   .
                                                                                                  hh
                                                                                                   .
                                                                                                  b0
                                                                                                   ;

                                                                                                 mem
                                                                                                   [
                                                                                                   q
                                                                                                   ]
                                                                                                   .
                                                                                                  hh
                                                                                                   .
                                                                                                  rh
                                                                                                  :=
                                                                                                   r
                                                                                                   ;

                                                                                                 mem
                                                                                                   [
                                                                                                   r
                                                                                                   ]
                                                                                                   .
                                                                                                  hh
                                                                                                   .
                                                                                                  rh
                                                                                                  :=
                                                                                                   p
                                                                                                   ;

                                                                                                  If
                                                                                               cur_i
                                                                                                   .
                                                                                                  b2
                                                                                                   <
                                                                                                  11
                                                                                                Then
                                                                                                 mem
                                                                                                   [
                                                                                                   r
                                                                                                   +
                                                                                                   1
                                                                                                   ]
                                                                                                   .
                                                                                                  hh
                                                                                                   .
                                                                                                  rh
                                                                                                  :=
                                                                                                   1

                                                                                                Else
                                                                                                 mem
                                                                                                   [
                                                                                                   r
                                                                                                   +
                                                                                                   1
                                                                                                   ]
                                                                                                   .
                                                                                                  hh
                                                                                                   .
                                                                                                  rh
                                                                                                  :=
                                                                                                   4
                                                                                                   ;

                                                                                                 End
                                                                                                   ;

                                                                                              others
                                                                                                   :

                                                                                               Begin

                                                                                                 mem
                                                                                                   [
                                                                                                   q
                                                                                                   ]
                                                                                                   .
                                                                                                  hh
                                                                                                   .
                                                                                                  rh
                                                                                                  :=
                                                                                                 mem
                                                                                                   [
                                                                                                   p
                                                                                                   ]
                                                                                                   .
                                                                                                  hh
                                                                                                   .
                                                                                                  rh
                                                                                                   ;

                                                                                                 mem
                                                                                                   [
                                                                                                   q
                                                                                                   +
                                                                                                   1
                                                                                                   ]
                                                                                                   .
                                                                                                  hh
                                                                                                   .
                                                                                                  b1
                                                                                                  :=
                                                                                               cur_i
                                                                                                   .
                                                                                                  b3
                                                                                                   ;

                                                                                                 mem
                                                                                                   [
                                                                                                   q
                                                                                                   +
                                                                                                   3
                                                                                                   ]
                                                                                                  :=
                                                                                                 mem
                                                                                                   [
                                                                                                   p
                                                                                                   +
                                                                                                   3
                                                                                                   ]
                                                                                                   ;

                                                                                                 mem
                                                                                                   [
                                                                                                   q
                                                                                                   +
                                                                                                   2
                                                                                                   ]
                                                                                                  :=
                                                                                                 mem
                                                                                                   [
                                                                                                   p
                                                                                                   +
                                                                                                   2
                                                                                                   ]
                                                                                                   ;

                                                                                           free_node
                                                                                                   (
                                                                                                   p
                                                                                                   ,
                                                                                                   4
                                                                                                   )
                                                                                                   ;

                                                                                                 End

                                                                                                 End
                                                                                                   ;

                                                                                                  If
                                                                                               cur_i
                                                                                                   .
                                                                                                  b2
                                                                                                   >
                                                                                                   3
                                                                                                Then
                                                                                                goto
                                                                                                  10
                                                                                                   ;

                                                                                                 mem
                                                                                                   [
                                                                                                   q
                                                                                                   +
                                                                                                   1
                                                                                                   ]
                                                                                                   .
                                                                                                  hh
                                                                                                   .
                                                                                                  rh
                                                                                                  :=
                                                                                                   1
                                                                                                   ;

                                                                                                goto
                                                                                                  20
                                                                                                   ;

                                                                                                 End
                                                                                              {:753}
                                                                                                   ;

                                                                                                  If
                                                                                               cur_i
                                                                                                   .
                                                                                                  b0
                                                                                                  >=
                                                                                                 128
                                                                                                Then
                                                                                                goto
                                                                                                  10
                                                                                                   ;

                                                                                                   a
                                                                                                  :=
                                                                                                   a
                                                                                                   +
                                                                                               cur_i
                                                                                                   .
                                                                                                  b0
                                                                                                   +
                                                                                                   1
                                                                                                   ;

                                                                                               cur_i
                                                                                                  :=
                                                                                           font_info
                                                                                                   [
                                                                                                   a
                                                                                                   ]
                                                                                                   .
                                                                                                qqqq
                                                                                                   ;

                                                                                                 End
                                                                                                   ;

                                                                                                 End
                                                                                                   ;

                                                                                                 End
                                                            ;
                                                          End;
  10:
End;{:752}{756:}
Procedure make_scripts(q:halfword;
                       delta:scaled);

Var p,x,y,z: halfword;
  shift_up,shift_down,clr: scaled;
  t: small_number;
Begin
  p := mem[q+1].int;
  If (p>=hi_mem_min)Then
    Begin
      shift_up := 0;
      shift_down := 0;
    End
  Else
    Begin
      z := hpack(p,0,1);
      If cur_style<4 Then t := 16
      Else t := 32;
      shift_up := mem[z+3].int-font_info[18+param_base[eqtb[3942+t].hh.rh]].int;
      shift_down := mem[z+2].int+font_info[19+param_base[eqtb[3942+t].hh.rh]].
                    int;
      free_node(z,7);
    End;
  If mem[q+2].hh.rh=0 Then{757:}
    Begin
      x := clean_box(q+3,2*(cur_style Div 4)
           +5);
      mem[x+1].int := mem[x+1].int+eqtb[5857].int;
      If shift_down<font_info[16+param_base[eqtb[3942+cur_size].hh.rh]].int
        Then shift_down := font_info[16+param_base[eqtb[3942+cur_size].hh.rh]].int
      ;
      clr := mem[x+3].int-(abs(font_info[5+param_base[eqtb[3942+cur_size].hh.rh]
             ].int*4)Div 5);
      If shift_down<clr Then shift_down := clr;
      mem[x+4].int := shift_down;
    End{:757}
  Else
    Begin{758:}
      Begin
        x := clean_box(q+2,2*(cur_style Div 4)+4+(
             cur_style Mod 2));
        mem[x+1].int := mem[x+1].int+eqtb[5857].int;
        If odd(cur_style)Then clr := font_info[15+param_base[eqtb[3942+cur_size].
                                     hh.rh]].int
        Else If cur_style<2 Then clr := font_info[13+param_base[eqtb[
                                        3942+cur_size].hh.rh]].int
        Else clr := font_info[14+param_base[eqtb[3942+
                    cur_size].hh.rh]].int;
        If shift_up<clr Then shift_up := clr;
        clr := mem[x+2].int+(abs(font_info[5+param_base[eqtb[3942+cur_size].hh.rh]
               ].int)Div 4);
        If shift_up<clr Then shift_up := clr;
      End{:758};
      If mem[q+3].hh.rh=0 Then mem[x+4].int := -shift_up
      Else{759:}
        Begin
          y :=
               clean_box(q+3,2*(cur_style Div 4)+5);
          mem[y+1].int := mem[y+1].int+eqtb[5857].int;
          If shift_down<font_info[17+param_base[eqtb[3942+cur_size].hh.rh]].int
            Then shift_down := font_info[17+param_base[eqtb[3942+cur_size].hh.rh]].int
          ;
          clr := 4*font_info[8+param_base[eqtb[3943+cur_size].hh.rh]].int-((shift_up
                 -mem[x+2].int)-(mem[y+3].int-shift_down));
          If clr>0 Then
            Begin
              shift_down := shift_down+clr;
              clr := (abs(font_info[5+param_base[eqtb[3942+cur_size].hh.rh]].int*4)Div 5
                     )-(shift_up-mem[x+2].int);
              If clr>0 Then
                Begin
                  shift_up := shift_up+clr;
                  shift_down := shift_down-clr;
                End;
            End;
          mem[x+4].int := delta;
          p := new_kern((shift_up-mem[x+2].int)-(mem[y+3].int-shift_down));
          mem[x].hh.rh := p;
          mem[p].hh.rh := y;
          x := vpackage(x,0,1,1073741823);
          mem[x+4].int := shift_down;
        End{:759};
    End;
  If mem[q+1].int=0 Then mem[q+1].int := x
  Else
    Begin
      p := mem[q+1].int;
      While mem[p].hh.rh<>0 Do
        p := mem[p].hh.rh;
      mem[p].hh.rh := x;
    End;
End;
{:756}{762:}
Function make_left_right(q:halfword;style:small_number;
                         max_d,max_h:scaled): small_number;

Var delta,delta1,delta2: scaled;
Begin
  cur_style := style;
{703:}
  Begin
    If cur_style<4 Then cur_size := 0
    Else cur_size := 16*((
                     cur_style-2)Div 2);
    cur_mu := x_over_n(font_info[6+param_base[eqtb[3942+cur_size].hh.rh]].int,
              18);
  End{:703};
  delta2 := max_d+font_info[22+param_base[eqtb[3942+cur_size].hh.rh]].int;
  delta1 := max_h+max_d-delta2;
  If delta2>delta1 Then delta1 := delta2;
  delta := (delta1 Div 500)*eqtb[5286].int;
  delta2 := delta1+delta1-eqtb[5855].int;
  If delta<delta2 Then delta := delta2;
  mem[q+1].int := var_delimiter(q+1,cur_size,delta);
  make_left_right := mem[q].hh.b0-(10);
End;{:762}
Procedure mlist_to_hlist;

Label 21,82,80,81,83,30;

Var mlist: halfword;
  penalties: boolean;
  style: small_number;
  save_style: small_number;
  q: halfword;
  r: halfword;
  r_type: small_number;
  t: small_number;
  p,x,y,z: halfword;
  pen: integer;
  s: small_number;
  max_h,max_d: scaled;
  delta: scaled;
Begin
  mlist := cur_mlist;
  penalties := mlist_penalties;
  style := cur_style;
  q := mlist;
  r := 0;
  r_type := 17;
  max_h := 0;
  max_d := 0;
{703:}
  Begin
    If cur_style<4 Then cur_size := 0
    Else cur_size := 16*((
                     cur_style-2)Div 2);
    cur_mu := x_over_n(font_info[6+param_base[eqtb[3942+cur_size].hh.rh]].int,
              18);
  End{:703};
  While q<>0 Do{727:}
    Begin{728:}
      21: delta := 0;
      Case mem[q].hh.b0 Of
        18: Case r_type Of
              18,17,19,20,22,30:
                                 Begin
                                   mem[q].hh
                                   .b0 := 16;
                                   goto 21;
                                 End;
              others:
            End;
        19,21,22,31:
                     Begin{729:}
                       If r_type=18 Then mem[r].hh.b0 := 16{:729};
                       If mem[q].hh.b0=31 Then goto 80;
                     End;{733:}
        30: goto 80;
        25:
            Begin
              make_fraction(q);
              goto 82;
            End;
        17:
            Begin
              delta := make_op(q);
              If mem[q].hh.b1=1 Then goto 82;
            End;
        16: make_ord(q);
        20,23:;
        24: make_radical(q);
        27: make_over(q);
        26: make_under(q);
        28: make_math_accent(q);
        29: make_vcenter(q);
{:733}{730:}
        14:
            Begin
              cur_style := mem[q].hh.b1;
{703:}
              Begin
                If cur_style<4 Then cur_size := 0
                Else cur_size := 16*((
                                 cur_style-2)Div 2);
                cur_mu := x_over_n(font_info[6+param_base[eqtb[3942+cur_size].hh.rh]].int,
                          18);
              End{:703};
              goto 81;
            End;
        15:{731:}
            Begin
              Case cur_style Div 2 Of
                0:
                   Begin
                     p := mem[q+1].hh.lh;
                     mem[q+1].hh.lh := 0;
                   End;
                1:
                   Begin
                     p := mem[q+1].hh.rh;
                     mem[q+1].hh.rh := 0;
                   End;
                2:
                   Begin
                     p := mem[q+2].hh.lh;
                     mem[q+2].hh.lh := 0;
                   End;
                3:
                   Begin
                     p := mem[q+2].hh.rh;
                     mem[q+2].hh.rh := 0;
                   End;
              End;
              flush_node_list(mem[q+1].hh.lh);
              flush_node_list(mem[q+1].hh.rh);
              flush_node_list(mem[q+2].hh.lh);
              flush_node_list(mem[q+2].hh.rh);
              mem[q].hh.b0 := 14;
              mem[q].hh.b1 := cur_style;
              mem[q+1].int := 0;
              mem[q+2].int := 0;
              If p<>0 Then
                Begin
                  z := mem[q].hh.rh;
                  mem[q].hh.rh := p;
                  While mem[p].hh.rh<>0 Do
                    p := mem[p].hh.rh;
                  mem[p].hh.rh := z;
                End;
              goto 81;
            End{:731};
        3,4,5,8,12,7: goto 81;
        2:
           Begin
             If mem[q+3].int>max_h Then max_h := mem[q+3].int;
             If mem[q+2].int>max_d Then max_d := mem[q+2].int;
             goto 81;
           End;
        10:
            Begin{732:}
              If mem[q].hh.b1=99 Then
                Begin
                  x := mem[q+1].hh.lh;
                  y := math_glue(x,cur_mu);
                  delete_glue_ref(x);
                  mem[q+1].hh.lh := y;
                  mem[q].hh.b1 := 0;
                End
              Else If (cur_size<>0)And(mem[q].hh.b1=98)Then
                     Begin
                       p := mem[q].hh.rh;
                       If p<>0 Then If (mem[p].hh.b0=10)Or(mem[p].hh.b0=11)Then
                                      Begin
                                        mem[q].hh.
                                        rh := mem[p].hh.rh;
                                        mem[p].hh.rh := 0;
                                        flush_node_list(p);
                                      End;
                     End{:732};
              goto 81;
            End;
        11:
            Begin
              math_kern(q,cur_mu);
              goto 81;
            End;
{:730}
        others: confusion(901)
      End;
{754:}
      Case mem[q+1].hh.rh Of
        1,4:{755:}
             Begin
               fetch(q+1);
               If (cur_i.b0>0)Then
                 Begin
                   delta := font_info[italic_base[cur_f]+(cur_i.b2-0
                            )Div 4].int;
                   p := new_character(cur_f,cur_c-0);
                   If (mem[q+1].hh.rh=4)And(font_info[2+param_base[cur_f]].int<>0)Then delta
                     := 0;
                   If (mem[q+3].hh.rh=0)And(delta<>0)Then
                     Begin
                       mem[p].hh.rh := new_kern(delta
                                       );
                       delta := 0;
                     End;
                 End
               Else p := 0;
             End{:755};
        0: p := 0;
        2: p := mem[q+1].hh.lh;
        3:
           Begin
             cur_mlist := mem[q+1].hh.lh;
             save_style := cur_style;
             mlist_penalties := false;
             mlist_to_hlist;
             cur_style := save_style;
{703:}
             Begin
               If cur_style<4 Then cur_size := 0
               Else cur_size := 16*((
                                cur_style-2)Div 2);
               cur_mu := x_over_n(font_info[6+param_base[eqtb[3942+cur_size].hh.rh]].int,
                         18);
             End{:703};
             p := hpack(mem[29997].hh.rh,0,1);
           End;
        others: confusion(902)
      End;
      mem[q+1].int := p;
      If (mem[q+3].hh.rh=0)And(mem[q+2].hh.rh=0)Then goto 82;
      make_scripts(q,delta){:754}{:728};
      82: z := hpack(mem[q+1].int,0,1);
      If mem[z+3].int>max_h Then max_h := mem[z+3].int;
      If mem[z+2].int>max_d Then max_d := mem[z+2].int;
      free_node(z,7);
      80: r := q;
      r_type := mem[r].hh.b0;
      If r_type=31 Then
        Begin
          r_type := 30;
          cur_style := style;
{703:}
          Begin
            If cur_style<4 Then cur_size := 0
            Else cur_size := 16*((
                             cur_style-2)Div 2);
            cur_mu := x_over_n(font_info[6+param_base[eqtb[3942+cur_size].hh.rh]].int,
                      18);
          End{:703};
        End;
      81: q := mem[q].hh.rh;
    End{:727};
{729:}
  If r_type=18 Then mem[r].hh.b0 := 16{:729};{760:}
  p := 29997;
  mem[p].hh.rh := 0;
  q := mlist;
  r_type := 0;
  cur_style := style;
{703:}
  Begin
    If cur_style<4 Then cur_size := 0
    Else cur_size := 16*((
                     cur_style-2)Div 2);
    cur_mu := x_over_n(font_info[6+param_base[eqtb[3942+cur_size].hh.rh]].int,
              18);
  End{:703};
  While q<>0 Do
    Begin{761:}
      t := 16;
      s := 4;
      pen := 10000;
      Case mem[q].hh.b0 Of
        17,20,21,22,23: t := mem[q].hh.b0;
        18:
            Begin
              t := 18;
              pen := eqtb[5277].int;
            End;
        19:
            Begin
              t := 19;
              pen := eqtb[5278].int;
            End;
        16,29,27,26:;
        24: s := 5;
        28: s := 5;
        25: s := 6;
        30,31: t := make_left_right(q,style,max_d,max_h);
        14:{763:}
            Begin
              cur_style := mem[q].hh.b1;
              s := 3;
{703:}
              Begin
                If cur_style<4 Then cur_size := 0
                Else cur_size := 16*((
                                 cur_style-2)Div 2);
                cur_mu := x_over_n(font_info[6+param_base[eqtb[3942+cur_size].hh.rh]].int,
                          18);
              End{:703};
              goto 83;
            End{:763};
        8,12,2,7,5,3,4,10,11:
                              Begin
                                mem[p].hh.rh := q;
                                p := q;
                                q := mem[q].hh.rh;
                                mem[p].hh.rh := 0;
                                goto 30;
                              End;
        others: confusion(903)
      End{:761};
{766:}
      If r_type>0 Then
        Begin
          Case str_pool[r_type*8+t+magic_offset] Of
            48
            : x := 0;
            49: If cur_style<4 Then x := 15
                Else x := 0;
            50: x := 15;
            51: If cur_style<4 Then x := 16
                Else x := 0;
            52: If cur_style<4 Then x := 17
                Else x := 0;
            others: confusion(905)
          End;
          If x<>0 Then
            Begin
              y := math_glue(eqtb[2882+x].hh.rh,cur_mu);
              z := new_glue(y);
              mem[y].hh.rh := 0;
              mem[p].hh.rh := z;
              p := z;
              mem[z].hh.b1 := x+1;
            End;
        End{:766};
{767:}
      If mem[q+1].int<>0 Then
        Begin
          mem[p].hh.rh := mem[q+1].int;
          Repeat
            p := mem[p].hh.rh;
          Until mem[p].hh.rh=0;
        End;
      If penalties Then If mem[q].hh.rh<>0 Then If pen<10000 Then
                                                  Begin
                                                    r_type
                                                    := mem[mem[q].hh.rh].hh.b0;
                                                    If r_type<>12 Then If r_type<>19 Then
                                                                         Begin
                                                                           z := new_penalty(pen);
                                                                           mem[p].hh.rh := z;
                                                                           p := z;
                                                                         End;
                                                  End{:767};
      If mem[q].hh.b0=31 Then t := 20;
      r_type := t;
      83: r := q;
      q := mem[q].hh.rh;
      free_node(r,s);
      30:
    End{:760};
End;
{:726}{772:}
Procedure push_alignment;

Var p: halfword;
Begin
  p := get_node(5);
  mem[p].hh.rh := align_ptr;
  mem[p].hh.lh := cur_align;
  mem[p+1].hh.lh := mem[29992].hh.rh;
  mem[p+1].hh.rh := cur_span;
  mem[p+2].int := cur_loop;
  mem[p+3].int := align_state;
  mem[p+4].hh.lh := cur_head;
  mem[p+4].hh.rh := cur_tail;
  align_ptr := p;
  cur_head := get_avail;
End;
Procedure pop_alignment;

Var p: halfword;
Begin
  Begin
    mem[cur_head].hh.rh := avail;
    avail := cur_head;
{dyn_used:=dyn_used-1;}
  End;
  p := align_ptr;
  cur_tail := mem[p+4].hh.rh;
  cur_head := mem[p+4].hh.lh;
  align_state := mem[p+3].int;
  cur_loop := mem[p+2].int;
  cur_span := mem[p+1].hh.rh;
  mem[29992].hh.rh := mem[p+1].hh.lh;
  cur_align := mem[p].hh.lh;
  align_ptr := mem[p].hh.rh;
  free_node(p,5);
End;
{:772}{774:}{782:}
Procedure get_preamble_token;

Label 20;
Begin
  20: get_token;
  While (cur_chr=256)And(cur_cmd=4) Do
    Begin
      get_token;
      If cur_cmd>100 Then
        Begin
          expand;
          get_token;
        End;
    End;
  If cur_cmd=9 Then fatal_error(604);
  If (cur_cmd=75)And(cur_chr=2893)Then
    Begin
      scan_optional_equals;
      scan_glue(2);
      If eqtb[5311].int>0 Then geq_define(2893,117,cur_val)
      Else eq_define(2893
                     ,117,cur_val);
      goto 20;
    End;
End;{:782}
Procedure align_peek;
forward;
Procedure normal_paragraph;
forward;
Procedure init_align;

Label 30,31,32,22;

Var save_cs_ptr: halfword;
  p: halfword;
Begin
  save_cs_ptr := cur_cs;
  push_alignment;
  align_state := -1000000;
{776:}
  If (cur_list.mode_field=203)And((cur_list.tail_field<>cur_list.
     head_field)Or(cur_list.aux_field.int<>0))Then
    Begin
      Begin
        If interaction
           =3 Then;
        print_nl(263);
        print(689);
      End;
      print_esc(523);
      print(906);
      Begin
        help_ptr := 3;
        help_line[2] := 907;
        help_line[1] := 908;
        help_line[0] := 909;
      End;
      error;
      flush_math;
    End{:776};
  push_nest;
{775:}
  If cur_list.mode_field=203 Then
    Begin
      cur_list.mode_field := -1;
      cur_list.aux_field.int := nest[nest_ptr-2].aux_field.int;
    End
  Else If cur_list.mode_field>0 Then cur_list.mode_field := -cur_list.
                                                            mode_field{:775};
  scan_spec(6,false);{777:}
  mem[29992].hh.rh := 0;
  cur_align := 29992;
  cur_loop := 0;
  scanner_status := 4;
  warning_index := save_cs_ptr;
  align_state := -1000000;
  While true Do
    Begin{778:}
      mem[cur_align].hh.rh := new_param_glue(11);
      cur_align := mem[cur_align].hh.rh{:778};
      If cur_cmd=5 Then goto 30;
{779:}{783:}
      p := 29996;
      mem[p].hh.rh := 0;
      While true Do
        Begin
          get_preamble_token;
          If cur_cmd=6 Then goto 31;
          If (cur_cmd<=5)And(cur_cmd>=4)And(align_state=-1000000)Then If (p=29996)
                                                                         And(cur_loop=0)And(cur_cmd=
                                                                         4)Then cur_loop :=
                                                                                           cur_align
          Else
            Begin
              Begin
                If interaction=3 Then;
                print_nl(263);
                print(915);
              End;
              Begin
                help_ptr := 3;
                help_line[2] := 916;
                help_line[1] := 917;
                help_line[0] := 918;
              End;
              back_error;
              goto 31;
            End
          Else If (cur_cmd<>10)Or(p<>29996)Then
                 Begin
                   mem[p].hh.rh := get_avail;
                   p := mem[p].hh.rh;
                   mem[p].hh.lh := cur_tok;
                 End;
        End;
      31:{:783};
      mem[cur_align].hh.rh := new_null_box;
      cur_align := mem[cur_align].hh.rh;
      mem[cur_align].hh.lh := 29991;
      mem[cur_align+1].int := -1073741824;
      mem[cur_align+3].int := mem[29996].hh.rh;{784:}
      p := 29996;
      mem[p].hh.rh := 0;
      While true Do
        Begin
          22: get_preamble_token;
          If (cur_cmd<=5)And(cur_cmd>=4)And(align_state=-1000000)Then goto 32;
          If cur_cmd=6 Then
            Begin
              Begin
                If interaction=3 Then;
                print_nl(263);
                print(919);
              End;
              Begin
                help_ptr := 3;
                help_line[2] := 916;
                help_line[1] := 917;
                help_line[0] := 920;
              End;
              error;
              goto 22;
            End;
          mem[p].hh.rh := get_avail;
          p := mem[p].hh.rh;
          mem[p].hh.lh := cur_tok;
        End;
      32: mem[p].hh.rh := get_avail;
      p := mem[p].hh.rh;
      mem[p].hh.lh := 6714{:784};
      mem[cur_align+2].int := mem[29996].hh.rh{:779};
    End;
  30: scanner_status := 0{:777};
  new_save_level(6);
  If eqtb[3420].hh.rh<>0 Then begin_token_list(eqtb[3420].hh.rh,13);
  align_peek;
End;{:774}{786:}{787:}
Procedure init_span(p:halfword);
Begin
  push_nest;
  If cur_list.mode_field=-102 Then cur_list.aux_field.hh.lh := 1000
  Else
    Begin
      cur_list.aux_field.int := -65536000;
      normal_paragraph;
    End;
  cur_span := p;
End;{:787}
Procedure init_row;
Begin
  push_nest;
  cur_list.mode_field := (-103)-cur_list.mode_field;
  If cur_list.mode_field=-102 Then cur_list.aux_field.hh.lh := 0
  Else
    cur_list.aux_field.int := 0;
  Begin
    mem[cur_list.tail_field].hh.rh := new_glue(mem[mem[29992].hh.rh+1].
                                      hh.lh);
    cur_list.tail_field := mem[cur_list.tail_field].hh.rh;
  End;
  mem[cur_list.tail_field].hh.b1 := 12;
  cur_align := mem[mem[29992].hh.rh].hh.rh;
  cur_tail := cur_head;
  init_span(cur_align);
End;{:786}{788:}
Procedure init_col;
Begin
  mem[cur_align+5].hh.lh := cur_cmd;
  If cur_cmd=63 Then align_state := 0
  Else
    Begin
      back_input;
      begin_token_list(mem[cur_align+3].int,1);
    End;
End;
{:788}{791:}
Function fin_col: boolean;

Label 10;

Var p: halfword;
  q,r: halfword;
  s: halfword;
  u: halfword;
  w: scaled;
  o: glue_ord;
  n: halfword;
Begin
  If cur_align=0 Then confusion(921);
  q := mem[cur_align].hh.rh;
  If q=0 Then confusion(921);
  If align_state<500000 Then fatal_error(604);
  p := mem[q].hh.rh;
{792:}
  If (p=0)And(mem[cur_align+5].hh.lh<257)Then If cur_loop<>0 Then
{793:}
                                                Begin
                                                  mem[q].hh.rh := new_null_box;
                                                  p := mem[q].hh.rh;
                                                  mem[p].hh.lh := 29991;
                                                  mem[p+1].int := -1073741824;
                                                  cur_loop := mem[cur_loop].hh.rh;{794:}
                                                  q := 29996;
                                                  r := mem[cur_loop+3].int;
                                                  While r<>0 Do
                                                    Begin
                                                      mem[q].hh.rh := get_avail;
                                                      q := mem[q].hh.rh;
                                                      mem[q].hh.lh := mem[r].hh.lh;
                                                      r := mem[r].hh.rh;
                                                    End;
                                                  mem[q].hh.rh := 0;
                                                  mem[p+3].int := mem[29996].hh.rh;
                                                  q := 29996;
                                                  r := mem[cur_loop+2].int;
                                                  While r<>0 Do
                                                    Begin
                                                      mem[q].hh.rh := get_avail;
                                                      q := mem[q].hh.rh;
                                                      mem[q].hh.lh := mem[r].hh.lh;
                                                      r := mem[r].hh.rh;
                                                    End;
                                                  mem[q].hh.rh := 0;
                                                  mem[p+2].int := mem[29996].hh.rh{:794};
                                                  cur_loop := mem[cur_loop].hh.rh;
                                                  mem[p].hh.rh := new_glue(mem[cur_loop+1].hh.lh);
                                                  mem[mem[p].hh.rh].hh.b1 := 12;
                                                End{:793}
  Else
    Begin
      Begin
        If interaction=3 Then;
        print_nl(263);
        print(922);
      End;
      print_esc(911);
      Begin
        help_ptr := 3;
        help_line[2] := 923;
        help_line[1] := 924;
        help_line[0] := 925;
      End;
      mem[cur_align+5].hh.lh := 257;
      error;
    End{:792};
  If mem[cur_align+5].hh.lh<>256 Then
    Begin
      unsave;
      new_save_level(6);
{796:}
      Begin
        If cur_list.mode_field=-102 Then
          Begin
            adjust_tail := cur_tail
            ;
            u := hpack(mem[cur_list.head_field].hh.rh,0,1);
            w := mem[u+1].int;
            cur_tail := adjust_tail;
            adjust_tail := 0;
          End
        Else
          Begin
            u := vpackage(mem[cur_list.head_field].hh.rh,0,1,0);
            w := mem[u+3].int;
          End;
        n := 0;
        If cur_span<>cur_align Then{798:}
          Begin
            q := cur_span;
            Repeat
              n := n+1;
              q := mem[mem[q].hh.rh].hh.rh;
            Until q=cur_align;
            If n>255 Then confusion(926);
            q := cur_span;
            While mem[mem[q].hh.lh].hh.rh<n Do
              q := mem[q].hh.lh;
            If mem[mem[q].hh.lh].hh.rh>n Then
              Begin
                s := get_node(2);
                mem[s].hh.lh := mem[q].hh.lh;
                mem[s].hh.rh := n;
                mem[q].hh.lh := s;
                mem[s+1].int := w;
              End
            Else If mem[mem[q].hh.lh+1].int<w Then mem[mem[q].hh.lh+1].int := w;
          End{:798}
        Else If w>mem[cur_align+1].int Then mem[cur_align+1].int := w;
        mem[u].hh.b0 := 13;
        mem[u].hh.b1 := n;
{659:}
        If total_stretch[3]<>0 Then o := 3
        Else If total_stretch[2]<>0 Then
               o := 2
        Else If total_stretch[1]<>0 Then o := 1
        Else o := 0{:659};
        mem[u+5].hh.b1 := o;
        mem[u+6].int := total_stretch[o];
{665:}
        If total_shrink[3]<>0 Then o := 3
        Else If total_shrink[2]<>0 Then o
               := 2
        Else If total_shrink[1]<>0 Then o := 1
        Else o := 0{:665};
        mem[u+5].hh.b0 := o;
        mem[u+4].int := total_shrink[o];
        pop_nest;
        mem[cur_list.tail_field].hh.rh := u;
        cur_list.tail_field := u;
      End{:796};
{795:}
      Begin
        mem[cur_list.tail_field].hh.rh := new_glue(mem[mem[cur_align].
                                          hh.rh+1].hh.lh);
        cur_list.tail_field := mem[cur_list.tail_field].hh.rh;
      End;
      mem[cur_list.tail_field].hh.b1 := 12{:795};
      If mem[cur_align+5].hh.lh>=257 Then
        Begin
          fin_col := true;
          goto 10;
        End;
      init_span(p);
    End;
  align_state := 1000000;
  Repeat
    get_x_or_protected;
  Until cur_cmd<>10;
  cur_align := p;
  init_col;
  fin_col := false;
  10:
End;
{:791}{799:}
Procedure fin_row;

Var p: halfword;
Begin
  If cur_list.mode_field=-102 Then
    Begin
      p := hpack(mem[cur_list.
           head_field].hh.rh,0,1);
      pop_nest;
      append_to_vlist(p);
      If cur_head<>cur_tail Then
        Begin
          mem[cur_list.tail_field].hh.rh := mem[
                                            cur_head].hh.rh;
          cur_list.tail_field := cur_tail;
        End;
    End
  Else
    Begin
      p := vpackage(mem[cur_list.head_field].hh.rh,0,1,1073741823
           );
      pop_nest;
      mem[cur_list.tail_field].hh.rh := p;
      cur_list.tail_field := p;
      cur_list.aux_field.hh.lh := 1000;
    End;
  mem[p].hh.b0 := 13;
  mem[p+6].int := 0;
  If eqtb[3420].hh.rh<>0 Then begin_token_list(eqtb[3420].hh.rh,13);
  align_peek;
End;{:799}{800:}
Procedure do_assignments;
forward;
Procedure resume_after_display;
forward;
Procedure build_page;
forward;
Procedure fin_align;

Var p,q,r,s,u,v: halfword;
  t,w: scaled;
  o: scaled;
  n: halfword;
  rule_save: scaled;
  aux_save: memory_word;
Begin
  If cur_group<>6 Then confusion(927);
  unsave;
  If cur_group<>6 Then confusion(928);
  unsave;
  If nest[nest_ptr-1].mode_field=203 Then o := eqtb[5860].int
  Else o := 0;
{801:}
  q := mem[mem[29992].hh.rh].hh.rh;
  Repeat
    flush_list(mem[q+3].int);
    flush_list(mem[q+2].int);
    p := mem[mem[q].hh.rh].hh.rh;
    If mem[q+1].int=-1073741824 Then{802:}
      Begin
        mem[q+1].int := 0;
        r := mem[q].hh.rh;
        s := mem[r+1].hh.lh;
        If s<>0 Then
          Begin
            mem[0].hh.rh := mem[0].hh.rh+1;
            delete_glue_ref(s);
            mem[r+1].hh.lh := 0;
          End;
      End{:802};
    If mem[q].hh.lh<>29991 Then{803:}
      Begin
        t := mem[q+1].int+mem[mem[mem[q].hh
             .rh+1].hh.lh+1].int;
        r := mem[q].hh.lh;
        s := 29991;
        mem[s].hh.lh := p;
        n := 1;
        Repeat
          mem[r+1].int := mem[r+1].int-t;
          u := mem[r].hh.lh;
          While mem[r].hh.rh>n Do
            Begin
              s := mem[s].hh.lh;
              n := mem[mem[s].hh.lh].hh.rh+1;
            End;
          If mem[r].hh.rh<n Then
            Begin
              mem[r].hh.lh := mem[s].hh.lh;
              mem[s].hh.lh := r;
              mem[r].hh.rh := mem[r].hh.rh-1;
              s := r;
            End
          Else
            Begin
              If mem[r+1].int>mem[mem[s].hh.lh+1].int Then mem[mem[s].
                hh.lh+1].int := mem[r+1].int;
              free_node(r,2);
            End;
          r := u;
        Until r=29991;
      End{:803};
    mem[q].hh.b0 := 13;
    mem[q].hh.b1 := 0;
    mem[q+3].int := 0;
    mem[q+2].int := 0;
    mem[q+5].hh.b1 := 0;
    mem[q+5].hh.b0 := 0;
    mem[q+6].int := 0;
    mem[q+4].int := 0;
    q := p;
  Until q=0{:801};{804:}
  save_ptr := save_ptr-2;
  pack_begin_line := -cur_list.ml_field;
  If cur_list.mode_field=-1 Then
    Begin
      rule_save := eqtb[5861].int;
      eqtb[5861].int := 0;
      p := hpack(mem[29992].hh.rh,save_stack[save_ptr+1].int,save_stack[save_ptr
           +0].int);
      eqtb[5861].int := rule_save;
    End
  Else
    Begin
      q := mem[mem[29992].hh.rh].hh.rh;
      Repeat
        mem[q+3].int := mem[q+1].int;
        mem[q+1].int := 0;
        q := mem[mem[q].hh.rh].hh.rh;
      Until q=0;
      p := vpackage(mem[29992].hh.rh,save_stack[save_ptr+1].int,save_stack[
           save_ptr+0].int,1073741823);
      q := mem[mem[29992].hh.rh].hh.rh;
      Repeat
        mem[q+1].int := mem[q+3].int;
        mem[q+3].int := 0;
        q := mem[mem[q].hh.rh].hh.rh;
      Until q=0;
    End;
  pack_begin_line := 0{:804};
{805:}
  q := mem[cur_list.head_field].hh.rh;
  s := cur_list.head_field;
  While q<>0 Do
    Begin
      If Not(q>=hi_mem_min)Then If mem[q].hh.b0=13 Then
{807:}
                                  Begin
                                    If cur_list.mode_field=-1 Then
                                      Begin
                                        mem[q].hh.b0 := 0;
                                        mem[q+1].int := mem[p+1].int;
                                        If nest[nest_ptr-1].mode_field=203 Then mem[q].hh.b1 := 2;
                                      End
                                    Else
                                      Begin
                                        mem[q].hh.b0 := 1;
                                        mem[q+3].int := mem[p+3].int;
                                      End;
                                    mem[q+5].hh.b1 := mem[p+5].hh.b1;
                                    mem[q+5].hh.b0 := mem[p+5].hh.b0;
                                    mem[q+6].gr := mem[p+6].gr;
                                    mem[q+4].int := o;
                                    r := mem[mem[q+5].hh.rh].hh.rh;
                                    s := mem[mem[p+5].hh.rh].hh.rh;
                                    Repeat{808:}
                                      n := mem[r].hh.b1;
                                      t := mem[s+1].int;
                                      w := t;
                                      u := 29996;
                                      mem[r].hh.b1 := 0;
                                      While n>0 Do
                                        Begin
                                          n := n-1;
{809:}
                                          s := mem[s].hh.rh;
                                          v := mem[s+1].hh.lh;
                                          mem[u].hh.rh := new_glue(v);
                                          u := mem[u].hh.rh;
                                          mem[u].hh.b1 := 12;
                                          t := t+mem[v+1].int;
                                          If mem[p+5].hh.b0=1 Then
                                            Begin
                                              If mem[v].hh.b0=mem[p+5].hh.b1 Then t := t+
                                                                                       round(mem[p+6
                                                                                       ].gr*mem[v+2]
                                                                                       .int);
                                            End
                                          Else If mem[p+5].hh.b0=2 Then
                                                 Begin
                                                   If mem[v].hh.b1=mem[p+5].hh.b1
                                                     Then t := t-round(mem[p+6].gr*mem[v+3].int);
                                                 End;
                                          s := mem[s].hh.rh;
                                          mem[u].hh.rh := new_null_box;
                                          u := mem[u].hh.rh;
                                          t := t+mem[s+1].int;
                                          If cur_list.mode_field=-1 Then mem[u+1].int := mem[s+1].
                                                                                         int
                                          Else
                                            Begin
                                              mem
                                              [u].hh.b0 := 1;
                                              mem[u+3].int := mem[s+1].int;
                                            End{:809};
                                        End;
                                      If cur_list.mode_field=-1 Then{810:}
                                        Begin
                                          mem[r+3].int := mem[q+3].int;
                                          mem[r+2].int := mem[q+2].int;
                                          If t=mem[r+1].int Then
                                            Begin
                                              mem[r+5].hh.b0 := 0;
                                              mem[r+5].hh.b1 := 0;
                                              mem[r+6].gr := 0.0;
                                            End
                                          Else If t>mem[r+1].int Then
                                                 Begin
                                                   mem[r+5].hh.b0 := 1;
                                                   If mem[r+6].int=0 Then mem[r+6].gr := 0.0
                                                   Else mem[r+6].gr := (t-mem[r+1].
                                                                       int)/mem[r+6].int;
                                                 End
                                          Else
                                            Begin
                                              mem[r+5].hh.b1 := mem[r+5].hh.b0;
                                              mem[r+5].hh.b0 := 2;
                                              If mem[r+4].int=0 Then mem[r+6].gr := 0.0
                                              Else If (mem[r+5].hh.b1=0)And(mem
                                                      [r+1].int-t>mem[r+4].int)Then mem[r+6].gr := 1.0
                                              Else mem[r+6].gr := (mem[r
                                                                  +1].int-t)/mem[r+4].int;
                                            End;
                                          mem[r+1].int := w;
                                          mem[r].hh.b0 := 0;
                                        End{:810}
                                      Else{811:}
                                        Begin
                                          mem[r+1].int := mem[q+1].int;
                                          If t=mem[r+3].int Then
                                            Begin
                                              mem[r+5].hh.b0 := 0;
                                              mem[r+5].hh.b1 := 0;
                                              mem[r+6].gr := 0.0;
                                            End
                                          Else If t>mem[r+3].int Then
                                                 Begin
                                                   mem[r+5].hh.b0 := 1;
                                                   If mem[r+6].int=0 Then mem[r+6].gr := 0.0
                                                   Else mem[r+6].gr := (t-mem[r+3].
                                                                       int)/mem[r+6].int;
                                                 End
                                          Else
                                            Begin
                                              mem[r+5].hh.b1 := mem[r+5].hh.b0;
                                              mem[r+5].hh.b0 := 2;
                                              If mem[r+4].int=0 Then mem[r+6].gr := 0.0
                                              Else If (mem[r+5].hh.b1=0)And(mem
                                                      [r+3].int-t>mem[r+4].int)Then mem[r+6].gr := 1.0
                                              Else mem[r+6].gr := (mem[r
                                                                  +3].int-t)/mem[r+4].int;
                                            End;
                                          mem[r+3].int := w;
                                          mem[r].hh.b0 := 1;
                                        End{:811};
                                      mem[r+4].int := 0;
                                      If u<>29996 Then
                                        Begin
                                          mem[u].hh.rh := mem[r].hh.rh;
                                          mem[r].hh.rh := mem[29996].hh.rh;
                                          r := u;
                                        End{:808};
                                      r := mem[mem[r].hh.rh].hh.rh;
                                      s := mem[mem[s].hh.rh].hh.rh;
                                    Until r=0;
                                  End{:807}
      Else If mem[q].hh.b0=2 Then{806:}
             Begin
               If (mem[q+1].int=
                  -1073741824)Then mem[q+1].int := mem[p+1].int;
               If (mem[q+3].int=-1073741824)Then mem[q+3].int := mem[p+3].int;
               If (mem[q+2].int=-1073741824)Then mem[q+2].int := mem[p+2].int;
               If o<>0 Then
                 Begin
                   r := mem[q].hh.rh;
                   mem[q].hh.rh := 0;
                   q := hpack(q,0,1);
                   mem[q+4].int := o;
                   mem[q].hh.rh := r;
                   mem[s].hh.rh := q;
                 End;
             End{:806};
      s := q;
      q := mem[q].hh.rh;
    End{:805};
  flush_node_list(p);
  pop_alignment;
{812:}
  aux_save := cur_list.aux_field;
  p := mem[cur_list.head_field].hh.rh;
  q := cur_list.tail_field;
  pop_nest;
  If cur_list.mode_field=203 Then{1206:}
    Begin
      do_assignments;
      If cur_cmd<>3 Then{1207:}
        Begin
          Begin
            If interaction=3 Then;
            print_nl(263);
            print(1183);
          End;
          Begin
            help_ptr := 2;
            help_line[1] := 907;
            help_line[0] := 908;
          End;
          back_error;
        End{:1207}
      Else{1197:}
        Begin
          get_x_token;
          If cur_cmd<>3 Then
            Begin
              Begin
                If interaction=3 Then;
                print_nl(263);
                print(1179);
              End;
              Begin
                help_ptr := 2;
                help_line[1] := 1180;
                help_line[0] := 1181;
              End;
              back_error;
            End;
        End{:1197};
      flush_node_list(cur_list.eTeX_aux_field);
      pop_nest;
      Begin
        mem[cur_list.tail_field].hh.rh := new_penalty(eqtb[5279].int);
        cur_list.tail_field := mem[cur_list.tail_field].hh.rh;
      End;
      Begin
        mem[cur_list.tail_field].hh.rh := new_param_glue(3);
        cur_list.tail_field := mem[cur_list.tail_field].hh.rh;
      End;
      mem[cur_list.tail_field].hh.rh := p;
      If p<>0 Then cur_list.tail_field := q;
      Begin
        mem[cur_list.tail_field].hh.rh := new_penalty(eqtb[5280].int);
        cur_list.tail_field := mem[cur_list.tail_field].hh.rh;
      End;
      Begin
        mem[cur_list.tail_field].hh.rh := new_param_glue(4);
        cur_list.tail_field := mem[cur_list.tail_field].hh.rh;
      End;
      cur_list.aux_field.int := aux_save.int;
      resume_after_display;
    End{:1206}
  Else
    Begin
      cur_list.aux_field := aux_save;
      mem[cur_list.tail_field].hh.rh := p;
      If p<>0 Then cur_list.tail_field := q;
      If cur_list.mode_field=1 Then build_page;
    End{:812};
End;
{785:}
Procedure align_peek;

Label 20;
Begin
  20: align_state := 1000000;
  Repeat
    get_x_or_protected;
  Until cur_cmd<>10;
  If cur_cmd=34 Then
    Begin
      scan_left_brace;
      new_save_level(7);
      If cur_list.mode_field=-1 Then normal_paragraph;
    End
  Else If cur_cmd=2 Then fin_align
  Else If (cur_cmd=5)And(cur_chr=258)
         Then goto 20
  Else
    Begin
      init_row;
      init_col;
    End;
End;
{:785}{:800}{815:}{826:}
Function finite_shrink(p:halfword): halfword;

Var q: halfword;
Begin
  If no_shrink_error_yet Then
    Begin
      no_shrink_error_yet := false;
{if eqtb[5300].int>0 then end_diagnostic(true);}
      Begin
        If interaction=3 Then;
        print_nl(263);
        print(929);
      End;
      Begin
        help_ptr := 5;
        help_line[4] := 930;
        help_line[3] := 931;
        help_line[2] := 932;
        help_line[1] := 933;
        help_line[0] := 934;
      End;
      error;
{if eqtb[5300].int>0 then begin_diagnostic;}
    End;
  q := new_spec(p);
  mem[q].hh.b1 := 0;
  delete_glue_ref(p);
  finite_shrink := q;
End;
{:826}{829:}
Procedure try_break(pi:integer;break_type:small_number);

Label 10,30,31,22,60,40,45;

Var r: halfword;
  prev_r: halfword;
  old_l: halfword;
  no_break_yet: boolean;{830:}
  prev_prev_r: halfword;
  s: halfword;
  q: halfword;
  v: halfword;
  t: integer;
  f: internal_font_number;
  l: halfword;
  node_r_stays_active: boolean;
  line_width: scaled;
  fit_class: 0..3;
  b: halfword;
  d: integer;
  artificial_demerits: boolean;
  save_link: halfword;
  shortfall: scaled;{:830}{1579:}
  g: scaled;
{:1579}
Begin{831:}
  If abs(pi)>=10000 Then If pi>0 Then goto 10
  Else pi :=
             -10000{:831};
  no_break_yet := true;
  prev_r := 29993;
  old_l := 0;
  cur_active_width[1] := active_width[1];
  cur_active_width[2] := active_width[2];
  cur_active_width[3] := active_width[3];
  cur_active_width[4] := active_width[4];
  cur_active_width[5] := active_width[5];
  cur_active_width[6] := active_width[6];
  While true Do
    Begin
      22: r := mem[prev_r].hh.rh;
{832:}
      If mem[r].hh.b0=2 Then
        Begin
          cur_active_width[1] := cur_active_width
                                 [1]+mem[r+1].int;
          cur_active_width[2] := cur_active_width[2]+mem[r+2].int;
          cur_active_width[3] := cur_active_width[3]+mem[r+3].int;
          cur_active_width[4] := cur_active_width[4]+mem[r+4].int;
          cur_active_width[5] := cur_active_width[5]+mem[r+5].int;
          cur_active_width[6] := cur_active_width[6]+mem[r+6].int;
          prev_prev_r := prev_r;
          prev_r := r;
          goto 22;
        End{:832};
{835:}
      Begin
        l := mem[r+1].hh.lh;
        If l>old_l Then
          Begin
            If (minimum_demerits<1073741823)And((old_l<>
               easy_line)Or(r=29993))Then{836:}
              Begin
                If no_break_yet Then{837:}
                  Begin
                    no_break_yet := false;
                    break_width[1] := background[1];
                    break_width[2] := background[2];
                    break_width[3] := background[3];
                    break_width[4] := background[4];
                    break_width[5] := background[5];
                    break_width[6] := background[6];
                    s := cur_p;
                    If break_type>0 Then If cur_p<>0 Then{840:}
                                           Begin
                                             t := mem[cur_p].hh.b1;
                                             v := cur_p;
                                             s := mem[cur_p+1].hh.rh;
                                             While t>0 Do
                                               Begin
                                                 t := t-1;
                                                 v := mem[v].hh.rh;{841:}
                                                 If (v>=hi_mem_min)Then
                                                   Begin
                                                     f := mem[v].hh.b0;
                                                     break_width[1] := break_width[1]-font_info[
                                                                       width_base[f]+font_info[
                                                                       char_base[f]+mem[v].hh.b1].
                                                                       qqqq.b0].int;
                                                   End
                                                 Else Case mem[v].hh.b0 Of
                                                        6:
                                                           Begin
                                                             f := mem[v+1].hh.b0;
                                                             break_width[1] := break_width[1]-
                                                                               font_info[width_base[
                                                                               f]+font_info[
                                                                               char_base[f]+mem[v+1]
                                                                               .hh.b1].qqqq.b0].int;
                                                           End;
                                                        0,1,2,11: break_width[1] := break_width[1]-
                                                                                    mem[v+1].int;
                                                        others: confusion(935)
                                                   End{:841};
                                               End;
                                             While s<>0 Do
                                               Begin{842:}
                                                 If (s>=hi_mem_min)Then
                                                   Begin
                                                     f := mem[s].hh.b0;
                                                     break_width[1] := break_width[1]+font_info[
                                                                       width_base[f]+font_info[
                                                                       char_base[f]+mem[s].hh.b1].
                                                                       qqqq.b0].int;
                                                   End
                                                 Else Case mem[s].hh.b0 Of
                                                        6:
                                                           Begin
                                                             f := mem[s+1].hh.b0;
                                                             break_width[1] := break_width[1]+
                                                                               font_info[width_base[
                                                                               f]+font_info[
                                                                               char_base[f]+mem[s+1]
                                                                               .hh.b1].qqqq.b0].int;
                                                           End;
                                                        0,1,2,11: break_width[1] := break_width[1]+
                                                                                    mem[s+1].int;
                                                        others: confusion(936)
                                                   End{:842};
                                                 s := mem[s].hh.rh;
                                               End;
                                             break_width[1] := break_width[1]+disc_width;
                                             If mem[cur_p+1].hh.rh=0 Then s := mem[v].hh.rh;
                                           End{:840};
                    While s<>0 Do
                      Begin
                        If (s>=hi_mem_min)Then goto 30;
                        Case mem[s].hh.b0 Of
                          10:{838:}
                              Begin
                                v := mem[s+1].hh.lh;
                                break_width[1] := break_width[1]-mem[v+1].int;
                                break_width[2+mem[v].hh.b0] := break_width[2+mem[v].hh.b0]-mem[v+2].
                                                               int;
                                break_width[6] := break_width[6]-mem[v+3].int;
                              End{:838};
                          12:;
                          9: break_width[1] := break_width[1]-mem[s+1].int;
                          11: If mem[s].hh.b1<>1 Then goto 30
                              Else break_width[1] := break_width[1]-
                                                     mem[s+1].int;
                          others: goto 30
                        End;
                        s := mem[s].hh.rh;
                      End;
                    30:
                  End{:837};
{843:}
                If mem[prev_r].hh.b0=2 Then
                  Begin
                    mem[prev_r+1].int := mem[prev_r+1]
                                         .int-cur_active_width[1]+break_width[1];
                    mem[prev_r+2].int := mem[prev_r+2].int-cur_active_width[2]+break_width[2];
                    mem[prev_r+3].int := mem[prev_r+3].int-cur_active_width[3]+break_width[3];
                    mem[prev_r+4].int := mem[prev_r+4].int-cur_active_width[4]+break_width[4];
                    mem[prev_r+5].int := mem[prev_r+5].int-cur_active_width[5]+break_width[5];
                    mem[prev_r+6].int := mem[prev_r+6].int-cur_active_width[6]+break_width[6];
                  End
                Else If prev_r=29993 Then
                       Begin
                         active_width[1] := break_width[1];
                         active_width[2] := break_width[2];
                         active_width[3] := break_width[3];
                         active_width[4] := break_width[4];
                         active_width[5] := break_width[5];
                         active_width[6] := break_width[6];
                       End
                Else
                  Begin
                    q := get_node(7);
                    mem[q].hh.rh := r;
                    mem[q].hh.b0 := 2;
                    mem[q].hh.b1 := 0;
                    mem[q+1].int := break_width[1]-cur_active_width[1];
                    mem[q+2].int := break_width[2]-cur_active_width[2];
                    mem[q+3].int := break_width[3]-cur_active_width[3];
                    mem[q+4].int := break_width[4]-cur_active_width[4];
                    mem[q+5].int := break_width[5]-cur_active_width[5];
                    mem[q+6].int := break_width[6]-cur_active_width[6];
                    mem[prev_r].hh.rh := q;
                    prev_prev_r := prev_r;
                    prev_r := q;
                  End{:843};
                If abs(eqtb[5284].int)>=1073741823-minimum_demerits Then
                  minimum_demerits := 1073741822
                Else minimum_demerits := minimum_demerits+abs
                                         (eqtb[5284].int);
                For fit_class:=0 To 3 Do
                  Begin
                    If minimal_demerits[fit_class]<=
                       minimum_demerits Then{845:}
                      Begin
                        q := get_node(2);
                        mem[q].hh.rh := passive;
                        passive := q;
                        mem[q+1].hh.rh := cur_p;
                        {pass_number:=pass_number+1;
mem[q].hh.lh:=pass_number;}
                        mem[q+1].hh.lh := best_place[fit_class];
                        q := get_node(active_node_size);
                        mem[q+1].hh.rh := passive;
                        mem[q+1].hh.lh := best_pl_line[fit_class]+1;
                        mem[q].hh.b1 := fit_class;
                        mem[q].hh.b0 := break_type;
                        mem[q+2].int := minimal_demerits[fit_class];
                        If do_last_line_fit Then{1586:}
                          Begin
                            mem[q+3].int := best_pl_short[
                                            fit_class];
                            mem[q+4].int := best_pl_glue[fit_class];
                          End{:1586};
                        mem[q].hh.rh := r;
                        mem[prev_r].hh.rh := q;
                        prev_r := q;

{if eqtb[5300].int>0 then[846:]begin print_nl(937);
print_int(mem[passive].hh.lh);print(938);print_int(mem[q+1].hh.lh-1);
print_char(46);print_int(fit_class);if break_type=1 then print_char(45);
print(939);print_int(mem[q+2].int);
if do_last_line_fit then[1587:]begin print(1411);
print_scaled(mem[q+3].int);if cur_p=0 then print(1412)else print(1008);
print_scaled(mem[q+4].int);end[:1587];print(940);
if mem[passive+1].hh.lh=0 then print_char(48)else print_int(mem[mem[
passive+1].hh.lh].hh.lh);end[:846];}
                      End{:845};
                    minimal_demerits[fit_class] := 1073741823;
                  End;
                minimum_demerits := 1073741823;
{844:}
                If r<>29993 Then
                  Begin
                    q := get_node(7);
                    mem[q].hh.rh := r;
                    mem[q].hh.b0 := 2;
                    mem[q].hh.b1 := 0;
                    mem[q+1].int := cur_active_width[1]-break_width[1];
                    mem[q+2].int := cur_active_width[2]-break_width[2];
                    mem[q+3].int := cur_active_width[3]-break_width[3];
                    mem[q+4].int := cur_active_width[4]-break_width[4];
                    mem[q+5].int := cur_active_width[5]-break_width[5];
                    mem[q+6].int := cur_active_width[6]-break_width[6];
                    mem[prev_r].hh.rh := q;
                    prev_prev_r := prev_r;
                    prev_r := q;
                  End{:844};
              End{:836};
            If r=29993 Then goto 10;
{850:}
            If l>easy_line Then
              Begin
                line_width := second_width;
                old_l := 65534;
              End
            Else
              Begin
                old_l := l;
                If l>last_special_line Then line_width := second_width
                Else If eqtb[3412].
                        hh.rh=0 Then line_width := first_width
                Else line_width := mem[eqtb[3412].hh.
                                   rh+2*l].int;
              End{:850};
          End;
      End{:835};
{851:}
      Begin
        artificial_demerits := false;
        shortfall := line_width-cur_active_width[1];
        If shortfall>0 Then{852:}If (cur_active_width[3]<>0)Or(cur_active_width[4
                                    ]<>0)Or(cur_active_width[5]<>0)Then
                                   Begin
                                     If do_last_line_fit Then
                                       Begin
                                         If cur_p=0 Then{1581:}
                                           Begin
                                             If (mem[r+3].int=0)Or(mem[r+4].int<=0)Then
                                               goto 45;
                                             If (cur_active_width[3]<>fill_width[0])Or(
                                                cur_active_width[4]<>fill_width
                                                [1])Or(cur_active_width[5]<>fill_width[2])Then goto
                                               45;
                                             If mem[r+3].int>0 Then g := cur_active_width[2]
                                             Else g := cur_active_width[6]
                                             ;
                                             If g<=0 Then goto 45;
                                             arith_error := false;
                                             g := fract(g,mem[r+3].int,mem[r+4].int,1073741823);
                                             If eqtb[5329].int<1000 Then g := fract(g,eqtb[5329].int
                                                                              ,1000,1073741823);
                                             If arith_error Then If mem[r+3].int>0 Then g :=
                                                                                          1073741823
                                             Else g :=
                                                       -1073741823;
                                             If g>0 Then{1582:}
                                               Begin
                                                 If g>shortfall Then g := shortfall;
                                                 If g>7230584 Then If cur_active_width[2]<1663497
                                                                     Then
                                                                     Begin
                                                                       b := 10000;
                                                                       fit_class := 0;
                                                                       goto 40;
                                                                     End;
                                                 b := badness(g,cur_active_width[2]);
                                                 If b>12 Then If b>99 Then fit_class := 0
                                                 Else fit_class := 1
                                                 Else fit_class
                                                   := 2;
                                                 goto 40;
                                               End{:1582}
                                             Else If g<0 Then{1583:}
                                                    Begin
                                                      If -g>cur_active_width[6]Then g := -

                                                                                    cur_active_width
                                                                                         [6];
                                                      b := badness(-g,cur_active_width[6]);
                                                      If b>12 Then fit_class := 3
                                                      Else fit_class := 2;
                                                      goto 40;
                                                    End{:1583};
                                             45:
                                           End{:1581};
                                         shortfall := 0;
                                       End;
                                     b := 0;
                                     fit_class := 2;
                                   End
        Else
          Begin
            If shortfall>7230584 Then If cur_active_width[2]<1663497
                                        Then
                                        Begin
                                          b := 10000;
                                          fit_class := 0;
                                          goto 31;
                                        End;
            b := badness(shortfall,cur_active_width[2]);
            If b>12 Then If b>99 Then fit_class := 0
            Else fit_class := 1
            Else fit_class
              := 2;
            31:
          End{:852}
        Else{853:}
          Begin
            If -shortfall>cur_active_width[6]Then b :=
                                                       10001
            Else b := badness(-shortfall,cur_active_width[6]);
            If b>12 Then fit_class := 3
            Else fit_class := 2;
          End{:853};
        If do_last_line_fit Then{1584:}
          Begin
            If cur_p=0 Then shortfall := 0;
            If shortfall>0 Then g := cur_active_width[2]
            Else If shortfall<0 Then g :=
                                          cur_active_width[6]
            Else g := 0;
          End{:1584};
        40: If (b>10000)Or(pi=-10000)Then{854:}
              Begin
                If final_pass And(
                   minimum_demerits=1073741823)And(mem[r].hh.rh=29993)And(prev_r=29993)Then
                  artificial_demerits := true
                Else If b>threshold Then goto 60;
                node_r_stays_active := false;
              End{:854}
            Else
              Begin
                prev_r := r;
                If b>threshold Then goto 22;
                node_r_stays_active := true;
              End;
{855:}
        If artificial_demerits Then d := 0
        Else{859:}
          Begin
            d := eqtb[5270].int
                 +b;
            If abs(d)>=10000 Then d := 100000000
            Else d := d*d;
            If pi<>0 Then If pi>0 Then d := d+pi*pi
            Else If pi>-10000 Then d := d-pi*pi;
            If (break_type=1)And(mem[r].hh.b0=1)Then If cur_p<>0 Then d := d+eqtb[5282]
                                                                           .int
            Else d := d+eqtb[5283].int;
            If abs(fit_class-mem[r].hh.b1)>1 Then d := d+eqtb[5284].int;
          End{:859};

{if eqtb[5300].int>0 then[856:]begin if printed_node<>cur_p then[857:]
begin print_nl(339);
if cur_p=0 then short_display(mem[printed_node].hh.rh)else begin
save_link:=mem[cur_p].hh.rh;mem[cur_p].hh.rh:=0;print_nl(339);
short_display(mem[printed_node].hh.rh);mem[cur_p].hh.rh:=save_link;end;
printed_node:=cur_p;end[:857];print_nl(64);
if cur_p=0 then print_esc(606)else if mem[cur_p].hh.b0<>10 then begin if
mem[cur_p].hh.b0=12 then print_esc(535)else if mem[cur_p].hh.b0=7 then
print_esc(352)else if mem[cur_p].hh.b0=11 then print_esc(341)else
print_esc(346);end;print(941);
if mem[r+1].hh.rh=0 then print_char(48)else print_int(mem[mem[r+1].hh.rh
].hh.lh);print(942);if b>10000 then print_char(42)else print_int(b);
print(943);print_int(pi);print(944);
if artificial_demerits then print_char(42)else print_int(d);end[:856];}
        d := d+mem[r+2].int;
        If d<=minimal_demerits[fit_class]Then
          Begin
            minimal_demerits[fit_class]
            := d;
            best_place[fit_class] := mem[r+1].hh.rh;
            best_pl_line[fit_class] := l;
            If do_last_line_fit Then{1585:}
              Begin
                best_pl_short[fit_class] := shortfall
                ;
                best_pl_glue[fit_class] := g;
              End{:1585};
            If d<minimum_demerits Then minimum_demerits := d;
          End{:855};
        If node_r_stays_active Then goto 22;
        60:{860:}mem[prev_r].hh.rh := mem[r].hh.rh;
        free_node(r,active_node_size);
        If prev_r=29993 Then{861:}
          Begin
            r := mem[29993].hh.rh;
            If mem[r].hh.b0=2 Then
              Begin
                active_width[1] := active_width[1]+mem[r+1].
                                   int;
                active_width[2] := active_width[2]+mem[r+2].int;
                active_width[3] := active_width[3]+mem[r+3].int;
                active_width[4] := active_width[4]+mem[r+4].int;
                active_width[5] := active_width[5]+mem[r+5].int;
                active_width[6] := active_width[6]+mem[r+6].int;
                cur_active_width[1] := active_width[1];
                cur_active_width[2] := active_width[2];
                cur_active_width[3] := active_width[3];
                cur_active_width[4] := active_width[4];
                cur_active_width[5] := active_width[5];
                cur_active_width[6] := active_width[6];
                mem[29993].hh.rh := mem[r].hh.rh;
                free_node(r,7);
              End;
          End{:861}
        Else If mem[prev_r].hh.b0=2 Then
               Begin
                 r := mem[prev_r].hh.rh;
                 If r=29993 Then
                   Begin
                     cur_active_width[1] := cur_active_width[1]-mem[
                                            prev_r+1].int;
                     cur_active_width[2] := cur_active_width[2]-mem[prev_r+2].int;
                     cur_active_width[3] := cur_active_width[3]-mem[prev_r+3].int;
                     cur_active_width[4] := cur_active_width[4]-mem[prev_r+4].int;
                     cur_active_width[5] := cur_active_width[5]-mem[prev_r+5].int;
                     cur_active_width[6] := cur_active_width[6]-mem[prev_r+6].int;
                     mem[prev_prev_r].hh.rh := 29993;
                     free_node(prev_r,7);
                     prev_r := prev_prev_r;
                   End
                 Else If mem[r].hh.b0=2 Then
                        Begin
                          cur_active_width[1] :=
                                                 cur_active_width[1]+mem[r+1].int;
                          cur_active_width[2] := cur_active_width[2]+mem[r+2].int;
                          cur_active_width[3] := cur_active_width[3]+mem[r+3].int;
                          cur_active_width[4] := cur_active_width[4]+mem[r+4].int;
                          cur_active_width[5] := cur_active_width[5]+mem[r+5].int;
                          cur_active_width[6] := cur_active_width[6]+mem[r+6].int;
                          mem[prev_r+1].int := mem[prev_r+1].int+mem[r+1].int;
                          mem[prev_r+2].int := mem[prev_r+2].int+mem[r+2].int;
                          mem[prev_r+3].int := mem[prev_r+3].int+mem[r+3].int;
                          mem[prev_r+4].int := mem[prev_r+4].int+mem[r+4].int;
                          mem[prev_r+5].int := mem[prev_r+5].int+mem[r+5].int;
                          mem[prev_r+6].int := mem[prev_r+6].int+mem[r+6].int;
                          mem[prev_r].hh.rh := mem[r].hh.rh;
                          free_node(r,7);
                        End;
               End{:860};
      End{:851};
    End;
  10:
{[858:]if cur_p=printed_node then if cur_p<>0 then if mem[cur_p].hh.
b0=7 then begin t:=mem[cur_p].hh.b1;while t>0 do begin t:=t-1;
printed_node:=mem[printed_node].hh.rh;end;end[:858]}
End;
{:829}{877:}
Procedure post_line_break(d:boolean);

Label 30,31;

Var q,r,s: halfword;
  disc_break: boolean;
  post_disc_break: boolean;
  cur_width: scaled;
  cur_indent: scaled;
  t: quarterword;
  pen: integer;
  cur_line: halfword;
  LR_ptr: halfword;
Begin
  LR_ptr := cur_list.eTeX_aux_field;
{878:}
  q := mem[best_bet+1].hh.rh;
  cur_p := 0;
  Repeat
    r := q;
    q := mem[q+1].hh.lh;
    mem[r+1].hh.lh := cur_p;
    cur_p := r;
  Until q=0{:878};
  cur_line := cur_list.pg_field+1;
  Repeat{880:}
    If (eqtb[5332].int>0)Then{1438:}
      Begin
        q := mem[29997].hh.rh;
        If LR_ptr<>0 Then
          Begin
            temp_ptr := LR_ptr;
            r := q;
            Repeat
              s := new_math(0,(mem[temp_ptr].hh.lh-1));
              mem[s].hh.rh := r;
              r := s;
              temp_ptr := mem[temp_ptr].hh.rh;
            Until temp_ptr=0;
            mem[29997].hh.rh := r;
          End;
        While q<>mem[cur_p+1].hh.rh Do
          Begin
            If Not(q>=hi_mem_min)Then If mem[q]
                                         .hh.b0=9 Then{1439:}If odd(mem[q].hh.b1)Then
                                                               Begin
                                                                 If LR_ptr<>0 Then If
                                                                                      mem[LR_ptr].hh
                                                                                      .lh=(4*(mem[q]
                                                                                      .hh.b1 Div 4)+
                                                                                      3)Then
                                                                                     Begin
                                                                                       temp_ptr :=
                                                                                              LR_ptr
                                                                                       ;
                                                                                       LR_ptr := mem
                                                                                                 [
                                                                                            temp_ptr
                                                                                                 ].
                                                                                                 hh.
                                                                                                 rh;
                                                                                       Begin
                                                                                         mem[
                                                                                         temp_ptr].
                                                                                         hh.rh :=
                                                                                               avail
                                                                                         ;
                                                                                         avail :=
                                                                                            temp_ptr
                                                                                         ;
                                                                             {dyn_used:=dyn_used-1;}
                                                                                       End;
                                                                                     End;
                                                               End
            Else
              Begin
                temp_ptr := get_avail;
                mem[temp_ptr].hh.lh := (4*(mem[q].hh.b1 Div 4)+3);
                mem[temp_ptr].hh.rh := LR_ptr;
                LR_ptr := temp_ptr;
              End{:1439};
            q := mem[q].hh.rh;
          End;
      End{:1438};{881:}
    q := mem[cur_p+1].hh.rh;
    disc_break := false;
    post_disc_break := false;
    If q<>0 Then If mem[q].hh.b0=10 Then
                   Begin
                     delete_glue_ref(mem[q+1].hh.
                                     lh);
                     mem[q+1].hh.lh := eqtb[2890].hh.rh;
                     mem[q].hh.b1 := 9;
                     mem[eqtb[2890].hh.rh].hh.rh := mem[eqtb[2890].hh.rh].hh.rh+1;
                     goto 30;
                   End
    Else
      Begin
        If mem[q].hh.b0=7 Then{882:}
          Begin
            t := mem[q].hh.b1;
{883:}
            If t=0 Then r := mem[q].hh.rh
            Else
              Begin
                r := q;
                While t>1 Do
                  Begin
                    r := mem[r].hh.rh;
                    t := t-1;
                  End;
                s := mem[r].hh.rh;
                r := mem[s].hh.rh;
                mem[s].hh.rh := 0;
                flush_node_list(mem[q].hh.rh);
                mem[q].hh.b1 := 0;
              End{:883};
            If mem[q+1].hh.rh<>0 Then{884:}
              Begin
                s := mem[q+1].hh.rh;
                While mem[s].hh.rh<>0 Do
                  s := mem[s].hh.rh;
                mem[s].hh.rh := r;
                r := mem[q+1].hh.rh;
                mem[q+1].hh.rh := 0;
                post_disc_break := true;
              End{:884};
            If mem[q+1].hh.lh<>0 Then{885:}
              Begin
                s := mem[q+1].hh.lh;
                mem[q].hh.rh := s;
                While mem[s].hh.rh<>0 Do
                  s := mem[s].hh.rh;
                mem[q+1].hh.lh := 0;
                q := s;
              End{:885};
            mem[q].hh.rh := r;
            disc_break := true;
          End{:882}
        Else If mem[q].hh.b0=11 Then mem[q+1].int := 0
        Else If mem[q].hh.
                b0=9 Then
               Begin
                 mem[q+1].int := 0;
                 If (eqtb[5332].int>0)Then{1439:}If odd(mem[q].hh.b1)Then
                                                   Begin
                                                     If LR_ptr
                                                        <>0 Then If mem[LR_ptr].hh.lh=(4*(mem[q].hh.
                                                                    b1 Div 4)+3)Then
                                                                   Begin
                                                                     temp_ptr := LR_ptr;
                                                                     LR_ptr := mem[temp_ptr].hh.rh;
                                                                     Begin
                                                                       mem[temp_ptr].hh.rh := avail;
                                                                       avail := temp_ptr;
                                                                       {dyn_used:=dyn_used-1;}
                                                                     End;
                                                                   End;
                                                   End
                 Else
                   Begin
                     temp_ptr := get_avail;
                     mem[temp_ptr].hh.lh := (4*(mem[q].hh.b1 Div 4)+3);
                     mem[temp_ptr].hh.rh := LR_ptr;
                     LR_ptr := temp_ptr;
                   End{:1439};
               End;
      End
    Else
      Begin
        q := 29997;
        While mem[q].hh.rh<>0 Do
          q := mem[q].hh.rh;
      End;
{886:}
    r := new_param_glue(8);
    mem[r].hh.rh := mem[q].hh.rh;
    mem[q].hh.rh := r;
    q := r{:886};
    30:{:881};
    If (eqtb[5332].int>0)Then{1440:}If LR_ptr<>0 Then
                                      Begin
                                        s := 29997;
                                        r := mem[s].hh.rh;
                                        While r<>q Do
                                          Begin
                                            s := r;
                                            r := mem[s].hh.rh;
                                          End;
                                        r := LR_ptr;
                                        While r<>0 Do
                                          Begin
                                            temp_ptr := new_math(0,mem[r].hh.lh);
                                            mem[s].hh.rh := temp_ptr;
                                            s := temp_ptr;
                                            r := mem[r].hh.rh;
                                          End;
                                        mem[s].hh.rh := q;
                                      End{:1440};{887:}
    r := mem[q].hh.rh;
    mem[q].hh.rh := 0;
    q := mem[29997].hh.rh;
    mem[29997].hh.rh := r;
    If eqtb[2889].hh.rh<>0 Then
      Begin
        r := new_param_glue(7);
        mem[r].hh.rh := q;
        q := r;
      End{:887};
{889:}
    If cur_line>last_special_line Then
      Begin
        cur_width := second_width;
        cur_indent := second_indent;
      End
    Else If eqtb[3412].hh.rh=0 Then
           Begin
             cur_width := first_width;
             cur_indent := first_indent;
           End
    Else
      Begin
        cur_width := mem[eqtb[3412].hh.rh+2*cur_line].int;
        cur_indent := mem[eqtb[3412].hh.rh+2*cur_line-1].int;
      End;
    adjust_tail := 29995;
    just_box := hpack(q,cur_width,0);
    mem[just_box+4].int := cur_indent{:889};{888:}
    append_to_vlist(just_box);
    If 29995<>adjust_tail Then
      Begin
        mem[cur_list.tail_field].hh.rh := mem[
                                          29995].hh.rh;
        cur_list.tail_field := adjust_tail;
      End;
    adjust_tail := 0{:888};
{890:}
    If cur_line+1<>best_line Then
      Begin
        q := eqtb[3679].hh.rh;
        If q<>0 Then
          Begin
            r := cur_line;
            If r>mem[q+1].int Then r := mem[q+1].int;
            pen := mem[q+r+1].int;
          End
        Else pen := eqtb[5281].int;
        q := eqtb[3680].hh.rh;
        If q<>0 Then
          Begin
            r := cur_line-cur_list.pg_field;
            If r>mem[q+1].int Then r := mem[q+1].int;
            pen := pen+mem[q+r+1].int;
          End
        Else If cur_line=cur_list.pg_field+1 Then pen := pen+eqtb[5273].int;
        If d Then q := eqtb[3682].hh.rh
        Else q := eqtb[3681].hh.rh;
        If q<>0 Then
          Begin
            r := best_line-cur_line-1;
            If r>mem[q+1].int Then r := mem[q+1].int;
            pen := pen+mem[q+r+1].int;
          End
        Else If cur_line+2=best_line Then If d Then pen := pen+eqtb[5275].int
        Else pen := pen+eqtb[5274].int;
        If disc_break Then pen := pen+eqtb[5276].int;
        If pen<>0 Then
          Begin
            r := new_penalty(pen);
            mem[cur_list.tail_field].hh.rh := r;
            cur_list.tail_field := r;
          End;
      End{:890}{:880};
    cur_line := cur_line+1;
    cur_p := mem[cur_p+1].hh.lh;
    If cur_p<>0 Then If Not post_disc_break Then{879:}
                       Begin
                         r := 29997;
                         While true Do
                           Begin
                             q := mem[r].hh.rh;
                             If q=mem[cur_p+1].hh.rh Then goto 31;
                             If (q>=hi_mem_min)Then goto 31;
                             If (mem[q].hh.b0<9)Then goto 31;
                             If mem[q].hh.b0=11 Then If mem[q].hh.b1<>1 Then goto 31;
                             r := q;
                             If mem[q].hh.b0=9 Then If (eqtb[5332].int>0)Then{1439:}If odd(mem[q].hh
                                                                                       .
                                                                                       b1)Then
                                                                                      Begin
                                                                                        If LR_ptr<>0
                                                                                          Then If
                                                                                                 mem
                                                                                                  [
                                                                                              LR_ptr
                                                                                                  ].
                                                                                                  hh
                                                                                                  .
                                                                                                  lh
                                                                                                  =(
                                                                                                  4*
                                                                                                  (
                                                                                                 mem
                                                                                                  [q
                                                                                                  ].
                                                                                                  hh
                                                                                                  .
                                                                                                  b1

                                                                                                 Div
                                                                                                  4)
                                                                                                  +3
                                                                                                  )
                                                                                                Then

                                                                                               Begin

                                                                                            temp_ptr
                                                                                                  :=
                                                                                              LR_ptr
                                                                                                   ;

                                                                                              LR_ptr
                                                                                                  :=
                                                                                                 mem
                                                                                                   [
                                                                                            temp_ptr
                                                                                                   ]
                                                                                                   .
                                                                                                  hh
                                                                                                   .
                                                                                                  rh
                                                                                                   ;

                                                                                               Begin

                                                                                                 mem
                                                                                                   [
                                                                                            temp_ptr
                                                                                                   ]
                                                                                                   .
                                                                                                  hh
                                                                                                   .
                                                                                                  rh
                                                                                                  :=
                                                                                               avail
                                                                                                   ;

                                                                                               avail
                                                                                                  :=
                                                                                            temp_ptr
                                                                                                   ;
                                                                             {dyn_used:=dyn_used-1;}

                                                                                                 End
                                                                                                   ;
                                                                                                 End
                                                                                        ;
                                                                                      End
                             Else
                               Begin
                                 temp_ptr := get_avail;
                                 mem[temp_ptr].hh.lh := (4*(mem[q].hh.b1 Div 4)+3);
                                 mem[temp_ptr].hh.rh := LR_ptr;
                                 LR_ptr := temp_ptr;
                               End{:1439};
                           End;
                         31: If r<>29997 Then
                               Begin
                                 mem[r].hh.rh := 0;
                                 flush_node_list(mem[29997].hh.rh);
                                 mem[29997].hh.rh := q;
                               End;
                       End{:879};
  Until cur_p=0;
  If (cur_line<>best_line)Or(mem[29997].hh.rh<>0)Then confusion(951);
  cur_list.pg_field := best_line-1;
  cur_list.eTeX_aux_field := LR_ptr;
End;
{:877}{895:}{906:}
Function reconstitute(j,n:small_number;
                      bchar,hchar:halfword): small_number;

Label 22,30;

Var p: halfword;
  t: halfword;
  q: four_quarters;
  cur_rh: halfword;
  test_char: halfword;
  w: scaled;
  k: font_index;
Begin
  hyphen_passed := 0;
  t := 29996;
  w := 0;
  mem[29996].hh.rh := 0;
{908:}
  cur_l := hu[j]+0;
  cur_q := t;
  If j=0 Then
    Begin
      ligature_present := init_lig;
      p := init_list;
      If ligature_present Then lft_hit := init_lft;
      While p>0 Do
        Begin
          Begin
            mem[t].hh.rh := get_avail;
            t := mem[t].hh.rh;
            mem[t].hh.b0 := hf;
            mem[t].hh.b1 := mem[p].hh.b1;
          End;
          p := mem[p].hh.rh;
        End;
    End
  Else If cur_l<256 Then
         Begin
           mem[t].hh.rh := get_avail;
           t := mem[t].hh.rh;
           mem[t].hh.b0 := hf;
           mem[t].hh.b1 := cur_l;
         End;
  lig_stack := 0;
  Begin
    If j<n Then cur_r := hu[j+1]+0
    Else cur_r := bchar;
    If odd(hyf[j])Then cur_rh := hchar
    Else cur_rh := 256;
  End{:908};
  22:{909:}If cur_l=256 Then
             Begin
               k := bchar_label[hf];
               If k=0 Then goto 30
               Else q := font_info[k].qqqq;
             End
      Else
        Begin
          q := font_info[char_base[hf]+cur_l].qqqq;
          If ((q.b2-0)Mod 4)<>1 Then goto 30;
          k := lig_kern_base[hf]+q.b3;
          q := font_info[k].qqqq;
          If q.b0>128 Then
            Begin
              k := lig_kern_base[hf]+256*q.b2+q.b3+32768-256*(128
                   );
              q := font_info[k].qqqq;
            End;
        End;
  If cur_rh<256 Then test_char := cur_rh
  Else test_char := cur_r;
  While true Do
    Begin
      If q.b1=test_char Then If q.b0<=128 Then If cur_rh<
                                                  256 Then
                                                 Begin
                                                   hyphen_passed := j;
                                                   hchar := 256;
                                                   cur_rh := 256;
                                                   goto 22;
                                                 End
      Else
        Begin
          If hchar<256 Then If odd(hyf[j])Then
                              Begin
                                hyphen_passed
                                := j;
                                hchar := 256;
                              End;
          If q.b2<128 Then{911:}
            Begin
              If cur_l=256 Then lft_hit := true;
              If j=n Then If lig_stack=0 Then rt_hit := true;
              Begin
                If interrupt<>0 Then pause_for_instructions;
              End;
              Case q.b2 Of
                1,5:
                     Begin
                       cur_l := q.b3;
                       ligature_present := true;
                     End;
                2,6:
                     Begin
                       cur_r := q.b3;
                       If lig_stack>0 Then mem[lig_stack].hh.b1 := cur_r
                       Else
                         Begin
                           lig_stack :=
                                        new_lig_item(cur_r);
                           If j=n Then bchar := 256
                           Else
                             Begin
                               p := get_avail;
                               mem[lig_stack+1].hh.rh := p;
                               mem[p].hh.b1 := hu[j+1]+0;
                               mem[p].hh.b0 := hf;
                             End;
                         End;
                     End;
                3:
                   Begin
                     cur_r := q.b3;
                     p := lig_stack;
                     lig_stack := new_lig_item(cur_r);
                     mem[lig_stack].hh.rh := p;
                   End;
                7,11:
                      Begin
                        If ligature_present Then
                          Begin
                            p := new_ligature(hf,cur_l,mem[
                                 cur_q].hh.rh);
                            If lft_hit Then
                              Begin
                                mem[p].hh.b1 := 2;
                                lft_hit := false;
                              End;
                            If false Then If lig_stack=0 Then
                                            Begin
                                              mem[p].hh.b1 := mem[p].hh.b1+1;
                                              rt_hit := false;
                                            End;
                            mem[cur_q].hh.rh := p;
                            t := p;
                            ligature_present := false;
                          End;
                        cur_q := t;
                        cur_l := q.b3;
                        ligature_present := true;
                      End;
                others:
                        Begin
                          cur_l := q.b3;
                          ligature_present := true;
                          If lig_stack>0 Then
                            Begin
                              If mem[lig_stack+1].hh.rh>0 Then
                                Begin
                                  mem[t].
                                  hh.rh := mem[lig_stack+1].hh.rh;
                                  t := mem[t].hh.rh;
                                  j := j+1;
                                End;
                              p := lig_stack;
                              lig_stack := mem[p].hh.rh;
                              free_node(p,2);
                              If lig_stack=0 Then
                                Begin
                                  If j<n Then cur_r := hu[j+1]+0
                                  Else cur_r := bchar
                                  ;
                                  If odd(hyf[j])Then cur_rh := hchar
                                  Else cur_rh := 256;
                                End
                              Else cur_r := mem[lig_stack].hh.b1;
                            End
                          Else If j=n Then goto 30
                          Else
                            Begin
                              Begin
                                mem[t].hh.rh := get_avail;
                                t := mem[t].hh.rh;
                                mem[t].hh.b0 := hf;
                                mem[t].hh.b1 := cur_r;
                              End;
                              j := j+1;
                              Begin
                                If j<n Then cur_r := hu[j+1]+0
                                Else cur_r := bchar;
                                If odd(hyf[j])Then cur_rh := hchar
                                Else cur_rh := 256;
                              End;
                            End;
                        End
              End;
              If q.b2>4 Then If q.b2<>7 Then goto 30;
              goto 22;
            End{:911};
          w := font_info[kern_base[hf]+256*q.b2+q.b3].int;
          goto 30;
        End;
      If q.b0>=128 Then If cur_rh=256 Then goto 30
      Else
        Begin
          cur_rh := 256;
          goto 22;
        End;
      k := k+q.b0+1;
      q := font_info[k].qqqq;
    End;
  30:{:909};
{910:}
  If ligature_present Then
    Begin
      p := new_ligature(hf,cur_l,mem[cur_q]
           .hh.rh);
      If lft_hit Then
        Begin
          mem[p].hh.b1 := 2;
          lft_hit := false;
        End;
      If rt_hit Then If lig_stack=0 Then
                       Begin
                         mem[p].hh.b1 := mem[p].hh.b1+1;
                         rt_hit := false;
                       End;
      mem[cur_q].hh.rh := p;
      t := p;
      ligature_present := false;
    End;
  If w<>0 Then
    Begin
      mem[t].hh.rh := new_kern(w);
      t := mem[t].hh.rh;
      w := 0;
    End;
  If lig_stack>0 Then
    Begin
      cur_q := t;
      cur_l := mem[lig_stack].hh.b1;
      ligature_present := true;
      Begin
        If mem[lig_stack+1].hh.rh>0 Then
          Begin
            mem[t].hh.rh := mem[lig_stack
                            +1].hh.rh;
            t := mem[t].hh.rh;
            j := j+1;
          End;
        p := lig_stack;
        lig_stack := mem[p].hh.rh;
        free_node(p,2);
        If lig_stack=0 Then
          Begin
            If j<n Then cur_r := hu[j+1]+0
            Else cur_r := bchar
            ;
            If odd(hyf[j])Then cur_rh := hchar
            Else cur_rh := 256;
          End
        Else cur_r := mem[lig_stack].hh.b1;
      End;
      goto 22;
    End{:910};
  reconstitute := j;
End;{:906}
Procedure hyphenate;

Label 50,30,40,41,42,45,10;

Var {901:}i,j,l: 0..65;
  q,r,s: halfword;
  bchar: halfword;{:901}{912:}
  major_tail,minor_tail: halfword;
  c: ASCII_code;
  c_loc: 0..63;
  r_count: integer;
  hyf_node: halfword;
{:912}{922:}
  z: trie_pointer;
  v: integer;{:922}{929:}
  h: hyph_pointer;
  k: str_number;
  u: pool_pointer;
{:929}
Begin{923:}
  For j:=0 To hn Do
    hyf[j] := 0;{930:}
  h := hc[1];
  hn := hn+1;
  hc[hn] := cur_lang;
  For j:=2 To hn Do
    h := (h+h+hc[j])Mod 307;
  While true Do
    Begin{931:}
      k := hyph_word[h];
      If k=0 Then goto 45;
      If (str_start[k+1]-str_start[k])<hn Then goto 45;
      If (str_start[k+1]-str_start[k])=hn Then
        Begin
          j := 1;
          u := str_start[k];
          Repeat
            If str_pool[u]<hc[j]Then goto 45;
            If str_pool[u]>hc[j]Then goto 30;
            j := j+1;
            u := u+1;
          Until j>hn;
{932:}
          s := hyph_list[h];
          While s<>0 Do
            Begin
              hyf[mem[s].hh.lh] := 1;
              s := mem[s].hh.rh;
            End{:932};
          hn := hn-1;
          goto 40;
        End;
      30:{:931};
      If h>0 Then h := h-1
      Else h := 307;
    End;
  45: hn := hn-1{:930};
  If trie[cur_lang+1].b1<>cur_lang+0 Then goto 10;
  hc[0] := 0;
  hc[hn+1] := 0;
  hc[hn+2] := 256;
  For j:=0 To hn-r_hyf+1 Do
    Begin
      z := trie[cur_lang+1].rh+hc[j];
      l := j;
      While hc[l]=trie[z].b1-0 Do
        Begin
          If trie[z].b0<>0 Then{924:}
            Begin
              v :=
                   trie[z].b0;
              Repeat
                v := v+op_start[cur_lang];
                i := l-hyf_distance[v];
                If hyf_num[v]>hyf[i]Then hyf[i] := hyf_num[v];
                v := hyf_next[v];
              Until v=0;
            End{:924};
          l := l+1;
          z := trie[z].rh+hc[l];
        End;
    End;
  40: For j:=0 To l_hyf-1 Do
        hyf[j] := 0;
  For j:=0 To r_hyf-1 Do
    hyf[hn-j] := 0{:923};
{902:}
  For j:=l_hyf To hn-r_hyf Do
    If odd(hyf[j])Then goto 41;
  goto 10;
  41:{:902};{903:}
  q := mem[hb].hh.rh;
  mem[hb].hh.rh := 0;
  r := mem[ha].hh.rh;
  mem[ha].hh.rh := 0;
  bchar := hyf_bchar;
  If (ha>=hi_mem_min)Then If mem[ha].hh.b0<>hf Then goto 42
  Else
    Begin
      init_list := ha;
      init_lig := false;
      hu[0] := mem[ha].hh.b1-0;
    End
  Else If mem[ha].hh.b0=6 Then If mem[ha+1].hh.b0<>hf Then goto 42
  Else
    Begin
      init_list := mem[ha+1].hh.rh;
      init_lig := true;
      init_lft := (mem[ha].hh.b1>1);
      hu[0] := mem[ha+1].hh.b1-0;
      If init_list=0 Then If init_lft Then
                            Begin
                              hu[0] := 256;
                              init_lig := false;
                            End;
      free_node(ha,2);
    End
  Else
    Begin
      If Not(r>=hi_mem_min)Then If mem[r].hh.b0=6 Then If mem[r
                                                          ].hh.b1>1 Then goto 42;
      j := 1;
      s := ha;
      init_list := 0;
      goto 50;
    End;
  s := cur_p;
  While mem[s].hh.rh<>ha Do
    s := mem[s].hh.rh;
  j := 0;
  goto 50;
  42: s := ha;
  j := 0;
  hu[0] := 256;
  init_lig := false;
  init_list := 0;
  50: flush_node_list(r);
{913:}
  Repeat
    l := j;
    j := reconstitute(j,hn,bchar,hyf_char+0)+1;
    If hyphen_passed=0 Then
      Begin
        mem[s].hh.rh := mem[29996].hh.rh;
        While mem[s].hh.rh>0 Do
          s := mem[s].hh.rh;
        If odd(hyf[j-1])Then
          Begin
            l := j;
            hyphen_passed := j-1;
            mem[29996].hh.rh := 0;
          End;
      End;
    If hyphen_passed>0 Then{914:}Repeat
                                   r := get_node(2);
                                   mem[r].hh.rh := mem[29996].hh.rh;
                                   mem[r].hh.b0 := 7;
                                   major_tail := r;
                                   r_count := 0;
                                   While mem[major_tail].hh.rh>0 Do
                                     Begin
                                       major_tail := mem[major_tail].hh.rh
                                       ;
                                       r_count := r_count+1;
                                     End;
                                   i := hyphen_passed;
                                   hyf[i] := 0;{915:}
                                   minor_tail := 0;
                                   mem[r+1].hh.lh := 0;
                                   hyf_node := new_character(hf,hyf_char);
                                   If hyf_node<>0 Then
                                     Begin
                                       i := i+1;
                                       c := hu[i];
                                       hu[i] := hyf_char;
                                       Begin
                                         mem[hyf_node].hh.rh := avail;
                                         avail := hyf_node;{dyn_used:=dyn_used-1;}
                                       End;
                                     End;
                                   While l<=i Do
                                     Begin
                                       l := reconstitute(l,i,font_bchar[hf],256)+1;
                                       If mem[29996].hh.rh>0 Then
                                         Begin
                                           If minor_tail=0 Then mem[r+1].hh.lh :=
                                                                                  mem[29996].hh.rh
                                           Else mem[minor_tail].hh.rh := mem[29996].hh.rh;
                                           minor_tail := mem[29996].hh.rh;
                                           While mem[minor_tail].hh.rh>0 Do
                                             minor_tail := mem[minor_tail].hh.rh;
                                         End;
                                     End;
                                   If hyf_node<>0 Then
                                     Begin
                                       hu[i] := c;
                                       l := i;
                                       i := i-1;
                                     End{:915};
{916:}
                                   minor_tail := 0;
                                   mem[r+1].hh.rh := 0;
                                   c_loc := 0;
                                   If bchar_label[hf]<>0 Then
                                     Begin
                                       l := l-1;
                                       c := hu[l];
                                       c_loc := l;
                                       hu[l] := 256;
                                     End;
                                   While l<j Do
                                     Begin
                                       Repeat
                                         l := reconstitute(l,hn,bchar,256)+1;
                                         If c_loc>0 Then
                                           Begin
                                             hu[c_loc] := c;
                                             c_loc := 0;
                                           End;
                                         If mem[29996].hh.rh>0 Then
                                           Begin
                                             If minor_tail=0 Then mem[r+1].hh.rh :=
                                                                                    mem[29996].hh.rh
                                             Else mem[minor_tail].hh.rh := mem[29996].hh.rh;
                                             minor_tail := mem[29996].hh.rh;
                                             While mem[minor_tail].hh.rh>0 Do
                                               minor_tail := mem[minor_tail].hh.rh;
                                           End;
                                       Until l>=j;
                                       While l>j Do{917:}
                                         Begin
                                           j := reconstitute(j,hn,bchar,256)+1;
                                           mem[major_tail].hh.rh := mem[29996].hh.rh;
                                           While mem[major_tail].hh.rh>0 Do
                                             Begin
                                               major_tail := mem[major_tail].hh.rh
                                               ;
                                               r_count := r_count+1;
                                             End;
                                         End{:917};
                                     End{:916};
{918:}
                                   If r_count>127 Then
                                     Begin
                                       mem[s].hh.rh := mem[r].hh.rh;
                                       mem[r].hh.rh := 0;
                                       flush_node_list(r);
                                     End
                                   Else
                                     Begin
                                       mem[s].hh.rh := r;
                                       mem[r].hh.b1 := r_count;
                                     End;
                                   s := major_tail{:918};
                                   hyphen_passed := j-1;
                                   mem[29996].hh.rh := 0;
      Until Not odd(hyf[j-1]){:914};
  Until j>hn;
  mem[s].hh.rh := q{:913};
  flush_list(init_list){:903};
  10:
End;
{:895}{942:}{944:}
Function new_trie_op(d,n:small_number;
                     v:quarterword): quarterword;

Label 10;

Var h: -trie_op_size..trie_op_size;
  u: quarterword;
  l: 0..trie_op_size;
Begin
  h := abs(n+313*d+361*v+1009*cur_lang)Mod(trie_op_size+trie_op_size)-
       trie_op_size;
  While true Do
    Begin
      l := trie_op_hash[h];
      If l=0 Then
        Begin
          If trie_op_ptr=trie_op_size Then overflow(961,
                                                    trie_op_size);
          u := trie_used[cur_lang];
          If u=255 Then overflow(962,255);
          trie_op_ptr := trie_op_ptr+1;
          u := u+1;
          trie_used[cur_lang] := u;
          hyf_distance[trie_op_ptr] := d;
          hyf_num[trie_op_ptr] := n;
          hyf_next[trie_op_ptr] := v;
          trie_op_lang[trie_op_ptr] := cur_lang;
          trie_op_hash[h] := trie_op_ptr;
          trie_op_val[trie_op_ptr] := u;
          new_trie_op := u;
          goto 10;
        End;
      If (hyf_distance[l]=d)And(hyf_num[l]=n)And(hyf_next[l]=v)And(trie_op_lang
         [l]=cur_lang)Then
        Begin
          new_trie_op := trie_op_val[l];
          goto 10;
        End;
      If h>-trie_op_size Then h := h-1
      Else h := trie_op_size;
    End;
  10:
End;
{:944}{948:}
Function trie_node(p:trie_pointer): trie_pointer;

Label 10;

Var h: trie_pointer;
  q: trie_pointer;
Begin
  h := abs(trie_c[p]+1009*trie_o[p]+2718*trie_l[p]+3142*trie_r[p])Mod
       trie_size;
  While true Do
    Begin
      q := trie_hash[h];
      If q=0 Then
        Begin
          trie_hash[h] := p;
          trie_node := p;
          goto 10;
        End;
      If (trie_c[q]=trie_c[p])And(trie_o[q]=trie_o[p])And(trie_l[q]=trie_l[p])
         And(trie_r[q]=trie_r[p])Then
        Begin
          trie_node := q;
          goto 10;
        End;
      If h>0 Then h := h-1
      Else h := trie_size;
    End;
  10:
End;
{:948}{949:}
Function compress_trie(p:trie_pointer): trie_pointer;
Begin
  If p=0 Then compress_trie := 0
  Else
    Begin
      trie_l[p] := compress_trie(
                   trie_l[p]);
      trie_r[p] := compress_trie(trie_r[p]);
      compress_trie := trie_node(p);
    End;
End;
{:949}{953:}
Procedure first_fit(p:trie_pointer);

Label 45,40;

Var h: trie_pointer;
  z: trie_pointer;
  q: trie_pointer;
  c: ASCII_code;
  l,r: trie_pointer;
  ll: 1..256;
Begin
  c := trie_c[p];
  z := trie_min[c];
  While true Do
    Begin
      h := z-c;
{954:}
      If trie_max<h+256 Then
        Begin
          If trie_size<=h+256 Then overflow(963
                                            ,trie_size);
          Repeat
            trie_max := trie_max+1;
            trie_taken[trie_max] := false;
            trie[trie_max].rh := trie_max+1;
            trie[trie_max].lh := trie_max-1;
          Until trie_max=h+256;
        End{:954};
      If trie_taken[h]Then goto 45;
{955:}
      q := trie_r[p];
      While q>0 Do
        Begin
          If trie[h+trie_c[q]].rh=0 Then goto 45;
          q := trie_r[q];
        End;
      goto 40{:955};
      45: z := trie[z].rh;
    End;
  40:{956:}trie_taken[h] := true;
  trie_hash[p] := h;
  q := p;
  Repeat
    z := h+trie_c[q];
    l := trie[z].lh;
    r := trie[z].rh;
    trie[r].lh := l;
    trie[l].rh := r;
    trie[z].rh := 0;
    If l<256 Then
      Begin
        If z<256 Then ll := z
        Else ll := 256;
        Repeat
          trie_min[l] := r;
          l := l+1;
        Until l=ll;
      End;
    q := trie_r[q];
  Until q=0{:956};
End;{:953}{957:}
Procedure trie_pack(p:trie_pointer);

Var q: trie_pointer;
Begin
  Repeat
    q := trie_l[p];
    If (q>0)And(trie_hash[q]=0)Then
      Begin
        first_fit(q);
        trie_pack(q);
      End;
    p := trie_r[p];
  Until p=0;
End;
{:957}{959:}
Procedure trie_fix(p:trie_pointer);

Var q: trie_pointer;
  c: ASCII_code;
  z: trie_pointer;
Begin
  z := trie_hash[p];
  Repeat
    q := trie_l[p];
    c := trie_c[p];
    trie[z+c].rh := trie_hash[q];
    trie[z+c].b1 := c+0;
    trie[z+c].b0 := trie_o[p];
    If q>0 Then trie_fix(q);
    p := trie_r[p];
  Until p=0;
End;{:959}{960:}
Procedure new_patterns;

Label 30,31;

Var k,l: 0..64;
  digit_sensed: boolean;
  v: quarterword;
  p,q: trie_pointer;
  first_child: boolean;
  c: ASCII_code;
Begin
  If trie_not_ready Then
    Begin
      If eqtb[5318].int<=0 Then cur_lang := 0
      Else If eqtb[5318].int>255 Then cur_lang := 0
      Else cur_lang := eqtb[5318].
                       int;
      scan_left_brace;{961:}
      k := 0;
      hyf[0] := 0;
      digit_sensed := false;
      While true Do
        Begin
          get_x_token;
          Case cur_cmd Of
            11,12:{962:}If digit_sensed Or(cur_chr<48)Or(cur_chr>57)
                          Then
                          Begin
                            If cur_chr=46 Then cur_chr := 0
                            Else
                              Begin
                                cur_chr := eqtb[4244+
                                           cur_chr].hh.rh;
                                If cur_chr=0 Then
                                  Begin
                                    Begin
                                      If interaction=3 Then;
                                      print_nl(263);
                                      print(969);
                                    End;
                                    Begin
                                      help_ptr := 1;
                                      help_line[0] := 968;
                                    End;
                                    error;
                                  End;
                              End;
                            If k<63 Then
                              Begin
                                k := k+1;
                                hc[k] := cur_chr;
                                hyf[k] := 0;
                                digit_sensed := false;
                              End;
                          End
                   Else If k<63 Then
                          Begin
                            hyf[k] := cur_chr-48;
                            digit_sensed := true;
                          End{:962};
            10,2:
                  Begin
                    If k>0 Then{963:}
                      Begin{965:}
                        If hc[1]=0 Then hyf[0] := 0;
                        If hc[k]=0 Then hyf[k] := 0;
                        l := k;
                        v := 0;
                        While true Do
                          Begin
                            If hyf[l]<>0 Then v := new_trie_op(k-l,hyf[l],v);
                            If l>0 Then l := l-1
                            Else goto 31;
                          End;
                        31:{:965};
                        q := 0;
                        hc[0] := cur_lang;
                        While l<=k Do
                          Begin
                            c := hc[l];
                            l := l+1;
                            p := trie_l[q];
                            first_child := true;
                            While (p>0)And(c>trie_c[p]) Do
                              Begin
                                q := p;
                                p := trie_r[q];
                                first_child := false;
                              End;
                            If (p=0)Or(c<trie_c[p])Then{964:}
                              Begin
                                If trie_ptr=trie_size Then
                                  overflow(963,trie_size);
                                trie_ptr := trie_ptr+1;
                                trie_r[trie_ptr] := p;
                                p := trie_ptr;
                                trie_l[p] := 0;
                                If first_child Then trie_l[q] := p
                                Else trie_r[q] := p;
                                trie_c[p] := c;
                                trie_o[p] := 0;
                              End{:964};
                            q := p;
                          End;
                        If trie_o[q]<>0 Then
                          Begin
                            Begin
                              If interaction=3 Then;
                              print_nl(263);
                              print(970);
                            End;
                            Begin
                              help_ptr := 1;
                              help_line[0] := 968;
                            End;
                            error;
                          End;
                        trie_o[q] := v;
                      End{:963};
                    If cur_cmd=2 Then goto 30;
                    k := 0;
                    hyf[0] := 0;
                    digit_sensed := false;
                  End;
            others:
                    Begin
                      Begin
                        If interaction=3 Then;
                        print_nl(263);
                        print(967);
                      End;
                      print_esc(965);
                      Begin
                        help_ptr := 1;
                        help_line[0] := 968;
                      End;
                      error;
                    End
          End;
        End;
      30:{:961};
      If eqtb[5331].int>0 Then{1590:}
        Begin
          c := cur_lang;
          first_child := false;
          p := 0;
          Repeat
            q := p;
            p := trie_r[q];
          Until (p=0)Or(c<=trie_c[p]);
          If (p=0)Or(c<trie_c[p])Then{964:}
            Begin
              If trie_ptr=trie_size Then
                overflow(963,trie_size);
              trie_ptr := trie_ptr+1;
              trie_r[trie_ptr] := p;
              p := trie_ptr;
              trie_l[p] := 0;
              If first_child Then trie_l[q] := p
              Else trie_r[q] := p;
              trie_c[p] := c;
              trie_o[p] := 0;
            End{:964};
          q := p;{1591:}
          p := trie_l[q];
          first_child := true;
          For c:=0 To 255 Do
            If (eqtb[4244+c].hh.rh>0)Or((c=255)And first_child)
              Then
              Begin
                If p=0 Then{964:}
                  Begin
                    If trie_ptr=trie_size Then overflow(
                                                        963,trie_size);
                    trie_ptr := trie_ptr+1;
                    trie_r[trie_ptr] := p;
                    p := trie_ptr;
                    trie_l[p] := 0;
                    If first_child Then trie_l[q] := p
                    Else trie_r[q] := p;
                    trie_c[p] := c;
                    trie_o[p] := 0;
                  End{:964}
                Else trie_c[p] := c;
                trie_o[p] := eqtb[4244+c].hh.rh+0;
                q := p;
                p := trie_r[q];
                first_child := false;
              End;
          If first_child Then trie_l[q] := 0
          Else trie_r[q] := 0{:1591};
        End{:1590};
    End
  Else
    Begin
      Begin
        If interaction=3 Then;
        print_nl(263);
        print(964);
      End;
      print_esc(965);
      Begin
        help_ptr := 1;
        help_line[0] := 966;
      End;
      error;
      mem[29988].hh.rh := scan_toks(false,false);
      flush_list(def_ref);
    End;
End;{:960}{966:}
Procedure init_trie;

Var p: trie_pointer;
  j,k,t: integer;
  r,s: trie_pointer;
  h: two_halves;
Begin{952:}{945:}
  op_start[0] := -0;
  For j:=1 To 255 Do
    op_start[j] := op_start[j-1]+trie_used[j-1]-0;
  For j:=1 To trie_op_ptr Do
    trie_op_hash[j] := op_start[trie_op_lang[j]]+
                       trie_op_val[j];
  For j:=1 To trie_op_ptr Do
    While trie_op_hash[j]>j Do
      Begin
        k :=
             trie_op_hash[j];
        t := hyf_distance[k];
        hyf_distance[k] := hyf_distance[j];
        hyf_distance[j] := t;
        t := hyf_num[k];
        hyf_num[k] := hyf_num[j];
        hyf_num[j] := t;
        t := hyf_next[k];
        hyf_next[k] := hyf_next[j];
        hyf_next[j] := t;
        trie_op_hash[j] := trie_op_hash[k];
        trie_op_hash[k] := k;
      End{:945};
  For p:=0 To trie_size Do
    trie_hash[p] := 0;
  trie_r[0] := compress_trie(trie_r[0]);
  trie_l[0] := compress_trie(trie_l[0]);
  For p:=0 To trie_ptr Do
    trie_hash[p] := 0;
  For p:=0 To 255 Do
    trie_min[p] := p+1;
  trie[0].rh := 1;
  trie_max := 0{:952};
  If trie_l[0]<>0 Then
    Begin
      first_fit(trie_l[0]);
      trie_pack(trie_l[0]);
    End;
  If trie_r[0]<>0 Then{1592:}
    Begin
      If trie_l[0]=0 Then For p:=0 To 255 Do
                            trie_min[p] := p+2;
      first_fit(trie_r[0]);
      trie_pack(trie_r[0]);
      hyph_start := trie_hash[trie_r[0]];
    End{:1592};{958:}
  h.rh := 0;
  h.b0 := 0;
  h.b1 := 0;
  If trie_max=0 Then
    Begin
      For r:=0 To 256 Do
        trie[r] := h;
      trie_max := 256;
    End
  Else
    Begin
      If trie_r[0]>0 Then trie_fix(trie_r[0]);
      If trie_l[0]>0 Then trie_fix(trie_l[0]);
      r := 0;
      Repeat
        s := trie[r].rh;
        trie[r] := h;
        r := s;
      Until r>trie_max;
    End;
  trie[0].b1 := 63;{:958};
  trie_not_ready := false;
End;{:966}{:942}
Procedure line_break(d:boolean);

Label 30,31,32,33,34,35,22;

Var {862:}auto_breaking: boolean;
  prev_p: halfword;
  q,r,s,prev_s: halfword;
  f: internal_font_number;
{:862}{893:}
  j: small_number;
  c: 0..255;
{:893}
Begin
  pack_begin_line := cur_list.ml_field;
{816:}
  mem[29997].hh.rh := mem[cur_list.head_field].hh.rh;
  If (cur_list.tail_field>=hi_mem_min)Then
    Begin
      mem[cur_list.tail_field].
      hh.rh := new_penalty(10000);
      cur_list.tail_field := mem[cur_list.tail_field].hh.rh;
    End
  Else If mem[cur_list.tail_field].hh.b0<>10 Then
         Begin
           mem[cur_list.
           tail_field].hh.rh := new_penalty(10000);
           cur_list.tail_field := mem[cur_list.tail_field].hh.rh;
         End
  Else
    Begin
      mem[cur_list.tail_field].hh.b0 := 12;
      delete_glue_ref(mem[cur_list.tail_field+1].hh.lh);
      flush_node_list(mem[cur_list.tail_field+1].hh.rh);
      mem[cur_list.tail_field+1].int := 10000;
    End;
  mem[cur_list.tail_field].hh.rh := new_param_glue(14);
  last_line_fill := mem[cur_list.tail_field].hh.rh;
  init_cur_lang := cur_list.pg_field Mod 65536;
  init_l_hyf := cur_list.pg_field Div 4194304;
  init_r_hyf := (cur_list.pg_field Div 65536)Mod 64;
  pop_nest;
{:816}{827:}
  no_shrink_error_yet := true;
  If (mem[eqtb[2889].hh.rh].hh.b1<>0)And(mem[eqtb[2889].hh.rh+3].int<>0)
    Then
    Begin
      eqtb[2889].hh.rh := finite_shrink(eqtb[2889].hh.rh);
    End;
  If (mem[eqtb[2890].hh.rh].hh.b1<>0)And(mem[eqtb[2890].hh.rh+3].int<>0)
    Then
    Begin
      eqtb[2890].hh.rh := finite_shrink(eqtb[2890].hh.rh);
    End;
  q := eqtb[2889].hh.rh;
  r := eqtb[2890].hh.rh;
  background[1] := mem[q+1].int+mem[r+1].int;
  background[2] := 0;
  background[3] := 0;
  background[4] := 0;
  background[5] := 0;
  background[2+mem[q].hh.b0] := mem[q+2].int;
  background[2+mem[r].hh.b0] := background[2+mem[r].hh.b0]+mem[r+2].int;
  background[6] := mem[q+3].int+mem[r+3].int;{1578:}
  do_last_line_fit := false;
  active_node_size := 3;
  If eqtb[5329].int>0 Then
    Begin
      q := mem[last_line_fill+1].hh.lh;
      If (mem[q+2].int>0)And(mem[q].hh.b0>0)Then If (background[3]=0)And(
                                                    background[4]=0)And(background[5]=0)Then
                                                   Begin
                                                     do_last_line_fit := true;
                                                     active_node_size := 5;
                                                     fill_width[0] := 0;
                                                     fill_width[1] := 0;
                                                     fill_width[2] := 0;
                                                     fill_width[mem[q].hh.b0-1] := mem[q+2].int;
                                                   End;
    End{:1578};
{:827}{834:}
  minimum_demerits := 1073741823;
  minimal_demerits[3] := 1073741823;
  minimal_demerits[2] := 1073741823;
  minimal_demerits[1] := 1073741823;
  minimal_demerits[0] := 1073741823;
{:834}{848:}
  If eqtb[3412].hh.rh=0 Then If eqtb[5862].int=0 Then
                               Begin
                                 last_special_line := 0;
                                 second_width := eqtb[5848].int;
                                 second_indent := 0;
                               End
  Else{849:}
    Begin
      last_special_line := abs(eqtb[5309].int);
      If eqtb[5309].int<0 Then
        Begin
          first_width := eqtb[5848].int-abs(eqtb[5862
                         ].int);
          If eqtb[5862].int>=0 Then first_indent := eqtb[5862].int
          Else first_indent
            := 0;
          second_width := eqtb[5848].int;
          second_indent := 0;
        End
      Else
        Begin
          first_width := eqtb[5848].int;
          first_indent := 0;
          second_width := eqtb[5848].int-abs(eqtb[5862].int);
          If eqtb[5862].int>=0 Then second_indent := eqtb[5862].int
          Else
            second_indent := 0;
        End;
    End{:849}
  Else
    Begin
      last_special_line := mem[eqtb[3412].hh.rh].hh.lh-1;
      second_width := mem[eqtb[3412].hh.rh+2*(last_special_line+1)].int;
      second_indent := mem[eqtb[3412].hh.rh+2*last_special_line+1].int;
    End;
  If eqtb[5287].int=0 Then easy_line := last_special_line
  Else easy_line :=
                    65535{:848};{863:}
  threshold := eqtb[5268].int;
  If threshold>=0 Then
    Begin{if eqtb[5300].int>0 then begin
begin_diagnostic;print_nl(945);end;}
      second_pass := false;
      final_pass := false;
    End
  Else
    Begin
      threshold := eqtb[5269].int;
      second_pass := true;
      final_pass := (eqtb[5865].int<=0);
{if eqtb[5300].int>0 then begin_diagnostic;}
    End;
  While true Do
    Begin
      If threshold>10000 Then threshold := 10000;
      If second_pass Then{891:}
        Begin
          If trie_not_ready Then init_trie;
          cur_lang := init_cur_lang;
          l_hyf := init_l_hyf;
          r_hyf := init_r_hyf;
          If trie[hyph_start+cur_lang].b1<>cur_lang+0 Then hyph_index := 0
          Else
            hyph_index := trie[hyph_start+cur_lang].rh;
        End{:891};
{864:}
      q := get_node(active_node_size);
      mem[q].hh.b0 := 0;
      mem[q].hh.b1 := 2;
      mem[q].hh.rh := 29993;
      mem[q+1].hh.rh := 0;
      mem[q+1].hh.lh := cur_list.pg_field+1;
      mem[q+2].int := 0;
      mem[29993].hh.rh := q;
      If do_last_line_fit Then{1580:}
        Begin
          mem[q+3].int := 0;
          mem[q+4].int := 0;
        End{:1580};
      active_width[1] := background[1];
      active_width[2] := background[2];
      active_width[3] := background[3];
      active_width[4] := background[4];
      active_width[5] := background[5];
      active_width[6] := background[6];
      passive := 0;
      printed_node := 29997;
      pass_number := 0;
      font_in_short_display := 0{:864};
      cur_p := mem[29997].hh.rh;
      auto_breaking := true;
      prev_p := cur_p;
      While (cur_p<>0)And(mem[29993].hh.rh<>29993) Do{866:}
        Begin
          If (cur_p>=
             hi_mem_min)Then{867:}
            Begin
              prev_p := cur_p;
              Repeat
                f := mem[cur_p].hh.b0;
                active_width[1] := active_width[1]+font_info[width_base[f]+font_info[
                                   char_base[f]+mem[cur_p].hh.b1].qqqq.b0].int;
                cur_p := mem[cur_p].hh.rh;
              Until Not(cur_p>=hi_mem_min);
            End{:867};
          Case mem[cur_p].hh.b0 Of
            0,1,2: active_width[1] := active_width[1]+mem[
                                      cur_p+1].int;
            8:{1362:}If mem[cur_p].hh.b1=4 Then
                       Begin
                         cur_lang := mem[cur_p+1].hh.rh;
                         l_hyf := mem[cur_p+1].hh.b0;
                         r_hyf := mem[cur_p+1].hh.b1;
                         If trie[hyph_start+cur_lang].b1<>cur_lang+0 Then hyph_index := 0
                         Else
                           hyph_index := trie[hyph_start+cur_lang].rh;
                       End{:1362};
            10:
                Begin{868:}
                  If auto_breaking Then
                    Begin
                      If (prev_p>=hi_mem_min)Then
                        try_break(0,0)
                      Else If (mem[prev_p].hh.b0<9)Then try_break(0,0)
                      Else If (mem
                              [prev_p].hh.b0=11)And(mem[prev_p].hh.b1<>1)Then try_break(0,0);
                    End;
                  If (mem[mem[cur_p+1].hh.lh].hh.b1<>0)And(mem[mem[cur_p+1].hh.lh+3].int<>0
                     )Then
                    Begin
                      mem[cur_p+1].hh.lh := finite_shrink(mem[cur_p+1].hh.lh);
                    End;
                  q := mem[cur_p+1].hh.lh;
                  active_width[1] := active_width[1]+mem[q+1].int;
                  active_width[2+mem[q].hh.b0] := active_width[2+mem[q].hh.b0]+mem[q+2].int;
                  active_width[6] := active_width[6]+mem[q+3].int{:868};
                  If second_pass And auto_breaking Then{894:}
                    Begin
                      prev_s := cur_p;
                      s := mem[prev_s].hh.rh;
                      If s<>0 Then
                        Begin{896:}
                          While true Do
                            Begin
                              If (s>=hi_mem_min)Then
                                Begin
                                  c := mem[s].hh.b1-0;
                                  hf := mem[s].hh.b0;
                                End
                              Else If mem[s].hh.b0=6 Then If mem[s+1].hh.rh=0 Then goto 22
                              Else
                                Begin
                                  q := mem[s+1].hh.rh;
                                  c := mem[q].hh.b1-0;
                                  hf := mem[q].hh.b0;
                                End
                              Else If (mem[s].hh.b0=11)And(mem[s].hh.b1=0)Then goto 22
                              Else If (mem[
                                      s].hh.b0=9)And(mem[s].hh.b1>=4)Then goto 22
                              Else If mem[s].hh.b0=8 Then
                                     Begin{1363:}
                                       If mem[s].hh.b1=4 Then
                                         Begin
                                           cur_lang := mem[s+1].hh.rh;
                                           l_hyf := mem[s+1].hh.b0;
                                           r_hyf := mem[s+1].hh.b1;
                                           If trie[hyph_start+cur_lang].b1<>cur_lang+0 Then
                                             hyph_index := 0
                                           Else
                                             hyph_index := trie[hyph_start+cur_lang].rh;
                                         End{:1363};
                                       goto 22;
                                     End
                              Else goto 31;
                              If hyph_index=0 Then hc[0] := eqtb[4244+c].hh.rh
                              Else If trie[hyph_index+c
                                      ].b1<>c+0 Then hc[0] := 0
                              Else hc[0] := trie[hyph_index+c].b0-0;
                              If hc[0]<>0 Then If (hc[0]=c)Or(eqtb[5306].int>0)Then goto 32
                              Else goto
                                31;
                              22: prev_s := s;
                              s := mem[prev_s].hh.rh;
                            End;
                          32: hyf_char := hyphen_char[hf];
                          If hyf_char<0 Then goto 31;
                          If hyf_char>255 Then goto 31;
                          ha := prev_s{:896};
                          If l_hyf+r_hyf>63 Then goto 31;{897:}
                          hn := 0;
                          While true Do
                            Begin
                              If (s>=hi_mem_min)Then
                                Begin
                                  If mem[s].hh.b0<>hf Then
                                    goto 33;
                                  hyf_bchar := mem[s].hh.b1;
                                  c := hyf_bchar-0;
                                  If hyph_index=0 Then hc[0] := eqtb[4244+c].hh.rh
                                  Else If trie[hyph_index+c
                                          ].b1<>c+0 Then hc[0] := 0
                                  Else hc[0] := trie[hyph_index+c].b0-0;
                                  If hc[0]=0 Then goto 33;
                                  If hn=63 Then goto 33;
                                  hb := s;
                                  hn := hn+1;
                                  hu[hn] := c;
                                  hc[hn] := hc[0];
                                  hyf_bchar := 256;
                                End
                              Else If mem[s].hh.b0=6 Then{898:}
                                     Begin
                                       If mem[s+1].hh.b0<>hf Then
                                         goto 33;
                                       j := hn;
                                       q := mem[s+1].hh.rh;
                                       If q>0 Then hyf_bchar := mem[q].hh.b1;
                                       While q>0 Do
                                         Begin
                                           c := mem[q].hh.b1-0;
                                           If hyph_index=0 Then hc[0] := eqtb[4244+c].hh.rh
                                           Else If trie[hyph_index+c
                                                   ].b1<>c+0 Then hc[0] := 0
                                           Else hc[0] := trie[hyph_index+c].b0-0;
                                           If hc[0]=0 Then goto 33;
                                           If j=63 Then goto 33;
                                           j := j+1;
                                           hu[j] := c;
                                           hc[j] := hc[0];
                                           q := mem[q].hh.rh;
                                         End;
                                       hb := s;
                                       hn := j;
                                       If odd(mem[s].hh.b1)Then hyf_bchar := font_bchar[hf]
                                       Else hyf_bchar := 256;
                                     End{:898}
                              Else If (mem[s].hh.b0=11)And(mem[s].hh.b1=0)Then
                                     Begin
                                       hb := s;
                                       hyf_bchar := font_bchar[hf];
                                     End
                              Else goto 33;
                              s := mem[s].hh.rh;
                            End;
                          33:{:897};{899:}
                          If hn<l_hyf+r_hyf Then goto 31;
                          While true Do
                            Begin
                              If Not((s>=hi_mem_min))Then Case mem[s].hh.b0 Of
                                                            6:;
                                                            11: If mem[s].hh.b1<>0 Then goto 34;
                                                            8,10,12,3,5,4: goto 34;
                                                            9: If mem[s].hh.b1>=4 Then goto 34
                                                               Else goto 31;
                                                            others: goto 31
                                End;
                              s := mem[s].hh.rh;
                            End;
                          34:{:899};
                          hyphenate;
                        End;
                      31:
                    End{:894};
                End;
            11: If mem[cur_p].hh.b1=1 Then
                  Begin
                    If Not(mem[cur_p].hh.rh>=hi_mem_min)
                       And auto_breaking Then If mem[mem[cur_p].hh.rh].hh.b0=10 Then try_break(
                                                                                               0,0);
                    active_width[1] := active_width[1]+mem[cur_p+1].int;
                  End
                Else active_width[1] := active_width[1]+mem[cur_p+1].int;
            6:
               Begin
                 f := mem[cur_p+1].hh.b0;
                 active_width[1] := active_width[1]+font_info[width_base[f]+font_info[
                                    char_base[f]+mem[cur_p+1].hh.b1].qqqq.b0].int;
               End;
            7:{869:}
               Begin
                 s := mem[cur_p+1].hh.lh;
                 disc_width := 0;
                 If s=0 Then try_break(eqtb[5272].int,1)
                 Else
                   Begin
                     Repeat{870:}
                       If (s>=
                          hi_mem_min)Then
                         Begin
                           f := mem[s].hh.b0;
                           disc_width := disc_width+font_info[width_base[f]+font_info[char_base[f]+
                                         mem[s].hh.b1].qqqq.b0].int;
                         End
                       Else Case mem[s].hh.b0 Of
                              6:
                                 Begin
                                   f := mem[s+1].hh.b0;
                                   disc_width := disc_width+font_info[width_base[f]+font_info[
                                                 char_base[f]+
                                                 mem[s+1].hh.b1].qqqq.b0].int;
                                 End;
                              0,1,2,11: disc_width := disc_width+mem[s+1].int;
                              others: confusion(949)
                         End{:870};
                       s := mem[s].hh.rh;
                     Until s=0;
                     active_width[1] := active_width[1]+disc_width;
                     try_break(eqtb[5271].int,1);
                     active_width[1] := active_width[1]-disc_width;
                   End;
                 r := mem[cur_p].hh.b1;
                 s := mem[cur_p].hh.rh;
                 While r>0 Do
                   Begin{871:}
                     If (s>=hi_mem_min)Then
                       Begin
                         f := mem[s].hh.b0;
                         active_width[1] := active_width[1]+font_info[width_base[f]+font_info[
                                            char_base[f]+mem[s].hh.b1].qqqq.b0].int;
                       End
                     Else Case mem[s].hh.b0 Of
                            6:
                               Begin
                                 f := mem[s+1].hh.b0;
                                 active_width[1] := active_width[1]+font_info[width_base[f]+
                                                    font_info[
                                                    char_base[f]+mem[s+1].hh.b1].qqqq.b0].int;
                               End;
                            0,1,2,11: active_width[1] := active_width[1]+mem[s+1].int;
                            others: confusion(950)
                       End{:871};
                     r := r-1;
                     s := mem[s].hh.rh;
                   End;
                 prev_p := cur_p;
                 cur_p := s;
                 goto 35;
               End{:869};
            9:
               Begin
                 If mem[cur_p].hh.b1<4 Then auto_breaking := odd(mem[cur_p].hh.b1);
                 Begin
                   If Not(mem[cur_p].hh.rh>=hi_mem_min)And auto_breaking Then If mem[
                                                                                 mem[cur_p].hh.rh].
                                                                                 hh.b0=10 Then
                                                                                try_break(0,0);
                   active_width[1] := active_width[1]+mem[cur_p+1].int;
                 End;
               End;
            12: try_break(mem[cur_p+1].int,0);
            4,3,5:;
            others: confusion(948)
          End;
          prev_p := cur_p;
          cur_p := mem[cur_p].hh.rh;
          35:
        End{:866};
      If cur_p=0 Then{873:}
        Begin
          try_break(-10000,1);
          If mem[29993].hh.rh<>29993 Then
            Begin{874:}
              r := mem[29993].hh.rh;
              fewest_demerits := 1073741823;
              Repeat
                If mem[r].hh.b0<>2 Then If mem[r+2].int<fewest_demerits Then
                                          Begin
                                            fewest_demerits := mem[r+2].int;
                                            best_bet := r;
                                          End;
                r := mem[r].hh.rh;
              Until r=29993;
              best_line := mem[best_bet+1].hh.lh{:874};
              If eqtb[5287].int=0 Then goto 30;{875:}
              Begin
                r := mem[29993].hh.rh;
                actual_looseness := 0;
                Repeat
                  If mem[r].hh.b0<>2 Then
                    Begin
                      line_diff := mem[r+1].hh.lh-best_line
                      ;
                      If ((line_diff<actual_looseness)And(eqtb[5287].int<=line_diff))Or((
                         line_diff>actual_looseness)And(eqtb[5287].int>=line_diff))Then
                        Begin
                          best_bet := r;
                          actual_looseness := line_diff;
                          fewest_demerits := mem[r+2].int;
                        End
                      Else If (line_diff=actual_looseness)And(mem[r+2].int<fewest_demerits)
                             Then
                             Begin
                               best_bet := r;
                               fewest_demerits := mem[r+2].int;
                             End;
                    End;
                  r := mem[r].hh.rh;
                Until r=29993;
                best_line := mem[best_bet+1].hh.lh;
              End{:875};
              If (actual_looseness=eqtb[5287].int)Or final_pass Then goto 30;
            End;
        End{:873};{865:}
      q := mem[29993].hh.rh;
      While q<>29993 Do
        Begin
          cur_p := mem[q].hh.rh;
          If mem[q].hh.b0=2 Then free_node(q,7)
          Else free_node(q,active_node_size);
          q := cur_p;
        End;
      q := passive;
      While q<>0 Do
        Begin
          cur_p := mem[q].hh.rh;
          free_node(q,2);
          q := cur_p;
        End{:865};
      If Not second_pass Then
        Begin{if eqtb[5300].int>0 then print_nl(946);}
          threshold := eqtb[5269].int;
          second_pass := true;
          final_pass := (eqtb[5865].int<=0);
        End
      Else
        Begin{if eqtb[5300].int>0 then print_nl(947);}
          background[2] := background[2]+eqtb[5865].int;
          final_pass := true;
        End;
    End;
  30:{if eqtb[5300].int>0 then begin end_diagnostic(true);
normalize_selector;end;}
      If do_last_line_fit Then{1588:}If mem[best_bet+3].int=0 Then
                                       do_last_line_fit := false
      Else
        Begin
          q := new_spec(mem[last_line_fill+1].hh.
               lh);
          delete_glue_ref(mem[last_line_fill+1].hh.lh);
          mem[q+1].int := mem[q+1].int+mem[best_bet+3].int-mem[best_bet+4].int;
          mem[q+2].int := 0;
          mem[last_line_fill+1].hh.lh := q;
        End{:1588};{:863};
{876:}
  post_line_break(d){:876};{865:}
  q := mem[29993].hh.rh;
  While q<>29993 Do
    Begin
      cur_p := mem[q].hh.rh;
      If mem[q].hh.b0=2 Then free_node(q,7)
      Else free_node(q,active_node_size);
      q := cur_p;
    End;
  q := passive;
  While q<>0 Do
    Begin
      cur_p := mem[q].hh.rh;
      free_node(q,2);
      q := cur_p;
    End{:865};
  pack_begin_line := 0;
End;
{1387:}
Function eTeX_enabled(b:boolean;j:quarterword;
                      k:halfword): boolean;
Begin
  If Not b Then
    Begin
      Begin
        If interaction=3 Then;
        print_nl(263);
        print(689);
      End;
      print_cmd_chr(j,k);
      Begin
        help_ptr := 1;
        help_line[0] := 1317;
      End;
      error;
    End;
  eTeX_enabled := b;
End;
{:1387}{1410:}
Procedure show_save_groups;

Label 41,42,40,30;

Var p: 0..nest_size;
  m: -203..203;
  v: save_pointer;
  l: quarterword;
  c: group_code;
  a: -1..1;
  i: integer;
  j: quarterword;
  s: str_number;
Begin
  p := nest_ptr;
  nest[p] := cur_list;
  v := save_ptr;
  l := cur_level;
  c := cur_group;
  save_ptr := cur_boundary;
  cur_level := cur_level-1;
  a := 1;
  print_nl(339);
  print_ln;
  While true Do
    Begin
      print_nl(366);
      print_group(true);
      If cur_group=0 Then goto 30;
      Repeat
        m := nest[p].mode_field;
        If p>0 Then p := p-1
        Else m := 1;
      Until m<>102;
      print(287);
      Case cur_group Of
        1:
           Begin
             p := p+1;
             goto 42;
           End;
        2,3: s := 1072;
        4: s := 979;
        5: s := 1071;
        6: If a=0 Then
             Begin
               If m=-1 Then s := 523
               Else s := 542;
               a := 1;
               goto 41;
             End
           Else
             Begin
               If a=1 Then print(1354)
               Else print_esc(911);
               If p>=a Then p := p-a;
               a := 0;
               goto 40;
             End;
        7:
           Begin
             p := p+1;
             a := -1;
             print_esc(530);
             goto 42;
           End;
        8:
           Begin
             print_esc(401);
             goto 40;
           End;
        9: goto 42;
        10,13:
               Begin
                 If cur_group=10 Then print_esc(352)
                 Else print_esc(528);
                 For i:=1 To 3 Do
                   If i<=save_stack[save_ptr-2].int Then print(871);
                 goto 42;
               End;
        11:
            Begin
              If save_stack[save_ptr-2].int=255 Then print_esc(355)
              Else
                Begin
                  print_esc(331);
                  print_int(save_stack[save_ptr-2].int);
                End;
              goto 42;
            End;
        12:
            Begin
              s := 543;
              goto 41;
            End;
        14:
            Begin
              p := p+1;
              print_esc(515);
              goto 40;
            End;
        15:
            Begin
              If m=203 Then print_char(36)
              Else If nest[p].mode_field=203 Then
                     Begin
                       print_cmd_chr(48,save_stack[save_ptr-2].int);
                       goto 40;
                     End;
              print_char(36);
              goto 40;
            End;
        16:
            Begin
              If mem[nest[p+1].eTeX_aux_field].hh.b0=30 Then print_esc(887)
              Else print_esc(889);
              goto 40;
            End;
      End;
{1412:}
      i := save_stack[save_ptr-4].int;
      If i<>0 Then If i<1073741824 Then
                     Begin
                       If abs(nest[p].mode_field)=1
                         Then j := 21
                       Else j := 22;
                       If i>0 Then print_cmd_chr(j,0)
                       Else print_cmd_chr(j,1);
                       print_scaled(abs(i));
                       print(400);
                     End
      Else If i<1073807360 Then
             Begin
               If i>=1073774592 Then
                 Begin
                   print_esc(1186);
                   i := i-(32768);
                 End;
               print_esc(540);
               print_int(i-1073741824);
               print_char(61);
             End
      Else print_cmd_chr(31,i-(1073807261)){:1412};
      41: print_esc(s);
{1411:}
      If save_stack[save_ptr-2].int<>0 Then
        Begin
          print_char(32);
          If save_stack[save_ptr-3].int=0 Then print(853)
          Else print(854);
          print_scaled(save_stack[save_ptr-2].int);
          print(400);
        End{:1411};
      42: print_char(123);
      40: print_char(41);
      cur_level := cur_level-1;
      cur_group := save_stack[save_ptr].hh.b1;
      save_ptr := save_stack[save_ptr].hh.rh
    End;
  30: save_ptr := v;
  cur_level := l;
  cur_group := c;
End;{:1410}{1426:}
Procedure new_interaction;
forward;
{:1426}{:815}{934:}
Procedure new_hyph_exceptions;

Label 21,10,40,45,46;

Var n: 0..64;
  j: 0..64;
  h: hyph_pointer;
  k: str_number;
  p: halfword;
  q: halfword;
  s,t: str_number;
  u,v: pool_pointer;
Begin
  scan_left_brace;
  If eqtb[5318].int<=0 Then cur_lang := 0
  Else If eqtb[5318].int>255 Then
         cur_lang := 0
  Else cur_lang := eqtb[5318].int;
  If trie_not_ready Then
    Begin
      hyph_index := 0;
      goto 46;
    End;
  If trie[hyph_start+cur_lang].b1<>cur_lang+0 Then hyph_index := 0
  Else
    hyph_index := trie[hyph_start+cur_lang].rh;
  46:{935:}n := 0;
  p := 0;
  While true Do
    Begin
      get_x_token;
      21: Case cur_cmd Of
            11,12,68:{937:}If cur_chr=45 Then{938:}
                             Begin
                               If n<63
                                 Then
                                 Begin
                                   q := get_avail;
                                   mem[q].hh.rh := p;
                                   mem[q].hh.lh := n;
                                   p := q;
                                 End;
                             End{:938}
                      Else
                        Begin
                          If hyph_index=0 Then hc[0] := eqtb[4244+cur_chr].hh.rh
                          Else If trie[hyph_index+cur_chr].b1<>cur_chr+0 Then hc[0] := 0
                          Else hc[0]
                            := trie[hyph_index+cur_chr].b0-0;
                          If hc[0]=0 Then
                            Begin
                              Begin
                                If interaction=3 Then;
                                print_nl(263);
                                print(957);
                              End;
                              Begin
                                help_ptr := 2;
                                help_line[1] := 958;
                                help_line[0] := 959;
                              End;
                              error;
                            End
                          Else If n<63 Then
                                 Begin
                                   n := n+1;
                                   hc[n] := hc[0];
                                 End;
                        End{:937};
            16:
                Begin
                  scan_char_num;
                  cur_chr := cur_val;
                  cur_cmd := 68;
                  goto 21;
                End;
            10,2:
                  Begin
                    If n>1 Then{939:}
                      Begin
                        n := n+1;
                        hc[n] := cur_lang;
                        Begin
                          If pool_ptr+n>pool_size Then overflow(258,pool_size-init_pool_ptr)
                          ;
                        End;
                        h := 0;
                        For j:=1 To n Do
                          Begin
                            h := (h+h+hc[j])Mod 307;
                            Begin
                              str_pool[pool_ptr] := hc[j];
                              pool_ptr := pool_ptr+1;
                            End;
                          End;
                        s := make_string;{940:}
                        If hyph_count=307 Then overflow(960,307);
                        hyph_count := hyph_count+1;
                        While hyph_word[h]<>0 Do
                          Begin{941:}
                            k := hyph_word[h];
                            If (str_start[k+1]-str_start[k])<(str_start[s+1]-str_start[s])Then goto
                              40;
                            If (str_start[k+1]-str_start[k])>(str_start[s+1]-str_start[s])Then goto
                              45;
                            u := str_start[k];
                            v := str_start[s];
                            Repeat
                              If str_pool[u]<str_pool[v]Then goto 40;
                              If str_pool[u]>str_pool[v]Then goto 45;
                              u := u+1;
                              v := v+1;
                            Until u=str_start[k+1];
                            40: q := hyph_list[h];
                            hyph_list[h] := p;
                            p := q;
                            t := hyph_word[h];
                            hyph_word[h] := s;
                            s := t;
                            45:{:941};
                            If h>0 Then h := h-1
                            Else h := 307;
                          End;
                        hyph_word[h] := s;
                        hyph_list[h] := p{:940};
                      End{:939};
                    If cur_cmd=2 Then goto 10;
                    n := 0;
                    p := 0;
                  End;
            others:{936:}
                    Begin
                      Begin
                        If interaction=3 Then;
                        print_nl(263);
                        print(689);
                      End;
                      print_esc(953);
                      print(954);
                      Begin
                        help_ptr := 2;
                        help_line[1] := 955;
                        help_line[0] := 956;
                      End;
                      error;
                    End{:936}
          End;
    End{:935};
  10:
End;
{:934}{968:}
Function prune_page_top(p:halfword;s:boolean): halfword;

Var prev_p: halfword;
  q,r: halfword;
Begin
  prev_p := 29997;
  mem[29997].hh.rh := p;
  While p<>0 Do
    Case mem[p].hh.b0 Of
      0,1,2:{969:}
             Begin
               q := new_skip_param(
                    10);
               mem[prev_p].hh.rh := q;
               mem[q].hh.rh := p;
               If mem[temp_ptr+1].int>mem[p+3].int Then mem[temp_ptr+1].int := mem[
                                                                               temp_ptr+1].int-mem[p
                                                                               +3].int
               Else mem[temp_ptr+1].int := 0;
               p := 0;
             End{:969};
      8,4,3:
             Begin
               prev_p := p;
               p := mem[prev_p].hh.rh;
             End;
      10,11,12:
                Begin
                  q := p;
                  p := mem[q].hh.rh;
                  mem[q].hh.rh := 0;
                  mem[prev_p].hh.rh := p;
                  If s Then
                    Begin
                      If disc_ptr[3]=0 Then disc_ptr[3] := q
                      Else mem[r].hh.rh :=
                                           q;
                      r := q;
                    End
                  Else flush_node_list(q);
                End;
      others: confusion(971)
    End;
  prune_page_top := mem[29997].hh.rh;
End;
{:968}{970:}
Function vert_break(p:halfword;h,d:scaled): halfword;

Label 30,45,90;

Var prev_p: halfword;
  q,r: halfword;
  pi: integer;
  b: integer;
  least_cost: integer;
  best_place: halfword;
  prev_dp: scaled;
  t: small_number;
Begin
  prev_p := p;
  least_cost := 1073741823;
  active_width[1] := 0;
  active_width[2] := 0;
  active_width[3] := 0;
  active_width[4] := 0;
  active_width[5] := 0;
  active_width[6] := 0;
  prev_dp := 0;
  While true Do
    Begin{972:}
      If p=0 Then pi := -10000
      Else{973:}Case mem[p].hh
                     .b0 Of
                  0,1,2:
                         Begin
                           active_width[1] := active_width[1]+prev_dp+mem[p+3].int
                           ;
                           prev_dp := mem[p+2].int;
                           goto 45;
                         End;
                  8:{1365:}goto 45{:1365};
                  10: If (mem[prev_p].hh.b0<9)Then pi := 0
                      Else goto 90;
                  11:
                      Begin
                        If mem[p].hh.rh=0 Then t := 12
                        Else t := mem[mem[p].hh.rh].hh.b0;
                        If t=10 Then pi := 0
                        Else goto 90;
                      End;
                  12: pi := mem[p+1].int;
                  4,3: goto 45;
                  others: confusion(972)
        End{:973};
{974:}
      If pi<10000 Then
        Begin{975:}
          If active_width[1]<h Then If (
                                       active_width[3]<>0)Or(active_width[4]<>0)Or(active_width[5]<>
                                       0)Then b := 0
          Else b := badness(h-active_width[1],active_width[2])
          Else If active_width[1
                  ]-h>active_width[6]Then b := 1073741823
          Else b := badness(active_width[1]-h,
                    active_width[6]){:975};
          If b<1073741823 Then If pi<=-10000 Then b := pi
          Else If b<10000 Then b := b+
                                    pi
          Else b := 100000;
          If b<=least_cost Then
            Begin
              best_place := p;
              least_cost := b;
              best_height_plus_depth := active_width[1]+prev_dp;
            End;
          If (b=1073741823)Or(pi<=-10000)Then goto 30;
        End{:974};
      If (mem[p].hh.b0<10)Or(mem[p].hh.b0>11)Then goto 45;
      90:{976:}If mem[p].hh.b0=11 Then q := p
          Else
            Begin
              q := mem[p+1].hh.lh;
              active_width[2+mem[q].hh.b0] := active_width[2+mem[q].hh.b0]+mem[q+2].int;
              active_width[6] := active_width[6]+mem[q+3].int;
              If (mem[q].hh.b1<>0)And(mem[q+3].int<>0)Then
                Begin
                  Begin
                    If interaction=3
                      Then;
                    print_nl(263);
                    print(973);
                  End;
                  Begin
                    help_ptr := 4;
                    help_line[3] := 974;
                    help_line[2] := 975;
                    help_line[1] := 976;
                    help_line[0] := 934;
                  End;
                  error;
                  r := new_spec(q);
                  mem[r].hh.b1 := 0;
                  delete_glue_ref(q);
                  mem[p+1].hh.lh := r;
                  q := r;
                End;
            End;
      active_width[1] := active_width[1]+prev_dp+mem[q+1].int;
      prev_dp := 0{:976};
      45: If prev_dp>d Then
            Begin
              active_width[1] := active_width[1]+prev_dp-d;
              prev_dp := d;
            End;{:972};
      prev_p := p;
      p := mem[prev_p].hh.rh;
    End;
  30: vert_break := best_place;
End;
{:970}{977:}{1560:}
Function do_marks(a,l:small_number;
                  q:halfword): boolean;

Var i: small_number;
Begin
  If l<4 Then
    Begin
      For i:=0 To 15 Do
        Begin
          If odd(i)Then cur_ptr :=
                                   mem[q+(i Div 2)+1].hh.rh
          Else cur_ptr := mem[q+(i Div 2)+1].hh.lh;
          If cur_ptr<>0 Then If do_marks(a,l+1,cur_ptr)Then
                               Begin
                                 If odd(i)Then
                                   mem[q+(i Div 2)+1].hh.rh := 0
                                 Else mem[q+(i Div 2)+1].hh.lh := 0;
                                 mem[q].hh.b1 := mem[q].hh.b1-1;
                               End;
        End;
      If mem[q].hh.b1=0 Then
        Begin
          free_node(q,9);
          q := 0;
        End;
    End
  Else
    Begin
      Case a Of {1561:}
        0: If mem[q+2].hh.rh<>0 Then
             Begin
               delete_token_ref(mem[q+2].hh.rh);
               mem[q+2].hh.rh := 0;
               delete_token_ref(mem[q+3].hh.lh);
               mem[q+3].hh.lh := 0;
             End;
{:1561}{1563:}
        1: If mem[q+2].hh.lh<>0 Then
             Begin
               If mem[q+1].hh.lh<>0
                 Then delete_token_ref(mem[q+1].hh.lh);
               delete_token_ref(mem[q+1].hh.rh);
               mem[q+1].hh.rh := 0;
               If mem[mem[q+2].hh.lh].hh.rh=0 Then
                 Begin
                   delete_token_ref(mem[q+2].hh.
                                    lh);
                   mem[q+2].hh.lh := 0;
                 End
               Else mem[mem[q+2].hh.lh].hh.lh := mem[mem[q+2].hh.lh].hh.lh+1;
               mem[q+1].hh.lh := mem[q+2].hh.lh;
             End;
{:1563}{1564:}
        2: If (mem[q+1].hh.lh<>0)And(mem[q+1].hh.rh=0)Then
             Begin
               mem
               [q+1].hh.rh := mem[q+1].hh.lh;
               mem[mem[q+1].hh.lh].hh.lh := mem[mem[q+1].hh.lh].hh.lh+1;
             End;
{:1564}{1566:}
        3: For i:=0 To 4 Do
             Begin
               If odd(i)Then cur_ptr := mem[q+(i
                                        Div 2)+1].hh.rh
               Else cur_ptr := mem[q+(i Div 2)+1].hh.lh;
               If cur_ptr<>0 Then
                 Begin
                   delete_token_ref(cur_ptr);
                   If odd(i)Then mem[q+(i Div 2)+1].hh.rh := 0
                   Else mem[q+(i Div 2)+1].hh.lh
                     := 0;
                 End;
             End;{:1566}
      End;
      If mem[q+2].hh.lh=0 Then If mem[q+3].hh.lh=0 Then
                                 Begin
                                   free_node(q,4);
                                   q := 0;
                                 End;
    End;
  do_marks := (q=0);
End;{:1560}
Function vsplit(n:halfword;
                h:scaled): halfword;

Label 10,30;

Var v: halfword;
  p: halfword;
  q: halfword;
Begin
  cur_val := n;
  If cur_val<256 Then v := eqtb[3683+cur_val].hh.rh
  Else
    Begin
      find_sa_element(4,cur_val,false);
      If cur_ptr=0 Then v := 0
      Else v := mem[cur_ptr+1].hh.rh;
    End;
  flush_node_list(disc_ptr[3]);
  disc_ptr[3] := 0;
  If sa_root[6]<>0 Then If do_marks(0,0,sa_root[6])Then sa_root[6] := 0;
  If cur_mark[3]<>0 Then
    Begin
      delete_token_ref(cur_mark[3]);
      cur_mark[3] := 0;
      delete_token_ref(cur_mark[4]);
      cur_mark[4] := 0;
    End;
{978:}
  If v=0 Then
    Begin
      vsplit := 0;
      goto 10;
    End;
  If mem[v].hh.b0<>1 Then
    Begin
      Begin
        If interaction=3 Then;
        print_nl(263);
        print(339);
      End;
      print_esc(977);
      print(978);
      print_esc(979);
      Begin
        help_ptr := 2;
        help_line[1] := 980;
        help_line[0] := 981;
      End;
      error;
      vsplit := 0;
      goto 10;
    End{:978};
  q := vert_break(mem[v+5].hh.rh,h,eqtb[5851].int);{979:}
  p := mem[v+5].hh.rh;
  If p=q Then mem[v+5].hh.rh := 0
  Else While true Do
         Begin
           If mem[p].hh.b0=4
             Then If mem[p+1].hh.lh<>0 Then{1562:}
                    Begin
                      find_sa_element(6,mem[p+1].hh
                                      .lh,true);
                      If mem[cur_ptr+2].hh.rh=0 Then
                        Begin
                          mem[cur_ptr+2].hh.rh := mem[p+1].hh.
                                                  rh;
                          mem[mem[p+1].hh.rh].hh.lh := mem[mem[p+1].hh.rh].hh.lh+1;
                        End
                      Else delete_token_ref(mem[cur_ptr+3].hh.lh);
                      mem[cur_ptr+3].hh.lh := mem[p+1].hh.rh;
                      mem[mem[p+1].hh.rh].hh.lh := mem[mem[p+1].hh.rh].hh.lh+1;
                    End{:1562}
           Else If cur_mark[3]=0 Then
                  Begin
                    cur_mark[3] := mem[p+1].hh.rh;
                    cur_mark[4] := cur_mark[3];
                    mem[cur_mark[3]].hh.lh := mem[cur_mark[3]].hh.lh+2;
                  End
           Else
             Begin
               delete_token_ref(cur_mark[4]);
               cur_mark[4] := mem[p+1].hh.rh;
               mem[cur_mark[4]].hh.lh := mem[cur_mark[4]].hh.lh+1;
             End;
           If mem[p].hh.rh=q Then
             Begin
               mem[p].hh.rh := 0;
               goto 30;
             End;
           p := mem[p].hh.rh;
         End;
  30:{:979};
  q := prune_page_top(q,eqtb[5330].int>0);
  p := mem[v+5].hh.rh;
  free_node(v,7);
  If q<>0 Then q := vpackage(q,0,1,1073741823);
  If cur_val<256 Then eqtb[3683+cur_val].hh.rh := q
  Else
    Begin
      find_sa_element(4,cur_val,false);
      If cur_ptr<>0 Then
        Begin
          mem[cur_ptr+1].hh.rh := q;
          mem[cur_ptr+1].hh.lh := mem[cur_ptr+1].hh.lh+1;
          delete_sa_ref(cur_ptr);
        End;
    End;
  vsplit := vpackage(p,h,0,eqtb[5851].int);
  10:
End;
{:977}{985:}
Procedure print_totals;
Begin
  print_scaled(page_so_far[1]);
  If page_so_far[2]<>0 Then
    Begin
      print(313);
      print_scaled(page_so_far[2]);
      print(339);
    End;
  If page_so_far[3]<>0 Then
    Begin
      print(313);
      print_scaled(page_so_far[3]);
      print(312);
    End;
  If page_so_far[4]<>0 Then
    Begin
      print(313);
      print_scaled(page_so_far[4]);
      print(990);
    End;
  If page_so_far[5]<>0 Then
    Begin
      print(313);
      print_scaled(page_so_far[5]);
      print(991);
    End;
  If page_so_far[6]<>0 Then
    Begin
      print(314);
      print_scaled(page_so_far[6]);
    End;
End;{:985}{987:}
Procedure freeze_page_specs(s:small_number);
Begin
  page_contents := s;
  page_so_far[0] := eqtb[5849].int;
  page_max_depth := eqtb[5850].int;
  page_so_far[7] := 0;
  page_so_far[1] := 0;
  page_so_far[2] := 0;
  page_so_far[3] := 0;
  page_so_far[4] := 0;
  page_so_far[5] := 0;
  page_so_far[6] := 0;
  least_page_cost := 1073741823;

{if eqtb[5301].int>0 then begin begin_diagnostic;print_nl(999);
print_scaled(page_so_far[0]);print(1000);print_scaled(page_max_depth);
end_diagnostic(false);end;}
End;
{:987}{992:}
Procedure box_error(n:eight_bits);
Begin
  error;
  begin_diagnostic;
  print_nl(847);
  show_box(eqtb[3683+n].hh.rh);
  end_diagnostic(true);
  flush_node_list(eqtb[3683+n].hh.rh);
  eqtb[3683+n].hh.rh := 0;
End;
{:992}{993:}
Procedure ensure_vbox(n:eight_bits);

Var p: halfword;
Begin
  p := eqtb[3683+n].hh.rh;
  If p<>0 Then If mem[p].hh.b0=0 Then
                 Begin
                   Begin
                     If interaction=3 Then;
                     print_nl(263);
                     print(1001);
                   End;
                   Begin
                     help_ptr := 3;
                     help_line[2] := 1002;
                     help_line[1] := 1003;
                     help_line[0] := 1004;
                   End;
                   box_error(n);
                 End;
End;
{:993}{994:}{1012:}
Procedure fire_up(c:halfword);

Label 10;

Var p,q,r,s: halfword;
  prev_p: halfword;
  n: 0..255;
  wait: boolean;
  save_vbadness: integer;
  save_vfuzz: scaled;
  save_split_top_skip: halfword;
Begin{1013:}
  If mem[best_page_break].hh.b0=12 Then
    Begin
      geq_word_define(
                      5307,mem[best_page_break+1].int);
      mem[best_page_break+1].int := 10000;
    End
  Else geq_word_define(5307,10000){:1013};
  If sa_root[6]<>0 Then If do_marks(1,0,sa_root[6])Then sa_root[6] := 0;
  If cur_mark[2]<>0 Then
    Begin
      If cur_mark[0]<>0 Then delete_token_ref(
                                              cur_mark[0]);
      cur_mark[0] := cur_mark[2];
      mem[cur_mark[0]].hh.lh := mem[cur_mark[0]].hh.lh+1;
      delete_token_ref(cur_mark[1]);
      cur_mark[1] := 0;
    End;
{1014:}
  If c=best_page_break Then best_page_break := 0;
{1015:}
  If eqtb[3938].hh.rh<>0 Then
    Begin
      Begin
        If interaction=3 Then;
        print_nl(263);
        print(339);
      End;
      print_esc(412);
      print(1015);
      Begin
        help_ptr := 2;
        help_line[1] := 1016;
        help_line[0] := 1004;
      End;
      box_error(255);
    End{:1015};
  insert_penalties := 0;
  save_split_top_skip := eqtb[2892].hh.rh;
  If eqtb[5321].int<=0 Then{1018:}
    Begin
      r := mem[30000].hh.rh;
      While r<>30000 Do
        Begin
          If mem[r+2].hh.lh<>0 Then
            Begin
              n := mem[r].hh.b1
                   -0;
              ensure_vbox(n);
              If eqtb[3683+n].hh.rh=0 Then eqtb[3683+n].hh.rh := new_null_box;
              p := eqtb[3683+n].hh.rh+5;
              While mem[p].hh.rh<>0 Do
                p := mem[p].hh.rh;
              mem[r+2].hh.rh := p;
            End;
          r := mem[r].hh.rh;
        End;
    End{:1018};
  q := 29996;
  mem[q].hh.rh := 0;
  prev_p := 29998;
  p := mem[prev_p].hh.rh;
  While p<>best_page_break Do
    Begin
      If mem[p].hh.b0=3 Then
        Begin
          If eqtb[
             5321].int<=0 Then{1020:}
            Begin
              r := mem[30000].hh.rh;
              While mem[r].hh.b1<>mem[p].hh.b1 Do
                r := mem[r].hh.rh;
              If mem[r+2].hh.lh=0 Then wait := true
              Else
                Begin
                  wait := false;
                  s := mem[r+2].hh.rh;
                  mem[s].hh.rh := mem[p+4].hh.lh;
                  If mem[r+2].hh.lh=p Then{1021:}
                    Begin
                      If mem[r].hh.b0=1 Then If (mem[r+1].
                                                hh.lh=p)And(mem[r+1].hh.rh<>0)Then
                                               Begin
                                                 While mem[s].hh.rh<>mem[r+1].hh
                                                       .rh Do
                                                   s := mem[s].hh.rh;
                                                 mem[s].hh.rh := 0;
                                                 eqtb[2892].hh.rh := mem[p+4].hh.rh;
                                                 mem[p+4].hh.lh := prune_page_top(mem[r+1].hh.rh,
                                                                   false);
                                                 If mem[p+4].hh.lh<>0 Then
                                                   Begin
                                                     temp_ptr := vpackage(mem[p+4].hh.lh,0,1,
                                                                 1073741823);
                                                     mem[p+3].int := mem[temp_ptr+3].int+mem[
                                                                     temp_ptr+2].int;
                                                     free_node(temp_ptr,7);
                                                     wait := true;
                                                   End;
                                               End;
                      mem[r+2].hh.lh := 0;
                      n := mem[r].hh.b1-0;
                      temp_ptr := mem[eqtb[3683+n].hh.rh+5].hh.rh;
                      free_node(eqtb[3683+n].hh.rh,7);
                      eqtb[3683+n].hh.rh := vpackage(temp_ptr,0,1,1073741823);
                    End{:1021}
                  Else
                    Begin
                      While mem[s].hh.rh<>0 Do
                        s := mem[s].hh.rh;
                      mem[r+2].hh.rh := s;
                    End;
                End;{1022:}
              mem[prev_p].hh.rh := mem[p].hh.rh;
              mem[p].hh.rh := 0;
              If wait Then
                Begin
                  mem[q].hh.rh := p;
                  q := p;
                  insert_penalties := insert_penalties+1;
                End
              Else
                Begin
                  delete_glue_ref(mem[p+4].hh.rh);
                  free_node(p,5);
                End;
              p := prev_p{:1022};
            End{:1020};
        End
      Else If mem[p].hh.b0=4 Then If mem[p+1].hh.lh<>0 Then{1565:}
                                    Begin
                                      find_sa_element(6,mem[p+1].hh.lh,true);
                                      If mem[cur_ptr+1].hh.rh=0 Then
                                        Begin
                                          mem[cur_ptr+1].hh.rh := mem[p+1].hh.
                                                                  rh;
                                          mem[mem[p+1].hh.rh].hh.lh := mem[mem[p+1].hh.rh].hh.lh+1;
                                        End;
                                      If mem[cur_ptr+2].hh.lh<>0 Then delete_token_ref(mem[cur_ptr+2
                                                                                       ].hh.lh);
                                      mem[cur_ptr+2].hh.lh := mem[p+1].hh.rh;
                                      mem[mem[p+1].hh.rh].hh.lh := mem[mem[p+1].hh.rh].hh.lh+1;
                                    End{:1565}
      Else{1016:}
        Begin
          If cur_mark[1]=0 Then
            Begin
              cur_mark[1] := mem[
                             p+1].hh.rh;
              mem[cur_mark[1]].hh.lh := mem[cur_mark[1]].hh.lh+1;
            End;
          If cur_mark[2]<>0 Then delete_token_ref(cur_mark[2]);
          cur_mark[2] := mem[p+1].hh.rh;
          mem[cur_mark[2]].hh.lh := mem[cur_mark[2]].hh.lh+1;
        End{:1016};
      prev_p := p;
      p := mem[prev_p].hh.rh;
    End;
  eqtb[2892].hh.rh := save_split_top_skip;
{1017:}
  If p<>0 Then
    Begin
      If mem[29999].hh.rh=0 Then If nest_ptr=0 Then
                                   cur_list.tail_field := page_tail
      Else nest[0].tail_field := page_tail;
      mem[page_tail].hh.rh := mem[29999].hh.rh;
      mem[29999].hh.rh := p;
      mem[prev_p].hh.rh := 0;
    End;
  save_vbadness := eqtb[5295].int;
  eqtb[5295].int := 10000;
  save_vfuzz := eqtb[5854].int;
  eqtb[5854].int := 1073741823;
  eqtb[3938].hh.rh := vpackage(mem[29998].hh.rh,best_size,0,page_max_depth);
  eqtb[5295].int := save_vbadness;
  eqtb[5854].int := save_vfuzz;
  If last_glue<>65535 Then delete_glue_ref(last_glue);
{991:}
  page_contents := 0;
  page_tail := 29998;
  mem[29998].hh.rh := 0;
  last_glue := 65535;
  last_penalty := 0;
  last_kern := 0;
  last_node_type := -1;
  page_so_far[7] := 0;
  page_max_depth := 0{:991};
  If q<>29996 Then
    Begin
      mem[29998].hh.rh := mem[29996].hh.rh;
      page_tail := q;
    End{:1017};{1019:}
  r := mem[30000].hh.rh;
  While r<>30000 Do
    Begin
      q := mem[r].hh.rh;
      free_node(r,4);
      r := q;
    End;
  mem[30000].hh.rh := 30000{:1019}{:1014};
  If sa_root[6]<>0 Then If do_marks(2,0,sa_root[6])Then sa_root[6] := 0;
  If (cur_mark[0]<>0)And(cur_mark[1]=0)Then
    Begin
      cur_mark[1] := cur_mark[0];
      mem[cur_mark[0]].hh.lh := mem[cur_mark[0]].hh.lh+1;
    End;
  If eqtb[3413].hh.rh<>0 Then If dead_cycles>=eqtb[5308].int Then{1024:}
                                Begin
                                  Begin
                                    If interaction=3 Then;
                                    print_nl(263);
                                    print(1017);
                                  End;
                                  print_int(dead_cycles);
                                  print(1018);
                                  Begin
                                    help_ptr := 3;
                                    help_line[2] := 1019;
                                    help_line[1] := 1020;
                                    help_line[0] := 1021;
                                  End;
                                  error;
                                End{:1024}
  Else{1025:}
    Begin
      output_active := true;
      dead_cycles := dead_cycles+1;
      push_nest;
      cur_list.mode_field := -1;
      cur_list.aux_field.int := -65536000;
      cur_list.ml_field := -line;
      begin_token_list(eqtb[3413].hh.rh,6);
      new_save_level(8);
      normal_paragraph;
      scan_left_brace;
      goto 10;
    End{:1025};
{1023:}
  Begin
    If mem[29998].hh.rh<>0 Then
      Begin
        If mem[29999].hh.rh=0
          Then If nest_ptr=0 Then cur_list.tail_field := page_tail
        Else nest[0].
          tail_field := page_tail
        Else mem[page_tail].hh.rh := mem[29999].hh.rh;
        mem[29999].hh.rh := mem[29998].hh.rh;
        mem[29998].hh.rh := 0;
        page_tail := 29998;
      End;
    flush_node_list(disc_ptr[2]);
    disc_ptr[2] := 0;
    ship_out(eqtb[3938].hh.rh);
    eqtb[3938].hh.rh := 0;
  End{:1023};
  10:
End;
{:1012}
Procedure build_page;

Label 10,30,31,22,80,90;

Var p: halfword;
  q,r: halfword;
  b,c: integer;
  pi: integer;
  n: 0..255;
  delta,h,w: scaled;
Begin
  If (mem[29999].hh.rh=0)Or output_active Then goto 10;
  Repeat
    22: p := mem[29999].hh.rh;
{996:}
    If last_glue<>65535 Then delete_glue_ref(last_glue);
    last_penalty := 0;
    last_kern := 0;
    last_node_type := mem[p].hh.b0+1;
    If mem[p].hh.b0=10 Then
      Begin
        last_glue := mem[p+1].hh.lh;
        mem[last_glue].hh.rh := mem[last_glue].hh.rh+1;
      End
    Else
      Begin
        last_glue := 65535;
        If mem[p].hh.b0=12 Then last_penalty := mem[p+1].int
        Else If mem[p].hh.b0=
                11 Then last_kern := mem[p+1].int;
      End{:996};
{997:}{1000:}
    Case mem[p].hh.b0 Of
      0,1,2: If page_contents<2 Then{1001:}
               Begin
                 If page_contents=0 Then freeze_page_specs(2)
                 Else page_contents := 2;
                 q := new_skip_param(9);
                 If mem[temp_ptr+1].int>mem[p+3].int Then mem[temp_ptr+1].int := mem[
                                                                                 temp_ptr+1].int-mem
                                                                                 [p+3].int
                 Else mem[temp_ptr+1].int := 0;
                 mem[q].hh.rh := p;
                 mem[29999].hh.rh := q;
                 goto 22;
               End{:1001}
             Else{1002:}
               Begin
                 page_so_far[1] := page_so_far[1]+page_so_far[7]
                                   +mem[p+3].int;
                 page_so_far[7] := mem[p+2].int;
                 goto 80;
               End{:1002};
      8:{1364:}goto 80{:1364};
      10: If page_contents<2 Then goto 31
          Else If (mem[page_tail].hh.b0<9)Then
                 pi := 0
          Else goto 90;
      11: If page_contents<2 Then goto 31
          Else If mem[p].hh.rh=0 Then goto 10
          Else If mem[mem[p].hh.rh].hh.b0=10 Then pi := 0
          Else goto 90;
      12: If page_contents<2 Then goto 31
          Else pi := mem[p+1].int;
      4: goto 80;
      3:{1008:}
         Begin
           If page_contents=0 Then freeze_page_specs(1);
           n := mem[p].hh.b1;
           r := 30000;
           While n>=mem[mem[r].hh.rh].hh.b1 Do
             r := mem[r].hh.rh;
           n := n-0;
           If mem[r].hh.b1<>n+0 Then{1009:}
             Begin
               q := get_node(4);
               mem[q].hh.rh := mem[r].hh.rh;
               mem[r].hh.rh := q;
               r := q;
               mem[r].hh.b1 := n+0;
               mem[r].hh.b0 := 0;
               ensure_vbox(n);
               If eqtb[3683+n].hh.rh=0 Then mem[r+3].int := 0
               Else mem[r+3].int := mem[eqtb
                                    [3683+n].hh.rh+3].int+mem[eqtb[3683+n].hh.rh+2].int;
               mem[r+2].hh.lh := 0;
               q := eqtb[2900+n].hh.rh;
               If eqtb[5333+n].int=1000 Then h := mem[r+3].int
               Else h := x_over_n(mem[r+3].
                         int,1000)*eqtb[5333+n].int;
               page_so_far[0] := page_so_far[0]-h-mem[q+1].int;
               page_so_far[2+mem[q].hh.b0] := page_so_far[2+mem[q].hh.b0]+mem[q+2].int;
               page_so_far[6] := page_so_far[6]+mem[q+3].int;
               If (mem[q].hh.b1<>0)And(mem[q+3].int<>0)Then
                 Begin
                   Begin
                     If interaction=3
                       Then;
                     print_nl(263);
                     print(1010);
                   End;
                   print_esc(398);
                   print_int(n);
                   Begin
                     help_ptr := 3;
                     help_line[2] := 1011;
                     help_line[1] := 1012;
                     help_line[0] := 934;
                   End;
                   error;
                 End;
             End{:1009};
           If mem[r].hh.b0=1 Then insert_penalties := insert_penalties+mem[p+1].int
           Else
             Begin
               mem[r+2].hh.rh := p;
               delta := page_so_far[0]-page_so_far[1]-page_so_far[7]+page_so_far[6];
               If eqtb[5333+n].int=1000 Then h := mem[p+3].int
               Else h := x_over_n(mem[p+3].
                         int,1000)*eqtb[5333+n].int;
               If ((h<=0)Or(h<=delta))And(mem[p+3].int+mem[r+3].int<=eqtb[5866+n].int)
                 Then
                 Begin
                   page_so_far[0] := page_so_far[0]-h;
                   mem[r+3].int := mem[r+3].int+mem[p+3].int;
                 End
               Else{1010:}
                 Begin
                   If eqtb[5333+n].int<=0 Then w := 1073741823
                   Else
                     Begin
                       w := page_so_far[0]-page_so_far[1]-page_so_far[7];
                       If eqtb[5333+n].int<>1000 Then w := x_over_n(w,eqtb[5333+n].int)*1000;
                     End;
                   If w>eqtb[5866+n].int-mem[r+3].int Then w := eqtb[5866+n].int-mem[r+3].int
                   ;
                   q := vert_break(mem[p+4].hh.lh,w,mem[p+2].int);
                   mem[r+3].int := mem[r+3].int+best_height_plus_depth;

{if eqtb[5301].int>0 then[1011:]begin begin_diagnostic;print_nl(1013);
print_int(n);print(1014);print_scaled(w);print_char(44);
print_scaled(best_height_plus_depth);print(943);
if q=0 then print_int(-10000)else if mem[q].hh.b0=12 then print_int(mem[
q+1].int)else print_char(48);end_diagnostic(false);end[:1011];}
                   If eqtb[5333+n].int<>1000 Then best_height_plus_depth := x_over_n(
                                                                            best_height_plus_depth,
                                                                            1000)*eqtb[5333+n].int;
                   page_so_far[0] := page_so_far[0]-best_height_plus_depth;
                   mem[r].hh.b0 := 1;
                   mem[r+1].hh.rh := q;
                   mem[r+1].hh.lh := p;
                   If q=0 Then insert_penalties := insert_penalties-10000
                   Else If mem[q].hh.
                           b0=12 Then insert_penalties := insert_penalties+mem[q+1].int;
                 End{:1010};
             End;
           goto 80;
         End{:1008};
      others: confusion(1005)
    End{:1000};
{1005:}
    If pi<10000 Then
      Begin{1007:}
        If page_so_far[1]<page_so_far[0]Then
          If (page_so_far[3]<>0)Or(page_so_far[4]<>0)Or(page_so_far[5]<>0)Then b := 0
        Else b := badness(page_so_far[0]-page_so_far[1],page_so_far[2])
        Else If
                page_so_far[1]-page_so_far[0]>page_so_far[6]Then b := 1073741823
        Else b :=
                  badness(page_so_far[1]-page_so_far[0],page_so_far[6]){:1007};
        If b<1073741823 Then If pi<=-10000 Then c := pi
        Else If b<10000 Then c := b+
                                  pi+insert_penalties
        Else c := 100000
        Else c := b;
        If insert_penalties>=10000 Then c := 1073741823;

{if eqtb[5301].int>0 then[1006:]begin begin_diagnostic;print_nl(37);
print(939);print_totals;print(1008);print_scaled(page_so_far[0]);
print(942);if b=1073741823 then print_char(42)else print_int(b);
print(943);print_int(pi);print(1009);
if c=1073741823 then print_char(42)else print_int(c);
if c<=least_page_cost then print_char(35);end_diagnostic(false);
end[:1006];}
        If c<=least_page_cost Then
          Begin
            best_page_break := p;
            best_size := page_so_far[0];
            least_page_cost := c;
            r := mem[30000].hh.rh;
            While r<>30000 Do
              Begin
                mem[r+2].hh.lh := mem[r+2].hh.rh;
                r := mem[r].hh.rh;
              End;
          End;
        If (c=1073741823)Or(pi<=-10000)Then
          Begin
            fire_up(p);
            If output_active Then goto 10;
            goto 30;
          End;
      End{:1005};
    If (mem[p].hh.b0<10)Or(mem[p].hh.b0>11)Then goto 80;
    90:{1004:}If mem[p].hh.b0=11 Then q := p
        Else
          Begin
            q := mem[p+1].hh.lh;
            page_so_far[2+mem[q].hh.b0] := page_so_far[2+mem[q].hh.b0]+mem[q+2].int;
            page_so_far[6] := page_so_far[6]+mem[q+3].int;
            If (mem[q].hh.b1<>0)And(mem[q+3].int<>0)Then
              Begin
                Begin
                  If interaction=3
                    Then;
                  print_nl(263);
                  print(1006);
                End;
                Begin
                  help_ptr := 4;
                  help_line[3] := 1007;
                  help_line[2] := 975;
                  help_line[1] := 976;
                  help_line[0] := 934;
                End;
                error;
                r := new_spec(q);
                mem[r].hh.b1 := 0;
                delete_glue_ref(q);
                mem[p+1].hh.lh := r;
                q := r;
              End;
          End;
    page_so_far[1] := page_so_far[1]+page_so_far[7]+mem[q+1].int;
    page_so_far[7] := 0{:1004};
    80:{1003:}If page_so_far[7]>page_max_depth Then
                Begin
                  page_so_far[1] :=
                                    page_so_far[1]+page_so_far[7]-page_max_depth;
                  page_so_far[7] := page_max_depth;
                End;{:1003};
{998:}
    mem[page_tail].hh.rh := p;
    page_tail := p;
    mem[29999].hh.rh := mem[p].hh.rh;
    mem[p].hh.rh := 0;
    goto 30{:998};
    31:{999:}mem[29999].hh.rh := mem[p].hh.rh;
    mem[p].hh.rh := 0;
    If eqtb[5330].int>0 Then
      Begin
        If disc_ptr[2]=0 Then disc_ptr[2] := p
        Else
          mem[disc_ptr[1]].hh.rh := p;
        disc_ptr[1] := p;
      End
    Else flush_node_list(p){:999};
    30:{:997};
  Until mem[29999].hh.rh=0;
{995:}
  If nest_ptr=0 Then cur_list.tail_field := 29999
  Else nest[0].
    tail_field := 29999{:995};
  10:
End;{:994}{1030:}{1043:}
Procedure app_space;

Var q: halfword;
Begin
  If (cur_list.aux_field.hh.lh>=2000)And(eqtb[2895].hh.rh<>0)Then q :=
                                                                       new_param_glue(13)
  Else
    Begin
      If eqtb[2894].hh.rh<>0 Then main_p := eqtb[
                                            2894].hh.rh
      Else{1042:}
        Begin
          main_p := font_glue[eqtb[3939].hh.rh];
          If main_p=0 Then
            Begin
              main_p := new_spec(0);
              main_k := param_base[eqtb[3939].hh.rh]+2;
              mem[main_p+1].int := font_info[main_k].int;
              mem[main_p+2].int := font_info[main_k+1].int;
              mem[main_p+3].int := font_info[main_k+2].int;
              font_glue[eqtb[3939].hh.rh] := main_p;
            End;
        End{:1042};
      main_p := new_spec(main_p);
{1044:}
      If cur_list.aux_field.hh.lh>=2000 Then mem[main_p+1].int := mem[
                                                                  main_p+1].int+font_info[7+
                                                                  param_base[eqtb[3939].hh.rh]].int;
      mem[main_p+2].int := xn_over_d(mem[main_p+2].int,cur_list.aux_field.hh.lh,
                           1000);
      mem[main_p+3].int := xn_over_d(mem[main_p+3].int,1000,cur_list.aux_field.
                           hh.lh){:1044};
      q := new_glue(main_p);
      mem[main_p].hh.rh := 0;
    End;
  mem[cur_list.tail_field].hh.rh := q;
  cur_list.tail_field := q;
End;
{:1043}{1047:}
Procedure insert_dollar_sign;
Begin
  back_input;
  cur_tok := 804;
  Begin
    If interaction=3 Then;
    print_nl(263);
    print(1029);
  End;
  Begin
    help_ptr := 2;
    help_line[1] := 1030;
    help_line[0] := 1031;
  End;
  ins_error;
End;{:1047}{1049:}
Procedure you_cant;
Begin
  Begin
    If interaction=3 Then;
    print_nl(263);
    print(694);
  End;
  print_cmd_chr(cur_cmd,cur_chr);
  print(1032);
  print_mode(cur_list.mode_field);
End;
{:1049}{1050:}
Procedure report_illegal_case;
Begin
  you_cant;
  Begin
    help_ptr := 4;
    help_line[3] := 1033;
    help_line[2] := 1034;
    help_line[1] := 1035;
    help_line[0] := 1036;
  End;
  error;
End;
{:1050}{1051:}
Function privileged: boolean;
Begin
  If cur_list.mode_field>0 Then privileged := true
  Else
    Begin
      report_illegal_case;
      privileged := false;
    End;
End;
{:1051}{1054:}
Function its_all_over: boolean;

Label 10;
Begin
  If privileged Then
    Begin
      If (29998=page_tail)And(cur_list.
         head_field=cur_list.tail_field)And(dead_cycles=0)Then
        Begin
          its_all_over
          := true;
          goto 10;
        End;
      back_input;
      Begin
        mem[cur_list.tail_field].hh.rh := new_null_box;
        cur_list.tail_field := mem[cur_list.tail_field].hh.rh;
      End;
      mem[cur_list.tail_field+1].int := eqtb[5848].int;
      Begin
        mem[cur_list.tail_field].hh.rh := new_glue(8);
        cur_list.tail_field := mem[cur_list.tail_field].hh.rh;
      End;
      Begin
        mem[cur_list.tail_field].hh.rh := new_penalty(-1073741824);
        cur_list.tail_field := mem[cur_list.tail_field].hh.rh;
      End;
      build_page;
    End;
  its_all_over := false;
  10:
End;{:1054}{1060:}
Procedure append_glue;

Var s: small_number;
Begin
  s := cur_chr;
  Case s Of
    0: cur_val := 4;
    1: cur_val := 8;
    2: cur_val := 12;
    3: cur_val := 16;
    4: scan_glue(2);
    5: scan_glue(3);
  End;
  Begin
    mem[cur_list.tail_field].hh.rh := new_glue(cur_val);
    cur_list.tail_field := mem[cur_list.tail_field].hh.rh;
  End;
  If s>=4 Then
    Begin
      mem[cur_val].hh.rh := mem[cur_val].hh.rh-1;
      If s>4 Then mem[cur_list.tail_field].hh.b1 := 99;
    End;
End;
{:1060}{1061:}
Procedure append_kern;

Var s: quarterword;
Begin
  s := cur_chr;
  scan_dimen(s=99,false,false);
  Begin
    mem[cur_list.tail_field].hh.rh := new_kern(cur_val);
    cur_list.tail_field := mem[cur_list.tail_field].hh.rh;
  End;
  mem[cur_list.tail_field].hh.b1 := s;
End;{:1061}{1064:}
Procedure off_save;

Var p: halfword;
Begin
  If cur_group=0 Then{1066:}
    Begin
      Begin
        If interaction=3 Then;
        print_nl(263);
        print(788);
      End;
      print_cmd_chr(cur_cmd,cur_chr);
      Begin
        help_ptr := 1;
        help_line[0] := 1054;
      End;
      error;
    End{:1066}
  Else
    Begin
      back_input;
      p := get_avail;
      mem[29997].hh.rh := p;
      Begin
        If interaction=3 Then;
        print_nl(263);
        print(634);
      End;
{1065:}
      Case cur_group Of
        14:
            Begin
              mem[p].hh.lh := 6711;
              print_esc(519);
            End;
        15:
            Begin
              mem[p].hh.lh := 804;
              print_char(36);
            End;
        16:
            Begin
              mem[p].hh.lh := 6712;
              mem[p].hh.rh := get_avail;
              p := mem[p].hh.rh;
              mem[p].hh.lh := 3118;
              print_esc(1053);
            End;
        others:
                Begin
                  mem[p].hh.lh := 637;
                  print_char(125);
                End
      End{:1065};
      print(635);
      begin_token_list(mem[29997].hh.rh,4);
      Begin
        help_ptr := 5;
        help_line[4] := 1048;
        help_line[3] := 1049;
        help_line[2] := 1050;
        help_line[1] := 1051;
        help_line[0] := 1052;
      End;
      error;
    End;
End;
{:1064}{1069:}
Procedure extra_right_brace;
Begin
  Begin
    If interaction=3 Then;
    print_nl(263);
    print(1059);
  End;
  Case cur_group Of
    14: print_esc(519);
    15: print_char(36);
    16: print_esc(888);
  End;
  Begin
    help_ptr := 5;
    help_line[4] := 1060;
    help_line[3] := 1061;
    help_line[2] := 1062;
    help_line[1] := 1063;
    help_line[0] := 1064;
  End;
  error;
  align_state := align_state+1;
End;{:1069}{1070:}
Procedure normal_paragraph;
Begin
  If eqtb[5287].int<>0 Then eq_word_define(5287,0);
  If eqtb[5862].int<>0 Then eq_word_define(5862,0);
  If eqtb[5309].int<>1 Then eq_word_define(5309,1);
  If eqtb[3412].hh.rh<>0 Then eq_define(3412,118,0);
  If eqtb[3679].hh.rh<>0 Then eq_define(3679,118,0);
End;
{:1070}{1075:}
Procedure box_end(box_context:integer);

Var p: halfword;
  a: small_number;
Begin
  If box_context<1073741824 Then{1076:}
    Begin
      If cur_box<>0 Then
        Begin
          mem[cur_box+4].int := box_context;
          If abs(cur_list.mode_field)=1 Then
            Begin
              append_to_vlist(cur_box);
              If adjust_tail<>0 Then
                Begin
                  If 29995<>adjust_tail Then
                    Begin
                      mem[
                      cur_list.tail_field].hh.rh := mem[29995].hh.rh;
                      cur_list.tail_field := adjust_tail;
                    End;
                  adjust_tail := 0;
                End;
              If cur_list.mode_field>0 Then build_page;
            End
          Else
            Begin
              If abs(cur_list.mode_field)=102 Then cur_list.aux_field.
                hh.lh := 1000
              Else
                Begin
                  p := new_noad;
                  mem[p+1].hh.rh := 2;
                  mem[p+1].hh.lh := cur_box;
                  cur_box := p;
                End;
              mem[cur_list.tail_field].hh.rh := cur_box;
              cur_list.tail_field := cur_box;
            End;
        End;
    End{:1076}
  Else If box_context<1073807360 Then{1077:}
         Begin
           If box_context
              <1073774592 Then
             Begin
               cur_val := box_context-1073741824;
               a := 0;
             End
           Else
             Begin
               cur_val := box_context-1073774592;
               a := 4;
             End;
           If cur_val<256 Then If (a>=4)Then geq_define(3683+cur_val,119,cur_box)
           Else eq_define(3683+cur_val,119,cur_box)
           Else
             Begin
               find_sa_element(4,
                               cur_val,true);
               If (a>=4)Then gsa_def(cur_ptr,cur_box)
               Else sa_def(cur_ptr,cur_box);
             End;
         End{:1077}
  Else If cur_box<>0 Then If box_context>1073807360 Then{1078:}
                            Begin{404:}
                              Repeat
                                get_x_token;
                              Until (cur_cmd<>10)And(cur_cmd<>0){:404};
                              If ((cur_cmd=26)And(abs(cur_list.mode_field)<>1))Or((cur_cmd=27)And(
                                 abs(
                                 cur_list.mode_field)=1))Then
                                Begin
                                  append_glue;
                                  mem[cur_list.tail_field].hh.b1 := box_context-(1073807261);
                                  mem[cur_list.tail_field+1].hh.rh := cur_box;
                                End
                              Else
                                Begin
                                  Begin
                                    If interaction=3 Then;
                                    print_nl(263);
                                    print(1077);
                                  End;
                                  Begin
                                    help_ptr := 3;
                                    help_line[2] := 1078;
                                    help_line[1] := 1079;
                                    help_line[0] := 1080;
                                  End;
                                  back_error;
                                  flush_node_list(cur_box);
                                End;
                            End{:1078}
  Else ship_out(cur_box);
End;
{:1075}{1079:}
Procedure begin_box(box_context:integer);

Label 10,30;

Var p,q: halfword;
  r: halfword;
  fm: boolean;
  tx: halfword;
  m: quarterword;
  k: halfword;
  n: halfword;
Begin
  Case cur_chr Of
    0:
       Begin
         scan_register_num;
         If cur_val<256 Then cur_box := eqtb[3683+cur_val].hh.rh
         Else
           Begin
             find_sa_element(4,cur_val,false);
             If cur_ptr=0 Then cur_box := 0
             Else cur_box := mem[cur_ptr+1].hh.rh;
           End;
         If cur_val<256 Then eqtb[3683+cur_val].hh.rh := 0
         Else
           Begin
             find_sa_element(4,cur_val,false);
             If cur_ptr<>0 Then
               Begin
                 mem[cur_ptr+1].hh.rh := 0;
                 mem[cur_ptr+1].hh.lh := mem[cur_ptr+1].hh.lh+1;
                 delete_sa_ref(cur_ptr);
               End;
           End;
       End;
    1:
       Begin
         scan_register_num;
         If cur_val<256 Then q := eqtb[3683+cur_val].hh.rh
         Else
           Begin
             find_sa_element(4,cur_val,false);
             If cur_ptr=0 Then q := 0
             Else q := mem[cur_ptr+1].hh.rh;
           End;
         cur_box := copy_node_list(q);
       End;
    2:{1080:}
       Begin
         cur_box := 0;
         If abs(cur_list.mode_field)=203 Then
           Begin
             you_cant;
             Begin
               help_ptr := 1;
               help_line[0] := 1082;
             End;
             error;
           End
         Else If (cur_list.mode_field=1)And(cur_list.head_field=cur_list.
                 tail_field)Then
                Begin
                  you_cant;
                  Begin
                    help_ptr := 2;
                    help_line[1] := 1083;
                    help_line[0] := 1084;
                  End;
                  error;
                End
         Else
           Begin
             tx := cur_list.tail_field;
             If Not(tx>=hi_mem_min)Then If (mem[tx].hh.b0=9)And(mem[tx].hh.b1=3)Then
                                          Begin
                                            r := cur_list.head_field;
                                            Repeat
                                              q := r;
                                              r := mem[q].hh.rh;
                                            Until r=tx;
                                            tx := q;
                                          End;
             If Not(tx>=hi_mem_min)Then If (mem[tx].hh.b0=0)Or(mem[tx].hh.b0=1)Then
{1081:}
                                          Begin
                                            q := cur_list.head_field;
                                            p := 0;
                                            Repeat
                                              r := p;
                                              p := q;
                                              fm := false;
                                              If Not(q>=hi_mem_min)Then If mem[q].hh.b0=7 Then
                                                                          Begin
                                                                            For m:=1 To mem[q
                                                                                ].hh.b1 Do
                                                                              p := mem[p].hh.rh;
                                                                            If p=tx Then goto 30;
                                                                          End
                                              Else If (mem[q].hh.b0=9)And(mem[q].hh.b1=2)Then fm :=
                                                                                                true
                                              ;
                                              q := mem[p].hh.rh;
                                            Until q=tx;
                                            q := mem[tx].hh.rh;
                                            mem[p].hh.rh := q;
                                            mem[tx].hh.rh := 0;
                                            If q=0 Then If fm Then confusion(1081)
                                            Else cur_list.tail_field := p
                                            Else
                                              If fm Then
                                                Begin
                                                  cur_list.tail_field := r;
                                                  mem[r].hh.rh := 0;
                                                  flush_node_list(p);
                                                End;
                                            cur_box := tx;
                                            mem[cur_box+4].int := 0;
                                          End{:1081};
             30:
           End;
       End{:1080};
    3:{1082:}
       Begin
         scan_register_num;
         n := cur_val;
         If Not scan_keyword(853)Then
           Begin
             Begin
               If interaction=3 Then;
               print_nl(263);
               print(1085);
             End;
             Begin
               help_ptr := 2;
               help_line[1] := 1086;
               help_line[0] := 1087;
             End;
             error;
           End;
         scan_dimen(false,false,false);
         cur_box := vsplit(n,cur_val);
       End{:1082};
    others:{1083:}
            Begin
              k := cur_chr-4;
              save_stack[save_ptr+0].int := box_context;
              If k=102 Then If (box_context<1073741824)And(abs(cur_list.mode_field)=1)
                              Then scan_spec(3,true)
              Else scan_spec(2,true)
              Else
                Begin
                  If k=1 Then
                    scan_spec(4,true)
                  Else
                    Begin
                      scan_spec(5,true);
                      k := 1;
                    End;
                  normal_paragraph;
                End;
              push_nest;
              cur_list.mode_field := -k;
              If k=1 Then
                Begin
                  cur_list.aux_field.int := -65536000;
                  If eqtb[3418].hh.rh<>0 Then begin_token_list(eqtb[3418].hh.rh,11);
                End
              Else
                Begin
                  cur_list.aux_field.hh.lh := 1000;
                  If eqtb[3417].hh.rh<>0 Then begin_token_list(eqtb[3417].hh.rh,10);
                End;
              goto 10;
            End{:1083}
  End;
  box_end(box_context);
  10:
End;
{:1079}{1084:}
Procedure scan_box(box_context:integer);
Begin{404:}
  Repeat
    get_x_token;
  Until (cur_cmd<>10)And(cur_cmd<>0){:404};
  If cur_cmd=20 Then begin_box(box_context)
  Else If (box_context>=1073807361
          )And((cur_cmd=36)Or(cur_cmd=35))Then
         Begin
           cur_box := scan_rule_spec;
           box_end(box_context);
         End
  Else
    Begin
      Begin
        If interaction=3 Then;
        print_nl(263);
        print(1088);
      End;
      Begin
        help_ptr := 3;
        help_line[2] := 1089;
        help_line[1] := 1090;
        help_line[0] := 1091;
      End;
      back_error;
    End;
End;
{:1084}{1086:}
Procedure package(c:small_number);

Var h: scaled;
  p: halfword;
  d: scaled;
Begin
  d := eqtb[5852].int;
  unsave;
  save_ptr := save_ptr-3;
  If cur_list.mode_field=-102 Then cur_box := hpack(mem[cur_list.head_field]
                                              .hh.rh,save_stack[save_ptr+2].int,save_stack[save_ptr+
                                              1].int)
  Else
    Begin
      cur_box := vpackage(mem[cur_list.head_field].hh.rh,save_stack[save_ptr+2].
                 int,save_stack[save_ptr+1].int,d);
      If c=4 Then{1087:}
        Begin
          h := 0;
          p := mem[cur_box+5].hh.rh;
          If p<>0 Then If mem[p].hh.b0<=2 Then h := mem[p+3].int;
          mem[cur_box+2].int := mem[cur_box+2].int-h+mem[cur_box+3].int;
          mem[cur_box+3].int := h;
        End{:1087};
    End;
  pop_nest;
  box_end(save_stack[save_ptr+0].int);
End;
{:1086}{1091:}
Function norm_min(h:integer): small_number;
Begin
  If h<=0 Then norm_min := 1
  Else If h>=63 Then norm_min := 63
  Else
    norm_min := h;
End;
Procedure new_graf(indented:boolean);
Begin
  cur_list.pg_field := 0;
  If (cur_list.mode_field=1)Or(cur_list.head_field<>cur_list.tail_field)
    Then
    Begin
      mem[cur_list.tail_field].hh.rh := new_param_glue(2);
      cur_list.tail_field := mem[cur_list.tail_field].hh.rh;
    End;
  push_nest;
  cur_list.mode_field := 102;
  cur_list.aux_field.hh.lh := 1000;
  If eqtb[5318].int<=0 Then cur_lang := 0
  Else If eqtb[5318].int>255 Then
         cur_lang := 0
  Else cur_lang := eqtb[5318].int;
  cur_list.aux_field.hh.rh := cur_lang;
  cur_list.pg_field := (norm_min(eqtb[5319].int)*64+norm_min(eqtb[5320].int)
                       )*65536+cur_lang;
  If indented Then
    Begin
      cur_list.tail_field := new_null_box;
      mem[cur_list.head_field].hh.rh := cur_list.tail_field;
      mem[cur_list.tail_field+1].int := eqtb[5845].int;
    End;
  If eqtb[3414].hh.rh<>0 Then begin_token_list(eqtb[3414].hh.rh,7);
  If nest_ptr=1 Then build_page;
End;
{:1091}{1093:}
Procedure indent_in_hmode;

Var p,q: halfword;
Begin
  If cur_chr>0 Then
    Begin
      p := new_null_box;
      mem[p+1].int := eqtb[5845].int;
      If abs(cur_list.mode_field)=102 Then cur_list.aux_field.hh.lh := 1000
      Else
        Begin
          q := new_noad;
          mem[q+1].hh.rh := 2;
          mem[q+1].hh.lh := p;
          p := q;
        End;
      Begin
        mem[cur_list.tail_field].hh.rh := p;
        cur_list.tail_field := mem[cur_list.tail_field].hh.rh;
      End;
    End;
End;
{:1093}{1095:}
Procedure head_for_vmode;
Begin
  If cur_list.mode_field<0 Then If cur_cmd<>36 Then off_save
  Else
    Begin
      Begin
        If interaction=3 Then;
        print_nl(263);
        print(694);
      End;
      print_esc(524);
      print(1094);
      Begin
        help_ptr := 2;
        help_line[1] := 1095;
        help_line[0] := 1096;
      End;
      error;
    End
  Else
    Begin
      back_input;
      cur_tok := par_token;
      back_input;
      cur_input.index_field := 4;
    End;
End;
{:1095}{1096:}
Procedure end_graf;
Begin
  If cur_list.mode_field=102 Then
    Begin
      If cur_list.head_field=
         cur_list.tail_field Then pop_nest
      Else line_break(false);
      If cur_list.eTeX_aux_field<>0 Then
        Begin
          flush_list(cur_list.
                     eTeX_aux_field);
          cur_list.eTeX_aux_field := 0;
        End;
      normal_paragraph;
      error_count := 0;
    End;
End;{:1096}{1099:}
Procedure begin_insert_or_adjust;
Begin
  If cur_cmd=38 Then cur_val := 255
  Else
    Begin
      scan_eight_bit_int;
      If cur_val=255 Then
        Begin
          Begin
            If interaction=3 Then;
            print_nl(263);
            print(1097);
          End;
          print_esc(331);
          print_int(255);
          Begin
            help_ptr := 1;
            help_line[0] := 1098;
          End;
          error;
          cur_val := 0;
        End;
    End;
  save_stack[save_ptr+0].int := cur_val;
  save_ptr := save_ptr+1;
  new_save_level(11);
  scan_left_brace;
  normal_paragraph;
  push_nest;
  cur_list.mode_field := -1;
  cur_list.aux_field.int := -65536000;
End;
{:1099}{1101:}
Procedure make_mark;

Var p: halfword;
  c: halfword;
Begin
  If cur_chr=0 Then c := 0
  Else
    Begin
      scan_register_num;
      c := cur_val;
    End;
  p := scan_toks(false,true);
  p := get_node(2);
  mem[p+1].hh.lh := c;
  mem[p].hh.b0 := 4;
  mem[p].hh.b1 := 0;
  mem[p+1].hh.rh := def_ref;
  mem[cur_list.tail_field].hh.rh := p;
  cur_list.tail_field := p;
End;
{:1101}{1103:}
Procedure append_penalty;
Begin
  scan_int;
  Begin
    mem[cur_list.tail_field].hh.rh := new_penalty(cur_val);
    cur_list.tail_field := mem[cur_list.tail_field].hh.rh;
  End;
  If cur_list.mode_field=1 Then build_page;
End;
{:1103}{1105:}
Procedure delete_last;

Label 10;

Var p,q: halfword;
  r: halfword;
  fm: boolean;
  tx: halfword;
  m: quarterword;
Begin
  If (cur_list.mode_field=1)And(cur_list.tail_field=cur_list.
     head_field)Then{1106:}
    Begin
      If (cur_chr<>10)Or(last_glue<>65535)Then
        Begin
          you_cant;
          Begin
            help_ptr := 2;
            help_line[1] := 1083;
            help_line[0] := 1099;
          End;
          If cur_chr=11 Then help_line[0] := (1100)
          Else If cur_chr<>10 Then
                 help_line[0] := (1101);
          error;
        End;
    End{:1106}
  Else
    Begin
      tx := cur_list.tail_field;
      If Not(tx>=hi_mem_min)Then If (mem[tx].hh.b0=9)And(mem[tx].hh.b1=3)Then
                                   Begin
                                     r := cur_list.head_field;
                                     Repeat
                                       q := r;
                                       r := mem[q].hh.rh;
                                     Until r=tx;
                                     tx := q;
                                   End;
      If Not(tx>=hi_mem_min)Then If mem[tx].hh.b0=cur_chr Then
                                   Begin
                                     q :=
                                          cur_list.head_field;
                                     p := 0;
                                     Repeat
                                       r := p;
                                       p := q;
                                       fm := false;
                                       If Not(q>=hi_mem_min)Then If mem[q].hh.b0=7 Then
                                                                   Begin
                                                                     For m:=1 To mem[q
                                                                         ].hh.b1 Do
                                                                       p := mem[p].hh.rh;
                                                                     If p=tx Then goto 10;
                                                                   End
                                       Else If (mem[q].hh.b0=9)And(mem[q].hh.b1=2)Then fm := true;
                                       q := mem[p].hh.rh;
                                     Until q=tx;
                                     q := mem[tx].hh.rh;
                                     mem[p].hh.rh := q;
                                     mem[tx].hh.rh := 0;
                                     If q=0 Then If fm Then confusion(1081)
                                     Else cur_list.tail_field := p
                                     Else
                                       If fm Then
                                         Begin
                                           cur_list.tail_field := r;
                                           mem[r].hh.rh := 0;
                                           flush_node_list(p);
                                         End;
                                     flush_node_list(tx);
                                   End;
    End;
  10:
End;
{:1105}{1110:}
Procedure unpackage;

Label 30,10;

Var p: halfword;
  c: 0..1;
Begin
  If cur_chr>1 Then{1598:}
    Begin
      mem[cur_list.tail_field].hh.rh :=
                                        disc_ptr[cur_chr];
      disc_ptr[cur_chr] := 0;
      goto 30;
    End{:1598};
  c := cur_chr;
  scan_register_num;
  If cur_val<256 Then p := eqtb[3683+cur_val].hh.rh
  Else
    Begin
      find_sa_element(4,cur_val,false);
      If cur_ptr=0 Then p := 0
      Else p := mem[cur_ptr+1].hh.rh;
    End;
  If p=0 Then goto 10;
  If (abs(cur_list.mode_field)=203)Or((abs(cur_list.mode_field)=1)And(mem[p
     ].hh.b0<>1))Or((abs(cur_list.mode_field)=102)And(mem[p].hh.b0<>0))Then
    Begin
      Begin
        If interaction=3 Then;
        print_nl(263);
        print(1109);
      End;
      Begin
        help_ptr := 3;
        help_line[2] := 1110;
        help_line[1] := 1111;
        help_line[0] := 1112;
      End;
      error;
      goto 10;
    End;
  If c=1 Then mem[cur_list.tail_field].hh.rh := copy_node_list(mem[p+5].hh.
                                                rh)
  Else
    Begin
      mem[cur_list.tail_field].hh.rh := mem[p+5].hh.rh;
      If cur_val<256 Then eqtb[3683+cur_val].hh.rh := 0
      Else
        Begin
          find_sa_element(4,cur_val,false);
          If cur_ptr<>0 Then
            Begin
              mem[cur_ptr+1].hh.rh := 0;
              mem[cur_ptr+1].hh.lh := mem[cur_ptr+1].hh.lh+1;
              delete_sa_ref(cur_ptr);
            End;
        End;
      free_node(p,7);
    End;
  30: While mem[cur_list.tail_field].hh.rh<>0 Do
        cur_list.tail_field := mem[
                               cur_list.tail_field].hh.rh;
  10:
End;
{:1110}{1113:}
Procedure append_italic_correction;

Label 10;

Var p: halfword;
  f: internal_font_number;
Begin
  If cur_list.tail_field<>cur_list.head_field Then
    Begin
      If (cur_list
         .tail_field>=hi_mem_min)Then p := cur_list.tail_field
      Else If mem[cur_list
              .tail_field].hh.b0=6 Then p := cur_list.tail_field+1
      Else goto 10;
      f := mem[p].hh.b0;
      Begin
        mem[cur_list.tail_field].hh.rh := new_kern(font_info[italic_base[f]+
                                          (font_info[char_base[f]+mem[p].hh.b1].qqqq.b2-0)Div 4].int
                                          );
        cur_list.tail_field := mem[cur_list.tail_field].hh.rh;
      End;
      mem[cur_list.tail_field].hh.b1 := 1;
    End;
  10:
End;
{:1113}{1117:}
Procedure append_discretionary;

Var c: integer;
Begin
  Begin
    mem[cur_list.tail_field].hh.rh := new_disc;
    cur_list.tail_field := mem[cur_list.tail_field].hh.rh;
  End;
  If cur_chr=1 Then
    Begin
      c := hyphen_char[eqtb[3939].hh.rh];
      If c>=0 Then If c<256 Then mem[cur_list.tail_field+1].hh.lh :=
                                                                     new_character(eqtb[3939].hh.rh,
                                                                     c);
    End
  Else
    Begin
      save_ptr := save_ptr+1;
      save_stack[save_ptr-1].int := 0;
      new_save_level(10);
      scan_left_brace;
      push_nest;
      cur_list.mode_field := -102;
      cur_list.aux_field.hh.lh := 1000;
    End;
End;{:1117}{1119:}
Procedure build_discretionary;

Label 30,10;

Var p,q: halfword;
  n: integer;
Begin
  unsave;{1121:}
  q := cur_list.head_field;
  p := mem[q].hh.rh;
  n := 0;
  While p<>0 Do
    Begin
      If Not(p>=hi_mem_min)Then If mem[p].hh.b0>2 Then If
                                                          mem[p].hh.b0<>11 Then If mem[p].hh.b0<>6
                                                                                  Then
                                                                                  Begin
                                                                                    Begin
                                                                                      If interaction
                                                                                         =3 Then;
                                                                                      print_nl(263);
                                                                                      print(1119);
                                                                                    End;
                                                                                    Begin
                                                                                      help_ptr := 1;
                                                                                      help_line[0]
                                                                                      := 1120;
                                                                                    End;
                                                                                    error;
                                                                                    begin_diagnostic
                                                                                    ;
                                                                                    print_nl(1121);
                                                                                    show_box(p);
                                                                                    end_diagnostic(
                                                                                                true
                                                                                    );
                                                                                    flush_node_list(
                                                                                                   p
                                                                                    );
                                                                                    mem[q].hh.rh :=
                                                                                                   0
                                                                                    ;
                                                                                    goto 30;
                                                                                  End;
      q := p;
      p := mem[q].hh.rh;
      n := n+1;
    End;
  30:{:1121};
  p := mem[cur_list.head_field].hh.rh;
  pop_nest;
  Case save_stack[save_ptr-1].int Of
    0: mem[cur_list.tail_field+1].hh.lh := p
    ;
    1: mem[cur_list.tail_field+1].hh.rh := p;
    2:{1120:}
       Begin
         If (n>0)And(abs(cur_list.mode_field)=203)Then
           Begin
             Begin
               If interaction=3 Then;
               print_nl(263);
               print(1113);
             End;
             print_esc(352);
             Begin
               help_ptr := 2;
               help_line[1] := 1114;
               help_line[0] := 1115;
             End;
             flush_node_list(p);
             n := 0;
             error;
           End
         Else mem[cur_list.tail_field].hh.rh := p;
         If n<=255 Then mem[cur_list.tail_field].hh.b1 := n
         Else
           Begin
             Begin
               If
                  interaction=3 Then;
               print_nl(263);
               print(1116);
             End;
             Begin
               help_ptr := 2;
               help_line[1] := 1117;
               help_line[0] := 1118;
             End;
             error;
           End;
         If n>0 Then cur_list.tail_field := q;
         save_ptr := save_ptr-1;
         goto 10;
       End{:1120};
  End;
  save_stack[save_ptr-1].int := save_stack[save_ptr-1].int+1;
  new_save_level(10);
  scan_left_brace;
  push_nest;
  cur_list.mode_field := -102;
  cur_list.aux_field.hh.lh := 1000;
  10:
End;
{:1119}{1123:}
Procedure make_accent;

Var s,t: real;
  p,q,r: halfword;
  f: internal_font_number;
  a,h,x,w,delta: scaled;
  i: four_quarters;
Begin
  scan_char_num;
  f := eqtb[3939].hh.rh;
  p := new_character(f,cur_val);
  If p<>0 Then
    Begin
      x := font_info[5+param_base[f]].int;
      s := font_info[1+param_base[f]].int/65536.0;
      a := font_info[width_base[f]+font_info[char_base[f]+mem[p].hh.b1].qqqq.b0]
           .int;
      do_assignments;{1124:}
      q := 0;
      f := eqtb[3939].hh.rh;
      If (cur_cmd=11)Or(cur_cmd=12)Or(cur_cmd=68)Then q := new_character(f,
                                                           cur_chr)
      Else If cur_cmd=16 Then
             Begin
               scan_char_num;
               q := new_character(f,cur_val);
             End
      Else back_input{:1124};
      If q<>0 Then{1125:}
        Begin
          t := font_info[1+param_base[f]].int/65536.0;
          i := font_info[char_base[f]+mem[q].hh.b1].qqqq;
          w := font_info[width_base[f]+i.b0].int;
          h := font_info[height_base[f]+(i.b1-0)Div 16].int;
          If h<>x Then
            Begin
              p := hpack(p,0,1);
              mem[p+4].int := x-h;
            End;
          delta := round((w-a)/2.0+h*t-x*s);
          r := new_kern(delta);
          mem[r].hh.b1 := 2;
          mem[cur_list.tail_field].hh.rh := r;
          mem[r].hh.rh := p;
          cur_list.tail_field := new_kern(-a-delta);
          mem[cur_list.tail_field].hh.b1 := 2;
          mem[p].hh.rh := cur_list.tail_field;
          p := q;
        End{:1125};
      mem[cur_list.tail_field].hh.rh := p;
      cur_list.tail_field := p;
      cur_list.aux_field.hh.lh := 1000;
    End;
End;
{:1123}{1127:}
Procedure align_error;
Begin
  If abs(align_state)>2 Then{1128:}
    Begin
      Begin
        If interaction=3 Then
        ;
        print_nl(263);
        print(1126);
      End;
      print_cmd_chr(cur_cmd,cur_chr);
      If cur_tok=1062 Then
        Begin
          Begin
            help_ptr := 6;
            help_line[5] := 1127;
            help_line[4] := 1128;
            help_line[3] := 1129;
            help_line[2] := 1130;
            help_line[1] := 1131;
            help_line[0] := 1132;
          End;
        End
      Else
        Begin
          Begin
            help_ptr := 5;
            help_line[4] := 1127;
            help_line[3] := 1133;
            help_line[2] := 1130;
            help_line[1] := 1131;
            help_line[0] := 1132;
          End;
        End;
      error;
    End{:1128}
  Else
    Begin
      back_input;
      If align_state<0 Then
        Begin
          Begin
            If interaction=3 Then;
            print_nl(263);
            print(666);
          End;
          align_state := align_state+1;
          cur_tok := 379;
        End
      Else
        Begin
          Begin
            If interaction=3 Then;
            print_nl(263);
            print(1122);
          End;
          align_state := align_state-1;
          cur_tok := 637;
        End;
      Begin
        help_ptr := 3;
        help_line[2] := 1123;
        help_line[1] := 1124;
        help_line[0] := 1125;
      End;
      ins_error;
    End;
End;{:1127}{1129:}
Procedure no_align_error;
Begin
  Begin
    If interaction=3 Then;
    print_nl(263);
    print(1126);
  End;
  print_esc(530);
  Begin
    help_ptr := 2;
    help_line[1] := 1134;
    help_line[0] := 1135;
  End;
  error;
End;
Procedure omit_error;
Begin
  Begin
    If interaction=3 Then;
    print_nl(263);
    print(1126);
  End;
  print_esc(533);
  Begin
    help_ptr := 2;
    help_line[1] := 1136;
    help_line[0] := 1135;
  End;
  error;
End;
{:1129}{1131:}
Procedure do_endv;
Begin
  base_ptr := input_ptr;
  input_stack[base_ptr] := cur_input;
  While (input_stack[base_ptr].index_field<>2)And(input_stack[base_ptr].
        loc_field=0)And(input_stack[base_ptr].state_field=0) Do
    base_ptr :=
                base_ptr-1;
  If (input_stack[base_ptr].index_field<>2)Or(input_stack[base_ptr].
     loc_field<>0)Or(input_stack[base_ptr].state_field<>0)Then fatal_error(
                                                                           604);
  If cur_group=6 Then
    Begin
      end_graf;
      If fin_col Then fin_row;
    End
  Else off_save;
End;{:1131}{1135:}
Procedure cs_error;
Begin
  Begin
    If interaction=3 Then;
    print_nl(263);
    print(788);
  End;
  print_esc(508);
  Begin
    help_ptr := 1;
    help_line[0] := 1138;
  End;
  error;
End;
{:1135}{1136:}
Procedure push_math(c:group_code);
Begin
  push_nest;
  cur_list.mode_field := -203;
  cur_list.aux_field.int := 0;
  new_save_level(c);
End;{:1136}{1138:}{1468:}
Procedure just_copy(p,h,t:halfword);

Label 40,45;

Var r: halfword;
  words: 0..5;
Begin
  While p<>0 Do
    Begin
      words := 1;
      If (p>=hi_mem_min)Then r := get_avail
      Else Case mem[p].hh.b0 Of
             0,1:
                  Begin
                    r
                    := get_node(7);
                    mem[r+6] := mem[p+6];
                    mem[r+5] := mem[p+5];
                    words := 5;
                    mem[r+5].hh.rh := 0;
                  End;
             2:
                Begin
                  r := get_node(4);
                  words := 4;
                End;
             6:
                Begin
                  r := get_avail;
                  mem[r] := mem[p+1];
                  goto 40;
                End;
             11,9:
                   Begin
                     r := get_node(2);
                     words := 2;
                   End;
             10:
                 Begin
                   r := get_node(2);
                   mem[mem[p+1].hh.lh].hh.rh := mem[mem[p+1].hh.lh].hh.rh+1;
                   mem[r+1].hh.lh := mem[p+1].hh.lh;
                   mem[r+1].hh.rh := 0;
                 End;
             8:{1357:}Case mem[p].hh.b1 Of
                        0:
                           Begin
                             r := get_node(3);
                             words := 3;
                           End;
                        1,3:
                             Begin
                               r := get_node(2);
                               mem[mem[p+1].hh.rh].hh.lh := mem[mem[p+1].hh.rh].hh.lh+1;
                               words := 2;
                             End;
                        2,4:
                             Begin
                               r := get_node(2);
                               words := 2;
                             End;
                        others: confusion(1308)
                End{:1357};
             others: goto 45
        End;
      While words>0 Do
        Begin
          words := words-1;
          mem[r+words] := mem[p+words];
        End;
      40: mem[h].hh.rh := r;
      h := r;
      45: p := mem[p].hh.rh;
    End;
  mem[h].hh.rh := t;
End;
{:1468}{1473:}
Procedure just_reverse(p:halfword);

Label 40,30;

Var l: halfword;
  t: halfword;
  q: halfword;
  m,n: halfword;
Begin
  m := 0;
  n := 0;
  If mem[29997].hh.rh=0 Then
    Begin
      just_copy(mem[p].hh.rh,29997,0);
      q := mem[29997].hh.rh;
    End
  Else
    Begin
      q := mem[p].hh.rh;
      mem[p].hh.rh := 0;
      flush_node_list(mem[29997].hh.rh);
    End;
  t := new_edge(cur_dir,0);
  l := t;
  cur_dir := 1-cur_dir;
  While q<>0 Do
    If (q>=hi_mem_min)Then Repeat
                             p := q;
                             q := mem[p].hh.rh;
                             mem[p].hh.rh := l;
                             l := p;
      Until Not(q>=hi_mem_min)
    Else
      Begin
        p := q;
        q := mem[p].hh.rh;
        If mem[p].hh.b0=9 Then{1474:}If odd(mem[p].hh.b1)Then If mem[LR_ptr].hh.
                                                                 lh<>(4*(mem[p].hh.b1 Div 4)+3)Then
                                                                Begin
                                                                  mem[p].hh.b0 := 11;
                                                                  LR_problems := LR_problems+1;
                                                                End
        Else
          Begin
            Begin
              temp_ptr := LR_ptr;
              LR_ptr := mem[temp_ptr].hh.rh;
              Begin
                mem[temp_ptr].hh.rh := avail;
                avail := temp_ptr;{dyn_used:=dyn_used-1;}
              End;
            End;
            If n>0 Then
              Begin
                n := n-1;
                mem[p].hh.b1 := mem[p].hh.b1-1;
              End
            Else
              Begin
                If m>0 Then m := m-1
                Else goto 40;
                mem[p].hh.b0 := 11;
              End;
          End
        Else
          Begin
            Begin
              temp_ptr := get_avail;
              mem[temp_ptr].hh.lh := (4*(mem[p].hh.b1 Div 4)+3);
              mem[temp_ptr].hh.rh := LR_ptr;
              LR_ptr := temp_ptr;
            End;
            If (n>0)Or((mem[p].hh.b1 Div 8)<>cur_dir)Then
              Begin
                n := n+1;
                mem[p].hh.b1 := mem[p].hh.b1+1;
              End
            Else
              Begin
                mem[p].hh.b0 := 11;
                m := m+1;
              End;
          End{:1474};
        mem[p].hh.rh := l;
        l := p;
      End;
  goto 30;
  40: mem[t+1].int := mem[p+1].int;
  mem[t].hh.rh := q;
  free_node(p,2);
  30: mem[29997].hh.rh := l;
End;{:1473}
Procedure init_math;

Label 21,40,45,30;

Var w: scaled;
  j: halfword;
  x: integer;
  l: scaled;
  s: scaled;
  p: halfword;
  q: halfword;
  f: internal_font_number;
  n: integer;
  v: scaled;
  d: scaled;
Begin
  get_token;
  If (cur_cmd=3)And(cur_list.mode_field>0)Then{1145:}
    Begin
      j := 0;
      w := -1073741823;
      If cur_list.head_field=cur_list.tail_field Then{1467:}
        Begin
          pop_nest;
{1466:}
          If cur_list.eTeX_aux_field=0 Then x := 0
          Else If mem[cur_list.
                  eTeX_aux_field].hh.lh>=8 Then x := -1
          Else x := 1{:1466};
        End{:1467}
      Else
        Begin
          line_break(true);
{1146:}{1469:}
          If (eTeX_mode=1)Then{1475:}
            Begin
              If eqtb[2890].hh.rh=0 Then
                j := new_kern(0)
              Else j := new_param_glue(8);
              If eqtb[2889].hh.rh=0 Then p := new_kern(0)
              Else p := new_param_glue(7);
              mem[p].hh.rh := j;
              j := new_null_box;
              mem[j+1].int := mem[just_box+1].int;
              mem[j+4].int := mem[just_box+4].int;
              mem[j+5].hh.rh := p;
              mem[j+5].hh.b1 := mem[just_box+5].hh.b1;
              mem[j+5].hh.b0 := mem[just_box+5].hh.b0;
              mem[j+6].gr := mem[just_box+6].gr;
            End{:1475};
          v := mem[just_box+4].int;
{1466:}
          If cur_list.eTeX_aux_field=0 Then x := 0
          Else If mem[cur_list.
                  eTeX_aux_field].hh.lh>=8 Then x := -1
          Else x := 1{:1466};
          If x>=0 Then
            Begin
              p := mem[just_box+5].hh.rh;
              mem[29997].hh.rh := 0;
            End
          Else
            Begin
              v := -v-mem[just_box+1].int;
              p := new_math(0,6);
              mem[29997].hh.rh := p;
              just_copy(mem[just_box+5].hh.rh,p,new_math(0,7));
              cur_dir := 1;
            End;
          v := v+2*font_info[6+param_base[eqtb[3939].hh.rh]].int;
          If (eqtb[5332].int>0)Then{1441:}
            Begin
              temp_ptr := get_avail;
              mem[temp_ptr].hh.lh := 0;
              mem[temp_ptr].hh.rh := LR_ptr;
              LR_ptr := temp_ptr;
            End{:1441}{:1469};
          While p<>0 Do
            Begin{1147:}
              21: If (p>=hi_mem_min)Then
                    Begin
                      f := mem[p].hh.b0
                      ;
                      d := font_info[width_base[f]+font_info[char_base[f]+mem[p].hh.b1].qqqq.b0]
                           .int;
                      goto 40;
                    End;
              Case mem[p].hh.b0 Of
                0,1,2:
                       Begin
                         d := mem[p+1].int;
                         goto 40;
                       End;
                6:{652:}
                   Begin
                     mem[29988] := mem[p+1];
                     mem[29988].hh.rh := mem[p].hh.rh;
                     p := 29988;
                     goto 21;
                   End{:652};
                11: d := mem[p+1].int;{1471:}
                9:
                   Begin
                     d := mem[p+1].int;
                     If (eqtb[5332].int>0)Then{1472:}If odd(mem[p].hh.b1)Then
                                                       Begin
                                                         If mem[
                                                            LR_ptr].hh.lh=(4*(mem[p].hh.b1 Div 4)+3)
                                                           Then
                                                           Begin
                                                             temp_ptr := LR_ptr;
                                                             LR_ptr := mem[temp_ptr].hh.rh;
                                                             Begin
                                                               mem[temp_ptr].hh.rh := avail;
                                                               avail := temp_ptr;
                                                               {dyn_used:=dyn_used-1;}
                                                             End;
                                                           End
                                                         Else If mem[p].hh.b1>4 Then
                                                                Begin
                                                                  w := 1073741823;
                                                                  goto 30;
                                                                End
                                                       End
                     Else
                       Begin
                         Begin
                           temp_ptr := get_avail;
                           mem[temp_ptr].hh.lh := (4*(mem[p].hh.b1 Div 4)+3);
                           mem[temp_ptr].hh.rh := LR_ptr;
                           LR_ptr := temp_ptr;
                         End;
                         If (mem[p].hh.b1 Div 8)<>cur_dir Then
                           Begin
                             just_reverse(p);
                             p := 29997;
                           End;
                       End{:1472}
                     Else If mem[p].hh.b1>=4 Then
                            Begin
                              w := 1073741823;
                              goto 30;
                            End;
                   End;
                14:
                    Begin
                      d := mem[p+1].int;
                      cur_dir := mem[p].hh.b1;
                    End;
{:1471}
                10:{1148:}
                    Begin
                      q := mem[p+1].hh.lh;
                      d := mem[q+1].int;
                      If mem[just_box+5].hh.b0=1 Then
                        Begin
                          If (mem[just_box+5].hh.b1=mem[q].hh
                             .b0)And(mem[q+2].int<>0)Then v := 1073741823;
                        End
                      Else If mem[just_box+5].hh.b0=2 Then
                             Begin
                               If (mem[just_box+5].hh.b1=
                                  mem[q].hh.b1)And(mem[q+3].int<>0)Then v := 1073741823;
                             End;
                      If mem[p].hh.b1>=100 Then goto 40;
                    End{:1148};
                8:{1361:}d := 0{:1361};
                others: d := 0
              End{:1147};
              If v<1073741823 Then v := v+d;
              goto 45;
              40: If v<1073741823 Then
                    Begin
                      v := v+d;
                      w := v;
                    End
                  Else
                    Begin
                      w := 1073741823;
                      goto 30;
                    End;
              45: p := mem[p].hh.rh;
            End;
          30:{1470:}If (eqtb[5332].int>0)Then
                      Begin
                        While LR_ptr<>0 Do
                          Begin
                            temp_ptr := LR_ptr;
                            LR_ptr := mem[temp_ptr].hh.rh;
                            Begin
                              mem[temp_ptr].hh.rh := avail;
                              avail := temp_ptr;{dyn_used:=dyn_used-1;}
                            End;
                          End;
                        If LR_problems<>0 Then
                          Begin
                            w := 1073741823;
                            LR_problems := 0;
                          End;
                      End;
          cur_dir := 0;
          flush_node_list(mem[29997].hh.rh){:1470}{:1146};
        End;
{1149:}
      If eqtb[3412].hh.rh=0 Then If (eqtb[5862].int<>0)And(((eqtb[5309].
                                    int>=0)And(cur_list.pg_field+2>eqtb[5309].int))Or(cur_list.
                                    pg_field+1<-
                                    eqtb[5309].int))Then
                                   Begin
                                     l := eqtb[5848].int-abs(eqtb[5862].int);
                                     If eqtb[5862].int>0 Then s := eqtb[5862].int
                                     Else s := 0;
                                   End
      Else
        Begin
          l := eqtb[5848].int;
          s := 0;
        End
      Else
        Begin
          n := mem[eqtb[3412].hh.rh].hh.lh;
          If cur_list.pg_field+2>=n Then p := eqtb[3412].hh.rh+2*n
          Else p := eqtb[3412
                    ].hh.rh+2*(cur_list.pg_field+2);
          s := mem[p-1].int;
          l := mem[p].int;
        End{:1149};
      push_math(15);
      cur_list.mode_field := 203;
      eq_word_define(5312,-1);
      eq_word_define(5858,w);
      cur_list.eTeX_aux_field := j;
      If (eTeX_mode=1)Then eq_word_define(5328,x);
      eq_word_define(5859,l);
      eq_word_define(5860,s);
      If eqtb[3416].hh.rh<>0 Then begin_token_list(eqtb[3416].hh.rh,9);
      If nest_ptr=1 Then build_page;
    End{:1145}
  Else
    Begin
      back_input;
{1139:}
      Begin
        push_math(15);
        eq_word_define(5312,-1);
        If eqtb[3415].hh.rh<>0 Then begin_token_list(eqtb[3415].hh.rh,8);
      End{:1139};
    End;
End;{:1138}{1142:}
Procedure start_eq_no;
Begin
  save_stack[save_ptr+0].int := cur_chr;
  save_ptr := save_ptr+1;
{1139:}
  Begin
    push_math(15);
    eq_word_define(5312,-1);
    If eqtb[3415].hh.rh<>0 Then begin_token_list(eqtb[3415].hh.rh,8);
  End{:1139};
End;{:1142}{1151:}
Procedure scan_math(p:halfword);

Label 20,21,10;

Var c: integer;
Begin
  20:{404:}Repeat
             get_x_token;
      Until (cur_cmd<>10)And(cur_cmd<>0){:404};
  21: Case cur_cmd Of
        11,12,68:
                  Begin
                    c := eqtb[5012+cur_chr].hh.rh-0;
                    If c=32768 Then
                      Begin{1152:}
                        Begin
                          cur_cs := cur_chr+1;
                          cur_cmd := eqtb[cur_cs].hh.b0;
                          cur_chr := eqtb[cur_cs].hh.rh;
                          x_token;
                          back_input;
                        End{:1152};
                        goto 20;
                      End;
                  End;
        16:
            Begin
              scan_char_num;
              cur_chr := cur_val;
              cur_cmd := 68;
              goto 21;
            End;
        17:
            Begin
              scan_fifteen_bit_int;
              c := cur_val;
            End;
        69: c := cur_chr;
        15:
            Begin
              scan_twenty_seven_bit_int;
              c := cur_val Div 4096;
            End;
        others:{1153:}
                Begin
                  back_input;
                  scan_left_brace;
                  save_stack[save_ptr+0].int := p;
                  save_ptr := save_ptr+1;
                  push_math(9);
                  goto 10;
                End{:1153}
      End;
  mem[p].hh.rh := 1;
  mem[p].hh.b1 := c Mod 256+0;
  If (c>=28672)And((eqtb[5312].int>=0)And(eqtb[5312].int<16))Then mem[p].hh
    .b0 := eqtb[5312].int
  Else mem[p].hh.b0 := (c Div 256)Mod 16;
  10:
End;
{:1151}{1155:}
Procedure set_math_char(c:integer);

Var p: halfword;
Begin
  If c>=32768 Then{1152:}
    Begin
      cur_cs := cur_chr+1;
      cur_cmd := eqtb[cur_cs].hh.b0;
      cur_chr := eqtb[cur_cs].hh.rh;
      x_token;
      back_input;
    End{:1152}
  Else
    Begin
      p := new_noad;
      mem[p+1].hh.rh := 1;
      mem[p+1].hh.b1 := c Mod 256+0;
      mem[p+1].hh.b0 := (c Div 256)Mod 16;
      If c>=28672 Then
        Begin
          If ((eqtb[5312].int>=0)And(eqtb[5312].int<16))Then
            mem[p+1].hh.b0 := eqtb[5312].int;
          mem[p].hh.b0 := 16;
        End
      Else mem[p].hh.b0 := 16+(c Div 4096);
      mem[cur_list.tail_field].hh.rh := p;
      cur_list.tail_field := p;
    End;
End;
{:1155}{1159:}
Procedure math_limit_switch;

Label 10;
Begin
  If cur_list.head_field<>cur_list.tail_field Then If mem[cur_list.
                                                      tail_field].hh.b0=17 Then
                                                     Begin
                                                       mem[cur_list.tail_field].hh.b1 := cur_chr;
                                                       goto 10;
                                                     End;
  Begin
    If interaction=3 Then;
    print_nl(263);
    print(1142);
  End;
  Begin
    help_ptr := 1;
    help_line[0] := 1143;
  End;
  error;
  10:
End;
{:1159}{1160:}
Procedure scan_delimiter(p:halfword;r:boolean);
Begin
  If r Then scan_twenty_seven_bit_int
  Else
    Begin{404:}
      Repeat
        get_x_token;
      Until (cur_cmd<>10)And(cur_cmd<>0){:404};
      Case cur_cmd Of
        11,12: cur_val := eqtb[5589+cur_chr].int;
        15: scan_twenty_seven_bit_int;
        others: cur_val := -1
      End;
    End;
  If cur_val<0 Then{1161:}
    Begin
      Begin
        If interaction=3 Then;
        print_nl(263);
        print(1144);
      End;
      Begin
        help_ptr := 6;
        help_line[5] := 1145;
        help_line[4] := 1146;
        help_line[3] := 1147;
        help_line[2] := 1148;
        help_line[1] := 1149;
        help_line[0] := 1150;
      End;
      back_error;
      cur_val := 0;
    End{:1161};
  mem[p].qqqq.b0 := (cur_val Div 1048576)Mod 16;
  mem[p].qqqq.b1 := (cur_val Div 4096)Mod 256+0;
  mem[p].qqqq.b2 := (cur_val Div 256)Mod 16;
  mem[p].qqqq.b3 := cur_val Mod 256+0;
End;
{:1160}{1163:}
Procedure math_radical;
Begin
  Begin
    mem[cur_list.tail_field].hh.rh := get_node(5);
    cur_list.tail_field := mem[cur_list.tail_field].hh.rh;
  End;
  mem[cur_list.tail_field].hh.b0 := 24;
  mem[cur_list.tail_field].hh.b1 := 0;
  mem[cur_list.tail_field+1].hh := empty_field;
  mem[cur_list.tail_field+3].hh := empty_field;
  mem[cur_list.tail_field+2].hh := empty_field;
  scan_delimiter(cur_list.tail_field+4,true);
  scan_math(cur_list.tail_field+1);
End;{:1163}{1165:}
Procedure math_ac;
Begin
  If cur_cmd=45 Then{1166:}
    Begin
      Begin
        If interaction=3 Then;
        print_nl(263);
        print(1151);
      End;
      print_esc(526);
      print(1152);
      Begin
        help_ptr := 2;
        help_line[1] := 1153;
        help_line[0] := 1154;
      End;
      error;
    End{:1166};
  Begin
    mem[cur_list.tail_field].hh.rh := get_node(5);
    cur_list.tail_field := mem[cur_list.tail_field].hh.rh;
  End;
  mem[cur_list.tail_field].hh.b0 := 28;
  mem[cur_list.tail_field].hh.b1 := 0;
  mem[cur_list.tail_field+1].hh := empty_field;
  mem[cur_list.tail_field+3].hh := empty_field;
  mem[cur_list.tail_field+2].hh := empty_field;
  mem[cur_list.tail_field+4].hh.rh := 1;
  scan_fifteen_bit_int;
  mem[cur_list.tail_field+4].hh.b1 := cur_val Mod 256+0;
  If (cur_val>=28672)And((eqtb[5312].int>=0)And(eqtb[5312].int<16))Then mem
    [cur_list.tail_field+4].hh.b0 := eqtb[5312].int
  Else mem[cur_list.
    tail_field+4].hh.b0 := (cur_val Div 256)Mod 16;
  scan_math(cur_list.tail_field+1);
End;
{:1165}{1172:}
Procedure append_choices;
Begin
  Begin
    mem[cur_list.tail_field].hh.rh := new_choice;
    cur_list.tail_field := mem[cur_list.tail_field].hh.rh;
  End;
  save_ptr := save_ptr+1;
  save_stack[save_ptr-1].int := 0;
  push_math(13);
  scan_left_brace;
End;
{:1172}{1174:}{1184:}
Function fin_mlist(p:halfword): halfword;

Var q: halfword;
Begin
  If cur_list.aux_field.int<>0 Then{1185:}
    Begin
      mem[cur_list.
      aux_field.int+3].hh.rh := 3;
      mem[cur_list.aux_field.int+3].hh.lh := mem[cur_list.head_field].hh.rh;
      If p=0 Then q := cur_list.aux_field.int
      Else
        Begin
          q := mem[cur_list.
               aux_field.int+2].hh.lh;
          If (mem[q].hh.b0<>30)Or(cur_list.eTeX_aux_field=0)Then confusion(888);
          mem[cur_list.aux_field.int+2].hh.lh := mem[cur_list.eTeX_aux_field].hh.rh;
          mem[cur_list.eTeX_aux_field].hh.rh := cur_list.aux_field.int;
          mem[cur_list.aux_field.int].hh.rh := p;
        End;
    End{:1185}
  Else
    Begin
      mem[cur_list.tail_field].hh.rh := p;
      q := mem[cur_list.head_field].hh.rh;
    End;
  pop_nest;
  fin_mlist := q;
End;
{:1184}
Procedure build_choices;

Label 10;

Var p: halfword;
Begin
  unsave;
  p := fin_mlist(0);
  Case save_stack[save_ptr-1].int Of
    0: mem[cur_list.tail_field+1].hh.lh := p
    ;
    1: mem[cur_list.tail_field+1].hh.rh := p;
    2: mem[cur_list.tail_field+2].hh.lh := p;
    3:
       Begin
         mem[cur_list.tail_field+2].hh.rh := p;
         save_ptr := save_ptr-1;
         goto 10;
       End;
  End;
  save_stack[save_ptr-1].int := save_stack[save_ptr-1].int+1;
  push_math(13);
  scan_left_brace;
  10:
End;{:1174}{1176:}
Procedure sub_sup;

Var t: small_number;
  p: halfword;
Begin
  t := 0;
  p := 0;
  If cur_list.tail_field<>cur_list.head_field Then If (mem[cur_list.
                                                      tail_field].hh.b0>=16)And(mem[cur_list.
                                                      tail_field].hh.b0<30)Then
                                                     Begin
                                                       p
                                                       := cur_list.tail_field+2+cur_cmd-7;
                                                       t := mem[p].hh.rh;
                                                     End;
  If (p=0)Or(t<>0)Then{1177:}
    Begin
      Begin
        mem[cur_list.tail_field].hh.rh :=
                                          new_noad;
        cur_list.tail_field := mem[cur_list.tail_field].hh.rh;
      End;
      p := cur_list.tail_field+2+cur_cmd-7;
      If t<>0 Then
        Begin
          If cur_cmd=7 Then
            Begin
              Begin
                If interaction=3 Then;
                print_nl(263);
                print(1155);
              End;
              Begin
                help_ptr := 1;
                help_line[0] := 1156;
              End;
            End
          Else
            Begin
              Begin
                If interaction=3 Then;
                print_nl(263);
                print(1157);
              End;
              Begin
                help_ptr := 1;
                help_line[0] := 1158;
              End;
            End;
          error;
        End;
    End{:1177};
  scan_math(p);
End;{:1176}{1181:}
Procedure math_fraction;

Var c: small_number;
Begin
  c := cur_chr;
  If cur_list.aux_field.int<>0 Then{1183:}
    Begin
      If c>=3 Then
        Begin
          scan_delimiter(29988,false);
          scan_delimiter(29988,false);
        End;
      If c Mod 3=0 Then scan_dimen(false,false,false);
      Begin
        If interaction=3 Then;
        print_nl(263);
        print(1165);
      End;
      Begin
        help_ptr := 3;
        help_line[2] := 1166;
        help_line[1] := 1167;
        help_line[0] := 1168;
      End;
      error;
    End{:1183}
  Else
    Begin
      cur_list.aux_field.int := get_node(6);
      mem[cur_list.aux_field.int].hh.b0 := 25;
      mem[cur_list.aux_field.int].hh.b1 := 0;
      mem[cur_list.aux_field.int+2].hh.rh := 3;
      mem[cur_list.aux_field.int+2].hh.lh := mem[cur_list.head_field].hh.rh;
      mem[cur_list.aux_field.int+3].hh := empty_field;
      mem[cur_list.aux_field.int+4].qqqq := null_delimiter;
      mem[cur_list.aux_field.int+5].qqqq := null_delimiter;
      mem[cur_list.head_field].hh.rh := 0;
      cur_list.tail_field := cur_list.head_field;
{1182:}
      If c>=3 Then
        Begin
          scan_delimiter(cur_list.aux_field.int+4,false)
          ;
          scan_delimiter(cur_list.aux_field.int+5,false);
        End;
      Case c Mod 3 Of
        0:
           Begin
             scan_dimen(false,false,false);
             mem[cur_list.aux_field.int+1].int := cur_val;
           End;
        1: mem[cur_list.aux_field.int+1].int := 1073741824;
        2: mem[cur_list.aux_field.int+1].int := 0;
      End{:1182};
    End;
End;
{:1181}{1191:}
Procedure math_left_right;

Var t: small_number;
  p: halfword;
  q: halfword;
Begin
  t := cur_chr;
  If (t<>30)And(cur_group<>16)Then{1192:}
    Begin
      If cur_group=15 Then
        Begin
          scan_delimiter(29988,false);
          Begin
            If interaction=3 Then;
            print_nl(263);
            print(788);
          End;
          If t=1 Then
            Begin
              print_esc(889);
              Begin
                help_ptr := 1;
                help_line[0] := 1169;
              End;
            End
          Else
            Begin
              print_esc(888);
              Begin
                help_ptr := 1;
                help_line[0] := 1170;
              End;
            End;
          error;
        End
      Else off_save;
    End{:1192}
  Else
    Begin
      p := new_noad;
      mem[p].hh.b0 := t;
      scan_delimiter(p+1,false);
      If t=1 Then
        Begin
          mem[p].hh.b0 := 31;
          mem[p].hh.b1 := 1;
        End;
      If t=30 Then q := p
      Else
        Begin
          q := fin_mlist(p);
          unsave;
        End;
      If t<>31 Then
        Begin
          push_math(16);
          mem[cur_list.head_field].hh.rh := q;
          cur_list.tail_field := p;
          cur_list.eTeX_aux_field := p;
        End
      Else
        Begin
          Begin
            mem[cur_list.tail_field].hh.rh := new_noad;
            cur_list.tail_field := mem[cur_list.tail_field].hh.rh;
          End;
          mem[cur_list.tail_field].hh.b0 := 23;
          mem[cur_list.tail_field+1].hh.rh := 3;
          mem[cur_list.tail_field+1].hh.lh := q;
        End;
    End;
End;
{:1191}{1194:}{1479:}
Procedure app_display(j,b:halfword;d:scaled);

Var z: scaled;
  s: scaled;
  e: scaled;
  x: integer;
  p,q,r,t,u: halfword;
Begin
  s := eqtb[5860].int;
  x := eqtb[5328].int;
  If x=0 Then mem[b+4].int := s+d
  Else
    Begin
      z := eqtb[5859].int;
      p := b;
{1480:}
      If x>0 Then e := z-d-mem[p+1].int
      Else
        Begin
          e := d;
          d := z-e-mem[p+1].int;
        End;
      If j<>0 Then
        Begin
          b := copy_node_list(j);
          mem[b+3].int := mem[p+3].int;
          mem[b+2].int := mem[p+2].int;
          s := s-mem[b+4].int;
          d := d+s;
          e := e+mem[b+1].int-z-s;
        End;
      If (mem[p].hh.b1-0)=2 Then q := p
      Else
        Begin
          r := mem[p+5].hh.rh;
          free_node(p,7);
          If r=0 Then confusion(1378);
          If x>0 Then
            Begin
              p := r;
              Repeat
                q := r;
                r := mem[r].hh.rh;
              Until r=0;
            End
          Else
            Begin
              p := 0;
              q := r;
              Repeat
                t := mem[r].hh.rh;
                mem[r].hh.rh := p;
                p := r;
                r := t;
              Until r=0;
            End;
        End{:1480};{1481:}
      If j=0 Then
        Begin
          r := new_kern(0);
          t := new_kern(0);
        End
      Else
        Begin
          r := mem[b+5].hh.rh;
          t := mem[r].hh.rh;
        End;
      u := new_math(0,3);
      If mem[t].hh.b0=10 Then
        Begin
          j := new_skip_param(8);
          mem[q].hh.rh := j;
          mem[j].hh.rh := u;
          j := mem[t+1].hh.lh;
          mem[temp_ptr].hh.b0 := mem[j].hh.b0;
          mem[temp_ptr].hh.b1 := mem[j].hh.b1;
          mem[temp_ptr+1].int := e-mem[j+1].int;
          mem[temp_ptr+2].int := -mem[j+2].int;
          mem[temp_ptr+3].int := -mem[j+3].int;
          mem[u].hh.rh := t;
        End
      Else
        Begin
          mem[t+1].int := e;
          mem[t].hh.rh := u;
          mem[q].hh.rh := t;
        End;
      u := new_math(0,2);
      If mem[r].hh.b0=10 Then
        Begin
          j := new_skip_param(7);
          mem[u].hh.rh := j;
          mem[j].hh.rh := p;
          j := mem[r+1].hh.lh;
          mem[temp_ptr].hh.b0 := mem[j].hh.b0;
          mem[temp_ptr].hh.b1 := mem[j].hh.b1;
          mem[temp_ptr+1].int := d-mem[j+1].int;
          mem[temp_ptr+2].int := -mem[j+2].int;
          mem[temp_ptr+3].int := -mem[j+3].int;
          mem[r].hh.rh := u;
        End
      Else
        Begin
          mem[r+1].int := d;
          mem[r].hh.rh := p;
          mem[u].hh.rh := r;
          If j=0 Then
            Begin
              b := hpack(u,0,1);
              mem[b+4].int := s;
            End
          Else mem[b+5].hh.rh := u;
        End{:1481};
    End;
  append_to_vlist(b);
End;
{:1479}
Procedure after_math;

Var l: boolean;
  danger: boolean;
  m: integer;
  p: halfword;
  a: halfword;{1198:}
  b: halfword;
  w: scaled;
  z: scaled;
  e: scaled;
  q: scaled;
  d: scaled;
  s: scaled;
  g1,g2: small_number;
  r: halfword;
  t: halfword;
{:1198}{1476:}
  j: halfword;{:1476}
Begin
  danger := false;
{1477:}
  If cur_list.mode_field=203 Then j := cur_list.eTeX_aux_field{:1477}
  ;
{1195:}
  If (font_params[eqtb[3942].hh.rh]<22)Or(font_params[eqtb[3958].hh.
     rh]<22)Or(font_params[eqtb[3974].hh.rh]<22)Then
    Begin
      Begin
        If
           interaction=3 Then;
        print_nl(263);
        print(1171);
      End;
      Begin
        help_ptr := 3;
        help_line[2] := 1172;
        help_line[1] := 1173;
        help_line[0] := 1174;
      End;
      error;
      flush_math;
      danger := true;
    End
  Else If (font_params[eqtb[3943].hh.rh]<13)Or(font_params[eqtb[3959].
          hh.rh]<13)Or(font_params[eqtb[3975].hh.rh]<13)Then
         Begin
           Begin
             If
                interaction=3 Then;
             print_nl(263);
             print(1175);
           End;
           Begin
             help_ptr := 3;
             help_line[2] := 1176;
             help_line[1] := 1177;
             help_line[0] := 1178;
           End;
           error;
           flush_math;
           danger := true;
         End{:1195};
  m := cur_list.mode_field;
  l := false;
  p := fin_mlist(0);
  If cur_list.mode_field=-m Then
    Begin{1197:}
      Begin
        get_x_token;
        If cur_cmd<>3 Then
          Begin
            Begin
              If interaction=3 Then;
              print_nl(263);
              print(1179);
            End;
            Begin
              help_ptr := 2;
              help_line[1] := 1180;
              help_line[0] := 1181;
            End;
            back_error;
          End;
      End{:1197};
      cur_mlist := p;
      cur_style := 2;
      mlist_penalties := false;
      mlist_to_hlist;
      a := hpack(mem[29997].hh.rh,0,1);
      mem[a].hh.b1 := 2;
      unsave;
      save_ptr := save_ptr-1;
      If save_stack[save_ptr+0].int=1 Then l := true;
      danger := false;
{1477:}
      If cur_list.mode_field=203 Then j := cur_list.eTeX_aux_field{:1477}
      ;
{1195:}
      If (font_params[eqtb[3942].hh.rh]<22)Or(font_params[eqtb[3958].hh.
         rh]<22)Or(font_params[eqtb[3974].hh.rh]<22)Then
        Begin
          Begin
            If
               interaction=3 Then;
            print_nl(263);
            print(1171);
          End;
          Begin
            help_ptr := 3;
            help_line[2] := 1172;
            help_line[1] := 1173;
            help_line[0] := 1174;
          End;
          error;
          flush_math;
          danger := true;
        End
      Else If (font_params[eqtb[3943].hh.rh]<13)Or(font_params[eqtb[3959].
              hh.rh]<13)Or(font_params[eqtb[3975].hh.rh]<13)Then
             Begin
               Begin
                 If
                    interaction=3 Then;
                 print_nl(263);
                 print(1175);
               End;
               Begin
                 help_ptr := 3;
                 help_line[2] := 1176;
                 help_line[1] := 1177;
                 help_line[0] := 1178;
               End;
               error;
               flush_math;
               danger := true;
             End{:1195};
      m := cur_list.mode_field;
      p := fin_mlist(0);
    End
  Else a := 0;
  If m<0 Then{1196:}
    Begin
      Begin
        mem[cur_list.tail_field].hh.rh := new_math(
                                          eqtb[5846].int,0);
        cur_list.tail_field := mem[cur_list.tail_field].hh.rh;
      End;
      cur_mlist := p;
      cur_style := 2;
      mlist_penalties := (cur_list.mode_field>0);
      mlist_to_hlist;
      mem[cur_list.tail_field].hh.rh := mem[29997].hh.rh;
      While mem[cur_list.tail_field].hh.rh<>0 Do
        cur_list.tail_field := mem[
                               cur_list.tail_field].hh.rh;
      Begin
        mem[cur_list.tail_field].hh.rh := new_math(eqtb[5846].int,1);
        cur_list.tail_field := mem[cur_list.tail_field].hh.rh;
      End;
      cur_list.aux_field.hh.lh := 1000;
      unsave;
    End{:1196}
  Else
    Begin
      If a=0 Then{1197:}
        Begin
          get_x_token;
          If cur_cmd<>3 Then
            Begin
              Begin
                If interaction=3 Then;
                print_nl(263);
                print(1179);
              End;
              Begin
                help_ptr := 2;
                help_line[1] := 1180;
                help_line[0] := 1181;
              End;
              back_error;
            End;
        End{:1197};{1199:}
      cur_mlist := p;
      cur_style := 0;
      mlist_penalties := false;
      mlist_to_hlist;
      p := mem[29997].hh.rh;
      adjust_tail := 29995;
      b := hpack(p,0,1);
      p := mem[b+5].hh.rh;
      t := adjust_tail;
      adjust_tail := 0;
      w := mem[b+1].int;
      z := eqtb[5859].int;
      s := eqtb[5860].int;
      If eqtb[5328].int<0 Then s := -s-z;
      If (a=0)Or danger Then
        Begin
          e := 0;
          q := 0;
        End
      Else
        Begin
          e := mem[a+1].int;
          q := e+font_info[6+param_base[eqtb[3942].hh.rh]].int;
        End;
      If w+q>z Then{1201:}
        Begin
          If (e<>0)And((w-total_shrink[0]+q<=z)Or(
             total_shrink[1]<>0)Or(total_shrink[2]<>0)Or(total_shrink[3]<>0))Then
            Begin
              free_node(b,7);
              b := hpack(p,z-q,0);
            End
          Else
            Begin
              e := 0;
              If w>z Then
                Begin
                  free_node(b,7);
                  b := hpack(p,z,0);
                End;
            End;
          w := mem[b+1].int;
        End{:1201};{1202:}
      mem[b].hh.b1 := 2;
      d := half(z-w);
      If (e>0)And(d<2*e)Then
        Begin
          d := half(z-w-e);
          If p<>0 Then If Not(p>=hi_mem_min)Then If mem[p].hh.b0=10 Then d := 0;
        End{:1202};
{1203:}
      Begin
        mem[cur_list.tail_field].hh.rh := new_penalty(eqtb[5279].int)
        ;
        cur_list.tail_field := mem[cur_list.tail_field].hh.rh;
      End;
      If (d+s<=eqtb[5858].int)Or l Then
        Begin
          g1 := 3;
          g2 := 4;
        End
      Else
        Begin
          g1 := 5;
          g2 := 6;
        End;
      If l And(e=0)Then
        Begin
          app_display(j,a,0);
          Begin
            mem[cur_list.tail_field].hh.rh := new_penalty(10000);
            cur_list.tail_field := mem[cur_list.tail_field].hh.rh;
          End;
        End
      Else
        Begin
          mem[cur_list.tail_field].hh.rh := new_param_glue(g1);
          cur_list.tail_field := mem[cur_list.tail_field].hh.rh;
        End{:1203};
{1204:}
      If e<>0 Then
        Begin
          r := new_kern(z-w-e-d);
          If l Then
            Begin
              mem[a].hh.rh := r;
              mem[r].hh.rh := b;
              b := a;
              d := 0;
            End
          Else
            Begin
              mem[b].hh.rh := r;
              mem[r].hh.rh := a;
            End;
          b := hpack(b,0,1);
        End;
      app_display(j,b,d){:1204};
{1205:}
      If (a<>0)And(e=0)And Not l Then
        Begin
          Begin
            mem[cur_list.
            tail_field].hh.rh := new_penalty(10000);
            cur_list.tail_field := mem[cur_list.tail_field].hh.rh;
          End;
          app_display(j,a,z-mem[a+1].int);
          g2 := 0;
        End;
      If t<>29995 Then
        Begin
          mem[cur_list.tail_field].hh.rh := mem[29995].hh.rh;
          cur_list.tail_field := t;
        End;
      Begin
        mem[cur_list.tail_field].hh.rh := new_penalty(eqtb[5280].int);
        cur_list.tail_field := mem[cur_list.tail_field].hh.rh;
      End;
      If g2>0 Then
        Begin
          mem[cur_list.tail_field].hh.rh := new_param_glue(g2);
          cur_list.tail_field := mem[cur_list.tail_field].hh.rh;
        End{:1205};
{1478:}
      flush_node_list(j){:1478};
      resume_after_display{:1199};
    End;
End;
{:1194}{1200:}
Procedure resume_after_display;
Begin
  If cur_group<>15 Then confusion(1182);
  unsave;
  cur_list.pg_field := cur_list.pg_field+3;
  push_nest;
  cur_list.mode_field := 102;
  cur_list.aux_field.hh.lh := 1000;
  If eqtb[5318].int<=0 Then cur_lang := 0
  Else If eqtb[5318].int>255 Then
         cur_lang := 0
  Else cur_lang := eqtb[5318].int;
  cur_list.aux_field.hh.rh := cur_lang;
  cur_list.pg_field := (norm_min(eqtb[5319].int)*64+norm_min(eqtb[5320].int)
                       )*65536+cur_lang;{443:}
  Begin
    get_x_token;
    If cur_cmd<>10 Then back_input;
  End{:443};
  If nest_ptr=1 Then build_page;
End;
{:1200}{1211:}{1215:}
Procedure get_r_token;

Label 20;
Begin
  20: Repeat
        get_token;
      Until cur_tok<>2592;
  If (cur_cs=0)Or(cur_cs>2614)Then
    Begin
      Begin
        If interaction=3 Then;
        print_nl(263);
        print(1200);
      End;
      Begin
        help_ptr := 5;
        help_line[4] := 1201;
        help_line[3] := 1202;
        help_line[2] := 1203;
        help_line[1] := 1204;
        help_line[0] := 1205;
      End;
      If cur_cs=0 Then back_input;
      cur_tok := 6709;
      ins_error;
      goto 20;
    End;
End;{:1215}{1229:}
Procedure trap_zero_glue;
Begin
  If (mem[cur_val+1].int=0)And(mem[cur_val+2].int=0)And(mem[cur_val+3
     ].int=0)Then
    Begin
      mem[0].hh.rh := mem[0].hh.rh+1;
      delete_glue_ref(cur_val);
      cur_val := 0;
    End;
End;
{:1229}{1236:}
Procedure do_register_command(a:small_number);

Label 40,10;

Var l,q,r,s: halfword;
  p: 0..3;
  e: boolean;
  w: integer;
Begin
  q := cur_cmd;
  e := false;{1237:}
  Begin
    If q<>89 Then
      Begin
        get_x_token;
        If (cur_cmd>=73)And(cur_cmd<=76)Then
          Begin
            l := cur_chr;
            p := cur_cmd-73;
            goto 40;
          End;
        If cur_cmd<>89 Then
          Begin
            Begin
              If interaction=3 Then;
              print_nl(263);
              print(694);
            End;
            print_cmd_chr(cur_cmd,cur_chr);
            print(695);
            print_cmd_chr(q,0);
            Begin
              help_ptr := 1;
              help_line[0] := 1226;
            End;
            error;
            goto 10;
          End;
      End;
    If (cur_chr<0)Or(cur_chr>19)Then
      Begin
        l := cur_chr;
        p := (mem[l].hh.b0 Div 16);
        e := true;
      End
    Else
      Begin
        p := cur_chr-0;
        scan_register_num;
        If cur_val>255 Then
          Begin
            find_sa_element(p,cur_val,true);
            l := cur_ptr;
            e := true;
          End
        Else Case p Of
               0: l := cur_val+5333;
               1: l := cur_val+5866;
               2: l := cur_val+2900;
               3: l := cur_val+3156;
          End;
      End;
  End;
  40: If p<2 Then If e Then w := mem[l+2].int
      Else w := eqtb[l].int
      Else If e
             Then s := mem[l+1].hh.rh
      Else s := eqtb[l].hh.rh{:1237};
  If q=89 Then scan_optional_equals
  Else If scan_keyword(1222)Then;
  arith_error := false;
  If q<91 Then{1238:}If p<2 Then
                       Begin
                         If p=0 Then scan_int
                         Else
                           scan_dimen(false,false,false);
                         If q=90 Then cur_val := cur_val+w;
                       End
  Else
    Begin
      scan_glue(p);
      If q=90 Then{1239:}
        Begin
          q := new_spec(cur_val);
          r := s;
          delete_glue_ref(cur_val);
          mem[q+1].int := mem[q+1].int+mem[r+1].int;
          If mem[q+2].int=0 Then mem[q].hh.b0 := 0;
          If mem[q].hh.b0=mem[r].hh.b0 Then mem[q+2].int := mem[q+2].int+mem[r+2].
                                                            int
          Else If (mem[q].hh.b0<mem[r].hh.b0)And(mem[r+2].int<>0)Then
                 Begin
                   mem
                   [q+2].int := mem[r+2].int;
                   mem[q].hh.b0 := mem[r].hh.b0;
                 End;
          If mem[q+3].int=0 Then mem[q].hh.b1 := 0;
          If mem[q].hh.b1=mem[r].hh.b1 Then mem[q+3].int := mem[q+3].int+mem[r+3].
                                                            int
          Else If (mem[q].hh.b1<mem[r].hh.b1)And(mem[r+3].int<>0)Then
                 Begin
                   mem
                   [q+3].int := mem[r+3].int;
                   mem[q].hh.b1 := mem[r].hh.b1;
                 End;
          cur_val := q;
        End{:1239};
    End{:1238}
  Else{1240:}
    Begin
      scan_int;
      If p<2 Then If q=91 Then If p=0 Then cur_val := mult_and_add(w,cur_val,0,
                                                      2147483647)
      Else cur_val := mult_and_add(w,cur_val,0,1073741823)
      Else
        cur_val := x_over_n(w,cur_val)
      Else
        Begin
          r := new_spec(s);
          If q=91 Then
            Begin
              mem[r+1].int := mult_and_add(mem[s+1].int,cur_val,0,
                              1073741823);
              mem[r+2].int := mult_and_add(mem[s+2].int,cur_val,0,1073741823);
              mem[r+3].int := mult_and_add(mem[s+3].int,cur_val,0,1073741823);
            End
          Else
            Begin
              mem[r+1].int := x_over_n(mem[s+1].int,cur_val);
              mem[r+2].int := x_over_n(mem[s+2].int,cur_val);
              mem[r+3].int := x_over_n(mem[s+3].int,cur_val);
            End;
          cur_val := r;
        End;
    End{:1240};
  If arith_error Then
    Begin
      Begin
        If interaction=3 Then;
        print_nl(263);
        print(1223);
      End;
      Begin
        help_ptr := 2;
        help_line[1] := 1224;
        help_line[0] := 1225;
      End;
      If p>=2 Then delete_glue_ref(cur_val);
      error;
      goto 10;
    End;
  If p<2 Then If e Then If (a>=4)Then gsa_w_def(l,cur_val)
  Else sa_w_def(l,
                cur_val)
  Else If (a>=4)Then geq_word_define(l,cur_val)
  Else eq_word_define(
                      l,cur_val)
  Else
    Begin
      trap_zero_glue;
      If e Then If (a>=4)Then gsa_def(l,cur_val)
      Else sa_def(l,cur_val)
      Else If (a
              >=4)Then geq_define(l,117,cur_val)
      Else eq_define(l,117,cur_val);
    End;
  10:
End;{:1236}{1243:}
Procedure alter_aux;

Var c: halfword;
Begin
  If cur_chr<>abs(cur_list.mode_field)Then report_illegal_case
  Else
    Begin
      c := cur_chr;
      scan_optional_equals;
      If c=1 Then
        Begin
          scan_dimen(false,false,false);
          cur_list.aux_field.int := cur_val;
        End
      Else
        Begin
          scan_int;
          If (cur_val<=0)Or(cur_val>32767)Then
            Begin
              Begin
                If interaction=3 Then;
                print_nl(263);
                print(1229);
              End;
              Begin
                help_ptr := 1;
                help_line[0] := 1230;
              End;
              int_error(cur_val);
            End
          Else cur_list.aux_field.hh.lh := cur_val;
        End;
    End;
End;{:1243}{1244:}
Procedure alter_prev_graf;

Var p: 0..nest_size;
Begin
  nest[nest_ptr] := cur_list;
  p := nest_ptr;
  While abs(nest[p].mode_field)<>1 Do
    p := p-1;
  scan_optional_equals;
  scan_int;
  If cur_val<0 Then
    Begin
      Begin
        If interaction=3 Then;
        print_nl(263);
        print(967);
      End;
      print_esc(536);
      Begin
        help_ptr := 1;
        help_line[0] := 1231;
      End;
      int_error(cur_val);
    End
  Else
    Begin
      nest[p].pg_field := cur_val;
      cur_list := nest[nest_ptr];
    End;
End;{:1244}{1245:}
Procedure alter_page_so_far;

Var c: 0..7;
Begin
  c := cur_chr;
  scan_optional_equals;
  scan_dimen(false,false,false);
  page_so_far[c] := cur_val;
End;{:1245}{1246:}
Procedure alter_integer;

Var c: small_number;
Begin
  c := cur_chr;
  scan_optional_equals;
  scan_int;
  If c=0 Then dead_cycles := cur_val{1427:}
  Else If c=2 Then
         Begin
           If (cur_val
              <0)Or(cur_val>3)Then
             Begin
               Begin
                 If interaction=3 Then;
                 print_nl(263);
                 print(1363);
               End;
               Begin
                 help_ptr := 2;
                 help_line[1] := 1364;
                 help_line[0] := 1365;
               End;
               int_error(cur_val);
             End
           Else
             Begin
               cur_chr := cur_val;
               new_interaction;
             End;
         End{:1427}
  Else insert_penalties := cur_val;
End;
{:1246}{1247:}
Procedure alter_box_dimen;

Var c: small_number;
  b: halfword;
Begin
  c := cur_chr;
  scan_register_num;
  If cur_val<256 Then b := eqtb[3683+cur_val].hh.rh
  Else
    Begin
      find_sa_element(4,cur_val,false);
      If cur_ptr=0 Then b := 0
      Else b := mem[cur_ptr+1].hh.rh;
    End;
  scan_optional_equals;
  scan_dimen(false,false,false);
  If b<>0 Then mem[b+c].int := cur_val;
End;
{:1247}{1257:}
Procedure new_font(a:small_number);

Label 50;

Var u: halfword;
  s: scaled;
  f: internal_font_number;
  t: str_number;
  old_setting: 0..21;
  flushable_string: str_number;
Begin
  If job_name=0 Then open_log_file;
  get_r_token;
  u := cur_cs;
  If u>=514 Then t := hash[u].rh
  Else If u>=257 Then If u=513 Then t := 1235
  Else t := u-257
  Else
    Begin
      old_setting := selector;
      selector := 21;
      print(1235);
      print(u-1);
      selector := old_setting;
      Begin
        If pool_ptr+1>pool_size Then overflow(258,pool_size-init_pool_ptr)
        ;
      End;
      t := make_string;
    End;
  If (a>=4)Then geq_define(u,87,0)
  Else eq_define(u,87,0);
  scan_optional_equals;
  scan_file_name;{1258:}
  name_in_progress := true;
  If scan_keyword(1236)Then{1259:}
    Begin
      scan_dimen(false,false,false);
      s := cur_val;
      If (s<=0)Or(s>=134217728)Then
        Begin
          Begin
            If interaction=3 Then;
            print_nl(263);
            print(1238);
          End;
          print_scaled(s);
          print(1239);
          Begin
            help_ptr := 2;
            help_line[1] := 1240;
            help_line[0] := 1241;
          End;
          error;
          s := 10*65536;
        End;
    End{:1259}
  Else If scan_keyword(1237)Then
         Begin
           scan_int;
           s := -cur_val;
           If (cur_val<=0)Or(cur_val>32768)Then
             Begin
               Begin
                 If interaction=3 Then;
                 print_nl(263);
                 print(560);
               End;
               Begin
                 help_ptr := 1;
                 help_line[0] := 561;
               End;
               int_error(cur_val);
               s := -1000;
             End;
         End
  Else s := -1000;
  name_in_progress := false{:1258};{1260:}
  flushable_string := str_ptr-1;
  For f:=1 To font_ptr Do
    If str_eq_str(font_name[f],cur_name)And
       str_eq_str(font_area[f],cur_area)Then
      Begin
        If cur_name=flushable_string
          Then
          Begin
            Begin
              str_ptr := str_ptr-1;
              pool_ptr := str_start[str_ptr];
            End;
            cur_name := font_name[f];
          End;
        If s>0 Then
          Begin
            If s=font_size[f]Then goto 50;
          End
        Else If font_size[f]=xn_over_d(font_dsize[f],-s,1000)Then goto 50;
      End{:1260};
  f := read_font_info(u,cur_name,cur_area,s);
  50: If (a>=4)Then geq_define(u,87,f)
      Else eq_define(u,87,f);
  eqtb[2624+f] := eqtb[u];
  hash[2624+f].rh := t;
End;
{:1257}{1265:}
Procedure new_interaction;
Begin
  print_ln;
  interaction := cur_chr;
{75:}
  If interaction=0 Then selector := 16
  Else selector := 17{:75};
  If log_opened Then selector := selector+2;
End;
{:1265}
Procedure prefixed_command;

Label 30,10;

Var a: small_number;
  f: internal_font_number;
  j: halfword;
  k: font_index;
  p,q: halfword;
  n: integer;
  e: boolean;
Begin
  a := 0;
  While cur_cmd=93 Do
    Begin
      If Not odd(a Div cur_chr)Then a := a+cur_chr;
{404:}
      Repeat
        get_x_token;
      Until (cur_cmd<>10)And(cur_cmd<>0){:404};
      If cur_cmd<=70 Then{1212:}
        Begin
          Begin
            If interaction=3 Then;
            print_nl(263);
            print(1192);
          End;
          print_cmd_chr(cur_cmd,cur_chr);
          print_char(39);
          Begin
            help_ptr := 1;
            help_line[0] := 1193;
          End;
          If (eTeX_mode=1)Then help_line[0] := 1194;
          back_error;
          goto 10;
        End{:1212};
      If eqtb[5304].int>2 Then If (eTeX_mode=1)Then show_cur_cmd_chr;
    End;
{1213:}
  If a>=8 Then
    Begin
      j := 3585;
      a := a-8;
    End
  Else j := 0;
  If (cur_cmd<>97)And((a Mod 4<>0)Or(j<>0))Then
    Begin
      Begin
        If interaction=
           3 Then;
        print_nl(263);
        print(694);
      End;
      print_esc(1184);
      print(1195);
      print_esc(1185);
      Begin
        help_ptr := 1;
        help_line[0] := 1196;
      End;
      If (eTeX_mode=1)Then
        Begin
          help_line[0] := 1197;
          print(1195);
          print_esc(1198);
        End;
      print(1199);
      print_cmd_chr(cur_cmd,cur_chr);
      print_char(39);
      error;
    End{:1213};
{1214:}
  If eqtb[5311].int<>0 Then If eqtb[5311].int<0 Then
                              Begin
                                If (a>=4)
                                  Then a := a-4;
                              End
  Else
    Begin
      If Not(a>=4)Then a := a+4;
    End{:1214};
  Case cur_cmd Of {1217:}
    87: If (a>=4)Then geq_define(3939,120,cur_chr)
        Else
          eq_define(3939,120,cur_chr);
{:1217}{1218:}
    97:
        Begin
          If odd(cur_chr)And Not(a>=4)And(eqtb[5311].int>=0
             )Then a := a+4;
          e := (cur_chr>=2);
          get_r_token;
          p := cur_cs;
          q := scan_toks(true,e);
          If j<>0 Then
            Begin
              q := get_avail;
              mem[q].hh.lh := j;
              mem[q].hh.rh := mem[def_ref].hh.rh;
              mem[def_ref].hh.rh := q;
            End;
          If (a>=4)Then geq_define(p,111+(a Mod 4),def_ref)
          Else eq_define(p,111+(a
                         Mod 4),def_ref);
        End;{:1218}{1221:}
    94:
        Begin
          n := cur_chr;
          get_r_token;
          p := cur_cs;
          If n=0 Then
            Begin
              Repeat
                get_token;
              Until cur_cmd<>10;
              If cur_tok=3133 Then
                Begin
                  get_token;
                  If cur_cmd=10 Then get_token;
                End;
            End
          Else
            Begin
              get_token;
              q := cur_tok;
              get_token;
              back_input;
              cur_tok := q;
              back_input;
            End;
          If cur_cmd>=111 Then mem[cur_chr].hh.lh := mem[cur_chr].hh.lh+1
          Else If (
                  cur_cmd=89)Or(cur_cmd=71)Then If (cur_chr<0)Or(cur_chr>19)Then mem[
                                                  cur_chr+1].hh.lh := mem[cur_chr+1].hh.lh+1;
          If (a>=4)Then geq_define(p,cur_cmd,cur_chr)
          Else eq_define(p,cur_cmd,
                         cur_chr);
        End;{:1221}{1224:}
    95:
        Begin
          n := cur_chr;
          get_r_token;
          p := cur_cs;
          If (a>=4)Then geq_define(p,0,256)
          Else eq_define(p,0,256);
          scan_optional_equals;
          Case n Of
            0:
               Begin
                 scan_char_num;
                 If (a>=4)Then geq_define(p,68,cur_val)
                 Else eq_define(p,68,cur_val);
               End;
            1:
               Begin
                 scan_fifteen_bit_int;
                 If (a>=4)Then geq_define(p,69,cur_val)
                 Else eq_define(p,69,cur_val);
               End;
            others:
                    Begin
                      scan_register_num;
                      If cur_val>255 Then
                        Begin
                          j := n-2;
                          If j>3 Then j := 5;
                          find_sa_element(j,cur_val,true);
                          mem[cur_ptr+1].hh.lh := mem[cur_ptr+1].hh.lh+1;
                          If j=5 Then j := 71
                          Else j := 89;
                          If (a>=4)Then geq_define(p,j,cur_ptr)
                          Else eq_define(p,j,cur_ptr);
                        End
                      Else Case n Of
                             2: If (a>=4)Then geq_define(p,73,5333+cur_val)
                                Else
                                  eq_define(p,73,5333+cur_val);
                             3: If (a>=4)Then geq_define(p,74,5866+cur_val)
                                Else eq_define(p,74,5866+
                                               cur_val);
                             4: If (a>=4)Then geq_define(p,75,2900+cur_val)
                                Else eq_define(p,75,2900+
                                               cur_val);
                             5: If (a>=4)Then geq_define(p,76,3156+cur_val)
                                Else eq_define(p,76,3156+
                                               cur_val);
                             6: If (a>=4)Then geq_define(p,72,3423+cur_val)
                                Else eq_define(p,72,3423+
                                               cur_val);
                        End;
                    End
          End;
        End;{:1224}{1225:}
    96:
        Begin
          j := cur_chr;
          scan_int;
          n := cur_val;
          If Not scan_keyword(853)Then
            Begin
              Begin
                If interaction=3 Then;
                print_nl(263);
                print(1085);
              End;
              Begin
                help_ptr := 2;
                help_line[1] := 1216;
                help_line[0] := 1217;
              End;
              error;
            End;
          get_r_token;
          p := cur_cs;
          read_toks(n,p,j);
          If (a>=4)Then geq_define(p,111,cur_val)
          Else eq_define(p,111,cur_val);
        End;
{:1225}{1226:}
    71,72:
           Begin
             q := cur_cs;
             e := false;
             If cur_cmd=71 Then If cur_chr=0 Then
                                  Begin
                                    scan_register_num;
                                    If cur_val>255 Then
                                      Begin
                                        find_sa_element(5,cur_val,true);
                                        cur_chr := cur_ptr;
                                        e := true;
                                      End
                                    Else cur_chr := 3423+cur_val;
                                  End
             Else e := true;
             p := cur_chr;
             scan_optional_equals;
{404:}
             Repeat
               get_x_token;
             Until (cur_cmd<>10)And(cur_cmd<>0){:404};
             If cur_cmd<>1 Then{1227:}If (cur_cmd=71)Or(cur_cmd=72)Then
                                        Begin
                                          If
                                             cur_cmd=71 Then If cur_chr=0 Then
                                                               Begin
                                                                 scan_register_num;
                                                                 If cur_val<256 Then q := eqtb[3423+
                                                                                          cur_val].
                                                                                          hh.rh
                                                                 Else
                                                                   Begin
                                                                     find_sa_element(5,cur_val,false
                                                                     );
                                                                     If cur_ptr=0 Then q := 0
                                                                     Else q := mem[cur_ptr+1].hh.rh;
                                                                   End;
                                                               End
                                          Else q := mem[cur_chr+1].hh.rh
                                          Else q := eqtb[cur_chr].hh.rh;
                                          If q=0 Then If e Then If (a>=4)Then gsa_def(p,0)
                                          Else sa_def(p,0)
                                          Else If (a
                                                  >=4)Then geq_define(p,101,0)
                                          Else eq_define(p,101,0)
                                          Else
                                            Begin
                                              mem[q].hh.
                                              lh := mem[q].hh.lh+1;
                                              If e Then If (a>=4)Then gsa_def(p,q)
                                              Else sa_def(p,q)
                                              Else If (a>=4)Then
                                                     geq_define(p,111,q)
                                              Else eq_define(p,111,q);
                                            End;
                                          goto 30;
                                        End{:1227};
             back_input;
             cur_cs := q;
             q := scan_toks(false,false);
             If mem[def_ref].hh.rh=0 Then
               Begin
                 If e Then If (a>=4)Then gsa_def(p,0)
                 Else sa_def(p,0)
                 Else If (a>=4)Then geq_define(p,101,0)
                 Else eq_define(p,
                                101,0);
                 Begin
                   mem[def_ref].hh.rh := avail;
                   avail := def_ref;
{dyn_used:=dyn_used-1;}
                 End;
               End
             Else
               Begin
                 If (p=3413)And Not e Then
                   Begin
                     mem[q].hh.rh := get_avail;
                     q := mem[q].hh.rh;
                     mem[q].hh.lh := 637;
                     q := get_avail;
                     mem[q].hh.lh := 379;
                     mem[q].hh.rh := mem[def_ref].hh.rh;
                     mem[def_ref].hh.rh := q;
                   End;
                 If e Then If (a>=4)Then gsa_def(p,def_ref)
                 Else sa_def(p,def_ref)
                 Else If (a
                         >=4)Then geq_define(p,111,def_ref)
                 Else eq_define(p,111,def_ref);
               End;
           End;
{:1226}{1228:}
    73:
        Begin
          p := cur_chr;
          scan_optional_equals;
          scan_int;
          If (a>=4)Then geq_word_define(p,cur_val)
          Else eq_word_define(p,cur_val);
        End;
    74:
        Begin
          p := cur_chr;
          scan_optional_equals;
          scan_dimen(false,false,false);
          If (a>=4)Then geq_word_define(p,cur_val)
          Else eq_word_define(p,cur_val);
        End;
    75,76:
           Begin
             p := cur_chr;
             n := cur_cmd;
             scan_optional_equals;
             If n=76 Then scan_glue(3)
             Else scan_glue(2);
             trap_zero_glue;
             If (a>=4)Then geq_define(p,117,cur_val)
             Else eq_define(p,117,cur_val);
           End;
{:1228}{1232:}
    85:
        Begin{1233:}
          If cur_chr=3988 Then n := 15
          Else If cur_chr=
                  5012 Then n := 32768
          Else If cur_chr=4756 Then n := 32767
          Else If cur_chr=
                  5589 Then n := 16777215
          Else n := 255{:1233};
          p := cur_chr;
          scan_char_num;
          p := p+cur_val;
          scan_optional_equals;
          scan_int;
          If ((cur_val<0)And(p<5589))Or(cur_val>n)Then
            Begin
              Begin
                If interaction=3
                  Then;
                print_nl(263);
                print(1218);
              End;
              print_int(cur_val);
              If p<5589 Then print(1219)
              Else print(1220);
              print_int(n);
              Begin
                help_ptr := 1;
                help_line[0] := 1221;
              End;
              error;
              cur_val := 0;
            End;
          If p<5012 Then If (a>=4)Then geq_define(p,120,cur_val)
          Else eq_define(p,
                         120,cur_val)
          Else If p<5589 Then If (a>=4)Then geq_define(p,120,cur_val+0)
          Else eq_define(p,120,cur_val+0)
          Else If (a>=4)Then geq_word_define(p,
                                             cur_val)
          Else eq_word_define(p,cur_val);
        End;
{:1232}{1234:}
    86:
        Begin
          p := cur_chr;
          scan_four_bit_int;
          p := p+cur_val;
          scan_optional_equals;
          scan_font_ident;
          If (a>=4)Then geq_define(p,120,cur_val)
          Else eq_define(p,120,cur_val);
        End;
{:1234}{1235:}
    89,90,91,92: do_register_command(a);
{:1235}{1241:}
    98:
        Begin
          scan_register_num;
          If (a>=4)Then n := 1073774592+cur_val
          Else n := 1073741824+cur_val;
          scan_optional_equals;
          If set_box_allowed Then scan_box(n)
          Else
            Begin
              Begin
                If interaction=3
                  Then;
                print_nl(263);
                print(689);
              End;
              print_esc(540);
              Begin
                help_ptr := 2;
                help_line[1] := 1227;
                help_line[0] := 1228;
              End;
              error;
            End;
        End;
{:1241}{1242:}
    79: alter_aux;
    80: alter_prev_graf;
    81: alter_page_so_far;
    82: alter_integer;
    83: alter_box_dimen;{:1242}{1248:}
    84:
        Begin
          q := cur_chr;
          scan_optional_equals;
          scan_int;
          n := cur_val;
          If n<=0 Then p := 0
          Else If q>3412 Then
                 Begin
                   n := (cur_val Div 2)+1;
                   p := get_node(2*n+1);
                   mem[p].hh.lh := n;
                   n := cur_val;
                   mem[p+1].int := n;
                   For j:=p+2 To p+n+1 Do
                     Begin
                       scan_int;
                       mem[j].int := cur_val;
                     End;
                   If Not odd(n)Then mem[p+n+2].int := 0;
                 End
          Else
            Begin
              p := get_node(2*n+1);
              mem[p].hh.lh := n;
              For j:=1 To n Do
                Begin
                  scan_dimen(false,false,false);
                  mem[p+2*j-1].int := cur_val;
                  scan_dimen(false,false,false);
                  mem[p+2*j].int := cur_val;
                End;
            End;
          If (a>=4)Then geq_define(q,118,p)
          Else eq_define(q,118,p);
        End;
{:1248}{1252:}
    99: If cur_chr=1 Then
          Begin
            new_patterns;
            goto 30;
            Begin
              If interaction=3 Then;
              print_nl(263);
              print(1232);
            End;
            help_ptr := 0;
            error;
            Repeat
              get_token;
            Until cur_cmd=2;
            goto 10;
          End
        Else
          Begin
            new_hyph_exceptions;
            goto 30;
          End;
{:1252}{1253:}
    77:
        Begin
          find_font_dimen(true);
          k := cur_val;
          scan_optional_equals;
          scan_dimen(false,false,false);
          font_info[k].int := cur_val;
        End;
    78:
        Begin
          n := cur_chr;
          scan_font_ident;
          f := cur_val;
          scan_optional_equals;
          scan_int;
          If n=0 Then hyphen_char[f] := cur_val
          Else skew_char[f] := cur_val;
        End;
{:1253}{1256:}
    88: new_font(a);{:1256}{1264:}
    100: new_interaction;
{:1264}
    others: confusion(1191)
  End;
  30:{1269:}If after_token<>0 Then
              Begin
                cur_tok := after_token;
                back_input;
                after_token := 0;
              End{:1269};
  10:
End;{:1211}{1270:}
Procedure do_assignments;

Label 10;
Begin
  While true Do
    Begin{404:}
      Repeat
        get_x_token;
      Until (cur_cmd<>10)And(cur_cmd<>0){:404};
      If cur_cmd<=70 Then goto 10;
      set_box_allowed := false;
      prefixed_command;
      set_box_allowed := true;
    End;
  10:
End;{:1270}{1275:}
Procedure open_or_close_in;

Var c: 0..1;
  n: 0..15;
Begin
  c := cur_chr;
  scan_four_bit_int;
  n := cur_val;
  If read_open[n]<>2 Then
    Begin
      a_close(read_file[n]);
      read_open[n] := 2;
    End;
  If c<>0 Then
    Begin
      scan_optional_equals;
      scan_file_name;
      If cur_ext=339 Then cur_ext := 802;
      pack_file_name(cur_name,cur_area,cur_ext);
      If a_open_in(read_file[n])Then read_open[n] := 1;
    End;
End;
{:1275}{1279:}
Procedure issue_message;

Var old_setting: 0..21;
  c: 0..1;
  s: str_number;
Begin
  c := cur_chr;
  mem[29988].hh.rh := scan_toks(false,true);
  old_setting := selector;
  selector := 21;
  token_show(def_ref);
  selector := old_setting;
  flush_list(def_ref);
  Begin
    If pool_ptr+1>pool_size Then overflow(258,pool_size-init_pool_ptr)
    ;
  End;
  s := make_string;
  If c=0 Then{1280:}
    Begin
      If term_offset+(str_start[s+1]-str_start[s])>
         max_print_line-2 Then print_ln
      Else If (term_offset>0)Or(file_offset>0)
             Then print_char(32);
      slow_print(s);
      break(term_out);
    End{:1280}
  Else{1283:}
    Begin
      Begin
        If interaction=3 Then;
        print_nl(263);
        print(339);
      End;
      slow_print(s);
      If eqtb[3421].hh.rh<>0 Then use_err_help := true
      Else If long_help_seen
             Then
             Begin
               help_ptr := 1;
               help_line[0] := 1248;
             End
      Else
        Begin
          If interaction<3 Then long_help_seen := true;
          Begin
            help_ptr := 4;
            help_line[3] := 1249;
            help_line[2] := 1250;
            help_line[1] := 1251;
            help_line[0] := 1252;
          End;
        End;
      error;
      use_err_help := false;
    End{:1283};
  Begin
    str_ptr := str_ptr-1;
    pool_ptr := str_start[str_ptr];
  End;
End;{:1279}{1288:}
Procedure shift_case;

Var b: halfword;
  p: halfword;
  t: halfword;
  c: eight_bits;
Begin
  b := cur_chr;
  p := scan_toks(false,false);
  p := mem[def_ref].hh.rh;
  While p<>0 Do
    Begin{1289:}
      t := mem[p].hh.lh;
      If t<4352 Then
        Begin
          c := t Mod 256;
          If eqtb[b+c].hh.rh<>0 Then mem[p].hh.lh := t-c+eqtb[b+c].hh.rh;
        End{:1289};
      p := mem[p].hh.rh;
    End;
  begin_token_list(mem[def_ref].hh.rh,3);
  Begin
    mem[def_ref].hh.rh := avail;
    avail := def_ref;{dyn_used:=dyn_used-1;}
  End;
End;{:1288}{1293:}
Procedure show_whatever;

Label 50;

Var p: halfword;
  t: small_number;
  m: 0..4;
  l: integer;
  n: integer;
Begin
  Case cur_chr Of
    3:
       Begin
         begin_diagnostic;
         show_activities;
       End;
    1:{1296:}
       Begin
         scan_register_num;
         If cur_val<256 Then p := eqtb[3683+cur_val].hh.rh
         Else
           Begin
             find_sa_element(4,cur_val,false);
             If cur_ptr=0 Then p := 0
             Else p := mem[cur_ptr+1].hh.rh;
           End;
         begin_diagnostic;
         print_nl(1268);
         print_int(cur_val);
         print_char(61);
         If p=0 Then print(413)
         Else show_box(p);
       End{:1296};
    0:{1294:}
       Begin
         get_token;
         If interaction=3 Then;
         print_nl(1264);
         If cur_cs<>0 Then
           Begin
             sprint_cs(cur_cs);
             print_char(61);
           End;
         print_meaning;
         goto 50;
       End{:1294};{1408:}
    4:
       Begin
         begin_diagnostic;
         show_save_groups;
       End;{:1408}{1422:}
    6:
       Begin
         begin_diagnostic;
         print_nl(339);
         print_ln;
         If cond_ptr=0 Then
           Begin
             print_nl(366);
             print(1360);
           End
         Else
           Begin
             p := cond_ptr;
             n := 0;
             Repeat
               n := n+1;
               p := mem[p].hh.rh;
             Until p=0;
             p := cond_ptr;
             t := cur_if;
             l := if_line;
             m := if_limit;
             Repeat
               print_nl(1361);
               print_int(n);
               print(575);
               print_cmd_chr(105,t);
               If m=2 Then print_esc(787);
               If l<>0 Then
                 Begin
                   print(1359);
                   print_int(l);
                 End;
               n := n-1;
               t := mem[p].hh.b1;
               l := mem[p+1].int;
               m := mem[p].hh.b0;
               p := mem[p].hh.rh;
             Until p=0;
           End;
       End;
{:1422}
    others:{1297:}
            Begin
              p := the_toks;
              If interaction=3 Then;
              print_nl(1264);
              token_show(29997);
              flush_list(mem[29997].hh.rh);
              goto 50;
            End{:1297}
  End;{1298:}
  end_diagnostic(true);
  Begin
    If interaction=3 Then;
    print_nl(263);
    print(1269);
  End;
  If selector=19 Then If eqtb[5297].int<=0 Then
                        Begin
                          selector := 17;
                          print(1270);
                          selector := 19;
                        End{:1298};
  50: If interaction<3 Then
        Begin
          help_ptr := 0;
          error_count := error_count-1;
        End
      Else If eqtb[5297].int>0 Then
             Begin
               Begin
                 help_ptr := 3;
                 help_line[2] := 1259;
                 help_line[1] := 1260;
                 help_line[0] := 1261;
               End;
             End
      Else
        Begin
          Begin
            help_ptr := 5;
            help_line[4] := 1259;
            help_line[3] := 1260;
            help_line[2] := 1261;
            help_line[1] := 1262;
            help_line[0] := 1263;
          End;
        End;
  error;
End;{:1293}{1302:}
Procedure store_fmt_file;

Label 41,42,31,32;

Var j,k,l: integer;
  p,q: halfword;
  x: integer;
  w: four_quarters;
Begin{1304:}
  If save_ptr<>0 Then
    Begin
      Begin
        If interaction=3 Then;
        print_nl(263);
        print(1272);
      End;
      Begin
        help_ptr := 1;
        help_line[0] := 1273;
      End;
      Begin
        If interaction=3 Then interaction := 2;
        If log_opened Then error;
{if interaction>0 then debug_help;}
        history := 3;
        jump_out;
      End;
    End{:1304};
{1328:}
  selector := 21;
  print(1286);
  print(job_name);
  print_char(32);
  print_int(eqtb[5291].int);
  print_char(46);
  print_int(eqtb[5290].int);
  print_char(46);
  print_int(eqtb[5289].int);
  print_char(41);
  If interaction=0 Then selector := 18
  Else selector := 19;
  Begin
    If pool_ptr+1>pool_size Then overflow(258,pool_size-init_pool_ptr)
    ;
  End;
  format_ident := make_string;
  pack_job_name(797);
  While Not w_open_out(fmt_file) Do
    prompt_file_name(1287,797);
  print_nl(1288);
  slow_print(w_make_name_string(fmt_file));
  Begin
    str_ptr := str_ptr-1;
    pool_ptr := str_start[str_ptr];
  End;
  print_nl(339);
  slow_print(format_ident){:1328};{1307:}
  Begin
    fmt_file^.int := 236367277;
    put(fmt_file);
  End;{1385:}
  Begin
    fmt_file^.int := eTeX_mode;
    put(fmt_file);
  End;
  For j:=0 To-0 Do
    eqtb[5332+j].int := 0;
{:1385}{1493:}
  While pseudo_files<>0 Do
    pseudo_close;
{:1493}
  Begin
    fmt_file^.int := 0;
    put(fmt_file);
  End;
  Begin
    fmt_file^.int := 30000;
    put(fmt_file);
  End;
  Begin
    fmt_file^.int := 6121;
    put(fmt_file);
  End;
  Begin
    fmt_file^.int := 1777;
    put(fmt_file);
  End;
  Begin
    fmt_file^.int := 307;
    put(fmt_file);
  End{:1307};
{1309:}
  Begin
    fmt_file^.int := pool_ptr;
    put(fmt_file);
  End;
  Begin
    fmt_file^.int := str_ptr;
    put(fmt_file);
  End;
  For k:=0 To str_ptr Do
    Begin
      fmt_file^.int := str_start[k];
      put(fmt_file);
    End;
  k := 0;
  While k+4<pool_ptr Do
    Begin
      w.b0 := str_pool[k]+0;
      w.b1 := str_pool[k+1]+0;
      w.b2 := str_pool[k+2]+0;
      w.b3 := str_pool[k+3]+0;
      Begin
        fmt_file^.qqqq := w;
        put(fmt_file);
      End;
      k := k+4;
    End;
  k := pool_ptr-4;
  w.b0 := str_pool[k]+0;
  w.b1 := str_pool[k+1]+0;
  w.b2 := str_pool[k+2]+0;
  w.b3 := str_pool[k+3]+0;
  Begin
    fmt_file^.qqqq := w;
    put(fmt_file);
  End;
  print_ln;
  print_int(str_ptr);
  print(1274);
  print_int(pool_ptr){:1309};
{1311:}
  sort_avail;
  var_used := 0;
  Begin
    fmt_file^.int := lo_mem_max;
    put(fmt_file);
  End;
  Begin
    fmt_file^.int := rover;
    put(fmt_file);
  End;
  If (eTeX_mode=1)Then For k:=0 To 5 Do
                         Begin
                           fmt_file^.int := sa_root[k];
                           put(fmt_file);
                         End;
  p := 0;
  q := rover;
  x := 0;
  Repeat
    For k:=p To q+1 Do
      Begin
        fmt_file^ := mem[k];
        put(fmt_file);
      End;
    x := x+q+2-p;
    var_used := var_used+q-p;
    p := q+mem[q].hh.lh;
    q := mem[q+1].hh.rh;
  Until q=rover;
  var_used := var_used+lo_mem_max-p;
  dyn_used := mem_end+1-hi_mem_min;
  For k:=p To lo_mem_max Do
    Begin
      fmt_file^ := mem[k];
      put(fmt_file);
    End;
  x := x+lo_mem_max+1-p;
  Begin
    fmt_file^.int := hi_mem_min;
    put(fmt_file);
  End;
  Begin
    fmt_file^.int := avail;
    put(fmt_file);
  End;
  For k:=hi_mem_min To mem_end Do
    Begin
      fmt_file^ := mem[k];
      put(fmt_file);
    End;
  x := x+mem_end+1-hi_mem_min;
  p := avail;
  While p<>0 Do
    Begin
      dyn_used := dyn_used-1;
      p := mem[p].hh.rh;
    End;
  Begin
    fmt_file^.int := var_used;
    put(fmt_file);
  End;
  Begin
    fmt_file^.int := dyn_used;
    put(fmt_file);
  End;
  print_ln;
  print_int(x);
  print(1275);
  print_int(var_used);
  print_char(38);
  print_int(dyn_used){:1311};{1313:}{1315:}
  k := 1;
  Repeat
    j := k;
    While j<5267 Do
      Begin
        If (eqtb[j].hh.rh=eqtb[j+1].hh.rh)And(eqtb[j].hh.b0
           =eqtb[j+1].hh.b0)And(eqtb[j].hh.b1=eqtb[j+1].hh.b1)Then goto 41;
        j := j+1;
      End;
    l := 5268;
    goto 31;
    41: j := j+1;
    l := j;
    While j<5267 Do
      Begin
        If (eqtb[j].hh.rh<>eqtb[j+1].hh.rh)Or(eqtb[j].hh.b0
           <>eqtb[j+1].hh.b0)Or(eqtb[j].hh.b1<>eqtb[j+1].hh.b1)Then goto 31;
        j := j+1;
      End;
    31:
        Begin
          fmt_file^.int := l-k;
          put(fmt_file);
        End;
    While k<l Do
      Begin
        Begin
          fmt_file^ := eqtb[k];
          put(fmt_file);
        End;
        k := k+1;
      End;
    k := j+1;
    Begin
      fmt_file^.int := k-l;
      put(fmt_file);
    End;
  Until k=5268{:1315};{1316:}
  Repeat
    j := k;
    While j<6121 Do
      Begin
        If eqtb[j].int=eqtb[j+1].int Then goto 42;
        j := j+1;
      End;
    l := 6122;
    goto 32;
    42: j := j+1;
    l := j;
    While j<6121 Do
      Begin
        If eqtb[j].int<>eqtb[j+1].int Then goto 32;
        j := j+1;
      End;
    32:
        Begin
          fmt_file^.int := l-k;
          put(fmt_file);
        End;
    While k<l Do
      Begin
        Begin
          fmt_file^ := eqtb[k];
          put(fmt_file);
        End;
        k := k+1;
      End;
    k := j+1;
    Begin
      fmt_file^.int := k-l;
      put(fmt_file);
    End;
  Until k>6121{:1316};
  Begin
    fmt_file^.int := par_loc;
    put(fmt_file);
  End;
  Begin
    fmt_file^.int := write_loc;
    put(fmt_file);
  End;
{1318:}
  Begin
    fmt_file^.int := hash_used;
    put(fmt_file);
  End;
  cs_count := 2613-hash_used;
  For p:=514 To hash_used Do
    If hash[p].rh<>0 Then
      Begin
        Begin
          fmt_file^.
          int := p;
          put(fmt_file);
        End;
        Begin
          fmt_file^.hh := hash[p];
          put(fmt_file);
        End;
        cs_count := cs_count+1;
      End;
  For p:=hash_used+1 To 2880 Do
    Begin
      fmt_file^.hh := hash[p];
      put(fmt_file);
    End;
  Begin
    fmt_file^.int := cs_count;
    put(fmt_file);
  End;
  print_ln;
  print_int(cs_count);
  print(1276){:1318}{:1313};
{1320:}
  Begin
    fmt_file^.int := fmem_ptr;
    put(fmt_file);
  End;
  For k:=0 To fmem_ptr-1 Do
    Begin
      fmt_file^ := font_info[k];
      put(fmt_file);
    End;
  Begin
    fmt_file^.int := font_ptr;
    put(fmt_file);
  End;
  For k:=0 To font_ptr Do{1322:}
    Begin
      Begin
        fmt_file^.qqqq := font_check[k];
        put(fmt_file);
      End;
      Begin
        fmt_file^.int := font_size[k];
        put(fmt_file);
      End;
      Begin
        fmt_file^.int := font_dsize[k];
        put(fmt_file);
      End;
      Begin
        fmt_file^.int := font_params[k];
        put(fmt_file);
      End;
      Begin
        fmt_file^.int := hyphen_char[k];
        put(fmt_file);
      End;
      Begin
        fmt_file^.int := skew_char[k];
        put(fmt_file);
      End;
      Begin
        fmt_file^.int := font_name[k];
        put(fmt_file);
      End;
      Begin
        fmt_file^.int := font_area[k];
        put(fmt_file);
      End;
      Begin
        fmt_file^.int := font_bc[k];
        put(fmt_file);
      End;
      Begin
        fmt_file^.int := font_ec[k];
        put(fmt_file);
      End;
      Begin
        fmt_file^.int := char_base[k];
        put(fmt_file);
      End;
      Begin
        fmt_file^.int := width_base[k];
        put(fmt_file);
      End;
      Begin
        fmt_file^.int := height_base[k];
        put(fmt_file);
      End;
      Begin
        fmt_file^.int := depth_base[k];
        put(fmt_file);
      End;
      Begin
        fmt_file^.int := italic_base[k];
        put(fmt_file);
      End;
      Begin
        fmt_file^.int := lig_kern_base[k];
        put(fmt_file);
      End;
      Begin
        fmt_file^.int := kern_base[k];
        put(fmt_file);
      End;
      Begin
        fmt_file^.int := exten_base[k];
        put(fmt_file);
      End;
      Begin
        fmt_file^.int := param_base[k];
        put(fmt_file);
      End;
      Begin
        fmt_file^.int := font_glue[k];
        put(fmt_file);
      End;
      Begin
        fmt_file^.int := bchar_label[k];
        put(fmt_file);
      End;
      Begin
        fmt_file^.int := font_bchar[k];
        put(fmt_file);
      End;
      Begin
        fmt_file^.int := font_false_bchar[k];
        put(fmt_file);
      End;
      print_nl(1279);
      print_esc(hash[2624+k].rh);
      print_char(61);
      print_file_name(font_name[k],font_area[k],339);
      If font_size[k]<>font_dsize[k]Then
        Begin
          print(751);
          print_scaled(font_size[k]);
          print(400);
        End;
    End{:1322};
  print_ln;
  print_int(fmem_ptr-7);
  print(1277);
  print_int(font_ptr-0);
  print(1278);
  If font_ptr<>1 Then print_char(115){:1320};
{1324:}
  Begin
    fmt_file^.int := hyph_count;
    put(fmt_file);
  End;
  For k:=0 To 307 Do
    If hyph_word[k]<>0 Then
      Begin
        Begin
          fmt_file^.int := k;
          put(fmt_file);
        End;
        Begin
          fmt_file^.int := hyph_word[k];
          put(fmt_file);
        End;
        Begin
          fmt_file^.int := hyph_list[k];
          put(fmt_file);
        End;
      End;
  print_ln;
  print_int(hyph_count);
  print(1280);
  If hyph_count<>1 Then print_char(115);
  If trie_not_ready Then init_trie;
  Begin
    fmt_file^.int := trie_max;
    put(fmt_file);
  End;
  Begin
    fmt_file^.int := hyph_start;
    put(fmt_file);
  End;
  For k:=0 To trie_max Do
    Begin
      fmt_file^.hh := trie[k];
      put(fmt_file);
    End;
  Begin
    fmt_file^.int := trie_op_ptr;
    put(fmt_file);
  End;
  For k:=1 To trie_op_ptr Do
    Begin
      Begin
        fmt_file^.int := hyf_distance[k];
        put(fmt_file);
      End;
      Begin
        fmt_file^.int := hyf_num[k];
        put(fmt_file);
      End;
      Begin
        fmt_file^.int := hyf_next[k];
        put(fmt_file);
      End;
    End;
  print_nl(1281);
  print_int(trie_max);
  print(1282);
  print_int(trie_op_ptr);
  print(1283);
  If trie_op_ptr<>1 Then print_char(115);
  print(1284);
  print_int(trie_op_size);
  For k:=255 Downto 0 Do
    If trie_used[k]>0 Then
      Begin
        print_nl(811);
        print_int(trie_used[k]-0);
        print(1285);
        print_int(k);
        Begin
          fmt_file^.int := k;
          put(fmt_file);
        End;
        Begin
          fmt_file^.int := trie_used[k]-0;
          put(fmt_file);
        End;
      End{:1324};
{1326:}
  Begin
    fmt_file^.int := interaction;
    put(fmt_file);
  End;
  Begin
    fmt_file^.int := format_ident;
    put(fmt_file);
  End;
  Begin
    fmt_file^.int := 69069;
    put(fmt_file);
  End;
  eqtb[5299].int := 0{:1326};
{1329:}
  w_close(fmt_file){:1329};
End;
{:1302}{1348:}{1349:}
Procedure new_whatsit(s:small_number;
                      w:small_number);

Var p: halfword;
Begin
  p := get_node(w);
  mem[p].hh.b0 := 8;
  mem[p].hh.b1 := s;
  mem[cur_list.tail_field].hh.rh := p;
  cur_list.tail_field := p;
End;
{:1349}{1350:}
Procedure new_write_whatsit(w:small_number);
Begin
  new_whatsit(cur_chr,w);
  If w<>2 Then scan_four_bit_int
  Else
    Begin
      scan_int;
      If cur_val<0 Then cur_val := 17
      Else If cur_val>15 Then cur_val := 16;
    End;
  mem[cur_list.tail_field+1].hh.lh := cur_val;
End;
{:1350}
Procedure do_extension;

Var i,j,k: integer;
  p,q,r: halfword;
Begin
  Case cur_chr Of
    0:{1351:}
       Begin
         new_write_whatsit(3);
         scan_optional_equals;
         scan_file_name;
         mem[cur_list.tail_field+1].hh.rh := cur_name;
         mem[cur_list.tail_field+2].hh.lh := cur_area;
         mem[cur_list.tail_field+2].hh.rh := cur_ext;
       End{:1351};
    1:{1352:}
       Begin
         k := cur_cs;
         new_write_whatsit(2);
         cur_cs := k;
         p := scan_toks(false,false);
         mem[cur_list.tail_field+1].hh.rh := def_ref;
       End{:1352};
    2:{1353:}
       Begin
         new_write_whatsit(2);
         mem[cur_list.tail_field+1].hh.rh := 0;
       End{:1353};
    3:{1354:}
       Begin
         new_whatsit(3,2);
         mem[cur_list.tail_field+1].hh.lh := 0;
         p := scan_toks(false,true);
         mem[cur_list.tail_field+1].hh.rh := def_ref;
       End{:1354};
    4:{1375:}
       Begin
         get_x_token;
         If (cur_cmd=59)And(cur_chr<=2)Then
           Begin
             p := cur_list.tail_field;
             do_extension;
             out_what(cur_list.tail_field);
             flush_node_list(cur_list.tail_field);
             cur_list.tail_field := p;
             mem[p].hh.rh := 0;
           End
         Else back_input;
       End{:1375};
    5:{1377:}If abs(cur_list.mode_field)<>102 Then report_illegal_case
       Else
         Begin
           new_whatsit(4,2);
           scan_int;
           If cur_val<=0 Then cur_list.aux_field.hh.rh := 0
           Else If cur_val>255 Then
                  cur_list.aux_field.hh.rh := 0
           Else cur_list.aux_field.hh.rh := cur_val;
           mem[cur_list.tail_field+1].hh.rh := cur_list.aux_field.hh.rh;
           mem[cur_list.tail_field+1].hh.b0 := norm_min(eqtb[5319].int);
           mem[cur_list.tail_field+1].hh.b1 := norm_min(eqtb[5320].int);
         End{:1377};
    others: confusion(1305)
  End;
End;{:1348}{1376:}
Procedure fix_language;

Var l: ASCII_code;
Begin
  If eqtb[5318].int<=0 Then l := 0
  Else If eqtb[5318].int>255 Then l :=
                                       0
  Else l := eqtb[5318].int;
  If l<>cur_list.aux_field.hh.rh Then
    Begin
      new_whatsit(4,2);
      mem[cur_list.tail_field+1].hh.rh := l;
      cur_list.aux_field.hh.rh := l;
      mem[cur_list.tail_field+1].hh.b0 := norm_min(eqtb[5319].int);
      mem[cur_list.tail_field+1].hh.b1 := norm_min(eqtb[5320].int);
    End;
End;
{:1376}{1068:}
Procedure handle_right_brace;

Var p,q: halfword;
  d: scaled;
  f: integer;
Begin
  Case cur_group Of
    1: unsave;
    0:
       Begin
         Begin
           If interaction=3 Then;
           print_nl(263);
           print(1055);
         End;
         Begin
           help_ptr := 2;
           help_line[1] := 1056;
           help_line[0] := 1057;
         End;
         error;
       End;
    14,15,16: extra_right_brace;{1085:}
    2: package(0);
    3:
       Begin
         adjust_tail := 29995;
         package(0);
       End;
    4:
       Begin
         end_graf;
         package(0);
       End;
    5:
       Begin
         end_graf;
         package(4);
       End;{:1085}{1100:}
    11:
        Begin
          end_graf;
          q := eqtb[2892].hh.rh;
          mem[q].hh.rh := mem[q].hh.rh+1;
          d := eqtb[5851].int;
          f := eqtb[5310].int;
          unsave;
          save_ptr := save_ptr-1;
          p := vpackage(mem[cur_list.head_field].hh.rh,0,1,1073741823);
          pop_nest;
          If save_stack[save_ptr+0].int<255 Then
            Begin
              Begin
                mem[cur_list.
                tail_field].hh.rh := get_node(5);
                cur_list.tail_field := mem[cur_list.tail_field].hh.rh;
              End;
              mem[cur_list.tail_field].hh.b0 := 3;
              mem[cur_list.tail_field].hh.b1 := save_stack[save_ptr+0].int+0;
              mem[cur_list.tail_field+3].int := mem[p+3].int+mem[p+2].int;
              mem[cur_list.tail_field+4].hh.lh := mem[p+5].hh.rh;
              mem[cur_list.tail_field+4].hh.rh := q;
              mem[cur_list.tail_field+2].int := d;
              mem[cur_list.tail_field+1].int := f;
            End
          Else
            Begin
              Begin
                mem[cur_list.tail_field].hh.rh := get_node(2);
                cur_list.tail_field := mem[cur_list.tail_field].hh.rh;
              End;
              mem[cur_list.tail_field].hh.b0 := 5;
              mem[cur_list.tail_field].hh.b1 := 0;
              mem[cur_list.tail_field+1].int := mem[p+5].hh.rh;
              delete_glue_ref(q);
            End;
          free_node(p,7);
          If nest_ptr=0 Then build_page;
        End;
    8:{1026:}
       Begin
         If (cur_input.loc_field<>0)Or((cur_input.index_field<>6)
            And(cur_input.index_field<>3))Then{1027:}
           Begin
             Begin
               If interaction=3
                 Then;
               print_nl(263);
               print(1022);
             End;
             Begin
               help_ptr := 2;
               help_line[1] := 1023;
               help_line[0] := 1024;
             End;
             error;
             Repeat
               get_token;
             Until cur_input.loc_field=0;
           End{:1027};
         end_token_list;
         end_graf;
         unsave;
         output_active := false;
         insert_penalties := 0;
{1028:}
         If eqtb[3938].hh.rh<>0 Then
           Begin
             Begin
               If interaction=3 Then;
               print_nl(263);
               print(1025);
             End;
             print_esc(412);
             print_int(255);
             Begin
               help_ptr := 3;
               help_line[2] := 1026;
               help_line[1] := 1027;
               help_line[0] := 1028;
             End;
             box_error(255);
           End{:1028};
         If cur_list.tail_field<>cur_list.head_field Then
           Begin
             mem[page_tail].hh
             .rh := mem[cur_list.head_field].hh.rh;
             page_tail := cur_list.tail_field;
           End;
         If mem[29998].hh.rh<>0 Then
           Begin
             If mem[29999].hh.rh=0 Then nest[0].
               tail_field := page_tail;
             mem[page_tail].hh.rh := mem[29999].hh.rh;
             mem[29999].hh.rh := mem[29998].hh.rh;
             mem[29998].hh.rh := 0;
             page_tail := 29998;
           End;
         flush_node_list(disc_ptr[2]);
         disc_ptr[2] := 0;
         pop_nest;
         build_page;
       End{:1026};{:1100}{1118:}
    10: build_discretionary;
{:1118}{1132:}
    6:
       Begin
         back_input;
         cur_tok := 6710;
         Begin
           If interaction=3 Then;
           print_nl(263);
           print(634);
         End;
         print_esc(911);
         print(635);
         Begin
           help_ptr := 1;
           help_line[0] := 1137;
         End;
         ins_error;
       End;
{:1132}{1133:}
    7:
       Begin
         end_graf;
         unsave;
         align_peek;
       End;
{:1133}{1168:}
    12:
        Begin
          end_graf;
          unsave;
          save_ptr := save_ptr-2;
          p := vpackage(mem[cur_list.head_field].hh.rh,save_stack[save_ptr+1].int,
               save_stack[save_ptr+0].int,1073741823);
          pop_nest;
          Begin
            mem[cur_list.tail_field].hh.rh := new_noad;
            cur_list.tail_field := mem[cur_list.tail_field].hh.rh;
          End;
          mem[cur_list.tail_field].hh.b0 := 29;
          mem[cur_list.tail_field+1].hh.rh := 2;
          mem[cur_list.tail_field+1].hh.lh := p;
        End;{:1168}{1173:}
    13: build_choices;
{:1173}{1186:}
    9:
       Begin
         unsave;
         save_ptr := save_ptr-1;
         mem[save_stack[save_ptr+0].int].hh.rh := 3;
         p := fin_mlist(0);
         mem[save_stack[save_ptr+0].int].hh.lh := p;
         If p<>0 Then If mem[p].hh.rh=0 Then If mem[p].hh.b0=16 Then
                                               Begin
                                                 If mem
                                                    [p+3].hh.rh=0 Then If mem[p+2].hh.rh=0 Then
                                                                         Begin
                                                                           mem[save_stack[
                                                                           save_ptr+0].int].hh :=
                                                                                                 mem
                                                                                                  [p
                                                                                                  +1
                                                                                                  ].
                                                                                                  hh
                                                                           ;
                                                                           free_node(p,4);
                                                                         End;
                                               End
         Else If mem[p].hh.b0=28 Then If save_stack[save_ptr+0].int=cur_list.
                                         tail_field+1 Then If mem[cur_list.tail_field].hh.b0=16 Then
                                                             {1187:}
                                                             Begin
                                                               q := cur_list.head_field;
                                                               While mem[q].hh.rh<>cur_list.
                                                                     tail_field Do
                                                                 q := mem[q].hh.rh;
                                                               mem[q].hh.rh := p;
                                                               free_node(cur_list.tail_field,4);
                                                               cur_list.tail_field := p;
                                                             End{:1187};
       End;{:1186}
    others: confusion(1058)
  End;
End;
{:1068}
Procedure main_control;

Label 60,21,70,80,90,91,92,95,100,101,110,111,112,120,10;

Var t: integer;
Begin
  If eqtb[3419].hh.rh<>0 Then begin_token_list(eqtb[3419].hh.rh,12);
  60: get_x_token;
  21:{1031:}If interrupt<>0 Then If OK_to_interrupt Then
                                   Begin
                                     back_input;
                                     Begin
                                       If interrupt<>0 Then pause_for_instructions;
                                     End;
                                     goto 60;
                                   End;
{if panicking then check_mem(false);}
  If eqtb[5304].int>0 Then show_cur_cmd_chr{:1031};
  Case abs(cur_list.mode_field)+cur_cmd Of
    113,114,170: goto 70;
    118:
         Begin
           scan_char_num;
           cur_chr := cur_val;
           goto 70;
         End;
    167:
         Begin
           get_x_token;
           If (cur_cmd=11)Or(cur_cmd=12)Or(cur_cmd=68)Or(cur_cmd=16)Then
             cancel_boundary := true;
           goto 21;
         End;
    112: If cur_list.aux_field.hh.lh=1000 Then goto 120
         Else app_space;
    166,267: goto 120;{1045:}
    1,102,203,11,213,268:;
    40,141,242:
                Begin{406:}
                  Repeat
                    get_x_token;
                  Until cur_cmd<>10{:406};
                  goto 21;
                End;
    15: If its_all_over Then goto 10;
{1048:}
    23,123,224,71,172,273,{:1048}{1098:}39,{:1098}{1111:}45,{:1111}
{1144:}49,150,{:1144}7,108,209: report_illegal_case;
{1046:}
    8,109,9,110,18,119,70,171,51,152,16,117,50,151,53,154,67,168,54,
    155,55,156,57,158,56,157,31,132,52,153,29,130,47,148,212,216,217,230,227
    ,236,239{:1046}: insert_dollar_sign;
{1056:}
    37,137,238:
                Begin
                  Begin
                    mem[cur_list.tail_field].hh.rh :=
                                                      scan_rule_spec;
                    cur_list.tail_field := mem[cur_list.tail_field].hh.rh;
                  End;
                  If abs(cur_list.mode_field)=1 Then cur_list.aux_field.int := -65536000
                  Else If abs(cur_list.mode_field)=102 Then cur_list.aux_field.hh.lh := 1000
                  ;
                End;{:1056}{1057:}
    28,128,229,231: append_glue;
    30,131,232,233: append_kern;{:1057}{1063:}
    2,103: new_save_level(1);
    62,163,264: new_save_level(14);
    63,164,265: If cur_group=14 Then unsave
                Else off_save;
{:1063}{1067:}
    3,104,205: handle_right_brace;
{:1067}{1073:}
    22,124,225:
                Begin
                  t := cur_chr;
                  scan_dimen(false,false,false);
                  If t=0 Then scan_box(cur_val)
                  Else scan_box(-cur_val);
                End;
    32,133,234: scan_box(1073807261+cur_chr);
    21,122,223: begin_box(0);
{:1073}{1090:}
    44: new_graf(cur_chr>0);
    12,13,17,69,4,24,36,46,48,27,34,65,66:
                                           Begin
                                             back_input;
                                             new_graf(true);
                                           End;{:1090}{1092:}
    145,246: indent_in_hmode;
{:1092}{1094:}
    14:
        Begin
          normal_paragraph;
          If cur_list.mode_field>0 Then build_page;
        End;
    115:
         Begin
           If align_state<0 Then off_save;
           end_graf;
           If cur_list.mode_field=1 Then build_page;
         End;
    116,129,138,126,134: head_for_vmode;
{:1094}{1097:}
    38,139,240,140,241: begin_insert_or_adjust;
    19,120,221: make_mark;{:1097}{1102:}
    43,144,245: append_penalty;
{:1102}{1104:}
    26,127,228: delete_last;{:1104}{1109:}
    25,125,226: unpackage;
{:1109}{1112:}
    146: append_italic_correction;
    247:
         Begin
           mem[cur_list.tail_field].hh.rh := new_kern(0);
           cur_list.tail_field := mem[cur_list.tail_field].hh.rh;
         End;
{:1112}{1116:}
    149,250: append_discretionary;
{:1116}{1122:}
    147: make_accent;
{:1122}{1126:}
    6,107,208,5,106,207: align_error;
    35,136,237: no_align_error;
    64,165,266: omit_error;{:1126}{1130:}
    33: init_align;
    135:{1434:}If cur_chr>0 Then
                 Begin
                   If eTeX_enabled((eqtb[5332].int>0),
                      cur_cmd,cur_chr)Then
                     Begin
                       mem[cur_list.tail_field].hh.rh := new_math(0,
                                                         cur_chr);
                       cur_list.tail_field := mem[cur_list.tail_field].hh.rh;
                     End;
                 End
         Else{:1434}init_align;
    235: If privileged Then If cur_group=15 Then init_align
         Else off_save;
    10,111: do_endv;{:1130}{1134:}
    68,169,270: cs_error;
{:1134}{1137:}
    105: init_math;
{:1137}{1140:}
    251: If privileged Then If cur_group=15 Then start_eq_no
         Else off_save;
{:1140}{1150:}
    204:
         Begin
           Begin
             mem[cur_list.tail_field].hh.rh := new_noad;
             cur_list.tail_field := mem[cur_list.tail_field].hh.rh;
           End;
           back_input;
           scan_math(cur_list.tail_field+1);
         End;
{:1150}{1154:}
    214,215,271: set_math_char(eqtb[5012+cur_chr].hh.rh-0);
    219:
         Begin
           scan_char_num;
           cur_chr := cur_val;
           set_math_char(eqtb[5012+cur_chr].hh.rh-0);
         End;
    220:
         Begin
           scan_fifteen_bit_int;
           set_math_char(cur_val);
         End;
    272: set_math_char(cur_chr);
    218:
         Begin
           scan_twenty_seven_bit_int;
           set_math_char(cur_val Div 4096);
         End;
{:1154}{1158:}
    253:
         Begin
           Begin
             mem[cur_list.tail_field].hh.rh := new_noad;
             cur_list.tail_field := mem[cur_list.tail_field].hh.rh;
           End;
           mem[cur_list.tail_field].hh.b0 := cur_chr;
           scan_math(cur_list.tail_field+1);
         End;
    254: math_limit_switch;
{:1158}{1162:}
    269: math_radical;{:1162}{1164:}
    248,249: math_ac;
{:1164}{1167:}
    259:
         Begin
           scan_spec(12,false);
           normal_paragraph;
           push_nest;
           cur_list.mode_field := -1;
           cur_list.aux_field.int := -65536000;
           If eqtb[3418].hh.rh<>0 Then begin_token_list(eqtb[3418].hh.rh,11);
         End;
{:1167}{1171:}
    256:
         Begin
           mem[cur_list.tail_field].hh.rh := new_style(
                                             cur_chr);
           cur_list.tail_field := mem[cur_list.tail_field].hh.rh;
         End;
    258:
         Begin
           Begin
             mem[cur_list.tail_field].hh.rh := new_glue(0);
             cur_list.tail_field := mem[cur_list.tail_field].hh.rh;
           End;
           mem[cur_list.tail_field].hh.b1 := 98;
         End;
    257: append_choices;
{:1171}{1175:}
    211,210: sub_sup;{:1175}{1180:}
    255: math_fraction;
{:1180}{1190:}
    252: math_left_right;
{:1190}{1193:}
    206: If cur_group=15 Then after_math
         Else off_save;
{:1193}{1210:}
    72,173,274,73,174,275,74,175,276,75,176,277,76,177,278,77,
    178,279,78,179,280,79,180,281,80,181,282,81,182,283,82,183,284,83,184,
    285,84,185,286,85,186,287,86,187,288,87,188,289,88,189,290,89,190,291,90
    ,191,292,91,192,293,92,193,294,93,194,295,94,195,296,95,196,297,96,197,
    298,97,198,299,98,199,300,99,200,301,100,201,302,101,202,303:
                                                                  prefixed_command;{:1210}{1268:}
    41,142,243:
                Begin
                  get_token;
                  after_token := cur_tok;
                End;{:1268}{1271:}
    42,143,244:
                Begin
                  get_token;
                  save_for_after(cur_tok);
                End;{:1271}{1274:}
    61,162,263: open_or_close_in;
{:1274}{1276:}
    59,160,261: issue_message;
{:1276}{1285:}
    58,159,260: shift_case;
{:1285}{1290:}
    20,121,222: show_whatever;
{:1290}{1347:}
    60,161,262: do_extension;{:1347}{:1045}
  End;
  goto 60;
  70:{1034:}main_s := eqtb[4756+cur_chr].hh.rh;
  If main_s=1000 Then cur_list.aux_field.hh.lh := 1000
  Else If main_s<1000
         Then
         Begin
           If main_s>0 Then cur_list.aux_field.hh.lh := main_s;
         End
  Else If cur_list.aux_field.hh.lh<1000 Then cur_list.aux_field.hh.lh
         := 1000
  Else cur_list.aux_field.hh.lh := main_s;
  main_f := eqtb[3939].hh.rh;
  bchar := font_bchar[main_f];
  false_bchar := font_false_bchar[main_f];
  If cur_list.mode_field>0 Then If eqtb[5318].int<>cur_list.aux_field.hh.
                                   rh Then fix_language;
  Begin
    lig_stack := avail;
    If lig_stack=0 Then lig_stack := get_avail
    Else
      Begin
        avail := mem[lig_stack
                 ].hh.rh;
        mem[lig_stack].hh.rh := 0;{dyn_used:=dyn_used+1;}
      End;
  End;
  mem[lig_stack].hh.b0 := main_f;
  cur_l := cur_chr+0;
  mem[lig_stack].hh.b1 := cur_l;
  cur_q := cur_list.tail_field;
  If cancel_boundary Then
    Begin
      cancel_boundary := false;
      main_k := 0;
    End
  Else main_k := bchar_label[main_f];
  If main_k=0 Then goto 92;
  cur_r := cur_l;
  cur_l := 256;
  goto 111;
  80:{1035:}If cur_l<256 Then
              Begin
                If mem[cur_q].hh.rh>0 Then If mem[
                                              cur_list.tail_field].hh.b1=hyphen_char[main_f]+0 Then
                                             ins_disc := true;
                If ligature_present Then
                  Begin
                    main_p := new_ligature(main_f,cur_l,mem[
                              cur_q].hh.rh);
                    If lft_hit Then
                      Begin
                        mem[main_p].hh.b1 := 2;
                        lft_hit := false;
                      End;
                    If rt_hit Then If lig_stack=0 Then
                                     Begin
                                       mem[main_p].hh.b1 := mem[main_p].
                                                            hh.b1+1;
                                       rt_hit := false;
                                     End;
                    mem[cur_q].hh.rh := main_p;
                    cur_list.tail_field := main_p;
                    ligature_present := false;
                  End;
                If ins_disc Then
                  Begin
                    ins_disc := false;
                    If cur_list.mode_field>0 Then
                      Begin
                        mem[cur_list.tail_field].hh.rh :=
                                                          new_disc;
                        cur_list.tail_field := mem[cur_list.tail_field].hh.rh;
                      End;
                  End;
              End{:1035};
  90:{1036:}If lig_stack=0 Then goto 21;
  cur_q := cur_list.tail_field;
  cur_l := mem[lig_stack].hh.b1;
  91: If Not(lig_stack>=hi_mem_min)Then goto 95;
  92: If (cur_chr<font_bc[main_f])Or(cur_chr>font_ec[main_f])Then
        Begin
          char_warning(main_f,cur_chr);
          Begin
            mem[lig_stack].hh.rh := avail;
            avail := lig_stack;{dyn_used:=dyn_used-1;}
          End;
          goto 60;
        End;
  main_i := font_info[char_base[main_f]+cur_l].qqqq;
  If Not(main_i.b0>0)Then
    Begin
      char_warning(main_f,cur_chr);
      Begin
        mem[lig_stack].hh.rh := avail;
        avail := lig_stack;
{dyn_used:=dyn_used-1;}
      End;
      goto 60;
    End;
  mem[cur_list.tail_field].hh.rh := lig_stack;
  cur_list.tail_field := lig_stack{:1036};
  100:{1038:}get_next;
  If cur_cmd=11 Then goto 101;
  If cur_cmd=12 Then goto 101;
  If cur_cmd=68 Then goto 101;
  x_token;
  If cur_cmd=11 Then goto 101;
  If cur_cmd=12 Then goto 101;
  If cur_cmd=68 Then goto 101;
  If cur_cmd=16 Then
    Begin
      scan_char_num;
      cur_chr := cur_val;
      goto 101;
    End;
  If cur_cmd=65 Then bchar := 256;
  cur_r := bchar;
  lig_stack := 0;
  goto 110;
  101: main_s := eqtb[4756+cur_chr].hh.rh;
  If main_s=1000 Then cur_list.aux_field.hh.lh := 1000
  Else If main_s<1000
         Then
         Begin
           If main_s>0 Then cur_list.aux_field.hh.lh := main_s;
         End
  Else If cur_list.aux_field.hh.lh<1000 Then cur_list.aux_field.hh.lh
         := 1000
  Else cur_list.aux_field.hh.lh := main_s;
  Begin
    lig_stack := avail;
    If lig_stack=0 Then lig_stack := get_avail
    Else
      Begin
        avail := mem[lig_stack
                 ].hh.rh;
        mem[lig_stack].hh.rh := 0;{dyn_used:=dyn_used+1;}
      End;
  End;
  mem[lig_stack].hh.b0 := main_f;
  cur_r := cur_chr+0;
  mem[lig_stack].hh.b1 := cur_r;
  If cur_r=false_bchar Then cur_r := 256{:1038};
  110:{1039:}If ((main_i.b2-0)Mod 4)<>1 Then goto 80;
  If cur_r=256 Then goto 80;
  main_k := lig_kern_base[main_f]+main_i.b3;
  main_j := font_info[main_k].qqqq;
  If main_j.b0<=128 Then goto 112;
  main_k := lig_kern_base[main_f]+256*main_j.b2+main_j.b3+32768-256*(128);
  111: main_j := font_info[main_k].qqqq;
  112: If main_j.b1=cur_r Then If main_j.b0<=128 Then{1040:}
                                 Begin
                                   If main_j
                                      .b2>=128 Then
                                     Begin
                                       If cur_l<256 Then
                                         Begin
                                           If mem[cur_q].hh.rh>0 Then
                                             If mem[cur_list.tail_field].hh.b1=hyphen_char[main_f]+0
                                               Then ins_disc :=
                                                                true;
                                           If ligature_present Then
                                             Begin
                                               main_p := new_ligature(main_f,cur_l,mem[
                                                         cur_q].hh.rh);
                                               If lft_hit Then
                                                 Begin
                                                   mem[main_p].hh.b1 := 2;
                                                   lft_hit := false;
                                                 End;
                                               If rt_hit Then If lig_stack=0 Then
                                                                Begin
                                                                  mem[main_p].hh.b1 := mem[main_p].
                                                                                       hh.b1+1;
                                                                  rt_hit := false;
                                                                End;
                                               mem[cur_q].hh.rh := main_p;
                                               cur_list.tail_field := main_p;
                                               ligature_present := false;
                                             End;
                                           If ins_disc Then
                                             Begin
                                               ins_disc := false;
                                               If cur_list.mode_field>0 Then
                                                 Begin
                                                   mem[cur_list.tail_field].hh.rh :=
                                                                                     new_disc;
                                                   cur_list.tail_field := mem[cur_list.tail_field].
                                                                          hh.rh;
                                                 End;
                                             End;
                                         End;
                                       Begin
                                         mem[cur_list.tail_field].hh.rh := new_kern(font_info[
                                                                           kern_base[
                                                                           main_f]+256*main_j.b2+
                                                                           main_j.b3].int);
                                         cur_list.tail_field := mem[cur_list.tail_field].hh.rh;
                                       End;
                                       goto 90;
                                     End;
                                   If cur_l=256 Then lft_hit := true
                                   Else If lig_stack=0 Then rt_hit := true;
                                   Begin
                                     If interrupt<>0 Then pause_for_instructions;
                                   End;
                                   Case main_j.b2 Of
                                     1,5:
                                          Begin
                                            cur_l := main_j.b3;
                                            main_i := font_info[char_base[main_f]+cur_l].qqqq;
                                            ligature_present := true;
                                          End;
                                     2,6:
                                          Begin
                                            cur_r := main_j.b3;
                                            If lig_stack=0 Then
                                              Begin
                                                lig_stack := new_lig_item(cur_r);
                                                bchar := 256;
                                              End
                                            Else If (lig_stack>=hi_mem_min)Then
                                                   Begin
                                                     main_p := lig_stack;
                                                     lig_stack := new_lig_item(cur_r);
                                                     mem[lig_stack+1].hh.rh := main_p;
                                                   End
                                            Else mem[lig_stack].hh.b1 := cur_r;
                                          End;
                                     3:
                                        Begin
                                          cur_r := main_j.b3;
                                          main_p := lig_stack;
                                          lig_stack := new_lig_item(cur_r);
                                          mem[lig_stack].hh.rh := main_p;
                                        End;
                                     7,11:
                                           Begin
                                             If cur_l<256 Then
                                               Begin
                                                 If mem[cur_q].hh.rh>0 Then If mem[
                                                                               cur_list.tail_field].
                                                                               hh.b1=hyphen_char[
                                                                               main_f]+0 Then
                                                                              ins_disc := true;
                                                 If ligature_present Then
                                                   Begin
                                                     main_p := new_ligature(main_f,cur_l,mem[
                                                               cur_q].hh.rh);
                                                     If lft_hit Then
                                                       Begin
                                                         mem[main_p].hh.b1 := 2;
                                                         lft_hit := false;
                                                       End;
                                                     If false Then If lig_stack=0 Then
                                                                     Begin
                                                                       mem[main_p].hh.b1 := mem[
                                                                                            main_p].
                                                                                            hh.b1+1;
                                                                       rt_hit := false;
                                                                     End;
                                                     mem[cur_q].hh.rh := main_p;
                                                     cur_list.tail_field := main_p;
                                                     ligature_present := false;
                                                   End;
                                                 If ins_disc Then
                                                   Begin
                                                     ins_disc := false;
                                                     If cur_list.mode_field>0 Then
                                                       Begin
                                                         mem[cur_list.tail_field].hh.rh :=
                                                                                           new_disc;
                                                         cur_list.tail_field := mem[cur_list.
                                                                                tail_field].hh.rh;
                                                       End;
                                                   End;
                                               End;
                                             cur_q := cur_list.tail_field;
                                             cur_l := main_j.b3;
                                             main_i := font_info[char_base[main_f]+cur_l].qqqq;
                                             ligature_present := true;
                                           End;
                                     others:
                                             Begin
                                               cur_l := main_j.b3;
                                               ligature_present := true;
                                               If lig_stack=0 Then goto 80
                                               Else goto 91;
                                             End
                                   End;
                                   If main_j.b2>4 Then If main_j.b2<>7 Then goto 80;
                                   If cur_l<256 Then goto 110;
                                   main_k := bchar_label[main_f];
                                   goto 111;
                                 End{:1040};
  If main_j.b0=0 Then main_k := main_k+1
  Else
    Begin
      If main_j.b0>=128 Then
        goto 80;
      main_k := main_k+main_j.b0+1;
    End;
  goto 111{:1039};
  95:{1037:}main_p := mem[lig_stack+1].hh.rh;
  If main_p>0 Then
    Begin
      mem[cur_list.tail_field].hh.rh := main_p;
      cur_list.tail_field := mem[cur_list.tail_field].hh.rh;
    End;
  temp_ptr := lig_stack;
  lig_stack := mem[temp_ptr].hh.rh;
  free_node(temp_ptr,2);
  main_i := font_info[char_base[main_f]+cur_l].qqqq;
  ligature_present := true;
  If lig_stack=0 Then If main_p>0 Then goto 100
  Else cur_r := bchar
  Else
    cur_r := mem[lig_stack].hh.b1;
  goto 110{:1037}{:1034};
  120:{1041:}If eqtb[2894].hh.rh=0 Then
               Begin{1042:}
                 Begin
                   main_p :=
                             font_glue[eqtb[3939].hh.rh];
                   If main_p=0 Then
                     Begin
                       main_p := new_spec(0);
                       main_k := param_base[eqtb[3939].hh.rh]+2;
                       mem[main_p+1].int := font_info[main_k].int;
                       mem[main_p+2].int := font_info[main_k+1].int;
                       mem[main_p+3].int := font_info[main_k+2].int;
                       font_glue[eqtb[3939].hh.rh] := main_p;
                     End;
                 End{:1042};
                 temp_ptr := new_glue(main_p);
               End
       Else temp_ptr := new_param_glue(12);
  mem[cur_list.tail_field].hh.rh := temp_ptr;
  cur_list.tail_field := temp_ptr;
  goto 60{:1041};
  10:
End;{:1030}{1284:}
Procedure give_err_help;
Begin
  token_show(eqtb[3421].hh.rh);
End;
{:1284}{1303:}{524:}
Function open_fmt_file: boolean;

Label 40,10;

Var j: 0..buf_size;
Begin
  j := cur_input.loc_field;
  If buffer[cur_input.loc_field]=38 Then
    Begin
      cur_input.loc_field :=
                             cur_input.loc_field+1;
      j := cur_input.loc_field;
      buffer[last] := 32;
      While buffer[j]<>32 Do
        j := j+1;
      pack_buffered_name(0,cur_input.loc_field,j-1);
      If w_open_in(fmt_file)Then goto 40;
      pack_buffered_name(11,cur_input.loc_field,j-1);
      If w_open_in(fmt_file)Then goto 40;;
      write_ln(term_out,'Sorry, I can''t find that format;',' will try PLAIN.'
      );
      break(term_out);
    End;
  pack_buffered_name(16,1,0);
  If Not w_open_in(fmt_file)Then
    Begin;
      write_ln(term_out,'I can''t find the PLAIN format file!');
      open_fmt_file := false;
      goto 10;
    End;
  40: cur_input.loc_field := j;
  open_fmt_file := true;
  10:
End;{:524}
Function load_fmt_file: boolean;

Label 6666,10;

Var j,k: integer;
  p,q: halfword;
  x: integer;
  w: four_quarters;
Begin{1308:}
  x := fmt_file^.int;
  If x<>236367277 Then goto 6666;
{1386:}
  Begin
    Begin
      get(fmt_file);
      x := fmt_file^.int;
    End;
    If (x<0)Or(x>1)Then goto 6666
    Else eTeX_mode := x;
  End;
  If (eTeX_mode=1)Then
    Begin{1548:}
      max_reg_num := 32767;
      max_reg_help_line := 1410;{:1548}
    End
  Else
    Begin{1547:}
      max_reg_num := 255;
      max_reg_help_line := 697;{:1547}
    End;{:1386}
  Begin
    get(fmt_file);
    x := fmt_file^.int;
  End;
  If x<>0 Then goto 6666;
  Begin
    get(fmt_file);
    x := fmt_file^.int;
  End;
  If x<>30000 Then goto 6666;
  Begin
    get(fmt_file);
    x := fmt_file^.int;
  End;
  If x<>6121 Then goto 6666;
  Begin
    get(fmt_file);
    x := fmt_file^.int;
  End;
  If x<>1777 Then goto 6666;
  Begin
    get(fmt_file);
    x := fmt_file^.int;
  End;
  If x<>307 Then goto 6666{:1308};
{1310:}
  Begin
    Begin
      get(fmt_file);
      x := fmt_file^.int;
    End;
    If x<0 Then goto 6666;
    If x>pool_size Then
      Begin;
        write_ln(term_out,'---! Must increase the ','string pool size');
        goto 6666;
      End
    Else pool_ptr := x;
  End;
  Begin
    Begin
      get(fmt_file);
      x := fmt_file^.int;
    End;
    If x<0 Then goto 6666;
    If x>max_strings Then
      Begin;
        write_ln(term_out,'---! Must increase the ','max strings');
        goto 6666;
      End
    Else str_ptr := x;
  End;
  For k:=0 To str_ptr Do
    Begin
      Begin
        get(fmt_file);
        x := fmt_file^.int;
      End;
      If (x<0)Or(x>pool_ptr)Then goto 6666
      Else str_start[k] := x;
    End;
  k := 0;
  While k+4<pool_ptr Do
    Begin
      Begin
        get(fmt_file);
        w := fmt_file^.qqqq;
      End;
      str_pool[k] := w.b0-0;
      str_pool[k+1] := w.b1-0;
      str_pool[k+2] := w.b2-0;
      str_pool[k+3] := w.b3-0;
      k := k+4;
    End;
  k := pool_ptr-4;
  Begin
    get(fmt_file);
    w := fmt_file^.qqqq;
  End;
  str_pool[k] := w.b0-0;
  str_pool[k+1] := w.b1-0;
  str_pool[k+2] := w.b2-0;
  str_pool[k+3] := w.b3-0;
  init_str_ptr := str_ptr;
  init_pool_ptr := pool_ptr{:1310};{1312:}
  Begin
    Begin
      get(fmt_file);
      x := fmt_file^.int;
    End;
    If (x<1019)Or(x>29986)Then goto 6666
    Else lo_mem_max := x;
  End;
  Begin
    Begin
      get(fmt_file);
      x := fmt_file^.int;
    End;
    If (x<20)Or(x>lo_mem_max)Then goto 6666
    Else rover := x;
  End;
  If (eTeX_mode=1)Then For k:=0 To 5 Do
                         Begin
                           Begin
                             get(fmt_file);
                             x := fmt_file^.int;
                           End;
                           If (x<0)Or(x>lo_mem_max)Then goto 6666
                           Else sa_root[k] := x;
                         End;
  p := 0;
  q := rover;
  Repeat
    For k:=p To q+1 Do
      Begin
        get(fmt_file);
        mem[k] := fmt_file^;
      End;
    p := q+mem[q].hh.lh;
    If (p>lo_mem_max)Or((q>=mem[q+1].hh.rh)And(mem[q+1].hh.rh<>rover))Then
      goto 6666;
    q := mem[q+1].hh.rh;
  Until q=rover;
  For k:=p To lo_mem_max Do
    Begin
      get(fmt_file);
      mem[k] := fmt_file^;
    End;
  If mem_min<-2 Then
    Begin
      p := mem[rover+1].hh.lh;
      q := mem_min+1;
      mem[mem_min].hh.rh := 0;
      mem[mem_min].hh.lh := 0;
      mem[p+1].hh.rh := q;
      mem[rover+1].hh.lh := q;
      mem[q+1].hh.rh := rover;
      mem[q+1].hh.lh := p;
      mem[q].hh.rh := 65535;
      mem[q].hh.lh := -0-q;
    End;
  Begin
    Begin
      get(fmt_file);
      x := fmt_file^.int;
    End;
    If (x<lo_mem_max+1)Or(x>29987)Then goto 6666
    Else hi_mem_min := x;
  End;
  Begin
    Begin
      get(fmt_file);
      x := fmt_file^.int;
    End;
    If (x<0)Or(x>30000)Then goto 6666
    Else avail := x;
  End;
  mem_end := 30000;
  For k:=hi_mem_min To mem_end Do
    Begin
      get(fmt_file);
      mem[k] := fmt_file^;
    End;
  Begin
    get(fmt_file);
    var_used := fmt_file^.int;
  End;
  Begin
    get(fmt_file);
    dyn_used := fmt_file^.int;
  End{:1312};{1314:}{1317:}
  k := 1;
  Repeat
    Begin
      get(fmt_file);
      x := fmt_file^.int;
    End;
    If (x<1)Or(k+x>6122)Then goto 6666;
    For j:=k To k+x-1 Do
      Begin
        get(fmt_file);
        eqtb[j] := fmt_file^;
      End;
    k := k+x;
    Begin
      get(fmt_file);
      x := fmt_file^.int;
    End;
    If (x<0)Or(k+x>6122)Then goto 6666;
    For j:=k To k+x-1 Do
      eqtb[j] := eqtb[k-1];
    k := k+x;
  Until k>6121{:1317};
  Begin
    Begin
      get(fmt_file);
      x := fmt_file^.int;
    End;
    If (x<514)Or(x>2614)Then goto 6666
    Else par_loc := x;
  End;
  par_token := 4095+par_loc;
  Begin
    Begin
      get(fmt_file);
      x := fmt_file^.int;
    End;
    If (x<514)Or(x>2614)Then goto 6666
    Else write_loc := x;
  End;
{1319:}
  Begin
    Begin
      get(fmt_file);
      x := fmt_file^.int;
    End;
    If (x<514)Or(x>2614)Then goto 6666
    Else hash_used := x;
  End;
  p := 513;
  Repeat
    Begin
      Begin
        get(fmt_file);
        x := fmt_file^.int;
      End;
      If (x<p+1)Or(x>hash_used)Then goto 6666
      Else p := x;
    End;
    Begin
      get(fmt_file);
      hash[p] := fmt_file^.hh;
    End;
  Until p=hash_used;
  For p:=hash_used+1 To 2880 Do
    Begin
      get(fmt_file);
      hash[p] := fmt_file^.hh;
    End;
  Begin
    get(fmt_file);
    cs_count := fmt_file^.int;
  End{:1319}{:1314};
{1321:}
  Begin
    Begin
      get(fmt_file);
      x := fmt_file^.int;
    End;
    If x<7 Then goto 6666;
    If x>font_mem_size Then
      Begin;
        write_ln(term_out,'---! Must increase the ','font mem size');
        goto 6666;
      End
    Else fmem_ptr := x;
  End;
  For k:=0 To fmem_ptr-1 Do
    Begin
      get(fmt_file);
      font_info[k] := fmt_file^;
    End;
  Begin
    Begin
      get(fmt_file);
      x := fmt_file^.int;
    End;
    If x<0 Then goto 6666;
    If x>font_max Then
      Begin;
        write_ln(term_out,'---! Must increase the ','font max');
        goto 6666;
      End
    Else font_ptr := x;
  End;
  For k:=0 To font_ptr Do{1323:}
    Begin
      Begin
        get(fmt_file);
        font_check[k] := fmt_file^.qqqq;
      End;
      Begin
        get(fmt_file);
        font_size[k] := fmt_file^.int;
      End;
      Begin
        get(fmt_file);
        font_dsize[k] := fmt_file^.int;
      End;
      Begin
        Begin
          get(fmt_file);
          x := fmt_file^.int;
        End;
        If (x<0)Or(x>65535)Then goto 6666
        Else font_params[k] := x;
      End;
      Begin
        get(fmt_file);
        hyphen_char[k] := fmt_file^.int;
      End;
      Begin
        get(fmt_file);
        skew_char[k] := fmt_file^.int;
      End;
      Begin
        Begin
          get(fmt_file);
          x := fmt_file^.int;
        End;
        If (x<0)Or(x>str_ptr)Then goto 6666
        Else font_name[k] := x;
      End;
      Begin
        Begin
          get(fmt_file);
          x := fmt_file^.int;
        End;
        If (x<0)Or(x>str_ptr)Then goto 6666
        Else font_area[k] := x;
      End;
      Begin
        Begin
          get(fmt_file);
          x := fmt_file^.int;
        End;
        If (x<0)Or(x>255)Then goto 6666
        Else font_bc[k] := x;
      End;
      Begin
        Begin
          get(fmt_file);
          x := fmt_file^.int;
        End;
        If (x<0)Or(x>255)Then goto 6666
        Else font_ec[k] := x;
      End;
      Begin
        get(fmt_file);
        char_base[k] := fmt_file^.int;
      End;
      Begin
        get(fmt_file);
        width_base[k] := fmt_file^.int;
      End;
      Begin
        get(fmt_file);
        height_base[k] := fmt_file^.int;
      End;
      Begin
        get(fmt_file);
        depth_base[k] := fmt_file^.int;
      End;
      Begin
        get(fmt_file);
        italic_base[k] := fmt_file^.int;
      End;
      Begin
        get(fmt_file);
        lig_kern_base[k] := fmt_file^.int;
      End;
      Begin
        get(fmt_file);
        kern_base[k] := fmt_file^.int;
      End;
      Begin
        get(fmt_file);
        exten_base[k] := fmt_file^.int;
      End;
      Begin
        get(fmt_file);
        param_base[k] := fmt_file^.int;
      End;
      Begin
        Begin
          get(fmt_file);
          x := fmt_file^.int;
        End;
        If (x<0)Or(x>lo_mem_max)Then goto 6666
        Else font_glue[k] := x;
      End;
      Begin
        Begin
          get(fmt_file);
          x := fmt_file^.int;
        End;
        If (x<0)Or(x>fmem_ptr-1)Then goto 6666
        Else bchar_label[k] := x;
      End;
      Begin
        Begin
          get(fmt_file);
          x := fmt_file^.int;
        End;
        If (x<0)Or(x>256)Then goto 6666
        Else font_bchar[k] := x;
      End;
      Begin
        Begin
          get(fmt_file);
          x := fmt_file^.int;
        End;
        If (x<0)Or(x>256)Then goto 6666
        Else font_false_bchar[k] := x;
      End;
    End{:1323}{:1321};{1325:}
  Begin
    Begin
      get(fmt_file);
      x := fmt_file^.int;
    End;
    If (x<0)Or(x>307)Then goto 6666
    Else hyph_count := x;
  End;
  For k:=1 To hyph_count Do
    Begin
      Begin
        Begin
          get(fmt_file);
          x := fmt_file^.int;
        End;
        If (x<0)Or(x>307)Then goto 6666
        Else j := x;
      End;
      Begin
        Begin
          get(fmt_file);
          x := fmt_file^.int;
        End;
        If (x<0)Or(x>str_ptr)Then goto 6666
        Else hyph_word[j] := x;
      End;
      Begin
        Begin
          get(fmt_file);
          x := fmt_file^.int;
        End;
        If (x<0)Or(x>65535)Then goto 6666
        Else hyph_list[j] := x;
      End;
    End;
  Begin
    Begin
      get(fmt_file);
      x := fmt_file^.int;
    End;
    If x<0 Then goto 6666;
    If x>trie_size Then
      Begin;
        write_ln(term_out,'---! Must increase the ','trie size');
        goto 6666;
      End
    Else j := x;
  End;
  trie_max := j;
  Begin
    Begin
      get(fmt_file);
      x := fmt_file^.int;
    End;
    If (x<0)Or(x>j)Then goto 6666
    Else hyph_start := x;
  End;
  For k:=0 To j Do
    Begin
      get(fmt_file);
      trie[k] := fmt_file^.hh;
    End;
  Begin
    Begin
      get(fmt_file);
      x := fmt_file^.int;
    End;
    If x<0 Then goto 6666;
    If x>trie_op_size Then
      Begin;
        write_ln(term_out,'---! Must increase the ','trie op size');
        goto 6666;
      End
    Else j := x;
  End;
  trie_op_ptr := j;
  For k:=1 To j Do
    Begin
      Begin
        Begin
          get(fmt_file);
          x := fmt_file^.int;
        End;
        If (x<0)Or(x>63)Then goto 6666
        Else hyf_distance[k] := x;
      End;
      Begin
        Begin
          get(fmt_file);
          x := fmt_file^.int;
        End;
        If (x<0)Or(x>63)Then goto 6666
        Else hyf_num[k] := x;
      End;
      Begin
        Begin
          get(fmt_file);
          x := fmt_file^.int;
        End;
        If (x<0)Or(x>255)Then goto 6666
        Else hyf_next[k] := x;
      End;
    End;
  For k:=0 To 255 Do
    trie_used[k] := 0;
  k := 256;
  While j>0 Do
    Begin
      Begin
        Begin
          get(fmt_file);
          x := fmt_file^.int;
        End;
        If (x<0)Or(x>k-1)Then goto 6666
        Else k := x;
      End;
      Begin
        Begin
          get(fmt_file);
          x := fmt_file^.int;
        End;
        If (x<1)Or(x>j)Then goto 6666
        Else x := x;
      End;
      trie_used[k] := x+0;
      j := j-x;
      op_start[k] := j-0;
    End;
  trie_not_ready := false{:1325};{1327:}
  Begin
    Begin
      get(fmt_file);
      x := fmt_file^.int;
    End;
    If (x<0)Or(x>3)Then goto 6666
    Else interaction := x;
  End;
  Begin
    Begin
      get(fmt_file);
      x := fmt_file^.int;
    End;
    If (x<0)Or(x>str_ptr)Then goto 6666
    Else format_ident := x;
  End;
  Begin
    get(fmt_file);
    x := fmt_file^.int;
  End;
  If (x<>69069)Or eof(fmt_file)Then goto 6666{:1327};
  load_fmt_file := true;
  goto 10;
  6666:;
  write_ln(term_out,'(Fatal format file error; I''m stymied)');
  load_fmt_file := false;
  10:
End;
{:1303}{1330:}{1333:}
Procedure close_files_and_terminate;

Var k: integer;
Begin{1378:}
  For k:=0 To 15 Do
    If write_open[k]Then a_close(write_file[k]
      ){:1378};
  eqtb[5317].int := -1;

{if eqtb[5299].int>0 then[1334:]if log_opened then begin write_ln(
log_file,' ');
write_ln(log_file,'Here is how much of TeX''s memory',' you used:');
write(log_file,' ',str_ptr-init_str_ptr:1,' string');
if str_ptr<>init_str_ptr+1 then write(log_file,'s');
write_ln(log_file,' out of ',max_strings-init_str_ptr:1);
write_ln(log_file,' ',pool_ptr-init_pool_ptr:1,
' string characters out of ',pool_size-init_pool_ptr:1);
write_ln(log_file,' ',lo_mem_max-mem_min+mem_end-hi_mem_min+2:1,
' words of memory out of ',mem_end+1-mem_min:1);
write_ln(log_file,' ',cs_count:1,
' multiletter control sequences out of ',2100:1);
write(log_file,' ',fmem_ptr:1,' words of font info for ',font_ptr-0:1,
' font');if font_ptr<>1 then write(log_file,'s');
write_ln(log_file,', out of ',font_mem_size:1,' for ',font_max-0:1);
write(log_file,' ',hyph_count:1,' hyphenation exception');
if hyph_count<>1 then write(log_file,'s');
write_ln(log_file,' out of ',307:1);
write_ln(log_file,' ',max_in_stack:1,'i,',max_nest_stack:1,'n,',
max_param_stack:1,'p,',max_buf_stack+1:1,'b,',max_save_stack+6:1,
's stack positions out of ',stack_size:1,'i,',nest_size:1,'n,',
param_size:1,'p,',buf_size:1,'b,',save_size:1,'s');end[:1334];}
  ;
{642:}
  While cur_s>-1 Do
    Begin
      If cur_s>0 Then
        Begin
          dvi_buf[dvi_ptr] :=
                              142;
          dvi_ptr := dvi_ptr+1;
          If dvi_ptr=dvi_limit Then dvi_swap;
        End
      Else
        Begin
          Begin
            dvi_buf[dvi_ptr] := 140;
            dvi_ptr := dvi_ptr+1;
            If dvi_ptr=dvi_limit Then dvi_swap;
          End;
          total_pages := total_pages+1;
        End;
      cur_s := cur_s-1;
    End;
  If total_pages=0 Then print_nl(848)
  Else
    Begin
      Begin
        dvi_buf[dvi_ptr] :=
                            248;
        dvi_ptr := dvi_ptr+1;
        If dvi_ptr=dvi_limit Then dvi_swap;
      End;
      dvi_four(last_bop);
      last_bop := dvi_offset+dvi_ptr-5;
      dvi_four(25400000);
      dvi_four(473628672);
      prepare_mag;
      dvi_four(eqtb[5285].int);
      dvi_four(max_v);
      dvi_four(max_h);
      Begin
        dvi_buf[dvi_ptr] := max_push Div 256;
        dvi_ptr := dvi_ptr+1;
        If dvi_ptr=dvi_limit Then dvi_swap;
      End;
      Begin
        dvi_buf[dvi_ptr] := max_push Mod 256;
        dvi_ptr := dvi_ptr+1;
        If dvi_ptr=dvi_limit Then dvi_swap;
      End;
      Begin
        dvi_buf[dvi_ptr] := (total_pages Div 256)Mod 256;
        dvi_ptr := dvi_ptr+1;
        If dvi_ptr=dvi_limit Then dvi_swap;
      End;
      Begin
        dvi_buf[dvi_ptr] := total_pages Mod 256;
        dvi_ptr := dvi_ptr+1;
        If dvi_ptr=dvi_limit Then dvi_swap;
      End;
{643:}
      While font_ptr>0 Do
        Begin
          If font_used[font_ptr]Then dvi_font_def(
                                                  font_ptr);
          font_ptr := font_ptr-1;
        End{:643};
      Begin
        dvi_buf[dvi_ptr] := 249;
        dvi_ptr := dvi_ptr+1;
        If dvi_ptr=dvi_limit Then dvi_swap;
      End;
      dvi_four(last_bop);
      Begin
        dvi_buf[dvi_ptr] := 2;
        dvi_ptr := dvi_ptr+1;
        If dvi_ptr=dvi_limit Then dvi_swap;
      End;
      k := 4+((dvi_buf_size-dvi_ptr)Mod 4);
      While k>0 Do
        Begin
          Begin
            dvi_buf[dvi_ptr] := 223;
            dvi_ptr := dvi_ptr+1;
            If dvi_ptr=dvi_limit Then dvi_swap;
          End;
          k := k-1;
        End;
{599:}
      If dvi_limit=half_buf Then write_dvi(half_buf,dvi_buf_size-1);
      If dvi_ptr>0 Then write_dvi(0,dvi_ptr-1){:599};
      print_nl(849);
      slow_print(output_file_name);
      print(287);
      print_int(total_pages);
      print(850);
      If total_pages<>1 Then print_char(115);
      print(851);
      print_int(dvi_offset+dvi_ptr);
      print(852);
      b_close(dvi_file);
    End{:642};
  If log_opened Then
    Begin
      write_ln(log_file);
      a_close(log_file);
      selector := selector-2;
      If selector=17 Then
        Begin
          print_nl(1289);
          slow_print(log_name);
          print_char(46);
        End;
    End;
End;
{:1333}{1335:}
Procedure final_cleanup;

Label 10;

Var c: small_number;
Begin
  c := cur_chr;
  If c<>1 Then eqtb[5317].int := -1;
  If job_name=0 Then open_log_file;
  While input_ptr>0 Do
    If cur_input.state_field=0 Then end_token_list
    Else
      end_file_reading;
  While open_parens>0 Do
    Begin
      print(1290);
      open_parens := open_parens-1;
    End;
  If cur_level>1 Then
    Begin
      print_nl(40);
      print_esc(1291);
      print(1292);
      print_int(cur_level-1);
      print_char(41);
      If (eTeX_mode=1)Then show_save_groups;
    End;
  While cond_ptr<>0 Do
    Begin
      print_nl(40);
      print_esc(1291);
      print(1293);
      print_cmd_chr(105,cur_if);
      If if_line<>0 Then
        Begin
          print(1294);
          print_int(if_line);
        End;
      print(1295);
      if_line := mem[cond_ptr+1].int;
      cur_if := mem[cond_ptr].hh.b1;
      temp_ptr := cond_ptr;
      cond_ptr := mem[cond_ptr].hh.rh;
      free_node(temp_ptr,2);
    End;
  If history<>0 Then If ((history=1)Or(interaction<3))Then If selector=19
                                                             Then
                                                             Begin
                                                               selector := 17;
                                                               print_nl(1296);
                                                               selector := 19;
                                                             End;
  If c=1 Then
    Begin
      For c:=0 To 4 Do
        If cur_mark[c]<>0 Then
          delete_token_ref(cur_mark[c]);
      If sa_root[6]<>0 Then If do_marks(3,0,sa_root[6])Then sa_root[6] := 0;
      For c:=2 To 3 Do
        flush_node_list(disc_ptr[c]);
      If last_glue<>65535 Then delete_glue_ref(last_glue);
      store_fmt_file;
      goto 10;
      print_nl(1297);
      goto 10;
    End;
  10:
End;
{:1335}{1336:}
Procedure init_prim;
Begin
  no_new_control_sequence := false;
  first := 0;{226:}
  primitive(379,75,2882);
  primitive(380,75,2883);
  primitive(381,75,2884);
  primitive(382,75,2885);
  primitive(383,75,2886);
  primitive(384,75,2887);
  primitive(385,75,2888);
  primitive(386,75,2889);
  primitive(387,75,2890);
  primitive(388,75,2891);
  primitive(389,75,2892);
  primitive(390,75,2893);
  primitive(391,75,2894);
  primitive(392,75,2895);
  primitive(393,75,2896);
  primitive(394,76,2897);
  primitive(395,76,2898);
  primitive(396,76,2899);{:226}{230:}
  primitive(401,72,3413);
  primitive(402,72,3414);
  primitive(403,72,3415);
  primitive(404,72,3416);
  primitive(405,72,3417);
  primitive(406,72,3418);
  primitive(407,72,3419);
  primitive(408,72,3420);
  primitive(409,72,3421);
{:230}{238:}
  primitive(423,73,5268);
  primitive(424,73,5269);
  primitive(425,73,5270);
  primitive(426,73,5271);
  primitive(427,73,5272);
  primitive(428,73,5273);
  primitive(429,73,5274);
  primitive(430,73,5275);
  primitive(431,73,5276);
  primitive(432,73,5277);
  primitive(433,73,5278);
  primitive(434,73,5279);
  primitive(435,73,5280);
  primitive(436,73,5281);
  primitive(437,73,5282);
  primitive(438,73,5283);
  primitive(439,73,5284);
  primitive(440,73,5285);
  primitive(441,73,5286);
  primitive(442,73,5287);
  primitive(443,73,5288);
  primitive(444,73,5289);
  primitive(445,73,5290);
  primitive(446,73,5291);
  primitive(447,73,5292);
  primitive(448,73,5293);
  primitive(449,73,5294);
  primitive(450,73,5295);
  primitive(451,73,5296);
  primitive(452,73,5297);
  primitive(453,73,5298);
  primitive(454,73,5299);
  primitive(455,73,5300);
  primitive(456,73,5301);
  primitive(457,73,5302);
  primitive(458,73,5303);
  primitive(459,73,5304);
  primitive(460,73,5305);
  primitive(461,73,5306);
  primitive(462,73,5307);
  primitive(463,73,5308);
  primitive(464,73,5309);
  primitive(465,73,5310);
  primitive(466,73,5311);
  primitive(467,73,5312);
  primitive(468,73,5313);
  primitive(469,73,5314);
  primitive(470,73,5315);
  primitive(471,73,5316);
  primitive(472,73,5317);
  primitive(473,73,5318);
  primitive(474,73,5319);
  primitive(475,73,5320);
  primitive(476,73,5321);
  primitive(477,73,5322);
{:238}{248:}
  primitive(481,74,5845);
  primitive(482,74,5846);
  primitive(483,74,5847);
  primitive(484,74,5848);
  primitive(485,74,5849);
  primitive(486,74,5850);
  primitive(487,74,5851);
  primitive(488,74,5852);
  primitive(489,74,5853);
  primitive(490,74,5854);
  primitive(491,74,5855);
  primitive(492,74,5856);
  primitive(493,74,5857);
  primitive(494,74,5858);
  primitive(495,74,5859);
  primitive(496,74,5860);
  primitive(497,74,5861);
  primitive(498,74,5862);
  primitive(499,74,5863);
  primitive(500,74,5864);
  primitive(501,74,5865);{:248}{265:}
  primitive(32,64,0);
  primitive(47,44,0);
  primitive(511,45,0);
  primitive(512,90,0);
  primitive(513,40,0);
  primitive(514,41,0);
  primitive(515,61,0);
  primitive(516,16,0);
  primitive(507,107,0);
  primitive(517,15,0);
  primitive(518,92,0);
  primitive(508,67,0);
  primitive(519,62,0);
  hash[2616].rh := 519;
  eqtb[2616] := eqtb[cur_val];
  primitive(520,102,0);
  primitive(521,88,0);
  primitive(522,77,0);
  primitive(523,32,0);
  primitive(524,36,0);
  primitive(525,39,0);
  primitive(331,37,0);
  primitive(354,18,0);
  primitive(526,46,0);
  primitive(527,17,0);
  primitive(528,54,0);
  primitive(529,91,0);
  primitive(530,34,0);
  primitive(531,65,0);
  primitive(532,103,0);
  primitive(336,55,0);
  primitive(533,63,0);
  primitive(534,84,3412);
  primitive(535,42,0);
  primitive(536,80,0);
  primitive(537,66,0);
  primitive(538,96,0);
  primitive(539,0,256);
  hash[2621].rh := 539;
  eqtb[2621] := eqtb[cur_val];
  primitive(540,98,0);
  primitive(541,109,0);
  primitive(410,71,0);
  primitive(355,38,0);
  primitive(542,33,0);
  primitive(543,56,0);
  primitive(544,35,0);{:265}{334:}
  primitive(606,13,256);
  par_loc := cur_val;
  par_token := 4095+par_loc;{:334}{376:}
  primitive(638,104,0);
  primitive(639,104,1);{:376}{384:}
  primitive(640,110,0);
  primitive(641,110,1);
  primitive(642,110,2);
  primitive(643,110,3);
  primitive(644,110,4);{:384}{411:}
  primitive(479,89,0);
  primitive(503,89,1);
  primitive(398,89,2);
  primitive(399,89,3);
{:411}{416:}
  primitive(677,79,102);
  primitive(678,79,1);
  primitive(679,82,0);
  primitive(680,82,1);
  primitive(681,83,1);
  primitive(682,83,3);
  primitive(683,83,2);
  primitive(684,70,0);
  primitive(685,70,1);
  primitive(686,70,2);
  primitive(687,70,4);
  primitive(688,70,5);{:416}{468:}
  primitive(744,108,0);
  primitive(745,108,1);
  primitive(746,108,2);
  primitive(747,108,3);
  primitive(748,108,4);
  primitive(749,108,6);
{:468}{487:}
  primitive(767,105,0);
  primitive(768,105,1);
  primitive(769,105,2);
  primitive(770,105,3);
  primitive(771,105,4);
  primitive(772,105,5);
  primitive(773,105,6);
  primitive(774,105,7);
  primitive(775,105,8);
  primitive(776,105,9);
  primitive(777,105,10);
  primitive(778,105,11);
  primitive(779,105,12);
  primitive(780,105,13);
  primitive(781,105,14);
  primitive(782,105,15);
  primitive(783,105,16);
{:487}{491:}
  primitive(785,106,2);
  hash[2618].rh := 785;
  eqtb[2618] := eqtb[cur_val];
  primitive(786,106,4);
  primitive(787,106,3);
{:491}{553:}
  primitive(812,87,0);
  hash[2624].rh := 812;
  eqtb[2624] := eqtb[cur_val];{:553}{780:}
  primitive(910,4,256);
  primitive(911,5,257);
  hash[2615].rh := 911;
  eqtb[2615] := eqtb[cur_val];
  primitive(912,5,258);
  hash[2619].rh := 913;
  hash[2620].rh := 913;
  eqtb[2620].hh.b0 := 9;
  eqtb[2620].hh.rh := 29989;
  eqtb[2620].hh.b1 := 1;
  eqtb[2619] := eqtb[2620];
  eqtb[2619].hh.b0 := 115;
{:780}{983:}
  primitive(982,81,0);
  primitive(983,81,1);
  primitive(984,81,2);
  primitive(985,81,3);
  primitive(986,81,4);
  primitive(987,81,5);
  primitive(988,81,6);
  primitive(989,81,7);
{:983}{1052:}
  primitive(344,14,0);
  primitive(1037,14,1);
{:1052}{1058:}
  primitive(1038,26,4);
  primitive(1039,26,0);
  primitive(1040,26,1);
  primitive(1041,26,2);
  primitive(1042,26,3);
  primitive(1043,27,4);
  primitive(1044,27,0);
  primitive(1045,27,1);
  primitive(1046,27,2);
  primitive(1047,27,3);
  primitive(337,28,5);
  primitive(341,29,1);
  primitive(343,30,99);
{:1058}{1071:}
  primitive(1065,21,1);
  primitive(1066,21,0);
  primitive(1067,22,1);
  primitive(1068,22,0);
  primitive(412,20,0);
  primitive(1069,20,1);
  primitive(1070,20,2);
  primitive(977,20,3);
  primitive(1071,20,4);
  primitive(979,20,5);
  primitive(1072,20,106);
  primitive(1073,31,99);
  primitive(1074,31,100);
  primitive(1075,31,101);
  primitive(1076,31,102);{:1071}{1088:}
  primitive(1092,43,1);
  primitive(1093,43,0);{:1088}{1107:}
  primitive(1102,25,12);
  primitive(1103,25,11);
  primitive(1104,25,10);
  primitive(1105,23,0);
  primitive(1106,23,1);
  primitive(1107,24,0);
  primitive(1108,24,1);
{:1107}{1114:}
  primitive(45,47,1);
  primitive(352,47,0);
{:1114}{1141:}
  primitive(1139,48,0);
  primitive(1140,48,1);
{:1141}{1156:}
  primitive(877,50,16);
  primitive(878,50,17);
  primitive(879,50,18);
  primitive(880,50,19);
  primitive(881,50,20);
  primitive(882,50,21);
  primitive(883,50,22);
  primitive(884,50,23);
  primitive(886,50,26);
  primitive(885,50,27);
  primitive(1141,51,0);
  primitive(890,51,1);
  primitive(891,51,2);
{:1156}{1169:}
  primitive(872,53,0);
  primitive(873,53,2);
  primitive(874,53,4);
  primitive(875,53,6);
{:1169}{1178:}
  primitive(1159,52,0);
  primitive(1160,52,1);
  primitive(1161,52,2);
  primitive(1162,52,3);
  primitive(1163,52,4);
  primitive(1164,52,5);{:1178}{1188:}
  primitive(887,49,30);
  primitive(888,49,31);
  hash[2617].rh := 888;
  eqtb[2617] := eqtb[cur_val];
{:1188}{1208:}
  primitive(1184,93,1);
  primitive(1185,93,2);
  primitive(1186,93,4);
  primitive(1187,97,0);
  primitive(1188,97,1);
  primitive(1189,97,2);
  primitive(1190,97,3);
{:1208}{1219:}
  primitive(1207,94,0);
  primitive(1208,94,1);
{:1219}{1222:}
  primitive(1209,95,0);
  primitive(1210,95,1);
  primitive(1211,95,2);
  primitive(1212,95,3);
  primitive(1213,95,4);
  primitive(1214,95,5);
  primitive(1215,95,6);
{:1222}{1230:}
  primitive(418,85,3988);
  primitive(422,85,5012);
  primitive(419,85,4244);
  primitive(420,85,4500);
  primitive(421,85,4756);
  primitive(480,85,5589);
  primitive(415,86,3940);
  primitive(416,86,3956);
  primitive(417,86,3972);{:1230}{1250:}
  primitive(953,99,0);
  primitive(965,99,1);{:1250}{1254:}
  primitive(1233,78,0);
  primitive(1234,78,1);{:1254}{1262:}
  primitive(275,100,0);
  primitive(276,100,1);
  primitive(277,100,2);
  primitive(1243,100,3);
{:1262}{1272:}
  primitive(1244,60,1);
  primitive(1245,60,0);
{:1272}{1277:}
  primitive(1246,58,0);
  primitive(1247,58,1);
{:1277}{1286:}
  primitive(1253,57,4244);
  primitive(1254,57,4500);
{:1286}{1291:}
  primitive(1255,19,0);
  primitive(1256,19,1);
  primitive(1257,19,2);
  primitive(1258,19,3);
{:1291}{1344:}
  primitive(1299,59,0);
  primitive(603,59,1);
  write_loc := cur_val;
  primitive(1300,59,2);
  primitive(1301,59,3);
  primitive(1302,59,4);
  primitive(1303,59,5);{:1344};
  no_new_control_sequence := true;
End;{:1336}{1338:}
{procedure debug_help;
label 888,10;var k,l,m,n:integer;begin break_in(term_in,true);
while true do begin;print_nl(1298);break(term_out);read(term_in,m);
if m<0 then goto 10 else if m=0 then begin goto 888;888:m:=0;
['BREAKPOINT']end else begin read(term_in,n);
case m of[1339:]1:print_word(mem[n]);2:print_int(mem[n].hh.lh);
3:print_int(mem[n].hh.rh);4:print_word(eqtb[n]);
5:print_word(font_info[n]);6:print_word(save_stack[n]);7:show_box(n);
8:begin breadth_max:=10000;depth_threshold:=pool_size-pool_ptr-10;
show_node_list(n);end;9:show_token_list(n,0,1000);10:slow_print(n);
11:check_mem(n>0);12:search_mem(n);13:begin read(term_in,l);
print_cmd_chr(n,l);end;14:for k:=0 to n do print(buffer[k]);
15:begin font_in_short_display:=0;short_display(n);end;
16:panicking:=not panicking;[:1339]others:print(63)end;end;end;10:end;}
{:1338}{:1330}{1332:}
Begin
  history := 3;
  rewrite(term_out,'TTY:','/O');
  If ready_already=314159 Then goto 1;{14:}
  bad := 0;
  If (half_error_line<30)Or(half_error_line>error_line-15)Then bad := 1;
  If max_print_line<60 Then bad := 2;
  If dvi_buf_size Mod 8<>0 Then bad := 3;
  If 1100>30000 Then bad := 4;
  If 1777>2100 Then bad := 5;
  If max_in_open>=128 Then bad := 6;
  If 30000<267 Then bad := 7;
{:14}{111:}
  If (mem_min<>0)Or(mem_max<>30000)Then bad := 10;
  If (mem_min>0)Or(mem_max<30000)Then bad := 10;
  If (0>0)Or(255<127)Then bad := 11;
  If (0>0)Or(65535<32767)Then bad := 12;
  If (0<0)Or(255>65535)Then bad := 13;
  If (mem_min<0)Or(mem_max>=65535)Or(-0-mem_min>65536)Then bad := 14;
  If (0<0)Or(font_max>255)Then bad := 15;
  If font_max>256 Then bad := 16;
  If (save_size>65535)Or(max_strings>65535)Then bad := 17;
  If buf_size>65535 Then bad := 18;
  If 255<255 Then bad := 19;
{:111}{290:}
  If 6976>65535 Then bad := 21;
{:290}{522:}
  If 20>file_name_size Then bad := 31;
{:522}{1249:}
  If 2*65535<30000-mem_min Then bad := 41;
{:1249}
  If bad>0 Then
    Begin
      write_ln(term_out,
               'Ouch---my internal constants have been clobbered!','---case ',bad:1);
      goto 9999;
    End;
  initialize;
  If Not get_strings_started Then goto 9999;
  init_prim;
  init_str_ptr := str_ptr;
  init_pool_ptr := pool_ptr;
  fix_date_and_time;
  ready_already := 314159;
  1:{55:}selector := 17;
  tally := 0;
  term_offset := 0;
  file_offset := 0;
{:55}{61:}
  write(term_out,'This is e-TeX, Version 3.141592653','-2.6');
  If format_ident=0 Then write_ln(term_out,' (no format preloaded)')
  Else
    Begin
      slow_print(format_ident);
      print_ln;
    End;
  break(term_out);
{:61}{528:}
  job_name := 0;
  name_in_progress := false;
  log_opened := false;
{:528}{533:}
  output_file_name := 0;{:533};
{1337:}
  Begin{331:}
    Begin
      input_ptr := 0;
      max_in_stack := 0;
      in_open := 0;
      open_parens := 0;
      max_buf_stack := 0;
      grp_stack[0] := 0;
      if_stack[0] := 0;
      param_ptr := 0;
      max_param_stack := 0;
      first := buf_size;
      Repeat
        buffer[first] := 0;
        first := first-1;
      Until first=0;
      scanner_status := 0;
      warning_index := 0;
      first := 1;
      cur_input.state_field := 33;
      cur_input.start_field := 1;
      cur_input.index_field := 0;
      line := 0;
      cur_input.name_field := 0;
      force_eof := false;
      align_state := 1000000;
      If Not init_terminal Then goto 9999;
      cur_input.limit_field := last;
      first := last+1;
    End{:331};
{1379:}
    If (buffer[cur_input.loc_field]=42)And(format_ident=1271)Then
      Begin
        no_new_control_sequence := false;{1380:}
        primitive(1315,70,3);
        primitive(1316,70,6);
        primitive(750,108,5);
{:1380}{1388:}
        primitive(1318,72,3422);
        primitive(1319,73,5323);
        primitive(1320,73,5324);
        primitive(1321,73,5325);
        primitive(1322,73,5326);
        primitive(1323,73,5327);
        primitive(1324,73,5328);
        primitive(1325,73,5329);
        primitive(1326,73,5330);
        primitive(1327,73,5331);
{:1388}{1394:}
        primitive(1341,70,7);
        primitive(1342,70,8);
{:1394}{1397:}
        primitive(1343,70,9);
        primitive(1344,70,10);
        primitive(1345,70,11);{:1397}{1400:}
        primitive(1346,70,14);
        primitive(1347,70,15);
        primitive(1348,70,16);
        primitive(1349,70,17);
{:1400}{1403:}
        primitive(1350,70,18);
        primitive(1351,70,19);
        primitive(1352,70,20);{:1403}{1406:}
        primitive(1353,19,4);
{:1406}{1415:}
        primitive(1355,19,5);{:1415}{1417:}
        primitive(1356,109,1);
        primitive(1357,109,5);{:1417}{1420:}
        primitive(1358,19,6);
{:1420}{1423:}
        primitive(1362,82,2);{:1423}{1428:}
        primitive(889,49,1);
{:1428}{1432:}
        primitive(1366,73,5332);
        primitive(1367,33,6);
        primitive(1368,33,7);
        primitive(1369,33,10);
        primitive(1370,33,11);
{:1432}{1482:}
        primitive(1379,104,2);{:1482}{1494:}
        primitive(1381,96,1);
{:1494}{1497:}
        primitive(784,102,1);
        primitive(1382,105,17);
        primitive(1383,105,18);
        primitive(1384,105,19);
{:1497}{1505:}
        primitive(1198,93,8);{:1505}{1513:}
        primitive(1390,70,25);
        primitive(1391,70,26);
        primitive(1392,70,27);
        primitive(1393,70,28);
{:1513}{1536:}
        primitive(1398,70,12);
        primitive(1399,70,13);
        primitive(1400,70,21);
        primitive(1401,70,22);
{:1536}{1540:}
        primitive(1402,70,23);
        primitive(1403,70,24);
{:1540}{1544:}
        primitive(1404,18,5);
        primitive(1405,110,5);
        primitive(1406,110,6);
        primitive(1407,110,7);
        primitive(1408,110,8);
        primitive(1409,110,9);{:1544}{1596:}
        primitive(1413,24,2);
        primitive(1414,24,3);{:1596}{1599:}
        primitive(1415,84,3679);
        primitive(1416,84,3680);
        primitive(1417,84,3681);
        primitive(1418,84,3682);
{:1599}
        cur_input.loc_field := cur_input.loc_field+1;
        eTeX_mode := 1;
{1548:}
        max_reg_num := 32767;
        max_reg_help_line := 1410;{:1548}
      End;
    If Not no_new_control_sequence Then no_new_control_sequence := true
    Else
{:1379}If (format_ident=0)Or(buffer[cur_input.loc_field]=38)Then
         Begin
           If
              format_ident<>0 Then initialize;
           If Not open_fmt_file Then goto 9999;
           If Not load_fmt_file Then
             Begin
               w_close(fmt_file);
               goto 9999;
             End;
           w_close(fmt_file);
           While (cur_input.loc_field<cur_input.limit_field)And(buffer[cur_input.
                 loc_field]=32) Do
             cur_input.loc_field := cur_input.loc_field+1;
         End;
    If (eTeX_mode=1)Then write_ln(term_out,'entering extended mode');
    If (eqtb[5316].int<0)Or(eqtb[5316].int>255)Then cur_input.limit_field :=
                                                                             cur_input.limit_field-1
    Else buffer[cur_input.limit_field] := eqtb[5316].
                                          int;
    fix_date_and_time;{765:}
    magic_offset := str_start[904]-9*16{:765};
{75:}
    If interaction=0 Then selector := 16
    Else selector := 17{:75};
    If (cur_input.loc_field<cur_input.limit_field)And(eqtb[3988+buffer[
       cur_input.loc_field]].hh.rh<>0)Then start_input;
  End{:1337};
  history := 0;
  main_control;
  final_cleanup;
  9998: close_files_and_terminate;
  9999: ready_already := 0;
End.{:1332}
