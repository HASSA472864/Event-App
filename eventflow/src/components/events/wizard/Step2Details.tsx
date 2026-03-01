"use client"

import { useWizard } from "./WizardContext"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { motion } from "framer-motion"
import {
  FileText,
  Image as ImageIcon,
  Bold,
  Italic,
  Link as LinkIcon,
  ImagePlus,
  List,
  ListOrdered,
  Heading2,
  X,
} from "lucide-react"
import { useEditor, EditorContent } from "@tiptap/react"
import StarterKit from "@tiptap/starter-kit"
import TiptapLink from "@tiptap/extension-link"
import TiptapImage from "@tiptap/extension-image"
import { useCallback, useState } from "react"

const CLOUDINARY_CONFIGURED = !!process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME

let CldUploadWidget: any = null
if (CLOUDINARY_CONFIGURED) {
  CldUploadWidget = require("next-cloudinary").CldUploadWidget
}

function TiptapToolbar({ editor }: { editor: any }) {
  if (!editor) return null

  const addLink = useCallback(() => {
    const url = window.prompt("Enter URL:")
    if (url) {
      editor.chain().focus().setLink({ href: url }).run()
    }
  }, [editor])

  const addImage = useCallback(() => {
    const url = window.prompt("Enter image URL:")
    if (url) {
      editor.chain().focus().setImage({ src: url }).run()
    }
  }, [editor])

  const tools = [
    {
      icon: Bold,
      action: () => editor.chain().focus().toggleBold().run(),
      isActive: editor.isActive("bold"),
      label: "Bold",
    },
    {
      icon: Italic,
      action: () => editor.chain().focus().toggleItalic().run(),
      isActive: editor.isActive("italic"),
      label: "Italic",
    },
    {
      icon: Heading2,
      action: () => editor.chain().focus().toggleHeading({ level: 2 }).run(),
      isActive: editor.isActive("heading", { level: 2 }),
      label: "Heading",
    },
    {
      icon: List,
      action: () => editor.chain().focus().toggleBulletList().run(),
      isActive: editor.isActive("bulletList"),
      label: "Bullet List",
    },
    {
      icon: ListOrdered,
      action: () => editor.chain().focus().toggleOrderedList().run(),
      isActive: editor.isActive("orderedList"),
      label: "Ordered List",
    },
    {
      icon: LinkIcon,
      action: addLink,
      isActive: editor.isActive("link"),
      label: "Link",
    },
    {
      icon: ImagePlus,
      action: addImage,
      isActive: false,
      label: "Image",
    },
  ]

  return (
    <div className="flex items-center gap-1 p-2 border-b border-slate-700/50 bg-slate-800/30 rounded-t-lg">
      {tools.map((tool) => (
        <button
          key={tool.label}
          type="button"
          onClick={tool.action}
          className={`p-2 rounded-md transition-colors ${
            tool.isActive
              ? "bg-violet-500/20 text-violet-400"
              : "text-slate-400 hover:text-white hover:bg-slate-700/50"
          }`}
          title={tool.label}
        >
          <tool.icon className="h-4 w-4" />
        </button>
      ))}
    </div>
  )
}

