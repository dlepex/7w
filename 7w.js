(function () {

  const _hashUrlParams = new URLSearchParams(window.location.hash.substring(1));

  // Settings:
  const wordsNum = _hashUrlParams.get("w") || 7
  const modeIsVisible = _hashUrlParams.get("mod") == 'v'
  const calcDelayMs = 100

  // Globals:
  const _el = document.body // for code completion to work only
  const dom = {
    sMode: _el, vMode: _el,
    hashedPane: _el, resultPane: _el, errPane: _el, err: _el,
    showBtn: _el, hashedStrSep: _el, result: _el, defVer: _el,
    pwdLength: _el, pwdInfo: _el, entropArgs: _el, genBtn: _el,
    copyBtn: _el, alg: _el, charset: _el, btnPane: _el, waitPane: _el
  }
  let calcInProgress = false

  document.addEventListener('DOMContentLoaded', () => {
    domResolveByID(dom)
    dom.wordInputs = domAppendWords(wordsNum)
    dom.form = document.querySelector('form')

    dom.secureInputs = dom.wordInputs.slice()  // inputs affected by mode change
    dom.secureInputs.push(dom.result)

    document.querySelectorAll('input[name="mode"]').forEach(e => e.onchange = onChangeMode)
    dom.wordInputs.forEach(e => e.addEventListener('focus', hideOutputs))
    dom.showBtn.addEventListener('click', onShowPassword)
    document.querySelector('#clearBtn').addEventListener('click', onClear)
    document.querySelector('#genBtn').addEventListener('click', onGenerate)
    document.querySelector('#copyBtn').addEventListener('click', onGenerateAndCopy)

    if (modeIsVisible) {
      dom.vMode.checked = true
      onChangeMode()
    }
  })

  function onClear() {
    hideOutputs()
    clearInputs()
  }

  function hideOutputs() {
    hide(dom.resultPane)
    hide(dom.errPane)
  }

  function clearInputs() {
    dom.hashedStrSep.value = ''
    dom.wordInputs.forEach(w => w.value = '')
    dom.result.value = ''
    dom.showBtn.textContent = 'show'
  }

  function onGenerate() {
    if (calcInProgress) return
    doGenerate()
  }

  function doGenerate(model) {
    model = model || {}
    model.err = checkValidity()
    if (!model.err) readInputs(model)
    if (!model.err) {
      calculate(model)
    } else {
      writeOutputs(model)
    }
  }

  function onGenerateAndCopy() {
    doGenerate({
      copyToClipboard: true
    })
  }

  function onShowPassword() {
    let r = dom.result
    if (r.type == 'password') {
      r.type = 'text'
      dom.showBtn.textContent = 'hide'
    } else {
      r.type = 'password'
      dom.showBtn.textContent = 'show'
    }
  }

  function isValid(el) {
    return el.validity.valid
  }

  function checkValidity() {
    if (dom.wordInputs.some(w => !isValid(w))) return 'a word should not contain whitespaces'
    if (!isValid(dom.hashedStrSep)) return 'wrong separator'
    if (!isValid(dom.pwdLength)) return 'the password length is too short'
  }

  function readInputs(model) {
    let exists
    let words = []
    for (let i = wordsNum - 1; i >= 0; i--) {
      let el = dom.wordInputs[i]
      let w = el.value.trim()
      if (el.value != w) {
        el.value = w
      }
      if (w) {
        exists = true
        words.push(w)
      } else if (exists) {
        model.err = 'words cannot have gaps'
        return model
      }
    }
    if (words.length < 3) {
      model.err = 'at least 3 words required'
      return model
    }
    let len = 0
    words.forEach(w => len += w.length)
    if (len < 10) {
      model.err = 'total words length must be not less than 10'
      return model
    }
    words.reverse()
    model.words = words.join(' ')
    model.sep = dom.hashedStrSep.value || ' '
    model.args = dom.entropArgs.value || ''
    model.reqLen = parseInt(dom.pwdLength.value)
    model.alg = getHashAlg()
    model.charset = getCharset()
    model.defVer = getDefaultsVer()
    return model
  }

  // Async. computation using setTimeout
  function calculate(model) {
    let args = getEntropArgs(model)
    startCalcProgress()
    setTimeout(
      () => {
        let start = new Date().getTime()
        // calling function registered by entrop wasm app:
        let pwd = window.Entrop_GenPassword(args)
        stopCalcProgress()

        let duration = new Date().getTime() - start
        if (pwd.startsWith('error: ')) {
          model.err = pwd
          writeOutputs(model)
          return
        }

        model.warn = `duration: ${duration}ms`
        if (pwd.length < model.reqLen) {
          model.warn += ', the result is shorter than required, length = ' + pwd.length
        }
        model.pwd = pwd
        writeOutputs(model)

        if (model.copyToClipboard) {
          copyToClipboard(model.pwd)
        }
      }, calcDelayMs)
  }

  // converts "model" to entrop cmd line args
  function getEntropArgs(model) {
    let args = model.args
    if (!args.includes('-a ')) {
      args += ' -a ' + model.alg
    }
    if (!args.includes('-c ')) {
      args += ' -c ' + model.charset
    }
    if (!args.includes('-d ')) {
      args += ' -d ' + model.defVer
    }
    if (!args.includes('-s ') && model.sep != ' ') {
      args += ' -s ' + model.sep
    }
    if (!args.includes('-l ')) {
      args += ' -l ' + model.reqLen
    }
    args += ' ' + model.words
    return args
  }

  function writeOutputs(model) {
    if (model.err) {
      hide(dom.resultPane)
      dom.err.textContent = model.err
      show(dom.errPane)
      return
    }
    hide(dom.pwdInfo)
    hide(dom.errPane)
    dom.result.value = model.pwd
    if (model.warn) {
      dom.pwdInfo.textContent = model.warn
      show(dom.pwdInfo)
    }
    show(dom.resultPane)
  }

  function onChangeMode() {
    let isStealth = dom.sMode.checked
    if (isStealth) { // v -> s
      dom.form.classList.replace('v-form', 's-form')
      changeInputType('text', 'password')
      hide(dom.hashedPane)
      show(dom.showBtn)
    } else { // s -> v
      onClear()
      dom.form.classList.replace('s-form', 'v-form')
      changeInputType('password', 'text')
      show(dom.hashedPane)
      hide(dom.showBtn)
    }
  }

  function changeInputType(from, to) {
    dom.secureInputs.forEach(e => {
      if (e.type == from) {
        if (from == 'password') {
          e.value = ''
        }
        e.type = to
      }
    })
  }

  function getHashAlg() { return dom.alg.value }
  function getCharset() { return dom.charset.value }
  function getDefaultsVer() { return dom.defVer.value }

  function copyToClipboard(text) {
    let textArea = document.createElement('textarea')
    textArea.value = text
    document.body.appendChild(textArea)
    textArea.focus()
    textArea.select()
    try {
      let ok = document.execCommand('copy')
      if (!ok) console.log('copyToClipboard-fail')
    } catch (err) {
      console.error('copyToClipboard-err', err)
    }
    document.body.removeChild(textArea)
  }


  function domAppendWords(num) {
    let wc = document.getElementById('wordsPane')
    let blueprint = wc.childNodes[1]
    let list = [blueprint.getElementsByTagName('input')[0]]
    let generate = idx => {
      let c = blueprint.cloneNode(true)
      let span = c.getElementsByClassName('word-num')[0]
      let input = c.getElementsByTagName('input')[0]
      list.push(input)
      span.textContent = idx + 1
      input.setAttribute('id', 'w' + idx)
      return c
    }
    for (let i = 1; i < num; i++) {
      let w = generate(i)
      wc.appendChild(w)
    }
    return list
  }

  function domResolveByID(dom) {
    Object.keys(dom).forEach(k => {
      let el = document.querySelector('#' + k)
      if (!el) throw new Error('el not found #' + k)
      dom[k] = el
    })
  }

  function hide(el) { el.classList.add('hidden') }
  function show(el) { el.classList.remove('hidden') }

  function startCalcProgress() {
    calcInProgress = true
    hide(dom.btnPane)
    show(dom.waitPane)
  }

  function stopCalcProgress() {
    calcInProgress = false
    hide(dom.waitPane)
    show(dom.btnPane)
  }
})()
