#!/usr/bin/env node

/**
 * Database Consistency Checker
 * Ensures table structures are consistent across environments
 */

const { Pool } = require('pg');
const fs = require('fs').promises;
const path = require('path');

// Database configurations
const environments = {
  local: {
    name: 'Local Development',
    host: 'localhost',
    port: 5432,
    database: 'moneyapp',
    user: 'postgres',
    password: '12345'
  },
  production: {
    name: 'Production',
    host: '137.184.109.21',
    port: 5432,
    database: 'moneyapp',
    user: 'postgres',
    password: 'P@ssw0rd'
  }
};

// Core tables to check
const coreTables = [
  'organizations',
  'users',
  'contacts',
  'invoices',
  'invoice_line_items',
  'bills',
  'bill_line_items',
  'payments',
  'payment_allocations',
  'accounts',
  'journal_entries',
  'journal_entry_lines',
  'bank_accounts',
  'bank_transactions',
  'items',
  'tax_rates',
  'expense_claims',
  'expense_claim_lines',
  'audit_logs'
];

// Get table structure
async function getTableStructure(pool, tableName) {
  const query = `
    SELECT 
      column_name,
      data_type,
      character_maximum_length,
      numeric_precision,
      numeric_scale,
      is_nullable,
      column_default
    FROM information_schema.columns
    WHERE table_schema = 'public' 
      AND table_name = $1
    ORDER BY ordinal_position;
  `;

  const result = await pool.query(query, [tableName]);
  return result.rows;
}

// Get indexes
async function getTableIndexes(pool, tableName) {
  const query = `
    SELECT 
      indexname,
      indexdef
    FROM pg_indexes
    WHERE schemaname = 'public' 
      AND tablename = $1
    ORDER BY indexname;
  `;

  const result = await pool.query(query, [tableName]);
  return result.rows;
}

// Get foreign keys
async function getTableForeignKeys(pool, tableName) {
  const query = `
    SELECT
      tc.constraint_name,
      tc.constraint_type,
      kcu.column_name,
      ccu.table_name AS foreign_table_name,
      ccu.column_name AS foreign_column_name
    FROM information_schema.table_constraints AS tc
    JOIN information_schema.key_column_usage AS kcu
      ON tc.constraint_name = kcu.constraint_name
      AND tc.table_schema = kcu.table_schema
    JOIN information_schema.constraint_column_usage AS ccu
      ON ccu.constraint_name = tc.constraint_name
      AND ccu.table_schema = tc.table_schema
    WHERE tc.constraint_type = 'FOREIGN KEY' 
      AND tc.table_name = $1;
  `;

  const result = await pool.query(query, [tableName]);
  return result.rows;
}

// Compare table structures
function compareStructures(table1, table2) {
  const differences = [];

  // Compare columns
  const cols1 = new Map(table1.columns.map(c => [c.column_name, c]));
  const cols2 = new Map(table2.columns.map(c => [c.column_name, c]));

  // Check for missing columns
  for (const [colName, col] of cols1) {
    if (!cols2.has(colName)) {
      differences.push({
        type: 'missing_column',
        column: colName,
        environment: table2.environment,
        details: col
      });
    } else {
      // Compare column properties
      const col2 = cols2.get(colName);
      if (col.data_type !== col2.data_type) {
        differences.push({
          type: 'different_type',
          column: colName,
          env1: { name: table1.environment, type: col.data_type },
          env2: { name: table2.environment, type: col2.data_type }
        });
      }
    }
  }

  // Check for extra columns
  for (const [colName, col] of cols2) {
    if (!cols1.has(colName)) {
      differences.push({
        type: 'extra_column',
        column: colName,
        environment: table2.environment,
        details: col
      });
    }
  }

  return differences;
}

