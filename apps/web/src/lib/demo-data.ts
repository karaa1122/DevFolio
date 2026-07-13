import {
  PortfolioSchema,
  ResumeSchema,
  getPortfolioTemplate,
  type Portfolio,
  type PortfolioTemplateId,
  type Resume,
} from '@devfolio/shared';

/**
 * Demo portfolios & resumes for the public showcase pages.
 *
 * These are static, clearly-labelled examples — no rows in the database, no
 * fake registered users. They're parsed through the real shared schemas so
 * they render through the exact same PortfolioRenderer / ResumeRenderer as
 * live user content, defaults included.
 */

export const DEMO_CATEGORIES = [
  'Backend Developer',
  'Frontend Developer',
  'Full Stack Developer',
  'Student Developer',
  'DevOps Engineer',
] as const;

export type DemoCategory = (typeof DEMO_CATEGORIES)[number];

export interface DemoProfile {
  slug: string;
  category: DemoCategory;
  name: string;
  title: string;
  bio: string;
  skills: string[];
  featuredProjects: string[];
  template: PortfolioTemplateId;
  portfolio: Portfolio;
}

// Fixed, obviously-synthetic uuids (schema requires uuid ids).
const demoUuid = (n: number) => `00000000-0000-4000-8000-${String(n).padStart(12, '0')}`;
let sectionSeq = 0;
const sid = () => `demo-s${++sectionSeq}`;

interface DemoInput {
  n: number;
  slug: string;
  category: DemoCategory;
  template: PortfolioTemplateId;
  name: string;
  title: string;
  location: string;
  bio: string;
  about: string;
  highlights: string[];
  skills: Record<string, never> | { items: string[] };
  skillItems: string[];
  projects: Array<{ title: string; description: string; tags: string[] }>;
  experience: Array<{
    company: string;
    role: string;
    start: string;
    end?: string;
    highlights: string[];
  }>;
  education: { institution: string; degree: string; start: string; end: string };
  email: string;
}

function demoProfile(input: DemoInput): DemoProfile {
  const heroId = sid();
  const aboutId = sid();
  const experienceId = sid();
  const projectsId = sid();
  const skillsId = sid();
  const educationId = sid();
  const contactId = sid();

  const portfolio = PortfolioSchema.parse({
    id: demoUuid(input.n),
    slug: `demo-${input.slug}`,
    userId: demoUuid(900 + input.n),
    template: input.template,
    theme: getPortfolioTemplate(input.template).suggestedTheme,
    layout: {
      sectionsOrder: [heroId, aboutId, experienceId, projectsId, skillsId, educationId, contactId],
    },
    sections: [
      {
        id: heroId,
        type: 'hero',
        data: {
          name: input.name,
          title: input.title,
          bio: input.bio,
          location: input.location,
          availableForWork: true,
          cta: { label: 'Get in touch', href: `#${contactId}`, variant: 'primary' },
        },
      },
      {
        id: aboutId,
        type: 'about',
        data: { heading: 'About', bio: input.about, highlights: input.highlights },
      },
      {
        id: experienceId,
        type: 'experience',
        data: {
          heading: 'Experience',
          layout: 'timeline',
          items: input.experience.map((e) => ({
            id: sid(),
            company: e.company,
            role: e.role,
            startDate: e.start,
            endDate: e.end,
            current: !e.end,
            highlights: e.highlights,
          })),
        },
      },
      {
        id: projectsId,
        type: 'projects',
        data: {
          heading: 'Projects',
          subheading: 'Selected work',
          items: input.projects.map((p, i) => ({
            id: sid(),
            title: p.title,
            description: p.description,
            tags: p.tags,
            featured: i === 0,
            status: 'completed',
          })),
          layout: 'grid',
        },
      },
      {
        id: skillsId,
        type: 'skills',
        data: {
          heading: 'Skills',
          items: input.skillItems.map((name) => ({ id: sid(), name })),
          layout: 'tags',
        },
      },
      {
        id: educationId,
        type: 'education',
        data: {
          heading: 'Education',
          items: [
            {
              id: sid(),
              institution: input.education.institution,
              degree: input.education.degree,
              startDate: input.education.start,
              endDate: input.education.end,
            },
          ],
        },
      },
      {
        id: contactId,
        type: 'contact',
        data: {
          heading: 'Get In Touch',
          email: input.email,
          socials: { github: 'https://github.com', linkedin: 'https://linkedin.com' },
          showContactForm: false,
        },
      },
    ],
    metadata: {
      title: `${input.name} — ${input.title}`,
      description: input.bio,
    },
  });

  return {
    slug: input.slug,
    category: input.category,
    name: input.name,
    title: input.title,
    bio: input.bio,
    skills: input.skillItems.slice(0, 5),
    featuredProjects: input.projects.slice(0, 3).map((p) => p.title),
    template: input.template,
    portfolio,
  };
}

