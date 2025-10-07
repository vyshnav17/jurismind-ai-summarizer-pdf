import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Globe, Languages, FileText, Scale } from 'lucide-react';

interface LegalLanguage {
  code: string;
  name: string;
  script: string;
  region: 'indian' | 'international';
  model: 'indic-trans2' | 'mbart' | 'gemini';
}

const SUPPORTED_LEGAL_LANGUAGES: LegalLanguage[] = [
  // Indian Regional Languages (IndicTrans2)
  { code: 'hi', name: 'Hindi', script: 'Devanagari', region: 'indian', model: 'indic-trans2' },
  { code: 'ta', name: 'Tamil', script: 'Tamil', region: 'indian', model: 'indic-trans2' },
  { code: 'te', name: 'Telugu', script: 'Telugu', region: 'indian', model: 'indic-trans2' },
  { code: 'bn', name: 'Bengali', script: 'Bengali', region: 'indian', model: 'indic-trans2' },
  { code: 'mr', name: 'Marathi', script: 'Devanagari', region: 'indian', model: 'indic-trans2' },
  { code: 'gu', name: 'Gujarati', script: 'Gujarati', region: 'indian', model: 'indic-trans2' },
  { code: 'kn', name: 'Kannada', script: 'Kannada', region: 'indian', model: 'indic-trans2' },
  { code: 'ml', name: 'Malayalam', script: 'Malayalam', region: 'indian', model: 'indic-trans2' },
  { code: 'pa', name: 'Punjabi', script: 'Gurmukhi', region: 'indian', model: 'indic-trans2' },
  { code: 'or', name: 'Odia', script: 'Odia', region: 'indian', model: 'indic-trans2' },
  { code: 'as', name: 'Assamese', script: 'Assamese', region: 'indian', model: 'indic-trans2' },
  { code: 'ne', name: 'Nepali', script: 'Devanagari', region: 'indian', model: 'indic-trans2' },
  
  // International Languages (mBART)
  { code: 'en', name: 'English', script: 'Latin', region: 'international', model: 'gemini' },
  { code: 'es', name: 'Spanish', script: 'Latin', region: 'international', model: 'mbart' },
  { code: 'fr', name: 'French', script: 'Latin', region: 'international', model: 'mbart' },
  { code: 'de', name: 'German', script: 'Latin', region: 'international', model: 'mbart' },
  { code: 'it', name: 'Italian', script: 'Latin', region: 'international', model: 'mbart' },
  { code: 'pt', name: 'Portuguese', script: 'Latin', region: 'international', model: 'mbart' },
  { code: 'ru', name: 'Russian', script: 'Cyrillic', region: 'international', model: 'mbart' },
  { code: 'zh', name: 'Chinese', script: 'Han', region: 'international', model: 'mbart' },
  { code: 'ja', name: 'Japanese', script: 'Hiragana/Katakana', region: 'international', model: 'mbart' },
  { code: 'ko', name: 'Korean', script: 'Hangul', region: 'international', model: 'mbart' },
  { code: 'ar', name: 'Arabic', script: 'Arabic', region: 'international', model: 'mbart' },
];

interface MultilingualLanguageSelectorProps {
  onLanguageChange: (language: LegalLanguage) => void;
  onSettingsChange: (settings: MultilingualSettings) => void;
  selectedLanguage: LegalLanguage;
  settings: MultilingualSettings;
}

export interface MultilingualSettings {
  preserveLegalTerms: boolean;
  includeTranslation: boolean;
  jurisdiction: 'indian' | 'international';
  autoDetectLanguage: boolean;
}

