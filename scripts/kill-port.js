import { execSync } from 'child_process';

function killPort(port) {
  try {
    console.log(`Searching for process on port ${port}...`);
    const output = execSync(`netstat -ano | findstr :${port}`).toString();
    const lines = output.split('\n');
    const pids = new Set();
    
    for (const line of lines) {
      const parts = line.trim().split(/\s+/);
      if (parts.length >= 5) {
        const pid = parts[parts.length - 1];
        if (pid && /^\d+$/.test(pid)) {
          pids.add(pid);
        }
      }
    }
    
    if (pids.size === 0) {
      console.log(`No processes found on port ${port}.`);
      return;
    }
    
    for (const pid of pids) {
      console.log(`Killing process with PID: ${pid}...`);
      try {
        execSync(`taskkill /F /PID ${pid}`);
        console.log(`Successfully killed process ${pid}.`);
      } catch (err) {
        console.error(`Failed to kill process ${pid}:`, err.message);
      }
    }
  } catch (err) {
    console.log(`No process detected listening on port ${port} or error occurred:`, err.message);
  }
}

killPort(5678);
