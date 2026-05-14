import { useState, useEffect } from "react";
import { FileText, BookOpen, Trash2, Download, ChevronDown, ChevronUp, Loader2 } from "lucide-react";
import { getAllDrafts, deleteDraft, seedDraftsIfNeeded, formatDate, Draft } from "./digital-forms/lib/drafts";
import { downloadDraftAsPdf, downloadAllDraftsAsPdf } from "./digital-forms/lib/downloadDraft";
import Form7Page from "./digital-forms/pages/Form7Page";
import Form12Page from "./digital-forms/pages/Form12Page";

type View = "home" | "form7" | "form12";

interface NavState {
  view: View;
  draftId?: string;
}

export default function DigitalForms() {
  const [nav, setNav] = useState<NavState>({ view: "home" });
  const [showDrafts, setShowDrafts] = useState(false);
  const [drafts, setDrafts] = useState<Draft[]>([]);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [downloadingAll, setDownloadingAll] = useState(false);
  const [downloadAllProgress, setDownloadAllProgress] = useState<{ current: number; total: number } | null>(null);

  useEffect(() => {
    seedDraftsIfNeeded();
    setDrafts(getAllDrafts());
  }, []);

  function refreshDrafts() { setDrafts(getAllDrafts()); }

  function handleDelete(id: string) { deleteDraft(id); refreshDrafts(); }

  function openDraft(draft: Draft) {
    setNav({ view: draft.formType as View, draftId: draft.id });
  }

  async function handleDownload(draft: Draft) {
    if (downloadingId) return;
    setDownloadingId(draft.id);
    try { await downloadDraftAsPdf(draft); } finally { setDownloadingId(null); }
  }

  async function handleDownloadAll() {
    if (downloadingAll) return;
    setDownloadingAll(true);
    setDownloadAllProgress({ current: 0, total: drafts.length });
    try {
      await downloadAllDraftsAsPdf(drafts, (current, total) => setDownloadAllProgress({ current, total }));
    } finally { setDownloadingAll(false); setDownloadAllProgress(null); }
  }

  function goHome() { setNav({ view: "home" }); refreshDrafts(); }

  if (nav.view === "form7") {
    return (
      <div className="animate-fade-in">
        <Form7Page onBack={goHome} draftId={nav.draftId} />
      </div>
    );
  }

  if (nav.view === "form12") {
    return (
      <div className="animate-fade-in">
        <Form12Page onBack={goHome} draftId={nav.draftId} />
      </div>
    );
  }

  const form7Drafts = drafts.filter((d) => d.formType === 'form7');
  const form12Drafts = drafts.filter((d) => d.formType === 'form12');

  return (
    <div className="animate-fade-in">
      {/* Header card */}
      <div className="rounded-xl border border-border bg-card p-6 mb-6" style={{ background: "linear-gradient(135deg, #0D2B1E 0%, #14532D 100%)" }}>
        <div className="flex items-center gap-3 mb-1">
          <FileText className="h-7 w-7 text-amber-400" />
          <h2 className="text-xl font-bold text-white" style={{ fontFamily: "DM Serif Display, serif" }}>
            महाराष्ट्र भूमी अभिलेख प्रपत्र
          </h2>
        </div>
        <p className="text-sm text-green-200 ml-10">
          Maharashtra Land Record Forms — Digital Form 7/12 filling, print & PDF download
        </p>
      </div>

      {/* Form selection cards */}
      <div className="grid md:grid-cols-2 gap-6 mb-6">
        {/* Form 7 card */}
        <button
          onClick={() => setNav({ view: "form7" })}
          className="group text-left bg-white p-6 rounded-xl shadow-sm border-2 border-black/10 transition-all hover:shadow-md hover:border-primary/40 flex flex-col"
        >
          <div className="flex items-start gap-4 mb-4">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl flex-shrink-0" style={{ background: "#E9F5EC" }}>
              📄
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900 mb-0.5" style={{ fontFamily: "DM Serif Display, serif" }}>गाव नमुना सात</h3>
              <p className="text-sm font-medium text-gray-600">ग्राम नमूना सात · Village Form 7</p>
            </div>
          </div>
          <p className="text-sm text-gray-500 leading-relaxed flex-1">
            मालकी, क्षेत्र आणि आकारणी तपशील दर्शवणारे अधिकार अभिलेख पत्रक.
          </p>
          {form7Drafts.length > 0 && (
            <p className="text-xs text-primary mt-3 font-semibold">{form7Drafts.length} saved draft{form7Drafts.length !== 1 ? 's' : ''}</p>
          )}
          <div className="mt-4 flex items-center text-primary font-semibold text-sm group-hover:gap-2 transition-all">
            New Blank Form
            <svg className="ml-2 w-4 h-4 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </div>
        </button>

        {/* Form 12 card */}
        <button
          onClick={() => setNav({ view: "form12" })}
          className="group text-left bg-white p-6 rounded-xl shadow-sm border-2 border-black/10 transition-all hover:shadow-md hover:border-primary/40 flex flex-col"
        >
          <div className="flex items-start gap-4 mb-4">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl flex-shrink-0" style={{ background: "#FEF3C7" }}>
              🌾
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900 mb-0.5" style={{ fontFamily: "DM Serif Display, serif" }}>गाव नमुना बारा</h3>
              <p className="text-sm font-medium text-gray-600">ग्राम नमूना बारा · Village Form 12</p>
            </div>
          </div>
          <p className="text-sm text-gray-500 leading-relaxed flex-1">
            हंगामी पिकांची लागवड आणि सिंचन तपशील दर्शवणारी पीक नोंदवही.
          </p>
          {form12Drafts.length > 0 && (
            <p className="text-xs text-primary mt-3 font-semibold">{form12Drafts.length} saved draft{form12Drafts.length !== 1 ? 's' : ''}</p>
          )}
          <div className="mt-4 flex items-center text-primary font-semibold text-sm">
            New Blank Form
            <svg className="ml-2 w-4 h-4 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </div>
        </button>
      </div>

      {/* Saved Drafts */}
      <div className="flex justify-center mb-4">
        <button onClick={() => setShowDrafts((v) => !v)}
          className="flex items-center gap-2 px-6 py-2.5 bg-white border border-black/10 rounded-full shadow-sm text-gray-700 font-medium hover:bg-gray-50 transition-colors text-sm">
          <BookOpen className="w-4 h-4 text-primary" />
          Saved Drafts
          <span className="text-xs bg-primary/10 text-primary rounded-full px-2 py-0.5 font-bold">{drafts.length}</span>
          {showDrafts ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
        </button>
      </div>

      {showDrafts && (
        <div className="bg-white border border-black/10 rounded-xl shadow-sm overflow-hidden">
          <div className="px-5 py-3.5 border-b border-black/5 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <h3 className="font-semibold text-gray-800 text-sm" style={{ fontFamily: "DM Serif Display, serif" }}>Saved Drafts</h3>
              <span className="text-xs text-gray-400">{drafts.length} total</span>
            </div>
            {drafts.length > 0 && (
              <button onClick={handleDownloadAll} disabled={downloadingAll || !!downloadingId}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50">
                {downloadingAll ? (
                  <><Loader2 className="w-3.5 h-3.5 animate-spin" />{downloadAllProgress ? `${downloadAllProgress.current} / ${downloadAllProgress.total}` : "Preparing…"}</>
                ) : (
                  <><Download className="w-3.5 h-3.5" />Download All</>
                )}
              </button>
            )}
          </div>

          {drafts.length === 0 ? (
            <div className="p-10 text-center text-gray-400">
              <FileText className="w-8 h-8 mx-auto mb-2 opacity-30" />
              <p className="text-sm">No saved drafts yet.</p>
              <p className="text-xs mt-1">Open a form, fill it in, and click "Save Draft".</p>
            </div>
          ) : (
            <>
              {form7Drafts.length > 0 && (
                <div>
                  <div className="px-5 py-2 bg-gray-50 border-b border-gray-100">
                    <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Form 7 — गाव नमुना सात</span>
                  </div>
                  <ul className="divide-y divide-gray-50">
                    {form7Drafts.map((draft) => (
                      <DraftRow key={draft.id} draft={draft} onOpen={openDraft} onDelete={handleDelete}
                        onDownload={handleDownload} isDownloading={downloadingId === draft.id} isDisabled={!!downloadingId || downloadingAll} />
                    ))}
                  </ul>
                </div>
              )}
              {form12Drafts.length > 0 && (
                <div>
                  <div className="px-5 py-2 bg-gray-50 border-b border-gray-100">
                    <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Form 12 — गाव नमुना बारा</span>
                  </div>
                  <ul className="divide-y divide-gray-50">
                    {form12Drafts.map((draft) => (
                      <DraftRow key={draft.id} draft={draft} onOpen={openDraft} onDelete={handleDelete}
                        onDownload={handleDownload} isDownloading={downloadingId === draft.id} isDisabled={!!downloadingId || downloadingAll} />
                    ))}
                  </ul>
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}

function DraftRow({ draft, onOpen, onDelete, onDownload, isDownloading, isDisabled }: {
  draft: Draft; onOpen: (d: Draft) => void; onDelete: (id: string) => void;
  onDownload: (d: Draft) => void; isDownloading: boolean; isDisabled: boolean;
}) {
  const [confirming, setConfirming] = useState(false);
  return (
    <li className="flex items-center justify-between px-5 py-3.5 hover:bg-gray-50 transition-colors">
      <div className="flex items-center gap-3 min-w-0">
        <FileText className="w-4 h-4 text-primary/50 shrink-0" />
        <div className="min-w-0">
          <p className="font-medium text-gray-800 text-sm truncate">{draft.name}</p>
          <p className="text-xs text-gray-400 mt-0.5">{formatDate(draft.savedAt)}</p>
        </div>
      </div>
      <div className="flex items-center gap-2 shrink-0 ml-4">
        <button onClick={() => onOpen(draft)} className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-primary border border-primary/20 rounded-full hover:bg-primary/5 transition-colors">
          Open
        </button>
        <button onClick={() => onDownload(draft)} disabled={isDisabled} className="p-1.5 text-gray-300 hover:text-gray-600 rounded-md transition-colors disabled:cursor-not-allowed" title="Download as PDF">
          {isDownloading ? <Loader2 className="w-4 h-4 animate-spin text-primary" /> : <Download className="w-4 h-4" />}
        </button>
        {confirming ? (
          <div className="flex items-center gap-1">
            <button onClick={() => onDelete(draft.id)} className="px-2 py-1.5 text-xs font-medium text-white bg-red-500 rounded-md hover:bg-red-600">Delete</button>
            <button onClick={() => setConfirming(false)} className="px-2 py-1.5 text-xs text-gray-500 border border-gray-200 rounded-md hover:bg-gray-50">Cancel</button>
          </div>
        ) : (
          <button onClick={() => setConfirming(true)} className="p-1.5 text-gray-300 hover:text-red-500 rounded-md transition-colors" title="Delete draft">
            <Trash2 className="w-4 h-4" />
          </button>
        )}
      </div>
    </li>
  );
}
