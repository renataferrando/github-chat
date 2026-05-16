import { avatarColor } from "@/src/lib/utils";

export interface AvatarProps {
  username: string;
  name: string;
  size?: number;
  rounded?: "sm" | "md" | "full";
}

const ROUND_CLASS: Record<NonNullable<AvatarProps["rounded"]>, string> = {
  sm: "rounded-sm",
  md: "rounded-md",
  full: "rounded-full",
};

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) {
    return (
      (parts[0]?.[0] ?? "") + (parts[parts.length - 1]?.[0] ?? "")
    ).toUpperCase();
  }
  return (parts[0]?.[0] ?? "?").toUpperCase();
}

export function Avatar({
  username,
  name,
  size = 280,
  rounded = "md",
}: AvatarProps) {
  const initials = getInitials(name);
  const fontSize = Math.round(size * 0.38);
  const bg = avatarColor(username);

  return (
    <div
      className={`flex items-center justify-center select-none flex-shrink-0 ${ROUND_CLASS[rounded]}`}
      style={{
        width: size,
        height: size,
        backgroundColor: bg,
        fontSize: fontSize,
        color: "#ffffff",
        fontWeight: 600,
        letterSpacing: "-0.02em",
        lineHeight: 1,
      }}
      aria-hidden="true"
    >
      {initials}
    </div>
  );
}
