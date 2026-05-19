#!/usr/bin/env bash

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PUBLIC_UNITS_DIR="$SCRIPT_DIR/public/units"
TMP_DIR="$(mktemp -d)"

cleanup() {
  rm -rf "$TMP_DIR"
}
trap cleanup EXIT

download_and_extract() {
  local archive_url="$1"
  local archive_path="$2"
  local extract_dir="$3"

  echo "Downloading: $archive_url"
  curl -L --fail --silent --show-error "$archive_url" -o "$archive_path"

  echo "Extracting: $archive_path"
  unzip -q "$archive_path" -d "$extract_dir"
}

copy_unit_directories() {
  local source_parent_dir="$1"

  if [[ ! -d "$source_parent_dir" ]]; then
    echo "Source directory not found: $source_parent_dir" >&2
    exit 1
  fi

  local dir
  for dir in "$source_parent_dir"/*; do
    if [[ -d "$dir" ]]; then
      local unit_name
      unit_name="$(basename "$dir")"
      local dest_dir="$PUBLIC_UNITS_DIR/$unit_name"
      echo "Copying unit: $unit_name"
      rm -rf "$dest_dir"
      cp -R "$dir" "$dest_dir"
    fi
  done
}

mkdir -p "$PUBLIC_UNITS_DIR"
rm -rf "$PUBLIC_UNITS_DIR"
mkdir -p "$PUBLIC_UNITS_DIR"

CUSTOM_ARCHIVE="$TMP_DIR/wus-custom-units-bundles.zip"
CUSTOM_EXTRACT_DIR="$TMP_DIR/wus-custom-units"
download_and_extract \
  "https://github.com/yahiro07/wus-custom-units/archive/refs/heads/bundles.zip" \
  "$CUSTOM_ARCHIVE" \
  "$CUSTOM_EXTRACT_DIR"
copy_unit_directories \
  "$CUSTOM_EXTRACT_DIR/wus-custom-units-bundles/units"

WUS_ARCHIVE="$TMP_DIR/webaudio-unit-system-load-remote-units.zip"
WUS_EXTRACT_DIR="$TMP_DIR/webaudio-unit-system"
download_and_extract \
  "https://github.com/yahiro07/webaudio-unit-system/archive/refs/heads/load-remote-units.zip" \
  "$WUS_ARCHIVE" \
  "$WUS_EXTRACT_DIR"
copy_unit_directories \
  "$WUS_EXTRACT_DIR/webaudio-unit-system-load-remote-units/units/dist/dev"

echo "Units copied to: $PUBLIC_UNITS_DIR"
