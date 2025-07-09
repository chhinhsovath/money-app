#!/usr/bin/env node

/**
 * CLI script to query Context7 for Claude Code context enhancement
 * Usage: node scripts/context7-claude-cli.js <command> [options]
 */

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const CLAUDE_CONTEXT_FILE = path.join(__dirname, '../.claude-context.md');

function runC7Command(command) {
  try {
    const result = execSync(`npx c7 ${command}`, { encoding: 'utf-8' });
    return result;
  } catch (error) {
    console.error('Error running c7 command:', error.message);
    return null;
  }
}

function appendToClaudeContext(content, title) {
  const timestamp = new Date().toISOString();
  const header = `\n\n## ${title}\n_Generated at: ${timestamp}_\n\n`;
  
  try {
    fs.appendFileSync(CLAUDE_CONTEXT_FILE, header + content);
    console.log(`✓ Added ${title} to Claude context file`);
  } catch (error) {
    console.error('Error writing to Claude context file:', error.message);
  }
}

function initClaudeContext() {
  const initialContent = `# Claude Code Context File

This file contains documentation and context gathered from Context7 to help Claude Code understand the project better.

## Project Tech Stack
- React 18.3.1
- Vite 6.0.7
- Tailwind CSS 3.4.17
- PostgreSQL (via pg 8.11.3)
- React Router DOM 7.2.0
- React Hook Form 7.54.2

---
`;

  try {
    fs.writeFileSync(CLAUDE_CONTEXT_FILE, initialContent);
    console.log('✓ Initialized Claude context file');
  } catch (error) {
    console.error('Error initializing Claude context file:', error.message);
  }
}

function gatherProjectContext() {
  console.log('Gathering documentation context for the project...\n');
  
  // Initialize the context file
  initClaudeContext();
  
  // Key topics to gather for this financial management app
  const queries = [
    { project: 'react', topic: 'hooks best practices', title: 'React Hooks Best Practices' },
    { project: 'react', topic: 'form handling', title: 'React Form Handling' },
    { project: 'vite', topic: 'configuration', title: 'Vite Configuration' },
    { project: 'tailwindcss', topic: 'responsive design', title: 'Tailwind Responsive Design' },
    { project: 'postgresql', topic: 'transactions', title: 'PostgreSQL Transactions' },
    { project: 'postgresql', topic: 'indexes performance', title: 'PostgreSQL Performance' },
  ];
  
  for (const { project, topic, title } of queries) {
    console.log(`Fetching: ${title}...`);
    const result = runC7Command(`${project} "${topic}"`);
    if (result) {
      appendToClaudeContext(result, title);
    }
  }
  
  console.log('\n✓ Context gathering complete!');
  console.log(`Context file saved at: ${CLAUDE_CONTEXT_FILE}`);
}

function queryAndSave(project, topic) {
  const result = runC7Command(`${project} "${topic}"`);
  if (result) {
    const title = `${project}: ${topic}`;
    appendToClaudeContext(result, title);
    console.log(result);
  }
}

// Main CLI logic
const args = process.argv.slice(2);
const command = args[0];

switch (command) {
  case 'init':
    initClaudeContext();
    break;
    
  case 'gather':
    gatherProjectContext();
    break;
    
  case 'query':
    if (args.length < 3) {
      console.error('Usage: node context7-claude-cli.js query <project> <topic>');
      process.exit(1);
    }
    queryAndSave(args[1], args.slice(2).join(' '));
    break;
    
  case 'help':
  default:
    console.log(`
Context7 Claude CLI - Documentation context helper for Claude Code

Usage:
  node scripts/context7-claude-cli.js <command> [options]

Commands:
  init              Initialize a new Claude context file
  gather            Gather comprehensive documentation for the project
  query <p> <t>     Query specific project and topic, save to context
  help              Show this help message

Examples:
  node scripts/context7-claude-cli.js init
  node scripts/context7-claude-cli.js gather
  node scripts/context7-claude-cli.js query react "state management"
  node scripts/context7-claude-cli.js query postgresql "json queries"
`);
    break;
}

process.exit(0);