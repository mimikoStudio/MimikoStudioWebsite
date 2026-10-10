import { useI18n } from '../i18n/I18nContext';
import { Language } from '../i18n/translations';

export default function LanguageSwitcher() {
  const { language, setLanguage } = useI18n();

  const languages: { code: Language; label: string; native: string }[] = [
    { code: 'en', label: 'English', native: 'English' },
    { code: 'hi', label: 'Hindi', native: 'हिन्दी' },
    { code: 'gu', label: 'Gujarati', native: 'ગુજરાતી' },
  ];

  return (
    <div className="flex items-center gap-2">
      <select
        value={language}
        onChange={(e) => setLanguage(e.target.value as Language)}
        className="px-3 py-1.5 text-sm bg-pearl border border-beige/30 rounded-lg focus:outline-none focus:border-gold transition-colors"
        aria-label="Select language"
      >
        {languages.map((lang) => (
          <option key={lang.code} value={lang.code}>
            {lang.native}
          </option>
        ))}
      </select>
    </div>
  );
}