export const DEMO_PROFILES: DemoProfile[] = [
  demoProfile({
    n: 1,
    slug: 'rebin-rasul',
    category: 'Backend Developer',
    template: 'terminal',
    name: 'Rebin Rasul',
    title: 'Backend Developer',
    location: 'Erbil, Iraq',
    bio: 'I build payment systems and APIs that stay up when traffic doesn’t.',
    about:
      'Backend developer with 5 years of experience designing services in NestJS and Django. I care about idempotency, observability, and the boring reliability work most people skip.',
    highlights: ['5+ years building APIs', 'Handled 2M+ daily transactions', 'OSS contributor'],
    skills: {},
    skillItems: ['NestJS', 'Django', 'PostgreSQL', 'Redis', 'Docker', 'RabbitMQ'],
    projects: [
      {
        title: 'Ledger — payment system',
        description:
          'Double-entry payment core with idempotent transfers, webhooks and reconciliation jobs.',
        tags: ['NestJS', 'PostgreSQL', 'Redis'],
      },
      {
        title: 'E-commerce API',
        description: 'Catalog, cart and order APIs powering three storefronts from one backend.',
        tags: ['Django', 'DRF', 'Celery'],
      },
      {
        title: 'Notification service',
        description: 'Multi-channel (email/SMS/push) fan-out with per-tenant rate limiting.',
        tags: ['RabbitMQ', 'Redis', 'Docker'],
      },
    ],
    experience: [
      {
        company: 'Nawa Pay',
        role: 'Backend Engineer',
        start: '2022-03',
        highlights: [
          'Designed a double-entry ledger processing 2M+ daily transactions with zero balance drift',
          'Cut p99 API latency from 800ms to 120ms with read replicas and Redis caching',
        ],
      },
      {
        company: 'Softline',
        role: 'Junior Backend Developer',
        start: '2020-01',
        end: '2022-02',
        highlights: ['Built REST APIs for an e-commerce platform serving 60k monthly users'],
      },
    ],
    education: {
      institution: 'Salahaddin University',
      degree: 'B.Sc. Computer Science',
      start: '2016',
      end: '2020',
    },
    email: 'rebin@example.com',
  }),
  demoProfile({
    n: 2,
    slug: 'helin-ahmad',
    category: 'Backend Developer',
    template: 'minimal',
    name: 'Helin Ahmad',
    title: 'Senior Backend Engineer',
    location: 'Berlin, Germany',
    bio: 'Distributed systems engineer — queues, consistency and clean domain models.',
    about:
      'I spent the last seven years scaling event-driven systems in Go and Node. Currently deep in stream processing and making on-call quiet again.',
    highlights: ['Scaled to 40k req/s', 'Led a team of 6', 'Speaker at GoDays'],
    skills: {},
    skillItems: ['Go', 'Node.js', 'Kafka', 'PostgreSQL', 'Kubernetes'],
    projects: [
      {
        title: 'Streamline',
        description: 'Exactly-once event pipeline processing 1B+ events/day on Kafka.',
        tags: ['Go', 'Kafka'],
      },
      {
        title: 'Tenantly',
        description: 'Multi-tenant authorization service with sub-ms policy checks.',
        tags: ['Node.js', 'Redis'],
      },
      {
        title: 'pg-migrate-safe',
        description: 'Zero-downtime Postgres migration toolkit used by 200+ teams.',
        tags: ['PostgreSQL', 'OSS'],
      },
    ],
    experience: [
      {
        company: 'Vantage Data',
        role: 'Senior Backend Engineer',
        start: '2021-04',
        highlights: [
          'Scaled the core event pipeline to sustain 40k req/s ingest',
          'Led a team of 6 backend engineers across two time zones',
        ],
      },
      {
        company: 'Kernel Systems',
        role: 'Backend Engineer',
        start: '2017-06',
        end: '2021-03',
        highlights: ['Migrated a monolith to event-driven microservices on Kafka'],
      },
    ],
    education: {
      institution: 'TU Berlin',
      degree: 'B.Sc. Computer Science',
      start: '2013',
      end: '2017',
    },
    email: 'helin@example.com',
  }),
  demoProfile({
    n: 3,
    slug: 'rojin-karim',
    category: 'Frontend Developer',
    template: 'aurora',
    name: 'Rojin Karim',
    title: 'Frontend Developer',
    location: 'Singapore',
    bio: 'I turn ambiguous designs into fast, accessible interfaces.',
    about:
      'Frontend developer specialising in Next.js and design systems. I sweat the details — keyboard flows, layout shift, and the last 100ms of perceived speed.',
    highlights: ['Core Web Vitals evangelist', 'Built a 120-component design system', 'a11y first'],
    skills: {},
    skillItems: ['Next.js', 'React', 'TypeScript', 'Tailwind CSS', 'Framer Motion'],
    projects: [
      {
        title: 'Northwind UI',
        description: 'An accessible React component library with full keyboard support.',
        tags: ['React', 'TypeScript'],
      },
      {
        title: 'Fastcart storefront',
        description: 'Headless commerce frontend with 98 Lighthouse performance.',
        tags: ['Next.js', 'Tailwind'],
      },
      {
        title: 'Chartlite',
        description: 'A 4kb charting library for dashboards that don’t need D3.',
        tags: ['TypeScript', 'SVG'],
      },
    ],
    experience: [
      {
        company: 'Northwind',
        role: 'Frontend Developer',
        start: '2022-01',
        highlights: [
          'Built a 120-component design system adopted company-wide',
          'Improved Core Web Vitals score from 62 to 98',
        ],
      },
      {
        company: 'PixelWorks',
        role: 'UI Engineer',
        start: '2019-08',
        end: '2021-12',
        highlights: ['Shipped an accessible component library used by 40+ engineers'],
      },
    ],
    education: {
      institution: 'National University of Singapore',
      degree: 'B.Sc. Computer Science',
      start: '2015',
      end: '2019',
    },
    email: 'rojin@example.com',
  }),
  demoProfile({
    n: 4,
    slug: 'aram-rostam',
    category: 'Frontend Developer',
    template: 'glitch',
    name: 'Aram Rostam',
    title: 'Creative Frontend Developer',
    location: 'Lisbon, Portugal',
    bio: 'WebGL, motion and interfaces that feel alive.',
    about:
      'I build award-bait marketing sites and interactive experiences. Shaders by day, scroll-linked animation by night — always shipped fast and responsive.',
    highlights: ['3× Awwwards honorable mention', 'WebGL & shaders', 'Motion design background'],
    skills: {},
    skillItems: ['React', 'Three.js', 'GSAP', 'WebGL', 'TypeScript'],
    projects: [
      {
        title: 'Aurora Drive',
        description: 'Interactive WebGL launch site for an EV startup — 60fps on mobile.',
        tags: ['Three.js', 'GSAP'],
      },
      {
        title: 'Type/Motion',
        description: 'Kinetic typography playground with exportable CSS animations.',
        tags: ['Canvas', 'React'],
      },
      {
        title: 'Glitchboard',
        description: 'Generative glitch-art tool used in two music video productions.',
        tags: ['WebGL', 'Shaders'],
      },
    ],
    experience: [
      {
        company: 'Studio Aurora',
        role: 'Creative Frontend Developer',
        start: '2021-06',
        highlights: [
          'Built an award-winning WebGL launch site for an EV startup',
          'Directed motion design for 10+ marketing campaigns',
        ],
      },
      {
        company: 'Freelance',
        role: 'Frontend & Motion Developer',
        start: '2018-01',
        end: '2021-05',
        highlights: ['Delivered interactive web experiences for music and fashion clients'],
      },
    ],
    education: {
      institution: 'Universidade de Lisboa',
      degree: 'B.A. Digital Media',
      start: '2014',
      end: '2018',
    },
    email: 'aram@example.com',
  }),
  demoProfile({
    n: 5,
    slug: 'sara-hiwa',
    category: 'Full Stack Developer',
    template: 'retro-os',
    name: 'Sara Hiwa',
    title: 'Full Stack Developer',
    location: 'Amsterdam, Netherlands',
    bio: 'From schema to pixels — I ship whole features, end to end.',
    about:
      'Product-minded full stack developer. I like owning a feature from database design through API to the final interaction detail, and measuring whether it worked.',
    highlights: ['Shipped 0→1 products twice', 'Type-safe across the stack', 'Growth-curious'],
    skills: {},
    skillItems: ['TypeScript', 'Next.js', 'NestJS', 'PostgreSQL', 'Prisma', 'tRPC'],
    projects: [
      {
        title: 'Inboxzero',
        description: 'Email triage SaaS — rules engine, digest emails and a Chrome extension.',
        tags: ['Next.js', 'NestJS'],
      },
      {
        title: 'Splitwiser',
        description: 'Group expense tracker with real-time balances over WebSockets.',
        tags: ['tRPC', 'Prisma'],
      },
      {
        title: 'Formship',
        description: 'Headless form backend with spam filtering and Zapier hooks.',
        tags: ['NestJS', 'Redis'],
      },
    ],
    experience: [
      {
        company: 'Inboxzero',
        role: 'Full Stack Developer',
        start: '2023-01',
        highlights: [
          'Shipped the rules engine and its drag-and-drop builder',
          'Grew activation 18% by redesigning onboarding with event-tracked experiments',
        ],
      },
      {
        company: 'Formship',
        role: 'Software Engineer',
        start: '2021-06',
        end: '2022-12',
        highlights: [
          'Built spam filtering that blocked 97% of junk submissions without CAPTCHAs',
          'Owned the public API and SDKs used by 1,200 developers',
        ],
      },
    ],
    education: {
      institution: 'University of Amsterdam',
      degree: 'B.Sc. Artificial Intelligence',
      start: '2017',
      end: '2021',
    },
    email: 'sara@example.com',
  }),
  demoProfile({
    n: 6,
    slug: 'diyar-faraj',
    category: 'Full Stack Developer',
    template: 'brutalist',
    name: 'Diyar Faraj',
    title: 'Full Stack Engineer',
    location: 'Lagos, Nigeria',
    bio: 'Fintech engineer building for low-bandwidth, high-stakes users.',
    about:
      'I build mobile-first fintech products for African markets — offline-tolerant frontends, resilient APIs, and integrations with local payment rails.',
    highlights: ['Fintech since 2019', 'Offline-first PWAs', 'M-Pesa & Paystack integrations'],
    skills: {},
    skillItems: ['React', 'Node.js', 'GraphQL', 'MongoDB', 'React Native'],
    projects: [
      {
        title: 'Kudi wallet',
        description: 'PWA wallet with offline queueing — transactions sync when the network returns.',
        tags: ['React', 'IndexedDB'],
      },
      {
        title: 'PayBridge',
        description: 'Unified payments API over three local processors with automatic failover.',
        tags: ['Node.js', 'GraphQL'],
      },
      {
        title: 'Chop analytics',
        description: 'Merchant dashboard tracking settlement times across providers.',
        tags: ['MongoDB', 'React'],
      },
    ],
    experience: [
      {
        company: 'Kudi Wallet',
        role: 'Full Stack Engineer',
        start: '2021-02',
        highlights: [
          'Built an offline-first PWA wallet that syncs transactions on reconnect',
          'Integrated M-Pesa & Paystack payment rails across three markets',
        ],
      },
      {
        company: 'PayBridge',
        role: 'Software Engineer',
        start: '2019-01',
        end: '2021-01',
        highlights: ['Built a unified payments API over three local processors with automatic failover'],
      },
    ],
    education: {
      institution: 'University of Lagos',
      degree: 'B.Sc. Computer Science',
      start: '2015',
      end: '2019',
    },
    email: 'diyar@example.com',
  }),
  demoProfile({
    n: 7,
    slug: 'zhala-amin',
    category: 'Student Developer',
    template: 'dimension',
    name: 'Zhala Amin',
    title: 'Computer Science Student',
    location: 'Sulaymaniyah, Iraq',
    bio: 'CS senior who ships side projects instead of watching tutorials.',
    about:
      'Final-year computer science student. Two internships in, one campus app with 3,000 users, and a growing obsession with compilers and systems programming.',
    highlights: ['GPA 3.8 / 4.0', 'Summer intern @ local fintech', '3,000-user campus app'],
    skills: {},
    skillItems: ['Python', 'Java', 'React', 'SQL', 'Git'],
    projects: [
      {
        title: 'CampusEats',
        description: 'University food-ordering app used by 3,000 students — my first real users.',
        tags: ['React', 'Firebase'],
      },
      {
        title: 'MiniLang',
        description: 'A tiny interpreted language with a hand-written recursive-descent parser.',
        tags: ['Python', 'Compilers'],
      },
      {
        title: 'Internship: fraud flags',
        description: 'Rule-based transaction flagging dashboard built during a fintech internship.',
        tags: ['SQL', 'Internship'],
      },
    ],
    experience: [
      {
        company: 'Local fintech startup',
        role: 'Summer Intern',
        start: '2025-06',
        end: '2025-09',
        highlights: [
          'Built a rule-based transaction flagging dashboard',
          'Presented findings to the engineering team biweekly',
        ],
      },
    ],
    education: {
      institution: 'University of Sulaymaniyah',
      degree: 'B.Sc. Computer Science (expected 2027)',
      start: '2023',
      end: '2027',
    },
    email: 'zhala@example.com',
  }),
  demoProfile({
    n: 8,
    slug: 'soran-latif',
    category: 'Student Developer',
    template: 'arcade',
    name: 'Soran Latif',
    title: 'Software Engineering Student',
    location: 'Munich, Germany',
    bio: 'Game dev hobbyist, systems student, hackathon regular.',
    about:
      'Third-year software engineering student who learns by building games and tools. Four hackathons, one win, and an internship spent making CI 40% faster.',
    highlights: ['Hackathon winner (48h)', 'CI intern @ automotive supplier', 'Godot contributor'],
    skills: {},
    skillItems: ['C#', 'Godot', 'TypeScript', 'Docker', 'GitHub Actions'],
    projects: [
      {
        title: 'Pixel Dungeon Deck',
        description: 'Roguelike deck-builder — hackathon winner, later 12k itch.io downloads.',
        tags: ['Godot', 'C#'],
      },
      {
        title: 'Uni projects: OS scheduler',
        description: 'Round-robin and MLFQ scheduler simulation with visualized run queues.',
        tags: ['C', 'University'],
      },
      {
        title: 'Internship: CI cache layer',
        description: 'Remote build-cache proxy that cut average pipeline time by 40%.',
        tags: ['Docker', 'Internship'],
      },
    ],
    experience: [
      {
        company: 'AutoParts GmbH',
        role: 'Software Engineering Intern',
        start: '2025-03',
        end: '2025-09',
        highlights: [
          'Built a remote build-cache proxy that cut average CI pipeline time by 40%',
          'Wrote onboarding docs that became the team standard for new interns',
        ],
      },
    ],
    education: {
      institution: 'TU Munich',
      degree: 'B.Sc. Software Engineering',
      start: '2022',
      end: '2026',
    },
    email: 'soran@example.com',
  }),
  demoProfile({
    n: 9,
    slug: 'avan-rashid',
    category: 'DevOps Engineer',
    template: 'editorial',
    name: 'Avan Rashid',
    title: 'DevOps Engineer',
    location: 'Sofia, Bulgaria',
    bio: 'I make deploys boring: reproducible infra, fast pipelines, quiet pagers.',
    about:
      'Platform engineer focused on developer experience. Terraform for everything, golden-path pipelines, and SLOs that teams actually look at.',
    highlights: ['Cut deploy time 25min → 4min', 'Runs 40+ services on K8s', 'Terraform certified'],
    skills: {},
    skillItems: ['Kubernetes', 'Terraform', 'AWS', 'GitHub Actions', 'Prometheus'],
    projects: [
      {
        title: 'Golden-path pipeline',
        description: 'One reusable workflow adopted by 14 teams — build, scan, deploy, notify.',
        tags: ['GitHub Actions', 'K8s'],
      },
      {
        title: 'Infra modules',
        description: 'Versioned Terraform module registry with policy checks in CI.',
        tags: ['Terraform', 'AWS'],
      },
      {
        title: 'SLO dashboard',
        description: 'Error-budget burn alerts wired to team Slack channels, not a wall of graphs.',
        tags: ['Prometheus', 'Grafana'],
      },
    ],
    experience: [
      {
        company: 'CloudScale',
        role: 'DevOps Engineer',
        start: '2022-05',
        highlights: [
          'Cut deploy time from 25min to 4min with golden-path pipelines',
          'Runs 40+ services on Kubernetes with a two-person platform team',
        ],
      },
      {
        company: 'Infratech',
        role: 'Platform Engineer',
        start: '2019-03',
        end: '2022-04',
        highlights: ['Migrated infra to Terraform, cutting provisioning time by 70%'],
      },
    ],
    education: {
      institution: 'Technical University of Sofia',
      degree: 'B.Sc. Computer Engineering',
      start: '2015',
      end: '2019',
    },
    email: 'avan@example.com',
  }),
  demoProfile({
    n: 10,
    slug: 'kawa-mahmud',
    category: 'DevOps Engineer',
    template: 'terminal',
    name: 'Kawa Mahmud',
    title: 'Site Reliability Engineer',
    location: 'Dubai, UAE',
    bio: 'SRE who believes every incident deserves a blameless story.',
    about:
      'From sysadmin to SRE across e-commerce and gaming. I build observability people trust, chaos-test the scary paths, and write the postmortems everyone reads.',
    highlights: ['99.99% over 12 months', 'Chaos engineering advocate', 'On-call tooling author'],
    skills: {},
    skillItems: ['Linux', 'Kubernetes', 'Go', 'Ansible', 'Grafana'],
    projects: [
      {
        title: 'Failover drills',
        description: 'Quarterly region-failover game days — recovery time down from 40 to 6 minutes.',
        tags: ['Chaos', 'K8s'],
      },
      {
        title: 'oncall-cli',
        description: 'Terminal tool that pulls runbooks, silences alerts and drafts incident notes.',
        tags: ['Go', 'CLI'],
      },
      {
        title: 'Log pipeline v2',
        description: 'Structured logging rollout: 60% cheaper storage, 10× faster queries.',
        tags: ['Loki', 'Ansible'],
      },
    ],
    experience: [
      {
        company: 'GameScale',
        role: 'Site Reliability Engineer',
        start: '2021-09',
        highlights: [
          'Maintained 99.99% uptime over 12 consecutive months',
          'Led quarterly chaos-engineering game days across 6 regions',
        ],
      },
      {
        company: 'ShopFast',
        role: 'Systems Administrator',
        start: '2018-01',
        end: '2021-08',
        highlights: ['Migrated on-prem infrastructure to Kubernetes on AWS'],
      },
    ],
    education: {
      institution: 'American University of Sharjah',
      degree: 'B.Sc. Information Systems',
      start: '2014',
      end: '2018',
    },
    email: 'kawa@example.com',
  }),
];

