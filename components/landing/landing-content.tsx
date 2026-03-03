"use client";

import Link from "next/link";
import { ArrowRight, Play, Zap, Shield, BarChart3, Users, Globe, Sparkles } from "lucide-react";
import { useScrollReveal } from "@/hooks/use-scroll-reveal";

export function LandingContent() {
  const ref = useScrollReveal();

  return (
    <div ref={ref} className="bg-zinc-950 text-white min-h-screen overflow-hidden">

      {/* ════════════ NAVIGATION ════════════ */}
      <header className="fixed top-0 left-0 right-0 z-50">
        <div className="mx-auto max-w-7xl px-6 py-4">
          <nav className="flex items-center justify-between rounded-2xl bg-white/[0.03] backdrop-blur-xl border border-white/[0.06] px-6 py-3">
            <Link href="/" className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
              <span className="text-lg font-bold tracking-tight">LMS Legends</span>
            </Link>

            <div className="hidden md:flex items-center gap-8 text-sm text-zinc-400">
              <Link href="#features" className="hover:text-white transition-colors duration-300">Features</Link>
              <Link href="#how-it-works" className="hover:text-white transition-colors duration-300">How it works</Link>
              <Link href="#testimonials" className="hover:text-white transition-colors duration-300">Testimonials</Link>
            </div>

            <div className="flex items-center gap-3">
              <Link href="/login" className="hidden sm:block text-sm text-zinc-400 hover:text-white transition-colors duration-300 px-4 py-2">
                Sign in
              </Link>
              <Link
                href="/register"
                className="text-sm font-medium bg-white text-zinc-950 px-5 py-2.5 rounded-xl hover:bg-zinc-200 transition-all duration-300 hover:shadow-lg hover:shadow-white/10"
              >
                Get Started
              </Link>
            </div>
          </nav>
        </div>
      </header>

      {/* ════════════ HERO ════════════ */}
      <section className="relative min-h-screen flex items-center justify-center pt-24 pb-20 noise-overlay">
        {/* Floating orbs */}
        <div className="landing-orb landing-orb-1" style={{ top: '-15%', right: '-10%' }} />
        <div className="landing-orb landing-orb-2" style={{ bottom: '-10%', left: '-5%' }} />
        <div className="landing-orb landing-orb-3" style={{ top: '40%', left: '50%' }} />

        {/* Dot grid */}
        <div className="absolute inset-0 dot-grid opacity-40" />

        <div className="relative z-10 max-w-5xl mx-auto px-6 text-center">
          {/* Badge */}
          <div
            className="inline-flex items-center gap-2 rounded-full bg-white/[0.05] border border-white/[0.08] px-4 py-1.5 text-sm text-zinc-300 mb-10"
            style={{ animation: 'slide-up-reveal 0.8s cubic-bezier(0.16, 1, 0.3, 1) both' }}
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
            </span>
            Now in early access
          </div>

          {/* Heading */}
          <h1
            className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-extrabold tracking-[-0.03em] leading-[0.9] mb-8"
            style={{ animation: 'slide-up-reveal 0.8s cubic-bezier(0.16, 1, 0.3, 1) 0.1s both' }}
          >
            Learn without
            <br />
            <span className="text-shimmer">limits.</span>
          </h1>

          {/* Subheading */}
          <p
            className="max-w-xl mx-auto text-lg sm:text-xl text-zinc-400 leading-relaxed mb-12"
            style={{ animation: 'slide-up-reveal 0.8s cubic-bezier(0.16, 1, 0.3, 1) 0.2s both' }}
          >
            The modern platform for mastering new skills. Premium video courses, 
            live quizzes, and verified certificates — all in one place.
          </p>

          {/* CTA Buttons */}
          <div
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
            style={{ animation: 'slide-up-reveal 0.8s cubic-bezier(0.16, 1, 0.3, 1) 0.3s both' }}
          >
            <Link
              href="/register"
              className="group flex items-center gap-2 bg-white text-zinc-950 px-8 py-4 rounded-2xl text-base font-semibold hover:bg-zinc-200 transition-all duration-300 hover:shadow-2xl hover:shadow-white/10 hover:-translate-y-0.5"
            >
              Start learning free
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" />
            </Link>
            <Link
              href="#features"
              className="flex items-center gap-2 text-zinc-400 px-8 py-4 rounded-2xl text-base font-medium border border-white/[0.08] hover:bg-white/[0.04] hover:text-white transition-all duration-300"
            >
              <Play className="w-4 h-4" />
              See how it works
            </Link>
          </div>

          {/* Social proof */}
          <div
            className="mt-16 flex items-center justify-center gap-6 text-sm text-zinc-500"
            style={{ animation: 'slide-up-reveal 0.8s cubic-bezier(0.16, 1, 0.3, 1) 0.5s both' }}
          >
            <div className="flex -space-x-2">
              {[
                'bg-gradient-to-br from-indigo-400 to-blue-500',
                'bg-gradient-to-br from-purple-400 to-pink-500',
                'bg-gradient-to-br from-amber-400 to-orange-500',
                'bg-gradient-to-br from-emerald-400 to-teal-500',
              ].map((bg, i) => (
                <div key={i} className={`w-8 h-8 rounded-full ${bg} border-2 border-zinc-950`} />
              ))}
            </div>
            <span>
              Trusted by <span className="text-zinc-300 font-medium">10,000+</span> learners worldwide
            </span>
          </div>
        </div>
      </section>

      {/* ════════════ GLOW LINE DIVIDER ════════════ */}
      <div className="glow-line max-w-2xl mx-auto" />

      {/* ════════════ STATS ════════════ */}
      <section className="py-24 px-6">
        <div className="max-w-5xl mx-auto stagger-children reveal">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { value: '10k+', label: 'Active learners' },
              { value: '500+', label: 'Expert instructors' },
              { value: '1,200+', label: 'Premium courses' },
              { value: '98%', label: 'Satisfaction rate' },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="text-4xl md:text-5xl font-bold tracking-tight text-white mb-2">
                  {stat.value}
                </div>
                <div className="text-sm text-zinc-500 font-medium">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════ FEATURES ════════════ */}
      <section id="features" className="py-24 px-6 relative">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-20 reveal">
            <p className="text-sm font-semibold text-indigo-400 tracking-widest uppercase mb-4">Features</p>
            <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-6">
              Built for <span className="text-shimmer">serious</span> learners
            </h2>
            <p className="text-lg text-zinc-400 max-w-2xl mx-auto">
              Every detail is designed to help you retain more, learn faster, 
              and actually finish what you start.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 stagger-children reveal">
            {[
              {
                icon: Play,
                title: '4K Video Streaming',
                description: 'Adaptive bitrate streaming powered by Mux. Buffer-free, any device, any connection.',
                gradient: 'from-blue-500/20 to-cyan-500/20',
                iconColor: 'text-blue-400',
              },
              {
                icon: Zap,
                title: 'Interactive Quizzes',
                description: 'Test your knowledge in real-time. Timed challenges, instant feedback, and detailed explanations.',
                gradient: 'from-amber-500/20 to-orange-500/20',
                iconColor: 'text-amber-400',
              },
              {
                icon: Shield,
                title: 'Verified Certificates',
                description: 'Earn blockchain-verifiable PDF certificates. Share on LinkedIn, add to your resume.',
                gradient: 'from-emerald-500/20 to-teal-500/20',
                iconColor: 'text-emerald-400',
              },
              {
                icon: BarChart3,
                title: 'Progress Tracking',
                description: 'Detailed analytics on your learning journey. See exactly where you stand and what to do next.',
                gradient: 'from-purple-500/20 to-pink-500/20',
                iconColor: 'text-purple-400',
              },
              {
                icon: Users,
                title: 'Expert Instructors',
                description: 'Learn from industry professionals who have built real products and led real teams.',
                gradient: 'from-rose-500/20 to-red-500/20',
                iconColor: 'text-rose-400',
              },
              {
                icon: Globe,
                title: 'Learn Anywhere',
                description: 'Responsive design works perfectly on desktop, tablet, and mobile. Pick up where you left off.',
                gradient: 'from-indigo-500/20 to-violet-500/20',
                iconColor: 'text-indigo-400',
              },
            ].map((feature) => (
              <div key={feature.title} className="glass-card rounded-2xl p-8 group">
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                  <feature.icon className={`w-6 h-6 ${feature.iconColor}`} />
                </div>
                <h3 className="text-lg font-semibold mb-3 text-white">{feature.title}</h3>
                <p className="text-sm text-zinc-400 leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════ HOW IT WORKS ════════════ */}
      <section id="how-it-works" className="py-24 px-6 relative">
        <div className="landing-orb landing-orb-2" style={{ top: '20%', right: '-15%' }} />

        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-20 reveal">
            <p className="text-sm font-semibold text-indigo-400 tracking-widest uppercase mb-4">How it works</p>
            <h2 className="text-4xl md:text-5xl font-bold tracking-tight">
              Three steps to mastery
            </h2>
          </div>

          <div className="space-y-16">
            {[
              {
                step: '01',
                title: 'Browse & Enroll',
                description: 'Explore our curated catalog of premium courses. Filter by topic, difficulty, or instructor. Enroll in seconds — many courses are completely free.',
              },
              {
                step: '02',
                title: 'Learn at Your Pace',
                description: 'Watch crystal-clear video lessons, take notes, and complete interactive quizzes. Your progress is saved automatically — pick up right where you left off.',
              },
              {
                step: '03',
                title: 'Earn & Share',
                description: 'Pass the final assessment and receive a verified certificate. Share it on LinkedIn, embed it in your portfolio, or download the PDF.',
              },
            ].map((item, i) => (
              <div key={item.step} className="reveal flex gap-8 items-start">
                <div className="hidden sm:flex flex-shrink-0 w-16 h-16 rounded-2xl border border-white/[0.08] bg-white/[0.02] items-center justify-center">
                  <span className="text-2xl font-bold text-indigo-400">{item.step}</span>
                </div>
                <div>
                  <h3 className="text-2xl font-bold mb-3">{item.title}</h3>
                  <p className="text-zinc-400 leading-relaxed max-w-lg">{item.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════ TESTIMONIAL ════════════ */}
      <section id="testimonials" className="py-24 px-6 relative">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16 reveal">
            <p className="text-sm font-semibold text-indigo-400 tracking-widest uppercase mb-4">Testimonials</p>
            <h2 className="text-4xl md:text-5xl font-bold tracking-tight">
              Loved by learners
            </h2>
          </div>

          <div className="grid md:grid-cols-2 gap-6 stagger-children reveal">
            {[
              {
                quote: "The video quality is insane and the quiz system actually makes me retain what I learn. Best learning investment I've made.",
                name: 'Sarah Chen',
                role: 'Senior Developer at Spotify',
              },
              {
                quote: "I went from junior to senior in 8 months. The structured curriculum and progress tracking kept me accountable every single day.",
                name: 'Marcus Johnson',
                role: 'Engineering Lead at Stripe',
              },
              {
                quote: "As an instructor, the platform makes it incredibly easy to create and monetize high-quality courses. The analytics are top-notch.",
                name: 'Emily Rodriguez',
                role: 'Course Creator · 50k students',
              },
              {
                quote: "The certificates are actually respected in hiring. I've had recruiters specifically mention my LMS Legends credentials.",
                name: 'David Park',
                role: 'Product Manager at Google',
              },
            ].map((testimonial) => (
              <div key={testimonial.name} className="glass-card rounded-2xl p-8">
                <p className="text-zinc-300 leading-relaxed mb-6 text-[15px]">
                  &ldquo;{testimonial.quote}&rdquo;
                </p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-xs font-bold">
                    {testimonial.name.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-white">{testimonial.name}</p>
                    <p className="text-xs text-zinc-500">{testimonial.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════ CTA ════════════ */}
      <section className="py-32 px-6 relative">
        <div className="landing-orb landing-orb-1" style={{ bottom: '0', left: '30%' }} />

        <div className="max-w-3xl mx-auto text-center relative z-10 reveal">
          <h2 className="text-4xl md:text-6xl font-bold tracking-tight mb-8">
            Ready to become
            <br />
            <span className="text-shimmer">a legend?</span>
          </h2>
          <p className="text-lg text-zinc-400 mb-12 max-w-xl mx-auto">
            Join thousands of professionals who are already building the future. 
            Start for free, upgrade when you&apos;re ready.
          </p>
          <Link
            href="/register"
            className="group inline-flex items-center gap-2 bg-white text-zinc-950 px-10 py-5 rounded-2xl text-lg font-semibold hover:bg-zinc-200 transition-all duration-300 hover:shadow-2xl hover:shadow-white/10 hover:-translate-y-1"
          >
            Get started — it&apos;s free
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" />
          </Link>
        </div>
      </section>

      {/* ════════════ FOOTER ════════════ */}
      <footer className="border-t border-white/[0.06] py-12 px-6">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-md bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
              <Sparkles className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="font-bold tracking-tight">LMS Legends</span>
          </div>
          <div className="flex gap-8 text-sm text-zinc-500">
            <Link href="#" className="hover:text-white transition-colors duration-300">Terms</Link>
            <Link href="#" className="hover:text-white transition-colors duration-300">Privacy</Link>
            <Link href="#" className="hover:text-white transition-colors duration-300">Contact</Link>
          </div>
          <p className="text-sm text-zinc-600">
            &copy; {new Date().getFullYear()} LMS Legends Inc.
          </p>
        </div>
      </footer>
    </div>
  );
}
