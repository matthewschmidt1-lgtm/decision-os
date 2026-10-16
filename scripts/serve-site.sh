#!/bin/sh
# Serve only the public website in production; tooling, tests and config stay private.
set -e
rm -rf dist && mkdir -p dist
cp -R index.html robots.txt sitemap.xml serve.json css js public dist/
# The one rendered proposal page the footer's M links to; the rest of docs/ stays private.
mkdir -p dist/docs && cp docs/module3-proposal-v3.html dist/docs/
exec npx serve -s dist -l "${PORT:-3000}"
