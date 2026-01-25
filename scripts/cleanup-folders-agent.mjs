import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

const rootDir = process.cwd();

function cleanupFolders() {
  console.log('Starting cleanup of numbered duplicate folders...');

  // Target folders ending in " 2" through " 9"
  const findCmd = 'find . -type d -name "* [2-9]" -not -path "*/.git/*" -not -path "*/node_modules/*"';
  let dirs;
  try {
    dirs = execSync(findCmd).toString().split('\n').filter(Boolean);
  } catch (e) {
    console.log('No numbered folders found.');
    return;
  }

  // Sort by depth descending (deepest first) to avoid moving a folder before its children
  dirs.sort((a, b) => b.split('/').length - a.split('/').length);

  let deletedCount = 0;
  let renamedCount = 0;

  for (const dir of dirs) {
    const fullPath = path.resolve(rootDir, dir);
    if (!fs.existsSync(fullPath)) continue;

    const dirName = path.basename(fullPath);
    const parentDir = path.dirname(fullPath);
    
    const match = dirName.match(/(.+) ([2-9])$/);
    if (!match) continue;

    const originalName = match[1];
    const originalPath = path.join(parentDir, originalName);

    if (fs.existsSync(originalPath)) {
      // Original exists, delete the duplicate
      console.log(`Deleting duplicate folder: ${dir}`);
      fs.rmSync(fullPath, { recursive: true, force: true });
      deletedCount++;
    } else {
      // Original missing, rename this one
      console.log(`Renaming folder to original: ${dir} -> ${originalName}`);
      fs.renameSync(fullPath, originalPath);
      renamedCount++;
    }
  }

  console.log(`Cleanup complete.`);
  console.log(`Deleted: ${deletedCount} folders.`);
  console.log(`Renamed: ${renamedCount} folders.`);
}

cleanupFolders();
