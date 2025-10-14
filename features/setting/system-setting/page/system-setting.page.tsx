"use client";

import React, { useState, useEffect } from "react";
import {
  Moon,
  Sun,
  Monitor,
  Type,
  Palette,
  Globe,
  Bell,
  Volume2,
  Check,
  Sparkles,
  Flame,
  Leaf,
  Waves,
  Settings,
  RotateCcw,
} from "lucide-react";

const SystemSettingPage = () => {
  // Theme presets
  const themePresets: any = {
    ocean: {
      name: "Okean",
      icon: Waves,
      colors: {
        primary: "#0ea5e9",
        primaryDark: "#0284c7",
        primaryLight: "#38bdf8",
        secondary: "#06b6d4",
        accent: "#0891b2",
      },
    },
    sunset: {
      name: "Quyosh botishi",
      icon: Flame,
      colors: {
        primary: "#f97316",
        primaryDark: "#ea580c",
        primaryLight: "#fb923c",
        secondary: "#f59e0b",
        accent: "#fbbf24",
      },
    },
    forest: {
      name: "O'rmon",
      icon: Leaf,
      colors: {
        primary: "#10b981",
        primaryDark: "#059669",
        primaryLight: "#34d399",
        secondary: "#22c55e",
        accent: "#16a34a",
      },
    },
    galaxy: {
      name: "Galaktika",
      icon: Sparkles,
      colors: {
        primary: "#8b5cf6",
        primaryDark: "#7c3aed",
        primaryLight: "#a78bfa",
        secondary: "#a855f7",
        accent: "#9333ea",
      },
    },
  };

  // Initialize state from localStorage with fallbacks
  const getInitialState = (key: string, defaultValue: string | boolean) => {
    if (typeof window === "undefined") return defaultValue;
    try {
      const saved = localStorage.getItem(key);
      return saved ? JSON.parse(saved) : defaultValue;
    } catch {
      return defaultValue;
    }
  };

  // State with localStorage initialization
  const [darkMode, setDarkMode] = useState(() =>
    getInitialState("darkMode", false),
  );
  const [themePreset, setThemePreset] = useState(() =>
    getInitialState("themePreset", "ocean"),
  );
  const [fontSize, setFontSize] = useState(() =>
    getInitialState("fontSize", "medium"),
  );
  const [fontFamily, setFontFamily] = useState(() =>
    getInitialState("fontFamily", "system"),
  );
  const [language, setLanguage] = useState(() =>
    getInitialState("language", "uz"),
  );
  const [soundEnabled, setSoundEnabled] = useState(() =>
    getInitialState("soundEnabled", true),
  );
  const [notifications, setNotifications] = useState(() =>
    getInitialState("notifications", true),
  );

  const fontSizes: { [key: string]: { label: string; size: string } } = {
    "juda-kichik": { label: "Juda kichik", size: "12px" },
    kichik: { label: "Kichik", size: "14px" },
    medium: { label: "O'rtacha", size: "16px" },
    katta: { label: "Katta", size: "18px" },
    "juda-katta": { label: "Juda katta", size: "20px" },
  };

  const fontFamilies: any = {
    system: {
      label: "Tizim shrifti",
      value:
        '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    },
    inter: { label: "Inter", value: "Inter, sans-serif" },
    roboto: { label: "Roboto", value: "Roboto, sans-serif" },
    poppins: { label: "Poppins", value: "Poppins, sans-serif" },
    georgia: { label: "Georgia", value: "Georgia, serif" },
  };

  // Save to localStorage helper
  const saveToLocalStorage = (key: string, value: any) => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (e) {
      console.error("LocalStorage save error:", e);
    }
  };

  // Apply dark mode
  useEffect(() => {
    const root = document.documentElement;
    if (darkMode) {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
    saveToLocalStorage("darkMode", darkMode);
  }, [darkMode]);

  // Apply theme preset colors
  useEffect(() => {
    const root = document.documentElement;
    const colors = themePresets[themePreset].colors;

    root.style.setProperty("--primary", colors.primary);
    root.style.setProperty("--primary-dark", colors.primaryDark);
    root.style.setProperty("--primary-light", colors.primaryLight);
    root.style.setProperty("--secondary", colors.secondary);
    root.style.setProperty("--accent", colors.accent);

    saveToLocalStorage("themePreset", themePreset);
  }, [themePreset]);

  // Apply font size
  useEffect(() => {
    const root = document.documentElement;
    root.style.fontSize = fontSizes[fontSize].size;
    saveToLocalStorage("fontSize", fontSize);
  }, [fontSize]);

  // Apply font family
  useEffect(() => {
    const root = document.documentElement;
    root.style.fontFamily = fontFamilies[fontFamily].value;
    saveToLocalStorage("fontFamily", fontFamily);
  }, [fontFamily]);

  // Save other settings
  useEffect(() => {
    saveToLocalStorage("language", language);
  }, [language]);

  useEffect(() => {
    saveToLocalStorage("soundEnabled", soundEnabled);
  }, [soundEnabled]);

  useEffect(() => {
    saveToLocalStorage("notifications", notifications);
  }, [notifications]);

  // Reset all settings
  const resetAllSettings = () => {
    setDarkMode(false);
    setThemePreset("ocean");
    setFontSize("medium");
    setFontFamily("system");
    setLanguage("uz");
    setSoundEnabled(true);
    setNotifications(true);

    // Clear localStorage
    localStorage.clear();

    // Show success feedback
    alert("Barcha sozlamalar qayta tiklandi!");
  };

  const ToggleSwitch = ({
    enabled,
    onChange,
  }: {
    enabled: boolean;
    onChange: any;
  }) => (
    <button
      onClick={() => onChange(!enabled)}
      className={`
        relative inline-flex h-6 w-11 items-center rounded-full transition-all duration-300
        ${enabled ? "bg-primary" : "bg-gray-300 dark:bg-gray-600"}
      `}
    >
      <span
        className={`
          inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-300
          ${enabled ? "translate-x-6" : "translate-x-1"}
        `}
      />
    </button>
  );

  const SettingCard = ({ icon: Icon, title, children }: any) => (
    <div className="bg-card rounded-xl border border-border p-6 hover:shadow-lg transition-all duration-300">
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 rounded-lg bg-primary/10">
          <Icon className="h-5 w-5 text-primary" />
        </div>
        <h3 className="text-lg font-semibold">{title}</h3>
      </div>
      <div className="space-y-4">{children}</div>
    </div>
  );

  return (
    <div className=" bg-background transition-colors duration-300">
      <div>
        <div className="grid gap-6 md:grid-cols-2">
          {/* Appearance Settings */}
          <SettingCard icon={Palette} title="Tashqi ko'rinish">
            {/* Dark Mode Toggle */}
            <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
              <div className="flex items-center gap-3">
                {darkMode ? (
                  <Moon className="h-5 w-5 text-primary" />
                ) : (
                  <Sun className="h-5 w-5 text-primary" />
                )}
                <div>
                  <span className="font-medium">
                    {darkMode ? "Tungi rejim" : "Kunduzgi rejim"}
                  </span>
                  <p className="text-xs text-muted-foreground">
                    {darkMode ? "Qorong'u mavzu faol" : "Yorug' mavzu faol"}
                  </p>
                </div>
              </div>
              <ToggleSwitch enabled={darkMode} onChange={setDarkMode} />
            </div>

            {/* Theme Presets */}
            <div>
              <label className="text-sm font-medium mb-3 block">
                Rang sxemasi
              </label>
              <div className="grid grid-cols-2 gap-3">
                {Object.entries(themePresets).map(([key, preset]: any) => {
                  const Icon = preset.icon;
                  return (
                    <button
                      key={key}
                      onClick={() => setThemePreset(key)}
                      className={`
                        p-3 rounded-lg border-2 transition-all duration-300
                        ${
                          themePreset === key
                            ? "border-primary bg-primary/10 shadow-md scale-105"
                            : "border-border hover:border-primary/50 hover:bg-muted/50"
                        }
                      `}
                    >
                      <Icon
                        className="h-6 w-6 mx-auto mb-2"
                        style={{ color: preset.colors.primary }}
                      />
                      <span className="text-sm font-medium block">
                        {preset.name}
                      </span>
                      <div className="flex justify-center gap-1 mt-2">
                        {Object.values(preset.colors)
                          .slice(0, 3)
                          .map((color: any, i) => (
                            <div
                              key={i}
                              className="h-3 w-3 rounded-full"
                              style={{ backgroundColor: color }}
                            />
                          ))}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </SettingCard>

          {/* Font Settings */}
          <SettingCard icon={Type} title="Shrift sozlamalari">
            {/* Font Size */}
            <div>
              <label className="text-sm font-medium mb-3 block">
                Shrift o'lchami
              </label>
              <div className="space-y-2">
                {Object.entries(fontSizes).map(([key, config]) => (
                  <label
                    key={key}
                    className={`
                      flex items-center justify-between p-3 rounded-lg cursor-pointer transition-all
                      ${
                        fontSize === key
                          ? "bg-primary/10 border-2 border-primary"
                          : "bg-muted/50 border-2 border-transparent hover:bg-muted"
                      }
                    `}
                  >
                    <div className="flex items-center gap-3">
                      <input
                        type="radio"
                        name="fontSize"
                        value={key}
                        checked={fontSize === key}
                        onChange={(e) => setFontSize(e.target.value)}
                        className="sr-only"
                      />
                      <span
                        className="font-medium"
                        style={{ fontSize: config.size }}
                      >
                        {config.label}
                      </span>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {config.size}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {/* Font Family */}
            <div>
              <label className="text-sm font-medium mb-3 block">
                Shrift turi
              </label>
              <select
                value={fontFamily}
                onChange={(e) => setFontFamily(e.target.value)}
                className="w-full px-4 py-2.5 rounded-lg bg-input border border-input-border focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                style={{ fontFamily: fontFamilies[fontFamily].value }}
              >
                {Object.entries(fontFamilies).map(([key, config]: any) => (
                  <option
                    key={key}
                    value={key}
                    style={{ fontFamily: config.value }}
                  >
                    {config.label}
                  </option>
                ))}
              </select>
            </div>
          </SettingCard>

          {/* Language Settings */}
          <SettingCard icon={Globe} title="Til sozlamalari">
            <div>
              <label className="text-sm font-medium mb-3 block">
                Interfeys tili
              </label>
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="w-full px-4 py-2.5 rounded-lg bg-input border border-input-border focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
              >
                <option value="uz">🇺🇿 O'zbekcha</option>
                <option value="en">🇬🇧 English</option>
                <option value="ru">🇷🇺 Русский</option>
                <option value="tr">🇹🇷 Türkçe</option>
              </select>
            </div>

            <div className="p-3 rounded-lg bg-info/10 border border-info/20">
              <p className="text-sm text-info-foreground">
                Tanlangan til:{" "}
                <strong>
                  {language === "uz"
                    ? "O'zbekcha"
                    : language === "en"
                      ? "English"
                      : language === "ru"
                        ? "Русский"
                        : "Türkçe"}
                </strong>
              </p>
            </div>
          </SettingCard>

          {/* Notification Settings */}
          <SettingCard icon={Bell} title="Bildirishnomalar">
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                <div className="flex items-center gap-3">
                  <Bell className="h-5 w-5 text-primary" />
                  <div>
                    <span className="font-medium">Bildirishnomalar</span>
                    <p className="text-xs text-muted-foreground">
                      Yangiliklar haqida xabar olish
                    </p>
                  </div>
                </div>
                <ToggleSwitch
                  enabled={notifications}
                  onChange={setNotifications}
                />
              </div>

              <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                <div className="flex items-center gap-3">
                  <Volume2 className="h-5 w-5 text-primary" />
                  <div>
                    <span className="font-medium">Ovozli signal</span>
                    <p className="text-xs text-muted-foreground">
                      Xabar kelganda ovoz chiqarish
                    </p>
                  </div>
                </div>
                <ToggleSwitch
                  enabled={soundEnabled}
                  onChange={setSoundEnabled}
                />
              </div>
            </div>
          </SettingCard>
        </div>

        {/* Current Settings Preview */}
        <div className="mt-8 p-6 rounded-xl bg-card border border-border">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Settings className="h-5 w-5 text-primary" />
            Joriy sozlamalar
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-3 rounded-lg bg-muted/50">
              <span className="text-xs text-muted-foreground block mb-1">
                Mavzu
              </span>
              <span className="font-medium">
                {darkMode ? "Tungi" : "Kunduzgi"}
              </span>
            </div>
            <div className="p-3 rounded-lg bg-muted/50">
              <span className="text-xs text-muted-foreground block mb-1">
                Rang
              </span>
              <span className="font-medium">
                {themePresets[themePreset].name}
              </span>
            </div>
            <div className="p-3 rounded-lg bg-muted/50">
              <span className="text-xs text-muted-foreground block mb-1">
                Shrift o'lchami
              </span>
              <span className="font-medium">{fontSizes[fontSize].label}</span>
            </div>
            <div className="p-3 rounded-lg bg-muted/50">
              <span className="text-xs text-muted-foreground block mb-1">
                Shrift
              </span>
              <span className="font-medium">
                {fontFamilies[fontFamily].label}
              </span>
            </div>
          </div>
        </div>

        {/* Save Success Message */}
        <div className="mt-6 p-4 rounded-lg bg-success/10 border border-success/20 flex items-center gap-3">
          <Check className="h-5 w-5 text-success" />
          <p className="text-sm">
            Barcha o'zgarishlar avtomatik saqlanadi va keyingi safar
            kirishingizda qo'llaniladi.
          </p>
        </div>
      </div>
    </div>
  );
};

export default SystemSettingPage;
