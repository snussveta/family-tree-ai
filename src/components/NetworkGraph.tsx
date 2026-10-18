"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import { PersonData, RelationshipData } from "@/types";
import {
  ZoomIn,
  ZoomOut,
  Maximize2,
  Crosshair,
  Search,
  Filter,
  Sparkles,
} from "lucide-react";

interface NetworkGraphProps {
  persons: PersonData[];
  relationships: RelationshipData[];
  selectedPersonId: string | null;
  onSelectPerson: (person: PersonData) => void;
  onRefresh?: () => void;
}

// Color palette mapping based on role
function getNodeColor(relation: string, isCenter: boolean) {
  if (isCenter) {
    return {
      core: "#f43f5e", // Rose 500
      glow: "rgba(244, 63, 94, 0.6)",
      ring: "#fda4af",
      text: "#fff1f2",
      badgeBg: "rgba(244, 63, 94, 0.25)",
      badgeBorder: "rgba(244, 63, 94, 0.6)",
    };
  }

  const rel = relation.toLowerCase();
  if (rel.includes("девушка") || rel.includes("жена")) {
    return {
      core: "#ec4899",
      glow: "rgba(236, 72, 153, 0.6)",
      ring: "#f472b6",
      text: "#fdf2f8",
      badgeBg: "rgba(236, 72, 153, 0.25)",
      badgeBorder: "rgba(236, 72, 153, 0.6)",
    };
  }
  if (rel.includes("мам") || rel.includes("пап") || rel.includes("родител")) {
    return {
      core: "#f59e0b", // Amber
      glow: "rgba(245, 158, 11, 0.5)",
      ring: "#fcd34d",
      text: "#fffbeb",
      badgeBg: "rgba(245, 158, 11, 0.25)",
      badgeBorder: "rgba(245, 158, 11, 0.6)",
    };
  }
  if (rel.includes("брат") || rel.includes("сестр")) {
    return {
      core: "#06b6d4", // Cyan
      glow: "rgba(6, 182, 212, 0.5)",
      ring: "#67e8f9",
      text: "#ecfeff",
      badgeBg: "rgba(6, 182, 212, 0.25)",
      badgeBorder: "rgba(6, 182, 212, 0.6)",
    };
  }
  if (rel.includes("бабушк") || rel.includes("дедушк")) {
    return {
      core: "#8b5cf6", // Purple
      glow: "rgba(139, 92, 246, 0.5)",
      ring: "#c4b5fd",
      text: "#f5f3ff",
      badgeBg: "rgba(139, 92, 246, 0.25)",
      badgeBorder: "rgba(139, 92, 246, 0.6)",
    };
  }
  if (rel.includes("друг") || rel.includes("подруг")) {
    return {
      core: "#10b981", // Emerald
      glow: "rgba(16, 185, 129, 0.5)",
      ring: "#6ee7b7",
      text: "#ecfdf5",
      badgeBg: "rgba(16, 185, 129, 0.25)",
      badgeBorder: "rgba(16, 185, 129, 0.6)",
    };
  }

  // Default tech indigo
  return {
    core: "#3b82f6",
    glow: "rgba(59, 130, 246, 0.5)",
    ring: "#93c5fd",
    text: "#eff6ff",
    badgeBg: "rgba(59, 130, 246, 0.25)",
    badgeBorder: "rgba(59, 130, 246, 0.6)",
  };
}

