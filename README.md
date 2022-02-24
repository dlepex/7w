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
  * My tests show that on (some) Android devices Firefox has 2x faster wasm execution than Chrome.
  * You can add 7w to your home-screen (from browser menu), and use it almost as conveniently as a typical mobile app.

### Extra params description

Changing any extra parameter will result in getting different password.

* _charset_ defines characters that a password can contain (entrop: -c)
* _algorithm_ that is used to generate password (entrop: -a)
* _separator_ to join words into string, that is then passed to algorithm
* _defaults version_ defines preset of algorithm parameters such as number of iterations and salt (entrop: -d)

### UI tweaks

**7w** supports URL hash params to change UI
* _w_=number - changes number of word inputs (default is 7)
* mod=v - changes initial mode to visible (default is stealth)

Example:
https://dlepex.github.io/7w/index.html#w=10&mod=v

### Security hints

* At least 1 word of sequence should be incorrect i.e. nondictionary
* You may use the generated string only as a part of your real password (prefix, middle or postfix).
* Do not use deprecated `old` algorithms (for backward compat. only)
