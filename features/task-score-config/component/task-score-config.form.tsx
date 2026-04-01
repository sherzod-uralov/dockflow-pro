"use client";

import {
  TextInput,
  Textarea,
  NumberInput,
  Switch,
  Button,
  Group,
  Stack,
  SimpleGrid,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import {
  IconHash,
  IconFileDescription,
} from "@tabler/icons-react";
import {
  TaskScoreConfigGetResponse,
  useCreateTaskScoreConfig,
  useUpdateTaskScoreConfig,
} from "@/features/task-score-config";

interface TaskScoreConfigFormProps {
  mode: "create" | "update";
  config?: TaskScoreConfigGetResponse | null;
  onClose: () => void;
  onSuccess?: () => void;
}

interface TaskScoreConfigFormValues {
  priorityLevel: number;
  priorityCode: string;
  baseScore: number;
  recommendedDays: number;
  penaltyPerDay: number;
  maxPenaltyDays: number;
  description: string;
  criteria: string;
  isActive: boolean;
}

const TaskScoreConfigForm = ({
  mode,
  config,
  onClose,
  onSuccess,
}: TaskScoreConfigFormProps) => {
  const isUpdate = mode === "update";

  const createMutation = useCreateTaskScoreConfig();
  const updateMutation = useUpdateTaskScoreConfig();

  const form = useForm<TaskScoreConfigFormValues>({
    initialValues: {
      priorityLevel: config?.priorityLevel ?? 1,
      priorityCode: config?.priorityCode || "",
      baseScore: config?.baseScore ?? 0,
      recommendedDays: config?.recommendedDays ?? 0,
      penaltyPerDay: config?.penaltyPerDay ?? 0,
      maxPenaltyDays: config?.maxPenaltyDays ?? 0,
      description: config?.description || "",
      criteria: config?.criteria || "",
      isActive: config?.isActive ?? true,
    },
    validate: {
      priorityCode: (value) => (!value ? "Prioritet kodi kiritilishi shart" : null),
      baseScore: (value) => (value <= 0 ? "Asosiy ball 0 dan katta bo'lishi kerak" : null),
      recommendedDays: (value) => (value <= 0 ? "Tavsiya etilgan kunlar 0 dan katta bo'lishi kerak" : null),
      description: (value) => (!value ? "Tavsif kiritilishi shart" : null),
    },
  });

  const handleSubmit = (values: TaskScoreConfigFormValues) => {
    const payload = {
      ...values,
      criteria: values.criteria || undefined,
    };

    if (isUpdate && config?.id) {
      updateMutation.mutate(
        { id: config.id, data: payload },
        { onSuccess: () => onSuccess?.() }
      );
    } else {
      createMutation.mutate(payload, {
        onSuccess: () => onSuccess?.(),
      });
    }
  };

  const isSubmitting = createMutation.isLoading || updateMutation.isLoading;

  return (
    <form onSubmit={form.onSubmit(handleSubmit)}>
      <Stack gap="lg">
        <SimpleGrid cols={2}>
          <NumberInput
            label="Prioritet darajasi"
            placeholder="1"
            size="md"
            radius="sm"
            required
            min={1}
            max={10}
            {...form.getInputProps("priorityLevel")}
            styles={{ label: { fontWeight: 500, marginBottom: 6 } }}
          />
          <TextInput
            label="Prioritet kodi"
            placeholder="Masalan: №1"
            size="md"
            radius="sm"
            required
            leftSection={<IconHash size={18} color="#868e96" />}
            {...form.getInputProps("priorityCode")}
            styles={{ label: { fontWeight: 500, marginBottom: 6 } }}
          />
        </SimpleGrid>

        <SimpleGrid cols={2}>
          <NumberInput
            label="Asosiy ball"
            placeholder="50"
            size="md"
            radius="sm"
            required
            min={0}
            {...form.getInputProps("baseScore")}
            styles={{ label: { fontWeight: 500, marginBottom: 6 } }}
          />
          <NumberInput
            label="Tavsiya etilgan kunlar"
            placeholder="12"
            size="md"
            radius="sm"
            required
            min={1}
            {...form.getInputProps("recommendedDays")}
            styles={{ label: { fontWeight: 500, marginBottom: 6 } }}
          />
        </SimpleGrid>

        <SimpleGrid cols={2}>
          <NumberInput
            label="Kunlik jarima"
            placeholder="-10"
            size="md"
            radius="sm"
            max={0}
            {...form.getInputProps("penaltyPerDay")}
            styles={{ label: { fontWeight: 500, marginBottom: 6 } }}
          />
          <NumberInput
            label="Maksimal jarima kunlari"
            placeholder="10"
            size="md"
            radius="sm"
            min={0}
            {...form.getInputProps("maxPenaltyDays")}
            styles={{ label: { fontWeight: 500, marginBottom: 6 } }}
          />
        </SimpleGrid>

        <Textarea
          label="Tavsif"
          placeholder="Konfiguratsiya haqida ma'lumot"
          size="md"
          radius="sm"
          required
          rows={3}
          leftSection={<IconFileDescription size={18} color="#868e96" />}
          {...form.getInputProps("description")}
          styles={{ label: { fontWeight: 500, marginBottom: 6 } }}
        />

        <Textarea
          label="Mezon"
          placeholder="O'lchanadigan mezonlar"
          size="md"
          radius="sm"
          rows={2}
          {...form.getInputProps("criteria")}
          styles={{ label: { fontWeight: 500, marginBottom: 6 } }}
        />

        {isUpdate && (
          <Switch
            label="Faol"
            description="Bu konfiguratsiya faolmi?"
            {...form.getInputProps("isActive", { type: "checkbox" })}
          />
        )}

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
                backgroundColor: "#1e3a5f",
                "&:hover": { backgroundColor: "#162d4a" },
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

export default TaskScoreConfigForm;
