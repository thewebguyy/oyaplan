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
        className="flex items-center gap-2 px-3.5 py-2 bg-[#008751] hover:bg-[#007345] text-white text-xs font-mono font-bold uppercase tracking-wider rounded border border-[#006e42] shadow-[2px_2px_0px_#111111] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none disabled:opacity-50 transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#008751]"
      >
        {uiState === "parsing" ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Upload className="w-3.5 h-3.5" />}
        {uiState === "parsing" ? "Parsing..." : "Bulk Upload Media"}
      </button>

      {errorMsg && uiState === "idle" && (
        <div className="mt-2 text-xs font-mono font-bold text-[#D72638] bg-red-50 p-2.5 rounded border border-[#D72638]/30 flex items-center gap-1.5">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Preview Modal */}
      {uiState === "preview" && preview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <div className="bg-white border-2 border-[#111111] rounded-lg shadow-[8px_8px_0px_#111111] w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden">
            <div className="p-5 bg-[#010528] text-white flex items-center justify-between border-b-2 border-[#111111]">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#008751]" />
                <h2 className="text-base font-display font-black text-white uppercase tracking-wider">
                  Bulk Media Import Preview
                </h2>
              </div>
              <button onClick={reset} className="text-white/60 hover:text-white transition-colors" title="Close">
                <XCircle className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-5 bg-[#FAF8F8] border-b border-[#111111]/10 grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3 bg-white border border-[#111111]/15 rounded flex flex-col">
                <span className="text-[#111111]/60 font-mono font-bold text-[10px] uppercase tracking-wider">Detected</span>
                <span className="font-mono font-black text-[#111111] text-xl mt-1">{preview.previewRows.length} venues</span>
              </div>
              <div className="p-3 bg-white border border-emerald-300 rounded flex flex-col">
                <span className="text-[#008751] font-mono font-bold text-[10px] uppercase tracking-wider">Ready to Import</span>
                <span className="font-mono font-black text-[#008751] text-xl mt-1">{preview.matched}</span>
              </div>
              <div className="p-3 bg-white border border-red-300 rounded flex flex-col">
                <span className="text-[#D72638] font-mono font-bold text-[10px] uppercase tracking-wider">Not Found</span>
                <span className="font-mono font-black text-[#D72638] text-xl mt-1">{preview.unmatched}</span>
              </div>
              <div className="p-3 bg-white border border-amber-300 rounded flex flex-col">
                <span className="text-[#B45309] font-mono font-bold text-[10px] uppercase tracking-wider">Ambiguous</span>
                <span className="font-mono font-black text-[#B45309] text-xl mt-1">{preview.ambiguous}</span>
              </div>
            </div>

            <div className="flex-1 overflow-auto p-4 sm:p-5">
              <table className="w-full text-xs text-left border-collapse">
                <thead className="text-[10px] text-[#111111]/70 font-mono font-bold uppercase tracking-wider bg-[#F1ECE1]/50 sticky top-0 border-b border-[#111111]/15">
                  <tr>
                    <th className="py-2.5 px-3">Venue</th>
                    <th className="py-2.5 px-3">Images</th>
                    <th className="py-2.5 px-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#111111]/10 font-mono">
                  {preview.previewRows.map((row, i) => (
                    <tr key={i} className="hover:bg-[#FAF8F8] transition-colors">
                      <td className="py-2.5 px-3 font-bold text-[#111111]">{row.originalName}</td>
                      <td className="py-2.5 px-3 text-[#111111]/70">{row.imagesCount}</td>
                      <td className="py-2.5 px-3">
                        {row.status === 'Ready' && (
                          <span className="inline-flex items-center gap-1 text-[#008751] bg-[#008751]/10 px-2 py-0.5 rounded text-[10px] font-bold border border-[#008751]/30 uppercase tracking-wider">
                            <CheckCircle2 className="w-3 h-3"/> Ready
                          </span>
                        )}
                        {row.status === 'Not Found' && (
                          <span className="inline-flex items-center gap-1 text-[#D72638] bg-red-50 px-2 py-0.5 rounded text-[10px] font-bold border border-[#D72638]/30 uppercase tracking-wider">
                            <AlertTriangle className="w-3 h-3"/> Not Found
                          </span>
                        )}
                        {row.status === 'Ambiguous' && (
                          <span className="inline-flex items-center gap-1 text-[#B45309] bg-amber-50 px-2 py-0.5 rounded text-[10px] font-bold border border-amber-300 uppercase tracking-wider">
                            <AlertTriangle className="w-3 h-3"/> Ambiguous
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="p-4 sm:p-5 border-t border-[#111111]/10 flex justify-end gap-2.5 bg-[#FAF8F8]">
              <button
                onClick={reset}
                className="px-4 py-2 text-xs font-mono font-bold text-[#111111]/70 hover:bg-white rounded border border-[#111111]/20 transition-all cursor-pointer"
              >
                Cancel
              </button>
              <button 
                onClick={handleConfirm} 
                disabled={preview.matched === 0}
                className="px-5 py-2 bg-[#008751] hover:bg-[#007345] text-white text-xs font-mono font-bold uppercase tracking-wider rounded border border-[#006e42] shadow-[2px_2px_0px_#111111] active:translate-x-[1px] active:translate-y-[1px] disabled:opacity-50 transition-all cursor-pointer"
              >
                Import {preview.matched} Venues
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Uploading State */}
      {uiState === "uploading" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <div className="bg-white border-2 border-[#111111] rounded-lg shadow-[8px_8px_0px_#111111] p-8 flex flex-col items-center">
            <Loader2 className="w-8 h-8 text-[#008751] animate-spin mb-4" />
            <h3 className="text-base font-display font-black text-[#111111]">Importing Media...</h3>
            <p className="text-xs font-mono text-[#111111]/60 mt-2">Please do not close this window.</p>
          </div>
        </div>
      )}

      {/* Result State */}
      {uiState === "result" && result && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <div className="bg-white border-2 border-[#111111] rounded-lg shadow-[8px_8px_0px_#111111] w-full max-w-lg overflow-hidden">
            <div className="p-5 bg-[#010528] text-white flex items-center justify-between border-b-2 border-[#111111]">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#008751]" />
                <h2 className="text-base font-display font-black text-white uppercase tracking-wider">Import Complete</h2>
              </div>
            </div>
            
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-3 font-mono">
                <div className="bg-[#008751]/10 border border-[#008751]/30 p-4 rounded">
                  <div className="text-3xl font-black text-[#008751] tabular-nums">{result.updated}</div>
                  <div className="text-xs text-[#008751] font-bold mt-1">Successfully Updated</div>
                </div>
                <div className="bg-[#111111]/5 border border-[#111111]/15 p-4 rounded">
                  <div className="text-3xl font-black text-[#111111] tabular-nums">{result.skipped}</div>
                  <div className="text-xs text-[#111111]/70 font-bold mt-1">Skipped</div>
                </div>
              </div>

              {result.failed > 0 && (
                <div className="bg-red-50 border border-[#D72638]/30 p-4 rounded font-mono">
                  <div className="text-xs text-[#D72638] font-bold mb-2">{result.failed} Failed</div>
                  <ul className="text-xs text-[#D72638]/90 space-y-1 max-h-32 overflow-auto">
                    {result.errors.map((e, i) => (
                      <li key={i}><strong>{e.venueName || e.venueId}</strong>: {e.reason}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            <div className="p-4 border-t border-[#111111]/10 bg-[#FAF8F8] flex justify-end">
              <button
                onClick={() => { reset(); window.location.reload(); }}
                className="px-5 py-2.5 bg-[#010528] hover:bg-[#111111] text-white text-xs font-mono font-bold uppercase tracking-wider rounded border border-[#010528] shadow-[2px_2px_0px_#111111] active:translate-x-[1px] active:translate-y-[1px] transition-all cursor-pointer"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
