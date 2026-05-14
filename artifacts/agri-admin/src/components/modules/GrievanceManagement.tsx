import { useState, useEffect, useMemo, useCallback } from "react";
import { ChevronLeft, ChevronRight, Plus, RefreshCw, Search, Paperclip, ArrowLeft, AlertTriangle, CheckCircle, Clock, TrendingUp, BarChart3, FileX, Save, Trash2 } from "lucide-react";
import { apiFetchGrievances, apiUpdateGrievance, apiDeleteGrievance, type GrievanceRecord } from "@/data/grievanceApi";
import GrievanceFilingForm from "@/components/forms/GrievanceFilingForm";
import { useAuth } from "@/contexts/AuthContext";

const CATEGORIES = ["Subsidy Delay", "Wrong Beneficiary", "Document Issue", "Officer Misconduct", "Technical Error", "Portal/App Issue", "Other"];
const STATUSES = ["Open", "In Progress", "Resolved", "Escalated", "Closed", "Rejected"] as const;
const PRIORITIES = ["High", "Medium", "Low"] as const;

const STATUS_COLORS: Record<string, { bg: string; text: string }> = {
  Open:        { bg: "#92400E", text: "#ffffff" },
  "In Progress":{ bg: "#1D4ED8", text: "#ffffff" },
  Resolved:    { bg: "#065F46", text: "#ffffff" },
  Escalated:   { bg: "#DC2626", text: "#ffffff" },
  Rejected:    { bg: "#9D174D", text: "#ffffff" },
  Closed:      { bg: "#475569", text: "#ffffff" },
};

const PRIORITY_COLORS: Record<string, { bg: string; text: string }> = {
  High:   { bg: "#DC2626", text: "#ffffff" },
  Medium: { bg: "#D97706", text: "#ffffff" },
  Low:    { bg: "#059669", text: "#ffffff" },
};

function PriorityBadge({ p }: { p: string }) {
  const c = PRIORITY_COLORS[p] ?? { bg: "#6B7280", text: "#fff" };
  return (
    <span
      className="text-xs px-3 py-1 rounded-full font-semibold"
      style={{ background: c.bg, color: c.text, fontFamily: "'Poppins', sans-serif" }}
    >
      {p}
    </span>
  );
}

function StatusBadge({ s }: { s: string }) {
  const c = STATUS_COLORS[s] ?? { bg: "#6B7280", text: "#fff" };
  return (
    <span
      className="text-xs px-3 py-1 rounded-full font-semibold"
      style={{ background: c.bg, color: c.text, fontFamily: "'Poppins', sans-serif" }}
    >
      {s}
    </span>
  );
}

