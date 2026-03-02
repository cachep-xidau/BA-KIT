#!/usr/bin/env node

/**
 * CLI Session Tracker Hook - PostToolUse Hook for ALL Tools
 *
 * Tracks each CLI session's activity and displays them as "agents" in the visualization.
 * Each CLI session is identified by its parent process ID (PPID).
 *
 * Exit Codes:
 *   0 - Success (non-blocking)
 */

const fs = require('fs');
const path = require('path');

const DEBUG = process.env.AGENT_MONITOR_DEBUG === 'true';
const PROJECT_DIR = process.env.CLAUDE_PROJECT_DIR || process.cwd();
const STATUS_FILE = path.join(PROJECT_DIR, 'projects', 'agent-office-visualization', 'agent-status.json');

function debugLog(msg) {
  if (DEBUG) console.error(`[cli-session-tracker] ${msg}`);
}

function ensureStatusFile() {
  const dir = path.dirname(STATUS_FILE);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  if (!fs.existsSync(STATUS_FILE)) {
    fs.writeFileSync(STATUS_FILE, JSON.stringify({
      timestamp: new Date().toISOString(),
      agents: [],
      history: []
    }, null, 2));
  }
}

function readStatus() {
  try {
    return JSON.parse(fs.readFileSync(STATUS_FILE, 'utf-8'));
  } catch {
    return { timestamp: new Date().toISOString(), agents: [], history: [] };
  }
}

function writeStatus(data) {
  fs.writeFileSync(STATUS_FILE, JSON.stringify(data, null, 2));
}

function getSessionId() {
  // Use PPID (parent process ID) as unique session identifier
  return `cli-session-${process.ppid}`;
}

function getToolCategory(toolName) {
  const categories = {
    'Read': 'reading',
    'Write': 'writing',
    'Edit': 'editing',
    'Bash': 'executing',
    'Task': 'spawning-agent',
    'Glob': 'searching',
    'Grep': 'searching',
    'WebFetch': 'researching',
    'WebSearch': 'researching',
    'AskUserQuestion': 'thinking',
    'EnterPlanMode': 'planning',
    'ExitPlanMode': 'planning'
  };
  return categories[toolName] || 'working';
}

function getActivityDescription(toolName, toolInput) {
  const descriptions = {
    'Read': `Reading ${path.basename(toolInput?.file_path || 'file')}`,
    'Write': `Writing ${path.basename(toolInput?.file_path || 'file')}`,
    'Edit': `Editing ${path.basename(toolInput?.file_path || 'file')}`,
    'Bash': `Running: ${(toolInput?.command || '').substring(0, 50)}${toolInput?.command?.length > 50 ? '...' : ''}`,
    'Task': `Spawning ${toolInput?.subagent_type || 'agent'}`,
    'Glob': `Searching: ${toolInput?.pattern || '*'}`,
    'Grep': `Searching code: ${(toolInput?.pattern || '').substring(0, 40)}`,
    'WebFetch': 'Fetching web content',
    'WebSearch': `Searching: ${(toolInput?.query || '').substring(0, 40)}`,
    'AskUserQuestion': 'Asking user question',
    'EnterPlanMode': 'Entering plan mode',
    'ExitPlanMode': 'Exiting plan mode'
  };
  return descriptions[toolName] || `Using ${toolName}`;
}

function inferRole(recentTools) {
  // Infer role based on recent tool usage patterns
  const toolCounts = {};
  recentTools.forEach(t => {
    const category = getToolCategory(t);
    toolCounts[category] = (toolCounts[category] || 0) + 1;
  });

  const dominant = Object.entries(toolCounts).sort((a, b) => b[1] - a[1])[0];

  if (!dominant) return 'Developer';

  const roleMap = {
    'reading': 'Code Reader',
    'writing': 'Code Writer',
    'editing': 'Code Editor',
    'executing': 'Task Runner',
    'spawning-agent': 'Orchestrator',
    'searching': 'Explorer',
    'researching': 'Researcher',
    'thinking': 'Analyst',
    'planning': 'Planner'
  };

  return roleMap[dominant[0]] || 'Developer';
}

async function main() {
  try {
    const stdin = fs.readFileSync(0, 'utf-8').trim();
    if (!stdin) process.exit(0);

    const payload = JSON.parse(stdin);
    const toolName = payload.tool_name;
    const toolInput = payload.tool_input || {};

    // Skip certain tools that create too much noise
    const skipTools = ['TaskOutput', 'TaskList', 'TaskGet', 'TaskUpdate', 'TaskCreate'];
    if (skipTools.includes(toolName)) {
      process.exit(0);
    }

    debugLog(`Tool called: ${toolName}`);

    ensureStatusFile();
    const status = readStatus();

    const sessionId = getSessionId();
    const activity = getActivityDescription(toolName, toolInput);
    const category = getToolCategory(toolName);

    // Find or create session
    let session = status.agents.find(a => a.id === sessionId);

    if (!session) {
      // New session
      session = {
        id: sessionId,
        type: 'CLI Session',
        skills: ['cli-session'],
        status: 'running',
        task: activity,
        progress: 0,
        startTime: new Date().toISOString(),
        endTime: null,
        resources: {
          tokens: 0,
          apiCalls: 0,
          duration: 0
        },
        communicatesWith: [],
        metadata: {
          pid: process.ppid,
          recentTools: [toolName],
          lastActivity: new Date().toISOString(),
          role: 'Developer',
          cwd: process.cwd()
        }
      };

      status.agents.push(session);

      // Add to history
      status.history.unshift({
        ...session,
        eventType: 'session_started',
        timestamp: session.startTime
      });

      debugLog(`New session ${sessionId} started`);
    } else {
      // Update existing session
      session.task = activity;
      session.metadata.lastActivity = new Date().toISOString();
      session.metadata.recentTools = session.metadata.recentTools || [];
      session.metadata.recentTools.unshift(toolName);

      // Keep last 10 tools
      if (session.metadata.recentTools.length > 10) {
        session.metadata.recentTools = session.metadata.recentTools.slice(0, 10);
      }

      // Update role based on activity
      session.metadata.role = inferRole(session.metadata.recentTools);
      session.type = session.metadata.role;

      // Update progress (fake progress based on activity count)
      const activityCount = session.metadata.recentTools.length;
      session.progress = Math.min(activityCount / 20, 0.95);

      debugLog(`Session ${sessionId} updated: ${activity}`);
    }

    // Clean up stale sessions (inactive > 5 minutes)
    const fiveMinutesAgo = Date.now() - (5 * 60 * 1000);
    status.agents = status.agents.filter(agent => {
      if (!agent.metadata?.lastActivity) return true;
      const lastActive = new Date(agent.metadata.lastActivity).getTime();
      if (lastActive < fiveMinutesAgo) {
        debugLog(`Removing stale session ${agent.id}`);
        return false;
      }
      return true;
    });

    // Keep history limited to 50 entries
    if (status.history.length > 50) {
      status.history = status.history.slice(0, 50);
    }

    status.timestamp = new Date().toISOString();
    writeStatus(status);

    process.exit(0);

  } catch (error) {
    console.error(JSON.stringify({
      hookSpecificOutput: {
        hookEventName: "PostToolUse",
        additionalContext: `CLI session tracker error: ${error.message}`
      }
    }));
    process.exit(0);
  }
}

main();
