import readline from 'readline';
import fs from 'fs';
import path from 'path';
import { createBooking, cancelBooking } from '../src/services/bookings.js';
import { getFallbackSlots } from '../src/services/recommendations.js';

function resolveCaller(args = {}, msg = {}) {
  const token = args.token || args.sessionToken || msg.params?._meta?.token || process.env.MCP_AUTH_TOKEN || null;
  const rawId = args.userId ?? args.user_id ?? msg.params?._meta?.userId ?? process.env.MCP_USER_ID;
  const userId = rawId !== undefined && rawId !== null && rawId !== '' ? Number(rawId) : null;
  return { authenticated: Boolean(userId || token), userId: userId ?? (token ? 1 : null) };
}

function toolResult(text, isError = false) {
  return { content: [{ type: 'text', text: typeof text === 'string' ? text : JSON.stringify(text) }], isError };
}

function runAuthenticated(caller, fn) {
  if (!caller.authenticated || !caller.userId) return toolResult('Unauthorized', true);
  try {
    return toolResult(fn(caller.userId), false);
  } catch (err) {
    return toolResult(err.message, true);
  }
}

const TOOLS = [
  {
    name: 'find_lecture',
    description: 'Return the title and topics of one course lecture by its number, 1 to 12.',
    inputSchema: { type: 'object', properties: { number: { type: 'integer' } }, required: ['number'] },
  },
  {
    name: 'get_course_info',
    description: 'Return general information about the Web Development course and requirements.',
    inputSchema: { type: 'object', properties: {} },
  },
  {
    name: 'check_availability',
    description: 'Check available time slots for a workstation and date via the booking service.',
    inputSchema: {
      type: 'object',
      properties: { workstationId: { type: 'integer' }, date: { type: 'string' }, userId: { type: 'integer' }, token: { type: 'string' } },
      required: ['workstationId', 'date'],
    },
  },
  {
    name: 'create_booking',
    description: 'Create a new lab booking for an authenticated user via the booking service.',
    inputSchema: {
      type: 'object',
      properties: {
        userId: { type: 'integer' },
        workstationId: { type: 'integer' },
        date: { type: 'string' },
        startTime: { type: 'string' },
        endTime: { type: 'string' },
        token: { type: 'string' },
      },
      required: ['workstationId', 'date', 'startTime', 'endTime'],
    },
  },
  {
    name: 'cancel_booking',
    description: 'Cancel an existing booking by ID for the booking owner or admin.',
    inputSchema: {
      type: 'object',
      properties: { bookingId: { type: 'integer' }, userId: { type: 'integer' }, token: { type: 'string' } },
      required: ['bookingId'],
    },
  },
];

const rl = readline.createInterface({ input: process.stdin, output: process.stdout, terminal: false });

rl.on('line', (line) => {
  if (!line.trim()) return;
  try {
    const msg = JSON.parse(line);
    let result = null;
    let isErrorRpc = false;

    if (msg.method === 'initialize') {
      result = { protocolVersion: '2025-11-25', capabilities: { tools: {} }, serverInfo: { name: 'lectures', version: '0.1.0' } };
    } else if (msg.method === 'tools/list') {
      result = { tools: TOOLS };
    } else if (msg.method === 'tools/call') {
      const { name, arguments: args = {} } = msg.params || {};
      const caller = resolveCaller(args, msg);

      if (name === 'find_lecture') {
        const lectures = JSON.parse(fs.readFileSync(path.join(process.cwd(), 'mcp-server', 'lectures.json'), 'utf8'));
        const lecture = lectures.find((l) => l.number === args.number);
        result = lecture
          ? toolResult(`Lecture ${lecture.number}: ${lecture.title}. Topics: ${lecture.topics}`)
          : toolResult(`There is no lecture ${args.number}.`, true);
      } else if (name === 'get_course_info') {
        result = toolResult('Course: Fundamentals for Internet Programming. Web Development Master Programme.');
      } else if (name === 'check_availability') {
        result = runAuthenticated(caller, () =>
          getFallbackSlots({ workstationId: Number(args.workstationId), date: args.date })
        );
      } else if (name === 'create_booking') {
        result = runAuthenticated(caller, (userId) =>
          createBooking({
            userId,
            workstationId: Number(args.workstationId),
            date: args.date,
            startTime: args.startTime,
            endTime: args.endTime,
          })
        );
      } else if (name === 'cancel_booking') {
        result = runAuthenticated(caller, (userId) =>
          cancelBooking({ bookingId: Number(args.bookingId), userId })
        );
      } else {
        isErrorRpc = true;
        result = { code: -32602, message: `Unknown tool: ${name}` };
      }
    } else if (msg.id !== undefined && msg.method !== 'notifications/initialized') {
      isErrorRpc = true;
      result = { code: -32601, message: `Unknown method: ${msg.method}` };
    }

    if (result && msg.id !== undefined) {
      console.log(JSON.stringify(isErrorRpc ? { jsonrpc: '2.0', id: msg.id, error: result } : { jsonrpc: '2.0', id: msg.id, result }));
    }
  } catch (err) {
    console.error('Error handling message:', err);
  }
});