function fmt(iso: string) {
  return new Date(iso).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

function avgResolutionDays(list: GrievanceRecord[]) {
  const resolved = list.filter(g => g.resolvedAt && g.createdAt);
  if (resolved.length === 0) return "—";
  const avg = resolved.reduce((sum, g) => {
    const diff = (new Date(g.resolvedAt!).getTime() - new Date(g.createdAt).getTime()) / (1000 * 60 * 60 * 24);
    return sum + diff;
  }, 0) / resolved.length;
  return `${avg.toFixed(1)}d`;
}

function GrievanceDetailPage({
  gr, onBack, onUpdated, adminName,
}: {
  gr: GrievanceRecord; onBack: () => void;
  onUpdated: (updated: GrievanceRecord) => void;
  adminName: string;
}) {
  const [reply, setReply] = useState(gr.adminReply ?? "");
  const [notes, setNotes] = useState(gr.adminNotes ?? "");
  const [assignedTo, setAssignedTo] = useState(gr.assignedTo ?? "");
  const [priority, setPriority] = useState(gr.priority);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState("");
  const [showRejectInput, setShowRejectInput] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [rejectSaving, setRejectSaving] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const currentGr = gr;

  function showToast(msg: string) { setToast(msg); setTimeout(() => setToast(""), 3000); }

  async function handleSaveChanges() {
    setSaving(true);
    try {
      const updated = await apiUpdateGrievance(gr.grievanceId, {
        adminReply: reply, adminNotes: notes, priority,
        assignedTo: assignedTo || null,
      });
      onUpdated(updated);
      showToast("Changes saved successfully");
    } catch { showToast("Failed to save changes"); }
    finally { setSaving(false); }
  }

  async function sendNotification(title: string, body: string) {
    if (!gr.mobile) return;
    try {
      await fetch("/api/notifications/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mobile: gr.mobile, farmerId: gr.farmerId ?? undefined,
          type: "grievance", title, body,
          data: { grievanceId: gr.grievanceId },
        }),
      });
    } catch { /* non-fatal */ }
  }

  async function handleStatusChange(newStatus: string, extra?: { resolvedAt?: string; rejectionReason?: string }) {
    setSaving(true);
    try {
      const updated = await apiUpdateGrievance(gr.grievanceId, { status: newStatus, ...extra });
      onUpdated(updated);
      showToast(`Status updated to ${newStatus}`);
      if (newStatus === "Resolved") {
        await sendNotification("Grievance Resolved", `Your grievance ${gr.grievanceId} regarding ${gr.category} has been resolved.${reply.trim() ? ` Message: ${reply.trim()}` : ""}`);
      } else if (newStatus === "Escalated") {
        await sendNotification("Grievance Escalated", `Your grievance ${gr.grievanceId} regarding ${gr.category} has been escalated for priority handling.`);
      } else if (newStatus === "In Progress") {
        await sendNotification("Grievance Update", `Your grievance ${gr.grievanceId} regarding ${gr.category} is now being actively processed.`);
      }
    } catch { showToast("Failed to update status"); }
    finally { setSaving(false); }
  }

  async function handleResolve() { await handleStatusChange("Resolved", { resolvedAt: new Date().toISOString() }); }
  async function handleEscalate() { await handleStatusChange("Escalated"); }
  async function handleReopen() { await handleStatusChange("Open"); }

  async function handleConfirmReject() {
    if (!rejectReason.trim()) { showToast("Please enter a rejection reason"); return; }
    setRejectSaving(true);
    try {
      const updated = await apiUpdateGrievance(gr.grievanceId, { status: "Rejected", rejectionReason: rejectReason.trim() });
      onUpdated(updated);
      setShowRejectInput(false);
      setRejectReason("");
      showToast("Grievance rejected");
      await sendNotification("Grievance Update", `Your grievance ${gr.grievanceId} regarding ${gr.category} has been reviewed. Reason: ${rejectReason.trim()}`);
    } catch { showToast("Failed to reject grievance"); }
    finally { setRejectSaving(false); }
  }

  async function handleConfirmDelete() {
    setDeleting(true);
    try {
      await apiDeleteGrievance(gr.grievanceId);
      onBack();
    } catch { showToast("Failed to delete grievance"); setDeleting(false); }
  }

  const isSettled = currentGr.status === "Resolved" || currentGr.status === "Rejected" || currentGr.status === "Closed";
  const hasAttachments = gr.attachments && gr.attachments.length > 0;

  return (
    <div className="space-y-5 animate-fade-in">
      {toast && (
        <div className="fixed top-4 right-4 z-50 bg-primary text-primary-foreground px-4 py-3 rounded-lg shadow-lg text-sm animate-fade-in" style={{ fontFamily: "'Poppins', sans-serif" }}>
          {toast}
        </div>
      )}

      {/* Back */}
      <button
        onClick={onBack}
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
        style={{ fontFamily: "'Poppins', sans-serif" }}
      >
        <ArrowLeft className="h-4 w-4" /> Back to Grievances
      </button>

      {/* Title card */}
      <div className="bg-white border border-border rounded-xl p-6 shadow-sm">
        <div className="flex flex-wrap items-start gap-3 mb-3">
          <span className="font-mono text-xs text-muted-foreground bg-gray-100 px-2 py-1 rounded">{gr.grievanceId}</span>
          <StatusBadge s={currentGr.status} />
          <PriorityBadge p={priority} />
          {gr.source === "admin" && (
            <span className="text-xs px-3 py-1 rounded-full font-semibold" style={{ background: "#1D4ED8", color: "#fff", fontFamily: "'Poppins', sans-serif" }}>
              Admin Filed
            </span>
          )}
        </div>
        <h2 className="text-xl font-semibold text-gray-900 mb-1" style={{ fontFamily: "'Poppins', sans-serif" }}>{gr.subject}</h2>
        <p className="text-sm text-muted-foreground" style={{ fontFamily: "'Poppins', sans-serif" }}>
          Filed {fmt(gr.createdAt)}
          {gr.resolvedAt ? ` · Resolved ${fmt(gr.resolvedAt)}` : ""}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
        {/* Left: details */}
        <div className="lg:col-span-3 space-y-4">

          {/* Farmer Info */}
          <div className="bg-white border border-border rounded-xl overflow-hidden shadow-sm">
            <div className="px-5 py-3 border-b border-border" style={{ background: "#1B4332" }}>
              <span className="text-xs font-semibold tracking-widest text-white uppercase" style={{ fontFamily: "'Poppins', sans-serif" }}>Farmer Information</span>
            </div>
            <div className="p-5 grid grid-cols-2 gap-x-6 gap-y-3">
              {[
                ["Farmer", gr.farmerName ?? "—"],
                ["Mobile", gr.mobile],
                ["Farmer ID", gr.farmerId ?? "—"],
                ["Category", gr.category],
                gr.assignedTo ? ["Assigned To", gr.assignedTo] : null,
                gr.raisedBy ? ["Raised By", gr.raisedBy] : null,
              ].filter(Boolean).map(([label, value]) => (
                <div key={label as string}>
                  <p className="text-xs text-muted-foreground mb-0.5" style={{ fontFamily: "'Poppins', sans-serif", fontWeight: 400 }}>{label}</p>
                  <p className="text-sm font-semibold text-gray-800" style={{ fontFamily: "'Poppins', sans-serif" }}>{value}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Description */}
          <div className="bg-white border border-border rounded-xl overflow-hidden shadow-sm">
            <div className="px-5 py-3 border-b border-border" style={{ background: "#1B4332" }}>
              <span className="text-xs font-semibold tracking-widest text-white uppercase" style={{ fontFamily: "'Poppins', sans-serif" }}>Grievance Description</span>
            </div>
            <div className="p-5 text-sm text-gray-800 leading-relaxed whitespace-pre-wrap" style={{ fontFamily: "'Poppins', sans-serif", fontWeight: 400 }}>
              {gr.description || <span className="text-muted-foreground italic">No description provided.</span>}
            </div>
          </div>

          {/* Rejection reason */}
          {currentGr.status === "Rejected" && currentGr.rejectionReason && (
            <div className="bg-red-50 border border-red-200 rounded-xl overflow-hidden shadow-sm">
              <div className="px-5 py-3 border-b border-red-200 flex items-center gap-2" style={{ background: "#DC2626" }}>
                <AlertTriangle className="h-3.5 w-3.5 text-white" />
                <span className="text-xs font-semibold tracking-widest text-white uppercase" style={{ fontFamily: "'Poppins', sans-serif" }}>Rejection Reason</span>
              </div>
              <div className="p-5 text-sm text-red-800 whitespace-pre-wrap" style={{ fontFamily: "'Poppins', sans-serif", fontWeight: 400 }}>
                {currentGr.rejectionReason}
              </div>
            </div>
          )}

          {/* Admin reply displayed */}
          {currentGr.adminReply && (
            <div className="bg-green-50 border border-green-200 rounded-xl overflow-hidden shadow-sm">
              <div className="px-5 py-3 border-b border-green-200" style={{ background: "#065F46" }}>
                <span className="text-xs font-semibold tracking-widest text-white uppercase" style={{ fontFamily: "'Poppins', sans-serif" }}>Reply to Farmer</span>
              </div>
              <div className="p-5 text-sm text-green-900 whitespace-pre-wrap" style={{ fontFamily: "'Poppins', sans-serif", fontWeight: 400 }}>
                {currentGr.adminReply}
              </div>
            </div>
          )}

          {/* Attachments */}
          {hasAttachments && (
            <div className="bg-white border border-border rounded-xl overflow-hidden shadow-sm">
              <div className="px-5 py-3 border-b border-border" style={{ background: "#1B4332" }}>
                <span className="text-xs font-semibold tracking-widest text-white uppercase" style={{ fontFamily: "'Poppins', sans-serif" }}>Attachments</span>
              </div>
              <div className="p-5 flex flex-wrap gap-3">
                {gr.attachments.map((att, i) => {
                  const isImg = att.mimeType.startsWith("image/");
                  return isImg ? (
                    <a key={i} href={`data:${att.mimeType};base64,${att.base64}`} download={att.name}>
                      <img src={`data:${att.mimeType};base64,${att.base64}`} alt={att.name} className="h-24 w-24 object-cover rounded-lg border border-border cursor-pointer hover:opacity-80 transition-opacity" />
                    </a>
                  ) : (
                    <a key={i} href={`data:${att.mimeType};base64,${att.base64}`} download={att.name}
                      className="inline-flex items-center gap-2 text-xs px-4 py-2 rounded-full border border-border bg-gray-50 hover:bg-gray-100 transition-colors font-medium"
                      style={{ fontFamily: "'Poppins', sans-serif" }}>
                      <Paperclip className="h-3.5 w-3.5 text-gray-500" />{att.name}
                    </a>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Right: admin actions */}
        <div className="lg:col-span-2 space-y-4">

          {/* Status action buttons */}
          <div className="bg-white border border-border rounded-xl overflow-hidden shadow-sm">
            <div className="px-5 py-3 border-b border-border" style={{ background: "#1B4332" }}>
              <span className="text-xs font-semibold tracking-widest text-white uppercase" style={{ fontFamily: "'Poppins', sans-serif" }}>Status Actions</span>
            </div>
            <div className="p-5 space-y-2.5">
              {isSettled ? (
                <button onClick={handleReopen} disabled={saving}
                  className="w-full text-sm px-4 py-2.5 rounded-full font-semibold disabled:opacity-50 transition-opacity hover:opacity-90"
                  style={{ background: "#1B4332", color: "#ffffff", fontFamily: "'Poppins', sans-serif" }}>
                  {saving ? "Updating…" : "Reopen Grievance"}
                </button>
              ) : (
                <>
                  {currentGr.status !== "Resolved" && (
                    <button onClick={handleResolve} disabled={saving}
                      className="w-full text-sm px-4 py-2.5 rounded-full font-semibold disabled:opacity-50 hover:opacity-90 transition-opacity"
                      style={{ background: "#065F46", color: "#ffffff", fontFamily: "'Poppins', sans-serif" }}>
                      {saving ? "Updating…" : "Mark as Resolved"}
                    </button>
                  )}
                  {currentGr.status !== "In Progress" && currentGr.status !== "Resolved" && currentGr.status !== "Escalated" && (
                    <button onClick={() => handleStatusChange("In Progress")} disabled={saving}
                      className="w-full text-sm px-4 py-2.5 rounded-full font-semibold disabled:opacity-50 hover:opacity-90 transition-opacity"
                      style={{ background: "#1D4ED8", color: "#ffffff", fontFamily: "'Poppins', sans-serif" }}>
                      {saving ? "Updating…" : "Mark In Progress"}
                    </button>
                  )}
                  {currentGr.status !== "Escalated" && (
                    <button onClick={handleEscalate} disabled={saving}
                      className="w-full text-sm px-4 py-2.5 rounded-full font-semibold disabled:opacity-50 hover:opacity-90 transition-opacity"
                      style={{ background: "#D97706", color: "#ffffff", fontFamily: "'Poppins', sans-serif" }}>
                      {saving ? "Updating…" : "Escalate"}
                    </button>
                  )}
                  <button onClick={() => { setShowRejectInput(v => !v); setShowDeleteConfirm(false); }} disabled={saving}
                    className="w-full text-sm px-4 py-2.5 rounded-full font-semibold disabled:opacity-50 hover:opacity-90 transition-opacity"
                    style={{ background: "#DC2626", color: "#ffffff", fontFamily: "'Poppins', sans-serif" }}>
                    Reject Grievance
                  </button>
                </>
              )}

              {showRejectInput && (
                <div className="border-t border-border pt-4 space-y-3">
                  <label className="text-xs font-medium text-gray-600 block" style={{ fontFamily: "'Poppins', sans-serif" }}>
                    Rejection Reason <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    value={rejectReason}
                    onChange={e => setRejectReason(e.target.value)}
                    className="w-full text-sm px-3 py-2.5 border border-border rounded-xl bg-background resize-none h-24 focus:outline-none focus:ring-2 focus:ring-red-300"
                    style={{ fontFamily: "'Poppins', sans-serif" }}
                    placeholder="Explain why this grievance is being rejected…"
                  />
                  <div className="flex gap-2">
                    <button onClick={handleConfirmReject} disabled={rejectSaving || !rejectReason.trim()}
                      className="flex-1 text-sm px-3 py-2.5 rounded-full font-semibold disabled:opacity-50 hover:opacity-90"
                      style={{ background: "#DC2626", color: "#ffffff", fontFamily: "'Poppins', sans-serif" }}>
                      {rejectSaving ? "Rejecting…" : "Confirm Reject"}
                    </button>
                    <button onClick={() => { setShowRejectInput(false); setRejectReason(""); }}
                      className="text-sm px-3 py-2.5 rounded-full border border-border hover:bg-muted font-medium"
                      style={{ fontFamily: "'Poppins', sans-serif" }}>
                      Cancel
                    </button>
                  </div>
                </div>
              )}

              <div className="border-t border-border pt-3">
                {showDeleteConfirm ? (
                  <div className="space-y-3">
                    <p className="text-xs text-red-600 font-medium" style={{ fontFamily: "'Poppins', sans-serif" }}>
                      This will permanently delete the grievance. This action cannot be undone.
                    </p>
                    <div className="flex gap-2">
                      <button onClick={handleConfirmDelete} disabled={deleting}
                        className="flex-1 text-sm px-3 py-2.5 rounded-full font-semibold disabled:opacity-50 hover:opacity-90"
                        style={{ background: "#DC2626", color: "#ffffff", fontFamily: "'Poppins', sans-serif" }}>
                        {deleting ? "Deleting…" : "Yes, Delete"}
                      </button>
                      <button onClick={() => setShowDeleteConfirm(false)} disabled={deleting}
                        className="text-sm px-3 py-2.5 rounded-full border border-border hover:bg-muted font-medium"
                        style={{ fontFamily: "'Poppins', sans-serif" }}>
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <button onClick={() => { setShowDeleteConfirm(true); setShowRejectInput(false); }} disabled={saving}
                    className="w-full inline-flex items-center justify-center gap-2 text-sm px-4 py-2.5 rounded-full font-semibold border border-red-200 disabled:opacity-50 hover:opacity-90 transition-opacity"
                    style={{ background: "#FEF2F2", color: "#DC2626", fontFamily: "'Poppins', sans-serif" }}>
                    <Trash2 className="h-3.5 w-3.5" />
                    Delete Grievance
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Admin response */}
          <div className="bg-white border border-border rounded-xl overflow-hidden shadow-sm">
            <div className="px-5 py-3 border-b border-border" style={{ background: "#1B4332" }}>
              <span className="text-xs font-semibold tracking-widest text-white uppercase" style={{ fontFamily: "'Poppins', sans-serif" }}>Admin Response</span>
            </div>
            <div className="p-5 space-y-4">
              {/* Priority */}
              <div>
                <label className="text-xs font-medium text-gray-500 mb-2 block" style={{ fontFamily: "'Poppins', sans-serif" }}>Priority</label>
                <div className="flex gap-2">
                  {PRIORITIES.map(p => {
                    const c = PRIORITY_COLORS[p];
                    const isActive = priority === p;
                    return (
                      <button key={p} onClick={() => setPriority(p)}
                        className="flex-1 text-xs py-2 rounded-full font-semibold border transition-all"
                        style={isActive
                          ? { background: c.bg, color: c.text, border: `2px solid ${c.bg}`, fontFamily: "'Poppins', sans-serif" }
                          : { background: "#F9FAFB", color: "#6B7280", border: "1.5px solid #E5E7EB", fontFamily: "'Poppins', sans-serif" }
                        }>
                        {p}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Assigned To */}
              <div>
                <label className="text-xs font-medium text-gray-500 mb-1.5 block" style={{ fontFamily: "'Poppins', sans-serif" }}>Assigned To</label>
                <input value={assignedTo} onChange={e => setAssignedTo(e.target.value)}
                  className="w-full text-sm px-4 py-2.5 border border-border rounded-xl bg-background focus:outline-none focus:ring-2 focus:ring-primary/30"
                  style={{ fontFamily: "'Poppins', sans-serif" }}
                  placeholder="Officer name or leave blank" />
              </div>

              {/* Reply to Farmer */}
              <div>
                <label className="text-xs font-medium text-gray-500 mb-1.5 block" style={{ fontFamily: "'Poppins', sans-serif" }}>Reply to Farmer</label>
                <textarea value={reply} onChange={e => setReply(e.target.value)}
                  className="w-full text-sm px-4 py-2.5 border border-border rounded-xl bg-background h-24 resize-none focus:outline-none focus:ring-2 focus:ring-primary/30"
                  style={{ fontFamily: "'Poppins', sans-serif" }}
                  placeholder={`Dear ${gr.farmerName ?? "Farmer"} ji, We have received your grievance regarding ${gr.category.toLowerCase()} and are working to resolve it at the earliest.`} />
              </div>

              {/* Internal Notes */}
              <div>
                <label className="text-xs font-medium text-gray-500 mb-1.5 block" style={{ fontFamily: "'Poppins', sans-serif" }}>
                  Internal Notes <span className="font-normal text-muted-foreground">(not visible to farmer)</span>
                </label>
                <textarea value={notes} onChange={e => setNotes(e.target.value)}
                  className="w-full text-sm px-4 py-2.5 border border-border rounded-xl bg-background h-20 resize-none focus:outline-none focus:ring-2 focus:ring-primary/30"
                  style={{ fontFamily: "'Poppins', sans-serif" }}
                  placeholder="Internal notes, follow-up actions…" />
              </div>

              <button onClick={handleSaveChanges} disabled={saving}
                className="w-full inline-flex items-center justify-center gap-2 text-sm px-4 py-2.5 rounded-full font-semibold disabled:opacity-50 hover:opacity-90 transition-opacity"
                style={{ background: "#1B4332", color: "#ffffff", fontFamily: "'Poppins', sans-serif" }}>
                <Save className="h-4 w-4" />
                {saving ? "Saving…" : "Save Changes"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

type ViewState = "list" | "detail" | "new";

const KPI_META = [
  { label: "Total",          filter: "",            bg: "#1B4332", Icon: BarChart3 },
  { label: "Open",           filter: "Open",        bg: "#92400E", Icon: FileX },
  { label: "In Progress",    filter: "In Progress", bg: "#1D4ED8", Icon: Clock },
  { label: "Resolved",       filter: "Resolved",    bg: "#065F46", Icon: CheckCircle },
  { label: "Escalated",      filter: "Escalated",   bg: "#DC2626", Icon: TrendingUp },
  { label: "Avg Resolution", filter: "",            bg: "#7C3AED", Icon: Clock },
];

export default function GrievanceManagement() {
  const { currentUser } = useAuth();
  const [grievances, setGrievances] = useState<GrievanceRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [refreshKey, setRefreshKey] = useState(0);
  const [statusFilter, setStatusFilter] = useState("");
  const [searchQ, setSearchQ] = useState("");
  const [page, setPage] = useState(0);
  const [view, setView] = useState<ViewState>("list");
  const [selectedGr, setSelectedGr] = useState<GrievanceRecord | null>(null);
  const [toast, setToast] = useState("");

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(""), 3000); };
  const refresh = useCallback(() => setRefreshKey(k => k + 1), []);

  useEffect(() => {
    setLoading(true);
    setError("");
    apiFetchGrievances()
      .then(data => setGrievances(data))
      .catch(() => setError("Failed to load grievances. Please retry."))
      .finally(() => setLoading(false));
  }, [refreshKey]);

  const filtered = useMemo(() => {
    let list = grievances;
    if (statusFilter) list = list.filter(g => g.status === statusFilter);
    if (searchQ.trim()) {
      const q = searchQ.trim().toLowerCase();
      list = list.filter(g =>
        g.farmerName?.toLowerCase().includes(q) ||
        g.grievanceId.toLowerCase().includes(q) ||
        g.category.toLowerCase().includes(q) ||
        g.subject.toLowerCase().includes(q) ||
        g.mobile.includes(q)
      );
    }
    return list;
  }, [grievances, statusFilter, searchQ]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / 10));
  const pageData = filtered.slice(page * 10, (page + 1) * 10);

  const kpiValues = [
    grievances.length,
    grievances.filter(g => g.status === "Open").length,
    grievances.filter(g => g.status === "In Progress").length,
    grievances.filter(g => g.status === "Resolved").length,
    grievances.filter(g => g.status === "Escalated").length,
    avgResolutionDays(grievances),
  ];

  const catCounts = useMemo(() => {
    const m: Record<string, number> = {};
    CATEGORIES.forEach(c => { m[c] = grievances.filter(g => g.category === c).length; });
    m["Other"] = grievances.filter(g => !CATEGORIES.slice(0, -1).includes(g.category)).length;
    return m;
  }, [grievances]);

  function handleUpdated(updated: GrievanceRecord) {
    setGrievances(prev => prev.map(g => g.grievanceId === updated.grievanceId ? updated : g));
    setSelectedGr(updated);
  }

  function openDetail(g: GrievanceRecord) { setSelectedGr(g); setView("detail"); }
  function goBack() { setView("list"); setSelectedGr(null); }

  if (view === "new") {
    return (
      <div className="animate-fade-in">
        {toast && <div className="fixed top-4 right-4 z-50 bg-primary text-primary-foreground px-4 py-3 rounded-lg shadow-lg text-sm">{toast}</div>}
        <GrievanceFilingForm
          onBack={() => setView("list")}
          onSuccess={(msg) => { showToast(msg); refresh(); setView("list"); }}
          adminName={currentUser?.name ?? "Admin"}
        />
      </div>
    );
  }

  if (view === "detail" && selectedGr) {
    return (
      <GrievanceDetailPage
        gr={selectedGr}
        onBack={goBack}
        onUpdated={handleUpdated}
        adminName={currentUser?.name ?? "Admin"}
      />
    );
  }

  return (
    <div className="space-y-5 animate-fade-in">
      {toast && (
        <div className="fixed top-4 right-4 z-50 bg-primary text-primary-foreground px-4 py-3 rounded-lg shadow-lg text-sm">
          {toast}
        </div>
      )}

      {/* KPI Stat Cards */}
      <div className="grid grid-cols-3 lg:grid-cols-6 gap-3">
        {KPI_META.map((meta, i) => {
          const isActive = meta.filter !== "" && statusFilter === meta.filter;
          const val = kpiValues[i];
          return (
            <button
              key={meta.label}
              onClick={() => { if (meta.filter) { setStatusFilter(s => s === meta.filter ? "" : meta.filter); setPage(0); } }}
              className={`rounded-xl p-4 text-left transition-all ${meta.filter ? "cursor-pointer hover:opacity-95" : "cursor-default"} ${isActive ? "ring-2 ring-white/40 ring-offset-1" : ""}`}
              style={{ background: meta.bg }}
            >
              <meta.Icon className="h-5 w-5 text-white/70 mb-2" />
              <div
                className="font-bold text-white leading-none mb-1"
                style={{ fontFamily: "'Poppins', sans-serif", fontSize: loading ? "1rem" : "1.6rem" }}
              >
                {loading ? "…" : val}
              </div>
              <div className="text-white/80 font-light" style={{ fontFamily: "'Poppins', sans-serif", fontSize: "0.72rem", letterSpacing: "0.04em" }}>
                {meta.label}
              </div>
            </button>
          );
        })}
      </div>

      {/* Category Filter + Actions */}
      <div className="flex items-start gap-4">
        <div className="border border-border rounded-xl p-5 flex-1 bg-white">
          <h3 className="font-semibold text-sm mb-3 text-gray-700" style={{ fontFamily: "'Poppins', sans-serif" }}>Category Filter</h3>
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map(c => {
              const isActive = searchQ === c;
              return (
                <button key={c}
                  onClick={() => { setStatusFilter(""); setSearchQ(isActive ? "" : (c === "Other" ? "" : c)); setPage(0); }}
                  className="text-xs px-3 py-1.5 rounded-full border font-medium transition-colors"
                  style={isActive
                    ? { background: "#14532D", color: "#ffffff", border: "1.5px solid #14532D", fontFamily: "'Poppins', sans-serif" }
                    : { background: "#ffffff", color: "#374151", border: "1.5px solid #E5E7EB", fontFamily: "'Poppins', sans-serif" }
                  }>
                  {c} <span style={{ opacity: 0.6 }}>({catCounts[c] ?? 0})</span>
                </button>
              );
            })}
          </div>
        </div>
        <div className="flex flex-col gap-2 flex-shrink-0">
          <button
            onClick={() => setView("new")}
            className="inline-flex items-center gap-1.5 text-sm px-5 py-2.5 rounded-full font-semibold hover:opacity-90 whitespace-nowrap shadow-sm"
            style={{ background: "#14532D", color: "#ffffff", fontFamily: "'Poppins', sans-serif" }}>
            <Plus className="h-4 w-4" /> File Grievance
          </button>
          <button
            onClick={refresh}
            className="inline-flex items-center gap-1.5 text-sm px-5 py-2.5 rounded-full font-medium hover:bg-muted/80 whitespace-nowrap border border-border bg-white"
            style={{ fontFamily: "'Poppins', sans-serif", color: "#374151" }}>
            <RefreshCw className="h-4 w-4" /> Refresh
          </button>
        </div>
      </div>

      {/* Search + Status Filter */}
      <div className="flex flex-wrap gap-3 items-center">
        <div className="flex-1 min-w-52 relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            value={searchQ}
            onChange={e => { setSearchQ(e.target.value); setPage(0); }}
            className="w-full pl-11 pr-4 py-2.5 text-sm border border-border rounded-full bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
            style={{ fontFamily: "'Poppins', sans-serif" }}
            placeholder="Search farmer, GR ID, category, subject…"
          />
        </div>
        <div className="flex flex-wrap gap-2">
          {(["", "Open", "In Progress", "Resolved", "Escalated", "Rejected"] as const).map(s => (
            <button
              key={s}
              onClick={() => { setStatusFilter(s); setPage(0); }}
              className="text-xs px-4 py-2 rounded-full font-semibold transition-colors border"
              style={statusFilter === s
                ? { background: "#14532D", color: "#ffffff", border: "1.5px solid #14532D", fontFamily: "'Poppins', sans-serif" }
                : { background: "#ffffff", color: "#374151", border: "1.5px solid #E5E7EB", fontFamily: "'Poppins', sans-serif" }
              }>
              {s || "All"}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      {error ? (
        <div className="bg-white border border-red-200 rounded-xl p-8 text-center">
          <p className="text-red-600 text-sm mb-3" style={{ fontFamily: "'Poppins', sans-serif" }}>{error}</p>
          <button onClick={refresh} className="text-sm px-5 py-2 rounded-full font-semibold text-white" style={{ background: "#14532D", fontFamily: "'Poppins', sans-serif" }}>Retry</button>
        </div>
      ) : loading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4].map(i => <div key={i} className="h-14 bg-muted/40 rounded-xl animate-pulse" />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white border border-border rounded-xl p-12 text-center">
          <p className="text-muted-foreground text-sm mb-1" style={{ fontFamily: "'Poppins', sans-serif" }}>
            No grievances found{statusFilter ? ` with status "${statusFilter}"` : ""}.
          </p>
          {grievances.length > 0 && (
            <button onClick={() => { setStatusFilter(""); setSearchQ(""); }}
              className="mt-3 text-sm font-medium underline text-primary"
              style={{ fontFamily: "'Poppins', sans-serif" }}>
              Clear filters
            </button>
          )}
        </div>
      ) : (
        <div className="bg-white border border-border rounded-xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-white text-xs" style={{ background: "#1B4332" }}>
                  {["GR ID", "Farmer", "Category", "Subject", "Filed", "Priority", "Assigned", "Status", "Action"].map(h => (
                    <th key={h} className="px-4 py-3 font-semibold tracking-wide" style={{ fontFamily: "'Poppins', sans-serif" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {pageData.map((g, idx) => (
                  <tr key={g.grievanceId} className={`border-t border-border/40 hover:bg-green-50/40 transition-colors ${idx % 2 === 0 ? "" : "bg-gray-50/50"}`}>
                    <td className="px-4 py-3 font-mono text-xs text-gray-500">{g.grievanceId}</td>
                    <td className="px-4 py-3">
                      <div className="font-semibold text-gray-800" style={{ fontFamily: "'Poppins', sans-serif", fontSize: "0.8rem" }}>{g.farmerName ?? "—"}</div>
                      <div className="text-xs text-muted-foreground" style={{ fontFamily: "'Poppins', sans-serif", fontWeight: 300 }}>{g.mobile}</div>
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-600" style={{ fontFamily: "'Poppins', sans-serif" }}>{g.category}</td>
                    <td className="px-4 py-3 max-w-[200px]">
                      <span className="block truncate text-xs text-gray-700" style={{ fontFamily: "'Poppins', sans-serif" }} title={g.subject}>{g.subject}</span>
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-500 whitespace-nowrap" style={{ fontFamily: "'Poppins', sans-serif" }}>{fmt(g.createdAt)}</td>
                    <td className="px-4 py-3"><PriorityBadge p={g.priority} /></td>
                    <td className="px-4 py-3 text-xs text-gray-600" style={{ fontFamily: "'Poppins', sans-serif" }}>{g.assignedTo ?? <span className="text-muted-foreground">—</span>}</td>
                    <td className="px-4 py-3"><StatusBadge s={g.status} /></td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => openDetail(g)}
                        className="text-xs px-4 py-1.5 rounded-full font-semibold text-white hover:opacity-90 transition-opacity"
                        style={{ background: "#14532D", fontFamily: "'Poppins', sans-serif" }}>
                        View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="flex items-center justify-between px-4 py-3 border-t border-border bg-gray-50/50">
            <span className="text-xs text-muted-foreground" style={{ fontFamily: "'Poppins', sans-serif" }}>
              {filtered.length} grievance{filtered.length !== 1 ? "s" : ""} · Page {page + 1} of {totalPages}
            </span>
            <div className="flex gap-1">
              <button disabled={page === 0} onClick={() => setPage(p => p - 1)} className="p-1.5 rounded-full hover:bg-muted disabled:opacity-30 transition-colors"><ChevronLeft className="h-4 w-4" /></button>
              <button disabled={page >= totalPages - 1} onClick={() => setPage(p => p + 1)} className="p-1.5 rounded-full hover:bg-muted disabled:opacity-30 transition-colors"><ChevronRight className="h-4 w-4" /></button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
