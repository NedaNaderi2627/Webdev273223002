import readline from 'readline';
import fs from 'fs';
import path from 'path';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
  terminal: false
});

rl.on('line', (line) => {
  if (!line.trim()) return;

  try {
    const msg = JSON.parse(line);
    console.error('got:', line);

    let response = null;

    if (msg.method === 'initialize') {
      response = {
        jsonrpc: '2.0',
        id: msg.id,
        result: {
          protocolVersion: '2025-11-25',
          capabilities: { tools: {} },
          serverInfo: { name: 'lectures', version: '0.1.0' }
        }
      };
    }
    else if (msg.method === 'notifications/initialized') {
      response = null;
    }
    else if (msg.method === 'tools/list') {
      response = {
        jsonrpc: '2.0',
        id: msg.id,
        result: {
          tools: [
            {
              name: 'find_lecture',
              description: 'Return the title and topics of one course lecture by its number, 1 to 12. Use it when asked what a lecture covers. Returns one line of text.',
              inputSchema: {
                type: 'object',
                properties: {
                  number: {
                    type: 'integer',
                    description: 'Lecture number, 1 to 12'
                  }
                },
                required: ['number']
              }
            },
            {
              name: 'get_course_info',
              description: 'Return general information about the Web Development course, structure, and requirements. Use when asked about general course details.',
              inputSchema: {
                type: 'object',
                properties: {},
                required: []
              }
            }
          ]
        }
      };
    }
    else if (msg.method === 'tools/call') {
      const toolName = msg.params?.name;
      const args = msg.params?.arguments || {};

      if (toolName === 'find_lecture') {
        const num = args.number;
        const filePath = path.join(process.cwd(), 'mcp-server', 'lectures.json');
        const fileData = fs.readFileSync(filePath, 'utf8');
        const lectures = JSON.parse(fileData);

        const lecture = lectures.find(l => l.number === num);

        if (lecture) {
          response = {
            jsonrpc: '2.0',
            id: msg.id,
            result: {
              content: [
                {
                  type: 'text',
                  text: `Lecture ${lecture.number}: ${lecture.title}. Topics: ${lecture.topics}`
                }
              ],
              isError: false
            }
          };
        } else {
          response = {
            jsonrpc: '2.0',
            id: msg.id,
            result: {
              content: [
                {
                  type: 'text',
                  text: `There is no lecture ${num}. The course has lectures 1 to 12.`
                }
              ],
              isError: true
            }
          };
        }
      }
      else if (toolName === 'get_course_info') {
        response = {
          jsonrpc: '2.0',
          id: msg.id,
          result: {
            content: [
              {
                type: 'text',
                text: 'Course: Fundamentals for Internet Programming. Web Development Master Programme.'
              }
            ],
            isError: false
          }
        };
      }
      else {
        response = {
          jsonrpc: '2.0',
          id: msg.id,
          error: {
            code: -32602,
            message: `Unknown tool: ${toolName}`
          }
        };
      }
    }
    else if (msg.id !== undefined) {
      response = {
        jsonrpc: '2.0',
        id: msg.id,
        error: {
          code: -32601,
          message: `Unknown method: ${msg.method}`
        }
      };
    }

    if (response) {
      console.log(JSON.stringify(response));
    }
  } catch (err) {
    console.error('Error handling message:', err);
  }
});