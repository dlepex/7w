(function (CryptoJS) {

	const wordsCount = 7;
	let dom;
	let model;

	document.addEventListener("DOMContentLoaded", function () {
		let _el = document.body; // for the sake of code completion 
		dom = { 
			sMode: _el,  hashedPane: _el, resultPane: _el, errPane: _el, err: _el,
			showBtn: _el,  hashedStrSep: _el, result: _el, hashedStr: _el, pwdLength: _el,
		}
		domResolveByID(dom)
		dom.wordInputs = domAppendWords(wordsCount)
		dom.form = document.querySelector("form")

		dom.secureInputs = dom.wordInputs.slice()  // inputs affected by mode change
		dom.secureInputs.push(dom.result)
	
		document.querySelectorAll('input[name="mode"]').forEach(e => e.onchange = onChangeMode)
		dom.wordInputs.forEach(e => e.addEventListener('focus', hideOutputs))
		dom.showBtn.addEventListener("click", onShowPassword);
		document.querySelector('#clearBtn').addEventListener("click", onClear);
		document.querySelector('#genBtn').addEventListener("click", onGenerate);
		document.querySelector('#copyBtn').addEventListener("click", onGenerateAndCopy);
	});

	function onClear() {
		model = undefined
		hideOutputs()
		clearInputs();
	}

	function hideOutputs() {
		hide(dom.resultPane)
		hideErrPane()
	}

	function clearInputs() {
		dom.hashedStrSep.value = ""
		dom.wordInputs.forEach(w => w.value = "")
		dom.result.value = ""
		dom.hashedStr.value = ""
		dom.showBtn.textContent = "show"
	}

	function onGenerate() {
		model = {}
		model.err = checkValidity();
		if(!model.err) {
			readInputs(model);
		}
		showOutput(model)
	}

	function onGenerateAndCopy() {
		onGenerate()
		if (!model.err) {
			copyToClipboard(model.pwd)
		}
	}

	function onShowPassword() {
		let r = dom.result
		if (r.type == "password") {
			r.type = "text"
			dom.showBtn.textContent = "hide"
		} else {
			r.type = "password"
			dom.showBtn.textContent = "show"
		}
	}

	function isValid(el) {
		return el.validity.valid
	}

	function checkValidity() {
		if (dom.wordInputs.some(w => !isValid(w))) {
			return "a word should not contain whitespaces"
		}
		if (!isValid(dom.hashedStrSep)) {
			return "wrong separator"
		}
		if (!isValid(dom.pwdLength)) {
			return "the password length must be in range 10..100"
		}
	}

	function readInputs(model) {
		let exists;
		let words = []
		let sep = dom.hashedStrSep.value || " ";
		for (let i = wordsCount - 1; i >= 0; i--) {
			let el = dom.wordInputs[i]
			let w = el.value.trim()
			if (el.value != w) {
				el.value = w
			}
			if (w) {
				exists = true
				words.push(w)
			} else if (exists) {
				model.err = "words cannot have gaps";
				return;
			}
		}
		if (words.pwdLength < 3) {
			model.err = "at least 3 words required"
			return
		}
		let len = 0
		words.forEach(w => len += w.pwdLength)
		if (len < 10) {
			model.err = "total words length must be not less than 10"
			return
		}
		words.reverse()
		model.wordInputsords = words
		model.hashedStr = words.join(sep)
	}


	function showOutput(model) {
		if (model.err) {
			hide(dom.resultPane)
			show(dom.errPane)
			dom.err.textContent = model.err;
			return
		}
		hideErrPane()
		show(dom.resultPane)
		dom.hashedStr.value = model.hashedStr
		model.pwd = genPassword(model.hashedStr).slice(0, dom.pwdLength.value | 0)
		dom.result.value = model.pwd
	}

	function hideErrPane() {
		hide(dom.errPane)
		dom.err.textContent = ""
	}

	function onChangeMode() {
		let isStealth = dom.sMode.checked
		if (isStealth) { // s -> v
			dom.form.classList.replace("v-form", "s-form")
			changeInputType("text", "password")
			hide(dom.hashedPane)
			show(dom.showBtn)
		} else {
			// v -> s
			onClear()
			dom.form.classList.replace("s-form", "v-form")
			changeInputType("password", "text")
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

	function getHashAlg() {
		let id = document.querySelector('input[name="alg"]:checked').id
		switch (id) {
			case 'md5Alg': return CryptoJS.MD5;
			case 'sha1Alg': return CryptoJS.SHA1;
			case 'sha256Alg': return CryptoJS.SHA256;
		}
		throw new Error("unknown alg: " + id)
	}

	function removeNonAlphaNumeric(s) {
		return s.replace(/[\W_]+/g, '');
	}

	function base64(s) {
		return CryptoJS.enc.Base64.stringify(s)
	}

	function hashFunc(str) {
		return getHashAlg()(str)
	}

	function genPassword(str) {
		return removeNonAlphaNumeric(base64(hashFunc(str)))
	}

	function copyToClipboard(text) {
		let textArea = document.createElement("textarea");
		textArea.value = text;
		document.body.appendChild(textArea);
		textArea.focus();
		textArea.select();
		try {
			let ok = document.execCommand('copy');
			if (!ok) {
				console.log('copyToClipboard not ok');
			}
		} catch (err) {
			console.error('copyToClipboard-err', err);
		}
		document.body.removeChild(textArea)
	}


	function domAppendWords(num) {
		num = num || 7
		let wc = document.getElementById("wordsPane")
		let blueprint = wc.childNodes[1]
		let list = [blueprint.getElementsByTagName("input")[0]]
		let generate = (idx) => {
			let c = blueprint.cloneNode(true);
			let span = c.getElementsByClassName("word-num")[0]
			let input = c.getElementsByTagName("input")[0]
			list.push(input)
			span.textContent = idx + 1
			input.setAttribute("id", "w" + idx)
			return c
		}
		for (let i = 1; i < num; i++) {
			let w = generate(i)
			wc.appendChild(w)
		}
		return list
	}

	function domResolveByID(dom) {
		Object.keys(dom).forEach((k) => {
			let el = document.querySelector('#' + k)
			if (!el) throw new Error('el not found #' + k)
			dom[k] = el;
		})
	}

	function hide(el) {
		el.classList.add('hidden')
	}

	function show(el) {
		el.classList.remove('hidden')
	}

})(this.CryptoJS)
