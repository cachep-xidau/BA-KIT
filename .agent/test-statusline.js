#!/usr/bin/env node
/**
 * Test statusline color output with different context percentages
 */

const { spawn } = require('child_process');
const path = require('path');

const statuslinePath = path.join(__dirname, 'statusline.js');

const testCases = [
  { context: 85, label: '>40% (should be GREEN)' },
  { context: 45, label: '>40% (should be GREEN)' },
  { context: 40, label: '40% (should be ORANGE)' },
  { context: 30, label: '20-40% (should be ORANGE)' },
  { context: 20, label: '20% (should be ORANGE)' },
  { context: 19, label: '<20% (should be RED)' },
  { context: 10, label: '<20% (should be RED)' },
  { context: 5, label: '<20% (should be RED)' }
];

console.log('Testing statusline colors:\n');

testCases.forEach(({ context, label }) => {
  const mockData = {
    workspace: { current_dir: '/Users/lucasbraci/Desktop/Antigravity' },
    model: { display_name: 'Claude', version: '3.5' },
    context_window: { remaining_percentage: context }
  };

  const child = spawn('node', [statuslinePath], {
    stdio: ['pipe', 'pipe', 'inherit']
  });

  child.stdin.write(JSON.stringify(mockData));
  child.stdin.end();

  child.stdout.on('data', (data) => {
    console.log(`${context}% - ${label}`);
    console.log(data.toString());
    console.log('');
  });
});
