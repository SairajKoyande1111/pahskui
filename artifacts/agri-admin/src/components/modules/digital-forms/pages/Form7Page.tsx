import { useState, useEffect, useRef } from "react";
import { useLanguage } from "../hooks/useLanguage";
import { Language } from "../lib/translations";
import { ArrowLeft, Printer, FileText, Save, Check } from "lucide-react";
import { saveDraft, getDraft, Form7Data } from "../lib/drafts";

interface Props {
  onBack: () => void;
  draftId?: string;
}

function printBlank() {
  document.body.classList.add('df-print-blank');
  window.print();
  setTimeout(() => document.body.classList.remove('df-print-blank'), 1500);
}
function printWithData() { window.print(); }

const EMPTY: Form7Data = {
  village: "", taluka: "", district: "",
  gat_number: "", tenure_type: "", local_name: "",
  jirayat: "", bagayat: "", tari: "", sub_total: "", net_cultivable: "",
  class_a: "", class_b: "", class_total: "", potkhrab_total: "", grand_total: "",
  revenue_assessment: "", judi_special: "",
  account_number: "", occupant_name: "", area: "", assessment: "",
  potkharaba: "", mutation_number: "",
  tenant_name_rent: "", other_rights: "", pending_mutations: "", last_mutation: "",
  old_mutations: "", boundary_survey: "",
};

const inputCls = "w-full border-none outline-none bg-transparent text-gray-900 placeholder-gray-300 text-sm resize-none";
const cellInputCls = "w-full border-none outline-none bg-transparent text-gray-900 text-sm focus:bg-blue-50 rounded px-1 py-0.5 transition-colors";

