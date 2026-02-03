"use client";

import React, {
    useEffect,
    useCallback,
    useState,
    createContext,
    useContext,
    ReactNode,
} from "react";
import type {DriveStep, Driver} from "driver.js";
import {
    IconHelp,
    IconRefresh,
    IconPlayerPlay,
    IconCircleCheck,
    IconSparkles,
    IconChevronRight,
    IconRocket,
    IconBook,
} from "@tabler/icons-react";
import {
    ActionIcon,
    Button,
    Group,
    Paper,
    Stack,
    Switch,
    Text,
    Tooltip,
    Box,
    ScrollArea,
    Drawer,
} from "@mantine/core";
import {useDisclosure} from "@mantine/hooks";

type OnboardingConfig = {
    steps: DriveStep[];
    title: string;
    description: string;
    icon: React.ComponentType<{ size?: number | string; stroke?: number }>;
    color: string;
};

type OnboardingContextType = {
    isGlobalEnabled: boolean;
    setGlobalEnabled: (enabled: boolean) => void;
    completedTours: string[];
    startTour: (tourKey: string) => void;
    restartTour: (tourKey: string) => void;
    resetAllTours: () => void;
    markTourCompleted: (tourKey: string) => void;
    isTourCompleted: (tourKey: string) => boolean;
    getTourProgress: () => { completed: number; total: number };
};

const ONBOARDING_KEY = "dockflow_onboarding_completed";
const ONBOARDING_ENABLED_KEY = "dockflow_onboarding_enabled";