export function Step2Details() {
  const { formData, updateFormData, stepValidation } = useWizard()
  const [uploadError, setUploadError] = useState("")
  const [imageUrlInput, setImageUrlInput] = useState("")

  const editor = useEditor({
    extensions: [
      StarterKit,
      TiptapLink.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: "text-violet-400 underline cursor-pointer",
        },
      }),
      TiptapImage.configure({
        HTMLAttributes: {
          class: "rounded-lg max-w-full h-auto",
        },
      }),
    ],
    content: formData.description || "<p></p>",
    editorProps: {
      attributes: {
        class:
          "prose prose-invert prose-sm max-w-none min-h-[200px] p-4 focus:outline-none text-slate-200 prose-headings:text-white prose-p:text-slate-300 prose-strong:text-white prose-a:text-violet-400",
      },
    },
    onUpdate: ({ editor }) => {
      updateFormData({ description: editor.getHTML() })
    },
  })

  const handleUploadSuccess = (result: any) => {
    const url = result?.info?.secure_url
    if (url) {
      updateFormData({ coverImage: url })
      setUploadError("")
    }
  }

  const removeCoverImage = () => {
    updateFormData({ coverImage: "" })
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.3 }}
      className="space-y-8"
    >
      <div className="space-y-2">
        <h2 className="text-2xl font-bold text-white">Event Details</h2>
        <p className="text-slate-400">
          Describe your event and add a cover image to make it stand out.
        </p>
      </div>

      <div className="space-y-6">
        {/* Description */}
        <div className="space-y-2">
          <Label className="text-sm font-medium text-slate-300 flex items-center gap-2">
            <FileText className="h-4 w-4 text-violet-400" />
            Description
          </Label>
          <div className="rounded-lg border border-slate-700/50 bg-slate-800/50 overflow-hidden">
            <TiptapToolbar editor={editor} />
            <EditorContent editor={editor} />
          </div>
          {stepValidation.errors.description && (
            <p className="text-sm text-red-400">{stepValidation.errors.description}</p>
          )}
          <p className="text-xs text-slate-500">
            Use the toolbar to format your description with headings, lists, links, and images.
          </p>
        </div>

        {/* Cover Image */}
        <div className="space-y-2">
          <Label className="text-sm font-medium text-slate-300 flex items-center gap-2">
            <ImageIcon className="h-4 w-4 text-violet-400" />
            Cover Image
          </Label>

          {formData.coverImage ? (
            <div className="relative rounded-xl overflow-hidden border border-slate-700/50">
              <img
                src={formData.coverImage}
                alt="Cover"
                className="w-full h-48 object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute top-2 right-2 bg-black/50 hover:bg-black/70 text-white rounded-full"
                onClick={removeCoverImage}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ) : CLOUDINARY_CONFIGURED && CldUploadWidget ? (
            <CldUploadWidget
              uploadPreset={process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || "eventflow"}
              onSuccess={handleUploadSuccess}
              onError={() => setUploadError("Upload failed. Please try again.")}
              options={{
                maxFiles: 1,
                resourceType: "image",
                sources: ["local", "url", "camera"],
                styles: {
                  palette: {
                    window: "#1E293B",
                    windowBorder: "#334155",
                    tabIcon: "#7C3AED",
                    menuIcons: "#94A3B8",
                    textDark: "#F8FAFC",
                    textLight: "#94A3B8",
                    link: "#7C3AED",
                    action: "#7C3AED",
                    inactiveTabIcon: "#64748B",
                    error: "#EF4444",
                    inProgress: "#7C3AED",
                    complete: "#22C55E",
                    sourceBg: "#0F172A",
                  },
                },
              }}
            >
              {({ open }: { open: () => void }) => (
                <button
                  type="button"
                  onClick={() => open()}
                  className="w-full h-48 rounded-xl border-2 border-dashed border-slate-700/50 bg-slate-800/30 hover:bg-slate-800/50 hover:border-violet-500/30 transition-all flex flex-col items-center justify-center gap-3 group"
                >
                  <div className="p-3 rounded-full bg-slate-700/50 group-hover:bg-violet-500/20 transition-colors">
                    <ImagePlus className="h-6 w-6 text-slate-400 group-hover:text-violet-400 transition-colors" />
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-medium text-slate-300">
                      Click to upload cover image
                    </p>
                    <p className="text-xs text-slate-500 mt-1">
                      PNG, JPG, or WebP up to 10MB
                    </p>
                  </div>
                </button>
              )}
            </CldUploadWidget>
          ) : (
            <div className="space-y-3">
              <div className="flex gap-2">
                <input
                  type="url"
                  value={imageUrlInput}
                  onChange={(e) => setImageUrlInput(e.target.value)}
                  placeholder="Paste image URL (e.g. https://example.com/image.jpg)"
                  className="flex-1 rounded-lg border border-slate-700/50 bg-slate-800/50 px-4 py-2.5 text-sm text-slate-200 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500/50"
                />
                <Button
                  type="button"
                  variant="outline"
                  className="border-slate-700/50 bg-slate-800/50 hover:bg-violet-500/20 hover:border-violet-500/50 text-slate-300"
                  onClick={() => {
                    if (imageUrlInput.trim()) {
                      updateFormData({ coverImage: imageUrlInput.trim() })
                      setImageUrlInput("")
                    }
                  }}
                >
                  Add
                </Button>
              </div>
              <div className="w-full h-36 rounded-xl border-2 border-dashed border-slate-700/50 bg-slate-800/30 flex flex-col items-center justify-center gap-2">
                <div className="p-3 rounded-full bg-slate-700/50">
                  <ImagePlus className="h-6 w-6 text-slate-400" />
                </div>
                <p className="text-xs text-slate-500">
                  Enter an image URL above to set a cover image
                </p>
              </div>
            </div>
          )}
          {uploadError && <p className="text-sm text-red-400">{uploadError}</p>}
          <p className="text-xs text-slate-500">
            Optional. A cover image helps your event page look professional.
          </p>
        </div>
      </div>
    </motion.div>
  )
}
