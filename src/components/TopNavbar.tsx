"use client";

import React from "react";
import { PersonData, RelationshipData } from "@/types";
import {
  Share2,
  UserPlus,
  Link as LinkIcon,
  RotateCcw,
  Settings,
  Bot,
  Calendar,
  Sparkles,
} from "lucide-react";

interface TopNavbarProps {
  persons: PersonData[];
  relationships: RelationshipData[];
  onAddPerson: () => void;
  onAddRelationship: () => void;
  onResetSeed: () => void;
  onOpenSettings: () => void;
  onToggleChat: () => void;
  isChatOpen: boolean;
}

export default function TopNavbar({
  persons,
  relationships,
  onAddPerson,
  onAddRelationship,
  onResetSeed,
  onOpenSettings,
  onToggleChat,
  isChatOpen,
}: TopNavbarProps) {
  const [closestPerson, setClosestPerson] = React.useState<{
    name: string;
    days: number;
    dateStr: string;
  } | null>(null);

  React.useEffect(() => {
    const today = new Date();
    let closest: { name: string; days: number; dateStr: string } | null = null;

    for (const p of persons) {
      if (!p.birthDate) continue;
      const b = new Date(p.birthDate);
      const nextBday = new Date(today.getFullYear(), b.getMonth(), b.getDate());
      if (nextBday < today) {
        nextBday.setFullYear(today.getFullYear() + 1);
      }
      const diff = Math.ceil((nextBday.getTime() - today.getTime()) / (1000 * 3600 * 24));
      if (!closest || diff < closest.days) {
        closest = {
          name: p.name.split(" ")[0],
          days: diff,
          dateStr: `${b.getDate()}.${(b.getMonth() + 1).toString().padStart(2, "0")}`,
        };
      }
    }
    setClosestPerson(closest);
  }, [persons]);

  return (
    <header className="fixed top-0 left-0 right-0 z-20 h-16 glass-panel border-b border-sky-500/20 px-4 sm:px-6 flex items-center justify-between">
      {/* Brand & Title */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-pink-500 via-purple-600 to-sky-500 flex items-center justify-center text-white shadow-lg shadow-pink-500/25 ring-1 ring-white/20">
          <Share2 className="w-5 h-5" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-sm sm:text-base font-extrabold text-white tracking-wide flex items-center gap-1.5">
              <span>FamilyMind</span>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-sky-400">
                AI
              </span>
            </h1>
            <span className="hidden md:inline-block text-[10px] px-2 py-0.5 rounded-full bg-sky-500/20 text-sky-300 border border-sky-500/30">
              Нейрокарта
            </span>
          </div>
          <p className="hidden sm:block text-[11px] text-slate-400">
            Интерактивный граф семьи & AI-консьерж
          </p>
        </div>
      </div>

      {/* Middle Stats Badges */}
      <div className="hidden lg:flex items-center gap-3">
        <div className="px-3 py-1 rounded-xl bg-slate-900/70 border border-slate-800 text-xs text-slate-300 flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-sky-400 animate-pulse" />
          <span>Близких: <strong>{persons.length}</strong></span>
          <span className="text-slate-600">|</span>
          <span>Связей: <strong>{relationships.length}</strong></span>
        </div>

        {closestPerson && (
          <div className="px-3 py-1 rounded-xl bg-pink-950/30 border border-pink-500/30 text-xs text-pink-300 flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-pink-400" />
            <span>
              Ближайший ДР: <strong>{closestPerson.name}</strong> ({closestPerson.dateStr}) — через {closestPerson.days} дн.
            </span>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-2">
        <button
          onClick={onAddPerson}
          className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-white text-xs font-semibold flex items-center gap-1.5 shadow-md shadow-sky-500/20 transition-all hover:scale-[1.02]"
        >
          <UserPlus className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Человек</span>
        </button>

        <button
          onClick={onAddRelationship}
          className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-medium flex items-center gap-1.5 transition-colors"
        >
          <LinkIcon className="w-3.5 h-3.5 text-indigo-400" />
          <span className="hidden sm:inline">Связь</span>
        </button>

        <button
          onClick={onResetSeed}
          title="Сбросить к исходным демо-данным (Лиза в центре)"
          className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition-colors"
        >
          <RotateCcw className="w-3.5 h-3.5" />
        </button>

        <button
          onClick={onOpenSettings}
          title="Настройки Gemini API"
          className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-amber-400 border border-slate-700 transition-colors"
        >
          <Settings className="w-3.5 h-3.5" />
        </button>

        <button
          onClick={onToggleChat}
          className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all ${
            isChatOpen
              ? "bg-sky-500 text-white shadow-lg shadow-sky-500/30"
              : "bg-slate-800 hover:bg-slate-700 text-sky-300 border border-sky-500/30"
          }`}
        >
          <Bot className="w-4 h-4" />
          <span className="hidden sm:inline">AI Чат</span>
        </button>
      </div>
    </header>
  );
}
