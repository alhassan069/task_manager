import { OpenAI } from 'openai';

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export type TaskPriority = 'P1' | 'P2' | 'P3';

export interface ParsedTask {
  title: string;
  dueDate?: Date;
  priority?: TaskPriority;
  assignee?: string;
  error?: string;
}

export class TaskParsingError extends Error {
  constructor(message: string, public code: string) {
    super(message);
    this.name = 'TaskParsingError';
  }
}

/**
 * Parse natural language input into structured task data
 */
export async function parseTask(input: string): Promise<ParsedTask> {
  try {
    if (!input.trim()) {
      throw new TaskParsingError('Input cannot be empty', 'EMPTY_INPUT');
    }

    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: `You are a task parsing assistant. Parse the following task input into structured data.
            Extract:
            - Title (required)
            - Due date (if mentioned)
            - Priority (P1, P2, or P3)
            - Assignee (if mentioned)
            
            Respond in JSON format only.`
        },
        {
          role: "user",
          content: input
        }
      ],
      temperature: 0.3,
      max_tokens: 150,
    });
    

    const response = completion.choices[0]?.message?.content;
    if (!response) {
      throw new TaskParsingError('No response from OpenAI', 'NO_RESPONSE');
    }

    try {
      const parsed = JSON.parse(response);
      
      // Validate required fields
      if (!parsed.title) {
        throw new TaskParsingError('Title is required', 'INVALID_TITLE');
      }

      // Convert date string to Date object if present
      if (parsed.dueDate) {
        parsed.dueDate = new Date(parsed.dueDate);
        if (isNaN(parsed.dueDate.getTime())) {
          throw new TaskParsingError('Invalid date format', 'INVALID_DATE');
        }
      }

      // Validate priority if present
      if (parsed.priority && !['P1', 'P2', 'P3'].includes(parsed.priority)) {
        throw new TaskParsingError('Invalid priority value', 'INVALID_PRIORITY');
      }
      return parsed;
    } catch (parseError) {
      throw new TaskParsingError(
        'Failed to parse OpenAI response',
        'PARSE_ERROR'
      );
    }
  } catch (error) {
    if (error instanceof TaskParsingError) {
      throw error;
    }

    // Handle OpenAI API errors
    if (error instanceof OpenAI.APIError) {
      throw new TaskParsingError(
        `OpenAI API error: ${error.message}`,
        'API_ERROR'
      );
    }

    // Handle network errors
    if (error instanceof Error) {
      throw new TaskParsingError(
        `Network error: ${error.message}`,
        'NETWORK_ERROR'
      );
    }

    // Fallback for unknown errors
    throw new TaskParsingError(
      'An unexpected error occurred',
      'UNKNOWN_ERROR'
    );
  }
}

// Fallback parser for when OpenAI is unavailable
export function fallbackParseTask(input: string): ParsedTask {
  return {
    title: input,
    priority: 'P3',
  };
} 