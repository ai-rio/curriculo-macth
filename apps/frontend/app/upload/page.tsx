'use client';

import { ArrowRight, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

import { JobDescriptionInput } from '@/components/upload/JobDescriptionInput';
import { ResumeUpload } from '@/components/upload/ResumeUpload';
import { Button } from '@/components/ui/button';
import { api } from '@/lib/api';
import { common, payment } from '@/lib/i18n';
import { createBrowserClient as createClient } from '@/lib/supabase/client';

export default function UploadPage() {
  const router = useRouter();
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [jobDescription, setJobDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Validation
  const isFormValid =
    resumeFile !== null && jobDescription.length >= 50 && jobDescription.length <= 5000;

  const handleFileSelect = (file: File) => {
    setResumeFile(file);
    setError(null);
  };

  const handleFileRemove = () => {
    setResumeFile(null);
  };

  const handleJobDescriptionChange = (value: string) => {
    setJobDescription(value);
  };

  const handleSubmit = async () => {
    if (!isFormValid) return;

    setIsSubmitting(true);
    setError(null);

    try {
      // Get current user
      const supabase = createClient();
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();

      if (authError || !user) {
        setError(payment.errors.notAuthenticated);
        router.push('/login');
        return;
      }

      // 1. Upload resume to Supabase Storage
      const fileExt = resumeFile!.name.split('.').pop();
      const fileName = `${user.id}/${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('resumes')
        .upload(fileName, resumeFile!, {
          cacheControl: '3600',
          upsert: false,
        });

      if (uploadError) {
        throw new Error(`Erro ao fazer upload do arquivo: ${uploadError.message}`);
      }

      // 2. Create optimization record
      const optimizationResponse = await api.post<{ optimization_id: string; status: string }>(
        '/api/v1/optimizations',
        {
          resume_storage_path: fileName,
          resume_filename: resumeFile!.name,
          job_description: jobDescription,
          user_id: user.id,
        }
      );

      const optimizationId = optimizationResponse.optimization_id;

      // 3. Create Stripe checkout session
      const checkoutResponse = await api.post<{
        session_id: string;
        checkout_url: string;
      }>('/api/v1/payments/create-checkout', {
        optimization_id: optimizationId,
        user_id: user.id,
        user_email: user.email,
        success_url: `${window.location.origin}/payment/success?session_id={CHECKOUT_SESSION_ID}&optimization_id=${optimizationId}`,
        cancel_url: `${window.location.origin}/upload?cancelled=true`,
        amount: 5000, // R$ 50.00
      });

      // 4. Redirect to Stripe Checkout
      window.location.href = checkoutResponse.checkout_url;
    } catch (err: any) {
      console.error('Error submitting form:', err);
      setError(err.message || 'Erro ao processar solicitação. Por favor, tente novamente.');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container max-w-4xl mx-auto py-8 px-4">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Otimizar Currículo</h1>
        <p className="text-muted-foreground">
          Envie seu currículo e a descrição da vaga para receber uma versão otimizada com
          Inteligência Artificial
        </p>
      </div>

      {/* Form */}
      <div className="space-y-6">
        {/* Resume Upload */}
        <ResumeUpload
          onFileSelect={handleFileSelect}
          onFileRemove={handleFileRemove}
          disabled={isSubmitting}
        />

        {/* Job Description */}
        <JobDescriptionInput
          value={jobDescription}
          onChange={handleJobDescriptionChange}
          disabled={isSubmitting}
        />

        {/* Error Message */}
        {error && (
          <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-md">
            <p className="text-sm text-destructive">{error}</p>
          </div>
        )}

        {/* Submit Button */}
        <div className="flex flex-col gap-4">
          <Button
            onClick={handleSubmit}
            disabled={!isFormValid || isSubmitting}
            size="lg"
            className="w-full"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                {payment.processing}
              </>
            ) : (
              <>
                {payment.button}
                <ArrowRight className="w-4 h-4 ml-2" />
              </>
            )}
          </Button>

          <p className="text-xs text-center text-muted-foreground">{payment.securePayment}</p>
        </div>
      </div>

      {/* Info Card */}
      <div className="mt-8 p-6 bg-muted/50 rounded-lg border">
        <h3 className="font-semibold mb-2">Como funciona?</h3>
        <ol className="space-y-2 text-sm text-muted-foreground">
          <li>1. Envie seu currículo em PDF ou DOCX</li>
          <li>2. Cole a descrição completa da vaga desejada</li>
          <li>3. Realize o pagamento seguro via Stripe (R$ 50,00)</li>
          <li>4. Aguarde alguns minutos enquanto a IA otimiza seu currículo</li>
          <li>5. Baixe seu currículo otimizado em formato .docx</li>
        </ol>
      </div>
    </div>
  );
}
