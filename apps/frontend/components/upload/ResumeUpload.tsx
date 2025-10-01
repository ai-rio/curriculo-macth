'use client';

import { AlertCircle, CheckCircle2, FileText, Upload, X } from 'lucide-react';
import { useState } from 'react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { upload } from '@/lib/i18n';
import { formatFileSize } from '@/lib/i18n';

interface ResumeUploadProps {
  onFileSelect: (file: File) => void;
  onFileRemove: () => void;
  disabled?: boolean;
}

const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2MB
const ACCEPTED_FILE_TYPES = [
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
];

export function ResumeUpload({ onFileSelect, onFileRemove, disabled = false }: ResumeUploadProps) {
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const validateFile = (file: File): string | null => {
    if (!ACCEPTED_FILE_TYPES.includes(file.type)) {
      return upload.invalidType;
    }
    if (file.size > MAX_FILE_SIZE) {
      return upload.tooLarge;
    }
    return null;
  };

  const handleFile = (file: File) => {
    setError(null);

    const validationError = validateFile(file);
    if (validationError) {
      setError(validationError);
      return;
    }

    // Simulate upload progress
    setUploadProgress(0);
    const interval = setInterval(() => {
      setUploadProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + 10;
      });
    }, 100);

    setTimeout(() => {
      setUploadedFile(file);
      onFileSelect(file);
    }, 1000);
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      handleFile(file);
    }
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragging(false);

    const file = event.dataTransfer.files[0];
    if (file) {
      handleFile(file);
    }
  };

  const handleRemoveFile = () => {
    setUploadedFile(null);
    setUploadProgress(0);
    setError(null);
    onFileRemove();
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{upload.title}</CardTitle>
        <CardDescription>{upload.subtitle}</CardDescription>
      </CardHeader>
      <CardContent>
        {!uploadedFile ? (
          <>
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={`
                border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors
                ${isDragging ? 'border-primary bg-primary/5' : 'border-muted-foreground/25'}
                ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:border-primary hover:bg-primary/5'}
              `}
            >
              <input
                type="file"
                accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                onChange={handleFileChange}
                disabled={disabled}
                className="hidden"
                id="resume-file-input"
              />
              <label htmlFor="resume-file-input" className="cursor-pointer">
                <div className="flex flex-col items-center gap-4">
                  <Upload className="w-12 h-12 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">{upload.dragDrop}</p>
                    <p className="text-xs text-muted-foreground mt-1">{upload.formats}</p>
                  </div>
                  {!disabled && (
                    <Button type="button" variant="outline" size="sm">
                      {upload.button}
                    </Button>
                  )}
                </div>
              </label>
            </div>

            {uploadProgress > 0 && uploadProgress < 100 && (
              <div className="mt-4">
                <p className="text-sm text-muted-foreground mb-2">{upload.uploading}</p>
                <Progress value={uploadProgress} className="w-full" />
              </div>
            )}

            {error && (
              <div className="mt-4 p-3 bg-destructive/10 border border-destructive/20 rounded-md flex items-start gap-2">
                <AlertCircle className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
                <p className="text-sm text-destructive">{error}</p>
              </div>
            )}
          </>
        ) : (
          <div className="border rounded-lg p-4 bg-muted/50">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <div className="flex-shrink-0">
                  <FileText className="w-10 h-10 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{uploadedFile.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {formatFileSize(uploadedFile.size)}
                  </p>
                </div>
                <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0" />
              </div>
              {!disabled && (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={handleRemoveFile}
                  className="ml-2 flex-shrink-0"
                >
                  <X className="w-4 h-4" />
                </Button>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