export default function NetworkGraph({
  persons,
  relationships,
  selectedPersonId,
  onSelectPerson,
}: NetworkGraphProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const graphInstanceRef = useRef<any>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterRelation, setFilterRelation] = useState("all");
  const [hoveredNode, setHoveredNode] = useState<any>(null);

  // Initialize and update force-graph
  useEffect(() => {
    let isMounted = true;

    async function initGraph() {
      if (!containerRef.current) return;
      const { default: ForceGraph } = await import("force-graph");

      if (!isMounted || !containerRef.current) return;

      // Clean previous instance if any
      if (graphInstanceRef.current) {
        graphInstanceRef.current._destructor?.();
        containerRef.current.innerHTML = "";
      }

      const fgFactory: any = ForceGraph;
      const graph = fgFactory()(containerRef.current);
      graphInstanceRef.current = graph;

      // Background styling
      graph
        .backgroundColor("#060913")
        .width(containerRef.current.clientWidth)
        .height(containerRef.current.clientHeight)
        .nodeRelSize(7)
        .nodeVal((node: any) => (node.isCenter ? 14 : 7))
        .linkWidth((link: any) => 1.8)
        .linkColor(() => "rgba(56, 189, 248, 0.35)")
        .linkDirectionalParticles(2)
        .linkDirectionalParticleWidth(3)
        .linkDirectionalParticleSpeed(0.005)
        .linkDirectionalParticleColor(() => "#38bdf8")
        .linkCurvature(0.12)
        .d3VelocityDecay(0.3)
        .onNodeClick((node: any) => {
          onSelectPerson(node.rawPerson);
          graph.centerAt(node.x, node.y, 600);
          graph.zoom(1.8, 600);
        })
        .onNodeHover((node: any) => {
          if (containerRef.current) {
            containerRef.current.style.cursor = node ? "pointer" : "default";
          }
          setHoveredNode(node ? node.rawPerson : null);
        });

      // Custom node canvas rendering with glowing neon aesthetics
      graph.nodeCanvasObject((node: any, ctx: CanvasRenderingContext2D, globalScale: number) => {
        const isCenter = Boolean(node.isCenter);
        const isSelected = node.id === selectedPersonId;
        const isMatch =
          !searchQuery.trim() ||
          node.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          node.rawPerson.hobbies?.some((h: string) =>
            h.toLowerCase().includes(searchQuery.toLowerCase())
          );

        const r = isCenter ? 26 : 18;
        const colors = getNodeColor(node.relation, isCenter);

        ctx.save();
        ctx.translate(node.x, node.y);

        // Dim if search active and not matching
        if (searchQuery.trim() && !isMatch) {
          ctx.globalAlpha = 0.2;
        }

        // 1. Glowing outer halo
        const haloGrad = ctx.createRadialGradient(0, 0, r * 0.4, 0, 0, r * 2.2);
        haloGrad.addColorStop(0, colors.glow);
        haloGrad.addColorStop(1, "rgba(0, 0, 0, 0)");

        ctx.beginPath();
        ctx.arc(0, 0, r * 2.2, 0, 2 * Math.PI);
        ctx.fillStyle = haloGrad;
        ctx.fill();

        // 2. Selection / Active Pulse Ring
        if (isSelected || isCenter) {
          ctx.beginPath();
          ctx.arc(0, 0, r + 4, 0, 2 * Math.PI);
          ctx.strokeStyle = isSelected ? "#38bdf8" : colors.ring;
          ctx.lineWidth = isSelected ? 3 : 2;
          ctx.setLineDash(isSelected ? [4, 4] : []);
          ctx.shadowColor = colors.ring;
          ctx.shadowBlur = 12;
          ctx.stroke();
          ctx.setLineDash([]);
        }

        // 3. Main Node Circle (Gradient)
        const circleGrad = ctx.createRadialGradient(-r * 0.3, -r * 0.3, 0, 0, 0, r);
        circleGrad.addColorStop(0, colors.ring);
        circleGrad.addColorStop(0.7, colors.core);
        circleGrad.addColorStop(1, "#0a0f24");

        ctx.beginPath();
        ctx.arc(0, 0, r, 0, 2 * Math.PI);
        ctx.fillStyle = circleGrad;
        ctx.shadowColor = colors.core;
        ctx.shadowBlur = isCenter ? 20 : 10;
        ctx.fill();

        // Node Inner Border
        ctx.strokeStyle = "rgba(255, 255, 255, 0.4)";
        ctx.lineWidth = 1.2;
        ctx.stroke();

        // 4. Center icon / Initials
        ctx.shadowBlur = 0;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";

        if (isCenter) {
          ctx.font = `bold ${Math.max(16, 14)}px system-ui`;
          ctx.fillStyle = "#ffffff";
          ctx.fillText("👑", 0, -1);
        } else {
          // Initials (first letter)
          const letter = (node.name.replace(/[^а-яА-Яa-zA-Z]/g, "")[0] || "★").toUpperCase();
          ctx.font = `bold 12px system-ui`;
          ctx.fillStyle = "#ffffff";
          ctx.fillText(letter, 0, 0);
        }

        // 5. Label below node (Always legible pill badge)
        const fontSize = Math.max(10, Math.min(13, 11 / Math.sqrt(globalScale)));
        ctx.font = `${isCenter ? "bold " : ""}${fontSize}px system-ui`;

        const nameText = node.name.split(" ")[0]; // Main first name
        const roleText = node.relation ? `• ${node.relation}` : "";
        const fullLabel = `${nameText} ${roleText}`;

        const textMetrics = ctx.measureText(fullLabel);
        const paddingX = 8;
        const paddingY = 4;
        const badgeW = textMetrics.width + paddingX * 2;
        const badgeH = fontSize + paddingY * 2;
        const badgeY = r + 6;

        // Label Background Pill
        ctx.fillStyle = colors.badgeBg;
        ctx.strokeStyle = colors.badgeBorder;
        ctx.lineWidth = 1;

        ctx.beginPath();
        if (ctx.roundRect) {
          ctx.roundRect(-badgeW / 2, badgeY, badgeW, badgeH, 6);
        } else {
          ctx.rect(-badgeW / 2, badgeY, badgeW, badgeH);
        }
        ctx.fill();
        ctx.stroke();

        // Label text
        ctx.fillStyle = "#f8fafc";
        ctx.fillText(fullLabel, 0, badgeY + badgeH / 2 + 0.5);

        ctx.restore();
      });

      // Custom link label rendering
      graph.linkCanvasObjectMode(() => "after");
      graph.linkCanvasObject((link: any, ctx: CanvasRenderingContext2D, globalScale: number) => {
        if (!link.label || globalScale < 0.9) return;

        const start = link.source;
        const end = link.target;
        if (!start || !end || typeof start.x !== "number" || typeof end.x !== "number") return;

        const textPos = {
          x: start.x + (end.x - start.x) * 0.5,
          y: start.y + (end.y - start.y) * 0.5,
        };

        const fontSize = Math.max(9, 10 / Math.sqrt(globalScale));
        ctx.font = `500 ${fontSize}px system-ui`;
        const text = link.label;
        const metrics = ctx.measureText(text);

        ctx.save();
        ctx.translate(textPos.x, textPos.y);

        // Pill background
        const px = 5;
        const py = 2;
        ctx.fillStyle = "rgba(10, 16, 37, 0.85)";
        ctx.strokeStyle = "rgba(56, 189, 248, 0.3)";
        ctx.lineWidth = 1;

        const w = metrics.width + px * 2;
        const h = fontSize + py * 2;
        ctx.beginPath();
        if (ctx.roundRect) {
          ctx.roundRect(-w / 2, -h / 2, w, h, 4);
        } else {
          ctx.rect(-w / 2, -h / 2, w, h);
        }
        ctx.fill();
        ctx.stroke();

        // Label text
        ctx.fillStyle = "#94a3b8";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(text, 0, 0);

        ctx.restore();
      });

      // Handle window resize
      const handleResize = () => {
        if (!containerRef.current || !graphInstanceRef.current) return;
        graphInstanceRef.current
          .width(containerRef.current.clientWidth)
          .height(containerRef.current.clientHeight);
      };
      window.addEventListener("resize", handleResize);

      // Supply formatted graph data
      updateGraphData();

      // Zoom to fit after settling
      setTimeout(() => {
        if (graphInstanceRef.current && isMounted) {
          graphInstanceRef.current.zoomToFit(400, 50);
        }
      }, 500);

      return () => {
        window.removeEventListener("resize", handleResize);
      };
    }

    initGraph();

    return () => {
      isMounted = false;
      if (graphInstanceRef.current) {
        graphInstanceRef.current._destructor?.();
        graphInstanceRef.current = null;
      }
    };
  }, []);

  // Update data when persons or relationships change
  const updateGraphData = useCallback(() => {
    if (!graphInstanceRef.current) return;

    const filteredPersons = persons.filter((p) => {
      if (filterRelation === "all") return true;
      return p.relation.toLowerCase().includes(filterRelation.toLowerCase());
    });

    const nodes = filteredPersons.map((p) => {
      const isCenter =
        p.relation.toLowerCase().includes("девушка") ||
        p.name.toLowerCase().includes("лиза");

      return {
        id: p.id,
        name: p.name,
        relation: p.relation,
        isCenter,
        rawPerson: p,
      };
    });

    const nodeIds = new Set(nodes.map((n) => n.id));

    const links = relationships
      .filter((r) => nodeIds.has(r.sourceId) && nodeIds.has(r.targetId))
      .map((r) => ({
        id: r.id,
        source: r.sourceId,
        target: r.targetId,
        label: r.label,
      }));

    graphInstanceRef.current.graphData({ nodes, links });
  }, [persons, relationships, filterRelation]);

  useEffect(() => {
    updateGraphData();
  }, [persons, relationships, filterRelation, updateGraphData]);

  // Controls
  const handleZoomIn = () => {
    if (!graphInstanceRef.current) return;
    graphInstanceRef.current.zoom(graphInstanceRef.current.zoom() * 1.3, 300);
  };

  const handleZoomOut = () => {
    if (!graphInstanceRef.current) return;
    graphInstanceRef.current.zoom(graphInstanceRef.current.zoom() / 1.3, 300);
  };

  const handleFit = () => {
    if (!graphInstanceRef.current) return;
    graphInstanceRef.current.zoomToFit(400, 60);
  };

  const handleCenterLiza = () => {
    if (!graphInstanceRef.current) return;
    const lizaNode = persons.find(
      (p) =>
        p.relation.toLowerCase().includes("девушка") ||
        p.name.toLowerCase().includes("лиза")
    );
    if (lizaNode) {
      const gData = graphInstanceRef.current.graphData();
      const node = gData.nodes.find((n: any) => n.id === lizaNode.id);
      if (node && typeof node.x === "number") {
        graphInstanceRef.current.centerAt(node.x, node.y, 600);
        graphInstanceRef.current.zoom(1.8, 600);
        onSelectPerson(lizaNode);
      }
    }
  };

  return (
    <div className="relative w-full h-full overflow-hidden select-none">
      {/* Visual Canvas Container */}
      <div ref={containerRef} className="w-full h-full cyber-grid" />

      {/* Top Search & Filter Bar */}
      <div className="absolute top-4 left-4 z-10 flex flex-wrap items-center gap-2">
        <div className="flex items-center gap-2 px-3 py-1.5 glass-panel rounded-xl shadow-lg border border-sky-500/20 text-sm">
          <Search className="w-4 h-4 text-sky-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Поиск по имени или хобби..."
            className="bg-transparent border-none text-slate-100 placeholder-slate-400 text-xs sm:text-sm focus:outline-none w-40 sm:w-56"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="text-xs text-slate-400 hover:text-white"
            >
              ✕
            </button>
          )}
        </div>

        {/* Filter chips */}
        <div className="hidden sm:flex items-center gap-1.5 p-1 glass-panel rounded-xl text-xs">
          <Filter className="w-3.5 h-3.5 text-slate-400 ml-1.5" />
          {[
            { id: "all", label: "Все" },
            { id: "мама", label: "Родители" },
            { id: "брат", label: "Брат/Сестра" },
            { id: "друг", label: "Друзья" },
          ].map((f) => (
            <button
              key={f.id}
              onClick={() => setFilterRelation(f.id)}
              className={`px-2.5 py-1 rounded-lg transition-colors ${
                filterRelation === f.id
                  ? "bg-sky-500/30 text-sky-300 font-medium border border-sky-400/40"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Floating Center Badge */}
      <div className="absolute top-4 right-4 z-10 hidden md:flex items-center gap-2 px-3 py-1.5 glass-panel rounded-xl text-xs text-pink-300 border border-pink-500/30">
        <Sparkles className="w-3.5 h-3.5 text-pink-400 animate-spin" />
        <span>Центральный узел: <strong>Лиза</strong></span>
      </div>

      {/* Navigation & Zoom Controls (Bottom-Left) */}
      <div className="absolute bottom-6 left-6 z-10 flex flex-col gap-2">
        <div className="flex flex-col gap-1 p-1.5 glass-panel rounded-2xl shadow-2xl border border-sky-500/20">
          <button
            onClick={handleCenterLiza}
            title="Центрировать на Лизе"
            className="p-2.5 rounded-xl bg-pink-500/10 hover:bg-pink-500/25 text-pink-300 transition-all flex items-center justify-center group relative"
          >
            <Crosshair className="w-5 h-5 group-hover:scale-110 transition-transform" />
            <span className="absolute left-full ml-2 px-2 py-1 glass-panel rounded text-[11px] text-pink-200 whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity">
              Фокус на Лизе
            </span>
          </button>

          <div className="h-px bg-slate-700/50 my-0.5" />

          <button
            onClick={handleZoomIn}
            title="Приблизить"
            className="p-2.5 rounded-xl hover:bg-sky-500/20 text-slate-300 hover:text-sky-300 transition-colors flex items-center justify-center"
          >
            <ZoomIn className="w-5 h-5" />
          </button>
          <button
            onClick={handleZoomOut}
            title="Отдалить"
            className="p-2.5 rounded-xl hover:bg-sky-500/20 text-slate-300 hover:text-sky-300 transition-colors flex items-center justify-center"
          >
            <ZoomOut className="w-5 h-5" />
          </button>
          <button
            onClick={handleFit}
            title="Вписать всю карту"
            className="p-2.5 rounded-xl hover:bg-sky-500/20 text-slate-300 hover:text-sky-300 transition-colors flex items-center justify-center"
          >
            <Maximize2 className="w-5 h-5" />
          </button>
        </div>

        {/* Legend Hint */}
        <div className="px-3 py-2 glass-panel rounded-xl text-[11px] text-slate-400 flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-pink-500 shadow-sm shadow-pink-500" />
            <span>Лиза</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500 shadow-sm shadow-amber-500" />
            <span>Родители</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 shadow-sm shadow-cyan-400" />
            <span>Брат / Сестра</span>
          </div>
        </div>
      </div>

      {/* Hover preview tooltip */}
      {hoveredNode && (
        <div className="pointer-events-none absolute bottom-6 right-6 z-10 p-3 glass-panel rounded-xl border border-sky-400/30 max-w-xs shadow-2xl animate-in fade-in zoom-in-95 duration-150">
          <div className="text-xs font-semibold text-sky-300 flex items-center gap-1.5">
            <span>{hoveredNode.name}</span>
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-sky-500/20 text-sky-200">
              {hoveredNode.relation}
            </span>
          </div>
          {hoveredNode.hobbies?.length > 0 && (
            <p className="text-[11px] text-slate-300 mt-1 line-clamp-1">
              🎨 {hoveredNode.hobbies.join(", ")}
            </p>
          )}
          <p className="text-[10px] text-slate-400 mt-1">Кликните для деталей</p>
        </div>
      )}
    </div>
  );
}
