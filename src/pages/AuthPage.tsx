import { useState, FormEvent } from 'react';
import { TrendingDown, Eye, EyeOff, ArrowRight, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../components/ui/Toast';
import {
  ActivityStats,
  BiggestDropsSection,
  FeaturePillRow,
  HeroDashboardMockup,
  HeroSignalStrip,
  LandingFooter,
  LiveMarketActivitySection,
  LiveDealsSection,
  MostTrackedSection,
  PricePulseIntelligenceSection,
  SmartAlertsShowcase,
  TestimonialsSection,
  WhyPricePulseSection,
} from '../components/landing/LandingSections';

export function AuthPage() {
  const { signIn, signUp } = useAuth();
  const { toast } = useToast();
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [form, setForm] = useState({ email: '', password: '', fullName: '' });
  const [error, setError] = useState('');

  const set = (field: string, value: string) => {
    setError('');
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (mode === 'signup') {
        const { error: signupError } = await signUp(form.email, form.password, form.fullName);
        if (signupError) {
          setError(signupError);
          return;
        }
        toast('success', 'Account created! Welcome to PricePulse.');
        // Auth context listener will handle redirect to dashboard
      } else {
        const { error: signinError } = await signIn(form.email, form.password);
        if (signinError) {
          setError(signinError);
          return;
        }
        // Auth context listener will handle redirect to dashboard
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background overflow-hidden">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[420px] bg-brand-900/25 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute right-0 top-40 w-[460px] h-[460px] bg-success/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <header className="flex items-center justify-between py-5 sm:py-7">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-brand-700/80 border border-brand-500/20 flex items-center justify-center shadow-glow">
              <TrendingDown size={20} className="text-brand-100" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-text-primary tracking-tight">PricePulse</h1>
              <p className="text-xs text-text-muted">Real-time price intelligence</p>
            </div>
          </div>
          <a href="#pricing" className="hidden sm:inline-flex btn-ghost text-xs">Pricing</a>
        </header>

        <main className="space-y-14 sm:space-y-20 pb-10">
          <section className="grid lg:grid-cols-[0.92fr_1.08fr] gap-8 lg:gap-10 items-center pt-4 sm:pt-10">
            <div className="space-y-6">
              <HeroSignalStrip />
              <div>
                <p className="text-xs font-medium uppercase tracking-[0.24em] text-brand-300 mb-4">Intelligent price monitoring</p>
                <h2 className="text-4xl sm:text-5xl lg:text-6xl font-semibold tracking-tight text-text-primary leading-[1.02]">
                  Know when a price is actually worth acting on.
                </h2>
                <p className="text-base sm:text-lg text-text-secondary mt-5 leading-relaxed max-w-2xl">
                  PricePulse monitors products, detects meaningful price drops, and turns noisy offers into clear buying signals.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 sm:items-center">
                <button onClick={() => setMode('signup')} className="btn-primary px-6 py-3 text-sm shadow-glow-amber">
                  Start Tracking Free
                  <ArrowRight size={16} />
                </button>
                <a href="#deals" className="btn-ghost px-5 py-3 text-sm border border-border/60 bg-background-secondary/35">
                  Explore Live Deals
                </a>
              </div>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-text-muted">
                <span className="flex items-center gap-1.5"><CheckCircle2 size={13} className="text-success" />No credit card required</span>
                <span className="flex items-center gap-1.5"><CheckCircle2 size={13} className="text-success" />Setup in 30 seconds</span>
              </div>

              <FeaturePillRow />
            </div>

            <div className="lg:pl-4">
              <HeroDashboardMockup />
            </div>
          </section>

          <ActivityStats />
          <LiveMarketActivitySection />
          <LiveDealsSection />
          <MostTrackedSection />
          <BiggestDropsSection />
          <PricePulseIntelligenceSection />
          <WhyPricePulseSection />
          <SmartAlertsShowcase />
          <TestimonialsSection />

          <section id="pricing" className="grid lg:grid-cols-[1fr_390px] gap-6 lg:gap-10 items-start">
            <div className="card premium-panel p-6 sm:p-8">
              <p className="text-xs font-medium uppercase tracking-[0.22em] text-brand-300 mb-2">Get started</p>
              <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight text-text-primary">Start with a focused watchlist today.</h2>
              <p className="text-sm text-text-secondary mt-3 max-w-2xl">
                Create your account, add products, and let PricePulse monitor prices in the background.
              </p>
              <div className="grid sm:grid-cols-3 gap-3 mt-6">
                {['Track any product URL', 'Receive price drop alerts', 'See price history clearly'].map(item => (
                  <div key={item} className="rounded-2xl bg-background-tertiary/45 border border-border/60 p-3 text-sm text-text-secondary">
                    {item}
                  </div>
                ))}
              </div>
            </div>

            <div className="card p-6" id="contact">
              <div className="flex bg-background-tertiary rounded-xl p-1 mb-6">
                {(['signin', 'signup'] as const).map(m => (
                  <button
                    key={m}
                    onClick={() => { setMode(m); setError(''); }}
                    className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all duration-150 ${
                      mode === m
                        ? 'bg-background-secondary text-text-primary shadow-card'
                        : 'text-text-muted hover:text-text-secondary'
                    }`}
                  >
                    {m === 'signin' ? 'Sign In' : 'Create Account'}
                  </button>
                ))}
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                {mode === 'signup' && (
                  <div>
                    <label className="label">Full Name</label>
                    <input className="input" placeholder="Alex Johnson" value={form.fullName} onChange={e => set('fullName', e.target.value)} required={mode === 'signup'} autoComplete="name" />
                  </div>
                )}

                <div>
                  <label className="label">Email</label>
                  <input className="input" placeholder="you@example.com" type="email" value={form.email} onChange={e => set('email', e.target.value)} required autoComplete="email" />
                </div>

                <div>
                  <label className="label">Password</label>
                  <div className="relative">
                    <input className="input pr-10" placeholder={mode === 'signup' ? 'Min. 8 characters' : '••••••••'} type={showPassword ? 'text' : 'password'} value={form.password} onChange={e => set('password', e.target.value)} required minLength={mode === 'signup' ? 8 : undefined} autoComplete={mode === 'signup' ? 'new-password' : 'current-password'} />
                    <button type="button" onClick={() => setShowPassword(p => !p)} className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-secondary transition-colors">
                      {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                    </button>
                  </div>
                </div>

                {error && (
                  <div className="p-3 rounded-xl bg-error/10 border border-error/20">
                    <p className="text-sm text-error">{error}</p>
                  </div>
                )}

                <button type="submit" disabled={loading} className="btn-primary w-full mt-1 gap-2">
                  {loading ? (
                    <span className="flex items-center gap-2">
                      <span className="w-4 h-4 rounded-full border-2 border-text-primary/20 border-t-text-primary animate-spin" />
                      {mode === 'signup' ? 'Creating account...' : 'Signing in...'}
                    </span>
                  ) : (
                    <>
                      {mode === 'signin' ? 'Sign In' : 'Create Account'}
                      <ArrowRight size={15} />
                    </>
                  )}
                </button>
              </form>

              <p className="text-center text-xs text-text-muted mt-5">
                {mode === 'signin' ? "Don't have an account? " : 'Already have an account? '}
                <button onClick={() => { setMode(mode === 'signin' ? 'signup' : 'signin'); setError(''); }} className="text-brand-400 hover:text-brand-300 font-medium transition-colors">
                  {mode === 'signin' ? 'Create one' : 'Sign in'}
                </button>
              </p>
            </div>
          </section>
        </main>

        <LandingFooter />
      </div>
    </div>
  );
}
