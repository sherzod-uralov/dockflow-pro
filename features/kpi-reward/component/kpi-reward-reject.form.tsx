"use client";

import {
  Textarea,
  Button,
  Group,
  Stack,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { IconFileDescription } from "@tabler/icons-react";
import { useRejectKpiReward } from "../hook/kpi-reward.hook";

interface KpiRewardRejectFormProps {
  rewardId: string;
  onClose: () => void;
  onSuccess?: () => void;
}

interface RejectFormValues {
  notes: string;
}

const KpiRewardRejectForm = ({
  rewardId,
  onClose,
  onSuccess,
}: KpiRewardRejectFormProps) => {
  const rejectMutation = useRejectKpiReward();

  const form = useForm<RejectFormValues>({
    initialValues: {
      notes: "",
    },
    validate: {
      notes: (value) =>
        !value.trim() ? "Rad etish sababi kiritilishi shart" : null,
    },
  });

  const handleSubmit = (values: RejectFormValues) => {
    rejectMutation.mutate(
      { id: rewardId, data: { notes: values.notes } },
      { onSuccess: () => onSuccess?.() }
    );
  };

  return (
    <form onSubmit={form.onSubmit(handleSubmit)}>
      <Stack gap="lg">
        <Textarea
          label="Rad etish sababi"
          placeholder="Mukofotni rad etish sababini kiriting"
          size="md"
          radius="sm"
          required
          rows={4}
          leftSection={<IconFileDescription size={18} color="#868e96" />}
          {...form.getInputProps("notes")}
          styles={{ label: { fontWeight: 500, marginBottom: 6 } }}
        />

        <Group justify="flex-end" gap="sm" pt="md">
          <Button
            variant="default"
            onClick={onClose}
            radius="sm"
            size="md"
            disabled={rejectMutation.isLoading}
          >
            Bekor qilish
          </Button>
          <Button
            type="submit"
            color="red"
            radius="sm"
            size="md"
            loading={rejectMutation.isLoading}
          >
            Rad etish
          </Button>
        </Group>
      </Stack>
    </form>
  );
};

export default KpiRewardRejectForm;
