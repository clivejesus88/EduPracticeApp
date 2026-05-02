const EXAM_DRAFT_KEY = 'eduPractice_activeExamDraft';

export function loadExamDraft() {
  try {
    const raw = localStorage.getItem(EXAM_DRAFT_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function saveExamDraft(draft) {
  localStorage.setItem(
    EXAM_DRAFT_KEY,
    JSON.stringify({
      ...draft,
      updatedAt: new Date().toISOString(),
    })
  );
}

export function clearExamDraft() {
  localStorage.removeItem(EXAM_DRAFT_KEY);
}

export function hasExamDraft() {
  return !!loadExamDraft();
}
