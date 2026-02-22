"use client";

import { useState, useCallback } from "react";
import { useAtom, useSetAtom, useAtomValue } from "jotai";
import { motion, AnimatePresence } from "framer-motion";
import { Heart, Monitor, Cpu, Check, X, Image as ImageIcon, RotateCcw } from "lucide-react";
import { useIsMobile } from "@/hooks/useIsMobile";
import { useUptime } from "@/hooks/useUptime";
import { wallpaperAtom, savePreferenceAtom, customIconsAtom, iconThemeAtom } from "@/store/atoms/desktop";
import { currentUserAtom } from "@/store/atoms/user";
import { APP_REGISTRY } from "@/config/appRegistry";
import {
  WALLPAPER_GALLERY,
  selectedWallpaperIdAtom,
} from "@/store/atoms/settings";

// ─── Tab definitions ───
type SettingsTab = "about" | "appearance" | "system";

const TABS: { id: SettingsTab; label: string }[] = [
  { id: "about", label: "The Heart" },
  { id: "appearance", label: "Appearance" },
  { id: "system", label: "System Specs" },
];

// ─── About Tab ───
function AboutTab() {
  const uptime = useUptime();

  return (
    <div className="flex flex-col items-center justify-center h-full gap-6 p-4">
      <motion.div
        animate={{ scale: [1, 1.15, 1] }}
        transition={{ duration: 1.2, repeat: Infinity, ease: "easeInOut" }}
      >
        <Heart className="w-20 h-20 text-rose-500 fill-rose-500 drop-shadow-lg" />
      </motion.div>

      <div className="text-center">
        <h2
          className="text-2xl md:text-3xl text-rose-700 mb-1"
          style={{ fontFamily: "var(--font-dancing-script)" }}
        >
          System Uptime
        </h2>
        <p className="text-xs text-rose-400 mb-4">Time since first heartbeat</p>

        <div className="flex flex-wrap justify-center gap-3">
          <UptimeUnit value={uptime.years} label="Years" />
          <UptimeUnit value={uptime.days} label="Days" />
          <UptimeUnit value={uptime.hours} label="Hrs" />
          <UptimeUnit value={uptime.minutes} label="Mins" />
          <UptimeUnit value={uptime.seconds} label="Secs" />
        </div>
      </div>

      <p
        className="text-lg text-rose-500/80 mt-2"
        style={{ fontFamily: "var(--font-dancing-script)" }}
      >
        Running on Love v1.0
      </p>
    </div>
  );
}

function UptimeUnit({ value, label }: { value: number; label: string }) {
  return (
    <div className="flex flex-col items-center bg-rose-50 rounded-lg px-3 py-2 min-w-[56px] shadow-sm border border-rose-100">
      <span className="text-xl md:text-2xl font-bold text-rose-700 tabular-nums">
        {String(value).padStart(2, "0")}
      </span>
      <span className="text-[10px] uppercase tracking-wider text-rose-400 font-medium">
        {label}
      </span>
    </div>
  );
}