export const TOUR_CONFIGS: Record<string, OnboardingConfig> = {
    dashboard: {
        title: "Bosh sahifa",
        description: "Asosiy boshqaruv paneli",
        icon: IconRocket,
        color: "blue",
        steps: [
            {
                element: "[data-tour='sidebar']",
                popover: {
                    title: "Asosiy menyu",
                    description: "Barcha bo'limlarga shu yerdan o'ting",
                    side: "right",
                    align: "start",
                },
            },
            {
                element: "[data-tour='header']",
                popover: {
                    title: "Sarlavha paneli",
                    description: "Qidiruv, bildirishnomalar va profil sozlamalari",
                    side: "bottom",
                    align: "center",
                },
            },
            {
                element: "[data-tour='global-search']",
                popover: {
                    title: "Global qidiruv",
                    description: "Ctrl+K yoki ⌘+K bilan tezda qidiring",
                    side: "bottom",
                    align: "start",
                },
            },
            {
                element: "[data-tour='stats-cards']",
                popover: {
                    title: "Statistika",
                    description: "Umumiy ko'rsatkichlar shu yerda",
                    side: "bottom",
                    align: "center",
                },
            },
            {
                element: "[data-tour='theme-toggle']",
                popover: {
                    title: "Mavzu",
                    description: "Yorug'/qorong'u mavzuni almashtiring",
                    side: "bottom",
                    align: "end",
                },
            },
        ],
    },

    document: {
        title: "Hujjatlar",
        description: "Hujjatlar bilan ishlash",
        icon: IconBook,
        color: "teal",
        steps: [
            {
                element: "[data-tour='document-create']",
                popover: {
                    title: "Yangi hujjat",
                    description: "Yangi hujjat yarating",
                    side: "left",
                    align: "start",
                },
            },
            {
                element: "[data-tour='document-search']",
                popover: {
                    title: "Qidirish",
                    description: "Hujjatlarni qidiring",
                    side: "bottom",
                    align: "start",
                },
            },
            {
                element: "[data-tour='document-filter']",
                popover: {
                    title: "Filterlar",
                    description: "Holat va tur bo'yicha filterlang",
                    side: "bottom",
                    align: "start",
                },
            },
            {
                element: "[data-tour='document-list']",
                popover: {
                    title: "Ro'yxat",
                    description: "Barcha hujjatlar shu yerda",
                    side: "top",
                    align: "center",
                },
            },
        ],
    },

    workflow: {
        title: "Aylanmalar",
        description: "Hujjat aylanmalari",
        icon: IconRefresh,
        color: "violet",
        steps: [
            {
                element: "[data-tour='workflow-create']",
                popover: {
                    title: "Yangi aylanma",
                    description: "Yangi aylanma yarating",
                    side: "left",
                    align: "start",
                },
            },
            {
                element: "[data-tour='workflow-template']",
                popover: {
                    title: "Shablondan",
                    description: "Tayyor shablondan yarating",
                    side: "left",
                    align: "start",
                },
            },
            {
                element: "[data-tour='workflow-search']",
                popover: {
                    title: "Qidirish",
                    description: "Aylanmalarni qidiring",
                    side: "bottom",
                    align: "start",
                },
            },
            {
                element: "[data-tour='workflow-filter']",
                popover: {
                    title: "Filterlar",
                    description: "Qo'shimcha filterlar",
                    side: "bottom",
                    align: "start",
                },
            },
            {
                element: "[data-tour='workflow-tabs']",
                popover: {
                    title: "Holat filterlari",
                    description: "Holatlar bo'yicha filterlang",
                    side: "bottom",
                    align: "start",
                },
            },
            {
                element: "[data-tour='workflow-list']",
                popover: {
                    title: "Ro'yxat",
                    description: "Barcha aylanmalar",
                    side: "top",
                    align: "center",
                },
            },
        ],
    },

    "workflow-template": {
        title: "Shablonlar",
        description: "Aylanma shablonlari",
        icon: IconSparkles,
        color: "orange",
        steps: [
            {
                element: "[data-tour='template-create']",
                popover: {
                    title: "Yangi shablon",
                    description: "Shablon yarating",
                    side: "left",
                    align: "start",
                },
            },
            {
                element: "[data-tour='template-search']",
                popover: {
                    title: "Qidirish",
                    description: "Shablonlarni qidiring",
                    side: "bottom",
                    align: "start",
                },
            },
            {
                element: "[data-tour='template-list']",
                popover: {
                    title: "Ro'yxat",
                    description: "Barcha shablonlar",
                    side: "top",
                    align: "center",
                },
            },
        ],
    },

    "document-type": {
        title: "Hujjat turlari",
        description: "Turlarni boshqarish",
        icon: IconBook,
        color: "pink",
        steps: [
            {
                element: "[data-tour='doctype-create']",
                popover: {
                    title: "Yangi tur",
                    description: "Hujjat turi yarating",
                    side: "left",
                    align: "start",
                },
            },
            {
                element: "[data-tour='doctype-search']",
                popover: {
                    title: "Qidirish",
                    description: "Turlarni qidiring",
                    side: "bottom",
                    align: "start",
                },
            },
            {
                element: "[data-tour='doctype-list']",
                popover: {
                    title: "Ro'yxat",
                    description: "Barcha hujjat turlari",
                    side: "top",
                    align: "center",
                },
            },
        ],
    },

    journal: {
        title: "Jurnallar",
        description: "Hujjat jurnallari",
        icon: IconBook,
        color: "cyan",
        steps: [
            {
                element: "[data-tour='journal-create']",
                popover: {
                    title: "Yangi jurnal",
                    description: "Yangi jurnal yarating",
                    side: "left",
                    align: "start",
                },
            },
            {
                element: "[data-tour='journal-search']",
                popover: {
                    title: "Qidirish",
                    description: "Jurnallarni qidiring",
                    side: "bottom",
                    align: "start",
                },
            },
            {
                element: "[data-tour='journal-list']",
                popover: {
                    title: "Ro'yxat",
                    description: "Barcha jurnallar shu yerda",
                    side: "top",
                    align: "center",
                },
            },
        ],
    },
};

