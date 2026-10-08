"use client";
import { OptimizedImage } from "@/components/ui/optimized-image";

import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import type { StorageBucket } from "@/lib/utils/supabase-storage";
import {
  uploadFile,
  deleteFile,
  listFiles,
} from "@/lib/utils/supabase-storage";
import { createClient } from "@/lib/supabase/client";
import { Input } from "@/components/ui/input";
import { notifyContentChange } from "@/lib/utils/content-sync";
import { Modal } from "@/components/ui/modal";
import { Spinner } from "@/components/ui/spinner";
import {
  Pencil,
  Upload,
  Trash2,
  Copy,
  Check,
  Image as ImageIcon,
} from "lucide-react";
import toast from "react-hot-toast";

const FOLDERS = [
  "logos",
  "products",
  "banners",
  "gallery",
  "blog",
  "icons",
  "uploads",
] as const;

export default function AdminMediaPage() {
  const [details, setDetails] = useState<{
    path: string;
    name: string;
    alt: string;
  } | null>(null);
  const [savingDetails, setSavingDetails] = useState(false);
  const queryClient = useQueryClient();
  const [activeFolder, setActiveFolder] = useState<StorageBucket>("products");
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [copied, setCopied] = useState<string | null>(null);

  const { data: files, isLoading } = useQuery({
    queryKey: ["media-files", activeFolder],
    queryFn: () => listFiles(activeFolder),
  });

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const result = await uploadFile(activeFolder, file);
      if (result) {
        queryClient.invalidateQueries();
        toast.success("File uploaded");
      }
    } catch {
      toast.error("Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const editDetails = async (file: { name: string; url: string }) => {
    const { data, error } = await createClient()
      .from("media")
      .select("name,alt")
      .eq("url", file.url)
      .maybeSingle();
    if (error) {
      toast.error("Could not load file details");
      return;
    }
    setDetails({
      path: file.name,
      name: data?.name || file.name,
      alt: data?.alt || "",
    });
  };
  const saveDetails = async () => {
    if (!details) return;
    setSavingDetails(true);
    try {
      const response = await fetch("/api/upload", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bucket: activeFolder, ...details }),
      });
      const result = await response.json();
      if (!response.ok)
        throw new Error(result.error || "Could not save file details");
      notifyContentChange();
      await queryClient.invalidateQueries();
      setDetails(null);
      toast.success("File details saved");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Could not save file details",
      );
    } finally {
      setSavingDetails(false);
    }
  };
  const handleDelete = async (name: string) => {
    if (!confirm("Delete this file?")) return;
    try {
      const deleted = await deleteFile(activeFolder, name);
      if (deleted) {
        queryClient.invalidateQueries();
        toast.success("File deleted");
      }
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Could not delete file",
      );
    }
  };

  const handleCopyUrl = (url: string) => {
    navigator.clipboard
      .writeText(url)
      .catch(() => toast.error("Could not copy the link."));
    setCopied(url);
    setTimeout(() => setCopied(null), 2000);
    toast.success("URL copied");
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Media Manager</h1>
        <p className="text-gray-500 mt-1">Upload and manage images</p>
      </div>

      {/* Folder Tabs */}
      <div className="flex flex-wrap gap-2">
        {FOLDERS.map((folder) => (
          <button
            key={folder}
            onClick={() => setActiveFolder(folder)}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
              activeFolder === folder
                ? "bg-blue-600 text-white"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            {folder.charAt(0).toUpperCase() + folder.slice(1)}
          </button>
        ))}
      </div>

      {/* Upload */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6">
        <label className="flex items-center justify-center gap-3 p-8 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer hover:border-blue-500 transition-colors">
          {uploading ? (
            <Spinner size="sm" />
          ) : (
            <>
              <Upload className="w-6 h-6 text-gray-400" />
              <span className="text-gray-500">
                Click to upload to <strong>{activeFolder}</strong>
              </span>
            </>
          )}
          <input
            type="file"
            accept="image/png,image/jpeg,image/webp,application/pdf"
            className="hidden"
            onChange={handleUpload}
            disabled={uploading}
          />
        </label>
      </div>

      {/* Files Grid */}
      {isLoading ? (
        <Spinner size="lg" />
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {files?.map((file) => (
            <div
              key={file.name}
              className="group relative bg-white rounded-xl border border-gray-100 overflow-hidden shadow-sm"
            >
              <div className="aspect-square overflow-hidden">
                <OptimizedImage
                  src={file.url}
                  alt={file.name}
                  className="w-full h-full object-cover cursor-pointer group-hover:scale-105 transition-transform"
                  onClick={() => setPreview(file.url)}
                />
              </div>
              <div className="p-2">
                <p className="text-xs text-gray-500 truncate">{file.name}</p>
              </div>
              <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  aria-label={`Edit details of ${file.name}`}
                  onClick={() => editDetails(file)}
                  className="flex h-8 w-8 items-center justify-center rounded-lg bg-white shadow"
                >
                  <Pencil className="h-4 w-4" />
                </button>
                <button
                  aria-label={`Copy link to ${file.name}`}
                  onClick={() => handleCopyUrl(file.url)}
                  className="w-8 h-8 bg-white rounded-lg shadow flex items-center justify-center hover:bg-gray-50"
                >
                  {copied === file.url ? (
                    <Check className="w-4 h-4 text-green-500" />
                  ) : (
                    <Copy className="w-4 h-4 text-gray-600" />
                  )}
                </button>
                <button
                  aria-label={`Delete ${file.name}`}
                  onClick={() => handleDelete(file.name)}
                  className="w-8 h-8 bg-white rounded-lg shadow flex items-center justify-center hover:bg-red-50"
                >
                  <Trash2 className="w-4 h-4 text-red-500" />
                </button>
              </div>
            </div>
          ))}
          {files?.length === 0 && (
            <div className="col-span-full py-20 text-center text-gray-500">
              <ImageIcon
                aria-hidden
                className="w-12 h-12 mx-auto mb-4 text-gray-300"
              />
              <p>No files in this folder yet</p>
            </div>
          )}
        </div>
      )}

      <Modal
        isOpen={!!details}
        onClose={() => setDetails(null)}
        title="File details"
      >
        {details && (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              void saveDetails();
            }}
            className="space-y-4"
          >
            <Input
              label="File name"
              required
              value={details.name}
              onChange={(e) => setDetails({ ...details, name: e.target.value })}
            />
            <Input
              label="Image description"
              value={details.alt}
              onChange={(e) => setDetails({ ...details, alt: e.target.value })}
            />
            <p className="text-sm text-gray-500">
              Describe the image for customers who use a screen reader.
            </p>
            <button
              type="submit"
              disabled={savingDetails}
              className="btn-primary"
            >
              {savingDetails ? "Saving…" : "Save details"}
            </button>
          </form>
        )}
      </Modal>
      {/* Preview Modal */}
      <Modal
        isOpen={!!preview}
        onClose={() => setPreview(null)}
        title="Preview"
        size="lg"
      >
        {preview && (
          <OptimizedImage
            src={preview}
            alt="Preview"
            className="w-full rounded-xl"
          />
        )}
      </Modal>
    </div>
  );
}
