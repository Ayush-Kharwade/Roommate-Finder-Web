// Client-side image guards.
//
// These are a courtesy to the user, not a security boundary — anyone can call
// the upload endpoints directly. The real limits live in storage.rules and in
// the Cloudinary upload preset. Keep the three in sync.

export const MAX_IMAGE_BYTES = 2 * 1024 * 1024; // 2 MB
export const MAX_LISTING_IMAGES = 3;
export const ALLOWED_IMAGE_TYPES = ['image/png', 'image/jpeg', 'image/webp'];

const prettySize = (bytes) => `${(bytes / (1024 * 1024)).toFixed(1)}MB`;

/**
 * Validates one file. Returns null when it's fine, or a user-facing message.
 */
export function validateImage(file) {
  if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
    return `"${file.name}" isn't a supported image. Use PNG, JPG or WEBP.`;
  }
  if (file.size > MAX_IMAGE_BYTES) {
    return `"${file.name}" is ${prettySize(file.size)}. Each photo must be under ${prettySize(MAX_IMAGE_BYTES)}.`;
  }
  return null;
}

/**
 * Validates a batch against the per-listing count limit.
 * Returns null when the whole batch is fine, or the first problem found.
 */
export function validateImages(files, maxCount = MAX_LISTING_IMAGES) {
  const list = Array.from(files);

  if (list.length > maxCount) {
    return `You can upload a maximum of ${maxCount} photos.`;
  }
  for (const file of list) {
    const problem = validateImage(file);
    if (problem) return problem;
  }
  return null;
}
