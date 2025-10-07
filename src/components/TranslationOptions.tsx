import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Languages } from "lucide-react";

export type Language =
  | "en"
  | "es"
  | "fr"
  | "de"
  | "it"
  | "pt"
  | "zh"
  | "ja"
  | "ar"
  | "hi" // Hindi
  | "bn" // Bengali
  | "ta" // Tamil
  | "te" // Telugu
  | "mr" // Marathi
  | "gu" // Gujarati
  | "kn" // Kannada
  | "ml" // Malayalam
  | "pa" // Punjabi
  | "or"; // Odia

interface TranslationOptionsProps {
  language: Language;
  onLanguageChange: (language: Language) => void;
}

const LANGUAGES = {
  en: "English",
  es: "Spanish",
  fr: "French",
  de: "German",
  it: "Italian",
  pt: "Portuguese",
  zh: "Chinese",
  ja: "Japanese",
  ar: "Arabic",
  hi: "Hindi",
  bn: "Bengali",
  ta: "Tamil",
  te: "Telugu",
  mr: "Marathi",
  gu: "Gujarati",
  kn: "Kannada",
  ml: "Malayalam",
  pa: "Punjabi",
  or: "Odia",
};

export const TranslationOptions = ({
  language,
  onLanguageChange,
}: TranslationOptionsProps) => {
  return (
    <Card className="p-6 shadow-elegant">
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Languages className="w-5 h-5 text-accent" />
          <Label htmlFor="language" className="text-base font-medium">
            Translation Language
          </Label>
        </div>
        <Select value={language} onValueChange={onLanguageChange}>
          <SelectTrigger id="language">
            <SelectValue placeholder="Select language" />
          </SelectTrigger>
          <SelectContent>
            {Object.entries(LANGUAGES).map(([code, name]) => (
              <SelectItem key={code} value={code}>
                {name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <p className="text-xs text-muted-foreground">
          Translate the summary into your preferred language
        </p>
      </div>
    </Card>
  );
};
