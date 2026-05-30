"use client";

import { useForm, FormProvider } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { axios } from "@/lib/axios";
import { toast } from "@/lib/toast";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import Image from "next/image";

type UploadMediaFormValues = {
  file: FileList;
};

export default function UploadMediaPage() {
  const methods = useForm<UploadMediaFormValues>();
  const { handleSubmit, register, reset } = methods;

  const [loading, setLoading] = useState(false);
  const [uploaded, setUploaded] = useState<any>(null);

  const onSubmit = async (data: UploadMediaFormValues) => {
    try {
      setLoading(true);

      const formData = new FormData();
      formData.append("file", data.file[0]);

      const response = await axios.post("/api/upload", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      setUploaded(response.data);
      toast.success("Media uploaded successfully");
      reset();
    } catch (error) {
      console.error("Upload failed:", error);
      toast.error("Failed to upload media");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen p-2 md:p-4">
      <h1 className="font-semibold text-2xl mb-4">Create Media</h1>

      <FormProvider {...methods}>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 max-w-md">
          <Input
            type="file"
            {...register("file", { required: true })}
            className="block w-full"
          />

          <Button type="submit" disabled={loading}>
            {loading ? "Uploading..." : "Upload"}
          </Button>
        </form>
      </FormProvider>

      {uploaded && (
        <div className="mt-6 space-y-2">
          <p className="text-green-600 font-medium">Upload successful!</p>
          <Image
            width={120}
            height={120}
            src={uploaded.url}
            alt={uploaded.originalName}
            className="w-64 rounded"
          />
        </div>
      )}
    </div>
  );
}
