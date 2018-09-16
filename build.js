const fs = require('fs')
const path = require('path')
const UglifyJS = require('uglify-es')

const ROOT = process.cwd()

const PATH = {
  ROOT,
  DIRECTIVES: path.resolve(ROOT, 'src/directives'),
  CORE: path.resolve(ROOT, 'src/Slim.js'),
  DEF: path.resolve(ROOT, 'src/Slim.d.ts'),
  DEF_DIST: path.resolve(ROOT, 'Slim.d.ts'),
  DECORATORS: path.resolve(ROOT, 'src/Decorators.js'),
  DECORATORS_DIST: path.resolve(ROOT, 'Decorators.js'),
  DECORATORS_DEF: path.resolve(ROOT, 'src/Decorators.d.ts'),
  DECORATORS_DEF_DIST: path.resolve(ROOT, 'Decorators.d.ts'),
  DIRECTIVES_DIST: path.resolve(ROOT, 'directives')
}

if (!fs.existsSync(PATH.DIRECTIVES_DIST)) {
  fs.mkdirSync(PATH.DIRECTIVES_DIST)
}

function findAllJavascriptFiles(folder) {
  return fs
    .readdirSync(folder)
    .filter(filename => path.extname(filename) === '.js')
}

function uglifyFile (path) {
  const content = fs.readFileSync(path, 'utf8').toString()
  return UglifyJS.minify(content).code
}

function copyFile (path, target) {
  fs.createReadStream(path)
    .pipe(fs.createWriteStream(target))
}


// minify directives
const directives = findAllJavascriptFiles(PATH.DIRECTIVES)
directives.forEach(filename => {
  const result = uglifyFile(path.resolve(PATH.DIRECTIVES, filename))
  fs.writeFileSync(path.resolve(PATH.DIRECTIVES_DIST, filename), result)
})


// minify core
fs.writeFileSync(
  path.resolve(PATH.ROOT, 'Slim.js'),
  uglifyFile(PATH.CORE))

// minify decorators
fs.writeFileSync(
  path.resolve(PATH.DECORATORS_DIST),
  uglifyFile(PATH.DECORATORS)
)

// copy typings/definition files
copyFile(PATH.DEF, PATH.DEF_DIST)
copyFile(PATH.DECORATORS_DEF, PATH.DECORATORS_DEF_DIST)