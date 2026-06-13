import React, { useState } from 'react';
import Sidebar from '../components/Sidebar';
import { Mail, Shield, AlertTriangle, FileText, Info, Send } from 'lucide-react';

export default function StaticPages({ type }) {
  const [formData, setFormData] = useState({ name: '', email: '', subject: '', message: '' });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => {
      setFormData({ name: '', email: '', subject: '', message: '' });
      setSubmitted(false);
      alert('Message sent successfully!');
    }, 1500);
  };

  const renderContent = () => {
    switch (type) {
      case 'about':
        return (
          <div className="flex flex-col gap-6">
            <div className="flex items-center gap-3 text-indigo-600 dark:text-indigo-400">
              <Info className="w-8 h-8" />
              <h1 className="text-3xl font-extrabold font-heading m-0">About Us</h1>
            </div>
            <p className="text-base text-zinc-600 dark:text-zinc-400 leading-relaxed">
              Welcome to <strong>SarkariTrend</strong>, your premier destination for high-quality technology articles, career updates, job notifications, exam reviews, educational guides and trending stories.
            </p>
            <p className="text-base text-zinc-600 dark:text-zinc-400 leading-relaxed">
              Founded in 2026, our mission is to empower developers, technology enthusiasts, and job seekers with accurate, up-to-date, and actionable updates. We specialize in headless CMS integration, exam notifications, career counseling, and web layout configurations to keep you ahead.
            </p>
            <h3 className="text-lg font-bold text-zinc-900 dark:text-white mt-4 font-heading">Our Core Values</h3>
            <ul className="list-disc pl-6 text-zinc-600 dark:text-zinc-400 space-y-2 text-base">
              <li><strong>Quality & Accuracy:</strong> Every guide and job notification we publish is verified from official sources.</li>
              <li><strong>Accessibility:</strong> Complex guidelines and exam formats explained in simple, layman terms.</li>
              <li><strong>Performance & Safety:</strong> Helping users access portal details with secure, optimized, and fast gateway flows.</li>
            </ul>
          </div>
        );
      case 'contact':
        return (
          <div className="flex flex-col gap-6">
            <div className="flex items-center gap-3 text-indigo-600 dark:text-indigo-400">
              <Mail className="w-8 h-8" />
              <h1 className="text-3xl font-extrabold font-heading m-0">Contact Us</h1>
            </div>
            <p className="text-base text-zinc-600 dark:text-zinc-400 leading-relaxed">
              Have questions, feedback, or inquiries? We would love to hear from you. Please fill out the form below or email us directly at <a href="mailto:support@sarkaritrend.news" className="text-indigo-600 hover:underline">support@sarkaritrend.news</a>.
            </p>
            <form onSubmit={handleSubmit} className="flex flex-col gap-4 mt-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="name" className="text-xs font-semibold text-zinc-600 dark:text-zinc-400">Your Name</label>
                  <input
                    id="name"
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-2 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 focus:outline-none focus:ring-2 focus:ring-indigo-600 dark:focus:ring-indigo-400"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="email" className="text-xs font-semibold text-zinc-600 dark:text-zinc-400">Your Email</label>
                  <input
                    id="email"
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-4 py-2 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 focus:outline-none focus:ring-2 focus:ring-indigo-600 dark:focus:ring-indigo-400"
                  />
                </div>
              </div>
              <div className="flex flex-col gap-1.5">
                <label htmlFor="subject" className="text-xs font-semibold text-zinc-600 dark:text-zinc-400">Subject</label>
                <input
                  id="subject"
                  type="text"
                  required
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  className="w-full px-4 py-2 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 focus:outline-none focus:ring-2 focus:ring-indigo-600 dark:focus:ring-indigo-400"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label htmlFor="message" className="text-xs font-semibold text-zinc-600 dark:text-zinc-400">Message</label>
                <textarea
                  id="message"
                  required
                  rows="5"
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  className="w-full px-4 py-2 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 focus:outline-none focus:ring-2 focus:ring-indigo-600 dark:focus:ring-indigo-400"
                ></textarea>
              </div>
              <button
                type="submit"
                disabled={submitted}
                className="mt-2 bg-indigo-600 text-white font-bold py-3.5 px-6 rounded-xl hover:bg-indigo-700 transition-all flex items-center justify-center gap-2"
              >
                {submitted ? 'Sending...' : 'Send Message'} <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        );
      case 'privacy':
        return (
          <div className="flex flex-col gap-6">
            <div className="flex items-center gap-3 text-indigo-600 dark:text-indigo-400">
              <Shield className="w-8 h-8" />
              <h1 className="text-3xl font-extrabold font-heading m-0">Privacy Policy</h1>
            </div>
            <p className="text-base text-zinc-600 dark:text-zinc-400 leading-relaxed">
              At SarkariTrend, accessible from our domain, one of our main priorities is the privacy of our visitors. This Privacy Policy document contains types of information that is collected and recorded by SarkariTrend and how we use it.
            </p>
            <h3 className="text-lg font-bold text-zinc-900 dark:text-white mt-2 font-heading">Log Files</h3>
            <p className="text-base text-zinc-600 dark:text-zinc-400 leading-relaxed">
              SarkariTrend follows a standard procedure of using log files. These files log visitors when they visit websites. All hosting companies do this and a part of hosting services' analytics. The information collected by log files includes internet protocol (IP) addresses, browser type, Internet Service Provider (ISP), date and time stamp, referring/exit pages, and possibly the number of clicks. These are not linked to any information that is personally identifiable.
            </p>
            <h3 className="text-lg font-bold text-zinc-900 dark:text-white mt-2 font-heading">Google DoubleClick DART Cookie</h3>
            <p className="text-base text-zinc-600 dark:text-zinc-400 leading-relaxed">
              Google is one of the third-party vendors on our site. It also uses cookies, known as DART cookies, to serve ads to our site visitors based upon their visit to our site and other sites on the internet. However, visitors may choose to decline the use of DART cookies by visiting the Google ad and content network Privacy Policy at the following URL: <a href="https://policies.google.com/technologies/ads" target="_blank" rel="noreferrer" className="text-indigo-600 hover:underline">https://policies.google.com/technologies/ads</a>.
            </p>
            <h3 className="text-lg font-bold text-zinc-900 dark:text-white mt-2 font-heading">Advertising Partners Privacy Policies</h3>
            <p className="text-base text-zinc-600 dark:text-zinc-400 leading-relaxed">
              Third-party ad servers or ad networks use technologies like cookies, JavaScript, or Web Beacons that are used in their respective advertisements and links that appear on SarkariTrend, which are sent directly to users' browsers. They automatically receive your IP address when this occurs. These technologies are used to measure the effectiveness of their advertising campaigns and/or to personalize the advertising content that you see on websites that you visit.
            </p>
          </div>
        );
      case 'disclaimer':
        return (
          <div className="flex flex-col gap-6">
            <div className="flex items-center gap-3 text-indigo-600 dark:text-indigo-400">
              <AlertTriangle className="w-8 h-8" />
              <h1 className="text-3xl font-extrabold font-heading m-0">Disclaimer</h1>
            </div>
            <p className="text-base text-zinc-600 dark:text-zinc-400 leading-relaxed">
              All the information on this website - SarkariTrend - is published in good faith and for general information purpose only. SarkariTrend does not make any warranties about the completeness, reliability and accuracy of this information.
            </p>
            <p className="text-base text-zinc-600 dark:text-zinc-400 leading-relaxed">
              Any action you take upon the information you find on this website (SarkariTrend), is strictly at your own risk. SarkariTrend will not be liable for any losses and/or damages in connection with the use of our website.
            </p>
            <h3 className="text-lg font-bold text-zinc-900 dark:text-white mt-2 font-heading">External Links Disclaimer</h3>
            <p className="text-base text-zinc-600 dark:text-zinc-400 leading-relaxed">
              From our website, you can visit other websites by following hyperlinks to such external sites. While we strive to provide only quality links to useful and ethical websites, we have no control over the content and nature of these sites. These links to other websites do not imply a recommendation for all the content found on these sites. Site owners and content may change without notice and may occur before we have the opportunity to remove a link which may have gone 'bad'.
            </p>
          </div>
        );
      case 'terms':
        return (
          <div className="flex flex-col gap-6">
            <div className="flex items-center gap-3 text-indigo-600 dark:text-indigo-400">
              <FileText className="w-8 h-8" />
              <h1 className="text-3xl font-extrabold font-heading m-0">Terms & Conditions</h1>
            </div>
            <p className="text-base text-zinc-600 dark:text-zinc-400 leading-relaxed">
              Welcome to SarkariTrend. These terms and conditions outline the rules and regulations for the use of SarkariTrend's Website.
            </p>
            <p className="text-base text-zinc-600 dark:text-zinc-400 leading-relaxed">
              By accessing this website we assume you accept these terms and conditions. Do not continue to use SarkariTrend if you do not agree to take all of the terms and conditions stated on this page.
            </p>
            <h3 className="text-lg font-bold text-zinc-900 dark:text-white mt-2 font-heading">License</h3>
            <p className="text-base text-zinc-600 dark:text-zinc-400 leading-relaxed">
              Unless otherwise stated, SarkariTrend and/or its licensors own the intellectual property rights for all material on SarkariTrend. All intellectual property rights are reserved. You may access this from SarkariTrend for your own personal use subjected to restrictions set in these terms and conditions.
            </p>
            <h3 className="text-lg font-bold text-zinc-900 dark:text-white mt-2 font-heading">You must not:</h3>
            <ul className="list-disc pl-6 text-zinc-600 dark:text-zinc-400 space-y-2 text-base">
              <li>Republish material from SarkariTrend</li>
              <li>Sell, rent or sub-license material from SarkariTrend</li>
              <li>Reproduce, duplicate or copy material from SarkariTrend</li>
              <li>Redistribute content from SarkariTrend</li>
            </ul>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex flex-col lg:flex-row gap-12">
        {/* Main Content Column */}
        <main className="flex-1">
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 sm:p-8 shadow-sm">
            {renderContent()}
          </div>
        </main>
        {/* Sidebar Column */}
        <Sidebar />
      </div>
    </div>
  );
}
