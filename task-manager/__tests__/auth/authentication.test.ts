import { prisma } from '@/lib/db';
import bcrypt from 'bcryptjs';

describe('Authentication', () => {
  const testUser = {
    email: 'test@example.com',
    password: 'Test123!@#',
  };

  beforeAll(async () => {
    // Clean up any existing test data in the correct order
    const user = await prisma.user.findUnique({ where: { email: testUser.email } });
    if (user) {
      await prisma.task.deleteMany({ where: { creatorId: user.id } });
      await prisma.project.deleteMany({ where: { ownerId: user.id } });
      await prisma.user.delete({ where: { id: user.id } });
    }
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  test('user can register with valid credentials', async () => {
    const response = await fetch('http://localhost:3000/api/auth/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testUser),
    });

    const data = await response.json();

    expect(response.status).toBe(201);
    expect(data.user).toHaveProperty('id');
    expect(data.user.email).toBe(testUser.email);
    expect(data.user).not.toHaveProperty('password');
  });

  test('registration fails with invalid email', async () => {
    const response = await fetch('http://localhost:3000/api/auth/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'invalid-email',
        password: testUser.password,
      }),
    });

    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe('Invalid email address');
  });

  test('registration fails with weak password', async () => {
    const response = await fetch('http://localhost:3000/api/auth/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'test2@example.com',
        password: 'weak',
      }),
    });

    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toContain('Password must');
  });

  test('registration fails with existing email', async () => {
    const response = await fetch('http://localhost:3000/api/auth/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testUser),
    });

    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe('User already exists');
  });

  test('user can login with valid credentials', async () => {
    const response = await fetch('http://localhost:3000/api/auth/callback/credentials', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: testUser.email,
        password: testUser.password,
        redirect: false,
      }),
    });

    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data).toHaveProperty('token');
  });

  test('login fails with invalid credentials', async () => {
    const response = await fetch('http://localhost:3000/api/auth/callback/credentials', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: testUser.email,
        password: 'wrong-password',
        redirect: false,
      }),
    });

    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data.error).toBe('Invalid credentials');
  });
}); 