// Select the generated data overlay from the exact decoded shipped artifact.
const fs=require('fs'),acorn=require('./js-parser/node_modules/acorn');
const [input,output]=process.argv.slice(2),src=fs.readFileSync(input,'utf8'),ast=acorn.parse(src,{ecmaVersion:2020});
let matches=[];for(const statement of ast.body){const exp=statement.expression;if(exp?.type!=='CallExpression'||exp.callee.type!=='FunctionExpression')continue;const text=src.slice(statement.start,statement.end);if(text.includes('w.DB2PrivateData=')||text.includes('w.DB2PrivateData ='))matches.push(text);}
if(matches.length!==1)throw Error('Expected one shipped DB2PrivateData overlay');fs.writeFileSync(output,matches[0]);
