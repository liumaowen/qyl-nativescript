# NativeScript 构建配置

这个 GitHub Actions 工作流用于自动构建 Vue 3 + NativeScript 应用。

## 🚀 工作流特性

### 触发方式
- **手动触发**：通过 GitHub Actions 界面选择构建类型 (debug/release)
- **自动触发**：推送到 `test` 或 `main` 分支时自动构建

### 构建类型
- **Debug构建**：快速开发版本，无需签名
- **Release构建**：生产版本，包含签名和混淆

## 📋 工作流步骤

### 1. 环境准备
- ✅ Ubuntu 20.04 运行环境
- ✅ Node.js 20.x
- ✅ Java JDK 17 (NativeScript 推荐版本)
- ✅ Android SDK API 34

### 2. 缓存优化
- ✅ Gradle 构建缓存
- ✅ npm 依赖缓存
- ✅ Android SDK 缓存

### 3. NativeScript 环境
- ✅ 安装 NativeScript CLI
- ✅ 验证 Android 开发环境
- ✅ 添加 Android 平台

### 4. 构建过程
- ✅ Debug 构建：`ns build android`
- ✅ Release 构建：`ns build android --release` (带签名)
- ✅ 自动重命名 APK 文件

### 5. 部署和通知
- ✅ 上传到 GitHub Artifacts
- ✅ SFTP 上传到服务器 (Release版本)
- ✅ 调用 API 更新版本信息
- ✅ 邮件通知构建结果

## 🔧 所需的 GitHub Secrets

### 代码签名 (Release 构建)
```
KEYSTORE_BASE64         # Keystore文件的Base64编码
SIGNING_KEY_STORE_PATH   # Keystore文件路径 (如: ./release.keystore)
KEY_ALIAS               # 密钥别名
KEY_PASSWORD            # 密钥密码
KEYSTORE_PASSWORD       # Keystore密码
```

### 服务器部署
```
SFTP_HOST               # SFTP服务器地址
SFTP_USER               # SFTP用户名
SFTP_KEY                # SFTP私钥
SFTP_PORT               # SFTP端口 (通常是22)
SFTP_TARGET_DIR         # 目标目录
```

### API和通知
```
API_URL                 # 版本更新API地址
QQ_EMAIL                # QQ邮箱地址
QQ_EMAIL_PASSWORD       # QQ邮箱授权码
```

## 📱 与原项目对比

| 特性 | 原项目 (Ionic) | NativeScript项目 |
|:---:|:---:|:---:|
| **构建工具** | Capacitor + Gradle | NativeScript CLI |
| **前端构建** | `npm run build` | 集成在 NativeScript 中 |
| **平台同步** | `npx cap sync android` | `ns platform add android` |
| **APK生成** | Gradle assembleRelease | `ns build android --release` |
| **性能** | WebView渲染 | 原生UI渲染 |

## 🎯 构建产物

### Debug 版本
- `qyl-nativescript-{version}-debug.apk`
- 快速构建，用于开发测试

### Release 版本
- `qyl-nativescript-{version}-release.apk`
- `qyl-nativescript-{version}-release.aab` (Google Play)
- 生产就绪，已签名和优化

## 📊 构建时间对比

| 构建类型 | 预估时间 | 说明 |
|:---:|:---:|:---:|
| **Debug** | 8-12分钟 | NativeScript编译 + Android构建 |
| **Release** | 12-18分钟 | 包含签名和优化 |

## 🔍 调试构建失败

### 常见问题
1. **NativeScript CLI版本不兼容**
2. **Android SDK配置问题**
3. **依赖包版本冲突**
4. **TypeScript编译错误**
5. **Vue 3语法问题**

### 查看日志
1. 点击失败的工作流
2. 展开 "构建 NativeScript APK" 步骤
3. 查看详细错误信息

## 🚀 使用方法

### 手动构建
1. 进入 GitHub 仓库
2. 点击 "Actions" 标签
3. 选择 "Build NativeScript Android APK"
4. 点击 "Run workflow"
5. 选择构建类型 (debug/release)
6. 点击 "Run workflow" 开始构建

### 自动构建
推送代码到 `test` 或 `main` 分支即可自动触发构建。

## 📧 通知系统

构建完成后会自动发送邮件通知：
- ✅ **成功通知**：包含下载链接和版本信息
- ❌ **失败通知**：包含错误分析和调试建议

---

> 🎉 现在你有了一个完整的 Vue 3 + NativeScript 自动化构建系统！