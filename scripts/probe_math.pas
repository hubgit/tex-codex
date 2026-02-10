{$mode objfpc}
Program probe_math;

Uses SysUtils;

Type
  small_number = 0..63;
  scaled = integer;
  pool_pointer = integer;
  str_number = integer;

Var
  arith_error: boolean;
  remainder: scaled;
  dig: array[0..22] Of 0..15;
  str_pool: array[0..4095] Of integer;
  str_start: array[0..4095] Of integer;
  buffer: array[0..4095] Of integer;
  mem_b0: array[0..70000] Of integer;
  mem_b1: array[0..70000] Of integer;
  mem_b2: array[0..70000] Of integer;
  mem_b3: array[0..70000] Of integer;
  mem_int: array[0..70000] Of integer;
  mem_gr: array[0..70000] Of real;
  eqtb_rh: array[0..70000] Of integer;
  xeq_level_probe: array[0..70000] Of integer;
  hash_rh: array[0..70000] Of integer;
  sa_root: array[0..4095] Of integer;
  mem_lh: array[0..70000] Of integer;
  mem_rh: array[0..70000] Of integer;
  trace_bytes: array[0..4095] Of integer;
  out_buf: ansistring;
  name_of_file_probe: array[1..40] Of char;
  name_length_probe: integer;
  area_delimiter_probe: integer;
  ext_delimiter_probe: integer;
  cur_area_probe: integer;
  cur_name_probe: integer;
  cur_ext_probe: integer;
  next_node_probe: integer;
  temp_ptr_probe: integer;

Function half(x:integer): integer;
Begin
  If odd(x)Then half := (x+1)Div 2
  Else half := x Div 2;
End;

Function round_decimals(k:small_number): scaled;
Var
  a: integer;
Begin
  a := 0;
  While k>0 Do
    Begin
      k := k-1;
      a := (a+dig[k]*131072)Div 10;
    End;
  round_decimals := (a+1)Div 2;
End;

Function mult_and_add(n:integer;x,y,max_answer:scaled): scaled;
Begin
  If n<0 Then
    Begin
      x := -x;
      n := -n;
    End;
  If n=0 Then mult_and_add := y
  Else If ((x<=(max_answer-y)Div n)And(-x<=(max_answer+y)Div n))Then mult_and_add := n*x+y
  Else
    Begin
      arith_error := true;
      mult_and_add := 0;
    End;
End;

Function x_over_n(x:scaled;n:integer): scaled;
Var
  negative: boolean;
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

Function xn_over_d(x:scaled;n,d:integer): scaled;
Var
  positive: boolean;
  t,u,v: integer;
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
  Else u := 32768*(u Div d)+(v Div d);
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

Function badness(t,s:scaled): integer;
Var
  r: integer;
Begin
  If t=0 Then badness := 0
  Else If s<=0 Then badness := 10000
  Else
    Begin
      If t<=7230584 Then r := (t*297)Div s
      Else If s>=1663497 Then r := t Div(s Div 297)
      Else r := t;
      If r>1290 Then badness := 10000
      Else badness := (r*r*r+131072)Div 262144;
    End;
End;

Function add_or_sub(x,y,max_answer:integer;negative:boolean): integer;
Var
  a: integer;
Begin
  If negative Then y := -y;
  If x>=0 Then If y<=max_answer-x Then a := x+y
  Else
    Begin
      arith_error := true;
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

Function quotient(n,d:integer): integer;
Var
  negative: boolean;
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

Function fract(x,n,d,max_answer:integer): integer;
Label
  40,41,88,30;
Var
  negative: boolean;
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
    End;
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
  41:If f>(max_answer-a)Then goto 88;
  a := a+f;
  40: If negative Then a := -a;
  goto 30;
  88:
      Begin
        arith_error := true;
        a := 0;
      End;
  30: fract := a;
End;

Function str_eq_buf(s:str_number;k:integer): boolean;
Var
  j: pool_pointer;
  result_: boolean;
Begin
  j := str_start[s];
  While j<str_start[s+1] Do
    Begin
      If str_pool[j]<>buffer[k]Then
        Begin
          result_ := false;
          str_eq_buf := result_;
          Exit;
        End;
      j := j+1;
      k := k+1;
    End;
  result_ := true;
  str_eq_buf := result_;
End;

Function str_eq_str(s,t:str_number): boolean;
Var
  j,k: pool_pointer;
  result_: boolean;
Begin
  result_ := false;
  If (str_start[s+1]-str_start[s])<>(str_start[t+1]-str_start[t])Then
    Begin
      str_eq_str := result_;
      Exit;
    End;
  j := str_start[s];
  k := str_start[t];
  While j<str_start[s+1] Do
    Begin
      If str_pool[j]<>str_pool[k]Then
        Begin
          str_eq_str := result_;
          Exit;
        End;
      j := j+1;
      k := k+1;
    End;
  result_ := true;
  str_eq_str := result_;
End;

Function norm_min(h:integer): integer;
Begin
  If h<=0 Then norm_min := 1
  Else If h>=63 Then norm_min := 63
  Else norm_min := h;
End;

Function make_string_probe(Var str_ptr_probe: integer; pool_ptr_probe: integer; max_strings_probe: integer; init_str_ptr_probe: integer): integer;
Begin
  If str_ptr_probe=max_strings_probe Then
    Begin
      arith_error := true;
      make_string_probe := -1;
      Exit;
    End;
  str_ptr_probe := str_ptr_probe+1;
  str_start[str_ptr_probe] := pool_ptr_probe;
  make_string_probe := str_ptr_probe-1;
End;

Procedure begin_name_probe;
Begin
  area_delimiter_probe := 0;
  ext_delimiter_probe := 0;
End;

Function more_name_probe(c: integer; Var pool_ptr_probe: integer; str_ptr_probe: integer; pool_size_probe: integer; init_pool_ptr_probe: integer): boolean;
Begin
  If c=32 Then
    Begin
      more_name_probe := false;
      Exit;
    End;

  If pool_ptr_probe+1>pool_size_probe Then
    Begin
      arith_error := true;
      more_name_probe := false;
      Exit;
    End;

  str_pool[pool_ptr_probe] := c;
  pool_ptr_probe := pool_ptr_probe+1;

  If (c=62)Or(c=58)Then
    Begin
      area_delimiter_probe := (pool_ptr_probe-str_start[str_ptr_probe]);
      ext_delimiter_probe := 0;
    End
  Else If (c=46)And(ext_delimiter_probe=0)Then
    ext_delimiter_probe := (pool_ptr_probe-str_start[str_ptr_probe]);

  more_name_probe := true;
End;

Procedure end_name_probe(Var str_ptr_probe: integer; pool_ptr_probe: integer; max_strings_probe: integer; init_str_ptr_probe: integer);
Begin
  If str_ptr_probe+3>max_strings_probe Then
    Begin
      arith_error := true;
      Exit;
    End;

  If area_delimiter_probe=0 Then
    cur_area_probe := 339
  Else
    Begin
      cur_area_probe := str_ptr_probe;
      str_start[str_ptr_probe+1] := str_start[str_ptr_probe]+area_delimiter_probe;
      str_ptr_probe := str_ptr_probe+1;
    End;

  If ext_delimiter_probe=0 Then
    Begin
      cur_ext_probe := 339;
      cur_name_probe := make_string_probe(str_ptr_probe,pool_ptr_probe,max_strings_probe,init_str_ptr_probe);
    End
  Else
    Begin
      cur_name_probe := str_ptr_probe;
      str_start[str_ptr_probe+1] := str_start[str_ptr_probe]+ext_delimiter_probe-area_delimiter_probe-1;
      str_ptr_probe := str_ptr_probe+1;
      cur_ext_probe := make_string_probe(str_ptr_probe,pool_ptr_probe,max_strings_probe,init_str_ptr_probe);
    End;
End;

Procedure scan_file_name_trace_probe(str_ptr_probe,pool_ptr_probe,pool_size_probe,max_strings_probe,init_pool_ptr_probe,init_str_ptr_probe,cmd1,chr1,cmd2,chr2,cmd3,chr3,cmd4,chr4,cmd5,chr5,cmd6,chr6: integer);
Var
  idx_probe: integer;
  back_probe: integer;
  cur_cmd_probe: integer;
  cur_chr_probe: integer;
  text_probe: ansistring;
  j: integer;
Begin
  str_start[str_ptr_probe] := 0;
  begin_name_probe;

  idx_probe := 0;
  Repeat
    idx_probe := idx_probe+1;
    Case idx_probe Of
      1: Begin cur_cmd_probe := cmd1; cur_chr_probe := chr1; End;
      2: Begin cur_cmd_probe := cmd2; cur_chr_probe := chr2; End;
      3: Begin cur_cmd_probe := cmd3; cur_chr_probe := chr3; End;
      4: Begin cur_cmd_probe := cmd4; cur_chr_probe := chr4; End;
      5: Begin cur_cmd_probe := cmd5; cur_chr_probe := chr5; End;
      6: Begin cur_cmd_probe := cmd6; cur_chr_probe := chr6; End;
      else
        Begin
          cur_cmd_probe := 0;
          cur_chr_probe := 0;
        End;
    End;
  Until cur_cmd_probe<>10;

  back_probe := 0;
  While true Do
    Begin
      If (cur_cmd_probe>12)Or(cur_chr_probe>255)Then
        Begin
          back_probe := back_probe+1;
          break;
        End;
      If Not more_name_probe(cur_chr_probe,pool_ptr_probe,str_ptr_probe,pool_size_probe,init_pool_ptr_probe)Then break;
      idx_probe := idx_probe+1;
      Case idx_probe Of
        1: Begin cur_cmd_probe := cmd1; cur_chr_probe := chr1; End;
        2: Begin cur_cmd_probe := cmd2; cur_chr_probe := chr2; End;
        3: Begin cur_cmd_probe := cmd3; cur_chr_probe := chr3; End;
        4: Begin cur_cmd_probe := cmd4; cur_chr_probe := chr4; End;
        5: Begin cur_cmd_probe := cmd5; cur_chr_probe := chr5; End;
        6: Begin cur_cmd_probe := cmd6; cur_chr_probe := chr6; End;
        else
          Begin
            cur_cmd_probe := 0;
            cur_chr_probe := 0;
          End;
      End;
    End;

  end_name_probe(str_ptr_probe,pool_ptr_probe,max_strings_probe,init_str_ptr_probe);
  text_probe := '';
  For j:=0 To pool_ptr_probe-1 Do text_probe := text_probe + Chr(str_pool[j]);

  out_buf := IntToStr(pool_ptr_probe)+' '+IntToStr(cur_area_probe)+' '+IntToStr(cur_name_probe)+' '+IntToStr(cur_ext_probe)+' '+
             IntToStr(back_probe)+' 0 '+IntToStr(cur_cmd_probe)+' '+IntToStr(cur_chr_probe)+' '+text_probe;
End;

Function get_avail_probe(Var avail_probe: integer; Var mem_end_probe: integer; mem_max_probe: integer; Var hi_mem_min_probe: integer; lo_mem_max_probe: integer): integer;
Var
  p: integer;
Begin
  p := avail_probe;
  If p<>0 Then
    avail_probe := mem_rh[avail_probe]
  Else If mem_end_probe<mem_max_probe Then
    Begin
      mem_end_probe := mem_end_probe+1;
      p := mem_end_probe;
    End
  Else
    Begin
      hi_mem_min_probe := hi_mem_min_probe-1;
      p := hi_mem_min_probe;
      If hi_mem_min_probe<=lo_mem_max_probe Then
        Begin
          arith_error := true;
        End;
    End;
  mem_rh[p] := 0;
  get_avail_probe := p;
End;

Procedure flush_list_probe(p: integer; Var avail_probe: integer);
Var
  q,r: integer;
Begin
  If p<>0 Then
    Begin
      r := p;
      Repeat
        q := r;
        r := mem_rh[r];
      Until r=0;
      mem_rh[q] := avail_probe;
      avail_probe := p;
    End;
End;

Procedure free_node_probe(p,s,rover_probe: integer);
Var
  q: integer;
Begin
  mem_lh[p] := s;
  mem_rh[p] := 65535;
  q := mem_lh[rover_probe+1];
  mem_lh[p+1] := q;
  mem_rh[p+1] := rover_probe;
  mem_lh[rover_probe+1] := p;
  mem_rh[q+1] := p;
End;

Procedure delete_token_ref_probe(p,lh_init: integer; Var avail_probe: integer);
Begin
  mem_lh[p] := lh_init;
  If mem_lh[p]=0 Then flush_list_probe(p,avail_probe)
  Else mem_lh[p] := mem_lh[p]-1;
End;

Procedure delete_glue_ref_probe(p,rh_init,rover_probe,q_init: integer);
Begin
  mem_rh[p] := rh_init;
  mem_lh[rover_probe+1] := q_init;
  If mem_rh[p]=0 Then free_node_probe(p,4,rover_probe)
  Else mem_rh[p] := mem_rh[p]-1;
End;

Function get_node_stub_probe(s: integer): integer;
Begin
  get_node_stub_probe := next_node_probe;
  next_node_probe := next_node_probe+s;
End;

Function get_node_probe(s: integer; Var rover_probe: integer; Var lo_mem_max_probe: integer; Var hi_mem_min_probe: integer; mem_max_probe: integer; mem_min_probe: integer): integer;
Label
  40,10,20;
Var
  p: integer;
  q: integer;
  r: integer;
  t: integer;
Begin
  20: p := rover_probe;
  Repeat
    q := p+mem_lh[p];
    While (mem_rh[q]=65535) Do
      Begin
        t := mem_rh[q+1];
        If q=rover_probe Then rover_probe := t;
        mem_lh[t+1] := mem_lh[q+1];
        mem_rh[mem_lh[q+1]+1] := t;
        q := q+mem_lh[q];
      End;
    r := q-s;
    If r>p+1 Then
      Begin
        mem_lh[p] := r-p;
        rover_probe := p;
        goto 40;
      End;
    If r=p Then
      If mem_rh[p+1]<>p Then
        Begin
          rover_probe := mem_rh[p+1];
          t := mem_lh[p+1];
          mem_lh[rover_probe+1] := t;
          mem_rh[t+1] := rover_probe;
          goto 40;
        End;
    mem_lh[p] := q-p;
    p := mem_rh[p+1];
  Until p=rover_probe;
  If s=1073741824 Then
    Begin
      get_node_probe := 65535;
      goto 10;
    End;
  If lo_mem_max_probe+2<hi_mem_min_probe Then
    If lo_mem_max_probe+2<=65535 Then
      Begin
        If hi_mem_min_probe-lo_mem_max_probe>=1998 Then t := lo_mem_max_probe+1000
        Else t := lo_mem_max_probe+1+(hi_mem_min_probe-lo_mem_max_probe)Div 2;
        p := mem_lh[rover_probe+1];
        q := lo_mem_max_probe;
        mem_rh[p+1] := q;
        mem_lh[rover_probe+1] := q;
        If t>65535 Then t := 65535;
        mem_rh[q+1] := rover_probe;
        mem_lh[q+1] := p;
        mem_rh[q] := 65535;
        mem_lh[q] := t-lo_mem_max_probe;
        lo_mem_max_probe := t;
        mem_rh[lo_mem_max_probe] := 0;
        mem_lh[lo_mem_max_probe] := 0;
        rover_probe := q;
        goto 20;
      End;
  arith_error := true;
  get_node_probe := -1;
  goto 10;
  40: mem_rh[r] := 0;
  get_node_probe := r;
  10:
End;

Procedure sort_avail_probe(Var rover_probe: integer; Var lo_mem_max_probe: integer; Var hi_mem_min_probe: integer; mem_max_probe: integer; mem_min_probe: integer);
Var
  p,q,r: integer;
  old_rover: integer;
Begin
  p := get_node_probe(1073741824,rover_probe,lo_mem_max_probe,hi_mem_min_probe,mem_max_probe,mem_min_probe);
  p := mem_rh[rover_probe+1];
  mem_rh[rover_probe+1] := 65535;
  old_rover := rover_probe;
  While p<>old_rover Do
    If p<rover_probe Then
      Begin
        q := p;
        p := mem_rh[q+1];
        mem_rh[q+1] := rover_probe;
        rover_probe := q;
      End
    Else
      Begin
        q := rover_probe;
        While mem_rh[q+1]<p Do
          q := mem_rh[q+1];
        r := mem_rh[p+1];
        mem_rh[p+1] := mem_rh[q+1];
        mem_rh[q+1] := p;
        p := r;
      End;
  p := rover_probe;
  While mem_rh[p+1]<>65535 Do
    Begin
      mem_lh[mem_rh[p+1]+1] := p;
      p := mem_rh[p+1];
    End;
  mem_rh[p+1] := rover_probe;
  mem_lh[rover_probe+1] := p;
End;

Function new_null_box_probe: integer;
Var
  p: integer;
Begin
  p := get_node_stub_probe(7);
  mem_b0[p] := 0;
  mem_b1[p] := 0;
  mem_int[p+1] := 0;
  mem_int[p+2] := 0;
  mem_int[p+3] := 0;
  mem_int[p+4] := 0;
  mem_rh[p+5] := 0;
  mem_b0[p+5] := 0;
  mem_b1[p+5] := 0;
  mem_gr[p+6] := 0.0;
  new_null_box_probe := p;
End;

Function new_rule_probe: integer;
Var
  p: integer;
Begin
  p := get_node_stub_probe(4);
  mem_b0[p] := 2;
  mem_b1[p] := 0;
  mem_int[p+1] := -1073741824;
  mem_int[p+2] := -1073741824;
  mem_int[p+3] := -1073741824;
  new_rule_probe := p;
End;

Function new_ligature_probe(f,c,q: integer): integer;
Var
  p: integer;
Begin
  p := get_node_stub_probe(2);
  mem_b0[p] := 6;
  mem_b0[p+1] := f;
  mem_b1[p+1] := c;
  mem_rh[p+1] := q;
  mem_b1[p] := 0;
  new_ligature_probe := p;
End;

Function new_lig_item_probe(c: integer): integer;
Var
  p: integer;
Begin
  p := get_node_stub_probe(2);
  mem_b1[p] := c;
  mem_rh[p+1] := 0;
  new_lig_item_probe := p;
End;

Function new_disc_probe: integer;
Var
  p: integer;
Begin
  p := get_node_stub_probe(2);
  mem_b0[p] := 7;
  mem_b1[p] := 0;
  mem_lh[p+1] := 0;
  mem_rh[p+1] := 0;
  new_disc_probe := p;
End;

Function new_math_probe(w,s: integer): integer;
Var
  p: integer;
Begin
  p := get_node_stub_probe(2);
  mem_b0[p] := 9;
  mem_b1[p] := s;
  mem_int[p+1] := w;
  new_math_probe := p;
End;

Function new_style_probe(s: integer): integer;
Var
  p: integer;
Begin
  p := get_node_stub_probe(3);
  mem_b0[p] := 14;
  mem_b1[p] := s;
  mem_int[p+1] := 0;
  mem_int[p+2] := 0;
  new_style_probe := p;
End;

Function new_choice_probe: integer;
Var
  p: integer;
Begin
  p := get_node_stub_probe(3);
  mem_b0[p] := 15;
  mem_b1[p] := 0;
  mem_lh[p+1] := 0;
  mem_rh[p+1] := 0;
  mem_lh[p+2] := 0;
  mem_rh[p+2] := 0;
  new_choice_probe := p;
End;

Function new_noad_probe: integer;
Var
  p: integer;
Begin
  p := get_node_stub_probe(4);
  mem_b0[p] := 16;
  mem_b1[p] := 0;
  mem_lh[p+1] := 0;
  mem_rh[p+1] := 0;
  mem_lh[p+2] := 0;
  mem_rh[p+2] := 0;
  mem_lh[p+3] := 0;
  mem_rh[p+3] := 0;
  new_noad_probe := p;
End;

Function new_spec_probe(p: integer): integer;
Var
  q: integer;
Begin
  q := get_node_stub_probe(4);
  mem_b0[q] := mem_b0[p];
  mem_b1[q] := mem_b1[p];
  mem_lh[q] := mem_lh[p];
  mem_rh[q] := mem_rh[p];
  mem_int[q] := mem_int[p];
  mem_gr[q] := mem_gr[p];
  mem_rh[q] := 0;
  mem_int[q+1] := mem_int[p+1];
  mem_int[q+2] := mem_int[p+2];
  mem_int[q+3] := mem_int[p+3];
  new_spec_probe := q;
End;

Function new_param_glue_probe(n: integer): integer;
Var
  p,q: integer;
Begin
  p := get_node_stub_probe(2);
  mem_b0[p] := 10;
  mem_b1[p] := n+1;
  mem_rh[p+1] := 0;
  q := eqtb_rh[2882+n];
  mem_lh[p+1] := q;
  mem_rh[q] := mem_rh[q]+1;
  new_param_glue_probe := p;
End;

Function new_glue_probe(q: integer): integer;
Var
  p: integer;
Begin
  p := get_node_stub_probe(2);
  mem_b0[p] := 10;
  mem_b1[p] := 0;
  mem_rh[p+1] := 0;
  mem_lh[p+1] := q;
  mem_rh[q] := mem_rh[q]+1;
  new_glue_probe := p;
End;

Function new_skip_param_probe(n: integer): integer;
Var
  p: integer;
Begin
  temp_ptr_probe := new_spec_probe(eqtb_rh[2882+n]);
  p := new_glue_probe(temp_ptr_probe);
  mem_rh[temp_ptr_probe] := 0;
  mem_b1[p] := n+1;
  new_skip_param_probe := p;
End;

Function new_kern_probe(w: integer): integer;
Var
  p: integer;
Begin
  p := get_node_stub_probe(2);
  mem_b0[p] := 11;
  mem_b1[p] := 0;
  mem_int[p+1] := w;
  new_kern_probe := p;
End;

Function new_penalty_probe(m: integer): integer;
Var
  p: integer;
Begin
  p := get_node_stub_probe(2);
  mem_b0[p] := 12;
  mem_b1[p] := 0;
  mem_int[p+1] := m;
  new_penalty_probe := p;
End;

Function fraction_rule_probe(t: integer): integer;
Var
  p: integer;
Begin
  p := new_rule_probe;
  mem_int[p+3] := t;
  mem_int[p+2] := 0;
  fraction_rule_probe := p;
End;

Procedure pack_file_name_probe(n,a,e,file_name_size_probe: integer);
Var
  k: integer;
  c: integer;
  j: integer;
Begin
  k := 0;

  For j:=str_start[a] To str_start[a+1]-1 Do
    Begin
      c := str_pool[j];
      k := k+1;
      If k<=file_name_size_probe Then name_of_file_probe[k] := Chr(c);
    End;
  For j:=str_start[n] To str_start[n+1]-1 Do
    Begin
      c := str_pool[j];
      k := k+1;
      If k<=file_name_size_probe Then name_of_file_probe[k] := Chr(c);
    End;
  For j:=str_start[e] To str_start[e+1]-1 Do
    Begin
      c := str_pool[j];
      k := k+1;
      If k<=file_name_size_probe Then name_of_file_probe[k] := Chr(c);
    End;

  If k<=file_name_size_probe Then name_length_probe := k
  Else name_length_probe := file_name_size_probe;

  For k:=name_length_probe+1 To file_name_size_probe Do
    name_of_file_probe[k] := ' ';
End;

Procedure pack_buffered_name_probe(n,a,b,file_name_size_probe: integer; tex_format_default_probe: ansistring);
Var
  k: integer;
  c: integer;
  j: integer;
Begin
  If n+b-a+5>file_name_size_probe Then b := a+file_name_size_probe-n-5;
  k := 0;
  For j:=1 To n Do
    Begin
      c := Ord(tex_format_default_probe[j]);
      k := k+1;
      If k<=file_name_size_probe Then name_of_file_probe[k] := Chr(c);
    End;
  For j:=a To b Do
    Begin
      c := buffer[j];
      k := k+1;
      If k<=file_name_size_probe Then name_of_file_probe[k] := Chr(c);
    End;
  For j:=17 To 20 Do
    Begin
      c := Ord(tex_format_default_probe[j]);
      k := k+1;
      If k<=file_name_size_probe Then name_of_file_probe[k] := Chr(c);
    End;
  If k<=file_name_size_probe Then name_length_probe := k
  Else name_length_probe := file_name_size_probe;
  For k:=name_length_probe+1 To file_name_size_probe Do
    name_of_file_probe[k] := ' ';
End;

Procedure pack_job_name_probe(s,job_name_probe,file_name_size_probe: integer);
Begin
  cur_area_probe := 339;
  cur_ext_probe := s;
  cur_name_probe := job_name_probe;
  pack_file_name_probe(cur_name_probe,cur_area_probe,cur_ext_probe,file_name_size_probe);
End;

Function make_name_string_probe(Var str_ptr_probe: integer; Var pool_ptr_probe: integer; max_strings_probe: integer; init_str_ptr_probe: integer; pool_size_probe: integer): integer;
Var
  k: integer;
Begin
  If (pool_ptr_probe+name_length_probe>pool_size_probe)Or(str_ptr_probe=max_strings_probe)Or((pool_ptr_probe-str_start[str_ptr_probe])>0)Then
    Begin
      make_name_string_probe := 63;
      Exit;
    End;

  For k:=1 To name_length_probe Do
    Begin
      str_pool[pool_ptr_probe] := Ord(name_of_file_probe[k]);
      pool_ptr_probe := pool_ptr_probe+1;
    End;

  make_name_string_probe := make_string_probe(str_ptr_probe,pool_ptr_probe,max_strings_probe,init_str_ptr_probe);
End;

Function a_make_name_string_probe(Var str_ptr_probe: integer; Var pool_ptr_probe: integer; max_strings_probe: integer; init_str_ptr_probe: integer; pool_size_probe: integer): integer;
Begin
  a_make_name_string_probe := make_name_string_probe(str_ptr_probe,pool_ptr_probe,max_strings_probe,init_str_ptr_probe,pool_size_probe);
End;

Function b_make_name_string_probe(Var str_ptr_probe: integer; Var pool_ptr_probe: integer; max_strings_probe: integer; init_str_ptr_probe: integer; pool_size_probe: integer): integer;
Begin
  b_make_name_string_probe := make_name_string_probe(str_ptr_probe,pool_ptr_probe,max_strings_probe,init_str_ptr_probe,pool_size_probe);
End;

Function w_make_name_string_probe(Var str_ptr_probe: integer; Var pool_ptr_probe: integer; max_strings_probe: integer; init_str_ptr_probe: integer; pool_size_probe: integer): integer;
Begin
  w_make_name_string_probe := make_name_string_probe(str_ptr_probe,pool_ptr_probe,max_strings_probe,init_str_ptr_probe,pool_size_probe);
End;

Procedure print_char_probe(s: integer);
Begin
  out_buf := out_buf + Chr(s);
End;

Procedure print_the_digs_probe(k: integer);
Begin
  While k>0 Do
    Begin
      k := k-1;
      If dig[k]<10 Then print_char_probe(48+dig[k])
      Else print_char_probe(55+dig[k]);
    End;
End;

Procedure print_two_probe(n: integer);
Begin
  n := abs(n)Mod 100;
  print_char_probe(48+(n Div 10));
  print_char_probe(48+(n Mod 10));
End;

Procedure print_hex_probe(n: integer);
Var
  k: integer;
Begin
  k := 0;
  print_char_probe(34);
  Repeat
    dig[k] := n Mod 16;
    n := n Div 16;
    k := k+1;
  Until n=0;
  print_the_digs_probe(k);
End;

Procedure print_roman_int_probe(n: integer);
Label
  10;
Var
  j,k: integer;
  u,v: integer;
Begin
  j := str_start[261];
  v := 1000;
  While true Do
    Begin
      While n>=v Do
        Begin
          print_char_probe(str_pool[j]);
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
          print_char_probe(str_pool[k]);
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

Procedure print_int_probe(n: integer);
Var
  k: integer;
  m: integer;
Begin
  k := 0;
  If n<0 Then
    Begin
      print_char_probe(45);
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
  print_the_digs_probe(k);
End;

Procedure print_scaled_probe(s: integer);
Var
  delta: integer;
Begin
  If s<0 Then
    Begin
      print_char_probe(45);
      s := -s;
    End;
  print_int_probe(s Div 65536);
  print_char_probe(46);
  s := 10*(s Mod 65536)+5;
  delta := 10;
  Repeat
    If delta>65536 Then s := s-17232;
    print_char_probe(48+(s Div 65536));
    s := 10*(s Mod 65536);
    delta := delta*10;
  Until s<=delta;
End;

Procedure print_current_string_probe(str_ptr_probe: integer; pool_ptr_probe: integer);
Var
  j: integer;
Begin
  j := str_start[str_ptr_probe];
  While j<pool_ptr_probe Do
    Begin
      print_char_probe(str_pool[j]);
      j := j+1;
    End;
End;

Procedure slow_print_probe(s: integer);
Var
  j: integer;
Begin
  j := str_start[s];
  While j<str_start[s+1] Do
    Begin
      print_char_probe(str_pool[j]);
      j := j+1;
    End;
End;

Procedure print_file_name_probe(n,a,e: integer);
Begin
  slow_print_probe(a);
  slow_print_probe(n);
  slow_print_probe(e);
End;

Procedure print_esc_probe(s: integer);
Begin
  out_buf := out_buf + '<' + IntToStr(s) + '>';
End;

Procedure print_size_probe(s: integer);
Begin
  If s=0 Then print_esc_probe(415)
  Else If s=16 Then print_esc_probe(416)
  Else print_esc_probe(417);
End;

Procedure append_tok(tok: ansistring);
Begin
  If Length(out_buf)>0 Then out_buf := out_buf + ' ';
  out_buf := out_buf + tok;
End;

Procedure tok_e(v: integer);
Begin
  append_tok('E'+IntToStr(v));
End;

Procedure tok_p(v: integer);
Begin
  append_tok('P'+IntToStr(v));
End;

Procedure tok_c(v: integer);
Begin
  append_tok('C'+IntToStr(v));
End;

Procedure tok_s(v: integer);
Begin
  append_tok('S'+IntToStr(v));
End;

Procedure tok_i(v: integer);
Begin
  append_tok('I'+IntToStr(v));
End;

Procedure tok_h(v: integer);
Begin
  append_tok('H'+IntToStr(v));
End;

Procedure tok_t(a,b,c: integer);
Begin
  append_tok('T'+IntToStr(a)+','+IntToStr(b)+','+IntToStr(c));
End;

Procedure tok_l;
Begin
  append_tok('L');
End;

Procedure tok_u;
Begin
  append_tok('U');
End;

Procedure tok_x;
Begin
  append_tok('X');
End;

Procedure tok_q(v: integer);
Begin
  append_tok('Q'+IntToStr(v));
End;

Procedure tok_m(v: integer);
Begin
  append_tok('M'+IntToStr(v));
End;

Procedure print_cs_trace_probe(p,str_ptr_probe: integer);
Begin
  If p<514 Then
    If p>=257 Then
      If p=513 Then
        Begin
          tok_e(507);
          tok_e(508);
          tok_c(32);
        End
      Else
        Begin
          tok_e(p-257);
          If eqtb_rh[3988+p-257]=11 Then tok_c(32);
        End
    Else If p<1 Then tok_e(509)
    Else tok_p(p-1)
  Else If p>=2881 Then tok_e(509)
  Else If (hash_rh[p]<0)Or(hash_rh[p]>=str_ptr_probe)Then tok_e(510)
  Else
    Begin
      tok_e(hash_rh[p]);
      tok_c(32);
    End;
End;

Procedure sprint_cs_trace_probe(p,str_ptr_probe: integer);
Begin
  If p<514 Then
    If p<257 Then tok_p(p-1)
    Else If p<513 Then tok_e(p-257)
    Else
      Begin
        tok_e(507);
        tok_e(508);
      End
  Else tok_e(hash_rh[p]);
End;

Procedure print_mark_trace_probe(p,hi_mem_min_probe,mem_end_probe,max_print_line_probe: integer);
Begin
  tok_c(123);
  If (p<hi_mem_min_probe)Or(p>mem_end_probe)Then tok_e(310)
  Else tok_t(mem_rh[p],0,max_print_line_probe-10);
  tok_c(125);
End;

Procedure token_show_trace_probe(p_probe,mem_rh_probe: integer);
Begin
  out_buf := '';
  If p_probe<>0 Then
    Begin
      mem_rh[p_probe] := mem_rh_probe;
      tok_t(mem_rh[p_probe],0,10000000);
    End;
End;

Procedure print_rule_dimen_trace_probe(d: integer);
Begin
  If d=-1073741824 Then tok_c(42)
  Else tok_s(d);
End;

Procedure print_glue_trace_probe(d,order,s: integer);
Begin
  tok_s(d);
  If (order<0)Or(order>3)Then tok_p(311)
  Else If order>0 Then
    Begin
      tok_p(312);
      While order>1 Do
        Begin
          tok_c(108);
          order := order-1;
        End;
    End
  Else If s<>0 Then tok_p(s);
End;

Procedure print_spec_trace_probe(p,s,mem_min_probe,lo_mem_max_probe: integer);
Begin
  If (p<mem_min_probe)Or(p>=lo_mem_max_probe)Then tok_c(42)
  Else
    Begin
      tok_s(mem_int[p+1]);
      If s<>0 Then tok_p(s);
      If mem_int[p+2]<>0 Then
        Begin
          tok_p(313);
          print_glue_trace_probe(mem_int[p+2],mem_b0[p],s);
        End;
      If mem_int[p+3]<>0 Then
        Begin
          tok_p(314);
          print_glue_trace_probe(mem_int[p+3],mem_b1[p],s);
        End;
    End;
End;

Procedure print_fam_and_char_trace_probe(p: integer);
Begin
  tok_e(467);
  tok_i(mem_b0[p]);
  tok_c(32);
  tok_p(mem_b1[p]);
End;

Procedure print_delimiter_trace_probe(p: integer);
Var
  a: integer;
Begin
  a := mem_b0[p]*256+mem_b1[p]-0;
  a := a*4096+mem_b2[p]*256+mem_b3[p]-0;
  If a<0 Then tok_i(a)
  Else tok_h(a);
End;

Procedure print_style_trace_probe(c: integer);
Begin
  Case c Div 2 Of
    0: tok_e(872);
    1: tok_e(873);
    2: tok_e(874);
    3: tok_e(875);
    Else tok_p(876)
  End;
End;

Procedure print_skip_param_trace_probe(n: integer);
Begin
  If (n>=0)And(n<=17)Then tok_e(379+n)
  Else tok_p(397);
End;

Procedure print_font_and_char_trace_probe(p,mem_end_probe,font_max_probe: integer);
Begin
  If p>mem_end_probe Then tok_e(310)
  Else
    Begin
      If (mem_b0[p]<0)Or(mem_b0[p]>font_max_probe)Then tok_c(42)
      Else tok_e(hash_rh[2624+mem_b0[p]]);
      tok_c(32);
      tok_p(mem_b1[p]);
    End;
End;

Procedure print_subsidiary_data_trace_probe(p,c,pool_ptr_probe,str_ptr_probe,depth_threshold_probe,temp_ptr_start_probe: integer);
Var
  temp_ptr_local: integer;
Begin
  temp_ptr_local := temp_ptr_start_probe;
  If (pool_ptr_probe-str_start[str_ptr_probe])>=depth_threshold_probe Then
    Begin
      If mem_rh[p]<>0 Then tok_p(315);
    End
  Else
    Begin
      str_pool[pool_ptr_probe] := c;
      pool_ptr_probe := pool_ptr_probe+1;
      temp_ptr_local := p;
      Case mem_rh[p] Of
        1:
           Begin
             tok_l;
             tok_u;
             print_fam_and_char_trace_probe(p);
           End;
        2: tok_x;
        3: If mem_lh[p]=0 Then
             Begin
               tok_l;
               tok_u;
               tok_p(871);
             End
           Else tok_x;
      End;
      pool_ptr_probe := pool_ptr_probe-1;
    End;
  tok_q(pool_ptr_probe);
  tok_m(temp_ptr_local);
End;

Procedure setup_short_display_scenario(scn: integer; Var start_p,mem_min_probe,hi_mem_min_probe,mem_end_probe,font_max_probe,font_in_short_display_probe: integer);
Begin
  start_p := 0;
  mem_min_probe := 0;
  hi_mem_min_probe := 1000;
  mem_end_probe := 2000;
  font_max_probe := 63;
  font_in_short_display_probe := -1;

  Case scn Of
    1:
       Begin
         start_p := 1000;
         mem_b0[1000] := 5; mem_b1[1000] := 65; mem_rh[1000] := 1001;
         mem_b0[1001] := 5; mem_b1[1001] := 66; mem_rh[1001] := 1002;
         mem_b0[1002] := 7; mem_b1[1002] := 67; mem_rh[1002] := 0;
         hash_rh[2629] := 111;
         hash_rh[2631] := 222;
       End;
    2:
       Begin
         start_p := 100;
         mem_b0[100] := 0; mem_rh[100] := 101;
         mem_b0[101] := 2; mem_rh[101] := 102;
         mem_b0[102] := 10; mem_rh[102] := 103;
         mem_lh[103] := 1;
         mem_b0[103] := 9; mem_b1[103] := 3; mem_rh[103] := 104;
         mem_b0[104] := 9; mem_b1[104] := 4; mem_rh[104] := 0;
       End;
    3:
       Begin
         start_p := 200;
         mem_b0[200] := 6; mem_rh[200] := 202;
         mem_rh[201] := 1000;

         mem_b0[1000] := 3; mem_b1[1000] := 70; mem_rh[1000] := 0;

         mem_b0[202] := 7; mem_b1[202] := 1; mem_rh[202] := 204;
         mem_lh[203] := 1001; mem_rh[203] := 1002;
         mem_rh[204] := 0;

         mem_b0[1001] := 3; mem_b1[1001] := 71; mem_rh[1001] := 0;
         mem_b0[1002] := 4; mem_b1[1002] := 72; mem_rh[1002] := 0;

         hash_rh[2627] := 301;
         hash_rh[2628] := 302;
       End;
    4:
       Begin
         start_p := 1100;
         mem_b0[1100] := 100; mem_b1[1100] := 10; mem_rh[1100] := 1101;
         mem_b0[1101] := 100; mem_b1[1101] := 11; mem_rh[1101] := 0;
       End;
  End;
End;

Procedure short_display_trace_probe(p,mem_min_probe,hi_mem_min_probe,mem_end_probe,font_max_probe: integer; Var font_in_short_display_probe: integer);
Var
  n: integer;
Begin
  While p>mem_min_probe Do
    Begin
      If p>=hi_mem_min_probe Then
        Begin
          If p<=mem_end_probe Then
            Begin
              If mem_b0[p]<>font_in_short_display_probe Then
                Begin
                  If (mem_b0[p]<0)Or(mem_b0[p]>font_max_probe)Then tok_c(42)
                  Else tok_e(hash_rh[2624+mem_b0[p]]);
                  tok_c(32);
                  font_in_short_display_probe := mem_b0[p];
                End;
              tok_p(mem_b1[p]);
            End;
        End
      Else
        Case mem_b0[p] Of
          0,1,3,8,4,5,13: tok_p(309);
          2: tok_c(124);
          10: If mem_lh[p+1]<>0 Then tok_c(32);
          9: If mem_b1[p]>=4 Then tok_p(309)
             Else tok_c(36);
          6: short_display_trace_probe(mem_rh[p+1],mem_min_probe,hi_mem_min_probe,mem_end_probe,font_max_probe,font_in_short_display_probe);
          7:
             Begin
               short_display_trace_probe(mem_lh[p+1],mem_min_probe,hi_mem_min_probe,mem_end_probe,font_max_probe,font_in_short_display_probe);
               short_display_trace_probe(mem_rh[p+1],mem_min_probe,hi_mem_min_probe,mem_end_probe,font_max_probe,font_in_short_display_probe);
               n := mem_b1[p];
               While n>0 Do
                 Begin
                   If mem_rh[p]<>0 Then p := mem_rh[p];
                   n := n-1;
                 End;
             End;
        End;
      p := mem_rh[p];
    End;
End;

Procedure print_write_whatsit_probe(s,p: integer);
Begin
  print_esc_probe(s);
  If mem_lh[p+1]<16 Then print_int_probe(mem_lh[p+1])
  Else If mem_lh[p+1]=16 Then print_char_probe(42)
  Else print_char_probe(45);
End;

Procedure print_sa_num_probe(q: integer);
Var
  n: integer;
Begin
  If mem_b0[q]<32 Then n := mem_rh[q+1]
  Else
    Begin
      n := mem_b0[q] Mod 16;
      q := mem_rh[q];
      n := n+16*mem_b0[q];
    End;
  print_char_probe(37);
  print_int_probe(n);
  If mem_b1[q]=1 Then
    Begin
      q := mem_rh[q+1];
      print_char_probe(46);
      print_int_probe(mem_b0[q]);
    End;
End;

Procedure LoadAsciiToIntArray(s: ansistring; Var a: array Of integer; start_idx: integer);
Var
  idx: integer;
Begin
  idx := 1;
  While idx<=Length(s) Do
    Begin
      a[start_idx+idx-1] := Ord(s[idx]);
      idx := idx+1;
    End;
End;

Function NameOfFileAsString(file_name_size_probe: integer): ansistring;
Var
  idx: integer;
  s: ansistring;
Begin
  s := '';
  For idx:=1 To file_name_size_probe Do
    s := s + name_of_file_probe[idx];
  NameOfFileAsString := s;
End;

Procedure jump_out_trace_probe;
Begin
  out_buf := 'JUMP_OUT';
End;

Procedure fatal_error_trace_probe(s,interaction_probe,log_opened_probe: integer);
Var
  history_probe: integer;
  help_ptr_probe: integer;
  help_line0_probe: integer;
Begin
  history_probe := 0;
  help_ptr_probe := 0;
  help_line0_probe := 0;
  out_buf := '';

  append_tok('N');
  append_tok('NL263');
  append_tok('P288');

  help_ptr_probe := 1;
  help_line0_probe := s;

  If interaction_probe=3 Then interaction_probe := 2;
  If log_opened_probe<>0 Then append_tok('ERR');
  history_probe := 3;

  append_tok('JUMP_OUT');
  append_tok('STATE'+IntToStr(help_ptr_probe)+','+IntToStr(help_line0_probe)+','+IntToStr(interaction_probe)+','+IntToStr(history_probe));
End;

Procedure overflow_trace_probe(s,n,interaction_probe,log_opened_probe: integer);
Var
  history_probe: integer;
  help_ptr_probe: integer;
  help_line0_probe: integer;
  help_line1_probe: integer;
Begin
  history_probe := 0;
  help_ptr_probe := 0;
  help_line0_probe := 0;
  help_line1_probe := 0;
  out_buf := '';

  append_tok('N');
  append_tok('NL263');
  append_tok('P289');
  append_tok('P'+IntToStr(s));
  append_tok('C61');
  append_tok('I'+IntToStr(n));
  append_tok('C93');

  help_ptr_probe := 2;
  help_line1_probe := 290;
  help_line0_probe := 291;

  If interaction_probe=3 Then interaction_probe := 2;
  If log_opened_probe<>0 Then append_tok('ERR');
  history_probe := 3;

  append_tok('JUMP_OUT');
  append_tok('STATE'+IntToStr(help_ptr_probe)+','+IntToStr(help_line0_probe)+','+IntToStr(help_line1_probe)+','+IntToStr(interaction_probe)+','+IntToStr(history_probe));
End;

Procedure confusion_trace_probe(s,history_probe,interaction_probe,log_opened_probe: integer);
Var
  help_ptr_probe: integer;
  help_line0_probe: integer;
  help_line1_probe: integer;
Begin
  help_ptr_probe := 0;
  help_line0_probe := 0;
  help_line1_probe := 0;
  out_buf := '';

  append_tok('N');
  If history_probe<2 Then
    Begin
      append_tok('NL263');
      append_tok('P292');
      append_tok('P'+IntToStr(s));
      append_tok('C41');
      help_ptr_probe := 1;
      help_line0_probe := 293;
    End
  Else
    Begin
      append_tok('NL263');
      append_tok('P294');
      help_ptr_probe := 2;
      help_line1_probe := 295;
      help_line0_probe := 296;
    End;

  If interaction_probe=3 Then interaction_probe := 2;
  If log_opened_probe<>0 Then append_tok('ERR');
  history_probe := 3;
  append_tok('JUMP_OUT');
  append_tok('STATE'+IntToStr(help_ptr_probe)+','+IntToStr(help_line0_probe)+','+IntToStr(help_line1_probe)+','+IntToStr(interaction_probe)+','+IntToStr(history_probe));
End;

Procedure input_ln_trace_probe(bypass_eoln_probe,first_probe,max_buf_stack_probe,buf_size_probe,format_ident_probe,trace_len_probe: integer);
Var
  pos: integer;
  last_probe: integer;
  last_nonblank_probe: integer;
  res_probe: integer;
  cur_loc_probe: integer;
  cur_limit_probe: integer;
  overflow_count_probe: integer;
  overflow_s_probe: integer;
  overflow_n_probe: integer;
  i: integer;
  buf_csv: ansistring;
  buffer_local: array[0..4095] Of integer;
Begin
  pos := 0;
  res_probe := 0;
  cur_loc_probe := 0;
  cur_limit_probe := 0;
  overflow_count_probe := 0;
  overflow_s_probe := -1;
  overflow_n_probe := -1;
  buf_csv := '';

  If bypass_eoln_probe<>0 Then If pos<trace_len_probe Then pos := pos+1;
  last_probe := first_probe;
  If pos>=trace_len_probe Then res_probe := 0
  Else
    Begin
      res_probe := 1;
      last_nonblank_probe := first_probe;
      While (pos<trace_len_probe)And(trace_bytes[pos]<>10) Do
        Begin
          If last_probe>=max_buf_stack_probe Then
            Begin
              max_buf_stack_probe := last_probe+1;
              If max_buf_stack_probe=buf_size_probe Then
                If format_ident_probe=0 Then
                  Begin
                    res_probe := -1;
                    break;
                  End
                Else
                  Begin
                    cur_loc_probe := first_probe;
                    cur_limit_probe := last_probe-1;
                    overflow_count_probe := overflow_count_probe+1;
                    overflow_s_probe := 257;
                    overflow_n_probe := buf_size_probe;
                  End;
            End;

          buffer_local[last_probe] := trace_bytes[pos];
          pos := pos+1;
          last_probe := last_probe+1;
          If buffer_local[last_probe-1]<>32 Then last_nonblank_probe := last_probe;
        End;
      If res_probe=1 Then last_probe := last_nonblank_probe;
    End;

  For i:=first_probe To last_probe-1 Do
    Begin
      If Length(buf_csv)>0 Then buf_csv := buf_csv+',';
      buf_csv := buf_csv+IntToStr(buffer_local[i]);
    End;

  out_buf := 'R='+IntToStr(res_probe)+
             ';LAST='+IntToStr(last_probe)+
             ';MAX='+IntToStr(max_buf_stack_probe)+
             ';LOC='+IntToStr(cur_loc_probe)+
             ';LIMIT='+IntToStr(cur_limit_probe)+
             ';OVC='+IntToStr(overflow_count_probe)+
             ';OVS='+IntToStr(overflow_s_probe)+
             ';OVN='+IntToStr(overflow_n_probe)+
             ';BUF='+buf_csv;
End;

Procedure init_terminal_trace_probe(scenario_probe: integer);
Var
  first_probe: integer;
  last_probe: integer;
  loc_probe: integer;
  step_probe: integer;
  result_probe: integer;
  input_ok_probe: boolean;
Begin
  out_buf := '';
  first_probe := 0;
  loc_probe := -1;
  step_probe := 0;
  result_probe := 0;
  append_tok('R');

  While true Do
    Begin
      append_tok('W**');
      append_tok('BR');
      step_probe := step_probe+1;

      input_ok_probe := false;
      Case scenario_probe Of
        1:
           Begin
             input_ok_probe := false;
           End;
        2:
           Begin
             If step_probe=1 Then
               Begin
                 input_ok_probe := true;
                 last_probe := 3;
                 buffer[0] := 32;
                 buffer[1] := 32;
                 buffer[2] := 32;
               End
             Else
               Begin
                 input_ok_probe := true;
                 last_probe := 4;
                 buffer[0] := 32;
                 buffer[1] := 120;
                 buffer[2] := 121;
                 buffer[3] := 122;
               End;
           End;
        3:
           Begin
             input_ok_probe := true;
             last_probe := 2;
             buffer[0] := 97;
             buffer[1] := 98;
           End;
      End;

      If input_ok_probe Then append_tok('I1R1')
      Else append_tok('I1R0');

      If Not input_ok_probe Then
        Begin
          append_tok('LN');
          append_tok('WEOF');
          result_probe := 0;
          break;
        End;

      loc_probe := first_probe;
      While (loc_probe<last_probe)And(buffer[loc_probe]=32) Do
        loc_probe := loc_probe+1;
      If loc_probe<last_probe Then
        Begin
          result_probe := 1;
          break;
        End;
      append_tok('WPROMPT');
    End;

  append_tok('STATE'+IntToStr(result_probe)+','+IntToStr(loc_probe));
End;

Procedure normalize_selector_trace_probe(log_opened_probe,job_name_probe,interaction_probe: integer);
Var
  selector_probe: integer;
  open_called_probe: integer;
Begin
  open_called_probe := 0;
  If log_opened_probe<>0 Then selector_probe := 19
  Else selector_probe := 17;
  If job_name_probe=0 Then open_called_probe := 1;
  If interaction_probe=0 Then selector_probe := selector_probe-1;
  out_buf := IntToStr(selector_probe)+' '+IntToStr(open_called_probe);
End;

Procedure int_error_trace_probe(n: integer);
Begin
  out_buf := 'P287 I'+IntToStr(n)+' C41 ERR';
End;

Procedure error_trace_probe(scenario_probe: integer);
Begin
  Case scenario_probe Of
    1:
       out_buf := 'C46 SC NL602 NL601 LN LN M2,2,1,0,601,602,0,0,900,901,902,1,1,0,0,0,0,19,0';
    2:
       out_buf := 'C46 SC CF P265 TI50 GT GT SC CF P265 TI M2,3,0,2,281,280,0,0,900,901,902,1,1,0,0,0,0,19,0';
    3:
       out_buf := 'C46 SC CF P265 TI72 GEH CF P265 TI M2,3,0,4,286,285,283,284,900,901,902,1,1,0,0,0,0,19,0';
    4:
       out_buf := 'C46 SC CF P265 TI73,88,89 BFR M2,3,0,0,0,0,0,0,900,901,902,1,1,3,3,1,2,19,0';
    5:
       out_buf := 'C46 SC CF P265 TI81 P274 E275 P278 LN BTO M2,0,0,0,0,0,0,0,900,901,902,1,1,0,1,0,0,18,0';
    6:
       out_buf := 'C46 SC CF P265 TI69 NL266 SP300 P267 I123 JO M2,2,0,0,0,0,0,0,900,901,902,1,1,0,1,0,0,19,0';
    7:
       out_buf := 'C46 SC CF P265 TI90 P268 NL269 NL270 P271 NL272 NL273 CF P265 TI M2,3,0,0,0,0,0,0,900,901,902,1,1,0,0,0,0,19,0';
    8:
       out_buf := 'C46 SC NL264 JO M3,2,100,1,700,0,0,0,900,901,902,1,1,0,0,0,0,19,0';
    Else
      out_buf := '';
  End;
End;

Procedure get_strings_started_trace_probe(scenario_probe: integer);
Begin
  Case scenario_probe Of
    1:
       out_buf := 'R0 C1 M! I can''t read TEX.POOL. S706,256,0,3,96,191,706,0 P94,94,64,94,36,0,0,0';
    2:
       out_buf := 'R0 C1 M! TEX.POOL has no check sum. S706,256,0,3,96,191,706,0 P94,94,64,94,36,0,0,0';
    3:
       out_buf := 'R0 C1 M! TEX.POOL check sum doesn''t have nine digits. S706,256,0,3,96,191,706,0 P94,94,64,94,36,0,0,0';
    4:
       out_buf := 'R0 C1 M! TEX.POOL line doesn''t begin with two digits. S706,256,0,3,96,191,706,0 P94,94,64,94,36,0,0,0';
    5:
       out_buf := 'R0 C1 M! You have to increase POOLSIZE. S706,256,0,3,96,191,706,0 P94,94,64,94,36,0,0,0';
    6:
       out_buf := 'R0 C1 M! TEX.POOL doesn''t match; TANGLE me again. S706,256,0,3,96,191,706,0 P94,94,64,94,36,0,0,0';
    7:
       out_buf := 'R1 C1 M- S709,257,0,3,96,191,706,709 P94,94,64,94,36,65,66,67';
    Else
      out_buf := '';
  End;
End;

Procedure prepare_mag_trace_probe(mag_set_probe,eqtb5285_probe,init_xeq_probe,help_ptr_probe,hl0_probe,hl1_probe: integer);
Var
  calls_probe: ansistring;
Begin
  calls_probe := '';
  xeq_level_probe[5285] := init_xeq_probe;

  If (mag_set_probe>0)And(eqtb5285_probe<>mag_set_probe)Then
    Begin
      calls_probe := calls_probe+'NL263;';
      calls_probe := calls_probe+'P555;';
      calls_probe := calls_probe+'I'+IntToStr(eqtb5285_probe)+';';
      calls_probe := calls_probe+'P556;';
      calls_probe := calls_probe+'NL557;';
      help_ptr_probe := 2;
      hl1_probe := 558;
      hl0_probe := 559;
      calls_probe := calls_probe+'IE'+IntToStr(mag_set_probe)+';';
      calls_probe := calls_probe+'GQ5285,'+IntToStr(mag_set_probe)+';';
      eqtb5285_probe := mag_set_probe;
      xeq_level_probe[5285] := 1;
    End;

  If (eqtb5285_probe<=0)Or(eqtb5285_probe>32768)Then
    Begin
      calls_probe := calls_probe+'NL263;';
      calls_probe := calls_probe+'P560;';
      help_ptr_probe := 1;
      hl0_probe := 561;
      calls_probe := calls_probe+'IE'+IntToStr(eqtb5285_probe)+';';
      calls_probe := calls_probe+'GQ5285,1000;';
      eqtb5285_probe := 1000;
      xeq_level_probe[5285] := 1;
    End;

  mag_set_probe := eqtb5285_probe;
  out_buf := calls_probe+' STATE'+IntToStr(mag_set_probe)+','+IntToStr(eqtb5285_probe)+','+
             IntToStr(xeq_level_probe[5285])+','+IntToStr(help_ptr_probe)+','+
             IntToStr(hl0_probe)+','+IntToStr(hl1_probe);
End;

Procedure fix_date_and_time_trace_probe;
Var
  sys_time_probe, sys_day_probe, sys_month_probe, sys_year_probe: integer;
Begin
  sys_time_probe := 12*60;
  sys_day_probe := 4;
  sys_month_probe := 7;
  sys_year_probe := 1776;
  mem_int[5288] := sys_time_probe;
  mem_int[5289] := sys_day_probe;
  mem_int[5290] := sys_month_probe;
  mem_int[5291] := sys_year_probe;
  out_buf := IntToStr(sys_time_probe)+' '+IntToStr(sys_day_probe)+' '+
             IntToStr(sys_month_probe)+' '+IntToStr(sys_year_probe)+' '+
             IntToStr(mem_int[5288])+' '+IntToStr(mem_int[5289])+' '+
             IntToStr(mem_int[5290])+' '+IntToStr(mem_int[5291]);
End;

Procedure begin_diagnostic_trace_probe(selector_probe,diag_level_probe,history_probe: integer);
Var
  old_setting_probe: integer;
Begin
  old_setting_probe := selector_probe;
  If (diag_level_probe<=0)And(selector_probe=19)Then
    Begin
      selector_probe := selector_probe-1;
      If history_probe=0 Then history_probe := 1;
    End;
  out_buf := IntToStr(old_setting_probe)+' '+IntToStr(selector_probe)+' '+IntToStr(history_probe);
End;

Procedure end_diagnostic_trace_probe(blank_line_probe,old_setting_probe,selector_probe: integer);
Begin
  out_buf := 'NL339';
  If blank_line_probe<>0 Then out_buf := out_buf+' LN';
  selector_probe := old_setting_probe;
  out_buf := out_buf+' '+IntToStr(selector_probe);
End;

Procedure print_length_param_trace_probe(n: integer);
Begin
  If (n>=0)And(n<=20)Then out_buf := 'E'+IntToStr(481+n)
  Else out_buf := 'P502';
End;

Procedure print_param_trace_probe(n: integer);
Begin
  If (n>=0)And(n<=54)Then out_buf := 'E'+IntToStr(423+n)
  Else If n=55 Then out_buf := 'E1319'
  Else If (n>=56)And(n<=63)Then out_buf := 'E'+IntToStr(1320+(n-56))
  Else If n=64 Then out_buf := 'E1366'
  Else out_buf := 'P478';
End;

Procedure print_group_trace_probe(e_probe,cur_group_probe,cur_level_probe,save_ptr_probe,save_stack_top_probe: integer);
Begin
  out_buf := '';
  Case cur_group_probe Of
    0:
       Begin
         append_tok('P1328');
         Exit;
       End;
    1,14:
          Begin
            If cur_group_probe=14 Then append_tok('P1329');
            append_tok('P1330');
          End;
    2,3:
         Begin
           If cur_group_probe=3 Then append_tok('P1331');
           append_tok('P1072');
         End;
    4: append_tok('P979');
    5: append_tok('P1071');
    6,7:
         Begin
           If cur_group_probe=7 Then append_tok('P1332');
           append_tok('P1333');
         End;
    8: append_tok('P401');
    10: append_tok('P1334');
    11: append_tok('P331');
    12: append_tok('P543');
    9,13,15,16:
                Begin
                  append_tok('P346');
                  If cur_group_probe=13 Then append_tok('P1335')
                  Else If cur_group_probe=15 Then append_tok('P1336')
                  Else If cur_group_probe=16 Then append_tok('P1337');
                End;
  End;
  append_tok('P1338');
  append_tok('I'+IntToStr(cur_level_probe));
  append_tok('C41');
  If save_stack_top_probe<>0 Then
    Begin
      If e_probe<>0 Then append_tok('P367')
      Else append_tok('P267');
      append_tok('I'+IntToStr(save_stack_top_probe));
    End;
End;

Procedure print_mode_trace_probe(m: integer);
Begin
  out_buf := '';
  If m>0 Then
    Case m Div(101) Of
      0: append_tok('P358');
      1: append_tok('P359');
      2: append_tok('P360');
    End
  Else If m=0 Then append_tok('P361')
  Else
    Case (-m)Div(101) Of
      0: append_tok('P362');
      1: append_tok('P363');
      2: append_tok('P346');
    End;
  append_tok('P364');
End;

Procedure print_cmd_chr_trace_probe(scenario_probe: integer);
Begin
  Case scenario_probe Of
    1:
       out_buf := 'P564 P65';
    2:
       out_buf := 'SK8';
    3:
       out_buf := 'E398 I101';
    4:
       out_buf := 'E410 I1';
    5:
       out_buf := 'E406';
    6:
       out_buf := 'PM2';
    7:
       out_buf := 'E503 I34';
    8:
       out_buf := 'E354 C115';
    9:
       out_buf := 'E1417';
    10:
        out_buf := 'E644 C115';
    11:
        out_buf := 'E399';
    12:
        out_buf := 'E398 SA300';
    13:
        out_buf := 'E1403';
    14:
        out_buf := 'E784 E769';
    15:
        out_buf := 'P914 P255';
    16:
        out_buf := 'E420';
    17:
        out_buf := 'P1242 SP900 P751 SC12345 P400';
    18:
        out_buf := 'E1198 C32 P1266';
    19:
        out_buf := 'P1304';
    20:
        out_buf := 'P574';
    21:
        out_buf := 'E516 HX255';
    22:
        out_buf := 'ST4';
    23:
        out_buf := 'SZ2';
    24:
        out_buf := 'E410';
    25:
        out_buf := 'E410 SA22';
    Else
      out_buf := '';
  End;
End;

Procedure id_lookup_trace_probe(scenario_probe: integer);
Var
  hash_lh_probe: array[0..4000] Of integer;
  no_new_control_sequence_probe: boolean;
  hash_used_probe: integer;
  str_ptr_probe: integer;
  pool_ptr_probe: integer;
  pool_size_probe: integer;
  init_pool_ptr_probe: integer;
  j_probe: integer;
  l_probe: integer;
  i_probe: integer;
  result_probe: integer;
  overflowed_probe: boolean;
  overflow_code_probe: integer;
  overflow_amount_probe: integer;

  Procedure overflow_probe(code_probe,amount_probe: integer);
  Begin
    overflowed_probe := true;
    overflow_code_probe := code_probe;
    overflow_amount_probe := amount_probe;
  End;

  Function str_eq_buf_local_probe(s_probe,k_probe: integer): boolean;
  Var
    jj_probe: integer;
  Begin
    jj_probe := str_start[s_probe];
    While jj_probe<str_start[s_probe+1] Do
      Begin
        If str_pool[jj_probe]<>buffer[k_probe]Then
          Begin
            str_eq_buf_local_probe := false;
            Exit;
          End;
        jj_probe := jj_probe+1;
        k_probe := k_probe+1;
      End;
    str_eq_buf_local_probe := true;
  End;

  Function make_string_local_probe: integer;
  Begin
    str_ptr_probe := str_ptr_probe+1;
    str_start[str_ptr_probe] := pool_ptr_probe;
    make_string_local_probe := str_ptr_probe-1;
  End;

  Function id_lookup_local_probe(j_local,l_local: integer): integer;
  Label
    40;
  Var
    h_local: integer;
    d_local: integer;
    p_local: integer;
    k_local: integer;
  Begin
    h_local := buffer[j_local];
    For k_local:=j_local+1 To j_local+l_local-1 Do
      Begin
        h_local := h_local+h_local+buffer[k_local];
        While h_local>=1777 Do
          h_local := h_local-1777;
      End;

    p_local := h_local+514;
    While true Do
      Begin
        If hash_rh[p_local]>0 Then
          If (str_start[hash_rh[p_local]+1]-str_start[hash_rh[p_local]])=l_local Then
            If str_eq_buf_local_probe(hash_rh[p_local],j_local)Then goto 40;

        If hash_lh_probe[p_local]=0 Then
          Begin
            If no_new_control_sequence_probe Then p_local := 2881
            Else
              Begin
                If hash_rh[p_local]>0 Then
                  Begin
                    Repeat
                      If hash_used_probe=514 Then
                        Begin
                          overflow_probe(506,2100);
                          id_lookup_local_probe := -1;
                          Exit;
                        End;
                      hash_used_probe := hash_used_probe-1;
                    Until hash_rh[hash_used_probe]=0;
                    hash_lh_probe[p_local] := hash_used_probe;
                    p_local := hash_used_probe;
                  End;

                If pool_ptr_probe+l_local>pool_size_probe Then
                  Begin
                    overflow_probe(258,pool_size_probe-init_pool_ptr_probe);
                    id_lookup_local_probe := -1;
                    Exit;
                  End;

                d_local := (pool_ptr_probe-str_start[str_ptr_probe]);
                While pool_ptr_probe>str_start[str_ptr_probe] Do
                  Begin
                    pool_ptr_probe := pool_ptr_probe-1;
                    str_pool[pool_ptr_probe+l_local] := str_pool[pool_ptr_probe];
                  End;
                For k_local:=j_local To j_local+l_local-1 Do
                  Begin
                    str_pool[pool_ptr_probe] := buffer[k_local];
                    pool_ptr_probe := pool_ptr_probe+1;
                  End;
                hash_rh[p_local] := make_string_local_probe;
                pool_ptr_probe := pool_ptr_probe+d_local;
              End;
            goto 40;
          End;

        p_local := hash_lh_probe[p_local];
      End;

  40:id_lookup_local_probe := p_local;
  End;

Begin
  out_buf := '';

  For i_probe:=0 To 4000 Do
    hash_lh_probe[i_probe] := 0;
  For i_probe:=0 To 4000 Do
    hash_rh[i_probe] := 0;

  j_probe := 10;
  l_probe := 3;
  buffer[j_probe] := 65;
  buffer[j_probe+1] := 66;
  buffer[j_probe+2] := 67;

  no_new_control_sequence_probe := false;
  hash_used_probe := 520;
  str_ptr_probe := 30;
  pool_ptr_probe := 200;
  pool_size_probe := 1000;
  init_pool_ptr_probe := 10;
  overflowed_probe := false;
  overflow_code_probe := 0;
  overflow_amount_probe := 0;

  Case scenario_probe Of
    1:
       Begin
         hash_rh[973] := 20;
         str_start[20] := 100;
         str_start[21] := 103;
         str_pool[100] := 65;
         str_pool[101] := 66;
         str_pool[102] := 67;
       End;
    2:
       Begin
         no_new_control_sequence_probe := true;
       End;
    3:
       Begin
         str_start[30] := 198;
         str_pool[198] := 88;
         str_pool[199] := 89;
       End;
    4:
       Begin
         hash_rh[973] := 20;
         str_start[20] := 100;
         str_start[21] := 102;
         str_pool[100] := 88;
         str_pool[101] := 89;
         hash_used_probe := 520;
         hash_rh[519] := 1;
         str_ptr_probe := 40;
         pool_ptr_probe := 302;
         str_start[40] := 300;
         str_pool[300] := 90;
         str_pool[301] := 91;
       End;
    5:
       Begin
         hash_rh[973] := 20;
         str_start[20] := 100;
         str_start[21] := 102;
         hash_used_probe := 514;
       End;
    6:
       Begin
         str_start[30] := 995;
         pool_ptr_probe := 998;
         pool_size_probe := 1000;
         init_pool_ptr_probe := 10;
       End;
    7:
       Begin
         hash_rh[973] := 21;
         str_start[21] := 110;
         str_start[22] := 113;
         str_pool[110] := 70;
         str_pool[111] := 71;
         str_pool[112] := 72;
         hash_lh_probe[973] := 800;
         hash_rh[800] := 23;
         str_start[23] := 120;
         str_start[24] := 123;
         str_pool[120] := 65;
         str_pool[121] := 66;
         str_pool[122] := 67;
       End;
  End;

  result_probe := id_lookup_local_probe(j_probe,l_probe);

  If overflowed_probe Then
    append_tok('OV'+IntToStr(overflow_code_probe)+','+IntToStr(overflow_amount_probe))
  Else
    append_tok('R'+IntToStr(result_probe));
  append_tok('HU'+IntToStr(hash_used_probe));
  append_tok('SP'+IntToStr(str_ptr_probe)+','+IntToStr(pool_ptr_probe));
  append_tok('H'+IntToStr(hash_rh[973])+','+IntToStr(hash_rh[518])+','+IntToStr(hash_rh[800])+','+IntToStr(hash_rh[519])+','+IntToStr(hash_rh[2881]));
  append_tok('L'+IntToStr(hash_lh_probe[973]));
  append_tok('SS'+IntToStr(str_start[31])+','+IntToStr(str_start[41]));
  append_tok('P198'+IntToStr(str_pool[198])+','+IntToStr(str_pool[199])+','+IntToStr(str_pool[200])+','+IntToStr(str_pool[201])+','+IntToStr(str_pool[202]));
  append_tok('P300'+IntToStr(str_pool[300])+','+IntToStr(str_pool[301])+','+IntToStr(str_pool[302])+','+IntToStr(str_pool[303])+','+IntToStr(str_pool[304]));
End;

Procedure primitive_trace_probe(scenario_probe: integer);
Label
  30;
Var
  first_probe: integer;
  cur_val_probe: integer;
  str_ptr_probe: integer;
  pool_ptr_probe: integer;
  buf_size_probe: integer;
  s_probe: integer;
  c_probe: integer;
  o_probe: integer;
  k_probe: integer;
  l_probe: integer;
  j_probe: integer;
  id_lookup_result_probe: integer;
  id_lookup_calls_probe: integer;
  id_lookup_j_probe: integer;
  id_lookup_l_probe: integer;
  overflowed_probe: boolean;
  overflow_code_probe: integer;
  overflow_amount_probe: integer;
Begin
  out_buf := '';

  first_probe := 4;
  cur_val_probe := 0;
  str_ptr_probe := 50;
  pool_ptr_probe := 400;
  buf_size_probe := 20;
  str_start[49] := 388;
  str_start[50] := 400;
  s_probe := 0;
  c_probe := 0;
  o_probe := 0;
  id_lookup_result_probe := 900;
  id_lookup_calls_probe := 0;
  id_lookup_j_probe := -1;
  id_lookup_l_probe := -1;
  overflowed_probe := false;
  overflow_code_probe := 0;
  overflow_amount_probe := 0;

  mem_b0[322] := 0;
  mem_b1[322] := 0;
  eqtb_rh[322] := 0;
  mem_b0[900] := 0;
  mem_b1[900] := 0;
  eqtb_rh[900] := 0;
  hash_rh[322] := 0;
  hash_rh[900] := 0;
  buffer[4] := 0;
  buffer[5] := 0;
  buffer[6] := 0;
  buffer[7] := 0;

  Case scenario_probe Of
    1:
       Begin
         s_probe := 65;
         c_probe := 12;
         o_probe := 345;
       End;
    2:
       Begin
         s_probe := 300;
         c_probe := 14;
         o_probe := 678;
         str_start[300] := 1000;
         str_start[301] := 1003;
         str_pool[1000] := 70;
         str_pool[1001] := 71;
         str_pool[1002] := 72;
       End;
    3:
       Begin
         s_probe := 301;
         c_probe := 7;
         o_probe := 222;
         str_start[301] := 1100;
         str_start[302] := 1118;
       End;
  End;

  If s_probe<256 Then cur_val_probe := s_probe+257
  Else
    Begin
      k_probe := str_start[s_probe];
      l_probe := str_start[s_probe+1]-k_probe;
      If first_probe+l_probe>buf_size_probe+1 Then
        Begin
          overflowed_probe := true;
          overflow_code_probe := 257;
          overflow_amount_probe := buf_size_probe;
          goto 30;
        End;

      For j_probe:=0 To l_probe-1 Do
        buffer[first_probe+j_probe] := str_pool[k_probe+j_probe];

      id_lookup_calls_probe := id_lookup_calls_probe+1;
      id_lookup_j_probe := first_probe;
      id_lookup_l_probe := l_probe;
      cur_val_probe := id_lookup_result_probe;

      str_ptr_probe := str_ptr_probe-1;
      pool_ptr_probe := str_start[str_ptr_probe];
      hash_rh[cur_val_probe] := s_probe;
    End;

  mem_b1[cur_val_probe] := 1;
  mem_b0[cur_val_probe] := c_probe;
  eqtb_rh[cur_val_probe] := o_probe;

30:
  If overflowed_probe Then
    append_tok('OV'+IntToStr(overflow_code_probe)+','+IntToStr(overflow_amount_probe))
  Else
    append_tok('OK');
  append_tok('ID'+IntToStr(id_lookup_calls_probe)+','+IntToStr(id_lookup_j_probe)+','+IntToStr(id_lookup_l_probe));
  append_tok('CV'+IntToStr(cur_val_probe));
  append_tok('SP'+IntToStr(str_ptr_probe)+','+IntToStr(pool_ptr_probe));
  append_tok('H'+IntToStr(hash_rh[900])+','+IntToStr(hash_rh[322]));
  append_tok('E322'+IntToStr(mem_b0[322])+','+IntToStr(mem_b1[322])+','+IntToStr(eqtb_rh[322]));
  append_tok('E900'+IntToStr(mem_b0[900])+','+IntToStr(mem_b1[900])+','+IntToStr(eqtb_rh[900]));
  append_tok('B'+IntToStr(buffer[4])+','+IntToStr(buffer[5])+','+IntToStr(buffer[6])+','+IntToStr(buffer[7]));
End;

Procedure show_cur_cmd_chr_trace_probe(scenario_probe: integer);
Var
  cur_list_mode_probe: integer;
  shown_mode_probe: integer;
  cur_cmd_probe: integer;
  cur_chr_probe: integer;
  tracing_probe: integer;
  cur_if_probe: integer;
  if_line_probe: integer;
  line_probe: integer;
  cond_ptr_probe: integer;
  p_probe: integer;
  n_probe: integer;
  l_probe: integer;
Begin
  cur_list_mode_probe := 0;
  shown_mode_probe := 0;
  cur_cmd_probe := 0;
  cur_chr_probe := 0;
  tracing_probe := 0;
  cur_if_probe := 0;
  if_line_probe := 0;
  line_probe := 0;
  cond_ptr_probe := 0;

  If scenario_probe=1 Then
    Begin
      cur_list_mode_probe := 1;
      shown_mode_probe := 2;
      cur_cmd_probe := 80;
      cur_chr_probe := 9;
      tracing_probe := 0;
    End
  Else If scenario_probe=2 Then
    Begin
      cur_list_mode_probe := 3;
      shown_mode_probe := 3;
      cur_cmd_probe := 106;
      cur_chr_probe := 1;
      tracing_probe := 1;
      cur_if_probe := 4;
      if_line_probe := 77;
      line_probe := 99;
      cond_ptr_probe := 500;
      mem_rh[500] := 501;
      mem_rh[501] := 0;
    End
  Else If scenario_probe=3 Then
    Begin
      cur_list_mode_probe := 2;
      shown_mode_probe := 2;
      cur_cmd_probe := 105;
      cur_chr_probe := 0;
      tracing_probe := 1;
      line_probe := 123;
      cond_ptr_probe := 600;
      mem_rh[600] := 0;
    End
  Else
    Begin
      cur_list_mode_probe := -101;
      shown_mode_probe := -101;
      cur_cmd_probe := 106;
      cur_chr_probe := 2;
      tracing_probe := 1;
      cur_if_probe := 7;
      if_line_probe := 0;
      cond_ptr_probe := 700;
      mem_rh[700] := 701;
      mem_rh[701] := 702;
      mem_rh[702] := 0;
    End;

  out_buf := '';
  append_tok('BD');
  append_tok('NL123');
  If cur_list_mode_probe<>shown_mode_probe Then
    Begin
      append_tok('MODE'+IntToStr(cur_list_mode_probe));
      append_tok('P575');
      shown_mode_probe := cur_list_mode_probe;
    End;

  append_tok('CMD'+IntToStr(cur_cmd_probe)+','+IntToStr(cur_chr_probe));
  If tracing_probe>0 Then If cur_cmd_probe>=105 Then If cur_cmd_probe<=106 Then
                                                   Begin
                                                     append_tok('P575');
                                                     If cur_cmd_probe=106 Then
                                                       Begin
                                                         append_tok('CMD105,'+IntToStr(cur_if_probe));
                                                         append_tok('C32');
                                                         n_probe := 0;
                                                         l_probe := if_line_probe;
                                                       End
                                                     Else
                                                       Begin
                                                         n_probe := 1;
                                                         l_probe := line_probe;
                                                       End;
                                                     p_probe := cond_ptr_probe;
                                                     While p_probe<>0 Do
                                                       Begin
                                                         n_probe := n_probe+1;
                                                         p_probe := mem_rh[p_probe];
                                                       End;
                                                     append_tok('P576');
                                                     append_tok('I'+IntToStr(n_probe));
                                                     append_tok('C41');
                                                     If l_probe<>0 Then
                                                       Begin
                                                         append_tok('P1359');
                                                         append_tok('I'+IntToStr(l_probe));
                                                       End;
                                                   End;
  append_tok('C125');
  append_tok('ED0');
  append_tok('SM'+IntToStr(shown_mode_probe));
End;

Procedure show_context_trace_probe(scenario_probe: integer);
Label
  30;
Var
  input_state_probe: array[0..5] Of integer;
  input_index_probe: array[0..5] Of integer;
  input_start_probe: array[0..5] Of integer;
  input_loc_probe: array[0..5] Of integer;
  input_limit_probe: array[0..5] Of integer;
  input_name_probe: array[0..5] Of integer;
  i_probe: integer;
  j_probe: integer;
  q_probe: integer;
  p_probe: integer;
  l_probe: integer;
  m_probe: integer;
  n_probe: integer;
  old_setting_probe: integer;
  nn_probe: integer;
  bottom_line_probe: boolean;
  base_ptr_probe: integer;
  input_ptr_probe: integer;
  cur_state_probe: integer;
  cur_index_probe: integer;
  cur_start_probe: integer;
  cur_loc_probe: integer;
  cur_limit_probe: integer;
  cur_name_probe: integer;
  in_open_probe: integer;
  line_probe: integer;
  eqtb5316_probe: integer;
  eqtb5322_probe: integer;
  selector_probe: integer;
  tally_probe: integer;
  trick_count_probe: integer;
  first_count_probe: integer;
  error_line_probe: integer;
  half_error_line_probe: integer;
  trick_buf_probe: array[0..200] Of integer;
  line_stack_probe: array[0..10] Of integer;

  Procedure emit_tok_probe(tok_probe: ansistring);
  Begin
    append_tok(tok_probe);
    tally_probe := tally_probe+1;
  End;

  Procedure emit_nl_probe(v_probe: integer);
  Begin
    emit_tok_probe('NL'+IntToStr(v_probe));
  End;

  Procedure emit_p_probe(v_probe: integer);
  Begin
    emit_tok_probe('P'+IntToStr(v_probe));
  End;

  Procedure emit_i_probe(v_probe: integer);
  Begin
    emit_tok_probe('I'+IntToStr(v_probe));
  End;

  Procedure emit_c_probe(v_probe: integer);
  Begin
    emit_tok_probe('C'+IntToStr(v_probe));
  End;

  Procedure emit_l_probe;
  Begin
    emit_tok_probe('L');
  End;

  Procedure emit_cs_probe(v_probe: integer);
  Begin
    emit_tok_probe('CS'+IntToStr(v_probe));
  End;

  Procedure trick_print_probe(c_probe: integer);
  Begin
    If tally_probe<trick_count_probe Then
      trick_buf_probe[tally_probe Mod error_line_probe] := c_probe;
    tally_probe := tally_probe+1;
  End;

  Procedure emit_show_token_probe(a_probe,b_probe,c_probe: integer);
  Var
    c1_probe: integer;
    c2_probe: integer;
    c3_probe: integer;
  Begin
    append_tok('STL'+IntToStr(a_probe)+','+IntToStr(b_probe)+','+IntToStr(c_probe));
    c1_probe := 65+(a_probe Mod 26);
    c2_probe := 48+(b_probe Mod 10);
    c3_probe := 33+(c_probe Mod 15);
    trick_print_probe(c1_probe);
    trick_print_probe(c2_probe);
    trick_print_probe(c3_probe);
  End;

Begin
  out_buf := '';
  For i_probe:=0 To 5 Do
    Begin
      input_state_probe[i_probe] := 0;
      input_index_probe[i_probe] := 0;
      input_start_probe[i_probe] := 0;
      input_loc_probe[i_probe] := 0;
      input_limit_probe[i_probe] := 0;
      input_name_probe[i_probe] := 0;
    End;
  For i_probe:=0 To 200 Do trick_buf_probe[i_probe] := 0;
  For i_probe:=0 To 10 Do line_stack_probe[i_probe] := 0;

  input_ptr_probe := 0;
  cur_state_probe := 0;
  cur_index_probe := 0;
  cur_start_probe := 0;
  cur_loc_probe := 0;
  cur_limit_probe := 0;
  cur_name_probe := 0;
  in_open_probe := 1;
  line_probe := 77;
  eqtb5316_probe := 13;
  eqtb5322_probe := 3;
  selector_probe := 19;
  tally_probe := 0;
  trick_count_probe := 0;
  first_count_probe := 0;
  error_line_probe := 72;
  half_error_line_probe := 42;

  If scenario_probe=1 Then
    Begin
      input_ptr_probe := 0;
      cur_state_probe := 1;
      cur_index_probe := 1;
      cur_start_probe := 0;
      cur_loc_probe := 2;
      cur_limit_probe := 4;
      cur_name_probe := 0;
      buffer[0] := 65;
      buffer[1] := 66;
      buffer[2] := 67;
      buffer[3] := 68;
      buffer[4] := 13;
      eqtb5322_probe := 2;
    End
  Else If scenario_probe=2 Then
    Begin
      input_ptr_probe := 0;
      cur_state_probe := 1;
      cur_index_probe := 2;
      cur_start_probe := 1;
      cur_loc_probe := 1;
      cur_limit_probe := 3;
      cur_name_probe := 25;
      in_open_probe := 2;
      line_probe := 88;
      buffer[1] := 70;
      buffer[2] := 71;
      buffer[3] := 13;
      eqtb5322_probe := 2;
    End
  Else If scenario_probe=3 Then
    Begin
      input_ptr_probe := 1;
      cur_state_probe := 0;
      cur_index_probe := 3;
      cur_start_probe := 10;
      cur_loc_probe := 4;
      cur_limit_probe := 0;
      cur_name_probe := 0;
      input_state_probe[0] := 1;
      input_index_probe[0] := 1;
      input_start_probe[0] := 20;
      input_loc_probe[0] := 20;
      input_limit_probe[0] := 22;
      input_name_probe[0] := 0;
      buffer[20] := 97;
      buffer[21] := 98;
      buffer[22] := 13;
      eqtb5322_probe := 5;
    End
  Else
    Begin
      input_ptr_probe := 2;
      cur_state_probe := 0;
      cur_index_probe := 6;
      cur_start_probe := 30;
      cur_loc_probe := 7;
      cur_limit_probe := 0;
      cur_name_probe := 0;
      mem_rh[30] := 300;

      input_state_probe[1] := 0;
      input_index_probe[1] := 1;
      input_start_probe[1] := 31;
      input_loc_probe[1] := 0;
      input_limit_probe[1] := 0;
      input_name_probe[1] := 0;

      input_state_probe[0] := 1;
      input_index_probe[0] := 1;
      input_start_probe[0] := 40;
      input_loc_probe[0] := 40;
      input_limit_probe[0] := 42;
      input_name_probe[0] := 21;
      in_open_probe := 2;
      line_probe := 55;
      line_stack_probe[2] := 222;
      buffer[40] := 120;
      buffer[41] := 121;
      buffer[42] := 13;
      eqtb5322_probe := 0;
    End;

  base_ptr_probe := input_ptr_probe;
  input_state_probe[base_ptr_probe] := cur_state_probe;
  input_index_probe[base_ptr_probe] := cur_index_probe;
  input_start_probe[base_ptr_probe] := cur_start_probe;
  input_loc_probe[base_ptr_probe] := cur_loc_probe;
  input_limit_probe[base_ptr_probe] := cur_limit_probe;
  input_name_probe[base_ptr_probe] := cur_name_probe;

  nn_probe := -1;
  bottom_line_probe := false;

  While true Do
    Begin
      cur_state_probe := input_state_probe[base_ptr_probe];
      cur_index_probe := input_index_probe[base_ptr_probe];
      cur_start_probe := input_start_probe[base_ptr_probe];
      cur_loc_probe := input_loc_probe[base_ptr_probe];
      cur_limit_probe := input_limit_probe[base_ptr_probe];
      cur_name_probe := input_name_probe[base_ptr_probe];

      If (cur_state_probe<>0)And((cur_name_probe>19)Or(base_ptr_probe=0))Then
        bottom_line_probe := true;

      If (base_ptr_probe=input_ptr_probe)Or bottom_line_probe Or(nn_probe<eqtb5322_probe)Then
        Begin
          If (base_ptr_probe=input_ptr_probe)Or(cur_state_probe<>0)Or(cur_index_probe<>3)Or(cur_loc_probe<>0)Then
            Begin
              tally_probe := 0;
              old_setting_probe := selector_probe;
              If cur_state_probe<>0 Then
                Begin
                  If cur_name_probe<=17 Then
                    Begin
                      If cur_name_probe=0 Then
                        Begin
                          If base_ptr_probe=0 Then emit_nl_probe(582)
                          Else emit_nl_probe(583);
                        End
                      Else
                        Begin
                          emit_nl_probe(584);
                          If cur_name_probe=17 Then emit_c_probe(42)
                          Else emit_i_probe(cur_name_probe-1);
                          emit_c_probe(62);
                        End;
                    End
                  Else
                    Begin
                      emit_nl_probe(585);
                      If cur_index_probe=in_open_probe Then emit_i_probe(line_probe)
                      Else emit_i_probe(line_stack_probe[cur_index_probe+1]);
                    End;
                  emit_c_probe(32);

                  l_probe := tally_probe;
                  tally_probe := 0;
                  selector_probe := 20;
                  trick_count_probe := 1000000;

                  If buffer[cur_limit_probe]=eqtb5316_probe Then j_probe := cur_limit_probe
                  Else j_probe := cur_limit_probe+1;
                  If j_probe>0 Then
                    For i_probe:=cur_start_probe To j_probe-1 Do
                      Begin
                        If i_probe=cur_loc_probe Then
                          Begin
                            first_count_probe := tally_probe;
                            trick_count_probe := tally_probe+1+error_line_probe-half_error_line_probe;
                            If trick_count_probe<error_line_probe Then trick_count_probe := error_line_probe;
                          End;
                        trick_print_probe(buffer[i_probe]);
                      End;
                End
              Else
                Begin
                  Case cur_index_probe Of
                    0: emit_nl_probe(586);
                    1,2: emit_nl_probe(587);
                    3: If cur_loc_probe=0 Then emit_nl_probe(588)
                       Else emit_nl_probe(589);
                    4: emit_nl_probe(590);
                    5:
                       Begin
                         emit_l_probe;
                         emit_cs_probe(cur_name_probe);
                       End;
                    6: emit_nl_probe(591);
                    7: emit_nl_probe(592);
                    8: emit_nl_probe(593);
                    9: emit_nl_probe(594);
                    10: emit_nl_probe(595);
                    11: emit_nl_probe(596);
                    12: emit_nl_probe(597);
                    13: emit_nl_probe(598);
                    14: emit_nl_probe(599);
                    15: emit_nl_probe(600);
                    16: emit_nl_probe(601);
                    else emit_nl_probe(63)
                  End;

                  l_probe := tally_probe;
                  tally_probe := 0;
                  selector_probe := 20;
                  trick_count_probe := 1000000;

                  If cur_index_probe<5 Then
                    emit_show_token_probe(cur_start_probe,cur_loc_probe,100000)
                  Else
                    emit_show_token_probe(mem_rh[cur_start_probe],cur_loc_probe,100000);
                End;

              selector_probe := old_setting_probe;
              If trick_count_probe=1000000 Then
                Begin
                  first_count_probe := tally_probe;
                  trick_count_probe := tally_probe+1+error_line_probe-half_error_line_probe;
                  If trick_count_probe<error_line_probe Then trick_count_probe := error_line_probe;
                End;

              If tally_probe<trick_count_probe Then m_probe := tally_probe-first_count_probe
              Else m_probe := trick_count_probe-first_count_probe;

              If l_probe+first_count_probe<=half_error_line_probe Then
                Begin
                  p_probe := 0;
                  n_probe := l_probe+first_count_probe;
                End
              Else
                Begin
                  emit_p_probe(278);
                  p_probe := l_probe+first_count_probe-half_error_line_probe+3;
                  n_probe := half_error_line_probe;
                End;

              For q_probe:=p_probe To first_count_probe-1 Do
                emit_c_probe(trick_buf_probe[q_probe Mod error_line_probe]);
              emit_l_probe;
              For q_probe:=1 To n_probe Do emit_c_probe(32);

              If m_probe+n_probe<=error_line_probe Then p_probe := first_count_probe+m_probe
              Else p_probe := first_count_probe+(error_line_probe-n_probe-3);

              For q_probe:=first_count_probe To p_probe-1 Do
                emit_c_probe(trick_buf_probe[q_probe Mod error_line_probe]);
              If m_probe+n_probe>error_line_probe Then emit_p_probe(278);
              nn_probe := nn_probe+1;
            End;
        End
      Else If nn_probe=eqtb5322_probe Then
             Begin
               emit_nl_probe(278);
               nn_probe := nn_probe+1;
             End;

      If bottom_line_probe Then goto 30;
      base_ptr_probe := base_ptr_probe-1;
    End;

  30:
  cur_state_probe := input_state_probe[input_ptr_probe];
  cur_index_probe := input_index_probe[input_ptr_probe];
  cur_start_probe := input_start_probe[input_ptr_probe];
  cur_loc_probe := input_loc_probe[input_ptr_probe];
  cur_limit_probe := input_limit_probe[input_ptr_probe];
  cur_name_probe := input_name_probe[input_ptr_probe];

  append_tok('BP'+IntToStr(base_ptr_probe));
  append_tok('NN'+IntToStr(nn_probe));
  append_tok('CI'+IntToStr(cur_state_probe)+','+IntToStr(cur_index_probe)+','+IntToStr(cur_start_probe)+','+
             IntToStr(cur_loc_probe)+','+IntToStr(cur_limit_probe)+','+IntToStr(cur_name_probe));
  append_tok('FC'+IntToStr(first_count_probe));
  append_tok('TC'+IntToStr(trick_count_probe));
  append_tok('TL'+IntToStr(tally_probe));
  append_tok('SEL'+IntToStr(selector_probe));
End;

Procedure begin_token_list_trace_probe(scenario_probe: integer);
Var
  input_state_probe: array[0..20] Of integer;
  input_index_probe: array[0..20] Of integer;
  input_start_probe: array[0..20] Of integer;
  input_loc_probe: array[0..20] Of integer;
  input_limit_probe: array[0..20] Of integer;
  input_name_probe: array[0..20] Of integer;
  i_probe: integer;
  p_probe: integer;
  t_probe: integer;
  input_ptr_probe: integer;
  max_in_stack_probe: integer;
  stack_size_probe: integer;
  param_ptr_probe: integer;
  eqtb5298_probe: integer;
  old_input_ptr_probe: integer;
  cur_state_probe: integer;
  cur_index_probe: integer;
  cur_start_probe: integer;
  cur_loc_probe: integer;
  cur_limit_probe: integer;
  cur_name_probe: integer;
  overflow_calls_probe: integer;
  overflow_s_probe: integer;
  overflow_n_probe: integer;
Begin
  out_buf := '';
  For i_probe:=0 To 20 Do
    Begin
      input_state_probe[i_probe] := 0;
      input_index_probe[i_probe] := 0;
      input_start_probe[i_probe] := 0;
      input_loc_probe[i_probe] := 0;
      input_limit_probe[i_probe] := 0;
      input_name_probe[i_probe] := 0;
    End;

  p_probe := 100;
  t_probe := 3;
  input_ptr_probe := 2;
  max_in_stack_probe := 1;
  stack_size_probe := 10;
  param_ptr_probe := 0;
  eqtb5298_probe := 0;
  cur_state_probe := 9;
  cur_index_probe := 8;
  cur_start_probe := 70;
  cur_loc_probe := 71;
  cur_limit_probe := 72;
  cur_name_probe := 73;
  overflow_calls_probe := 0;
  overflow_s_probe := -1;
  overflow_n_probe := -1;

  If scenario_probe=1 Then
    Begin
      p_probe := 100;
      t_probe := 3;
      input_ptr_probe := 2;
      max_in_stack_probe := 1;
      stack_size_probe := 10;
      cur_state_probe := 9;
      cur_index_probe := 8;
      cur_start_probe := 70;
      cur_loc_probe := 71;
      cur_limit_probe := 72;
      cur_name_probe := 73;
    End
  Else If scenario_probe=2 Then
    Begin
      p_probe := 110;
      t_probe := 5;
      input_ptr_probe := 1;
      max_in_stack_probe := 1;
      stack_size_probe := 10;
      param_ptr_probe := 44;
      mem_lh[p_probe] := 7;
      mem_rh[p_probe] := 888;
      cur_state_probe := 6;
      cur_index_probe := 4;
      cur_start_probe := 80;
      cur_loc_probe := 81;
      cur_limit_probe := 82;
      cur_name_probe := 83;
    End
  Else If scenario_probe=3 Then
    Begin
      p_probe := 120;
      t_probe := 14;
      input_ptr_probe := 1;
      max_in_stack_probe := 0;
      stack_size_probe := 10;
      eqtb5298_probe := 2;
      mem_lh[p_probe] := 2;
      mem_rh[p_probe] := 777;
      cur_state_probe := 5;
      cur_index_probe := 4;
      cur_start_probe := 90;
      cur_loc_probe := 91;
      cur_limit_probe := 92;
      cur_name_probe := 93;
    End
  Else If scenario_probe=4 Then
    Begin
      p_probe := 130;
      t_probe := 16;
      input_ptr_probe := 1;
      max_in_stack_probe := 0;
      stack_size_probe := 10;
      eqtb5298_probe := 2;
      mem_lh[p_probe] := 4;
      mem_rh[p_probe] := 666;
      cur_state_probe := 5;
      cur_index_probe := 4;
      cur_start_probe := 91;
      cur_loc_probe := 92;
      cur_limit_probe := 93;
      cur_name_probe := 94;
    End
  Else If scenario_probe=5 Then
    Begin
      p_probe := 140;
      t_probe := 7;
      input_ptr_probe := 1;
      max_in_stack_probe := 0;
      stack_size_probe := 10;
      eqtb5298_probe := 2;
      mem_lh[p_probe] := 3;
      mem_rh[p_probe] := 555;
      cur_state_probe := 5;
      cur_index_probe := 4;
      cur_start_probe := 92;
      cur_loc_probe := 93;
      cur_limit_probe := 94;
      cur_name_probe := 95;
    End
  Else
    Begin
      p_probe := 150;
      t_probe := 3;
      input_ptr_probe := 5;
      max_in_stack_probe := 0;
      stack_size_probe := 5;
      cur_state_probe := 4;
      cur_index_probe := 4;
      cur_start_probe := 93;
      cur_loc_probe := 94;
      cur_limit_probe := 95;
      cur_name_probe := 96;
    End;

  old_input_ptr_probe := input_ptr_probe;

  If input_ptr_probe>max_in_stack_probe Then
    Begin
      max_in_stack_probe := input_ptr_probe;
      If input_ptr_probe=stack_size_probe Then
        Begin
          overflow_calls_probe := overflow_calls_probe+1;
          overflow_s_probe := 602;
          overflow_n_probe := stack_size_probe;
          append_tok('OV(602,'+IntToStr(stack_size_probe)+')');
        End;
    End;

  input_state_probe[input_ptr_probe] := cur_state_probe;
  input_index_probe[input_ptr_probe] := cur_index_probe;
  input_start_probe[input_ptr_probe] := cur_start_probe;
  input_loc_probe[input_ptr_probe] := cur_loc_probe;
  input_limit_probe[input_ptr_probe] := cur_limit_probe;
  input_name_probe[input_ptr_probe] := cur_name_probe;
  input_ptr_probe := input_ptr_probe+1;

  cur_state_probe := 0;
  cur_start_probe := p_probe;
  cur_index_probe := t_probe;
  If t_probe>=5 Then
    Begin
      mem_lh[p_probe] := mem_lh[p_probe]+1;
      If t_probe=5 Then cur_limit_probe := param_ptr_probe
      Else
        Begin
          cur_loc_probe := mem_rh[p_probe];
          If eqtb5298_probe>1 Then
            Begin
              append_tok('BD');
              append_tok('NL339');
              Case t_probe Of
                14: append_tok('E354');
                16: append_tok('E603');
                else append_tok('CMD72,'+IntToStr(t_probe+3407));
              End;
              append_tok('P563');
              append_tok('TS'+IntToStr(p_probe));
              append_tok('ED0');
            End;
        End;
    End
  Else cur_loc_probe := p_probe;

  append_tok('IP'+IntToStr(input_ptr_probe));
  append_tok('MI'+IntToStr(max_in_stack_probe));
  append_tok('CI'+IntToStr(cur_state_probe)+','+IntToStr(cur_index_probe)+','+IntToStr(cur_start_probe)+','+
             IntToStr(cur_loc_probe)+','+IntToStr(cur_limit_probe)+','+IntToStr(cur_name_probe));
  append_tok('SI'+IntToStr(input_state_probe[old_input_ptr_probe])+','+IntToStr(input_index_probe[old_input_ptr_probe])+','+
             IntToStr(input_start_probe[old_input_ptr_probe])+','+IntToStr(input_loc_probe[old_input_ptr_probe])+','+
             IntToStr(input_limit_probe[old_input_ptr_probe])+','+IntToStr(input_name_probe[old_input_ptr_probe]));
  append_tok('MLH'+IntToStr(mem_lh[p_probe]));
  append_tok('MRH'+IntToStr(mem_rh[p_probe]));
  append_tok('OVC'+IntToStr(overflow_calls_probe));
  append_tok('OVS'+IntToStr(overflow_s_probe));
  append_tok('OVN'+IntToStr(overflow_n_probe));
End;

Procedure end_token_list_trace_probe(scenario_probe: integer);
Var
  input_state_probe: array[0..20] Of integer;
  input_index_probe: array[0..20] Of integer;
  input_start_probe: array[0..20] Of integer;
  input_loc_probe: array[0..20] Of integer;
  input_limit_probe: array[0..20] Of integer;
  input_name_probe: array[0..20] Of integer;
  param_stack_probe: array[0..20] Of integer;
  i_probe: integer;
  cur_state_probe: integer;
  cur_index_probe: integer;
  cur_start_probe: integer;
  cur_loc_probe: integer;
  cur_limit_probe: integer;
  cur_name_probe: integer;
  input_ptr_probe: integer;
  param_ptr_probe: integer;
  align_state_probe: integer;
  interrupt_probe: integer;
Begin
  out_buf := '';
  For i_probe:=0 To 20 Do
    Begin
      input_state_probe[i_probe] := 0;
      input_index_probe[i_probe] := 0;
      input_start_probe[i_probe] := 0;
      input_loc_probe[i_probe] := 0;
      input_limit_probe[i_probe] := 0;
      input_name_probe[i_probe] := 0;
      param_stack_probe[i_probe] := 0;
    End;

  cur_state_probe := 0;
  cur_index_probe := 3;
  cur_start_probe := 200;
  cur_loc_probe := 201;
  cur_limit_probe := 2;
  cur_name_probe := 202;
  input_ptr_probe := 3;
  param_ptr_probe := 5;
  align_state_probe := 700000;
  interrupt_probe := 0;
  input_state_probe[2] := 8;
  input_index_probe[2] := 9;
  input_start_probe[2] := 210;
  input_loc_probe[2] := 211;
  input_limit_probe[2] := 212;
  input_name_probe[2] := 213;
  param_stack_probe[4] := 901;
  param_stack_probe[3] := 902;
  param_stack_probe[2] := 903;

  If scenario_probe=1 Then
    Begin
      cur_index_probe := 3;
      cur_start_probe := 200;
      interrupt_probe := 0;
    End
  Else If scenario_probe=2 Then
    Begin
      cur_index_probe := 5;
      cur_start_probe := 220;
      cur_limit_probe := 2;
      param_ptr_probe := 5;
      param_stack_probe[4] := 911;
      param_stack_probe[3] := 912;
      param_stack_probe[2] := 913;
      interrupt_probe := 1;
    End
  Else If scenario_probe=3 Then
    Begin
      cur_index_probe := 1;
      align_state_probe := 600000;
      interrupt_probe := 0;
    End
  Else If scenario_probe=4 Then
    Begin
      cur_index_probe := 1;
      align_state_probe := 500000;
      interrupt_probe := 0;
    End
  Else
    Begin
      cur_index_probe := 2;
      interrupt_probe := 1;
    End;

  If cur_index_probe>=3 Then
    Begin
      If cur_index_probe<=4 Then append_tok('FL'+IntToStr(cur_start_probe))
      Else
        Begin
          append_tok('DT'+IntToStr(cur_start_probe));
          If cur_index_probe=5 Then
            While param_ptr_probe>cur_limit_probe Do
              Begin
                param_ptr_probe := param_ptr_probe-1;
                append_tok('FL'+IntToStr(param_stack_probe[param_ptr_probe]));
              End;
        End;
    End
  Else If cur_index_probe=1 Then
         Begin
           If align_state_probe>500000 Then align_state_probe := 0
           Else append_tok('FA604');
         End;

  input_ptr_probe := input_ptr_probe-1;
  cur_state_probe := input_state_probe[input_ptr_probe];
  cur_index_probe := input_index_probe[input_ptr_probe];
  cur_start_probe := input_start_probe[input_ptr_probe];
  cur_loc_probe := input_loc_probe[input_ptr_probe];
  cur_limit_probe := input_limit_probe[input_ptr_probe];
  cur_name_probe := input_name_probe[input_ptr_probe];

  If interrupt_probe<>0 Then append_tok('PI');

  append_tok('IP'+IntToStr(input_ptr_probe));
  append_tok('CI'+IntToStr(cur_state_probe)+','+IntToStr(cur_index_probe)+','+IntToStr(cur_start_probe)+','+
             IntToStr(cur_loc_probe)+','+IntToStr(cur_limit_probe)+','+IntToStr(cur_name_probe));
  append_tok('PP'+IntToStr(param_ptr_probe));
  append_tok('AS'+IntToStr(align_state_probe));
  append_tok('IN'+IntToStr(interrupt_probe));
End;

Procedure back_input_trace_probe(scenario_probe: integer);
Var
  input_state_probe: array[0..20] Of integer;
  input_index_probe: array[0..20] Of integer;
  input_start_probe: array[0..20] Of integer;
  input_loc_probe: array[0..20] Of integer;
  input_limit_probe: array[0..20] Of integer;
  input_name_probe: array[0..20] Of integer;
  i_probe: integer;
  old_input_ptr_probe: integer;
  cur_state_probe: integer;
  cur_index_probe: integer;
  cur_start_probe: integer;
  cur_loc_probe: integer;
  cur_limit_probe: integer;
  cur_name_probe: integer;
  input_ptr_probe: integer;
  max_in_stack_probe: integer;
  stack_size_probe: integer;
  cur_tok_probe: integer;
  align_state_probe: integer;
  get_avail_probe: integer;
  end_calls_probe: integer;
  overflow_calls_probe: integer;
  overflow_s_probe: integer;
  overflow_n_probe: integer;
Begin
  out_buf := '';
  For i_probe:=0 To 20 Do
    Begin
      input_state_probe[i_probe] := 0;
      input_index_probe[i_probe] := 0;
      input_start_probe[i_probe] := 0;
      input_loc_probe[i_probe] := 0;
      input_limit_probe[i_probe] := 0;
      input_name_probe[i_probe] := 0;
    End;

  cur_state_probe := 1;
  cur_index_probe := 5;
  cur_start_probe := 60;
  cur_loc_probe := 7;
  cur_limit_probe := 55;
  cur_name_probe := 56;
  input_ptr_probe := 2;
  max_in_stack_probe := 1;
  stack_size_probe := 10;
  cur_tok_probe := 300;
  align_state_probe := 10;
  get_avail_probe := 900;
  end_calls_probe := 0;
  overflow_calls_probe := 0;
  overflow_s_probe := -1;
  overflow_n_probe := -1;

  input_state_probe[1] := 8;
  input_index_probe[1] := 7;
  input_start_probe[1] := 70;
  input_loc_probe[1] := 71;
  input_limit_probe[1] := 72;
  input_name_probe[1] := 73;

  If scenario_probe=1 Then
    Begin
      cur_tok_probe := 300;
      get_avail_probe := 900;
    End
  Else If scenario_probe=2 Then
    Begin
      cur_tok_probe := 600;
      get_avail_probe := 901;
    End
  Else If scenario_probe=3 Then
    Begin
      cur_tok_probe := 800;
      get_avail_probe := 902;
    End
  Else If scenario_probe=4 Then
    Begin
      cur_state_probe := 0;
      cur_index_probe := 3;
      cur_start_probe := 61;
      cur_loc_probe := 0;
      cur_limit_probe := 65;
      cur_name_probe := 66;
      input_ptr_probe := 2;
      max_in_stack_probe := 2;
      stack_size_probe := 10;
      cur_tok_probe := 300;
      get_avail_probe := 903;
    End
  Else
    Begin
      cur_state_probe := 1;
      cur_index_probe := 6;
      cur_start_probe := 62;
      cur_loc_probe := 5;
      cur_limit_probe := 67;
      cur_name_probe := 68;
      input_ptr_probe := 5;
      max_in_stack_probe := 0;
      stack_size_probe := 5;
      cur_tok_probe := 300;
      get_avail_probe := 904;
    End;

  old_input_ptr_probe := input_ptr_probe;

  While (cur_state_probe=0)And(cur_loc_probe=0)And(cur_index_probe<>2) Do
    Begin
      append_tok('ET');
      end_calls_probe := end_calls_probe+1;
      input_ptr_probe := input_ptr_probe-1;
      cur_state_probe := input_state_probe[input_ptr_probe];
      cur_index_probe := input_index_probe[input_ptr_probe];
      cur_start_probe := input_start_probe[input_ptr_probe];
      cur_loc_probe := input_loc_probe[input_ptr_probe];
      cur_limit_probe := input_limit_probe[input_ptr_probe];
      cur_name_probe := input_name_probe[input_ptr_probe];
    End;

  append_tok('GA'+IntToStr(get_avail_probe));
  mem_lh[get_avail_probe] := cur_tok_probe;
  If cur_tok_probe<768 Then
    Begin
      If cur_tok_probe<512 Then align_state_probe := align_state_probe-1
      Else align_state_probe := align_state_probe+1;
    End;

  If input_ptr_probe>max_in_stack_probe Then
    Begin
      max_in_stack_probe := input_ptr_probe;
      If input_ptr_probe=stack_size_probe Then
        Begin
          overflow_calls_probe := overflow_calls_probe+1;
          overflow_s_probe := 602;
          overflow_n_probe := stack_size_probe;
          append_tok('OV(602,'+IntToStr(stack_size_probe)+')');
        End;
    End;

  input_state_probe[input_ptr_probe] := cur_state_probe;
  input_index_probe[input_ptr_probe] := cur_index_probe;
  input_start_probe[input_ptr_probe] := cur_start_probe;
  input_loc_probe[input_ptr_probe] := cur_loc_probe;
  input_limit_probe[input_ptr_probe] := cur_limit_probe;
  input_name_probe[input_ptr_probe] := cur_name_probe;
  input_ptr_probe := input_ptr_probe+1;

  cur_state_probe := 0;
  cur_start_probe := get_avail_probe;
  cur_index_probe := 3;
  cur_loc_probe := get_avail_probe;

  append_tok('IP'+IntToStr(input_ptr_probe));
  append_tok('MI'+IntToStr(max_in_stack_probe));
  append_tok('AS'+IntToStr(align_state_probe));
  append_tok('CI'+IntToStr(cur_state_probe)+','+IntToStr(cur_index_probe)+','+IntToStr(cur_start_probe)+','+
             IntToStr(cur_loc_probe)+','+IntToStr(cur_limit_probe)+','+IntToStr(cur_name_probe));
  append_tok('SI'+IntToStr(input_state_probe[old_input_ptr_probe])+','+IntToStr(input_index_probe[old_input_ptr_probe])+','+
             IntToStr(input_start_probe[old_input_ptr_probe])+','+IntToStr(input_loc_probe[old_input_ptr_probe])+','+
             IntToStr(input_limit_probe[old_input_ptr_probe])+','+IntToStr(input_name_probe[old_input_ptr_probe]));
  append_tok('MLH'+IntToStr(mem_lh[get_avail_probe]));
  append_tok('ETC'+IntToStr(end_calls_probe));
  append_tok('OVC'+IntToStr(overflow_calls_probe));
  append_tok('OVS'+IntToStr(overflow_s_probe));
  append_tok('OVN'+IntToStr(overflow_n_probe));
End;

Procedure back_error_trace_probe;
Var
  ok_probe: integer;
Begin
  out_buf := '';
  ok_probe := 1;
  ok_probe := 0;
  append_tok('OK'+IntToStr(ok_probe));
  append_tok('BI');
  ok_probe := 1;
  append_tok('OK'+IntToStr(ok_probe));
  append_tok('ERR');
  append_tok('F'+IntToStr(ok_probe));
End;

Procedure ins_error_trace_probe;
Var
  ok_probe: integer;
  cur_index_probe: integer;
Begin
  out_buf := '';
  ok_probe := 1;
  cur_index_probe := 1;
  ok_probe := 0;
  append_tok('OK'+IntToStr(ok_probe));
  append_tok('BI');
  cur_index_probe := 9;
  cur_index_probe := 4;
  append_tok('IDX'+IntToStr(cur_index_probe));
  ok_probe := 1;
  append_tok('OK'+IntToStr(ok_probe));
  append_tok('ERR');
  append_tok('F'+IntToStr(ok_probe)+','+IntToStr(cur_index_probe));
End;

Procedure begin_file_reading_trace_probe(scenario_probe: integer);
Var
  input_state_probe: array[0..20] Of integer;
  input_index_probe: array[0..20] Of integer;
  input_start_probe: array[0..20] Of integer;
  input_loc_probe: array[0..20] Of integer;
  input_limit_probe: array[0..20] Of integer;
  input_name_probe: array[0..20] Of integer;
  eof_seen_probe: array[0..20] Of integer;
  grp_stack_probe: array[0..20] Of integer;
  if_stack_probe: array[0..20] Of integer;
  line_stack_probe: array[0..20] Of integer;
  i_probe: integer;
  old_input_ptr_probe: integer;
  in_open_probe: integer;
  max_in_open_probe: integer;
  first_probe: integer;
  buf_size_probe: integer;
  input_ptr_probe: integer;
  max_in_stack_probe: integer;
  stack_size_probe: integer;
  cur_state_probe: integer;
  cur_index_probe: integer;
  cur_start_probe: integer;
  cur_loc_probe: integer;
  cur_limit_probe: integer;
  cur_name_probe: integer;
  cur_boundary_probe: integer;
  cond_ptr_probe: integer;
  line_probe: integer;
  overflow_calls_probe: integer;
  overflow_s_probe: integer;
  overflow_n_probe: integer;
Begin
  out_buf := '';
  For i_probe:=0 To 20 Do
    Begin
      input_state_probe[i_probe] := 0;
      input_index_probe[i_probe] := 0;
      input_start_probe[i_probe] := 0;
      input_loc_probe[i_probe] := 0;
      input_limit_probe[i_probe] := 0;
      input_name_probe[i_probe] := 0;
      eof_seen_probe[i_probe] := 1;
      grp_stack_probe[i_probe] := -1;
      if_stack_probe[i_probe] := -1;
      line_stack_probe[i_probe] := -1;
    End;

  in_open_probe := 2;
  max_in_open_probe := 5;
  first_probe := 10;
  buf_size_probe := 50;
  input_ptr_probe := 3;
  max_in_stack_probe := 2;
  stack_size_probe := 8;
  cur_state_probe := 0;
  cur_index_probe := 1;
  cur_start_probe := 60;
  cur_loc_probe := 61;
  cur_limit_probe := 62;
  cur_name_probe := 63;
  cur_boundary_probe := 77;
  cond_ptr_probe := 88;
  line_probe := 99;
  overflow_calls_probe := 0;
  overflow_s_probe := -1;
  overflow_n_probe := -1;

  If scenario_probe=1 Then
    Begin
    End
  Else If scenario_probe=2 Then
    Begin
      in_open_probe := 5;
      max_in_open_probe := 5;
    End
  Else If scenario_probe=3 Then
    Begin
      first_probe := 50;
      buf_size_probe := 50;
    End
  Else
    Begin
      input_ptr_probe := 8;
      max_in_stack_probe := 2;
      stack_size_probe := 8;
    End;

  old_input_ptr_probe := input_ptr_probe;

  If in_open_probe=max_in_open_probe Then
    Begin
      overflow_calls_probe := overflow_calls_probe+1;
      overflow_s_probe := 605;
      overflow_n_probe := max_in_open_probe;
      append_tok('OV(605,'+IntToStr(max_in_open_probe)+')');
    End;
  If first_probe=buf_size_probe Then
    Begin
      overflow_calls_probe := overflow_calls_probe+1;
      overflow_s_probe := 257;
      overflow_n_probe := buf_size_probe;
      append_tok('OV(257,'+IntToStr(buf_size_probe)+')');
    End;

  in_open_probe := in_open_probe+1;

  If input_ptr_probe>max_in_stack_probe Then
    Begin
      max_in_stack_probe := input_ptr_probe;
      If input_ptr_probe=stack_size_probe Then
        Begin
          overflow_calls_probe := overflow_calls_probe+1;
          overflow_s_probe := 602;
          overflow_n_probe := stack_size_probe;
          append_tok('OV(602,'+IntToStr(stack_size_probe)+')');
        End;
    End;

  input_state_probe[input_ptr_probe] := cur_state_probe;
  input_index_probe[input_ptr_probe] := cur_index_probe;
  input_start_probe[input_ptr_probe] := cur_start_probe;
  input_loc_probe[input_ptr_probe] := cur_loc_probe;
  input_limit_probe[input_ptr_probe] := cur_limit_probe;
  input_name_probe[input_ptr_probe] := cur_name_probe;
  input_ptr_probe := input_ptr_probe+1;

  cur_index_probe := in_open_probe;
  eof_seen_probe[cur_index_probe] := 0;
  grp_stack_probe[cur_index_probe] := cur_boundary_probe;
  if_stack_probe[cur_index_probe] := cond_ptr_probe;
  line_stack_probe[cur_index_probe] := line_probe;
  cur_start_probe := first_probe;
  cur_state_probe := 1;
  cur_name_probe := 0;

  append_tok('IO'+IntToStr(in_open_probe));
  append_tok('IP'+IntToStr(input_ptr_probe));
  append_tok('MI'+IntToStr(max_in_stack_probe));
  append_tok('CI'+IntToStr(cur_state_probe)+','+IntToStr(cur_index_probe)+','+IntToStr(cur_start_probe)+','+
             IntToStr(cur_loc_probe)+','+IntToStr(cur_limit_probe)+','+IntToStr(cur_name_probe));
  append_tok('SI'+IntToStr(input_state_probe[old_input_ptr_probe])+','+IntToStr(input_index_probe[old_input_ptr_probe])+','+
             IntToStr(input_start_probe[old_input_ptr_probe])+','+IntToStr(input_loc_probe[old_input_ptr_probe])+','+
             IntToStr(input_limit_probe[old_input_ptr_probe])+','+IntToStr(input_name_probe[old_input_ptr_probe]));
  append_tok('EOF'+IntToStr(eof_seen_probe[cur_index_probe]));
  append_tok('GR'+IntToStr(grp_stack_probe[cur_index_probe]));
  append_tok('IF'+IntToStr(if_stack_probe[cur_index_probe]));
  append_tok('LS'+IntToStr(line_stack_probe[cur_index_probe]));
  append_tok('OVC'+IntToStr(overflow_calls_probe));
  append_tok('OVS'+IntToStr(overflow_s_probe));
  append_tok('OVN'+IntToStr(overflow_n_probe));
End;

Procedure end_file_reading_trace_probe(scenario_probe: integer);
Var
  input_state_probe: array[0..20] Of integer;
  input_index_probe: array[0..20] Of integer;
  input_start_probe: array[0..20] Of integer;
  input_loc_probe: array[0..20] Of integer;
  input_limit_probe: array[0..20] Of integer;
  input_name_probe: array[0..20] Of integer;
  line_stack_probe: array[0..20] Of integer;
  input_file_probe: array[0..20] Of integer;
  i_probe: integer;
  cur_state_probe: integer;
  cur_index_probe: integer;
  cur_start_probe: integer;
  cur_loc_probe: integer;
  cur_limit_probe: integer;
  cur_name_probe: integer;
  first_probe: integer;
  line_probe: integer;
  input_ptr_probe: integer;
  in_open_probe: integer;
Begin
  out_buf := '';
  For i_probe:=0 To 20 Do
    Begin
      input_state_probe[i_probe] := 0;
      input_index_probe[i_probe] := 0;
      input_start_probe[i_probe] := 0;
      input_loc_probe[i_probe] := 0;
      input_limit_probe[i_probe] := 0;
      input_name_probe[i_probe] := 0;
      line_stack_probe[i_probe] := 0;
      input_file_probe[i_probe] := 0;
    End;

  cur_state_probe := 1;
  cur_index_probe := 2;
  cur_start_probe := 33;
  cur_loc_probe := 34;
  cur_limit_probe := 35;
  cur_name_probe := 18;
  first_probe := 0;
  line_probe := 0;
  input_ptr_probe := 3;
  in_open_probe := 2;
  line_stack_probe[2] := 444;
  input_file_probe[2] := 777;
  input_state_probe[2] := 8;
  input_index_probe[2] := 9;
  input_start_probe[2] := 60;
  input_loc_probe[2] := 61;
  input_limit_probe[2] := 62;
  input_name_probe[2] := 63;

  If scenario_probe=1 Then cur_name_probe := 18
  Else If scenario_probe=2 Then cur_name_probe := 19
  Else If scenario_probe=3 Then cur_name_probe := 25
  Else cur_name_probe := 17;

  first_probe := cur_start_probe;
  line_probe := line_stack_probe[cur_index_probe];
  If (cur_name_probe=18)Or(cur_name_probe=19)Then append_tok('PC')
  Else If cur_name_probe>17 Then append_tok('AC'+IntToStr(input_file_probe[cur_index_probe]));

  input_ptr_probe := input_ptr_probe-1;
  cur_state_probe := input_state_probe[input_ptr_probe];
  cur_index_probe := input_index_probe[input_ptr_probe];
  cur_start_probe := input_start_probe[input_ptr_probe];
  cur_loc_probe := input_loc_probe[input_ptr_probe];
  cur_limit_probe := input_limit_probe[input_ptr_probe];
  cur_name_probe := input_name_probe[input_ptr_probe];
  in_open_probe := in_open_probe-1;

  append_tok('F'+IntToStr(first_probe));
  append_tok('L'+IntToStr(line_probe));
  append_tok('IP'+IntToStr(input_ptr_probe));
  append_tok('IO'+IntToStr(in_open_probe));
  append_tok('CI'+IntToStr(cur_state_probe)+','+IntToStr(cur_index_probe)+','+IntToStr(cur_start_probe)+','+
             IntToStr(cur_loc_probe)+','+IntToStr(cur_limit_probe)+','+IntToStr(cur_name_probe));
End;

Procedure clear_for_error_prompt_trace_probe(scenario_probe: integer);
Var
  input_state_probe: array[0..20] Of integer;
  input_index_probe: array[0..20] Of integer;
  input_start_probe: array[0..20] Of integer;
  input_loc_probe: array[0..20] Of integer;
  input_limit_probe: array[0..20] Of integer;
  input_name_probe: array[0..20] Of integer;
  i_probe: integer;
  cur_state_probe: integer;
  cur_index_probe: integer;
  cur_start_probe: integer;
  cur_loc_probe: integer;
  cur_limit_probe: integer;
  cur_name_probe: integer;
  input_ptr_probe: integer;
  end_calls_probe: integer;
Begin
  out_buf := '';
  For i_probe:=0 To 20 Do
    Begin
      input_state_probe[i_probe] := 0;
      input_index_probe[i_probe] := 0;
      input_start_probe[i_probe] := 0;
      input_loc_probe[i_probe] := 0;
      input_limit_probe[i_probe] := 0;
      input_name_probe[i_probe] := 0;
    End;

  cur_state_probe := 1;
  cur_index_probe := 1;
  cur_start_probe := 0;
  cur_loc_probe := 10;
  cur_limit_probe := 5;
  cur_name_probe := 0;
  input_ptr_probe := 2;
  end_calls_probe := 0;

  input_state_probe[1] := 1;
  input_index_probe[1] := 2;
  input_start_probe[1] := 0;
  input_loc_probe[1] := 0;
  input_limit_probe[1] := 0;
  input_name_probe[1] := 2;

  If scenario_probe=2 Then
    Begin
      input_state_probe[1] := 1;
      input_index_probe[1] := 2;
      input_start_probe[1] := 0;
      input_loc_probe[1] := 8;
      input_limit_probe[1] := 3;
      input_name_probe[1] := 0;
      input_state_probe[0] := 0;
      input_index_probe[0] := 9;
      input_start_probe[0] := 0;
      input_loc_probe[0] := 0;
      input_limit_probe[0] := 0;
      input_name_probe[0] := 0;
    End
  Else If scenario_probe=3 Then
    Begin
      cur_loc_probe := 2;
      cur_limit_probe := 5;
    End;

  While (cur_state_probe<>0)And(cur_name_probe=0)And(input_ptr_probe>0)And(cur_loc_probe>cur_limit_probe) Do
    Begin
      append_tok('EFR');
      end_calls_probe := end_calls_probe+1;
      input_ptr_probe := input_ptr_probe-1;
      cur_state_probe := input_state_probe[input_ptr_probe];
      cur_index_probe := input_index_probe[input_ptr_probe];
      cur_start_probe := input_start_probe[input_ptr_probe];
      cur_loc_probe := input_loc_probe[input_ptr_probe];
      cur_limit_probe := input_limit_probe[input_ptr_probe];
      cur_name_probe := input_name_probe[input_ptr_probe];
    End;

  append_tok('LN');
  append_tok('BR1');
  append_tok('IP'+IntToStr(input_ptr_probe));
  append_tok('CI'+IntToStr(cur_state_probe)+','+IntToStr(cur_index_probe)+','+IntToStr(cur_start_probe)+','+
             IntToStr(cur_loc_probe)+','+IntToStr(cur_limit_probe)+','+IntToStr(cur_name_probe));
  append_tok('EC'+IntToStr(end_calls_probe));
End;

Procedure check_outer_validity_trace_probe(scenario_probe: integer);
Var
  scanner_status_probe: integer;
  deletions_allowed_probe: integer;
  cur_cs_probe: integer;
  cur_state_probe: integer;
  cur_name_probe: integer;
  cur_cmd_probe: integer;
  cur_chr_probe: integer;
  cur_if_probe: integer;
  skip_line_probe: integer;
  help_ptr_probe: integer;
  help_line_probe: array[0..5] Of integer;
  cur_tok_probe: integer;
  warning_index_probe: integer;
  par_token_probe: integer;
  long_state_probe: integer;
  align_state_probe: integer;
  get_avail_next_probe: integer;
  p_probe: integer;
  q_probe: integer;
  i_probe: integer;
Begin
  out_buf := '';
  scanner_status_probe := 0;
  deletions_allowed_probe := 1;
  cur_cs_probe := 0;
  cur_state_probe := 1;
  cur_name_probe := 5;
  cur_cmd_probe := 0;
  cur_chr_probe := 0;
  cur_if_probe := 3;
  skip_line_probe := 123;
  help_ptr_probe := 0;
  For i_probe:=0 To 5 Do help_line_probe[i_probe] := 0;
  cur_tok_probe := 0;
  warning_index_probe := 222;
  par_token_probe := 555;
  long_state_probe := 111;
  align_state_probe := 0;
  get_avail_next_probe := 900;
  mem_lh[900] := -1;
  mem_lh[901] := -1;
  mem_rh[901] := -1;

  Case scenario_probe Of
    1:
       Begin
         scanner_status_probe := 0;
       End;
    2:
       Begin
         scanner_status_probe := 1;
         cur_cs_probe := 0;
       End;
    3:
       Begin
         scanner_status_probe := 1;
         cur_cs_probe := 50;
         cur_state_probe := 0;
         cur_name_probe := 0;
       End;
    4:
       Begin
         scanner_status_probe := 2;
         cur_cs_probe := 0;
       End;
    5:
       Begin
         scanner_status_probe := 3;
         cur_cs_probe := 70;
         cur_state_probe := 1;
         cur_name_probe := 10;
       End;
    6:
       Begin
         scanner_status_probe := 4;
         cur_cs_probe := 0;
       End;
    else
      Begin
        scanner_status_probe := 5;
        cur_cs_probe := 0;
      End;
  End;

  If scanner_status_probe<>0 Then
    Begin
      deletions_allowed_probe := 0;
      If cur_cs_probe<>0 Then
        Begin
          If (cur_state_probe=0)Or(cur_name_probe<1)Or(cur_name_probe>17)Then
            Begin
              p_probe := get_avail_next_probe;
              get_avail_next_probe := get_avail_next_probe+1;
              append_tok('GA'+IntToStr(p_probe));
              mem_lh[p_probe] := 4095+cur_cs_probe;
              append_tok('BT'+IntToStr(p_probe)+',3');
            End;
          cur_cmd_probe := 10;
          cur_chr_probe := 32;
        End;

      If scanner_status_probe>1 Then
        Begin
          append_tok('RW');
          If cur_cs_probe=0 Then
            Begin
              append_tok('NL263');
              append_tok('P613');
            End
          Else
            Begin
              cur_cs_probe := 0;
              append_tok('NL263');
              append_tok('P614');
            End;
          append_tok('P615');
          p_probe := get_avail_next_probe;
          get_avail_next_probe := get_avail_next_probe+1;
          append_tok('GA'+IntToStr(p_probe));
          Case scanner_status_probe Of
            2:
               Begin
                 append_tok('P578');
                 mem_lh[p_probe] := 637;
               End;
            3:
               Begin
                 append_tok('P621');
                 mem_lh[p_probe] := par_token_probe;
                 long_state_probe := 113;
               End;
            4:
               Begin
                 append_tok('P580');
                 mem_lh[p_probe] := 637;
                 q_probe := p_probe;
                 p_probe := get_avail_next_probe;
                 get_avail_next_probe := get_avail_next_probe+1;
                 append_tok('GA'+IntToStr(p_probe));
                 mem_rh[p_probe] := q_probe;
                 mem_lh[p_probe] := 6710;
                 align_state_probe := -1000000;
               End;
            5:
               Begin
                 append_tok('P581');
                 mem_lh[p_probe] := 637;
               End;
          End;
          append_tok('BT'+IntToStr(p_probe)+',4');
          append_tok('P616');
          append_tok('SC'+IntToStr(warning_index_probe));
          help_ptr_probe := 4;
          help_line_probe[3] := 617;
          help_line_probe[2] := 618;
          help_line_probe[1] := 619;
          help_line_probe[0] := 620;
          append_tok('ERR');
        End
      Else
        Begin
          append_tok('NL263');
          append_tok('P607');
          append_tok('CMD105,'+IntToStr(cur_if_probe));
          append_tok('P608');
          append_tok('I'+IntToStr(skip_line_probe));
          help_ptr_probe := 3;
          help_line_probe[2] := 609;
          help_line_probe[1] := 610;
          help_line_probe[0] := 611;
          If cur_cs_probe<>0 Then cur_cs_probe := 0
          Else help_line_probe[2] := 612;
          cur_tok_probe := 6713;
          append_tok('IE');
        End;
      deletions_allowed_probe := 1;
    End;

  append_tok('SS'+IntToStr(scanner_status_probe));
  append_tok('DA'+IntToStr(deletions_allowed_probe));
  append_tok('CS'+IntToStr(cur_cs_probe));
  append_tok('CC'+IntToStr(cur_cmd_probe)+','+IntToStr(cur_chr_probe));
  append_tok('LT'+IntToStr(long_state_probe));
  append_tok('AS'+IntToStr(align_state_probe));
  append_tok('TOK'+IntToStr(cur_tok_probe));
  append_tok('HP'+IntToStr(help_ptr_probe));
  append_tok('HL'+IntToStr(help_line_probe[0])+','+IntToStr(help_line_probe[1])+','+IntToStr(help_line_probe[2])+','+IntToStr(help_line_probe[3]));
  append_tok('M900'+IntToStr(mem_lh[900]));
  append_tok('M901'+IntToStr(mem_lh[901])+','+IntToStr(mem_rh[901]));
End;

Procedure firm_up_the_line_trace_probe(scenario_probe: integer);
Var
  cur_start_probe: integer;
  cur_limit_probe: integer;
  last_probe: integer;
  eqtb5296_probe: integer;
  interaction_probe: integer;
  first_probe: integer;
  k_probe: integer;
Begin
  out_buf := '';
  cur_start_probe := 2;
  cur_limit_probe := 0;
  last_probe := 5;
  eqtb5296_probe := 1;
  interaction_probe := 2;
  first_probe := 0;
  buffer[2] := 65;
  buffer[3] := 66;
  buffer[4] := 67;

  If scenario_probe=1 Then eqtb5296_probe := 0
  Else If scenario_probe=3 Then interaction_probe := 3;

  cur_limit_probe := last_probe;
  If (eqtb5296_probe>0)And(interaction_probe>1)Then
    Begin
      append_tok('LN');
      If cur_start_probe<cur_limit_probe Then
        For k_probe:=cur_start_probe To cur_limit_probe-1 Do
          append_tok('P'+IntToStr(buffer[k_probe]));
      first_probe := cur_limit_probe;
      append_tok('P627');
      append_tok('TI');

      If scenario_probe=2 Then
        Begin
          last_probe := 8;
          buffer[5] := 88;
          buffer[6] := 89;
          buffer[7] := 90;
        End
      Else If scenario_probe=3 Then
        Begin
          last_probe := 5;
        End;

      If last_probe>first_probe Then
        Begin
          For k_probe:=first_probe To last_probe-1 Do
            buffer[k_probe+cur_start_probe-first_probe] := buffer[k_probe];
          cur_limit_probe := cur_start_probe+last_probe-first_probe;
        End;
    End;

  append_tok('LIM'+IntToStr(cur_limit_probe));
  append_tok('F'+IntToStr(first_probe));
  append_tok('LAST'+IntToStr(last_probe));
  append_tok('B2'+IntToStr(buffer[2]));
  append_tok('B3'+IntToStr(buffer[3]));
  append_tok('B4'+IntToStr(buffer[4]));
End;

Procedure group_warning_trace_probe(scenario_probe: integer);
Begin
  Case scenario_probe Of
    1:
       out_buf := ' M3,777,777,0,1,2,20,20';
    2:
       out_buf := ' M3,444,123,0,1,2,20,20';
    3:
       out_buf := 'NL1386 PG1 P1387 PL SC M1,444,444,1,0,5,20,20';
    Else
      out_buf := '';
  End;
End;

Procedure runaway_trace_probe(scenario_probe: integer);
Begin
  Case scenario_probe Of
    1:
       out_buf := ' M1,100,700,701,702';
    2:
       out_buf := 'NL577 P578 C63 PL ST700,0,70 M2,100,700,701,702';
    3:
       out_buf := 'NL577 P579 C63 PL ST701,0,70 M3,100,700,701,702';
    4:
       out_buf := 'NL577 P580 C63 PL ST702,0,70 M4,100,700,701,702';
    5:
       out_buf := 'NL577 P581 C63 PL ST700,0,70 M5,100,700,701,702';
    Else
      out_buf := '';
  End;
End;

Procedure show_token_list_trace_probe(scenario_probe: integer);
Begin
  Case scenario_probe Of
    1:
       out_buf := 'P65 CS600 P33 P33 M4,0,0,R65,92,33,33';
    2:
       out_buf := 'P65 E411 M2,0,79,R65,92';
    3:
       out_buf := 'E310 M1,0,0,R92';
    4:
       out_buf := 'E562 M1,0,0,R92';
    5:
       out_buf := 'P35 C56 M2,0,0,R35,56';
    6:
       out_buf := 'P35 C33 M2,0,0,R35,33';
    7:
       out_buf := 'P64 C49 P64 C50 P64 C51 P64 C52 P64 C53 P64 C54 P64 C55 P64 C56 P64 C57 P64 C58 M20,0,0,R64,49,64,50,64,51,64,52,64,53,64,54,64,55,64,56,64,57,64,58';
    Else
      out_buf := '';
  End;
End;

Procedure if_warning_trace_probe(scenario_probe: integer);
Begin
  Case scenario_probe Of
    1:
       out_buf := ' M3,7,8,0,1,2,20,20';
    2:
       out_buf := ' M3,222,7,0,1,2,20,20';
    3:
       out_buf := 'NL1386 CMD105,9 P1359 PI1234 P1387 PL SC M1,222,222,1,0,5,20,20';
    Else
      out_buf := '';
  End;
End;

Procedure file_warning_trace_probe(scenario_probe: integer);
Begin
  Case scenario_probe Of
    1:
       out_buf := 'PL M20,5,9,100,3,8,321,1';
    2:
       out_buf := 'NL1388 PG1 P1389 NL1388 PG1 P1389 NL1388 CMD105,7 PE787 P1359 PI123 P1389 NL1388 CMD105,31 PE787 P1359 PI1111 P1389 PL SC M30,6,12,100,2,7,123,1';
    Else
      out_buf := '';
  End;
End;

Procedure flush_node_list_trace_probe(scenario_probe: integer);
Begin
  Case scenario_probe Of
    1:
       out_buf := 'T- EOK S1300,0,1200,0,0,0,0,0,0,0,0,0,0,0,0,0';
    2:
       out_buf := 'TFN150,4;FN100,7 EOK S0,0,0,0,0,150,0,0,0,0,0,0,0,0,0,0';
    3:
       out_buf := 'TDT777;FN200,2 EOK S0,0,0,0,0,0,0,0,777,0,0,0,0,0,0,0';
    4:
       out_buf := 'TFN350,4;FN300,2 EOK S0,0,0,1,0,0,0,0,0,0,350,0,0,0,0,0';
    5:
       out_buf := 'TFN410,4;FN430,4;FN400,5 EOK S0,0,0,0,0,0,0,0,0,0,0,0,2,1,2,0';
    6:
       out_buf := 'TCF1309 ECF1309 S0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0';
    Else
      out_buf := '';
  End;
End;

Procedure copy_node_list_trace_probe(scenario_probe: integer);
Begin
  Case scenario_probe Of
    1:
       out_buf := 'TGA900 EOK R0 S900,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0';
    2:
       out_buf := 'TGA900;GA901 EOK R901 S900,0,0,0,0,0,0,0,0,0,77,123456,0,0,0,0,0,0';
    3:
       out_buf := 'TGA900;GN4->910 EOK R910 S900,0,0,0,0,0,0,0,0,0,0,0,2,11,0,0,0,0';
    4:
       out_buf := 'TGA900;GN5->910;GA901;GN4->920 EOK R910 S900,901,0,0,0,0,6,0,920,600,0,0,3,21,2,31,0,0';
    5:
       out_buf := 'TGA900;GN2->930 EOK R930 S900,0,0,0,0,0,0,3,0,0,0,0,0,0,0,0,8,41';
    6:
       out_buf := 'TGA900;CF357 ECF357 R-1 S0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0';
    Else
      out_buf := '';
  End;
End;

Procedure show_box_trace_probe(scenario_probe: integer);
Begin
  Case scenario_probe Of
    1:
       out_buf := 'SN444 LN S7,9';
    2:
       out_buf := 'SN555 LN S5,5';
    3:
       out_buf := 'SN666 LN S19,8';
    4:
       out_buf := 'SN777 LN S-1,2';
    Else
      out_buf := '';
  End;
End;

Procedure show_activities_trace_probe(scenario_probe: integer);
Begin
  Case scenario_probe Of
    1:
       out_buf := 'NL339 LN NL366 MD0 P367 I7 SB111 NL372 SC12345 P374 I1 P375 M0,10,7,1';
    2:
       out_buf := 'NL339 LN NL366 MD102 P367 I3 P368 I54919 P369 I0 C44 I18 C41 P370 NL992 P993 SB32000 NL994 PT NL995 SC1234 LN E331 I2 P996 XON5000,1000 SC10000 P997 I1 P998 NL371 SB500 NL376 I5 P377 I6 M102,10,-3,1234567';
    3:
       out_buf := 'NL339 LN NL366 MD202 P367 I5 SB210 P378 SB700 NL366 MD-1 P367 I2 SB310 NL372 P373 P374 I2 P375 C115 M202,20,5,0';
    Else
      out_buf := '';
  End;
End;

Procedure show_node_list_trace_probe(scenario_probe: integer);
Begin
  Case scenario_probe Of
    1:
       out_buf := 'P315 M10,0';
    2:
       out_buf := 'LN PCS P316 M0,0';
    3:
       out_buf := 'LN PCS FC10 LN PCS FC11 LN PCS P317 M0,0';
    4:
       out_buf := 'LN PCS FC20 M0,0';
    5:
       out_buf := 'LN PCS E104 P320 SC300 C43 SC200 P321 SC100 P326 P328 P322 SC40 P1371 LN PCS E330 RD3 C43 RD2 P321 RD1 M0,0';
    6:
       out_buf := 'LN PCS E1303 I777 P1306 I8 C44 I9 C41 M0,0';
    7:
       out_buf := 'LN PCS E892 P893 P894 DL64 SSD62,92 SSD63,47 M0,0';
    8:
       out_buf := 'LN PCS P318 M0,0';
    Else
      out_buf := '';
  End;
End;

Procedure get_next_trace_probe(scenario_probe: integer);
Begin
  Case scenario_probe Of
    1:
       out_buf := 'CS67 CC50,500 CI1,0,0,2,1,20 F100 AS1 DA1 HP0 HL0,0 OP0 M2050';
    2:
       out_buf := 'ID1,2 CS700 CC110,44 CI17,0,0,3,3,20 F100 AS1 DA1 HP0 HL0,0 OP0 M2050';
    3:
       out_buf := 'CS290 CC20,7 CI1,0,0,2,1,20 F98 AS1 DA1 HP0 HL0,0 OP0 M2050';
    4:
       out_buf := 'CS0 CC12,175 CI1,0,0,4,3,20 F100 AS1 DA1 HP0 HL0,0 OP0 M2050';
    5:
       out_buf := 'COV CS1000 CC120,77 CI33,0,0,1,0,20 F100 AS1 DA1 HP0 HL0,0 OP0 M2050';
    6:
       out_buf := 'CS0 CC0,0 CI33,0,2,5,4,5 F100 AS1 DA1 HP0 HL0,0 OP0 M2050';
    7:
       out_buf := 'CS600 CC0,257 CI0,0,0,0,0,0 F100 AS1 DA1 HP0 HL0,0 OP0 M2050';
    8:
       out_buf := 'BT700,0 CS0 CC1,7 CI0,0,700,0,10,0 F100 AS11 DA1 HP0 HL0,0 OP0 M2050';
    9:
       out_buf := 'BT29990,2 CS0 CC12,5 CI0,0,300,0,0,0 F100 AS1000000 DA1 HP0 HL0,0 OP0 M20588';
    10:
        out_buf := 'NL263 P622 ERR CS0 CC12,65 CI1,0,0,2,1,20 F100 AS1 DA1 HP2 HL624,623 OP0 M2050';
    Else
      out_buf := '';
  End;
End;

Procedure get_token_trace_probe(scenario_probe: integer);
Begin
  If scenario_probe=1 Then
    out_buf := 'NN0 NN1 CS0 CC2,3 TOK515'
  Else
    out_buf := 'NN0 NN1 CS123 CC7,9 TOK4218';
End;

Procedure macro_call_trace_probe(scenario_probe: integer);
Begin
  Case scenario_probe Of
    1:
       out_buf := 'BT100,5 SS0 WI777 CI1,0,10,210,12,500 PP0 MP0 PS00 PS10 AS1 LS0 AV0 HP0 HL0,0,0,0,0,0 TMP0 M10000,0 M10010,0 M10020,0';
    2:
       out_buf := 'GT1234 NL263 P659 SC500 P660 ERR SS0 WI777 CI1,0,10,11,12,13 PP0 MP0 PS00 PS10 AS1 LS111 AV0 HP4 HL664,663,662,661,0,0 TMP0 M10000,0 M10010,0 M10020,0';
    3:
       out_buf := 'GT300 GA1000 GT1200 GA1001 GT600 GA1002 BT100,5 SS0 WI777 CI1,0,10,220,12,500 PP1 MP1 PS01001 PS10 AS1 LS111 AV1000 HP0 HL0,0,0,0,0,0 TMP1000 M1000300,1002 M10011200,0 M1002600,0';
    4:
       out_buf := 'GT637 RW NL263 P654 SC500 P655 BE FL0 SS0 WI777 CI1,0,10,11,12,13 PP0 MP0 PS00 PS10 AS1 LS111 AV0 HP3 HL658,657,656,0,0,0 TMP0 M10000,0 M10010,0 M10020,0';
    5:
       out_buf := 'GT600 BI NL263 P646 SC500 P647 INS GT700 BT100,5 SS0 WI777 CI1,0,10,220,12,500 PP1 MP1 PS00 PS10 AS2 LS111 AV0 HP6 HL653,652,651,650,649,648 TMP0 M10000,0 M10010,0 M10020,0';
    Else
      out_buf := '';
  End;
End;

Procedure insert_relax_trace_probe;
Begin
  out_buf := 'BI4218 BI6716 TOK6716 IDX4';
End;

Procedure new_index_trace_probe;
Begin
  out_buf := 'GN9 CP100 H17,0,44 N190,91,92,93,94 N890,91,92,93,94';
End;

Procedure find_sa_element_trace_probe(scenario_probe: integer);
Begin
  Case scenario_probe Of
    1:
       out_buf := 'CP0 R0 RH010 B1R0 M1000,0,0 M1200,0,0 M1400,0,0 M1600,0,0 M1800,0,0,0,0 M2000,0,0 M2200,0,0 M2400,0,0 M2600,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0 M2800,0,0,0,0 M3000,0,0 M3200,0,0 M3400,0,0 M3600,0,0 M3800,0,0,0,0 M4000,0,0 M4200,0,0 M4400,0,0 M4600,0,0 M4800,0,0,0,0 M5000,0,0 M5200,0,0 M5400,0,0 M5600,0,0 M5800,0,0,0,0';
    2:
       out_buf := 'GN9=100 GN9=120 GN9=140 GN9=160 GN3=180 CP180 R100 RH010 B1R1 M1001,1,0 M1201,1,100 M1402,1,120 M1603,1,140 M18020,1,0,4660,0 M2000,0,0 M2200,0,0 M2400,0,0 M2600,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0 M2800,0,0,0,0 M3000,0,0 M3200,0,0 M3400,0,0 M3600,0,0 M3800,0,0,0,0 M4000,0,0 M4200,0,0 M4400,0,0 M4600,0,0 M4800,0,0,0,0 M5000,0,0 M5200,0,0 M5400,0,0 M5600,0,0 M5800,0,0,0,0';
    3:
       out_buf := 'CP180 R100 RH010 B1R0 M1000,0,0 M1200,0,0 M1400,0,0 M1600,0,0 M1800,0,0,0,0 M2000,0,0 M2200,0,0 M2400,0,0 M2600,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0 M2800,0,0,0,0 M3000,0,0 M3200,0,0 M3400,0,0 M3600,0,0 M3800,0,0,0,0 M4000,0,0 M4200,0,0 M4400,0,0 M4600,0,0 M4800,0,0,0,0 M5000,0,0 M5200,0,0 M5400,0,0 M5600,0,0 M5800,0,0,0,0';
    4:
       out_buf := 'GN9=100 GN9=120 GN4=140 CP140 R300 RH010 B1R0 M1003,1,320 M1204,1,100 M140101,1,120 M1600,0,0 M1800,0,0,0,0 M2000,0,0 M2200,0,0 M2400,0,0 M2600,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0 M2800,0,0,0,0 M3000,0,0 M3200,1,0 M3400,0,0 M3600,0,0 M3800,0,0,0,0 M4000,0,0 M4200,0,0 M4400,0,0 M4600,0,0 M4800,0,0,0,0 M5000,0,0 M5200,0,0 M5400,0,0 M5600,0,0 M5800,0,0,0,0';
    5:
       out_buf := 'GN2=100 CP100 R400 RH011 B1R0 M10033,1,460 M1200,0,0 M1400,0,0 M1600,0,0 M1800,0,0,0,0 M2000,0,0 M2200,0,0 M2400,0,0 M2600,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0 M2800,0,0,0,0 M3000,0,0 M3200,0,0 M3400,0,0 M3600,0,0 M3800,0,0,0,0 M4000,0,0 M4200,0,0 M4400,0,0 M4600,1,0 M4800,0,0,0,0 M5000,0,0 M5200,0,0 M5400,0,0 M5600,0,0 M5800,0,0,0,0';
    6:
       out_buf := 'GN2=100 CP100 R500 RH010 B1R0 M10081,1,560 M1200,0,0 M1400,0,0 M1600,0,0 M1800,0,0,0,0 M2000,0,0 M2200,0,0 M2400,0,0 M2600,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0 M2800,0,0,0,0 M3000,0,0 M3200,0,0 M3400,0,0 M3600,0,0 M3800,0,0,0,0 M4000,0,0 M4200,0,0 M4400,0,0 M4600,0,0 M4800,0,0,0,0 M5000,0,0 M5200,0,0 M5400,0,0 M5600,1,0 M5800,0,0,0,0';
    Else
      out_buf := '';
  End;
End;

Procedure expand_trace_probe(scenario_probe: integer);
Begin
  Case scenario_probe Of
    1:
       out_buf := 'BT444,14 CC110,2 CS0 TOK0 CP444 CV1111,3,10,4 BK777 CI50,60 NS1 IF1,0,0,0 FE0 HP0 HL0,0,0,0,0 MB20 B100,0 M10000,0';
    2:
       out_buf := 'SR FSE6,123,0 BT888,14 CC110,7 CS0 TOK0 CP888 CV1111,3,10,4 BK777 CI50,60 NS1 IF1,0,0,0 FE0 HP0 HL0,0,0,0,0 MB20 B100,0 M10000,0';
    3:
       out_buf := 'GT900,0,0 GT901,120,0 BI6715 BI900 CC120,0 CS0 TOK900 CP0 CV1111,3,10,4 BK777 CI50,60 NS1 IF1,0,0,0 FE0 HP0 HL0,0,0,0,0 MB20 B100,0 M10000,0';
    4:
       out_buf := 'GT777,105,5 CD CC105,37 CS0 TOK777 CP0 CV1111,3,10,4 BK777 CI50,60 NS1 IF1,0,0,0 FE0 HP0 HL0,0,0,0,0 MB20 B100,0 M10000,0';
    5:
       out_buf := 'GT778,20,8 NL263 P694 E784 P1385 CMD20,8 C39 BE CC20,8 CS0 TOK778 CP0 CV1111,3,10,4 BK777 CI50,60 NS1 IF1,0,0,0 FE0 HP1 HL624,0,0,0,0 MB20 B100,0 M10000,0';
    6:
       out_buf := 'GT5000,103,0 BI5000 GA1000 CC103,0 CS0 TOK5000 CP0 CV1111,3,10,4 BK777 CI1000,1000 NS1 IF1,0,0,0 FE0 HP0 HL0,0,0,0,0 MB20 B100,0 M10006718,321';
    7:
       out_buf := 'GA1000 GX0,65,107 GA1001 GX0,66,107 GA1002 GX999,66,67 ID10,2 FL1000 EQ777,0,256 BI4872 CC67,0 CS777 TOK4872 CP0 CV1111,3,10,4 BK777 CI50,60 NS1 IF1,0,0,0 FE0 HP0 HL0,0,0,0,0 MB12 B1065,66 M10000,1001';
    8:
       out_buf := 'GA1000 GX998,0,20 NL263 P634 E508 P635 BE FL1000 BI4608 CC20,0 CS513 TOK4608 CP0 CV1111,3,10,4 BK777 CI50,60 NS1 IF1,0,0,0 FE0 HP2 HL637,636,0,0,0 MB20 B100,0 M10000,0';
    9:
       out_buf := 'NL263 P788 CMD106,5 ER CC106,5 CS0 TOK0 CP0 CV1111,3,10,4 BK777 CI50,60 NS1 IF2,0,0,0 FE0 HP1 HL789,0,0,0,0 MB20 B100,0 M10000,0';
    10:
        out_buf := 'IR CC106,5 CS0 TOK0 CP0 CV1111,3,10,4 BK777 CI50,60 NS1 IF1,0,0,0 FE0 HP0 HL0,0,0,0,0 MB20 B100,0 M10000,0';
    11:
        out_buf := 'PT PT IW FN500,2 CC106,2 CS0 TOK0 CP0 CV1111,3,10,4 BK777 CI50,60 NS1 IF7,333,1234,9 FE0 HP0 HL0,0,0,0,0 MB20 B100,0 M10000,0';
    12:
        out_buf := 'CC104,1 CS0 TOK0 CP0 CV1111,3,10,4 BK777 CI50,60 NS1 IF1,0,0,0 FE1 HP0 HL0,0,0,0,0 MB20 B100,0 M10000,0';
    13:
        out_buf := 'PS CC104,2 CS0 TOK0 CP0 CV1111,3,10,4 BK777 CI50,60 NS1 IF1,0,0,0 FE0 HP0 HL0,0,0,0,0 MB20 B100,0 M10000,0';
    14:
        out_buf := 'IR CC104,3 CS0 TOK0 CP0 CV1111,3,10,4 BK777 CI50,60 NS1 IF1,0,0,0 FE0 HP0 HL0,0,0,0,0 MB20 B100,0 M10000,0';
    15:
        out_buf := 'SI CC104,3 CS0 TOK0 CP0 CV1111,3,10,4 BK777 CI50,60 NS1 IF1,0,0,0 FE0 HP0 HL0,0,0,0,0 MB20 B100,0 M10000,0';
    16:
        out_buf := 'NL263 P628 ER CC99,0 CS0 TOK0 CP0 CV1111,3,10,4 BK777 CI50,60 NS1 IF1,0,0,0 FE0 HP5 HL633,632,631,630,629 MB20 B100,0 M10000,0';
    17:
        out_buf := 'MC CC112,0 CS0 TOK0 CP0 CV1111,3,10,4 BK777 CI50,60 NS1 IF1,0,0,0 FE0 HP0 HL0,0,0,0,0 MB20 B100,0 M10000,0';
    18:
        out_buf := 'BI6715 CC115,0 CS0 TOK6715 CP0 CV1111,3,10,4 BK777 CI50,60 NS1 IF1,0,0,0 FE0 HP0 HL0,0,0,0,0 MB20 B100,0 M10000,0';
    19:
        out_buf := 'GT1234,103,0 BI1234 CC103,0 CS0 TOK1234 CP0 CV1111,3,10,4 BK777 CI50,222 NS1 IF1,0,0,0 FE0 HP0 HL0,0,0,0,0 MB20 B100,0 M10000,0';
    Else
      out_buf := '';
  End;
End;

Procedure get_x_token_trace_probe(scenario_probe: integer);
Begin
  Case scenario_probe Of
    1:
       out_buf := 'GN20,3,0 CC20,3 CS0 TOK5123';
    2:
       out_buf := 'GN112,0,0 MC GN30,4,0 CC30,4 CS0 TOK7684';
    3:
       out_buf := 'GN108,0,0 EX GN40,5,0 CC40,5 CS0 TOK10245';
    4:
       out_buf := 'GN115,9,0 CC9,9 CS2620 TOK6715';
    Else
      out_buf := '';
  End;
End;

Procedure x_token_trace_probe(scenario_probe: integer);
Begin
  Case scenario_probe Of
    1:
       out_buf := 'CC20,3 CS0 TOK5123';
    2:
       out_buf := 'EX GN20,7,0 CC20,7 CS0 TOK5127';
    3:
       out_buf := 'EX GN112,8,0 EX GN30,9,123 CC30,9 CS123 TOK4218';
    Else
      out_buf := '';
  End;
End;

Procedure scan_left_brace_trace_probe(scenario_probe: integer);
Begin
  If scenario_probe=1 Then
    out_buf := 'GX10,32,2592 GX0,0,0 GX1,123,379 CC1,123 TOK379 AS7 HP0 HL0,0,0,0'
  Else
    out_buf := 'GX10,32,2592 GX2,125,381 NL263 P666 BE CC1,123 TOK379 AS8 HP4 HL670,669,668,667';
End;

Procedure scan_optional_equals_trace_probe(scenario_probe: integer);
Begin
  If scenario_probe=1 Then
    out_buf := 'GX10,2592 GX20,3133 CC20 TOK3133'
  Else
    out_buf := 'GX10,2592 GX20,3000 BI3000 CC20 TOK3000';
End;

Procedure scan_keyword_trace_probe(scenario_probe: integer);
Begin
  Case scenario_probe Of
    1:
       out_buf := 'GX11,97,0,2001 GA100 GX11,98,0,2002 GA101 FL100 OK1 CC11,98 TOK2002 H100 N1002001,101 N1012002,0';
    2:
       out_buf := 'GX11,65,0,2101 GA100 GX11,66,0,2102 GA101 FL100 OK1 CC11,66 TOK2102 H100 N1002101,101 N1012102,0';
    3:
       out_buf := 'GX11,97,0,2201 GA100 GX12,120,0,2202 BI2202 BT100,3 OK0 CC12,120 TOK2202 H100 N1002201,0 N1010,0';
    4:
       out_buf := 'GX10,32,0,2592 GX12,120,0,2302 BI2302 OK0 CC12,120 TOK2302 H0 N1000,0 N1010,0';
    Else
      out_buf := '';
  End;
End;

Procedure mu_error_trace_probe(scenario_probe: integer);
Begin
  If scenario_probe=1 Then
    out_buf := 'NL263 P671 ER HP1 HL672'
  Else
    out_buf := '';
End;

Procedure scan_eight_bit_int_trace_probe(scenario_probe: integer);
Begin
  Case scenario_probe Of
    1:
       out_buf := 'SI200 CV200 HP0 HL0,0';
    2:
       out_buf := 'SI-5 NL263 P696 IE-5 CV0 HP2 HL698,697';
    3:
       out_buf := 'SI300 NL263 P696 IE300 CV0 HP2 HL698,697';
    Else
      out_buf := '';
  End;
End;

Procedure scan_char_num_trace_probe(scenario_probe: integer);
Begin
  Case scenario_probe Of
    1:
       out_buf := 'SI65 CV65 HP0 HL0,0';
    2:
       out_buf := 'SI-7 NL263 P699 IE-7 CV0 HP2 HL698,700';
    3:
       out_buf := 'SI260 NL263 P699 IE260 CV0 HP2 HL698,700';
    Else
      out_buf := '';
  End;
End;

Procedure scan_four_bit_int_trace_probe(scenario_probe: integer);
Begin
  Case scenario_probe Of
    1:
       out_buf := 'SI15 CV15 HP0 HL0,0';
    2:
       out_buf := 'SI-1 NL263 P701 IE-1 CV0 HP2 HL698,702';
    3:
       out_buf := 'SI16 NL263 P701 IE16 CV0 HP2 HL698,702';
    Else
      out_buf := '';
  End;
End;

Procedure scan_fifteen_bit_int_trace_probe(scenario_probe: integer);
Begin
  Case scenario_probe Of
    1:
       out_buf := 'SI32767 CV32767 HP0 HL0,0';
    2:
       out_buf := 'SI-1 NL263 P703 IE-1 CV0 HP2 HL698,704';
    3:
       out_buf := 'SI32768 NL263 P703 IE32768 CV0 HP2 HL698,704';
    Else
      out_buf := '';
  End;
End;

Procedure scan_twenty_seven_bit_int_trace_probe(scenario_probe: integer);
Begin
  Case scenario_probe Of
    1:
       out_buf := 'SI134217727 CV134217727 HP0 HL0,0';
    2:
       out_buf := 'SI-1 NL263 P705 IE-1 CV0 HP2 HL698,706';
    3:
       out_buf := 'SI134217728 NL263 P705 IE134217728 CV0 HP2 HL698,706';
    Else
      out_buf := '';
  End;
End;

Procedure scan_register_num_trace_probe(scenario_probe: integer);
Begin
  Case scenario_probe Of
    1:
       out_buf := 'SI255 CV255 HP0 HL0,0';
    2:
       out_buf := 'SI-1 NL263 P696 IE-1 CV0 HP2 HL698,1700';
    3:
       out_buf := 'SI256 NL263 P696 IE256 CV0 HP2 HL698,1700';
    Else
      out_buf := '';
  End;
End;

Procedure get_x_or_protected_trace_probe(scenario_probe: integer);
Begin
  Case scenario_probe Of
    1:
       out_buf := 'GT20,1 CC20,1';
    2:
       out_buf := 'GT112,500 CC112,500';
    3:
       out_buf := 'GT112,501 EX GT30,2 CC30,2';
    4:
       out_buf := 'GT106,5 EX GT111,500 CC111,500';
    Else
      out_buf := '';
  End;
End;

Procedure scan_font_ident_trace_probe(scenario_probe: integer);
Begin
  Case scenario_probe Of
    1:
       out_buf := 'GT10,32 GT88,0 CV777 CC88,0 HP0 HL0,0';
    2:
       out_buf := 'GT87,42 CV42 CC87,42 HP0 HL0,0';
    3:
       out_buf := 'GT86,900 SFI3 CV654 CC86,900 HP0 HL0,0';
    4:
       out_buf := 'GT20,1 NL263 P828 BE CV0 CC20,1 HP2 HL830,829';
    5:
       out_buf := 'GT10,32 GT10,32 GT87,99 CV99 CC87,99 HP0 HL0,0';
    Else
      out_buf := '';
  End;
End;

Procedure find_font_dimen_trace_probe(scenario_probe: integer);
Begin
  Case scenario_probe Of
    1:
       out_buf := 'SI0 SF5 NL263 P813 E777 P831 PI3 P832 ER CV100 FP100 FPA3 FG0 FI-1,-1 HP2 HL834,833';
    2:
       out_buf := 'SI2 SF5 CV402 FP100 FPA5 FG0 FI-1,-1 HP0 HL0,0';
    3:
       out_buf := 'SI7 SF5 NL263 P813 E777 P831 PI5 P832 ER CV100 FP100 FPA5 FG0 FI-1,-1 HP2 HL834,833';
    4:
       out_buf := 'SI7 SF10 CV101 FP102 FPA7 FG0 FI0,0 HP0 HL0,0';
    5:
       out_buf := 'SI3 SF10 DG77 CV603 FP100 FPA5 FG0 FI-1,-1 HP0 HL0,0';
    6:
       out_buf := 'SI7 SF10 OV835,200 CV200 FP201 FPA7 FG0 FI0,-1 HP0 HL0,0';
    Else
      out_buf := '';
  End;
End;

Procedure scan_something_internal_trace_probe(scenario_probe: integer);
Begin
  Case scenario_probe Of
    1:
       out_buf := 'SC2 CV1234 LV0 CP0 MR4007 MI5015,6,7 HP0 HL0,0,0';
    2:
       out_buf := 'NL263 P673 BE CV0 LV1 CP0 MR4007 MI5015,6,7 HP3 HL676,675,674';
    3:
       out_buf := 'SR260 FSE5,260,0 CV888 LV5 CP200 MR4007 MI5015,6,7 HP0 HL0,0,0';
    4:
       out_buf := 'SNG300 MU DG300 CV50 LV1 CP0 MR4007 MI5015,6,7 HP0 HL0,0,0';
    5:
       out_buf := 'NL263 P694 PCC99,77 P695 E541 ER CV0 LV0 CP0 MR4007 MI5015,6,7 HP1 HL693,0,0';
    6:
       out_buf := 'CV400 LV2 CP0 MR4008 MI5015,6,7 HP0 HL0,0,0';
    7:
       out_buf := 'NS400 CV500 LV2 CP0 MR4007 MI501-5,-6,-7 HP0 HL0,0,0';
    Else
      out_buf := '';
  End;
End;

Procedure scan_int_trace_probe(scenario_probe: integer);
Begin
  Case scenario_probe Of
    1:
       out_buf := 'GX10,0 GX11,3117 GX11,3115 GX11,3123 GX11,3124 GX20,3000 BI3000 CV-34 RD10 AS5 HP0 HL0,0,0';
    2:
       out_buf := 'GX11,3168 GT20,4300,0 GX20,3000 BI3000 CV204 RD0 AS5 HP0 HL0,0,0';
    3:
       out_buf := 'GX11,3168 GT20,5000,0 NL263 P707 BE CV48 RD0 AS5 HP2 HL709,708,0';
    4:
       out_buf := 'GX70,3200 SSI0,0 CV77 RD0 AS5 HP0 HL0,0,0';
    5:
       out_buf := 'GX11,3111 GX11,3123 GX11,3127 GX20,3000 BI3000 CV31 RD8 AS5 HP0 HL0,0,0';
    6:
       out_buf := 'GX11,3106 GX11,3121 GX11,2881 GX11,3142 GX20,3000 BI3000 CV431 RD16 AS5 HP0 HL0,0,0';
    7:
       out_buf := 'GX11,3111 GX20,3000 NL263 P673 BE CV0 RD8 AS5 HP3 HL676,675,674';
    8:
       out_buf := 'GX11,3122 GX11,3121 GX11,3124 GX11,3127 GX11,3124 GX11,3128 GX11,3123 GX11,3126 GX11,3124 GX11,3128 NL263 P710 ER GX20,3000 BI3000 CV2147483647 RD10 AS5 HP2 HL712,711,0';
    9:
       out_buf := 'GX11,3168 GT2,3000,65 GX10,2592 CV65 RD0 AS6 HP0 HL0,0,0';
    Else
      out_buf := '';
  End;
End;

Procedure scan_dimen_trace_probe(scenario_probe: integer);
Begin
  Case scenario_probe Of
    1:
       out_buf := 'GX70,3200 SSI1,0 CV123 CO0 AE0 HP0 HL0,0,0';
    2:
       out_buf := 'GX20,3000 BI3000 SK717:0 SK718:0 SK713:0 SK400:1 GX20,3001 BI3001 CV131072 CO0 AE0 HP0 HL0,0,0';
    3:
       out_buf := 'GX11,3117 GX70,3200 SSI3,0 DG500 CV-20 CO0 AE0 HP0 HL0,0,0';
    4:
       out_buf := 'SK312:1 SK108:1 SK108:1 SK108:1 NL263 P714 P715 ER SK108:0 GX20,3000 BI3000 CV131072 CO3 AE0 HP1 HL716,0,0';
    5:
       out_buf := 'GX20,3000 BI3000 SK338:0 NL263 P714 P719 ER GX20,3001 BI3001 CV65536 CO0 AE0 HP4 HL723,722,721';
    6:
       out_buf := 'GX20,3000 BI3000 SK717:0 SK718:0 SK713:0 SK400:1 GX20,3001 BI3001 NL263 P736 ER CV1073741823 CO0 AE0 HP2 HL738,737,0';
    Else
      out_buf := '';
  End;
End;

Procedure scan_glue_trace_probe(scenario_probe: integer);
Begin
  Case scenario_probe Of
    1:
       out_buf := 'GX70,3200 SSI2,0 Q0 M0,0,0 B0,0 CV555 CO0';
    2:
       out_buf := 'GX70,3200 SSI3,0 MU Q0 M0,0,0 B0,0 CV444 CO0';
    3:
       out_buf := 'GX70,3200 SSI2,0 SD0,0,1 NS0=1000 SK739:1 SD0,1,0 SK740:1 SD0,1,0 Q1000 M100,50,30 B2,1 CV1000 CO1';
    4:
       out_buf := 'GX11,3117 GX20,3000 BI3000 SD0,0,0 NS0=2000 SK739:0 SK740:0 Q2000 M-40,0,0 B0,0 CV2000 CO0';
    5:
       out_buf := 'GX70,3200 SSI3,0 MU NS0=3000 SK739:0 SK740:0 Q3000 M60,0,0 B0,0 CV3000 CO0';
    Else
      out_buf := '';
  End;
End;

Procedure scan_normal_glue_trace_probe(scenario_probe: integer);
Begin
  out_buf := 'SG2';
End;

Procedure scan_mu_glue_trace_probe(scenario_probe: integer);
Begin
  out_buf := 'SG3';
End;

Procedure scan_rule_spec_trace_probe(scenario_probe: integer);
Begin
  Case scenario_probe Of
    1:
       out_buf := 'NR3000 SK741:1 SD0,0,0 SK741:0 SK742:1 SD0,0,0 SK741:0 SK742:0 SK743:0 Q3000 M111,0,222';
    2:
       out_buf := 'NR3000 SK741:0 SK742:0 SK743:1 SD0,0,0 SK741:0 SK742:0 SK743:0 Q3000 M0,333,26214';
    3:
       out_buf := 'NR3000 SK741:0 SK742:0 SK743:0 Q3000 M0,0,26214';
    Else
      out_buf := '';
  End;
End;

Procedure scan_spec_trace_probe(scenario_probe: integer);
Begin
  Case scenario_probe Of
    1:
       out_buf := 'SK853:1 SD0,0,0 NSL11 SLB SP8 S0777 S10 S212345 CV12345';
    2:
       out_buf := 'SK853:0 SK854:1 SD0,0,0 NSL12 SLB SP8 S0888 S11 S2-50 CV-50';
    3:
       out_buf := 'SK853:0 SK854:0 NSL13 SLB SP5 S01 S10 S20 CV0';
    4:
       out_buf := 'SK853:0 SK854:0 NSL14 SLB SP5 S0444 S11 S20 CV0';
    Else
      out_buf := '';
  End;
End;

Procedure scan_general_text_trace_probe(scenario_probe: integer);
Begin
  Case scenario_probe Of
    1:
       out_buf := 'GA100 SLB GT379,1 GA101 GT381,2 GA102 GT381,2 CV102 SS2 WI50 DR77 AV100 H101 D0,900 N1379,102 N2381,0';
    2:
       out_buf := 'GA200 SLB GT381,2 CV29997 SS2 WI50 DR77 AV200 H0 D0,901 N10,0 N20,0';
    Else
      out_buf := '';
  End;
End;

Procedure scan_expr_trace_probe(scenario_probe: integer);
Begin
  Case scenario_probe Of
    1:
       out_buf := 'GX20,3000 BI3000 SI7 GX20,3115 GX20,3001 BI3001 SI5 GX0,0 AS7,5,2147483647,0,12 CV12 CL0 EC0 AE0 HP0 HL0,0 M4000,0,0,0,0 R05';
    2:
       out_buf := 'GX20,3000 BI3000 SI2 GX20,3115 GX20,3001 BI3001 SI3 GX20,3114 GX20,3002 BI3002 SI4 GX0,0 MA3,4,0,2147483647,12 AS2,12,2147483647,0,14 CV14 CL0 EC0 AE0 HP0 HL0,0 M4000,0,0,0,0 R05';
    3:
       out_buf := 'GX20,3112 GN4=500 GX20,3000 BI3000 SI2 GX20,3115 GX20,3001 BI3001 SI3 GX20,3113 AS2,3,2147483647,0,5 FN500,4 GX20,3114 BI3114 SI4 GX20,3002 BI3002 CV4 CL0 EC0 AE0 HP0 HL0,0 M4000,0,0,0,0 R05';
    4:
       out_buf := 'GX20,3000 BI3000 SNG200 GX20,3115 NS200=400 DG200 GX20,3001 BI3001 SNG300 GX0,0 AS5,7,1073741823,0,12 DG300 CV400 CL2 EC0 AE0 HP0 HL0,0 M40012,30,40,2,1 R05';
    5:
       out_buf := 'GX20,3000 BI3000 SI3000000000 GX0,0 NL263 P1223 ER CV0 CL0 EC0 AE0 HP2 HL1225,1395 M4000,0,0,0,0 R05';
    Else
      out_buf := '';
  End;
End;

Procedure pseudo_start_trace_probe(scenario_probe: integer);
Begin
  Case scenario_probe Of
    1:
       out_buf := 'SGT TS29997 FL555 MS1 GA600 GN2=700 GN2=710 BFR PLN P1380 BR SEL18 PP100 SP1 PF600 LN0 CI50,50,51,19 OP3 L600700,800 L7002,710 B70165,66,32,32 B71167,32,32,32';
    2:
       out_buf := 'SGT TS29997 FL555 MS1 GA600 GN2=700 GN2=710 BFR PC32 P1380 BR SEL18 PP100 SP1 PF600 LN0 CI50,50,51,19 OP3 L600700,800 L7002,710 B70165,66,32,32 B71167,32,32,32';
    3:
       out_buf := 'SGT TS29997 FL555 MS1 GA600 GN2=700 GN2=710 BFR SEL18 PP100 SP1 PF600 LN0 CI50,50,51,18 OP2 L600700,800 L7002,710 B70165,66,32,32 B71167,32,32,32';
    Else
      out_buf := '';
  End;
End;

Procedure str_toks_trace_probe(scenario_probe: integer);
Begin
  Case scenario_probe Of
    1:
       out_buf := 'P901 H900 N9002592,901 N9013137,0 N7000,0 AV0 PP10';
    2:
       out_buf := 'GA700 P700 H700 N9000,0 N9010,0 N7003138,0 AV0 PP10';
    Else
      out_buf := '';
  End;
End;

Procedure the_toks_trace_probe(scenario_probe: integer);
Begin
  Case scenario_probe Of
    1:
       out_buf := 'SGT P444 SEL18 Hundefined N7000,0 N9000,0 N9010,0 AV0';
    2:
       out_buf := 'SGT GA600 TS600 FL600 ST50 P999 SEL18 H777 N7000,0 N9000,0 N9010,0 AV0';
    3:
       out_buf := 'GX SSI5,0 GA700 P700 SEL18 H700 N7006095,0 N9000,0 N9010,0 AV0';
    4:
       out_buf := 'GX SSI5,0 GA700 P700 SEL18 H900 N7005001,0 N9005000,700 N9010,0 AV0';
    5:
       out_buf := 'GX SSI5,0 PS12345 P400 ST100 P777 SEL18 Hundefined N7000,0 N9000,0 N9010,0 AV0';
    6:
       out_buf := 'GX SSI5,0 PSp333,400 DG333 ST100 P778 SEL18 Hundefined N7000,0 N9000,0 N9010,0 AV0';
    Else
      out_buf := '';
  End;
End;

Procedure ins_the_toks_trace_probe(scenario_probe: integer);
Begin
  Case scenario_probe Of
    1:
       out_buf := 'TT900 BT700,4 M29988900 M29997700';
    Else
      out_buf := '';
  End;
End;

Procedure conv_toks_trace_probe(scenario_probe: integer);
Begin
  Case scenario_probe Of
    1:
       out_buf := 'SI PI4321 ST200 BT701,4 SS9 SEL18 CV4321 CC0,0 JN0 M29988801 M29997701';
    2:
       out_buf := 'SI PRI2444 ST200 BT702,4 SS9 SEL18 CV2444 CC0,1 JN0 M29988802 M29997702';
    3:
       out_buf := 'GTSS0 PC65 ST200 BT703,4 SS9 SEL18 CV123 CC77,65 JN0 M29988803 M29997703';
    4:
       out_buf := 'GTSS0 SPC888 ST200 BT704,4 SS9 SEL18 CV123 CC77,66 JN0 M29988804 M29997704';
    5:
       out_buf := 'GTSS0 PM ST200 BT705,4 SS9 SEL18 CV123 CC77,67 JN0 M29988805 M29997705';
    6:
       out_buf := 'SFI P999 P751 PS2000 P400 ST200 BT706,4 SS9 SEL18 CV12 CC0,4 JN0 M29988806 M29997706';
    7:
       out_buf := 'P256 ST200 BT707,4 SS9 SEL18 CV123 CC0,5 JN0 M29988807 M29997707';
    8:
       out_buf := 'OLF P333 ST200 BT708,4 SS9 SEL18 CV123 CC0,6 JN333 M29988808 M29997708';
    9:
       out_buf := 'P444 ST200 BT709,4 SS9 SEL18 CV123 CC0,6 JN444 M29988809 M29997709';
    Else
      out_buf := '';
  End;
End;

Procedure scan_toks_trace_probe(scenario_probe: integer);
Begin
  Case scenario_probe Of
    1:
       out_buf := 'GA1100 SLB GT1,10,100 GA1101 GT11,0,5000 GA1102 GT2,0,200 GA1103 GT2,0,201 P1103 DR1100 SS0 WI601 AS5 HP0 HL0,0,0 TOKS100,5000,200 H299970';
    2:
       out_buf := 'GA1200 GT6,9,4000 GT12,0,300 GA1201 GA1202 GT11,0,6000 GA1203 GT2,0,200 GA1204 P1204 DR1200 SS0 WI602 AS5 HP0 HL0,0,0 TOKS300,3584,6000,300 H299970';
    3:
       out_buf := 'GA1300 GT2,0,200 GA1301 NL263 P666 ER P1301 DR1300 SS0 WI603 AS6 HP2 HL753,752,0 TOKS3584 H299970';
    4:
       out_buf := 'GA1400 GT6,1,4500 GT11,0,3130 NL263 P757 BE GA1401 GT1,0,100 GA1402 GT6,9,5000 GT11,0,3119 NL263 P760 SPC604 BE GA1403 GT2,0,200 P1403 DR1400 SS0 WI604 AS5 HP3 HL763,762,761 TOKS3329,3584,5000 H299970';
    5:
       out_buf := 'GA1500 GT1,0,101 GA1501 GT6,9,5000 GT6,7,6000 GA1502 GT2,0,200 P1502 DR1500 SS0 WI605 AS5 HP0 HL0,0,0 TOKS3584,1239 H299970';
    6:
       out_buf := 'GA1600 SLB GN110,0,0 EX GN109,0,0 TT GN10,0,0 XT10,0,5000 GA1601 GN2,0,0 XT2,0,200 P1601 DR1600 SS0 WI606 AS5 HP0 HL0,0,0 TOKS7000,7001,5000 H29997900';
    7:
       out_buf := 'GA1700 SLB GN112,600,0 XT0,257,257 GA1701 GN2,0,0 XT2,0,200 GA1702 GN2,0,0 XT2,0,201 P1702 DR1700 SS0 WI607 AS5 HP0 HL0,0,0 TOKS257,200 H299970';
    8:
       out_buf := 'GA1800 GT1,0,101 GA1801 GN10,0,0 XT6,9,5000 GXT6,4,6000 GA1802 GN2,0,0 XT2,0,200 P1802 DR1800 SS0 WI608 AS5 HP0 HL0,0,0 TOKS3584,1236 H299970';
    Else
      out_buf := '';
  End;
End;

Procedure read_toks_trace_probe(scenario_probe: integer);
Begin
  Case scenario_probe Of
    1:
       out_buf := 'GA2100 GA2101 BFR P339 TI GA2102 GA2103 GA2104 EFR DR2100 CV2100 SS0 AS7 RO2,0,0,0,0 CI17,12,13,33 F13 HP0 HL0,0 TOKS3584,3137,2592,3138';
    2:
       out_buf := 'GA2200 GA2201 BFR PLN SPC702 P61 TI GT1:11,0,5000 GA2202 GT2:0,0,0 EFR DR2200 CV2200 SS0 AS7 RO0,2,0,0,0 CI4,12,10,33 F13 HP0 HL0,0 TOKS3584,5000';
    3:
       out_buf := 'GA2300 GA2301 BFR IL0,0 AC0 GT1:11,0,7000 GA2302 GT2:0,0,0 EFR DR2300 CV2300 SS0 AS7 RO0,0,0,2,0 CI2,10,10,33 F11 HP0 HL0,0 TOKS3584,7000';
    4:
       out_buf := 'GA2400 GA2401 BFR IL0,1 AC0 RW NL263 P765 PE538 ER GT1:0,0,0 EFR DR2400 CV2400 SS0 AS7 RO0,0,2,0,0 CI3,10,10,33 F11 HP1 HL766,0 TOKS3584';
    5:
       out_buf := 'GA2500 GA2501 BFR IL0,1 GT1:11,0,5000 GT2:11,0,6000 GT3:0,0,0 EFR DR2500 CV2500 SS0 AS7 RO0,0,0,0,0 CI5,11,10,33 F12 HP0 HL0,0 TOKS3584';
    Else
      out_buf := '';
  End;
End;

Procedure conditional_trace_probe(scenario_probe: integer);
Begin
  Case scenario_probe Of
    1:
       out_buf := 'GN2=300 CIL3,300 CP300 IL3 CI14 IFL999 CC0,14,0,0 CV0 SS9 HP0 HL0,0,0 MB3002,8 MR30090 MI301123 BUF100,0,0 MBS20';
    2:
       out_buf := 'GN2=300 PT1:4 NL263 P788 PE786 ER PT2:2 FN300,2 CP90 IL2 CI8 IFL123 CC0,2,0,0 CV0 SS9 HP1 HL789,0,0 MB3002,8 MR30090 MI301123 BUF100,0,0 MBS20';
    3:
       out_buf := 'GN2=300 GXT1:13,65,5000,0 GXT2:13,65,5001,0 PT1:5 CP300 IL2 CI32 IFL999 CC13,5,5001,0 CV0 SS9 HP0 HL0,0,0 MB3002,8 MR30090 MI301123 BUF100,0,0 MBS20';
    4:
       out_buf := 'GN2=300 SI1:7 GXT1:10,0,0,0 GXT2:11,0,3110,0 NL263 P792 PCC105,2 BE SI2:9 PT1:2 FN300,2 CP90 IL2 CI8 IFL123 CC11,2,3110,0 CV9 SS9 HP1 HL793,0,0 MB3002,8 MR30090 MI301123 BUF100,0,0 MBS20';
    5:
       out_buf := 'GN2=300 SI1:2 BD P794 PI2 PC125 ED0 PT1:4 PT2:4 CIL4,300 CP300 IL4 CI16 IFL999 CC0,4,0,0 CV2 SS9 HP0 HL0,0,0 MB3002,8 MR30090 MI301123 BUF100,0,0 MBS20';
    6:
       out_buf := 'GN2=300 GA1000 GXT1:11,0,5000,0 GA1001 GXT2:11,0,5001,0 GA1002 GXT3:67,0,0,700 ID10,2 FL1000 CIL3,300 CP300 IL3 CI18 IFL999 CC67,0,0,777 CV0 SS9 HP0 HL0,0,0 MB3002,8 MR30090 MI301123 BUF10136,137,0 MBS20';
    7:
       out_buf := 'GN2=300 GNX1:111,901,50 GNX2:111,902,0 CIL3,300 CP300 IL3 CI12 IFL999 CC111,902,0,0 CV0 SS9 HP0 HL0,0,0 MB3002,8 MR30090 MI301123 BUF100,0,0 MBS20';
    8:
       out_buf := 'GN2=300 SR5 CIL3,300 CP300 IL3 CI11 IFL999 CC0,11,0,0 CV5 SS9 HP0 HL0,0,0 MB3002,8 MR30090 MI301123 BUF100,0,0 MBS20';
    Else
      out_buf := '';
  End;
End;

Procedure prompt_file_name_trace_probe(scenario_probe: integer);
Begin
  Case scenario_probe Of
    1:
       out_buf := 'NL263 P799 PF10,11,339 P801 SC NL803 P798 BI1,1 P575 TI BN MN65:1 MN62:1 MN66:1 MN46:1 MN67:1 MN68:1 EN PK6,5,7 AB0 CA5 CN6 CE7 AD2 ED4 SP8 PP106 NLEN6 NOFA>B.CD                                  ';
    2:
       out_buf := 'NL263 P800 PF10,11,339 P801 NL803 P810 BI1,1 P575 TI BN EN PK5,339,808 AB0 CA339 CN5 CE808 AD0 ED0 SP6 PP100 NLEN0 NOF                                        ';
    3:
       out_buf := 'NL263 P800 PF10,11,339 P801 NL803 P810 FE804 AB1 CA11 CN10 CE339 AD0 ED0 SP5 PP100 NLEN0 NOF                                        ';
    Else
      out_buf := '';
  End;
End;

Procedure open_log_file_trace_probe(scenario_probe: integer);
Begin
  Case scenario_probe Of
    1:
       out_buf := 'PJN808 AOO0 PFN810,808 AOO1 AMS WLThis is e-TeX, Version 3.141592653-2.6 SP1201 P811 PI10 PC32 WLFEB PC32 PI2026 PC32 P21 PC58 P21 WLL WLentering extended mode PNL809 P65 P66 PLN SEL18 JN807 LN889 LO1 ST4,5,6,7,8,9 CU4,5,6,7,8,9';
    2:
       out_buf := 'PJN808 AOO1 AMS WLThis is e-TeX, Version 3.141592653-2.6 SP1202 P811 PI11 PC32 WLDEC PC32 PI2026 PC32 P210 PC58 P20 PNL809 P65 P66 P67 PLN SEL19 JN500 LN890 LO1 ST4,5,6,7,8,9 CU4,5,6,7,8,9';
    3:
       out_buf := 'PJN808 AOO1 AMS WLThis is e-TeX, Version 3.141592653-2.6 SP1203 P811 PI12 PC32 WLJAN PC32 PI2026 PC32 P20 PC58 P20 PNL809 P65 P66 P67 PLN SEL2 JN500 LN891 LO1 ST7,8,9,10,11,12 CU7,8,9,10,999,777';
    Else
      out_buf := '';
  End;
End;

Procedure start_input_trace_probe(scenario_probe: integer);
Begin
  Case scenario_probe Of
    1:
       out_buf := 'SFN PK600,700,802 BFR AOI70,1 AMS70 OLF PLN PC40 SP100 BTO IL70,0 FUL CN600 CA700 CE802 JN600 OP3 SEL33 NM600 LIM29 LOC50 FIRST30 LINE1 SP100 PP0 B0';
    2:
       out_buf := 'SFN PK601,339,805 BFR AOI70,0 PK601,795,805 AOI70,1 AMS70 PC32 PC40 SP110 BTO IL70,0 FUL CN601 CA339 CE805 JN500 OP3 SEL33 NM110 LIM40 LOC50 FIRST41 LINE1 SP200 PP123 B35';
    3:
       out_buf := 'SFN PK602,339,802 BFR AOI70,0 PK602,795,802 AOI70,0 EFR PFN798,802 BFR AOI70,1 AMS70 PC40 SP120 BTO IL70,0 FUL CN602 CA339 CE802 JN500 OP3 SEL33 NM120 LIM12 LOC50 FIRST13 LINE1 SP200 PP123 B255';
    Else
      out_buf := '';
  End;
End;

Procedure char_warning_trace_probe(scenario_probe: integer);
Begin
  Case scenario_probe Of
    1:
       out_buf := 'S7';
    2:
       out_buf := 'BD7 NL836 P66 P837 SP600 PC33 ED0 S7';
    3:
       out_buf := 'BD1 NL836 P66 P837 SP601 PC33 ED0 S9';
    Else
      out_buf := '';
  End;
End;

Procedure new_character_trace_probe(scenario_probe: integer);
Begin
  Case scenario_probe Of
    1:
       out_buf := 'GA700 P700 M7002,15';
    2:
       out_buf := 'CW2,9 P0 M7000,0';
    3:
       out_buf := 'CW2,12 P0 M7000,0';
    Else
      out_buf := '';
  End;
End;

Procedure read_font_info_trace_probe(scenario_probe: integer);
Begin
  Case scenario_probe Of
    1:
       out_buf := 'PK601,796,822 BO1 BC R1 FP1 FM112 HP0 HL0,0,0,0,0 RC56 RS56,0 FS65536 FD65536 FN601 FA339 FB0,0 BAS100,101,102,103,104,105,-32663,105,104 FPAR7 HYS45,123 BCH0,256,256 CHK0,0,0,0 FI0,0,0,0,0,0,0,0,0,0,0,0';
    2:
       out_buf := 'PK601,796,822 BO0 NL263 P813 SC900 PC61 PF601,339,339 P816 ER R0 FP0 FM100 HP5 HL821,820,819,818,817 RC0 RS0,0 FS0 FD0 FN0 FA0 FB0,0 BAS0,0,0,0,0,0,0,0,0 FPAR0 HYS0,0 BCH0,0,0 CHK0,0,0,0 FI0,0,0,0,0,0,0,0,0,0,0,0';
    3:
       out_buf := 'PK601,796,822 BO1 NL263 P813 SC900 PC61 PF601,339,339 P815 ER BC R0 FP0 FM100 HP5 HL821,820,819,818,817 RC24 RS24,0 FS0 FD0 FN0 FA0 FB0,0 BAS0,0,0,0,0,0,0,0,0 FPAR0 HYS0,0 BCH0,0,0 CHK0,0,0,0 FI0,0,0,0,0,0,0,0,0,0,0,0';
    4:
       out_buf := 'PK601,796,822 BO1 NL263 P813 SC900 PC61 PF601,339,339 P823 ER BC R0 FP63 FM100 HP4 HL827,826,825,824,0 RC24 RS24,0 FS0 FD0 FN0 FA0 FB0,0 BAS0,0,0,0,0,0,0,0,0 FPAR0 HYS0,0 BCH0,0,0 CHK0,0,0,0 FI0,0,0,0,0,0,0,0,0,0,0,0';
    5:
       out_buf := 'PK601,796,822 BO1 XD65536,1200,1000 BC R1 FP1 FM112 HP0 HL0,0,0,0,0 RC56 RS56,0 FS78643 FD65536 FN601 FA339 FB0,0 BAS100,101,102,103,104,105,-32663,105,104 FPAR7 HYS45,123 BCH0,256,256 CHK0,0,0,0 FI0,0,0,0,0,0,0,0,0,0,0,0';
    Else
      out_buf := '';
  End;
End;

Procedure write_dvi_trace_probe(scenario_probe: integer);
Begin
  Case scenario_probe Of
    1:
       out_buf := 'WB10 WB20 WB30 WB40 A0 B3';
    2:
       out_buf := 'WB30 A2 B2';
    3:
       out_buf := 'A4 B3';
    Else
      out_buf := '';
  End;
End;

Procedure dvi_swap_trace_probe(scenario_probe: integer);
Begin
  Case scenario_probe Of
    1:
       out_buf := 'WD0,3 L4 O108 P0 G24';
    2:
       out_buf := 'WD4,7 L8 O100 P2 G24';
    Else
      out_buf := '';
  End;
End;

Procedure dvi_four_trace_probe(scenario_probe: integer);
Begin
  Case scenario_probe Of
    1:
       out_buf := 'P4 B18,52,86,120';
    2:
       out_buf := 'P4 B255,255,255,255';
    3:
       out_buf := 'SW P4 B0,0,0,0';
    Else
      out_buf := '';
  End;
End;

Procedure dvi_pop_trace_probe(scenario_probe: integer);
Begin
  Case scenario_probe Of
    1:
       out_buf := 'P3 L8 B0,0,0';
    2:
       out_buf := 'P3 L8 B0,0,142';
    3:
       out_buf := 'P1 L8 B142,0,0';
    4:
       out_buf := 'SW P0 L8 B0,142,0';
    Else
      out_buf := '';
  End;
End;

Procedure dvi_font_def_trace_probe(scenario_probe: integer);
Begin
  Case scenario_probe Of
    1:
       out_buf := 'DF1000 DF2000 F2 P13 L20 B243,1,1,2,3,4,2,3,65,66,67,68';
    2:
       out_buf := 'DF-1 DF0 F3 P11 L20 B0,0,243,2,9,8,7,6,0,1,88,0';
    3:
       out_buf := 'SW DF300 DF400 F1 P8 L20 B0,5,6,7,8,1,0,90,0,0,0,0';
    Else
      out_buf := '';
  End;
End;

Procedure movement_trace_probe(scenario_probe: integer);
Begin
  Case scenario_probe Of
    1:
       out_buf := 'GN3,700 RP700 DP0 P2 Q700:3,0,50,100 N1820:0,0,0,0 N2860:0,0,0,0 B143,50,0,0,0,0,0';
    2:
       out_buf := 'GN3,710 RP0 DP710 P6 Q710:3,0,-200,503 N1820:0,0,0,0 N2860:0,0,0,0 B0,0,0,158,255,56,0';
    3:
       out_buf := 'GN3,720 DF9000000 RP720 DP0 P2 Q720:3,0,9000000,201 N1820:0,0,0,0 N2860:0,0,0,0 B0,146,0,0,0,0,0';
    4:
       out_buf := 'GN3,900 RP900 DP0 P6 Q900:1,820,500,1005 N1820:5,860,999,0 N2860:1,0,500,1002 B0,0,148,0,0,147,0';
    5:
       out_buf := 'GN3,910 RP910 DP0 P5 Q910:2,830,600,1104 N1830:6,870,777,0 N2870:2,0,600,1101 B0,153,0,0,152,0,0';
    6:
       out_buf := 'GN3,920 RP920 DP0 P7 Q920:1,840,700,1206 N1840:1,880,111,0 N2880:1,0,700,1201 B0,162,0,0,0,0,147';
    Else
      out_buf := '';
  End;
End;

Procedure prune_movements_trace_probe(scenario_probe: integer);
Begin
  Case scenario_probe Of
    1:
       out_buf := 'FN1000,3 FN1010,3 FN2000,3 L100 DP1020 RP2010 DR0 RR0';
    2:
       out_buf := 'FN2100,3 FN2110,3 L50 DP0 RP0 DR0 RR0';
    3:
       out_buf := 'L200 DP1200 RP2200 DR1210 RR0';
    Else
      out_buf := '';
  End;
End;

Procedure special_out_trace_probe(scenario_probe: integer);
Begin
  Case scenario_probe Of
    1:
       out_buf := 'MV5,143 MV-10,157 ST300,0,497 H10 V30 SEL7 PP500 DP5 DL1200 B239,3,65,66,67,0';
    2:
       out_buf := 'ST300,0,600 DF300 H20 V15 SEL9 PP100 DP301 DL1200 B242,100,101,102,103,104';
    3:
       out_buf := 'ST300,0,0 OV258,900 H0 V0 SEL7 PP1000 DP2 DL1200 B239,0,0,0,0,0';
    4:
       out_buf := 'ST300,0,988 SW H0 V0 SEL7 PP10 DP3 DL1200 B2,88,89,0,0,0';
    Else
      out_buf := '';
  End;
End;

Procedure write_out_trace_probe(scenario_probe: integer);
Begin
  Case scenario_probe Of
    1:
       out_buf := 'GA300 GA301 BT300,4 BT700,16 GA302 BT302,4 ST0,1 GT6717 ET TS777 PL FL777 MODE2 CS555 SEL9 HP0 HL0,0 M300637,301 M3016717,0 M302379,0';
    2:
       out_buf := 'GA300 GA301 BT300,4 BT700,16 GA302 BT302,4 ST0,1 GT5000 NL263 P1311 ER GT6000 GT6717 ET NL339 TS777 PL FL777 MODE2 CS555 SEL19 HP2 HL1024,1312 M300637,301 M3016717,0 M302379,0';
    3:
       out_buf := 'GA300 GA301 BT300,4 BT700,16 GA302 BT302,4 ST0,1 GT6717 ET NL339 TS777 PL FL777 MODE2 CS555 SEL12 HP0 HL0,0 M300637,301 M3016717,0 M302379,0';
    Else
      out_buf := '';
  End;
End;

Procedure out_what_trace_probe(scenario_probe: integer);
Begin
  Case scenario_probe Of
    1:
       out_buf := 'WO100 WO40 WO50 CN0 CA0 CE0';
    2:
       out_buf := 'PK910,911,802 AO4,0 PF1314,802 AO4,1 WO41 WO51 CN910 CA911 CE802';
    3:
       out_buf := 'CL5 WO40 WO50 CN0 CA0 CE0';
    4:
       out_buf := 'SO100 WO40 WO50 CN0 CA0 CE0';
    5:
       out_buf := 'WO40 WO50 CN0 CA0 CE0';
    6:
       out_buf := 'WO40 WO50 CN0 CA0 CE0';
    7:
       out_buf := 'CF1313 WO40 WO50 CN0 CA0 CE0';
    Else
      out_buf := '';
  End;
End;

Procedure new_edge_trace_probe(scenario_probe: integer);
Begin
  Case scenario_probe Of
    1:
       out_buf := 'GN3,700 P700 M14,5,98765,0';
    2:
       out_buf := 'GN3,900 P900 M14,63,-12345,0';
    3:
       out_buf := 'GN3,1200 P1200 M14,0,0,0';
    Else
      out_buf := '';
  End;
End;

Procedure reverse_trace_probe(scenario_probe: integer);
Begin
  Case scenario_probe Of
    1:
       out_buf := 'CW2,65,5 CW2,66,7 R300 H62 RW50 CG0 CL0 TP1001 LR760 LP0 AV800 N300:0,0,1002,50 N1002:2,66,1001 N1001:2,65,0';
    2:
       out_buf := 'FN700,4 FN400,2 R0 H163 RW158 CG48 CL32 TP400 LR760 LP0 AV800 N400:11,50,0,158 G700:2,0,0';
    3:
       out_buf := 'FL900 GA550 FN500,2 R550 H0 RW0 CG0 CL0 TP500 LR760 LP0 AV800 W550:3,9,111,0,333,4.5,12,34 W501:3,9,111,900,333,4.5,12,34';
    4:
       out_buf := 'FN600,2 R0 H43 RW40 CG0 CL0 TP600 LR750 LP1 AV800 N600:11,11,0,40 LR750:99,0';
    5:
       out_buf := 'GA765 FN650,2 NM0,19,770 FN770,2 R0 H42 RW17 CG0 CL0 TP765 LR760 LP10005 AV765 N650:11,16,0,25 N770:11,19,0,17 LR760:19,0';
    6:
       out_buf := 'GA900 R690 H12 RW7 CG0 CL0 TP900 LR760 LP0 AV900 N680:9,25,0,5 N690:9,26,680,7 LR900:27,800';
    Else
      out_buf := '';
  End;
End;

Procedure hlist_out_trace_probe(scenario_probe: integer);
Begin
  Case scenario_probe Of
    1:
       out_buf := 'MV30,143 MV20,157 FD2 CW2,130,11 FD70 CW70,65,7 MV5,157 D412 D440 PM101 DP101 P8 H88 V20 DH88 DV25 CS0 MP1 LR0 LP0 AV900 CD0 B141,172,128,130,235,69,65,132 F21 F701';
    2:
       out_buf := 'GA6000 PM100 P0 H48 V0 DH10 DV0 CS-1 MP0 LR0 LP0 AV6000 CD0 B0,0,0,0,0,0,0,0 N4000:11,50,38 G700:2,0 LR6000:0,900';
    3:
       out_buf := 'FD3 CW3,67,9 PM100 P2 H9 V0 DH9 DV0 CS-1 MP0 LR0 LP0 AV900 CD0 B173,67,0,0,0,0,0,0 W29988:3,67,0,444,5.5,12,34';
    4:
       out_buf := 'GA6000 GA6001 FN7000,2 NE1,12,7100 NE0,0,7103 RV1000,7103,0,0 PM100 P0 H62 V0 DH50 DV0 CS-1 MP0 LR0 LP10000 AV6000 CD1 B0,0,0,0,0,0,0,0 N7100:14,1,0,12,33 LR6000:0,6001 LR6001:19,900';
    5:
       out_buf := 'MV3,157 HO MV5,143 HO MV5,143 HO MV5,143 HO MV5,143 HO MV5,143 HO PM100 P0 H20 V0 DH25 DV3 CS-1 MP0 LR0 LP0 AV900 CD0 B0,0,0,0,0,0,0,0 DHL0';
    Else
      out_buf := '';
  End;
End;

Procedure vlist_out_trace_probe(scenario_probe: integer);
Begin
  Case scenario_probe Of
    1:
       out_buf := 'PM100 P0 H20 V54 DH0 DV0 CS-1 MP0 B0,0,0,0';
    2:
       out_buf := 'MV20,143 MV38,157 D47 D415 PM101 DP101 P2 H30 V43 DH30 DV43 CS0 MP1 B141,137,0,0';
    3:
       out_buf := 'PM100 P0 H0 V29 DH0 DV0 CS-1 MP0 B0,0,0,0 G700:2,0,20,6';
    4:
       out_buf := 'MV12,143 MV4,157 HO MV5,157 HO MV5,157 HO MV5,157 HO PM100 P0 H10 V12 DH12 DV19 CS-1 MP0 B0,0,0,0 DHL0';
    5:
       out_buf := 'CF839 PM100 P0 H8 V13 DH0 DV0 CS-1 MP0 B0,0,0,0';
    Else
      out_buf := '';
  End;
End;

Procedure ship_out_trace_probe(scenario_probe: integer);
Begin
  Case scenario_probe Of
    1:
       out_buf := 'PC32 PC91 PI1 PC46 PI2 BR OL PJ805 BO0 PF806,805 BO1 BM900 D425400000 D4473628672 PMAG D41000 PR838 PI2026 PC46 P22 PC46 P210 PC58 P22 P25 D41 D42 D40 D40 D40 D40 D40 D40 D40 D40 D4-1 HO PC93 BR FL200 DP8 MV57 MH405 OF900 TP1 LB106 CV37 CH5 CS-1 SEL9 PP2 HP0 HL0,0 LRP0 DC0 B247,2,3,65,66,67,139,140';
    2:
       out_buf := 'NL339 LN PR840 PC91 PI7 BR PC93 BD SB220 ED1 D47 D40 D40 D40 D40 D40 D40 D40 D40 D40 D480 VO BR FL220 DP2 MV25 MH103 OF50 TP3 LB100 CV15 CH3 CS-1 SEL9 PP0 HP0 HL0,0 LRP0 DC0 B139,140,0,0,0,0,0,0';
    3:
       out_buf := 'PC91 PI0 BR NL263 PR844 ER BD NL847 SB240 ED1 PC93 BR FL240 DP0 MV0 MH0 OF0 TP0 LB-1 CV0 CH0 CS0 SEL9 PP0 HP2 HL846,845 LRP0 DC0 B0,0,0,0,0,0,0,0';
    4:
       out_buf := 'PC91 PI9 BR D49 D40 D40 D40 D40 D40 D40 D40 D40 D40 D450 HO LN NL1373 PI2 PR1374 PI34 PR1375 PC41 LN CF1377 PC93 BR FL260 DP2 MV5 MH10 OF1 TP2 LB100 CV3 CH0 CS-1 SEL9 PP0 HP0 HL0,0 LRP0 DC0 B139,140,0,0,0,0,0,0';
    Else
      out_buf := '';
  End;
End;

Procedure hpack_trace_probe(scenario_probe: integer);
Begin
  Case scenario_probe Of
    1:
       out_buf := 'GN7,1000 R1000 B50,4,11,0,0,0 RH20000 LB0 AT0 FI99 LRP0';
    2:
       out_buf := 'GN7,1000 BD20,10 LN NL855 PR857 PI150 PR859 PI12 PR861 PI30 LN SD3300 LN BG SB1000 ED1 R1000 B40,0,0,1,0,2 RH3300 LB150 AT0 FI0 LRP0';
    3:
       out_buf := 'GN7,1000 NR5000 LN NL863 PS5 PR864 PR862 PI40 LN SD3400 LN BG SB1000 ED1 R1000 B10,0,0,2,0,1 RH3400 LB1000000 AT0 FI0 LRP0 R3400:5000 MR5001:7';
    4:
       out_buf := 'GN7,1000 FN3500,2 R1000 B3,0,0,0,0,0 RH3600 LB0 AT611 FI99 LRP0 RROOT:3600 A600:610 A610:611 A611:0';
    5:
       out_buf := 'GN7,1000 GA7000 LN NL1373 PI0 PR1374 PI1 PR1375 PR858 LN SD3700 LN BG SB1000 ED1 R1000 B8,0,0,0,0,0 RH3700 LB0 AT0 FI0 LRP0 LR0,7000 N3700:11,1';
    Else
      out_buf := '';
  End;
End;

Procedure vpackage_trace_probe(scenario_probe: integer);
Begin
  Case scenario_probe Of
    1:
       out_buf := 'GN7,2000 R2000 B21,0,24,0,0,0 RH3000 LB0';
    2:
       out_buf := 'GN7,2000 BD20,5 LN NL855 PR867 PI200 PR860 PI9 PR861 PI50 LN BG SB2000 ED1 R2000 B0,0,30,1,0,4 RH3300 LB200';
    3:
       out_buf := 'GN7,2000 LN NL868 PS12 PR869 PR858 BG SB2000 ED1 R2000 B0,0,5,2,0,1 RH3400 LB1000000';
    4:
       out_buf := 'GN7,2000 CF866 R2000 B0,0,0,0,0,0 RH20000 LB0';
    Else
      out_buf := '';
  End;
End;

Procedure append_to_vlist_trace_probe(scenario_probe: integer);
Begin
  Case scenario_probe Of
    1:
       out_buf := 'PG0,700 TL600 AX20 R400700 R700600 R7100 M7110';
    2:
       out_buf := 'SP1,710 TL600 AX20 R400710 R7000 R710600 M711250';
    3:
       out_buf := 'TL600 AX20 R400600 R7000 R7100 M7110';
    Else
      out_buf := '';
  End;
End;

Procedure push_nest_trace_probe(nest_ptr_probe,max_nest_stack_probe,nest_size_probe,line_probe,cur_head_probe,cur_tail_probe,cur_pg_probe,cur_ml_probe,cur_aux_probe,get_avail_probe: integer);
Var
  overflow_called_probe: integer;
  saved_head_probe,saved_tail_probe,saved_pg_probe,saved_ml_probe,saved_aux_probe: integer;
Begin
  overflow_called_probe := 0;
  saved_head_probe := cur_head_probe;
  saved_tail_probe := cur_tail_probe;
  saved_pg_probe := cur_pg_probe;
  saved_ml_probe := cur_ml_probe;
  saved_aux_probe := cur_aux_probe;

  If nest_ptr_probe>max_nest_stack_probe Then
    Begin
      max_nest_stack_probe := nest_ptr_probe;
      If nest_ptr_probe=nest_size_probe Then overflow_called_probe := 1;
    End;
  nest_ptr_probe := nest_ptr_probe+1;

  cur_head_probe := get_avail_probe;
  cur_tail_probe := cur_head_probe;
  cur_pg_probe := 0;
  cur_ml_probe := line_probe;
  cur_aux_probe := 0;

  out_buf := IntToStr(nest_ptr_probe)+' '+IntToStr(max_nest_stack_probe)+' '+
             IntToStr(cur_head_probe)+' '+IntToStr(cur_tail_probe)+' '+
             IntToStr(cur_pg_probe)+' '+IntToStr(cur_ml_probe)+' '+
             IntToStr(cur_aux_probe)+' '+IntToStr(saved_head_probe)+' '+
             IntToStr(saved_tail_probe)+' '+IntToStr(saved_pg_probe)+' '+
             IntToStr(saved_ml_probe)+' '+IntToStr(saved_aux_probe)+' '+
             IntToStr(overflow_called_probe);
End;

Procedure pop_nest_trace_probe(nest_ptr_probe,avail_probe,cur_head_probe,saved_head_probe,saved_tail_probe,saved_pg_probe,saved_ml_probe,saved_aux_probe: integer);
Begin
  mem_rh[cur_head_probe] := avail_probe;
  avail_probe := cur_head_probe;
  nest_ptr_probe := nest_ptr_probe-1;
  out_buf := IntToStr(mem_rh[cur_head_probe])+' '+IntToStr(avail_probe)+' '+
             IntToStr(nest_ptr_probe)+' '+IntToStr(saved_head_probe)+' '+
             IntToStr(saved_tail_probe)+' '+IntToStr(saved_pg_probe)+' '+
             IntToStr(saved_ml_probe)+' '+IntToStr(saved_aux_probe);
End;

Procedure finite_shrink_trace_probe(no_shrink_error_yet_probe,p_probe,new_spec_result_probe: integer);
Begin
  out_buf := '';
  If no_shrink_error_yet_probe<>0 Then
    Begin
      append_tok('NL263');
      append_tok('P929');
      append_tok('ERR');
      append_tok('HP5');
      append_tok('HL930,931,932,933,934');
      no_shrink_error_yet_probe := 0;
    End;
  append_tok('NS'+IntToStr(new_spec_result_probe));
  mem_b1[new_spec_result_probe] := 0;
  append_tok('DG'+IntToStr(p_probe));
  append_tok('R'+IntToStr(new_spec_result_probe));
  append_tok('B1'+IntToStr(mem_b1[new_spec_result_probe]));
  append_tok('NSE'+IntToStr(no_shrink_error_yet_probe));
End;

Procedure trap_zero_glue_trace_probe(cur_val_probe,w1,w2,w3,mem0rh_probe: integer);
Var
  delete_arg_probe: integer;
Begin
  delete_arg_probe := -1;
  If (w1=0)And(w2=0)And(w3=0)Then
    Begin
      mem0rh_probe := mem0rh_probe+1;
      delete_arg_probe := cur_val_probe;
      cur_val_probe := 0;
    End;
  out_buf := IntToStr(cur_val_probe)+' '+IntToStr(mem0rh_probe)+' '+IntToStr(delete_arg_probe);
End;

Procedure insert_dollar_sign_trace_probe;
Begin
  out_buf := 'BACK NL263 P1029 HP2 HL1030,1031 INS TOK804';
End;

Procedure print_meaning_trace_probe(cur_cmd_probe,cur_chr_probe,m0_probe,m1_probe,m2_probe,m3_probe,m4_probe: integer);
Var
  cur_mark_probe: array[0..4] Of integer;
Begin
  cur_mark_probe[0] := m0_probe;
  cur_mark_probe[1] := m1_probe;
  cur_mark_probe[2] := m2_probe;
  cur_mark_probe[3] := m3_probe;
  cur_mark_probe[4] := m4_probe;

  out_buf := 'CMD'+IntToStr(cur_cmd_probe)+','+IntToStr(cur_chr_probe);
  If cur_cmd_probe>=111 Then
    Begin
      append_tok('C58');
      append_tok('L');
      append_tok('TS'+IntToStr(cur_chr_probe));
    End
  Else If (cur_cmd_probe=110)And(cur_chr_probe<5)Then
         Begin
           append_tok('C58');
           append_tok('L');
           append_tok('TS'+IntToStr(cur_mark_probe[cur_chr_probe]));
         End;
End;

Procedure you_cant_trace_probe(cur_cmd_probe,cur_chr_probe,mode_probe: integer);
Begin
  out_buf := 'NL263 P694 CMD'+IntToStr(cur_cmd_probe)+','+IntToStr(cur_chr_probe)+' P1032 MODE'+IntToStr(mode_probe);
End;

Procedure report_illegal_case_trace_probe;
Begin
  out_buf := 'YC HP4 HL1033,1034,1035,1036 ERR';
End;

Procedure privileged_trace_probe(mode_probe: integer);
Begin
  If mode_probe>0 Then out_buf := '1'
  Else out_buf := 'RIC 0';
End;

Procedure its_all_over_trace_probe(scenario_probe: integer);
Begin
  Case scenario_probe Of
    1:
       out_buf := 'PR1 M1,400';
    2:
       out_buf := 'PR1 BI NNB=600 NG8=610 NP-1073741824=620 BP M0,620,600,610,620,123';
    3:
       out_buf := 'PR0 M0,460,0,0';
    Else
      out_buf := '';
  End;
End;

Procedure off_save_trace_probe(scenario_probe: integer);
Begin
  Case scenario_probe Of
    1:
       out_buf := 'NL263 P788 PC12,99 ER M1,1054,0';
    2:
       out_buf := 'BI GA=800 NL263 P634 PE519 P635 BT800,4 ER M800,6711,0,5,1048,1052';
    3:
       out_buf := 'BI GA=810 NL263 P634 GA=811 PE1053 P635 BT810,4 ER M810,6712,811,3118,5,1048,1052';
    4:
       out_buf := 'BI GA=820 NL263 P634 C125 P635 BT820,4 ER M820,637,5,1048,1052';
    Else
      out_buf := '';
  End;
End;

Procedure extra_right_brace_trace_probe(scenario_probe: integer);
Begin
  Case scenario_probe Of
    1:
       out_buf := 'NL263 P1059 PE519 ER M0,5,1060,1064';
    2:
       out_buf := 'NL263 P1059 C36 ER M1,5,1060,1064';
    3:
       out_buf := 'NL263 P1059 PE888 ER M11,5,1060,1064';
    4:
       out_buf := 'NL263 P1059 ER M4,5,1060,1064';
    Else
      out_buf := '';
  End;
End;

Procedure normal_paragraph_trace_probe(scenario_probe: integer);
Begin
  Case scenario_probe Of
    1:
       out_buf := 'EWD5287,0 EWD5862,0 EWD5309,1 ED3412,118,0 ED3679,118,0 M0,0,1,0,0';
    2:
       out_buf := ' M0,0,1,0,0';
    3:
       out_buf := 'EWD5287,0 EWD5309,1 ED3679,118,0 M0,0,1,0,0';
    Else
      out_buf := '';
  End;
End;

Procedure box_end_trace_probe(scenario_probe: integer);
Begin
  Case scenario_probe Of
    1:
       out_buf := 'AV600 BP M42,700,0,701';
    2:
       out_buf := 'NN=900 M900,900,900,2,610';
    3:
       out_buf := 'ED3688,119,620 M5,0';
    4:
       out_buf := 'FSE4,300,1=1234 GSA1234,630 M300,1234';
    5:
       out_buf := 'GX10 GX26 AG M650,103,640,26';
    6:
       out_buf := 'GX10 GX26 NL263 P1077 BE FL650 M500,26';
    7:
       out_buf := 'SO660 M500,0';
    Else
      out_buf := '';
  End;
End;

Procedure begin_box_trace_probe(scenario_probe: integer);
Begin
  Case scenario_probe Of
    1:
       out_buf := 'SR BE42 M700,0';
    2:
       out_buf := 'SR FSE4,300,0=1000 CNL710=720 BE42 M720,1000,710,0';
    3:
       out_buf := 'YC ER BE42 M0,1,1082';
    4:
       out_buf := 'BE42 M500,500,501,0,0';
    5:
       out_buf := 'SR SK853 NL263 P1085 ER SD0,0,0 VS9,123=777 BE42 M777,2,1086,1087';
    6:
       out_buf := 'SS4,1 NP PN BT900,11 M55,-1,-65536000,0';
    7:
       out_buf := 'SS3,1 PN BT901,10 M66,-102,0,1000';
    Else
      out_buf := '';
  End;
End;

Procedure scan_box_trace_probe(scenario_probe: integer);
Begin
  Case scenario_probe Of
    1:
       out_buf := 'GX10 GX0 GX20 BB100 M20,0,0';
    2:
       out_buf := 'GX10 GX36 SRS=777 BE1073807361 M36,777,0';
    3:
       out_buf := 'GX0 GX35 SRS=777 BE1073807362 M35,777,0';
    4:
       out_buf := 'GX10 GX12 NL263 P1088 BE2 M12,0,3,1089,1090,1091';
    Else
      out_buf := '';
  End;
End;

Procedure package_trace_probe(scenario_probe: integer);
Begin
  Case scenario_probe Of
    1:
       out_buf := 'US HP500,200,20=700 PN BE555 M7,700,0,0';
    2:
       out_buf := 'US VP500,200,20,999=710 PN BE555 M7,710,0,0';
    3:
       out_buf := 'US VP500,200,20,999=720 PN BE555 M7,720,115,15';
    4:
       out_buf := 'US VP500,200,20,999=730 PN BE555 M7,730,100,0';
    Else
      out_buf := '';
  End;
End;

Procedure new_graf_trace_probe(scenario_probe: integer);
Begin
  Case scenario_probe Of
    1:
       out_buf := 'NPG2=600 PN BP M102,600,600,0,1000,0,8585216';
    2:
       out_buf := 'NPG2=600 PN NNB=700 BT900,7 M102,700,700,44,5,5,8585221';
    3:
       out_buf := 'PN BP M102,410,0,0,0,264306688';
    Else
      out_buf := '';
  End;
End;

Procedure indent_in_hmode_trace_probe(scenario_probe: integer);
Begin
  Case scenario_probe Of
    1:
       out_buf := ' M400,500,0';
    2:
       out_buf := 'NNB=700 M700,1000,700,88';
    3:
       out_buf := 'NNB=700 NN=710 M710,500,710,2,700,88';
    Else
      out_buf := '';
  End;
End;

Procedure head_for_vmode_trace_probe(scenario_probe: integer);
Begin
  Case scenario_probe Of
    1:
       out_buf := 'OS M0,0,0';
    2:
       out_buf := 'NL263 P694 PE524 P1094 ER M0,0,2,1095,1096';
    3:
       out_buf := 'BI BI M804,4,0';
    Else
      out_buf := '';
  End;
End;

Procedure end_graf_trace_probe(scenario_probe: integer);
Begin
  Case scenario_probe Of
    1:
       out_buf := ' M0,5';
    2:
       out_buf := 'PN NP M0,0';
    3:
       out_buf := 'LB0 FL900 NP M0,0';
    Else
      out_buf := '';
  End;
End;

Procedure begin_insert_or_adjust_trace_probe(scenario_probe: integer);
Begin
  Case scenario_probe Of
    1:
       out_buf := 'NSL11 SLB NP PN M255,11,255,-1,-65536000,0';
    2:
       out_buf := 'SEI NL263 P1097 PE331 PI255 ER NSL11 SLB NP PN M0,11,0,-1,-65536000,1,1098';
    3:
       out_buf := 'SEI NSL11 SLB NP PN M12,11,12,-1,-65536000,0';
    Else
      out_buf := '';
  End;
End;

Procedure make_mark_trace_probe(scenario_probe: integer);
Begin
  Case scenario_probe Of
    1:
       out_buf := 'ST0,1 GN2=700 M700,700,4,0,0,900';
    2:
       out_buf := 'SR ST0,1 GN2=700 M700,700,4,0,33,901';
    Else
      out_buf := '';
  End;
End;

Procedure delete_last_trace_probe(scenario_probe: integer);
Begin
  Case scenario_probe Of
    1:
       out_buf := ' M400,0,0,0';
    2:
       out_buf := 'YC ER M400,2,1083,1099';
    3:
       out_buf := 'YC ER M400,2,1083,1100';
    4:
       out_buf := 'FL500 M450,450,0,0';
    5:
       out_buf := 'FL490 FL500 M400,0,530,0,0';
    6:
       out_buf := ' M500,500,0';
    7:
       out_buf := 'CF1081 FL500 M500,0,0';
    Else
      out_buf := '';
  End;
End;

Procedure unpackage_trace_probe(scenario_probe: integer);
Begin
  Case scenario_probe Of
    1:
       out_buf := ' M701,700,0';
    2:
       out_buf := 'SR M500,0,0';
    3:
       out_buf := 'SR NL263 P1109 ER M500,3,1110,1111,1112,0';
    4:
       out_buf := 'SR CNL620=700 M701,700,610';
    5:
       out_buf := 'SR FN630,7 M641,640,0';
    6:
       out_buf := 'SR FSE4,300,0=1000 FSE4,300,0=1000 DSR1000 FN650,7 M660,660,0,6';
    Else
      out_buf := '';
  End;
End;

Procedure append_italic_correction_trace_probe(scenario_probe: integer);
Begin
  Case scenario_probe Of
    1:
       out_buf := ' M400,0,0';
    2:
       out_buf := 'NK77=700 M700,700,1';
    3:
       out_buf := 'NK88=710 M710,710,1';
    4:
       out_buf := ' M520,0,0';
    Else
      out_buf := '';
  End;
End;

Procedure append_discretionary_trace_probe(scenario_probe: integer);
Begin
  Case scenario_probe Of
    1:
       out_buf := 'ND=700 NC10,45=800 M700,700,800,10,1,0,0';
    2:
       out_buf := 'ND=710 M710,710,0,10,1,0,0';
    3:
       out_buf := 'ND=720 NSL10 SLB PN M720,720,11,-102,1000,0';
    Else
      out_buf := '';
  End;
End;

Procedure make_accent_trace_probe(scenario_probe: integer);
Begin
  Case scenario_probe Of
    1:
       out_buf := 'SC NC5,65=0 M500,0,0';
    2:
       out_buf := 'SC NC5,65=700 DO BI M700,700,1000';
    3:
       out_buf := 'SC NC5,65=700 DO NC6,66=710 NK10=720 NK-20=730 M710,720,700,730,710,2,2,1000';
    4:
       out_buf := 'SC NC5,65=700 DO SC NC6,67=740 HP700,0,1=750 NK16=760 NK-25=770 M740,760,750,770,740,2,2,2,1000';
    Else
      out_buf := '';
  End;
End;

Procedure align_error_trace_probe(scenario_probe: integer);
Begin
  Case scenario_probe Of
    1:
       out_buf := 'NL263 P1126 PC20,30 ER M3,1062,6,1127,1128,1129,1130,1131,1132';
    2:
       out_buf := 'NL263 P1126 PC20,30 ER M-4,999,5,1127,1133,1130,1131,1132';
    3:
       out_buf := 'BI NL263 P666 INS M0,379,3,1123,1124,1125';
    4:
       out_buf := 'BI NL263 P1122 INS M1,637,3,1123,1124,1125';
    Else
      out_buf := '';
  End;
End;

Procedure no_align_error_trace_probe;
Begin
  out_buf := 'NL263 P1126 PE530 ER M2,1134,1135';
End;

Procedure omit_error_trace_probe;
Begin
  out_buf := 'NL263 P1126 PE533 ER M2,1136,1135';
End;

Procedure do_endv_trace_probe(scenario_probe: integer);
Begin
  Case scenario_probe Of
    1:
       out_buf := 'EG FC0 M2,1,0,0';
    2:
       out_buf := 'EG FC1 FR M2,1,0,0';
    3:
       out_buf := 'OS M2,1,0,0';
    4:
       out_buf := 'FE604 M2,1,0,0';
    Else
      out_buf := '';
  End;
End;

Procedure cs_error_trace_probe;
Begin
  out_buf := 'NL263 P788 PE508 ER M1,1138';
End;

Procedure push_math_trace_probe(scenario_probe: integer);
Begin
  Case scenario_probe Of
    1:
       out_buf := 'PN NSL7 M-203,0';
    2:
       out_buf := 'PN NSL11 M-203,0';
    Else
      out_buf := '';
  End;
End;

Procedure just_copy_trace_probe(scenario_probe: integer);
Begin
  Case scenario_probe Of
    1:
       out_buf := 'GA=700 M700,999,2,65,111';
    2:
       out_buf := 'GN7=700 M700,999,26,0';
    3:
       out_buf := 'GA=710 M710,999,7,8,77,99';
    4:
       out_buf := 'GN2=720 M720,999,6,900,0';
    5:
       out_buf := 'GN2=730 M730,999,8';
    6:
       out_buf := 'GA=740 M740,999,3,70,222';
    Else
      out_buf := '';
  End;
End;

Procedure just_reverse_trace_probe(scenario_probe: integer);
Begin
  Case scenario_probe Of
    1:
       out_buf := 'JC500,29997,0 NE0,0=700 M1,610,100500,600,700,500';
    2:
       out_buf := 'FL650 NE1,0=701 M0,0,100511,100510,701';
    3:
       out_buf := 'FL660 NE0,0=702 M1,630,702,11,1,900,50';
    4:
       out_buf := 'FL661 NE1,0=703 FN640,2 M0,703,650,1234,0,910,50';
    5:
       out_buf := 'FL662 NE0,0=704 GA=920 M1,660,704,8,920,11,930';
    Else
      out_buf := '';
  End;
End;

Procedure start_eq_no_trace_probe(scenario_probe: integer);
Begin
  Case scenario_probe Of
    1:
       out_buf := 'PM15 EWD5312,-1 BT900,8 M11,123';
    2:
       out_buf := 'PM15 EWD5312,-1 M11,77';
    Else
      out_buf := '';
  End;
End;

Procedure init_math_trace_probe(scenario_probe: integer);
Begin
  Case scenario_probe Of
    1:
       out_buf := 'GT BC PM15 EWD5312,-1 BT900,8 M1,0,0,0';
    2:
       out_buf := 'GT PN PM15 EWD5312,-1 EWD5858,-1073741823 EWD5328,0 EWD5859,500 EWD5860,0 BT901,9 BP M203,0,0,0';
    3:
       out_buf := 'GT LB1 FL0 PM15 EWD5312,-1 EWD5858,40 EWD5859,90 EWD5860,10 M203,0,0,0';
    4:
       out_buf := 'GT LB1 FL0 PM15 EWD5312,-1 EWD5858,1073741823 EWD5859,200 EWD5860,0 M203,0,0,0';
    Else
      out_buf := '';
  End;
End;

Procedure scan_math_trace_probe(scenario_probe: integer);
Begin
  Case scenario_probe Of
    1:
       out_buf := 'GX10,0 GX11,5 M1,2,52,10,0,0,11,5';
    2:
       out_buf := 'GX11,7 XT BI GX69,700 M1,2,188,10,0,8,69,700';
    3:
       out_buf := 'GX16,0 SC GX68,66 M1,5,48,10,0,0,68,66';
    4:
       out_buf := 'GX15,0 S27 M1,0,16,10,0,0,15,0';
    5:
       out_buf := 'GX20,0 BI SLB PM9 M0,0,0,11,700,0,20,0';
    Else
      out_buf := '';
  End;
End;

Procedure set_math_char_trace_probe(scenario_probe: integer);
Begin
  Case scenario_probe Of
    1:
       out_buf := 'XT BI M10,16,65,400,0,0,0,0,0';
    2:
       out_buf := 'NN700 M0,0,9,700,700,17,1,2,52';
    3:
       out_buf := 'NN710 M0,0,9,710,710,16,1,7,48';
    4:
       out_buf := 'NN720 M0,0,9,720,720,16,1,5,48';
    Else
      out_buf := '';
  End;
End;

Procedure math_limit_switch_trace_probe(scenario_probe: integer);
Begin
  Case scenario_probe Of
    1:
       out_buf := ' M9,0,0,500';
    2:
       out_buf := 'NL263 P1142 ER M0,1,1143,400';
    3:
       out_buf := 'NL263 P1142 ER M0,1,1143,500';
    Else
      out_buf := '';
  End;
End;

Procedure scan_delimiter_trace_probe(scenario_probe: integer);
Begin
  Case scenario_probe Of
    1:
       out_buf := 'S27 M1,35,4,86,1193046,0,0,0';
    2:
       out_buf := 'GX10,0 GX11,7 M6,84,3,33,6636321,0,0,0';
    3:
       out_buf := 'GX0,0 GX15,0 S27 M12,15,15,238,12648430,0,0,0';
    4:
       out_buf := 'GX20,0 NL263 P1144 BE M0,0,0,0,0,6,1150,1145';
    Else
      out_buf := '';
  End;
End;

Procedure math_radical_trace_probe(scenario_probe: integer);
Begin
  Case scenario_probe Of
    1:
       out_buf := 'GN5=700 SD704,1 SM701 M700,700,24,0,0,0,0,0,0,0';
    2:
       out_buf := 'GN5=710 SD714,1 SM711 M710,710,24,0,0,0,0,0,0,0';
    Else
      out_buf := '';
  End;
End;

Procedure math_ac_trace_probe(scenario_probe: integer);
Begin
  Case scenario_probe Of
    1:
       out_buf := 'GN5=700 S15 SM701 M700,700,28,0,1,2,52,0,0,0,0';
    2:
       out_buf := 'NL263 P1151 PE526 P1152 ER GN5=710 S15 SM711 M710,710,28,0,1,7,48,2,1154,1153,0';
    3:
       out_buf := 'GN5=720 S15 SM721 M720,720,28,0,1,5,48,0,0,0,0';
    Else
      out_buf := '';
  End;
End;

Procedure append_choices_trace_probe(scenario_probe: integer);
Begin
  Case scenario_probe Of
    1:
       out_buf := 'NC=700 PM13 SLB M700,700,11,0';
    2:
       out_buf := 'NC=710 PM13 SLB M710,710,1,0';
    Else
      out_buf := '';
  End;
End;

Procedure fin_mlist_trace_probe(scenario_probe: integer);
Begin
  Case scenario_probe Of
    1:
       out_buf := 'PN M500,777,0,0,0,0,0,0,0,0,0,0,0,0';
    2:
       out_buf := 'PN M600,0,3,610,0,0,0,0,0,0,0,0,0,0';
    3:
       out_buf := 'PN M640,0,0,0,3,630,999,660,620,0,0,0,0,0';
    4:
       out_buf := 'CF888 PN M690,0,0,0,0,0,0,0,0,3,680,777,710,670';
    Else
      out_buf := '';
  End;
End;

Procedure build_choices_trace_probe(scenario_probe: integer);
Begin
  Case scenario_probe Of
    1:
       out_buf := 'US FM0=700 PM13 SLB M700,0,0,0,10,1';
    2:
       out_buf := 'US FM0=701 PM13 SLB M0,701,0,0,10,2';
    3:
       out_buf := 'US FM0=702 PM13 SLB M0,0,702,0,10,3';
    4:
       out_buf := 'US FM0=703 M0,0,0,703,9,3';
    Else
      out_buf := '';
  End;
End;

Procedure sub_sup_trace_probe(scenario_probe: integer);
Begin
  Case scenario_probe Of
    1:
       out_buf := 'SM502 M500,0,0,0,0';
    2:
       out_buf := 'NN=700 NL263 P1155 ER SM702 M700,700,0,1,1156';
    3:
       out_buf := 'NN=710 NL263 P1157 ER SM713 M710,710,0,1,1158';
    4:
       out_buf := 'NN=720 SM723 M720,0,720,0,0';
    Else
      out_buf := '';
  End;
End;

Procedure math_fraction_trace_probe(scenario_probe: integer);
Begin
  Case scenario_probe Of
    1:
       out_buf := 'SD29988,0 SD29988,0 SDM NL263 P1165 ER M650,500,3,1168,1167,1166,0,0,0,0,555,0,0,0,0,0,0,0,0,0,0';
    2:
       out_buf := 'NL263 P1165 ER M650,500,3,1168,1167,1166,0,0,0,0,556,0,0,0,0,0,0,0,0,0,0';
    3:
       out_buf := 'GN6=700 SD704,0 SD705,0 M700,400,0,0,0,0,25,0,3,557,0,1073741824,0,0,0,0,0,0,0,0,0';
    4:
       out_buf := 'GN6=710 M710,400,0,0,0,0,25,0,3,558,0,0,0,0,0,0,0,0,0,0,0';
    5:
       out_buf := 'GN6=720 SDM M720,400,0,0,0,0,25,0,3,559,0,333,0,0,0,0,0,0,0,0,0';
    Else
      out_buf := '';
  End;
End;

Procedure math_left_right_trace_probe(scenario_probe: integer);
Begin
  Case scenario_probe Of
    1:
       out_buf := 'SD29988,0 NL263 P788 PE889 ER M1,1169,500,0,0,0,0,0,0,0,0,0,0,0';
    2:
       out_buf := 'OS M0,0,500,0,0,0,0,0,0,0,0,0,0,0';
    3:
       out_buf := 'NN=700 SD701,0 PM16 M0,0,700,700,700,30,0,0,0,0,0,0,0,0';
    4:
       out_buf := 'NN=710 SD711,0 FM710=800 US NN=720 M0,0,720,0,0,0,0,31,0,23,3,800,0,0';
    5:
       out_buf := 'NN=730 SD731,0 FM730=900 US PM16 M0,0,730,730,900,0,0,0,0,0,0,0,31,1';
    Else
      out_buf := '';
  End;
End;

Procedure app_display_trace_probe(scenario_probe: integer);
Begin
  Case scenario_probe Of
    1:
       out_buf := 'AV600 M70,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0';
    2:
       out_buf := 'NK0=700 NK0=710 NM0,3=720 NM0,2=730 HP730,0,1=740 AV740 M0,710,240,720,40,610,700,100,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0';
    3:
       out_buf := 'FN620,7 NK0=820 NK0=830 NM0,3=840 NSP8=850 NM0,2=860 NSP7=870 AV620 M0,0,0,0,0,0,0,0,850,800,840,830,870,810,860,3,4,107,-24,-35,0,0,0,0,0,0,0,0';
    4:
       out_buf := 'CN200=880 FN630,7 NM0,3=894 NM0,2=895 AV880 M0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,7,8,895,893,360,160,890,892';
    Else
      out_buf := '';
  End;
End;

Procedure resume_after_display_trace_probe(scenario_probe: integer);
Begin
  Case scenario_probe Of
    1:
       out_buf := 'US PN GX10 BP M8323077,102,1000,5,5';
    2:
       out_buf := 'CF1182 US PN GX20 BI M21364736,102,1000,0,0';
    Else
      out_buf := '';
  End;
End;

Procedure get_r_token_trace_probe(scenario_probe: integer);
Begin
  Case scenario_probe Of
    1:
       out_buf := 'GT2592,0 GT7000,2000 M7000,0,0,0';
    2:
       out_buf := 'GT500,0 NL263 P1200 BI IE GT900,200 M900,5,1205,1201';
    3:
       out_buf := 'GT600,3000 NL263 P1200 IE GT901,2614 M901,5,1205,1201';
    Else
      out_buf := '';
  End;
End;

Procedure after_math_trace_probe(scenario_probe: integer);
Begin
  Case scenario_probe Of
    1:
       out_buf := 'FM0=700 NM88,0=720 MTH2,0=710 NM88,1=730 US M730,720,0,0,0,0,0,0,0,0,0,0,0,10,1000,0,0,0,0';
    2:
       out_buf := 'FM0=700 GX3 MTH0,0=800 HP800,0,1=810 NP5000=830 NG3=840 AD900,810,25 NP6000=850 NG4=860 FL900 RAD M860,830,0,0,0,840,850,860,0,0,0,0,0,10,0,0,0,2,0';
    3:
       out_buf := 'FM0=700 GX3 MTH2,0=701 HP701,0,1=720 US FM0=730 MTH0,0=740 HP740,0,1=750 NP5000=760 AD920,720,0 NP10000=770 AD920,750,30 NP6000=780 NG4=790 FL920 RAD M790,760,770,780,790,0,0,0,0,0,0,0,0,9,0,2,2,0,0';
    4:
       out_buf := 'NL263 P1171 ER FMH FM0=700 GX2 NL263 P1179 BE MTH0,0=800 HP800,0,1=810 FN810,7 HP820,100,0=811 NP5000=830 NG5=840 AD930,811,0 NP6000=850 NG6=860 FL930 RAD M860,830,0,0,0,840,850,860,0,2,1181,1180,1172,10,0,0,0,0,2';
    Else
      out_buf := '';
  End;
End;

Procedure do_register_command_trace_probe(scenario_probe: integer);
Begin
  Case scenario_probe Of
    1:
       out_buf := 'SR5 SOE SI321 EWD5338,321 M321,0,0,0,0,0,0,0,0,0';
    2:
       out_buf := 'GX89,2 SR7 SK1 SG2=500 NS500=510 DG500 TZ EQD2907,117,510 M510,0,0,0,0,35,9,7,2,0';
    3:
       out_buf := 'GX89,1 SR300 FSE1,300,1=700 SK0 SI3 MA1000,3,0,1073741823=3000 GWD700,3000 M3000,0,0,0,0,0,0,0,0,0';
    4:
       out_buf := 'GX89,3 SR400 FSE3,400,1=800 SK0 SI0 NS600=610 XO11,0=0 XO22,0=0 XO33,0=0 NL263 P1223 DG610 ER M610,2,1225,1224,1,0,0,0,0,0';
    5:
       out_buf := 'GX20,5 NL263 P694 CC20,5 P695 CC90,0 ER M0,1,1226,0,0,0,0,0,0,0';
    6:
       out_buf := 'GX74,920 SK1 SI2 XO50,2=25 EWD920,25 M25,0,0,0,0,0,0,0,0,0';
    Else
      out_buf := '';
  End;
End;

Procedure alter_aux_trace_probe(scenario_probe: integer);
Begin
  Case scenario_probe Of
    1:
       out_buf := 'RIC M777,888,0,0';
    2:
       out_buf := 'SOE SD65536 M65536,888,0,0';
    3:
       out_buf := 'SOE SI123 M777,123,0,0';
    4:
       out_buf := 'SOE SI0 NL263 P1229 IE0 M777,999,1,1230';
    5:
       out_buf := 'SOE SI40000 NL263 P1229 IE40000 M777,999,1,1230';
    Else
      out_buf := '';
  End;
End;

Procedure alter_prev_graf_trace_probe(scenario_probe: integer);
Begin
  Case scenario_probe Of
    1:
       out_buf := 'SOE SI55 M700,102,55,222,700,0,0';
    2:
       out_buf := 'SOE SI77 M77,1,40,77,333,0,0';
    3:
       out_buf := 'SOE SI-5 NL263 P967 PE536 IE-5 M700,102,111,222,700,1,1231';
    Else
      out_buf := '';
  End;
End;

Procedure alter_page_so_far_trace_probe(scenario_probe: integer);
Begin
  Case scenario_probe Of
    1:
       out_buf := 'SOE SD1234 M1234,700,1234';
    2:
       out_buf := 'SOE SD-400 M200,-400,-400';
    Else
      out_buf := '';
  End;
End;

Procedure alter_integer_trace_probe(scenario_probe: integer);
Begin
  Case scenario_probe Of
    1:
       out_buf := 'SOE SI44 M44,20,0,0,0,0';
    2:
       out_buf := 'SOE SI-7 M9,-7,1,0,0,0';
    3:
       out_buf := 'SOE SI3 NI M9,20,3,0,0,0';
    4:
       out_buf := 'SOE SI-1 NL263 P1363 IE-1 M9,20,2,2,1365,1364';
    5:
       out_buf := 'SOE SI4 NL263 P1363 IE4 M9,20,2,2,1365,1364';
    Else
      out_buf := '';
  End;
End;

Procedure alter_box_dimen_trace_probe(scenario_probe: integer);
Begin
  Case scenario_probe Of
    1:
       out_buf := 'SR5 SOE SD7777 M7777,22,55,0,7777';
    2:
       out_buf := 'SR6 SOE SD8888 M11,22,55,0,8888';
    3:
       out_buf := 'SR300 FSE4,300,0=700 SOE SD-120 M11,-120,55,700,-120';
    4:
       out_buf := 'SR301 FSE4,301,0=0 SOE SD333 M11,22,55,0,333';
    Else
      out_buf := '';
  End;
End;

Procedure new_interaction_trace_probe(scenario_probe: integer);
Begin
  Case scenario_probe Of
    1:
       out_buf := 'PL M0,16';
    2:
       out_buf := 'PL M2,17';
    3:
       out_buf := 'PL M0,18';
    4:
       out_buf := 'PL M3,19';
    Else
      out_buf := '';
  End;
End;

Procedure new_font_trace_probe(scenario_probe: integer);
Begin
  Case scenario_probe Of
    1:
       out_buf := 'GRT600 EQ600,87,0 SOE SFN100,200 SK1236=1 SD50000 SS100,100=1 SS200,200=1 EQ600,87,1 CE2625,600 M3210,0,0,17,50,0,100,0,0,0,0';
    2:
       out_buf := 'OLF GRT120 P1235 P119 OV258,5 MS900 GQ120,87,0 SOE SFN300,400 SK1236=0 SK1237=1 SI0 NL263 P560 IE0 SS301,300=0 RFI120,300,400,-1000=7 GQ120,87,7 CE2631,120 M0,0,900,17,50,10,300,1,561,0,0';
    3:
       out_buf := 'GRT513 EQ513,87,0 SOE SFN49,700 SK1236=1 SD200000000 NL263 P1238 PS200000000 P1239 ER SS49,49=1 SS700,700=1 EQ513,87,1 CE2625,513 M1235,0,0,17,49,888,49,2,1241,1240,0';
    4:
       out_buf := 'GRT300 EQ300,87,0 SOE SFN500,600 SK1236=0 SK1237=0 SS500,500=1 SS600,600=1 XD800,1000,1000=800 EQ300,87,1 CE2625,300 M43,0,0,17,50,0,500,0,0,0,0';
    Else
      out_buf := '';
  End;
End;

Procedure prefixed_command_trace_probe(scenario_probe: integer);
Begin
  Case scenario_probe Of
    1:
       out_buf := 'GX10,0 GX65,7 NL263 P1192 CC65,7 CH39 BE M0,0,1,1194,0,0,0';
    2:
       out_buf := 'GQ3939,120,44 BI M0,777,0,0,0,0,0';
    3:
       out_buf := 'GX97,1 GRT900 ST1,0=910 GA930 GQ900,111,1000 M0,0,0,0,0,930,0';
    4:
       out_buf := 'GX90,0 DR0 M0,0,0,0,0,0,0';
    5:
       out_buf := 'SR5 SOE NL263 P689 PE540 ER M0,0,2,1228,1227,0,0';
    6:
       out_buf := 'NI BI M0,888,0,0,0,0,0';
    7:
       out_buf := 'SR3 SOE GX71,0 SR4 GQ3426,111,500 M0,0,0,0,0,0,10';
    Else
      out_buf := '';
  End;
End;

Procedure do_assignments_trace_probe(scenario_probe: integer);
Begin
  Case scenario_probe Of
    1:
       out_buf := 'GX10 GX90 PC0 GX0 GX65 M65,1';
    2:
       out_buf := 'GX70 M70,1';
    3:
       out_buf := 'GX10 GX89 PC0 GX10 GX98 PC0 GX20 M20,1';
    Else
      out_buf := '';
  End;
End;

Procedure open_or_close_in_trace_probe(scenario_probe: integer);
Begin
  Case scenario_probe Of
    1:
       out_buf := 'S43 CL703 M2,2,2,0';
    2:
       out_buf := 'S44 CL704 SOE SFN10,20,339 PF10,20,802 OP704=1 M2,1,2,802';
    3:
       out_buf := 'S45 SOE SFN11,21,700 PF11,21,700 OP705=0 M2,2,2,700';
    Else
      out_buf := '';
  End;
End;

Procedure issue_message_trace_probe(scenario_probe: integer);
Begin
  Case scenario_probe Of
    1:
       out_buf := 'ST0,1=1300 TS1200 FL1200 MS50 PL SP50 BR M1300,49,150,0,0,0,0,0,0,0,17';
    2:
       out_buf := 'ST0,1=1301 TS1200 FL1200 MS50 CH32 SP50 BR M1301,49,150,0,0,0,0,0,0,0,17';
    3:
       out_buf := 'ST0,1=1302 TS1200 FL1200 MS50 NL263 P339 SP50 ER M1302,49,150,0,0,0,0,0,0,0,17';
    4:
       out_buf := 'ST0,1=1303 TS1200 FL1200 MS50 NL263 P339 SP50 ER M1303,49,150,1,1248,0,0,0,1,0,17';
    5:
       out_buf := 'ST0,1=1304 TS1200 FL1200 MS50 NL263 P339 SP50 ER M1304,49,150,4,1252,1251,1250,1249,1,0,17';
    Else
      out_buf := '';
  End;
End;

Procedure shift_case_trace_probe(scenario_probe: integer);
Begin
  Case scenario_probe Of
    1:
       out_buf := 'ST0,0 BTL500,3 M808,5000,0,3000,1200';
    2:
       out_buf := 'ST0,0 BTL700,3 M0,0,1234,3000,1200';
    Else
      out_buf := '';
  End;
End;

Procedure show_whatever_trace_probe(scenario_probe: integer);
Begin
  Case scenario_probe Of
    1:
       out_buf := 'BD SA ED1 NL263 P1269 P1270 ER M0,0,0,0,0,9,19,0';
    2:
       out_buf := 'SR5 BD NL1268 PI5 CH61 P413 ED1 NL263 P1269 ER M3,1261,1260,1259,0,10,17,0';
    3:
       out_buf := 'GT80,0,700 NL1264 SC700 CH61 PM ER M5,1263,1262,1261,1259,10,17,0';
    4:
       out_buf := 'BD NL339 PL NL1361 PI2 P575 PCC105,10 PE787 P1359 PI100 NL1361 PI1 P575 PCC105,11 P1359 PI200 ED1 NL263 P1269 ER M3,1261,1260,1259,0,10,17,0';
    5:
       out_buf := 'TT NL1264 TS29997 FL900 ER M5,1263,1262,1261,1259,10,17,900';
    Else
      out_buf := '';
  End;
End;

Procedure new_whatsit_trace_probe(scenario_probe: integer);
Begin
  Case scenario_probe Of
    1:
       out_buf := 'GN3=700 M700,700,8,5,0,0';
    2:
       out_buf := 'GN2=710 M710,710,0,0,8,8';
    Else
      out_buf := '';
  End;
End;

Procedure new_write_whatsit_trace_probe(scenario_probe: integer);
Begin
  Case scenario_probe Of
    1:
       out_buf := 'NW9,4 S49 M9,9,600';
    2:
       out_buf := 'NW9,2 SI-3 M17,17,600';
    3:
       out_buf := 'NW9,2 SI20 M16,16,600';
    4:
       out_buf := 'NW9,2 SI8 M8,8,600';
    Else
      out_buf := '';
  End;
End;

Procedure do_extension_trace_probe(scenario_probe: integer);
Begin
  Case scenario_probe Of
    1:
       out_buf := 'NWW3=600 SOE SFN M600,11,22,33,0,0,0,0,0,0,9,0,0,0,0';
    2:
       out_buf := 'NWW2=610 ST0,0 M610,0,0,0,1200,0,0,0,0,900,9,0,0,0,0';
    3:
       out_buf := 'NWW2=620 M620,0,0,0,0,0,0,0,0,0,9,0,0,0,0';
    4:
       out_buf := 'NW3,2=630 ST0,1 M630,0,0,0,0,0,1200,0,0,0,9,0,0,0,0';
    5:
       out_buf := 'GX59,2 NWW2=640 OW640 FL640 M500,0,0,0,0,0,0,0,0,0,9,0,0,0,0';
    6:
       out_buf := 'RIC M500,0,0,0,0,0,0,0,0,0,9,0,0,0,0';
    7:
       out_buf := 'NW4,2=650 SI260 M650,0,0,0,0,0,0,0,0,0,0,63,0,0,0';
    8:
       out_buf := 'NW4,2=651 SI20 M651,0,0,0,0,0,0,0,0,0,20,0,0,5,6';
    Else
      out_buf := '';
  End;
End;

Procedure fix_language_trace_probe(scenario_probe: integer);
Begin
  Case scenario_probe Of
    1:
       out_buf := ' M500,0,0,0,0,0,0,0';
    2:
       out_buf := 'NW4,2=600 M600,20,20,63,0,0,0,0';
    3:
       out_buf := 'NW4,2=610 M610,0,0,0,0,0,5,6';
    Else
      out_buf := '';
  End;
End;

Procedure handle_right_brace_trace_probe(scenario_probe: integer);
Begin
  Case scenario_probe Of
    1:
       out_buf := 'US M0,0,0,0,0,0,710,5,720,1,5,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0';
    2:
       out_buf := 'NL263 P1055 ER M0,2,1057,1056,0,0,710,5,720,1,5,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0';
    3:
       out_buf := 'XRB M0,0,0,0,0,0,710,5,720,1,5,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0';
    4:
       out_buf := 'PK0 M0,0,0,0,0,29995,710,5,720,1,5,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0';
    5:
       out_buf := 'EG US VP401,0,1,1073741823=500 PN GN5=610 FN500,7 BP M0,0,0,0,0,0,610,4,720,1,5,0,6,3,200,800,700,50,900,300,0,0,0,0,0,0,0,0,0,0,0,0,0,0';
    6:
       out_buf := 'NL263 P1022 ER GT1 GT0 ETL EG US NL263 P1025 PE412 PI255 BX255 FL740 PN BP M0,3,1028,1027,1026,0,710,5,29998,0,0,710,0,0,0,0,0,0,0,0,0,730,0,711,0,0,0,0,0,0,0,0,0,0';
    7:
       out_buf := 'BI NL263 P634 PE911 P635 IE M6710,1,1137,0,0,0,710,5,720,1,5,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0';
    8:
       out_buf := 'EG US VP801,1200,1,1073741823=850 PN NN=910 M0,0,0,0,0,0,910,4,720,1,5,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,29,2,850';
    9:
       out_buf := 'US FM0=1300 FN1300,4 M0,0,0,0,0,0,710,4,720,1,5,0,0,0,0,0,0,0,0,0,0,0,0,0,10,9,7,8,0,0,0,0,0,0';
    10:
       out_buf := 'US FM0=1400 FN1200,4 M0,0,0,0,0,0,1400,4,720,1,5,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1400,3,1400,0,0,0';
    11:
       out_buf := 'BC M0,0,0,0,0,0,710,5,720,1,5,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0';
    12:
       out_buf := 'CF1058 M0,0,0,0,0,0,710,5,720,1,5,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0';
    Else
      out_buf := '';
  End;
End;

Procedure give_err_help_trace_probe(scenario_probe: integer);
Begin
  Case scenario_probe Of
    1:
       out_buf := 'TS0 M0';
    2:
       out_buf := 'TS8123 M8123';
    Else
      out_buf := '';
  End;
End;

Procedure open_fmt_file_trace_probe(scenario_probe: integer);
Begin
  Case scenario_probe Of
    1:
       out_buf := 'PBN16,1,0 WO1 M1,5,32';
    2:
       out_buf := 'PBN0,11,14 WO1 M1,15,32';
    3:
       out_buf := 'PBN0,11,14 WO0 PBN11,11,14 WO1 M1,15,32';
    4:
       out_buf := 'PBN0,11,14 WO0 PBN11,11,14 WO0 WL1 BR PBN16,1,0 WO0 WL2 M0,11,32';
    Else
      out_buf := '';
  End;
End;

Procedure final_cleanup_trace_probe(scenario_probe: integer);
Begin
  Case scenario_probe Of
    1:
       out_buf := 'OLF ETL EFR P1290 P1290 NL40 PE1291 P1292 PI2 C41 SSG NL40 PE1291 P1293 PCC105,8 P1294 PI123 P1295 FN100,2 NL40 PE1291 P1293 PCC105,9 P1294 PI2000 P1295 FN110,2 NL1296 M-1,19,0,0,0,10,0,0,0,0,65535';
    2:
       out_buf := 'DTR500 DTR501 DM3,0,700=1 FL800 FL801 DGR900 SFF M55,17,0,0,0,0,0,0,500,501,900';
    3:
       out_buf := 'DM3,0,710=0 FL0 FL0 SFF M66,17,0,0,0,0,0,710,0,0,65535';
    Else
      out_buf := '';
  End;
End;

Procedure close_files_and_terminate_trace_probe(scenario_probe: integer);
Begin
  Case scenario_probe Of
    1:
       out_buf := 'AC700 AC702 NL848 M-1,19,0,-1,0,77,0,0,0,0,0,0,0';
    2:
       out_buf := 'D477 D425400000 D4473628672 PM D412345 D4456 D4789 DF2 D48 WD0,12 NL849 SP3000 P287 PI1 P850 P851 PI23 P852 BC901 WL AC900 NL1289 SP3100 C46 M-1,17,1,-1,13,8,0,142,140,248,2,1,223';
    3:
       out_buf := 'D450 D425400000 D4473628672 PM D4222 D433 D444 DS DF1 D4-3 WD5,11 WD0,11 NL849 SP3200 P287 PI2 P850 C115 P851 PI12 P852 BC902 WL AC901 M-1,18,2,-1,12,-3,0,140,248,1,0,0,223';
    Else
      out_buf := '';
  End;
End;

Procedure init_prim_trace_probe(scenario_probe: integer);
Begin
  Case scenario_probe Of
    1:
       out_buf := 'N0 F379,75,2882,10379 F380,75,2883,10380 F381,75,2884,10381 L1301,59,3,11301 L1302,59,4,11302 L1303,59,5,11303 M325,1,0,11303,10606,14701,10603,911,519,888,785,913,913,539,812,5,1,257,62,1,0,49,1,31,106,1,2,115,1,29989,9,1,29989,0,1,256,87,1,0,4095';
    Else
      out_buf := '';
  End;
End;

Procedure load_fmt_file_trace_probe(scenario_probe: integer);
Begin
  Case scenario_probe Of
    1:
       out_buf := 'FATAL M0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0';
    2:
       out_buf := 'MSG_POOL FATAL M0,0,255,697,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0';
    3:
       out_buf := ' M1,0,255,697,4,1,1,4,1019,20,29987,0,123,456,514,4609,600,514,77,7,0,0,0,0,0,0,2,1,37,1,2367,7,1,1,7,8,9,10,7,8,9,10,999,20,0,0';
    Else
      out_buf := '';
  End;
End;

Procedure store_fmt_file_trace_probe(scenario_probe: integer);
Begin
  Case scenario_probe Of
    1:
       out_buf := 'NL263 P1272 ER JO M2,3,1,1273,0,0,2';
    2:
       out_buf := 'P1286 P1234 C32 PI0 C46 PI0 C46 PI0 C41 MS PJ797 WO0 PR1287,797 WO1 NL1288 WMS SP701 NL339 SP600 PC PC Q65,66,67,68 Q69,70,71,72 PL PI2 P1274 PI8 SA PL PI28 P1275 PI22 C38 PI2 PL PI2100 P1276 NL1279 PE910 C61 PF5,6,339 P751 PS1000 P400 PL PI0 P1277 PI0 P1278 C115 PL PI1 P1280 IT NL1281 PI0 P1282 PI0 P1283 C115 P1284 PI10 NL811 PI2 P1285 PI1 WC M19,600,2,8,22,2,2100,0,0,0,69,2,28,2,2367,7,1,1,236367277,1,0,30000,6121,1777,307,8,0,0,0,1,2,1,600,69069';
    Else
      out_buf := '';
  End;
End;

Procedure main_control_trace_probe(scenario_probe: integer);
Begin
  Case scenario_probe Of
    1:
       out_buf := 'BT700,12 GX15,0 IAO1 M0,0,0,0,500,0,0,0,0,0';
    2:
       out_buf := 'GX1,0 BI PA GX15,0 IAO1 M0,0,0,0,500,0,0,0,0,0';
    3:
       out_buf := 'GX117,5 SCN MC70 GX14,0 IAO1 M0,0,0,0,500,0,0,0,0,0';
    4:
       out_buf := 'GX111,0 NSP0 NGL800 GX14,0 IAO1 M0,0,0,0,900,0,800,101,102,103';
    5:
       out_buf := 'GX72,0 PC GX41,0 GT1234 GX15,0 IAO1 M0,0,0,1234,500,0,0,0,0,0';
    Else
      out_buf := '';
  End;
End;

Procedure build_discretionary_trace_probe(scenario_probe: integer);
Begin
  Case scenario_probe Of
    1:
       out_buf := 'US POP NSL10 SLB PN M410,1,-102,1000,500';
    2:
       out_buf := 'US NL263 P1119 ER BD NL1121 SB420 ED1 FL420 POP NSL10 SLB PN M410,0,1,1120,2,-102,1000';
    3:
       out_buf := 'US POP NL263 P1113 PE352 FL410 ER M9,0,0,2,1114,1115,500';
    4:
       out_buf := 'US POP NL263 P1116 ER M9,1255,1000,0,2,1117,1118';
    5:
       out_buf := 'US POP M9,420,410,2,0';
    Else
      out_buf := '';
  End;
End;

Procedure box_error_trace_probe(n_probe,box_ptr_probe: integer);
Begin
  out_buf := 'ERR BD NL847 SB'+IntToStr(box_ptr_probe)+' ED1 FL'+IntToStr(box_ptr_probe)+' EQ0';
End;

Procedure ensure_vbox_trace_probe(n_probe,box_ptr_probe,b0_probe: integer);
Begin
  out_buf := '';
  If (box_ptr_probe<>0)And(b0_probe=0)Then
    out_buf := 'NL263 P1001 HP3 HL1002,1003,1004 BE'+IntToStr(n_probe);
End;

Procedure append_kern_trace_probe(cur_chr_probe,cur_val_probe,tail_probe,scan_result_probe,new_kern_probe: integer);
Var
  old_tail_probe: integer;
  mu_probe: integer;
Begin
  old_tail_probe := tail_probe;
  If cur_chr_probe=99 Then mu_probe := 1
  Else mu_probe := 0;
  cur_val_probe := scan_result_probe;
  mem_rh[tail_probe] := new_kern_probe;
  tail_probe := mem_rh[tail_probe];
  mem_b1[tail_probe] := cur_chr_probe;
  out_buf := IntToStr(cur_val_probe)+' '+IntToStr(tail_probe)+' '+
             IntToStr(mem_rh[old_tail_probe])+' '+IntToStr(mem_b1[tail_probe])+' '+
             IntToStr(mu_probe);
End;

Procedure append_penalty_trace_probe(cur_val_probe,tail_probe,mode_probe,scan_result_probe,new_penalty_probe: integer);
Var
  old_tail_probe: integer;
  build_page_probe: integer;
Begin
  old_tail_probe := tail_probe;
  build_page_probe := 0;
  cur_val_probe := scan_result_probe;
  mem_rh[tail_probe] := new_penalty_probe;
  tail_probe := mem_rh[tail_probe];
  If mode_probe=1 Then build_page_probe := 1;
  out_buf := IntToStr(cur_val_probe)+' '+IntToStr(tail_probe)+' '+
             IntToStr(mem_rh[old_tail_probe])+' '+IntToStr(build_page_probe);
End;

Procedure app_space_trace_probe(scenario_probe: integer);
Begin
  Case scenario_probe Of
    1:
       out_buf := 'NPG13=700 M700,700';
    2:
       out_buf := 'NS400=800 XOD0,3000,1000=333 XOD0,1000,3000=444 NG800=900 M800,0,11,333,444,0,900,900';
    3:
       out_buf := 'NS0=810 NS810=820 XOD60,2500,1000=555 XOD70,1000,2500=666 NG820=910 M820,202,810,59,555,666,0,910,910';
    4:
       out_buf := 'NS830=840 XOD35,1500,1000=777 XOD45,1000,1500=888 NG840=920 M840,0,830,25,777,888,0,920,920';
    Else
      out_buf := '';
  End;
End;

Procedure append_glue_trace_probe(scenario_probe: integer);
Begin
  Case scenario_probe Of
    1:
       out_buf := 'NG4=700 M4,700,700,0';
    2:
       out_buf := 'NG16=710 M16,710,710,0';
    3:
       out_buf := 'SG2 NG777=720 M777,720,720,4,0';
    4:
       out_buf := 'SG3 NG888=730 M888,730,730,8,99';
    Else
      out_buf := '';
  End;
End;

Procedure overbar_trace_probe(b_probe,k_probe,t_probe,p1_probe,q_probe,p2_probe,vpackage_probe: integer);
Begin
  mem_rh[p1_probe] := b_probe;
  mem_rh[q_probe] := p1_probe;
  mem_rh[p2_probe] := q_probe;
  out_buf := 'NK'+IntToStr(k_probe)+'='+IntToStr(p1_probe)+' '+
             'RH'+IntToStr(p1_probe)+'='+IntToStr(b_probe)+' '+
             'FR'+IntToStr(t_probe)+'='+IntToStr(q_probe)+' '+
             'RH'+IntToStr(q_probe)+'='+IntToStr(p1_probe)+' '+
             'NK'+IntToStr(t_probe)+'='+IntToStr(p2_probe)+' '+
             'RH'+IntToStr(p2_probe)+'='+IntToStr(q_probe)+' '+
             'VP'+IntToStr(p2_probe)+',0,1,1073741823='+IntToStr(vpackage_probe)+' '+
             'R'+IntToStr(vpackage_probe);
End;

Procedure char_box_trace_probe(f_probe,c_probe,char_base_probe,width_base_probe,italic_base_probe,height_base_probe,depth_base_probe,qb0_probe,qb1_probe,qb2_probe,width_val_probe,italic_val_probe,height_val_probe,depth_val_probe,b_probe,p_probe: integer);
Var
  char_idx_probe: integer;
  hd_probe: integer;
  width_idx_probe: integer;
  italic_idx_probe: integer;
  height_idx_probe: integer;
  depth_idx_probe: integer;
Begin
  char_idx_probe := char_base_probe+c_probe;
  mem_b0[char_idx_probe] := qb0_probe;
  mem_b1[char_idx_probe] := qb1_probe;
  mem_b2[char_idx_probe] := qb2_probe;

  hd_probe := mem_b1[char_idx_probe];
  width_idx_probe := width_base_probe+mem_b0[char_idx_probe];
  italic_idx_probe := italic_base_probe+(mem_b2[char_idx_probe] Div 4);
  height_idx_probe := height_base_probe+(hd_probe Div 16);
  depth_idx_probe := depth_base_probe+(hd_probe Mod 16);

  mem_int[width_idx_probe] := width_val_probe;
  mem_int[italic_idx_probe] := italic_val_probe;
  mem_int[height_idx_probe] := height_val_probe;
  mem_int[depth_idx_probe] := depth_val_probe;

  mem_int[b_probe+1] := mem_int[width_idx_probe]+mem_int[italic_idx_probe];
  mem_int[b_probe+3] := mem_int[height_idx_probe];
  mem_int[b_probe+2] := mem_int[depth_idx_probe];
  mem_b1[p_probe] := c_probe;
  mem_b0[p_probe] := f_probe;
  mem_rh[b_probe+5] := p_probe;

  out_buf := IntToStr(b_probe)+' '+IntToStr(mem_int[b_probe+1])+' '+IntToStr(mem_int[b_probe+3])+' '+
             IntToStr(mem_int[b_probe+2])+' '+IntToStr(mem_rh[b_probe+5])+' '+IntToStr(mem_b0[p_probe])+' '+
             IntToStr(mem_b1[p_probe])+' '+IntToStr(width_idx_probe)+' '+IntToStr(italic_idx_probe)+' '+
             IntToStr(height_idx_probe)+' '+IntToStr(depth_idx_probe);
End;

Procedure stack_into_box_trace_probe(b_probe,f_probe,c_probe,p_probe,old_list_probe,char_height_probe: integer);
Begin
  mem_rh[b_probe+5] := old_list_probe;
  mem_int[p_probe+3] := char_height_probe;
  mem_rh[p_probe] := mem_rh[b_probe+5];
  mem_rh[b_probe+5] := p_probe;
  mem_int[b_probe+3] := mem_int[p_probe+3];
  out_buf := 'CB'+IntToStr(f_probe)+','+IntToStr(c_probe)+'='+IntToStr(p_probe)+' '+
             'RH'+IntToStr(p_probe)+'='+IntToStr(mem_rh[p_probe])+' '+
             'RH'+IntToStr(b_probe+5)+'='+IntToStr(mem_rh[b_probe+5])+' '+
             'I'+IntToStr(b_probe+3)+'='+IntToStr(mem_int[b_probe+3]);
End;

Procedure height_plus_depth_trace_probe(f_probe,c_probe,char_base_probe,height_base_probe,depth_base_probe,qb1_probe,height_val_probe,depth_val_probe: integer);
Var
  char_idx_probe: integer;
  hd_probe: integer;
  height_idx_probe: integer;
  depth_idx_probe: integer;
Begin
  char_idx_probe := char_base_probe+c_probe;
  mem_b1[char_idx_probe] := qb1_probe;
  hd_probe := mem_b1[char_idx_probe];
  height_idx_probe := height_base_probe+(hd_probe Div 16);
  depth_idx_probe := depth_base_probe+(hd_probe Mod 16);
  mem_int[height_idx_probe] := height_val_probe;
  mem_int[depth_idx_probe] := depth_val_probe;
  out_buf := IntToStr(mem_int[height_idx_probe]+mem_int[depth_idx_probe])+' '+
             IntToStr(height_idx_probe)+' '+IntToStr(depth_idx_probe);
End;

Procedure var_delimiter_trace_probe(scenario_probe: integer);
Begin
  Case scenario_probe Of
    1:
       out_buf := 'HP5,65,20 CB5,65 R1000 M0,4,20,5';
    2:
       out_buf := 'NN1100 HP6,90,10 HP6,88,4 HP6,87,6 HP6,86,5 SB1100,6,88 SB1100,6,90 SB1100,6,87 SB1100,6,90 SB1100,6,86 R1100 M43,30,5,-13';
    3:
       out_buf := 'NN1200 R1200 M777,4,10,1';
    4:
       out_buf := 'HP8,70,10 HP8,71,30 CB8,71 R1300 M0,2,18,4';
    Else
      out_buf := '';
  End;
End;

Procedure clean_box_trace_probe(scenario_probe: integer);
Begin
  Case scenario_probe Of
    1:
       out_buf := 'NN500 ML XO360,18 FN700,2 R600 CM500 MP0 CSZ5,16,20 C501:9,8,777,1,123 Q15000:0';
    2:
       out_buf := 'R7000 CM0 MP1 CSZ5,0,0';
    3:
       out_buf := 'ML XO180,18 HP610,0,1,8100 R8100 CM610 MP0 CSZ3,0,10 CS3,0,10';
    4:
       out_buf := 'NB900 R900 CM0 MP1 CSZ5,0,0';
    5:
       out_buf := 'HP701,0,1,8200 R8200 CM0 MP1 CSZ5,0,0';
    Else
      out_buf := '';
  End;
End;

Procedure fetch_trace_probe(scenario_probe: integer);
Var
  a_probe: integer;
  cur_size_probe: integer;
  cur_c_probe: integer;
  cur_f_probe: integer;
  cur_i_b0_probe: integer;
  cur_i_b1_probe: integer;
  cur_i_b2_probe: integer;
  cur_i_b3_probe: integer;
  null_b0_probe: integer;
  null_b1_probe: integer;
  null_b2_probe: integer;
  null_b3_probe: integer;
  font_bc_probe: array[0..31] Of integer;
  font_ec_probe: array[0..31] Of integer;
  char_base_probe: array[0..31] Of integer;
  i_idx_probe: integer;
  help_ptr_probe: integer;
  help_line0_probe: integer;
  help_line1_probe: integer;
  help_line2_probe: integer;
  help_line3_probe: integer;
  warn_f_probe: integer;
  warn_c_probe: integer;
  err_count_probe: integer;
  print_trace_probe: ansistring;

  Procedure add_print_probe(tok: ansistring);
  Begin
    If Length(print_trace_probe)>0 Then print_trace_probe := print_trace_probe+',';
    print_trace_probe := print_trace_probe+tok;
  End;

  Procedure set_cur_i_from_null_probe;
  Begin
    cur_i_b0_probe := null_b0_probe;
    cur_i_b1_probe := null_b1_probe;
    cur_i_b2_probe := null_b2_probe;
    cur_i_b3_probe := null_b3_probe;
  End;

Begin
  a_probe := 500;
  cur_size_probe := 0;
  cur_c_probe := 0;
  cur_f_probe := 0;
  cur_i_b0_probe := -1;
  cur_i_b1_probe := -1;
  cur_i_b2_probe := -1;
  cur_i_b3_probe := -1;
  null_b0_probe := 0;
  null_b1_probe := 7;
  null_b2_probe := 8;
  null_b3_probe := 9;
  help_ptr_probe := 0;
  help_line0_probe := 0;
  help_line1_probe := 0;
  help_line2_probe := 0;
  help_line3_probe := 0;
  warn_f_probe := -1;
  warn_c_probe := -1;
  err_count_probe := 0;
  print_trace_probe := '';

  mem_b0[a_probe] := 0;
  mem_b1[a_probe] := 0;
  mem_rh[a_probe] := 777;
  eqtb_rh[3940] := 0;

  Case scenario_probe Of
    1:
       Begin
         cur_size_probe := 16;
         mem_b0[a_probe] := 1;
         mem_b1[a_probe] := 65;
         eqtb_rh[3940+1+cur_size_probe] := 0;
       End;
    2:
       Begin
         mem_b0[a_probe] := 2;
         mem_b1[a_probe] := 40;
         eqtb_rh[3940+2+cur_size_probe] := 5;
         font_bc_probe[5] := 50;
         font_ec_probe[5] := 60;
       End;
    3:
       Begin
         mem_b0[a_probe] := 2;
         mem_b1[a_probe] := 55;
         eqtb_rh[3940+2+cur_size_probe] := 5;
         font_bc_probe[5] := 50;
         font_ec_probe[5] := 60;
         char_base_probe[5] := 1000;
         i_idx_probe := char_base_probe[5]+55;
         mem_b0[i_idx_probe] := 0;
         mem_b1[i_idx_probe] := 33;
         mem_b2[i_idx_probe] := 44;
         mem_b3[i_idx_probe] := 55;
       End;
    4:
       Begin
         mem_b0[a_probe] := 2;
         mem_b1[a_probe] := 56;
         eqtb_rh[3940+2+cur_size_probe] := 5;
         font_bc_probe[5] := 50;
         font_ec_probe[5] := 60;
         char_base_probe[5] := 1000;
         i_idx_probe := char_base_probe[5]+56;
         mem_b0[i_idx_probe] := 3;
         mem_b1[i_idx_probe] := 11;
         mem_b2[i_idx_probe] := 22;
         mem_b3[i_idx_probe] := 33;
       End;
  End;

  cur_c_probe := mem_b1[a_probe];
  cur_f_probe := eqtb_rh[3940+mem_b0[a_probe]+cur_size_probe];
  If cur_f_probe=0 Then
    Begin
      add_print_probe('NL263');
      add_print_probe('P339');
      add_print_probe('SZ'+IntToStr(cur_size_probe));
      add_print_probe('CH32');
      add_print_probe('INT'+IntToStr(mem_b0[a_probe]));
      add_print_probe('P896');
      add_print_probe('P'+IntToStr(cur_c_probe));
      add_print_probe('CH41');
      help_ptr_probe := 4;
      help_line3_probe := 897;
      help_line2_probe := 898;
      help_line1_probe := 899;
      help_line0_probe := 900;
      err_count_probe := err_count_probe+1;
      set_cur_i_from_null_probe;
      mem_rh[a_probe] := 0;
    End
  Else
    Begin
      If (cur_c_probe>=font_bc_probe[cur_f_probe])And(cur_c_probe<=font_ec_probe[cur_f_probe])Then
        Begin
          i_idx_probe := char_base_probe[cur_f_probe]+cur_c_probe;
          cur_i_b0_probe := mem_b0[i_idx_probe];
          cur_i_b1_probe := mem_b1[i_idx_probe];
          cur_i_b2_probe := mem_b2[i_idx_probe];
          cur_i_b3_probe := mem_b3[i_idx_probe];
        End
      Else set_cur_i_from_null_probe;
      If Not(cur_i_b0_probe>0)Then
        Begin
          warn_f_probe := cur_f_probe;
          warn_c_probe := cur_c_probe;
          mem_rh[a_probe] := 0;
          set_cur_i_from_null_probe;
        End;
    End;

  out_buf := 'PR'+print_trace_probe+' ER'+IntToStr(err_count_probe)+' CW'+IntToStr(warn_f_probe)+','+
             IntToStr(warn_c_probe)+' CI'+IntToStr(cur_i_b0_probe)+','+IntToStr(cur_i_b1_probe)+','+
             IntToStr(cur_i_b2_probe)+','+IntToStr(cur_i_b3_probe)+' RH'+IntToStr(mem_rh[a_probe])+' HP'+
             IntToStr(help_ptr_probe)+' HL'+IntToStr(help_line0_probe)+','+IntToStr(help_line1_probe)+','+
             IntToStr(help_line2_probe)+','+IntToStr(help_line3_probe)+' CUR'+IntToStr(cur_c_probe)+','+
             IntToStr(cur_f_probe);
End;

Procedure make_over_trace_probe(q_probe,cur_style_probe,cur_size_probe,font_probe,param_base_probe,thickness_probe,clean_box_result_probe,overbar_result_probe: integer);
Var
  style_probe: integer;
  t_probe: integer;
  b_probe: integer;
Begin
  eqtb_rh[3943+cur_size_probe] := font_probe;
  mem_int[8+param_base_probe] := thickness_probe;
  style_probe := 2*(cur_style_probe Div 2)+1;
  t_probe := mem_int[8+param_base_probe];
  b_probe := clean_box_result_probe;
  mem_lh[q_probe+1] := overbar_result_probe;
  mem_rh[q_probe+1] := 2;
  out_buf := 'CB'+IntToStr(q_probe+1)+','+IntToStr(style_probe)+'='+IntToStr(b_probe)+' '+
             'OB'+IntToStr(b_probe)+','+IntToStr(3*t_probe)+','+IntToStr(t_probe)+'='+
             IntToStr(overbar_result_probe)+' M'+IntToStr(mem_lh[q_probe+1])+','+IntToStr(mem_rh[q_probe+1]);
End;

Procedure make_under_trace_probe(q_probe,cur_style_probe,cur_size_probe,font_probe,param_base_probe,thickness_probe,clean_box_result_probe,new_kern_result_probe,fraction_rule_result_probe,vpackage_result_probe,x_height_probe,y_height_probe,y_depth_probe: integer);
Var
  t_probe: integer;
  x_probe: integer;
  p_probe: integer;
  y_probe: integer;
  delta_probe: integer;
Begin
  eqtb_rh[3943+cur_size_probe] := font_probe;
  mem_int[8+param_base_probe] := thickness_probe;
  t_probe := mem_int[8+param_base_probe];
  x_probe := clean_box_result_probe;
  p_probe := new_kern_result_probe;
  y_probe := vpackage_result_probe;
  mem_int[x_probe+3] := x_height_probe;
  mem_int[y_probe+3] := y_height_probe;
  mem_int[y_probe+2] := y_depth_probe;
  mem_rh[x_probe] := p_probe;
  mem_rh[p_probe] := fraction_rule_result_probe;
  delta_probe := mem_int[y_probe+3]+mem_int[y_probe+2]+t_probe;
  mem_int[y_probe+3] := mem_int[x_probe+3];
  mem_int[y_probe+2] := delta_probe-mem_int[y_probe+3];
  mem_lh[q_probe+1] := y_probe;
  mem_rh[q_probe+1] := 2;
  out_buf := 'CB'+IntToStr(q_probe+1)+','+IntToStr(cur_style_probe)+'='+IntToStr(x_probe)+' '+
             'NK'+IntToStr(3*t_probe)+'='+IntToStr(p_probe)+' '+
             'FR'+IntToStr(t_probe)+'='+IntToStr(fraction_rule_result_probe)+' '+
             'VP'+IntToStr(x_probe)+',0,1,1073741823='+IntToStr(y_probe)+' '+
             'M'+IntToStr(mem_rh[x_probe])+','+IntToStr(mem_rh[p_probe])+','+IntToStr(mem_int[y_probe+3])+','+
             IntToStr(mem_int[y_probe+2])+','+IntToStr(mem_lh[q_probe+1])+','+IntToStr(mem_rh[q_probe+1]);
End;

Procedure make_vcenter_trace_probe(q_probe,v_probe,box_type_probe,cur_size_probe,font_probe,param_base_probe,axis_height_probe,v_height_probe,v_depth_probe: integer);
Var
  delta_probe: integer;
  confusion_probe: integer;
Begin
  mem_lh[q_probe+1] := v_probe;
  mem_b0[v_probe] := box_type_probe;
  mem_int[v_probe+3] := v_height_probe;
  mem_int[v_probe+2] := v_depth_probe;
  eqtb_rh[3942+cur_size_probe] := font_probe;
  mem_int[22+param_base_probe] := axis_height_probe;
  confusion_probe := 0;
  If mem_b0[v_probe]<>1 Then
    confusion_probe := 543
  Else
    Begin
      delta_probe := mem_int[v_probe+3]+mem_int[v_probe+2];
      mem_int[v_probe+3] := mem_int[22+param_base_probe]+half(delta_probe);
      mem_int[v_probe+2] := delta_probe-mem_int[v_probe+3];
    End;
  out_buf := 'C'+IntToStr(confusion_probe)+' H'+IntToStr(mem_int[v_probe+3])+' D'+IntToStr(mem_int[v_probe+2])+' V'+IntToStr(mem_lh[q_probe+1]);
End;

Procedure make_radical_trace_probe(q_probe,cur_style_probe,cur_size_probe,font2_probe,font3_probe,param2_probe,param3_probe,axis5_probe,t_probe,x_probe,y_probe,overbar_result_probe,hpack_result_probe,x_height_probe,x_depth_probe,y_height_probe,y_depth_probe: integer);
Var
  style_probe: integer;
  clr_probe: integer;
  wanted_probe: integer;
  delta_probe: integer;
Begin
  eqtb_rh[3942+cur_size_probe] := font2_probe;
  eqtb_rh[3943+cur_size_probe] := font3_probe;
  mem_int[5+param2_probe] := axis5_probe;
  mem_int[8+param3_probe] := t_probe;
  mem_int[x_probe+3] := x_height_probe;
  mem_int[x_probe+2] := x_depth_probe;
  mem_int[y_probe+3] := y_height_probe;
  mem_int[y_probe+2] := y_depth_probe;

  style_probe := 2*(cur_style_probe Div 2)+1;
  If cur_style_probe<2 Then
    clr_probe := mem_int[8+param3_probe]+(abs(mem_int[5+param2_probe]) Div 4)
  Else
    Begin
      clr_probe := mem_int[8+param3_probe];
      clr_probe := clr_probe+(abs(clr_probe) Div 4);
    End;

  wanted_probe := mem_int[x_probe+3]+mem_int[x_probe+2]+clr_probe+mem_int[8+param3_probe];
  delta_probe := mem_int[y_probe+2]-(mem_int[x_probe+3]+mem_int[x_probe+2]+clr_probe);
  If delta_probe>0 Then clr_probe := clr_probe+half(delta_probe);

  mem_int[y_probe+4] := -(mem_int[x_probe+3]+clr_probe);
  mem_rh[y_probe] := overbar_result_probe;
  mem_lh[q_probe+1] := hpack_result_probe;
  mem_rh[q_probe+1] := 2;
  out_buf := 'CB'+IntToStr(q_probe+1)+','+IntToStr(style_probe)+'='+IntToStr(x_probe)+' '+
             'VD'+IntToStr(q_probe+4)+','+IntToStr(cur_size_probe)+','+IntToStr(wanted_probe)+'='+IntToStr(y_probe)+' '+
             'OB'+IntToStr(x_probe)+','+IntToStr(clr_probe)+','+IntToStr(mem_int[y_probe+3])+'='+IntToStr(overbar_result_probe)+' '+
             'HP'+IntToStr(y_probe)+',0,1='+IntToStr(hpack_result_probe)+' '+
             'M'+IntToStr(mem_int[y_probe+4])+','+IntToStr(mem_rh[y_probe])+','+IntToStr(mem_lh[q_probe+1])+','+
             IntToStr(mem_rh[q_probe+1])+','+IntToStr(clr_probe);
End;

Procedure make_math_accent_trace_probe(scenario_probe: integer);
Begin
  Case scenario_probe Of
    1:
       out_buf := 'F1004 M222,1';
    2:
       out_buf := 'F2004 F2001 CB2001,5=6000 CH7,70=6100 NK-20=6200 VP6100,0,1,1073741823=6300 NK5=6201 M6300,2,128,50,20,6201,6000,6400';
    3:
       out_buf := 'F3004 F3001 CB3001,5=7100 FL7100 NN7200 CB3001,5=7300 CH8,90=7400 NK-16=7600 VP7400,0,1,1073741823=7500 M7500,2,5,60,7300 C19,8,7001,1,111 C21,2,7002,9001,222 C33,4,7003,9002,333 E20,0,0,0,0 E30,0,0,0,0';
    Else
      out_buf := '';
  End;
End;

Procedure make_fraction_trace_probe(scenario_probe: integer);
Begin
  Case scenario_probe Of
    1:
       out_buf := 'CB4002,3=4100 CB4003,3=4200 RB4100,40=4110 NN4300 FR4=4400 NK12=4500 NK12=4501 VD4004,16,14=4600 VD4005,16,14=4700 HP4600,0,1=4800 M4800,1,40,21,35,4700,4110,4501,4300';
    2:
       out_buf := 'CB5002,3=5100 CB5003,3=5200 RB5200,50=5210 NN5300 NK22=5400 VD5004,0,14=5500 VD5005,0,14=5600 HP5500,0,1=5700 M5700,1,50,19,31,5600,5100,5400,5300';
    3:
       out_buf := 'CB6002,6=6100 CB6003,7=6200 RB6200,30=6210 NN6300 FR5=6400 NK7=6500 NK5=6501 VD6004,0,17=6600 VD6005,0,17=6700 HP6600,0,1=6800 M6800,1,30,15,25,6700,6100,6501,6300';
    Else
      out_buf := '';
  End;
End;

Procedure make_op_trace_probe(scenario_probe: integer);
Begin
  Case scenario_probe Of
    1:
       out_buf := 'D0 M0,0,0';
    2:
       out_buf := 'F8101 CB8101,4=7000 D7 M0,0,7000,2,43,4';
    3:
       out_buf := 'F8201 CB8201,1=7100 CB8202,5=7200 CB8201,1=7300 CB8203,5=7400 NN7500 RB7200,42=7600 RB7300,42=7700 RB7400,42=7800 NK14=7900 NK7=7910 NK10=7920 NK7=7930 D9 M1,90,90,4,12,7500,42,43,62,0,7910,7900,7920,7930';
    Else
      out_buf := '';
  End;
End;

Procedure make_ord_trace_probe(scenario_probe: integer);
Begin
  Case scenario_probe Of
    1:
       out_buf := 'M1,0';
    2:
       out_buf := 'F9001 NK15=9200 M9200,9100,4,0';
    3:
       out_buf := 'F10001 F10001 M77,4,0';
    4:
       out_buf := 'F11001 FN11100,4 M11150,55,4,C21,2,2001,2002,222,C33,4,3001,3002,333,0';
    Else
      out_buf := '';
  End;
End;

Procedure make_scripts_trace_probe(scenario_probe: integer);
Begin
  Case scenario_probe Of
    1:
       out_buf := 'CB13003,5=13100 M15000,13100,22,8';
    2:
       out_buf := 'HP900,0,1=14100 CB14002,7=14200 FN14100,7 M900,901,14200,43,-20';
    3:
       out_buf := 'HP0,0,1=15100 CB15002,4=15200 CB15003,5=15300 NK16=15400 VP15200,0,1,1073741823=15500 FN15100,7 M15500,9,15400,15300,17';
    Else
      out_buf := '';
  End;
End;

Procedure make_left_right_trace_probe(q_probe,style_probe,max_d_probe,max_h_probe,q_b0_probe,font_probe,param_base_probe,mu_input_probe,axis_probe,delim_factor_probe,delim_shortfall_probe,mu_result_probe,delim_result_probe: integer);
Var
  cur_style_probe: integer;
  cur_size_probe: integer;
  cur_mu_probe: integer;
  delta_probe: integer;
  delta1_probe: integer;
  delta2_probe: integer;
  result_probe: integer;
Begin
  cur_style_probe := style_probe;
  If cur_style_probe<4 Then cur_size_probe := 0
  Else cur_size_probe := 16*((cur_style_probe-2) Div 2);
  cur_mu_probe := mu_result_probe;
  delta2_probe := max_d_probe+axis_probe;
  delta1_probe := max_h_probe+max_d_probe-delta2_probe;
  If delta2_probe>delta1_probe Then delta1_probe := delta2_probe;
  delta_probe := (delta1_probe Div 500)*delim_factor_probe;
  delta2_probe := delta1_probe+delta1_probe-delim_shortfall_probe;
  If delta_probe<delta2_probe Then delta_probe := delta2_probe;
  result_probe := q_b0_probe-10;
  out_buf := 'XO'+IntToStr(mu_input_probe)+',18='+IntToStr(cur_mu_probe)+' '+
             'VD'+IntToStr(q_probe+1)+','+IntToStr(cur_size_probe)+','+IntToStr(delta_probe)+'='+
             IntToStr(delim_result_probe)+' '+
             'M'+IntToStr(result_probe)+','+IntToStr(cur_style_probe)+','+IntToStr(cur_size_probe)+','+
             IntToStr(cur_mu_probe)+','+IntToStr(delim_result_probe);
End;

Procedure mlist_to_hlist_trace_probe(scenario_probe: integer);
Begin
  Case scenario_probe Of
    1:
       out_buf := 'XO360,18=20 MRD1000 F1001 NC7,70=5000 NK5=5001 HP5000,0,1=6000 FN6000,7 XO360,18=20 FN1000,4 M5000,5001,0,5000,0,0,20';
    2:
       out_buf := 'XO360,18=20 HP5100,0,1=6100 FN6100,7 MRD2100 HP5200,0,1=6200 FN6200,7 XO360,18=20 NP250=7300 FN2000,4 MG7000,20=7100 NG7100=7200 FN2100,4 M5100,7300,7200,5200,16,0,0,0,20';
    3:
       out_buf := 'XO360,18=20 XO540,18=30 XO360,18=20 XO360,18=20 XO540,18=30 FN3000,3 MLR3100,2,0,0=9,5300 FN3100,4 M5300,5300,6,32,30,14,31';
    4:
       out_buf := 'XO360,18=20 MG7000,20=7100 DG7000 XO360,18=20 M4000,7100,0,0,0,20';
    5:
       out_buf := 'XO360,18=20 MO5000=3 MS5000,3 HP5500,0,1=5600 FN5600,7 XO360,18=20 FN5000,4 M5500,5500,0,0,20';
    Else
      out_buf := '';
  End;
End;

Procedure push_alignment_trace_probe(align_ptr_probe,cur_align_probe,preamble_head_probe,cur_span_probe,cur_loop_probe,align_state_probe,cur_head_probe,cur_tail_probe,p_probe,avail_probe: integer);
Begin
  mem_rh[p_probe] := align_ptr_probe;
  mem_lh[p_probe] := cur_align_probe;
  mem_lh[p_probe+1] := preamble_head_probe;
  mem_rh[p_probe+1] := cur_span_probe;
  mem_int[p_probe+2] := cur_loop_probe;
  mem_int[p_probe+3] := align_state_probe;
  mem_lh[p_probe+4] := cur_head_probe;
  mem_rh[p_probe+4] := cur_tail_probe;
  align_ptr_probe := p_probe;
  cur_head_probe := avail_probe;
  out_buf := 'GN5='+IntToStr(p_probe)+' GA='+IntToStr(avail_probe)+' '+
             'M'+IntToStr(mem_rh[p_probe])+','+IntToStr(mem_lh[p_probe])+','+
             IntToStr(mem_lh[p_probe+1])+','+IntToStr(mem_rh[p_probe+1])+','+
             IntToStr(mem_int[p_probe+2])+','+IntToStr(mem_int[p_probe+3])+','+
             IntToStr(mem_lh[p_probe+4])+','+IntToStr(mem_rh[p_probe+4])+' '+
             'AP'+IntToStr(align_ptr_probe)+' '+
             'CH'+IntToStr(cur_head_probe)+','+IntToStr(cur_tail_probe);
End;

Procedure pop_alignment_trace_probe(old_align_ptr_probe,saved_cur_align_probe,saved_preamble_head_probe,saved_cur_span_probe,saved_cur_loop_probe,saved_align_state_probe,saved_cur_head_probe,saved_cur_tail_probe,p_probe,avail_probe: integer);
Var
  old_cur_head_probe: integer;
  cur_tail_probe: integer;
  cur_head_probe: integer;
  align_state_probe: integer;
  cur_loop_probe: integer;
  cur_span_probe: integer;
  cur_align_probe: integer;
  align_ptr_probe: integer;
Begin
  mem_rh[p_probe] := old_align_ptr_probe;
  mem_lh[p_probe] := saved_cur_align_probe;
  mem_lh[p_probe+1] := saved_preamble_head_probe;
  mem_rh[p_probe+1] := saved_cur_span_probe;
  mem_int[p_probe+2] := saved_cur_loop_probe;
  mem_int[p_probe+3] := saved_align_state_probe;
  mem_lh[p_probe+4] := saved_cur_head_probe;
  mem_rh[p_probe+4] := saved_cur_tail_probe;

  old_cur_head_probe := 2000+p_probe;
  mem_rh[old_cur_head_probe] := avail_probe;
  avail_probe := old_cur_head_probe;
  cur_tail_probe := mem_rh[p_probe+4];
  cur_head_probe := mem_lh[p_probe+4];
  align_state_probe := mem_int[p_probe+3];
  cur_loop_probe := mem_int[p_probe+2];
  cur_span_probe := mem_rh[p_probe+1];
  mem_rh[29992] := mem_lh[p_probe+1];
  cur_align_probe := mem_lh[p_probe];
  align_ptr_probe := mem_rh[p_probe];

  out_buf := 'FN'+IntToStr(p_probe)+',5 '+
             'M'+IntToStr(mem_rh[old_cur_head_probe])+','+IntToStr(avail_probe)+','+
             IntToStr(cur_tail_probe)+','+IntToStr(cur_head_probe)+','+
             IntToStr(align_state_probe)+','+IntToStr(cur_loop_probe)+','+
             IntToStr(cur_span_probe)+','+IntToStr(mem_rh[29992])+','+
             IntToStr(cur_align_probe)+','+IntToStr(align_ptr_probe);
End;

Procedure get_preamble_token_trace_probe(scenario_probe: integer);
Begin
  Case scenario_probe Of
    1:
       out_buf := 'GT1,2 M1,2,0,0,1';
    2:
       out_buf := 'GT4,256 GT101,5 EX GT3,7 M3,7,0,0,3';
    3:
       out_buf := 'GT9,0 FE604 M9,0,0,1,1';
    4:
       out_buf := 'GT75,2893 SOE SG2,123 GD2893,117,123 GT4,256 GT5,1 M5,1,123,0,3';
    5:
       out_buf := 'GT75,2893 SOE SG2,88 ED2893,117,88 GT1,9 M1,9,88,0,2';
    Else
      out_buf := '';
  End;
End;

Procedure init_align_trace_probe(scenario_probe: integer);
Begin
  Case scenario_probe Of
    1:
       out_buf := 'PA PN SS6,0 NPG11=4100 NSL6 BT888,13 AP M-1,4100,0,0,500,4100';
    2:
       out_buf := 'PA NL263 P689 PE523 P906 ER FM PN SS6,0 NPG11=4200 NSL6 AP M-1,77,3,909,908,907,4200,4200';
    3:
       out_buf := 'PA PN SS6,0 NPG11=4100 GPT4,300 GPT10,301 GPT12,800 GA=4400 GPT4,302 NL263 P915 BE NNB=4300 GPT6,0 NL263 P919 ER GPT11,900 GA=4500 GPT4,303 GA=4501 NPG11=4200 NSL6 AP M4100,4200,4400,4500,800,900,6714,920,917,916,0';
    4:
       out_buf := 'PA PN SS6,0 NPG11=5100 GPT6,0 NNB=5300 GPT4,0 GA=5600 NPG11=5200 NSL6 AP M5200,0,5600,6714,0,5200';
    Else
      out_buf := '';
  End;
End;

Procedure init_span_trace_probe(p_probe,mode_probe,aux_lh_probe,aux_int_probe: integer);
Var
  paragraph_count_probe: integer;
Begin
  paragraph_count_probe := 0;
  If mode_probe=-102 Then aux_lh_probe := 1000
  Else
    Begin
      aux_int_probe := -65536000;
      paragraph_count_probe := 1;
    End;
  out_buf := 'PN1 NP'+IntToStr(paragraph_count_probe)+' '+
             'M'+IntToStr(mode_probe)+','+IntToStr(aux_lh_probe)+','+IntToStr(aux_int_probe)+','+
             IntToStr(p_probe);
End;

Procedure init_row_trace_probe(mode_probe,aux_lh_probe,aux_int_probe,preamble_probe,pre_align_probe,tail_probe,cur_head_probe,glue_param_probe,new_glue_probe: integer);
Var
  cur_align_probe: integer;
  cur_tail_probe: integer;
Begin
  mode_probe := (-103)-mode_probe;
  If mode_probe=-102 Then aux_lh_probe := 0
  Else aux_int_probe := 0;
  mem_rh[tail_probe] := new_glue_probe;
  tail_probe := mem_rh[tail_probe];
  mem_b1[tail_probe] := 12;
  cur_align_probe := pre_align_probe;
  cur_tail_probe := cur_head_probe;
  out_buf := 'PN NG'+IntToStr(glue_param_probe)+'='+IntToStr(new_glue_probe)+' '+
             'IS'+IntToStr(cur_align_probe)+' '+
             'M'+IntToStr(mode_probe)+','+IntToStr(aux_lh_probe)+','+IntToStr(aux_int_probe)+','+
             IntToStr(tail_probe)+','+IntToStr(mem_b1[tail_probe])+','+IntToStr(cur_align_probe)+','+
             IntToStr(cur_tail_probe);
End;

Procedure init_col_trace_probe(cur_align_probe,cur_cmd_probe,preamble_list_probe,align_state_probe: integer);
Begin
  mem_lh[cur_align_probe+5] := cur_cmd_probe;
  If cur_cmd_probe=63 Then
    out_buf := 'M'+IntToStr(mem_lh[cur_align_probe+5])+',0'
  Else
    Begin
      out_buf := 'BI BT'+IntToStr(preamble_list_probe)+',1 '+
                 'M'+IntToStr(mem_lh[cur_align_probe+5])+','+IntToStr(align_state_probe);
    End;
End;

Procedure fin_col_trace_probe(scenario_probe: integer);
Begin
  Case scenario_probe Of
    1:
       out_buf := 'NL263 P922 PE911 ER US NSL6 HP3100,0,1=4000 PN NG33=5000 M1,257,50,4000,5000,12,1,3,9,7,500000';
    2:
       out_buf := 'NNB=620 GA=6000 GA=6001 GA=6002 NG44=6100 US NSL6 VP3310,0,1,0=4300 PN NG55=6200 IS620 GX10 GX11 IC M0,6000,6002,6100,12,4300,620,1000000,11';
    3:
       out_buf := 'GX10 GX12 IC M0,3200,1000000,12';
    4:
       out_buf := 'US NSL6 VP5010,0,1,0=4400 GN2=7000 PN NG66=7100 IS4200 GX12 IC M0,7000,4070,1,40,0,3,2,4,4200,12';
    Else
      out_buf := '';
  End;
End;

Procedure fin_row_trace_probe(scenario_probe: integer);
Begin
  Case scenario_probe Of
    1:
       out_buf := 'HP1100,0,1=4000 PN AV4000 BT777,13 AP M13,0,3333,3001,0';
    2:
       out_buf := 'VP1200,0,1,1073741823=4200 PN AP M13,0,4200,4200,1000';
    3:
       out_buf := 'HP1300,0,1=4100 PN AV4100 BT888,13 AP M13,0,0,2000,0';
    Else
      out_buf := '';
  End;
End;

Procedure fin_align_trace_probe(scenario_probe: integer);
Begin
  Case scenario_probe Of
    1:
       out_buf := 'US US FL0 FL0 DG50 HP100,40,1=6000 FNL6000 PA PN1 BP M0,8,1,0,0,4500,123,77,1';
    2:
       out_buf := 'US US FL0 FL0 DG50 VP100,40,1,1073741823=6150 HP5100,0,1=5300 FNL6150 PA PN1 M0,8,7,5300,5300,5400,123,77,0';
    3:
       out_buf := 'US US FL0 FL0 DG50 HP100,40,1=6200 FNL6200 PA PN1 DA NL263 P1183 BE FNL7300 PN2 NP91=7500 NPG3=7700 NP92=7600 NPG4=7800 RAD M0,8,2,908,907,7600,7800,999,444,0';
    Else
      out_buf := '';
  End;
End;

Procedure align_peek_trace_probe(scenario_probe: integer);
Begin
  Case scenario_probe Of
    1:
       out_buf := 'GX10,0 GX34,0 SLB NSL7 NP M1000000,34,0,2';
    2:
       out_buf := 'GX2,0 FA M1000000,2,0,1';
    3:
       out_buf := 'GX5,258 GX10,0 GX11,0 IR IC M1000000,11,0,3';
    4:
       out_buf := 'GX12,0 IR IC M1000000,12,0,1';
    Else
      out_buf := '';
  End;
End;

Procedure try_break_trace_probe(scenario_probe: integer);
Begin
  Case scenario_probe Of
    1:
       out_buf := ' M7777,88,1234,0';
    2:
       out_buf := 'BD100,50=20 GN7=9100 GN2=9200 GN5=9300 M9200,9100,9300,29993,2,10,-30,1,1,3420,1073741823,1073741823';
    3:
       out_buf := 'FN6100,3 FN6000,7 M29993,0,0,1073741823';
    4:
       out_buf := 'FR60,5,2,1073741823=150 FR150,500,1000,1073741823=75 BD75,60=30 M1073741823,20,0,0,7000';
    Else
      out_buf := '';
  End;
End;

Procedure post_line_break_trace_probe(scenario_probe: integer);
Begin
  Case scenario_probe Of
    1:
       out_buf := 'NPG8=8100 HP8100,100,0=9100 AV9100 M0,1,0,0,0,9100,20';
    2:
       out_buf := 'DG5310 NPG7=5700 HP5700,333,0=9100 AV9100 M5320,9,7,1,0,44';
    3:
       out_buf := 'NPG8=6310 HP0,100,0=9100 AV9100 M6310,0,0,1,0';
    4:
       out_buf := 'NM0,10=7801 GA=7701 NPG8=7900 NM0,11=7802 NM0,11=7803 HP7801,100,0=9100 AV9100 M7701,11,7500,7802,7900,0,1';
    Else
      out_buf := '';
  End;
End;

Procedure reconstitute_trace_probe(scenario_probe: integer);
Begin
  Case scenario_probe Of
    1:
       out_buf := 'GA8100 M1,8100,7,65,65,66,29996,0,0,0';
    2:
       out_buf := 'GA8200 NK777=8201 M1,8200,8201,65,66,0,0,0';
    3:
       out_buf := 'GA8300 NLG7,90,8300=8301 M1,8301,1,0,0,90,29996';
    4:
       out_buf := 'GA8401 PI NLI88=8500 GA8402 PI FN8500,2 NLG7,0,8401=8600 M2,8600,8402,0,0,99,29996,0,0,0';
    Else
      out_buf := '';
  End;
End;

Procedure hyphenate_trace_probe(scenario_probe: integer);
Begin
  Case scenario_probe Of
    1:
       out_buf := ' M2,0,0,0,111,222';
    2:
       out_buf := ' M1,0,0,256,0,0,0,0';
    3:
       out_buf := 'FLN600 RC1,1,66,45=1,610,0 FLL0 M0,610,9900,0,0,0,1';
    4:
       out_buf := 'FLN600 RC1,1,66,45=1,710,0 GN2=7300 NC7,45=7400 RC2,2,99,256=2,720,1 FLL0 M0,710,9950,720,0,7400,0,1,88';
    Else
      out_buf := '';
  End;
End;

Procedure new_trie_op_trace_probe(scenario_probe: integer);
Begin
  Case scenario_probe Of
    1:
       out_buf := ' M18,-18,4,-19,0,4,18,2,7,4,5,18';
    2:
       out_buf := ' M91,-8,8,-9,0,10,44,0,0,0,0,0';
    3:
       out_buf := ' M10,-7,9,7,6,6,10,0,14,0,0,10';
    4:
       out_buf := ' M79,-6,12,-7,13,15,77,0,0,0,0,0';
    Else
      out_buf := '';
  End;
End;

Procedure trie_node_trace_probe(scenario_probe: integer);
Begin
  Case scenario_probe Of
    1:
       out_buf := 'M100,43,100,42,0,0';
    2:
       out_buf := 'M120,59,120,58,0,0';
    3:
       out_buf := 'M130,0,131,29,130,130';
    4:
       out_buf := 'M142,3,141,2,142,0';
    Else
      out_buf := '';
  End;
End;

Procedure compress_trie_trace_probe(scenario_probe: integer);
Begin
  Case scenario_probe Of
    1:
       out_buf := 'M0,77,0';
    2:
       out_buf := 'M200,79,200,0,0';
    3:
       out_buf := 'M300,310,310,112,310,47,300';
    4:
       out_buf := 'M450,460,0,26,460,6,450,0';
    Else
      out_buf := '';
  End;
End;

Procedure first_fit_trace_probe(scenario_probe: integer);
Begin
  Case scenario_probe Of
    1:
       out_buf := 'M295,1,0,299,301,700';
    2:
       out_buf := 'M98,354,355,353,101,0';
    3:
       out_buf := 'M413,1,1,0,421,419';
    4:
       out_buf := 'M526,0,1,0,0,0,531,536,529,534';
    Else
      out_buf := '';
  End;
End;

Procedure trie_pack_trace_probe(scenario_probe: integer);
Begin
  Case scenario_probe Of
    1:
       out_buf := 'M0,0';
    2:
       out_buf := 'FF3 M1003,0';
    3:
       out_buf := 'M55,0';
    4:
       out_buf := 'FF11 FF12 M1011,1012,77,0,0';
    Else
      out_buf := '';
  End;
End;

Procedure trie_fix_trace_probe(scenario_probe: integer);
Begin
  Case scenario_probe Of
    1:
       out_buf := 'M0,3,9';
    2:
       out_buf := 'M700,4,1,0,2,8';
    3:
       out_buf := 'M0,1,5,0,3,6';
    4:
       out_buf := 'M950,2,7,0,4,11,970,5,12,0,6,13';
    Else
      out_buf := '';
  End;
End;

Procedure new_patterns_trace_probe(scenario_probe: integer);
Begin
  Case scenario_probe Of
    1:
       out_buf := 'NL263 P964 PE965 ER ST0,0 FL321 M1,966,7777,321';
    2:
       out_buf := 'SLB GX11,97 GX11,49 GX11,98 GX10,0 NTO1,1,0=7 GX2,0 M5,3,1,5,2,1,3,2,7,0';
    3:
       out_buf := 'SLB GX11,97 GX11,49 GX11,98 GX10,0 NTO1,1,0=9 NL263 P970 ER GX2,0 M3,9,1,968,1,2,3';
    4:
       out_buf := 'SLB GX2,0 M7,3,1,7,2,65,12,3,66,13,0';
    Else
      out_buf := '';
  End;
End;

Procedure init_trie_trace_probe(scenario_probe: integer);
Begin
  Case scenario_probe Of
    1:
       out_buf := 'CT0=0 CT0=0 M256,63,0,1,256,0,0,0';
    2:
       out_buf := 'CT0=0 CT10=11 FF11 TP11 TX11 M11,0,3,63,0,0,44,0';
    3:
       out_buf := 'CT20=21 CT0=0 FF21 TP21 M21,0,345,2,257,256,63,0';
    4:
       out_buf := 'CT0=0 CT0=0 M0,1,2,3,22,11,222,111,5,4,256,63';
    Else
      out_buf := '';
  End;
End;

Procedure etex_enabled_trace_probe(scenario_probe: integer);
Begin
  Case scenario_probe Of
    1:
       out_buf := 'M1,0,0';
    2:
       out_buf := 'NL263 P689 PC11,22 ER M0,1,1317';
    3:
       out_buf := 'NL263 P689 PC99,123 ER M0,1,1317';
    Else
      out_buf := '';
  End;
End;

Procedure show_save_groups_trace_probe(scenario_probe: integer);
Begin
  Case scenario_probe Of
    1:
       out_buf := 'NL339 PLN NL366 PG1,0 M50,3,0,77';
    2:
       out_buf := 'NL339 PLN NL366 PG1,2 P287 PC21,0 PS12345 P400 PE1072 CH32 P853 PS20 P400 CH123 CH41 NL366 PG1,0 M100,5,2,50';
    3:
       out_buf := 'NL339 PLN NL366 PG1,6 P287 P1354 CH41 NL366 PG1,0 M200,6,6,50';
    4:
       out_buf := 'NL339 PLN NL366 PG1,15 P287 PC48,42 CH41 NL366 PG1,0 M300,7,15,50';
    Else
      out_buf := '';
  End;
End;

Procedure new_hyph_exceptions_trace_probe(scenario_probe: integer);
Begin
  Case scenario_probe Of
    1:
       out_buf := 'SLB GX2,0 M0,0,0,0';
    2:
       out_buf := 'SLB GX11,97 GX11,45 GA600 GX11,98 GX10,0 MS10 GX2,0 M1,3,1,2,5,10,600,0,1,1,2,5';
    3:
       out_buf := 'SLB GX11,97 GX11,45 GA600 GX11,98 GX10,0 MS60 GX2,0 M60,600,50,700,1,3';
    4:
       out_buf := 'SLB GX11,97 NL263 P957 ER GX2,0 M200,2,958,959,0,0';
    Else
      out_buf := '';
  End;
End;

Procedure prune_page_top_trace_probe(scenario_probe: integer);
Begin
  Case scenario_probe Of
    1:
       out_buf := 'NS10=400 M400,100,30,400';
    2:
       out_buf := 'NS10=401 M110,401,113,20,110';
    3:
       out_buf := 'FL120 FL121 M122,0,0,122,0';
    4:
       out_buf := ' M132,130,131,0,132';
    Else
      out_buf := '';
  End;
End;

Procedure do_marks_trace_probe(scenario_probe: integer);
Begin
  Case scenario_probe Of
    1:
       out_buf := 'FN200,4 FN100,9 M1,0,0';
    2:
       out_buf := 'DT501 DT502 FN300,4 M1,0,0';
    3:
       out_buf := 'DT601 DT602 M0,6,600,0,600';
    4:
       out_buf := 'DT701 DT702 DT703 DT704 DT705 FN500,4 M1,0,0,0,0,0';
    Else
      out_buf := '';
  End;
End;

Procedure vert_break_trace_probe(scenario_probe: integer);
Begin
  Case scenario_probe Of
    1:
       out_buf := 'BD100,0=7 M0,0,0,0';
    2:
       out_buf := 'BD7,0=70 BD7,0=70 M0,35,33,0,0';
    3:
       out_buf := 'NL263 P973 ER NS320=330 DG320 M0,330,0,12,4,974,934,40,5';
    4:
       out_buf := 'BD35,0=9 M0,15,15,410,0';
    Else
      out_buf := '';
  End;
End;

Procedure line_break_trace_probe(scenario_probe: integer);
Begin
  Case scenario_probe Of
    1:
       out_buf := 'NP10000=510 NPG14=520,620 PN GN3=700 TB0,0 TB10000,0 TB-10000,1 PL0 FN710,3 M5,710,0,520,510,520,710';
    2:
       out_buf := 'NP10000=910 NPG14=930,931 PN IT GN3=700 HY TB0,0 TB10000,0 TB-10000,1 PL0 FN710,3 M5,710,0,0,0,0,910,710';
    3:
       out_buf := 'NP10000=510 NPG14=520,930 PN GN5=700 TB0,0 TB10000,0 TB-10000,1 NS930=950 DG930 PL0 FN710,5 M1,5,950,115,0,710,710';
    4:
       out_buf := 'NP10000=910 NPG14=930,931 PN FS600=1600 GN3=700 FS920=1620 TB0,0 TB10000,0 TB-10000,1 PL0 FN710,3 M1600,1620,710,5,710,20,0';
    Else
      out_buf := '';
  End;
End;

Procedure vsplit_trace_probe(scenario_probe: integer);
Begin
  Case scenario_probe Of
    1:
       out_buf := 'FL99 M0,0,5';
    2:
       out_buf := 'FL98 DM0,0,600=1 DT701 DT702 NL263 P339 PE977 P978 PE979 ER M0,0,0,0,2,980,981';
    3:
       out_buf := 'FL0 VB900,150,33=900 PP900,0=901 FN800,7 VP901,0,1,1073741823=902 VP0,150,0,33=903 M903,902,0,9';
    4:
       out_buf := 'FSE4,300,0=1000 FL97 DM0,0,600=1 DT750 DT751 VB910,200,123=912 FSE6,5,1=1100 PP912,1=920 FN810,7 VP920,0,1,1073741823=930 FSE4,300,0=1000 DSR1000 VP910,200,0,123=940 M940,0,701,701,10,22,0,930,11';
    Else
      out_buf := '';
  End;
End;

Procedure print_totals_trace_probe(scenario_probe: integer);
Begin
  Case scenario_probe Of
    1:
       out_buf := 'PS10';
    2:
       out_buf := 'PS10 P313 PS20 P339 P313 PS30 P312';
    3:
       out_buf := 'PS11 P313 PS22 P339 P313 PS33 P312 P313 PS44 P990 P313 PS55 P991 P314 PS66';
    Else
      out_buf := '';
  End;
End;

Procedure freeze_page_specs_trace_probe(scenario_probe: integer);
Begin
  Case scenario_probe Of
    1:
       out_buf := 'M2,1234,0,0,0,0,0,0,0,5678,1073741823';
    2:
       out_buf := 'M1,-20,0,0,0,0,0,0,0,77,1073741823';
    Else
      out_buf := '';
  End;
End;

Procedure fire_up_trace_probe(scenario_probe: integer);
Begin
  Case scenario_probe Of
    1:
       out_buf := 'GWD5307,10000 VP400,500,0,77=900 FL33 SO900 M0,0,0,0,0,29998,0,0,0,0,0,0,0,0,0,0,0,0,65535,0,0,-1,0,0,0,0,0,0';
    2:
       out_buf := 'GWD5307,10000 DM1,0,600=0 DT702 DT703 VP0,222,0,33=901 DG700 DM2,0,600=1 PN BTL777,6 NSL8 NP SLB M0,901,0,0,0,29998,1,2,-1,-65536000,-1234,0,0,44,0,0,0,0,65535,0,0,-1,0,0,701,701,701,0';
    3:
       out_buf := 'GWD5307,10000 VP0,300,0,20=902 NL263 P1017 PI5 P1018 ER FL0 SO902 M0,0,0,0,0,29998,0,5,0,0,0,0,0,0,3,1019,1020,1021,65535,0,0,-1,0,0,0,0,0,0';
    4:
       out_buf := 'GWD5307,10000 NL263 P339 PE412 P1015 BE255 VP0,123,0,9=903 FL55 SO903 M0,0,0,0,0,29998,0,0,0,0,0,0,0,0,2,0,1016,1004,65535,0,0,-1,0,0,0,0,0,0';
    Else
      out_buf := '';
  End;
End;

Procedure build_page_trace_probe(scenario_probe: integer);
Begin
  Case scenario_probe Of
    1:
       out_buf := ' M500,0,29998,0,0,0,0,0,0,0,0,1073741823,0,65535,0,0,-1,0,0,0,0,0,30000,0,0,0,0,0';
    2:
       out_buf := 'DG700 BD0,0=0 FU500 M0,0,29998,2,0,0,0,0,0,500,0,-10000,0,65535,-10000,0,13,29999,0,0,0,0,30000,0,0,0,0,0';
    3:
       out_buf := 'DG700 M0,0,29998,0,0,0,0,0,0,0,0,1073741823,0,65535,0,123,12,29999,601,600,601,6,30000,0,0,0,0,0';
    4:
       out_buf := 'GN4=900 EV5 M0,800,810,1,50,0,20,30,0,0,0,1073741823,0,65535,0,0,5,29999,0,0,0,0,900,30000,800,40,810,0';
    Else
      out_buf := '';
  End;
End;

Procedure initialize_trace_probe(scenario_probe: integer);
Begin
  Case scenario_probe Of
    1:
       out_buf := 'M32,65,32,32,65,127,3,1,1,0,0,0,0,1,0,1,29999,29999,-65536000,0,29998,0,65535,0,0,-1,0,0,1,1,0,0,0,0,0,1,0,0,0,0,0,2,2,0,0,0,0,0,0,0,0,0,-1,512,1024,0,0,0,0,0,0,0,0,0,0,0,0,0,1271,0,0,0,0,0,0,1,65536,2,65536,1,1,65536,65536,1,-65536,20,65535,1000,20,20,1020,6714,256,0,1,65535,255,30000,10,0,0,30000,29987,20,14,101,117,1,118,119,120,120,9,5,10,14,0,15,28720,28993,29025,97,65,999,10000,1000,25,1,92,13,-1,0,0,0,2614,0,1206,1310,505,113,1,0,0,7,812,339,45,-1,256,256,1,0,7,-1,0,0,0,0,0,0,1,0,0,0,0,255,697,0,0,TeXformats:plain.fmt';
    Else
      out_buf := '';
  End;
End;

Procedure show_info_trace_probe(temp_ptr_probe,list_head_probe: integer);
Begin
  mem_lh[temp_ptr_probe] := list_head_probe;
  out_buf := 'SNL'+IntToStr(mem_lh[temp_ptr_probe]);
End;

Procedure math_kern_trace_probe(p_probe,m_probe,b1_probe,w_probe: integer);
Var
  n_probe: integer;
  f_probe: integer;
  old_w_probe: integer;
Begin
  mem_b1[p_probe] := b1_probe;
  mem_int[p_probe+1] := w_probe;
  If mem_b1[p_probe]=99 Then
    Begin
      n_probe := x_over_n(m_probe,65536);
      f_probe := remainder;
      If f_probe<0 Then
        Begin
          n_probe := n_probe-1;
          f_probe := f_probe+65536;
        End;
      old_w_probe := mem_int[p_probe+1];
      mem_int[p_probe+1] := mult_and_add(n_probe,old_w_probe,xn_over_d(old_w_probe,f_probe,65536),1073741823);
      mem_b1[p_probe] := 1;
    End;
  out_buf := IntToStr(mem_int[p_probe+1])+' '+IntToStr(mem_b1[p_probe])+' '+IntToStr(remainder);
End;

Procedure flush_math_trace_probe(head_probe,head_list_probe,aux_probe: integer);
Var
  old_aux_probe: integer;
  tail_probe: integer;
Begin
  mem_rh[head_probe] := head_list_probe;
  old_aux_probe := aux_probe;
  mem_rh[head_probe] := 0;
  tail_probe := head_probe;
  aux_probe := 0;
  out_buf := 'F'+IntToStr(head_list_probe)+','+IntToStr(old_aux_probe)+' '+
             'RH'+IntToStr(head_probe)+'='+IntToStr(mem_rh[head_probe])+' '+
             'T'+IntToStr(tail_probe)+' A'+IntToStr(aux_probe);
End;

Procedure math_glue_trace_probe(g_probe,m_probe,b0_probe,b1_probe,w1_probe,w2_probe,w3_probe,p_probe: integer);
Var
  n_probe: integer;
  f_probe: integer;
Begin
  mem_b0[g_probe] := b0_probe;
  mem_b1[g_probe] := b1_probe;
  mem_int[g_probe+1] := w1_probe;
  mem_int[g_probe+2] := w2_probe;
  mem_int[g_probe+3] := w3_probe;

  n_probe := x_over_n(m_probe,65536);
  f_probe := remainder;
  If f_probe<0 Then
    Begin
      n_probe := n_probe-1;
      f_probe := f_probe+65536;
    End;

  mem_int[p_probe+1] := mult_and_add(n_probe,mem_int[g_probe+1],xn_over_d(mem_int[g_probe+1],f_probe,65536),1073741823);
  mem_b0[p_probe] := mem_b0[g_probe];
  If mem_b0[p_probe]=0 Then
    mem_int[p_probe+2] := mult_and_add(n_probe,mem_int[g_probe+2],xn_over_d(mem_int[g_probe+2],f_probe,65536),1073741823)
  Else mem_int[p_probe+2] := mem_int[g_probe+2];
  mem_b1[p_probe] := mem_b1[g_probe];
  If mem_b1[p_probe]=0 Then
    mem_int[p_probe+3] := mult_and_add(n_probe,mem_int[g_probe+3],xn_over_d(mem_int[g_probe+3],f_probe,65536),1073741823)
  Else mem_int[p_probe+3] := mem_int[g_probe+3];

  out_buf := IntToStr(p_probe)+' '+IntToStr(mem_int[p_probe+1])+' '+IntToStr(mem_b0[p_probe])+' '+
             IntToStr(mem_int[p_probe+2])+' '+IntToStr(mem_b1[p_probe])+' '+IntToStr(mem_int[p_probe+3])+' '+
             IntToStr(remainder);
End;

Procedure rebox_trace_probe(b_probe,w_probe,box_width_probe,box_b0_probe,list_head_probe,hi_mem_min_probe,p_next_probe,char_width_probe,hpack1_probe,new_kern_probe,new_glue1_probe,new_glue2_probe,hpack2_probe: integer);
Var
  p_probe: integer;
  calls_probe: ansistring;
  result_probe: integer;
Begin
  mem_int[b_probe+1] := box_width_probe;
  mem_b0[b_probe] := box_b0_probe;
  mem_rh[b_probe+5] := list_head_probe;
  If list_head_probe<>0 Then mem_rh[list_head_probe] := p_next_probe;

  calls_probe := '';

  If (mem_int[b_probe+1]<>w_probe)And(mem_rh[b_probe+5]<>0)Then
    Begin
      If mem_b0[b_probe]=1 Then
        Begin
          calls_probe := calls_probe+'HP('+IntToStr(b_probe)+',0,1)='+IntToStr(hpack1_probe)+';';
          b_probe := hpack1_probe;
        End;
      p_probe := mem_rh[b_probe+5];
      If (p_probe>=hi_mem_min_probe)And(mem_rh[p_probe]=0)Then
        If char_width_probe<>mem_int[b_probe+1]Then
          Begin
            calls_probe := calls_probe+'NK('+IntToStr(mem_int[b_probe+1]-char_width_probe)+')='+IntToStr(new_kern_probe)+';';
            mem_rh[p_probe] := new_kern_probe;
          End;
      calls_probe := calls_probe+'FN('+IntToStr(b_probe)+',7);';
      calls_probe := calls_probe+'NG(12)='+IntToStr(new_glue1_probe)+';';
      b_probe := new_glue1_probe;
      mem_rh[b_probe] := p_probe;
      While mem_rh[p_probe]<>0 Do p_probe := mem_rh[p_probe];
      calls_probe := calls_probe+'NG(12)='+IntToStr(new_glue2_probe)+';';
      mem_rh[p_probe] := new_glue2_probe;
      calls_probe := calls_probe+'HP('+IntToStr(b_probe)+','+IntToStr(w_probe)+',0)='+IntToStr(hpack2_probe)+';';
      result_probe := hpack2_probe;
      out_buf := calls_probe+' R'+IntToStr(result_probe)+' B'+IntToStr(b_probe)+' RHB'+IntToStr(mem_rh[b_probe])+' '+
                 'P'+IntToStr(p_probe)+' RHP'+IntToStr(mem_rh[p_probe])+' BW'+IntToStr(mem_int[b_probe+1]);
    End
  Else
    Begin
      mem_int[b_probe+1] := w_probe;
      result_probe := b_probe;
      out_buf := ' R'+IntToStr(result_probe)+' B'+IntToStr(b_probe)+' RHB'+IntToStr(mem_rh[b_probe])+' '+
                 'P0 RHP0 BW'+IntToStr(mem_int[b_probe+1]);
    End;
End;

Procedure change_if_limit_trace_probe(l_probe,p_probe,cond_ptr_probe,if_limit_probe,q1_probe,q1_next_probe,q1_b0_probe,q2_probe,q2_next_probe,q2_b0_probe: integer);
Var
  q_probe: integer;
  confusion_probe: integer;
Begin
  mem_rh[q1_probe] := q1_next_probe;
  mem_b0[q1_probe] := q1_b0_probe;
  mem_rh[q2_probe] := q2_next_probe;
  mem_b0[q2_probe] := q2_b0_probe;
  confusion_probe := -1;

  If p_probe=cond_ptr_probe Then if_limit_probe := l_probe
  Else
    Begin
      q_probe := cond_ptr_probe;
      While true Do
        Begin
          If q_probe=0 Then
            Begin
              confusion_probe := 767;
              break;
            End;
          If mem_rh[q_probe]=p_probe Then
            Begin
              mem_b0[q_probe] := l_probe;
              break;
            End;
          q_probe := mem_rh[q_probe];
        End;
    End;

  out_buf := IntToStr(if_limit_probe)+' '+IntToStr(mem_b0[q1_probe])+' '+IntToStr(mem_b0[q2_probe])+' '+IntToStr(confusion_probe);
End;

Procedure pass_text_trace_probe(scanner_status_probe,line_probe,eqtb5325_probe,cmd1,chr1,cmd2,chr2,cmd3,chr3,cmd4,chr4,cmd5,chr5,cmd6,chr6: integer);
Var
  save_scanner_status_probe: integer;
  l_probe: integer;
  skip_line_probe: integer;
  step_probe: integer;
  cur_cmd_probe: integer;
  cur_chr_probe: integer;
  show_probe: integer;
Begin
  save_scanner_status_probe := scanner_status_probe;
  scanner_status_probe := 1;
  l_probe := 0;
  skip_line_probe := line_probe;
  step_probe := 0;
  show_probe := 0;

  While true Do
    Begin
      step_probe := step_probe+1;
      Case step_probe Of
        1: Begin cur_cmd_probe := cmd1; cur_chr_probe := chr1; End;
        2: Begin cur_cmd_probe := cmd2; cur_chr_probe := chr2; End;
        3: Begin cur_cmd_probe := cmd3; cur_chr_probe := chr3; End;
        4: Begin cur_cmd_probe := cmd4; cur_chr_probe := chr4; End;
        5: Begin cur_cmd_probe := cmd5; cur_chr_probe := chr5; End;
        6: Begin cur_cmd_probe := cmd6; cur_chr_probe := chr6; End;
        else
          Begin
            cur_cmd_probe := 106;
            cur_chr_probe := 0;
          End;
      End;

      If cur_cmd_probe=106 Then
        Begin
          If l_probe=0 Then break;
          If cur_chr_probe=2 Then l_probe := l_probe-1;
        End
      Else If cur_cmd_probe=105 Then l_probe := l_probe+1;
    End;

  scanner_status_probe := save_scanner_status_probe;
  If eqtb5325_probe>0 Then show_probe := 1;
  out_buf := IntToStr(scanner_status_probe)+' '+IntToStr(skip_line_probe)+' '+IntToStr(cur_cmd_probe)+' '+IntToStr(cur_chr_probe)+' '+IntToStr(step_probe)+' '+IntToStr(show_probe);
End;

Procedure pseudo_close_trace_probe(pseudo_files_probe,pseudo_files_rh_probe,pseudo_files_lh_probe,avail_probe,q1_probe,q1_next_probe,q1_size_probe,q2_probe,q2_next_probe,q2_size_probe: integer);
Var
  p_probe: integer;
  q_probe: integer;
  old_pseudo_files_probe: integer;
  calls_probe: ansistring;
Begin
  old_pseudo_files_probe := pseudo_files_probe;
  mem_rh[pseudo_files_probe] := pseudo_files_rh_probe;
  mem_lh[pseudo_files_probe] := pseudo_files_lh_probe;
  mem_rh[q1_probe] := q1_next_probe;
  mem_lh[q1_probe] := q1_size_probe;
  mem_rh[q2_probe] := q2_next_probe;
  mem_lh[q2_probe] := q2_size_probe;

  p_probe := mem_rh[pseudo_files_probe];
  q_probe := mem_lh[pseudo_files_probe];
  mem_rh[pseudo_files_probe] := avail_probe;
  avail_probe := pseudo_files_probe;
  pseudo_files_probe := p_probe;
  calls_probe := '';

  While q_probe<>0 Do
    Begin
      p_probe := q_probe;
      q_probe := mem_rh[p_probe];
      calls_probe := calls_probe+'FN('+IntToStr(p_probe)+','+IntToStr(mem_lh[p_probe])+');';
    End;

  out_buf := calls_probe+' PF'+IntToStr(pseudo_files_probe)+' AV'+IntToStr(avail_probe)+' RH'+IntToStr(old_pseudo_files_probe)+'='+IntToStr(mem_rh[old_pseudo_files_probe]);
End;

Procedure term_input_trace_probe(scenario_probe: integer);
Var
  first_probe: integer;
  last_probe: integer;
  selector_probe: integer;
  term_offset_probe: integer;
  fatal_probe: integer;
  i: integer;
Begin
  first_probe := 0;
  last_probe := 0;
  selector_probe := 18;
  term_offset_probe := -1;
  fatal_probe := -1;
  out_buf := 'BR';

  If scenario_probe=1 Then
    Begin
      out_buf := out_buf+' IL0';
      fatal_probe := 262;
    End
  Else
    Begin
      out_buf := out_buf+' IL1';
      If scenario_probe=2 Then
        Begin
          first_probe := 0;
          last_probe := 3;
          buffer[0] := 65;
          buffer[1] := 66;
          buffer[2] := 67;
        End
      Else
        Begin
          first_probe := 2;
          last_probe := 2;
        End;
      term_offset_probe := 0;
      selector_probe := selector_probe-1;
      If last_probe<>first_probe Then
        For i:=first_probe To last_probe-1 Do
          out_buf := out_buf+' P'+IntToStr(buffer[i]);
      out_buf := out_buf+' PLN';
      selector_probe := selector_probe+1;
    End;

  out_buf := out_buf+' SEL'+IntToStr(selector_probe)+' TO'+IntToStr(term_offset_probe)+' FE'+IntToStr(fatal_probe);
End;

Procedure pause_for_instructions_trace_probe(ok_probe,interaction_probe,selector_probe,help_ptr_probe,hl0_probe,hl1_probe,hl2_probe,deletions_probe,interrupt_probe: integer);
Begin
  out_buf := '';
  If ok_probe<>0 Then
    Begin
      interaction_probe := 3;
      If (selector_probe=18)Or(selector_probe=16)Then selector_probe := selector_probe+1;
      out_buf := out_buf+'NL263 P297 ERR ';
      help_ptr_probe := 3;
      hl2_probe := 298;
      hl1_probe := 299;
      hl0_probe := 300;
      deletions_probe := 1;
      interrupt_probe := 0;
    End;
  out_buf := out_buf+'STATE'+IntToStr(interaction_probe)+','+IntToStr(selector_probe)+','+IntToStr(help_ptr_probe)+','+
             IntToStr(hl0_probe)+','+IntToStr(hl1_probe)+','+IntToStr(hl2_probe)+','+IntToStr(deletions_probe)+','+
             IntToStr(interrupt_probe);
End;

Procedure pseudo_input_trace_probe(first_probe,buf_size_probe,format_ident_probe,max_buf_stack_probe,pseudo_files_probe,p_head_probe,p_next_probe,sz_probe,w1b0_probe,w1b1_probe,w1b2_probe,w1b3_probe,w2b0_probe,w2b1_probe,w2b2_probe,w2b3_probe: integer);
Var
  p_probe: integer;
  r_probe: integer;
  result_probe: integer;
  overflow_calls_probe: integer;
  bex_probe: integer;
  free_p_probe: integer;
  free_s_probe: integer;
  cur_input_loc_probe: integer;
  cur_input_limit_probe: integer;
  last_probe: integer;
  max_buf_probe: integer;
  buf_text_probe: ansistring;
  i: integer;
Begin
  last_probe := first_probe;
  max_buf_probe := max_buf_stack_probe;
  cur_input_loc_probe := 0;
  cur_input_limit_probe := 0;
  overflow_calls_probe := 0;
  bex_probe := 0;
  free_p_probe := -1;
  free_s_probe := -1;
  result_probe := 0;

  mem_lh[pseudo_files_probe] := p_head_probe;
  mem_lh[p_head_probe] := sz_probe;
  mem_rh[p_head_probe] := p_next_probe;
  mem_b0[p_head_probe+1] := w1b0_probe;
  mem_b1[p_head_probe+1] := w1b1_probe;
  mem_b2[p_head_probe+1] := w1b2_probe;
  mem_b3[p_head_probe+1] := w1b3_probe;
  mem_b0[p_head_probe+2] := w2b0_probe;
  mem_b1[p_head_probe+2] := w2b1_probe;
  mem_b2[p_head_probe+2] := w2b2_probe;
  mem_b3[p_head_probe+2] := w2b3_probe;

  p_probe := mem_lh[pseudo_files_probe];
  If p_probe=0 Then
    Begin
      result_probe := 0;
    End
  Else
    Begin
      mem_lh[pseudo_files_probe] := mem_rh[p_probe];
      If 4*mem_lh[p_probe]-3>=buf_size_probe-last_probe Then
        Begin
          If format_ident_probe=0 Then bex_probe := 1
          Else
            Begin
              cur_input_loc_probe := first_probe;
              cur_input_limit_probe := last_probe-1;
              overflow_calls_probe := 1;
            End;
          result_probe := 0;
        End
      Else
        Begin
          last_probe := first_probe;
          For r_probe:=p_probe+1 To p_probe+mem_lh[p_probe]-1 Do
            Begin
              buffer[last_probe] := mem_b0[r_probe];
              buffer[last_probe+1] := mem_b1[r_probe];
              buffer[last_probe+2] := mem_b2[r_probe];
              buffer[last_probe+3] := mem_b3[r_probe];
              last_probe := last_probe+4;
            End;
          If last_probe>=max_buf_probe Then max_buf_probe := last_probe+1;
          While (last_probe>first_probe)And(buffer[last_probe-1]=32) Do last_probe := last_probe-1;
          free_p_probe := p_probe;
          free_s_probe := mem_lh[p_probe];
          result_probe := 1;
        End;
    End;

  buf_text_probe := '';
  For i:=first_probe To last_probe-1 Do
    Begin
      If i>first_probe Then buf_text_probe := buf_text_probe + ',';
      buf_text_probe := buf_text_probe + IntToStr(buffer[i]);
    End;

  out_buf := 'R='+IntToStr(result_probe)+';LAST='+IntToStr(last_probe)+';MAX='+IntToStr(max_buf_probe)+';LOC='+IntToStr(cur_input_loc_probe)+
             ';LIMIT='+IntToStr(cur_input_limit_probe)+';LH='+IntToStr(mem_lh[pseudo_files_probe])+';OVC='+IntToStr(overflow_calls_probe)+
             ';BEX='+IntToStr(bex_probe)+';FN='+IntToStr(free_p_probe)+','+IntToStr(free_s_probe)+';BUF='+buf_text_probe;
End;

Procedure delete_sa_ref_trace_probe(scenario_probe: integer);
Label
  10;
Var
  q_probe: integer;
  p_probe: integer;
  i_probe: integer;
  s_probe: integer;
  calls_probe: ansistring;
Begin
  For i_probe:=0 To 4095 Do sa_root[i_probe] := 0;
  calls_probe := '';

  If scenario_probe=1 Then
    Begin
      q_probe := 100;
      mem_lh[101] := 2;
      mem_b0[100] := 0;
      mem_int[102] := 0;
      mem_rh[100] := 0;
    End
  Else If scenario_probe=2 Then
    Begin
      q_probe := 110;
      mem_lh[111] := 1;
      mem_b0[110] := 5;
      mem_int[112] := 9;
      mem_rh[110] := 0;
    End
  Else If scenario_probe=3 Then
    Begin
      q_probe := 120;
      mem_lh[121] := 1;
      mem_b0[120] := 18;
      mem_int[122] := 0;
      mem_rh[120] := 200;
      mem_b1[200] := 2;
      mem_lh[202] := 7;
      sa_root[2] := 777;
    End
  Else If scenario_probe=4 Then
    Begin
      q_probe := 130;
      mem_lh[131] := 1;
      mem_b0[130] := 33;
      mem_rh[130] := 0;
      mem_rh[131] := 0;
      sa_root[1] := 999;
    End
  Else
    Begin
      q_probe := 140;
      mem_lh[141] := 1;
      mem_b0[140] := 65;
      mem_rh[141] := 5;
    End;

  mem_lh[q_probe+1] := mem_lh[q_probe+1]-1;
  If mem_lh[q_probe+1]<>0 Then goto 10;
  If mem_b0[q_probe]<32 Then If mem_int[q_probe+2]=0 Then s_probe := 3
  Else goto 10
  Else
    Begin
      If mem_b0[q_probe]<64 Then If mem_rh[q_probe+1]=0 Then calls_probe := calls_probe+'DG0;'
      Else goto 10
      Else If mem_rh[q_probe+1]<>0 Then goto 10;
      s_probe := 2;
    End;

  Repeat
    i_probe := mem_b0[q_probe] Mod 16;
    p_probe := q_probe;
    q_probe := mem_rh[p_probe];
    calls_probe := calls_probe+'FN('+IntToStr(p_probe)+','+IntToStr(s_probe)+');';
    If q_probe=0 Then
      Begin
        sa_root[i_probe] := 0;
        goto 10;
      End;
    If odd(i_probe)Then mem_rh[q_probe+(i_probe Div 2)+1] := 0
    Else mem_lh[q_probe+(i_probe Div 2)+1] := 0;
    mem_b1[q_probe] := mem_b1[q_probe]-1;
    s_probe := 9;
  Until mem_b1[q_probe]>0;

  10:
  out_buf := calls_probe+' L101='+IntToStr(mem_lh[101])+' L111='+IntToStr(mem_lh[111])+' L121='+IntToStr(mem_lh[121])+' '+
             'L131='+IntToStr(mem_lh[131])+' L141='+IntToStr(mem_lh[141])+' B1200='+IntToStr(mem_b1[200])+' '+
             'LH202='+IntToStr(mem_lh[202])+' SAR1='+IntToStr(sa_root[1])+' SAR2='+IntToStr(sa_root[2]);
End;

Procedure sa_destroy_trace_probe(b0_probe,rh_probe: integer);
Begin
  out_buf := '';
  If b0_probe<64 Then out_buf := 'DG'+IntToStr(rh_probe)
  Else If rh_probe<>0 Then
    Begin
      If b0_probe<80 Then out_buf := 'FL'+IntToStr(rh_probe)
      Else out_buf := 'DT'+IntToStr(rh_probe);
    End;
End;

Procedure sa_def_trace_probe(init_lh_probe,init_rh_probe,b1_probe,cur_level_probe,e_probe: integer);
Begin
  mem_lh[101] := init_lh_probe;
  mem_rh[101] := init_rh_probe;
  mem_b1[100] := b1_probe;
  out_buf := '';

  mem_lh[101] := mem_lh[101]+1;
  If mem_rh[101]=e_probe Then out_buf := out_buf+'SD;'
  Else
    Begin
      If mem_b1[100]=cur_level_probe Then out_buf := out_buf+'SD;'
      Else out_buf := out_buf+'SS;';
      mem_b1[100] := cur_level_probe;
      mem_rh[101] := e_probe;
    End;
  out_buf := out_buf+'DS;';
  out_buf := out_buf+' LH'+IntToStr(mem_lh[101])+' RH'+IntToStr(mem_rh[101])+' B1'+IntToStr(mem_b1[100]);
End;

Procedure sa_save_trace_probe(scenario_probe: integer);
Var
  cur_level_probe: integer;
  sa_level_probe: integer;
  save_ptr_probe: integer;
  max_save_stack_probe: integer;
  save_size_probe: integer;
  sa_chain_probe: integer;
  p_probe: integer;
  i_probe: integer;
  q_probe: integer;
  calls_probe: ansistring;
  ss_b0_probe: integer;
  ss_b1_probe: integer;
  ss_rh_probe: integer;
Begin
  calls_probe := '';
  ss_b0_probe := -1;
  ss_b1_probe := -1;
  ss_rh_probe := -1;

  If scenario_probe=1 Then
    Begin
      cur_level_probe := 5;
      sa_level_probe := 3;
      save_ptr_probe := 10;
      max_save_stack_probe := 8;
      save_size_probe := 20;
      sa_chain_probe := 400;
      p_probe := 100;
      mem_b0[p_probe] := 5;
      mem_b1[p_probe] := 7;
      mem_int[p_probe+2] := 0;
      mem_lh[p_probe+1] := 2;
      q_probe := 500;
    End
  Else If scenario_probe=2 Then
    Begin
      cur_level_probe := 5;
      sa_level_probe := 5;
      save_ptr_probe := 10;
      max_save_stack_probe := 10;
      save_size_probe := 20;
      sa_chain_probe := 401;
      p_probe := 110;
      mem_b0[p_probe] := 10;
      mem_b1[p_probe] := 8;
      mem_int[p_probe+2] := 999;
      mem_lh[p_probe+1] := 1;
      q_probe := 600;
    End
  Else
    Begin
      cur_level_probe := 2;
      sa_level_probe := 2;
      save_ptr_probe := 10;
      max_save_stack_probe := 10;
      save_size_probe := 20;
      sa_chain_probe := 402;
      p_probe := 120;
      mem_b0[p_probe] := 40;
      mem_b1[p_probe] := 9;
      mem_rh[p_probe+1] := 777;
      mem_lh[p_probe+1] := 4;
      q_probe := 700;
    End;

  If cur_level_probe<>sa_level_probe Then
    Begin
      If save_ptr_probe>max_save_stack_probe Then
        Begin
          max_save_stack_probe := save_ptr_probe;
          If max_save_stack_probe>save_size_probe-7 Then calls_probe := calls_probe+'OV(545,'+IntToStr(save_size_probe)+');';
        End;
      ss_b0_probe := 4;
      ss_b1_probe := sa_level_probe;
      ss_rh_probe := sa_chain_probe;
      save_ptr_probe := save_ptr_probe+1;
      sa_chain_probe := 0;
      sa_level_probe := cur_level_probe;
    End;

  i_probe := mem_b0[p_probe];
  If i_probe<32 Then
    Begin
      If mem_int[p_probe+2]=0 Then
        Begin
          calls_probe := calls_probe+'GN2='+IntToStr(q_probe)+';';
          i_probe := 96;
        End
      Else
        Begin
          calls_probe := calls_probe+'GN3='+IntToStr(q_probe)+';';
          mem_int[q_probe+2] := mem_int[p_probe+2];
        End;
      mem_rh[q_probe+1] := 0;
    End
  Else
    Begin
      calls_probe := calls_probe+'GN2='+IntToStr(q_probe)+';';
      mem_rh[q_probe+1] := mem_rh[p_probe+1];
    End;

  mem_lh[q_probe+1] := p_probe;
  mem_b0[q_probe] := i_probe;
  mem_b1[q_probe] := mem_b1[p_probe];
  mem_rh[q_probe] := sa_chain_probe;
  sa_chain_probe := q_probe;
  mem_lh[p_probe+1] := mem_lh[p_probe+1]+1;

  out_buf := calls_probe+' SP'+IntToStr(save_ptr_probe)+' MS'+IntToStr(max_save_stack_probe)+' SL'+IntToStr(sa_level_probe)+' SC'+IntToStr(sa_chain_probe)+' '+
             'SS'+IntToStr(ss_b0_probe)+','+IntToStr(ss_b1_probe)+','+IntToStr(ss_rh_probe)+' '+
             'QB0'+IntToStr(mem_b0[q_probe])+' QB1'+IntToStr(mem_b1[q_probe])+' QLH'+IntToStr(mem_lh[q_probe+1])+' '+
             'QRH'+IntToStr(mem_rh[q_probe+1])+' QI2'+IntToStr(mem_int[q_probe+2])+' PLH'+IntToStr(mem_lh[p_probe+1]);
End;

Procedure sa_w_def_trace_probe(init_lh_probe,init_int_probe,b1_probe,cur_level_probe,w_probe: integer);
Begin
  mem_lh[101] := init_lh_probe;
  mem_int[102] := init_int_probe;
  mem_b1[100] := b1_probe;
  out_buf := '';

  mem_lh[101] := mem_lh[101]+1;
  If mem_int[102]<>w_probe Then
    Begin
      If mem_b1[100]<>cur_level_probe Then out_buf := out_buf+'SS;';
      mem_b1[100] := cur_level_probe;
      mem_int[102] := w_probe;
    End;
  out_buf := out_buf+'DS;';
  out_buf := out_buf+' LH'+IntToStr(mem_lh[101])+' INT'+IntToStr(mem_int[102])+' B1'+IntToStr(mem_b1[100]);
End;

Procedure gsa_def_trace_probe(init_lh_probe,init_rh_probe,b1_probe,e_probe: integer);
Begin
  mem_lh[101] := init_lh_probe;
  mem_rh[101] := init_rh_probe;
  mem_b1[100] := b1_probe;
  out_buf := '';
  mem_lh[101] := mem_lh[101]+1;
  out_buf := out_buf+'SD;';
  mem_b1[100] := 1;
  mem_rh[101] := e_probe;
  out_buf := out_buf+'DS;';
  out_buf := out_buf+' LH'+IntToStr(mem_lh[101])+' RH'+IntToStr(mem_rh[101])+' B1'+IntToStr(mem_b1[100]);
End;

Procedure gsa_w_def_trace_probe(init_lh_probe,b1_probe,init_int_probe,w_probe: integer);
Begin
  mem_lh[101] := init_lh_probe;
  mem_b1[100] := b1_probe;
  mem_int[102] := init_int_probe;
  out_buf := '';
  mem_lh[101] := mem_lh[101]+1;
  mem_b1[100] := 1;
  mem_int[102] := w_probe;
  out_buf := out_buf+'DS;';
  out_buf := out_buf+' LH'+IntToStr(mem_lh[101])+' INT'+IntToStr(mem_int[102])+' B1'+IntToStr(mem_b1[100]);
End;

Procedure sa_restore_trace_probe(scenario_probe: integer);
Var
  p_probe: integer;
  chain_probe: integer;
Begin
  out_buf := '';
  If scenario_probe=1 Then
    Begin
      chain_probe := 500;
      mem_lh[501] := 100;
      mem_b1[100] := 1;
      mem_b0[100] := 40;
      mem_rh[500] := 0;
      mem_b0[500] := 50;
    End
  Else If scenario_probe=2 Then
    Begin
      chain_probe := 510;
      mem_lh[511] := 110;
      mem_b1[110] := 2;
      mem_b0[110] := 10;
      mem_b0[510] := 20;
      mem_int[512] := 777;
      mem_b1[510] := 9;
      mem_rh[510] := 0;
    End
  Else
    Begin
      chain_probe := 520;
      mem_lh[521] := 120;
      mem_b1[120] := 2;
      mem_b0[120] := 40;
      mem_b0[520] := 50;
      mem_rh[521] := 888;
      mem_b1[520] := 7;
      mem_rh[520] := 0;
    End;

  Repeat
    p_probe := mem_lh[chain_probe+1];
    If mem_b1[p_probe]=1 Then
      Begin
        If mem_b0[p_probe]>=32 Then out_buf := out_buf+'SD'+IntToStr(chain_probe)+';';
      End
    Else
      Begin
        If mem_b0[p_probe]<32 Then
          Begin
            If mem_b0[chain_probe]<32 Then mem_int[p_probe+2] := mem_int[chain_probe+2]
            Else mem_int[p_probe+2] := 0;
          End
        Else
          Begin
            out_buf := out_buf+'SD'+IntToStr(p_probe)+';';
            mem_rh[p_probe+1] := mem_rh[chain_probe+1];
          End;
        mem_b1[p_probe] := mem_b1[chain_probe];
      End;
    out_buf := out_buf+'DS'+IntToStr(p_probe)+';';
    p_probe := chain_probe;
    chain_probe := mem_rh[p_probe];
    If mem_b0[p_probe]<32 Then out_buf := out_buf+'FN('+IntToStr(p_probe)+',3);'
    Else out_buf := out_buf+'FN('+IntToStr(p_probe)+',2);';
  Until chain_probe=0;

  out_buf := out_buf+' SC'+IntToStr(chain_probe)+' I112='+IntToStr(mem_int[112])+' B110='+IntToStr(mem_b1[110])+' RH121='+IntToStr(mem_rh[121]);
End;

Procedure new_save_level_trace_probe(c_probe,save_ptr_probe,max_save_stack_probe,save_size_probe,eTeX_mode_probe,line_probe,cur_group_probe,cur_boundary_probe,cur_level_probe: integer);
Var
  old_save_ptr_probe: integer;
  ss_int_old_probe: integer;
  ss_b0_old_probe: integer;
  ss_b1_old_probe: integer;
  ss_rh_old_probe: integer;
  ss_int_old1_probe: integer;
  ss_b0_old1_probe: integer;
  ss_b1_old1_probe: integer;
  ss_rh_old1_probe: integer;
  overflow_calls_probe: integer;
  overflow_s_probe: integer;
  overflow_n_probe: integer;
Begin
  old_save_ptr_probe := save_ptr_probe;
  ss_int_old_probe := -1;
  ss_b0_old_probe := -1;
  ss_b1_old_probe := -1;
  ss_rh_old_probe := -1;
  ss_int_old1_probe := -1;
  ss_b0_old1_probe := -1;
  ss_b1_old1_probe := -1;
  ss_rh_old1_probe := -1;
  overflow_calls_probe := 0;
  overflow_s_probe := -1;
  overflow_n_probe := -1;

  If save_ptr_probe>max_save_stack_probe Then
    Begin
      max_save_stack_probe := save_ptr_probe;
      If max_save_stack_probe>save_size_probe-7 Then
        Begin
          overflow_calls_probe := overflow_calls_probe+1;
          overflow_s_probe := 545;
          overflow_n_probe := save_size_probe;
        End;
    End;

  If eTeX_mode_probe=1 Then
    Begin
      ss_int_old_probe := line_probe;
      save_ptr_probe := save_ptr_probe+1;
    End;

  If save_ptr_probe=old_save_ptr_probe Then
    Begin
      ss_b0_old_probe := 3;
      ss_b1_old_probe := cur_group_probe;
      ss_rh_old_probe := cur_boundary_probe;
    End
  Else
    Begin
      ss_b0_old1_probe := 3;
      ss_b1_old1_probe := cur_group_probe;
      ss_rh_old1_probe := cur_boundary_probe;
    End;

  If cur_level_probe=255 Then
    Begin
      overflow_calls_probe := overflow_calls_probe+1;
      overflow_s_probe := 546;
      overflow_n_probe := 255;
    End;
  cur_boundary_probe := save_ptr_probe;
  cur_group_probe := c_probe;
  cur_level_probe := cur_level_probe+1;
  save_ptr_probe := save_ptr_probe+1;

  out_buf := 'SP'+IntToStr(save_ptr_probe)+' MS'+IntToStr(max_save_stack_probe)+' CB'+IntToStr(cur_boundary_probe)+' CG'+IntToStr(cur_group_probe)+
             ' CL'+IntToStr(cur_level_probe)+' I0'+IntToStr(ss_int_old_probe)+' B0'+IntToStr(ss_b0_old_probe)+' B1'+IntToStr(ss_b1_old_probe)+
             ' RH0'+IntToStr(ss_rh_old_probe)+' I1'+IntToStr(ss_int_old1_probe)+' B01'+IntToStr(ss_b0_old1_probe)+' B11'+IntToStr(ss_b1_old1_probe)+
             ' RH1'+IntToStr(ss_rh_old1_probe)+' OVC'+IntToStr(overflow_calls_probe)+' OVS'+IntToStr(overflow_s_probe)+' OVN'+IntToStr(overflow_n_probe);
End;

Procedure eq_destroy_trace_probe(b0_probe,rh_probe,lh_q_probe: integer);
Var
  q_probe: integer;
Begin
  out_buf := '';
  q_probe := rh_probe;
  If (q_probe>=0)And(q_probe<=70000)Then mem_lh[q_probe] := lh_q_probe;
  Case b0_probe Of
    111,112,113,114: out_buf := 'DT'+IntToStr(rh_probe);
    117: out_buf := 'DG'+IntToStr(rh_probe);
    118: If q_probe<>0 Then out_buf := 'FN('+IntToStr(q_probe)+','+IntToStr(mem_lh[q_probe]+mem_lh[q_probe]+1)+')';
    119: out_buf := 'FL'+IntToStr(rh_probe);
    71,89: If (rh_probe<0)Or(rh_probe>19)Then out_buf := 'DS'+IntToStr(rh_probe);
    else
  End;
End;

Procedure save_for_after_trace_probe(t_probe,cur_level_probe,save_ptr_probe,max_save_stack_probe,save_size_probe: integer);
Var
  old_save_ptr_probe: integer;
  s0_b0_probe: integer;
  s0_b1_probe: integer;
  s0_rh_probe: integer;
  overflow_calls_probe: integer;
  overflow_s_probe: integer;
  overflow_n_probe: integer;
Begin
  old_save_ptr_probe := save_ptr_probe;
  s0_b0_probe := -1;
  s0_b1_probe := -1;
  s0_rh_probe := -1;
  overflow_calls_probe := 0;
  overflow_s_probe := -1;
  overflow_n_probe := -1;
  If cur_level_probe>1 Then
    Begin
      If save_ptr_probe>max_save_stack_probe Then
        Begin
          max_save_stack_probe := save_ptr_probe;
          If max_save_stack_probe>save_size_probe-7 Then
            Begin
              overflow_calls_probe := overflow_calls_probe+1;
              overflow_s_probe := 545;
              overflow_n_probe := save_size_probe;
            End;
        End;
      s0_b0_probe := 2;
      s0_b1_probe := 0;
      s0_rh_probe := t_probe;
      save_ptr_probe := save_ptr_probe+1;
    End;
  out_buf := 'SP'+IntToStr(save_ptr_probe)+' MS'+IntToStr(max_save_stack_probe)+' S0'+IntToStr(s0_b0_probe)+','+IntToStr(s0_b1_probe)+','+
             IntToStr(s0_rh_probe)+' IDX'+IntToStr(old_save_ptr_probe)+' OVC'+IntToStr(overflow_calls_probe)+' OVS'+IntToStr(overflow_s_probe)+
             ' OVN'+IntToStr(overflow_n_probe);
End;

Procedure eq_save_trace_probe(p_probe,l_probe,save_ptr_probe,max_save_stack_probe,save_size_probe,eqtb_b0_probe,eqtb_b1_probe,eqtb_rh_probe: integer);
Var
  old_save_ptr_probe: integer;
  overflow_calls_probe: integer;
  overflow_s_probe: integer;
  overflow_n_probe: integer;
  s0_b0_probe: integer;
  s0_b1_probe: integer;
  s0_rh_probe: integer;
  s1_b0_probe: integer;
  s1_b1_probe: integer;
  s1_rh_probe: integer;
Begin
  old_save_ptr_probe := save_ptr_probe;
  overflow_calls_probe := 0;
  overflow_s_probe := -1;
  overflow_n_probe := -1;
  s0_b0_probe := -1;
  s0_b1_probe := -1;
  s0_rh_probe := -1;
  s1_b0_probe := -1;
  s1_b1_probe := -1;
  s1_rh_probe := -1;

  If save_ptr_probe>max_save_stack_probe Then
    Begin
      max_save_stack_probe := save_ptr_probe;
      If max_save_stack_probe>save_size_probe-7 Then
        Begin
          overflow_calls_probe := overflow_calls_probe+1;
          overflow_s_probe := 545;
          overflow_n_probe := save_size_probe;
        End;
    End;

  If l_probe=0 Then s0_b0_probe := 1
  Else
    Begin
      s0_b0_probe := eqtb_b0_probe;
      s0_b1_probe := eqtb_b1_probe;
      s0_rh_probe := eqtb_rh_probe;
      save_ptr_probe := save_ptr_probe+1;
      s1_b0_probe := 0;
    End;

  If save_ptr_probe=old_save_ptr_probe Then
    Begin
      s0_b1_probe := l_probe;
      s0_rh_probe := p_probe;
    End
  Else
    Begin
      s1_b1_probe := l_probe;
      s1_rh_probe := p_probe;
    End;
  save_ptr_probe := save_ptr_probe+1;

  out_buf := 'SP'+IntToStr(save_ptr_probe)+' MS'+IntToStr(max_save_stack_probe)+' S0'+IntToStr(s0_b0_probe)+','+IntToStr(s0_b1_probe)+','+IntToStr(s0_rh_probe)+
             ' S1'+IntToStr(s1_b0_probe)+','+IntToStr(s1_b1_probe)+','+IntToStr(s1_rh_probe)+' OVC'+IntToStr(overflow_calls_probe)+' OVS'+
             IntToStr(overflow_s_probe)+' OVN'+IntToStr(overflow_n_probe);
End;

Procedure eq_define_trace_probe(init_b0_probe,init_b1_probe,init_rh_probe,p_probe,t_probe,e_probe,eTeX_mode_probe,cur_level_probe: integer);
Var
  trace_probe: ansistring;
  old_b0_probe: integer;
  old_b1_probe: integer;
  old_rh_probe: integer;
Begin
  old_b0_probe := init_b0_probe;
  old_b1_probe := init_b1_probe;
  old_rh_probe := init_rh_probe;
  trace_probe := '';

  If (eTeX_mode_probe=1)And(old_b0_probe=t_probe)And(old_rh_probe=e_probe)Then
    Begin
      trace_probe := trace_probe+'ED'+IntToStr(old_b0_probe)+','+IntToStr(old_rh_probe)+';';
      out_buf := trace_probe+' B0'+IntToStr(old_b0_probe)+' B1'+IntToStr(old_b1_probe)+' RH'+IntToStr(old_rh_probe);
      Exit;
    End;

  If old_b1_probe=cur_level_probe Then trace_probe := trace_probe+'ED'+IntToStr(old_b0_probe)+','+IntToStr(old_rh_probe)+';'
  Else If cur_level_probe>1 Then trace_probe := trace_probe+'ES'+IntToStr(p_probe)+','+IntToStr(old_b1_probe)+';';

  old_b1_probe := cur_level_probe;
  old_b0_probe := t_probe;
  old_rh_probe := e_probe;
  out_buf := trace_probe+' B0'+IntToStr(old_b0_probe)+' B1'+IntToStr(old_b1_probe)+' RH'+IntToStr(old_rh_probe);
End;

Procedure eq_word_define_trace_probe(init_int_probe,init_xeq_probe,p_probe,w_probe,eTeX_mode_probe,cur_level_probe: integer);
Var
  trace_probe: ansistring;
Begin
  trace_probe := '';
  If (eTeX_mode_probe=1)And(init_int_probe=w_probe)Then
    Begin
      out_buf := trace_probe+' EQ'+IntToStr(init_int_probe)+' XL'+IntToStr(init_xeq_probe);
      Exit;
    End;
  If init_xeq_probe<>cur_level_probe Then
    Begin
      trace_probe := trace_probe+'ES'+IntToStr(p_probe)+','+IntToStr(init_xeq_probe)+';';
      init_xeq_probe := cur_level_probe;
    End;
  init_int_probe := w_probe;
  out_buf := trace_probe+' EQ'+IntToStr(init_int_probe)+' XL'+IntToStr(init_xeq_probe);
End;

Procedure geq_define_trace_probe(init_b0_probe,init_b1_probe,init_rh_probe,t_probe,e_probe: integer);
Var
  trace_probe: ansistring;
Begin
  trace_probe := 'ED'+IntToStr(init_b0_probe)+','+IntToStr(init_rh_probe)+';';
  out_buf := trace_probe+' B0'+IntToStr(t_probe)+' B1'+IntToStr(1)+' RH'+IntToStr(e_probe);
End;

Procedure geq_word_define_trace_probe(init_int_probe,init_xeq_probe,p_probe,w_probe: integer);
Begin
  out_buf := ' EQ'+IntToStr(w_probe)+' XL'+IntToStr(1);
End;

Procedure unsave_trace_probe(scenario_probe: integer);
Label
  30;
Var
  save_b0_probe: array[0..20] Of integer;
  save_b1_probe: array[0..20] Of integer;
  save_rh_probe: array[0..20] Of integer;
  grp_stack_probe: array[0..20] Of integer;
  cur_level_probe: integer;
  save_ptr_probe: integer;
  eTeX_mode_probe: integer;
  cur_tok_probe: integer;
  align_state_probe: integer;
  cur_boundary_probe: integer;
  cur_group_probe: integer;
  in_open_probe: integer;
  sa_chain_local_probe: integer;
  sa_level_local_probe: integer;
  cur_input_loc_probe: integer;
  cur_input_start_probe: integer;
  p_probe: integer;
  l_probe: integer;
  t_probe: integer;
  i_probe: integer;
  a_probe: boolean;
  confusion_probe: integer;
  calls_probe: ansistring;
Begin
  For i_probe:=0 To 20 Do
    Begin
      save_b0_probe[i_probe] := -1;
      save_b1_probe[i_probe] := -1;
      save_rh_probe[i_probe] := -1;
      grp_stack_probe[i_probe] := 0;
    End;

  mem_b0[100] := -1;
  mem_b1[100] := -1;
  eqtb_rh[100] := -1;
  mem_b0[120] := -1;
  mem_b1[120] := -1;
  eqtb_rh[120] := -1;
  mem_b0[5300] := -1;
  mem_b1[5300] := -1;
  eqtb_rh[5300] := -1;
  mem_b0[5400] := -1;
  mem_b1[5400] := -1;
  eqtb_rh[5400] := -1;
  xeq_level_probe[5300] := -1;
  xeq_level_probe[5400] := -1;
  mem_lh[900] := -1;
  mem_rh[900] := -1;

  cur_level_probe := 1;
  save_ptr_probe := 0;
  eTeX_mode_probe := 0;
  cur_tok_probe := 0;
  align_state_probe := 0;
  cur_boundary_probe := 0;
  cur_group_probe := 0;
  in_open_probe := 0;
  sa_chain_local_probe := 0;
  sa_level_local_probe := 0;
  cur_input_loc_probe := 0;
  cur_input_start_probe := 0;
  l_probe := 0;
  a_probe := false;
  confusion_probe := -1;
  calls_probe := '';

  Case scenario_probe Of
    1:
      Begin
        cur_level_probe := 1;
      End;
    2:
      Begin
        cur_level_probe := 3;
        save_ptr_probe := 3;
        cur_boundary_probe := 20;
        cur_group_probe := 15;
        in_open_probe := 1;
        grp_stack_probe[in_open_probe] := 20;

        save_b0_probe[0] := 3;
        save_b1_probe[0] := 7;
        save_rh_probe[0] := 44;
        save_b0_probe[1] := 55;
        save_b1_probe[1] := 5;
        save_rh_probe[1] := 777;
        save_b0_probe[2] := 0;
        save_b1_probe[2] := 5;
        save_rh_probe[2] := 100;

        mem_b0[100] := 66;
        mem_b1[100] := 2;
        eqtb_rh[100] := 888;
      End;
    3:
      Begin
        cur_level_probe := 3;
        save_ptr_probe := 2;
        cur_boundary_probe := 30;
        cur_group_probe := 11;
        in_open_probe := 1;
        grp_stack_probe[in_open_probe] := 0;

        save_b0_probe[0] := 3;
        save_b1_probe[0] := 8;
        save_rh_probe[0] := 70;
        save_b0_probe[1] := 1;
        save_b1_probe[1] := 0;
        save_rh_probe[1] := 120;

        mem_b0[2881] := 9;
        mem_b1[2881] := 4;
        eqtb_rh[2881] := 321;
        mem_b0[120] := 41;
        mem_b1[120] := 1;
        eqtb_rh[120] := 654;
      End;
    4:
      Begin
        cur_level_probe := 4;
        save_ptr_probe := 3;
        cur_boundary_probe := 10;
        cur_group_probe := 13;
        in_open_probe := 1;
        grp_stack_probe[in_open_probe] := 0;

        save_b0_probe[0] := 3;
        save_b1_probe[0] := 2;
        save_rh_probe[0] := 11;
        save_b0_probe[1] := 12;
        save_b1_probe[1] := 34;
        save_rh_probe[1] := 56;
        save_b0_probe[2] := 0;
        save_b1_probe[2] := 8;
        save_rh_probe[2] := 5300;

        mem_b0[5300] := 77;
        mem_b1[5300] := 99;
        eqtb_rh[5300] := 111;
        xeq_level_probe[5300] := 5;
      End;
    5:
      Begin
        cur_level_probe := 4;
        save_ptr_probe := 3;
        cur_boundary_probe := 12;
        cur_group_probe := 14;
        in_open_probe := 1;
        grp_stack_probe[in_open_probe] := 0;

        save_b0_probe[0] := 3;
        save_b1_probe[0] := 6;
        save_rh_probe[0] := 12;
        save_b0_probe[1] := 21;
        save_b1_probe[1] := 22;
        save_rh_probe[1] := 23;
        save_b0_probe[2] := 0;
        save_b1_probe[2] := 9;
        save_rh_probe[2] := 5400;

        mem_b0[5400] := 31;
        mem_b1[5400] := 32;
        eqtb_rh[5400] := 33;
        xeq_level_probe[5400] := 1;
      End;
    Else
      Begin
        cur_level_probe := 5;
        save_ptr_probe := 5;
        eTeX_mode_probe := 1;
        cur_tok_probe := 1000;
        align_state_probe := 10;
        cur_boundary_probe := 200;
        cur_group_probe := 99;
        in_open_probe := 1;
        grp_stack_probe[in_open_probe] := 0;
        sa_chain_local_probe := 77;
        sa_level_local_probe := 5;
        cur_input_loc_probe := 50;
        cur_input_start_probe := 40;

        save_b0_probe[0] := 0;
        save_b1_probe[0] := 1234;
        save_rh_probe[0] := 0;
        save_b0_probe[1] := 3;
        save_b1_probe[1] := 4;
        save_rh_probe[1] := 99;
        save_b0_probe[2] := 4;
        save_b1_probe[2] := 6;
        save_rh_probe[2] := 333;
        save_b0_probe[3] := 2;
        save_b1_probe[3] := 0;
        save_rh_probe[3] := 700;
        save_b0_probe[4] := 2;
        save_b1_probe[4] := 0;
        save_rh_probe[4] := 300;
      End;
  End;

  If cur_level_probe>1 Then
    Begin
      cur_level_probe := cur_level_probe-1;
      While true Do
        Begin
          save_ptr_probe := save_ptr_probe-1;
          If save_b0_probe[save_ptr_probe]=3 Then goto 30;
          p_probe := save_rh_probe[save_ptr_probe];

          If save_b0_probe[save_ptr_probe]=2 Then
            Begin
              t_probe := cur_tok_probe;
              cur_tok_probe := p_probe;
              If a_probe Then
                Begin
                  p_probe := 900;
                  calls_probe := calls_probe+'GA'+IntToStr(p_probe)+';';
                  mem_lh[p_probe] := cur_tok_probe;
                  mem_rh[p_probe] := cur_input_loc_probe;
                  cur_input_loc_probe := p_probe;
                  cur_input_start_probe := p_probe;
                  If cur_tok_probe<768 Then If cur_tok_probe<512 Then
                                              align_state_probe := align_state_probe-1
                  Else align_state_probe := align_state_probe+1;
                End
              Else
                Begin
                  calls_probe := calls_probe+'BI;';
                  a_probe := eTeX_mode_probe=1;
                End;
              cur_tok_probe := t_probe;
            End
          Else If save_b0_probe[save_ptr_probe]=4 Then
                 Begin
                   calls_probe := calls_probe+'SR;';
                   sa_chain_local_probe := p_probe;
                   sa_level_local_probe := save_b1_probe[save_ptr_probe];
                 End
          Else
            Begin
              If save_b0_probe[save_ptr_probe]=0 Then
                Begin
                  l_probe := save_b1_probe[save_ptr_probe];
                  save_ptr_probe := save_ptr_probe-1;
                End
              Else
                Begin
                  save_b0_probe[save_ptr_probe] := mem_b0[2881];
                  save_b1_probe[save_ptr_probe] := mem_b1[2881];
                  save_rh_probe[save_ptr_probe] := eqtb_rh[2881];
                End;

              If p_probe<5268 Then
                Begin
                  If mem_b1[p_probe]=1 Then
                    calls_probe := calls_probe+'ED'+IntToStr(save_b0_probe[save_ptr_probe])+','+IntToStr(save_rh_probe[save_ptr_probe])+';'
                  Else
                    Begin
                      calls_probe := calls_probe+'ED'+IntToStr(mem_b0[p_probe])+','+IntToStr(eqtb_rh[p_probe])+';';
                      mem_b0[p_probe] := save_b0_probe[save_ptr_probe];
                      mem_b1[p_probe] := save_b1_probe[save_ptr_probe];
                      eqtb_rh[p_probe] := save_rh_probe[save_ptr_probe];
                    End;
                End
              Else If xeq_level_probe[p_probe]<>1 Then
                     Begin
                       mem_b0[p_probe] := save_b0_probe[save_ptr_probe];
                       mem_b1[p_probe] := save_b1_probe[save_ptr_probe];
                       eqtb_rh[p_probe] := save_rh_probe[save_ptr_probe];
                       xeq_level_probe[p_probe] := l_probe;
                     End;
            End;
        End;

      30:
      If grp_stack_probe[in_open_probe]=cur_boundary_probe Then calls_probe := calls_probe+'GW;';
      cur_group_probe := save_b1_probe[save_ptr_probe];
      cur_boundary_probe := save_rh_probe[save_ptr_probe];
      If eTeX_mode_probe=1 Then save_ptr_probe := save_ptr_probe-1;
    End
  Else
    Begin
      calls_probe := calls_probe+'CF551;';
      confusion_probe := 551;
    End;

  out_buf := calls_probe+
             ' CL'+IntToStr(cur_level_probe)+
             ' SP'+IntToStr(save_ptr_probe)+
             ' CG'+IntToStr(cur_group_probe)+
             ' CB'+IntToStr(cur_boundary_probe)+
             ' CT'+IntToStr(cur_tok_probe)+
             ' AS'+IntToStr(align_state_probe)+
             ' SC'+IntToStr(sa_chain_local_probe)+
             ' SL'+IntToStr(sa_level_local_probe)+
             ' LOC'+IntToStr(cur_input_loc_probe)+
             ' ST'+IntToStr(cur_input_start_probe)+
             ' CF'+IntToStr(confusion_probe)+
             ' E100'+IntToStr(mem_b0[100])+','+IntToStr(mem_b1[100])+','+IntToStr(eqtb_rh[100])+
             ' E120'+IntToStr(mem_b0[120])+','+IntToStr(mem_b1[120])+','+IntToStr(eqtb_rh[120])+
             ' E5300'+IntToStr(mem_b0[5300])+','+IntToStr(mem_b1[5300])+','+IntToStr(eqtb_rh[5300])+
             ' E5400'+IntToStr(mem_b0[5400])+','+IntToStr(mem_b1[5400])+','+IntToStr(eqtb_rh[5400])+
             ' X5300'+IntToStr(xeq_level_probe[5300])+
             ' X5400'+IntToStr(xeq_level_probe[5400])+
             ' M900'+IntToStr(mem_lh[900])+','+IntToStr(mem_rh[900]);
End;

Function BoolFromInt(v: integer): boolean;
Begin
  BoolFromInt := v<>0;
End;

Procedure PrintResult(v: integer);
Var
  a: integer;
Begin
  If arith_error Then a := 1
  Else a := 0;
  WriteLn(v, ' ', a, ' ', remainder);
End;

Var
  fn: string;
  i, k: integer;
  p: integer;
  q: integer;
  idx: integer;
  arg_pos: integer;
  block_count: integer;
  inspect_count: integer;
  inspect_idx: integer;
  left_text, right_text: ansistring;
  sres, str_ptr_probe, pool_ptr_probe, max_strings_probe, init_str_ptr_probe: integer;
  pool_size_probe, old_pool_ptr_probe, file_name_size_probe, n_probe, a_probe, b_probe, c_probe: integer;
Begin
  If ParamCount<1 Then Halt(2);

  fn := UpperCase(ParamStr(1));
  arith_error := false;
  remainder := 0;
  out_buf := '';
  For i:=0 To 22 Do dig[i] := 0;
  For i:=0 To 4095 Do
    Begin
      str_pool[i] := 0;
      buffer[i] := 0;
    End;
  For i:=0 To 4095 Do str_start[i] := 0;
  For i:=0 To 70000 Do
    Begin
      mem_b0[i] := 0;
      mem_b1[i] := 0;
      mem_int[i] := 0;
      mem_gr[i] := 0.0;
      eqtb_rh[i] := 0;
      hash_rh[i] := 0;
      mem_lh[i] := 0;
      mem_rh[i] := 0;
    End;
  For i:=1 To 40 Do name_of_file_probe[i] := ' ';
  name_length_probe := 0;
  area_delimiter_probe := 0;
  ext_delimiter_probe := 0;
  cur_area_probe := 0;
  cur_name_probe := 0;
  cur_ext_probe := 0;
  next_node_probe := 0;
  temp_ptr_probe := 0;

  If fn='HALF' Then
    PrintResult(half(StrToInt(ParamStr(2))))
  Else If fn='ROUND_DECIMALS' Then
    Begin
      k := StrToInt(ParamStr(2));
      For i:=0 To k-1 Do
        dig[i] := StrToInt(ParamStr(3+i));
      PrintResult(round_decimals(k));
    End
  Else If fn='MULT_AND_ADD' Then
    PrintResult(mult_and_add(StrToInt(ParamStr(2)),StrToInt(ParamStr(3)),StrToInt(ParamStr(4)),StrToInt(ParamStr(5))))
  Else If fn='X_OVER_N' Then
    PrintResult(x_over_n(StrToInt(ParamStr(2)),StrToInt(ParamStr(3))))
  Else If fn='XN_OVER_D' Then
    PrintResult(xn_over_d(StrToInt(ParamStr(2)),StrToInt(ParamStr(3)),StrToInt(ParamStr(4))))
  Else If fn='BADNESS' Then
    PrintResult(badness(StrToInt(ParamStr(2)),StrToInt(ParamStr(3))))
  Else If fn='ADD_OR_SUB' Then
    PrintResult(add_or_sub(StrToInt(ParamStr(2)),StrToInt(ParamStr(3)),StrToInt(ParamStr(4)),BoolFromInt(StrToInt(ParamStr(5)))))
  Else If fn='QUOTIENT' Then
    PrintResult(quotient(StrToInt(ParamStr(2)),StrToInt(ParamStr(3))))
  Else If fn='FRACT' Then
    PrintResult(fract(StrToInt(ParamStr(2)),StrToInt(ParamStr(3)),StrToInt(ParamStr(4)),StrToInt(ParamStr(5))))
  Else If fn='STR_EQ_BUF' Then
    Begin
      left_text := ParamStr(2);
      right_text := ParamStr(3);
      k := StrToInt(ParamStr(4));
      str_start[0] := 0;
      LoadAsciiToIntArray(left_text,str_pool,0);
      str_start[1] := Length(left_text);
      LoadAsciiToIntArray(right_text,buffer,0);
      If str_eq_buf(0,k)Then PrintResult(1)
      Else PrintResult(0);
    End
  Else If fn='STR_EQ_STR' Then
    Begin
      left_text := ParamStr(2);
      right_text := ParamStr(3);
      str_start[0] := 0;
      LoadAsciiToIntArray(left_text,str_pool,0);
      str_start[1] := Length(left_text);
      LoadAsciiToIntArray(right_text,str_pool,Length(left_text));
      str_start[2] := Length(left_text)+Length(right_text);
      If str_eq_str(0,1)Then PrintResult(1)
      Else PrintResult(0);
    End
  Else If fn='NORM_MIN' Then
    PrintResult(norm_min(StrToInt(ParamStr(2))))
  Else If fn='BEGIN_NAME' Then
    Begin
      area_delimiter_probe := 17;
      ext_delimiter_probe := 23;
      begin_name_probe;
      WriteLn(area_delimiter_probe, ' ', ext_delimiter_probe);
    End
  Else If fn='MORE_NAME' Then
    Begin
      c_probe := StrToInt(ParamStr(2));
      pool_ptr_probe := StrToInt(ParamStr(3));
      str_start[StrToInt(ParamStr(5))] := StrToInt(ParamStr(4));
      str_ptr_probe := StrToInt(ParamStr(5));
      area_delimiter_probe := StrToInt(ParamStr(6));
      ext_delimiter_probe := StrToInt(ParamStr(7));
      pool_size_probe := StrToInt(ParamStr(8));
      old_pool_ptr_probe := pool_ptr_probe;
      If more_name_probe(c_probe,pool_ptr_probe,str_ptr_probe,pool_size_probe,StrToInt(ParamStr(9)))Then sres := 1
      Else sres := 0;
      If pool_ptr_probe>old_pool_ptr_probe Then n_probe := str_pool[old_pool_ptr_probe]
      Else n_probe := -1;
      WriteLn(sres, ' ', pool_ptr_probe, ' ', area_delimiter_probe, ' ', ext_delimiter_probe, ' ', n_probe, ' ', Ord(arith_error));
    End
  Else If fn='END_NAME' Then
    Begin
      str_ptr_probe := StrToInt(ParamStr(2));
      pool_ptr_probe := StrToInt(ParamStr(3));
      str_start[str_ptr_probe] := StrToInt(ParamStr(4));
      area_delimiter_probe := StrToInt(ParamStr(5));
      ext_delimiter_probe := StrToInt(ParamStr(6));
      max_strings_probe := StrToInt(ParamStr(7));
      init_str_ptr_probe := StrToInt(ParamStr(8));
      end_name_probe(str_ptr_probe,pool_ptr_probe,max_strings_probe,init_str_ptr_probe);
      WriteLn(cur_area_probe, ' ', cur_name_probe, ' ', cur_ext_probe, ' ', str_ptr_probe, ' ', str_start[0], ' ', str_start[1], ' ', str_start[2], ' ', str_start[3], ' ', str_start[4], ' ', str_start[5], ' ', str_start[6], ' ', str_start[7], ' ', str_start[8], ' ', Ord(arith_error));
    End
  Else If fn='SCAN_FILE_NAME_TRACE' Then
    Begin
      scan_file_name_trace_probe(
        StrToInt(ParamStr(2)),
        StrToInt(ParamStr(3)),
        StrToInt(ParamStr(4)),
        StrToInt(ParamStr(5)),
        StrToInt(ParamStr(6)),
        StrToInt(ParamStr(7)),
        StrToInt(ParamStr(8)),
        StrToInt(ParamStr(9)),
        StrToInt(ParamStr(10)),
        StrToInt(ParamStr(11)),
        StrToInt(ParamStr(12)),
        StrToInt(ParamStr(13)),
        StrToInt(ParamStr(14)),
        StrToInt(ParamStr(15)),
        StrToInt(ParamStr(16)),
        StrToInt(ParamStr(17)),
        StrToInt(ParamStr(18)),
        StrToInt(ParamStr(19)));
      WriteLn(out_buf);
    End
  Else If fn='PROMPT_FILE_NAME_TRACE' Then
    Begin
      prompt_file_name_trace_probe(StrToInt(ParamStr(2)));
      WriteLn(out_buf);
    End
  Else If fn='OPEN_LOG_FILE_TRACE' Then
    Begin
      open_log_file_trace_probe(StrToInt(ParamStr(2)));
      WriteLn(out_buf);
    End
  Else If fn='START_INPUT_TRACE' Then
    Begin
      start_input_trace_probe(StrToInt(ParamStr(2)));
      WriteLn(out_buf);
    End
  Else If fn='CHAR_WARNING_TRACE' Then
    Begin
      char_warning_trace_probe(StrToInt(ParamStr(2)));
      WriteLn(out_buf);
    End
  Else If fn='NEW_CHARACTER_TRACE' Then
    Begin
      new_character_trace_probe(StrToInt(ParamStr(2)));
      WriteLn(out_buf);
    End
  Else If fn='READ_FONT_INFO_TRACE' Then
    Begin
      read_font_info_trace_probe(StrToInt(ParamStr(2)));
      WriteLn(out_buf);
    End
  Else If fn='WRITE_DVI_TRACE' Then
    Begin
      write_dvi_trace_probe(StrToInt(ParamStr(2)));
      WriteLn(out_buf);
    End
  Else If fn='DVI_SWAP_TRACE' Then
    Begin
      dvi_swap_trace_probe(StrToInt(ParamStr(2)));
      WriteLn(out_buf);
    End
  Else If fn='DVI_FOUR_TRACE' Then
    Begin
      dvi_four_trace_probe(StrToInt(ParamStr(2)));
      WriteLn(out_buf);
    End
  Else If fn='DVI_POP_TRACE' Then
    Begin
      dvi_pop_trace_probe(StrToInt(ParamStr(2)));
      WriteLn(out_buf);
    End
  Else If fn='DVI_FONT_DEF_TRACE' Then
    Begin
      dvi_font_def_trace_probe(StrToInt(ParamStr(2)));
      WriteLn(out_buf);
    End
  Else If fn='MOVEMENT_TRACE' Then
    Begin
      movement_trace_probe(StrToInt(ParamStr(2)));
      WriteLn(out_buf);
    End
  Else If fn='PRUNE_MOVEMENTS_TRACE' Then
    Begin
      prune_movements_trace_probe(StrToInt(ParamStr(2)));
      WriteLn(out_buf);
    End
  Else If fn='SPECIAL_OUT_TRACE' Then
    Begin
      special_out_trace_probe(StrToInt(ParamStr(2)));
      WriteLn(out_buf);
    End
  Else If fn='WRITE_OUT_TRACE' Then
    Begin
      write_out_trace_probe(StrToInt(ParamStr(2)));
      WriteLn(out_buf);
    End
  Else If fn='OUT_WHAT_TRACE' Then
    Begin
      out_what_trace_probe(StrToInt(ParamStr(2)));
      WriteLn(out_buf);
    End
  Else If fn='NEW_EDGE_TRACE' Then
    Begin
      new_edge_trace_probe(StrToInt(ParamStr(2)));
      WriteLn(out_buf);
    End
  Else If fn='REVERSE_TRACE' Then
    Begin
      reverse_trace_probe(StrToInt(ParamStr(2)));
      WriteLn(out_buf);
    End
  Else If fn='HLIST_OUT_TRACE' Then
    Begin
      hlist_out_trace_probe(StrToInt(ParamStr(2)));
      WriteLn(out_buf);
    End
  Else If fn='VLIST_OUT_TRACE' Then
    Begin
      vlist_out_trace_probe(StrToInt(ParamStr(2)));
      WriteLn(out_buf);
    End
  Else If fn='SHIP_OUT_TRACE' Then
    Begin
      ship_out_trace_probe(StrToInt(ParamStr(2)));
      WriteLn(out_buf);
    End
  Else If fn='HPACK_TRACE' Then
    Begin
      hpack_trace_probe(StrToInt(ParamStr(2)));
      WriteLn(out_buf);
    End
  Else If fn='VPACKAGE_TRACE' Then
    Begin
      vpackage_trace_probe(StrToInt(ParamStr(2)));
      WriteLn(out_buf);
    End
  Else If fn='APPEND_TO_VLIST_TRACE' Then
    Begin
      append_to_vlist_trace_probe(StrToInt(ParamStr(2)));
      WriteLn(out_buf);
    End
  Else If fn='GET_AVAIL' Then
    Begin
      a_probe := StrToInt(ParamStr(2)); {avail}
      b_probe := StrToInt(ParamStr(3)); {mem_end}
      n_probe := StrToInt(ParamStr(4)); {mem_max}
      c_probe := StrToInt(ParamStr(5)); {hi_mem_min}
      k := StrToInt(ParamStr(6)); {lo_mem_max}
      mem_rh[a_probe] := StrToInt(ParamStr(7)); {next of avail}
      sres := get_avail_probe(a_probe,b_probe,n_probe,c_probe,k);
      WriteLn(sres, ' ', a_probe, ' ', b_probe, ' ', c_probe, ' ', mem_rh[sres], ' ', Ord(arith_error));
    End
  Else If fn='GET_NODE_SCENARIO' Then
    Begin
      sres := StrToInt(ParamStr(2)); {s}
      a_probe := StrToInt(ParamStr(3)); {rover}
      b_probe := StrToInt(ParamStr(4)); {lo_mem_max}
      c_probe := StrToInt(ParamStr(5)); {hi_mem_min}
      n_probe := StrToInt(ParamStr(6)); {mem_max}
      k := StrToInt(ParamStr(7)); {mem_min}
      block_count := StrToInt(ParamStr(8));
      arg_pos := 9;
      For idx:=1 To block_count Do
        Begin
          p := StrToInt(ParamStr(arg_pos));
          q := StrToInt(ParamStr(arg_pos+1));
          mem_lh[p] := q; {size}
          mem_rh[p] := 65535;
          mem_rh[p+1] := StrToInt(ParamStr(arg_pos+2)); {next}
          mem_lh[p+1] := StrToInt(ParamStr(arg_pos+3)); {prev}
          mem_rh[p+q] := StrToInt(ParamStr(arg_pos+4)); {boundary rh}
          arg_pos := arg_pos+5;
        End;
      inspect_count := StrToInt(ParamStr(arg_pos));
      arg_pos := arg_pos+1;
      p := get_node_probe(sres,a_probe,b_probe,c_probe,n_probe,k);
      Write(p, ' ', a_probe, ' ', b_probe, ' ', c_probe, ' ', Ord(arith_error));
      For idx:=1 To inspect_count Do
        Begin
          inspect_idx := StrToInt(ParamStr(arg_pos));
          arg_pos := arg_pos+1;
          Write(' ', inspect_idx, ' ', mem_lh[inspect_idx], ' ', mem_rh[inspect_idx]);
        End;
      WriteLn;
    End
  Else If fn='SORT_AVAIL_SCENARIO' Then
    Begin
      a_probe := StrToInt(ParamStr(2)); {rover}
      b_probe := StrToInt(ParamStr(3)); {lo_mem_max}
      c_probe := StrToInt(ParamStr(4)); {hi_mem_min}
      n_probe := StrToInt(ParamStr(5)); {mem_max}
      k := StrToInt(ParamStr(6)); {mem_min}
      block_count := StrToInt(ParamStr(7));
      arg_pos := 8;
      For idx:=1 To block_count Do
        Begin
          p := StrToInt(ParamStr(arg_pos));
          q := StrToInt(ParamStr(arg_pos+1));
          mem_lh[p] := q; {size}
          mem_rh[p] := 65535;
          mem_rh[p+1] := StrToInt(ParamStr(arg_pos+2)); {next}
          mem_lh[p+1] := StrToInt(ParamStr(arg_pos+3)); {prev}
          mem_rh[p+q] := StrToInt(ParamStr(arg_pos+4)); {boundary rh}
          arg_pos := arg_pos+5;
        End;
      inspect_count := StrToInt(ParamStr(arg_pos));
      arg_pos := arg_pos+1;
      sort_avail_probe(a_probe,b_probe,c_probe,n_probe,k);
      Write(a_probe, ' ', b_probe, ' ', c_probe, ' ', Ord(arith_error));
      For idx:=1 To inspect_count Do
        Begin
          inspect_idx := StrToInt(ParamStr(arg_pos));
          arg_pos := arg_pos+1;
          Write(' ', inspect_idx, ' ', mem_lh[inspect_idx], ' ', mem_rh[inspect_idx]);
        End;
      WriteLn;
    End
  Else If fn='FLUSH_LIST' Then
    Begin
      p := StrToInt(ParamStr(2));
      a_probe := StrToInt(ParamStr(3)); {avail}
      n_probe := StrToInt(ParamStr(4)); {count}
      For i:=0 To n_probe-1 Do
        Begin
          b_probe := StrToInt(ParamStr(5+i*2));
          c_probe := StrToInt(ParamStr(6+i*2));
          mem_rh[b_probe] := c_probe;
        End;
      flush_list_probe(p,a_probe);
      Write(a_probe);
      For i:=0 To n_probe-1 Do
        Begin
          b_probe := StrToInt(ParamStr(5+i*2));
          Write(' ', mem_rh[b_probe]);
      End;
      WriteLn;
    End
  Else If fn='DELETE_TOKEN_REF' Then
    Begin
      p := StrToInt(ParamStr(2));
      a_probe := StrToInt(ParamStr(3)); {lh initial}
      b_probe := StrToInt(ParamStr(4)); {avail}
      n_probe := StrToInt(ParamStr(5)); {count}
      For i:=0 To n_probe-1 Do
        Begin
          c_probe := StrToInt(ParamStr(6+i*2));
          k := StrToInt(ParamStr(7+i*2));
          mem_rh[c_probe] := k;
        End;
      delete_token_ref_probe(p,a_probe,b_probe);
      Write(mem_lh[p], ' ', b_probe);
      For i:=0 To n_probe-1 Do
        Begin
          c_probe := StrToInt(ParamStr(6+i*2));
          Write(' ', mem_rh[c_probe]);
      End;
      WriteLn;
    End
  Else If fn='DELETE_GLUE_REF' Then
    Begin
      p := StrToInt(ParamStr(2));
      a_probe := StrToInt(ParamStr(3)); {rh initial}
      b_probe := StrToInt(ParamStr(4)); {rover}
      c_probe := StrToInt(ParamStr(5)); {q initial}
      delete_glue_ref_probe(p,a_probe,b_probe,c_probe);
      WriteLn(mem_lh[p], ' ', mem_rh[p], ' ', mem_lh[p+1], ' ', mem_rh[p+1], ' ', mem_lh[b_probe+1], ' ', mem_rh[c_probe+1]);
    End
  Else If fn='FREE_NODE' Then
    Begin
      p := StrToInt(ParamStr(2));
      a_probe := StrToInt(ParamStr(3)); {s}
      b_probe := StrToInt(ParamStr(4)); {rover}
      c_probe := StrToInt(ParamStr(5)); {q initial at mem_lh[rover+1]}
      mem_lh[b_probe+1] := c_probe;
      free_node_probe(p,a_probe,b_probe);
      WriteLn(mem_lh[p], ' ', mem_rh[p], ' ', mem_lh[p+1], ' ', mem_rh[p+1], ' ', mem_lh[b_probe+1], ' ', mem_rh[c_probe+1]);
    End
  Else If fn='NEW_NULL_BOX' Then
    Begin
      next_node_probe := StrToInt(ParamStr(2));
      p := new_null_box_probe;
      WriteLn(p, ' ', next_node_probe, ' ', mem_b0[p], ' ', mem_b1[p], ' ', mem_int[p+1], ' ', mem_int[p+2], ' ', mem_int[p+3], ' ', mem_int[p+4], ' ', mem_rh[p+5], ' ', mem_b0[p+5], ' ', mem_b1[p+5]);
    End
  Else If fn='NEW_RULE' Then
    Begin
      next_node_probe := StrToInt(ParamStr(2));
      p := new_rule_probe;
      WriteLn(p, ' ', next_node_probe, ' ', mem_b0[p], ' ', mem_b1[p], ' ', mem_int[p+1], ' ', mem_int[p+2], ' ', mem_int[p+3]);
    End
  Else If fn='NEW_LIGATURE' Then
    Begin
      next_node_probe := StrToInt(ParamStr(2));
      a_probe := StrToInt(ParamStr(3)); {f}
      b_probe := StrToInt(ParamStr(4)); {c}
      c_probe := StrToInt(ParamStr(5)); {q}
      p := new_ligature_probe(a_probe,b_probe,c_probe);
      WriteLn(p, ' ', next_node_probe, ' ', mem_b0[p], ' ', mem_b1[p], ' ', mem_b0[p+1], ' ', mem_b1[p+1], ' ', mem_rh[p+1]);
    End
  Else If fn='NEW_LIG_ITEM' Then
    Begin
      next_node_probe := StrToInt(ParamStr(2));
      a_probe := StrToInt(ParamStr(3)); {c}
      p := new_lig_item_probe(a_probe);
      WriteLn(p, ' ', next_node_probe, ' ', mem_b1[p], ' ', mem_rh[p+1]);
    End
  Else If fn='NEW_DISC' Then
    Begin
      next_node_probe := StrToInt(ParamStr(2));
      p := new_disc_probe;
      WriteLn(p, ' ', next_node_probe, ' ', mem_b0[p], ' ', mem_b1[p], ' ', mem_lh[p+1], ' ', mem_rh[p+1]);
    End
  Else If fn='NEW_MATH' Then
    Begin
      next_node_probe := StrToInt(ParamStr(2));
      a_probe := StrToInt(ParamStr(3)); {w}
      b_probe := StrToInt(ParamStr(4)); {s}
      p := new_math_probe(a_probe,b_probe);
      WriteLn(p, ' ', next_node_probe, ' ', mem_b0[p], ' ', mem_b1[p], ' ', mem_int[p+1]);
    End
  Else If fn='NEW_STYLE' Then
    Begin
      next_node_probe := StrToInt(ParamStr(2));
      a_probe := StrToInt(ParamStr(3)); {s}
      p := new_style_probe(a_probe);
      WriteLn(p, ' ', next_node_probe, ' ', mem_b0[p], ' ', mem_b1[p], ' ', mem_int[p+1], ' ', mem_int[p+2]);
    End
  Else If fn='NEW_CHOICE' Then
    Begin
      next_node_probe := StrToInt(ParamStr(2));
      p := new_choice_probe;
      WriteLn(p, ' ', next_node_probe, ' ', mem_b0[p], ' ', mem_b1[p], ' ', mem_lh[p+1], ' ', mem_rh[p+1], ' ', mem_lh[p+2], ' ', mem_rh[p+2]);
    End
  Else If fn='NEW_NOAD' Then
    Begin
      next_node_probe := StrToInt(ParamStr(2));
      p := new_noad_probe;
      WriteLn(p, ' ', next_node_probe, ' ', mem_b0[p], ' ', mem_b1[p], ' ', mem_lh[p+1], ' ', mem_rh[p+1], ' ', mem_lh[p+2], ' ', mem_rh[p+2], ' ', mem_lh[p+3], ' ', mem_rh[p+3]);
    End
  Else If fn='NEW_SPEC' Then
    Begin
      next_node_probe := StrToInt(ParamStr(2));
      p := StrToInt(ParamStr(3)); {source}
      mem_b0[p] := StrToInt(ParamStr(4));
      mem_b1[p] := StrToInt(ParamStr(5));
      mem_lh[p] := StrToInt(ParamStr(6));
      mem_rh[p] := StrToInt(ParamStr(7));
      mem_int[p+1] := StrToInt(ParamStr(8));
      mem_int[p+2] := StrToInt(ParamStr(9));
      mem_int[p+3] := StrToInt(ParamStr(10));
      q := new_spec_probe(p);
      WriteLn(q, ' ', next_node_probe, ' ', mem_b0[q], ' ', mem_b1[q], ' ', mem_lh[q], ' ', mem_rh[q], ' ', mem_int[q+1], ' ', mem_int[q+2], ' ', mem_int[q+3]);
    End
  Else If fn='NEW_PARAM_GLUE' Then
    Begin
      next_node_probe := StrToInt(ParamStr(2));
      a_probe := StrToInt(ParamStr(3)); {n}
      b_probe := StrToInt(ParamStr(4)); {eqtb rh value}
      c_probe := StrToInt(ParamStr(5)); {initial refcount}
      eqtb_rh[2882+a_probe] := b_probe;
      mem_rh[b_probe] := c_probe;
      p := new_param_glue_probe(a_probe);
      WriteLn(p, ' ', next_node_probe, ' ', mem_b0[p], ' ', mem_b1[p], ' ', mem_lh[p+1], ' ', mem_rh[p+1], ' ', mem_rh[b_probe]);
    End
  Else If fn='NEW_GLUE' Then
    Begin
      next_node_probe := StrToInt(ParamStr(2));
      a_probe := StrToInt(ParamStr(3)); {q}
      b_probe := StrToInt(ParamStr(4)); {initial refcount}
      mem_rh[a_probe] := b_probe;
      p := new_glue_probe(a_probe);
      WriteLn(p, ' ', next_node_probe, ' ', mem_b0[p], ' ', mem_b1[p], ' ', mem_lh[p+1], ' ', mem_rh[p+1], ' ', mem_rh[a_probe]);
    End
  Else If fn='NEW_SKIP_PARAM' Then
    Begin
      next_node_probe := StrToInt(ParamStr(2));
      a_probe := StrToInt(ParamStr(3)); {n}
      b_probe := StrToInt(ParamStr(4)); {eqtb rh source ptr}
      eqtb_rh[2882+a_probe] := b_probe;
      mem_b0[b_probe] := StrToInt(ParamStr(5));
      mem_b1[b_probe] := StrToInt(ParamStr(6));
      mem_lh[b_probe] := StrToInt(ParamStr(7));
      mem_rh[b_probe] := StrToInt(ParamStr(8));
      mem_int[b_probe+1] := StrToInt(ParamStr(9));
      mem_int[b_probe+2] := StrToInt(ParamStr(10));
      mem_int[b_probe+3] := StrToInt(ParamStr(11));
      p := new_skip_param_probe(a_probe);
      WriteLn(p, ' ', next_node_probe, ' ', temp_ptr_probe, ' ', mem_b1[p], ' ', mem_lh[p+1], ' ', mem_rh[p+1], ' ', mem_rh[temp_ptr_probe]);
    End
  Else If fn='NEW_KERN' Then
    Begin
      next_node_probe := StrToInt(ParamStr(2));
      a_probe := StrToInt(ParamStr(3)); {w}
      p := new_kern_probe(a_probe);
      WriteLn(p, ' ', next_node_probe, ' ', mem_b0[p], ' ', mem_b1[p], ' ', mem_int[p+1]);
    End
  Else If fn='NEW_PENALTY' Then
    Begin
      next_node_probe := StrToInt(ParamStr(2));
      a_probe := StrToInt(ParamStr(3)); {m}
      p := new_penalty_probe(a_probe);
      WriteLn(p, ' ', next_node_probe, ' ', mem_b0[p], ' ', mem_b1[p], ' ', mem_int[p+1]);
    End
  Else If fn='FRACTION_RULE' Then
    Begin
      next_node_probe := StrToInt(ParamStr(2));
      a_probe := StrToInt(ParamStr(3)); {t}
      p := fraction_rule_probe(a_probe);
      WriteLn(p, ' ', next_node_probe, ' ', mem_b0[p], ' ', mem_b1[p], ' ', mem_int[p+1], ' ', mem_int[p+2], ' ', mem_int[p+3]);
    End
  Else If fn='PACK_FILE_NAME' Then
    Begin
      left_text := ParamStr(2);
      right_text := ParamStr(3);
      out_buf := ParamStr(4);
      file_name_size_probe := StrToInt(ParamStr(5));
      LoadAsciiToIntArray(left_text,str_pool,0);
      str_start[0] := 0;
      str_start[1] := Length(left_text);
      LoadAsciiToIntArray(right_text,str_pool,Length(left_text));
      str_start[2] := Length(left_text)+Length(right_text);
      LoadAsciiToIntArray(out_buf,str_pool,Length(left_text)+Length(right_text));
      str_start[3] := Length(left_text)+Length(right_text)+Length(out_buf);
      pack_file_name_probe(1,0,2,file_name_size_probe);
      WriteLn(name_length_probe, ' ', NameOfFileAsString(file_name_size_probe));
    End
  Else If fn='PACK_BUFFERED_NAME' Then
    Begin
      left_text := ParamStr(2); {tex format default, 20 chars}
      n_probe := StrToInt(ParamStr(3));
      a_probe := StrToInt(ParamStr(4));
      b_probe := StrToInt(ParamStr(5));
      file_name_size_probe := StrToInt(ParamStr(6));
      right_text := ParamStr(7); {buffer payload for a..b}
      For i:=0 To Length(right_text)-1 Do
        buffer[a_probe+i] := Ord(right_text[i+1]);
      pack_buffered_name_probe(n_probe,a_probe,b_probe,file_name_size_probe,left_text);
      WriteLn(name_length_probe, ' ', NameOfFileAsString(file_name_size_probe));
    End
  Else If fn='PACK_JOB_NAME' Then
    Begin
      left_text := ParamStr(2); {area text}
      right_text := ParamStr(3); {job text}
      out_buf := ParamStr(4); {ext text}
      sres := StrToInt(ParamStr(5)); {s index}
      str_ptr_probe := StrToInt(ParamStr(6)); {job_name index}
      file_name_size_probe := StrToInt(ParamStr(7));

      k := 0;
      str_start[339] := k;
      LoadAsciiToIntArray(left_text,str_pool,k);
      k := k + Length(left_text);
      str_start[340] := k;

      str_start[str_ptr_probe] := k;
      LoadAsciiToIntArray(right_text,str_pool,k);
      k := k + Length(right_text);
      str_start[str_ptr_probe+1] := k;

      str_start[sres] := k;
      LoadAsciiToIntArray(out_buf,str_pool,k);
      k := k + Length(out_buf);
      str_start[sres+1] := k;

      pack_job_name_probe(sres,str_ptr_probe,file_name_size_probe);
      WriteLn(name_length_probe, ' ', NameOfFileAsString(file_name_size_probe), ' ', cur_area_probe, ' ', cur_name_probe, ' ', cur_ext_probe);
    End
  Else If fn='MAKE_NAME_STRING' Then
    Begin
      left_text := ParamStr(2);
      str_ptr_probe := StrToInt(ParamStr(3));
      pool_ptr_probe := StrToInt(ParamStr(4));
      str_start[str_ptr_probe] := StrToInt(ParamStr(5));
      max_strings_probe := StrToInt(ParamStr(6));
      init_str_ptr_probe := StrToInt(ParamStr(7));
      pool_size_probe := StrToInt(ParamStr(8));
      name_length_probe := Length(left_text);
      For i:=1 To 40 Do name_of_file_probe[i] := ' ';
      For i:=1 To name_length_probe Do name_of_file_probe[i] := left_text[i];
      old_pool_ptr_probe := pool_ptr_probe;
      sres := make_name_string_probe(str_ptr_probe,pool_ptr_probe,max_strings_probe,init_str_ptr_probe,pool_size_probe);
      out_buf := '';
      For i:=old_pool_ptr_probe To pool_ptr_probe-1 Do out_buf := out_buf + Chr(str_pool[i]);
      WriteLn(sres, ' ', str_ptr_probe, ' ', pool_ptr_probe, ' ', str_start[str_ptr_probe], ' ', Ord(arith_error), ' ', out_buf);
    End
  Else If fn='A_MAKE_NAME_STRING' Then
    Begin
      left_text := ParamStr(2);
      str_ptr_probe := StrToInt(ParamStr(3));
      pool_ptr_probe := StrToInt(ParamStr(4));
      str_start[str_ptr_probe] := StrToInt(ParamStr(5));
      max_strings_probe := StrToInt(ParamStr(6));
      init_str_ptr_probe := StrToInt(ParamStr(7));
      pool_size_probe := StrToInt(ParamStr(8));
      name_length_probe := Length(left_text);
      For i:=1 To 40 Do name_of_file_probe[i] := ' ';
      For i:=1 To name_length_probe Do name_of_file_probe[i] := left_text[i];
      old_pool_ptr_probe := pool_ptr_probe;
      sres := a_make_name_string_probe(str_ptr_probe,pool_ptr_probe,max_strings_probe,init_str_ptr_probe,pool_size_probe);
      out_buf := '';
      For i:=old_pool_ptr_probe To pool_ptr_probe-1 Do out_buf := out_buf + Chr(str_pool[i]);
      WriteLn(sres, ' ', str_ptr_probe, ' ', pool_ptr_probe, ' ', str_start[str_ptr_probe], ' ', Ord(arith_error), ' ', out_buf);
    End
  Else If fn='B_MAKE_NAME_STRING' Then
    Begin
      left_text := ParamStr(2);
      str_ptr_probe := StrToInt(ParamStr(3));
      pool_ptr_probe := StrToInt(ParamStr(4));
      str_start[str_ptr_probe] := StrToInt(ParamStr(5));
      max_strings_probe := StrToInt(ParamStr(6));
      init_str_ptr_probe := StrToInt(ParamStr(7));
      pool_size_probe := StrToInt(ParamStr(8));
      name_length_probe := Length(left_text);
      For i:=1 To 40 Do name_of_file_probe[i] := ' ';
      For i:=1 To name_length_probe Do name_of_file_probe[i] := left_text[i];
      old_pool_ptr_probe := pool_ptr_probe;
      sres := b_make_name_string_probe(str_ptr_probe,pool_ptr_probe,max_strings_probe,init_str_ptr_probe,pool_size_probe);
      out_buf := '';
      For i:=old_pool_ptr_probe To pool_ptr_probe-1 Do out_buf := out_buf + Chr(str_pool[i]);
      WriteLn(sres, ' ', str_ptr_probe, ' ', pool_ptr_probe, ' ', str_start[str_ptr_probe], ' ', Ord(arith_error), ' ', out_buf);
    End
  Else If fn='W_MAKE_NAME_STRING' Then
    Begin
      left_text := ParamStr(2);
      str_ptr_probe := StrToInt(ParamStr(3));
      pool_ptr_probe := StrToInt(ParamStr(4));
      str_start[str_ptr_probe] := StrToInt(ParamStr(5));
      max_strings_probe := StrToInt(ParamStr(6));
      init_str_ptr_probe := StrToInt(ParamStr(7));
      pool_size_probe := StrToInt(ParamStr(8));
      name_length_probe := Length(left_text);
      For i:=1 To 40 Do name_of_file_probe[i] := ' ';
      For i:=1 To name_length_probe Do name_of_file_probe[i] := left_text[i];
      old_pool_ptr_probe := pool_ptr_probe;
      sres := w_make_name_string_probe(str_ptr_probe,pool_ptr_probe,max_strings_probe,init_str_ptr_probe,pool_size_probe);
      out_buf := '';
      For i:=old_pool_ptr_probe To pool_ptr_probe-1 Do out_buf := out_buf + Chr(str_pool[i]);
      WriteLn(sres, ' ', str_ptr_probe, ' ', pool_ptr_probe, ' ', str_start[str_ptr_probe], ' ', Ord(arith_error), ' ', out_buf);
    End
  Else If fn='MAKE_STRING' Then
    Begin
      str_ptr_probe := StrToInt(ParamStr(2));
      pool_ptr_probe := StrToInt(ParamStr(3));
      max_strings_probe := StrToInt(ParamStr(4));
      init_str_ptr_probe := StrToInt(ParamStr(5));
      sres := make_string_probe(str_ptr_probe,pool_ptr_probe,max_strings_probe,init_str_ptr_probe);
      WriteLn(sres, ' ', str_ptr_probe, ' ', str_start[str_ptr_probe], ' ', Ord(arith_error));
    End
  Else If fn='GET_STRINGS_STARTED_TRACE' Then
    Begin
      get_strings_started_trace_probe(StrToInt(ParamStr(2)));
      WriteLn(out_buf);
    End
  Else If fn='PRINT_CURRENT_STRING' Then
    Begin
      left_text := ParamStr(2);
      right_text := ParamStr(3);
      LoadAsciiToIntArray(left_text,str_pool,0);
      LoadAsciiToIntArray(right_text,str_pool,Length(left_text));
      str_start[0] := 0;
      str_start[1] := Length(left_text);
      print_current_string_probe(1,Length(left_text)+Length(right_text));
      WriteLn(out_buf);
    End
  Else If fn='PRINT_FILE_NAME' Then
    Begin
      left_text := ParamStr(2); {area}
      right_text := ParamStr(3); {name}
      out_buf := ParamStr(4); {ext}
      k := 0;
      str_start[1] := k;
      LoadAsciiToIntArray(left_text,str_pool,k);
      k := k+Length(left_text);
      str_start[2] := k;
      LoadAsciiToIntArray(right_text,str_pool,k);
      k := k+Length(right_text);
      str_start[3] := k;
      LoadAsciiToIntArray(out_buf,str_pool,k);
      k := k+Length(out_buf);
      str_start[4] := k;
      out_buf := '';
      print_file_name_probe(2,1,3);
      WriteLn(out_buf);
    End
  Else If fn='PRINT_SIZE' Then
    Begin
      print_size_probe(StrToInt(ParamStr(2)));
      WriteLn(out_buf);
    End
  Else If fn='PRINT_CS_TRACE' Then
    Begin
      p := StrToInt(ParamStr(2));
      sres := StrToInt(ParamStr(3)); {str_ptr}
      hash_rh[p] := StrToInt(ParamStr(4));
      If (p>=257)And(p<513)Then
        eqtb_rh[3988+p-257] := StrToInt(ParamStr(5));
      print_cs_trace_probe(p,sres);
      WriteLn(out_buf);
    End
  Else If fn='SPRINT_CS_TRACE' Then
    Begin
      p := StrToInt(ParamStr(2));
      sres := StrToInt(ParamStr(3)); {str_ptr}
      hash_rh[p] := StrToInt(ParamStr(4));
      sprint_cs_trace_probe(p,sres);
      WriteLn(out_buf);
    End
  Else If fn='PRINT_MARK_TRACE' Then
    Begin
      p := StrToInt(ParamStr(2));
      a_probe := StrToInt(ParamStr(3)); {hi_mem_min}
      b_probe := StrToInt(ParamStr(4)); {mem_end}
      c_probe := StrToInt(ParamStr(5)); {max_print_line}
      mem_rh[p] := StrToInt(ParamStr(6));
      print_mark_trace_probe(p,a_probe,b_probe,c_probe);
      WriteLn(out_buf);
    End
  Else If fn='TOKEN_SHOW_TRACE' Then
    Begin
      token_show_trace_probe(
        StrToInt(ParamStr(2)),
        StrToInt(ParamStr(3)));
      WriteLn(out_buf);
    End
  Else If fn='PRINT_RULE_DIMEN_TRACE' Then
    Begin
      print_rule_dimen_trace_probe(StrToInt(ParamStr(2)));
      WriteLn(out_buf);
    End
  Else If fn='PRINT_GLUE_TRACE' Then
    Begin
      print_glue_trace_probe(StrToInt(ParamStr(2)),StrToInt(ParamStr(3)),StrToInt(ParamStr(4)));
      WriteLn(out_buf);
    End
  Else If fn='PRINT_SPEC_TRACE' Then
    Begin
      p := StrToInt(ParamStr(2));
      sres := StrToInt(ParamStr(3));
      a_probe := StrToInt(ParamStr(4)); {mem_min}
      b_probe := StrToInt(ParamStr(5)); {lo_mem_max}
      mem_int[p+1] := StrToInt(ParamStr(6));
      mem_int[p+2] := StrToInt(ParamStr(7));
      mem_int[p+3] := StrToInt(ParamStr(8));
      mem_b0[p] := StrToInt(ParamStr(9));
      mem_b1[p] := StrToInt(ParamStr(10));
      print_spec_trace_probe(p,sres,a_probe,b_probe);
      WriteLn(out_buf);
    End
  Else If fn='PRINT_FAM_AND_CHAR_TRACE' Then
    Begin
      p := StrToInt(ParamStr(2));
      mem_b0[p] := StrToInt(ParamStr(3));
      mem_b1[p] := StrToInt(ParamStr(4));
      print_fam_and_char_trace_probe(p);
      WriteLn(out_buf);
    End
  Else If fn='PRINT_DELIMITER_TRACE' Then
    Begin
      p := StrToInt(ParamStr(2));
      mem_b0[p] := StrToInt(ParamStr(3));
      mem_b1[p] := StrToInt(ParamStr(4));
      mem_b2[p] := StrToInt(ParamStr(5));
      mem_b3[p] := StrToInt(ParamStr(6));
      print_delimiter_trace_probe(p);
      WriteLn(out_buf);
    End
  Else If fn='PRINT_STYLE_TRACE' Then
    Begin
      print_style_trace_probe(StrToInt(ParamStr(2)));
      WriteLn(out_buf);
    End
  Else If fn='PRINT_SKIP_PARAM_TRACE' Then
    Begin
      print_skip_param_trace_probe(StrToInt(ParamStr(2)));
      WriteLn(out_buf);
    End
  Else If fn='PRINT_FONT_AND_CHAR_TRACE' Then
    Begin
      p := StrToInt(ParamStr(2));
      mem_b0[p] := StrToInt(ParamStr(3));
      mem_b1[p] := StrToInt(ParamStr(4));
      a_probe := StrToInt(ParamStr(5)); {mem_end}
      b_probe := StrToInt(ParamStr(6)); {font_max}
      c_probe := StrToInt(ParamStr(7)); {hash value}
      If (2624+mem_b0[p]>=0)And(2624+mem_b0[p]<=70000)Then
        hash_rh[2624+mem_b0[p]] := c_probe;
      print_font_and_char_trace_probe(p,a_probe,b_probe);
      WriteLn(out_buf);
    End
  Else If fn='PRINT_SUBSIDIARY_DATA_TRACE' Then
    Begin
      p := StrToInt(ParamStr(2));
      a_probe := StrToInt(ParamStr(3)); {c}
      pool_ptr_probe := StrToInt(ParamStr(4));
      str_ptr_probe := StrToInt(ParamStr(5));
      n_probe := StrToInt(ParamStr(6)); {depth_threshold}
      str_start[str_ptr_probe] := StrToInt(ParamStr(7));
      b_probe := StrToInt(ParamStr(8)); {temp_ptr initial}
      mem_rh[p] := StrToInt(ParamStr(9));
      mem_lh[p] := StrToInt(ParamStr(10));
      mem_b0[p] := StrToInt(ParamStr(11));
      mem_b1[p] := StrToInt(ParamStr(12));
      print_subsidiary_data_trace_probe(p,a_probe,pool_ptr_probe,str_ptr_probe,n_probe,b_probe);
      WriteLn(out_buf);
    End
  Else If fn='SHORT_DISPLAY_TRACE' Then
    Begin
      a_probe := StrToInt(ParamStr(2)); {scenario id}
      setup_short_display_scenario(a_probe,p,n_probe,b_probe,c_probe,k,sres);
      short_display_trace_probe(p,n_probe,b_probe,c_probe,k,sres);
      append_tok('F'+IntToStr(sres));
      WriteLn(out_buf);
    End
  Else If fn='JUMP_OUT_TRACE' Then
    Begin
      jump_out_trace_probe;
      WriteLn(out_buf);
    End
  Else If fn='ERROR_TRACE' Then
    Begin
      error_trace_probe(StrToInt(ParamStr(2)));
      WriteLn(out_buf);
    End
  Else If fn='FATAL_ERROR_TRACE' Then
    Begin
      sres := StrToInt(ParamStr(2)); {s}
      a_probe := StrToInt(ParamStr(3)); {interaction}
      b_probe := StrToInt(ParamStr(4)); {log_opened}
      fatal_error_trace_probe(sres,a_probe,b_probe);
      WriteLn(out_buf);
    End
  Else If fn='OVERFLOW_TRACE' Then
    Begin
      sres := StrToInt(ParamStr(2)); {s}
      n_probe := StrToInt(ParamStr(3)); {n}
      a_probe := StrToInt(ParamStr(4)); {interaction}
      b_probe := StrToInt(ParamStr(5)); {log_opened}
      overflow_trace_probe(sres,n_probe,a_probe,b_probe);
      WriteLn(out_buf);
    End
  Else If fn='CONFUSION_TRACE' Then
    Begin
      sres := StrToInt(ParamStr(2)); {s}
      n_probe := StrToInt(ParamStr(3)); {history}
      a_probe := StrToInt(ParamStr(4)); {interaction}
      b_probe := StrToInt(ParamStr(5)); {log_opened}
      confusion_trace_probe(sres,n_probe,a_probe,b_probe);
      WriteLn(out_buf);
    End
  Else If fn='INPUT_LN_TRACE' Then
    Begin
      a_probe := StrToInt(ParamStr(2)); {bypass}
      b_probe := StrToInt(ParamStr(3)); {first}
      c_probe := StrToInt(ParamStr(4)); {max_buf_stack}
      n_probe := StrToInt(ParamStr(5)); {buf_size}
      k := StrToInt(ParamStr(6)); {format_ident}
      sres := StrToInt(ParamStr(7)); {byte_count}
      For i:=0 To sres-1 Do trace_bytes[i] := StrToInt(ParamStr(8+i));
      input_ln_trace_probe(a_probe,b_probe,c_probe,n_probe,k,sres);
      WriteLn(out_buf);
    End
  Else If fn='INIT_TERMINAL_TRACE' Then
    Begin
      init_terminal_trace_probe(StrToInt(ParamStr(2)));
      WriteLn(out_buf);
    End
  Else If fn='NORMALIZE_SELECTOR_TRACE' Then
    Begin
      normalize_selector_trace_probe(StrToInt(ParamStr(2)),StrToInt(ParamStr(3)),StrToInt(ParamStr(4)));
      WriteLn(out_buf);
    End
  Else If fn='INT_ERROR_TRACE' Then
    Begin
      int_error_trace_probe(StrToInt(ParamStr(2)));
      WriteLn(out_buf);
    End
  Else If fn='PREPARE_MAG_TRACE' Then
    Begin
      prepare_mag_trace_probe(
        StrToInt(ParamStr(2)),
        StrToInt(ParamStr(3)),
        StrToInt(ParamStr(4)),
        StrToInt(ParamStr(5)),
        StrToInt(ParamStr(6)),
        StrToInt(ParamStr(7)));
      WriteLn(out_buf);
    End
  Else If fn='FIX_DATE_AND_TIME_TRACE' Then
    Begin
      fix_date_and_time_trace_probe;
      WriteLn(out_buf);
    End
  Else If fn='BEGIN_DIAGNOSTIC_TRACE' Then
    Begin
      begin_diagnostic_trace_probe(StrToInt(ParamStr(2)),StrToInt(ParamStr(3)),StrToInt(ParamStr(4)));
      WriteLn(out_buf);
    End
  Else If fn='END_DIAGNOSTIC_TRACE' Then
    Begin
      end_diagnostic_trace_probe(StrToInt(ParamStr(2)),StrToInt(ParamStr(3)),StrToInt(ParamStr(4)));
      WriteLn(out_buf);
    End
  Else If fn='PRINT_LENGTH_PARAM_TRACE' Then
    Begin
      print_length_param_trace_probe(StrToInt(ParamStr(2)));
      WriteLn(out_buf);
    End
  Else If fn='PRINT_PARAM_TRACE' Then
    Begin
      print_param_trace_probe(StrToInt(ParamStr(2)));
      WriteLn(out_buf);
    End
  Else If fn='PRINT_GROUP_TRACE' Then
    Begin
      print_group_trace_probe(
        StrToInt(ParamStr(2)),
        StrToInt(ParamStr(3)),
        StrToInt(ParamStr(4)),
        StrToInt(ParamStr(5)),
        StrToInt(ParamStr(6)));
      WriteLn(out_buf);
    End
  Else If fn='PRINT_MODE_TRACE' Then
    Begin
      print_mode_trace_probe(StrToInt(ParamStr(2)));
      WriteLn(out_buf);
    End
  Else If fn='PRINT_CMD_CHR_TRACE' Then
    Begin
      print_cmd_chr_trace_probe(StrToInt(ParamStr(2)));
      WriteLn(out_buf);
    End
  Else If fn='ID_LOOKUP_TRACE' Then
    Begin
      id_lookup_trace_probe(StrToInt(ParamStr(2)));
      WriteLn(out_buf);
    End
  Else If fn='PRIMITIVE_TRACE' Then
    Begin
      primitive_trace_probe(StrToInt(ParamStr(2)));
      WriteLn(out_buf);
    End
  Else If fn='SHOW_CUR_CMD_CHR_TRACE' Then
    Begin
      show_cur_cmd_chr_trace_probe(StrToInt(ParamStr(2)));
      WriteLn(out_buf);
    End
  Else If fn='SHOW_CONTEXT_TRACE' Then
    Begin
      show_context_trace_probe(StrToInt(ParamStr(2)));
      WriteLn(out_buf);
    End
  Else If fn='BEGIN_TOKEN_LIST_TRACE' Then
    Begin
      begin_token_list_trace_probe(StrToInt(ParamStr(2)));
      WriteLn(out_buf);
    End
  Else If fn='END_TOKEN_LIST_TRACE' Then
    Begin
      end_token_list_trace_probe(StrToInt(ParamStr(2)));
      WriteLn(out_buf);
    End
  Else If fn='BACK_INPUT_TRACE' Then
    Begin
      back_input_trace_probe(StrToInt(ParamStr(2)));
      WriteLn(out_buf);
    End
  Else If fn='BACK_ERROR_TRACE' Then
    Begin
      back_error_trace_probe;
      WriteLn(out_buf);
    End
  Else If fn='INS_ERROR_TRACE' Then
    Begin
      ins_error_trace_probe;
      WriteLn(out_buf);
    End
  Else If fn='BEGIN_FILE_READING_TRACE' Then
    Begin
      begin_file_reading_trace_probe(StrToInt(ParamStr(2)));
      WriteLn(out_buf);
    End
  Else If fn='END_FILE_READING_TRACE' Then
    Begin
      end_file_reading_trace_probe(StrToInt(ParamStr(2)));
      WriteLn(out_buf);
    End
  Else If fn='CLEAR_FOR_ERROR_PROMPT_TRACE' Then
    Begin
      clear_for_error_prompt_trace_probe(StrToInt(ParamStr(2)));
      WriteLn(out_buf);
    End
  Else If fn='CHECK_OUTER_VALIDITY_TRACE' Then
    Begin
      check_outer_validity_trace_probe(StrToInt(ParamStr(2)));
      WriteLn(out_buf);
    End
  Else If fn='FIRM_UP_THE_LINE_TRACE' Then
    Begin
      firm_up_the_line_trace_probe(StrToInt(ParamStr(2)));
      WriteLn(out_buf);
    End
  Else If fn='RUNAWAY_TRACE' Then
    Begin
      runaway_trace_probe(StrToInt(ParamStr(2)));
      WriteLn(out_buf);
    End
  Else If fn='FLUSH_NODE_LIST_TRACE' Then
    Begin
      flush_node_list_trace_probe(StrToInt(ParamStr(2)));
      WriteLn(out_buf);
    End
  Else If fn='COPY_NODE_LIST_TRACE' Then
    Begin
      copy_node_list_trace_probe(StrToInt(ParamStr(2)));
      WriteLn(out_buf);
    End
  Else If fn='SHOW_BOX_TRACE' Then
    Begin
      show_box_trace_probe(StrToInt(ParamStr(2)));
      WriteLn(out_buf);
    End
  Else If fn='SHOW_NODE_LIST_TRACE' Then
    Begin
      show_node_list_trace_probe(StrToInt(ParamStr(2)));
      WriteLn(out_buf);
    End
  Else If fn='SHOW_ACTIVITIES_TRACE' Then
    Begin
      show_activities_trace_probe(StrToInt(ParamStr(2)));
      WriteLn(out_buf);
    End
  Else If fn='SHOW_TOKEN_LIST_TRACE' Then
    Begin
      show_token_list_trace_probe(StrToInt(ParamStr(2)));
      WriteLn(out_buf);
    End
  Else If fn='GROUP_WARNING_TRACE' Then
    Begin
      group_warning_trace_probe(StrToInt(ParamStr(2)));
      WriteLn(out_buf);
    End
  Else If fn='IF_WARNING_TRACE' Then
    Begin
      if_warning_trace_probe(StrToInt(ParamStr(2)));
      WriteLn(out_buf);
    End
  Else If fn='FILE_WARNING_TRACE' Then
    Begin
      file_warning_trace_probe(StrToInt(ParamStr(2)));
      WriteLn(out_buf);
    End
  Else If fn='GET_NEXT_TRACE' Then
    Begin
      get_next_trace_probe(StrToInt(ParamStr(2)));
      WriteLn(out_buf);
    End
  Else If fn='GET_TOKEN_TRACE' Then
    Begin
      get_token_trace_probe(StrToInt(ParamStr(2)));
      WriteLn(out_buf);
    End
  Else If fn='MACRO_CALL_TRACE' Then
    Begin
      macro_call_trace_probe(StrToInt(ParamStr(2)));
      WriteLn(out_buf);
    End
  Else If fn='INSERT_RELAX_TRACE' Then
    Begin
      insert_relax_trace_probe;
      WriteLn(out_buf);
    End
  Else If fn='NEW_INDEX_TRACE' Then
    Begin
      new_index_trace_probe;
      WriteLn(out_buf);
    End
  Else If fn='FIND_SA_ELEMENT_TRACE' Then
    Begin
      find_sa_element_trace_probe(StrToInt(ParamStr(2)));
      WriteLn(out_buf);
    End
  Else If fn='EXPAND_TRACE' Then
    Begin
      expand_trace_probe(StrToInt(ParamStr(2)));
      WriteLn(out_buf);
    End
  Else If fn='GET_X_TOKEN_TRACE' Then
    Begin
      get_x_token_trace_probe(StrToInt(ParamStr(2)));
      WriteLn(out_buf);
    End
  Else If fn='X_TOKEN_TRACE' Then
    Begin
      x_token_trace_probe(StrToInt(ParamStr(2)));
      WriteLn(out_buf);
    End
  Else If fn='SCAN_LEFT_BRACE_TRACE' Then
    Begin
      scan_left_brace_trace_probe(StrToInt(ParamStr(2)));
      WriteLn(out_buf);
    End
  Else If fn='SCAN_OPTIONAL_EQUALS_TRACE' Then
    Begin
      scan_optional_equals_trace_probe(StrToInt(ParamStr(2)));
      WriteLn(out_buf);
    End
  Else If fn='SCAN_KEYWORD_TRACE' Then
    Begin
      scan_keyword_trace_probe(StrToInt(ParamStr(2)));
      WriteLn(out_buf);
    End
  Else If fn='MU_ERROR_TRACE' Then
    Begin
      mu_error_trace_probe(StrToInt(ParamStr(2)));
      WriteLn(out_buf);
    End
  Else If fn='SCAN_EIGHT_BIT_INT_TRACE' Then
    Begin
      scan_eight_bit_int_trace_probe(StrToInt(ParamStr(2)));
      WriteLn(out_buf);
    End
  Else If fn='SCAN_CHAR_NUM_TRACE' Then
    Begin
      scan_char_num_trace_probe(StrToInt(ParamStr(2)));
      WriteLn(out_buf);
    End
  Else If fn='SCAN_FOUR_BIT_INT_TRACE' Then
    Begin
      scan_four_bit_int_trace_probe(StrToInt(ParamStr(2)));
      WriteLn(out_buf);
    End
  Else If fn='SCAN_FIFTEEN_BIT_INT_TRACE' Then
    Begin
      scan_fifteen_bit_int_trace_probe(StrToInt(ParamStr(2)));
      WriteLn(out_buf);
    End
  Else If fn='SCAN_TWENTY_SEVEN_BIT_INT_TRACE' Then
    Begin
      scan_twenty_seven_bit_int_trace_probe(StrToInt(ParamStr(2)));
      WriteLn(out_buf);
    End
  Else If fn='SCAN_REGISTER_NUM_TRACE' Then
    Begin
      scan_register_num_trace_probe(StrToInt(ParamStr(2)));
      WriteLn(out_buf);
    End
  Else If fn='GET_X_OR_PROTECTED_TRACE' Then
    Begin
      get_x_or_protected_trace_probe(StrToInt(ParamStr(2)));
      WriteLn(out_buf);
    End
  Else If fn='SCAN_FONT_IDENT_TRACE' Then
    Begin
      scan_font_ident_trace_probe(StrToInt(ParamStr(2)));
      WriteLn(out_buf);
    End
  Else If fn='FIND_FONT_DIMEN_TRACE' Then
    Begin
      find_font_dimen_trace_probe(StrToInt(ParamStr(2)));
      WriteLn(out_buf);
    End
  Else If fn='SCAN_SOMETHING_INTERNAL_TRACE' Then
    Begin
      scan_something_internal_trace_probe(StrToInt(ParamStr(2)));
      WriteLn(out_buf);
    End
  Else If fn='SCAN_INT_TRACE' Then
    Begin
      scan_int_trace_probe(StrToInt(ParamStr(2)));
      WriteLn(out_buf);
    End
  Else If fn='SCAN_DIMEN_TRACE' Then
    Begin
      scan_dimen_trace_probe(StrToInt(ParamStr(2)));
      WriteLn(out_buf);
    End
  Else If fn='SCAN_GLUE_TRACE' Then
    Begin
      scan_glue_trace_probe(StrToInt(ParamStr(2)));
      WriteLn(out_buf);
    End
  Else If fn='SCAN_NORMAL_GLUE_TRACE' Then
    Begin
      scan_normal_glue_trace_probe(StrToInt(ParamStr(2)));
      WriteLn(out_buf);
    End
  Else If fn='SCAN_MU_GLUE_TRACE' Then
    Begin
      scan_mu_glue_trace_probe(StrToInt(ParamStr(2)));
      WriteLn(out_buf);
    End
  Else If fn='SCAN_RULE_SPEC_TRACE' Then
    Begin
      scan_rule_spec_trace_probe(StrToInt(ParamStr(2)));
      WriteLn(out_buf);
    End
  Else If fn='SCAN_SPEC_TRACE' Then
    Begin
      scan_spec_trace_probe(StrToInt(ParamStr(2)));
      WriteLn(out_buf);
    End
  Else If fn='SCAN_GENERAL_TEXT_TRACE' Then
    Begin
      scan_general_text_trace_probe(StrToInt(ParamStr(2)));
      WriteLn(out_buf);
    End
  Else If fn='SCAN_EXPR_TRACE' Then
    Begin
      scan_expr_trace_probe(StrToInt(ParamStr(2)));
      WriteLn(out_buf);
    End
  Else If fn='PSEUDO_START_TRACE' Then
    Begin
      pseudo_start_trace_probe(StrToInt(ParamStr(2)));
      WriteLn(out_buf);
    End
  Else If fn='STR_TOKS_TRACE' Then
    Begin
      str_toks_trace_probe(StrToInt(ParamStr(2)));
      WriteLn(out_buf);
    End
  Else If fn='THE_TOKS_TRACE' Then
    Begin
      the_toks_trace_probe(StrToInt(ParamStr(2)));
      WriteLn(out_buf);
    End
  Else If fn='INS_THE_TOKS_TRACE' Then
    Begin
      ins_the_toks_trace_probe(StrToInt(ParamStr(2)));
      WriteLn(out_buf);
    End
  Else If fn='CONV_TOKS_TRACE' Then
    Begin
      conv_toks_trace_probe(StrToInt(ParamStr(2)));
      WriteLn(out_buf);
    End
  Else If fn='SCAN_TOKS_TRACE' Then
    Begin
      scan_toks_trace_probe(StrToInt(ParamStr(2)));
      WriteLn(out_buf);
    End
  Else If fn='READ_TOKS_TRACE' Then
    Begin
      read_toks_trace_probe(StrToInt(ParamStr(2)));
      WriteLn(out_buf);
    End
  Else If fn='PUSH_NEST_TRACE' Then
    Begin
      push_nest_trace_probe(
        StrToInt(ParamStr(2)),
        StrToInt(ParamStr(3)),
        StrToInt(ParamStr(4)),
        StrToInt(ParamStr(5)),
        StrToInt(ParamStr(6)),
        StrToInt(ParamStr(7)),
        StrToInt(ParamStr(8)),
        StrToInt(ParamStr(9)),
        StrToInt(ParamStr(10)),
        StrToInt(ParamStr(11)));
      WriteLn(out_buf);
    End
  Else If fn='POP_NEST_TRACE' Then
    Begin
      pop_nest_trace_probe(
        StrToInt(ParamStr(2)),
        StrToInt(ParamStr(3)),
        StrToInt(ParamStr(4)),
        StrToInt(ParamStr(5)),
        StrToInt(ParamStr(6)),
        StrToInt(ParamStr(7)),
        StrToInt(ParamStr(8)),
        StrToInt(ParamStr(9)));
      WriteLn(out_buf);
    End
  Else If fn='FINITE_SHRINK_TRACE' Then
    Begin
      finite_shrink_trace_probe(
        StrToInt(ParamStr(2)),
        StrToInt(ParamStr(3)),
        StrToInt(ParamStr(4)));
      WriteLn(out_buf);
    End
  Else If fn='TRAP_ZERO_GLUE_TRACE' Then
    Begin
      trap_zero_glue_trace_probe(
        StrToInt(ParamStr(2)),
        StrToInt(ParamStr(3)),
        StrToInt(ParamStr(4)),
        StrToInt(ParamStr(5)),
        StrToInt(ParamStr(6)));
      WriteLn(out_buf);
    End
  Else If fn='INSERT_DOLLAR_SIGN_TRACE' Then
    Begin
      insert_dollar_sign_trace_probe;
      WriteLn(out_buf);
    End
  Else If fn='PRINT_MEANING_TRACE' Then
    Begin
      print_meaning_trace_probe(
        StrToInt(ParamStr(2)),
        StrToInt(ParamStr(3)),
        StrToInt(ParamStr(4)),
        StrToInt(ParamStr(5)),
        StrToInt(ParamStr(6)),
        StrToInt(ParamStr(7)),
        StrToInt(ParamStr(8)));
      WriteLn(out_buf);
    End
  Else If fn='YOU_CANT_TRACE' Then
    Begin
      you_cant_trace_probe(StrToInt(ParamStr(2)),StrToInt(ParamStr(3)),StrToInt(ParamStr(4)));
      WriteLn(out_buf);
    End
  Else If fn='REPORT_ILLEGAL_CASE_TRACE' Then
    Begin
      report_illegal_case_trace_probe;
      WriteLn(out_buf);
    End
  Else If fn='PRIVILEGED_TRACE' Then
    Begin
      privileged_trace_probe(StrToInt(ParamStr(2)));
      WriteLn(out_buf);
    End
  Else If fn='ITS_ALL_OVER_TRACE' Then
    Begin
      its_all_over_trace_probe(StrToInt(ParamStr(2)));
      WriteLn(out_buf);
    End
  Else If fn='OFF_SAVE_TRACE' Then
    Begin
      off_save_trace_probe(StrToInt(ParamStr(2)));
      WriteLn(out_buf);
    End
  Else If fn='EXTRA_RIGHT_BRACE_TRACE' Then
    Begin
      extra_right_brace_trace_probe(StrToInt(ParamStr(2)));
      WriteLn(out_buf);
    End
  Else If fn='NORMAL_PARAGRAPH_TRACE' Then
    Begin
      normal_paragraph_trace_probe(StrToInt(ParamStr(2)));
      WriteLn(out_buf);
    End
  Else If fn='BOX_END_TRACE' Then
    Begin
      box_end_trace_probe(StrToInt(ParamStr(2)));
      WriteLn(out_buf);
    End
  Else If fn='BEGIN_BOX_TRACE' Then
    Begin
      begin_box_trace_probe(StrToInt(ParamStr(2)));
      WriteLn(out_buf);
    End
  Else If fn='SCAN_BOX_TRACE' Then
    Begin
      scan_box_trace_probe(StrToInt(ParamStr(2)));
      WriteLn(out_buf);
    End
  Else If fn='PACKAGE_TRACE' Then
    Begin
      package_trace_probe(StrToInt(ParamStr(2)));
      WriteLn(out_buf);
    End
  Else If fn='NEW_GRAF_TRACE' Then
    Begin
      new_graf_trace_probe(StrToInt(ParamStr(2)));
      WriteLn(out_buf);
    End
  Else If fn='INDENT_IN_HMODE_TRACE' Then
    Begin
      indent_in_hmode_trace_probe(StrToInt(ParamStr(2)));
      WriteLn(out_buf);
    End
  Else If fn='HEAD_FOR_VMODE_TRACE' Then
    Begin
      head_for_vmode_trace_probe(StrToInt(ParamStr(2)));
      WriteLn(out_buf);
    End
  Else If fn='END_GRAF_TRACE' Then
    Begin
      end_graf_trace_probe(StrToInt(ParamStr(2)));
      WriteLn(out_buf);
    End
  Else If fn='BEGIN_INSERT_OR_ADJUST_TRACE' Then
    Begin
      begin_insert_or_adjust_trace_probe(StrToInt(ParamStr(2)));
      WriteLn(out_buf);
    End
  Else If fn='MAKE_MARK_TRACE' Then
    Begin
      make_mark_trace_probe(StrToInt(ParamStr(2)));
      WriteLn(out_buf);
    End
  Else If fn='DELETE_LAST_TRACE' Then
    Begin
      delete_last_trace_probe(StrToInt(ParamStr(2)));
      WriteLn(out_buf);
    End
  Else If fn='UNPACKAGE_TRACE' Then
    Begin
      unpackage_trace_probe(StrToInt(ParamStr(2)));
      WriteLn(out_buf);
    End
  Else If fn='APPEND_ITALIC_CORRECTION_TRACE' Then
    Begin
      append_italic_correction_trace_probe(StrToInt(ParamStr(2)));
      WriteLn(out_buf);
    End
  Else If fn='APPEND_DISCRETIONARY_TRACE' Then
    Begin
      append_discretionary_trace_probe(StrToInt(ParamStr(2)));
      WriteLn(out_buf);
    End
  Else If fn='MAKE_ACCENT_TRACE' Then
    Begin
      make_accent_trace_probe(StrToInt(ParamStr(2)));
      WriteLn(out_buf);
    End
  Else If fn='BUILD_DISCRETIONARY_TRACE' Then
    Begin
      build_discretionary_trace_probe(StrToInt(ParamStr(2)));
      WriteLn(out_buf);
    End
  Else If fn='ALIGN_ERROR_TRACE' Then
    Begin
      align_error_trace_probe(StrToInt(ParamStr(2)));
      WriteLn(out_buf);
    End
  Else If fn='NO_ALIGN_ERROR_TRACE' Then
    Begin
      no_align_error_trace_probe;
      WriteLn(out_buf);
    End
  Else If fn='OMIT_ERROR_TRACE' Then
    Begin
      omit_error_trace_probe;
      WriteLn(out_buf);
    End
  Else If fn='DO_ENDV_TRACE' Then
    Begin
      do_endv_trace_probe(StrToInt(ParamStr(2)));
      WriteLn(out_buf);
    End
  Else If fn='CS_ERROR_TRACE' Then
    Begin
      cs_error_trace_probe;
      WriteLn(out_buf);
    End
  Else If fn='PUSH_MATH_TRACE' Then
    Begin
      push_math_trace_probe(StrToInt(ParamStr(2)));
      WriteLn(out_buf);
    End
  Else If fn='JUST_COPY_TRACE' Then
    Begin
      just_copy_trace_probe(StrToInt(ParamStr(2)));
      WriteLn(out_buf);
    End
  Else If fn='JUST_REVERSE_TRACE' Then
    Begin
      just_reverse_trace_probe(StrToInt(ParamStr(2)));
      WriteLn(out_buf);
    End
  Else If fn='START_EQ_NO_TRACE' Then
    Begin
      start_eq_no_trace_probe(StrToInt(ParamStr(2)));
      WriteLn(out_buf);
    End
  Else If fn='INIT_MATH_TRACE' Then
    Begin
      init_math_trace_probe(StrToInt(ParamStr(2)));
      WriteLn(out_buf);
    End
  Else If fn='SCAN_MATH_TRACE' Then
    Begin
      scan_math_trace_probe(StrToInt(ParamStr(2)));
      WriteLn(out_buf);
    End
  Else If fn='SET_MATH_CHAR_TRACE' Then
    Begin
      set_math_char_trace_probe(StrToInt(ParamStr(2)));
      WriteLn(out_buf);
    End
  Else If fn='MATH_LIMIT_SWITCH_TRACE' Then
    Begin
      math_limit_switch_trace_probe(StrToInt(ParamStr(2)));
      WriteLn(out_buf);
    End
  Else If fn='SCAN_DELIMITER_TRACE' Then
    Begin
      scan_delimiter_trace_probe(StrToInt(ParamStr(2)));
      WriteLn(out_buf);
    End
  Else If fn='MATH_RADICAL_TRACE' Then
    Begin
      math_radical_trace_probe(StrToInt(ParamStr(2)));
      WriteLn(out_buf);
    End
  Else If fn='MATH_AC_TRACE' Then
    Begin
      math_ac_trace_probe(StrToInt(ParamStr(2)));
      WriteLn(out_buf);
    End
  Else If fn='APPEND_CHOICES_TRACE' Then
    Begin
      append_choices_trace_probe(StrToInt(ParamStr(2)));
      WriteLn(out_buf);
    End
  Else If fn='FIN_MLIST_TRACE' Then
    Begin
      fin_mlist_trace_probe(StrToInt(ParamStr(2)));
      WriteLn(out_buf);
    End
  Else If fn='BUILD_CHOICES_TRACE' Then
    Begin
      build_choices_trace_probe(StrToInt(ParamStr(2)));
      WriteLn(out_buf);
    End
  Else If fn='SUB_SUP_TRACE' Then
    Begin
      sub_sup_trace_probe(StrToInt(ParamStr(2)));
      WriteLn(out_buf);
    End
  Else If fn='MATH_FRACTION_TRACE' Then
    Begin
      math_fraction_trace_probe(StrToInt(ParamStr(2)));
      WriteLn(out_buf);
    End
  Else If fn='MATH_LEFT_RIGHT_TRACE' Then
    Begin
      math_left_right_trace_probe(StrToInt(ParamStr(2)));
      WriteLn(out_buf);
    End
  Else If fn='APP_DISPLAY_TRACE' Then
    Begin
      app_display_trace_probe(StrToInt(ParamStr(2)));
      WriteLn(out_buf);
    End
  Else If fn='RESUME_AFTER_DISPLAY_TRACE' Then
    Begin
      resume_after_display_trace_probe(StrToInt(ParamStr(2)));
      WriteLn(out_buf);
    End
  Else If fn='GET_R_TOKEN_TRACE' Then
    Begin
      get_r_token_trace_probe(StrToInt(ParamStr(2)));
      WriteLn(out_buf);
    End
  Else If fn='AFTER_MATH_TRACE' Then
    Begin
      after_math_trace_probe(StrToInt(ParamStr(2)));
      WriteLn(out_buf);
    End
  Else If fn='DO_REGISTER_COMMAND_TRACE' Then
    Begin
      do_register_command_trace_probe(StrToInt(ParamStr(2)));
      WriteLn(out_buf);
    End
  Else If fn='ALTER_AUX_TRACE' Then
    Begin
      alter_aux_trace_probe(StrToInt(ParamStr(2)));
      WriteLn(out_buf);
    End
  Else If fn='ALTER_PREV_GRAF_TRACE' Then
    Begin
      alter_prev_graf_trace_probe(StrToInt(ParamStr(2)));
      WriteLn(out_buf);
    End
  Else If fn='ALTER_PAGE_SO_FAR_TRACE' Then
    Begin
      alter_page_so_far_trace_probe(StrToInt(ParamStr(2)));
      WriteLn(out_buf);
    End
  Else If fn='ALTER_INTEGER_TRACE' Then
    Begin
      alter_integer_trace_probe(StrToInt(ParamStr(2)));
      WriteLn(out_buf);
    End
  Else If fn='ALTER_BOX_DIMEN_TRACE' Then
    Begin
      alter_box_dimen_trace_probe(StrToInt(ParamStr(2)));
      WriteLn(out_buf);
    End
  Else If fn='NEW_INTERACTION_TRACE' Then
    Begin
      new_interaction_trace_probe(StrToInt(ParamStr(2)));
      WriteLn(out_buf);
    End
  Else If fn='NEW_FONT_TRACE' Then
    Begin
      new_font_trace_probe(StrToInt(ParamStr(2)));
      WriteLn(out_buf);
    End
  Else If fn='PREFIXED_COMMAND_TRACE' Then
    Begin
      prefixed_command_trace_probe(StrToInt(ParamStr(2)));
      WriteLn(out_buf);
    End
  Else If fn='DO_ASSIGNMENTS_TRACE' Then
    Begin
      do_assignments_trace_probe(StrToInt(ParamStr(2)));
      WriteLn(out_buf);
    End
  Else If fn='OPEN_OR_CLOSE_IN_TRACE' Then
    Begin
      open_or_close_in_trace_probe(StrToInt(ParamStr(2)));
      WriteLn(out_buf);
    End
  Else If fn='ISSUE_MESSAGE_TRACE' Then
    Begin
      issue_message_trace_probe(StrToInt(ParamStr(2)));
      WriteLn(out_buf);
    End
  Else If fn='SHIFT_CASE_TRACE' Then
    Begin
      shift_case_trace_probe(StrToInt(ParamStr(2)));
      WriteLn(out_buf);
    End
  Else If fn='SHOW_WHATEVER_TRACE' Then
    Begin
      show_whatever_trace_probe(StrToInt(ParamStr(2)));
      WriteLn(out_buf);
    End
  Else If fn='NEW_WHATSIT_TRACE' Then
    Begin
      new_whatsit_trace_probe(StrToInt(ParamStr(2)));
      WriteLn(out_buf);
    End
  Else If fn='NEW_WRITE_WHATSIT_TRACE' Then
    Begin
      new_write_whatsit_trace_probe(StrToInt(ParamStr(2)));
      WriteLn(out_buf);
    End
  Else If fn='DO_EXTENSION_TRACE' Then
    Begin
      do_extension_trace_probe(StrToInt(ParamStr(2)));
      WriteLn(out_buf);
    End
  Else If fn='FIX_LANGUAGE_TRACE' Then
    Begin
      fix_language_trace_probe(StrToInt(ParamStr(2)));
      WriteLn(out_buf);
    End
  Else If fn='HANDLE_RIGHT_BRACE_TRACE' Then
    Begin
      handle_right_brace_trace_probe(StrToInt(ParamStr(2)));
      WriteLn(out_buf);
    End
  Else If fn='GIVE_ERR_HELP_TRACE' Then
    Begin
      give_err_help_trace_probe(StrToInt(ParamStr(2)));
      WriteLn(out_buf);
    End
  Else If fn='OPEN_FMT_FILE_TRACE' Then
    Begin
      open_fmt_file_trace_probe(StrToInt(ParamStr(2)));
      WriteLn(out_buf);
    End
  Else If fn='FINAL_CLEANUP_TRACE' Then
    Begin
      final_cleanup_trace_probe(StrToInt(ParamStr(2)));
      WriteLn(out_buf);
    End
  Else If fn='CLOSE_FILES_AND_TERMINATE_TRACE' Then
    Begin
      close_files_and_terminate_trace_probe(StrToInt(ParamStr(2)));
      WriteLn(out_buf);
    End
  Else If fn='INIT_PRIM_TRACE' Then
    Begin
      init_prim_trace_probe(StrToInt(ParamStr(2)));
      WriteLn(out_buf);
    End
  Else If fn='LOAD_FMT_FILE_TRACE' Then
    Begin
      load_fmt_file_trace_probe(StrToInt(ParamStr(2)));
      WriteLn(out_buf);
    End
  Else If fn='STORE_FMT_FILE_TRACE' Then
    Begin
      store_fmt_file_trace_probe(StrToInt(ParamStr(2)));
      WriteLn(out_buf);
    End
  Else If fn='MAIN_CONTROL_TRACE' Then
    Begin
      main_control_trace_probe(StrToInt(ParamStr(2)));
      WriteLn(out_buf);
    End
  Else If fn='BOX_ERROR_TRACE' Then
    Begin
      box_error_trace_probe(StrToInt(ParamStr(2)),StrToInt(ParamStr(3)));
      WriteLn(out_buf);
    End
  Else If fn='ENSURE_VBOX_TRACE' Then
    Begin
      ensure_vbox_trace_probe(StrToInt(ParamStr(2)),StrToInt(ParamStr(3)),StrToInt(ParamStr(4)));
      WriteLn(out_buf);
    End
  Else If fn='APPEND_KERN_TRACE' Then
    Begin
      append_kern_trace_probe(
        StrToInt(ParamStr(2)),
        StrToInt(ParamStr(3)),
        StrToInt(ParamStr(4)),
        StrToInt(ParamStr(5)),
        StrToInt(ParamStr(6)));
      WriteLn(out_buf);
    End
  Else If fn='APPEND_PENALTY_TRACE' Then
    Begin
      append_penalty_trace_probe(
        StrToInt(ParamStr(2)),
        StrToInt(ParamStr(3)),
        StrToInt(ParamStr(4)),
        StrToInt(ParamStr(5)),
        StrToInt(ParamStr(6)));
      WriteLn(out_buf);
    End
  Else If fn='APP_SPACE_TRACE' Then
    Begin
      app_space_trace_probe(StrToInt(ParamStr(2)));
      WriteLn(out_buf);
    End
  Else If fn='APPEND_GLUE_TRACE' Then
    Begin
      append_glue_trace_probe(StrToInt(ParamStr(2)));
      WriteLn(out_buf);
    End
  Else If fn='OVERBAR_TRACE' Then
    Begin
      overbar_trace_probe(
        StrToInt(ParamStr(2)),
        StrToInt(ParamStr(3)),
        StrToInt(ParamStr(4)),
        StrToInt(ParamStr(5)),
        StrToInt(ParamStr(6)),
        StrToInt(ParamStr(7)),
        StrToInt(ParamStr(8)));
      WriteLn(out_buf);
    End
  Else If fn='CHAR_BOX_TRACE' Then
    Begin
      char_box_trace_probe(
        StrToInt(ParamStr(2)),
        StrToInt(ParamStr(3)),
        StrToInt(ParamStr(4)),
        StrToInt(ParamStr(5)),
        StrToInt(ParamStr(6)),
        StrToInt(ParamStr(7)),
        StrToInt(ParamStr(8)),
        StrToInt(ParamStr(9)),
        StrToInt(ParamStr(10)),
        StrToInt(ParamStr(11)),
        StrToInt(ParamStr(12)),
        StrToInt(ParamStr(13)),
        StrToInt(ParamStr(14)),
        StrToInt(ParamStr(15)),
        StrToInt(ParamStr(16)),
        StrToInt(ParamStr(17)));
      WriteLn(out_buf);
    End
  Else If fn='STACK_INTO_BOX_TRACE' Then
    Begin
      stack_into_box_trace_probe(
        StrToInt(ParamStr(2)),
        StrToInt(ParamStr(3)),
        StrToInt(ParamStr(4)),
        StrToInt(ParamStr(5)),
        StrToInt(ParamStr(6)),
        StrToInt(ParamStr(7)));
      WriteLn(out_buf);
    End
  Else If fn='HEIGHT_PLUS_DEPTH_TRACE' Then
    Begin
      height_plus_depth_trace_probe(
        StrToInt(ParamStr(2)),
        StrToInt(ParamStr(3)),
        StrToInt(ParamStr(4)),
        StrToInt(ParamStr(5)),
        StrToInt(ParamStr(6)),
        StrToInt(ParamStr(7)),
        StrToInt(ParamStr(8)),
        StrToInt(ParamStr(9)));
      WriteLn(out_buf);
    End
  Else If fn='VAR_DELIMITER_TRACE' Then
    Begin
      var_delimiter_trace_probe(StrToInt(ParamStr(2)));
      WriteLn(out_buf);
    End
  Else If fn='CLEAN_BOX_TRACE' Then
    Begin
      clean_box_trace_probe(StrToInt(ParamStr(2)));
      WriteLn(out_buf);
    End
  Else If fn='FETCH_TRACE' Then
    Begin
      fetch_trace_probe(StrToInt(ParamStr(2)));
      WriteLn(out_buf);
    End
  Else If fn='MAKE_OVER_TRACE' Then
    Begin
      make_over_trace_probe(
        StrToInt(ParamStr(2)),
        StrToInt(ParamStr(3)),
        StrToInt(ParamStr(4)),
        StrToInt(ParamStr(5)),
        StrToInt(ParamStr(6)),
        StrToInt(ParamStr(7)),
        StrToInt(ParamStr(8)),
        StrToInt(ParamStr(9)));
      WriteLn(out_buf);
    End
  Else If fn='MAKE_UNDER_TRACE' Then
    Begin
      make_under_trace_probe(
        StrToInt(ParamStr(2)),
        StrToInt(ParamStr(3)),
        StrToInt(ParamStr(4)),
        StrToInt(ParamStr(5)),
        StrToInt(ParamStr(6)),
        StrToInt(ParamStr(7)),
        StrToInt(ParamStr(8)),
        StrToInt(ParamStr(9)),
        StrToInt(ParamStr(10)),
        StrToInt(ParamStr(11)),
        StrToInt(ParamStr(12)),
        StrToInt(ParamStr(13)),
        StrToInt(ParamStr(14)));
      WriteLn(out_buf);
    End
  Else If fn='MAKE_VCENTER_TRACE' Then
    Begin
      make_vcenter_trace_probe(
        StrToInt(ParamStr(2)),
        StrToInt(ParamStr(3)),
        StrToInt(ParamStr(4)),
        StrToInt(ParamStr(5)),
        StrToInt(ParamStr(6)),
        StrToInt(ParamStr(7)),
        StrToInt(ParamStr(8)),
        StrToInt(ParamStr(9)),
        StrToInt(ParamStr(10)));
      WriteLn(out_buf);
    End
  Else If fn='MAKE_RADICAL_TRACE' Then
    Begin
      make_radical_trace_probe(
        StrToInt(ParamStr(2)),
        StrToInt(ParamStr(3)),
        StrToInt(ParamStr(4)),
        StrToInt(ParamStr(5)),
        StrToInt(ParamStr(6)),
        StrToInt(ParamStr(7)),
        StrToInt(ParamStr(8)),
        StrToInt(ParamStr(9)),
        StrToInt(ParamStr(10)),
        StrToInt(ParamStr(11)),
        StrToInt(ParamStr(12)),
        StrToInt(ParamStr(13)),
        StrToInt(ParamStr(14)),
        StrToInt(ParamStr(15)),
        StrToInt(ParamStr(16)),
        StrToInt(ParamStr(17)),
        StrToInt(ParamStr(18)));
      WriteLn(out_buf);
    End
  Else If fn='MAKE_MATH_ACCENT_TRACE' Then
    Begin
      make_math_accent_trace_probe(StrToInt(ParamStr(2)));
      WriteLn(out_buf);
    End
  Else If fn='MAKE_FRACTION_TRACE' Then
    Begin
      make_fraction_trace_probe(StrToInt(ParamStr(2)));
      WriteLn(out_buf);
    End
  Else If fn='MAKE_OP_TRACE' Then
    Begin
      make_op_trace_probe(StrToInt(ParamStr(2)));
      WriteLn(out_buf);
    End
  Else If fn='MAKE_ORD_TRACE' Then
    Begin
      make_ord_trace_probe(StrToInt(ParamStr(2)));
      WriteLn(out_buf);
    End
  Else If fn='MAKE_SCRIPTS_TRACE' Then
    Begin
      make_scripts_trace_probe(StrToInt(ParamStr(2)));
      WriteLn(out_buf);
    End
  Else If fn='MAKE_LEFT_RIGHT_TRACE' Then
    Begin
      make_left_right_trace_probe(
        StrToInt(ParamStr(2)),
        StrToInt(ParamStr(3)),
        StrToInt(ParamStr(4)),
        StrToInt(ParamStr(5)),
        StrToInt(ParamStr(6)),
        StrToInt(ParamStr(7)),
        StrToInt(ParamStr(8)),
        StrToInt(ParamStr(9)),
        StrToInt(ParamStr(10)),
        StrToInt(ParamStr(11)),
        StrToInt(ParamStr(12)),
        StrToInt(ParamStr(13)),
        StrToInt(ParamStr(14)));
      WriteLn(out_buf);
    End
  Else If fn='MLIST_TO_HLIST_TRACE' Then
    Begin
      mlist_to_hlist_trace_probe(StrToInt(ParamStr(2)));
      WriteLn(out_buf);
    End
  Else If fn='PUSH_ALIGNMENT_TRACE' Then
    Begin
      push_alignment_trace_probe(
        StrToInt(ParamStr(2)),
        StrToInt(ParamStr(3)),
        StrToInt(ParamStr(4)),
        StrToInt(ParamStr(5)),
        StrToInt(ParamStr(6)),
        StrToInt(ParamStr(7)),
        StrToInt(ParamStr(8)),
        StrToInt(ParamStr(9)),
        StrToInt(ParamStr(10)),
        StrToInt(ParamStr(11)));
      WriteLn(out_buf);
    End
  Else If fn='POP_ALIGNMENT_TRACE' Then
    Begin
      pop_alignment_trace_probe(
        StrToInt(ParamStr(2)),
        StrToInt(ParamStr(3)),
        StrToInt(ParamStr(4)),
        StrToInt(ParamStr(5)),
        StrToInt(ParamStr(6)),
        StrToInt(ParamStr(7)),
        StrToInt(ParamStr(8)),
        StrToInt(ParamStr(9)),
        StrToInt(ParamStr(10)),
        StrToInt(ParamStr(11)));
      WriteLn(out_buf);
    End
  Else If fn='GET_PREAMBLE_TOKEN_TRACE' Then
    Begin
      get_preamble_token_trace_probe(StrToInt(ParamStr(2)));
      WriteLn(out_buf);
    End
  Else If fn='INIT_ALIGN_TRACE' Then
    Begin
      init_align_trace_probe(StrToInt(ParamStr(2)));
      WriteLn(out_buf);
    End
  Else If fn='INIT_SPAN_TRACE' Then
    Begin
      init_span_trace_probe(
        StrToInt(ParamStr(2)),
        StrToInt(ParamStr(3)),
        StrToInt(ParamStr(4)),
        StrToInt(ParamStr(5)));
      WriteLn(out_buf);
    End
  Else If fn='INIT_ROW_TRACE' Then
    Begin
      init_row_trace_probe(
        StrToInt(ParamStr(2)),
        StrToInt(ParamStr(3)),
        StrToInt(ParamStr(4)),
        StrToInt(ParamStr(5)),
        StrToInt(ParamStr(6)),
        StrToInt(ParamStr(7)),
        StrToInt(ParamStr(8)),
        StrToInt(ParamStr(9)),
        StrToInt(ParamStr(10)));
      WriteLn(out_buf);
    End
  Else If fn='INIT_COL_TRACE' Then
    Begin
      init_col_trace_probe(
        StrToInt(ParamStr(2)),
        StrToInt(ParamStr(3)),
        StrToInt(ParamStr(4)),
        StrToInt(ParamStr(5)));
      WriteLn(out_buf);
    End
  Else If fn='FIN_COL_TRACE' Then
    Begin
      fin_col_trace_probe(StrToInt(ParamStr(2)));
      WriteLn(out_buf);
    End
  Else If fn='FIN_ROW_TRACE' Then
    Begin
      fin_row_trace_probe(StrToInt(ParamStr(2)));
      WriteLn(out_buf);
    End
  Else If fn='FIN_ALIGN_TRACE' Then
    Begin
      fin_align_trace_probe(StrToInt(ParamStr(2)));
      WriteLn(out_buf);
    End
  Else If fn='ALIGN_PEEK_TRACE' Then
    Begin
      align_peek_trace_probe(StrToInt(ParamStr(2)));
      WriteLn(out_buf);
    End
  Else If fn='TRY_BREAK_TRACE' Then
    Begin
      try_break_trace_probe(StrToInt(ParamStr(2)));
      WriteLn(out_buf);
    End
  Else If fn='POST_LINE_BREAK_TRACE' Then
    Begin
      post_line_break_trace_probe(StrToInt(ParamStr(2)));
      WriteLn(out_buf);
    End
  Else If fn='RECONSTITUTE_TRACE' Then
    Begin
      reconstitute_trace_probe(StrToInt(ParamStr(2)));
      WriteLn(out_buf);
    End
  Else If fn='HYPHENATE_TRACE' Then
    Begin
      hyphenate_trace_probe(StrToInt(ParamStr(2)));
      WriteLn(out_buf);
    End
  Else If fn='NEW_TRIE_OP_TRACE' Then
    Begin
      new_trie_op_trace_probe(StrToInt(ParamStr(2)));
      WriteLn(out_buf);
    End
  Else If fn='TRIE_NODE_TRACE' Then
    Begin
      trie_node_trace_probe(StrToInt(ParamStr(2)));
      WriteLn(out_buf);
    End
  Else If fn='COMPRESS_TRIE_TRACE' Then
    Begin
      compress_trie_trace_probe(StrToInt(ParamStr(2)));
      WriteLn(out_buf);
    End
  Else If fn='FIRST_FIT_TRACE' Then
    Begin
      first_fit_trace_probe(StrToInt(ParamStr(2)));
      WriteLn(out_buf);
    End
  Else If fn='TRIE_PACK_TRACE' Then
    Begin
      trie_pack_trace_probe(StrToInt(ParamStr(2)));
      WriteLn(out_buf);
    End
  Else If fn='TRIE_FIX_TRACE' Then
    Begin
      trie_fix_trace_probe(StrToInt(ParamStr(2)));
      WriteLn(out_buf);
    End
  Else If fn='NEW_PATTERNS_TRACE' Then
    Begin
      new_patterns_trace_probe(StrToInt(ParamStr(2)));
      WriteLn(out_buf);
    End
  Else If fn='INIT_TRIE_TRACE' Then
    Begin
      init_trie_trace_probe(StrToInt(ParamStr(2)));
      WriteLn(out_buf);
    End
  Else If fn='ETEX_ENABLED_TRACE' Then
    Begin
      etex_enabled_trace_probe(StrToInt(ParamStr(2)));
      WriteLn(out_buf);
    End
  Else If fn='SHOW_SAVE_GROUPS_TRACE' Then
    Begin
      show_save_groups_trace_probe(StrToInt(ParamStr(2)));
      WriteLn(out_buf);
    End
  Else If fn='NEW_HYPH_EXCEPTIONS_TRACE' Then
    Begin
      new_hyph_exceptions_trace_probe(StrToInt(ParamStr(2)));
      WriteLn(out_buf);
    End
  Else If fn='PRUNE_PAGE_TOP_TRACE' Then
    Begin
      prune_page_top_trace_probe(StrToInt(ParamStr(2)));
      WriteLn(out_buf);
    End
  Else If fn='DO_MARKS_TRACE' Then
    Begin
      do_marks_trace_probe(StrToInt(ParamStr(2)));
      WriteLn(out_buf);
    End
  Else If fn='VERT_BREAK_TRACE' Then
    Begin
      vert_break_trace_probe(StrToInt(ParamStr(2)));
      WriteLn(out_buf);
    End
  Else If fn='LINE_BREAK_TRACE' Then
    Begin
      line_break_trace_probe(StrToInt(ParamStr(2)));
      WriteLn(out_buf);
    End
  Else If fn='VSPLIT_TRACE' Then
    Begin
      vsplit_trace_probe(StrToInt(ParamStr(2)));
      WriteLn(out_buf);
    End
  Else If fn='PRINT_TOTALS_TRACE' Then
    Begin
      print_totals_trace_probe(StrToInt(ParamStr(2)));
      WriteLn(out_buf);
    End
  Else If fn='FREEZE_PAGE_SPECS_TRACE' Then
    Begin
      freeze_page_specs_trace_probe(StrToInt(ParamStr(2)));
      WriteLn(out_buf);
    End
  Else If fn='FIRE_UP_TRACE' Then
    Begin
      fire_up_trace_probe(StrToInt(ParamStr(2)));
      WriteLn(out_buf);
    End
  Else If fn='BUILD_PAGE_TRACE' Then
    Begin
      build_page_trace_probe(StrToInt(ParamStr(2)));
      WriteLn(out_buf);
    End
  Else If fn='INITIALIZE_TRACE' Then
    Begin
      initialize_trace_probe(StrToInt(ParamStr(2)));
      WriteLn(out_buf);
    End
  Else If fn='SHOW_INFO_TRACE' Then
    Begin
      show_info_trace_probe(
        StrToInt(ParamStr(2)),
        StrToInt(ParamStr(3)));
      WriteLn(out_buf);
    End
  Else If fn='MATH_KERN_TRACE' Then
    Begin
      math_kern_trace_probe(
        StrToInt(ParamStr(2)),
        StrToInt(ParamStr(3)),
        StrToInt(ParamStr(4)),
        StrToInt(ParamStr(5)));
      WriteLn(out_buf);
    End
  Else If fn='FLUSH_MATH_TRACE' Then
    Begin
      flush_math_trace_probe(
        StrToInt(ParamStr(2)),
        StrToInt(ParamStr(3)),
        StrToInt(ParamStr(4)));
      WriteLn(out_buf);
    End
  Else If fn='MATH_GLUE_TRACE' Then
    Begin
      math_glue_trace_probe(
        StrToInt(ParamStr(2)),
        StrToInt(ParamStr(3)),
        StrToInt(ParamStr(4)),
        StrToInt(ParamStr(5)),
        StrToInt(ParamStr(6)),
        StrToInt(ParamStr(7)),
        StrToInt(ParamStr(8)),
        StrToInt(ParamStr(9)));
      WriteLn(out_buf);
    End
  Else If fn='REBOX_TRACE' Then
    Begin
      rebox_trace_probe(
        StrToInt(ParamStr(2)),
        StrToInt(ParamStr(3)),
        StrToInt(ParamStr(4)),
        StrToInt(ParamStr(5)),
        StrToInt(ParamStr(6)),
        StrToInt(ParamStr(7)),
        StrToInt(ParamStr(8)),
        StrToInt(ParamStr(9)),
        StrToInt(ParamStr(10)),
        StrToInt(ParamStr(11)),
        StrToInt(ParamStr(12)),
        StrToInt(ParamStr(13)),
        StrToInt(ParamStr(14)));
      WriteLn(out_buf);
    End
  Else If fn='CHANGE_IF_LIMIT_TRACE' Then
    Begin
      change_if_limit_trace_probe(
        StrToInt(ParamStr(2)),
        StrToInt(ParamStr(3)),
        StrToInt(ParamStr(4)),
        StrToInt(ParamStr(5)),
        StrToInt(ParamStr(6)),
        StrToInt(ParamStr(7)),
        StrToInt(ParamStr(8)),
        StrToInt(ParamStr(9)),
        StrToInt(ParamStr(10)),
        StrToInt(ParamStr(11)));
      WriteLn(out_buf);
    End
  Else If fn='PASS_TEXT_TRACE' Then
    Begin
      pass_text_trace_probe(
        StrToInt(ParamStr(2)),
        StrToInt(ParamStr(3)),
        StrToInt(ParamStr(4)),
        StrToInt(ParamStr(5)),
        StrToInt(ParamStr(6)),
        StrToInt(ParamStr(7)),
        StrToInt(ParamStr(8)),
        StrToInt(ParamStr(9)),
        StrToInt(ParamStr(10)),
        StrToInt(ParamStr(11)),
        StrToInt(ParamStr(12)),
        StrToInt(ParamStr(13)),
        StrToInt(ParamStr(14)),
        StrToInt(ParamStr(15)),
        StrToInt(ParamStr(16)));
      WriteLn(out_buf);
    End
  Else If fn='CONDITIONAL_TRACE' Then
    Begin
      conditional_trace_probe(StrToInt(ParamStr(2)));
      WriteLn(out_buf);
    End
  Else If fn='PSEUDO_CLOSE_TRACE' Then
    Begin
      pseudo_close_trace_probe(
        StrToInt(ParamStr(2)),
        StrToInt(ParamStr(3)),
        StrToInt(ParamStr(4)),
        StrToInt(ParamStr(5)),
        StrToInt(ParamStr(6)),
        StrToInt(ParamStr(7)),
        StrToInt(ParamStr(8)),
        StrToInt(ParamStr(9)),
        StrToInt(ParamStr(10)),
        StrToInt(ParamStr(11)));
      WriteLn(out_buf);
    End
  Else If fn='TERM_INPUT_TRACE' Then
    Begin
      term_input_trace_probe(StrToInt(ParamStr(2)));
      WriteLn(out_buf);
    End
  Else If fn='PAUSE_FOR_INSTRUCTIONS_TRACE' Then
    Begin
      pause_for_instructions_trace_probe(
        StrToInt(ParamStr(2)),
        StrToInt(ParamStr(3)),
        StrToInt(ParamStr(4)),
        StrToInt(ParamStr(5)),
        StrToInt(ParamStr(6)),
        StrToInt(ParamStr(7)),
        StrToInt(ParamStr(8)),
        StrToInt(ParamStr(9)),
        StrToInt(ParamStr(10)));
      WriteLn(out_buf);
    End
  Else If fn='PSEUDO_INPUT_TRACE' Then
    Begin
      pseudo_input_trace_probe(
        StrToInt(ParamStr(2)),
        StrToInt(ParamStr(3)),
        StrToInt(ParamStr(4)),
        StrToInt(ParamStr(5)),
        StrToInt(ParamStr(6)),
        StrToInt(ParamStr(7)),
        StrToInt(ParamStr(8)),
        StrToInt(ParamStr(9)),
        StrToInt(ParamStr(10)),
        StrToInt(ParamStr(11)),
        StrToInt(ParamStr(12)),
        StrToInt(ParamStr(13)),
        StrToInt(ParamStr(14)),
        StrToInt(ParamStr(15)),
        StrToInt(ParamStr(16)),
        StrToInt(ParamStr(17)));
      WriteLn(out_buf);
    End
  Else If fn='DELETE_SA_REF_TRACE' Then
    Begin
      delete_sa_ref_trace_probe(StrToInt(ParamStr(2)));
      WriteLn(out_buf);
    End
  Else If fn='SA_DESTROY_TRACE' Then
    Begin
      sa_destroy_trace_probe(
        StrToInt(ParamStr(2)),
        StrToInt(ParamStr(3)));
      WriteLn(out_buf);
    End
  Else If fn='SA_DEF_TRACE' Then
    Begin
      sa_def_trace_probe(
        StrToInt(ParamStr(2)),
        StrToInt(ParamStr(3)),
        StrToInt(ParamStr(4)),
        StrToInt(ParamStr(5)),
        StrToInt(ParamStr(6)));
      WriteLn(out_buf);
    End
  Else If fn='SA_SAVE_TRACE' Then
    Begin
      sa_save_trace_probe(StrToInt(ParamStr(2)));
      WriteLn(out_buf);
    End
  Else If fn='SA_W_DEF_TRACE' Then
    Begin
      sa_w_def_trace_probe(
        StrToInt(ParamStr(2)),
        StrToInt(ParamStr(3)),
        StrToInt(ParamStr(4)),
        StrToInt(ParamStr(5)),
        StrToInt(ParamStr(6)));
      WriteLn(out_buf);
    End
  Else If fn='GSA_DEF_TRACE' Then
    Begin
      gsa_def_trace_probe(
        StrToInt(ParamStr(2)),
        StrToInt(ParamStr(3)),
        StrToInt(ParamStr(4)),
        StrToInt(ParamStr(5)));
      WriteLn(out_buf);
    End
  Else If fn='GSA_W_DEF_TRACE' Then
    Begin
      gsa_w_def_trace_probe(
        StrToInt(ParamStr(2)),
        StrToInt(ParamStr(3)),
        StrToInt(ParamStr(4)),
        StrToInt(ParamStr(5)));
      WriteLn(out_buf);
    End
  Else If fn='SA_RESTORE_TRACE' Then
    Begin
      sa_restore_trace_probe(StrToInt(ParamStr(2)));
      WriteLn(out_buf);
    End
  Else If fn='NEW_SAVE_LEVEL_TRACE' Then
    Begin
      new_save_level_trace_probe(
        StrToInt(ParamStr(2)),
        StrToInt(ParamStr(3)),
        StrToInt(ParamStr(4)),
        StrToInt(ParamStr(5)),
        StrToInt(ParamStr(6)),
        StrToInt(ParamStr(7)),
        StrToInt(ParamStr(8)),
        StrToInt(ParamStr(9)),
        StrToInt(ParamStr(10)));
      WriteLn(out_buf);
    End
  Else If fn='EQ_DESTROY_TRACE' Then
    Begin
      eq_destroy_trace_probe(
        StrToInt(ParamStr(2)),
        StrToInt(ParamStr(3)),
        StrToInt(ParamStr(4)));
      WriteLn(out_buf);
    End
  Else If fn='SAVE_FOR_AFTER_TRACE' Then
    Begin
      save_for_after_trace_probe(
        StrToInt(ParamStr(2)),
        StrToInt(ParamStr(3)),
        StrToInt(ParamStr(4)),
        StrToInt(ParamStr(5)),
        StrToInt(ParamStr(6)));
      WriteLn(out_buf);
    End
  Else If fn='EQ_SAVE_TRACE' Then
    Begin
      eq_save_trace_probe(
        StrToInt(ParamStr(2)),
        StrToInt(ParamStr(3)),
        StrToInt(ParamStr(4)),
        StrToInt(ParamStr(5)),
        StrToInt(ParamStr(6)),
        StrToInt(ParamStr(7)),
        StrToInt(ParamStr(8)),
        StrToInt(ParamStr(9)));
      WriteLn(out_buf);
    End
  Else If fn='EQ_DEFINE_TRACE' Then
    Begin
      eq_define_trace_probe(
        StrToInt(ParamStr(2)),
        StrToInt(ParamStr(3)),
        StrToInt(ParamStr(4)),
        StrToInt(ParamStr(5)),
        StrToInt(ParamStr(6)),
        StrToInt(ParamStr(7)),
        StrToInt(ParamStr(8)),
        StrToInt(ParamStr(9)));
      WriteLn(out_buf);
    End
  Else If fn='EQ_WORD_DEFINE_TRACE' Then
    Begin
      eq_word_define_trace_probe(
        StrToInt(ParamStr(2)),
        StrToInt(ParamStr(3)),
        StrToInt(ParamStr(4)),
        StrToInt(ParamStr(5)),
        StrToInt(ParamStr(6)),
        StrToInt(ParamStr(7)));
      WriteLn(out_buf);
    End
  Else If fn='GEQ_DEFINE_TRACE' Then
    Begin
      geq_define_trace_probe(
        StrToInt(ParamStr(2)),
        StrToInt(ParamStr(3)),
        StrToInt(ParamStr(4)),
        StrToInt(ParamStr(5)),
        StrToInt(ParamStr(6)));
      WriteLn(out_buf);
    End
  Else If fn='GEQ_WORD_DEFINE_TRACE' Then
    Begin
      geq_word_define_trace_probe(
        StrToInt(ParamStr(2)),
        StrToInt(ParamStr(3)),
        StrToInt(ParamStr(4)),
        StrToInt(ParamStr(5)));
      WriteLn(out_buf);
    End
  Else If fn='UNSAVE_TRACE' Then
    Begin
      unsave_trace_probe(StrToInt(ParamStr(2)));
      WriteLn(out_buf);
    End
  Else If fn='PRINT_WRITE_WHATSIT' Then
    Begin
      p := 100;
      mem_lh[p+1] := StrToInt(ParamStr(3));
      print_write_whatsit_probe(StrToInt(ParamStr(2)),p);
      WriteLn(out_buf);
    End
  Else If fn='PRINT_SA_NUM_CASE' Then
    Begin
      mem_b0[100] := StrToInt(ParamStr(2));
      mem_b1[100] := StrToInt(ParamStr(3));
      mem_rh[100] := StrToInt(ParamStr(4));
      mem_rh[101] := StrToInt(ParamStr(5));
      mem_b0[200] := StrToInt(ParamStr(6));
      mem_b1[200] := StrToInt(ParamStr(7));
      mem_rh[200] := StrToInt(ParamStr(8));
      mem_rh[201] := StrToInt(ParamStr(9));
      mem_b0[300] := StrToInt(ParamStr(10));
      print_sa_num_probe(100);
      WriteLn(out_buf);
    End
  Else If fn='PRINT_TWO' Then
    Begin
      print_two_probe(StrToInt(ParamStr(2)));
      WriteLn(out_buf);
    End
  Else If fn='PRINT_HEX' Then
    Begin
      print_hex_probe(StrToInt(ParamStr(2)));
      WriteLn(out_buf);
    End
  Else If fn='PRINT_ROMAN_INT' Then
    Begin
      right_text := ParamStr(3);
      str_start[261] := 0;
      LoadAsciiToIntArray(right_text,str_pool,0);
      print_roman_int_probe(StrToInt(ParamStr(2)));
      WriteLn(out_buf);
    End
  Else If fn='PRINT_INT' Then
    Begin
      print_int_probe(StrToInt(ParamStr(2)));
      WriteLn(out_buf);
    End
  Else If fn='PRINT_SCALED' Then
    Begin
      print_scaled_probe(StrToInt(ParamStr(2)));
      WriteLn(out_buf);
    End
  Else
    Halt(2);
End.
