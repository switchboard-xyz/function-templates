#!/bin/bash

for d in ./templates/*; do
  if [[ -d "${d}" ]]; then
      dirname="${d%/}"
      template_name=$(basename "${dirname}")
      zip -r "${template_name}.zip" "${dirname}"
      gh release upload ${{ steps.release.outputs.upload_url }} ${dirname}.zip
  fi
done