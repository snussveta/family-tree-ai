"use client";

import React, { useState, useEffect } from "react";
import { X, Key, Check, ExternalLink, Cpu } from "lucide-react";

interface ApiKeyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaved: () => void;
}

export default function ApiKeyModal({ isOpen, onClose, onSaved }: ApiKeyModalProps) {
  const [apiKey, setApiKey] = useState("");
  const [model, setModel] = useState("gemini-2.0-flash");
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedKey = localStorage.getItem("GEMINI_CUSTOM_KEY") || "";
      const storedModel = localStorage.getItem("GEMINI_CUSTOM_MODEL") || "gemini-2.0-flash";
      setApiKey(storedKey);
      setModel(storedModel);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (typeof window !== "undefined") {
      localStorage.setItem("GEMINI_CUSTOM_KEY", apiKey.trim());
      localStorage.setItem("GEMINI_CUSTOM_MODEL", model);
    }
    setIsSaved(true);
    setTimeout(() => {
      setIsSaved(false);
      onSaved();
      onClose();
    }, 600);
  };

  const handleClear = () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("GEMINI_CUSTOM_KEY");
      setApiKey("");
    }
    onSaved();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-md glass-panel rounded-2xl shadow-2xl border border-sky-500/30 overflow-hidden">
        <div className="px-6 py-4 border-b border-sky-500/20 bg-slate-900/50 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Key className="w-5 h-5 text-amber-400" />
            <h2 className="text-base font-bold text-white">Настройки Gemini AI</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSave} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Google Gemini API Key
            </label>
            <input
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="AIzaSy..."
              className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:outline-none focus:border-sky-400 font-mono"
            />
            <p className="text-[11px] text-slate-400 mt-1 flex items-center gap-1">
              Если оставить пустым, будет использоваться ключ из файла <code>.env</code>.
            </p>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1 flex items-center gap-1">
              <Cpu className="w-3.5 h-3.5 text-sky-400" />
              Модель Gemini
            </label>
            <select
              value={model}
              onChange={(e) => setModel(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:outline-none focus:border-sky-400"
            >
              <option value="gemini-2.0-flash">gemini-2.0-flash (Рекомендуется, сверхбыстрая)</option>
              <option value="gemini-1.5-flash">gemini-1.5-flash (Стабильная)</option>
              <option value="gemini-1.5-pro">gemini-1.5-pro (Глубокие рассуждения)</option>
            </select>
          </div>

          <div className="p-3 rounded-xl bg-sky-950/30 border border-sky-500/20 text-xs text-slate-300 flex items-start gap-2">
            <ExternalLink className="w-4 h-4 text-sky-400 shrink-0 mt-0.5" />
            <div>
              Бесплатный ключ Gemini API можно получить за минуту на{" "}
              <a
                href="https://aistudio.google.com/app/apikey"
                target="_blank"
                rel="noreferrer"
                className="text-sky-300 underline hover:text-sky-200"
              >
                Google AI Studio
              </a>
              . Ключ сохраняется локально в вашем браузере.
            </div>
          </div>

          <div className="pt-2 flex items-center justify-between">
            {apiKey && (
              <button
                type="button"
                onClick={handleClear}
                className="text-xs text-rose-400 hover:text-rose-300"
              >
                Сбросить ключ
              </button>
            )}
            <div className="flex items-center gap-2 ml-auto">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium transition-colors"
              >
                Закрыть
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold flex items-center gap-1.5 shadow-lg shadow-sky-600/20 transition-all"
              >
                {isSaved ? <Check className="w-3.5 h-3.5" /> : null}
                <span>{isSaved ? "Сохранено!" : "Применить"}</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
