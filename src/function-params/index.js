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
      
      // 填充参数到"传入参数"字段（始终调用，处理占位符替换）
      this.fillParams(languageGetParams.res)
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

  /**
   * @description 自动填充返回类型到用户自定义的字段
   * 支持 ${returnType} 占位符和"返回参数"字段名匹配
   * @param {string} returnType 提取到的返回类型
   */
  fillReturnType (returnType) {
    if (!this.paramsData) return

    // 如果返回类型是 void，则显示"无"
    let displayReturnType = returnType
    if (returnType === 'void') {
      displayReturnType = '无'
    }

    // 遍历用户模板中的所有字段
    Object.keys(this.paramsData).forEach(key => {
      const value = this.paramsData[key]
      // 如果字段值包含 ${returnType} 占位符，则替换为实际返回类型（void 时显示"无"）
      if (typeof value === 'string' && value.includes('${returnType}')) {
        this.paramsData[key] = value.replace(/\$\{returnType\}/g, displayReturnType)
      }
      // 如果字段名包含"返回"，则直接设置值为返回类型
      else if (key.includes('返回') && (value === '' || value === ' ' || value === undefined)) {
        this.paramsData[key] = displayReturnType
      }
    })
  }

  /**
   * @description 自动填充参数到用户自定义的字段
   * 支持 ${params} 占位符和"传入参数"字段名匹配
   * @param {array} paramsArr 提取到的参数数组
   */
  fillParams (paramsArr) {
    if (!this.paramsData) return

    // 格式化参数为字符串
    let paramsStr = ''
    if (paramsArr && paramsArr.length > 0) {
      paramsStr = paramsArr.map(item => {
        if (item.type && item.param) {
          return `${item.type} ${item.param}`
        } else if (item.param) {
          return item.param
        }
        return ''
      }).join(', ')
    }
    
    // 如果没有参数，设置为"无"
    if (!paramsStr) {
      paramsStr = '无'
    }

    // 遍历用户模板中的所有字段
    Object.keys(this.paramsData).forEach(key => {
      const value = this.paramsData[key]
      // 如果字段值包含 ${params} 占位符，则替换为实际参数（包括空参数时显示"无"）
      if (typeof value === 'string' && value.includes('${params}')) {
        this.paramsData[key] = value.replace(/\$\{params\}/g, paramsStr)
      }
      // 如果字段名包含"传入"或"参数"，则直接设置值为参数字符串
      else if ((key.includes('传入') || key.includes('参数')) && (value === '' || value === ' ' || value === undefined)) {
        this.paramsData[key] = paramsStr
      }
    })
  }
}

module.exports = FunctionParams
