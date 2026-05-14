"use client";
import { Drawer, Button, Grid } from "antd";

const { useBreakpoint } = Grid;

export default function FormDrawer({
  title,
  open,
  onClose,
  onOk,
  okText = "Lưu",
  cancelText = "Hủy",
  okDanger,
  width = 520,
  children,
  footerExtra,
}: {
  title: React.ReactNode;
  open: boolean;
  onClose: () => void;
  onOk?: () => void;
  okText?: string;
  cancelText?: string;
  okDanger?: boolean;
  width?: number;
  children: React.ReactNode;
  footerExtra?: React.ReactNode;
}) {
  const screens = useBreakpoint();
  const isMobile = !screens.md;

  return (
    <Drawer
      title={title}
      placement={isMobile ? "bottom" : "right"}
      open={open}
      onClose={onClose}
      destroyOnHidden
      size={isMobile ? undefined : width}
      styles={
        isMobile
          ? {
              wrapper: { height: "100dvh", maxHeight: "100dvh" },
              body: { paddingBottom: 24 },
            }
          : { body: { paddingBottom: 24 } }
      }
      footer={
        <div className="flex justify-end gap-2">
          {footerExtra}
          <Button onClick={onClose}>{cancelText}</Button>
          {onOk && (
            <Button type="primary" danger={okDanger} onClick={onOk}>
              {okText}
            </Button>
          )}
        </div>
      }
    >
      {children}
    </Drawer>
  );
}
