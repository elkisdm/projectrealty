"use client";

import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Tooltip } from "@/components/ui/Tooltip";
import { cn } from "@/lib/utils";

interface IntentTabsProps {
  value: "rent" | "buy";
  onChange: (value: "rent" | "buy") => void;
  className?: string;
  variant?: "default" | "subtle";
}

const TABS = [
  { id: "rent" as const, label: "Arrendar", disabled: false },
  { id: "buy" as const, label: "Comprar", disabled: true },
];

export function IntentTabs({ value, onChange, className = "", variant = "default" }: IntentTabsProps) {
  const isSubtle = variant === "subtle";

  return (
    <div className={className}>
      <Tabs value={value} onValueChange={(v) => onChange(v as "rent" | "buy")}>
        <TabsList
          className={cn(
            "grid w-full grid-cols-2",
            isSubtle ? "h-9 bg-muted/50" : "h-10 bg-muted"
          )}
        >
          {TABS.map((tab) =>
            tab.disabled ? (
              <Tooltip key={tab.id} content="Próximamente" side="bottom">
                <span className="inline-flex w-full">
                  <TabsTrigger
                    value={tab.id}
                    disabled
                    className={cn(
                      "w-full data-[state=active]:bg-primary data-[state=active]:text-primary-foreground",
                      isSubtle && "text-xs"
                    )}
                  >
                    {tab.label}
                  </TabsTrigger>
                </span>
              </Tooltip>
            ) : (
              <TabsTrigger
                key={tab.id}
                value={tab.id}
                className={cn(
                  "data-[state=active]:bg-primary data-[state=active]:text-primary-foreground",
                  isSubtle && "text-xs"
                )}
              >
                {tab.label}
              </TabsTrigger>
            )
          )}
        </TabsList>
      </Tabs>
    </div>
  );
}
