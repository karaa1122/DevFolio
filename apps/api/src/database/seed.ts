/**
 * Dev seeder — creates (or refreshes) a rich demo portfolio + resume for a user.
 *
 *   pnpm --filter @devfolio/api seed <userId> [slug]
 *
 * Idempotent: re-running upserts the same demo rows (matched by slug) instead of
 * duplicating. Refuses to run when NODE_ENV=production.
 */
import 'reflect-metadata';
import { randomUUID } from 'crypto';
import { PortfolioSchema, ResumeSchema } from '@devfolio/shared';
import { AppDataSource } from './data-source';
import { User } from './entities/user.entity';
import { Portfolio } from './entities/portfolio.entity';
import { Resume } from './entities/resume.entity';

const sid = () => randomUUID();

function buildPortfolio(userId: string, slug: string) {
  const hero = { id: sid(), type: 'hero' as const };
  const about = { id: sid(), type: 'about' as const };
  const projects = { id: sid(), type: 'projects' as const };
  const experience = { id: sid(), type: 'experience' as const };
  const skills = { id: sid(), type: 'skills' as const };
  const education = { id: sid(), type: 'education' as const };
  const contact = { id: sid(), type: 'contact' as const };

  return PortfolioSchema.parse({
    id: randomUUID(),
    slug,
    version: 1,
    userId,
    // Explicit "Aurora" palette so the demo looks designed regardless of
    // whether the shared package's new defaults have been rebuilt.
    theme: {
      colors: {
        primary: '#bef264',
        secondary: '#a3e635',
        background: '#0a0a0c',
        foreground: '#ededf0',
        muted: '#8a8a93',
        accent: '#22d3ee',
        card: '#141417',
        border: '#26262b',
      },
      font: 'inter',
      radius: 'lg',
      darkMode: true,
      spacing: 'normal',
    },
    metadata: {
      title: 'Alex Rivera — Senior Full-Stack Engineer',
      description:
        'Senior full-stack engineer building fast, reliable products with TypeScript, Node and React.',
      keywords: ['full-stack', 'typescript', 'node', 'react', 'engineer'],
    },
    layout: {
      sectionsOrder: [hero.id, about.id, projects.id, experience.id, skills.id, education.id, contact.id],
    },
    sections: [
      {
        ...hero,
        data: {
          name: 'Alex Rivera',
          title: 'Senior Full-Stack Engineer',
          subtitle: 'TypeScript · Node.js · React · PostgreSQL',
          bio: 'I design and build production systems end-to-end — from schema to pixels. Currently focused on developer tooling and performance.',
          location: 'Berlin, Germany',
          availableForWork: true,
          cta: { label: 'Get in touch', href: '#contact', variant: 'primary' },
        },
      },
      {
        ...about,
        data: {
          heading: 'About',
          bio: "I'm a full-stack engineer with 8+ years shipping web products at startups and scale-ups. I care about clean architecture, fast feedback loops, and interfaces that feel effortless.\n\nWhen I'm not writing code, I'm contributing to open source or mentoring junior engineers.",
          highlights: [
            '8+ years building production web apps',
            'Led teams of up to 6 engineers',
            'Shipped products used by 2M+ people',
            'Open-source maintainer (12k+ stars)',
          ],
        },
      },
      {
        ...projects,
        data: {
          heading: 'Projects',
          subheading: "A selection of things I've shipped",
          layout: 'grid',
          showFeaturedOnly: false,
          items: [
            {
              id: sid(),
              title: 'Pulse Analytics',
              description: 'Real-time, privacy-first product analytics with sub-second dashboards over billions of events.',
              tags: ['TypeScript', 'ClickHouse', 'React', 'WebSockets'],
              liveUrl: 'https://example.com',
              repoUrl: 'https://github.com/example/pulse',
              featured: true,
              year: 2025,
              status: 'completed',
            },
            {
              id: sid(),
              title: 'Forge UI',
              description: 'A headless component library with 60+ accessible primitives and a theming engine.',
              tags: ['React', 'Radix', 'CSS Variables'],
              repoUrl: 'https://github.com/example/forge-ui',
              featured: true,
              year: 2024,
              status: 'completed',
            },
            {
              id: sid(),
              title: 'Drift',
              description: 'Type-safe background job runner for Node with retries, backoff and a live dashboard.',
              tags: ['Node.js', 'BullMQ', 'Redis'],
              liveUrl: 'https://example.com',
              year: 2024,
              status: 'in-progress',
            },
            {
              id: sid(),
              title: 'Mapline',
              description: 'Turn GPX tracks into shareable, animated route maps. Built for trail runners.',
              tags: ['Next.js', 'Mapbox', 'Canvas'],
              repoUrl: 'https://github.com/example/mapline',
              year: 2023,
              status: 'completed',
            },
          ],
        },
      },
      {
        ...experience,
        data: {
          heading: 'Experience',
          layout: 'timeline',
          items: [
            {
              id: sid(),
              company: 'Northwind',
              role: 'Senior Full-Stack Engineer',
              type: 'full-time',
              location: 'Berlin (Remote)',
              startDate: 'Jan 2022',
              current: true,
              description: 'Lead engineer on the platform team building internal developer tooling.',
              highlights: [
                'Cut p95 API latency by 63% by rebuilding the query layer',
                'Designed the multi-tenant billing system from scratch',
                'Mentored 4 engineers to mid/senior level',
              ],
            },
            {
              id: sid(),
              company: 'Lumen Labs',
              role: 'Full-Stack Engineer',
              type: 'full-time',
              location: 'Amsterdam',
              startDate: 'Jun 2019',
              endDate: 'Dec 2021',
              description: 'Built customer-facing features for a fintech used by 500k+ users.',
              highlights: [
                'Shipped the onboarding flow that lifted activation 28%',
                'Introduced end-to-end testing, dropping prod incidents 40%',
              ],
            },
            {
              id: sid(),
              company: 'Bytewise',
              role: 'Software Engineer',
              type: 'full-time',
              location: 'Lisbon',
              startDate: 'Aug 2017',
              endDate: 'May 2019',
              highlights: ['Built the public REST API and SDK in three languages'],
            },
          ],
        },
      },
      {
        ...skills,
        data: {
          heading: 'Skills',
          subheading: 'Technologies I reach for',
          layout: 'bars',
          showLevels: true,
          items: [
            { id: sid(), name: 'TypeScript', category: 'Languages', level: 95 },
            { id: sid(), name: 'Go', category: 'Languages', level: 70 },
            { id: sid(), name: 'React / Next.js', category: 'Frontend', level: 92 },
            { id: sid(), name: 'Node.js / NestJS', category: 'Backend', level: 90 },
            { id: sid(), name: 'PostgreSQL', category: 'Data', level: 85 },
            { id: sid(), name: 'Docker / K8s', category: 'Infra', level: 75 },
          ],
        },
      },
      {
        ...education,
        data: {
          heading: 'Education',
          items: [
            {
              id: sid(),
              institution: 'TU Delft',
              degree: 'B.Sc.',
              field: 'Computer Science',
              startDate: 'Sep 2013',
              endDate: 'Jun 2017',
              gpa: '3.9 / 4.0',
              description: 'Focus on distributed systems and human–computer interaction.',
            },
          ],
        },
      },
      {
        ...contact,
        data: {
          heading: 'Get in touch',
          subheading: "Have a role or project in mind? Let's talk.",
          email: 'alex@example.com',
          location: 'Berlin, Germany',
          socials: {
            github: 'https://github.com/example',
            linkedin: 'https://linkedin.com/in/example',
            twitter: 'https://twitter.com/example',
            website: 'https://example.com',
          },
          showContactForm: true,
        },
      },
    ],
  });
}

