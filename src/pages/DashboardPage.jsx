import {
  ArrowRight,
  BadgeCheck,
  Compass,
  Handshake,
  HeartHandshake,
  Home,
  KeyRound,
  MapPin,
  MessageCircle,
  Search,
  ShieldCheck,
  Sparkles,
  Users,
} from 'lucide-react';

const values = [
  {
    icon: Compass,
    title: 'Clear guidance',
    description: 'We make each step easier to understand, from the first conversation to the final handover.',
  },
  {
    icon: HeartHandshake,
    title: 'People first',
    description: 'Your needs, pace and priorities shape the journey—not pressure or a one-size-fits-all pitch.',
  },
  {
    icon: ShieldCheck,
    title: 'Trusted support',
    description: 'We believe good property decisions begin with honest information and dependable follow-through.',
  },
];

const journey = [
  { number: '01', icon: MessageCircle, title: 'Tell us your goals', description: 'Share what you are looking for, your preferred area and what matters most to you.' },
  { number: '02', icon: Search, title: 'Explore your options', description: 'We help you compare suitable choices with practical, easy-to-follow information.' },
  { number: '03', icon: KeyRound, title: 'Move with confidence', description: 'Get steady support through the next steps, right up to your new beginning.' },
];

const teamPlaceholders = [
  { initials: 'TL', role: 'Team Leader', description: 'Guiding the team and helping every client journey stay on track.' },
  { initials: 'PC', role: 'Property Consultant', description: 'Listening to your needs and connecting you with suitable opportunities.' },
  { initials: 'CS', role: 'Client Support', description: 'Keeping communication clear, helpful and responsive from start to finish.' },
];

