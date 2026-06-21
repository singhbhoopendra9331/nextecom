import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import cloudinary from "@/lib/storage/cloudinary";

type Params = { params: Promise<{ id: string }> };

/*
PATCH
Update metadata (alt, caption, filename etc)
*/
export async function PATCH(req: Request, { params }: Params) {
    try {
        const { id } = await params;
        const body = await req.json();

        const media = await prisma.media.update({
            where: { id },
            data: {
                alt: body.alt,
                caption: body.caption,
                originalName: body.originalName,
            },
        });

        return NextResponse.json(media);
    } catch (error: any) {
        console.error("PATCH /api/media/[id]", error);

        return NextResponse.json(
            { error: error.message || "Failed to update media" },
            { status: 500 }
        );
    }
}

/*
PUT
Replace media file
*/
export async function PUT(req: Request, { params }: Params) {
    try {
        const { id } = await params;

        const formData = await req.formData();
        const file = formData.get("file") as File;

        if (!file) {
            return NextResponse.json(
                { error: "File required" },
                { status: 400 }
            );
        }

        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);

        /**
         * Upload to cloudinary or storage
         * (assuming you already have this)
         */

        const upload = await new Promise<any>((resolve, reject) => {
            const stream = cloudinary.uploader.upload_stream(
                { folder: "media" },
                (err, result) => {
                    if (err) reject(err);
                    else resolve(result);
                }
            );

            stream.end(buffer);
        });

        const media = await prisma.media.update({
            where: { id },
            data: {
                url: upload.secure_url,
                filename: upload.public_id,
                mimeType: file.type,
                size: file.size,
                originalName: file.name,
            },
        });

        return NextResponse.json(media);
    } catch (error: any) {
        console.error("PUT /api/media/[id]", error);

        return NextResponse.json(
            { error: error.message || "Failed to replace media" },
            { status: 500 }
        );
    }
}

export async function DELETE(req: Request, { params }: Params) {
    try {
        const { id } = await params;

        // 1. Get media first
        const media = await prisma.media.findUnique({
            where: { id },
        });

        if (!media) {
            return NextResponse.json(
                { error: "Media not found" },
                { status: 404 }
            );
        }

        // 2. Delete from storage provider
        if (media.provider === "CLOUDINARY" && media.providerId) {
            await cloudinary.uploader.destroy(media.providerId);
        }

        // Example if using S3
        /*
        if (media.provider === "S3" && media.providerId) {
          await s3.deleteObject({
            Bucket: getEnv("AWS_BUCKET"),
            Key: media.providerId,
          }).promise();
        }
        */

        // 3. Delete DB record
        await prisma.media.delete({
            where: { id },
        });

        return NextResponse.json({
            success: true,
        });
    } catch (error: any) {
        console.error("DELETE /api/media/[id]", error);

        return NextResponse.json(
            { error: error.message || "Failed to delete media" },
            { status: 500 }
        );
    }
}