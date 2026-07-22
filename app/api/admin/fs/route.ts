import { NextResponse } from 'next/server';
import { requireAdminAPI } from '@/lib/adminAuth';
import fs from 'fs';
import path from 'path';

const DATA_DIR = path.join(process.cwd(), 'data');

// Map of root shortcuts to actual directories
const ROOT_DIRS: Record<string, string> = {
  'subjects': path.join(DATA_DIR, 'subjects'),
  'study-material': path.join(DATA_DIR, 'study-material'),
  'vocab': path.join(DATA_DIR, 'vocab'),
  'vocab-trickfunda': path.join(DATA_DIR, 'vocab-trickfunda'),
  'root': DATA_DIR,
};

function getSafePath(requestPath: string, rootKey?: string) {
  const baseDir = rootKey && ROOT_DIRS[rootKey] ? ROOT_DIRS[rootKey] : DATA_DIR;
  const normalized = path.normalize((requestPath || '').replace(/^\/+/, '') || '.');
  const fullPath = normalized === '.' ? baseDir : path.join(baseDir, normalized);

  if (!fullPath.startsWith(DATA_DIR)) {
    throw new Error('Invalid path: Directory traversal not allowed');
  }
  return fullPath;
}

function getFileType(name: string): string {
  const ext = path.extname(name).toLowerCase();
  const map: Record<string, string> = {
    '.json': 'json', '.md': 'markdown', '.txt': 'text',
    '.pdf': 'pdf', '.jpg': 'image', '.jpeg': 'image',
    '.png': 'image', '.gif': 'image', '.webp': 'image',
    '.svg': 'image', '.mp4': 'video', '.webm': 'video',
    '.html': 'html', '.css': 'css', '.js': 'javascript',
  };
  return map[ext] || 'file';
}

function getDirectoryStats(dirPath: string): { files: number; folders: number; totalSize: number } {
  let files = 0, folders = 0, totalSize = 0;
  try {
    const entries = fs.readdirSync(dirPath, { withFileTypes: true });
    for (const entry of entries) {
      if (entry.isDirectory()) {
        folders++;
        const sub = getDirectoryStats(path.join(dirPath, entry.name));
        files += sub.files;
        folders += sub.folders;
        totalSize += sub.totalSize;
      } else {
        files++;
        try {
          totalSize += fs.statSync(path.join(dirPath, entry.name)).size;
        } catch { }
      }
    }
  } catch { }
  return { files, folders, totalSize };
}

// Recursive search helper
function searchFiles(dir: string, query: string, results: any[], baseDir: string, maxResults = 50) {
  if (results.length >= maxResults) return;
  try {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
      if (results.length >= maxResults) break;
      const fullPath = path.join(dir, entry.name);
      const relativePath = path.relative(baseDir, fullPath).replace(/\\/g, '/');

      if (entry.name.toLowerCase().includes(query.toLowerCase())) {
        results.push({
          name: entry.name,
          isDirectory: entry.isDirectory(),
          path: relativePath,
          type: entry.isDirectory() ? 'folder' : getFileType(entry.name),
        });
      }

      if (entry.isDirectory()) {
        searchFiles(fullPath, query, results, baseDir, maxResults);
      }
    }
  } catch { }
}

