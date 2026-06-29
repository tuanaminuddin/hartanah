import {
  ArrowRight,
  BadgeCheck,
  Building2,
  HeartHandshake,
  Home,
  KeyRound,
  MapPin,
  MessageCircle,
  Search,
  ShieldCheck,
  Users,
} from 'lucide-react';

const services = [
  {
    icon: Search,
    title: 'Property discovery',
    description: 'We narrow the search around your location, budget and plans, so every option is worth considering.',
  },
  {
    icon: Building2,
    title: 'Project guidance',
    description: 'We explain project details, packages and practical differences in language that is easy to follow.',
  },
  {
    icon: KeyRound,
    title: 'Purchase support',
    description: 'From your first question to handover, our team keeps the next step clear and the conversation moving.',
  },
];

const teamRoles = [
  {
    icon: Users,
    title: 'Team leadership',
    description: 'Keeping client journeys, project knowledge and team support moving in the same direction.',
  },
  {
    icon: Home,
    title: 'Property consultants',
    description: 'Listening carefully, comparing suitable projects and helping buyers make informed decisions.',
  },
  {
    icon: MessageCircle,
    title: 'Client support',
    description: 'Making communication responsive and straightforward before, during and after a property enquiry.',
  },
];

export default function DashboardPage() {
  return (
    <div className="team-landing bg-white">
      <section id="home" className="team-hero relative isolate min-h-[min(760px,calc(100vh-3rem))] overflow-hidden">
        <img
          src="/images/ChatGPT Image Jun 12, 2026, 11_53_39 AM.png"
          alt="Modern family home at dusk"
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(8,15,24,0.90)_0%,rgba(8,15,24,0.70)_43%,rgba(8,15,24,0.12)_78%)]" />

        <div className="relative mx-auto flex min-h-[min(760px,calc(100vh-3rem))] max-w-7xl items-end px-5 pb-16 pt-28 sm:px-8 sm:pb-20 lg:items-center lg:px-10 lg:py-20">
          <div className="max-w-2xl text-white">
            <div className="mb-6 flex items-center gap-3">
              <img
                src="/images/logo_infinite.jpeg"
                alt=""
                className="h-12 w-12 rounded-full border border-white/40 bg-white object-cover"
              />
              <p className="text-sm font-bold uppercase tracking-[0.16em] text-amber-300">
                FLP Agency Partner
              </p>
            </div>

            <h1 className="text-4xl font-black leading-[1.06] sm:text-5xl lg:text-6xl">
              Infinite Property Team
            </h1>
            <p className="mt-5 max-w-xl text-lg font-medium leading-8 text-white/85 sm:text-xl">
              Practical property guidance for Malaysians looking for a home, an investment or a clearer next move.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <a
                href="#contact"
                className="inline-flex h-12 items-center justify-center gap-2 rounded-lg bg-amber-400 px-6 text-sm font-bold text-slate-950 transition hover:bg-amber-300"
              >
                Talk to our team
                <ArrowRight size={17} />
              </a>
              <a
                href="#about"
                className="inline-flex h-12 items-center justify-center rounded-lg border border-white/45 bg-white/10 px-6 text-sm font-bold text-white backdrop-blur-sm transition hover:bg-white/20"
              >
                Get to know us
              </a>
            </div>

            <div className="mt-9 flex flex-wrap gap-x-6 gap-y-3 text-sm font-semibold text-white/80">
              <span className="inline-flex items-center gap-2">
                <MapPin size={17} className="text-amber-300" />
                Malaysia focused
              </span>
              <span className="inline-flex items-center gap-2">
                <BadgeCheck size={17} className="text-amber-300" />
                Clear, personal guidance
              </span>
            </div>
          </div>
        </div>
      </section>

      <section id="about" className="scroll-mt-20 border-b border-slate-200 bg-white">
        <div className="mx-auto grid max-w-7xl gap-10 px-5 py-16 sm:px-8 lg:grid-cols-[0.85fr_1.15fr] lg:gap-20 lg:px-10 lg:py-24">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-amber-700">About Infinite</p>
            <h2 className="mt-4 text-3xl font-black leading-tight text-slate-950 sm:text-4xl">
              Property is personal. Our advice should be too.
            </h2>
          </div>
          <div className="lg:pt-6">
            <p className="text-lg font-semibold leading-8 text-slate-700">
              We are a Malaysian property team that helps buyers understand their options before making a big decision.
            </p>
            <p className="mt-4 leading-7 text-slate-600">
              Our work starts with listening. We learn what matters to you, share relevant project information and stay available as questions arise. No unnecessary pressure, just useful guidance and dependable follow-through.
            </p>
            <div className="mt-7 grid gap-4 sm:grid-cols-2">
              <div className="flex items-start gap-3 border-l-2 border-amber-400 pl-4">
                <HeartHandshake className="mt-0.5 shrink-0 text-emerald-700" size={21} />
                <p className="text-sm font-bold leading-6 text-slate-800">People before property</p>
              </div>
              <div className="flex items-start gap-3 border-l-2 border-amber-400 pl-4">
                <ShieldCheck className="mt-0.5 shrink-0 text-emerald-700" size={21} />
                <p className="text-sm font-bold leading-6 text-slate-800">Honest information, clearly shared</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="services" className="scroll-mt-20 bg-slate-50">
        <div className="mx-auto max-w-7xl px-5 py-16 sm:px-8 lg:px-10 lg:py-24">
          <div className="max-w-2xl">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-emerald-700">How we help</p>
            <h2 className="mt-4 text-3xl font-black text-slate-950 sm:text-4xl">A simpler path from enquiry to keys.</h2>
            <p className="mt-4 leading-7 text-slate-600">
              Support built around the questions real buyers ask at each stage of the journey.
            </p>
          </div>

          <div className="mt-10 grid border-y border-slate-200 md:grid-cols-3 md:divide-x md:divide-slate-200">
            {services.map(({ icon: Icon, title, description }, index) => (
              <article key={title} className={`py-8 md:px-7 lg:px-9 ${index > 0 ? 'border-t border-slate-200 md:border-t-0' : ''}`}>
                <span className="grid h-11 w-11 place-items-center rounded-lg bg-emerald-700 text-white">
                  <Icon size={21} />
                </span>
                <h3 className="mt-6 text-xl font-black text-slate-950">{title}</h3>
                <p className="mt-3 text-sm leading-6 text-slate-600">{description}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="team" className="scroll-mt-20 bg-slate-950 text-white">
        <div className="mx-auto max-w-7xl px-5 py-16 sm:px-8 lg:px-10 lg:py-24">
          <div className="grid gap-12 lg:grid-cols-[0.75fr_1.25fr] lg:gap-20">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-amber-300">Our team</p>
              <h2 className="mt-4 text-3xl font-black sm:text-4xl">One team around your property journey.</h2>
              <p className="mt-5 leading-7 text-slate-300">
                Infinite brings together guidance, project knowledge and client support so you always know who to turn to next.
              </p>
            </div>

            <div className="divide-y divide-white/15 border-y border-white/15">
              {teamRoles.map(({ icon: Icon, title, description }) => (
                <article key={title} className="grid gap-4 py-6 sm:grid-cols-[3rem_0.7fr_1.3fr] sm:items-center sm:gap-6">
                  <span className="grid h-11 w-11 place-items-center rounded-lg bg-amber-400 text-slate-950">
                    <Icon size={21} />
                  </span>
                  <h3 className="text-lg font-black">{title}</h3>
                  <p className="text-sm leading-6 text-slate-300">{description}</p>
                </article>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section id="contact" className="scroll-mt-20 bg-amber-400">
        <div className="mx-auto flex max-w-7xl flex-col gap-8 px-5 py-14 sm:px-8 lg:flex-row lg:items-center lg:justify-between lg:px-10 lg:py-16">
          <div className="max-w-2xl">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-amber-900">Start a conversation</p>
            <h2 className="mt-3 text-3xl font-black text-slate-950 sm:text-4xl">Tell us what you are looking for.</h2>
            <p className="mt-3 leading-7 text-slate-800">
              Whether you are ready to view properties or only beginning your research, our team is ready to listen.
            </p>
          </div>
          <a
            href="https://infiniteproperty.com.my"
            target="_blank"
            rel="noreferrer"
            className="inline-flex h-12 shrink-0 items-center justify-center gap-2 rounded-lg bg-slate-950 px-6 text-sm font-bold text-white transition hover:bg-emerald-800"
          >
            <MessageCircle size={18} />
            Visit Infinite Property
          </a>
        </div>
      </section>
    </div>
  );
}
