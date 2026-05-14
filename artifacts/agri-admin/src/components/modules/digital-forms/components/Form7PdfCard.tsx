import { translations } from "../lib/translations";
import { Form7Data } from "../lib/drafts";

const T = translations["mr"];
const t = (key: keyof typeof T): string => T[key] ?? key;

const cell = "w-full text-gray-900 text-sm min-h-[1.2em] whitespace-pre-wrap break-words";
const cellHeader = "w-full text-gray-900 text-sm px-1 py-0.5 min-h-[1.4em]";

export default function Form7PdfCard({ data }: { data: Form7Data }) {
  return (
    <div className="bg-white p-8 border border-gray-300" style={{ width: 1100, fontFamily: "sans-serif" }}>
      <div className="text-center mb-6">
        <h2 className="text-xl font-bold text-gray-900 mb-1">{t("authority")}</h2>
        <h1 className="text-lg font-bold text-gray-900 mb-1">{t("form_title")}</h1>
        <p className="text-sm text-gray-700">{t("legal_basis")}</p>
      </div>
      <div>
        <table className="w-full border-collapse border border-black text-sm mb-6">
          <tbody>
            <tr>
              {([ ["village", t("village")], ["taluka", t("taluka")], ["district", t("district")] ] as [keyof Form7Data, string][]).map(([f, label]) => (
                <td key={f} className="border border-black p-2 bg-gray-50 w-1/3">
                  <span className="block font-semibold mb-1 text-xs">{label}</span>
                  <span className={cellHeader}>{data[f]}</span>
                </td>
              ))}
            </tr>
            <tr>
              {([ ["gat_number", t("gat_number")], ["tenure_type", t("tenure_type")], ["local_name", t("local_name")] ] as [keyof Form7Data, string][]).map(([f, label]) => (
                <td key={f} className="border border-black p-2 bg-gray-50 w-1/3">
                  <span className="block font-semibold mb-1 text-xs">{label}</span>
                  <span className={cellHeader}>{data[f]}</span>
                </td>
              ))}
            </tr>
          </tbody>
        </table>
        <table className="w-full border-collapse border border-black text-sm">
          <thead>
            <tr className="bg-gray-50 text-center align-top">
              <th className="border border-black p-2 w-[25%]">{t("area_unit_assessment")}</th>
              <th className="border border-black p-2 w-[10%]">{t("account_number")}</th>
              <th className="border border-black p-2 w-[15%]">{t("occupant_name")}</th>
              <th className="border border-black p-2 w-[7%]">{t("area")}</th>
              <th className="border border-black p-2 w-[7%]">{t("assessment")}</th>
              <th className="border border-black p-2 w-[5%]">{t("potkharaba")}</th>
              <th className="border border-black p-2 w-[10%]">{t("mutation_number")}</th>
              <th className="border border-black p-2 w-[21%]">{t("tenancy_rights")}</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="border border-black p-0 align-top">
                <table className="w-full h-full border-collapse">
                  <tbody>
                    <tr><td colSpan={2} className="border-b border-black p-1 font-semibold text-xs">{t("area_unit_label")}</td></tr>
                    <tr className="bg-gray-50"><td colSpan={2} className="border-b border-black p-1 font-semibold text-center text-xs">{t("cultivable_area_heading")}</td></tr>
                    {([ ["jirayat", t("jirayat")], ["bagayat", t("bagayat")], ["tari", t("tari")] ] as [keyof Form7Data, string][]).map(([f, label]) => (
                      <tr key={f}><td className="border-b border-r border-black p-1 w-[55%] text-xs">{label}</td><td className="border-b border-black p-1"><span className={cell}>{data[f]}</span></td></tr>
                    ))}
                    <tr className="bg-gray-50 font-semibold"><td className="border-b border-r border-black p-1 text-xs">{t("sub_total")}</td><td className="border-b border-black p-1"><span className={cell}>{data.sub_total}</span></td></tr>
                    <tr className="bg-gray-50 font-semibold"><td className="border-b border-r border-black p-1 text-xs">{t("net_cultivable")}</td><td className="border-b border-black p-1"><span className={cell}>{data.net_cultivable}</span></td></tr>
                    <tr className="bg-gray-50"><td colSpan={2} className="border-b border-black p-1 font-semibold text-center text-xs">{t("potkharaba_heading")}</td></tr>
                    <tr className="bg-gray-50"><td colSpan={2} className="border-b border-black p-1 text-center text-xs italic">{t("uncultivable_subtitle")}</td></tr>
                    {([ ["class_a", t("class_a")], ["class_b", t("class_b")] ] as [keyof Form7Data, string][]).map(([f, label]) => (
                      <tr key={f}><td className="border-b border-r border-black p-1 text-xs">{label}</td><td className="border-b border-black p-1"><span className={cell}>{data[f]}</span></td></tr>
                    ))}
                    <tr className="bg-gray-50 font-semibold"><td className="border-b border-r border-black p-1 text-xs">{t("potkhrab_class_total")}</td><td className="border-b border-black p-1"><span className={cell}>{data.class_total}</span></td></tr>
                    <tr className="bg-gray-50 font-semibold"><td className="border-b border-r border-black p-1 text-xs">{t("potkhrab_total")}</td><td className="border-b border-black p-1"><span className={cell}>{data.potkhrab_total}</span></td></tr>
                    <tr className="bg-gray-50 font-bold"><td className="border-b border-r border-black p-1 text-xs">{t("grand_total")}</td><td className="border-b border-black p-1"><span className={cell}>{data.grand_total}</span></td></tr>
                    <tr><td className="border-b border-r border-black p-1 text-xs">{t("revenue_assessment")}</td><td className="border-b border-black p-1"><span className={cell}>{data.revenue_assessment}</span></td></tr>
                    <tr><td className="border-r border-black p-1 text-xs">{t("judi_special")}</td><td className="p-1"><span className={cell}>{data.judi_special}</span></td></tr>
                  </tbody>
                </table>
              </td>
              <td className="border border-black p-2 align-top"><span className={cell}>{data.account_number}</span></td>
              <td className="border border-black p-2 align-top"><span className={cell}>{data.occupant_name}</span></td>
              <td className="border border-black p-2 align-top"><span className={cell}>{data.area}</span></td>
              <td className="border border-black p-2 align-top"><span className={cell}>{data.assessment}</span></td>
              <td className="border border-black p-2 align-top"><span className={cell}>{data.potkharaba}</span></td>
              <td className="border border-black p-2 align-top"><span className={cell}>{data.mutation_number}</span></td>
              <td className="border border-black p-0 align-top">
                <table className="w-full h-full border-collapse">
                  <tbody>
                    <tr className="bg-gray-50"><td className="border-b border-black p-2 font-semibold text-xs">{t("tenant_name_rent")}</td></tr>
                    <tr><td className="border-b border-black p-2"><span className={cell}>{data.tenant_name_rent}</span></td></tr>
                    <tr className="bg-gray-50"><td className="border-b border-black p-2 font-semibold text-xs">{t("other_rights")}</td></tr>
                    <tr><td className="border-b border-black p-2"><span className={cell}>{data.other_rights}</span></td></tr>
                    <tr className="bg-gray-50"><td className="border-b border-black p-2 font-semibold text-xs">{t("pending_mutations")}</td></tr>
                    <tr><td className="border-b border-black p-2"><span className={cell}>{data.pending_mutations || t("none")}</span></td></tr>
                    <tr className="bg-gray-50"><td className="border-b border-black p-2 font-semibold text-xs">{t("last_mutation")}</td></tr>
                    <tr><td className="p-2"><span className={cell}>{data.last_mutation}</span></td></tr>
                  </tbody>
                </table>
              </td>
            </tr>
          </tbody>
        </table>
        <table className="w-full border-collapse border border-black text-sm mt-6">
          <tbody>
            <tr>
              <td className="border border-black p-2 w-1/2 align-top">
                <span className="block font-semibold mb-2 bg-gray-50 inline-block px-2 py-1 border border-black text-xs">{t("old_mutations")}</span>
                <div className={`${cell} mt-1 min-h-[60px]`}>{data.old_mutations}</div>
              </td>
              <td className="border border-black p-2 w-1/2 align-top">
                <span className="block font-semibold mb-2 bg-gray-50 inline-block px-2 py-1 border border-black text-xs">{t("boundary_survey")}</span>
                <div className={`${cell} mt-1 min-h-[60px]`}>{data.boundary_survey}</div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
