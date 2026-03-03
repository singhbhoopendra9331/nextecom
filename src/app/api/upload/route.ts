export const runtime = "nodejs";

import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import cloudinary from "@/lib/storage/cloudinary";

export async function POST(req: Request) {
  const formData = await req.formData();
  const file = formData.get("file") as File;

  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  const upload = await new Promise<any>((resolve, reject) => {
    cloudinary.uploader
      .upload_stream({ folder: "uploads" }, (error, result) => {
        if (error) reject(error);
        else resolve(result);
      })
      .end(buffer);
  });

  const media = await prisma.media.create({
    data: {
      filename: upload.public_id,
      originalName: file.name,
      mimeType: file.type,
      size: file.size,
      url: upload.secure_url,
      provider: "CLOUDINARY",
      providerId: upload.public_id,
      width: upload.width,
      height: upload.height,
    },
  });

  return NextResponse.json(media);
}