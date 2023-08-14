#!/bin/bash

dir="./templates"

# Check if the templates directory exists
if [[ ! -d "${dir}" ]]; then
    echo "Directory ${dir} does not exist."
    exit 1
fi

cd "${dir}" || exit 2

# Loop over the directories inside ./templates
for d in */; do
    # Check if it's really a directory (just to be safe)
    if [[ -d "${d}" ]]; then
        # Remove the trailing slash to get the directory name
        dirname="${d%/}"
        # Zip the directory into an archive
        zip -r "${dirname}.zip" "${dirname}"
    fi
done

echo "All directories have been zipped."
