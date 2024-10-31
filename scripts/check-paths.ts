import * as fs from 'fs';
import * as path from 'path';
import * as glob from 'glob';
import * as ts from 'typescript';

const checkPaths = () => {
  const files = glob.sync('app/**/*.{ts,tsx}', {
    ignore: ['**/node_modules/**', '**/dist/**']
  });

  let hasErrors = false;

  files.forEach(file => {
    const content = fs.readFileSync(file, 'utf8');
    const sourceFile = ts.createSourceFile(
      file,
      content,
      ts.ScriptTarget.Latest,
      true
    );

    function visit(node: ts.Node) {
      if (ts.isImportDeclaration(node)) {
        const importPath = (node.moduleSpecifier as ts.StringLiteral).text;
        if (importPath.startsWith('@/components/')) {
          const componentPath = importPath.replace('@/components/', '');
          const absolutePath = path.resolve('./app/components', componentPath);
          
          if (!fs.existsSync(absolutePath + '.ts') && !fs.existsSync(absolutePath + '.tsx')) {
            console.error(`❌ Invalid import path in ${file}:`);
            console.error(`   ${importPath}`);
            hasErrors = true;
          }
        }
      }
      ts.forEachChild(node, visit);
    }

    visit(sourceFile);
  });

  if (hasErrors) {
    process.exit(1);
  } else {
    console.log('✅ All import paths are valid');
  }
};

checkPaths(); 