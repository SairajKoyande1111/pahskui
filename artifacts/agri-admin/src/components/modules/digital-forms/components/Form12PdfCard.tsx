import { translations } from "../lib/translations";
import { Form12DraftData } from "../lib/drafts";

const T = translations["mr"];
const t = (key: keyof typeof T): string => T[key] ?? key;

const inputCls = "w-full text-gray-900 text-xs min-h-[1em]";
const headerInputCls = "w-full text-gray-900 text-sm px-1 py-0.5 min-h-[1.4em]";

export default function Form12PdfCard({ data }: { data: Form12DraftData }) {
  const { header, grid } = data;
  return (
    <div className="bg-white p-8 border border-gray-300" style={{ width: 1100, fontFamily: "sans-serif" }}>
      <div className="text-center mb-6">
        <h1 className="text-xl font-bold text-gray-900 mb-1">{t("form12_title")}</h1>
        <p className="text-sm text-gray-700">{t("form12_legal_basis")}</p>
      </div>
      <div>
        <table className="w-full border-collapse border border-black text-sm mb-6">
          <tbody>
            <tr>
              {([ ["village", t("village")], ["taluka", t("taluka")], ["district", t("district")], ["gat_number", t("gat_number")] ] as [keyof typeof header, string][]).map(([f, label]) => (
                <td key={f} className="border border-black p-2 bg-gray-50 w-1/4">
                  <span className="block font-semibold mb-1 text-xs">{label}</span>
                  <span className={headerInputCls}>{header[f]}</span>
                </td>
              ))}
            </tr>
          </tbody>
        </table>
        <table className="w-full border-collapse border border-black text-xs text-center align-middle">
          <thead>
            <tr className="bg-gray-50">
              <th rowSpan={3} className="border border-black p-1 w-[4%]">{t("year")}</th>
              <th rowSpan={3} className="border border-black p-1 w-[6%]">{t("season")}</th>
              <th rowSpan={3} className="border border-black p-1 w-[6%]">{t("account_number")}</th>
              <th colSpan={9} className="border border-black p-1">{t("crop_area_detail")}</th>
              <th colSpan={2} className="border border-black p-1 w-[12%]">{t("land_not_available")}</th>
              <th rowSpan={3} className="border border-black p-1 w-[8%]">{t("irrigation_source")}</th>
              <th rowSpan={3} className="border border-black p-1 w-[10%]">{t("remarks")}</th>
            </tr>
            <tr className="bg-gray-50">
              <th colSpan={6} className="border border-black p-1">{t("mixed_crop_area")}</th>
              <th colSpan={3} className="border border-black p-1">{t("pure_crop_area")}</th>
              <th rowSpan={2} className="border border-black p-1 font-normal w-[6%]">{t("uncultivable_nature")}</th>
              <th rowSpan={2} className="border border-black p-1 font-normal w-[6%]">{t("uncultivable_area")}</th>
            </tr>
            <tr className="bg-gray-50">
              <th className="border border-black p-1 font-normal w-[4%]">{t("mixture_code")}</th>
              <th className="border border-black p-1 font-normal w-[5%]">{t("irrigated_mixed")}</th>
              <th className="border border-black p-1 font-normal w-[5%]">{t("unirrigated_mixed")}</th>
              <th colSpan={3} className="border border-black p-0">
                <div className="border-b border-black p-1">{t("component_crops")}</div>
                <div className="flex w-full">
                  <div className="border-r border-black p-1 flex-1 font-normal">{t("component_crop_name")}</div>
                  <div className="border-r border-black p-1 w-[20%] font-normal">{t("irrigated_component")}</div>
                  <div className="p-1 w-[20%] font-normal">{t("unirrigated_component")}</div>
                </div>
              </th>
              <th className="border border-black p-1 font-normal w-[8%]">{t("pure_crop_name")}</th>
              <th className="border border-black p-1 font-normal w-[6%]">{t("irrigated_pure")}</th>
              <th className="border border-black p-1 font-normal w-[6%]">{t("unirrigated_pure")}</th>
            </tr>
            <tr className="bg-gray-100 italic text-[10px]">
              {Array.from({ length: 3 }, (_, i) => <td key={i} className="border border-black p-1"></td>)}
              <td className="border border-black p-1"></td>
              <td className="border border-black p-1">{t("unit")}</td>
              <td className="border border-black p-1">{t("unit")}</td>
              <td className="border border-black p-1"></td>
              <td className="border border-black p-1">{t("unit")}</td>
              <td className="border border-black p-1">{t("unit")}</td>
              <td className="border border-black p-1"></td>
              <td className="border border-black p-1">{t("unit")}</td>
              <td className="border border-black p-1">{t("unit")}</td>
              <td className="border border-black p-1"></td>
              <td className="border border-black p-1">{t("unit")}</td>
              <td className="border border-black p-1"></td>
              <td className="border border-black p-1"></td>
            </tr>
            <tr className="bg-gray-200 font-medium">
              {["(1)","(2)","(3)","(4)","(5)","(6)","(7)","(8)","(9)","(10)","(11)","(12)","(13)","(14)","(15)",""].map((n, i) => (
                <td key={i} className="border border-black p-1">{n}</td>
              ))}
            </tr>
          </thead>
          <tbody>
            {grid.map((row, ri) => (
              <tr key={ri} className="h-8">
                {row.map((cell, ci) => (
                  <td key={ci} className="border border-black p-0.5 align-middle">
                    <span className={inputCls}>{cell}</span>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
        <div className="mt-4 p-4 border border-gray-300 bg-gray-50 text-sm rounded-sm">
          <p className="font-semibold mb-2">{t("note")}:</p>
          <ul className="space-y-1 text-gray-700">
            <li>{t("col4_note")}</li><li>{t("col5_note")}</li><li>{t("col6_note")}</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
