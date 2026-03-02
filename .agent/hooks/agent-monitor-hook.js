#!/usr/bin/env node

/**
 * Agent Monitor Hook - PostToolUse Hook for Task Tool
 *
 * Captures agent invocations and writes to agent-status.json for real-time visualization.
 * Tracks: agent type, skill, task description, timing, and communication graph.
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
  if (DEBUG) console.error(`[agent-monitor] ${msg}`);
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

function extractSkills(prompt) {
  const skillMatch = prompt.match(/skill[s]?[:\s]+([a-z-]+(?:,\s*[a-z-]+)*)/i);
  return skillMatch ? skillMatch[1].split(',').map(s => s.trim()) : [];
}

async function main() {
  try {
    const stdin = fs.readFileSync(0, 'utf-8').trim();
    if (!stdin) process.exit(0);

    const payload = JSON.parse(stdin);

    // Only process Task tool calls
    if (payload.tool_name !== 'Task') {
      debugLog('Not a Task tool, skipping');
      process.exit(0);
    }

    const toolInput = payload.tool_input || {};
    const agentType = toolInput.subagent_type;
    const description = toolInput.description || 'Unknown task';
    const prompt = toolInput.prompt || '';

    if (!agentType) {
      debugLog('No subagent_type found');
      process.exit(0);
    }

    debugLog(`Task tool invoked: ${agentType}`);

    ensureStatusFile();
    const status = readStatus();

    const agentId = `agent-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const skills = extractSkills(prompt);

    const newAgent = {
      id: agentId,
      type: agentType,
      skills: skills.length > 0 ? skills : [agentType.toLowerCase()],
      status: 'running',
      task: description,
      progress: 0,
      startTime: new Date().toISOString(),
      endTime: null,
      resources: {
        tokens: 0,
        apiCalls: 0,
        duration: 0
      },
      communicatesWith: []
    };

    // Add to active agents
    status.agents.push(newAgent);

    // Add to history
    status.history.unshift({
      ...newAgent,
      eventType: 'agent_started',
      timestamp: newAgent.startTime
    });

    // Keep history limited to 50 entries
    if (status.history.length > 50) {
      status.history = status.history.slice(0, 50);
    }

    status.timestamp = new Date().toISOString();
    writeStatus(status);

    debugLog(`Agent ${agentId} (${agentType}) added to status`);
    process.exit(0);

  } catch (error) {
    console.error(JSON.stringify({
      hookSpecificOutput: {
        hookEventName: "PostToolUse",
        additionalContext: `Agent monitor error: ${error.message}`
      }
    }));
    process.exit(0);
  }
}

main();
