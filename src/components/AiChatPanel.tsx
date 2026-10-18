"use client";

import React, { useState, useRef, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import { ChatMessageData } from "@/types";
import {
  Send,
  Bot,
  User,
  Sparkles,
  Trash2,
  Settings,
  ChevronRight,
  ChevronLeft,
  CheckCircle2,
  RefreshCw,
} from "lucide-react";

interface AiChatPanelProps {
  isOpen: boolean;
  onToggle: () => void;
  onOpenSettings: () => void;
  onGraphUpdated?: () => void;
  initialQuestion?: string | null;
  onClearInitialQuestion?: () => void;
}

export default function AiChatPanel({
  isOpen,
  onToggle,
  onOpenSettings,
  onGraphUpdated,
  initialQuestion,
  onClearInitialQuestion,
}: AiChatPanelProps) {
  const [messages, setMessages] = useState<ChatMessageData[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Quick suggestions chips
  const quickPrompts = [
    "🌸 Какие цветы подарить маме?",
    "🎸 Что подарить брату до 3000₽?",
    "🎂 Кто празднует ДР в ближайший месяц?",
    "🎁 Идеи романтического сюрприза для Лизы",
    "➕ Добавь дядю Михаила, он любит охоту и кофе",
  ];

  // Fetch chat history on mount
  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      const res = await fetch("/api/chat");
      const data = await res.json();
      if (data.messages) {
        setMessages(data.messages);
      }
    } catch (err) {
      console.error("Failed to fetch chat history:", err);
    }
  };

  // Scroll to bottom on new message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  // Handle external question triggers (e.g. from person detail modal)
  useEffect(() => {
    if (initialQuestion) {
      setInput(initialQuestion);
      onClearInitialQuestion?.();
    }
  }, [initialQuestion, onClearInitialQuestion]);

  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || input).trim();
    if (!text || isLoading) return;

    setInput("");

    // Optimistic user message
    const tempUserMsg: ChatMessageData = {
      id: "temp-" + Date.now(),
      role: "user",
      content: text,
      createdAt: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, tempUserMsg]);
    setIsLoading(true);

    try {
      // Check for custom key in localStorage
      let customApiKey = "";
      if (typeof window !== "undefined") {
        customApiKey = localStorage.getItem("GEMINI_CUSTOM_KEY") || "";
      }

      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: text,
          customApiKey,
        }),
      });

      const data = await res.json();

      if (data.message) {
        setMessages((prev) => [...prev, data.message]);
      }

      if (data.updatedGraph && onGraphUpdated) {
        onGraphUpdated();
      }
    } catch (error) {
      console.error("Error sending message:", error);
      setMessages((prev) => [
        ...prev,
        {
          id: "err-" + Date.now(),
          role: "assistant",
          content: "⚠️ Ошибка сети при соединении с сервером. Попробуйте еще раз.",
          createdAt: new Date().toISOString(),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearHistory = async () => {
    if (!confirm("Очистить историю сообщений с ИИ?")) return;
    try {
      const res = await fetch("/api/chat", { method: "DELETE" });
      const data = await res.json();
      if (data.messages) {
        setMessages(data.messages);
      }
    } catch (e) {
      console.error("Failed to clear chat:", e);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <>
      {/* Floating Toggle Tab when collapsed */}
      {!isOpen && (
        <button
          onClick={onToggle}
          className="fixed top-20 right-0 z-20 flex items-center gap-2 px-3.5 py-2.5 rounded-l-2xl glass-panel text-xs font-semibold text-sky-300 shadow-2xl border-l border-t border-b border-sky-400/30 hover:bg-sky-500/20 transition-all hover:pr-4"
        >
          <Bot className="w-4 h-4 text-sky-400 animate-pulse" />
          <span>AI-Консьерж</span>
          <ChevronLeft className="w-4 h-4" />
        </button>
      )}

      {/* Main Chat Panel Container */}
      <div
        className={`fixed top-0 right-0 z-30 h-full w-full sm:w-[420px] glass-panel border-l border-sky-500/20 shadow-2xl flex flex-col transition-transform duration-300 ease-in-out ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Header */}
        <div className="px-5 py-3.5 border-b border-sky-500/20 bg-slate-950/60 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="relative">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-sky-500 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-sky-500/30">
                <Bot className="w-4 h-4" />
              </div>
              <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-400 ring-2 ring-slate-950" />
            </div>

            <div>
              <div className="flex items-center gap-1.5">
                <h3 className="text-xs font-bold text-white">AI-Консьерж</h3>
                <span className="text-[10px] px-1.5 py-0.2 rounded bg-sky-500/15 text-sky-300 font-mono">
                  Gemini
                </span>
              </div>
              <p className="text-[10px] text-slate-400">Подарки, семья и автодополнение</p>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={onOpenSettings}
              title="Настройки AI"
              className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-sky-300 transition-colors"
            >
              <Settings className="w-4 h-4" />
            </button>
            <button
              onClick={handleClearHistory}
              title="Очистить диалог"
              className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-rose-400 transition-colors"
            >
              <Trash2 className="w-4 h-4" />
            </button>
            <button
              onClick={onToggle}
              title="Свернуть панель"
              className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Quick Prompts Chips */}
        <div className="p-3 border-b border-slate-800/80 bg-slate-900/40">
          <p className="text-[10px] font-semibold text-slate-400 mb-1.5 flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-sky-400" />
            Быстрые вопросы:
          </p>
          <div className="flex gap-1.5 overflow-x-auto pb-1 no-scrollbar">
            {quickPrompts.map((prompt, i) => (
              <button
                key={i}
                onClick={() => handleSendMessage(prompt.replace(/^[^\s]+\s/, ""))}
                disabled={isLoading}
                className="shrink-0 px-2.5 py-1 rounded-lg bg-slate-800/80 hover:bg-sky-500/20 text-slate-300 hover:text-sky-200 border border-slate-700 hover:border-sky-500/30 text-[11px] transition-colors whitespace-nowrap"
              >
                {prompt}
              </button>
            ))}
          </div>
        </div>

        {/* Chat Messages Stream */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3.5">
          {messages.map((m) => {
            const isUser = m.role === "user";
            return (
              <div
                key={m.id}
                className={`flex gap-2.5 text-xs ${
                  isUser ? "justify-end" : "justify-start"
                }`}
              >
                {!isUser && (
                  <div className="w-6 h-6 rounded-lg bg-sky-600/40 border border-sky-400/30 flex items-center justify-center shrink-0 text-sky-300 mt-0.5">
                    <Bot className="w-3.5 h-3.5" />
                  </div>
                )}

                <div
                  className={`max-w-[85%] rounded-2xl p-3 shadow-md ${
                    isUser
                      ? "bg-gradient-to-r from-sky-600 to-indigo-600 text-white rounded-tr-none shadow-sky-600/20"
                      : "bg-slate-900/90 border border-slate-800/90 text-slate-200 rounded-tl-none prose-dark"
                  }`}
                >
                  {/* Tool call badge notification if model performed actions */}
                  {m.toolCalls && m.toolCalls.length > 0 && (
                    <div className="mb-2 p-2 rounded-lg bg-emerald-950/40 border border-emerald-500/30 text-emerald-300 text-[11px] space-y-1">
                      {m.toolCalls.map((tc, idx) => (
                        <div key={idx} className="flex items-center gap-1.5">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                          <span>
                            {tc.name === "update_person_info"
                              ? "✨ Данные в карточке обновлены"
                              : tc.name === "add_relative"
                              ? "✨ Добавлен новый родственник в граф"
                              : `Инструмент: ${tc.name}`}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}

                  {isUser ? (
                    <p className="whitespace-pre-wrap">{m.content}</p>
                  ) : (
                    <ReactMarkdown>{m.content}</ReactMarkdown>
                  )}

                  <span
                    className={`block text-[9px] mt-1.5 ${
                      isUser ? "text-sky-200/80 text-right" : "text-slate-500"
                    }`}
                  >
                    {(() => {
                      try {
                        const d = new Date(m.createdAt);
                        return `${d.getHours().toString().padStart(2, "0")}:${d
                          .getMinutes()
                          .toString()
                          .padStart(2, "0")}`;
                      } catch {
                        return "";
                      }
                    })()}
                  </span>
                </div>

                {isUser && (
                  <div className="w-6 h-6 rounded-lg bg-indigo-600/40 border border-indigo-400/30 flex items-center justify-center shrink-0 text-indigo-300 mt-0.5">
                    <User className="w-3.5 h-3.5" />
                  </div>
                )}
              </div>
            );
          })}

          {/* Typing Indicator */}
          {isLoading && (
            <div className="flex gap-2.5 text-xs items-center text-slate-400">
              <div className="w-6 h-6 rounded-lg bg-sky-600/40 border border-sky-400/30 flex items-center justify-center shrink-0 text-sky-300">
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              </div>
              <div className="p-2.5 rounded-2xl bg-slate-900/80 border border-slate-800 rounded-tl-none flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-sky-400 animate-bounce" />
                <span
                  className="w-1.5 h-1.5 rounded-full bg-sky-400 animate-bounce"
                  style={{ animationDelay: "150ms" }}
                />
                <span
                  className="w-1.5 h-1.5 rounded-full bg-sky-400 animate-bounce"
                  style={{ animationDelay: "300ms" }}
                />
                <span className="text-[11px] text-slate-400 ml-1">AI думает...</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="p-3 border-t border-sky-500/20 bg-slate-950/70">
          <div className="relative flex items-center gap-2">
            <textarea
              rows={2}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Спроси о подарках или назови новый факт..."
              className="flex-1 px-3.5 py-2.5 rounded-xl bg-slate-900/90 border border-slate-700/80 text-white placeholder-slate-400 text-xs focus:outline-none focus:border-sky-400 resize-none"
            />
            <button
              onClick={() => handleSendMessage()}
              disabled={!input.trim() || isLoading}
              className="p-3 rounded-xl bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-white disabled:opacity-40 shadow-lg shadow-sky-500/25 transition-all self-end"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
          <p className="text-[10px] text-slate-500 mt-1.5 text-center">
            Нажмите <strong>Enter</strong> для отправки, <strong>Shift+Enter</strong> для новой строки
          </p>
        </div>
      </div>
    </>
  );
}
