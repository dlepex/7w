## 7w

https://dlepex.github.io/7w

*7 words* is the password generator. It converts a mnemonic sequence of words into an
unreadable  & unguessable password.
*7w* doesn't store or send your data to third party. **It is
purely browser-side calculation facility.** 

### Algorithm

The password is calculated as follows:
```javascript
removeNonAlphaNumeric(base64(hashFunc(str))).slice(0, password_length)
// hashFunc is one of: MD5, SHA1, SHA256
// str - is the concatenated sequence of words, with default separator == 1 space
```

### Security hints

* At least 1 word of sequence should be incorrect i.e. nondictionary
* You may use the generated string only as a part of your real password (prefix, middle or postfix).

### Implementation notes


* CryptoJS is the only dependency (it was minified, and cipher parts were purged to reduce size)
* Doesn't work in elderly browsers
* Mobile browsers may have some quirks but do work overall
