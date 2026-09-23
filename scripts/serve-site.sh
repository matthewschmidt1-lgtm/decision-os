#!/bin/sh
# Serve only the public website in production; tooling, tests and config stay private.
set -e
rm -rf dist && mkdir -p dist
cp -R index.html robots.txt sitemap.xml serve.json css js public dist/
exec npx serve -s dist -l "${PORT:-3000}"
