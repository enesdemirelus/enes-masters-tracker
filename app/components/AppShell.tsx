"use client";

import { useEffect, useState, type CSSProperties } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ActionIcon,
  Button,
  Center,
  Drawer,
  Loader,
  SegmentedControl,
  useMantineColorScheme,
  VisuallyHidden,
  type MantineColorScheme,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import {
  IconArrowsLeftRight,
  IconBuildingBank,
  IconCalendarDue,
  IconDeviceDesktop,
  IconDownload,
  IconLayoutDashboard,
  IconMenu2,
  IconMoon,
  IconSun,
  IconUsers,
} from "@tabler/icons-react";
import { useIsMobile } from "@/lib/use-mobile";
import {
  errorMessage,
  notifyError,
  overlayProps,
  secondaryButtonStyle,
  ui,
} from "@/app/theme";

const SIDEBAR_WIDTH = 230;
const TOPBAR_HEIGHT = 56;

const NAV_ITEMS = [
  { href: "/", label: "Dashboard", Icon: IconLayoutDashboard },
  { href: "/schools", label: "Schools", Icon: IconBuildingBank },
  { href: "/deadlines", label: "Deadlines", Icon: IconCalendarDue },
  { href: "/recommenders", label: "Recommenders", Icon: IconUsers },
  { href: "/compare", label: "Compare", Icon: IconArrowsLeftRight },
] as const;

/**
 * Dashboard is the only exact-match route: every other section owns its
 * subtree (`/schools/<id>` has to keep "Schools" lit).
 */
function isActive(pathname: string, href: string): boolean {
  if (href === "/") {
    return pathname === "/";
  }
  return pathname === href || pathname.startsWith(`${href}/`);
}

function Wordmark() {
  return (
    <div>
      <div style={{ fontSize: 16, fontWeight: 700, color: ui.ink }}>
        Masters Tracker
      </div>
      <div style={{ fontSize: 11, color: ui.muted, marginTop: 2 }}>
        application companion
      </div>
    </div>
  );
}

function NavLinks({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname() ?? "/";

  return (
    <nav style={{ display: "flex", flexDirection: "column", gap: 2 }}>
      {NAV_ITEMS.map(({ href, label, Icon }) => {
        const active = isActive(pathname, href);
        return (
          <Link
            key={href}
            href={href}
            onClick={onNavigate}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              padding: "8px 10px",
              borderRadius: 6,
              fontSize: 14,
              textDecoration: "none",
              color: active ? ui.ink : ui.body,
              fontWeight: active ? 600 : 500,
              background: active ? ui.subtle : "transparent",
            }}
            onMouseEnter={(event) => {
              if (!active) {
                event.currentTarget.style.background = ui.subtle;
              }
            }}
            onMouseLeave={(event) => {
              if (!active) {
                event.currentTarget.style.background = "transparent";
              }
            }}
          >
            <Icon size={18} stroke={1.5} />
            {label}
          </Link>
        );
      })}
    </nav>
  );
}

/**
 * Streams `/api/export` into a blob before triggering the save so a failed
 * request surfaces as a notification instead of a downloaded error page.
 */
function ExportButton({ onDone }: { onDone?: () => void }) {
  const [busy, setBusy] = useState(false);

  const handleExport = async () => {
    setBusy(true);
    try {
      const response = await fetch("/api/export");
      if (!response.ok) {
        throw new Error(`Export failed: ${response.status}`);
      }
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = "masters-tracker-export.json";
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      URL.revokeObjectURL(url);
      onDone?.();
    } catch (error) {
      console.error("Error exporting data:", error);
      notifyError("Export failed", errorMessage(error, "Could not export data"));
    } finally {
      setBusy(false);
    }
  };

  return (
    <Button
      fullWidth
      size="sm"
      radius={6}
      loading={busy}
      leftSection={<IconDownload size={16} stroke={1.5} />}
      style={secondaryButtonStyle}
      onClick={handleExport}
    >
      Export data
    </Button>
  );
}

/**
 * Light / dark / auto, as a three-state control rather than a two-state switch:
 * "follow the OS" is a real preference, and a switch can only ever report the
 * scheme it happens to be resolving to, which makes it impossible to tell a
 * deliberate choice from a borrowed one.
 *
 * Labels are icon-only because the sidebar is 230px wide; the text is still in
 * the DOM for screen readers.
 */
