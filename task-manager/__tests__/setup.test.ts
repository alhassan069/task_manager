import fs from 'fs';
import path from 'path';

describe('Project Setup', () => {
  test('required directories exist', () => {
    // Check if core directories exist
    const requiredDirs = [
      'app',
      'components',
      'lib',
      'prisma',
      'styles',
    ];

    requiredDirs.forEach(dir => {
      expect(fs.existsSync(path.join(process.cwd(), dir))).toBe(true);
    });
  });

  test('env.example file exists', () => {
    // Check if env.example file exists
    const envExamplePath = path.join(process.cwd(), 'env.example');
    expect(fs.existsSync(envExamplePath)).toBe(true);

    // Check if env file has required variables
    const envContent = fs.readFileSync(envExamplePath, 'utf8');
    const requiredVars = [
      'DATABASE_URL',
      'NEXTAUTH_SECRET',
      'OPENAI_API_KEY',
    ];

    requiredVars.forEach(varName => {
      expect(envContent).toContain(varName);
    });
  });

  test('Prisma schema has required models', () => {
    // Check if prisma schema file exists
    const schemaPath = path.join(process.cwd(), 'prisma', 'schema.prisma');
    expect(fs.existsSync(schemaPath)).toBe(true);

    // Check if schema contains required models
    const schemaContent = fs.readFileSync(schemaPath, 'utf8');
    const requiredModels = ['User', 'Project', 'Task'];

    requiredModels.forEach(model => {
      expect(schemaContent).toContain(`model ${model}`);
    });
  });
}); 