import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import {
  ColorSchemeScript,
  MantineProvider,
  mantineHtmlProps,
} from "@mantine/core";
import { Notifications } from "@mantine/notifications";
import "@mantine/core/styles.css";
import "@mantine/notifications/styles.css";
import AppShell from "./components/AppShell";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Enes's Masters Tracker",
  description:
    "Track master's program applications: schools, deadlines, recommenders and application status.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // `mantineHtmlProps` carries `suppressHydrationWarning`: the script in <head>
  // stamps `data-mantine-color-scheme` on <html> before React hydrates, so the
  // attribute never matches the server markup and React would otherwise log a
  // mismatch on every load.
  return (
    <html lang="en" {...mantineHtmlProps}>
      <head>
        {/*
          Stamps `data-mantine-color-scheme` on <html> from localStorage (or the
          OS preference under "auto") *before* first paint. Without it the page
          renders in the default scheme for a frame and then flips, which on a
          dark-mode machine is a full-screen white flash.
        */}
        <ColorSchemeScript defaultColorScheme="auto" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {/*
          "auto" follows the OS until the sidebar toggle sets an explicit
          choice; Mantine's default colorSchemeManager persists that to
          localStorage, so the script above can restore it on the next load.
        */}
        <MantineProvider defaultColorScheme="auto">
          <Notifications position="top-right" zIndex={1000} />
          <AppShell>{children}</AppShell>
        </MantineProvider>
      </body>
    </html>
  );
}
