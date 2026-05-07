import Navbar from '../../components/common/Navbar'
import Sidebar from '../../components/common/Sidebar'

const tips = [
  {
    icon: '🎯',
    title: 'Stream at Peak Hours',
    text: 'Stream during peak hours (7PM – 11PM IST) for maximum viewers. Most audiences are active in the evening, so going live then increases your chances of being discovered.',
  },
  {
    icon: '📱',
    title: 'Promote Before Going Live',
    text: 'Promote your stream on social media 30 mins before going live. Post on Instagram Stories, Twitter/X, and Telegram to alert your followers in advance.',
  },
  {
    icon: '🔑',
    title: 'Save Your Stream Keys',
    text: 'Save all your stream keys once in the Stream Keys page and never paste them again. This saves time and avoids errors every time you go live.',
  },
  {
    icon: '🎬',
    title: 'Keep Videos Short',
    text: 'Keep videos under 30 mins for better viewer retention. Shorter, focused content keeps your audience engaged till the end.',
  },
  {
    icon: '🎙️',
    title: 'Good Audio Matters More',
    text: 'Viewers tolerate bad video but not bad audio. Use a decent microphone or headset to ensure your voice is clear and professional.',
  },
  {
    icon: '📊',
    title: 'Track Your Performance',
    text: 'Check your stream history regularly to understand what worked. Look at which platforms got more engagement and double down on those.',
  },
  {
    icon: '🔁',
    title: 'Be Consistent',
    text: 'Stream on a regular schedule so your audience knows when to expect you. Consistency builds a loyal viewer base over time.',
  },
  {
    icon: '💬',
    title: 'Engage With Your Viewers',
    text: 'Read and respond to comments during your stream. Engagement makes viewers feel seen and increases the chance they return.',
  },
]

export default function StreamingTipsPage() {
  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <Navbar />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-8">
          <h1 className="text-3xl font-bold mb-1">💡 Streaming Tips</h1>
          <p className="text-gray-400 mb-8">
            Follow these tips to grow your audience and stream like a pro.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {tips.map((tip, i) => (
              <div
                key={i}
                className="bg-gray-900 border border-gray-800 hover:border-purple-600 transition rounded-2xl p-5 flex items-start gap-4"
              >
                <div className="bg-gray-800 rounded-xl p-3 text-2xl leading-none">
                  {tip.icon}
                </div>
                <div>
                  <p className="font-semibold text-white mb-1">{tip.title}</p>
                  <p className="text-sm text-gray-400 leading-relaxed">{tip.text}</p>
                </div>
              </div>
            ))}
          </div>
        </main>
      </div>
    </div>
  )
}