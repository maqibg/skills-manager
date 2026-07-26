import { useEffect, useRef, useState } from "react";
import { Loader2, Pencil } from "lucide-react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import * as api from "../lib/tauri";
import type { ManagedSkill } from "../lib/tauri";
import { getErrorMessage } from "../lib/error";
import { cn } from "../utils";

const MAX_NOTE_CHARS = 500;

interface SkillNoteEditorProps {
  skill: ManagedSkill;
  onSaved: () => Promise<void> | void;
  buttonClassName?: string;
}

export function SkillNoteEditor({ skill, onSaved, buttonClassName }: SkillNoteEditorProps) {
  const { t } = useTranslation();
  const rootRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState("");
  const [saving, setSaving] = useState(false);
  const noteLength = Array.from(draft.trim()).length;
  const tooLong = noteLength > MAX_NOTE_CHARS;

  useEffect(() => {
    if (!open) return;
    const handlePointerDown = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handlePointerDown);
    return () => document.removeEventListener("mousedown", handlePointerDown);
  }, [open]);

  const handleOpen = () => {
    setDraft(skill.note || "");
    setOpen(true);
    window.setTimeout(() => textareaRef.current?.focus(), 0);
  };

  const handleSave = async () => {
    if (tooLong || saving) return;
    setSaving(true);
    try {
      await api.setSkillNote(skill.id, draft);
      setOpen(false);
      toast.success(t("mySkills.note.saved"));
      try {
        await onSaved();
      } catch {
        toast.warning(t("common.dataOutOfDate"));
      }
    } catch (error) {
      toast.error(getErrorMessage(error, t("mySkills.note.saveFailed")));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div ref={rootRef} className="relative" onClick={(event) => event.stopPropagation()}>
      <button
        type="button"
        onClick={handleOpen}
        className={cn(
          "rounded p-1 text-muted transition-colors hover:bg-surface-hover hover:text-secondary",
          buttonClassName
        )}
        title={t("mySkills.note.edit")}
        aria-label={t("mySkills.note.edit")}
      >
        <Pencil className="h-3.5 w-3.5" />
      </button>

      {open && (
        <div className="absolute right-0 top-7 z-50 w-72 rounded-md border border-border bg-surface p-3 shadow-lg">
          <label className="mb-1.5 block text-[12px] font-medium text-secondary">
            {t("mySkills.note.label")}
          </label>
          <textarea
            ref={textareaRef}
            rows={3}
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Escape") setOpen(false);
              if (event.key === "Enter" && (event.ctrlKey || event.metaKey)) {
                event.preventDefault();
                void handleSave();
              }
            }}
            placeholder={t("mySkills.note.placeholder")}
            className="app-input min-h-[72px] w-full resize-none py-2 text-[13px] leading-5"
          />
          <div className="mt-1 flex items-center justify-between gap-3">
            <span className={cn("text-[11px] text-muted", tooLong && "text-red-500")}>
              {tooLong
                ? t("mySkills.note.tooLong", { count: noteLength, max: MAX_NOTE_CHARS })
                : t("mySkills.note.characterCount", { count: noteLength, max: MAX_NOTE_CHARS })}
            </span>
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => setOpen(false)}
                disabled={saving}
                className="rounded px-2 py-1 text-[12px] text-muted transition-colors hover:bg-surface-hover hover:text-secondary disabled:opacity-50"
              >
                {t("common.cancel")}
              </button>
              <button
                type="button"
                onClick={() => void handleSave()}
                disabled={saving || tooLong}
                className="inline-flex items-center gap-1 rounded bg-accent px-2 py-1 text-[12px] font-medium text-white transition-colors hover:bg-accent-hover disabled:opacity-50"
              >
                {saving && <Loader2 className="h-3 w-3 animate-spin" />}
                {t("common.save")}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
