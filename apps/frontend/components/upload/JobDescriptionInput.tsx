'use client';

import { AlertCircle } from 'lucide-react';
import { useState } from 'react';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { jobDescription } from '@/lib/i18n';

interface JobDescriptionInputProps {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}

const MIN_CHARS = 50;
const MAX_CHARS = 5000;

export function JobDescriptionInput({
  value,
  onChange,
  disabled = false,
}: JobDescriptionInputProps) {
  const [isFocused, setIsFocused] = useState(false);

  const charCount = value.length;
  const isValid = charCount >= MIN_CHARS && charCount <= MAX_CHARS;
  const isTooShort = charCount > 0 && charCount < MIN_CHARS;
  const isTooLong = charCount > MAX_CHARS;

  // Get character count color
  const getCharCountColor = () => {
    if (isTooLong) return 'text-destructive';
    if (isTooShort) return 'text-yellow-600';
    if (isValid) return 'text-green-600';
    return 'text-muted-foreground';
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{jobDescription.title}</CardTitle>
        <CardDescription>{jobDescription.subtitle}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <Label htmlFor="job-description" className="text-sm font-medium">
            {jobDescription.title}
          </Label>
          <Textarea
            id="job-description"
            placeholder={jobDescription.placeholder}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            disabled={disabled}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            className={`min-h-[200px] resize-y ${
              isTooShort || isTooLong ? 'border-yellow-500 focus:border-yellow-500' : ''
            }`}
            maxLength={MAX_CHARS + 100} // Allow typing a bit over to show error
          />

          {/* Character count */}
          <div className="flex items-center justify-between text-xs">
            <div className="text-muted-foreground">
              <span className="font-medium">{jobDescription.minChars}</span>
              <span className="mx-2">•</span>
              <span className="font-medium">{jobDescription.maxChars}</span>
            </div>
            <div className={`font-medium ${getCharCountColor()}`}>
              {jobDescription.charCount(charCount, MAX_CHARS)}
            </div>
          </div>

          {/* Validation messages */}
          {isTooShort && (
            <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-md flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-yellow-600 flex-shrink-0 mt-0.5" />
              <p className="text-xs text-yellow-700">
                A descrição da vaga precisa ter no mínimo {MIN_CHARS} caracteres. Faltam{' '}
                {MIN_CHARS - charCount} caracteres.
              </p>
            </div>
          )}

          {isTooLong && (
            <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-md flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-destructive flex-shrink-0 mt-0.5" />
              <p className="text-xs text-destructive">
                A descrição da vaga ultrapassou o limite de {MAX_CHARS} caracteres. Remova{' '}
                {charCount - MAX_CHARS} caracteres.
              </p>
            </div>
          )}

          {isValid && charCount >= MIN_CHARS + 50 && (
            <div className="text-xs text-green-600">✓ Descrição da vaga válida</div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
