import { useEffect, useState } from 'react';
import { Activity, Bell, Check, Clock, Cpu, Eye, LineChart, Mail, Monitor, Radio, Settings, ShieldCheck, Sparkles, TrendingDown, X, Zap } from 'lucide-react';
import { formatCurrency } from '../ui/PriceChange';

const liveDeals = [
  {
    title: 'NVIDIA GeForce RTX 5090 Founders Edition',
    image: 'https://images.unsplash.com/photo-1591488320449-011701bb6704?auto=format&fit=crop&w=900&q=80',
    current: 1899,
    previous: 2199,
    drop: 13.6,
    retailer: 'Micro Center',
    detected: '4 min ago',
    chart: [68, 62, 66, 58, 51, 46, 38],
  },
  {
    title: 'iPhone 16 Pro 256GB Natural Titanium',
    image: 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?auto=format&fit=crop&w=900&q=80',
    current: 1049,
    previous: 1199,
    drop: 12.5,
    retailer: 'Apple Reseller',
    detected: '9 min ago',
    chart: [72, 71, 68, 66, 60, 57, 49],
  },
  {
    title: 'MacBook Air M4 13-inch 16GB / 512GB',
    image: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=900&q=80',
    current: 1199,
    previous: 1399,
    drop: 14.3,
    retailer: 'Amazon',
    detected: '17 min ago',
    chart: [76, 72, 75, 64, 58, 52, 43],
  },
  {
    title: 'PlayStation 5 Slim Disc Edition Bundle',
    image: 'https://images.unsplash.com/photo-1607853202273-797f1c22a38e?auto=format&fit=crop&w=900&q=80',
    current: 449,
    previous: 549,
    drop: 18.2,
    retailer: 'Best Buy',
    detected: '22 min ago',
    chart: [70, 69, 61, 63, 54, 44, 35],
  },
  {
    title: 'Samsung Odyssey OLED G9 49-inch Monitor',
    image: 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?auto=format&fit=crop&w=900&q=80',
    current: 1099,
    previous: 1499,
    drop: 26.7,
    retailer: 'Samsung',
    detected: '31 min ago',
    chart: [82, 78, 74, 70, 59, 47, 31],
  },
];

const activityStats = [
  { value: '52,381', label: 'active deal trackers' },
  { value: '1.2M', label: 'products monitored' },
  { value: '5 min', label: 'average refresh cycle' },
  { value: '18,492', label: 'alerts triggered today' },
];

const testimonials = [
  {
    quote: 'Tracked an RTX 5090 for 3 weeks and bought it at its lowest price this month. The alert came before the stock checker I used.',
    name: 'Marco R.',
    role: 'PC builder',
    avatar: 'MR',
  },
  {
    quote: 'I was waiting for a MacBook Air M4 for university. PricePulse showed the actual trend, not just a random sale badge.',
    name: 'Elena S.',
    role: 'Design student',
    avatar: 'ES',
  },
  {
    quote: 'The PS5 alerts are clean and fast. I like that it tells me when a price is genuinely low instead of shouting every discount.',
    name: 'Jonas K.',
    role: 'Console gamer',
    avatar: 'JK',
  },
  {
    quote: 'I use it for Apple gear and monitors. It helped me avoid buying during a fake discount window twice.',
    name: 'Nina A.',
    role: 'Deal hunter',
    avatar: 'NA',
  },
];

const marketActivity = [
  'RTX 5090 dropped 12% 3 minutes ago',
  '142 users tracking MacBook Air M4',
  'Price alert triggered for iPhone 16 Pro',
  'PlayStation 5 reached lowest price in 60 days',
  'Samsung Odyssey OLED moved below average',
  '87 watchlists added Sony WH-1000XM5 today',
];

