#!/bin/bash

old_pwd="${PWD}"
for d in ./templates/*; do
    if [[ -d "${d}" ]]; then
        dirname="${d%/}"
        template_name=$(basename "${dirname}")
        cd "${dirname}" && zip -r "${old_pwd}/${template_name}.zip" .
        cd "${old_pwd}" || exit
        gh release upload ${{ steps.release.outputs.tag_name }} "${template_name}.zip"
    fi
done