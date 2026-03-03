import { writeFile } from "fs/promises";
import path from "path";

export async function uploadToLocal(file: File) {
  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  const fileName = `${Date.now()}-${file.name}`;
  const uploadPath = path.join(process.cwd(), "public/uploads", fileName);

  await writeFile(uploadPath, buffer);

  return {
    url: `/uploads/${fileName}`,
    provider: "LOCAL",
    providerId: fileName,
    width: null,
    height: null,
  };
}