export default function Form7Page({ onBack, draftId }: Props) {
  const { language, setLanguage, t } = useLanguage('mr');
  const [data, setData] = useState<Form7Data>(EMPTY);
  const [currentDraftId, setCurrentDraftId] = useState<string | undefined>(draftId);
  const [showSave, setShowSave] = useState(false);
  const [draftName, setDraftName] = useState('');
  const [saved, setSaved] = useState(false);
  const nameInputRef = useRef<HTMLInputElement>(null);
  const formCardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (draftId) {
      const d = getDraft(draftId);
      if (d && d.formType === 'form7') {
        setData(d.data as Form7Data);
        setDraftName(d.name);
        setCurrentDraftId(d.id);
      }
    }
  }, [draftId]);

  useEffect(() => {
    if (showSave) setTimeout(() => nameInputRef.current?.focus(), 50);
  }, [showSave]);

  function set(field: keyof Form7Data, value: string) {
    setData((prev) => ({ ...prev, [field]: value }));
  }

  function handleSave() {
    const name = draftName.trim() || `Form 7 – ${data.village || 'Untitled'} – ${new Date().toLocaleDateString('en-IN')}`;
    const draft = saveDraft({ id: currentDraftId, formType: 'form7', name, data });
    setCurrentDraftId(draft.id);
    setDraftName(draft.name);
    setShowSave(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  }

  function handleSaveAsPdf() {
    window.print();
  }

  return (
    <div className="df-print-root">
      {/* Nav bar */}
      <div className="df-no-print flex items-center justify-between mb-4 bg-white p-3 rounded-lg shadow-sm border border-gray-200 gap-3 flex-wrap">
        <button onClick={onBack} className="flex items-center text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors">
          <ArrowLeft className="w-4 h-4 mr-2" />{t('back')}
        </button>
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center space-x-1 bg-gray-100 p-1 rounded-md">
            {(['en', 'hi', 'mr'] as Language[]).map((lang) => (
              <button key={lang} onClick={() => setLanguage(lang)}
                className={`px-3 py-1.5 text-sm font-medium rounded-sm transition-colors ${language === lang ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>
                {lang === 'en' ? 'English' : lang === 'hi' ? 'हिंदी' : 'मराठी'}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-2 border-l border-gray-200 pl-3">
            <button onClick={printBlank} className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors">
              <FileText className="w-4 h-4" /> Print Blank
            </button>
            <button onClick={printWithData} className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-white bg-gray-800 rounded-md hover:bg-gray-700 transition-colors">
              <Printer className="w-4 h-4" /> Print with Data
            </button>
            <button onClick={handleSaveAsPdf} className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-white bg-green-700 rounded-md hover:bg-green-800 transition-colors">
              <Printer className="w-4 h-4" /> Save as PDF
            </button>
          </div>
          <div className="border-l border-gray-200 pl-3">
            {showSave ? (
              <div className="flex items-center gap-2">
                <input ref={nameInputRef} className="px-2 py-1.5 text-sm border border-gray-300 rounded-md outline-none focus:border-blue-400 w-52"
                  placeholder="Draft name…" value={draftName} onChange={(e) => setDraftName(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') handleSave(); if (e.key === 'Escape') setShowSave(false); }} />
                <button onClick={handleSave} className="px-3 py-1.5 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700">Save</button>
                <button onClick={() => setShowSave(false)} className="px-2 py-1.5 text-sm text-gray-500 border border-gray-200 rounded-md hover:bg-gray-50">Cancel</button>
              </div>
            ) : (
              <button onClick={() => setShowSave(true)}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${saved ? 'text-green-700 bg-green-50 border border-green-200' : 'text-blue-700 bg-blue-50 border border-blue-200 hover:bg-blue-100'}`}>
                {saved ? <Check className="w-4 h-4" /> : <Save className="w-4 h-4" />}
                {saved ? 'Saved!' : 'Save Draft'}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Form card */}
      <div ref={formCardRef} className="bg-white p-8 shadow-sm border border-gray-300 rounded-sm df-print-form-card">
        <div className="text-center mb-6">
          <h2 className="text-xl font-bold text-gray-900 mb-1">{t('authority')}</h2>
          <h1 className="text-lg font-bold text-gray-900 mb-1">{t('form_title')}</h1>
          <p className="text-sm text-gray-700">{t('legal_basis')}</p>
        </div>
        <div className="overflow-x-auto">
          {/* Header Table */}
          <table className="w-full border-collapse border border-black text-sm mb-6">
            <tbody>
              <tr>
                {([ ['village', t('village')], ['taluka', t('taluka')], ['district', t('district')] ] as [keyof Form7Data, string][]).map(([field, label]) => (
                  <td key={field} className="border border-black p-2 bg-gray-50 w-1/3">
                    <span className="block font-semibold mb-1">{label}</span>
                    <input className={cellInputCls} value={data[field]} onChange={(e) => set(field, e.target.value)} placeholder="..." />
                  </td>
                ))}
              </tr>
              <tr>
                {([ ['gat_number', t('gat_number')], ['tenure_type', t('tenure_type')], ['local_name', t('local_name')] ] as [keyof Form7Data, string][]).map(([field, label]) => (
                  <td key={field} className="border border-black p-2 bg-gray-50 w-1/3">
                    <span className="block font-semibold mb-1">{label}</span>
                    <input className={cellInputCls} value={data[field]} onChange={(e) => set(field, e.target.value)} placeholder="..." />
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
          {/* Main Table */}
          <table className="w-full border-collapse border border-black text-sm">
            <thead>
              <tr className="bg-gray-50 text-center align-top">
                <th className="border border-black p-2 w-[25%]">{t('area_unit_assessment')}</th>
                <th className="border border-black p-2 w-[10%]">{t('account_number')}</th>
                <th className="border border-black p-2 w-[15%]">{t('occupant_name')}</th>
                <th className="border border-black p-2 w-[7%]">{t('area')}</th>
                <th className="border border-black p-2 w-[7%]">{t('assessment')}</th>
                <th className="border border-black p-2 w-[5%]">{t('potkharaba')}</th>
                <th className="border border-black p-2 w-[10%]">{t('mutation_number')}</th>
                <th className="border border-black p-2 w-[21%]">{t('tenancy_rights')}</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="border border-black p-0 align-top">
                  <table className="w-full h-full border-collapse">
                    <tbody>
                      <tr><td colSpan={2} className="border-b border-black p-1 font-semibold text-xs">{t('area_unit_label')}</td></tr>
                      <tr className="bg-gray-50"><td colSpan={2} className="border-b border-black p-1 font-semibold text-center text-xs">{t('cultivable_area_heading')}</td></tr>
                      {([ ['jirayat', t('jirayat')], ['bagayat', t('bagayat')], ['tari', t('tari')] ] as [keyof Form7Data, string][]).map(([field, label]) => (
                        <tr key={field}><td className="border-b border-r border-black p-1 w-[55%] text-xs">{label}</td><td className="border-b border-black p-1"><input className={inputCls} value={data[field]} onChange={(e) => set(field, e.target.value)} /></td></tr>
                      ))}
                      <tr className="bg-gray-50 font-semibold"><td className="border-b border-r border-black p-1 text-xs">{t('sub_total')}</td><td className="border-b border-black p-1"><input className={inputCls} value={data.sub_total} onChange={(e) => set('sub_total', e.target.value)} /></td></tr>
                      <tr className="bg-gray-50 font-semibold"><td className="border-b border-r border-black p-1 text-xs">{t('net_cultivable')}</td><td className="border-b border-black p-1"><input className={inputCls} value={data.net_cultivable} onChange={(e) => set('net_cultivable', e.target.value)} /></td></tr>
                      <tr className="bg-gray-50"><td colSpan={2} className="border-b border-black p-1 font-semibold text-center text-xs">{t('potkharaba_heading')}</td></tr>
                      <tr className="bg-gray-50"><td colSpan={2} className="border-b border-black p-1 text-center text-xs italic">{t('uncultivable_subtitle')}</td></tr>
                      {([ ['class_a', t('class_a')], ['class_b', t('class_b')] ] as [keyof Form7Data, string][]).map(([field, label]) => (
                        <tr key={field}><td className="border-b border-r border-black p-1 text-xs">{label}</td><td className="border-b border-black p-1"><input className={inputCls} value={data[field]} onChange={(e) => set(field, e.target.value)} /></td></tr>
                      ))}
                      <tr className="bg-gray-50 font-semibold"><td className="border-b border-r border-black p-1 text-xs">{t('potkhrab_class_total')}</td><td className="border-b border-black p-1"><input className={inputCls} value={data.class_total} onChange={(e) => set('class_total', e.target.value)} /></td></tr>
                      <tr className="bg-gray-50 font-semibold"><td className="border-b border-r border-black p-1 text-xs">{t('potkhrab_total')}</td><td className="border-b border-black p-1"><input className={inputCls} value={data.potkhrab_total} onChange={(e) => set('potkhrab_total', e.target.value)} /></td></tr>
                      <tr className="bg-gray-50 font-bold"><td className="border-b border-r border-black p-1 text-xs">{t('grand_total')}</td><td className="border-b border-black p-1"><input className={inputCls} value={data.grand_total} onChange={(e) => set('grand_total', e.target.value)} /></td></tr>
                      <tr><td className="border-b border-r border-black p-1 text-xs">{t('revenue_assessment')}</td><td className="border-b border-black p-1"><input className={inputCls} value={data.revenue_assessment} onChange={(e) => set('revenue_assessment', e.target.value)} /></td></tr>
                      <tr><td className="border-r border-black p-1 text-xs">{t('judi_special')}</td><td className="p-1"><input className={inputCls} value={data.judi_special} onChange={(e) => set('judi_special', e.target.value)} /></td></tr>
                    </tbody>
                  </table>
                </td>
                <td className="border border-black p-2 align-top"><textarea className={`${inputCls} min-h-[200px]`} value={data.account_number} onChange={(e) => set('account_number', e.target.value)} /></td>
                <td className="border border-black p-2 align-top"><textarea className={`${inputCls} min-h-[200px]`} value={data.occupant_name} onChange={(e) => set('occupant_name', e.target.value)} /></td>
                <td className="border border-black p-2 align-top"><textarea className={`${inputCls} min-h-[200px]`} value={data.area} onChange={(e) => set('area', e.target.value)} /></td>
                <td className="border border-black p-2 align-top"><textarea className={`${inputCls} min-h-[200px]`} value={data.assessment} onChange={(e) => set('assessment', e.target.value)} /></td>
                <td className="border border-black p-2 align-top"><textarea className={`${inputCls} min-h-[200px]`} value={data.potkharaba} onChange={(e) => set('potkharaba', e.target.value)} /></td>
                <td className="border border-black p-2 align-top"><textarea className={`${inputCls} min-h-[200px]`} value={data.mutation_number} onChange={(e) => set('mutation_number', e.target.value)} /></td>
                <td className="border border-black p-0 align-top">
                  <table className="w-full h-full border-collapse">
                    <tbody>
                      <tr className="bg-gray-50"><td className="border-b border-black p-2 font-semibold text-xs">{t('tenant_name_rent')}</td></tr>
                      <tr><td className="border-b border-black p-2"><textarea className={`${inputCls} min-h-[60px]`} value={data.tenant_name_rent} onChange={(e) => set('tenant_name_rent', e.target.value)} /></td></tr>
                      <tr className="bg-gray-50"><td className="border-b border-black p-2 font-semibold text-xs">{t('other_rights')}</td></tr>
                      <tr><td className="border-b border-black p-2"><textarea className={`${inputCls} min-h-[60px]`} value={data.other_rights} onChange={(e) => set('other_rights', e.target.value)} /></td></tr>
                      <tr className="bg-gray-50"><td className="border-b border-black p-2 font-semibold text-xs">{t('pending_mutations')}</td></tr>
                      <tr><td className="border-b border-black p-2"><input className={cellInputCls} value={data.pending_mutations} onChange={(e) => set('pending_mutations', e.target.value)} placeholder={t('none')} /></td></tr>
                      <tr className="bg-gray-50"><td className="border-b border-black p-2 font-semibold text-xs">{t('last_mutation')}</td></tr>
                      <tr><td className="p-2"><input className={cellInputCls} value={data.last_mutation} onChange={(e) => set('last_mutation', e.target.value)} /></td></tr>
                    </tbody>
                  </table>
                </td>
              </tr>
            </tbody>
          </table>
          {/* Footer Table */}
          <table className="w-full border-collapse border border-black text-sm mt-6">
            <tbody>
              <tr>
                <td className="border border-black p-2 w-1/2 align-top">
                  <span className="block font-semibold mb-2 bg-gray-50 inline-block px-2 py-1 border border-black text-xs">{t('old_mutations')}</span>
                  <textarea className={`${inputCls} min-h-[60px] block mt-1`} value={data.old_mutations} onChange={(e) => set('old_mutations', e.target.value)} />
                </td>
                <td className="border border-black p-2 w-1/2 align-top">
                  <span className="block font-semibold mb-2 bg-gray-50 inline-block px-2 py-1 border border-black text-xs">{t('boundary_survey')}</span>
                  <textarea className={`${inputCls} min-h-[60px] block mt-1`} value={data.boundary_survey} onChange={(e) => set('boundary_survey', e.target.value)} />
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
