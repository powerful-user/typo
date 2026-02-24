#!/usr/bin/env bash
set -euo pipefail

REPO="https://github.com/powerful-user/typo.git"
INSTALL_DIR="${TYPO_INSTALL_DIR:-$HOME/.typo-cli}"

echo "Installing typo CLI..."

# Check for required tools
for cmd in git node npm; do
  if ! command -v "$cmd" &>/dev/null; then
    echo "Error: $cmd is required but not installed." >&2
    exit 1
  fi
done

# Check Node.js version (need 18+)
NODE_MAJOR=$(node -e "console.log(process.versions.node.split('.')[0])")
if [ "$NODE_MAJOR" -lt 18 ]; then
  echo "Error: Node.js 18+ is required (found v$(node -v))" >&2
  exit 1
fi

# Clone or update
if [ -d "$INSTALL_DIR" ]; then
  echo "Updating existing installation..."
  git -C "$INSTALL_DIR" pull --ff-only
else
  git clone "$REPO" "$INSTALL_DIR"
fi

# Build
cd "$INSTALL_DIR"
npm install --ignore-scripts
npm run build

# Create symlink in a directory on PATH
BIN_DIR="${BIN_DIR:-$HOME/.local/bin}"
mkdir -p "$BIN_DIR"
ln -sf "$INSTALL_DIR/dist/cli.js" "$BIN_DIR/typo"

# Check if BIN_DIR is on PATH
if [[ ":$PATH:" != *":$BIN_DIR:"* ]]; then
  echo ""
  echo "Add this to your shell profile (~/.zshrc or ~/.bashrc):"
  echo ""
  echo "  export PATH=\"$BIN_DIR:\$PATH\""
  echo ""
fi

echo "Installed typo to $BIN_DIR/typo"
