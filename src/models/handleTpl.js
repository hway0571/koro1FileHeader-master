/*
 * Author       : OBKoro1
 * Date         : 2020-02-12 11:29:09
 * LastEditors  : OBKoro1
 * LastEditTime : 2022-02-26 17:27:46
 * FilePath     : /koro1FileHeader/src/models/handleTpl.js
 * Description  : 已经生成注释模板，处理模板
 * https://github.com/OBKoro1
 */

const util = require('../utile/util')

/**
 * @description: 处理生成的模板 比如添加信息，删除信息等。
 * @param {Object} beforehand 模板和预处理的参数
 * beforehand.tpl {string} tpl 模板changePrototypeNameFn
 * beforehand.beforeAnnotation {Boolean}  是否在模板之前添加内容
 * beforehand.afterAnnotation {Boolean}  是否在模板之后添加内容
 * beforehand.fileEnd 文件后缀
 * @return: {String} tpl
 * @Created_time: 2019-05-14 14:25:26
 */
const handleTplFn = (tpl, fsPath, config, fileEnd) => {
  const option = editLineFn(fsPath, config)
  let newTpl = util.replaceSymbolStr(tpl, fileEnd)
  if (option.beforeAnnotation) {
    newTpl = `${option.beforeAnnotation}\n${newTpl}`
  }
  if (option.afterAnnotation) {
    if (option.afterAnnotation === '\n') {
      newTpl = `${newTpl}${option.afterAnnotation}`
    } else {
      newTpl = `${newTpl}${option.afterAnnotation}\n`
    }
  }
  return {
    newTpl,
    lineNum: option.lineNum
  }
}

/**
 * @description: 获取要处理模板的配置
 * @param { String } 文件后缀
 * @param {Object} config 用户设置
 * @return: [生成注释的行数,注释之前添加的内容,注释之前添加的内容]
 */
function editLineFn (fsPath, config) {
  let fileEnd = util.fsPathFn(fsPath) // 文件后缀
  const isSpecial = util.specialLanguageFn(fsPath)
  // 特殊文件
  if (isSpecial) {
    fileEnd = isSpecial
  }

  // 切割文件路径 获取文件后缀
  let lineNum = getFileEndConfig(config, 'headInsertLine', fileEnd)
  if (lineNum) {
    // 要减一行
    lineNum = lineNum - 1
  } else {
    lineNum = 0 // 默认插入第一行
  }
  // 是否设置在注释之前添加内容
  const beforeAnnotation = getFileEndConfig(config, 'beforeAnnotation', fileEnd)
  // 注释之后添加内容
  let afterAnnotation = getFileEndConfig(config, 'afterAnnotation', fileEnd)

  // 对于 C/C++ 头文件，自动生成条件编译保护和公共部分注释标记
  // 检查配置中是否启用了头文件保护
  if ((fileEnd === 'h' || fileEnd === 'hpp') && config.configObj.headerGuard[fileEnd]) {
    const headerGuard = generateHeaderGuard(fsPath)
    const commonSections = generateCommonSections(config, 'headerSections')
    // 不要在 #ifndef 之前添加空行，直接跟在头部注释之后
    afterAnnotation = `${headerGuard}${commonSections}`
  }

  // 对于 C/C++ 源文件，添加私有部分注释标记
  if (fileEnd === 'c' || fileEnd === 'cpp') {
    const privateSections = generateCommonSections(config, 'sourceSections')
    if (privateSections) {
      if (afterAnnotation) {
        afterAnnotation = `${afterAnnotation}\n${privateSections}`
      } else {
        afterAnnotation = privateSections
      }
    }
  }

  return { lineNum, beforeAnnotation, afterAnnotation, fileEnd }
}

/**
 * @description: 生成 C/C++ 头文件的条件编译保护宏
 * @param {String} fsPath 文件路径
 * @return: {String} 条件编译保护宏
 */
function generateHeaderGuard (fsPath) {
  // 提取文件名（不含路径和扩展名）
  const pathArr = fsPath.replace(/\\/g, '/').split('/')
  const fileName = pathArr[pathArr.length - 1]
  const fileNameWithoutExt = fileName.replace(/\.(h|hpp)$/i, '')

  // 生成保护宏名称（转换为大写，替换特殊字符为下划线）
  const guardName = '_' + fileNameWithoutExt.toUpperCase().replace(/[^a-zA-Z0-9]/g, '_') + '_H_'

  // 不要在 #define 后面添加空行，只添加一个换行
  return `#ifndef ${guardName}\n#define ${guardName}\n`
}

/**
 * @description: 生成公共/私有部分注释标记
 * @param {Object} config 用户配置
 * @param {String} sectionType 配置类型: 'headerSections' 或 'sourceSections'
 * @return: {String} 注释标记
 */
function generateCommonSections (config, sectionType) {
  // 获取配置中的注释标记，如果没有配置则使用默认值
  const sections = config.configObj[sectionType]

  // 如果没有配置，头文件只返回 #endif（配合 headerGuard），源文件返回空字符串
  if (!sections) {
    if (sectionType === 'headerSections') {
      return '#endif'
    }
    return ''
  }

  // 直接使用配置中的值作为注释行内容
  const sectionKeys = Object.keys(sections)
  let sectionsStr = ''
  sectionKeys.forEach((key, index) => {
    if (index === 0) {
      // 第一行前面不要换行
      sectionsStr += `${sections[key]}\n`
    } else {
      // 后续行之间有空行
      sectionsStr += `\n${sections[key]}\n`
    }
  })

  // 对于头文件，在最后添加 #endif
  if (sectionType === 'headerSections') {
    sectionsStr += '\n#endif'
  }

  return sectionsStr
}

// 获取文件后缀的对应配置
function getFileEndConfig (config, configName, fileEnd) {
  if (config.configObj[configName][fileEnd]) {
    // 单独文件的配置
    return config.configObj[configName][fileEnd]
  } else if (config.configObj[configName]['*']) {
    // 通配符配置
    return config.configObj[configName]['*']
  }
  return undefined
}

module.exports = {
  handleTplFn
}