export function MultilingualLanguageSelector({
  onLanguageChange,
  onSettingsChange,
  selectedLanguage,
  settings
}: MultilingualLanguageSelectorProps) {
  const [showAdvanced, setShowAdvanced] = useState(false);

  const indianLanguages = SUPPORTED_LEGAL_LANGUAGES.filter(lang => lang.region === 'indian');
  const internationalLanguages = SUPPORTED_LEGAL_LANGUAGES.filter(lang => lang.region === 'international');

  const handleLanguageSelect = (languageCode: string) => {
    const language = SUPPORTED_LEGAL_LANGUAGES.find(lang => lang.code === languageCode);
    if (language) {
      onLanguageChange(language);
    }
  };

  const handleSettingChange = (key: keyof MultilingualSettings, value: boolean | string) => {
    onSettingsChange({
      ...settings,
      [key]: value
    });
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Globe className="h-5 w-5" />
          Multilingual Legal Processing
        </CardTitle>
        <CardDescription>
          Select language and configure advanced multilingual settings for legal document processing
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Language Selection */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Languages className="h-4 w-4" />
            <Label className="text-sm font-medium">Target Language</Label>
          </div>
          
          <Select value={selectedLanguage.code} onValueChange={handleLanguageSelect}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select target language" />
            </SelectTrigger>
            <SelectContent>
              <div className="p-2">
                <div className="text-xs font-semibold text-muted-foreground mb-2 flex items-center gap-1">
                  <Scale className="h-3 w-3" />
                  Indian Regional Languages
                </div>
                {indianLanguages.map((language) => (
                  <SelectItem key={language.code} value={language.code}>
                    <div className="flex items-center gap-2">
                      <span>{language.name}</span>
                      <Badge variant="secondary" className="text-xs">
                        {language.script}
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        {language.model}
                      </Badge>
                    </div>
                  </SelectItem>
                ))}
              </div>
              <div className="p-2 border-t">
                <div className="text-xs font-semibold text-muted-foreground mb-2 flex items-center gap-1">
                  <Globe className="h-3 w-3" />
                  International Languages
                </div>
                {internationalLanguages.map((language) => (
                  <SelectItem key={language.code} value={language.code}>
                    <div className="flex items-center gap-2">
                      <span>{language.name}</span>
                      <Badge variant="secondary" className="text-xs">
                        {language.script}
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        {language.model}
                      </Badge>
                    </div>
                  </SelectItem>
                ))}
              </div>
            </SelectContent>
          </Select>
        </div>

        {/* Advanced Settings Toggle */}
        <div className="flex items-center justify-between">
          <Label className="text-sm font-medium">Advanced Settings</Label>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowAdvanced(!showAdvanced)}
          >
            {showAdvanced ? 'Hide' : 'Show'} Advanced
          </Button>
        </div>

        {/* Advanced Settings */}
        {showAdvanced && (
          <div className="space-y-4 p-4 border rounded-lg bg-muted/50">
            <div className="space-y-4">
              {/* Auto-detect Language */}
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-sm font-medium">Auto-detect Source Language</Label>
                  <p className="text-xs text-muted-foreground">
                    Automatically detect the language of uploaded documents
                  </p>
                </div>
                <Switch
                  checked={settings.autoDetectLanguage}
                  onCheckedChange={(checked) => handleSettingChange('autoDetectLanguage', checked)}
                />
              </div>

              {/* Include Translation */}
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-sm font-medium">Include Translation</Label>
                  <p className="text-xs text-muted-foreground">
                    Provide full translation alongside summary
                  </p>
                </div>
                <Switch
                  checked={settings.includeTranslation}
                  onCheckedChange={(checked) => handleSettingChange('includeTranslation', checked)}
                />
              </div>

              {/* Preserve Legal Terms */}
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-sm font-medium">Preserve Legal Terms</Label>
                  <p className="text-xs text-muted-foreground">
                    Keep original legal terminology with context
                  </p>
                </div>
                <Switch
                  checked={settings.preserveLegalTerms}
                  onCheckedChange={(checked) => handleSettingChange('preserveLegalTerms', checked)}
                />
              </div>

              {/* Jurisdiction */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">Legal Jurisdiction</Label>
                <Select 
                  value={settings.jurisdiction} 
                  onValueChange={(value: 'indian' | 'international') => handleSettingChange('jurisdiction', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="indian">
                      <div className="flex items-center gap-2">
                        <Scale className="h-4 w-4" />
                        Indian Legal System
                      </div>
                    </SelectItem>
                    <SelectItem value="international">
                      <div className="flex items-center gap-2">
                        <Globe className="h-4 w-4" />
                        International Legal System
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        )}

        {/* Selected Language Info */}
        <div className="p-3 border rounded-lg bg-primary/5">
          <div className="flex items-center gap-2 mb-2">
            <FileText className="h-4 w-4" />
            <span className="text-sm font-medium">Selected Language</span>
          </div>
          <div className="space-y-1 text-sm">
            <div className="flex items-center gap-2">
              <span className="font-medium">{selectedLanguage.name}</span>
              <Badge variant="secondary">{selectedLanguage.script}</Badge>
              <Badge variant="outline">{selectedLanguage.model}</Badge>
            </div>
            <p className="text-muted-foreground">
              {selectedLanguage.region === 'indian' 
                ? 'Indian Regional Language - Optimized for IndicTrans2 model'
                : 'International Language - Optimized for mBART model'
              }
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
