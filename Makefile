deploy:
	./deploy.sh
serve:
	python -m http.server 8000
upgrade:
	cp -rf ../../godev/entrop/entrop.wasm .
