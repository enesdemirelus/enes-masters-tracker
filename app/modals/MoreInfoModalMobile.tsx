"use client";

import { Button, Group, Modal, Stack } from "@mantine/core";
import {
  NotesSection,
  ProgramDetails,
  SchoolHeader,
  type MoreInfoModalProps,
} from "./MoreInfoModal";
import { modalStyles, overlayProps, secondaryButtonStyle } from "./modalTheme";

/**
 * Same content as the desktop MoreInfoModal, stacked for narrow screens.
 * The sections themselves are shared so the two stay in sync.
 */
function MoreInfoModalMobile({
  opened,
  onClose,
  school,
  onSaved,
}: MoreInfoModalProps) {
  if (!school) {
    return null;
  }

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      centered
      size="95%"
      radius={8}
      overlayProps={overlayProps}
      styles={{
        ...modalStyles,
        header: { ...modalStyles.header, padding: "12px 16px" },
        body: { padding: "16px" },
      }}
      title={<SchoolHeader school={school} compact />}
    >
      <Stack gap="md">
        <ProgramDetails school={school} />
        <NotesSection school={school} onSaved={onSaved} />
        <Group justify="flex-end">
          <Button
            size="sm"
            variant="default"
            style={secondaryButtonStyle}
            onClick={onClose}
          >
            Close
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
}

export default MoreInfoModalMobile;
