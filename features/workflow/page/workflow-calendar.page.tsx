"use client";

import { useState, useMemo, useCallback, useRef } from "react";
import {
    Box,
    Paper,
    Group,
    Stack,
    Text,
    Select,
    SegmentedControl,
    Badge,
    Modal,
    Button,
    Divider,
    LoadingOverlay,
} from "@mantine/core";
import { DatePickerInput } from "@mantine/dates";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import listPlugin from "@fullcalendar/list";
import {
    IconCalendar,
    IconFilter,
    IconFileText,
    IconUser,
    IconClock,
    IconArrowRight,
    IconInfoCircle,
} from "@tabler/icons-react";
import { useWorkflowCalendar } from "../hook/workflow.hook";
import { WorkflowStepApiResponse, CalendarDayData, WorkflowStepWithWorkflow } from "../type/workflow.type";
import { formatDateTime } from "@/lib/date-utils";
import { useRouter } from "next/navigation";
import { GuardedButton } from "@/components/shared/permission";

import "dayjs/locale/uz-latn";
import uzLocale from "@fullcalendar/core/locales/uz";

const STEP_STATUS_COLORS: Record<string, string> = {
    NOT_STARTED: "#868e96",
    PENDING: "#868e96",
    IN_PROGRESS: "#228be6",
    COMPLETED: "#40c057",
    REJECTED: "#fa5252",
};

const STEP_STATUS_LABELS: Record<string, string> = {
    NOT_STARTED: "Kutilmoqda",
    PENDING: "Kutilmoqda",
    IN_PROGRESS: "Jarayonda",
    COMPLETED: "Bajarildi",
    REJECTED: "Rad etildi",
};

const ACTION_LABELS: Record<string, string> = {
    APPROVAL: "Tasdiqlash",
    SIGN: "Imzolash",
    QR_CODE: "QR kod qo'yish",
    REVIEW: "Ko'rib chiqish",
    ACKNOWLEDGE: "Tanishish",
    VERIFICATION:"ijro uchun"
};

type ViewType = "dayGridMonth" | "timeGridWeek" | "dayGridYear" | "listMonth";

