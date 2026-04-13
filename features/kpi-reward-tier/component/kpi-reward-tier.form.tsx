"use client";

import {
  TextInput,
  Textarea,
  NumberInput,
  Select,
  Switch,
  Button,
  Group,
  Stack,
  SimpleGrid,
  ColorInput,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import {
  IconTag,
  IconFileDescription,
  IconPalette,
} from "@tabler/icons-react";
import {
  KpiRewardTierGetResponse,
  useCreateKpiRewardTier,
  useUpdateKpiRewardTier,
} from "@/features/kpi-reward-tier";

interface KpiRewardTierFormProps {
  mode: "create" | "update";
  tier?: KpiRewardTierGetResponse | null;
  onClose: () => void;
  onSuccess?: () => void;
}

interface KpiRewardTierFormValues {
  name: string;
  minScore: number;
  maxScore: number;
  rewardBhm: number | undefined;
  rewardAmount: number | undefined;
  isPenalty: boolean;
  penaltyType: string;
  description: string;
  color: string;
}

const PENALTY_TYPE_OPTIONS = [
  { value: "SCORE_DEDUCTION", label: "Ball kamaytirish" },
  { value: "SALARY_DEDUCTION", label: "Ish haqi kamaytirish" },
  { value: "WARNING", label: "Ogohlantirish" },
];

const KpiRewardTierForm = ({
  mode,
  tier,
  onClose,
  onSuccess,
}: KpiRewardTierFormProps) => {
  const isUpdate = mode === "update";

  const createMutation = useCreateKpiRewardTier();
  const updateMutation = useUpdateKpiRewardTier();

  const form = useForm<KpiRewardTierFormValues>({
    initialValues: {
      name: tier?.name || "",
      minScore: tier?.minScore ?? 0,
      maxScore: tier?.maxScore ?? 0,
      rewardBhm: tier?.rewardBhm,
      rewardAmount: tier?.rewardAmount,
      isPenalty: tier?.isPenalty ?? false,
      penaltyType: tier?.penaltyType || "",
      description: tier?.description || "",
      color: tier?.color || colors.primary,
    },
    validate: {
      name: (value) => (!value ? "Nomi kiritilishi shart" : null),
      minScore: (value) => (value < 0 ? "Minimal ball 0 dan kichik bo'lmasligi kerak" : null),
      maxScore: (value, values) =>
        value <= values.minScore ? "Maksimal ball minimal balldan katta bo'lishi kerak" : null,
    },
  });

  const handleSubmit = (values: KpiRewardTierFormValues) => {
    const payload = {
      ...values,
      penaltyType: values.isPenalty ? values.penaltyType : undefined,
    };

    if (isUpdate && tier?.id) {
      updateMutation.mutate(
        { id: tier.id, data: payload },
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
        <TextInput
          label="Nomi"
          placeholder="Masalan: Oltin daraja"
          size="md"
          radius="sm"
          required
          leftSection={<IconTag size={18} color={colors.textDimmed} />}
          {...form.getInputProps("name")}
          styles={{ label: { fontWeight: 500, marginBottom: 6 } }}
        />

        <SimpleGrid cols={2}>
          <NumberInput
            label="Minimal ball"
            placeholder="0"
            size="md"
            radius="sm"
            required
            min={0}
            {...form.getInputProps("minScore")}
            styles={{ label: { fontWeight: 500, marginBottom: 6 } }}
          />
          <NumberInput
            label="Maksimal ball"
            placeholder="100"
            size="md"
            radius="sm"
            required
            min={0}
            {...form.getInputProps("maxScore")}
            styles={{ label: { fontWeight: 500, marginBottom: 6 } }}
          />
        </SimpleGrid>

        <SimpleGrid cols={2}>
          <NumberInput
            label="Mukofot (BHM)"
            placeholder="0"
            size="md"
            radius="sm"
            min={0}
            {...form.getInputProps("rewardBhm")}
            styles={{ label: { fontWeight: 500, marginBottom: 6 } }}
          />
          <NumberInput
            label="Mukofot (so'm)"
            placeholder="0"
            size="md"
            radius="sm"
            min={0}
            {...form.getInputProps("rewardAmount")}
            styles={{ label: { fontWeight: 500, marginBottom: 6 } }}
          />
        </SimpleGrid>

        <Switch
          label="Jarima"
          description="Bu daraja jarima hisoblanadimi?"
          {...form.getInputProps("isPenalty", { type: "checkbox" })}
        />

        {form.values.isPenalty && (
          <Select
            label="Jarima turi"
            placeholder="Jarima turini tanlang"
            size="md"
            radius="sm"
            data={PENALTY_TYPE_OPTIONS}
            {...form.getInputProps("penaltyType")}
            styles={{ label: { fontWeight: 500, marginBottom: 6 } }}
          />
        )}

        <Textarea
          label="Tavsif"
          placeholder="Daraja haqida qisqacha ma'lumot"
          size="md"
          radius="sm"
          rows={3}
          leftSection={<IconFileDescription size={18} color={colors.textDimmed} />}
          {...form.getInputProps("description")}
          styles={{ label: { fontWeight: 500, marginBottom: 6 } }}
        />

        <ColorInput
          label="Rang"
          placeholder="Rangni tanlang"
          size="md"
          radius="sm"
          leftSection={<IconPalette size={18} color={colors.textDimmed} />}
          {...form.getInputProps("color")}
          styles={{ label: { fontWeight: 500, marginBottom: 6 } }}
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
import { colors } from "@/lib/colors";

export default KpiRewardTierForm;
