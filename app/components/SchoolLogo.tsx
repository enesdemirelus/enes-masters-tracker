"use client";

import type { CSSProperties } from "react";
import Image from "next/image";
import { ui } from "@/app/theme";

/**
 * Flat gray square with the school's initial, used when no logo is stored.
 *
 * Lived in `MoreInfoModal` until the modal was replaced by the school detail
 * page; it is a plain presentational block, so it now stands on its own.
 */
export function SchoolLogo({
  school,
  size,
}: {
  school: { name: string; logo?: string | null };
  size: number;
}) {
  const shell: CSSProperties = {
    width: size,
    height: size,
    flexShrink: 0,
    borderRadius: 8,
    border: `1px solid ${ui.border}`,
    background: ui.subtle,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  };

  if (!school.logo) {
    return (
      <div style={shell}>
        <span
          style={{ fontSize: size * 0.4, fontWeight: 600, color: ui.body }}
        >
          {school.name?.charAt(0).toUpperCase() || "?"}
        </span>
      </div>
    );
  }

  // Remote marks are mostly dark artwork on a transparent background, so the
  // tile keeps a light plate in both schemes instead of following the surface.
  return (
    <div style={{ ...shell, background: ui.logoPlate }}>
      <Image
        src={school.logo}
        alt={school.name}
        width={size}
        height={size}
        style={{ objectFit: "contain", padding: 6 }}
      />
    </div>
  );
}

export default SchoolLogo;
