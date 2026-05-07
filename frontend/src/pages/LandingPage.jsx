import { Link } from 'react-router-dom'
import { Radio, Zap, Shield, Globe, ChevronRight, Play, Tv, Activity, Users } from 'lucide-react'
import { useEffect, useRef } from 'react'

const platforms = [
  { name: 'YouTube',   color: '#FF0000', bg: 'rgba(255,0,0,0.15)',        dot: '#FF0000' },
  { name: 'Twitch',    color: '#9146FF', bg: 'rgba(145,70,255,0.15)',      dot: '#9146FF' },
  { name: 'Facebook',  color: '#1877F2', bg: 'rgba(24,119,242,0.15)',      dot: '#1877F2' },
  { name: 'Kick',      color: '#53FC18', bg: 'rgba(83,252,24,0.15)',       dot: '#53FC18' },
  { name: 'Rumble',    color: '#85C742', bg: 'rgba(133,199,66,0.15)',      dot: '#85C742' },
  { name: 'Instagram', color: '#E1306C', bg: 'rgba(225,48,108,0.15)',      dot: '#E1306C' },
  { name: 'Telegram',  color: '#229ED9', bg: 'rgba(34,158,217,0.15)',      dot: '#229ED9' },
  { name: 'X',         color: '#ffffff', bg: 'rgba(255,255,255,0.08)',     dot: '#ffffff' },
  { name: 'TikTok',    color: '#ff0050', bg: 'rgba(255,0,80,0.12)',        dot: '#ff0050' },
  { name: 'BIGO',      color: '#f59e0b', bg: 'rgba(245,158,11,0.15)',      dot: '#f59e0b' },
]

// Floating icon positions — scattered around the hero
const floatingIcons = [
  { name: 'YouTube',   color: '#FF0000', top: '12%',  left: '3%',   size: 44, delay: '0s',    dur: '6s'  },
  { name: 'Twitch',    color: '#9146FF', top: '22%',  right: '4%',  size: 38, delay: '1s',    dur: '7s'  },
  { name: 'Facebook',  color: '#1877F2', top: '65%',  left: '2%',   size: 36, delay: '0.5s',  dur: '8s'  },
  { name: 'Kick',      color: '#53FC18', top: '80%',  right: '3%',  size: 34, delay: '1.5s',  dur: '6.5s'},
  { name: 'Instagram', color: '#E1306C', top: '45%',  left: '1%',   size: 32, delay: '2s',    dur: '7.5s'},
  { name: 'Telegram',  color: '#229ED9', top: '55%',  right: '2%',  size: 30, delay: '0.8s',  dur: '9s'  },
  { name: 'Rumble',    color: '#85C742', top: '88%',  left: '6%',   size: 28, delay: '1.2s',  dur: '8s'  },
  { name: 'TikTok',    color: '#ff0050', top: '8%',   right: '8%',  size: 30, delay: '2.5s',  dur: '7s'  },
  { name: 'BIGO',      color: '#f59e0b', top: '75%',  right: '7%',  size: 26, delay: '3s',    dur: '6s'  },
  { name: 'X',         color: '#ffffff', top: '35%',  right: '1%',  size: 28, delay: '1.8s',  dur: '8.5s'},
]

const PlatformIcon = ({ name, color, size }) => {
  const s = size * 0.45
  const labels = {
    YouTube: 'YT', Twitch: 'TV', Facebook: 'FB', Kick: 'KC',
    Rumble: 'RB', Instagram: 'IG', Telegram: 'TG', X: 'X',
    TikTok: 'TK', BIGO: 'BG'
  }
  return (
    <div style={{
      width: size, height: size, borderRadius: '12px',
      background: `rgba(${hexToRgb(color)},0.15)`,
      border: `1.5px solid ${color}50`,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      backdropFilter: 'blur(8px)',
      boxShadow: `0 4px 20px ${color}30`,
    }}>
      <span style={{ fontSize: s, fontWeight: 900, color, lineHeight: 1 }}>{labels[name]}</span>
    </div>
  )
}

function hexToRgb(hex) {
  if (hex === '#ffffff') return '255,255,255'
  const r = parseInt(hex.slice(1,3),16)
  const g = parseInt(hex.slice(3,5),16)
  const b = parseInt(hex.slice(5,7),16)
  return `${r},${g},${b}`
}

const stats = [
  { value: '10+', label: 'Platforms' },
  { value: '2GB',  label: 'Max Upload' },
  { value: '99%',  label: 'Uptime' },
  { value: '∞',   label: 'Streams' },
]

