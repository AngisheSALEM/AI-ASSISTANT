import sqlite3 from 'sqlite3';
import util from 'util';

const db = new sqlite3.Database('C:\\Users\\Salem\\.n8n\\database.sqlite');

function parseFlatted(rawText) {
  const array = JSON.parse(rawText);
  const map = new Map();
  
  function resolve(indexStr) {
    const index = parseInt(indexStr, 10);
    if (isNaN(index)) return indexStr;
    if (map.has(index)) return map.get(index);
    
    const val = array[index];
    if (val === null || val === undefined) return val;
    
    if (typeof val === 'object') {
      const res = Array.isArray(val) ? [] : {};
      map.set(index, res);
      
      for (const k of Object.keys(val)) {
        const resolvedVal = resolve(val[k]);
        res[k] = resolvedVal;
      }
      return res;
    } else if (typeof val === 'string') {
      const parsedNum = parseInt(val, 10);
      if (!isNaN(parsedNum) && parsedNum.toString() === val && parsedNum < array.length) {
        return resolve(val);
      }
      return val;
    }
    return val;
  }
  
  return resolve("0");
}

function inspectExecution(id) {
  db.get('SELECT data FROM execution_data WHERE executionId = ?', [id], (err, row) => {
    if (err) {
      console.error("Error fetching execution:", err);
      return;
    }
    if (!row) {
      console.log(`No execution found with ID ${id}`);
      return;
    }
    
    try {
      const resolved = parseFlatted(row.data);
      console.log(`\n=== SAFE INSPECTION OF EXECUTION ${id} ===`);
      
      // Let's print the error property if it exists
      if (resolved.resultData && resolved.resultData.error) {
        console.log("Execution Error Info:");
        console.log(util.inspect(resolved.resultData.error, { depth: 4, colors: true }));
      }
      
      if (resolved.resultData && resolved.resultData.runData) {
        if (resolved.resultData.runData["Execute Workflow Trigger"]) {
          console.log("Execute Workflow Trigger Output Data:");
          console.log(util.inspect(resolved.resultData.runData["Execute Workflow Trigger"][0].data, { depth: null, colors: true }));
        }
        console.log("\nNodes executed and their statuses:");
        for (const nodeName of Object.keys(resolved.resultData.runData)) {
          const nodeRuns = resolved.resultData.runData[nodeName];
          console.log(`- Node [${nodeName}]:`);
          nodeRuns.forEach((run, i) => {
            console.log(`  Run ${i}: status = ${run.executionStatus || 'unknown'}`);
            if (run.error) {
              console.log(`  Error: ${run.error.message || run.error}`);
              if (run.error.stack) {
                console.log(`  Stack: ${run.error.stack.split('\n').slice(0, 3).join('\n')}`);
              }
            }
          });
        }
      }
    } catch (e) {
      console.error("Error parsing execution data:", e);
    }
  });
}

inspectExecution(48);
inspectExecution(49);
inspectExecution(50);
db.close();
