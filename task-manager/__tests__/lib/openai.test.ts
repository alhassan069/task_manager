import { parseTask, fallbackParseTask, TaskParsingError } from '../../lib/openai';

// Mock OpenAI
jest.mock('openai', () => {
  return {
    OpenAI: jest.fn().mockImplementation(() => ({
      chat: {
        completions: {
          create: jest.fn().mockImplementation(async ({ messages }) => {
            const input = messages[1].content;
            
            // Simulate different responses based on input
            if (input.includes('tomorrow')) {
              return {
                choices: [{
                  message: {
                    content: JSON.stringify({
                      title: 'Call John',
                      dueDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
                      priority: 'P2',
                      assignee: 'John'
                    })
                  }
                }]
              };
            }
            
            if (input.includes('invalid')) {
              return {
                choices: [{
                  message: {
                    content: 'invalid json'
                  }
                }]
              };
            }
            
            return {
              choices: [{
                message: {
                  content: JSON.stringify({
                    title: 'Test Task',
                    priority: 'P3'
                  })
                }
              }]
            };
          })
        }
      }
    }))
  };
});

describe('OpenAI Task Parser', () => {
  test('successfully parses valid task input', async () => {
    const result = await parseTask('Call John tomorrow at 3pm');
    
    expect(result).toHaveProperty('title', 'Call John');
    expect(result).toHaveProperty('dueDate');
    expect(result.dueDate).toBeInstanceOf(Date);
    expect(result).toHaveProperty('priority', 'P2');
    expect(result).toHaveProperty('assignee', 'John');
  });

  test('handles task without optional fields', async () => {
    const result = await parseTask('Simple task');
    
    expect(result).toHaveProperty('title', 'Test Task');
    expect(result).toHaveProperty('priority', 'P3');
    expect(result).not.toHaveProperty('dueDate');
    expect(result).not.toHaveProperty('assignee');
  });

  test('throws error for empty input', async () => {
    await expect(parseTask('')).rejects.toThrow(TaskParsingError);
    await expect(parseTask('')).rejects.toThrow('Input cannot be empty');
  });

  test('throws error for invalid JSON response', async () => {
    await expect(parseTask('invalid json task')).rejects.toThrow(TaskParsingError);
    await expect(parseTask('invalid json task')).rejects.toThrow('Failed to parse OpenAI response');
  });

  test('fallback parser works when OpenAI is unavailable', () => {
    const result = fallbackParseTask('Fallback task');
    
    expect(result).toHaveProperty('title', 'Fallback task');
    expect(result).toHaveProperty('priority', 'P3');
    expect(result).not.toHaveProperty('dueDate');
    expect(result).not.toHaveProperty('assignee');
  });
}); 