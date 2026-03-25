/**
 * modals/AddPillModal/index.js
 * Updated: passes alarmTimes array props to AlarmSection.
 */

import React from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  Modal, ScrollView, StyleSheet,
} from 'react-native';
import { X, ChevronDown } from 'lucide-react-native';

import { useAddPillForm }    from './useAddPillForm';
import { AlarmSection }      from './components/AlarmSection';
import { FREQUENCY_OPTIONS } from './constants';

export function AddPillModal({ onClose, onAdd }) {
  const form = useAddPillForm();

  const handleSubmit = () => {
    if (!form.isFormValid) return;
    onAdd(form.buildPillData());
  };

  return (
    <Modal visible animationType="slide" transparent>
      <View style={styles.overlay}>
        <View style={styles.modal}>

          <View style={styles.header}>
            <Text style={styles.title}>Add Medication</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <X size={22} color="#6b7280" />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>

            <FormLabel text="Medication Name *" />
            <TextInput style={styles.input} placeholder="e.g., Aspirin"
              value={form.name} onChangeText={form.setName} placeholderTextColor="#9ca3af" />

            <FormLabel text="Dosage *" />
            <TextInput style={styles.input} placeholder="e.g., 100mg"
              value={form.dosage} onChangeText={form.setDosage} placeholderTextColor="#9ca3af" />

            <View style={styles.row}>
              <View style={styles.halfLeft}>
                <FormLabel text="Qty (pills) *" />
                <TextInput style={styles.input} placeholder="30" value={form.quantity}
                  onChangeText={form.setQuantity} keyboardType="numeric" placeholderTextColor="#9ca3af" />
              </View>
              <View style={styles.halfRight}>
                <FormLabel text="Total Days" />
                <TextInput style={styles.input} placeholder="30" value={form.totalDays}
                  onChangeText={form.setTotalDays} keyboardType="numeric" placeholderTextColor="#9ca3af" />
              </View>
            </View>

            <FormLabel text="Frequency *" />
            <TouchableOpacity
              style={styles.dropdownBtn}
              onPress={() => {
                form.setShowFrequencyPicker(!form.showFrequencyPicker);
                form.setShowTonePicker(false);
              }}
            >
              <Text style={[styles.dropdownText, !form.frequency && styles.placeholder]}>
                {form.frequency || 'Select frequency'}
              </Text>
              <ChevronDown size={18} color="#6b7280" />
            </TouchableOpacity>

            {form.showFrequencyPicker && (
              <View style={styles.dropdownList}>
                {FREQUENCY_OPTIONS.map((opt) => (
                  <TouchableOpacity key={opt}
                    style={[styles.dropdownItem, form.frequency === opt && styles.dropdownItemSelected]}
                    onPress={() => { form.setFrequency(opt); form.setShowFrequencyPicker(false); }}>
                    <Text style={[styles.dropdownItemText, form.frequency === opt && styles.dropdownItemTextSelected]}>
                      {opt}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}

            {/* ── Alarm section: N pickers based on frequency ── */}
            <View style={styles.alarmWrapper}>
              <AlarmSection
                enableAlarm={form.enableAlarm}
                setEnableAlarm={form.setEnableAlarm}
                alarmTimes={form.alarmTimes}
                openPickerIdx={form.openPickerIdx}
                setOpenPickerIdx={form.setOpenPickerIdx}
                onTimeChange={form.onTimeChange}
                formatTime={form.formatTime}
                selectedTone={form.selectedTone}
                setSelectedTone={form.setSelectedTone}
                showTonePicker={form.showTonePicker}
                setShowTonePicker={form.setShowTonePicker}
                frequency={form.frequency}
              />
            </View>

            <FormLabel text="Notes (Optional)" />
            <TextInput style={[styles.input, styles.textArea]}
              placeholder="Additional instructions or reminders"
              value={form.notes} onChangeText={form.setNotes}
              multiline numberOfLines={3} placeholderTextColor="#9ca3af" />

            <View style={styles.btnRow}>
              <TouchableOpacity style={styles.cancelBtn} onPress={onClose}>
                <Text style={styles.cancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.submitBtn, !form.isFormValid && styles.submitDisabled]}
                onPress={handleSubmit}>
                <Text style={styles.submitText}>Add Medication</Text>
              </TouchableOpacity>
            </View>

          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

function FormLabel({ text }) {
  return <Text style={styles.label}>{text}</Text>;
}

const styles = StyleSheet.create({
  overlay:  { flex: 1, backgroundColor: 'rgba(0,0,0,0.45)', justifyContent: 'flex-end' },
  modal:    { backgroundColor: '#fff', borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 20, maxHeight: '92%' },
  header:   { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18, paddingBottom: 14, borderBottomWidth: 1, borderBottomColor: '#f3f4f6' },
  title:    { fontSize: 19, fontWeight: '700', color: '#111827' },
  closeBtn: { padding: 4 },
  row:      { flexDirection: 'row' },
  halfLeft:  { flex: 1, marginRight: 8 },
  halfRight: { flex: 1 },
  label:    { fontSize: 13, fontWeight: '600', color: '#374151', marginBottom: 6, marginTop: 4 },
  input:    { borderWidth: 1, borderColor: '#d1d5db', borderRadius: 9, paddingHorizontal: 12, paddingVertical: 11, fontSize: 15, color: '#111827', backgroundColor: '#f9fafb', marginBottom: 10 },
  textArea: { height: 75, textAlignVertical: 'top' },
  placeholder: { color: '#9ca3af' },
  dropdownBtn: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderWidth: 1, borderColor: '#d1d5db', borderRadius: 9, paddingHorizontal: 12, paddingVertical: 11, backgroundColor: '#f9fafb', marginBottom: 10 },
  dropdownText: { fontSize: 15, color: '#111827' },
  dropdownList: { borderWidth: 1, borderColor: '#d1d5db', borderRadius: 9, marginBottom: 10, backgroundColor: '#fff', overflow: 'hidden' },
  dropdownItem:  { padding: 12, borderBottomWidth: 1, borderBottomColor: '#f3f4f6' },
  dropdownItemSelected:     { backgroundColor: '#eff6ff' },
  dropdownItemText:         { fontSize: 14, color: '#111827' },
  dropdownItemTextSelected: { color: '#1d4ed8', fontWeight: '600' },
  alarmWrapper: { marginVertical: 4 },
  btnRow:    { flexDirection: 'row', gap: 10, marginTop: 8, marginBottom: 20 },
  cancelBtn: { flex: 1, padding: 14, borderRadius: 9, borderWidth: 1, borderColor: '#d1d5db', alignItems: 'center', backgroundColor: '#fff' },
  cancelText: { fontSize: 15, fontWeight: '600', color: '#6b7280' },
  submitBtn:  { flex: 2, padding: 14, borderRadius: 9, backgroundColor: '#1d4ed8', alignItems: 'center' },
  submitDisabled: { backgroundColor: '#93c5fd' },
  submitText: { fontSize: 15, fontWeight: '700', color: '#fff' },
});