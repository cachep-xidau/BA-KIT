#!/usr/bin/env node
'use strict';

const { stdin } = require('process');
const { execSync } = require('child_process');

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

async function readStdin() {
    return new Promise((resolve) => {
        const chunks = [];
        stdin.setEncoding('utf8');
        stdin.on('data', (chunk) => chunks.push(chunk));
        stdin.on('end', () => resolve(chunks.join('')));
    });
}

async function main() {
    try {
        const input = await readStdin();
        const data = JSON.parse(input);

        // Get folder name
        const currentDir = data.workspace?.current_dir || data.cwd || 'unknown';
        const folderName = currentDir.split('/').pop();

        // Get model name
        const modelName = data.model?.display_name || 'Claude';

        // Get context percentage with color
        const contextPercent = data.context_window?.remaining_percentage || 0;
        let contextColor = '\x1b[32m'; // green
        if (contextPercent <= 25) {
            contextColor = '\x1b[31m'; // red
        } else if (contextPercent <= 50) {
            contextColor = '\x1b[33m'; // yellow
        }

        // Get cost from ccusage
        let costText = '';
        try {
            let blocksOutput = exec('npx ccusage@latest blocks --json');
            if (!blocksOutput) {
                blocksOutput = exec('ccusage blocks --json');
            }

            if (blocksOutput) {
                const blocks = JSON.parse(blocksOutput);
                const activeBlock = blocks.blocks?.find(b => b.isActive === true);

                if (activeBlock && activeBlock.costUSD) {
                    const cost = parseFloat(activeBlock.costUSD);
                    costText = ` | Cost: \x1b[32m$${cost.toFixed(1)}\x1b[0m`;
                }
            }
        } catch (err) {
            // Silent fail - ccusage not available
        }

        // Output
        console.log(`${folderName} | ${modelName} | Context: ${contextColor}${contextPercent}%\x1b[0m remaining${costText}`);
    } catch (err) {
        console.error('Error:', err.message);
        process.exit(1);
    }
}

main();
