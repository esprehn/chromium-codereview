#/bin/bash

rm ChromeReview.zip
ls | grep -v node_modules | grep -v npm-debug.log | grep -v package.sh | zip -9 -r ChromeReview.zip -@
