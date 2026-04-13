"use client";

import { useState, useRef } from "react";
import {
    TextInput,
    Select,
    Button,
    Group,
    Stack,
    SimpleGrid,
    NumberInput,
    Text,
    Paper,
    Badge,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import {
    IconBook,
    IconHash,
    IconBuilding,
    IconUser,
    IconArrowsExchange,
} from "@tabler/icons-react";
import {
    useJournalCreateMutation,
    useUpdateJournal,
} from "../hook/journal.hook";
import { colors } from "@/lib/colors";
import { useGetAllDepartments } from "@/features/department/hook/department.hook";
import { useGetUserQuery } from "@/features/admin/admin-users/hook/user.hook";
import { SingleJournalApiResponse } from "../type/journal.types";

interface JournalFormProps {
    mode: "create" | "edit";
    journal?: SingleJournalApiResponse | null;
    onClose: () => void;
    onSuccess?: () => void;
}

interface JournalFormValues {
    name: string;
    prefix: string;
    format: string;
    departmentId: string;
    responsibleUserId: string;
}

type TokenType = "PREFIX" | "YEAR" | "NUMBER";

const TOKEN_LABELS: Record<TokenType, string> = {
    PREFIX: "Prefiks",
    YEAR: "Yil",
    NUMBER: "Raqam",
};

const TOKEN_COLORS: Record<TokenType, string> = {
    PREFIX: "blue",
    YEAR: "green",
    NUMBER: "orange",
};

function parseFormat(format: string): { order: TokenType[]; separator: string; numberDigits: number } {
    const defaults = { order: ["PREFIX", "YEAR", "NUMBER"] as TokenType[], separator: "-", numberDigits: 5 };

    if (!format) return defaults;

    const numberMatch = format.match(/\{NUMBER:(\d+)\}/);
    const numberDigits = numberMatch ? parseInt(numberMatch[1], 10) : 5;

    const tokenPositions: { token: TokenType; index: number }[] = [];
    const prefixIdx = format.indexOf("{PREFIX}");
    const yearIdx = format.indexOf("{YEAR}");
    const numberIdx = format.search(/\{NUMBER:\d+\}/);

    if (prefixIdx !== -1) tokenPositions.push({ token: "PREFIX", index: prefixIdx });
    if (yearIdx !== -1) tokenPositions.push({ token: "YEAR", index: yearIdx });
    if (numberIdx !== -1) tokenPositions.push({ token: "NUMBER", index: numberIdx });

    tokenPositions.sort((a, b) => a.index - b.index);
    const order = tokenPositions.length === 3
        ? tokenPositions.map((t) => t.token)
        : defaults.order;

    const sepMatch = format.match(/\}([^\{])\{/);
    const separator = sepMatch ? sepMatch[1] : "-";

    return { order, separator, numberDigits };
}

function buildFormat(order: TokenType[], separator: string, numberDigits: number): string {
    return order
        .map((token) => (token === "NUMBER" ? `{NUMBER:${numberDigits}}` : `{${token}}`))
        .join(separator);
}

function buildPreview(order: TokenType[], separator: string, prefix: string, numberDigits: number): string {
    const year = new Date().getFullYear().toString();
    const num = "1".padStart(numberDigits, "0");
    return order
        .map((token) => {
            if (token === "PREFIX") return prefix || "KHM";
            if (token === "YEAR") return year;
            return num;
        })
        .join(separator);
}

const SEPARATOR_OPTIONS = [
    { value: "-", label: "Tire ( - )" },
    { value: "/", label: "Slash ( / )" },
    { value: ".", label: "Nuqta ( . )" },
];

const JournalForm = ({ mode, journal, onClose, onSuccess }: JournalFormProps) => {
    const isUpdate = mode === "edit";

    const parsed = parseFormat(journal?.format || "");
    const [tokenOrder, setTokenOrder] = useState<TokenType[]>(parsed.order);
    const [separator, setSeparator] = useState(parsed.separator);
    const [numberDigits, setNumberDigits] = useState(parsed.numberDigits);

    const createMutation = useJournalCreateMutation();
    const updateMutation = useUpdateJournal();

    const { data: departmentsData, isLoading: isLoadingDepartments } = useGetAllDepartments({
        pageNumber: 1,
        pageSize: 100,
        search: "",
    });

    const { data: usersData, isLoading: isLoadingUsers } = useGetUserQuery({
        pageNumber: 1,
        pageSize: 100,
        search: "",
    });

    const form = useForm<JournalFormValues>({
        initialValues: {
            name: journal?.name || "",
            prefix: journal?.prefix || "",
            format: journal?.format || buildFormat(parsed.order, parsed.separator, parsed.numberDigits),
            departmentId: journal?.department?.id || "",
            responsibleUserId: journal?.responsibleUser?.id || "",
        },
        validate: {
            name: (value) => (!value ? "Jurnal nomi kiritilishi shart" : null),
            prefix: (value) => {
                if (!value) return "Prefiks kiritilishi shart";
                if (value.length > 3) return "Prefiks 3 ta belgidan oshmasligi kerak";
                return null;
            },
            format: (value) => {
                if (!value) return "Format kiritilishi shart";
                return null;
            },
            departmentId: (value) => (!value ? "Bo'lim tanlanishi shart" : null),
            responsibleUserId: (value) => (!value ? "Mas'ul shaxs tanlanishi shart" : null),
        },
    });

    const formRef = useRef(form);
    formRef.current = form;

    const syncFormat = (order: TokenType[], sep: string, digits: number) => {
        formRef.current.setFieldValue("format", buildFormat(order, sep, digits));
    };

    const handleSeparatorChange = (val: string) => {
        setSeparator(val);
        syncFormat(tokenOrder, val, numberDigits);
    };

    const handleDigitsChange = (val: number) => {
        setNumberDigits(val);
        syncFormat(tokenOrder, separator, val);
    };

    const swapTokens = (indexA: number, indexB: number) => {
        const next = [...tokenOrder];
        [next[indexA], next[indexB]] = [next[indexB], next[indexA]];
        setTokenOrder(next);
        syncFormat(next, separator, numberDigits);
    };

    const handleSubmit = (values: JournalFormValues) => {
        if (isUpdate && journal?.id) {
            updateMutation.mutate(
                { id: journal.id, data: values },
                { onSuccess: () => onSuccess?.() },
            );
        } else {
            createMutation.mutate(values, {
                onSuccess: () => onSuccess?.(),
            });
        }
    };

    const isSubmitting = createMutation.isLoading || updateMutation.isLoading;
    const preview = buildPreview(tokenOrder, separator, form.values.prefix, numberDigits);

    return (
        <form onSubmit={form.onSubmit(handleSubmit)}>
            <Stack gap="lg">
                <TextInput
                    label="Jurnal nomi"
                    placeholder="Masalan: Kiruvchi hujjatlar jurnali"
                    size="md"
                    radius="sm"
                    required
                    leftSection={<IconBook size={18} color={colors.textDimmed} />}
                    {...form.getInputProps("name")}
                    styles={{
                        label: { fontWeight: 500, marginBottom: 6 },
                    }}
                />

                <TextInput
                    label="Prefiks"
                    placeholder="Masalan: KHM"
                    description="Katta harfda, maksimum 3 ta belgi"
                    size="md"
                    radius="sm"
                    required
                    maxLength={3}
                    leftSection={<IconHash size={18} color={colors.textDimmed} />}
                    {...form.getInputProps("prefix")}
                    onChange={(e) => {
                        form.setFieldValue("prefix", e.currentTarget.value.toUpperCase());
                    }}
                    styles={{
                        label: { fontWeight: 500, marginBottom: 6 },
                        input: { textTransform: "uppercase" },
                    }}
                />

                {/* Format Builder */}
                <Stack gap="xs">
                    <Text fw={500} size="sm">
                        Hujjat raqam formati <Text component="span" c="red" size="sm">*</Text>
                    </Text>

                    <Group grow>
                        <Select
                            label="Ajratuvchi"
                            size="sm"
                            radius="sm"
                            data={SEPARATOR_OPTIONS}
                            value={separator}
                            onChange={(val) => val && handleSeparatorChange(val)}
                            styles={{ label: { fontWeight: 500, marginBottom: 4 } }}
                        />
                        <NumberInput
                            label={`Raqam uzunligi (${"0".repeat(numberDigits)}1)`}
                            size="sm"
                            radius="sm"
                            min={1}
                            max={10}
                            value={numberDigits}
                            onChange={(val) => typeof val === "number" && handleDigitsChange(val)}
                            styles={{ label: { fontWeight: 500, marginBottom: 4 } }}
                        />
                    </Group>

                    <Text size="xs" c="dimmed" mt={4}>
                        Tartibni o'zgartirish uchun o'qlarni bosing
                    </Text>

                    <Group gap="xs">
                        {tokenOrder.map((token, index) => (
                            <Group key={token} gap={4}>
                                {index > 0 && (
                                    <Button
                                        variant="subtle"
                                        size="compact-xs"
                                        px={4}
                                        onClick={() => swapTokens(index - 1, index)}
                                        title="Chapga siljitish"
                                    >
                                        <IconArrowsExchange size={14} />
                                    </Button>
                                )}
                                <Badge
                                    color={TOKEN_COLORS[token]}
                                    variant="light"
                                    size="lg"
                                    radius="sm"
                                    style={{ cursor: "default" }}
                                >
                                    {TOKEN_LABELS[token]}
                                </Badge>
                            </Group>
                        ))}
                    </Group>

                    <Paper
                        withBorder
                        p="sm"
                        radius="sm"
                        style={{ borderColor: colors.border, backgroundColor: colors.bg }}
                    >
                        <Group gap="xs">
                            <Text size="xs" c="dimmed">Ko'rinishi:</Text>
                            <Text size="sm" fw={600} style={{ fontFamily: "monospace" }}>
                                {preview}
                            </Text>
                        </Group>
                        <Text size="xs" c="dimmed" mt={2}>
                            Format: {form.values.format}
                        </Text>
                    </Paper>
                </Stack>

                <Select
                    label="Bo'lim"
                    placeholder="Bo'limni tanlang"
                    size="md"
                    radius="sm"
                    required
                    searchable
                    leftSection={<IconBuilding size={18} color={colors.textDimmed} />}
                    data={
                        departmentsData?.data?.map((dept) => ({
                            value: dept.id,
                            label: dept.name,
                        })) || []
                    }
                    {...form.getInputProps("departmentId")}
                    styles={{
                        label: { fontWeight: 500, marginBottom: 6 },
                    }}
                    disabled={isLoadingDepartments}
                />

                <Select
                    label="Mas'ul shaxs"
                    placeholder="Foydalanuvchini tanlang"
                    size="md"
                    radius="sm"
                    required
                    searchable
                    leftSection={<IconUser size={18} color={colors.textDimmed} />}
                    data={
                        usersData?.data?.map((user) => ({
                            value: user.id,
                            label: user.username,
                        })) || []
                    }
                    {...form.getInputProps("responsibleUserId")}
                    styles={{
                        label: { fontWeight: 500, marginBottom: 6 },
                    }}
                    disabled={isLoadingUsers}
                />

                <Group justify="flex-end" gap="sm" pt="md">
                    <Button
                        variant="default"
                        onClick={onClose}
                        radius="sm"
                        size="md"
                        disabled={isSubmitting}
                    >
                        Bekor qilish
                    </Button>
                    <Button
                        type="submit"
                        radius="sm"
                        size="md"
                        loading={isSubmitting}
                        styles={{
                            root: {
                                backgroundColor: colors.primary,
                                "&:hover": { backgroundColor: colors.primaryHover },
                            },
                        }}
                    >
                        {isUpdate ? "Yangilash" : "Qo'shish"}
                    </Button>
                </Group>
            </Stack>
        </form>
    );
};

export default JournalForm;
