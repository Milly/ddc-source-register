# ddc-source-register

[![license:MIT](https://img.shields.io/github/license/Milly/ddc-source-register?style=flat-square)](LICENSE)
[![Vim doc](https://img.shields.io/badge/doc-%3Ah%20ddc--source--register-orange?style=flat-square&logo=vim)][doc]

_ddc-source-register_ is a [ddc.vim] source plugin that collects text or words
from Vim registers.

## Features

- Collects values from registers, or extracts word from register values.
- Supports pasting multiple lines and control codes.
- Works in command-line mode.
- Highlights control codes (requires a highlight-capable UI like [ddc-ui-pum]).

## Installation

### Required

- [denops.vim]
- [ddc.vim]

[denops.vim]: https://github.com/vim-denops/denops.vim
[ddc.vim]: https://github.com/Shougo/ddc.vim

### Optional

- [ddc-ui-pum]
- [pum.vim]

[ddc-ui-pum]: https://github.com/Shougo/ddc-ui-pum
[pum.vim]: https://github.com/Shougo/pum.vim

## Configuration

See [`:help ddc-source-register`][doc] for details.

[doc]: doc/ddc-source-register.txt

```vim
call ddc#custom#patch_global('sources', ['register'])

" Optional: Set parameters, see `:help ddc-source-register-params`.
call ddc#custom#patch_global('sourceParms', #{
      \ register: #{
      \   registers: '0123456789"+*#:',
      \   maxAbbrWidth: 100,
      \   ctrlCharHlGroup: 'Comment'
      \   extractWords: v:true,
      \ }})

" Optional: Set `ddc-source-option-mark` to indicate the source name.
" Optional: Set `ddc-source-option-maxKeywordLength` to exclude too long text.
call ddc#custom#patch_global('sourceOptions', #{
      \ register: #{
      \   mark: 'Reg',
      \   maxKeywordLength: 100,
      \ }})
```
