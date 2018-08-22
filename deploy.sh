#!/bin/bash


pages=../dlepex-github-io
dest=$pages/7w
when=`date +%Y-%m-%d.%H:%M`

cp ./**/*.html ./**/*.js ./**/*.css $dest
cd $pages
git  add .
git  commit -m "deploy 7w at $when"
git  push
