export const LIMITS = {
  form: {
    maxFields: 200,
    maxPages: 20,
    maxOptions: 100,
    maxMatrixRows: 20,
    maxMatrixColumns: 10,
    titleMaxLength: 200,
    descriptionMaxLength: 2000,
    slugMinLength: 3,
    slugMaxLength: 60,
  },
  file: {
    maxFormAssetSize: 5 * 1024 * 1024, // 5MB
    maxResponseUploadSize: 50 * 1024 * 1024, // 50MB
    allowedImageTypes: ["image/jpeg", "image/png", "image/gif", "image/webp", "image/svg+xml"],
  },
  response: {
    maxTextLength: 10000,
  },
  workspace: {
    maxMembers: 50,
    nameMaxLength: 100,
  },
  autoSave: {
    debounceMs: 1000,
  },
  history: {
    maxSnapshots: 50,
  },
} as const;
