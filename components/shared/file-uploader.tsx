"use client";

import * as React from "react";
import { Upload, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn, uuid } from "@/lib/utils";
import type { FileMeta } from "@/lib/types";

export function FileUploader({ value = [], onChange, className }: { value?: FileMeta[]; onChange?: (files: FileMeta[]) => void; className?: string }) {
  const inputRef = React.useRef<HTMLInputElement>(null);

  const handleFiles = (files: FileList | null) => {
    if (!files?.length) return;
    const uploaded: FileMeta[] = Array.from(files).map((file) => ({
      id: uuid(),
      name: file.name,
      size: file.size,
      mime: file.type,
      url: URL.createObjectURL(file)
    }));
    onChange?.([...(value ?? []), ...uploaded]);
  };

  const removeFile = (id: string) => {
    onChange?.((value ?? []).filter((file) => file.id !== id));
  };

  return (
    <div className={cn("space-y-2", className)}>
      <input ref={inputRef} type="file" className="hidden" multiple onChange={(event) => handleFiles(event.target.files)} />
      <Button variant="outline" type="button" onClick={() => inputRef.current?.click()}>
        <Upload className="mr-2 h-4 w-4" /> Upload Files
      </Button>
      <div className="space-y-2">
        {value?.map((file) => (
          <div key={file.id} className="flex items-center justify-between rounded-md border px-3 py-2 text-sm">
            <span className="truncate">{file.name}</span>
            <Button variant="ghost" size="icon" type="button" onClick={() => removeFile(file.id)}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        ))}
        {(!value || value.length === 0) && <p className="text-sm text-muted-foreground">No files uploaded.</p>}
      </div>
    </div>
  );
}
