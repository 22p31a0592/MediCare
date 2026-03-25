/**
 * metro.config.js
 *
 * FIX: ENOENT error on Windows —
 *   "no such file or directory, stat '...\debugger-frontend\...\triangle-right.svg'"
 *
 * Root cause:
 *   Metro's file watcher on Windows stats SVG files inside
 *   @react-native/debugger-frontend as if they were JS modules.
 *   Windows path separators break the stat call → ENOENT crash.
 *
 * Two-part fix:
 *   1. svg added to assetExts → Metro treats it as static asset, never compiles it
 *   2. blockList → Metro never watches the debugger-frontend package at all
 */

const { getDefaultConfig, mergeConfig } = require('@react-native/metro-config');

const defaultConfig = getDefaultConfig(__dirname);

const config = {
  resolver: {
    assetExts: [...defaultConfig.resolver.assetExts, 'svg'],
    sourceExts: defaultConfig.resolver.sourceExts.filter((e) => e !== 'svg'),
    blockList: [
      // Block both forward-slash and back-slash Windows paths
      /node_modules[/\\]@react-native[/\\]debugger-frontend[/\\].*/,
    ],
  },
};

module.exports = mergeConfig(defaultConfig, config);