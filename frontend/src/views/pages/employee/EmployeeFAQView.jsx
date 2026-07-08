import React, { useState } from 'react';
import { HelpCircle, ChevronDown, ChevronUp } from 'lucide-react';

const faqs = [
  { question: "I forgot my password. What should I do?", answer: "Click the Forgot Password link on the login page and follow the instructions to reset your password." },
  { question: "How is my password generated?", answer: "A temporary password is automatically generated when your account is created. You should change it after your first login if the system allows." },
  { question: "Can I change my password?", answer: "Yes. You can change your password from your profile or account settings if the feature is available." },
  { question: "Can I check in more than once a day?", answer: "No. The system allows only one check-in and one check-out per working day unless otherwise configured." },
  { question: "What happens if I forget to check in or check out?", answer: "Contact your HR department. HR or the Super Admin can add missed attendance records if approved." },
  { question: "If I forget to check in for the day, what should I do?", answer: "Only HR and Super Admin users have permission to add missed attendance." },
  { question: "If I need to work after checking out for the day, what should I do?", answer: "Working hours are calculated based on your check-in time, check-out time, and recorded break durations. Contact HR if additional work needs to be recorded." },
  { question: "What happens if I forget to click the End Tea Break button?", answer: "Click the Tea Break button before leaving your workstation and end the break when you return. If you forget, contact HR if a correction is required." },
  { question: "Why is my Tea Break button not enabled?", answer: "Verify that you are checked in and not already on a break. If the issue continues, contact HR or the System Administrator." },
  { question: "Can I cancel a leave request?", answer: "Yes. You can cancel a pending leave request before it is approved." },
  { question: "Which file formats are supported for CV upload?", answer: "PDF, DOC, and DOCX formats are generally supported, depending on system configuration." },
  { question: "Is there a file size limit for CV uploads?", answer: "Yes. The maximum file size depends on the system settings." },
  { question: "What should I do if I receive an \"Access Denied\" message?", answer: "Contact your HR department or System Administrator to verify your permissions." },
  { question: "How do I log out?", answer: "Click your profile icon and select Logout to securely end your session." },
  { question: "What happens if my session expires?", answer: "You will be automatically logged out and redirected to the login page for security reasons." },
  { question: "Can I use the system on my mobile phone?", answer: "Yes, if the application supports responsive web design or has a mobile version." },
  { question: "Who should I contact if I experience technical issues?", answer: "Contact your HR department, System Administrator, or IT Support team for assistance." },
  { question: "Why am I unable to log in?", answer: "Ensure your email, password, and selected role are correct. If the issue continues, contact your administrator." },
  { question: "What should I do if I don't receive the OTP?", answer: "Verify your registered mobile number and request that the OTP be resent." },
  { question: "Can I use my old password after changing it?", answer: "No, depending on your organization's password policy." },
  { question: "Why am I automatically logged out?", answer: "Your session expired due to inactivity for security reasons." },
  { question: "Can I update my phone number?", answer: "Yes, if profile editing is permitted." },
  { question: "What time should I check in?", answer: "Follow your organization's assigned working hours." },
  { question: "How can I change my shift?", answer: "You do not have permission to change your shift. Only HR or the Super Admin can modify it." },
  { question: "What happens if the internet disconnects during check-in?", answer: "Verify your attendance history after reconnecting and try again if necessary. If the check-in was not recorded, contact HR." },
  { question: "Can working hours be modified?", answer: "Yes, but only by authorized administrators." },
  { question: "What should I do if I suspect unauthorized access?", answer: "Change your password immediately and contact your System Administrator." },
  { question: "Does the system support mobile devices?", answer: "Yes, if the application is mobile responsive." },
  { question: "Who should I contact for login issues?", answer: "Contact HR or the System Administrator." },
  { question: "Can HR view my uploaded CV?", answer: "Yes. HR can view your uploaded CV as part of the recruitment or employee management process." },
  { question: "Why did my file or image upload fail?", answer: "The file may be too large or in an unsupported format." },
  { question: "Can I cancel my leave request?", answer: "Yes, as long as it has not yet been approved." },
  { question: "Can I edit an approved leave request?", answer: "No. Contact HR if changes are required." },
  { question: "Can I request attendance correction?", answer: "Yes. Contact HR if changes are required" },
  { question: "Can I access the system while on leave?", answer: "Yes" },
  { question: "How can I inform my leave request even pending yet now still there is no acceptance/rejection?", answer: "Contact HR if changes are required." }
];

export function EmployeeFAQView() {
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
              Find answers to common questions about attendance, leave, security, and general system usage below.
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
