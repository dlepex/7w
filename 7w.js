(function (CryptoJS) {

	const wordsCount = 7;
	// dom elements cache
	let dom = {}
	let model;

	document.addEventListener("DOMContentLoaded", function () {
		dom.wordInputs = []
		domAppendWords(wordsCount)
		document.querySelectorAll('input[name="mode"]').forEach(e => {
			e.onchange = onChangeMode
		})
		dom.wordInputs.forEach(e => {
			e.addEventListener('focus', () => {
				hideOutputs()
			})
		})
		dom.smode = document.querySelector("#s-mode")
		dom.md5 = document.querySelector("#md5-alg")
		dom.form = document.querySelector("form")
		dom.hashedPane = document.querySelector("#hashed-pane")
		dom.resultPane = document.querySelector("#result-pane")
		dom.errPane = document.querySelector("#err-pane")
		dom.err = document.querySelector("#err")
		dom.secureInputs = document.querySelectorAll('input')
		dom.showBtn = document.querySelector('#show-btn');

		dom.sep = document.querySelector("#sep")
		dom.result = document.querySelector("#result")
		dom.str = document.querySelector("#str")
		dom.len = document.querySelector("#length")

		document.querySelector('#clear-btn').addEventListener("click", onClear);
		document.querySelector('#gen-btn').addEventListener("click", onGenerate);
		dom.showBtn.addEventListener("click", onShowPassword);
		document.querySelector('#copy-btn').addEventListener("click", onGenerateAndCopy);
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
		dom.sep.value = ""
		dom.wordInputs.forEach(w => w.value = "")
		dom.result.value = ""
		dom.str.value = ""
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
		if (!isValid(dom.sep)) {
			return "wrong separator"
		}
		if (!isValid(dom.len)) {
			return "the password length must be in range 10..100"
		}
		return null
	}

	function readInputs(model) {
		let exists;
		let words = []
		let sep = dom.sep.value || " ";
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
		if (words.length < 3) {
			model.err = "at least 3 words required"
			return
		}
		let len = 0
		words.forEach(w => len += w.length)
		if (len < 10) {
			model.err = "total words length must be not less than 10"
			return
		}
		words.reverse()
		model.wordInputsords = words
		model.str = words.join(sep)
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
		dom.str.value = model.str
		model.pwd = genPassword(model.str).slice(0, dom.len.value | 0)
		dom.result.value = model.pwd
	}

	function hideErrPane() {
		hide(dom.errPane)
		dom.err.textContent = ""
	}


	function onChangeMode() {
		let isStealth = dom.smode.checked
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
		switch (document.querySelector('input[name="alg"]:checked').id) {
			case 'md5-alg': return CryptoJS.MD5;
			case 'sha1-alg': return CryptoJS.SHA1;
			case 'sha256-alg': return CryptoJS.SHA256;
		}
	}

	function domAppendWords(num) {
		num = num || 7
		let wc = document.getElementById("words-container")
		let blueprint = wc.childNodes[1]
		dom.wordInputs.push(blueprint.getElementsByTagName("input")[0])
		let generate = (idx) => {
			let c = blueprint.cloneNode(true);
			let span = c.getElementsByClassName("word-num")[0]
			let input = c.getElementsByTagName("input")[0]
			dom.wordInputs.push(input)
			span.textContent = idx + 1
			input.setAttribute("id", "w" + idx)
			return c
		}
		for (let i = 1; i < num; i++) {
			let w = generate(i)
			wc.appendChild(w)
		}
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
		var textArea = document.createElement("textarea");
		textArea.value = text;
		document.body.appendChild(textArea);
		textArea.focus();
		textArea.select();
		try {
			var successful = document.execCommand('copy');
			var msg = successful ? 'successful' : 'unsuccessful';
			console.log('copyToClipboard: ' + msg);
		} catch (err) {
			console.error('copyToClipboard-err', err);
		}
	
		document.body.removeChild(textArea);
	}


	function hide(el) {
		let d = el.style.display
		if (d == "none") {
			return
		}
		el._was_display_=d
		el.style.display = "none"
	}

	function show(el) {
		if (el.style.display=="none") {
			el.style.display = el._was_display_ || "inherit"
			delete el._was_display_
		}
	}

})(this.CryptoJS)
