const CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
const UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

/**
 * Uploads a single file to Cloudinary and returns its secure URL.
 * Uses an unsigned preset — safe for browser use, no API secret involved.
 */
export async function uploadToCloudinary(file) {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', UPLOAD_PRESET);

  const res = await fetch(
    `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
    { method: 'POST', body: formData }
  );

  if (!res.ok) {
    const detail = await res.json().catch(() => ({}));
    throw new Error(detail?.error?.message || 'Image upload failed.');
  }

  const data = await res.json();
  return data.secure_url;
}

/**
 * Uploads multiple files in parallel. Returns an array of URLs.
 */
export async function uploadMultipleToCloudinary(files) {
  return Promise.all(Array.from(files).map(uploadToCloudinary));
}