/*
 * @Description: 入口
 * @Author: OBKoro1
 * @Date: 2018-10-31 14:18:17
 * @LastEditors  : OBKoro1
 * @LastEditTime : 2021-02-26 16:42:03
 */
const vscode = require('vscode')
const fs = require('fs')
const path = require('path')

// 写入日志到文件
function logToFile (message) {
  try {
    const logFile = path.join(__dirname, '..', '..', 'fileheader-debug.log')
    const timestamp = new Date().toISOString()
    fs.appendFileSync(logFile, `[${timestamp}] ${message}\n`)
  } catch (e) {}
}

logToFile('=== fileheader: main.js loaded ===')

try {
  const global = require('./utile/CONST')
  const createAnnotation = require('./models/createAnnotation')
  const ActiveHandle = require('./models/activeHandle')
  const Design = require('./design')
  const handleError = require('./logic/handleError')
  logToFile('=== fileheader: all modules loaded ===')
} catch (e) {
  logToFile(`=== fileheader: module load error: ${e.message} ===`)
  throw e
}

const global = require('./utile/CONST')
const createAnnotation = require('./models/createAnnotation')
const ActiveHandle = require('./models/activeHandle')
const Design = require('./design')
const handleError = require('./logic/handleError')

// 注册命令
function registerCommand (context) {
  logToFile('=== fileheader: registerCommand start ===')
  try {
    // 注册命令
    const fileHeader = vscode.commands.registerCommand(
      'extension.fileheader',
      () => {
        logToFile('=== fileheader: extension.fileheader command executed ===')
        const editor = vscode.editor || vscode.window.activeTextEditor
        createAnnotation.headerAnnotation(editor)
      }
    )
    const cursorTip = vscode.commands.registerCommand(
      'extension.cursorTip',
      () => {
        logToFile('=== fileheader: extension.cursorTip command executed ===')
        createAnnotation.functionAnnotation()
      }
    )
    const codeDesign = vscode.commands.registerCommand(
      'extension.codeDesign',
      () => {
        logToFile('=== fileheader: extension.codeDesign command executed ===')
        new Design().headDesignCreate()
      }
    )
    context.subscriptions.push(fileHeader)
    context.subscriptions.push(cursorTip)
    context.subscriptions.push(codeDesign)
    logToFile('=== fileheader: all commands registered ===')
  } catch (err) {
    logToFile(`=== fileheader: registerCommand error: ${err.message} ===`)
  }
}

// 扩展激活 默认运行
function activate (context) {
  logToFile('=== fileheader: activate start ===')
  try {
    global.context = context
    registerCommand(context)
    new Design().registerCommand()
    new ActiveHandle().watch()
    logToFile('=== fileheader: activate end ===')
  } catch (err) {
    logToFile(`=== fileheader: activate error: ${err.message} ===`)
    handleError.showErrorMessage('fileHeader: activate context', err)
  }
}

exports.activate = activate

// 扩展被禁用 调用
function deactivate () {}
exports.deactivate = deactivate
