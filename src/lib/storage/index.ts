import { getEnv } from "@/lib/env";
import { uploadToCloudinary } from "./cloudinary";
import { uploadToLocal } from "./local";

export async function uploadFile(file: File) {
  const provider = getEnv("STORAGE_PROVIDER");

  switch (provider) {
    case "cloudinary":
      return uploadToCloudinary(file);

    case "local":
      return uploadToLocal(file);

    default:
      throw new Error("Invalid STORAGE_PROVIDER in .env");
  }
}