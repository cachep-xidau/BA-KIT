#!/usr/bin/env node
'use strict';

/**
 * Custom Claude Code statusline for Node.js
 * Cross-platform support: Windows, macOS, Linux
 * Theme: detailed | Colors: true | Features: directory, git, model, usage, session, tokens
 * No external dependencies - uses only Node.js built-in modules
 */

const { stdin, stdout, env } = require('process');
const { execSync } = require('child_process');
const os = require('os');

// Configuration
const USE_COLOR = !env.NO_COLOR && (stdout.isTTY || env.FORCE_COLOR || env.CLAUDE_PROJECT_DIR);

// Color helpers
const color = (code) => USE_COLOR ? `\x1b[${code}m` : '';
const reset = () => USE_COLOR ? '\x1b[0m' : '';

// Color definitions
const DirColor = color('36');      // cyan
const ModelColor = color('35');    // magenta
const UsageColor = color('35');    // magenta
const CostColor = color('32');     // green (for cost display)
const Reset = reset();

/**
 * Safe command execution wrapper
 */
function exec(cmd) {
    try {
        return execSync(cmd, {
            encoding: 'utf8',
            stdio: ['pipe', 'pipe', 'ignore'],
            windowsHide: true
        }).trim();
    } catch (err) {
        return '';
    }
}

/**
 * Expand home directory to ~
 */
function expandHome(path) {
    const homeDir = os.homedir();
    if (path.startsWith(homeDir)) {
        return path.replace(homeDir, '~');
    }
    return path;
}

/**
 * Read stdin asynchronously
 */
async function readStdin() {
    return new Promise((resolve, reject) => {
        const chunks = [];
        stdin.setEncoding('utf8');

        stdin.on('data', (chunk) => {
            chunks.push(chunk);
        });

        stdin.on('end', () => {
            resolve(chunks.join(''));
        });

        stdin.on('error', (err) => {
            reject(err);
        });
    });
}

/**
 * Main function
 */
async function main() {
    try {
        // Read and parse JSON input
        const input = await readStdin();
        if (!input.trim()) {
            console.error('No input provided');
            process.exit(1);
        }

        const data = JSON.parse(input);

        // Extract basic information
        let currentDir = 'unknown';
        if (data.workspace?.current_dir) {
            currentDir = data.workspace.current_dir;
        } else if (data.cwd) {
            currentDir = data.cwd;
        }
        currentDir = expandHome(currentDir);

        const modelName = data.model?.display_name || 'Claude';
        const modelVersion = data.model?.version && data.model.version !== 'null' ? data.model.version : '';

        // Git branch detection
        let gitBranch = '';
        const gitCheck = exec('git rev-parse --git-dir');
        if (gitCheck) {
            gitBranch = exec('git branch --show-current');
            if (!gitBranch) {
                gitBranch = exec('git rev-parse --short HEAD');
            }
        }

        // ccusage integration
        let costUSD = '';
        let totalTokens = '';

        try {
            // Use global ccusage (avoid npx which causes terminal flicker)
            let blocksOutput = exec('ccusage blocks --json');

            if (blocksOutput) {
                const blocks = JSON.parse(blocksOutput);
                const activeBlock = blocks.blocks?.find(b => b.isActive === true);

                if (activeBlock) {
                    costUSD = activeBlock.costUSD || '';
                    totalTokens = activeBlock.totalTokens || '';
                }
            }
        } catch (err) {
            // Silent fail - ccusage not available or error
        }

        // Render statusline
        let output = '';

        // Directory (simplified - just folder name)
        const dirName = currentDir.split('/').filter(Boolean).pop() || currentDir;
        output += `📁 ${DirColor}${dirName}${Reset}`;

        // Model
        output += `  🤖 ${ModelColor}${modelName}${Reset}`;

        // Cost
        if (costUSD && /^\d+(\.\d+)?$/.test(costUSD)) {
            const costUSDNum = parseFloat(costUSD);
            output += `  💵 ${CostColor}$${costUSDNum.toFixed(2)}${Reset}`;
        }

        // Token count (in thousands)
        if (totalTokens && /^\d+$/.test(totalTokens)) {
            const tokensInThousands = (parseInt(totalTokens) / 1000).toFixed(1);
            output += `  🎯 ${UsageColor}${tokensInThousands}k${Reset}`;
        }

        console.log(output);
    } catch (err) {
        console.error('Error:', err.message);
        process.exit(1);
    }
}

main().catch(err => {
    console.error('Fatal error:', err);
    process.exit(1);
});
