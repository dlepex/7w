#!/bin/bash


pages=../dlepex-github-io
dest=$pages/7w

cp ./**/*.html ./**/*.js ./**/*.css $dest
cd @pages

git  add .
git commit -m "deploy 7w"
git  push