// Check all tables
async function checkAllTables() {
  const report = {
    timestamp: new Date().toISOString(),
    environments: [],
    tables: [],
    summary: {
      tablesChecked: 0,
      tablesWithDifferences: 0,
      totalDifferences: 0
    }
  };

  // Connect to databases
  const pools = {};
  for (const [envKey, config] of Object.entries(environments)) {
    try {
      pools[envKey] = new Pool(config);
      await pools[envKey].query('SELECT 1'); // Test connection
      report.environments.push({
        key: envKey,
        name: config.name,
        status: 'connected'
      });
      console.log(`✅ Connected to ${config.name}`);
    } catch (error) {
      report.environments.push({
        key: envKey,
        name: config.name,
        status: 'failed',
        error: error.message
      });
      console.error(`❌ Failed to connect to ${config.name}:`, error.message);
    }
  }

  // Check each table
  for (const tableName of coreTables) {
    console.log(`\nChecking table: ${tableName}`);
    const tableReport = {
      name: tableName,
      environments: {},
      differences: []
    };

    // Get structure from each environment
    for (const [envKey, pool] of Object.entries(pools)) {
      try {
        const structure = await getTableStructure(pool, tableName);
        const indexes = await getTableIndexes(pool, tableName);
        const foreignKeys = await getTableForeignKeys(pool, tableName);

        tableReport.environments[envKey] = {
          exists: structure.length > 0,
          columns: structure,
          columnCount: structure.length,
          indexes: indexes,
          foreignKeys: foreignKeys
        };
      } catch (error) {
        tableReport.environments[envKey] = {
          exists: false,
          error: error.message
        };
      }
    }

    // Compare environments
    const envKeys = Object.keys(tableReport.environments);
    if (envKeys.length >= 2) {
      for (let i = 0; i < envKeys.length - 1; i++) {
        for (let j = i + 1; j < envKeys.length; j++) {
          const env1 = envKeys[i];
          const env2 = envKeys[j];
          
          if (tableReport.environments[env1].exists && tableReport.environments[env2].exists) {
            const diffs = compareStructures(
              {
                environment: env1,
                columns: tableReport.environments[env1].columns
              },
              {
                environment: env2,
                columns: tableReport.environments[env2].columns
              }
            );
            
            if (diffs.length > 0) {
              tableReport.differences.push({
                between: [env1, env2],
                issues: diffs
              });
              report.summary.totalDifferences += diffs.length;
            }
          }
        }
      }
    }

    if (tableReport.differences.length > 0) {
      report.summary.tablesWithDifferences++;
    }
    
    report.summary.tablesChecked++;
    report.tables.push(tableReport);
  }

  // Close connections
  for (const pool of Object.values(pools)) {
    await pool.end();
  }

  return report;
}

// Generate migration scripts
async function generateMigrationScripts(report) {
  const migrations = [];

  for (const table of report.tables) {
    if (table.differences.length > 0) {
      const migration = {
        table: table.name,
        scripts: []
      };

      for (const diff of table.differences) {
        for (const issue of diff.issues) {
          if (issue.type === 'missing_column') {
            migration.scripts.push({
              environment: issue.environment,
              sql: `ALTER TABLE ${table.name} ADD COLUMN ${issue.column} ${issue.details.data_type};`
            });
          } else if (issue.type === 'different_type') {
            migration.scripts.push({
              environment: issue.env2.name,
              sql: `ALTER TABLE ${table.name} ALTER COLUMN ${issue.column} TYPE ${issue.env1.type};`
            });
          }
        }
      }

      if (migration.scripts.length > 0) {
        migrations.push(migration);
      }
    }
  }

  return migrations;
}

// Main execution
async function main() {
  console.log('🔍 Database Consistency Checker');
  console.log('=' .repeat(60));
  console.log(`Time: ${new Date().toLocaleString()}`);
  console.log('Checking database structures across environments...\n');

  try {
    const report = await checkAllTables();
    
    // Save report
    await fs.writeFile(
      'tests/db-consistency-report.json',
      JSON.stringify(report, null, 2)
    );

    // Generate migration scripts if needed
    if (report.summary.totalDifferences > 0) {
      const migrations = await generateMigrationScripts(report);
      await fs.writeFile(
        'tests/db-migration-scripts.json',
        JSON.stringify(migrations, null, 2)
      );
    }

    // Print summary
    console.log('\n' + '=' .repeat(60));
    console.log('📊 Database Consistency Summary');
    console.log('=' .repeat(60));
    console.log(`Tables checked: ${report.summary.tablesChecked}`);
    console.log(`Tables with differences: ${report.summary.tablesWithDifferences}`);
    console.log(`Total differences found: ${report.summary.totalDifferences}`);
    
    if (report.summary.totalDifferences > 0) {
      console.log('\n⚠️  Differences found! Check tests/db-consistency-report.json');
      console.log('📝 Migration scripts generated in tests/db-migration-scripts.json');
    } else {
      console.log('\n✅ All database structures are consistent!');
    }

    // Return status for CI/CD
    process.exit(report.summary.totalDifferences > 0 ? 1 : 0);
    
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

module.exports = { checkAllTables, generateMigrationScripts };