function buildResume(userId: string, slug: string) {
  const header = { id: sid(), type: 'header' as const };
  const summary = { id: sid(), type: 'summary' as const };
  const experience = { id: sid(), type: 'experience' as const };
  const projects = { id: sid(), type: 'projects' as const };
  const skills = { id: sid(), type: 'skills' as const };
  const education = { id: sid(), type: 'education' as const };

  return ResumeSchema.parse({
    id: randomUUID(),
    slug,
    version: 1,
    userId,
    template: 'modern',
    theme: {},
    page: {},
    density: 'normal',
    metadata: { title: 'Alex Rivera — Senior Full-Stack Engineer', targetRole: 'Senior Full-Stack Engineer' },
    layout: {
      sectionsOrder: [header.id, summary.id, experience.id, projects.id, skills.id, education.id],
    },
    sections: [
      {
        ...header,
        data: {
          name: 'Alex Rivera',
          title: 'Senior Full-Stack Engineer',
          email: 'alex@example.com',
          phone: '+49 30 1234 5678',
          location: 'Berlin, Germany',
          website: 'https://example.com',
          socials: { github: 'github.com/example', linkedin: 'linkedin.com/in/example' },
          showPhoto: false,
        },
      },
      {
        ...summary,
        data: {
          heading: 'Summary',
          body: 'Senior full-stack engineer with 8+ years building reliable, high-performance web products. Equally comfortable in the database and the design system. Track record of leading teams and shipping at scale.',
        },
      },
      {
        ...experience,
        data: {
          heading: 'Experience',
          items: [
            {
              id: sid(),
              company: 'Northwind',
              role: 'Senior Full-Stack Engineer',
              location: 'Berlin (Remote)',
              startDate: 'Jan 2022',
              current: true,
              type: 'full-time',
              bullets: [
                'Cut p95 API latency by 63% by rebuilding the query layer in Go',
                'Designed and shipped the multi-tenant billing system end-to-end',
                'Mentored 4 engineers from junior to mid/senior level',
              ],
              technologies: ['TypeScript', 'Go', 'PostgreSQL', 'Kubernetes'],
            },
            {
              id: sid(),
              company: 'Lumen Labs',
              role: 'Full-Stack Engineer',
              location: 'Amsterdam',
              startDate: 'Jun 2019',
              endDate: 'Dec 2021',
              type: 'full-time',
              bullets: [
                'Shipped the onboarding flow that lifted activation by 28%',
                'Introduced E2E testing, reducing production incidents by 40%',
              ],
              technologies: ['React', 'Node.js', 'PostgreSQL'],
            },
          ],
        },
      },
      {
        ...projects,
        data: {
          heading: 'Projects',
          items: [
            {
              id: sid(),
              name: 'Pulse Analytics',
              description: 'Real-time, privacy-first product analytics.',
              url: 'https://example.com',
              repoUrl: 'https://github.com/example/pulse',
              year: 2025,
              bullets: ['Sub-second dashboards over billions of events'],
              technologies: ['TypeScript', 'ClickHouse', 'React'],
            },
            {
              id: sid(),
              name: 'Forge UI',
              description: 'Headless, accessible component library.',
              repoUrl: 'https://github.com/example/forge-ui',
              year: 2024,
              bullets: ['60+ primitives, 12k+ GitHub stars'],
              technologies: ['React', 'Radix'],
            },
          ],
        },
      },
      {
        ...skills,
        data: {
          heading: 'Skills',
          layout: 'grouped',
          showLevels: false,
          groups: [
            { id: sid(), category: 'Languages', items: ['TypeScript', 'Go', 'SQL', 'Python'] },
            { id: sid(), category: 'Frontend', items: ['React', 'Next.js', 'Tailwind CSS'] },
            { id: sid(), category: 'Backend', items: ['Node.js', 'NestJS', 'PostgreSQL', 'Redis'] },
            { id: sid(), category: 'Infra', items: ['Docker', 'Kubernetes', 'AWS', 'CI/CD'] },
          ],
        },
      },
      {
        ...education,
        data: {
          heading: 'Education',
          items: [
            {
              id: sid(),
              institution: 'TU Delft',
              degree: 'B.Sc. Computer Science',
              startDate: 'Sep 2013',
              endDate: 'Jun 2017',
              gpa: '3.9 / 4.0',
              details: ['Focus on distributed systems and HCI'],
            },
          ],
        },
      },
    ],
  });
}

