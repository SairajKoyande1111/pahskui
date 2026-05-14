import { useState, useEffect, useRef } from "react";
import { useLanguage } from "../hooks/useLanguage";
import { Language } from "../lib/translations";
import { ArrowLeft, Printer, FileText, Save, Check } from "lucide-react";
import { saveDraft, getDraft, Form12DraftData } from "../lib/drafts";

interface Props { onBack: () => void; draftId?: string; }

const NUM_ROWS = 8;
const NUM_COLS = 16;

function printBlank() { document.body.classList.add('df-print-blank'); window.print(); setTimeout(() => document.body.classList.remove('df-print-blank'), 1500); }
function printWithData() { window.print(); }

const inputCls = "w-full border-none outline-none bg-transparent text-gray-900 text-xs focus:bg-blue-50 rounded transition-colors text-center resize-none";

function emptyGrid(): string[][] {
  return Array.from({ length: NUM_ROWS }, () => Array(NUM_COLS).fill(""));
}

export default function Form12Page({ onBack, draftId }: Props) {
  const { language, setLanguage, t } = useLanguage('mr');
  const [header, setHeader] = useState({ village: "", taluka: "", district: "", gat_number: "" });
  const [grid, setGrid] = useState<string[][]>(emptyGrid);
  const [currentDraftId, setCurrentDraftId] = useState<string | undefined>(draftId);
  const [showSave, setShowSave] = useState(false);
  const [draftName, setDraftName] = useState('');
  const [saved, setSaved] = useState(false);
  const nameInputRef = useRef<HTMLInputElement>(null);
  const formCardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (draftId) {
      const d = getDraft(draftId);
      if (d && d.formType === 'form12') {
        const fd = d.data as Form12DraftData;
        setHeader(fd.header);
        setGrid(fd.grid);
        setDraftName(d.name);
        setCurrentDraftId(d.id);
      }
    }
  }, [draftId]);

  useEffect(() => { if (showSave) setTimeout(() => nameInputRef.current?.focus(), 50); }, [showSave]);

  function setCell(row: number, col: number, value: string) {
    setGrid((prev) => { const next = prev.map((r) => [...r]); next[row][col] = value; return next; });
  }
  function setHeaderField(field: keyof typeof header, value: string) {
    setHeader((prev) => ({ ...prev, [field]: value }));
  }

  function handleSave() {
    const name = draftName.trim() || `Form 12 – ${header.village || 'Untitled'} – ${new Date().toLocaleDateString('en-IN')}`;
    const draft = saveDraft({ id: currentDraftId, formType: 'form12', name, data: { header, grid } });
    setCurrentDraftId(draft.id); setDraftName(draft.name); setShowSave(false); setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  }

  function handleSaveAsPdf() {
    window.print();
  }

  const headerInputCls = "w-full border-none outline-none bg-transparent text-gray-900 text-sm focus:bg-blue-50 rounded px-1 py-0.5 transition-colors";

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
          <h1 className="text-xl font-bold text-gray-900 mb-1">{t('form12_title')}</h1>
          <p className="text-sm text-gray-700">{t('form12_legal_basis')}</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse border border-black text-sm mb-6">
            <tbody>
              <tr>
                {([ ['village', t('village')], ['taluka', t('taluka')], ['district', t('district')], ['gat_number', t('gat_number')] ] as [keyof typeof header, string][]).map(([field, label]) => (
                  <td key={field} className="border border-black p-2 bg-gray-50 w-1/4">
                    <span className="block font-semibold mb-1">{label}</span>
                    <input className={headerInputCls} value={header[field]} onChange={(e) => setHeaderField(field, e.target.value)} placeholder="..." />
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
          <table className="w-full border-collapse border border-black text-xs text-center align-middle">
            <thead>
              <tr className="bg-gray-50">
                <th rowSpan={3} className="border border-black p-1 w-[4%]">{t('year')}</th>
                <th rowSpan={3} className="border border-black p-1 w-[6%]">{t('season')}</th>
                <th rowSpan={3} className="border border-black p-1 w-[6%]">{t('account_number')}</th>
                <th colSpan={9} className="border border-black p-1">{t('crop_area_detail')}</th>
                <th colSpan={2} className="border border-black p-1 w-[12%]">{t('land_not_available')}</th>
                <th rowSpan={3} className="border border-black p-1 w-[8%]">{t('irrigation_source')}</th>
                <th rowSpan={3} className="border border-black p-1 w-[10%]">{t('remarks')}</th>
              </tr>
              <tr className="bg-gray-50">
                <th colSpan={6} className="border border-black p-1">{t('mixed_crop_area')}</th>
                <th colSpan={3} className="border border-black p-1">{t('pure_crop_area')}</th>
                <th rowSpan={2} className="border border-black p-1 font-normal w-[6%]">{t('uncultivable_nature')}</th>
                <th rowSpan={2} className="border border-black p-1 font-normal w-[6%]">{t('uncultivable_area')}</th>
              </tr>
              <tr className="bg-gray-50">
                <th className="border border-black p-1 font-normal w-[4%]">{t('mixture_code')}</th>
                <th className="border border-black p-1 font-normal w-[5%]">{t('irrigated_mixed')}</th>
                <th className="border border-black p-1 font-normal w-[5%]">{t('unirrigated_mixed')}</th>
                <th colSpan={3} className="border border-black p-0">
                  <div className="border-b border-black p-1">{t('component_crops')}</div>
                  <div className="flex w-full">
                    <div className="border-r border-black p-1 flex-1 font-normal">{t('component_crop_name')}</div>
                    <div className="border-r border-black p-1 w-[20%] font-normal">{t('irrigated_component')}</div>
                    <div className="p-1 w-[20%] font-normal">{t('unirrigated_component')}</div>
                  </div>
                </th>
                <th className="border border-black p-1 font-normal w-[8%]">{t('pure_crop_name')}</th>
                <th className="border border-black p-1 font-normal w-[6%]">{t('irrigated_pure')}</th>
                <th className="border border-black p-1 font-normal w-[6%]">{t('unirrigated_pure')}</th>
              </tr>
              <tr className="bg-gray-100 italic text-[10px]">
                <td className="border border-black p-1"></td><td className="border border-black p-1"></td><td className="border border-black p-1"></td>
                <td className="border border-black p-1"></td><td className="border border-black p-1">{t('unit')}</td><td className="border border-black p-1">{t('unit')}</td>
                <td className="border border-black p-1"></td><td className="border border-black p-1">{t('unit')}</td><td className="border border-black p-1">{t('unit')}</td>
                <td className="border border-black p-1"></td><td className="border border-black p-1">{t('unit')}</td><td className="border border-black p-1">{t('unit')}</td>
                <td className="border border-black p-1"></td><td className="border border-black p-1">{t('unit')}</td><td className="border border-black p-1"></td><td className="border border-black p-1"></td>
              </tr>
              <tr className="bg-gray-200 font-medium">
                {['(1)','(2)','(3)','(4)','(5)','(6)','(7)','(8)','(9)','(10)','(11)','(12)','(13)','(14)','(15)',''].map((n, i) => (
                  <td key={i} className="border border-black p-1">{n}</td>
                ))}
              </tr>
            </thead>
            <tbody>
              {grid.map((row, ri) => (
                <tr key={ri} className="h-10">
                  {row.map((cell, ci) => (
                    <td key={ci} className="border border-black p-0.5 align-middle">
                      <input className={inputCls} value={cell} onChange={(e) => setCell(ri, ci, e.target.value)} />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
          <div className="mt-4 p-4 border border-gray-300 bg-gray-50 text-sm rounded-sm">
            <p className="font-semibold mb-2">{t('note')}:</p>
            <ul className="space-y-1 text-gray-700">
              <li>{t('col4_note')}</li><li>{t('col5_note')}</li><li>{t('col6_note')}</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