const mostTrackedProducts = [
  ['NVIDIA RTX 5090 Founders Edition', 'https://images.unsplash.com/photo-1591488320449-011701bb6704?auto=format&fit=crop&w=900&q=80', 18342, 1899, -8.4, [63, 65, 60, 58, 52, 48, 42]],
  ['MacBook Air M4 13-inch', 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=900&q=80', 15108, 1199, -5.8, [70, 68, 69, 62, 57, 55, 50]],
  ['iPhone 16 Pro 256GB', 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?auto=format&fit=crop&w=900&q=80', 12884, 1049, -4.2, [66, 67, 64, 63, 60, 58, 55]],
  ['PlayStation 5 Slim Bundle', 'https://images.unsplash.com/photo-1607853202273-797f1c22a38e?auto=format&fit=crop&w=900&q=80', 11302, 449, -11.6, [74, 72, 66, 68, 57, 49, 40]],
  ['Samsung Odyssey OLED G9', 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?auto=format&fit=crop&w=900&q=80', 9740, 1099, -18.9, [78, 73, 70, 64, 56, 45, 36]],
  ['Sony WH-1000XM5', 'https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?auto=format&fit=crop&w=900&q=80', 8621, 298, -9.7, [62, 59, 61, 55, 51, 47, 43]],
  ['Steam Deck OLED 1TB', 'https://images.unsplash.com/photo-1612287230202-1ff1d85d1bdf?auto=format&fit=crop&w=900&q=80', 7544, 589, -6.1, [68, 65, 67, 60, 58, 54, 50]],
  ['LG UltraGear 32-inch 4K', 'https://images.unsplash.com/photo-1616588589676-62b3bd4ff6d2?auto=format&fit=crop&w=900&q=80', 6903, 699, -15.4, [76, 72, 69, 61, 54, 48, 41]],
  ['AirPods Pro 2 USB-C', 'https://images.unsplash.com/photo-1606220588913-b3aacb4d2f46?auto=format&fit=crop&w=900&q=80', 6288, 189, -10.2, [61, 63, 57, 54, 49, 45, 40]],
  ['Logitech MX Master 3S', 'https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?auto=format&fit=crop&w=900&q=80', 5819, 84, -7.4, [58, 60, 55, 52, 50, 46, 43]],
] as const;

const biggestDrops = [
  ['Samsung Odyssey OLED G9', 1499, 1099, 26.7, 'Samsung', 'Lowest in 120 days', 'Ending soon', [82, 78, 74, 70, 59, 47, 31]],
  ['PlayStation 5 Slim Bundle', 549, 449, 18.2, 'Best Buy', 'Lowest in 60 days', 'Fast moving', [70, 69, 61, 63, 54, 44, 35]],
  ['NVIDIA RTX 5090 Founders Edition', 2199, 1899, 13.6, 'Micro Center', 'Lowest in 45 days', 'High demand', [68, 62, 66, 58, 51, 46, 38]],
  ['MacBook Air M4 13-inch', 1399, 1199, 14.3, 'Amazon', 'Lowest in 90 days', 'Verified drop', [76, 72, 75, 64, 58, 52, 43]],
] as const;

const intelligenceInsights = [
  ['Excellent time to buy', 'MacBook Air M4 is 14% below its usual range and close to its 90-day floor.', 'High confidence'],
  ['Historically low pricing detected', 'Samsung Odyssey OLED G9 is showing its strongest verified drop this quarter.', 'Strong signal'],
  ['Price likely to increase soon', 'RTX 5090 stock velocity is rising while discount depth is narrowing.', 'Monitor closely'],
  ['Current price is 18% below average', 'PlayStation 5 bundle crossed the threshold that triggered 4,812 user alerts.', 'Good timing'],
] as const;

function MiniChart({ values, tone = 'success' }: { values: readonly number[]; tone?: 'success' | 'warning' | 'brand' }) {
  const points = values.map((value, index) => `${(index / (values.length - 1)) * 100},${100 - value}`).join(' ');
  const color = tone === 'warning' ? 'text-warning/80' : tone === 'brand' ? 'text-brand-300/80' : 'text-success/80';

  return (
    <svg viewBox="0 0 100 100" className="h-12 w-full overflow-visible" preserveAspectRatio="none" aria-hidden="true">
      <defs>
        <linearGradient id={`chart-${tone}`} x1="0" x2="1" y1="0" y2="0">
          <stop offset="0%" stopColor="currentColor" stopOpacity="0.15" />
          <stop offset="100%" stopColor="currentColor" stopOpacity="0.95" />
        </linearGradient>
      </defs>
      <polyline points={points} fill="none" stroke="currentColor" strokeWidth="9" strokeLinecap="round" strokeLinejoin="round" className={`${color.replace('/80', '/10')} animate-pulse-soft`} />
      <polyline points={points} fill="none" stroke={`url(#chart-${tone})`} strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" className={`${color} drop-shadow-sm`} />
    </svg>
  );
}

export function HeroDashboardMockup() {
  return (
    <div className="relative card premium-panel p-4 sm:p-5 lg:p-6 overflow-hidden shadow-card-hover">
      <div className="absolute right-8 top-8 h-24 w-24 rounded-full bg-success/10 blur-3xl" />
      <div className="relative flex items-center justify-between gap-4 border-b border-border/70 pb-4">
        <div>
          <p className="text-[10px] uppercase tracking-[0.22em] text-brand-300 font-medium">Live dashboard</p>
          <h3 className="text-lg font-semibold text-text-primary mt-1">Monitoring 18 products</h3>
        </div>
        <div className="flex items-center gap-2 rounded-full bg-success/10 border border-success/20 px-3 py-1.5 text-xs text-success">
          <span className="h-2 w-2 rounded-full bg-success animate-pulse-soft" />
          Live
        </div>
      </div>

      <div className="relative grid grid-cols-1 lg:grid-cols-[1.1fr_0.9fr] gap-4 mt-4">
        <div className="rounded-3xl bg-background/35 border border-border/70 p-4">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-xs text-text-muted">Price graph</p>
              <p className="text-sm font-semibold text-text-primary">MacBook Air M4</p>
            </div>
            <span className="badge bg-success/10 text-success border border-success/20">Lowest price detected</span>
          </div>
          <div className="h-36 rounded-2xl bg-background-tertiary/35 border border-border/60 p-4 flex items-end gap-2">
            {[55, 62, 58, 66, 51, 44, 48, 39, 34, 29].map((height, index) => (
              <div key={index} className="flex-1 rounded-t-xl bg-gradient-to-t from-success/80 to-brand-300/40 transition-all duration-500 hover:from-warning/80" style={{ height: `${height}%` }} />
            ))}
          </div>
          <div className="grid grid-cols-3 gap-3 mt-4">
            <div className="rounded-2xl bg-background-tertiary/40 border border-border/60 p-3">
              <p className="text-[10px] uppercase tracking-[0.16em] text-text-muted">current</p>
              <p className="text-sm font-semibold text-text-primary mt-1">$1,199</p>
            </div>
            <div className="rounded-2xl bg-background-tertiary/40 border border-border/60 p-3">
              <p className="text-[10px] uppercase tracking-[0.16em] text-text-muted">drop</p>
              <p className="text-sm font-semibold text-success mt-1">-14.3%</p>
            </div>
            <div className="rounded-2xl bg-background-tertiary/40 border border-border/60 p-3">
              <p className="text-[10px] uppercase tracking-[0.16em] text-text-muted">target</p>
              <p className="text-sm font-semibold text-warning mt-1">Reached</p>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          {[
            ['RTX 5090 Founders Edition', '$1,899', 'Price drop alert'],
            ['iPhone 16 Pro 256GB', '$1,049', 'Watchlist active'],
            ['Samsung Odyssey OLED G9', '$1,099', '90-day low'],
          ].map(([title, price, status]) => (
            <div key={title} className="rounded-3xl bg-background/35 border border-border/70 p-4 hover:border-success/30 transition-all duration-300">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-medium text-text-primary leading-snug">{title}</p>
                  <p className="text-xs text-text-muted mt-1">{status}</p>
                </div>
                <p className="text-sm font-semibold text-text-primary font-mono">{price}</p>
              </div>
              <div className="mt-3 h-1.5 rounded-full bg-background-tertiary overflow-hidden">
                <div className="h-full rounded-full bg-success animate-pulse-soft" style={{ width: title.includes('RTX') ? '78%' : title.includes('iPhone') ? '64%' : '86%' }} />
              </div>
            </div>
          ))}
          <div className="rounded-3xl bg-warning/10 border border-warning/20 p-4 flex items-center gap-3">
            <Bell size={16} className="text-warning" />
            <div>
              <p className="text-sm font-medium text-text-primary">Alert triggered</p>
              <p className="text-xs text-text-muted">Lowest price detected 2 minutes ago</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function ActivityStats() {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
      {activityStats.map(stat => (
        <div key={stat.label} className="card card-hover p-4 text-center">
          <p className="text-xl sm:text-2xl font-semibold tracking-tight text-text-primary font-mono">{stat.value}</p>
          <p className="text-xs text-text-muted mt-1 capitalize">{stat.label}</p>
        </div>
      ))}
    </div>
  );
}

export function LiveDealsSection() {
  return (
    <section id="deals" className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.22em] text-brand-300 mb-2">Live market signals</p>
          <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight text-text-primary">Deals worth watching now</h2>
          <p className="text-sm text-text-secondary mt-2 max-w-2xl">Realistic examples of products crossing meaningful price thresholds, with context instead of noise.</p>
        </div>
        <span className="badge bg-success/10 text-success border border-success/20 self-start sm:self-auto">
          <Activity size={12} />
          Updated every 5 minutes
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-4">
        {liveDeals.map(deal => (
          <article key={deal.title} className="card card-hover overflow-hidden group">
            <div className="aspect-[4/3] bg-background-tertiary/50 border-b border-border/60 overflow-hidden relative">
              <img src={deal.image} alt={deal.title} className="h-full w-full object-cover opacity-90 group-hover:scale-[1.03] transition-all duration-500" loading="lazy" />
              <div className="absolute inset-0 bg-gradient-to-t from-background-secondary/70 via-transparent to-transparent" />
              <span className="absolute left-3 top-3 badge bg-background-secondary/85 text-text-secondary border border-border/80">{deal.retailer}</span>
            </div>
            <div className="p-4 space-y-3">
              <h3 className="text-sm font-semibold text-text-primary leading-snug line-clamp-2 min-h-[2.5rem]">{deal.title}</h3>
              <div className="flex items-end justify-between gap-3">
                <div>
                  <p className="text-xl font-semibold text-text-primary font-mono">{formatCurrency(deal.current)}</p>
                  <p className="text-xs text-text-muted line-through">{formatCurrency(deal.previous)}</p>
                </div>
                <span className="text-sm font-semibold text-success">-{deal.drop}%</span>
              </div>
              <MiniChart values={deal.chart} />
              <div className="flex items-center justify-between gap-2 pt-2 border-t border-border/60">
                <span className="text-[11px] text-success flex items-center gap-1"><TrendingDown size={11} />Lowest in 90 days</span>
                <span className="text-[11px] text-text-muted flex items-center gap-1"><Clock size={11} />{deal.detected}</span>
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

export function WhyPricePulseSection() {
  const oldItems = ['Cluttered watchlists', 'Outdated tables', 'Hard-to-read price history'];
  const newItems = ['Clean product intelligence', 'Modern visual timelines', 'Calm alerts with context'];

  return (
    <section id="features" className="card premium-panel p-5 sm:p-8 overflow-hidden relative">
      <div className="absolute -right-20 -top-20 h-56 w-56 rounded-full bg-brand-600/10 blur-3xl" />
      <div className="relative max-w-2xl">
        <p className="text-xs font-medium uppercase tracking-[0.22em] text-brand-300 mb-2">Why PricePulse</p>
        <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight text-text-primary">Built for modern shoppers. Not spreadsheets.</h2>
        <p className="text-sm text-text-secondary mt-2">PricePulse turns product tracking into a visual, intelligent workflow that feels focused instead of overwhelming.</p>
      </div>
      <div className="relative grid md:grid-cols-2 gap-4 mt-6">
        <div className="rounded-3xl bg-background/35 border border-border/70 p-5">
          <div className="flex items-center gap-2 text-text-muted mb-4"><X size={16} />Old price trackers</div>
          <div className="space-y-3">
            {oldItems.map(item => <p key={item} className="text-sm text-text-secondary flex items-center gap-2"><span className="h-1.5 w-1.5 rounded-full bg-text-muted" />{item}</p>)}
          </div>
        </div>
        <div className="rounded-3xl bg-success/10 border border-success/20 p-5 shadow-glow">
          <div className="flex items-center gap-2 text-success mb-4"><Check size={16} />PricePulse</div>
          <div className="space-y-3">
            {newItems.map(item => <p key={item} className="text-sm text-text-primary flex items-center gap-2"><span className="h-1.5 w-1.5 rounded-full bg-success" />{item}</p>)}
          </div>
        </div>
      </div>
    </section>
  );
}

export function TestimonialsSection() {
  return (
    <section className="space-y-5">
      <div>
        <p className="text-xs font-medium uppercase tracking-[0.22em] text-brand-300 mb-2">Used by focused buyers</p>
        <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight text-text-primary">Specific alerts. Better timing.</h2>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        {testimonials.map(testimonial => (
          <article key={testimonial.name} className="card card-hover p-5">
            <div className="flex items-center gap-3 mb-4">
              <div className="h-10 w-10 rounded-2xl bg-brand-800/70 border border-brand-500/20 flex items-center justify-center text-xs font-semibold text-brand-100">{testimonial.avatar}</div>
              <div>
                <p className="text-sm font-semibold text-text-primary">{testimonial.name}</p>
                <p className="text-xs text-text-muted">{testimonial.role}</p>
              </div>
            </div>
            <p className="text-sm text-text-secondary leading-relaxed">“{testimonial.quote}”</p>
          </article>
        ))}
      </div>
    </section>
  );
}

export function LandingFooter() {
  const links = ['Features', 'Deals', 'Pricing', 'Privacy', 'Terms', 'Contact'];

  return (
    <footer className="border-t border-border/70 py-8">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-2xl bg-brand-700/80 border border-brand-500/20 flex items-center justify-center shadow-glow">
            <TrendingDown size={17} className="text-brand-100" />
          </div>
          <div>
            <p className="text-sm font-semibold text-text-primary">PricePulse</p>
            <p className="text-xs text-text-muted">Real-time price intelligence for smarter purchases.</p>
          </div>
        </div>
        <nav className="flex flex-wrap gap-x-5 gap-y-2 text-sm text-text-muted">
          {links.map(link => <a key={link} href={`#${link.toLowerCase()}`} className="hover:text-text-primary transition-colors">{link}</a>)}
        </nav>
      </div>
    </footer>
  );
}

export function FeaturePillRow() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
      {[
        [Eye, 'Watchlist cards', 'Track products visually'],
        [LineChart, 'Price graphs', 'Spot real trends'],
        [ShieldCheck, 'Smart alerts', 'Act only when it matters'],
      ].map(([Icon, title, body]) => {
        const TypedIcon = Icon as typeof Eye;
        return (
          <div key={title as string} className="rounded-2xl bg-background-tertiary/45 border border-border/60 p-3 flex items-center gap-3">
            <TypedIcon size={16} className="text-brand-300" />
            <div>
              <p className="text-xs font-semibold text-text-primary">{title as string}</p>
              <p className="text-[11px] text-text-muted">{body as string}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export function HeroSignalStrip() {
  return (
    <div className="flex flex-wrap items-center gap-2 text-xs text-text-secondary">
      <span className="badge bg-success/10 text-success border border-success/20"><Sparkles size={12} />Lowest price alerts</span>
      <span className="badge bg-brand-800/30 text-brand-200 border border-brand-500/20"><Monitor size={12} />Live monitoring</span>
      <span className="badge bg-background-tertiary/70 text-text-secondary border border-border/80"><Cpu size={12} />Context-aware signals</span>
    </div>
  );
}

export function LiveMarketActivitySection() {
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const interval = window.setInterval(() => {
      setActiveIndex(index => (index + 1) % marketActivity.length);
    }, 2600);

    return () => window.clearInterval(interval);
  }, []);

  return (
    <section className="card premium-panel p-5 sm:p-6 overflow-hidden relative">
      <div className="absolute inset-0 opacity-[0.06] bg-[linear-gradient(to_right,#8EB4AF_1px,transparent_1px),linear-gradient(to_bottom,#8EB4AF_1px,transparent_1px)] bg-[size:28px_28px]" />
      <div className="relative flex flex-col lg:flex-row lg:items-center justify-between gap-5">
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.22em] text-brand-300 mb-2">Live market activity</p>
          <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight text-text-primary">Signals moving right now</h2>
          <p className="text-sm text-text-secondary mt-2 max-w-2xl">A quiet feed of simulated platform activity that shows how shoppers, alerts, and market prices move together.</p>
        </div>
        <div className="flex flex-wrap gap-2 text-xs">
          <span className="badge bg-success/10 text-success border border-success/20"><Radio size={12} />Updated moments ago</span>
          <span className="badge bg-background-tertiary/60 text-text-secondary border border-border/80">Tracking prices 24/7</span>
        </div>
      </div>

      <div className="relative grid md:grid-cols-2 lg:grid-cols-3 gap-3 mt-6">
        {marketActivity.map((item, index) => (
          <div key={item} className={`rounded-3xl border p-4 transition-all duration-500 ${activeIndex === index ? 'bg-success/10 border-success/25 shadow-glow' : 'bg-background/35 border-border/70'}`}>
            <div className="flex items-start gap-3">
              <span className={`mt-1.5 h-2 w-2 rounded-full flex-shrink-0 ${activeIndex === index ? 'bg-success animate-pulse-soft' : 'bg-text-muted'}`} />
              <div>
                <p className="text-sm font-medium text-text-primary leading-snug">{item}</p>
                <p className="text-xs text-text-muted mt-1">{index + 2} min confidence window</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

export function MostTrackedSection() {
  return (
    <section className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.22em] text-brand-300 mb-2">Community momentum</p>
          <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight text-text-primary">Most tracked this week</h2>
          <p className="text-sm text-text-secondary mt-2 max-w-2xl">Top watched products across gaming, Apple, hardware, monitors, and audio.</p>
        </div>
        <span className="badge bg-brand-800/30 text-brand-200 border border-brand-500/20 self-start sm:self-auto">Monitoring 1.2M+ products</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-4">
        {mostTrackedProducts.map(([title, image, trackers, price, movement, chart], index) => (
          <article key={title} className="card card-hover overflow-hidden group">
            <div className="aspect-[4/3] bg-background-tertiary/50 border-b border-border/60 overflow-hidden relative">
              <img src={image} alt={title} className="h-full w-full object-cover opacity-90 group-hover:scale-[1.03] transition-all duration-500" loading="lazy" />
              <div className="absolute inset-0 bg-gradient-to-t from-background-secondary/75 via-transparent to-transparent" />
              <span className="absolute left-3 top-3 badge bg-background-secondary/85 text-text-secondary border border-border/80">#{index + 1}</span>
            </div>
            <div className="p-4 space-y-3">
              <h3 className="text-sm font-semibold text-text-primary leading-snug line-clamp-2 min-h-[2.5rem]">{title}</h3>
              <div className="flex items-end justify-between gap-3">
                <div>
                  <p className="text-lg font-semibold text-text-primary font-mono">{formatCurrency(price)}</p>
                  <p className="text-xs text-text-muted">{trackers.toLocaleString()} trackers</p>
                </div>
                <span className="text-sm font-semibold text-success">{movement}%</span>
              </div>
              <MiniChart values={chart} tone="brand" />
              <div className="h-1.5 rounded-full bg-background-tertiary overflow-hidden">
                <div className="h-full rounded-full bg-success/80" style={{ width: `${Math.max(34, 92 - index * 5)}%` }} />
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

export function BiggestDropsSection() {
  return (
    <section className="space-y-5">
      <div>
        <p className="text-xs font-medium uppercase tracking-[0.22em] text-brand-300 mb-2">Ranked by verified drop</p>
        <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight text-text-primary">Biggest price drops today</h2>
        <p className="text-sm text-text-secondary mt-2 max-w-2xl">The strongest daily movements, ranked with historical context and urgency labels.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        {biggestDrops.map(([title, oldPrice, currentPrice, saved, retailer, lowest, urgency, chart], index) => (
          <article key={title} className={`card card-hover p-5 ${index === 0 ? 'lg:col-span-2 premium-panel' : ''}`}>
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-3">
                <span className="h-9 w-9 rounded-2xl bg-warning/10 border border-warning/20 flex items-center justify-center text-sm font-semibold text-warning">#{index + 1}</span>
                <div>
                  <h3 className="text-sm font-semibold text-text-primary leading-snug">{title}</h3>
                  <p className="text-xs text-text-muted mt-1">{retailer}</p>
                </div>
              </div>
              <span className="badge bg-warning/10 text-warning border border-warning/20">{urgency}</span>
            </div>
            <div className="grid grid-cols-2 gap-3 mt-5">
              <div>
                <p className="text-xs text-text-muted">Current</p>
                <p className="text-2xl font-semibold text-text-primary font-mono">{formatCurrency(currentPrice)}</p>
              </div>
              <div className="text-right">
                <p className="text-xs text-text-muted">Was</p>
                <p className="text-sm text-text-muted line-through font-mono">{formatCurrency(oldPrice)}</p>
                <p className="text-sm font-semibold text-success">{saved}% saved</p>
              </div>
            </div>
            <div className="mt-4"><MiniChart values={chart} tone={index === 0 ? 'warning' : 'success'} /></div>
            <div className="mt-4 pt-3 border-t border-border/60 flex items-center justify-between gap-3">
              <span className="text-xs text-success">{lowest}</span>
              <span className="text-xs text-text-muted">Data refreshed every 5 minutes</span>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

export function PricePulseIntelligenceSection() {
  return (
    <section className="card premium-panel p-5 sm:p-8 relative overflow-hidden">
      <div className="absolute -left-20 top-0 h-56 w-56 rounded-full bg-success/10 blur-3xl" />
      <div className="relative flex flex-col lg:flex-row lg:items-end justify-between gap-4">
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.22em] text-brand-300 mb-2">PricePulse intelligence</p>
          <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight text-text-primary">Data-driven context before you buy</h2>
          <p className="text-sm text-text-secondary mt-2 max-w-2xl">Calm insight cards explain whether a movement is meaningful, unusual, or worth waiting on.</p>
        </div>
        <span className="badge bg-background-tertiary/60 text-text-secondary border border-border/80"><Cpu size={12} />No hype. Just price context.</span>
      </div>
      <div className="relative grid md:grid-cols-2 xl:grid-cols-4 gap-4 mt-6">
        {intelligenceInsights.map(([title, body, signal]) => (
          <article key={title} className="rounded-3xl bg-background/35 border border-border/70 p-5 hover:border-brand-500/30 transition-all duration-300">
            <div className="h-10 w-10 rounded-2xl bg-brand-800/40 border border-brand-500/20 flex items-center justify-center mb-4">
              <Sparkles size={16} className="text-brand-200" />
            </div>
            <h3 className="text-sm font-semibold text-text-primary">{title}</h3>
            <p className="text-sm text-text-secondary leading-relaxed mt-2">{body}</p>
            <p className="text-xs text-success mt-4">{signal}</p>
          </article>
        ))}
      </div>
    </section>
  );
}

export function SmartAlertsShowcase() {
  const flow = [
    [Eye, 'Track product', 'Add an item to your watchlist'],
    [TrendingDown, 'Price drops', 'Price crosses your target range'],
    [Bell, 'Alert triggers', 'Push and email notifications are prepared'],
    [Zap, 'Buy with context', 'Act with price history behind you'],
  ] as const;

  return (
    <section className="grid lg:grid-cols-[0.9fr_1.1fr] gap-5 lg:gap-6 items-stretch">
      <div className="card p-6 sm:p-7">
        <p className="text-xs font-medium uppercase tracking-[0.22em] text-brand-300 mb-2">Smart alerts</p>
        <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight text-text-primary">From watchlist to useful notification</h2>
        <p className="text-sm text-text-secondary mt-2">A clear alert flow makes PricePulse feel useful after signup, not just beautiful on day one.</p>
        <div className="space-y-3 mt-6">
          {flow.map(([Icon, title, body], index) => (
            <div key={title} className="flex items-center gap-3 rounded-2xl bg-background-tertiary/45 border border-border/60 p-3">
              <div className="h-9 w-9 rounded-2xl bg-success/10 border border-success/20 flex items-center justify-center text-success">
                <Icon size={15} />
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-text-primary">{index + 1}. {title}</p>
                <p className="text-xs text-text-muted">{body}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="card premium-panel p-5 sm:p-6 relative overflow-hidden">
        <div className="absolute right-8 top-8 h-28 w-28 rounded-full bg-warning/10 blur-3xl" />
        <div className="relative grid md:grid-cols-2 gap-4">
          <div className="rounded-3xl bg-background/35 border border-border/70 p-4">
            <div className="flex items-center gap-2 text-xs text-text-muted mb-4"><Settings size={13} />Watchlist settings</div>
            <p className="text-sm font-semibold text-text-primary">iPhone 16 Pro</p>
            <div className="mt-4 space-y-3">
              <div className="flex justify-between text-xs"><span className="text-text-muted">Target price</span><span className="text-warning">$1,049</span></div>
              <div className="h-2 rounded-full bg-background-tertiary overflow-hidden"><div className="h-full w-[72%] rounded-full bg-warning" /></div>
              <div className="flex justify-between text-xs"><span className="text-text-muted">Alert sensitivity</span><span className="text-success">Balanced</span></div>
            </div>
          </div>
          <div className="space-y-4">
            <div className="rounded-3xl bg-background/35 border border-success/20 p-4 shadow-glow">
              <div className="flex items-center gap-2 text-xs text-success mb-3"><Bell size={13} />Push notification</div>
              <p className="text-sm font-semibold text-text-primary">Price alert triggered</p>
              <p className="text-xs text-text-muted mt-1">iPhone 16 Pro reached your target at $1,049.</p>
            </div>
            <div className="rounded-3xl bg-background/35 border border-border/70 p-4">
              <div className="flex items-center gap-2 text-xs text-text-muted mb-3"><Mail size={13} />Email preview</div>
              <p className="text-sm font-semibold text-text-primary">Lowest price in 90 days</p>
              <p className="text-xs text-text-muted mt-1">Includes price history, retailer, and context.</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
