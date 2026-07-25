'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { createClient } from '@/lib/supabase/client';
import { uploadFile, deleteFile, listFiles } from '@/lib/utils/supabase-storage';
import { Button } from '@/components/ui/button';
import { Modal } from '@/components/ui/modal';
import { Spinner } from '@/components/ui/spinner';
import { Upload, Trash2, Copy, Check, Image, X } from 'lucide-react';
import toast from 'react-hot-toast';

const FOLDERS = ['logos', 'products', 'banners', 'gallery', 'blog', 'icons', 'uploads'] as const;

export default function AdminMediaPage() {
  const supabase = createClient();
  const queryClient = useQueryClient();
  const [activeFolder, setActiveFolder] = useState<string>('products');
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [copied, setCopied] = useState<string | null>(null);

  const { data: files, isLoading } = useQuery({
    queryKey: ['media-files', activeFolder],
    queryFn: () => listFiles(activeFolder as any),
  });

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const result = await uploadFile(activeFolder as any, file);
      if (result) {
        queryClient.invalidateQueries({ queryKey: ['media-files', activeFolder] });
        toast.success('File uploaded');
      }
    } catch {
      toast.error('Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (name: string) => {
    if (!confirm('Delete this file?')) return;
    const deleted = await deleteFile(activeFolder as any, name);
    if (deleted) {
      queryClient.invalidateQueries({ queryKey: ['media-files', activeFolder] });
      toast.success('File deleted');
    }
  };

  const handleCopyUrl = (url: string) => {
    navigator.clipboard.writeText(url);
    setCopied(url);
    setTimeout(() => setCopied(null), 2000);
    toast.success('URL copied');
  };

  return (
    <div className="space-y-6">
      <div><h1 className="text-2xl font-bold text-gray-900">Media Manager</h1><p className="text-gray-500 mt-1">Upload and manage images</p></div>

      {/* Folder Tabs */}
      <div className="flex flex-wrap gap-2">
        {FOLDERS.map(folder => (
          <button
            key={folder}
            onClick={() => setActiveFolder(folder)}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
              activeFolder === folder ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
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
              <span className="text-gray-500">Click to upload to <strong>{activeFolder}</strong></span>
            </>
          )}
          <input type="file" accept="image/*" className="hidden" onChange={handleUpload} disabled={uploading} />
        </label>
      </div>

      {/* Files Grid */}
      {isLoading ? (
        <Spinner size="lg" />
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {files?.map((file) => (
            <div key={file.name} className="group relative bg-white rounded-xl border border-gray-100 overflow-hidden shadow-sm">
              <div className="aspect-square overflow-hidden">
                <img
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
                  onClick={() => handleCopyUrl(file.url)}
                  className="w-8 h-8 bg-white rounded-lg shadow flex items-center justify-center hover:bg-gray-50"
                >
                  {copied === file.url ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4 text-gray-600" />}
                </button>
                <button
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
              <Image className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p>No files in this folder yet</p>
            </div>
          )}
        </div>
      )}

      {/* Preview Modal */}
      <Modal isOpen={!!preview} onClose={() => setPreview(null)} title="Preview" size="lg">
        {preview && <img src={preview} alt="Preview" className="w-full rounded-xl" />}
      </Modal>
    </div>
  );
}

