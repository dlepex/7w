## 7w

https://dlepex.github.io/7w

*7 words* is the password generator. It converts a mnemonic sequence of words into an
unreadable  & unguessable password.
*7w* doesn't store or send your data to third party. **It is
purely browser-side calculation facility.**

### Implementation notes

* https://github.com/dlepex/entrop (CLI tool, compiled to WASM) is used to generate a password
  * 7w is just a UI wrapper for _entrop_
  * use `cmdline` input to specify/override _entrop_ command line params directly
* It works only in sufficiently modern browsers that support WASM.
* Mobile browsers may have some quirks but do work overall
  * Some browsers are slow (in particular for argon2), it is recommended to try some other browser if your current is slow.

### Security hints

* At least 1 word of sequence should be incorrect i.e. nondictionary
* You may use the generated string only as a part of your real password (prefix, middle or postfix).
* Do not use deprecated `old` algorithms (for backward compat. only)
