import { useEffect, useRef, useState } from "react";
import { Check, ChevronDown, Github, Search } from "lucide-react";
import { cn } from "../utils";

export interface GitHubRepositoryOption {
  repository: string;
  count: number;
}

interface GitHubRepositoryFilterProps {
  options: GitHubRepositoryOption[];
  value: string | null;
  onChange: (value: string | null) => void;
  labels: {
    trigger: string;
    all: string;
    search: string;
    empty: string;
    skillCount: (count: number) => string;
  };
}

export function GitHubRepositoryFilter({
  options,
  value,
  onChange,
  labels,
}: GitHubRepositoryFilterProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const filtered = options.filter((option) =>
    option.repository.includes(query.trim().toLowerCase())
  );

  useEffect(() => {
    if (!open) return;
    const handlePointerDown = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handlePointerDown);
    return () => document.removeEventListener("mousedown", handlePointerDown);
  }, [open]);

  const handleToggle = () => {
    setOpen((current) => {
      const next = !current;
      if (next) {
        setQuery("");
        window.setTimeout(() => searchRef.current?.focus(), 0);
      }
      return next;
    });
  };

  if (options.length === 0) return null;

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        onClick={handleToggle}
        aria-expanded={open}
        className={cn(
          "inline-flex h-7 max-w-[260px] items-center gap-1.5 rounded-md border px-2.5 text-[12px] font-medium transition-colors",
          value
            ? "border-accent/40 bg-accent-bg text-accent-light"
            : "border-border-subtle bg-surface-hover text-muted hover:text-secondary"
        )}
        title={value || labels.trigger}
      >
        <Github className="h-3.5 w-3.5 shrink-0" />
        <span className="truncate">{value || labels.trigger}</span>
        <ChevronDown className="h-3 w-3 shrink-0" />
      </button>

      {open && (
        <div className="absolute left-0 top-8 z-50 w-72 rounded-md border border-border bg-surface p-1.5 shadow-lg">
          <div className="relative mb-1.5">
            <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted" />
            <input
              ref={searchRef}
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Escape") setOpen(false);
              }}
              placeholder={labels.search}
              className="app-input h-8 w-full pl-8 text-[12px]"
              autoCapitalize="none"
              autoCorrect="off"
              spellCheck={false}
            />
          </div>
          <div className="max-h-64 overflow-y-auto">
            <button
              type="button"
              onClick={() => { onChange(null); setOpen(false); }}
              className="flex w-full items-center gap-2 rounded px-2 py-1.5 text-left text-[12px] text-secondary hover:bg-surface-hover"
            >
              <Check className={cn("h-3.5 w-3.5", value ? "opacity-0" : "text-accent")} />
              <span className="flex-1">{labels.all}</span>
            </button>
            {filtered.map((option) => (
              <button
                key={option.repository}
                type="button"
                onClick={() => { onChange(option.repository); setOpen(false); }}
                className="flex w-full items-center gap-2 rounded px-2 py-1.5 text-left text-[12px] text-secondary hover:bg-surface-hover"
              >
                <Check
                  className={cn(
                    "h-3.5 w-3.5 shrink-0",
                    value === option.repository ? "text-accent" : "opacity-0"
                  )}
                />
                <span className="min-w-0 flex-1 truncate font-mono">{option.repository}</span>
                <span className="shrink-0 text-[11px] text-muted">
                  {labels.skillCount(option.count)}
                </span>
              </button>
            ))}
            {filtered.length === 0 && (
              <div className="px-2 py-6 text-center text-[12px] text-muted">{labels.empty}</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