const SCHEME_OPTIONS = [
  { value: "light", Icon: IconSun, label: "Light" },
  { value: "dark", Icon: IconMoon, label: "Dark" },
  { value: "auto", Icon: IconDeviceDesktop, label: "Match system" },
] as const;

function ColorSchemeToggle() {
  const { colorScheme, setColorScheme } = useMantineColorScheme();

  return (
    <SegmentedControl
      fullWidth
      size="xs"
      radius={6}
      // Track, indicator and label geometry all live in the shared
      // `.app-segmented` class (see globals.css) — that is what keeps the
      // selected indicator centred here and on the schools controls alike.
      className="app-segmented"
      aria-label="Color scheme"
      value={colorScheme}
      onChange={(value) => setColorScheme(value as MantineColorScheme)}
      data={SCHEME_OPTIONS.map(({ value, Icon, label }) => ({
        value,
        label: (
          <Center>
            <Icon size={15} stroke={1.5} />
            <VisuallyHidden>{label}</VisuallyHidden>
          </Center>
        ),
      }))}
    />
  );
}

/** Pinned block at the bottom of both the sidebar and the mobile drawer. */
function ShellFooter({ onExported }: { onExported?: () => void }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      <ColorSchemeToggle />
      <ExportButton onDone={onExported} />
    </div>
  );
}

export default function AppShell({ children }: { children: React.ReactNode }) {
  const isMobile = useIsMobile();
  const pathname = usePathname();
  const [drawerOpened, { open: openDrawer, close: closeDrawer }] =
    useDisclosure(false);

  // A route change from anywhere (nav link, back button) should never leave the
  // drawer hanging over the new page.
  useEffect(() => {
    closeDrawer();
  }, [pathname, closeDrawer]);

  const contentStyle: CSSProperties = {
    maxWidth: 1240,
    margin: "0 auto",
    padding: isMobile ? 16 : 32,
  };

  // Breakpoint is unknown on the very first client render — hold the page back
  // rather than flashing the desktop shell on a phone.
  if (isMobile === undefined) {
    return (
      <div style={{ background: ui.canvas, minHeight: "100vh" }}>
        <div style={{ maxWidth: 1240, margin: "0 auto", padding: 32 }}>
          <Center style={{ minHeight: "60vh" }}>
            <Loader color={ui.emphasis} size="sm" />
          </Center>
        </div>
      </div>
    );
  }

  if (isMobile) {
    return (
      <div style={{ background: ui.canvas, minHeight: "100vh" }}>
        <header
          style={{
            position: "sticky",
            top: 0,
            zIndex: 100,
            height: TOPBAR_HEIGHT,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 12,
            padding: "0 16px",
            background: ui.surface,
            borderBottom: `1px solid ${ui.border}`,
          }}
        >
          <Wordmark />
          <ActionIcon
            variant="subtle"
            size="lg"
            radius={6}
            aria-label="Open navigation"
            style={{ color: ui.ink }}
            onClick={openDrawer}
          >
            <IconMenu2 size={20} stroke={1.5} />
          </ActionIcon>
        </header>

        <Drawer
          opened={drawerOpened}
          onClose={closeDrawer}
          position="left"
          size={260}
          withCloseButton
          title={<Wordmark />}
          overlayProps={overlayProps}
          styles={{
            content: { background: ui.surface },
            header: {
              background: ui.surface,
              borderBottom: `1px solid ${ui.border}`,
            },
            body: { padding: 16 },
          }}
        >
          <NavLinks onNavigate={closeDrawer} />
          <div style={{ marginTop: 20 }}>
            <ShellFooter onExported={closeDrawer} />
          </div>
        </Drawer>

        <main style={contentStyle}>{children}</main>
      </div>
    );
  }

  return (
    <div style={{ background: ui.canvas, minHeight: "100vh" }}>
      <aside
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          bottom: 0,
          width: SIDEBAR_WIDTH,
          display: "flex",
          flexDirection: "column",
          padding: 16,
          background: ui.surface,
          borderRight: `1px solid ${ui.border}`,
          zIndex: 100,
        }}
      >
        <div style={{ padding: "6px 10px 20px" }}>
          <Wordmark />
        </div>
        <NavLinks />
        <div style={{ marginTop: "auto" }}>
          <ShellFooter />
        </div>
      </aside>

      <main style={{ marginLeft: SIDEBAR_WIDTH }}>
        <div style={contentStyle}>{children}</div>
      </main>
    </div>
  );
}
