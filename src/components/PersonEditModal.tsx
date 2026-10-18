"use client";

import React, { useState } from "react";
import { PersonData } from "@/types";
import { X, Save, UserPlus, Sparkles, Heart } from "lucide-react";

interface PersonEditModalProps {
  person: PersonData | null; // If null, creating new person
  allPersons: PersonData[];
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: Partial<PersonData> & { targetPersonId?: string; relationshipLabel?: string }) => Promise<void>;
}

export default function PersonEditModal({
  person,
  allPersons,
  isOpen,
  onClose,
  onSave,
}: PersonEditModalProps) {
  const isEditing = Boolean(person);

  const [name, setName] = useState(person?.name || "");
  const [relation, setRelation] = useState(person?.relation || "");
  const [birthDate, setBirthDate] = useState(
    person?.birthDate ? person.birthDate.split("T")[0] : ""
  );
  const [hobbiesInput, setHobbiesInput] = useState(
    person?.hobbies ? person.hobbies.join(", ") : ""
  );
  const [preferencesInput, setPreferencesInput] = useState(
    person?.preferences ? person.preferences.join(", ") : ""
  );
  const [notes, setNotes] = useState(person?.notes || "");

  // For new person: connection target
  const liza = allPersons.find(
    (p) =>
      p.relation.toLowerCase().includes("девушка") ||
      p.name.toLowerCase().includes("лиза")
  );
  const [targetPersonId, setTargetPersonId] = useState(liza?.id || allPersons[0]?.id || "");
  const [relationshipLabel, setRelationshipLabel] = useState("");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  // Sync state when person changes
  React.useEffect(() => {
    if (person) {
      setName(person.name);
      setRelation(person.relation);
      setBirthDate(person.birthDate ? person.birthDate.split("T")[0] : "");
      setHobbiesInput(person.hobbies ? person.hobbies.join(", ") : "");
      setPreferencesInput(person.preferences ? person.preferences.join(", ") : "");
      setNotes(person.notes || "");
    } else {
      setName("");
      setRelation("");
      setBirthDate("");
      setHobbiesInput("");
      setPreferencesInput("");
      setNotes("");
      setRelationshipLabel("");
      if (liza) setTargetPersonId(liza.id);
    }
    setError("");
  }, [person, liza]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError("Пожалуйста, укажите имя человека");
      return;
    }
    if (!relation.trim()) {
      setError("Пожалуйста, укажите роль / связь (мама, брат, друг и т.д.)");
      return;
    }

    try {
      setIsSubmitting(true);
      setError("");

      const hobbies = hobbiesInput
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);

      const preferences = preferencesInput
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);

      await onSave({
        id: person?.id,
        name: name.trim(),
        relation: relation.trim(),
        birthDate: birthDate ? new Date(birthDate).toISOString() : null,
        hobbies,
        preferences,
        notes: notes.trim() || null,
        ...(!isEditing && {
          targetPersonId,
          relationshipLabel: relationshipLabel.trim() || relation.trim(),
        }),
      });

      onClose();
    } catch (err: any) {
      setError(err.message || "Ошибка сохранения");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg glass-panel rounded-2xl shadow-2xl border border-sky-500/30 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-sky-500/20 bg-slate-900/50 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            {isEditing ? (
              <Sparkles className="w-5 h-5 text-sky-400" />
            ) : (
              <UserPlus className="w-5 h-5 text-pink-400" />
            )}
            <h2 className="text-base font-bold text-white">
              {isEditing ? `Редактирование: ${person?.name}` : "Добавить человека в граф"}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4">
          {error && (
            <div className="p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Имя и обращение *
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="например: Михаил (дядя)"
                className="w-full px-3 py-2 rounded-xl bg-slate-900/80 border border-slate-700 text-white text-xs focus:outline-none focus:border-sky-400"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Роль / Связь *
              </label>
              <input
                type="text"
                required
                value={relation}
                onChange={(e) => setRelation(e.target.value)}
                placeholder="девушка, мама, брат, друг, коллега"
                className="w-full px-3 py-2 rounded-xl bg-slate-900/80 border border-slate-700 text-white text-xs focus:outline-none focus:border-sky-400"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Дата рождения (необязательно)
            </label>
            <input
              type="date"
              value={birthDate}
              onChange={(e) => setBirthDate(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-900/80 border border-slate-700 text-white text-xs focus:outline-none focus:border-sky-400"
            />
          </div>

          {/* New Person Connection */}
          {!isEditing && allPersons.length > 0 && (
            <div className="p-3.5 rounded-xl bg-sky-950/20 border border-sky-500/20 space-y-3">
              <p className="text-xs font-semibold text-sky-300">🔗 Связать с узлом в графе:</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] text-slate-400 mb-1">Связать с:</label>
                  <select
                    value={targetPersonId}
                    onChange={(e) => setTargetPersonId(e.target.value)}
                    className="w-full px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-white text-xs focus:outline-none focus:border-sky-400"
                  >
                    {allPersons.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name} ({p.relation})
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] text-slate-400 mb-1">
                    Подпись связи (на линии):
                  </label>
                  <input
                    type="text"
                    value={relationshipLabel}
                    onChange={(e) => setRelationshipLabel(e.target.value)}
                    placeholder="например: дядя, подруга"
                    className="w-full px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-white text-xs focus:outline-none focus:border-sky-400"
                  />
                </div>
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-sky-400" />
              Увлечения и хобби (через запятую)
            </label>
            <input
              type="text"
              value={hobbiesInput}
              onChange={(e) => setHobbiesInput(e.target.value)}
              placeholder="кулинария, рок-музыка, сноуборд, книги"
              className="w-full px-3 py-2 rounded-xl bg-slate-900/80 border border-slate-700 text-white text-xs focus:outline-none focus:border-sky-400"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1 flex items-center gap-1.5">
              <Heart className="w-3.5 h-3.5 text-pink-400" />
              Предпочтения, вкусы, подарки (через запятую)
            </label>
            <input
              type="text"
              value={preferencesInput}
              onChange={(e) => setPreferencesInput(e.target.value)}
              placeholder="белые пионы, размер одежды S, кофе без сахара, термос"
              className="w-full px-3 py-2 rounded-xl bg-slate-900/80 border border-slate-700 text-white text-xs focus:outline-none focus:border-sky-400"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Заметки и важные детали
            </label>
            <textarea
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Что важно помнить: мечты, планы, особенности характера..."
              className="w-full px-3 py-2 rounded-xl bg-slate-900/80 border border-slate-700 text-white text-xs focus:outline-none focus:border-sky-400 resize-none"
            />
          </div>

          {/* Modal Footer */}
          <div className="pt-2 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium transition-colors"
            >
              Отмена
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-white text-xs font-semibold flex items-center gap-1.5 shadow-lg shadow-sky-500/20 disabled:opacity-50 transition-all"
            >
              <Save className="w-3.5 h-3.5" />
              <span>{isSubmitting ? "Сохранение..." : "Сохранить"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
