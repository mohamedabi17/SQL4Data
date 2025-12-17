const initSqlJs = require('sql.js');
const fs = require('fs');
const path = require('path');

// Parse tasks from TypeScript file using a simpler approach
function parseTasks(content) {
  const tasks = [];
  const lines = content.split('\n');

  let currentTask = null;
  let inReferenceSql = false;
  let sqlBuffer = '';

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();

    // Start of a task object
    if (trimmed.startsWith('id:')) {
      currentTask = { id: '', topic: '', database: '', referenceSql: '', tables: [] };
      const match = trimmed.match(/id:\s*["']([^"']+)["']/);
      if (match) currentTask.id = match[1];
    }

    if (currentTask) {
      // Parse topic
      if (trimmed.startsWith('topic:')) {
        const match = trimmed.match(/topic:\s*["']([^"']+)["']/);
        if (match) currentTask.topic = match[1];
      }

      // Parse database
      if (trimmed.startsWith('database:')) {
        const match = trimmed.match(/database:\s*["']([^"']+)["']/);
        if (match) currentTask.database = match[1];
      }

      // Parse referenceSql - can be single line or multi-line
      if (trimmed.startsWith('referenceSql:')) {
        // Check if it's a single line SQL
        const singleLineMatch = trimmed.match(/referenceSql:\s*["'](.+)["'],?\s*$/);
        if (singleLineMatch) {
          currentTask.referenceSql = singleLineMatch[1].replace(/\\'/g, "'");
        } else {
          // Start of multi-line SQL (SQL is on next line)
          inReferenceSql = true;
          sqlBuffer = '';
        }
      } else if (inReferenceSql) {
        // Check if this line has both start and end quotes (complete SQL on single indented line)
        const fullMatch = trimmed.match(/^["'](.+)["'],?\s*$/);
        if (fullMatch) {
          currentTask.referenceSql = fullMatch[1].replace(/\\'/g, "'");
          inReferenceSql = false;
          sqlBuffer = '';
        } else if (trimmed.endsWith('",') || trimmed.endsWith('"') || trimmed.endsWith("',") || trimmed.endsWith("'")) {
          // End of multi-line SQL
          sqlBuffer += trimmed.replace(/^["']/, '').replace(/["'],?\s*$/, '');
          currentTask.referenceSql = sqlBuffer.replace(/\\'/g, "'");
          inReferenceSql = false;
          sqlBuffer = '';
        } else {
          // Middle of multi-line SQL
          sqlBuffer += trimmed.replace(/^["']/, '');
        }
      }

      // Parse tables
      if (trimmed.startsWith('tables:')) {
        const match = trimmed.match(/tables:\s*\[([^\]]+)\]/);
        if (match) {
          currentTask.tables = match[1]
            .split(',')
            .map(t => t.trim().replace(/["']/g, ''))
            .filter(t => t);
        }
      }

      // End of task object - when we see closing brace followed by comma or at end
      if (trimmed === '},' || trimmed === '}') {
        if (currentTask.id && currentTask.database && currentTask.referenceSql) {
          tasks.push({ ...currentTask });
        }
        currentTask = null;
      }
    }
  }

  return tasks;
}

// Extract SQL from database files - handles multiple template literals
function extractSQL(content, dbName) {
  // First, find all const declarations with template literals
  const constPattern = /const\s+(\w+)\s*=\s*`([\s\S]*?)`\s*;/g;
  const constants = {};
  let match;

  while ((match = constPattern.exec(content)) !== null) {
    constants[match[1]] = match[2];
  }

  // Find the initSql template string
  const initSqlMatch = content.match(/initSql:\s*`([^`]*)`/);
  if (initSqlMatch) {
    let sql = initSqlMatch[1];
    // Replace ${varName} with actual values
    sql = sql.replace(/\$\{(\w+)\}/g, (_, varName) => constants[varName] || '');
    return sql;
  }

  return '';
}

async function main() {
  console.log('🔧 SQL Query Tester for sql-trainer\n');

  // Initialize SQL.js
  const SQL = await initSqlJs();

  // Read task file
  const tasksPath = path.join(__dirname, 'src/assets/tasks/tasks.ts');
  const tasksContent = fs.readFileSync(tasksPath, 'utf-8');
  const tasks = parseTasks(tasksContent);

  console.log(`📋 Found ${tasks.length} tasks to test\n`);

  // Group tasks by database
  const tasksByDb = {};
  for (const task of tasks) {
    if (!tasksByDb[task.database]) tasksByDb[task.database] = [];
    tasksByDb[task.database].push(task);
  }
  console.log('Tasks by database:');
  for (const [db, dbTasks] of Object.entries(tasksByDb)) {
    console.log(`  ${db}: ${dbTasks.length} tasks`);
  }
  console.log('');

  // Read database schema files
  const musicPath = path.join(__dirname, 'src/assets/databases/music.ts');
  const accountingPath = path.join(__dirname, 'src/assets/databases/accounting.ts');
  const ecommercePath = path.join(__dirname, 'src/assets/databases/ecommerce.ts');
  const datawarehousePath = path.join(__dirname, 'src/assets/databases/datawarehouse.ts');

  const musicContent = fs.readFileSync(musicPath, 'utf-8');
  const accountingContent = fs.readFileSync(accountingPath, 'utf-8');
  const ecommerceContent = fs.readFileSync(ecommercePath, 'utf-8');
  const datawarehouseContent = fs.readFileSync(datawarehousePath, 'utf-8');

  const musicSQL = extractSQL(musicContent, 'music');
  const accountingSQL = extractSQL(accountingContent, 'accounting');
  const ecommerceSQL = extractSQL(ecommerceContent, 'ecommerce');
  const datawarehouseSQL = extractSQL(datawarehouseContent, 'datawarehouse');

  // Create databases
  const databases = {};

  try {
    // Create music database
    const musicDb = new SQL.Database();
    musicDb.run(musicSQL);
    databases['music'] = musicDb;
    console.log('✅ Music database created');

    // Verify tables
    const musicTables = musicDb.exec("SELECT name FROM sqlite_master WHERE type='table'");
    if (musicTables.length > 0) {
      console.log('   Tables:', musicTables[0].values.map(r => r[0]).join(', '));
    }
  } catch (e) {
    console.error('❌ Failed to create music database:', e.message);
  }

  try {
    // Create accounting database (combines music + accounting)
    const accountingDb = new SQL.Database();
    accountingDb.run(musicSQL);
    accountingDb.run(accountingSQL);
    databases['accounting'] = accountingDb;
    console.log('✅ Accounting database created');

    // Verify tables
    const accTables = accountingDb.exec("SELECT name FROM sqlite_master WHERE type='table'");
    if (accTables.length > 0) {
      console.log('   Tables:', accTables[0].values.map(r => r[0]).join(', '));
    }
  } catch (e) {
    console.error('❌ Failed to create accounting database:', e.message);
  }

  try {
    // Create ecommerce database
    const ecommerceDb = new SQL.Database();
    ecommerceDb.run(ecommerceSQL);
    databases['ecommerce'] = ecommerceDb;
    console.log('✅ Ecommerce database created');

    // Verify tables
    const ecomTables = ecommerceDb.exec("SELECT name FROM sqlite_master WHERE type='table'");
    if (ecomTables.length > 0) {
      console.log('   Tables:', ecomTables[0].values.map(r => r[0]).join(', '));
    }
  } catch (e) {
    console.error('❌ Failed to create ecommerce database:', e.message);
  }

  try {
    // Create datawarehouse database
    const dwDb = new SQL.Database();
    dwDb.run(datawarehouseSQL);
    databases['datawarehouse'] = dwDb;
    console.log('✅ Datawarehouse database created');

    // Verify tables
    const dwTables = dwDb.exec("SELECT name FROM sqlite_master WHERE type='table'");
    if (dwTables.length > 0) {
      console.log('   Tables:', dwTables[0].values.map(r => r[0]).join(', '));
    }
  } catch (e) {
    console.error('❌ Failed to create datawarehouse database:', e.message);
  }

  console.log('\n' + '='.repeat(60) + '\n');

  // Test results
  const results = {
    passed: [],
    failed: [],
    skipped: []
  };

  // Run tests
  for (const task of tasks) {
    const db = databases[task.database];

    if (!db) {
      results.skipped.push({
        id: task.id,
        reason: `Database '${task.database}' not available`
      });
      continue;
    }

    try {
      const result = db.exec(task.referenceSql);
      results.passed.push({
        id: task.id,
        database: task.database,
        rowCount: result.length > 0 ? result[0].values.length : 0
      });
    } catch (e) {
      results.failed.push({
        id: task.id,
        database: task.database,
        sql: task.referenceSql,
        error: e.message
      });
    }
  }

  // Print results
  console.log('📊 TEST RESULTS\n');

  console.log(`✅ PASSED: ${results.passed.length}`);
  console.log(`❌ FAILED: ${results.failed.length}`);
  console.log(`⏭️  SKIPPED: ${results.skipped.length}`);

  if (results.passed.length > 0) {
    console.log('\n--- PASSED TESTS ---');
    for (const r of results.passed.slice(0, 20)) {
      console.log(`  ✅ ${r.id} (${r.database}) - ${r.rowCount} rows`);
    }
    if (results.passed.length > 20) {
      console.log(`  ... and ${results.passed.length - 20} more`);
    }
  }

  if (results.failed.length > 0) {
    console.log('\n--- FAILED TESTS ---');
    for (const r of results.failed) {
      console.log(`  ❌ ${r.id} (${r.database})`);
      console.log(`     SQL: ${r.sql.substring(0, 100)}${r.sql.length > 100 ? '...' : ''}`);
      console.log(`     Error: ${r.error}`);
    }
  }

  if (results.skipped.length > 0) {
    console.log('\n--- SKIPPED TESTS ---');
    const skippedByReason = {};
    for (const r of results.skipped) {
      if (!skippedByReason[r.reason]) skippedByReason[r.reason] = [];
      skippedByReason[r.reason].push(r.id);
    }
    for (const [reason, ids] of Object.entries(skippedByReason)) {
      console.log(`  ⏭️  ${reason}: ${ids.length} tasks`);
    }
  }

  // Cleanup
  for (const db of Object.values(databases)) {
    db.close();
  }

  console.log('\n' + '='.repeat(60));
  console.log(`\n📈 Summary: ${results.passed.length}/${tasks.length} tests passed`);

  // Return exit code
  process.exit(results.failed.length > 0 ? 1 : 0);
}

main().catch(console.error);
