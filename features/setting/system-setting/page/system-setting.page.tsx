"use client";

import React, { useState, useEffect } from "react";
import {
  Moon,
  Sun,
  Monitor,
  Type,
  Palette,
  Eye,
  Accessibility,
  Volume2,
  Contrast,
  MousePointer,
  Keyboard,
  Settings,
  Save,
  RotateCcw,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";

const SystemSettingPage = () => {
  // State for all settings
  const [settings, setSettings] = useState({
    theme: "default",
    darkMode: false,
    fontSize: 16,
    colorblindMode: "none",
    highContrast: false,
    reducedMotion: false,
    autoSave: true,
    soundEnabled: true,
    cursorSize: 1,
    lineHeight: 1.5,
    letterSpacing: 0,
    focusIndicator: true,
  });

  // Load settings from localStorage on mount
  useEffect(() => {
    const savedSettings = localStorage.getItem("systemSettings");
    if (savedSettings) {
      setSettings(JSON.parse(savedSettings));
    }
  }, []);

  // Apply settings to document
  useEffect(() => {
    applySettings(settings);
    if (settings.autoSave) {
      localStorage.setItem("systemSettings", JSON.stringify(settings));
    }
  }, [settings]);

  const applyThemeColors = (themeName: string | number) => {
    const themeColors = {
      default: {
        primary: "oklch(0.546 0.222 162.48)",
        primaryHover: "oklch(0.496 0.222 162.48)",
        ring: "oklch(0.546 0.222 162.48)",
      },
      blue: {
        primary: "oklch(0.628 0.205 225.33)",
        primaryHover: "oklch(0.578 0.205 225.33)",
        ring: "oklch(0.628 0.205 225.33)",
      },
      green: {
        primary: "oklch(0.646 0.18 145.73)",
        primaryHover: "oklch(0.596 0.18 145.73)",
        ring: "oklch(0.646 0.18 145.73)",
      },
      red: {
        primary: "oklch(0.577 0.245 27.325)",
        primaryHover: "oklch(0.527 0.245 27.325)",
        ring: "oklch(0.577 0.245 27.325)",
      },
    };

    // @ts-ignore
    const colors = themeColors[themeName] || themeColors.default;
    document.documentElement.style.setProperty("--primary", colors.primary);
    document.documentElement.style.setProperty(
      "--primary-hover",
      colors.primaryHover,
    );
    document.documentElement.style.setProperty("--ring", colors.ring);
  };

  const applySettings = (settings: {
    theme?: string;
    darkMode: any;
    fontSize: any;
    colorblindMode: any;
    highContrast: any;
    reducedMotion: any;
    autoSave?: boolean;
    soundEnabled?: boolean;
    cursorSize: any;
    lineHeight: any;
    letterSpacing: any;
    focusIndicator: any;
  }) => {
    const root = document.documentElement;

    // Apply dark mode
    if (settings.darkMode) {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }

    // Apply font size
    root.style.fontSize = `${settings.fontSize}px`;

    // Apply line height
    root.style.setProperty("--line-height", settings.lineHeight);

    // Apply letter spacing
    root.style.setProperty("--letter-spacing", `${settings.letterSpacing}px`);

    // Apply colorblind mode
    if (settings.colorblindMode !== "none") {
      root.classList.add(`colorblind-${settings.colorblindMode}`);
    } else {
      root.classList.remove(
        "colorblind-deuteranopia",
        "colorblind-protanopia",
        "colorblind-tritanopia",
      );
    }

    // Apply high contrast
    if (settings.highContrast) {
      root.classList.add("high-contrast");
    } else {
      root.classList.remove("high-contrast");
    }

    // Apply reduced motion
    if (settings.reducedMotion) {
      root.classList.add("reduced-motion");
    } else {
      root.classList.remove("reduced-motion");
    }

    // Apply cursor size
    root.style.setProperty("--cursor-size", settings.cursorSize);

    // Apply focus indicator
    if (settings.focusIndicator) {
      root.classList.add("focus-visible");
    } else {
      root.classList.remove("focus-visible");
    }
  };

  const updateSetting = (key: string, value: string | number | boolean) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  const resetSettings = () => {
    const defaultSettings = {
      theme: "default",
      darkMode: false,
      fontSize: 16,
      colorblindMode: "none",
      highContrast: false,
      reducedMotion: false,
      autoSave: true,
      soundEnabled: true,
      cursorSize: 1,
      lineHeight: 1.5,
      letterSpacing: 0,
      focusIndicator: true,
    };
    setSettings(defaultSettings);
    localStorage.setItem("systemSettings", JSON.stringify(defaultSettings));
  };

  const saveSettings = () => {
    localStorage.setItem("systemSettings", JSON.stringify(settings));
    alert("Sozlamalar saqlandi!");
  };

  return (
    <div className="bg-background">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold tracking-tight flex items-center gap-2">
              <Settings className="h-5 w-5 text-primary" />
              Tizim Sozlamalari
            </h1>
            <p className="text-muted-foreground text-sm mt-1">
              O'zingizga qulay muhitni yarating
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              onClick={resetSettings}
              className="flex items-center gap-2 px-4 py-2 rounded-md border border-border hover:bg-accent transition-colors"
            >
              <RotateCcw className="h-4 w-4" />
              Qayta tiklash
            </Button>
            {!settings.autoSave && (
              <Button
                onClick={saveSettings}
                className="flex items-center gap-2 px-4 py-2 rounded-md bg-primary text-primary-foreground hover:bg-primary-hover transition-colors"
              >
                <Save className="h-4 w-4" />
                Saqlash
              </Button>
            )}
          </div>
        </div>

        {/* Theme Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Palette className="h-5 w-5 text-primary" />
              Ranglar va Ko'rinish
            </CardTitle>
            <CardDescription>
              Rang sxemasini va vizual ko'rinishni sozlang
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Theme Selection with Cards */}
            <div className="space-y-4">
              <Label className="text-base font-semibold">Rang Mavzusi</Label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {/* Default Theme */}
                <button
                  onClick={() => updateSetting("theme", "default")}
                  className={`group relative p-4 rounded-lg border-2 transition-all hover:scale-105 ${
                    settings.theme === "default"
                      ? "border-primary ring-2 ring-primary ring-offset-2"
                      : "border-border hover:border-primary/50"
                  }`}
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-center gap-1 mb-2">
                      <div className="w-8 h-8 rounded-full bg-[oklch(0.546_0.222_162.48)]" />
                      <div className="w-6 h-6 rounded-full bg-[oklch(0.669_0.188_162.48)]" />
                      <div className="w-4 h-4 rounded-full bg-[oklch(0.646_0.18_145.73)]" />
                    </div>
                    <div className="text-center">
                      <p className="font-semibold text-sm">Standart</p>
                      <p className="text-xs text-muted-foreground">
                        Yashil-Ko'k
                      </p>
                    </div>
                  </div>
                  {settings.theme === "default" && (
                    <div className="absolute top-2 right-2">
                      <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                        <svg
                          className="w-3 h-3 text-primary-foreground"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </div>
                    </div>
                  )}
                </button>

                {/* Blue Theme */}
                <button
                  onClick={() => {
                    document.documentElement.style.setProperty(
                      "--primary",
                      "oklch(0.628 0.205 225.33)",
                    );
                    document.documentElement.style.setProperty(
                      "--primary-hover",
                      "oklch(0.578 0.205 225.33)",
                    );
                    document.documentElement.style.setProperty(
                      "--ring",
                      "oklch(0.628 0.205 225.33)",
                    );
                    updateSetting("theme", "blue");
                  }}
                  className={`group relative p-4 rounded-lg border-2 transition-all hover:scale-105 ${
                    settings.theme === "blue"
                      ? "border-[oklch(0.628_0.205_225.33)] ring-2 ring-[oklch(0.628_0.205_225.33)] ring-offset-2"
                      : "border-border hover:border-[oklch(0.628_0.205_225.33)]/50"
                  }`}
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-center gap-1 mb-2">
                      <div className="w-8 h-8 rounded-full bg-[oklch(0.628_0.205_225.33)]" />
                      <div className="w-6 h-6 rounded-full bg-[oklch(0.728_0.205_225.33)]" />
                      <div className="w-4 h-4 rounded-full bg-[oklch(0.528_0.205_225.33)]" />
                    </div>
                    <div className="text-center">
                      <p className="font-semibold text-sm">Ko'k</p>
                      <p className="text-xs text-muted-foreground">Okeani</p>
                    </div>
                  </div>
                  {settings.theme === "blue" && (
                    <div className="absolute top-2 right-2">
                      <div className="w-5 h-5 rounded-full bg-[oklch(0.628_0.205_225.33)] flex items-center justify-center">
                        <svg
                          className="w-3 h-3 text-white"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </div>
                    </div>
                  )}
                </button>

                {/* Green Theme */}
                <button
                  onClick={() => {
                    document.documentElement.style.setProperty(
                      "--primary",
                      "oklch(0.646 0.18 145.73)",
                    );
                    document.documentElement.style.setProperty(
                      "--primary-hover",
                      "oklch(0.596 0.18 145.73)",
                    );
                    document.documentElement.style.setProperty(
                      "--ring",
                      "oklch(0.646 0.18 145.73)",
                    );
                    updateSetting("theme", "green");
                  }}
                  className={`group relative p-4 rounded-lg border-2 transition-all hover:scale-105 ${
                    settings.theme === "green"
                      ? "border-[oklch(0.646_0.18_145.73)] ring-2 ring-[oklch(0.646_0.18_145.73)] ring-offset-2"
                      : "border-border hover:border-[oklch(0.646_0.18_145.73)]/50"
                  }`}
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-center gap-1 mb-2">
                      <div className="w-8 h-8 rounded-full bg-[oklch(0.646_0.18_145.73)]" />
                      <div className="w-6 h-6 rounded-full bg-[oklch(0.746_0.18_145.73)]" />
                      <div className="w-4 h-4 rounded-full bg-[oklch(0.546_0.18_145.73)]" />
                    </div>
                    <div className="text-center">
                      <p className="font-semibold text-sm">Yashil</p>
                      <p className="text-xs text-muted-foreground">Tabiat</p>
                    </div>
                  </div>
                  {settings.theme === "green" && (
                    <div className="absolute top-2 right-2">
                      <div className="w-5 h-5 rounded-full bg-[oklch(0.646_0.18_145.73)] flex items-center justify-center">
                        <svg
                          className="w-3 h-3 text-white"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </div>
                    </div>
                  )}
                </button>

                {/* Red/Pink Theme */}
                <button
                  onClick={() => {
                    document.documentElement.style.setProperty(
                      "--primary",
                      "oklch(0.577 0.245 27.325)",
                    );
                    document.documentElement.style.setProperty(
                      "--primary-hover",
                      "oklch(0.527 0.245 27.325)",
                    );
                    document.documentElement.style.setProperty(
                      "--ring",
                      "oklch(0.577 0.245 27.325)",
                    );
                    updateSetting("theme", "red");
                  }}
                  className={`group relative p-4 rounded-lg border-2 transition-all hover:scale-105 ${
                    settings.theme === "red"
                      ? "border-[oklch(0.577_0.245_27.325)] ring-2 ring-[oklch(0.577_0.245_27.325)] ring-offset-2"
                      : "border-border hover:border-[oklch(0.577_0.245_27.325)]/50"
                  }`}
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-center gap-1 mb-2">
                      <div className="w-8 h-8 rounded-full bg-[oklch(0.577_0.245_27.325)]" />
                      <div className="w-6 h-6 rounded-full bg-[oklch(0.677_0.245_27.325)]" />
                      <div className="w-4 h-4 rounded-full bg-[oklch(0.477_0.245_27.325)]" />
                    </div>
                    <div className="text-center">
                      <p className="font-semibold text-sm">Qizil</p>
                      <p className="text-xs text-muted-foreground">Energiya</p>
                    </div>
                  </div>
                  {settings.theme === "red" && (
                    <div className="absolute top-2 right-2">
                      <div className="w-5 h-5 rounded-full bg-[oklch(0.577_0.245_27.325)] flex items-center justify-center">
                        <svg
                          className="w-3 h-3 text-white"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </div>
                    </div>
                  )}
                </button>

                {/* Purple Theme */}

                {/* Orange/Yellow Theme */}

                {/* Pink Theme */}
              </div>
            </div>

            {/* Dark Mode */}
            <div className="flex items-center justify-between space-x-2">
              <div className="space-y-0.5">
                <Label
                  htmlFor="darkMode"
                  className="text-base font-semibold flex items-center gap-2"
                >
                  {settings.darkMode ? (
                    <Moon className="h-4 w-4" />
                  ) : (
                    <Sun className="h-4 w-4" />
                  )}
                  Ko'zni charchatmaydigan rejim
                </Label>
                <p className="text-sm text-muted-foreground">
                  Tungi ko'rinish, ko'zni kamroq charchatadi
                </p>
              </div>
              <Switch
                id="darkMode"
                checked={settings.darkMode}
                onCheckedChange={(checked) =>
                  updateSetting("darkMode", checked)
                }
              />
            </div>

            {/* High Contrast */}
            <div className="flex items-center justify-between space-x-2">
              <div className="space-y-0.5">
                <Label
                  htmlFor="highContrast"
                  className="text-base font-semibold flex items-center gap-2"
                >
                  <Contrast className="h-4 w-4" />
                  Yuqori Kontrast
                </Label>
                <p className="text-sm text-muted-foreground">
                  Ranglar orasidagi farqni oshiradi
                </p>
              </div>
              <Switch
                id="highContrast"
                checked={settings.highContrast}
                onCheckedChange={(checked) =>
                  updateSetting("highContrast", checked)
                }
              />
            </div>
          </CardContent>
        </Card>

        {/* Typography Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Type className="h-5 w-5 text-primary" />
              Matn Sozlamalari
            </CardTitle>
            <CardDescription>
              Shrift va matn ko'rinishini sozlang
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Font Size */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label htmlFor="fontSize" className="text-base font-semibold">
                  Shrift Kattaligi
                </Label>
                <span className="text-sm font-medium text-muted-foreground">
                  {settings.fontSize}px
                </span>
              </div>
              <Slider
                id="fontSize"
                min={12}
                max={24}
                step={1}
                value={[settings.fontSize]}
                onValueChange={(value) => updateSetting("fontSize", value[0])}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Kichik</span>
                <span>O'rtacha</span>
                <span>Katta</span>
              </div>
            </div>

            {/* Line Height */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label htmlFor="lineHeight" className="text-base font-semibold">
                  Qator Oralig'i
                </Label>
                <span className="text-sm font-medium text-muted-foreground">
                  {settings.lineHeight.toFixed(1)}
                </span>
              </div>
              <Slider
                id="lineHeight"
                min={1.0}
                max={2.5}
                step={0.1}
                value={[settings.lineHeight]}
                onValueChange={(value) => updateSetting("lineHeight", value[0])}
                className="w-full"
              />
            </div>

            {/* Letter Spacing */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label
                  htmlFor="letterSpacing"
                  className="text-base font-semibold"
                >
                  Harf Oralig'i
                </Label>
                <span className="text-sm font-medium text-muted-foreground">
                  {settings.letterSpacing}px
                </span>
              </div>
              <Slider
                id="letterSpacing"
                min={-2}
                max={4}
                step={0.5}
                value={[settings.letterSpacing]}
                onValueChange={(value) =>
                  updateSetting("letterSpacing", value[0])
                }
                className="w-full"
              />
            </div>

            {/* Preview Text */}
            <div
              className="p-4 rounded-md border bg-muted/50"
              style={{
                fontSize: `${settings.fontSize}px`,
                lineHeight: settings.lineHeight,
                letterSpacing: `${settings.letterSpacing}px`,
              }}
            >
              <p className="font-semibold mb-2">Namuna matn:</p>
              <p>
                Bu sizning tanlagan sozlamalaringiz bilan ko'rinadigan matnning
                namunasi. Shriftni sozlash orqali o'qish qulayligini
                oshirishingiz mumkin.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Accessibility Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Eye className="h-5 w-5 text-primary" />
              Qulayliklar (Accessibility)
            </CardTitle>
            <CardDescription>
              Maxsus ehtiyojlar uchun moslamalar
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Colorblind Mode */}
            <div className="space-y-2">
              <Label htmlFor="colorblind" className="text-base font-semibold">
                Daltonizm Rejimlari
              </Label>
              <Select
                value={settings.colorblindMode}
                onValueChange={(value) =>
                  updateSetting("colorblindMode", value)
                }
              >
                <SelectTrigger id="colorblind" className="w-full">
                  <SelectValue placeholder="Rejimni tanlang" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Oddiy rejim</SelectItem>
                  <SelectItem value="deuteranopia">
                    Deuteranopia (Yashil-qizil)
                  </SelectItem>
                  <SelectItem value="protanopia">
                    Protanopia (Qizil-yashil)
                  </SelectItem>
                  <SelectItem value="tritanopia">
                    Tritanopia (Ko'k-sariq)
                  </SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                Ranglarni ko'rishda qiyinchilik bo'lsa, mos rejimni tanlang
              </p>
            </div>

            {/* Reduced Motion */}
            <div className="flex items-center justify-between space-x-2">
              <div className="space-y-0.5">
                <Label
                  htmlFor="reducedMotion"
                  className="text-base font-semibold flex items-center gap-2"
                >
                  <MousePointer className="h-4 w-4" />
                  Harakatni Kamaytirish
                </Label>
                <p className="text-sm text-muted-foreground">
                  Animatsiyalar va o'tishlarni o'chiradi
                </p>
              </div>
              <Switch
                id="reducedMotion"
                checked={settings.reducedMotion}
                onCheckedChange={(checked) =>
                  updateSetting("reducedMotion", checked)
                }
              />
            </div>

            {/* Focus Indicator */}
            <div className="flex items-center justify-between space-x-2">
              <div className="space-y-0.5">
                <Label
                  htmlFor="focusIndicator"
                  className="text-base font-semibold flex items-center gap-2"
                >
                  <Keyboard className="h-4 w-4" />
                  Fokus Ko'rsatkichi
                </Label>
                <p className="text-sm text-muted-foreground">
                  Klaviatura navigatsiyasi uchun ko'rsatkich
                </p>
              </div>
              <Switch
                id="focusIndicator"
                checked={settings.focusIndicator}
                onCheckedChange={(checked) =>
                  updateSetting("focusIndicator", checked)
                }
              />
            </div>

            {/* Cursor Size */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label htmlFor="cursorSize" className="text-base font-semibold">
                  Kursor Hajmi
                </Label>
                <span className="text-sm font-medium text-muted-foreground">
                  {settings.cursorSize}x
                </span>
              </div>
              <Slider
                id="cursorSize"
                min={1}
                max={3}
                step={0.5}
                value={[settings.cursorSize]}
                onValueChange={(value) => updateSetting("cursorSize", value[0])}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Kichik</span>
                <span>Katta</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Additional Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Accessibility className="h-5 w-5 text-primary" />
              Qo'shimcha Sozlamalar
            </CardTitle>
            <CardDescription>Umumiy tizim sozlamalari</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Auto Save */}
            <div className="flex items-center justify-between space-x-2">
              <div className="space-y-0.5">
                <Label
                  htmlFor="autoSave"
                  className="text-base font-semibold flex items-center gap-2"
                >
                  <Save className="h-4 w-4" />
                  Avtomatik Saqlash
                </Label>
                <p className="text-sm text-muted-foreground">
                  O'zgarishlarni avtomatik saqlash
                </p>
              </div>
              <Switch
                id="autoSave"
                checked={settings.autoSave}
                onCheckedChange={(checked) =>
                  updateSetting("autoSave", checked)
                }
              />
            </div>

            {/* Sound Effects */}
            <div className="flex items-center justify-between space-x-2">
              <div className="space-y-0.5">
                <Label
                  htmlFor="sound"
                  className="text-base font-semibold flex items-center gap-2"
                >
                  <Volume2 className="h-4 w-4" />
                  Ovozli Effektlar
                </Label>
                <p className="text-sm text-muted-foreground">
                  Tugmalar va bildirishnomalar ovozi
                </p>
              </div>
              <Switch
                id="sound"
                checked={settings.soundEnabled}
                onCheckedChange={(checked) =>
                  updateSetting("soundEnabled", checked)
                }
              />
            </div>
          </CardContent>
        </Card>

        {/* Current Settings Summary */}
        <Card className="bg-muted/50">
          <CardHeader>
            <CardTitle className="text-lg">Joriy Sozlamalar</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
              <div>
                <span className="font-semibold">Mavzu:</span>{" "}
                <span className="capitalize">
                  {settings.theme === "default" && "Standart"}
                  {settings.theme === "blue" && "Ko'k"}
                  {settings.theme === "green" && "Yashil"}
                  {settings.theme === "red" && "Qizil"}
                  {settings.theme === "purple" && "Binafsha"}
                  {settings.theme === "orange" && "Sariq"}
                  {settings.theme === "teal" && "Turkuaz"}
                  {settings.theme === "pink" && "Pushti"}
                </span>
              </div>
              <div>
                <span className="font-semibold">Rejim:</span>{" "}
                {settings.darkMode ? "Tungi" : "Kunduzgi"}
              </div>
              <div>
                <span className="font-semibold">Shrift:</span>{" "}
                {settings.fontSize}px
              </div>
              <div>
                <span className="font-semibold">Daltonizm:</span>{" "}
                {settings.colorblindMode === "none"
                  ? "Yo'q"
                  : settings.colorblindMode}
              </div>
              <div>
                <span className="font-semibold">Kontrast:</span>{" "}
                {settings.highContrast ? "Yuqori" : "Oddiy"}
              </div>
              <div>
                <span className="font-semibold">Avtosaqlash:</span>{" "}
                {settings.autoSave ? "Yoniq" : "O'chiq"}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SystemSettingPage;