// ==================== DRIVER HELPER ====================
async function createDriver(
    config: OnboardingConfig,
    tourKey: string,
    onComplete: () => void
) {
    const { driver } = await import("driver.js");
    // @ts-expect-error -- CSS module has no type declarations
    await import("driver.js/dist/driver.css");
    return driver({
        showProgress: true,
        showButtons: ["next", "previous", "close"],
        steps: config.steps,
        nextBtnText: "Keyingi →",
        prevBtnText: "← Oldingi",
        doneBtnText: "Tugatish ✓",
        progressText: "{{current}} / {{total}}",
        popoverClass: "dockflow-tour-popover",
        stagePadding: 8,
        stageRadius: 8,
        animate: true,
        smoothScroll: true,
        allowClose: true,
        overlayOpacity: 0.6,
        onDestroyStarted: () => {
            onComplete();
        },
    });
}

const OnboardingContext = createContext<OnboardingContextType | null>(null);

export function OnboardingProvider({children}: { children: ReactNode }) {
    const [isGlobalEnabled, setIsGlobalEnabled] = useState(true);
    const [completedTours, setCompletedTours] = useState<string[]>([]);

    useEffect(() => {
        const completed = localStorage.getItem(ONBOARDING_KEY);
        const enabled = localStorage.getItem(ONBOARDING_ENABLED_KEY);

        if (completed) {
            setCompletedTours(JSON.parse(completed));
        }
        if (enabled !== null) {
            setIsGlobalEnabled(JSON.parse(enabled));
        }
    }, []);

    const handleSetGlobalEnabled = useCallback((enabled: boolean) => {
        setIsGlobalEnabled(enabled);
        localStorage.setItem(ONBOARDING_ENABLED_KEY, JSON.stringify(enabled));
    }, []);

    const saveTourCompleted = useCallback((tourKey: string) => {
        setCompletedTours((prev) => {
            if (!prev.includes(tourKey)) {
                const updated = [...prev, tourKey];
                localStorage.setItem(ONBOARDING_KEY, JSON.stringify(updated));
                return updated;
            }
            return prev;
        });
    }, []);

    const startTour = useCallback(
        async (tourKey: string) => {
            if (!isGlobalEnabled) return;

            const config = TOUR_CONFIGS[tourKey];
            if (!config) return;

            const driverObj = await createDriver(config, tourKey, () => {
                saveTourCompleted(tourKey);
                driverObj.destroy();
            });

            setTimeout(() => driverObj.drive(), 300);
        },
        [isGlobalEnabled, saveTourCompleted]
    );

    const restartTour = useCallback(
        (tourKey: string) => {
            setCompletedTours((prev) => {
                const filtered = prev.filter((t) => t !== tourKey);
                localStorage.setItem(ONBOARDING_KEY, JSON.stringify(filtered));
                return filtered;
            });

            setTimeout(async () => {
                const config = TOUR_CONFIGS[tourKey];
                if (!config) return;

                const driverObj = await createDriver(config, tourKey, () => {
                    saveTourCompleted(tourKey);
                    driverObj.destroy();
                });

                driverObj.drive();
            }, 100);
        },
        [saveTourCompleted]
    );

    const resetAllTours = useCallback(() => {
        localStorage.removeItem(ONBOARDING_KEY);
        setCompletedTours([]);
    }, []);

    const markTourCompleted = useCallback((tourKey: string) => {
        saveTourCompleted(tourKey);
    }, [saveTourCompleted]);

    const isTourCompleted = useCallback(
        (tourKey: string) => completedTours.includes(tourKey),
        [completedTours]
    );

    const getTourProgress = useCallback(() => {
        const total = Object.keys(TOUR_CONFIGS).length;
        return {completed: completedTours.length, total};
    }, [completedTours]);

    return (
        <OnboardingContext.Provider
            value={{
                isGlobalEnabled,
                setGlobalEnabled: handleSetGlobalEnabled,
                completedTours,
                startTour,
                restartTour,
                resetAllTours,
                markTourCompleted,
                isTourCompleted,
                getTourProgress,
            }}
        >
            {children}
        </OnboardingContext.Provider>
    );
}

