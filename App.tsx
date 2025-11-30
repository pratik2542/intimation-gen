import React, { useState, useEffect, useCallback } from 'react';
import { parseMessageToData } from './services/gemini';
import { AppStep, ExtractedData, EmailConfig } from './types';
import { InputField } from './components/InputField';
import {
  ClipboardDocumentCheckIcon,
  PaperAirplaneIcon,
  ArrowPathIcon,
  SparklesIcon,
  PencilSquareIcon
} from '@heroicons/react/24/outline';

// Default constants
const DEFAULT_TO = "dharmendra.joshi@paramounttpa.com, contact.phs@paramounttpa.com, claim.intimation@paramounttpa.com";
const DEFAULT_BCC = "Mahipatsinh Gohel <mpgohel2016@gmail.com>";

export default function App() {
  const [step, setStep] = useState<AppStep>(AppStep.INPUT);
  const [rawText, setRawText] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form State for Review
  const [formData, setFormData] = useState<ExtractedData>({
    policyNo: '',
    insuredName: '',
    patientName: '',
    patientRelation: '',
    doa: '',
    disease: '',
    mobile: '',
    doctorHospital: ''
  });

  const [emailConfig, setEmailConfig] = useState<Omit<EmailConfig, 'body' | 'subject'>>({
    to: DEFAULT_TO,
    cc: '',
    bcc: DEFAULT_BCC
  });

  // Derived state for Subject and Body
  const generateSubject = useCallback((data: ExtractedData) => {
    let patientStr = data.patientName;
    if (data.patientRelation && data.patientRelation.toLowerCase() !== 'self') {
        // e.g., (Namitaben ~ Wife)
        patientStr = `${data.patientName} ~ ${data.patientRelation}`;
    }
    
    // Ensure patientStr is wrapped in parens if it isn't empty
    const patientDisplay = patientStr ? `(${patientStr})` : '';
    
    return `INTIMATION OF ${data.insuredName} ${patientDisplay} ${data.disease}`;
  }, []);

  const generateBody = useCallback((data: ExtractedData) => {
    // Construct patient name logic for body
    let displayPatientName = data.patientName;
    if (data.patientRelation && data.patientRelation.toLowerCase() !== 'self') {
       // Based on Example 2: "Nben ~ Wife". We will use the full name extracted for now.
       displayPatientName = `${data.patientName} ~ ${data.patientRelation}`;
    }

    return `DEAR SIRS,

Paramount TPA
AHMEDABAD.

PLEASE NOTE THIS INTIMATION

INSURED NAME : ${data.insuredName}

POLICY NO. : ${data.policyNo}

PATIENT NAME : ${displayPatientName}

DOA. : ${data.doa}

DISEASE : ${data.disease}

Mo.no. ${data.mobile}

NAME : ${data.doctorHospital}`;
  }, []);

  const handleParse = async () => {
    if (!rawText.trim()) return;
    
    setLoading(true);
    setError(null);
    try {
      const extracted = await parseMessageToData(rawText);
      setFormData(extracted);
      setStep(AppStep.REVIEW);
    } catch (e) {
      console.error(e);
      setError("Failed to process the text. Please try again or fill manually.");
    } finally {
      setLoading(false);
    }
  };

  const handleSendMail = () => {
    const subject = generateSubject(formData);
    const body = generateBody(formData);
    
    const mailtoLink = `mailto:${emailConfig.to}?cc=${emailConfig.cc}&bcc=${emailConfig.bcc}&subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.open(mailtoLink, '_self');
  };

  const handleCopyToClipboard = () => {
     const subject = generateSubject(formData);
     const body = generateBody(formData);
     const fullText = `Subject: ${subject}\n\n${body}`;
     navigator.clipboard.writeText(fullText).then(() => {
        alert("Email content copied to clipboard!");
     });
  };

  const handleReset = () => {
    setStep(AppStep.INPUT);
    setRawText("");
    setError(null);
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 text-gray-900 pb-48 md:pb-16">
      {/* Header */}
      <header className="bg-white border-b sticky top-0 z-10 shadow-sm">
        <div className="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-blue-600 text-white p-1.5 rounded-lg">
              <PencilSquareIcon className="w-5 h-5" />
            </div>
            <h1 className="font-bold text-lg tracking-tight">Intimation Gen</h1>
          </div>
          {step === AppStep.REVIEW && (
             <button 
               onClick={handleReset}
               className="text-sm font-medium text-gray-500 hover:text-gray-700 flex items-center gap-1"
             >
               <ArrowPathIcon className="w-4 h-4" /> New
             </button>
          )}
        </div>
      </header>

      <main className="flex-1 w-full max-w-4xl mx-auto p-4 md:p-6">
        
        {/* INPUT STEP */}
        {step === AppStep.INPUT && (
          <div className="flex flex-col h-full gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
              <label className="block text-lg font-semibold mb-2">
                Paste WhatsApp Message
              </label>
              <p className="text-gray-500 text-sm mb-4">
                Paste the unstructured details below. AI will format it for you.
              </p>
              <textarea
                className="w-full h-64 p-4 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none resize-none font-mono text-sm leading-relaxed"
                placeholder={`Policy No.\nName\nPatient Name\nDate of Admission\nDisease\nMobile No.\nDoctor & Hospital\n...`}
                value={rawText}
                onChange={(e) => setRawText(e.target.value)}
              />
            </div>

            {error && (
              <div className="p-4 bg-red-50 text-red-600 rounded-xl text-sm border border-red-100">
                {error}
              </div>
            )}

            <button
              onClick={handleParse}
              disabled={!rawText.trim() || loading}
              className={`
                w-full py-4 rounded-xl font-bold text-lg shadow-lg flex items-center justify-center gap-2 transition-all
                ${!rawText.trim() || loading 
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
                  : 'bg-blue-600 text-white hover:bg-blue-700 hover:scale-[1.01] active:scale-[0.99]'}
              `}
            >
              {loading ? (
                <>
                  <ArrowPathIcon className="w-5 h-5 animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <SparklesIcon className="w-5 h-5" />
                  Generate Email
                </>
              )}
            </button>
          </div>
        )}

        {/* REVIEW STEP */}
        {step === AppStep.REVIEW && (
          <div className="grid md:grid-cols-2 gap-6 animate-in fade-in zoom-in-95 duration-300">
            
            {/* Left Column: Edit Details */}
            <div className="space-y-6">
              <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-200">
                <h3 className="font-bold text-gray-800 mb-4 border-b pb-2">Email Recipients</h3>
                <div className="space-y-4">
                  <InputField 
                    label="To" 
                    value={emailConfig.to} 
                    onChange={(v) => setEmailConfig(prev => ({...prev, to: v}))} 
                  />
                  <InputField 
                    label="Cc" 
                    value={emailConfig.cc} 
                    onChange={(v) => setEmailConfig(prev => ({...prev, cc: v}))} 
                  />
                  <InputField 
                    label="Bcc" 
                    value={emailConfig.bcc} 
                    onChange={(v) => setEmailConfig(prev => ({...prev, bcc: v}))} 
                  />
                </div>
              </div>

              <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-200">
                <h3 className="font-bold text-gray-800 mb-4 border-b pb-2">Edit Details</h3>
                <div className="space-y-4">
                  <InputField 
                    label="Insured Name" 
                    value={formData.insuredName} 
                    onChange={(v) => setFormData(prev => ({...prev, insuredName: v}))} 
                  />
                   <div className="grid grid-cols-2 gap-4">
                    <InputField 
                      label="Policy No" 
                      value={formData.policyNo} 
                      onChange={(v) => setFormData(prev => ({...prev, policyNo: v}))} 
                    />
                    <InputField 
                      label="Mobile No" 
                      value={formData.mobile} 
                      onChange={(v) => setFormData(prev => ({...prev, mobile: v}))} 
                    />
                   </div>
                  <div className="grid grid-cols-2 gap-4">
                    <InputField 
                      label="Patient Name" 
                      value={formData.patientName} 
                      onChange={(v) => setFormData(prev => ({...prev, patientName: v}))} 
                    />
                     <InputField 
                      label="Relation (Optional)" 
                      value={formData.patientRelation || ''} 
                      placeholder="e.g. Wife"
                      onChange={(v) => setFormData(prev => ({...prev, patientRelation: v}))} 
                    />
                  </div>
                  <InputField 
                    label="Date of Admission" 
                    value={formData.doa} 
                    onChange={(v) => setFormData(prev => ({...prev, doa: v}))} 
                  />
                  <InputField 
                    label="Disease / Diagnosis" 
                    value={formData.disease} 
                    onChange={(v) => setFormData(prev => ({...prev, disease: v}))} 
                  />
                  <InputField 
                    label="Doctor & Hospital" 
                    value={formData.doctorHospital} 
                    onChange={(v) => setFormData(prev => ({...prev, doctorHospital: v}))} 
                    multiline
                  />
                </div>
              </div>
            </div>

            {/* Right Column: Preview */}
            <div className="space-y-6">
              <div className="bg-gray-800 text-white p-5 rounded-xl shadow-lg sticky top-20">
                 <div className="flex justify-between items-center mb-4 border-b border-gray-700 pb-4">
                    <h3 className="font-bold tracking-wide">Live Preview</h3>
                    <span className="text-xs bg-gray-700 px-2 py-1 rounded">Read Only</span>
                 </div>

                 {/* Simulated Email Client View */}
                 <div className="space-y-3 font-mono text-sm leading-relaxed text-gray-300">
                    <div>
                      <span className="text-gray-500 block text-xs uppercase">Subject</span>
                      <div className="text-white font-semibold break-words">
                        {generateSubject(formData)}
                      </div>
                    </div>
                    <div className="border-t border-gray-700 my-2"></div>
                    <div className="whitespace-pre-wrap">
                      {generateBody(formData)}
                    </div>
                 </div>
              </div>
            </div>

          </div>
        )}
      </main>

      {/* Floating Action Bar (Mobile/Desktop) for Review Step */}
      {step === AppStep.REVIEW && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t p-4 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)] z-20">
          <div className="max-w-4xl mx-auto flex gap-4">
             <button
              onClick={handleCopyToClipboard}
              className="flex-1 md:flex-none md:w-48 py-3 rounded-xl font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 flex items-center justify-center gap-2 transition-colors"
            >
              <ClipboardDocumentCheckIcon className="w-5 h-5" />
              <span className="hidden md:inline">Copy Text</span>
              <span className="md:hidden">Copy</span>
            </button>
            <button
              onClick={handleSendMail}
              className="flex-[2] py-3 rounded-xl font-bold text-white bg-blue-600 hover:bg-blue-700 flex items-center justify-center gap-2 shadow-lg hover:-translate-y-0.5 transition-all"
            >
              <PaperAirplaneIcon className="w-5 h-5 -rotate-45 mb-1" />
              Open Email App
            </button>
          </div>
        </div>
      )}
    </div>
  );
}