# ddc-source-register

[![license:MIT](https://img.shields.io/github/license/Milly/ddc-source-register?style=flat-square)](LICENSE)
[![Vim doc](https://img.shields.io/badge/doc-%3Ah%20ddc--source--register-orange?style=flat-square&logo=vim)](doc/ddc-source-register.txt)

Register (yanked text) source plugin for ddc.vim.

- Supports pasting of multiple lines and control codes.
- Supports pasting in command line mode.
- Supports control code highlighting. (Requires highlight capable UI)

## Required

- [denops.vim](https://github.com/vim-denops/denops.vim)
- [ddc.vim](https://github.com/Shougo/ddc.vim)

## Configuration

```vim
call ddc#custom#patch_global('sources', ['register'])

" Optional: Set parameters, see `:help ddc-source-register-params`.
call ddc#custom#patch_global('sourceParms', #{
      \ register: #{
      \   registers: '0123456789"+*#:',
      \   maxAbbrWidth: 100,
      \   ctrlCharHlGroup: 'Comment'
      \ }})

" Optional: Set `ddc-source-option-mark` to indicate the source name.
" Optional: Set `ddc-source-option-maxKeywordLength` to exclude too long text.
call ddc#custom#patch_global('sourceOptions', #{
      \ register: #{
      \   mark: 'Reg',
      \   maxKeywordLength: 100,
      \ }})
```
