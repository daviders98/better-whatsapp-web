interface LangSelectProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  languages: Language[];
}

type Language = {
  language: string;
  code: string;
};

export default function LanguageSelect({
  label,
  value,
  onChange,
  languages,
}: LangSelectProps) {
  return (
    <div className="flex flex-col gap-1 text-gray-200">
      <label className="text-sm font-medium">{label}</label>
      <div className="relative w-40">
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="bg-[#1f2c33] px-2 pr-8 py-1 h-8 rounded-md text-gray-100 text-sm w-full appearance-none"
        >
          {languages.map((lang) => (
            <option key={lang.language} value={lang.language}>
              {lang.language}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
