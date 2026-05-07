import { Link } from 'react-router-dom'
import { ArrowLeft, Radio } from 'lucide-react'

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <nav className="bg-gray-900 border-b border-gray-800 px-6 py-4 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <div className="bg-purple-600 p-1.5 rounded-lg"><Radio size={18} /></div>
          <span className="text-xl font-bold text-purple-500">StreamSync</span>
        </Link>
        <Link to="/register" className="flex items-center gap-1 text-gray-400 hover:text-white text-sm transition">
          <ArrowLeft size={15} /> Back to Register
        </Link>
      </nav>

      <main className="max-w-3xl mx-auto px-6 py-12">
        <h1 className="text-4xl font-black mb-2">Terms & Conditions</h1>
        <p className="text-gray-500 text-sm mb-10">Last updated: May 2026</p>

        {[
          {
            title: '1. Acceptance of Terms',
            content: 'By creating an account on StreamSync, you agree to be bound by these Terms and Conditions. If you do not agree to these terms, please do not use our platform.'
          },
          {
            title: '2. Use of the Platform',
            content: 'StreamSync is a multistreaming platform that allows users to stream pre-recorded videos to multiple platforms simultaneously. You agree to use the platform only for lawful purposes and in accordance with these terms.'
          },
          {
            title: '3. User Accounts',
            content: 'You are responsible for maintaining the confidentiality of your account credentials. You agree to notify us immediately of any unauthorized use of your account. StreamSync reserves the right to terminate accounts that violate our policies.'
          },
          {
            title: '4. Content Policy',
            content: 'You are solely responsible for the content you stream through StreamSync. You must not stream content that is illegal, harmful, threatening, abusive, harassing, defamatory, or otherwise objectionable. StreamSync reserves the right to remove any content that violates this policy.'
          },
          {
            title: '5. Stream Keys & Platform Credentials',
            content: 'You are responsible for the security of your stream keys and platform credentials stored on StreamSync. We encrypt sensitive data but cannot guarantee absolute security. Never share your stream keys with unauthorized parties.'
          },
          {
            title: '6. Service Availability',
            content: 'StreamSync strives to maintain high availability but does not guarantee uninterrupted service. We are not liable for any losses resulting from service downtime, streaming failures, or technical issues with third-party platforms.'
          },
          {
            title: '7. Privacy',
            content: 'We collect minimal personal information necessary to provide our services including your name, email address, and streaming preferences. We do not sell your personal data to third parties. Your stream keys are stored securely and are only used to facilitate your streams.'
          },
          {
            title: '8. Account Termination',
            content: 'StreamSync administrators reserve the right to terminate or suspend any account that violates these terms. Users will be notified via email upon account termination along with the reason for termination.'
          },
          {
            title: '9. Third-Party Platforms',
            content: 'StreamSync integrates with third-party streaming platforms (YouTube, Twitch, Kick, etc.). Your use of these platforms is subject to their respective terms of service. StreamSync is not responsible for changes to third-party platform APIs or policies.'
          },
          {
            title: '10. Changes to Terms',
            content: 'StreamSync reserves the right to modify these terms at any time. Users will be notified of significant changes. Continued use of the platform after changes constitutes acceptance of the new terms.'
          },
          {
            title: '11. Contact',
            content: 'If you have any questions about these Terms & Conditions, please contact us through the platform\'s support channels.'
          },
        ].map(section => (
          <div key={section.title} className="mb-8">
            <h2 className="text-lg font-bold text-purple-400 mb-3">{section.title}</h2>
            <p className="text-gray-400 leading-relaxed">{section.content}</p>
          </div>
        ))}

        <div className="mt-12 pt-8 border-t border-gray-800 text-center">
          <Link
            to="/register"
            className="bg-purple-600 hover:bg-purple-500 text-white font-bold px-8 py-3 rounded-xl transition inline-block"
          >
            I've read the terms — Back to Register
          </Link>
        </div>
      </main>
    </div>
  )
}