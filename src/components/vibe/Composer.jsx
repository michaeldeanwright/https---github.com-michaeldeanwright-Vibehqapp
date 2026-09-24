import { useState, useRef } from "react";
import { ImagePlus, X, Loader2 } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { showErrorBanner } from "@/lib/error-banner";
import Avatar from "./Avatar";

export default function Composer({ me }) {
  const qc = useQueryClient();
  const fileRef = useRef(null);
  const [text, setText] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [uploading, setUploading] = useState(false);
  const [posting, setPosting] = useState(false);

  const onFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadPublicFile({ file });
      setImageUrl(file_url);
    } catch (err) {
      showErrorBanner(`Couldn't upload the photo: ${err?.code || ""} ${err?.message || err}`);
    } finally {
      setUploading(false);
    }
  };

  const submit = async () => {
    setPosting(true);
    try {
      await base44.entities.Post.create({ content: text.trim(), image_url: imageUrl, author_name: me.full_name || me.email, liked_by: [], comment_count: 0 });
      setText(""); setImageUrl("");
      qc.invalidateQueries({ queryKey: ["posts"] });
    } catch (err) {
      showErrorBanner(`Couldn't post: ${err?.message || err}`);
    } finally {
      setPosting(false);
    }
  };

  return (
    <div className="bg-card rounded-3xl p-4 shadow-sm shadow-black/[0.03] border border-border/60">
      <div className="flex gap-3">
        <Avatar name={me.full_name || me.email} />
        <textarea value={text} onChange={(e) => setText(e.target.value)} rows={2}
          placeholder="What's the vibe today?"
          className="flex-1 resize-none bg-transparent outline-none text-[15px] placeholder:text-muted-foreground pt-2" />
      </div>
      {imageUrl && (
        <div className="relative mt-3">
          <img src={imageUrl} alt="Attachment preview" className="w-full max-h-72 object-cover rounded-2xl" />
          <button onClick={() => setImageUrl("")} className="absolute top-2 right-2 bg-black/60 text-white rounded-full p-1.5"><X className="w-4 h-4" /></button>
        </div>
      )}
      <div className="flex items-center justify-between mt-3 pt-3 border-t border-border/60">
        <button onClick={() => fileRef.current?.click()} disabled={uploading}
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
          {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ImagePlus className="w-4 h-4" />}
          Photo
        </button>
        <input ref={fileRef} type="file" accept="image/*" hidden onChange={onFile} />
        <button onClick={submit} disabled={!text.trim() || posting || uploading}
          className="vibe-gradient text-white text-sm font-semibold px-5 py-2 rounded-full disabled:opacity-40 transition-opacity flex items-center gap-2">
          {posting && <Loader2 className="w-4 h-4 animate-spin" />}Post
        </button>
      </div>
    </div>
  );
}