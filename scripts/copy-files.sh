#!/bin/bash

### THIS SCRIPT COPIES BUILD FILES FROM temp-trustvc-website TO PUBLIC FOLDER FOR NETLIFY HOSTING

# Define the source and destination directories
WEBSITE_BUILD_DIR="./packages/temp-trustvc-website/dist"
CONTEXT_SOURCE_DIR="./packages/w3c-context/src/context"
PUBLIC_DIR="./public"
CONTEXT_DEST_DIR="./public/context"

# Remove the existing 'public' directory and its contents
rm -rf "$PUBLIC_DIR"

# Ensure the public directory exists
mkdir -p "$PUBLIC_DIR"

# Copy the built website files from dist/ to public/
if [ -d "$WEBSITE_BUILD_DIR" ]; then
  echo "Copying website build files from $WEBSITE_BUILD_DIR to $PUBLIC_DIR"
  cp -r "$WEBSITE_BUILD_DIR"/* "$PUBLIC_DIR/"
else
  echo "Warning: $WEBSITE_BUILD_DIR does not exist. Make sure to build the website first."
fi

# Ensure the context destination directory exists
mkdir -p "$CONTEXT_DEST_DIR"

# List of context files to copy
FILES=("attachments-context.json" "bill-of-lading.json" "bill-of-lading-carrier.json" "coo.json" "invoice.json" "promissory-note.json" "qrcode-context.json" "render-method-context.json" "render-method-context-v2.json" "transferable-records-context.json" "warehouse-receipt.json")

# Copy each context file
for FILE in "${FILES[@]}"; do
  if [ -f "$CONTEXT_SOURCE_DIR/$FILE" ]; then
    cp "$CONTEXT_SOURCE_DIR/$FILE" "$CONTEXT_DEST_DIR/"
  else
    echo "Warning: $CONTEXT_SOURCE_DIR/$FILE not found"
  fi
done

# Create netlify.toml with CORS headers
echo "[[headers]]
  for = \"/*\"
  [headers.values]
    Access-Control-Allow-Origin = \"*\"" > "$PUBLIC_DIR/netlify.toml"

# Output completion message
echo "Website build files copied to $PUBLIC_DIR"
echo "Context files copied to $CONTEXT_DEST_DIR"
