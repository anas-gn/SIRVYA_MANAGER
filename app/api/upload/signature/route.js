import { NextResponse } from "next/server";
import cloudinary from "@/lib/cloudinary";
import { requireManager } from "@/lib/requireManager";

export async function POST(req) {
  const { auth, response } = requireManager();
  if (!auth) return response;

  const { folder } = await req.json().catch(() => ({}));
  const uploadFolder = folder || process.env.CLOUDINARY_UPLOAD_FOLDER || "fitlek/uploads";

  const timestamp = Math.round(Date.now() / 1000);
  const paramsToSign = { timestamp, folder: uploadFolder };

  const signature = cloudinary.utils.api_sign_request(
    paramsToSign,
    process.env.CLOUDINARY_API_SECRET
  );

  return NextResponse.json({
    timestamp,
    signature,
    folder: uploadFolder,
    apiKey: process.env.CLOUDINARY_API_KEY,
    cloudName: process.env.CLOUDINARY_CLOUD_NAME
  });
}
