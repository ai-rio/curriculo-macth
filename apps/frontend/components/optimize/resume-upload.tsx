'use client';

import {
  AlertCircleIcon,
  CheckCircle2Icon,
  Loader2Icon,
  PaperclipIcon,
  UploadIcon,
  XIcon,
} from 'lucide-react';
import React, { useState } from 'react';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { formatBytes, useFileUpload } from '@/hooks/use-file-upload';

interface ResumeUploadProps {
  onUploadSuccess: (resumeId: string, fileName: string) => void;
  onUploadError?: (error: string) => void;
}

const acceptedFileTypes = [
  'application/pdf', // .pdf
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // .docx
];

const acceptString = acceptedFileTypes.join(',');
const API_RESUME_UPLOAD_URL = `${process.env.NEXT_PUBLIC_API_URL}/api/v1/resumes/upload`;

export default function ResumeUpload({ onUploadSuccess, onUploadError }: ResumeUploadProps) {
  const maxSize = 2 * 1024 * 1024; // 2MB

  const [uploadFeedback, setUploadFeedback] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);

  const [
    { files, isDragging, errors: validationOrUploadErrors, isUploadingGlobal },
    {
      handleDragEnter,
      handleDragLeave,
      handleDragOver,
      handleDrop,
      openFileDialog,
      removeFile,
      getInputProps,
      clearErrors,
    },
  ] = useFileUpload({
    maxSize,
    accept: acceptString,
    multiple: false,
    uploadUrl: API_RESUME_UPLOAD_URL,
    onUploadSuccess: (uploadedFile, response) => {
      console.log('Upload successful:', uploadedFile, response);
      // uploadedFile.file is FileMetadata here, as transformed by the hook
      const data = response as Record<string, unknown> & { resume_id?: string };
      const resumeId = typeof data.resume_id === 'string' ? data.resume_id : undefined;

      if (!resumeId) {
        console.error('Missing resume_id in upload response', response);
        const errorMsg = 'Upload succeeded but no resume ID received.';
        setUploadFeedback({
          type: 'error',
          message: errorMsg,
        });
        onUploadError?.(errorMsg);
        return;
      }

      setUploadFeedback({
        type: 'success',
        message: `${uploadedFile.file.name} uploaded successfully!`,
      });
      clearErrors();

      // Call the success callback with resume ID and filename
      onUploadSuccess(resumeId, uploadedFile.file.name);
    },
    onUploadError: (file, errorMsg) => {
      console.error('Upload error:', file, errorMsg);
      const errorMessage = errorMsg || 'An unknown error occurred during upload.';
      setUploadFeedback({
        type: 'error',
        message: errorMessage,
      });
      onUploadError?.(errorMessage);
    },
    onFilesChange: (currentFiles) => {
      if (currentFiles.length === 0) {
        setUploadFeedback(null);
      }
    },
  });

  const currentFile = files[0];

  const handleRemoveFile = (id: string) => {
    removeFile(id);
    setUploadFeedback(null);
  };

  const displayErrors =
    uploadFeedback?.type === 'error' ? [uploadFeedback.message] : validationOrUploadErrors;

  return (
    <Card className="w-full">
      <CardContent className="pt-6">
        <div className="flex flex-col gap-4">
          {/* Upload Area */}
          <div
            role="button"
            tabIndex={!currentFile && !isUploadingGlobal ? 0 : -1}
            onClick={!currentFile && !isUploadingGlobal ? openFileDialog : undefined}
            onKeyDown={(e) => {
              if ((e.key === 'Enter' || e.key === ' ') && !currentFile && !isUploadingGlobal)
                openFileDialog();
            }}
            onDragEnter={!isUploadingGlobal ? handleDragEnter : undefined}
            onDragLeave={!isUploadingGlobal ? handleDragLeave : undefined}
            onDragOver={!isUploadingGlobal ? handleDragOver : undefined}
            onDrop={!isUploadingGlobal ? handleDrop : undefined}
            data-dragging={isDragging || undefined}
            className={`relative rounded-xl border-2 border-dashed transition-all duration-300 ease-in-out
                      ${
                        currentFile || isUploadingGlobal
                          ? 'cursor-not-allowed opacity-70 border-gray-300'
                          : 'cursor-pointer border-gray-400 hover:border-blue-500 hover:bg-blue-50/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2'
                      }
                      ${
                        isDragging && !isUploadingGlobal
                          ? 'border-blue-500 bg-blue-50/50'
                          : 'bg-gray-50/30'
                      }`}
            aria-disabled={Boolean(currentFile) || isUploadingGlobal}
            aria-label={
              currentFile
                ? 'File selected. Remove to upload another.'
                : 'Resume upload dropzone. Drag & drop or click to browse.'
            }
          >
            <div className="flex min-h-48 w-full flex-col items-center justify-center p-6 text-center">
              <input {...getInputProps()} />
              {isUploadingGlobal ? (
                <>
                  <Loader2Icon className="mb-4 size-10 animate-spin text-blue-600" />
                  <p className="text-lg font-semibold text-gray-900">Uploading...</p>
                  <p className="text-sm text-muted-foreground">Your resume is being processed.</p>
                </>
              ) : (
                <>
                  <div className="mb-4 flex size-12 items-center justify-center rounded-full border border-gray-300 bg-white text-gray-500">
                    <UploadIcon className="size-6" />
                  </div>
                  <p className="mb-1 text-lg font-semibold text-gray-900">
                    {currentFile ? 'Resume Ready' : 'Upload Your Resume'}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {currentFile
                      ? currentFile.file.name
                      : `Drag & drop or click (PDF, DOCX up to ${formatBytes(maxSize)})`}
                  </p>
                </>
              )}
            </div>
          </div>

          {/* Error Messages */}
          {displayErrors.length > 0 &&
            !isUploadingGlobal &&
            (!uploadFeedback || uploadFeedback.type === 'error') && (
              <div
                className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-800"
                role="alert"
              >
                <div className="flex items-start gap-2">
                  <AlertCircleIcon className="mt-0.5 size-5 shrink-0" />
                  <div>
                    <p className="font-semibold">Upload Error</p>
                    {displayErrors.map((error, index) => (
                      <p key={index}>{error}</p>
                    ))}
                  </div>
                </div>
              </div>
            )}

          {/* Success Message */}
          {uploadFeedback?.type === 'success' && !isUploadingGlobal && (
            <div
              className="rounded-md border border-green-200 bg-green-50 p-3 text-sm text-green-800"
              role="status"
            >
              <div className="flex items-start gap-2">
                <CheckCircle2Icon className="mt-0.5 size-5 shrink-0" />
                <div>
                  <p className="font-semibold">Upload Successful</p>
                  <p>{uploadFeedback.message}</p>
                </div>
              </div>
            </div>
          )}

          {/* File Details */}
          {currentFile && !isUploadingGlobal && (
            <div className="rounded-xl border border-gray-200 bg-white p-4">
              <div className="flex items-center justify-between gap-3">
                <div className="flex min-w-0 items-center gap-3">
                  <PaperclipIcon className="size-5 shrink-0 text-muted-foreground" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-gray-900">
                      {currentFile.file.name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {formatBytes(currentFile.file.size)} - Uploaded successfully
                    </p>
                  </div>
                </div>
                <Button
                  size="icon"
                  variant="ghost"
                  className="size-8 shrink-0 text-muted-foreground hover:text-red-600"
                  onClick={() => handleRemoveFile(currentFile.id)}
                  aria-label="Remove file"
                  disabled={isUploadingGlobal}
                >
                  <XIcon className="size-5" />
                </Button>
              </div>
            </div>
          )}

          {/* Helper Text */}
          {!currentFile && !isUploadingGlobal && (
            <div className="text-center text-xs text-muted-foreground">
              <p>Supported formats: PDF, DOCX (Maximum size: 2MB)</p>
              <p className="mt-1">
                Your resume will be analyzed and optimized using AI to match job requirements
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
