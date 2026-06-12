/*
 * Author       : OBKoro1
 * CreateDate   : 2020-09-07 15:47:23
 * LastEditors  : OBKoro1
 * LastEditTime : 2022-02-26 23:52:18
 * File         : \koro1FileHeader\src\function-params\index.js
 * Description  :
 */

const vscode = require('vscode')
const util = require('../utile/util')
const handleError = require('../logic/handleError')

class FunctionParams {
  /**
   * description:
   * param {Object} option
   * option.data 函数注释模板
   * option.fileEnd 文件后缀
   * option.lineProperty 解析行的属性 包括text等
   * option.languageId 文件的语言类型
   * return {type}
   */
  constructor (option) {
    this.option = option
    this.match = false
    this.paramsData = this.option.data
    // 支持函数注释的语言
    const supportLanguage = {
      javascript: 'function-js.js',
      javascriptreact: 'function-js.js', // react jsx
      vue: 'function-js.js', // vue
      html: 'function-js.js', // html
      typescript: 'function-ts.js', // ts
      typescriptreact: 'function-ts.js', // react tsx
      java: 'function-java.js', // java
      python: 'function-python.js', // py
      rust: 'function-rust.js', // rust
      go: 'function-go.js', // go
      c: 'function-c.js',
      cpp: 'function-c.js',
      php: 'function-php.js',
      solidity: 'function-solidity.js' // 智能合约的语言
    }
    // 获取自定义语言设置的函数注释参数提取的语言
    let myLanguage = null
    // 是否声明了自定义语言
    if (option.fileEnd.userLanguage) {
      // 自定义语言是否存在functionParams
      const languageObj = option.config.configObj.language[option.fileEnd.fileEnd]
      if (languageObj) {
        myLanguage = supportLanguage[languageObj.functionParams]
      }
    }
    const typeSupport = supportLanguage[option.languageId]
    // 先使用自定义语言
    if (myLanguage) {
      this.require(myLanguage)
    } else if (typeSupport) {
      // 使用插件检测的语言
      this.require(typeSupport)
    }
  }

  // 引用语言文件 匹配函数 匹配参数
  require (languageType) {
    try {
      const languageGetParams = require(`./${languageType}`)
      languageGetParams.init(this.option.lineProperty)
      
      // 设置 match 为 true（即使没有参数也要处理函数名和返回类型）
      this.match = true
      
      // 自动填充函数名称
      if (languageGetParams.functionName) {
        this.fillFunctionName(languageGetParams.functionName)
      }
      
      // 自动填充返回类型到"返回参数"字段
      if (languageGetParams.returnType) {
        this.fillReturnType(languageGetParams.returnType)
      }
      
      // 如果匹配到参数，填充到"传入参数"字段
      if (languageGetParams.match && Array.isArray(languageGetParams.res) && languageGetParams.res.length > 0) {
        this.fillParams(languageGetParams.res)
      }
    } catch (err) {
      handleError.showErrorMessage('fileHeader: FunctionParams', err)
    }
  }

  /**
   * @description 自动填充函数名称到用户自定义的字段
   * 使用中间变量 ${functionName} 实现通用性
   * 用户可以在任意字段中使用 ${functionName}，插件会自动替换为实际函数名
   * @param {string} functionName 提取到的函数名
   */
  fillFunctionName (functionName) {
    if (!this.paramsData) return

    // 遍历用户模板中的所有字段
    Object.keys(this.paramsData).forEach(key => {
      const value = this.paramsData[key]
      // 如果字段值包含 ${functionName} 占位符，则替换为实际函数名
      if (typeof value === 'string' && value.includes('${functionName}')) {
        this.paramsData[key] = value.replace(/\$\{functionName\}/g, functionName)
      }
      // 兼容旧方式：如果字段值就是 'functionName' 字符串（不含占位符），也进行替换
      else if (value === 'functionName') {
        this.paramsData[key] = functionName
      }
    })
  }
}

module.exports = FunctionParams