export default function WorkflowCalendarPage() {
    const router = useRouter();
    const calendarRef = useRef<any>(null);
    const [view, setView] = useState<ViewType>("dayGridMonth");
    const [statusFilter, setStatusFilter] = useState<string | null>(null);
    const [dateRange, setDateRange] = useState<[Date | null, Date | null]>([
        new Date(new Date().getFullYear(), new Date().getMonth(), 1),
        new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0),
    ]);
    const [selectedStep, setSelectedStep] = useState<WorkflowStepWithWorkflow | null>(null);
    const [modalOpen, setModalOpen] = useState(false);

    const params = useMemo(() => {
        const [start, end] = dateRange;
        if (!start || !end) return undefined;

        const safeStart = start instanceof Date ? start : new Date(start);
        const safeEnd = end instanceof Date ? end : new Date(end);

        if (isNaN(safeStart.getTime()) || isNaN(safeEnd.getTime())) return undefined;

        return {
            startDate: safeStart.toISOString().split("T")[0],
            endDate: safeEnd.toISOString().split("T")[0],
            status: statusFilter || undefined,
        };
    }, [dateRange, statusFilter]);

    const { data, isLoading } = useWorkflowCalendar(params);

    const events = useMemo(() => {
        if (!data?.data) return [];

        return data.data.flatMap((dayData: CalendarDayData) =>
            dayData.workflowSteps.map((step: WorkflowStepWithWorkflow) => ({
                id: step.id,
                title: `${ACTION_LABELS[step.actionType] || step.actionType}`,
                start: dayData.date,
                backgroundColor: STEP_STATUS_COLORS[step.status] || "#868e96",
                borderColor: STEP_STATUS_COLORS[step.status] || "#868e96",
                extendedProps: {
                    step,
                    documentNumber: step.workflow?.document?.documentNumber,
                },
            }))
        );
    }, [data]);

    const handleEventClick = useCallback((info: any) => {
        const step = info.event.extendedProps.step as WorkflowStepWithWorkflow;
        setSelectedStep(step);
        setModalOpen(true);
    }, []);

    const handleDatesSet = useCallback((dateInfo: any) => {
        const newStart = dateInfo.start;
        const newEnd = new Date(dateInfo.end.getTime() - 1);

        setDateRange((prev) => {
            if (
                prev[0]?.getTime() === newStart.getTime() &&
                prev[1]?.getTime() === newEnd.getTime()
            ) {
                return prev;
            }
            return [newStart, newEnd];
        });
    }, []);

    const handleViewChange = useCallback((value: string) => {
        setView(value as ViewType);
        const calendarApi = calendarRef.current?.getApi();
        if (calendarApi) {
            calendarApi.changeView(value);
        }
    }, []);

    const handleWorkflowNavigate = useCallback(() => {
        if (selectedStep?.workflowId) {
            router.push(`/dashboard/workflow/${selectedStep.workflowId}`);
            setModalOpen(false);
        }
    }, [selectedStep, router]);

    const handleDateRangeChange = useCallback((value: any) => {
        setDateRange(value);
    }, []);

    return (
        <Box>
            <Stack gap="md">
                <Paper p="lg" radius="sm" withBorder style={{ borderColor: "#e9ecef" }}>
                    <Group justify="space-between" mb="md">
                        <Group gap="sm">
                            <IconCalendar size={28} color="#1e3a5f" />
                            <div>
                                <Text size="xl" fw={600} c="#212529">
                                    Vazifalar taqvimi
                                </Text>
                                <Text size="sm" c="dimmed">
                                    Menga tayinlangan vazifalar
                                </Text>
                            </div>
                        </Group>
                        {data && (
                            <Stack gap={4} align="flex-end">
                                <Badge variant="light" color="dark" size="lg">
                                    {data.totalCount} ta vazifa
                                </Badge>
                                <Text size="xs" c="dimmed">
                                    {data.daysWithSteps} kun
                                </Text>
                            </Stack>
                        )}
                    </Group>

                    <Stack gap="md">
                        <Group grow>
                            <SegmentedControl
                                value={view}
                                onChange={handleViewChange}
                                data={[
                                    { label: "Oylik", value: "dayGridMonth" },
                                    { label: "Haftalik", value: "timeGridWeek" },
                                    { label: "Yillik", value: "dayGridYear" },
                                    { label: "Ro'yxat", value: "listMonth" },
                                ]}
                                size="sm"
                            />
                        </Group>

                        <Group grow>
                            <Select
                                placeholder="Holat bo'yicha"
                                leftSection={<IconFilter size={16} />}
                                data={[
                                    { value: "", label: "Barchasi" },
                                    { value: "IN_PROGRESS", label: "Jarayonda" },
                                    { value: "PENDING", label: "Kutilmoqda" },
                                    { value: "COMPLETED", label: "Bajarildi" },
                                    { value: "REJECTED", label: "Rad etildi" },
                                ]}
                                value={statusFilter}
                                onChange={setStatusFilter}
                                clearable
                                size="sm"
                                styles={{ input: { backgroundColor: "#f8f9fa" } }}
                            />

                            <DatePickerInput
                                type="range"
                                locale="uz-latn"
                                placeholder="Sana oralig'i"
                                value={dateRange}
                                onChange={handleDateRangeChange}
                                leftSection={<IconCalendar size={16} />}
                                clearable={false}
                                size="sm"
                                styles={{ input: { backgroundColor: "#f8f9fa" } }}
                            />
                        </Group>
                    </Stack>
                </Paper>


                <Paper p="lg" radius="sm" withBorder style={{ minHeight: 600, borderColor: "#e9ecef", position: "relative" }}>
                    <LoadingOverlay visible={isLoading} zIndex={1000} overlayProps={{ radius: "sm", blur: 2 }} loaderProps={{ color: "dark", type: "dots" }} />
                    <Box>
                        <FullCalendar
                            ref={calendarRef}
                            plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin, listPlugin]}
                            initialView={view}
                            locales={[uzLocale]}
                            locale="uz"
                            headerToolbar={{ left: "prev,next today", center: "title", right: "" }}
                            height="auto"
                            events={events}
                            eventClick={handleEventClick}
                            datesSet={handleDatesSet}
                            firstDay={1}
                            buttonText={{ today: "Bugun", month: "Oy", week: "Hafta", day: "Kun", list: "Ro'yxat" }}
                            dayHeaderFormat={{ weekday: "short" }}
                            eventContent={(arg) => ({
                                html: `
                <div style="padding: 2px 4px; font-size: 12px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">
                  <strong>${arg.event.title}</strong>
                  ${arg.event.extendedProps.documentNumber ? ` - ${arg.event.extendedProps.documentNumber}` : ""}
                </div>
              `,
                            })}
                        />
                    </Box>
                </Paper>
            </Stack>

            <Modal
                opened={modalOpen}
                onClose={() => setModalOpen(false)}
                title={
                    <Group gap="xs">
                        <IconFileText size={20} color="#1e3a5f" />
                        <Text fw={600} size="lg" c="#212529">Vazifa tafsilotlari</Text>
                    </Group>
                }
                size="md"
                radius="sm"
                centered
            >
                {selectedStep && (
                    <Stack gap="md">
                        <Paper p="sm" radius="sm" bg="#f8f9fa">
                            <Group gap="xs">
                                <Text size="sm" c="dimmed">Amal turi:</Text>
                                <Text size="sm" fw={600} c="#1e3a5f">
                                    {ACTION_LABELS[selectedStep.actionType] || selectedStep.actionType}
                                </Text>
                            </Group>
                        </Paper>

                        <Box>
                            <Text size="xs" c="dimmed" mb={6}>Holat</Text>
                            <Badge
                                variant="light"
                                size="md"
                                color={
                                    selectedStep.status === "COMPLETED" ? "green" :
                                        selectedStep.status === "IN_PROGRESS" ? "blue" :
                                            selectedStep.status === "REJECTED" ? "red" : "gray"
                                }
                            >
                                {STEP_STATUS_LABELS[selectedStep.status] || selectedStep.status}
                            </Badge>
                        </Box>

                        {selectedStep.workflow?.document && (
                            <Box>
                                <Text size="xs" c="dimmed" mb={6}>Hujjat</Text>
                                <Paper p="sm" radius="sm" withBorder style={{ borderColor: "#e9ecef" }}>
                                    <Stack gap={4}>
                                        <Text size="sm" fw={500} c="#212529">{selectedStep.workflow.document.title}</Text>
                                        <Text size="xs" c="dimmed" style={{ fontFamily: "monospace" }}>
                                            №{selectedStep.workflow.document.documentNumber}
                                        </Text>
                                    </Stack>
                                </Paper>
                            </Box>
                        )}

                        {selectedStep.assignedToUser && (
                            <Box>
                                <Text size="xs" c="dimmed" mb={6}>Mas'ul shaxs</Text>
                                <Group gap="xs">
                                    <IconUser size={16} color="#495057" />
                                    <Text size="sm" fw={500}>{selectedStep.assignedToUser.fullname}</Text>
                                </Group>
                            </Box>
                        )}

                        {selectedStep.dueDate && (
                            <Box>
                                <Text size="xs" c="dimmed" mb={6}>Muddat</Text>
                                <Group gap="xs">
                                    <IconClock size={16} color="#fa5252" />
                                    <Text size="sm" fw={500} c={new Date(selectedStep.dueDate) < new Date() ? "red" : "#495057"}>
                                        {formatDateTime(selectedStep.dueDate)}
                                    </Text>
                                </Group>
                            </Box>
                        )}

                        <Divider />

                        <Group justify="space-between">
                            <Button variant="subtle" onClick={() => setModalOpen(false)} color="gray">
                                Yopish
                            </Button>
                            {selectedStep.workflowId && (
                                <GuardedButton
                                    permission="workflow:read"
                                    onClick={handleWorkflowNavigate}
                                    rightSection={<IconArrowRight size={16} />}
                                    style={{ backgroundColor: "#1e3a5f" }}
                                >
                                    Jarayonga o'tish
                                </GuardedButton>
                            )}
                        </Group>
                    </Stack>
                )}
            </Modal>
        </Box>
    );
}
