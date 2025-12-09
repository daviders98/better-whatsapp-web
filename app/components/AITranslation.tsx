import { ArrowDownUp, Loader2, X } from "lucide-react";
import { languages } from "../data/languages";

export default function AITranslation({
  loading,
  onClose,
  input,
  srcLang,
  tgtLang,
  setSrcLang,
  setTgtLang,
  handleTranslate,
  handleCopy,
}: {
  loading: boolean;
  onClose: () => void;
  input: string;
  srcLang: string;
  tgtLang: string;
  setSrcLang: (srcLang: string) => void;
  setTgtLang: (tgtLang: string) => void;
  handleTranslate: () => void;
  handleCopy: () => void;
}) {
  return (
    <>
      <div className="bg-[#3b5b6f] p-3 rounded-2xl text-white shadow-xl relative">
        {!loading && (
          <button
            onClick={onClose}
            className="absolute top-2 right-2 text-gray-300 hover:text-white"
          >
            <X className="w-6 h-6" />
          </button>
        )}

        <h2 className="text-md font-semibold text-center mb-2">
          AI Translation
        </h2>

        {loading && (
          <div className="flex justify-center mb-3">
            <Loader2 className="w-6 h-6 animate-spin text-white" />
          </div>
        )}

        {!loading && (
          <>
            <div className="flex flex-col items-center gap-2 w-full">
              <select
                value={srcLang}
                onChange={(e) => setSrcLang(e.target.value)}
                className="bg-[#1f2c33] px-3 py-2 rounded-lg w-full text-sm"
              >
                {languages.map((l) => (
                  <option key={l.language} value={l.language}>
                    {l.language}
                  </option>
                ))}
              </select>

              <button
                onClick={() => {
                  const tmp = srcLang;
                  setSrcLang(tgtLang);
                  setTgtLang(tmp);
                }}
                className="bg-[#1f2c33] p-2 rounded-full h-8 w-8 flex items-center justify-center"
              >
                <ArrowDownUp className="w-4 h-4" />
              </button>

              <select
                value={tgtLang}
                onChange={(e) => setTgtLang(e.target.value)}
                className="bg-[#1f2c33] px-3 py-2 rounded-lg w-full text-sm"
              >
                {languages.map((l) => (
                  <option key={l.language} value={l.language}>
                    {l.language}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex flex-col gap-2 mt-4">
              <button
                disabled={!input.trim()}
                onClick={handleTranslate}
                className="bg-[#31DBBC] text-[#202c33] p-2 rounded-xl hover:cursor-pointer"
              >
                Translate
              </button>

              <button
                disabled={!input.trim()}
                onClick={handleCopy}
                className="bg-[#2b3842] text-white p-2 rounded-xl cursor-pointer"
              >
                Copy
              </button>
            </div>
          </>
        )}
      </div>
    </>
  );
}
