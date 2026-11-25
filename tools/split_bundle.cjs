// Parse the outer module table rather than matching nested Browserify bundles.
const fs=require('fs'),path=require('path'),acorn=require('./js-parser/node_modules/acorn');
const [input,out]=process.argv.slice(2);const source=fs.readFileSync(input,'utf8');
const ast=acorn.parse(source,{ecmaVersion:2020});
const modules=ast.body[0].expression.right.arguments[0];
if(modules.type!=='ObjectExpression')throw Error('Unexpected module table');fs.mkdirSync(out,{recursive:true});
let count=0;for(const prop of modules.properties){const name=String(prop.key.name ?? prop.key.value);
 if(typeof name!=='string'||!/^[\w.$-]+$/.test(name)||name.startsWith('.'))throw Error('Unsafe module name');
 fs.writeFileSync(path.join(out,name+'.js'),source.slice(prop.start,prop.end)+',\n');count++;
}
console.log('Outer client modules:',count);
