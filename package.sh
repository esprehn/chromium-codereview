#/bin/bash

# Clean up the old build.
rm -fr build

# Compile the app.
mkdir -p build/ui/components
# Can't use --strip otherwise there's lots of layout bugs. Ex. templates with
# <img> <a>Link here</a> end up with the link against the image and templates
# that repeat links like <template> <a> link </a> </template> end up with all
# the links against each other.
vulcanize --inline -o build/ui/components/cr-app.html ui/components/cr-app.html

# Copy all extension files.
js_files=(
    manifest.json
    background.js
    ui/base.js
    ui/dom.js
    ui/main.js
    ui/resources.js
    ui/style.css
    bower_components/platform/platform.js
)
image_files=`find ui icons -name *.jpg -o -name *.jpeg -o -name *.gif -o -name *.png`
all_files="${js_files[@]} ${image_files[@]}"

for file in $all_files
do
    mkdir -p build/`dirname $file`
    cp $file build/$file
done

# Package into a zip.
rm -f ChromeReview.zip
cd build
ls | zip -9 -r ../ChromeReview.zip -@
