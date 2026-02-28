/**
 * App/styles/appStyles.js
 * ─────────────────────────────────────────────────────────
 * StyleSheet for the root App component.
 * Keeping styles in a separate file keeps App.js clean.
 * ─────────────────────────────────────────────────────────
 */

import { StyleSheet } from 'react-native';

export const appStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f3f4f6',
  },
  content: {
    flex: 1,
  },

  // ── Loading screen ──────────────────────────────────────
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f3f4f6',
    padding: 20,
  },
  loadingTitle: {
    fontSize: 30,
    fontWeight: '800',
    color: '#111827',
    marginTop: 16,
    marginBottom: 24,
    letterSpacing: 0.3,
  },
  loader: {
    marginTop: 16,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 14,
    color: '#6b7280',
    fontWeight: '500',
  },
});