import { useRef, useState, useEffect } from "react";
import AITranslation from "./AITranslation";
import { CopyCheck } from "lucide-react";

export default function AItoolsContainer({
  open,
  onClose,
  input,
  setInput,
  srcLang,
  tgtLang,
  setSrcLang,
  setTgtLang,
}: {
  open: boolean;
  onClose: () => void;
  input: string;
  setInput: (input: string) => void;
  srcLang: string;
  tgtLang: string;
  setSrcLang: (srcLang: string) => void;
  setTgtLang: (tgtLang: string) => void;
}) {
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const wrapperRef = useRef(null);
  const shouldResetLoading = useRef(false);

  const handleClose = () => {
    onClose();
    shouldResetLoading.current = true;
  };

  const handleTransitionEnd = () => {
    if (!open && shouldResetLoading.current) {
      shouldResetLoading.current = false;
      setLoading(false);
    }
  };

  useEffect(() => {
    if (copied) {
      const timer = setTimeout(() => setCopied(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [copied]);

  const translate = async () => {
    const query = `text=${encodeURIComponent(input)}&src=${srcLang}&tgt=${tgtLang}`;

    try {
      const geminiRes = await fetch(`/api/translate/gemini?${query}`);
      const data = await geminiRes.json();
      if (data.translated) return data.translated;
    } catch {}

    return "";
  };

  const handleTranslate = async () => {
    if (!input.trim()) return;
    setLoading(true);

    try {
      const output = await translate();
      if (output) setInput(output);
    } finally {
      handleClose();
    }
  };

  const handleCopy = async () => {
    if (!input.trim()) return;
    setLoading(true);

    try {
      const output = await translate();
      if (output) {
        await navigator.clipboard.writeText(output);
        setCopied(true);
      }
    } finally {
      handleClose();
    }
  };

  return (
    <>
      {/* Copy popup stays independent of loading */}
      {copied && (
        <div
          className="
            absolute left-4 -top-12
            bg-[#31DBBC] text-[#202c33] px-4 py-2 rounded-xl 
            shadow-lg z-20 flex items-center gap-2
          "
        >
          <CopyCheck />
          Copied to clipboard
        </div>
      )}

      <div
        ref={wrapperRef}
        onTransitionEnd={handleTransitionEnd}
        className={`
          absolute left-4 bottom-21 mb-2 z-50
          transition-all duration-200
          ${
            open
              ? "opacity-100 -translate-y-6"
              : "opacity-0 translate-y-0 pointer-events-none"
          }
        `}
        style={{ width: "260px" }}
      >
        <AITranslation
          loading={loading}
          onClose={handleClose}
          input={input}
          srcLang={srcLang}
          tgtLang={tgtLang}
          setSrcLang={setSrcLang}
          setTgtLang={setTgtLang}
          handleTranslate={handleTranslate}
          handleCopy={handleCopy}
        />
      </div>
    </>
  );
}
