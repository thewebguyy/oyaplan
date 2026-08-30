"use client";

import React, { useRef, useState } from "react";
import { Upload, Loader2 } from "lucide-react";
import { bulkUploadVenueMedia } from "./actions";

export default function BulkMediaUploadButton() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const text = await file.text();
      const data = JSON.parse(text);

      if (!Array.isArray(data)) {
        alert("Invalid format: JSON must be an array of venue records.");
        return;
      }

      const result = await bulkUploadVenueMedia(data);
      alert(`Upload complete! Success: ${result.successCount}, Failed: ${result.failCount}`);
      
      // Refresh the page to show new data
      window.location.reload();
    } catch (err) {
      console.error(err);
      alert("Error processing file. Please ensure it is valid JSON.");
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  return (
    <>
      <input
        type="file"
        accept=".json"
        className="hidden"
        ref={fileInputRef}
        onChange={handleFileChange}
      />
      <button
        onClick={() => fileInputRef.current?.click()}
        disabled={isUploading}
        className="flex items-center gap-2 px-4 py-2 bg-gray-900 text-white text-sm font-semibold rounded-lg hover:bg-gray-800 disabled:opacity-50 transition-colors"
      >
        {isUploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
        {isUploading ? "Uploading..." : "Bulk Upload Media"}
      </button>
    </>
  );
}
