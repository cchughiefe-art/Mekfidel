import { z } from "zod";
import { manualAction, adminError } from "@/lib/ai-cms/manual";
import { NextRequest, NextResponse } from "next/server";
import {
  createAdminClient,
  createServiceRoleClient,
} from "@/lib/supabase/server";

const allowedBuckets = new Set([
  "logos",
  "products",
  "banners",
  "gallery",
  "blog",
  "icons",
  "uploads",
]);
const allowedMimeTypes = new Set([
  "image/png",
  "image/jpeg",
  "image/webp",
  "image/svg+xml",
  "application/pdf",
]);
const maxFileSize = 10 * 1024 * 1024;

export async function POST(request: NextRequest) {
  try {
    await createAdminClient();
    const formData = await request.formData();
    const file = formData.get("file");
    const folder = String(formData.get("folder") || "");
    if (folder && !/^[a-zA-Z0-9_-]{1,64}$/.test(folder))
      return NextResponse.json({ error: "Invalid folder" }, { status: 400 });
    const bucket = (formData.get("bucket") as string) || "uploads";

    if (!(file instanceof File)) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }
    if (!allowedBuckets.has(bucket)) {
      return NextResponse.json(
        { error: "Invalid upload destination" },
        { status: 400 },
      );
    }
    if (!allowedMimeTypes.has(file.type) || file.size > maxFileSize) {
      return NextResponse.json(
        { error: "Unsupported file type or file is larger than 10 MB" },
        { status: 400 },
      );
    }

    const supabase = createServiceRoleClient();

    const extensions: Record<string, string> = {
      "image/png": "png",
      "image/jpeg": "jpg",
      "image/webp": "webp",
      "image/svg+xml": "svg",
      "application/pdf": "pdf",
    };
    const fileExt = extensions[file.type];
    const bytes = new Uint8Array(await file.arrayBuffer());
    const prefix = Buffer.from(bytes.slice(0, 20));
    if (
      (file.type === "image/png" &&
        !prefix
          .subarray(0, 8)
          .equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]))) ||
      (file.type === "image/jpeg" && (bytes[0] !== 255 || bytes[1] !== 216)) ||
      (file.type === "image/webp" &&
        (prefix.toString("ascii", 0, 4) !== "RIFF" ||
          prefix.toString("ascii", 8, 12) !== "WEBP")) ||
      (file.type === "application/pdf" &&
        prefix.toString("ascii", 0, 5) !== "%PDF-")
    )
      return NextResponse.json(
        { error: "File contents do not match its type" },
        { status: 400 },
      );
    if (file.type === "image/svg+xml")
      return NextResponse.json(
        {
          error:
            "Upload SVG icons through the Icons page, or use PNG/WebP for images.",
        },
        { status: 400 },
      );
    const fileName = `${folder ? folder + "/" : ""}${crypto.randomUUID()}.${fileExt}`;

    const { error } = await supabase.storage
      .from(bucket)
      .upload(fileName, file, {
        cacheControl: "3600",
        contentType: file.type,
        upsert: false,
      });

    if (error) throw error;

    const {
      data: { publicUrl },
    } = supabase.storage.from(bucket).getPublicUrl(fileName);

    const { error: metadataError } = await supabase.from("media").insert({
      name: file.name,
      url: publicUrl,
      type: file.type,
      size: file.size,
      folder: bucket,
    });
    if (metadataError) {
      await supabase.storage.from(bucket).remove([fileName]);
      throw new Error("Could not record the uploaded file. Please retry.");
    }
    return NextResponse.json({ url: publicUrl, path: fileName });
  } catch (error: unknown) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Upload failed" },
      {
        status:
          error instanceof Error && error.message === "Unauthorized"
            ? 401
            : error instanceof Error && error.message === "Forbidden"
              ? 403
              : 500,
      },
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    await createAdminClient();
    const body = await request.json();
    if (
      !allowedBuckets.has(body.bucket) ||
      typeof body.path !== "string" ||
      !body.path ||
      body.path.length > 300 ||
      body.path
        .split("/")
        .some((part: string) => !part || part === "." || part === "..") ||
      /[\\\u0000-\u001f]/.test(body.path)
    )
      return NextResponse.json({ error: "Invalid file" }, { status: 400 });
    const db = createServiceRoleClient();
    const {
      data: { publicUrl },
    } = db.storage.from(body.bucket).getPublicUrl(body.path);
    const checks = await Promise.all([
      db.from("products").select("id").contains("images", [publicUrl]).limit(1),
      ...[
        ["categories", "image"],
        ["brands", "logo"],
        ["blog_posts", "image"],
        ["settings", "logo"],
        ["settings", "hero_banner"],
        ["homepage_sections", "image"],
        ["homepage_sections", "background_image"],
        ["company_info", "image"],
        ["testimonials", "image"],
        ["testimonials", "avatar"],
      ].map(([table, column]) =>
        db.from(table).select("id").eq(column, publicUrl).limit(1),
      ),
    ]);
    if (checks.some((check) => check.error))
      throw new Error("Could not check whether this file is in use");
    if (checks.some((check) => check.data?.length))
      return NextResponse.json(
        {
          error:
            "This file is used on the website. Replace or detach it before deleting.",
        },
        { status: 409 },
      );
    const { error } = await db.storage.from(body.bucket).remove([body.path]);
    if (error) throw new Error("Could not delete file");
    const { error: metadataError } = await db
      .from("media")
      .delete()
      .eq("url", publicUrl);
    if (metadataError)
      throw new Error("File deleted. Its metadata needs a refresh.");
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Could not delete file",
      },
      {
        status:
          error instanceof Error && error.message === "Unauthorized"
            ? 401
            : error instanceof Error && error.message === "Forbidden"
              ? 403
              : 400,
      },
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    await createAdminClient();
    const body = z
      .object({
        bucket: z.string(),
        path: z.string().min(1).max(300),
        name: z.string().trim().min(1).max(200),
        alt: z.string().max(500),
      })
      .parse(await request.json());
    if (
      !allowedBuckets.has(body.bucket) ||
      body.path
        .split("/")
        .some((part) => !part || part === "." || part === "..") ||
      /[\\\u0000-\u001f]/.test(body.path)
    )
      throw new Error("Invalid file");
    const db = createServiceRoleClient();
    const { data: file, error: fileError } = await db.storage
      .from(body.bucket)
      .info(body.path);
    if (fileError || !file) throw new Error("File could not be found");
    const {
      data: { publicUrl },
    } = db.storage.from(body.bucket).getPublicUrl(body.path);
    const { data: existing, error } = await db
      .from("media")
      .select("id")
      .eq("url", publicUrl)
      .maybeSingle();
    if (error) throw new Error("File details could not be loaded");
    let id = existing?.id;
    if (!id) {
      const { data, error } = await db
        .from("media")
        .insert({
          name: body.path.split("/").at(-1),
          url: publicUrl,
          folder: body.bucket,
        })
        .select("id")
        .single();
      if (error) throw new Error("Could not record file details");
      id = data.id;
    }
    const result = await manualAction(
      "media",
      "update",
      { name: body.name, alt: body.alt },
      id,
    );
    return NextResponse.json(result);
  } catch (error) {
    return adminError(error);
  }
}
