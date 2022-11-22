function! ddc_source_register#_bulk_getreginfo(arglist) abort
  " Session error in denops when returning the result of getreginfo().
  " Filter 0x80 which is special key and that the register is for recording.
  return (a:arglist)
  \ ->map({ _, regname -> #{
  \   regname: regname,
  \   regcontents: getreg(regname, 1, 1),
  \   regtype: getregtype(regname),
  \   isunnamed: v:false,
  \ }})
  \ ->filter({ _, info ->
  \   len(info.regcontents) > 0 && match(info.regcontents, '[\x80]') < 0
  \ })
endfunction

function! ddc_source_register#_insert(lnum, lines, curpos) abort
  try
    call s:insert(a:lnum, a:lines, a:curpos)
  catch /^Vim.*:E565:/
    call s:feed_insert(a:lnum, a:lines, a:curpos)
  endtry
endfunction

function! s:insert(lnum, lines, curpos) abort
  call setline(a:lnum, a:lines[0])
  if len(a:lines) > 1
    call append(a:lnum, a:lines[1:])
  endif
  call setpos('.', a:curpos)
endfunction

function! s:feed_insert(lnum, lines, curpos) abort
  let s:insert_data = {
  \ 'lnum': a:lnum,
  \ 'lines': a:lines,
  \ 'curpos': a:curpos,
  \}
  call feedkeys("\<Cmd>call ddc_source_register#_apply_insert()\<CR>" .. v:char, 'in')
  call feedkeys("\<Ignore>", 'n')
  let v:char = ''
endfunction

function! ddc_source_register#_apply_insert() abort
  let s = get(s:, 'insert_data', {})
  if !empty(s)
    call s:insert(s.lnum, s.lines, s.curpos)
    unlet s:insert_data
  endif
endfunction
