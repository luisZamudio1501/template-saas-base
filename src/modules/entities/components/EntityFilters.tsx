"use client";

import { Input } from "@/components/ui/input";

interface EntityFiltersProps {
  search: string;
  onSearchChange: (value: string) => void;
}

export function EntityFilters({ search, onSearchChange }: EntityFiltersProps) {
  return (
    <div className="flex flex-wrap gap-3">
      <Input
        type="text"
        placeholder="Search by name..."
        value={search}
        onChange={(e) => onSearchChange(e.target.value)}
        className="w-auto"
      />
    </div>
  );
}
