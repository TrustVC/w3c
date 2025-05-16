#!/bin/bash

### THIS SCRIPT IS NEEDED TO HOST THE CONTEXT FILES ON "https://trustvc.io/context/<file-name>" THROUGH NETLIFY

# Define the source and destination directories
SOURCE_DIR="./packages/w3c-context/src/context"
DEST_DIR="./public/context"

# Remove the existing 'public' directory and its contents
rm -rf ./public

# Ensure the destination directory exists
mkdir -p "$DEST_DIR"

# List of files to copy
FILES=("attachments-context.json" "bill-of-lading.json" "invoice.json" "promissory-note.json" "qrcode-context.json" "render-method-context.json" "transferable-records-context.json")

# Copy each file
for FILE in "${FILES[@]}"; do
  cp "$SOURCE_DIR/$FILE" "$DEST_DIR/"
done

echo "[[headers]]
  for = \"/*\"
  [headers.values]
    Access-Control-Allow-Origin = \"*\"" > $DEST_DIR/netlify.toml

# Optional: output a message when done
echo "Files have been copied to $DEST_DIR"
