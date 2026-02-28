/**
 * App/ModalRenderer.js
 * ─────────────────────────────────────────────────────────
 * Renders all application modals in one place.
 * Keeps App.js JSX clean — no modal conditionals scattered.
 * ─────────────────────────────────────────────────────────
 */

import React from 'react';
import { NamePromptModal } from '../components/modals/NamePromptModal/index';
import { EditNameModal } from '../components/modals/EditNameModal/index';
import { AddPillModal } from '../components/modals/AddPillModal/index';
import { SettingsModal } from '../components/modals/SettingsModal/index';

export function ModalRenderer({
  // Visibility flags
  showNamePrompt,
  showEditName,
  showAddPill,
  showSettings,
  // Data
  user,
  // Handlers
  onSetName,
  onUpdateName,
  onAddPill,
  onReset,
  onCloseEditName,
  onCloseAddPill,
  onCloseSettings,
}) {
  return (
    <>
      {/* First-time name setup */}
      {showNamePrompt && <NamePromptModal onSubmit={onSetName} />}

      {/* Edit existing name */}
      {showEditName && user && (
        <EditNameModal
          currentName={user.name}
          onClose={onCloseEditName}
          onSubmit={onUpdateName}
        />
      )}

      {/* Add medication */}
      {showAddPill && (
        <AddPillModal onClose={onCloseAddPill} onAdd={onAddPill} />
      )}

      {/* Settings */}
      {showSettings && (
        <SettingsModal
          visible={showSettings}
          onClose={onCloseSettings}
          onReset={onReset}
          user={user}
        />
      )}
    </>
  );
}