export async function POST(req: Request) {
  try {
    await requireAdminAPI();

    const body = await req.json();
    const { action, targetPath, content, rootDir, query, newName } = body;

    if (!action) {
      return NextResponse.json({ error: 'Action is required' }, { status: 400 });
    }

    switch (action) {
      case 'readDir': {
        const safePath = getSafePath(targetPath || '', rootDir);
        if (!fs.existsSync(safePath)) {
          return NextResponse.json({ error: 'Directory not found' }, { status: 404 });
        }
        const entries = fs.readdirSync(safePath, { withFileTypes: true });
        const items = entries
          .filter(e => !e.name.startsWith('.'))
          .map(entry => {
            const entryPath = path.join(safePath, entry.name);
            const relativePath = path.relative(DATA_DIR, entryPath).replace(/\\/g, '/');
            let size = 0;
            let mtime = '';
            try {
              const stat = fs.statSync(entryPath);
              size = stat.size;
              mtime = stat.mtime.toISOString();
            } catch { }

            return {
              name: entry.name,
              isDirectory: entry.isDirectory(),
              path: relativePath,
              type: entry.isDirectory() ? 'folder' : getFileType(entry.name),
              size,
              mtime,
            };
          })
          .sort((a, b) => {
            if (a.isDirectory && !b.isDirectory) return -1;
            if (!a.isDirectory && b.isDirectory) return 1;
            return a.name.localeCompare(b.name);
          });

        return NextResponse.json({ items, currentPath: path.relative(DATA_DIR, safePath).replace(/\\/g, '/') });
      }

      case 'readFile': {
        if (!targetPath) return NextResponse.json({ error: 'targetPath required' }, { status: 400 });
        const safePath = getSafePath(targetPath, rootDir);
        if (!fs.existsSync(safePath)) {
          return NextResponse.json({ error: 'File not found' }, { status: 404 });
        }
        const fileContent = fs.readFileSync(safePath, 'utf-8');
        const stat = fs.statSync(safePath);
        return NextResponse.json({
          content: fileContent,
          size: stat.size,
          mtime: stat.mtime.toISOString(),
          type: getFileType(path.basename(safePath)),
        });
      }

      case 'writeFile': {
        if (!targetPath) return NextResponse.json({ error: 'targetPath required' }, { status: 400 });
        if (content === undefined) {
          return NextResponse.json({ error: 'Content required for writeFile' }, { status: 400 });
        }
        const safePath = getSafePath(targetPath, rootDir);
        fs.mkdirSync(path.dirname(safePath), { recursive: true });
        fs.writeFileSync(safePath, content, 'utf-8');
        return NextResponse.json({ success: true, message: 'File saved' });
      }

      case 'mkdir': {
        if (!targetPath) return NextResponse.json({ error: 'targetPath required' }, { status: 400 });
        const safePath = getSafePath(targetPath, rootDir);
        fs.mkdirSync(safePath, { recursive: true });
        return NextResponse.json({ success: true, message: 'Directory created' });
      }

      case 'delete': {
        if (!targetPath) return NextResponse.json({ error: 'targetPath required' }, { status: 400 });
        const safePath = getSafePath(targetPath, rootDir);
        if (!fs.existsSync(safePath)) {
          return NextResponse.json({ error: 'Path not found' }, { status: 404 });
        }
        const stat = fs.statSync(safePath);
        if (stat.isDirectory()) {
          fs.rmSync(safePath, { recursive: true, force: true });
        } else {
          fs.unlinkSync(safePath);
        }
        return NextResponse.json({ success: true, message: 'Deleted' });
      }

      case 'rename': {
        if (!targetPath || !newName) {
          return NextResponse.json({ error: 'targetPath and newName required' }, { status: 400 });
        }
        const safePath = getSafePath(targetPath, rootDir);
        if (!fs.existsSync(safePath)) {
          return NextResponse.json({ error: 'Path not found' }, { status: 404 });
        }
        const newPath = path.join(path.dirname(safePath), newName);
        if (!newPath.startsWith(DATA_DIR)) {
          return NextResponse.json({ error: 'Invalid new name' }, { status: 400 });
        }
        fs.renameSync(safePath, newPath);
        return NextResponse.json({ success: true, message: 'Renamed' });
      }

      case 'search': {
        if (!query) return NextResponse.json({ error: 'query required' }, { status: 400 });
        const baseDir = rootDir && ROOT_DIRS[rootDir] ? ROOT_DIRS[rootDir] : DATA_DIR;
        const results: any[] = [];
        searchFiles(baseDir, query, results, DATA_DIR);
        return NextResponse.json({ results });
      }

      case 'stats': {
        const safePath = getSafePath(targetPath || '', rootDir);
        if (!fs.existsSync(safePath)) {
          return NextResponse.json({ error: 'Path not found' }, { status: 404 });
        }
        const stats = getDirectoryStats(safePath);

        // Also get per-root stats
        const rootStats: Record<string, { files: number; folders: number; totalSize: number }> = {};
        for (const [key, dir] of Object.entries(ROOT_DIRS)) {
          if (key === 'root') continue;
          if (fs.existsSync(dir)) {
            rootStats[key] = getDirectoryStats(dir);
          }
        }

        return NextResponse.json({ stats, rootStats });
      }

      case 'createFromTemplate': {
        if (!targetPath) return NextResponse.json({ error: 'targetPath required' }, { status: 400 });
        const { template } = body;
        const safePath = getSafePath(targetPath, rootDir);

        const templates: Record<string, string> = {
          'content.json': JSON.stringify({ items: [] }, null, 2),
          'quiz.json': JSON.stringify({ questions: [] }, null, 2),
          'subtopic.json': JSON.stringify({
            title: 'New Subtopic',
            contentCount: 0,
            quizCount: 0,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          }, null, 2),
          'topic.json': JSON.stringify({
            title: 'New Topic',
            description: '',
            subTopics: [],
          }, null, 2),
          'subject.json': JSON.stringify({
            title: 'New Subject',
            description: '',
            emoji: '📚',
            brandColor: '#10b981',
            topics: [],
          }, null, 2),
          'notes.md': '# New Notes\n\nWrite your notes here...\n',
          'youtube.txt': '',
        };

        const templateContent = templates[template];
        if (!templateContent && templateContent !== '') {
          return NextResponse.json({ error: `Unknown template: ${template}` }, { status: 400 });
        }

        fs.mkdirSync(path.dirname(safePath), { recursive: true });
        fs.writeFileSync(safePath, templateContent, 'utf-8');
        return NextResponse.json({ success: true, message: `Created ${template}` });
      }

      case 'getRoots': {
        const roots = Object.entries(ROOT_DIRS)
          .filter(([key]) => key !== 'root')
          .map(([key, dir]) => ({
            key,
            exists: fs.existsSync(dir),
            stats: fs.existsSync(dir) ? getDirectoryStats(dir) : null,
          }));
        return NextResponse.json({ roots });
      }

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }
  } catch (error: any) {
    console.error('FS API Error:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