async function main() {
  if (process.env.NODE_ENV === 'production') {
    console.error('✗ Refusing to run the seeder with NODE_ENV=production.');
    process.exit(1);
  }

  const userId = process.argv[2];
  if (!userId) {
    console.error('Usage: pnpm --filter @devfolio/api seed <userId> [slug]');
    process.exit(1);
  }

  const baseSlug = (process.argv[3] ?? `demo-${userId.slice(0, 8)}`)
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, '-');
  const resumeSlug = 'demo-resume';

  const ds = await AppDataSource.initialize();
  try {
    const userRepo = ds.getRepository(User);
    const portfolioRepo = ds.getRepository(Portfolio);
    const resumeRepo = ds.getRepository(Resume);

    const user = await userRepo.findOne({ where: { id: userId } });
    if (!user) {
      console.error(`✗ No user found with id "${userId}".`);
      process.exit(1);
    }

    // ── Portfolio (upsert by slug) ──────────────────────────────────────────
    const portfolioData = buildPortfolio(userId, baseSlug);
    const existingPortfolio = await portfolioRepo.findOne({ where: { slug: baseSlug } });
    if (existingPortfolio && existingPortfolio.userId !== userId) {
      console.error(`✗ Portfolio slug "${baseSlug}" is taken by another user. Pass a different slug.`);
      process.exit(1);
    }
    if (existingPortfolio) {
      existingPortfolio.data = { ...portfolioData, id: existingPortfolio.data.id };
      await portfolioRepo.save(existingPortfolio);
      console.log(`↻ Updated portfolio "${baseSlug}" (${existingPortfolio.id})`);
    } else {
      const saved = await portfolioRepo.save(
        portfolioRepo.create({ userId, slug: baseSlug, data: portfolioData }),
      );
      console.log(`✓ Created portfolio "${baseSlug}" (${saved.id})`);
    }

    // ── Resume (upsert by userId + slug) ────────────────────────────────────
    const resumeData = buildResume(userId, resumeSlug);
    const existingResume = await resumeRepo.findOne({ where: { userId, slug: resumeSlug } });
    if (existingResume) {
      existingResume.data = { ...resumeData, id: existingResume.data.id };
      await resumeRepo.save(existingResume);
      console.log(`↻ Updated resume "${resumeSlug}" (${existingResume.id})`);
    } else {
      const saved = await resumeRepo.save(
        resumeRepo.create({ userId, slug: resumeSlug, data: resumeData }),
      );
      console.log(`✓ Created resume "${resumeSlug}" (${saved.id})`);
    }

    console.log('\nDone. Open the dashboard to see the seeded portfolio & resume.');
  } finally {
    await ds.destroy();
  }
}

main().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
