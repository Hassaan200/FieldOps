import { useNavigate } from "react-router-dom";
import { useState, useEffect, useRef } from "react";

const Landing = () => {
  const navigate = useNavigate();
  const [copied, setCopied] = useState(null);
  const [visible, setVisible] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const heroRef = useRef(null);

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 100);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    const handleMouse = (e) => {
      if (!heroRef.current) return;
      const rect = heroRef.current.getBoundingClientRect();
      setMousePos({
        x: ((e.clientX - rect.left) / rect.width) * 100,
        y: ((e.clientY - rect.top) / rect.height) * 100,
      });
    };
    window.addEventListener("mousemove", handleMouse);
    return () => window.removeEventListener("mousemove", handleMouse);
  }, []);

  const handleCopy = (demo) => {
    navigator.clipboard.writeText(demo.email);
    setCopied(demo.role);
    setTimeout(() => setCopied(null), 2000);
  };

  const demos = [
    {
      role: "Admin",
      email: "admin@demo.com",
      password: "123456",
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="w-5 h-5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
        </svg>
      ),
      accent: "#1a3a2a",
      soft: "bg-emerald-50",
      border: "border-emerald-200",
      text: "text-emerald-700",
      badge: "bg-emerald-100 text-emerald-700",
      glow: "rgba(16,185,129,0.15)",
      desc: "Full system access — manage jobs, users & analytics",
    },
    {
      role: "Technician",
      email: "tech@demo.com",
      password: "123456",
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="w-5 h-5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      ),
      accent: "#4c1d95",
      soft: "bg-violet-50",
      border: "border-violet-200",
      text: "text-violet-700",
      badge: "bg-violet-100 text-violet-700",
      glow: "rgba(139,92,246,0.15)",
      desc: "View assigned jobs, update status & message clients",
    },
    {
      role: "Client",
      email: "client@demo.com",
      password: "123456",
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="w-5 h-5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      ),
      accent: "#92400e",
      soft: "bg-amber-50",
      border: "border-amber-200",
      text: "text-amber-700",
      badge: "bg-amber-100 text-amber-700",
      glow: "rgba(245,158,11,0.15)",
      desc: "Track your jobs, view progress & chat with technicians",
    },
  ];

  const features = [
    {
      icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>,
      title: "Job Dispatching",
      desc: "Create and assign field jobs to technicians in seconds",
    },
    {
      icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>,
      title: "Live Status Updates",
      desc: "Track every job in real-time as it moves through stages",
    },
    {
      icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>,
      title: "Built-in Messaging",
      desc: "Clients and technicians communicate directly on each job",
    },
    {
      icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6 6 0 00-5-5.917V4a1 1 0 10-2 0v1.083A6 6 0 006 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>,
      title: "Smart Notifications",
      desc: "Stay updated with real-time alerts for every change",
    },
    {
      icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a4 4 0 00-3-3.87M9 20H4v-2a4 4 0 013-3.87m6-4a4 4 0 11-8 0 4 4 0 018 0zm6 0a4 4 0 11-8 0 4 4 0 018 0z" /></svg>,
      title: "Role-based Access",
      desc: "Admin, technician and client portals with tailored views",
    },
    {
      icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>,
      title: "Dashboard Analytics",
      desc: "At-a-glance stats for total, pending and completed jobs",
    },
  ];

  return (
    <div className="min-h-screen bg-[#f5f6f7] overflow-x-hidden">

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;600;700;800&family=DM+Sans:wght@400;500;600&display=swap');

        .landing-root { font-family: 'DM Sans', sans-serif; }
        .hero-title { font-family: 'Sora', sans-serif; }

        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(28px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
        @keyframes floatA {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50%       { transform: translateY(-18px) rotate(3deg); }
        }
        @keyframes floatB {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50%       { transform: translateY(-12px) rotate(-2deg); }
        }
        @keyframes pulse-ring {
          0%   { transform: scale(1);   opacity: 0.6; }
          100% { transform: scale(1.9); opacity: 0; }
        }
        @keyframes shimmer {
          0%   { background-position: -200% center; }
          100% { background-position: 200% center; }
        }
        @keyframes countUp {
          from { opacity: 0; transform: translateY(8px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes dashDraw {
          from { stroke-dashoffset: 200; }
          to   { stroke-dashoffset: 0; }
        }
        @keyframes slideInLeft {
          from { opacity:0; transform: translateX(-30px); }
          to   { opacity:1; transform: translateX(0); }
        }

        .anim-fade-up   { animation: fadeUp 0.7s cubic-bezier(.22,1,.36,1) both; }
        .anim-fade-in   { animation: fadeIn 0.6s ease both; }
        .anim-float-a   { animation: floatA 6s ease-in-out infinite; }
        .anim-float-b   { animation: floatB 8s ease-in-out infinite; }
        .anim-slide-left { animation: slideInLeft 0.7s cubic-bezier(.22,1,.36,1) both; }

        .shimmer-btn {
          background: linear-gradient(90deg, #1a3a2a 0%, #2d6a4f 40%, #1a3a2a 60%, #1a3a2a 100%);
          background-size: 200% auto;
          animation: shimmer 2.5s linear infinite;
        }
        .shimmer-btn:hover { animation-duration: 1.2s; }

        .card-hover {
          transition: transform 0.25s cubic-bezier(.22,1,.36,1), box-shadow 0.25s ease;
        }
        .card-hover:hover {
          transform: translateY(-4px) scale(1.015);
          box-shadow: 0 20px 40px -12px rgba(0,0,0,0.12);
        }

        .feature-card {
          transition: transform 0.2s ease, box-shadow 0.2s ease, background 0.2s ease;
        }
        .feature-card:hover {
          transform: translateY(-3px);
          background: white;
          box-shadow: 0 8px 24px -6px rgba(0,0,0,0.08);
        }

        .step-line {
          background: linear-gradient(to bottom, #1a3a2a, transparent);
        }

        .noise-bg {
          position: relative;
        }
        .noise-bg::before {
          content: '';
          position: absolute;
          inset: 0;
          opacity: 0.03;
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E");
          pointer-events: none;
        }

        .glow-orb {
          position: absolute;
          border-radius: 50%;
          filter: blur(60px);
          pointer-events: none;
          transition: transform 0.1s ease;
        }
      `}</style>

      <div className="landing-root">

        {/* ── Navbar ── */}
        <nav
          className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100"
          style={{ animation: visible ? 'fadeIn 0.5s ease both' : 'none' }}
        >
          <div className="max-w-6xl mx-auto px-5 sm:px-8 h-16 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-[#1a3a2a] flex items-center justify-center shadow-md shadow-emerald-900/20">
                <svg viewBox="0 0 24 24" fill="none" stroke="#6ee7b7" strokeWidth={2.2} className="w-4 h-4">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6-10l6-3m0 13l5.447 2.724A1 1 0 0021 18.382V7.618a1 1 0 00-1.447-.894L15 10m0 3V7" />
                </svg>
              </div>
              <span style={{ fontFamily: 'Sora, sans-serif' }} className="text-[#1a3a2a] font-bold text-base tracking-tight">FieldOps</span>
            </div>
            <button
              onClick={() => navigate("/login")}
              className="shimmer-btn text-white px-5 py-2 rounded-xl text-sm font-semibold shadow-md shadow-emerald-900/20 cursor-pointer"
            >
              Sign In →
            </button>
          </div>
        </nav>

        {/* ── Hero ── */}
        <section
          ref={heroRef}
          className="noise-bg relative bg-[#1a3a2a] overflow-hidden"
          style={{ minHeight: '88vh' }}
        >
          {/* Dynamic glow that follows mouse */}
          <div
            className="glow-orb w-96 h-96 bg-emerald-400/20"
            style={{ left: `${mousePos.x - 20}%`, top: `${mousePos.y - 20}%` }}
          />
          {/* Static orbs */}
          <div className="glow-orb w-80 h-80 bg-emerald-600/30" style={{ right: '-5%', top: '-10%' }} />
          <div className="glow-orb w-64 h-64 bg-teal-500/20" style={{ left: '-5%', bottom: '10%' }} />

          {/* Grid pattern */}
          <div className="absolute inset-0 opacity-5"
            style={{ backgroundImage: 'linear-gradient(#6ee7b7 1px, transparent 1px), linear-gradient(90deg, #6ee7b7 1px, transparent 1px)', backgroundSize: '48px 48px' }}
          />

          {/* Floating decorative shapes */}
          <div className="anim-float-a absolute top-16 right-16 w-20 h-20 rounded-2xl border border-emerald-400/20 bg-emerald-400/5 hidden lg:block" />
          <div className="anim-float-b absolute bottom-24 right-32 w-12 h-12 rounded-xl border border-emerald-300/20 bg-emerald-300/5 hidden lg:block" />
          <div className="anim-float-a absolute top-32 left-12 w-8 h-8 rounded-lg bg-emerald-400/10 hidden lg:block" style={{ animationDelay: '2s' }} />

          <div className="relative max-w-6xl mx-auto px-5 sm:px-8 py-20 sm:py-32 flex flex-col items-center text-center">

            {/* Badge */}
            <div
              className="anim-fade-up inline-flex items-center gap-2 bg-emerald-400/10 border border-emerald-400/20 text-emerald-300 text-xs font-semibold px-4 py-1.5 rounded-full mb-8"
              style={{ animationDelay: '0.1s' }}
            >
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400" />
              </span>
              Live demo available — no signup required
            </div>

            {/* Headline */}
            <h1
              className="hero-title anim-fade-up text-white font-extrabold leading-[1.08] tracking-tight"
              style={{ fontSize: 'clamp(2.4rem, 6vw, 4.2rem)', animationDelay: '0.2s' }}
            >
              Field Operations,
              <br />
              <span className="text-transparent bg-clip-text"
                style={{ backgroundImage: 'linear-gradient(90deg, #6ee7b7, #34d399, #a7f3d0)' }}>
                Simplified.
              </span>
            </h1>

            <p
              className="anim-fade-up text-emerald-100/60 mt-6 max-w-xl leading-relaxed"
              style={{ fontSize: 'clamp(0.95rem, 2vw, 1.1rem)', animationDelay: '0.35s' }}
            >
              Dispatch technicians, track every job in real-time, and keep clients informed — all from one clean, fast dashboard.
            </p>

            {/* CTA buttons */}
            <div
              className="anim-fade-up flex flex-col sm:flex-row gap-3 mt-10"
              style={{ animationDelay: '0.5s' }}
            >
              <button
                onClick={() => navigate("/login")}
                className="group shimmer-btn text-white px-8 py-3.5 rounded-xl font-semibold shadow-lg shadow-emerald-900/40 cursor-pointer flex items-center justify-center gap-2"
              >
                Try Demo Free
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} className="w-4 h-4 group-hover:translate-x-1 transition-transform">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </button>
              <button
                onClick={() => document.getElementById('demo-section').scrollIntoView({ behavior: 'smooth' })}
                className="bg-white/10 hover:bg-white/15 border border-white/20 text-white px-8 py-3.5 rounded-xl font-semibold cursor-pointer transition-all duration-200 backdrop-blur-sm"
              >
                View Demo Accounts
              </button>
            </div>

            {/* Stats strip */}
            <div
              className="anim-fade-up mt-16 grid grid-cols-3 gap-8 sm:gap-16"
              style={{ animationDelay: '0.65s' }}
            >
              {[
                { val: '3', label: 'User Roles' },
                { val: '5s', label: 'Refresh Rate' },
                { val: '100%', label: 'Real-time' },
              ].map(({ val, label }) => (
                <div key={label} className="text-center">
                  <p className="hero-title text-white font-extrabold" style={{ fontSize: 'clamp(1.6rem, 4vw, 2.2rem)' }}>{val}</p>
                  <p className="text-emerald-300/60 text-xs font-medium mt-1">{label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Wave separator */}
          <div className="absolute bottom-0 left-0 right-0">
            <svg viewBox="0 0 1440 64" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full">
              <path d="M0 64L60 58.7C120 53.3 240 42.7 360 42.7C480 42.7 600 53.3 720 56C840 58.7 960 53.3 1080 45.3C1200 37.3 1320 26.7 1380 21.3L1440 16V64H1380C1320 64 1200 64 1080 64C960 64 840 64 720 64C600 64 480 64 360 64C240 64 120 64 60 64H0Z" fill="#f5f6f7"/>
            </svg>
          </div>
        </section>

        {/* ── Features ── */}
        <section className="max-w-6xl mx-auto px-5 sm:px-8 py-20">
          <div className="text-center mb-12">
            <p className="text-xs font-semibold tracking-[0.2em] uppercase text-emerald-600 mb-2">Everything you need</p>
            <h2 className="hero-title text-2xl sm:text-3xl font-bold text-gray-900">Built for real field work</h2>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {features.map((f, i) => (
              <div
                key={f.title}
                className="feature-card bg-white/70 rounded-2xl border border-gray-100 p-6"
                style={{ animationDelay: `${i * 0.08}s` }}
              >
                <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center mb-4">
                  {f.icon}
                </div>
                <h3 className="font-bold text-gray-900 text-sm mb-1">{f.title}</h3>
                <p className="text-gray-500 text-xs leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── Demo Accounts ── */}
        <section id="demo-section" className="bg-white border-y border-gray-100 py-20">
          <div className="max-w-6xl mx-auto px-5 sm:px-8">
            <div className="text-center mb-12">
              <p className="text-xs font-semibold tracking-[0.2em] uppercase text-emerald-600 mb-2">No signup needed</p>
              <h2 className="hero-title text-2xl sm:text-3xl font-bold text-gray-900">Try any role instantly</h2>
              <p className="text-gray-400 text-sm mt-2">Pick a demo account, copy the credentials and explore</p>
            </div>

            <div className="grid md:grid-cols-3 gap-5">
              {demos.map((demo, i) => (
                <div
                  key={demo.role}
                  className={`card-hover relative rounded-2xl border ${demo.border} ${demo.soft} p-6 overflow-hidden cursor-default`}
                  style={{ animationDelay: `${i * 0.1}s` }}
                >
                  {/* Soft glow blob */}
                  <div
                    className="absolute -top-6 -right-6 w-28 h-28 rounded-full opacity-40 blur-2xl"
                    style={{ background: demo.glow }}
                  />

                  <div className="relative">
                    {/* Role header */}
                    <div className="flex items-center justify-between mb-4">
                      <div className={`flex items-center gap-2 ${demo.text}`}>
                        <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${demo.badge}`}>
                          {demo.icon}
                        </div>
                        <span className="font-bold text-base">{demo.role}</span>
                      </div>
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${demo.badge}`}>
                        Demo
                      </span>
                    </div>

                    <p className="text-xs text-gray-500 leading-relaxed mb-5">{demo.desc}</p>

                    {/* Credentials */}
                    <div className="space-y-2 mb-5">
                      {[
                        { label: 'Email', value: demo.email },
                        { label: 'Password', value: demo.password },
                      ].map(({ label, value }) => (
                        <div key={label} className="bg-white/70 border border-gray-200/80 rounded-xl px-3.5 py-2.5 flex items-center justify-between">
                          <div>
                            <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">{label}</p>
                            <p className="text-sm font-semibold text-gray-800 mt-0.5">{value}</p>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleCopy(demo)}
                        className={`flex-1 flex items-center justify-center gap-1.5 text-xs font-semibold py-2 rounded-xl border transition-all duration-200 cursor-pointer ${
                          copied === demo.role
                            ? 'bg-emerald-600 border-emerald-600 text-white'
                            : `${demo.badge} border-transparent hover:opacity-80`
                        }`}
                      >
                        {copied === demo.role ? (
                          <>
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} className="w-3.5 h-3.5">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                            </svg>
                            Copied!
                          </>
                        ) : (
                          <>
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-3.5 h-3.5">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                            </svg>
                            Copy Email
                          </>
                        )}
                      </button>
                      <button
                        onClick={() => navigate("/login")}
                        className="flex-1 flex items-center justify-center gap-1.5 bg-[#1a3a2a] hover:bg-[#224d38] text-white text-xs font-semibold py-2 rounded-xl transition-all duration-150 cursor-pointer shadow-md shadow-emerald-900/20"
                      >
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-3.5 h-3.5">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                        </svg>
                        Login
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <p className="mt-6 text-center text-xs text-gray-400 flex items-center justify-center gap-1.5">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-3.5 h-3.5 text-amber-400">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Demo accounts are read-only in some areas. Profile password changes are disabled.
            </p>
          </div>
        </section>

        {/* ── How it works ── */}
        <section className="max-w-6xl mx-auto px-5 sm:px-8 py-20">
          <div className="text-center mb-12">
            <p className="text-xs font-semibold tracking-[0.2em] uppercase text-emerald-600 mb-2">Quick start</p>
            <h2 className="hero-title text-2xl sm:text-3xl font-bold text-gray-900">Up and running in 4 steps</h2>
          </div>

          <div className="relative max-w-xl mx-auto">
            {[
              { num: '01', title: 'Pick a demo account', desc: 'Choose Admin, Technician, or Client from the cards above' },
              { num: '02', title: 'Copy the credentials', desc: 'Hit "Copy Email" then note down the password: 123456' },
              { num: '03', title: 'Sign in', desc: 'Click Login and paste the credentials into the login form' },
              { num: '04', title: 'Explore freely', desc: 'Browse the dashboard, assign jobs, send messages, update statuses' },
            ].map((step, i) => (
              <div key={step.num} className="flex gap-5 mb-8 last:mb-0 group">
                <div className="flex flex-col items-center">
                  <div className="w-10 h-10 rounded-xl bg-[#1a3a2a] text-emerald-300 flex items-center justify-center flex-shrink-0 shadow-md shadow-emerald-900/20 group-hover:scale-110 transition-transform duration-200">
                    <span className="text-xs font-bold">{step.num}</span>
                  </div>
                  {i < 3 && <div className="w-px flex-1 mt-2 step-line min-h-8" />}
                </div>
                <div className="pb-2 pt-1.5">
                  <p className="font-bold text-gray-900 text-sm">{step.title}</p>
                  <p className="text-gray-400 text-xs mt-1 leading-relaxed">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── CTA Banner ── */}
        <section className="max-w-6xl mx-auto px-5 sm:px-8 pb-20">
          <div
            className="noise-bg relative bg-[#1a3a2a] rounded-3xl overflow-hidden px-8 sm:px-14 py-14 text-center"
          >
            <div className="glow-orb w-72 h-72 bg-emerald-400/20" style={{ left: '-5%', top: '-30%' }} />
            <div className="glow-orb w-60 h-60 bg-teal-500/15" style={{ right: '-5%', bottom: '-30%' }} />
            <div className="absolute inset-0 opacity-5"
              style={{ backgroundImage: 'linear-gradient(#6ee7b7 1px, transparent 1px), linear-gradient(90deg, #6ee7b7 1px, transparent 1px)', backgroundSize: '40px 40px' }}
            />
            <div className="relative">
              <h2 className="hero-title text-white font-extrabold leading-tight" style={{ fontSize: 'clamp(1.6rem, 4vw, 2.4rem)' }}>
                Ready to see it in action?
              </h2>
              <p className="text-emerald-300/60 mt-3 text-sm max-w-md mx-auto">
                No account setup required. Jump straight into the live demo and explore every feature.
              </p>
              <button
                onClick={() => navigate("/login")}
                className="mt-8 inline-flex items-center gap-2 bg-white text-[#1a3a2a] font-bold px-8 py-3.5 rounded-xl shadow-xl cursor-pointer hover:bg-emerald-50 transition-all duration-200 group"
              >
                Launch Demo
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} className="w-4 h-4 group-hover:translate-x-1 transition-transform">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </button>
            </div>
          </div>
        </section>

        {/* ── Footer ── */}
        <footer className="border-t border-gray-100 py-8">
          <div className="max-w-6xl mx-auto px-5 sm:px-8 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-md bg-[#1a3a2a] flex items-center justify-center">
                <svg viewBox="0 0 24 24" fill="none" stroke="#6ee7b7" strokeWidth={2.5} className="w-3 h-3">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6-10l6-3m0 13l5.447 2.724A1 1 0 0021 18.382V7.618a1 1 0 00-1.447-.894L15 10m0 3V7" />
                </svg>
              </div>
              <span className="text-[#1a3a2a] font-bold text-sm">FieldOps</span>
            </div>
            <p className="text-xs text-gray-400">© {new Date().getFullYear()} FieldOps · Built for field service management</p>
          </div>
        </footer>

      </div>
    </div>
  );
};

export default Landing;