// ─── Appearance Tab ───
function AppearanceTab() {
  const setWallpaper = useSetAtom(wallpaperAtom);
  const selectedId = useAtomValue(selectedWallpaperIdAtom);
  const setSelectedId = useSetAtom(selectedWallpaperIdAtom);
  const savePreference = useSetAtom(savePreferenceAtom);
  const [currentUser] = useAtom(currentUserAtom);
  
  const [customIcons, setCustomIcons] = useAtom(customIconsAtom);
  const [iconTheme, setIconTheme] = useAtom(iconThemeAtom);
  const [editingAppId, setEditingAppId] = useState<string | null>(null);
  const [iconUrlInput, setIconUrlInput] = useState("");

  const handleSelectWallpaper = useCallback(
    (id: string, url: string) => {
      setSelectedId(id);
      setWallpaper(`url(${url})`);
      
      // Save to Supabase for persistence
      if (currentUser) {
        const userAlias = currentUser === "Mduduzi" ? "admin" : "neo";
        savePreference({ userAlias, key: "wallpaper_url", value: `url(${url})` });
      }
    },
    [setWallpaper, setSelectedId, savePreference, currentUser]
  );

  const handleSaveIcon = () => {
    if (editingAppId && iconUrlInput) {
      const newIcons = { ...customIcons, [editingAppId]: iconUrlInput };
      setCustomIcons(newIcons);
      if (currentUser) {
         const userAlias = currentUser === "Mduduzi" ? "admin" : "neo";
         savePreference({ userAlias, key: "custom_icons", value: newIcons });
      }
      setEditingAppId(null);
      setIconUrlInput("");
    }
  };

  const handleResetIcon = (appId: string) => {
    const newIcons = { ...customIcons };
    delete newIcons[appId];
    setCustomIcons(newIcons);
    if (currentUser) {
        const userAlias = currentUser === "Mduduzi" ? "admin" : "neo";
        savePreference({ userAlias, key: "custom_icons", value: newIcons });
    }
  };

  return (
    <div className="p-4 h-full overflow-y-auto space-y-8">
      {/* Wallpapers Section */}
      <section>
        <h2
            className="text-xl text-rose-700 mb-1"
            style={{ fontFamily: "var(--font-dancing-script)" }}
        >
            Wallpapers
        </h2>
        <p className="text-xs text-gray-400 mb-4">Choose your backdrop</p>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {WALLPAPER_GALLERY.map((wp) => (
            <button
                key={wp.id}
                onClick={() => handleSelectWallpaper(wp.id, wp.url)}
                className={`relative group rounded-lg overflow-hidden aspect-video border-2 transition-all ${
                selectedId === wp.id
                    ? "border-rose-500 shadow-lg shadow-rose-200"
                    : "border-transparent hover:border-rose-300"
                }`}
            >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                src={wp.url}
                alt={wp.label}
                className="w-full h-full object-cover"
                loading="lazy"
                />
                <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors" />
                <span className="absolute bottom-1 left-1 right-1 text-[10px] text-white font-medium drop-shadow-md truncate">
                {wp.label}
                </span>
                {selectedId === wp.id && (
                <div className="absolute top-1.5 right-1.5 w-5 h-5 bg-rose-500 rounded-full flex items-center justify-center">
                    <Check className="w-3 h-3 text-white" />
                </div>
                )}
            </button>
            ))}
        </div>
      </section>

      {/* Icon Theme Section */}
      <section>
        <h2
            className="text-xl text-rose-700 mb-1"
            style={{ fontFamily: "var(--font-dancing-script)" }}
        >
            Icon Theme
        </h2>
        <p className="text-xs text-gray-400 mb-4">Select a style</p>
        <div className="flex flex-wrap gap-2">
            {["default", "water-gel", "flat", "neon"].map((theme) => (
                <button
                    key={theme}
                    onClick={() => {
                        setIconTheme(theme);
                         if (currentUser) {
                            const userAlias = currentUser === "Mduduzi" ? "admin" : "neo";
                            savePreference({ userAlias, key: "icon_theme", value: theme });
                        }
                    }}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all capitalize ${
                        (iconTheme || "default") === theme
                            ? "bg-rose-500 text-white border-rose-500"
                            : "bg-white/50 text-rose-600 border-rose-200 hover:border-rose-400"
                    }`}
                >
                    {theme.replace("-", " ")}
                </button>
            ))}
        </div>
      </section>

      {/* Icons Section */}
      <section>
        <h2
            className="text-xl text-rose-700 mb-1"
            style={{ fontFamily: "var(--font-dancing-script)" }}
        >
            App Icons
        </h2>
        <p className="text-xs text-gray-400 mb-4">Customize your icons</p>
        
        <div className="grid grid-cols-1 gap-2">
            {APP_REGISTRY.map((app) => {
                const CustomIcon = customIcons[app.id];
                const DefaultIcon = app.icon;
                const isEditing = editingAppId === app.id;

                return (
                    <div key={app.id} className="flex items-center gap-3 p-2 rounded-lg bg-rose-50/50 border border-rose-100/50 hover:bg-rose-50 transition-colors">
                        <div className="w-10 h-10 flex items-center justify-center rounded-xl bg-white border border-rose-100 overflow-hidden shrink-0 relative">
                             {CustomIcon ? (
                                <img src={CustomIcon} alt={app.name} className="w-full h-full object-cover" />
                             ) : (
                                <DefaultIcon className="w-5 h-5 text-rose-500" />
                             )}
                        </div>
                        
                        <div className="flex-1 min-w-0">
                            <h3 className="text-sm font-medium text-rose-900">{app.name}</h3>
                            {isEditing ? (
                                <div className="flex gap-2 mt-1">
                                    <input 
                                        type="text" 
                                        placeholder="Image URL..." 
                                        className="flex-1 text-xs px-2 py-1 rounded border border-rose-200 focus:outline-none focus:border-rose-400 bg-white/80"
                                        value={iconUrlInput}
                                        onChange={(e) => setIconUrlInput(e.target.value)}
                                        autoFocus
                                    />
                                    <button 
                                        onClick={handleSaveIcon}
                                        className="p-1 rounded bg-rose-500 text-white hover:bg-rose-600"
                                    >
                                        <Check className="w-3 h-3" />
                                    </button>
                                    <button 
                                        onClick={() => {
                                            setEditingAppId(null); 
                                            setIconUrlInput("");
                                        }}
                                        className="p-1 rounded bg-gray-200 text-gray-600 hover:bg-gray-300"
                                    >
                                        <X className="w-3 h-3" />
                                    </button>
                                </div>
                            ) : (
                                <p className="text-xs text-rose-400 truncate">
                                    {CustomIcon ? "Custom Icon" : "Default"}
                                </p>
                            )}
                        </div>

                        {!isEditing && (
                            <div className="flex gap-1">
                                <button
                                    onClick={() => {
                                        setEditingAppId(app.id);
                                        setIconUrlInput(customIcons[app.id] || "");
                                    }}
                                    className="p-1.5 rounded-md hover:bg-rose-100 text-rose-500 transition-colors"
                                    title="Edit Icon"
                                >
                                    <ImageIcon className="w-4 h-4" />
                                </button>
                                {CustomIcon && (
                                    <button
                                        onClick={() => handleResetIcon(app.id)}
                                        className="p-1.5 rounded-md hover:bg-rose-100 text-rose-500 transition-colors"
                                        title="Reset to Default"
                                    >
                                        <RotateCcw className="w-4 h-4" />
                                    </button>
                                )}
                            </div>
                        )}
                    </div>
                );
            })}
        </div>
      </section>
    </div>
  );
}

// ─── System Specs Tab ───
function SystemTab() {
  const specs = [
    { label: "Processor", value: "Heartbeat 5.0GHz", icon: Cpu },
    { label: "Memory", value: "Infinite Memories", icon: Cpu },
    { label: "Graphics", value: "Rose-Tinted Glasses", icon: Monitor },
    { label: "Storage", value: "Bottomless Love", icon: Cpu },
    { label: "OS Version", value: "ValentineOS 1.0", icon: Heart },
    { label: "Kernel", value: "Cupid Core 14.2", icon: Heart },
  ];

  return (
    <div className="p-4 h-full overflow-y-auto">
      <h2
        className="text-xl text-rose-700 mb-1"
        style={{ fontFamily: "var(--font-dancing-script)" }}
      >
        System Specs
      </h2>
      <p className="text-xs text-gray-400 mb-4">What powers this love machine</p>

      <div className="space-y-2">
        {specs.map((spec) => {
          const Icon = spec.icon;
          return (
            <div
              key={spec.label}
              className="flex items-center gap-3 p-3 rounded-lg bg-rose-50/80 border border-rose-100"
            >
              <Icon className="w-4 h-4 text-rose-400 shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-xs text-rose-400">{spec.label}</p>
                <p className="text-sm font-medium text-rose-700 truncate">{spec.value}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Main Settings Component ───
export function SettingsApp() {
  const [activeTab, setActiveTab] = useState<SettingsTab>("about");
  const isMobile = useIsMobile();

  const content = (() => {
    switch (activeTab) {
      case "about":
        return <AboutTab />;
      case "appearance":
        return <AppearanceTab />;
      case "system":
        return <SystemTab />;
    }
  })();

  if (isMobile) {
    return (
      <div className="flex flex-col h-full bg-transparent">
        {/* Mobile: horizontal tab bar */}
        <div className="flex gap-1 p-2 bg-white/60 backdrop-blur-sm border-b border-rose-100 shrink-0 overflow-x-auto">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${
                activeTab === tab.id
                  ? "bg-rose-500 text-white"
                  : "bg-white/60 text-rose-600 hover:bg-rose-100"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
        <div className="flex-1 overflow-hidden">{content}</div>
      </div>
    );
  }

  return (
    <div className="flex h-full bg-transparent">
      {/* Desktop: left sidebar */}
      <div className="w-44 bg-white/10 backdrop-blur-md border-r border-rose-100 p-3 flex flex-col gap-1 shrink-0">
        <span className="text-[10px] font-semibold uppercase tracking-wider text-rose-300 px-2 pt-1 pb-2">
          Preferences
        </span>
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`text-left px-3 py-2 rounded-lg text-sm transition-colors ${
              activeTab === tab.id
                ? "bg-rose-500 text-white font-medium"
                : "text-rose-700 hover:bg-rose-100"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>
      <div className="flex-1 overflow-hidden">{content}</div>
    </div>
  );
}
