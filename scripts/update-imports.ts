import * as fs from 'fs';
import * as path from 'path';
import * as glob from 'glob';

const updateImports = () => {
  // Find all TypeScript files
  const files = glob.sync('app/**/*.{ts,tsx}', {
    ignore: ['**/node_modules/**', '**/dist/**']
  });

  const importRegex = /from ['"](@\/components\/[^'"]+)['"]/g;
  let updatedFiles = 0;

  files.forEach(file => {
    const content = fs.readFileSync(file, 'utf8');
    let updated = content;

    // Update imports
    updated = content.replace(importRegex, (match, importPath) => {
      // Check if the import path exists
      const absolutePath = path.resolve('./app/components', importPath.replace('@/components/', ''));
      if (!fs.existsSync(absolutePath + '.ts') && !fs.existsSync(absolutePath + '.tsx')) {
        console.error(`❌ Invalid import path in ${file}: ${importPath}`);
        process.exit(1);
      }
      return match;
    });

    if (updated !== content) {
      fs.writeFileSync(file, updated);
      updatedFiles++;
      console.log(`✅ Updated imports in: ${file}`);
    }
  });

  console.log(`\n🎉 Updated ${updatedFiles} files`);
};

updateImports(); 