// ==================== CONTEXT HOOK ====================
export function useOnboardingContext() {
    const context = useContext(OnboardingContext);
    if (!context) {
        throw new Error("useOnboardingContext must be used within OnboardingProvider");
    }
    return context;
}

// ==================== MAIN HOOK ====================
export function useOnboarding(tourKey: string) {
    const [isCompleted, setIsCompleted] = useState(true);
    const [driverInstance, setDriverInstance] = useState<Driver | null>(null);
    const [isGlobalEnabled, setIsGlobalEnabledState] = useState(true);

    useEffect(() => {
        const completed = localStorage.getItem(ONBOARDING_KEY);
        const enabled = localStorage.getItem(ONBOARDING_ENABLED_KEY);

        if (completed) {
            const completedTours = JSON.parse(completed) as string[];
            setIsCompleted(completedTours.includes(tourKey));
        } else {
            setIsCompleted(false);
        }

        if (enabled !== null) {
            setIsGlobalEnabledState(JSON.parse(enabled));
        }
    }, [tourKey]);

    const saveTourCompleted = useCallback(() => {
        const completed = localStorage.getItem(ONBOARDING_KEY);
        const completedTours = completed ? JSON.parse(completed) : [];
        if (!completedTours.includes(tourKey)) {
            completedTours.push(tourKey);
            localStorage.setItem(ONBOARDING_KEY, JSON.stringify(completedTours));
        }
        setIsCompleted(true);
    }, [tourKey]);

    const startTour = useCallback(async () => {
        if (!isGlobalEnabled) return;

        const config = TOUR_CONFIGS[tourKey];
        if (!config) return;

        const driverObj = await createDriver(config, tourKey, () => {
            saveTourCompleted();
            driverObj.destroy();
        });

        setDriverInstance(driverObj);
        setTimeout(() => driverObj.drive(), 300);
    }, [tourKey, isGlobalEnabled, saveTourCompleted]);

    const restartTour = useCallback(async () => {
        const completed = localStorage.getItem(ONBOARDING_KEY);
        if (completed) {
            const completedTours = JSON.parse(completed) as string[];
            const filtered = completedTours.filter((t: string) => t !== tourKey);
            localStorage.setItem(ONBOARDING_KEY, JSON.stringify(filtered));
        }
        setIsCompleted(false);

        const config = TOUR_CONFIGS[tourKey];
        if (!config) return;

        const driverObj = await createDriver(config, tourKey, () => {
            saveTourCompleted();
            driverObj.destroy();
        });

        setDriverInstance(driverObj);
        setTimeout(() => driverObj.drive(), 100);
    }, [tourKey, saveTourCompleted]);

    const resetAllTours = useCallback(() => {
        localStorage.removeItem(ONBOARDING_KEY);
        setIsCompleted(false);
    }, []);

    useEffect(() => {
        if (!isCompleted && isGlobalEnabled) {
            startTour();
        }
    }, [isCompleted, isGlobalEnabled, startTour]);

    return {
        isCompleted,
        startTour,
        restartTour,
        resetAllTours,
        driverInstance,
        isGlobalEnabled,
    };
}

// ==================== TOUR BUTTON ====================
type TourButtonProps = {
    tourKey: string;
    variant?: "icon" | "button" | "subtle";
    size?: "xs" | "sm" | "md" | "lg";
};