export default function LandingPage() {
  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #0a0a0f 0%, #0d0d1a 50%, #0a0a0f 100%)',
      color: 'white',
      fontFamily: "'Inter', -apple-system, sans-serif",
      overflowX: 'hidden',
    }}>

      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          33%       { transform: translateY(-12px) rotate(2deg); }
          66%       { transform: translateY(-6px) rotate(-1deg); }
        }
        @keyframes marquee {
          0%   { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        @keyframes pulse-dot {
          0%, 100% { opacity: 1; transform: scale(1); }
          50%       { opacity: 0.6; transform: scale(1.3); }
        }
        .marquee-track {
          display: flex;
          width: max-content;
          animation: marquee 28s linear infinite;
        }
        .marquee-track:hover { animation-play-state: paused; }
        .platform-pill {
          display: flex; align-items: center; gap: 8px;
          padding: 10px 20px; border-radius: 100px;
          font-size: 14px; font-weight: 600; color: #e5e7eb;
          white-space: nowrap; margin: 0 6px;
          transition: transform 0.2s;
          cursor: default;
        }
        .platform-pill:hover { transform: translateY(-3px); }
        .floating-icon {
          position: absolute;
          pointer-events: none;
          z-index: 2;
        }
      `}</style>

      {/* Navbar */}
      <nav style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
        background: 'rgba(10,10,15,0.85)',
        backdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(139,92,246,0.15)',
        padding: '0 40px', height: '68px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            background: 'linear-gradient(135deg, #7c3aed, #4f46e5)',
            borderRadius: '10px', padding: '8px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 0 20px rgba(124,58,237,0.5)',
          }}>
            <Radio size={18} color="white" />
          </div>
          <span style={{ fontSize: '20px', fontWeight: 800, letterSpacing: '-0.5px' }}>StreamSync</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <Link to="/login" style={{
            padding: '9px 22px', borderRadius: '10px', fontSize: '14px', fontWeight: 600,
            color: '#d1d5db', border: '1px solid rgba(255,255,255,0.12)',
            background: 'rgba(255,255,255,0.04)', textDecoration: 'none', transition: 'all 0.2s',
          }}
            onMouseEnter={e => { e.target.style.color = 'white'; e.target.style.borderColor = 'rgba(139,92,246,0.5)' }}
            onMouseLeave={e => { e.target.style.color = '#d1d5db'; e.target.style.borderColor = 'rgba(255,255,255,0.12)' }}
          >Login</Link>
          <Link to="/register" style={{
            padding: '9px 22px', borderRadius: '10px', fontSize: '14px', fontWeight: 700,
            color: 'white', textDecoration: 'none',
            background: 'linear-gradient(135deg, #7c3aed, #4f46e5)',
            boxShadow: '0 4px 20px rgba(124,58,237,0.4)', transition: 'all 0.2s',
          }}
            onMouseEnter={e => { e.target.style.transform = 'translateY(-1px)'; e.target.style.boxShadow = '0 6px 25px rgba(124,58,237,0.6)' }}
            onMouseLeave={e => { e.target.style.transform = 'translateY(0)'; e.target.style.boxShadow = '0 4px 20px rgba(124,58,237,0.4)' }}
          >Get Started →</Link>
        </div>
      </nav>

      {/* Hero */}
      <section style={{
        minHeight: '100vh', display: 'flex', alignItems: 'center',
        padding: '100px 40px 60px',
        position: 'relative', overflow: 'hidden',
      }}>
        {/* Background glows */}
        <div style={{ position: 'absolute', top: '10%', left: '5%', width: '500px', height: '500px', background: 'radial-gradient(circle, rgba(124,58,237,0.15) 0%, transparent 70%)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: '10%', right: '5%', width: '400px', height: '400px', background: 'radial-gradient(circle, rgba(59,130,246,0.12) 0%, transparent 70%)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', top: '40%', right: '20%', width: '300px', height: '300px', background: 'radial-gradient(circle, rgba(16,185,129,0.08) 0%, transparent 70%)', pointerEvents: 'none' }} />

        {/* Floating platform icons */}
        {floatingIcons.map((icon, i) => (
          <div key={i} className="floating-icon" style={{
            top: icon.top,
            left: icon.left,
            right: icon.right,
            animation: `float ${icon.dur} ease-in-out ${icon.delay} infinite`,
            opacity: 0.7,
          }}>
            <PlatformIcon name={icon.name} color={icon.color} size={icon.size} />
          </div>
        ))}

        <div style={{ maxWidth: '1200px', margin: '0 auto', width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '60px', position: 'relative', zIndex: 3 }}>

          {/* Left */}
          <div style={{ flex: 1, maxWidth: '580px' }}>
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: '8px',
              background: 'rgba(124,58,237,0.15)', border: '1px solid rgba(124,58,237,0.3)',
              borderRadius: '100px', padding: '6px 16px',
              fontSize: '13px', color: '#a78bfa', marginBottom: '28px',
            }}>
              <span style={{ width: '6px', height: '6px', background: '#a78bfa', borderRadius: '50%', animation: 'pulse-dot 2s infinite' }}></span>
              Built for Indian Creators & Global Audiences
            </div>

            <h1 style={{ fontSize: 'clamp(42px, 6vw, 76px)', fontWeight: 900, lineHeight: 1.05, letterSpacing: '-2px', marginBottom: '24px' }}>
              Go Live on<br />
              <span style={{ background: 'linear-gradient(135deg, #a78bfa 0%, #60a5fa 50%, #34d399 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>10 Platforms</span><br />
              at Once
            </h1>

            <p style={{ fontSize: '18px', color: '#9ca3af', lineHeight: 1.7, marginBottom: '40px', maxWidth: '480px' }}>
              Upload your pre-recorded video and multistream live to YouTube, Twitch, TikTok and 7 more — no OBS, no technical setup.
            </p>

            <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
              <Link to="/register" style={{
                display: 'inline-flex', alignItems: 'center', gap: '10px',
                padding: '16px 32px', borderRadius: '14px',
                background: 'linear-gradient(135deg, #7c3aed, #4f46e5)',
                color: 'white', fontWeight: 700, fontSize: '16px', textDecoration: 'none',
                boxShadow: '0 8px 32px rgba(124,58,237,0.45)', transition: 'all 0.2s',
              }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 12px 40px rgba(124,58,237,0.6)' }}
                onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 8px 32px rgba(124,58,237,0.45)' }}
              >
                Start Streaming Free <ChevronRight size={18} />
              </Link>
              <Link to="/login" style={{
                display: 'inline-flex', alignItems: 'center', gap: '10px',
                padding: '16px 32px', borderRadius: '14px',
                background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)',
                color: 'white', fontWeight: 600, fontSize: '16px', textDecoration: 'none', transition: 'all 0.2s',
              }}
                onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.1)' }}
                onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.06)' }}
              >
                <Play size={16} /> Login to Dashboard
              </Link>
            </div>

            <div style={{ display: 'flex', gap: '32px', marginTop: '48px', flexWrap: 'wrap' }}>
              {stats.map(s => (
                <div key={s.label} style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '28px', fontWeight: 900, background: 'linear-gradient(135deg, #a78bfa, #60a5fa)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>{s.value}</div>
                  <div style={{ fontSize: '12px', color: '#6b7280', marginTop: '2px', textTransform: 'uppercase', letterSpacing: '1px' }}>{s.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Right — Card */}
          <div style={{ flex: 1, maxWidth: '480px', position: 'relative' }}>
            <div style={{
              background: 'linear-gradient(135deg, rgba(30,20,60,0.9), rgba(15,15,30,0.95))',
              border: '1px solid rgba(124,58,237,0.3)', borderRadius: '24px', padding: '28px',
              boxShadow: '0 25px 80px rgba(0,0,0,0.6), 0 0 60px rgba(124,58,237,0.1)',
              backdropFilter: 'blur(20px)',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
                <span style={{ fontSize: '14px', fontWeight: 700, color: '#e9d5ff' }}>🔴 LIVE NOW</span>
                <span style={{ fontSize: '12px', color: '#6b7280', background: 'rgba(255,255,255,0.05)', padding: '4px 10px', borderRadius: '100px' }}>02:34:15</span>
              </div>
              <div style={{ fontSize: '15px', fontWeight: 600, marginBottom: '16px', color: '#f3f4f6' }}>My Podcast Episode 12</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                {platforms.slice(0, 6).map(p => (
                  <div key={p.name} style={{
                    display: 'flex', alignItems: 'center', gap: '8px',
                    padding: '10px 12px', borderRadius: '10px',
                    background: p.bg, border: `1px solid ${p.color}30`,
                  }}>
                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: p.color, boxShadow: `0 0 8px ${p.color}`, flexShrink: 0 }}></div>
                    <span style={{ fontSize: '12px', fontWeight: 600, color: '#e5e7eb' }}>{p.name}</span>
                    <span style={{ marginLeft: 'auto', fontSize: '11px', color: p.color, fontWeight: 700 }}>LIVE</span>
                  </div>
                ))}
              </div>
              <div style={{
                marginTop: '16px', padding: '12px',
                background: 'rgba(124,58,237,0.1)', borderRadius: '12px',
                border: '1px solid rgba(124,58,237,0.2)',
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              }}>
                <span style={{ fontSize: '13px', color: '#a78bfa' }}>Streaming to 6 platforms</span>
                <span style={{ fontSize: '13px', fontWeight: 700, color: '#34d399' }}>● Active</span>
              </div>
            </div>
            <div style={{
              position: 'absolute', top: '-16px', right: '-16px',
              background: 'linear-gradient(135deg, #7c3aed, #4f46e5)',
              borderRadius: '14px', padding: '10px 16px', fontSize: '13px', fontWeight: 700,
              boxShadow: '0 8px 24px rgba(124,58,237,0.5)', border: '2px solid rgba(255,255,255,0.1)',
            }}>🚀 Zero Setup</div>
            <div style={{
              position: 'absolute', bottom: '-16px', left: '-16px',
              background: 'linear-gradient(135deg, rgba(16,185,129,0.2), rgba(16,185,129,0.1))',
              border: '1px solid rgba(16,185,129,0.4)',
              borderRadius: '14px', padding: '10px 16px', fontSize: '13px', fontWeight: 700, color: '#34d399',
              boxShadow: '0 8px 24px rgba(16,185,129,0.2)',
            }}>✓ 10 Platforms Connected</div>
          </div>
        </div>
      </section>

      {/* ── Marquee Platform Scroll ── */}
      <section style={{
        padding: '40px 0',
        borderTop: '1px solid rgba(255,255,255,0.06)',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
        background: 'rgba(255,255,255,0.02)',
        overflow: 'hidden',
      }}>
        <p style={{ textAlign: 'center', color: '#4b5563', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '3px', marginBottom: '20px', fontWeight: 600 }}>
          Stream simultaneously to all these platforms
        </p>

        {/* Fade edges */}
        <div style={{ position: 'relative' }}>
          <div style={{
            position: 'absolute', left: 0, top: 0, bottom: 0, width: '80px', zIndex: 2,
            background: 'linear-gradient(to right, #0a0a0f, transparent)',
            pointerEvents: 'none',
          }} />
          <div style={{
            position: 'absolute', right: 0, top: 0, bottom: 0, width: '80px', zIndex: 2,
            background: 'linear-gradient(to left, #0a0a0f, transparent)',
            pointerEvents: 'none',
          }} />

          {/* Marquee — duplicate list for seamless loop */}
          <div style={{ overflow: 'hidden' }}>
            <div className="marquee-track">
              {[...platforms, ...platforms].map((p, i) => (
                <div key={i} className="platform-pill" style={{ background: p.bg, border: `1px solid ${p.color}40` }}>
                  <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: p.color, boxShadow: `0 0 6px ${p.color}`, flexShrink: 0 }}></div>
                  {p.name}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section style={{ padding: '100px 40px' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '64px' }}>
            <h2 style={{ fontSize: '42px', fontWeight: 900, letterSpacing: '-1px', marginBottom: '16px' }}>
              Everything you need to{' '}
              <span style={{ background: 'linear-gradient(135deg, #a78bfa, #60a5fa)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>go live</span>
            </h2>
            <p style={{ color: '#6b7280', fontSize: '18px' }}>No OBS. No technical knowledge. Just upload and stream.</p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px' }}>
            {[
              { icon: '⚡', color: '#fbbf24', bg: 'rgba(251,191,36,0.1)', border: 'rgba(251,191,36,0.2)', title: 'One Click Multistream', desc: 'Select your platforms, hit Go Live — stream to all simultaneously in seconds.' },
              { icon: '🌍', color: '#60a5fa', bg: 'rgba(96,165,250,0.1)', border: 'rgba(96,165,250,0.2)', title: '10 Global Platforms', desc: 'YouTube, Twitch, Facebook, Kick, Rumble, TikTok, Instagram, Telegram, X & BIGO.' },
              { icon: '🔒', color: '#34d399', bg: 'rgba(52,211,153,0.1)', border: 'rgba(52,211,153,0.2)', title: 'Secure & Encrypted', desc: 'Stream keys encrypted at rest. JWT auth. Your data is never shared with anyone.' },
              { icon: '📊', color: '#a78bfa', bg: 'rgba(167,139,250,0.1)', border: 'rgba(167,139,250,0.2)', title: 'Real-Time Monitoring', desc: 'Watch live stream status, timecodes and platform health in real time.' },
            ].map(f => (
              <div key={f.title} style={{
                background: f.bg, border: `1px solid ${f.border}`,
                borderRadius: '20px', padding: '28px', transition: 'transform 0.2s, box-shadow 0.2s', cursor: 'default',
              }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 20px 40px rgba(0,0,0,0.3)' }}
                onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none' }}
              >
                <div style={{ fontSize: '36px', marginBottom: '16px' }}>{f.icon}</div>
                <h3 style={{ fontSize: '17px', fontWeight: 700, marginBottom: '10px', color: f.color }}>{f.title}</h3>
                <p style={{ fontSize: '14px', color: '#9ca3af', lineHeight: 1.7 }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section style={{
        padding: '80px 40px',
        background: 'rgba(124,58,237,0.04)',
        borderTop: '1px solid rgba(124,58,237,0.1)',
        borderBottom: '1px solid rgba(124,58,237,0.1)',
      }}>
        <div style={{ maxWidth: '900px', margin: '0 auto', textAlign: 'center' }}>
          <h2 style={{ fontSize: '38px', fontWeight: 900, letterSpacing: '-1px', marginBottom: '56px' }}>How it works</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '40px' }}>
            {[
              { num: '01', title: 'Upload Video', desc: 'Upload any MP4, MOV or MKV file up to 2GB from your device.', color: '#a78bfa' },
              { num: '02', title: 'Pick Platforms', desc: 'Select which platforms to stream to and paste your stream keys.', color: '#60a5fa' },
              { num: '03', title: 'Go Live!', desc: 'Hit the button — we handle the rest. Stream to all platforms at once.', color: '#34d399' },
            ].map(s => (
              <div key={s.num}>
                <div style={{ fontSize: '72px', fontWeight: 900, color: 'rgba(255,255,255,0.04)', lineHeight: 1, marginBottom: '12px' }}>{s.num}</div>
                <div style={{ width: '40px', height: '3px', background: s.color, borderRadius: '2px', margin: '0 auto 16px', boxShadow: `0 0 12px ${s.color}` }}></div>
                <h3 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '10px', color: s.color }}>{s.title}</h3>
                <p style={{ fontSize: '14px', color: '#6b7280', lineHeight: 1.7 }}>{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={{ padding: '100px 40px', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
        <div style={{
          position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)',
          width: '600px', height: '300px',
          background: 'radial-gradient(ellipse, rgba(124,58,237,0.15) 0%, transparent 70%)',
          pointerEvents: 'none',
        }} />
        <div style={{ position: 'relative', maxWidth: '600px', margin: '0 auto' }}>
          <h2 style={{ fontSize: '48px', fontWeight: 900, letterSpacing: '-1.5px', marginBottom: '16px' }}>
            Ready to go <span style={{ background: 'linear-gradient(135deg, #a78bfa, #34d399)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>live?</span>
          </h2>
          <p style={{ color: '#6b7280', fontSize: '18px', marginBottom: '36px' }}>
            Join creators streaming to multiple platforms simultaneously.
          </p>
          <Link to="/register" style={{
            display: 'inline-flex', alignItems: 'center', gap: '10px',
            padding: '18px 40px', borderRadius: '16px',
            background: 'linear-gradient(135deg, #7c3aed, #4f46e5)',
            color: 'white', fontWeight: 700, fontSize: '17px', textDecoration: 'none',
            boxShadow: '0 10px 40px rgba(124,58,237,0.5)', transition: 'all 0.2s',
          }}
            onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 16px 50px rgba(124,58,237,0.65)' }}
            onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 10px 40px rgba(124,58,237,0.5)' }}
          >
            Create Free Account <ChevronRight size={20} />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer style={{
        borderTop: '1px solid rgba(255,255,255,0.06)', padding: '28px 40px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        flexWrap: 'wrap', gap: '12px',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ background: 'linear-gradient(135deg, #7c3aed, #4f46e5)', borderRadius: '8px', padding: '6px', display: 'flex' }}>
            <Radio size={14} color="white" />
          </div>
          <span style={{ fontWeight: 800, fontSize: '15px' }}>StreamSync</span>
        </div>
        <p style={{ color: '#4b5563', fontSize: '13px' }}>© 2026 StreamSync — Built by Purple Merit, Bengaluru</p>
      </footer>
    </div>
  )
}