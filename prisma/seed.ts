import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  // Clean existing data
  await prisma.activity.deleteMany();
  await prisma.lead.deleteMany();
  await prisma.todo.deleteMany();
  await prisma.customKpi.deleteMany();
  await prisma.agent.deleteMany();
  await prisma.user.deleteMany();

  // Create agents
  const agents = await Promise.all([
    prisma.agent.create({
      data: {
        name: "Mark",
        emoji: "📈",
        color: "#06b6d4",
        status: "WORKING",
        task: "Analyzing Q1 pipeline metrics and identifying top 10 prospects",
        queueSize: 5,
      },
    }),
    prisma.agent.create({
      data: {
        name: "Prism",
        emoji: "🚀",
        color: "#8b5cf6",
        status: "WORKING",
        task: "Drafting personalized outreach messages for TechCorp and DataFlow",
        queueSize: 3,
      },
    }),
    prisma.agent.create({
      data: {
        name: "Crafter",
        emoji: "⚒️",
        color: "#10b981",
        status: "IDLE",
        task: null,
        queueSize: 0,
      },
    }),
    prisma.agent.create({
      data: {
        name: "Blox",
        emoji: "🧱",
        color: "#22c55e",
        status: "WORKING",
        task: "Tracking creator growth and surfacing community KPI changes",
        queueSize: 2,
      },
    }),
  ]);

  console.log("Created agents:", agents.length);

  // Create leads spread across kanban columns
  const now = new Date();
  const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
  const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
  const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);

  const leads = await Promise.all([
    // LEAD status
    prisma.lead.create({
      data: {
        company: "TechCorp Solutions",
        contact: "Sarah Mitchell",
        email: "sarah@techcorp.io",
        linkedin: "https://linkedin.com/in/sarahmitchell",
        phone: "+1 (555) 234-5678",
        priority: "HIGH",
        status: "LEAD",
        source: "LinkedIn",
        notes:
          "Series B startup, 150 employees. Actively hiring SDRs. Good fit for AI outreach.",
        followUpAt: tomorrow,
      },
    }),
    prisma.lead.create({
      data: {
        company: "DataFlow Analytics",
        contact: "James Chen",
        email: "jchen@dataflow.ai",
        linkedin: "https://linkedin.com/in/jameschenai",
        priority: "HIGH",
        status: "LEAD",
        source: "Referral",
        notes:
          "Referred by Mike at Vertex. Data analytics firm, 80 employees.",
        followUpAt: tomorrow,
      },
    }),
    prisma.lead.create({
      data: {
        company: "NexusCloud Inc",
        contact: "Emily Rodriguez",
        email: "emily.r@nexuscloud.com",
        priority: "MEDIUM",
        status: "LEAD",
        source: "Cold Email",
        notes: "Cloud infrastructure company. Currently using manual outreach.",
      },
    }),

    // CONNECT status
    prisma.lead.create({
      data: {
        company: "Veritas Capital",
        contact: "Michael Torres",
        email: "mtorres@veritascap.com",
        linkedin: "https://linkedin.com/in/michaeltorres",
        phone: "+1 (555) 876-5432",
        priority: "HIGH",
        status: "CONNECT",
        source: "LinkedIn",
        notes:
          "VC firm with 40+ portfolio companies. Connected on LinkedIn yesterday.",
        followUpAt: tomorrow,
      },
    }),
    prisma.lead.create({
      data: {
        company: "Momentum SaaS",
        contact: "Priya Patel",
        email: "priya@momentumsaas.io",
        priority: "MEDIUM",
        status: "CONNECT",
        source: "Conference",
        notes: "Met at SaaStr 2025. Interested in AI-driven sales tools.",
        followUpAt: nextWeek,
      },
    }),

    // MESSAGE status
    prisma.lead.create({
      data: {
        company: "Apex Growth Partners",
        contact: "David Kim",
        email: "dkim@apexgrowth.co",
        linkedin: "https://linkedin.com/in/davidkimgrowth",
        priority: "HIGH",
        status: "MESSAGE",
        source: "LinkedIn",
        messageDraft:
          "Hi David, noticed Apex has been expanding its B2B portfolio. Our AI proxy system helped similar firms 3x their outreach efficiency. Worth a 15-min chat?",
        notes: "Warm lead. Replied to our first LinkedIn message.",
      },
    }),
    prisma.lead.create({
      data: {
        company: "ScaleUp Ventures",
        contact: "Rachel Green",
        email: "rgreen@scaleupvc.com",
        priority: "MEDIUM",
        status: "MESSAGE",
        source: "Email",
        messageDraft:
          "Hi Rachel, following up on my previous message about PraxAi. We've helped 20+ VCs automate portfolio outreach. Would love to show you a demo.",
        messageSent: true,
        notes: "Second message sent. Waiting for response.",
      },
    }),

    // CLOSE status
    prisma.lead.create({
      data: {
        company: "Quantum Metrics",
        contact: "Alex Johnson",
        email: "ajohnson@quantummetrics.com",
        phone: "+1 (555) 321-0987",
        priority: "HIGH",
        status: "CLOSE",
        source: "Inbound",
        messageSent: true,
        notes: "HOT LEAD! Demo scheduled for Thursday. Budget confirmed at $2k/month.",
      },
    }),
    prisma.lead.create({
      data: {
        company: "Pioneer Tech Labs",
        contact: "Lisa Wang",
        email: "lwang@pioneertech.io",
        linkedin: "https://linkedin.com/in/lisawangtech",
        priority: "HIGH",
        status: "CLOSE",
        source: "LinkedIn",
        messageSent: true,
        notes: "Trial ends in 3 days. Very positive feedback. Upsell to Enterprise.",
        followUpAt: yesterday,
      },
    }),
    prisma.lead.create({
      data: {
        company: "Orbit Digital",
        contact: "Tom Bradley",
        email: "tbradley@orbitdigital.com",
        priority: "LOW",
        status: "LEAD",
        source: "Cold Email",
        notes: "Small agency, 20 employees. Budget constraints but interested.",
      },
    }),
  ]);

  console.log("Created leads:", leads.length);

  // Create activities for some leads
  await Promise.all([
    prisma.activity.create({
      data: {
        leadId: leads[0].id,
        type: "NOTE",
        note: "Initial research completed. Company is Series B, $15M raised.",
      },
    }),
    prisma.activity.create({
      data: {
        leadId: leads[3].id,
        type: "STATUS_CHANGE",
        note: "Moved from LEAD to CONNECT after LinkedIn connection accepted.",
        metadata: { from: "LEAD", to: "CONNECT" },
      },
    }),
    prisma.activity.create({
      data: {
        leadId: leads[5].id,
        type: "MESSAGE_SENT",
        note: "Sent initial outreach message via LinkedIn.",
      },
    }),
    prisma.activity.create({
      data: {
        leadId: leads[7].id,
        type: "EMAIL_SENT",
        note: "Sent demo invitation email with calendar link.",
      },
    }),
    prisma.activity.create({
      data: {
        leadId: leads[7].id,
        type: "FOLLOW_UP",
        note: "Demo confirmed for Thursday 2pm EST.",
      },
    }),
    prisma.activity.create({
      data: {
        leadId: leads[8].id,
        type: "NOTE",
        note: "Pioneer Tech in active trial. Weekly check-in scheduled.",
      },
    }),
  ]);

  // Create default user
  await prisma.user.create({
    data: {
      email: "ras@praxai.com",
      name: "Rasmus",
    },
  });

  const customKpiTimestamp = new Date();

  await Promise.all([
    prisma.todo.create({
      data: {
        title: "Approve Blox giveaway brief",
        description: "Need final sign-off before community drop goes live.",
        priority: "HIGH",
        status: "PENDING",
        agent: "Blox",
      },
    }),
    prisma.todo.create({
      data: {
        title: "Review Prism reply sequence",
        description: "Prism wants approval on the new founder follow-up copy.",
        priority: "MEDIUM",
        status: "PENDING",
        agent: "Prism",
      },
    }),
    prisma.todo.create({
      data: {
        title: "Confirm Crafter KPI schema",
        description: "Crafter needs the final dashboard metric names before shipping.",
        priority: "LOW",
        status: "DONE",
        agent: "Crafter",
      },
    }),
    prisma.customKpi.create({
      data: {
        name: "Followers",
        value: 12430,
        change: "+8.4%",
        agent: "Blox",
        timestamp: customKpiTimestamp,
      },
    }),
    prisma.customKpi.create({
      data: {
        name: "Messages Sent",
        value: 318,
        change: "+14%",
        agent: "Prism",
        timestamp: customKpiTimestamp,
      },
    }),
    prisma.customKpi.create({
      data: {
        name: "Features Shipped",
        value: 6,
        change: "+2",
        agent: "Crafter",
        timestamp: customKpiTimestamp,
      },
    }),
    prisma.customKpi.create({
      data: {
        name: "Prospects Researched",
        value: 74,
        change: "+11",
        agent: "Mark",
        timestamp: customKpiTimestamp,
      },
    }),
  ]);

  console.log("Seed complete!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
