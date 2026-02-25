"use client";

import React, { useState, useRef, useEffect } from "react";
import type { Unit, Building } from "@schemas/models";
import { PropertyDetailTab } from "./PropertyDetailTab";
import { PropertyLocationTab } from "./PropertyLocationTab";
import { PropertyAmenitiesTab } from "./PropertyAmenitiesTab";
import { PropertyRequirementsTab } from "./PropertyRequirementsTab";

interface PropertyTabsProps {
  unit: Unit;
  building: Building;
  className?: string;
}

type TabId = "detalle" | "ubicacion" | "caracteristicas" | "requisitos";

interface Tab {
  id: TabId;
  label: string;
  component: React.ReactNode;
}

export function PropertyTabs({ unit, building, className = "" }: PropertyTabsProps) {
  const [activeTab, setActiveTab] = useState<TabId>("detalle");
  const tabsRef = useRef<HTMLDivElement>(null);
  const [tabsScrollable, setTabsScrollable] = useState(false);

  // Verificar si los tabs son scrollables en mobile
  useEffect(() => {
    const checkScrollable = () => {
      if (tabsRef.current) {
        setTabsScrollable(
          tabsRef.current.scrollWidth > tabsRef.current.clientWidth
        );
      }
    };

    checkScrollable();
    window.addEventListener("resize", checkScrollable);
    return () => window.removeEventListener("resize", checkScrollable);
  }, []);

  const tabs: Tab[] = [
    {
      id: "detalle",
      label: "Detalle",
      component: <PropertyDetailTab unit={unit} building={building} />
    },
    {
      id: "ubicacion",
      label: "Ubicación",
      component: <PropertyLocationTab building={building} />
    },
    {
      id: "caracteristicas",
      label: "Características",
      component: <PropertyAmenitiesTab unit={unit} building={building} />
    },
    {
      id: "requisitos",
      label: "Requisitos",
      component: <PropertyRequirementsTab unit={unit} building={building} />
    }
  ];

  const handleKeyDown = (e: React.KeyboardEvent, tabId: TabId) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      setActiveTab(tabId);
    } else if (e.key === "ArrowLeft") {
      e.preventDefault();
      const currentIndex = tabs.findIndex(t => t.id === activeTab);
      const prevIndex = currentIndex > 0 ? currentIndex - 1 : tabs.length - 1;
      setActiveTab(tabs[prevIndex].id);
      // Focus en el tab anterior
      const prevTab = document.querySelector(
        `[data-tab-id="${tabs[prevIndex].id}"]`
      ) as HTMLElement;
      prevTab?.focus();
    } else if (e.key === "ArrowRight") {
      e.preventDefault();
      const currentIndex = tabs.findIndex(t => t.id === activeTab);
      const nextIndex = currentIndex < tabs.length - 1 ? currentIndex + 1 : 0;
      setActiveTab(tabs[nextIndex].id);
      // Focus en el tab siguiente
      const nextTab = document.querySelector(
        `[data-tab-id="${tabs[nextIndex].id}"]`
      ) as HTMLElement;
      nextTab?.focus();
    }
  };

  const activeTabContent = tabs.find(t => t.id === activeTab)?.component;

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Tabs Navigation */}
      <div
        ref={tabsRef}
        className={`flex border-b border-border overflow-x-auto scrollbar-hide ${tabsScrollable ? "scroll-smooth" : ""
          }`}
        role="tablist"
        aria-label="Secciones de información de la propiedad"
      >
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              data-tab-id={tab.id}
              role="tab"
              aria-selected={isActive}
              aria-controls={`tabpanel-${tab.id}`}
              id={`tab-${tab.id}`}
              onClick={() => setActiveTab(tab.id)}
              onKeyDown={(e) => handleKeyDown(e, tab.id)}
              className={`
                flex-shrink-0 px-6 py-4 text-sm font-semibold transition-all duration-200
                border-b-2 focus:outline-none focus:ring-2 focus:ring-[#8B6CFF] focus:ring-offset-2
                ${isActive
                  ? "border-[#8B6CFF] text-[#8B6CFF]"
                  : "border-transparent text-text-muted hover:text-text hover:border-border"
                }
              `}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Tab Content */}
      <div
        role="tabpanel"
        id={`tabpanel-${activeTab}`}
        aria-labelledby={`tab-${activeTab}`}
        className="min-h-[400px]"
      >
        {activeTabContent}
      </div>
    </div>
  );
}





