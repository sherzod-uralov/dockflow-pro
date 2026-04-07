"use client";

import { Drawer, Stack, Switch, Text, Divider, Loader, Center, Box } from "@mantine/core";
import { useChatSettings, useUpdateChatSettings } from "../hook/chat.hook";
import { ChatSettings } from "../type/chat.type";

interface Props {
  opened: boolean;
  onClose: () => void;
}

const SETTING_GROUPS: Array<{
  title: string;
  items: Array<{ key: keyof ChatSettings; label: string; description: string }>;
}> = [
  {
    title: "Qo'ng'iroqlar",
    items: [
      { key: "allowCalls", label: "Audio qo'ng'iroqlar", description: "Boshqalar sizga ovozli qo'ng'iroq qila olishi" },
      { key: "allowVideoCalls", label: "Video qo'ng'iroqlar", description: "Boshqalar sizga video qo'ng'iroq qila olishi" },
    ],
  },
  {
    title: "Maxfiylik",
    items: [
      { key: "showOnlineStatus", label: "Onlayn holatim", description: "Boshqalar onlayn ekanligimni ko'rishi" },
      { key: "showLastSeen", label: "Oxirgi ko'rilgan", description: "Oxirgi marta qachon kirganligimni ko'rsatish" },
      { key: "showReadReceipts", label: "O'qildi belgisi", description: "Xabarni o'qiganimni boshqalarga ko'rsatish" },
      { key: "allowGroupInvites", label: "Guruhga taklif", description: "Boshqalar meni guruhga qo'sha olishi" },
    ],
  },
  {
    title: "Bildirishnomalar",
    items: [
      { key: "notifySound", label: "Ovoz", description: "Yangi xabar kelganda ovoz chiqishi" },
      { key: "notifyPreview", label: "Xabar matni ko'rsatish", description: "Bildirishnomada xabar matnini ko'rsatish" },
    ],
  },
];

export const ChatSettingsDrawer = ({ opened, onClose }: Props) => {
  const { data: settings, isLoading } = useChatSettings();
  const update = useUpdateChatSettings();

  const handleToggle = (key: keyof ChatSettings, value: boolean) => {
    update.mutate({ [key]: value } as Partial<ChatSettings>);
  };

  return (
    <Drawer opened={opened} onClose={onClose} title="Suhbat sozlamalari" position="right" size="md" padding="md">
      {isLoading || !settings ? (
        <Center py="xl">
          <Loader size="sm" color="#1e3a5f" />
        </Center>
      ) : (
        <Stack gap="md">
          {SETTING_GROUPS.map((group, gi) => (
            <Box key={group.title}>
              <Text size="xs" fw={600} c="#868e96" tt="uppercase" mb="xs">
                {group.title}
              </Text>
              <Stack gap="sm">
                {group.items.map((item) => (
                  <Switch
                    key={item.key}
                    label={item.label}
                    description={item.description}
                    checked={!!(settings as any)[item.key]}
                    onChange={(e) => handleToggle(item.key, e.currentTarget.checked)}
                    color="#1e3a5f"
                  />
                ))}
              </Stack>
              {gi < SETTING_GROUPS.length - 1 && <Divider mt="md" />}
            </Box>
          ))}
        </Stack>
      )}
    </Drawer>
  );
};