export function TourButton({
                               tourKey,
                               variant = "icon",
                               size = "sm",
                           }: TourButtonProps) {
    const {restartTour, isCompleted, isGlobalEnabled} = useOnboarding(tourKey);
    const config = TOUR_CONFIGS[tourKey];

    if (!config || !isGlobalEnabled) return null;

    const iconSize = size === "xs" ? 14 : size === "sm" ? 16 : size === "md" ? 18 : 20;

    if (variant === "icon") {
        return (
            <Tooltip label="Yo'riqnoma" withArrow position="bottom">
                <ActionIcon
                    variant="subtle"
                    color="gray"
                    size={size}
                    onClick={restartTour}
                    radius="md"
                >
                    <IconHelp size={iconSize}/>
                </ActionIcon>
            </Tooltip>
        );
    }

    if (variant === "subtle") {
        return (
            <Button
                variant="subtle"
                color="gray"
                size={size}
                leftSection={<IconHelp size={14}/>}
                onClick={restartTour}
                radius="md"
            >
                Yo'riqnoma
            </Button>
        );
    }

    return (
        <Button
            variant="light"
            size={size}
            leftSection={<IconPlayerPlay size={14}/>}
            onClick={restartTour}
            radius="md"
        >
            Boshlash
        </Button>
    );
}

// ==================== TOUR ITEM ====================
function TourItem({
    tourKey,
    config,
    isCompleted,
    onStart,
}: {
    tourKey: string;
    config: OnboardingConfig;
    isCompleted: boolean;
    onStart: () => void;
}) {
    const Icon = config.icon;

    return (
        <Paper
            p="md"
            radius="sm"
            withBorder
            style={{
                borderColor: "#e9ecef",
                cursor: "pointer",
            }}
            onClick={onStart}
        >
            <Group justify="space-between" wrap="nowrap">
                <Group gap="md" wrap="nowrap">
                    <Box
                        p={8}
                        style={{
                            backgroundColor: isCompleted ? "#d3f9d8" : "#f1f3f5",
                            borderRadius: 6,
                        }}
                    >
                        {isCompleted ? (
                            <IconCircleCheck size={20} color="#2b8a3e" stroke={1.5} />
                        ) : (

                            <Icon size={20}
                                  stroke={1.5} />
                        )}
                    </Box>
                    <Box>
                        <Text size="sm" fw={500} c="#212529">
                            {config.title}
                        </Text>
                        <Text size="xs" c="dimmed">
                            {config.steps.length} qadam
                        </Text>
                    </Box>
                </Group>
                <IconChevronRight size={16} color="#868e96" />
            </Group>
        </Paper>
    );
}

// ==================== SETTINGS DRAWER ====================
type TourSettingsDrawerProps = {
    opened: boolean;
    onClose: () => void;
};

