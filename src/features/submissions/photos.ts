import { supabase } from '../../lib/supabase'

// Same limits as the database and the storage bucket (0001 / 0002 migrations).
export const MAX_PHOTOS = 5
export const MAX_PHOTO_BYTES = 5 * 1024 * 1024 // 5 MB
export const ALLOWED_PHOTO_TYPES = ['image/jpeg', 'image/png', 'image/webp']
export const PHOTO_BUCKET = 'submission-photos'

// Compression settings: phone photos are often 3-10 MB at 4000px+.
// 1920px on the long side is plenty to see site conditions and keeps files ~300-800 KB.
const MAX_DIMENSION = 1920
const JPEG_QUALITY = 0.8

// A photo picked on the form, ready to upload.
export type SelectedPhoto = {
  id: string // only for React keys / removing from the list
  file: File // already compressed
  previewUrl: string // object URL for the thumbnail (must be revoked when removed)
}

// Validates and compresses newly picked files.
// Returns the photos that passed plus one message per file that didn't.
export async function preparePhotos(
  files: File[],
  alreadySelected: number,
): Promise<{ photos: SelectedPhoto[]; errors: string[] }> {
  const photos: SelectedPhoto[] = []
  const errors: string[] = []

  const freeSlots = MAX_PHOTOS - alreadySelected
  if (files.length > freeSlots) {
    errors.push(`Up to ${MAX_PHOTOS} photos per form. ${files.length - freeSlots} photo(s) were not added.`)
  }

  for (const original of files.slice(0, Math.max(freeSlots, 0))) {
    if (!ALLOWED_PHOTO_TYPES.includes(original.type)) {
      errors.push(`${original.name}: only JPEG, PNG or WebP images are allowed.`)
      continue
    }

    let file: File
    try {
      file = await compressImage(original)
    } catch {
      errors.push(`${original.name}: this image could not be read.`)
      continue
    }

    // Checked after compression, so big phone photos are accepted once shrunk.
    if (file.size > MAX_PHOTO_BYTES) {
      errors.push(`${original.name}: larger than 5 MB, even after compression.`)
      continue
    }

    photos.push({ id: crypto.randomUUID(), file, previewUrl: URL.createObjectURL(file) })
  }

  return { photos, errors }
}

// Resizes the image to at most MAX_DIMENSION px and re-encodes it as JPEG.
// Done in the browser with a <canvas>: less data to upload over a site's mobile signal.
async function compressImage(file: File): Promise<File> {
  // createImageBitmap also applies the photo's EXIF rotation, so portraits stay upright.
  const bitmap = await createImageBitmap(file)
  const scale = Math.min(1, MAX_DIMENSION / Math.max(bitmap.width, bitmap.height))
  const width = Math.round(bitmap.width * scale)
  const height = Math.round(bitmap.height * scale)

  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  const context = canvas.getContext('2d')
  if (!context) return file // canvas not available: upload the original

  // JPEG has no transparency; paint white first so transparent PNGs don't turn black.
  context.fillStyle = '#ffffff'
  context.fillRect(0, 0, width, height)
  context.drawImage(bitmap, 0, 0, width, height)
  bitmap.close()

  const blob = await new Promise<Blob | null>((resolve) =>
    canvas.toBlob(resolve, 'image/jpeg', JPEG_QUALITY),
  )

  // Keep the original if compression didn't help (e.g. an already small image).
  if (!blob || blob.size >= file.size) return file

  const name = file.name.replace(/\.[^.]+$/, '') + '.jpg'
  return new File([blob], name, { type: 'image/jpeg' })
}

const EXTENSION_BY_TYPE: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
}

// Uploads the photos of a saved submission and records them in submission_photos.
// Path convention {user_id}/{submission_id}/{random}.{ext}: the storage policy only
// allows uploads into the user's own folder.
// Returns how many photos failed (0 = all good).
export async function uploadSubmissionPhotos(
  userId: string,
  submissionId: string,
  photos: SelectedPhoto[],
): Promise<number> {
  if (photos.length === 0) return 0

  // Upload all files in parallel; allSettled waits for all of them even if some fail.
  const results = await Promise.allSettled(
    photos.map(async ({ file }) => {
      const path = `${userId}/${submissionId}/${crypto.randomUUID()}.${EXTENSION_BY_TYPE[file.type]}`
      const { error } = await supabase.storage.from(PHOTO_BUCKET).upload(path, file, { contentType: file.type })
      if (error) throw error
      return { submission_id: submissionId, storage_path: path, mime_type: file.type, size_bytes: file.size }
    }),
  )

  const rows = results.flatMap((result) => (result.status === 'fulfilled' ? [result.value] : []))
  results.forEach((result) => {
    if (result.status === 'rejected') console.error('Photo upload failed:', result.reason)
  })

  if (rows.length === 0) return photos.length

  // One insert for all uploaded files.
  const { error } = await supabase.from('submission_photos').insert(rows)
  if (error) {
    console.error('Saving photo rows failed:', error)
    return photos.length // files are in storage but not linked to the form
  }

  return photos.length - rows.length
}
