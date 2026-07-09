// components/admin/NoteBoxPreview.tsx
import React from "react";
import { NoteBox } from "@/lib/admin-types";
import NoteBoxRenderer from "@/components/NoteBoxRenderer";

type Props = { note: NoteBox; interactive?: boolean };

export default function NoteBoxPreview({ note, interactive = true }: Props) {
  return (
    <div className="rounded-lg overflow-hidden" style={{ background: "linear-gradient(180deg, rgba(255,255,255,0.02), rgba(255,255,255,0.01))", border: "1px solid rgba(255,255,255,0.04)" }}>
      <div className="px-4 py-3 border-b border-slate-800/50">
        <div className="flex items-center justify-between">
          <div className="text-sm text-slate-400 font-medium">
            ?? Live Preview
          </div>
          <div className="text-xs text-slate-500">
            Type: {note.type}
          </div>
        </div>
      </div>
      
      <div className="p-4 max-h-[600px] overflow-y-auto">
        <NoteBoxRenderer note={note} index={0} />
      </div>
    </div>
  );
}
