export interface Form7Data {
  village: string; taluka: string; district: string;
  gat_number: string; tenure_type: string; local_name: string;
  jirayat: string; bagayat: string; tari: string; sub_total: string; net_cultivable: string;
  class_a: string; class_b: string; class_total: string; potkhrab_total: string; grand_total: string;
  revenue_assessment: string; judi_special: string;
  account_number: string; occupant_name: string; area: string; assessment: string;
  potkharaba: string; mutation_number: string;
  tenant_name_rent: string; other_rights: string; pending_mutations: string; last_mutation: string;
  old_mutations: string; boundary_survey: string;
}

export interface Form12DraftData {
  header: { village: string; taluka: string; district: string; gat_number: string };
  grid: string[][];
}

export type FormData = Form7Data | Form12DraftData;

export interface Draft {
  id: string;
  formType: 'form7' | 'form12';
  name: string;
  savedAt: string;
  data: FormData;
}

const STORAGE_KEY = 'mh_forms_drafts_admin';
const SEEDED_KEY  = 'mh_forms_seeded_admin_v1';

const SEED_DRAFTS: Draft[] = [
  {
    id: "draft_seed_f7_001", formType: "form7", name: "पुणे – गट ११२", savedAt: "2026-05-01T09:00:00.000Z",
    data: { village: "उरुळी कांचन", taluka: "हवेली", district: "पुणे", gat_number: "११२", tenure_type: "भोगवटादार वर्ग-१", local_name: "देवाची माळ", jirayat: "१.२०.००", bagayat: "०.४०.००", tari: "०.१०.००", sub_total: "१.७०.००", net_cultivable: "१.८०.००", class_a: "०.०५.००", class_b: "०.०३.००", class_total: "०.०८.००", potkhrab_total: "०.०८.००", grand_total: "१.८८.००", revenue_assessment: "७.२०", judi_special: "०.२०", account_number: "४५", occupant_name: "रमेश नारायण देशमुख", area: "१.८०.००", assessment: "७.२०", potkharaba: "०.०८.००", mutation_number: "(४५६)", tenant_name_rent: "लागू नाही", other_rights: "नाही", pending_mutations: "नाही", last_mutation: "फेरफार क्र. ४५६ दि. ०५/०३/२०२४", old_mutations: "(१२) (८९) (२१५) (४५६)", boundary_survey: "भूमापन खुणा योग्य आहेत" },
  },
  {
    id: "draft_seed_f7_002", formType: "form7", name: "नाशिक – गट २८७", savedAt: "2026-05-02T10:00:00.000Z",
    data: { village: "निफाड", taluka: "निफाड", district: "नाशिक", gat_number: "२८७", tenure_type: "भोगवटादार वर्ग-१", local_name: "नदीकाठची जमीन", jirayat: "०.८०.००", bagayat: "१.२०.००", tari: "०.५०.००", sub_total: "२.५०.००", net_cultivable: "२.६०.००", class_a: "०.०४.००", class_b: "०.०२.००", class_total: "०.०६.००", potkhrab_total: "०.०६.००", grand_total: "२.६६.००", revenue_assessment: "१०.४०", judi_special: "०.४०", account_number: "१२०", occupant_name: "सुरेश भाऊराव पाटील", area: "२.६०.००", assessment: "१०.४०", potkharaba: "०.०६.००", mutation_number: "(७८९)", tenant_name_rent: "लागू नाही", other_rights: "नाही", pending_mutations: "नाही", last_mutation: "फेरफार क्र. ७८९ दि. १२/०७/२०२३", old_mutations: "(४५) (२३४) (७८९)", boundary_survey: "भूमापन खुणा अद्ययावत आहेत" },
  },
  {
    id: "draft_seed_f12_001", formType: "form12", name: "पुणे – खरीप २०२५", savedAt: "2026-05-01T09:30:00.000Z",
    data: { header: { village: "उरुळी कांचन", taluka: "हवेली", district: "पुणे", gat_number: "११२" }, grid: [["२०२५","खरीप","४५","अ-१","०.४०","०.८०","ज्वारी","०.२०","०.४०","भात","०.४०","-","-","-","विहीर",""],["२०२५","खरीप","४५","ब-२","०.२०","०.३०","बाजरी","०.१०","०.१५","-","-","-","-","-","विहीर",""],["२०२५","रब्बी","४५","-","-","-","-","-","-","गहू","०.५०","०.३०","-","-","विहीर",""],["२०२५","रब्बी","४५","-","-","-","-","-","-","हरभरा","०.२०","०.४०","-","-","",""],["","","","","","","","","","","","","","","",""],["","","","","","","","","","","","","","","",""],["","","","","","","","","","","","","","","",""],["","","","","","","","","","","","","","","",""]] },
  },
  {
    id: "draft_seed_f12_002", formType: "form12", name: "नाशिक – खरीप २०२५", savedAt: "2026-05-02T10:30:00.000Z",
    data: { header: { village: "निफाड", taluka: "निफाड", district: "नाशिक", gat_number: "२८७" }, grid: [["२०२५","खरीप","१२०","-","-","-","-","-","-","द्राक्ष","१.२०","०.४०","-","-","विहीर",""],["२०२५","खरीप","१२०","-","-","-","-","-","-","कांदा","०.८०","०.५०","-","-","विहीर",""],["२०२५","रब्बी","१२०","-","-","-","-","-","-","गहू","०.६०","०.४०","-","-","विहीर",""],["","","","","","","","","","","","","","","",""],["","","","","","","","","","","","","","","",""],["","","","","","","","","","","","","","","",""],["","","","","","","","","","","","","","","",""],["","","","","","","","","","","","","","","",""]] },
  },
];

function generateId(): string {
  return `draft_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

export function seedDraftsIfNeeded(): void {
  if (localStorage.getItem(SEEDED_KEY)) return;
  localStorage.removeItem(STORAGE_KEY);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(SEED_DRAFTS));
  localStorage.setItem(SEEDED_KEY, '1');
}

export function getAllDrafts(): Draft[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as Draft[]) : [];
  } catch { return []; }
}

export function getDraft(id: string): Draft | undefined {
  return getAllDrafts().find((d) => d.id === id);
}

export function saveDraft(draft: Omit<Draft, 'id'> & { id?: string }): Draft {
  const all = getAllDrafts();
  const id = draft.id ?? generateId();
  const existing = all.findIndex((d) => d.id === id);
  const updated: Draft = { ...draft, id, savedAt: new Date().toISOString() };
  if (existing >= 0) { all[existing] = updated; } else { all.unshift(updated); }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
  return updated;
}

export function deleteDraft(id: string): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(getAllDrafts().filter((d) => d.id !== id)));
}

export function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  } catch { return iso; }
}