export function TourSettingsDrawer({opened, onClose}: TourSettingsDrawerProps) {
    const [completedTours, setCompletedTours] = useState<string[]>([]);
    const [isGlobalEnabled, setIsGlobalEnabled] = useState(true);

    useEffect(() => {
        if (opened) {
            const completed = localStorage.getItem(ONBOARDING_KEY);
            const enabled = localStorage.getItem(ONBOARDING_ENABLED_KEY);

            if (completed) setCompletedTours(JSON.parse(completed));
            if (enabled !== null) setIsGlobalEnabled(JSON.parse(enabled));
        }
    }, [opened]);

    const handleToggleGlobal = (checked: boolean) => {
        setIsGlobalEnabled(checked);
        localStorage.setItem(ONBOARDING_ENABLED_KEY, JSON.stringify(checked));
    };

    const handleResetAll = () => {
        localStorage.removeItem(ONBOARDING_KEY);
        setCompletedTours([]);
    };

    const handleStartTour = (tourKey: string) => {
        onClose();

        setTimeout(async () => {
            const config = TOUR_CONFIGS[tourKey];
            if (!config) return;

            const filtered = completedTours.filter((t) => t !== tourKey);
            localStorage.setItem(ONBOARDING_KEY, JSON.stringify(filtered));

            const driverObj = await createDriver(config, tourKey, () => {
                const completed = localStorage.getItem(ONBOARDING_KEY);
                const completedTours = completed ? JSON.parse(completed) : [];
                if (!completedTours.includes(tourKey)) {
                    completedTours.push(tourKey);
                    localStorage.setItem(ONBOARDING_KEY, JSON.stringify(completedTours));
                }
                driverObj.destroy();
            });

            driverObj.drive();
        }, 250);
    };

    const totalTours = Object.keys(TOUR_CONFIGS).length;
    const completedCount = completedTours.length;
    const progressPercent = Math.round((completedCount / totalTours) * 100);

    return (
        <Drawer
            opened={opened}
            onClose={onClose}
            position="right"
            size="sm"
            title={
                <Text fw={600} c="#212529">Yo'riqnomalar</Text>
            }
            styles={{
                header: {
                    borderBottom: "1px solid #e9ecef",
                },
                body: {
                    padding: 0,
                },
            }}
        >
            <ScrollArea h="calc(100vh - 70px)" p="md">
                <Stack gap="md">
                    {/* Progress Card */}
                    <Paper
                        p="lg"
                        radius="sm"
                        withBorder
                        style={{ borderColor: "#e9ecef" }}
                    >
                        <Group justify="space-between" align="flex-start" mb="md">
                            <Text size="sm" c="dimmed" fw={500}>
                                Progress
                            </Text>
                            <Box
                                p={8}
                                style={{
                                    backgroundColor: "#f1f3f5",
                                    borderRadius: 6,
                                }}
                            >
                                <IconSparkles size={20} color="#495057" stroke={1.5} />
                            </Box>
                        </Group>
                        <Text fw={700} style={{ fontSize: 28, lineHeight: 1.2, color: "#212529" }}>
                            {completedCount} / {totalTours}
                        </Text>
                        <Text size="sm" c="dimmed" mt={6}>
                            {progressPercent === 100
                                ? "Barchasi tugallangan"
                                : `${totalTours - completedCount} ta yo'riqnoma qoldi`}
                        </Text>
                    </Paper>

                    {/* Toggle */}
                    <Paper
                        p="md"
                        radius="sm"
                        withBorder
                        style={{ borderColor: "#e9ecef" }}
                    >
                        <Group justify="space-between">
                            <Box>
                                <Text size="sm" fw={500} c="#212529">
                                    Avtomatik ko'rsatish
                                </Text>
                                <Text size="xs" c="dimmed">
                                    Yangi sahifalarda
                                </Text>
                            </Box>
                            <Switch
                                checked={isGlobalEnabled}
                                onChange={(e) => handleToggleGlobal(e.currentTarget.checked)}
                                size="md"
                                styles={{
                                    track: {
                                        backgroundColor: isGlobalEnabled ? "#1e3a5f" : undefined,
                                        borderColor: isGlobalEnabled ? "#1e3a5f" : undefined,
                                    },
                                }}
                            />
                        </Group>
                    </Paper>

                    {/* Tours List */}
                    <Box>
                        <Text size="sm" c="dimmed" fw={500} mb="sm">
                            Mavjud yo'riqnomalar
                        </Text>
                        <Stack gap="xs">
                            {Object.entries(TOUR_CONFIGS).map(([key, config]) => (
                                <TourItem
                                    key={key}
                                    tourKey={key}
                                    config={config}
                                    isCompleted={completedTours.includes(key)}
                                    onStart={() => handleStartTour(key)}
                                />
                            ))}
                        </Stack>
                    </Box>

                    {/* Reset */}
                    {completedCount > 0 && (
                        <Button
                            variant="subtle"
                            color="red"
                            size="sm"
                            leftSection={<IconRefresh size={14} />}
                            onClick={handleResetAll}
                            fullWidth
                            radius="sm"
                        >
                            Barchasini tiklash
                        </Button>
                    )}
                </Stack>
            </ScrollArea>
        </Drawer>
    );
}

export function TourSettingsButton() {
    const [opened, {open, close}] = useDisclosure(false);

    return (
        <>
            <Tooltip label="Yo'riqnomalar" withArrow position="bottom">
                <ActionIcon variant="subtle" color="gray" size="lg" onClick={open} radius="md">
                    <IconHelp size={20}/>
                </ActionIcon>
            </Tooltip>
            <TourSettingsDrawer opened={opened} onClose={close}/>
        </>
    );
}
