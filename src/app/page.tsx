"use client";

import React, { useState, useEffect, useCallback } from "react";
import dynamic from "next/dynamic";
import { PersonData, RelationshipData } from "@/types";
import TopNavbar from "@/components/TopNavbar";
import PersonDetailModal from "@/components/PersonDetailModal";
import PersonEditModal from "@/components/PersonEditModal";
import AddRelationshipModal from "@/components/AddRelationshipModal";
import AiChatPanel from "@/components/AiChatPanel";
import ApiKeyModal from "@/components/ApiKeyModal";
import { Loader2 } from "lucide-react";

// Dynamically import NetworkGraph with ssr: false so force-graph / canvas runs only on the client
const NetworkGraph = dynamic(() => import("@/components/NetworkGraph"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center bg-[#060913] text-sky-400 gap-3">
      <Loader2 className="w-6 h-6 animate-spin" />
      <span className="text-sm font-mono">Загрузка нейросети окружения...</span>
    </div>
  ),
});

export default function Home() {
  const [persons, setPersons] = useState<PersonData[]>([]);
  const [relationships, setRelationships] = useState<RelationshipData[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Modals & Panels state
  const [selectedPerson, setSelectedPerson] = useState<PersonData | null>(null);
  const [editingPerson, setEditingPerson] = useState<PersonData | null>(null);
  const [isAddPersonOpen, setIsAddPersonOpen] = useState(false);
  const [isAddRelationshipOpen, setIsAddRelationshipOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(true);
  const [aiQuestion, setAiQuestion] = useState<string | null>(null);

  // Fetch full graph data
  const fetchGraph = useCallback(async () => {
    try {
      const res = await fetch("/api/graph");
      const data = await res.json();
      if (data.persons) {
        setPersons(data.persons);
        setRelationships(data.relationships || []);

        // If a person is currently selected, update their data
        if (selectedPerson) {
          const fresh = data.persons.find((p: PersonData) => p.id === selectedPerson.id);
          if (fresh) setSelectedPerson(fresh);
        }
      }
    } catch (err) {
      console.error("Failed to load graph data:", err);
    } finally {
      setIsLoading(false);
    }
  }, [selectedPerson]);

  useEffect(() => {
    fetchGraph();
  }, []);

  // Save / Update Person
  const handleSavePerson = async (
    data: Partial<PersonData> & { targetPersonId?: string; relationshipLabel?: string }
  ) => {
    if (data.id) {
      // PUT update
      const res = await fetch(`/api/persons/${data.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Не удалось обновить запись");
      await fetchGraph();
    } else {
      // POST create
      const res = await fetch("/api/persons", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Не удалось создать человека");
      await fetchGraph();
    }
  };

  // Delete Person
  const handleDeletePerson = async (personId: string) => {
    try {
      const res = await fetch(`/api/persons/${personId}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Не удалось удалить человека");
      setSelectedPerson(null);
      await fetchGraph();
    } catch (e: any) {
      alert(e.message);
    }
  };

  // Add Relationship
  const handleAddRelationship = async (
    sourceId: string,
    targetId: string,
    label: string
  ) => {
    const res = await fetch("/api/relationships", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sourceId, targetId, label }),
    });
    if (!res.ok) throw new Error("Не удалось создать связь");
    await fetchGraph();
  };

  // Reset to seed demo data
  const handleResetSeed = async () => {
    if (!confirm("Сбросить базу данных к исходным демо-данным (Лиза в центре)?")) return;
    try {
      setIsLoading(true);
      const res = await fetch("/api/seed", { method: "POST" });
      if (!res.ok) throw new Error("Ошибка восстановления данных");
      setSelectedPerson(null);
      await fetchGraph();
    } catch (e: any) {
      alert(e.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Trigger question in AI chat
  const handleAskAi = (question: string) => {
    setAiQuestion(question);
    setIsChatOpen(true);
  };

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-[#060913] text-slate-100 flex flex-col">
      {/* Top Navbar */}
      <TopNavbar
        persons={persons}
        relationships={relationships}
        onAddPerson={() => {
          setEditingPerson(null);
          setIsAddPersonOpen(true);
        }}
        onAddRelationship={() => setIsAddRelationshipOpen(true)}
        onResetSeed={handleResetSeed}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onToggleChat={() => setIsChatOpen((prev) => !prev)}
        isChatOpen={isChatOpen}
      />

      {/* Main Workspace Area */}
      <main className="relative flex-1 w-full h-full pt-16">
        {/* Fullscreen Interactive Neural Graph */}
        <NetworkGraph
          persons={persons}
          relationships={relationships}
          selectedPersonId={selectedPerson?.id || null}
          onSelectPerson={(p) => setSelectedPerson(p)}
          onRefresh={fetchGraph}
        />

        {/* Person Detail Slide-Over Card */}
        {selectedPerson && (
          <PersonDetailModal
            person={selectedPerson}
            allPersons={persons}
            relationships={relationships}
            onClose={() => setSelectedPerson(null)}
            onEdit={(p) => {
              setEditingPerson(p);
              setIsAddPersonOpen(true);
            }}
            onDelete={handleDeletePerson}
            onSelectPerson={(p) => setSelectedPerson(p)}
            onAskAi={handleAskAi}
          />
        )}

        {/* Person Create / Edit Modal */}
        <PersonEditModal
          isOpen={isAddPersonOpen}
          person={editingPerson}
          allPersons={persons}
          onClose={() => {
            setIsAddPersonOpen(false);
            setEditingPerson(null);
          }}
          onSave={handleSavePerson}
        />

        {/* Add Relationship Modal */}
        <AddRelationshipModal
          isOpen={isAddRelationshipOpen}
          persons={persons}
          onClose={() => setIsAddRelationshipOpen(false)}
          onAddRelationship={handleAddRelationship}
        />

        {/* Gemini API Key & Model Settings Modal */}
        <ApiKeyModal
          isOpen={isSettingsOpen}
          onClose={() => setIsSettingsOpen(false)}
          onSaved={fetchGraph}
        />

        {/* AI Assistant Chat Panel (Right Sidebar) */}
        <AiChatPanel
          isOpen={isChatOpen}
          onToggle={() => setIsChatOpen((prev) => !prev)}
          onOpenSettings={() => setIsSettingsOpen(true)}
          onGraphUpdated={fetchGraph}
          initialQuestion={aiQuestion}
          onClearInitialQuestion={() => setAiQuestion(null)}
        />
      </main>
    </div>
  );
}
