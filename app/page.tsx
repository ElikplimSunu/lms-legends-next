import Link from "next/link";
import { BookOpen, MonitorPlay, CheckCircle, Award, ArrowRight, Star } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col bg-white dark:bg-zinc-950 font-sans text-zinc-900 dark:text-zinc-50">
      
      {/* Navigation */}
      <header className="sticky top-0 z-50 w-full border-b border-zinc-200 dark:border-zinc-800 bg-white/80 dark:bg-zinc-950/80 backdrop-blur supports-[backdrop-filter]:bg-white/60">
        <div className="container mx-auto px-4 md:px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <BookOpen className="h-6 w-6 text-blue-600 dark:text-blue-500" />
            <span className="text-xl font-bold tracking-tight">LMS Legends</span>
          </Link>
          <nav className="hidden md:flex gap-6 text-sm font-medium text-zinc-500 dark:text-zinc-400">
            <Link href="#features" className="hover:text-zinc-900 dark:hover:text-zinc-50 transition-colors">Features</Link>
            <Link href="#testimonials" className="hover:text-zinc-900 dark:hover:text-zinc-50 transition-colors">Testimonials</Link>
            <Link href="/login" className="hover:text-zinc-900 dark:hover:text-zinc-50 transition-colors">Sign in</Link>
          </nav>
          <div className="flex items-center gap-4">
            <Link href="/login" className="hidden sm:inline-block text-sm font-medium hover:text-blue-600 transition-colors">
              Log in
            </Link>
            <Link href="/register">
              <Button className="bg-blue-600 hover:bg-blue-700 text-white rounded-full px-6">
                Get Started
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative overflow-hidden pt-24 pb-32 md:pt-32 md:pb-40">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-blue-100 via-white to-white dark:from-zinc-900 dark:via-zinc-950 dark:to-zinc-950 -z-10" />
          
          {/* Decorative background blurs */}
          <div className="absolute top-0 right-0 -translate-y-12 translate-x-1/3 w-[800px] h-[600px] bg-blue-500/10 dark:bg-blue-600/10 rounded-full blur-3xl -z-10" />
          <div className="absolute bottom-0 left-0 translate-y-1/3 -translate-x-1/3 w-[600px] h-[600px] bg-purple-500/10 dark:bg-purple-600/10 rounded-full blur-3xl -z-10" />

          <div className="container mx-auto px-4 md:px-6 text-center">
            <div className="inline-flex items-center rounded-full border border-blue-200 dark:border-blue-900 gap-2 bg-blue-50 dark:bg-blue-900/20 px-3 py-1 text-sm font-medium text-blue-600 dark:text-blue-400 mb-8 animate-in fade-in slide-in-from-bottom-4 duration-700 ease-out">
              <span className="flex h-2 w-2 rounded-full bg-blue-600 dark:bg-blue-400"></span>
              Now accepting early access signups
            </div>
            
            <h1 className="max-w-4xl mx-auto text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight mb-8 animate-in fade-in slide-in-from-bottom-6 duration-700 delay-100 fill-mode-both">
              Master your craft. <br className="hidden sm:block" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400">
                Become a Legend.
              </span>
            </h1>
            
            <p className="max-w-2xl mx-auto text-xl text-zinc-600 dark:text-zinc-400 mb-10 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-200 fill-mode-both">
              The premier online learning platform for those who want to reach the top. High-quality video courses, interactive quizzes, and verified certificates.
            </p>
            
            <div className="flex flex-col sm:flex-row justify-center items-center gap-4 animate-in fade-in slide-in-from-bottom-10 duration-700 delay-300 fill-mode-both">
              <Link href="/register">
                <Button size="lg" className="h-14 px-8 text-base bg-blue-600 hover:bg-blue-700 text-white rounded-full w-full sm:w-auto shadow-lg shadow-blue-600/20">
                  Start Learning Today
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link href="/register?role=instructor">
                <Button size="lg" variant="outline" className="h-14 px-8 text-base rounded-full border-zinc-300 dark:border-zinc-700 w-full sm:w-auto hover:bg-zinc-50 dark:hover:bg-zinc-900">
                  Become an Instructor
                </Button>
              </Link>
            </div>
            
            <div className="mt-16 sm:mt-24 max-w-5xl mx-auto bg-white/40 dark:bg-zinc-900/40 backdrop-blur-md border border-white/20 dark:border-zinc-800/50 rounded-2xl p-4 shadow-2xl animate-in zoom-in-95 duration-1000 delay-500 fill-mode-both">
              <div className="aspect-[16/9] w-full rounded-xl bg-zinc-100 dark:bg-zinc-950 flex items-center justify-center overflow-hidden border border-zinc-200 dark:border-zinc-800 relative group">
                {/* Simulated interface graphic Instead of an actual image for now */}
                <div className="absolute inset-0 bg-gradient-to-tr from-zinc-100 to-zinc-50 dark:from-zinc-900 dark:to-zinc-800"></div>
                <div className="absolute inset-y-0 left-0 w-64 border-r border-zinc-200 dark:border-zinc-800 p-6 hidden md:block">
                  <div className="space-y-4">
                    <div className="h-4 w-3/4 rounded bg-zinc-200 dark:bg-zinc-700"></div>
                    <div className="h-4 w-1/2 rounded bg-zinc-200 dark:bg-zinc-700"></div>
                    <div className="h-4 w-5/6 rounded bg-zinc-200 dark:bg-zinc-700"></div>
                    <div className="h-4 w-2/3 rounded bg-zinc-200 dark:bg-zinc-700"></div>
                  </div>
                </div>
                <div className="flex-1 h-full p-6 lg:p-12 flex flex-col justify-center items-center">
                  <MonitorPlay className="h-16 w-16 text-blue-500 opacity-80 group-hover:scale-110 transition-transform duration-500" />
                  <div className="mt-8 space-y-4 w-full max-w-lg">
                    <div className="h-8 w-3/4 rounded bg-zinc-200 dark:bg-zinc-700 mx-auto"></div>
                    <div className="h-4 w-full rounded bg-zinc-200 dark:bg-zinc-700 mx-auto"></div>
                    <div className="h-4 w-5/6 rounded bg-zinc-200 dark:bg-zinc-700 mx-auto"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="border-y border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50 py-12">
          <div className="container mx-auto px-4 md:px-6">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 text-center">
              <div>
                <h4 className="text-4xl font-bold text-zinc-900 dark:text-zinc-50">10k+</h4>
                <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400 mt-2">Active Students</p>
              </div>
              <div>
                <h4 className="text-4xl font-bold text-zinc-900 dark:text-zinc-50">500+</h4>
                <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400 mt-2">Expert Instructors</p>
              </div>
              <div>
                <h4 className="text-4xl font-bold text-zinc-900 dark:text-zinc-50">1,200+</h4>
                <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400 mt-2">Premium Courses</p>
              </div>
              <div>
                <h4 className="text-4xl font-bold text-zinc-900 dark:text-zinc-50">4.9/5</h4>
                <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400 mt-2">Average Rating</p>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="py-24 md:py-32">
          <div className="container mx-auto px-4 md:px-6">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Everything you need to succeed</h2>
              <p className="text-lg text-zinc-600 dark:text-zinc-400">
                Our platform uses the latest technology to deliver an unparalleled learning experience, optimized for all devices.
              </p>
            </div>
            
            <div className="grid md:grid-cols-3 gap-8">
              <div className="p-8 rounded-2xl bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-100 dark:border-zinc-800 hover:shadow-lg transition-shadow">
                <div className="h-12 w-12 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center mb-6 text-blue-600 dark:text-blue-400">
                  <MonitorPlay className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-bold mb-3">4K Video Streaming</h3>
                <p className="text-zinc-600 dark:text-zinc-400">
                  Powered by Mux, our video player delivers high-quality, buffer-free streaming adaptive to your connection speed.
                </p>
              </div>
              
              <div className="p-8 rounded-2xl bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-100 dark:border-zinc-800 hover:shadow-lg transition-shadow">
                <div className="h-12 w-12 rounded-xl bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center mb-6 text-purple-600 dark:text-purple-400">
                  <CheckCircle className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-bold mb-3">Interactive Quizzes</h3>
                <p className="text-zinc-600 dark:text-zinc-400">
                  Test your knowledge as you learn. Our dynamic quiz engine helps reinforce concepts and track your progress.
                </p>
              </div>
              
              <div className="p-8 rounded-2xl bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-100 dark:border-zinc-800 hover:shadow-lg transition-shadow">
                <div className="h-12 w-12 rounded-xl bg-green-100 dark:bg-green-900/30 flex items-center justify-center mb-6 text-green-600 dark:text-green-400">
                  <Award className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-bold mb-3">Verified Certificates</h3>
                <p className="text-zinc-600 dark:text-zinc-400">
                  Earn beautiful, verifiable PDF certificates upon course completion to showcase on your LinkedIn or resume.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Testimonial Section */}
        <section id="testimonials" className="py-24 bg-zinc-50 dark:bg-zinc-900/50 border-y border-zinc-200 dark:border-zinc-800">
          <div className="container mx-auto px-4 md:px-6">
            <div className="grid lg:grid-cols-2 gap-16 items-center">
              <div>
                <h2 className="text-3xl md:text-4xl font-bold mb-6">What our legends are saying</h2>
                <p className="text-lg text-zinc-600 dark:text-zinc-400 mb-8 max-w-md">
                  Join thousands of professionals who have upgraded their careers using our comprehensive curriculum.
                </p>
                <div className="flex items-center gap-4">
                  <div className="flex -space-x-3">
                    <div className="w-12 h-12 rounded-full border-2 border-zinc-50 dark:border-zinc-900 bg-blue-100"></div>
                    <div className="w-12 h-12 rounded-full border-2 border-zinc-50 dark:border-zinc-900 bg-purple-100"></div>
                    <div className="w-12 h-12 rounded-full border-2 border-zinc-50 dark:border-zinc-900 bg-green-100"></div>
                    <div className="w-12 h-12 rounded-full border-2 border-zinc-50 dark:border-zinc-900 bg-zinc-100 flex items-center justify-center text-xs font-bold">+10k</div>
                  </div>
                  <div className="text-sm font-medium">
                    <div className="flex text-amber-500 mb-1">
                      <Star className="h-4 w-4 fill-current" />
                      <Star className="h-4 w-4 fill-current" />
                      <Star className="h-4 w-4 fill-current" />
                      <Star className="h-4 w-4 fill-current" />
                      <Star className="h-4 w-4 fill-current" />
                    </div>
                    Loved by learners worldwide
                  </div>
                </div>
              </div>
              
              <div className="relative">
                <div className="absolute top-0 -left-4 text-7xl text-blue-200 dark:text-blue-900 opacity-50 font-serif leading-none">"</div>
                <div className="bg-white dark:bg-zinc-950 p-8 md:p-10 rounded-3xl shadow-xl relative z-10 border border-zinc-100 dark:border-zinc-800">
                  <p className="text-xl md:text-2xl font-medium leading-relaxed mb-8">
                    Since joining LMS Legends, my coding skills have skyrocketed. The video player is flawless, and the structured quizzes ensure I actually retain what I watch.
                  </p>
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-full bg-slate-200 dark:bg-slate-800 flex items-center justify-center font-bold text-slate-500">
                      JS
                    </div>
                    <div>
                      <h4 className="font-bold">Jane Smith</h4>
                      <p className="text-sm text-zinc-500">Frontend Developer</p>
                    </div>
                  </div>
                </div>
                <div className="absolute -bottom-6 -right-6 w-72 h-72 bg-blue-500/20 rounded-full blur-3xl -z-10" />
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-24 md:py-32 relative overflow-hidden">
          <div className="absolute inset-0 bg-blue-600 dark:bg-blue-900 -z-10" />
          <div className="absolute inset-0 bg-gradient-to-tr from-blue-700 to-purple-700 opacity-90 -z-10" />
          
          <div className="container mx-auto px-4 md:px-6 text-center text-white">
            <h2 className="text-3xl md:text-5xl font-bold mb-6">Ready to begin your journey?</h2>
            <p className="text-xl text-blue-100 mb-10 max-w-2xl mx-auto">
              Create an account today and get access to early bird pricing on all our masterclasses.
            </p>
            <Link href="/register">
              <Button size="lg" className="h-14 px-8 text-base bg-white text-blue-700 hover:bg-zinc-100 rounded-full font-bold shadow-xl">
                Get Started for Free
              </Button>
            </Link>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-zinc-50 dark:bg-zinc-950 py-12 border-t border-zinc-200 dark:border-zinc-900">
        <div className="container mx-auto px-4 md:px-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-2">
              <BookOpen className="h-6 w-6 text-blue-600 dark:text-blue-500" />
              <span className="text-xl font-bold tracking-tight">LMS Legends</span>
            </div>
            <div className="flex gap-6 text-sm text-zinc-500">
              <Link href="#" className="hover:text-zinc-900 dark:hover:text-zinc-50">Terms</Link>
              <Link href="#" className="hover:text-zinc-900 dark:hover:text-zinc-50">Privacy</Link>
              <Link href="#" className="hover:text-zinc-900 dark:hover:text-zinc-50">Contact</Link>
            </div>
          </div>
          <div className="mt-8 text-center text-sm text-zinc-400">
            &copy; {new Date().getFullYear()} LMS Legends Inc. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}