export function getDemoProfile(slug: string): DemoProfile | undefined {
  return DEMO_PROFILES.find((d) => d.slug === slug);
}

// ─── Demo resumes ───────────────────────────────────────────────────────────

export interface DemoResume {
  slug: string;
  label: string;
  description: string;
  resume: Resume;
}

interface DemoResumeInput {
  n: number;
  slug: string;
  label: string;
  description: string;
  template: string;
  name: string;
  title: string;
  location: string;
  summary: string;
  experience: Array<{ company: string; role: string; start: string; end?: string; bullets: string[] }>;
  projects: Array<{ name: string; description: string; technologies: string[] }>;
  skillGroups: Array<{ category: string; items: string[] }>;
  education: { institution: string; degree: string; start: string; end: string };
  certifications?: Array<{ name: string; issuer: string; date: string }>;
  languages: Array<{ name: string; proficiency: 'elementary' | 'limited' | 'professional' | 'full' | 'native' }>;
}

function demoResume(input: DemoResumeInput): DemoResume {
  const hasCerts = (input.certifications?.length ?? 0) > 0;
  const ids = [sid(), sid(), sid(), sid(), sid(), sid(), ...(hasCerts ? [sid()] : [])];
  const [headerId, summaryId, experienceId, projectsId, skillsId, educationId, ...rest] = ids;
  const certificationsId = hasCerts ? rest[0] : undefined;
  const languagesId = sid();

  // Loosely typed: this is pre-validation input for ResumeSchema.parse below,
  // which fills in defaults (visible, showLevels, etc.) that the strict
  // Resume['sections'] output type would otherwise require here.
  const sections: Array<Record<string, unknown>> = [
    {
      id: headerId,
      type: 'header',
      data: {
        name: input.name,
        title: input.title,
        email: 'hello@example.com',
        location: input.location,
        socials: {},
      },
    },
    { id: summaryId, type: 'summary', data: { heading: 'Summary', body: input.summary } },
    {
      id: experienceId,
      type: 'experience',
      data: {
        heading: 'Experience',
        items: input.experience.map((e) => ({
          id: sid(),
          company: e.company,
          role: e.role,
          startDate: e.start,
          endDate: e.end,
          current: !e.end,
          bullets: e.bullets,
          technologies: [],
        })),
      },
    },
    {
      id: projectsId,
      type: 'projects',
      data: {
        heading: 'Projects',
        items: input.projects.map((p) => ({
          id: sid(),
          name: p.name,
          description: p.description,
          technologies: p.technologies,
          bullets: [],
        })),
      },
    },
    {
      id: skillsId,
      type: 'skills',
      data: {
        heading: 'Skills',
        groups: input.skillGroups.map((g) => ({ id: sid(), ...g })),
        layout: 'grouped',
      },
    },
    {
      id: educationId,
      type: 'education',
      data: {
        heading: 'Education',
        items: [
          {
            id: sid(),
            institution: input.education.institution,
            degree: input.education.degree,
            startDate: input.education.start,
            endDate: input.education.end,
          },
        ],
      },
    },
  ];

  if (hasCerts && certificationsId) {
    sections.push({
      id: certificationsId,
      type: 'certifications',
      data: {
        heading: 'Certifications',
        items: (input.certifications ?? []).map((c) => ({
          id: sid(),
          name: c.name,
          issuer: c.issuer,
          date: c.date,
        })),
      },
    });
  }

  sections.push({
    id: languagesId,
    type: 'languages',
    data: {
      heading: 'Languages',
      items: input.languages.map((l) => ({ id: sid(), name: l.name, proficiency: l.proficiency })),
    },
  });

  const resume = ResumeSchema.parse({
    id: demoUuid(800 + input.n),
    slug: `demo-resume-${input.slug}`,
    userId: demoUuid(950 + input.n),
    template: input.template,
    layout: { sectionsOrder: sections.map((s) => s.id) },
    sections,
    metadata: { title: input.label },
  });
  return { slug: input.slug, label: input.label, description: input.description, resume };
}

