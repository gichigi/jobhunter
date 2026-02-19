"use client";

interface SearchButtonProps {
  loading: boolean;
  onClick: () => void;
}

export default function SearchButton({ loading, onClick }: SearchButtonProps) {
  return (
    <button
      onClick={onClick}
      disabled={loading}
      className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
    >
      {loading ? "Searching..." : "Find Jobs"}
    </button>
  );
}
