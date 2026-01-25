import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

const rootDir = process.cwd();

function getOriginalName(numberedName) {
  // Matches "Name 2.ext" or "Name 10.ext"
  const match = numberedName.match(/(.+) (\d+)(\.[^.]+)$/);
  if (match) {
    return match[1] + match[3];
  }
  return null;
}

function cleanup() {
  console.log('Starting cleanup of numbered duplicates...');

  // Use find to get all numbered files, excluding .git and node_modules
  const findCmd = 'find . -type f -name "* [0-9]*.*" -not -path "*/.git/*" -not -path "*/node_modules/*"';
  const files = execSync(findCmd).toString().split('\n').filter(Boolean);

  const groups = {};

  for (const file of files) {
    const fullPath = path.resolve(rootDir, file);
    const fileName = path.basename(fullPath);
    const dirName = path.dirname(fullPath);
    const originalName = getOriginalName(fileName);

    if (originalName) {
      const originalPath = path.join(dirName, originalName);
      if (!groups[originalPath]) {
        groups[originalPath] = [];
      }
      groups[originalPath].push(fullPath);
    }
  }

  let deletedCount = 0;
  let renamedCount = 0;

  for (const [originalPath, numberedFiles] of Object.entries(groups)) {
    const originalExists = fs.existsSync(originalPath);

    // Sort numbered files by number descending (e.g., 5, 4, 3, 2)
    numberedFiles.sort((a, b) => {
      const numA = parseInt(a.match(/ (\d+)\.[^.]+$/)[1]);
      const numB = parseInt(b.match(/ (\d+)\.[^.]+$/)[1]);
      return numB - numA;
    });

    if (originalExists) {
      // Original exists, delete all numbered files
      for (const file of numberedFiles) {
        fs.unlinkSync(file);
        deletedCount++;
      }
    } else {
      // Original doesn't exist, rename the highest numbered one to original
      const highestVersion = numberedFiles[0];
      fs.renameSync(highestVersion, originalPath);
      renamedCount++;

      // Delete the rest
      for (let i = 1; i < numberedFiles.length; i++) {
        fs.unlinkSync(numberedFiles[i]);
        deletedCount++;
      }
    }
  }

  console.log(`Cleanup complete.`);
  console.log(`Deleted: ${deletedCount} files.`);
  console.log(`Renamed: ${renamedCount} files to their original names.`);
}

cleanup();
