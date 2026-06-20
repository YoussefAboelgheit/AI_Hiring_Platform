import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const bucketName = process.env.SUPABASE_BUCKET || "uploads";

if (!supabaseUrl || !supabaseKey) {
  console.warn("Supabase credentials missing. Supabase operations will fail.");
}

const supabase = (supabaseUrl && supabaseKey) ? createClient(supabaseUrl, supabaseKey) : null;

/**
 * Uploads a file buffer to Supabase Storage.
 * @param {Buffer} buffer - The file buffer
 * @param {string} mimeType - The file's MIME type
 * @param {string} folder - The folder prefix inside the bucket
 * @returns {Promise<string>} The public URL of the uploaded file
 */
export async function uploadToSupabase(buffer, mimeType, folder) {
  if (!supabase) {
    throw new Error("Supabase client is not initialized. Check your environment variables.");
  }

  // Determine standard file extension from MIME type
  let ext = "bin";
  if (mimeType === "application/pdf") ext = "pdf";
  else if (mimeType === "image/png") ext = "png";
  else if (mimeType === "image/jpeg" || mimeType === "image/jpg") ext = "jpg";

  const uniqueId = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
  const filename = `${folder}/${uniqueId}.${ext}`;

  // Upload buffer directly to Supabase storage
  const { data, error } = await supabase.storage
    .from(bucketName)
    .upload(filename, buffer, {
      contentType: mimeType,
      upsert: true,
    });

  if (error) {
    throw new Error(`Supabase upload error: ${error.message}`);
  }

  // Get the public access URL
  const { data: { publicUrl } } = supabase.storage
    .from(bucketName)
    .getPublicUrl(filename);

  return publicUrl;
}

/**
 * Deletes a file from Supabase Storage using its public URL.
 * @param {string} publicUrl - The stored public URL of the file
 * @returns {Promise<void>}
 */
export async function deleteFromSupabase(publicUrl) {
  if (!supabase || !publicUrl) return;

  const prefix = `${supabaseUrl}/storage/v1/object/public/${bucketName}/`;
  if (publicUrl.startsWith(prefix)) {
    const filePath = publicUrl.substring(prefix.length);
    const { error } = await supabase.storage
      .from(bucketName)
      .remove([filePath]);

    if (error) {
      console.error(`Failed to delete old file from Supabase: ${error.message}`);
    }
  }
}
