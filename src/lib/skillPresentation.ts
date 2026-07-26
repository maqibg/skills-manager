import type { ManagedSkill } from "./tauri";

export function getSkillSummary(skill: Pick<ManagedSkill, "note" | "description">) {
  const note = skill.note?.trim();
  return note || skill.description;
}

export function getSkillSummaryLine(skill: Pick<ManagedSkill, "note" | "description">) {
  return getSkillSummary(skill)?.replace(/\s+/g, " ") || null;
}

export function getGitHubRepository(
  skill: Pick<ManagedSkill, "source_type" | "source_ref" | "source_ref_resolved">
) {
  if (skill.source_type !== "git" && skill.source_type !== "skillssh") return null;

  for (const candidate of [skill.source_ref_resolved, skill.source_ref]) {
    const repository = parseGitHubRepository(candidate, skill.source_type === "skillssh");
    if (repository) return repository;
  }
  return null;
}

function parseGitHubRepository(value: string | null, allowShorthand: boolean) {
  const input = value?.trim();
  if (!input) return null;

  const match = input.match(
    /^(?:https?:\/\/|ssh:\/\/(?:git@)?|git@)github\.com[/:]([^/\s]+)\/([^/#?\s]+)/i
  );
  if (match) {
    return normalizeRepository(match[1], match[2]);
  }

  const shorthand = allowShorthand
    ? input.match(/^([^/\s]+)\/([^/@\s]+)(?:[/@].*)?$/)
    : null;
  if (shorthand) {
    return normalizeRepository(shorthand[1], shorthand[2]);
  }
  return null;
}

function normalizeRepository(owner: string, repository: string) {
  const cleanRepository = repository.replace(/\.git$/i, "");
  if (!owner || !cleanRepository) return null;
  return `${owner}/${cleanRepository}`.toLowerCase();
}
