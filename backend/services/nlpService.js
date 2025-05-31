const { OpenAI } = require('openai');
const dotenv = require('dotenv');
const logger = require('../utils/logger');

dotenv.config();

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

/**
 * Parse natural language task input using OpenAI
 * @param {string} taskInput - Natural language task description
 * @returns {Object} - Parsed task components
 */
const parseTask = async (taskInput) => {
  logger.info('Parsing task with NLP', { taskInput });
  
  try {
    const startTime = Date.now();
    
    const response = await openai.chat.completions.create({
      model: "gpt-4-turbo",
      messages: [
        {
          role: "system",
          content: `You are a task parsing assistant. Extract the following components from the task description:
            1. Task name (the main action/task)
            2. Assignee name (if present)
            3. Due date/time (in IST timezone if specified)
            4. Priority (P1, P2, P3, or P4)
            
            Format your response as a JSON object with these fields:
            {
              "taskName": "string",
              "assignee": "string or null",
              "dueDate": "ISO date string or null",
              "priority": "P1, P2, P3, or P4"
            }
            
            If you get any information about relative time for example "in 2 days" or "Tomorrow" or "EOD", take ${new Date().toLocaleString()} as the current time.
            Priority should be a number between P1 and P4, where P1 is the highest priority and P4 is the lowest priority. If you get any information about priority, use the following mapping:
            - "High" -> P1
            - "Medium" -> P2
            - "Low" -> P3
            - "Very Low" -> P4
            - "Critical" -> P1
            - "Urgent" -> P1
            - "Important" -> P2
            - "Immediate" -> P1
            - "Not Important" -> P3
            - "Optional" -> P4
            - "Neglected" -> P4
            - "Trivial" -> P4
            - "Minor" -> P4
            - "Optional" -> P4

            If any field is not specified, set it to null (except priority, which defaults to P3).
            Return ONLY the JSON object, no other text.`
        },
        {
          role: "user",
          content: taskInput
        }
      ],
      temperature: 0.2,
      max_tokens: 500,
      response_format: { type: "json_object" }
    });

    const processingTime = Date.now() - startTime;
    
    // Parse the JSON response
    const result = JSON.parse(response.choices[0].message.content);
    
    // Log successful parsing
    logger.info('Task parsed successfully', {
      processingTime,
      taskName: result.taskName,
      hasAssignee: !!result.assignee,
      hasDueDate: !!result.dueDate,
      priority: result.priority || 'P3'
    });
    
    // Apply default values
    return {
      taskName: result.taskName || taskInput,
      assignee: result.assignee || null,
      dueDate: result.dueDate || null,
      priority: result.priority || "P3"
    };
  } catch (error) {
    // Log detailed error information
    logger.error('Error parsing task with OpenAI', {
      error: error.message,
      stack: error.stack,
      taskInput,
      statusCode: error.status || error.statusCode,
      type: error.type || error.code
    });
    
    // Return default structure on error
    return {
      taskName: taskInput,
      assignee: null,
      dueDate: null,
      priority: "P3",
      error: "Failed to parse task"
    };
  }
};

module.exports = {
  parseTask
}; 