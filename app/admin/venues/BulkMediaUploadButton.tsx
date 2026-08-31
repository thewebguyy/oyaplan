"use client";

import React, { useRef, useState } from "react";
import { Upload, Loader2, CheckCircle2, AlertTriangle, XCircle } from "lucide-react";
import { previewBulkMediaUpload, executeBulkMediaUpload, BulkMediaPreviewResult, BulkMediaUploadResult } from "./actions";
import Papa from "papaparse";
import * as xlsx from "xlsx";

type UIState = "idle" | "parsing" | "preview" | "uploading" | "result";

export default function BulkMediaUploadButton() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uiState, setUiState] = useState<UIState>("idle");
  const [preview, setPreview] = useState<BulkMediaPreviewResult | null>(null);
  const [result, setResult] = useState<BulkMediaUploadResult | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const reset = () => {
    setUiState("idle");
    setPreview(null);
    setResult(null);
    setErrorMsg(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUiState("parsing");
    setErrorMsg(null);

    try {
      const ext = file.name.split('.').pop()?.toLowerCase();
      let rawRows: any[] = [];

      if (ext === "csv") {
        const text = await file.text();
        const parsed = Papa.parse(text, { header: true, skipEmptyLines: true });
        if (parsed.errors.length) throw new Error("CSV Parsing error");
        rawRows = parsed.data;
      } else if (ext === "xlsx" || ext === "xls") {
        const buffer = await file.arrayBuffer();
        const workbook = xlsx.read(buffer, { type: "array" });
        const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
        rawRows = xlsx.utils.sheet_to_json(firstSheet);
      } else {
        throw new Error("Unsupported file type. Please upload .csv, .xlsx, or .xls");
      }

      if (rawRows.length === 0) {
        throw new Error("File is empty or could not be parsed.");
      }

      // Normalization: Extract Venue Name and Image URLs
      // Columns might be named "Venue Name", "Venue", "Name", "Image URL", "Image 1 URL", etc.
      const venueMap = new Map<string, string[]>();

      for (const row of rawRows) {
        let venueName = "";
        const urls: string[] = [];

        for (const [key, val] of Object.entries(row)) {
          if (typeof val !== "string") continue;
          const k = key.trim().toLowerCase();
          
          if (k === "venue name" || k === "venue" || k === "name") {
            venueName = val.trim();
          } else if (k.includes("image") || k.includes("url")) {
            if (val.trim()) urls.push(val.trim());
          }
        }

        if (venueName && urls.length > 0) {
          const existing = venueMap.get(venueName) || [];
          venueMap.set(venueName, [...existing, ...urls]);
        }
      }

      const records = Array.from(venueMap.entries()).map(([venueName, imageUrls]) => ({
        venueName,
        imageUrls
      }));

      if (records.length === 0) {
        throw new Error("Could not find valid 'Venue Name' and 'Image URL' columns.");
      }

      const previewData = await previewBulkMediaUpload(records);
      setPreview(previewData);
      setUiState("preview");

    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || "Failed to process file.");
      setUiState("idle");
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleConfirm = async () => {
    if (!preview) return;
    setUiState("uploading");
    
    try {
      const uploadResult = await executeBulkMediaUpload(preview.previewRows);
      setResult(uploadResult);
      setUiState("result");
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to upload.");
      setUiState("preview");
    }
  };

  return (
    <>
      <input
        type="file"
        accept=".csv,.xlsx,.xls"
        className="hidden"
        ref={fileInputRef}
        onChange={handleFileChange}
      />
      <button
        onClick={() => fileInputRef.current?.click()}
        disabled={uiState !== "idle"}
        className="flex items-center gap-2 px-4 py-2 bg-gray-900 text-white text-sm font-semibold rounded-lg hover:bg-gray-800 disabled:opacity-50 transition-colors"
      >
        {uiState === "parsing" ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
        {uiState === "parsing" ? "Parsing..." : "Bulk Upload Media"}
      </button>

      {errorMsg && uiState === "idle" && (
        <div className="mt-2 text-sm text-red-600 bg-red-50 p-2 rounded border border-red-200">
          <AlertTriangle className="w-4 h-4 inline mr-1" /> {errorMsg}
        </div>
      )}

      {/* Preview Modal */}
      {uiState === "preview" && preview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden">
            <div className="p-6 border-b border-gray-100 flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">Import Preview</h2>
              <button onClick={reset} className="text-gray-400 hover:text-gray-600">
                <XCircle className="w-6 h-6" />
              </button>
            </div>
            
            <div className="p-6 bg-gray-50 flex gap-6 text-sm">
              <div className="flex flex-col">
                <span className="text-gray-500 font-medium text-xs uppercase">Detected</span>
                <span className="font-bold text-gray-900 text-lg">{preview.previewRows.length} venues</span>
              </div>
              <div className="flex flex-col">
                <span className="text-gray-500 font-medium text-xs uppercase">Ready to Import</span>
                <span className="font-bold text-green-600 text-lg">{preview.matched}</span>
              </div>
              <div className="flex flex-col">
                <span className="text-gray-500 font-medium text-xs uppercase">Not Found</span>
                <span className="font-bold text-red-500 text-lg">{preview.unmatched}</span>
              </div>
              <div className="flex flex-col">
                <span className="text-gray-500 font-medium text-xs uppercase">Ambiguous</span>
                <span className="font-bold text-amber-500 text-lg">{preview.ambiguous}</span>
              </div>
            </div>

            <div className="flex-1 overflow-auto p-6">
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-gray-500 uppercase bg-gray-50 sticky top-0">
                  <tr>
                    <th className="py-3 px-4 rounded-tl-lg">Venue</th>
                    <th className="py-3 px-4">Images</th>
                    <th className="py-3 px-4 rounded-tr-lg">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {preview.previewRows.map((row, i) => (
                    <tr key={i} className="border-b border-gray-50 hover:bg-gray-50/50">
                      <td className="py-3 px-4 font-medium text-gray-900">{row.originalName}</td>
                      <td className="py-3 px-4 text-gray-500">{row.imagesCount}</td>
                      <td className="py-3 px-4">
                        {row.status === 'Ready' && <span className="inline-flex items-center gap-1 text-green-700 bg-green-50 px-2 py-1 rounded text-xs font-medium"><CheckCircle2 className="w-3 h-3"/> Ready</span>}
                        {row.status === 'Not Found' && <span className="inline-flex items-center gap-1 text-red-700 bg-red-50 px-2 py-1 rounded text-xs font-medium"><AlertTriangle className="w-3 h-3"/> Not Found</span>}
                        {row.status === 'Ambiguous' && <span className="inline-flex items-center gap-1 text-amber-700 bg-amber-50 px-2 py-1 rounded text-xs font-medium"><AlertTriangle className="w-3 h-3"/> Ambiguous</span>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="p-6 border-t border-gray-100 flex justify-end gap-3 bg-white">
              <button onClick={reset} className="px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">
                Cancel
              </button>
              <button 
                onClick={handleConfirm} 
                disabled={preview.matched === 0}
                className="px-6 py-2 bg-gray-900 text-white text-sm font-semibold rounded-lg hover:bg-gray-800 disabled:opacity-50 transition-colors"
              >
                Import {preview.matched} Venues
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Uploading State */}
      {uiState === "uploading" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-xl shadow-xl p-8 flex flex-col items-center">
            <Loader2 className="w-8 h-8 text-gray-900 animate-spin mb-4" />
            <h3 className="text-lg font-bold text-gray-900">Importing Media...</h3>
            <p className="text-sm text-gray-500 mt-2">Please do not close this window.</p>
          </div>
        </div>
      )}

      {/* Result State */}
      {uiState === "result" && result && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg overflow-hidden">
            <div className="p-6 border-b border-gray-100 flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">Import Complete</h2>
            </div>
            
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-green-50 p-4 rounded-lg">
                  <div className="text-2xl font-bold text-green-700">{result.updated}</div>
                  <div className="text-sm text-green-600 font-medium">Successfully Updated</div>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="text-2xl font-bold text-gray-700">{result.skipped}</div>
                  <div className="text-sm text-gray-600 font-medium">Skipped</div>
                </div>
              </div>

              {result.failed > 0 && (
                <div className="bg-red-50 p-4 rounded-lg">
                  <div className="text-sm text-red-600 font-bold mb-2">{result.failed} Failed</div>
                  <ul className="text-xs text-red-700 space-y-1 max-h-32 overflow-auto">
                    {result.errors.map((e, i) => (
                      <li key={i}><strong>{e.venueName || e.venueId}</strong>: {e.reason}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            <div className="p-6 border-t border-gray-100 bg-gray-50 flex justify-end">
              <button onClick={() => { reset(); window.location.reload(); }} className="px-6 py-2 bg-gray-900 text-white text-sm font-semibold rounded-lg hover:bg-gray-800 transition-colors">
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
