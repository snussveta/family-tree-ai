"use client";

import React from "react";
import { PersonData, RelationshipData } from "@/types";
import {
  X,
  Calendar,
  Heart,
  Sparkles,
  Edit3,
  Trash2,
  Gift,
  Link as LinkIcon,
  Smile,
  Info,
} from "lucide-react";

interface PersonDetailModalProps {
  person: PersonData | null;
  allPersons: PersonData[];
  relationships: RelationshipData[];
  onClose: () => void;
  onEdit: (person: PersonData) => void;
  onDelete: (personId: string) => void;
  onSelectPerson: (person: PersonData) => void;
  onAskAi: (question: string) => void;
}

export default function PersonDetailModal({
  person,
  allPersons,
  relationships,
  onClose,
  onEdit,
  onDelete,
  onSelectPerson,
  onAskAi,
}: PersonDetailModalProps) {
  if (!person) return null;

  const isLiza =
    person.relation.toLowerCase().includes("девушка") ||
    person.name.toLowerCase().includes("лиза");

  // Format birthDate & age
  const [dateInfo, setDateInfo] = React.useState<{
    birthDateText: string;
    ageText: string;
    daysToBday: number | null;
  }>({
    birthDateText: "Не указана",
    ageText: "",
    daysToBday: null,
  });

  React.useEffect(() => {
    if (!person.birthDate) {
      setDateInfo({
        birthDateText: "Не указана",
        ageText: "",
        daysToBday: null,
      });
      return;
    }

    const d = new Date(person.birthDate);
    const months = [
      "января",
      "февраля",
      "марта",
      "апреля",
      "мая",
      "июня",
      "июля",
      "августа",
      "сентября",
      "октября",
      "ноября",
      "декабря",
    ];
    const birthDateText = `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()} г.`;

    const today = new Date();
    let age = today.getFullYear() - d.getFullYear();
    const m = today.getMonth() - d.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < d.getDate())) {
      age--;
    }
    const ageText = `(${age} лет)`;

    const nextBday = new Date(today.getFullYear(), d.getMonth(), d.getDate());
    if (nextBday < today) {
      nextBday.setFullYear(today.getFullYear() + 1);
    }
    const daysToBday = Math.ceil((nextBday.getTime() - today.getTime()) / (1000 * 3600 * 24));

    setDateInfo({ birthDateText, ageText, daysToBday });
  }, [person.birthDate]);

  const { birthDateText, ageText, daysToBday } = dateInfo;

  // Find connected relatives
  const connectedLinks = relationships.filter(
    (r) => r.sourceId === person.id || r.targetId === person.id
  );

  const connectedList = connectedLinks.map((r) => {
    const otherId = r.sourceId === person.id ? r.targetId : r.sourceId;
    const otherPerson = allPersons.find((p) => p.id === otherId);
    return {
      relationshipId: r.id,
      label: r.label,
      targetPerson: otherPerson,
    };
  }).filter((c) => Boolean(c.targetPerson));

  return (
    <div className="fixed inset-y-0 left-0 sm:left-4 sm:top-20 sm:bottom-6 z-30 w-full sm:w-[420px] flex flex-col glass-panel rounded-none sm:rounded-2xl shadow-2xl border border-sky-500/25 overflow-hidden animate-in slide-in-from-left duration-200">
      {/* Header with glowing accent */}
      <div
        className={`relative px-5 py-5 border-b ${
          isLiza
            ? "border-pink-500/30 bg-gradient-to-r from-pink-950/40 via-purple-950/30 to-transparent"
            : "border-sky-500/20 bg-gradient-to-r from-sky-950/30 via-slate-900/30 to-transparent"
        }`}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-xl hover:bg-slate-800/60 text-slate-400 hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3.5">
          <div
            className={`w-14 h-14 rounded-2xl flex items-center justify-center font-bold text-xl shadow-lg border ${
              isLiza
                ? "bg-gradient-to-tr from-pink-600 to-rose-400 border-pink-300/40 text-white shadow-pink-500/25"
                : "bg-gradient-to-tr from-sky-600 to-indigo-500 border-sky-300/40 text-white shadow-sky-500/25"
            }`}
          >
            {isLiza ? "👑" : person.name[0]?.toUpperCase() || "★"}
          </div>

          <div className="flex-1 pr-6">
            <div className="flex items-center gap-2">
              <span
                className={`text-[11px] font-semibold px-2 py-0.5 rounded-full border ${
                  isLiza
                    ? "bg-pink-500/20 text-pink-300 border-pink-500/40"
                    : "bg-sky-500/20 text-sky-300 border-sky-500/30"
                }`}
              >
                {person.relation}
              </span>
              {isLiza && (
                <span className="text-[10px] text-pink-400 flex items-center gap-1">
                  <Sparkles className="w-3 h-3" />
                  Главный узел
                </span>
              )}
            </div>
            <h2 className="text-lg font-bold text-white mt-1 leading-snug">
              {person.name}
            </h2>
          </div>
        </div>
      </div>

      {/* Content scroll area */}
      <div className="flex-1 overflow-y-auto p-5 space-y-4">
        {/* Birthday card */}
        <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-sky-500/10 text-sky-400 border border-sky-500/20">
              <Calendar className="w-4 h-4" />
            </div>
            <div>
              <p className="text-[11px] text-slate-400">День рождения</p>
              <p className="text-xs font-semibold text-slate-200">
                {birthDateText} <span className="text-slate-400 font-normal">{ageText}</span>
              </p>
            </div>
          </div>
          {daysToBday !== null && (
            <div className="text-right">
              <span className="text-[11px] font-medium px-2 py-1 rounded-lg bg-pink-500/15 text-pink-300 border border-pink-500/30">
                через {daysToBday} дн.
              </span>
            </div>
          )}
        </div>

        {/* Hobbies */}
        <div>
          <h3 className="text-xs font-semibold text-slate-300 mb-2 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-sky-400" />
            Увлечения и хобби
          </h3>
          {person.hobbies && person.hobbies.length > 0 ? (
            <div className="flex flex-wrap gap-1.5">
              {person.hobbies.map((hobby, idx) => (
                <span
                  key={idx}
                  className="px-2.5 py-1 rounded-lg bg-sky-950/60 text-sky-200 border border-sky-500/30 text-xs shadow-sm"
                >
                  {hobby}
                </span>
              ))}
            </div>
          ) : (
            <p className="text-xs text-slate-500 italic">Увлечения пока не добавлены</p>
          )}
        </div>

        {/* Preferences & Wishes */}
        <div>
          <h3 className="text-xs font-semibold text-slate-300 mb-2 flex items-center gap-1.5">
            <Heart className="w-3.5 h-3.5 text-pink-400" />
            Предпочтения, вкусы и подарки
          </h3>
          {person.preferences && person.preferences.length > 0 ? (
            <div className="space-y-1.5">
              {person.preferences.map((pref, idx) => (
                <div
                  key={idx}
                  className="px-3 py-1.5 rounded-lg bg-pink-950/30 border border-pink-500/20 text-xs text-pink-200 flex items-start gap-2"
                >
                  <span className="text-pink-400 mt-0.5">•</span>
                  <span>{pref}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-slate-500 italic">Предпочтения пока не указаны</p>
          )}
        </div>

        {/* Notes */}
        {person.notes && (
          <div>
            <h3 className="text-xs font-semibold text-slate-300 mb-2 flex items-center gap-1.5">
              <Info className="w-3.5 h-3.5 text-amber-400" />
              Заметки и особенности
            </h3>
            <div className="p-3 rounded-xl bg-slate-900/70 border border-slate-800 text-xs text-slate-300 whitespace-pre-line leading-relaxed">
              {person.notes}
            </div>
          </div>
        )}

        {/* Connections in Graph */}
        <div>
          <h3 className="text-xs font-semibold text-slate-300 mb-2 flex items-center gap-1.5">
            <LinkIcon className="w-3.5 h-3.5 text-indigo-400" />
            Связи в графе ({connectedList.length})
          </h3>
          {connectedList.length > 0 ? (
            <div className="grid grid-cols-2 gap-2">
              {connectedList.map((c, i) => (
                <button
                  key={i}
                  onClick={() => c.targetPerson && onSelectPerson(c.targetPerson)}
                  className="p-2 rounded-xl bg-slate-900/50 hover:bg-slate-800/80 border border-slate-800 hover:border-sky-500/40 text-left transition-all group"
                >
                  <p className="text-[11px] text-slate-400">{c.label}</p>
                  <p className="text-xs font-semibold text-slate-200 group-hover:text-sky-300 truncate">
                    {c.targetPerson?.name}
                  </p>
                </button>
              ))}
            </div>
          ) : (
            <p className="text-xs text-slate-500 italic">Связи не установлены</p>
          )}
        </div>
      </div>

      {/* Footer Actions */}
      <div className="p-4 border-t border-slate-800/80 bg-slate-950/60 flex flex-col gap-2">
        {/* Ask AI shortcut */}
        <button
          onClick={() =>
            onAskAi(
              `Подскажи, что подарить для ${person.name} (${person.relation}) с учетом увлечений и предпочтений?`
            )
          }
          className="w-full py-2.5 px-3 rounded-xl bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-500 hover:to-purple-500 text-white font-medium text-xs flex items-center justify-center gap-2 shadow-lg shadow-pink-600/20 transition-all hover:scale-[1.01]"
        >
          <Gift className="w-4 h-4" />
          <span>Спросить ИИ об идеях подарка</span>
        </button>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onEdit(person)}
            className="flex-1 py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium flex items-center justify-center gap-1.5 transition-colors border border-slate-700"
          >
            <Edit3 className="w-3.5 h-3.5" />
            <span>Редактировать</span>
          </button>

          {!isLiza && (
            <button
              onClick={() => {
                if (confirm(`Удалить ${person.name} из карты связей?`)) {
                  onDelete(person.id);
                }
              }}
              className="py-2 px-3 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 hover:text-rose-300 text-xs font-medium flex items-center justify-center gap-1.5 transition-colors border border-rose-500/20"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Удалить</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
