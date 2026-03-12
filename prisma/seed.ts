import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  // Only create agents - no mock leads, todos, or KPIs
  await Promise.all([
    prisma.agent.upsert({
      where: { id: "mark" },
      update: {},
      create: {
        id: "mark",
        name: "Mark",
        emoji: "📈",
        color: "#f97316",
        status: "IDLE",
        task: "Waiting for assignment",
        queueSize: 0,
      },
    }),
    prisma.agent.upsert({
      where: { id: "prism" },
      update: {},
      create: {
        id: "prism",
        name: "Prism",
        emoji: "🚀",
        color: "#38bdf8",
        status: "IDLE",
        task: "Waiting for assignment",
        queueSize: 0,
      },
    }),
    prisma.agent.upsert({
      where: { id: "crafter" },
      update: {},
      create: {
        id: "crafter",
        name: "Crafter",
        emoji: "⚒️",
        color: "#a855f7",
        status: "IDLE",
        task: "Waiting for assignment",
        queueSize: 0,
      },
    }),
    prisma.agent.upsert({
      where: { id: "blox" },
      update: {},
      create: {
        id: "blox",
        name: "Blox",
        emoji: "🧱",
        color: "#22c55e",
        status: "IDLE",
        task: "Waiting for assignment",
        queueSize: 0,
      },
    }),
  ]);

  console.log("Agents ready for real data!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
