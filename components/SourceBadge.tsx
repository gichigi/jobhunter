"use client";

// Colour map for source board badges
const BOARD_COLORS: Record<string, { bg: string; text: string }> = {
  Remotive: { bg: "bg-purple-100", text: "text-purple-700" },
  "User Interviews": { bg: "bg-blue-100", text: "text-blue-700" },
  "Lisbon UX": { bg: "bg-orange-100", text: "text-orange-700" },
  "We Work Remotely": { bg: "bg-green-100", text: "text-green-700" },
  Dribbble: { bg: "bg-pink-100", text: "text-pink-700" },
  Discovery: { bg: "bg-gray-100", text: "text-gray-600" },
};

const DEFAULT_COLORS = { bg: "bg-gray-100", text: "text-gray-600" };

interface SourceBadgeProps {
  board: string;
}

export default function SourceBadge({ board }: SourceBadgeProps) {
  const colors = BOARD_COLORS[board] ?? DEFAULT_COLORS;
  return (
    <span
      className={`text-xs px-2 py-0.5 rounded-full font-medium ${colors.bg} ${colors.text}`}
    >
      {board}
    </span>
  );
}
