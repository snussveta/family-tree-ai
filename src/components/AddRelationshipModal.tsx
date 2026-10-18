"use client";

import React, { useState } from "react";
import { PersonData } from "@/types";
import { X, Link as LinkIcon, Plus } from "lucide-react";

interface AddRelationshipModalProps {
  persons: PersonData[];
  isOpen: boolean;
  onClose: () => void;
  onAddRelationship: (sourceId: string, targetId: string, label: string) => Promise<void>;
}

export default function AddRelationshipModal({
  persons,
  isOpen,
  onClose,
  onAddRelationship,
}: AddRelationshipModalProps) {
  const [sourceId, setSourceId] = useState(persons[0]?.id || "");
  const [targetId, setTargetId] = useState(persons[1]?.id || persons[0]?.id || "");
  const [label, setLabel] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sourceId || !targetId) {
      setError("Выберите обоих людей для связи");
      return;
    }
    if (sourceId === targetId) {
      setError("Нельзя связать человека с самим собой");
      return;
    }
    if (!label.trim()) {
      setError("Укажите тип связи (например: мама, коллега, друг)");
      return;
    }

    try {
      setIsSubmitting(true);
      setError("");
      await onAddRelationship(sourceId, targetId, label.trim());
      onClose();
    } catch (err: any) {
      setError(err.message || "Ошибка создания связи");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-md glass-panel rounded-2xl shadow-2xl border border-sky-500/30 overflow-hidden">
        <div className="px-6 py-4 border-b border-sky-500/20 bg-slate-900/50 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <LinkIcon className="w-5 h-5 text-indigo-400" />
            <h2 className="text-base font-bold text-white">Добавить связь между узлами</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs">
              {error}
            </div>
          )}

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Человек 1 (Источник)
            </label>
            <select
              value={sourceId}
              onChange={(e) => setSourceId(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:outline-none focus:border-sky-400"
            >
              {persons.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} ({p.relation})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Человек 2 (Цель)
            </label>
            <select
              value={targetId}
              onChange={(e) => setTargetId(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:outline-none focus:border-sky-400"
            >
              {persons.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} ({p.relation})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Название связи (метка на линии) *
            </label>
            <input
              type="text"
              required
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              placeholder="например: мама, муж и жена, друзья, коллега"
              className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:outline-none focus:border-sky-400"
            />
          </div>

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
              className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center gap-1.5 shadow-lg shadow-indigo-600/20 disabled:opacity-50 transition-all"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>{isSubmitting ? "Создание..." : "Создать связь"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