export default function DashboardPage() {
  const scrollTo = (sectionId) => {
    document.getElementById(sectionId)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <div className="team-landing overflow-hidden rounded-[2rem] border border-white/70 bg-white/55 shadow-soft">
      <section className="relative min-h-[620px] overflow-hidden px-6 py-10 sm:px-10 lg:px-14 lg:py-14">
        <div className="absolute -right-24 -top-28 h-80 w-80 rounded-full bg-amber-200/40 blur-3xl" />
        <div className="absolute -bottom-40 left-1/4 h-96 w-96 rounded-full bg-cyan-200/30 blur-3xl" />

        <div className="relative z-10 grid min-h-[520px] items-center gap-12 lg:grid-cols-[0.92fr_1.08fr]">
          <div className="max-w-xl">
            <div className="mb-7 inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-white/80 px-4 py-2 text-xs font-bold uppercase tracking-[0.18em] text-emerald-700 shadow-sm">
              <Sparkles size={15} />
              Meet Infinite Property Team
            </div>
            <h1 className="text-4xl font-black leading-[1.05] tracking-[-0.045em] text-slate-950 sm:text-5xl lg:text-6xl">
              Property decisions,
              <span className="mt-2 block text-emerald-600">made more human.</span>
            </h1>
            <p className="mt-6 max-w-lg text-base font-medium leading-7 text-slate-600 sm:text-lg">
              We are a Malaysian property team helping people explore their next move with clarity, care and confidence.
            </p>
            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <button
                type="button"
                onClick={() => scrollTo('our-story')}
                className="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-slate-950 px-6 text-sm font-bold text-white transition hover:-translate-y-0.5 hover:bg-emerald-700"
              >
                Get to know us <ArrowRight size={17} />
              </button>
              <button
                type="button"
                onClick={() => scrollTo('contact')}
                className="inline-flex h-12 items-center justify-center gap-2 rounded-full border border-slate-300 bg-white/80 px-6 text-sm font-bold text-slate-800 transition hover:-translate-y-0.5 hover:border-emerald-400"
              >
                Start a conversation
              </button>
            </div>

            <div className="mt-10 flex flex-wrap gap-x-6 gap-y-3 text-sm font-semibold text-slate-600">
              <span className="inline-flex items-center gap-2"><BadgeCheck size={17} className="text-emerald-600" /> Friendly guidance</span>
              <span className="inline-flex items-center gap-2"><MapPin size={17} className="text-emerald-600" /> Malaysia focused</span>
            </div>
          </div>

          <div className="relative mx-auto w-full max-w-2xl lg:ml-auto">
            <div className="absolute -left-5 top-12 z-20 rounded-2xl border border-white/80 bg-white/90 p-4 shadow-xl backdrop-blur sm:-left-10">
              <div className="flex items-center gap-3">
                <span className="grid h-10 w-10 place-items-center rounded-full bg-emerald-100 text-emerald-700"><Home size={19} /></span>
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Our purpose</p>
                  <p className="text-sm font-bold text-slate-900">Helping you feel at home</p>
                </div>
              </div>
            </div>
            <div className="hero-image-frame relative overflow-hidden rounded-[2rem] border-[6px] border-white shadow-2xl">
              <img
                src="/images/ChatGPT Image Jun 12, 2026, 11_53_39 AM.png"
                alt="A welcoming modern home at dusk"
                className="h-[470px] w-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/30 via-transparent to-transparent" />
            </div>
            <div className="absolute -bottom-6 right-3 z-20 max-w-[240px] rounded-2xl bg-emerald-600 p-5 text-white shadow-xl sm:right-8">
              <Handshake size={22} />
              <p className="mt-3 text-sm font-bold leading-5">A better property journey begins with a good conversation.</p>
            </div>
          </div>
        </div>
      </section>

      <section id="our-story" className="scroll-mt-24 bg-slate-950 px-6 py-20 text-white sm:px-10 lg:px-14">
        <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-20">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.22em] text-emerald-400">Who we are</p>
            <h2 className="mt-4 text-3xl font-black tracking-[-0.035em] sm:text-4xl">More than a property team.</h2>
          </div>
          <div>
            <p className="text-lg font-medium leading-8 text-slate-200">
              Infinite Property Team is built around a simple belief: finding a property should feel exciting, informed and personal.
            </p>
            <p className="mt-4 leading-7 text-slate-400">
              Whether someone is searching for a first home, considering an investment or simply learning what is possible, our role is to listen well and make the road ahead clearer.
            </p>
          </div>
        </div>
      </section>

      <section className="px-6 py-20 sm:px-10 lg:px-14">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-xs font-bold uppercase tracking-[0.22em] text-emerald-700">What matters to us</p>
          <h2 className="mt-4 text-3xl font-black tracking-[-0.035em] text-slate-950 sm:text-4xl">A thoughtful way to move forward.</h2>
          <p className="mt-4 leading-7 text-slate-600">Our approach is simple, supportive and focused on the person behind every decision.</p>
        </div>
        <div className="mt-12 grid gap-5 md:grid-cols-3">
          {values.map(({ icon: Icon, title, description }) => (
            <article key={title} className="group rounded-3xl border border-slate-200 bg-white/80 p-7 transition hover:-translate-y-1 hover:border-emerald-300 hover:shadow-soft">
              <span className="grid h-12 w-12 place-items-center rounded-2xl bg-emerald-100 text-emerald-700 transition group-hover:bg-emerald-600 group-hover:text-white"><Icon size={22} /></span>
              <h3 className="mt-6 text-xl font-black text-slate-950">{title}</h3>
              <p className="mt-3 text-sm leading-6 text-slate-600">{description}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="border-y border-slate-200 bg-white/60 px-6 py-20 sm:px-10 lg:px-14">
        <div className="grid gap-12 lg:grid-cols-[0.75fr_1.25fr]">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.22em] text-emerald-700">How we help</p>
            <h2 className="mt-4 text-3xl font-black tracking-[-0.035em] text-slate-950 sm:text-4xl">From “maybe” to moving day.</h2>
            <p className="mt-4 max-w-md leading-7 text-slate-600">A straightforward journey designed to keep you informed at every stage.</p>
          </div>
          <div className="space-y-4">
            {journey.map(({ number, icon: Icon, title, description }) => (
              <article key={number} className="flex gap-5 rounded-2xl border border-slate-200 bg-white p-5 sm:items-center">
                <span className="hidden text-sm font-black text-emerald-600 sm:block">{number}</span>
                <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-slate-950 text-white"><Icon size={19} /></span>
                <div>
                  <h3 className="font-black text-slate-950">{title}</h3>
                  <p className="mt-1 text-sm leading-6 text-slate-600">{description}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="px-6 py-20 sm:px-10 lg:px-14">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.22em] text-emerald-700">The people behind Infinite</p>
            <h2 className="mt-4 text-3xl font-black tracking-[-0.035em] text-slate-950 sm:text-4xl">Meet the team.</h2>
          </div>
          <p className="max-w-md text-sm leading-6 text-slate-500">Team profiles are ready to be updated once names, photos and contact details are available.</p>
        </div>
        <div className="mt-10 grid gap-5 md:grid-cols-3">
          {teamPlaceholders.map((member, index) => (
            <article key={member.role} className="overflow-hidden rounded-3xl border border-slate-200 bg-white">
              <div className={`grid h-52 place-items-center ${index === 1 ? 'bg-amber-100' : index === 2 ? 'bg-cyan-100' : 'bg-emerald-100'}`}>
                <div className="grid h-24 w-24 place-items-center rounded-full border-4 border-white/80 bg-white/65 text-2xl font-black text-slate-800 shadow-lg">{member.initials}</div>
              </div>
              <div className="p-6">
                <p className="text-xs font-bold uppercase tracking-widest text-emerald-700">Profile coming soon</p>
                <h3 className="mt-2 text-xl font-black text-slate-950">{member.role}</h3>
                <p className="mt-3 text-sm leading-6 text-slate-600">{member.description}</p>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section id="contact" className="scroll-mt-24 px-4 pb-4 sm:px-6 sm:pb-6">
        <div className="relative overflow-hidden rounded-[1.75rem] bg-emerald-600 px-6 py-14 text-center text-white sm:px-10">
          <div className="absolute -left-16 -top-20 h-56 w-56 rounded-full border-[40px] border-white/10" />
          <div className="absolute -bottom-24 -right-12 h-64 w-64 rounded-full bg-slate-950/15" />
          <div className="relative mx-auto max-w-2xl">
            <Users className="mx-auto" size={29} />
            <h2 className="mt-5 text-3xl font-black tracking-[-0.035em] sm:text-4xl">Let’s talk about what’s next.</h2>
            <p className="mx-auto mt-4 max-w-xl leading-7 text-white/80">When the team’s official contact details are ready, this section can connect visitors directly to WhatsApp, email or an enquiry form.</p>
            <span className="mt-8 inline-flex h-12 items-center justify-center rounded-full bg-white px-6 text-sm font-bold text-emerald-800 shadow-lg">
              Contact details coming soon
            </span>
          </div>
        </div>
      </section>
    </div>
  );
}
