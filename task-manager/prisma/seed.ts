import { PrismaClient } from '../app/generated/prisma';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  // Create a test user
  const hashedPassword = await bcrypt.hash('password123', 10);
  const user = await prisma.user.upsert({
    where: { email: 'test@example.com' },
    update: {},
    create: {
      email: 'test@example.com',
      password: hashedPassword,
    },
  });

  console.log('Created test user:', user.email);

  // Create a test project
  const project = await prisma.project.upsert({
    where: { id: 'test-project-1' },
    update: {},
    create: {
      id: 'test-project-1',
      name: 'Test Project',
      description: 'A project for testing',
      ownerId: user.id,
    },
  });

  console.log('Created test project:', project.name);

  // Create some test tasks
  const tasks = await Promise.all([
    prisma.task.create({
      data: {
        title: 'Call John tomorrow at 3pm',
        priority: 'P2',
        projectId: project.id,
        creatorId: user.id,
        dueDate: new Date(Date.now() + 24 * 60 * 60 * 1000), // Tomorrow
        assignee: 'John',
      },
    }),
    prisma.task.create({
      data: {
        title: 'Complete project documentation',
        priority: 'P1',
        projectId: project.id,
        creatorId: user.id,
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // Next week
      },
    }),
    prisma.task.create({
      data: {
        title: 'Review pull requests',
        priority: 'P3',
        projectId: project.id,
        creatorId: user.id,
        completed: true,
      },
    }),
  ]);

  console.log('Created test tasks:', tasks.map(t => t.title));
}

main()
  .catch((e) => {
    console.error('Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 