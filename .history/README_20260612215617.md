# korofileheader-fixed

## 简介

这是基于 [koroFileHeader](https://github.com/OBKoro1/koro1FileHeader) 插件修改的版本，主要针对 C/C++ 语言进行了增强。

### 修改内容

1. **C语言函数注释增强**
   - 支持自动提取函数名和返回类型
   - 无参函数（`void` 参数）不再生成参数注释
   - 返回类型为 `void` 时显示"无"

2. **头文件保护宏自动生成**
   - 自动为 `.h` 和 `.hpp` 文件添加条件编译保护
   - 支持自定义公共部分注释标记

3. **自定义字段支持**
   - 支持自定义字段名称（如"文件名称"、"传入参数"、"返回参数"等）
   - 支持占位符 `${functionName}`、`${returnType}`、`${params}`

4. **用户配置优化**
   - 移除了不必要的默认配置
   - 优化了配置项的可读性

## 主要功能

1. 自动生成文件头部注释，自动更新最后编辑人、最后编辑时间等。
2. 一键生成函数注释，支持函数参数自动提取并列到注释中。
3. 支持添加佛祖保佑永无bug、神兽护体、甩葱少女等好玩有趣的图像注释。
4. 配置非常灵活方便，各种细节都能配置，可以量身打造适合你的注释。
5. 支持所有主流语言。

## 安装

### 方法一：从 VSCode 应用市场安装

搜索 `korofileheader-fixed` 进行安装。

### 方法二：手动安装

下载 `.vsix` 文件后，在 VSCode 中使用 `Install from VSIX...` 命令安装。

## 配置示例

```json
{
  "fileheader.customMade": {
    "版    权": "XXXXX有限公司",
    "文件名称": "only file name",
    "作    者": "hway",
    "版    本": "V1.0.0",
    "注意事项": "",
    "修改日志": "",
    "custom_string_obkoro1_copyright": "---------1.日期-hway-文件初次创建"
  },
  "fileheader.cursorMode": {
    "函数名称": "",
    "函数功能": "",
    "传入参数": "${params}",
    "返回参数": "${returnType}",
    "关键说明": "",
    "变更日志": "1.日期-hway-文件初次创建"
  },
  "fileheader.configObj": {
    "headerGuard": {
      "h": true,
      "hpp": true
    },
    "headerSections": {
        "Public include": "/* Public includes ------------------------公共头文件---------------------------------------*/",
        "Public macro": "/* Public typedef -------------------------公共类型定义-------------------------------------*/",
        "Public typedef": "/* Public macro ---------------------------公共宏定义---------------------------------------*/",
        "Public variable": "/* Public variable ------------------------公共变量声明-------------------------------------*/",
        "Public functions": "/* Public functions -----------------------公共函数声明-------------------------------------*/",
    },
    "sourceSections": {
        "Private includes": "/* Private includes --------------------------私有头文件------------------------------------*/",
        "Private macro": "/* Private macro -----------------------------私有宏定义------------------------------------*/",
        "Private variables": "/* Private variables -------------------------私有变量--------------------------------------*/",
        "Private function prototypes": "/* Private function prototypes ---------------私有函数原型----------------------------------*/",
        "Private functions": "/* Private functions -------------------------私有函数定义----------------------------------*/"
    },
  }
}
```

## 使用说明

### 快捷键

- `Ctrl+Win+I` (Windows) / `Ctrl+Cmd+I` (Mac) - 添加文件头部注释
- `Ctrl+Win+T` (Windows) / `Ctrl+Cmd+T` (Mac) - 在光标处添加函数注释

### 函数注释占位符

- `${functionName}` - 自动替换为函数名
- `${returnType}` - 自动替换为返回类型
- `${params}` - 自动替换为参数列表（无参数时显示"无"）

## 许可证

[MIT](LICENSE)

## 原项目

本项目基于 [koroFileHeader](https://github.com/OBKoro1/koro1FileHeader) 修改，感谢原作者的辛勤工作。