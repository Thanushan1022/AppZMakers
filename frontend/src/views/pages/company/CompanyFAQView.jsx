import React, { useState } from 'react';
import { HelpCircle, ChevronDown, ChevronUp } from 'lucide-react';

const faqs = [
  { question: "How will I receive my login credentials?", answer: "Your account is created by the System Administrator, and your login credentials are sent to your registered email address." },
  { question: "I forgot my password. What should I do?", answer: "Click the Forgot Password link on the login page and follow the instructions to reset your password securely." },
  { question: "Can I change my password?", answer: "Yes. You can change your password from the Profile or Account Settings page after logging in." },
  { question: "Why am I unable to log in?", answer: "Ensure your email address, password, and selected role are correct. Also check your internet connection. If the problem continues, contact the System Administrator." },
  { question: "What should I do if I don't receive the OTP?", answer: "Verify your registered email address or mobile number and request a new OTP. If you still do not receive it, contact the System Administrator." },
  { question: "What happens if my session expires while working?", answer: "Unsaved changes may be lost. Save your work frequently and log in again if your session expires." },
  { question: "Can I change my registered email address or phone number?", answer: "Yes, subject to your organization's policies. Contact the System Administrator if you cannot edit these details yourself." },
  { question: "How can I change my assigned employees?", answer: "Navigate to the Projects section to see all projects assigned to your organization or account." },
  { question: "Which file formats are supported for uploads?", answer: "Commonly supported formats include PDF, DOC, DOCX, XLSX, PPTX, JPG, JPEG, PNG, and ZIP files, depending on system configuration." },
  { question: "Is there a file size limit for uploads?", answer: "Yes. The maximum file size is determined by the system administrator and server configuration." },
  { question: "Why did my file upload fail?", answer: "The file may exceed the size limit, be in an unsupported format, or your internet connection may have been interrupted." },
  { question: "Can I download files shared by the project team?", answer: "Yes. You can download any document that has been shared with you and for which you have permission." },
  { question: "Can I generate or download reports?", answer: "Yes. Depending on your permissions, you can download project reports, progress summaries, and other available reports." },
  { question: "Can multiple users from my organization access the portal?", answer: "Yes. Multiple client users can be created with different permission levels, depending on your organization's requirements." },
  { question: "What should I do if I receive an \"Access Denied\" message?", answer: "Your account may not have permission to access that feature. Contact the System Administrator to verify your access rights." },
  { question: "Can I access the portal from my mobile phone or tablet?", answer: "Yes. The portal supports modern web browsers on desktop and mobile devices if responsive access is enabled." },
  { question: "What should I do if I suspect unauthorized access to my account?", answer: "Change your password immediately and notify the System Administrator so your account activity can be reviewed." },
  { question: "Who should I contact if I need assistance?", answer: "Contact your Project Manager, System Administrator, or the organization's Support Team for technical or project-related assistance." }
];

export function CompanyFAQView() {
  const [openIndex, setOpenIndex] = useState(null);

  const toggleFAQ = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className="space-y-6" style={{ fontFamily: 'DM Sans, sans-serif' }}>
      <div className="bg-gradient-to-br from-indigo-600 via-purple-600 to-blue-600 p-8 rounded-3xl text-white shadow-xl shadow-indigo-500/20 relative overflow-hidden group animate-in fade-in slide-in-from-top-4 duration-700">
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-64 h-64 bg-white opacity-10 rounded-full blur-3xl group-hover:scale-110 transition-transform duration-1000"></div>
        <div className="absolute bottom-0 left-0 -mb-10 -ml-10 w-48 h-48 bg-purple-400 opacity-20 rounded-full blur-2xl group-hover:scale-125 transition-transform duration-1000"></div>
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h1 className="text-4xl font-black mb-2 tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-white to-indigo-100 flex items-center gap-3">
              <HelpCircle className="w-10 h-10 text-indigo-100" />
              Frequently Asked Questions
            </h1>
            <p className="text-indigo-100 font-medium text-lg max-w-2xl">
              Find answers to common questions about account management, files, and general system usage below.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 max-w-6xl mx-auto pb-12">
        {faqs.map((faq, index) => (
          <div key={index} className={`group/faq bg-indigo-50/70 dark:bg-slate-800/80 backdrop-blur-sm border ${openIndex === index ? 'border-indigo-400 dark:border-indigo-500 shadow-md shadow-indigo-500/20 scale-[1.01]' : 'border-indigo-100 dark:border-slate-700 hover:border-indigo-300 dark:hover:border-indigo-600 hover:shadow-lg hover:shadow-indigo-500/10 hover:-translate-y-0.5'} rounded-2xl overflow-hidden shadow-sm transition-all duration-300 ease-out animate-in fade-in slide-in-from-bottom-2`} style={{ animationDelay: `${index * 30}ms` }}>
            <button
              onClick={() => toggleFAQ(index)}
              className="w-full px-8 py-6 flex items-center justify-between text-left focus:outline-none transition-colors duration-300 group-hover/faq:bg-indigo-100/60 dark:group-hover/faq:bg-slate-700/60"
            >
              <span className="font-bold text-slate-800 dark:text-slate-100 text-lg pr-6">{index + 1}. {faq.question}</span>
              <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 transition-all duration-500 ease-out transform group-hover/faq:scale-110 group-hover/faq:rotate-180 group-hover/faq:shadow-sm ${openIndex === index ? 'bg-indigo-500 text-white rotate-180' : 'bg-slate-100 text-slate-400 dark:bg-slate-800 dark:text-slate-500 group-hover/faq:bg-indigo-50 group-hover/faq:text-indigo-500 dark:group-hover/faq:bg-indigo-900/50 dark:group-hover/faq:text-indigo-400'}`}>
                {openIndex === index ? <ChevronUp className="w-6 h-6 transition-transform duration-500" /> : <ChevronDown className="w-6 h-6 transition-transform duration-500" />}
              </div>
            </button>
            <div className={`overflow-hidden transition-all duration-300 ease-in-out ${openIndex === index ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}>
              <div className="px-8 pb-6 pt-2 text-slate-600 dark:text-slate-400 text-base leading-relaxed border-t border-slate-100 dark:border-slate-800/50 mx-8 mt-2">
                {faq.answer}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
