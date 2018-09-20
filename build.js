const fs = require('fs')
const path = require('path')
const UglifyJS = require('uglify-es')
const readline = require('readline')

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

function stripImportExport (path) {
  const streamIn = fs.createReadStream(path)
  let streamOut = ''
  const rl = readline.createInterface(streamIn)
  return new Promise((resolve) => {
    rl.on('line', (line) => {
      if (!~line.indexOf('import')) {
        streamOut = streamOut + line.split('export').join(' ') + '\n'
      }
    })
    rl.on('close', () => {
      resolve(streamOut)
    })
  })
}

async function combineDirectivesNoModule () {
  const directives = findAllJavascriptFiles(PATH.DIRECTIVES)
  const result = directives.map(async filename => {
    return await uglifyFile(path.resolve(PATH.DIRECTIVES, filename), true)
  })
  const [...combined] = await Promise.all(result)
  const targetFile = path.resolve(PATH.DIRECTIVES_DIST, 'all.nomodule.js')
  const output = combined.filter(x => !!x).join('')
  await fs.writeFileSync(targetFile, output)
}

async function uglifyFile (path, removeExportStatements = false) {
  let content = fs.readFileSync(path, 'utf8').toString()
  if (removeExportStatements) {
    content = await stripImportExport(path)
  }
  content = UglifyJS.minify(content).code
  return content
}

function copyFile (path, target) {
  fs.createReadStream(path)
    .pipe(fs.createWriteStream(target))
}

async function build () {

  // minify core
  fs.writeFileSync(
    path.resolve(PATH.ROOT, 'Slim.js'),
    await uglifyFile(PATH.CORE))

  fs.writeFileSync(
    path.resolve(PATH.ROOT, 'Slim.nomodule.js'),
    await uglifyFile(PATH.CORE, true)
  )

  // minify decorators
  fs.writeFileSync(
    path.resolve(PATH.DECORATORS_DIST),
    await uglifyFile(PATH.DECORATORS)
  )

  // copy typings/definition files
  copyFile(PATH.DEF, PATH.DEF_DIST)
  copyFile(PATH.DECORATORS_DEF, PATH.DECORATORS_DEF_DIST)

  // minify directives
  const directives = findAllJavascriptFiles(PATH.DIRECTIVES)
  const promises = directives.map(async filename => {
    const filepath = path.resolve(PATH.DIRECTIVES, filename)
    const result = await uglifyFile(filepath)
    const resultNoModule = await uglifyFile(filepath, true)
    fs.writeFileSync(path.resolve(PATH.DIRECTIVES_DIST, filename), result)
    fs.writeFileSync(path.resolve(PATH.DIRECTIVES_DIST, filename.split('.js').join('.nomodule.js')), resultNoModule)
  })
  await Promise.all(promises)

  // combine directives-nomodule
  await combineDirectivesNoModule()
}



return build()