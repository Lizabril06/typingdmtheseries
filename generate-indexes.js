#!/usr/bin/env node
/**
 * generate-indexes.js
 * Genera un _index.json en cada carpeta de datos para que
 * cms-bridge.js pueda descubrir qué archivos existen.
 *
 * Ejecutar: node generate-indexes.js
 * O agregar en netlify.toml como build command:
 *   command = "node generate-indexes.js"
 */

const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, '_data');
const SUBDIRS = ['actores', 'noticias', 'sponsors', 'podcast'];

SUBDIRS.forEach(sub => {
  const dir = path.join(DATA_DIR, sub);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
    console.log('Created dir:', dir);
  }

  const files = fs.readdirSync(dir)
    .filter(f => f.endsWith('.json') && f !== '_index.json');

  const indexPath = path.join(dir, '_index.json');
  const content = JSON.stringify({ files }, null, 2);
  fs.writeFileSync(indexPath, content, 'utf8');
  console.log(`✅ ${sub}/_index.json → [${files.join(', ')}]`);
});

console.log('\n✅ Indexes generated!');