export const DEMO_RESUMES: DemoResume[] = [
  demoResume({
    n: 1,
    slug: 'backend-engineer',
    label: 'Backend Engineer Resume',
    description: 'Senior-level, impact-led bullets, ATS-friendly single column.',
    template: 'classic',
    name: 'Rebin Rasul',
    title: 'Backend Engineer',
    location: 'Erbil, Iraq',
    summary:
      'Backend engineer with 5 years of experience building payment and messaging systems in NestJS and Django. Strong focus on reliability, idempotency and observable services.',
    experience: [
      {
        company: 'Nawa Pay',
        role: 'Backend Engineer',
        start: '2022-03',
        bullets: [
          'Designed a double-entry ledger processing 2M+ daily transactions with zero balance drift',
          'Cut p99 API latency from 800ms to 120ms by introducing read replicas and Redis caching',
          'Led the migration from cron scripts to BullMQ workers, eliminating 90% of missed jobs',
        ],
      },
      {
        company: 'Softline',
        role: 'Junior Backend Developer',
        start: '2020-01',
        end: '2022-02',
        bullets: [
          'Built REST APIs for an e-commerce platform serving 60k monthly users',
          'Introduced integration tests that caught 30+ regressions before release',
        ],
      },
    ],
    projects: [
      {
        name: 'Ledger',
        description: 'Double-entry payment core with idempotent transfers and reconciliation jobs.',
        technologies: ['NestJS', 'PostgreSQL', 'Redis'],
      },
      {
        name: 'Notification Gateway',
        description: 'Multi-channel fan-out service with per-tenant rate limiting.',
        technologies: ['RabbitMQ', 'Redis'],
      },
    ],
    skillGroups: [
      { category: 'Languages', items: ['TypeScript', 'Python', 'SQL'] },
      { category: 'Backend', items: ['NestJS', 'Django', 'PostgreSQL', 'Redis', 'RabbitMQ'] },
      { category: 'Tools', items: ['Docker', 'GitHub Actions', 'Grafana'] },
    ],
    education: {
      institution: 'Salahaddin University',
      degree: 'B.Sc. Computer Science',
      start: '2016',
      end: '2020',
    },
    certifications: [
      { name: 'AWS Certified Solutions Architect – Associate', issuer: 'Amazon Web Services', date: '2023' },
    ],
    languages: [
      { name: 'Kurdish', proficiency: 'native' },
      { name: 'English', proficiency: 'professional' },
      { name: 'Arabic', proficiency: 'professional' },
    ],
  }),
  demoResume({
    n: 2,
    slug: 'full-stack-developer',
    label: 'Full Stack Developer Resume',
    description: 'Product-focused, shows ownership across frontend and backend.',
    template: 'modern',
    name: 'Sara Hiwa',
    title: 'Full Stack Developer',
    location: 'Amsterdam, Netherlands',
    summary:
      'Full stack developer who ships complete features — schema, API and UI. 4 years across two startups; comfortable owning ambiguous problems end to end.',
    experience: [
      {
        company: 'Inboxzero',
        role: 'Full Stack Developer',
        start: '2023-01',
        bullets: [
          'Shipped the rules engine (NestJS + Postgres) and its drag-and-drop builder (Next.js)',
          'Grew activation 18% by redesigning onboarding with event-tracked experiments',
        ],
      },
      {
        company: 'Formship',
        role: 'Software Engineer',
        start: '2021-06',
        end: '2022-12',
        bullets: [
          'Built spam filtering that blocked 97% of junk submissions without CAPTCHAs',
          'Owned the public API and SDKs used by 1,200 developers',
        ],
      },
    ],
    projects: [
      {
        name: 'Splitwiser',
        description: 'Group expense tracker with real-time balances over WebSockets.',
        technologies: ['tRPC', 'Prisma'],
      },
      {
        name: 'Formship',
        description: 'Headless form backend with spam filtering and Zapier hooks.',
        technologies: ['NestJS', 'Redis'],
      },
    ],
    skillGroups: [
      { category: 'Frontend', items: ['Next.js', 'React', 'TypeScript', 'Tailwind CSS'] },
      { category: 'Backend', items: ['NestJS', 'PostgreSQL', 'Prisma', 'tRPC'] },
    ],
    education: {
      institution: 'University of Amsterdam',
      degree: 'B.Sc. Artificial Intelligence',
      start: '2017',
      end: '2021',
    },
    certifications: [
      { name: 'Meta Front-End Developer Professional Certificate', issuer: 'Meta (Coursera)', date: '2022' },
    ],
    languages: [
      { name: 'Kurdish', proficiency: 'native' },
      { name: 'English', proficiency: 'full' },
      { name: 'Dutch', proficiency: 'limited' },
    ],
  }),
  demoResume({
    n: 3,
    slug: 'junior-developer',
    label: 'Junior Developer Resume',
    description: 'First job hunt — projects carry the story, not job titles.',
    template: 'compact',
    name: 'Soran Latif',
    title: 'Junior Software Developer',
    location: 'Munich, Germany',
    summary:
      'Recent software engineering graduate with one internship and a habit of finishing side projects. Looking for a junior role with strong code review culture.',
    experience: [
      {
        company: 'AutoParts GmbH',
        role: 'Software Engineering Intern',
        start: '2025-03',
        end: '2025-09',
        bullets: [
          'Built a remote build-cache proxy that cut average CI pipeline time by 40%',
          'Wrote onboarding docs that became the team standard for new interns',
        ],
      },
      {
        company: 'Personal projects',
        role: 'Indie developer',
        start: '2023-01',
        end: '2025-01',
        bullets: [
          'Released a Godot roguelike with 12k downloads; handled updates and player feedback',
          'Built an OS scheduler simulator used by 200+ classmates to study for finals',
        ],
      },
    ],
    projects: [
      {
        name: 'Pixel Dungeon Deck',
        description: 'Roguelike deck-builder, hackathon winner with 12k itch.io downloads.',
        technologies: ['Godot', 'C#'],
      },
      {
        name: 'OS Scheduler Simulator',
        description: 'Round-robin and MLFQ scheduler simulation with visualized run queues.',
        technologies: ['C'],
      },
    ],
    skillGroups: [
      { category: 'Languages', items: ['C#', 'TypeScript', 'C', 'SQL'] },
      { category: 'Tools', items: ['Docker', 'GitHub Actions', 'Godot', 'Linux'] },
    ],
    education: {
      institution: 'TU Munich',
      degree: 'B.Sc. Software Engineering',
      start: '2022',
      end: '2026',
    },
    languages: [
      { name: 'Kurdish', proficiency: 'native' },
      { name: 'German', proficiency: 'full' },
      { name: 'English', proficiency: 'professional' },
    ],
  }),
  demoResume({
    n: 4,
    slug: 'internship',
    label: 'Internship Resume',
    description: 'Student applying for a first internship — coursework and campus impact.',
    template: 'sidebar',
    name: 'Zhala Amin',
    title: 'Computer Science Student',
    location: 'Sulaymaniyah, Iraq',
    summary:
      'Final-year CS student (GPA 3.8) seeking a backend internship. Built and operate a campus app with 3,000 users; strongest in Python, SQL and problem decomposition.',
    experience: [
      {
        company: 'CampusEats (own project)',
        role: 'Founder & Developer',
        start: '2024-09',
        bullets: [
          'Built a food-ordering app adopted by 3,000 students across two campuses',
          'Operate the service solo: deployments, bug triage and weekly releases',
        ],
      },
      {
        company: 'University of Sulaymaniyah',
        role: 'Teaching Assistant — Databases',
        start: '2025-02',
        end: '2025-06',
        bullets: ['Ran weekly SQL labs for 60 students; wrote autograded exercise sets'],
      },
    ],
    projects: [
      {
        name: 'CampusEats',
        description: 'University food-ordering app used by 3,000 students.',
        technologies: ['React', 'Firebase'],
      },
      {
        name: 'MiniLang',
        description: 'Tiny interpreted language with a hand-written recursive-descent parser.',
        technologies: ['Python'],
      },
    ],
    skillGroups: [
      { category: 'Languages', items: ['Python', 'Java', 'SQL', 'JavaScript'] },
      { category: 'Coursework', items: ['Data Structures', 'Databases', 'Operating Systems', 'Networks'] },
    ],
    education: {
      institution: 'University of Sulaymaniyah',
      degree: 'B.Sc. Computer Science (expected 2027)',
      start: '2023',
      end: '2027',
    },
    languages: [
      { name: 'Kurdish', proficiency: 'native' },
      { name: 'Arabic', proficiency: 'professional' },
      { name: 'English', proficiency: 'professional' },
    ],
  }),
];

export function getDemoResume(slug: string): DemoResume | undefined {
  return DEMO_RESUMES.find((d) => d.slug === slug);
}
