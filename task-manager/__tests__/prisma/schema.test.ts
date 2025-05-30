import { PrismaClient } from '../../app/generated/prisma';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

describe('Database Schema', () => {
  let testUser: { id: string; email: string };
  let testProject: { id: string; name: string; ownerId: string };

  beforeAll(async () => {
    // Clean up any existing test data
    await prisma.task.deleteMany({});
    await prisma.project.deleteMany({});
    await prisma.user.deleteMany({});
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  test('can create user', async () => {
    const hashedPassword = await bcrypt.hash('testpass123', 10);
    testUser = await prisma.user.create({
      data: {
        email: 'test@example.com',
        password: hashedPassword,
      },
    });

    expect(testUser).toHaveProperty('id');
    expect(testUser.email).toBe('test@example.com');
  });

  test('can create project', async () => {
    testProject = await prisma.project.create({
      data: {
        name: 'Test Project',
        description: 'A project for testing',
        ownerId: testUser.id,
      },
    });

    expect(testProject).toHaveProperty('id');
    expect(testProject.name).toBe('Test Project');
    expect(testProject.ownerId).toBe(testUser.id);
  });

  test('can create task with all fields', async () => {
    const task = await prisma.task.create({
      data: {
        title: 'Test Task',
        priority: 'P2',
        projectId: testProject.id,
        creatorId: testUser.id,
        dueDate: new Date(),
        assignee: 'John Doe',
      },
    });

    expect(task).toHaveProperty('id');
    expect(task.title).toBe('Test Task');
    expect(task.priority).toBe('P2');
    expect(task.projectId).toBe(testProject.id);
    expect(task.creatorId).toBe(testUser.id);
    expect(task.assignee).toBe('John Doe');
  });

  test('can create task with minimal fields', async () => {
    const task = await prisma.task.create({
      data: {
        title: 'Minimal Task',
        priority: 'P3',
        projectId: testProject.id,
        creatorId: testUser.id,
      },
    });

    expect(task).toHaveProperty('id');
    expect(task.title).toBe('Minimal Task');
    expect(task.priority).toBe('P3');
    expect(task.projectId).toBe(testProject.id);
    expect(task.creatorId).toBe(testUser.id);
    expect(task.assignee).toBeNull();
    expect(task.dueDate).toBeNull();
  });

  test('can query tasks by project', async () => {
    const tasks = await prisma.task.findMany({
      where: {
        projectId: testProject.id,
      },
    });

    expect(tasks.length).toBeGreaterThan(0);
    tasks.forEach((task: { projectId: string }) => {
      expect(task.projectId).toBe(testProject.id);
    });
  });

  test('can update task', async () => {
    const task = await prisma.task.create({
      data: {
        title: 'Task to Update',
        priority: 'P3',
        projectId: testProject.id,
        creatorId: testUser.id,
      },
    });

    const updatedTask = await prisma.task.update({
      where: { id: task.id },
      data: {
        title: 'Updated Task',
        priority: 'P1',
        completed: true,
      },
    });

    expect(updatedTask.title).toBe('Updated Task');
    expect(updatedTask.priority).toBe('P1');
    expect(updatedTask.completed).toBe(true);
  });

  test('can delete task', async () => {
    const task = await prisma.task.create({
      data: {
        title: 'Task to Delete',
        priority: 'P3',
        projectId: testProject.id,
        creatorId: testUser.id,
      },
    });

    await prisma.task.delete({
      where: { id: task.id },
    });

    const deletedTask = await prisma.task.findUnique({
      where: { id: task.id },
    });

    expect(deletedTask).toBeNull();
  });
}); 