"use client";
import { ListPagination } from "@/components/ui/list-pagination";
import type { DatabaseRow } from "@/types/database";
import { deleteAdminRecord } from "@/lib/utils/admin-actions";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { saveAdminRecord } from "@/lib/utils/admin-actions";
import { blogPostSchema } from "@/lib/utils/validators";
import { uploadFile } from "@/lib/utils/supabase-storage";
import { slugify, formatDate } from "@/lib/utils/format";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Modal } from "@/components/ui/modal";
import { Badge } from "@/components/ui/badge";
import { Spinner } from "@/components/ui/spinner";
import { Plus, Pencil, Trash2, Upload } from "lucide-react";
import toast from "react-hot-toast";

export default function AdminBlogPage() {
  const supabase = createClient();
  const [page, setPage] = useState(1);
  const queryClient = useQueryClient();
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<DatabaseRow<"blog_posts"> | null>(
    null,
  );
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    excerpt: "",
    category: "",
    author: "Admin",
    tags: "",
    is_published: false,
  });
  const [imageFile, setImageFile] = useState<File | null>(null);

  const { data: posts, isLoading } = useQuery({
    queryKey: ["admin-blog", page],
    queryFn: async () => {
      const { data, error: queryError1 } = await supabase
        .from("blog_posts")
        .select("*")
        .order("created_at", { ascending: false })
        .order("id")
        .range((page - 1) * 20, page * 20 - 1);
      if (queryError1) throw queryError1;
      return data;
    },
  });

  const mutation = useMutation({
    mutationFn: async () => {
      let image = editing?.image || "";
      if (imageFile) {
        const result = await uploadFile("blog", imageFile);
        if (result) image = result.url;
      }

      const slug = editing?.slug || slugify(formData.title);
      const tags = formData.tags
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean);
      const postData = {
        ...blogPostSchema.parse({ ...formData, tags }),
        slug,
        image,
        published_at: formData.is_published
          ? editing?.published_at || new Date().toISOString()
          : null,
      };

      await saveAdminRecord(
        "blog_posts",
        postData,
        editing?.id,
        editing || undefined,
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries();
      setShowModal(false);
      setEditing(null);
      resetForm();
      toast.success(editing ? "Post updated" : "Post created");
    },
    onError: (error) => toast.error(error.message),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await deleteAdminRecord("blog_posts", id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries();
      toast.success("Post deleted");
    },
    onError: (error) => toast.error(error.message),
  });

  const resetForm = () => {
    setImageFile(null);
    setFormData({
      title: "",
      content: "",
      excerpt: "",
      category: "",
      author: "Admin",
      tags: "",
      is_published: false,
    });
  };

  const openEdit = (post: DatabaseRow<"blog_posts">) => {
    setImageFile(null);
    setEditing(post);
    setFormData({
      title: post.title,
      content: post.content,
      excerpt: post.excerpt,
      category: post.category || "",
      author: post.author || "Admin",
      tags: post.tags?.join(", ") || "",
      is_published: Boolean(post.is_published),
    });
    setShowModal(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Blog</h1>
          <p className="text-gray-500 mt-1">Manage blog posts</p>
        </div>
        <Button
          variant="primary"
          onClick={() => {
            setEditing(null);
            resetForm();
            setShowModal(true);
          }}
        >
          <Plus className="w-4 h-4 mr-2" />
          New Post
        </Button>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-50">
              <th className="text-left px-6 py-4 text-sm font-semibold">
                Title
              </th>
              <th className="text-left px-6 py-4 text-sm font-semibold">
                Category
              </th>
              <th className="text-left px-6 py-4 text-sm font-semibold">
                Status
              </th>
              <th className="text-left px-6 py-4 text-sm font-semibold">
                Date
              </th>
              <th className="text-right px-6 py-4 text-sm font-semibold">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {isLoading ? (
              <tr>
                <td colSpan={5} className="py-20">
                  <Spinner />
                </td>
              </tr>
            ) : (
              posts?.map((post) => (
                <tr key={post.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 font-medium">{post.title}</td>
                  <td className="px-6 py-4 text-gray-500">
                    {post.category || "-"}
                  </td>
                  <td className="px-6 py-4">
                    <Badge variant={post.is_published ? "success" : "warning"}>
                      {post.is_published ? "Published" : "Draft"}
                    </Badge>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {formatDate(post.created_at)}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => openEdit(post)}
                        aria-label="Edit"
                      >
                        <Pencil className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-red-500"
                        onClick={() => {
                          if (confirm("Delete?"))
                            deleteMutation.mutate(post.id);
                        }}
                        aria-label="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <ListPagination
        page={page}
        onPage={setPage}
        hasNext={(posts?.length || 0) === 20}
        loading={isLoading}
      />
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={editing ? "Edit Post" : "New Post"}
        size="xl"
      >
        <div className="space-y-4">
          <Input
            label="Title"
            value={formData.title}
            onChange={(e) =>
              setFormData({ ...formData, title: e.target.value })
            }
          />
          <div className="grid sm:grid-cols-2 gap-4">
            <Input
              label="Category"
              value={formData.category}
              onChange={(e) =>
                setFormData({ ...formData, category: e.target.value })
              }
            />
            <Input
              label="Author"
              value={formData.author}
              onChange={(e) =>
                setFormData({ ...formData, author: e.target.value })
              }
            />
          </div>
          <Textarea
            label="Excerpt"
            value={formData.excerpt}
            onChange={(e) =>
              setFormData({ ...formData, excerpt: e.target.value })
            }
            rows={2}
          />
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={formData.is_published}
              onChange={(event) =>
                setFormData({ ...formData, is_published: event.target.checked })
              }
            />
            Publish on the website
          </label>
          <Textarea
            label="Content"
            value={formData.content}
            onChange={(e) =>
              setFormData({ ...formData, content: e.target.value })
            }
            rows={10}
          />
          <Input
            label="Tags (comma separated)"
            value={formData.tags}
            onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
          />
          <label className="flex items-center gap-3 px-4 py-3 border border-gray-300 rounded-xl cursor-pointer hover:bg-gray-50">
            <Upload className="w-5 h-5 text-gray-400" />
            <span className="text-sm text-gray-500">
              {imageFile ? imageFile.name : "Upload featured image"}
            </span>
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => setImageFile(e.target.files?.[0] || null)}
            />
          </label>
          <div className="flex gap-3 justify-end pt-4">
            <Button variant="ghost" onClick={() => setShowModal(false)}>
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={() => mutation.mutate()}
              loading={mutation.isPending}
            >
              {editing ? "Update" : "Publish"}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
