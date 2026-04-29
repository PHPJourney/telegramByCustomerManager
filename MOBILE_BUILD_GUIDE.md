# 多端应用打包指南

本文档介绍如何将 Telegram 客服系统打包为 Android APK、iOS App 和桌面应用。

## 📱 架构说明

本项目使用 **Capacitor** 框架实现跨平台支持：

```
React Web App (已有)
    ↓ Capacitor
├── Android APK/AAB
├── iOS App (.ipa)
└── Desktop (Electron - 可选)
```

**优势**：
- ✅ 一套代码，多端运行
- ✅ 基于现有 Web 代码，无需重写
- ✅ 原生性能和功能访问
- ✅ 支持推送通知、相机等原生功能

---

## 🛠️ 环境准备

### 通用依赖

```bash
# 进入前端目录
cd client

# 安装 Capacitor 依赖
npm install
```

### Android 开发环境

#### 1. 安装 Android Studio
下载地址: https://developer.android.com/studio

#### 2. 配置 Android SDK
打开 Android Studio → Preferences → Appearance & Behavior → System Settings → Android SDK

需要安装：
- Android SDK Platform (API Level 33+)
- Android SDK Build-Tools
- Android SDK Command-line Tools
- Android Emulator

#### 3. 设置环境变量

```bash
# macOS/Linux (~/.zshrc 或 ~/.bashrc)
export ANDROID_HOME=$HOME/Library/Android/sdk
export PATH=$PATH:$ANDROID_HOME/emulator
export PATH=$PATH:$ANDROID_HOME/platform-tools

# Windows (系统环境变量)
ANDROID_HOME = C:\Users\YourName\AppData\Local\Android\Sdk
Path += %ANDROID_HOME%\emulator
Path += %ANDROID_HOME%\platform-tools
```

#### 4. 验证安装

```bash
adb --version
```

### iOS 开发环境（仅 macOS）

#### 1. 安装 Xcode
从 Mac App Store 下载 Xcode

#### 2. 安装命令行工具

```bash
xcode-select --install
```

#### 3. 安装 CocoaPods

```bash
sudo gem install cocoapods
```

#### 4. 验证安装

```bash
xcodebuild -version
pod --version
```

### 桌面应用环境（可选）

```bash
# 安装 Electron 适配器
npm install @capacitor-community/electron
```

---

## 📦 打包流程

### 第一步：构建 Web 应用

```bash
cd client

# 构建生产版本
npm run build
```

这会在 `client/dist` 目录生成静态文件。

### 第二步：初始化 Capacitor（首次）

```bash
# 初始化 Capacitor（仅首次）
npx cap init "Telegram客服系统" com.telegramcs.app

# 或使用配置文件（已创建 capacitor.config.json）
```

### 第三步：添加目标平台

#### 添加 Android

```bash
npx cap add android
```

#### 添加 iOS（macOS only）

```bash
npx cap add ios
```

#### 添加桌面（可选）

```bash
npx cap add @capacitor-community/electron
```

### 第四步：同步代码

每次修改 Web 代码后，需要同步到原生项目：

```bash
npx cap sync
```

这会：
1. 复制 Web 构建文件到原生项目
2. 更新原生插件
3. 同步配置文件

---

## 🤖 Android APK 打包

### 方法一：使用 Android Studio（推荐）

```bash
# 1. 打开 Android 项目
npx cap open android

# 2. 在 Android Studio 中：
#    - 等待 Gradle 同步完成
#    - 选择 Build → Generate Signed Bundle / APK
#    - 创建或选择 Keystore
#    - 选择 release 模式
#    - 点击 Build
```

### 方法二：命令行打包

```bash
cd client/android

# 清理之前的构建
./gradlew clean

# 构建 Release APK
./gradlew assembleRelease

# 或构建 AAB（Google Play 需要）
./gradlew bundleRelease

# APK 输出位置：
# app/build/outputs/apk/release/app-release.apk

# AAB 输出位置：
# app/build/outputs/bundle/release/app-release.aab
```

### 签名配置

编辑 `client/android/app/build.gradle`：

```gradle
android {
    signingConfigs {
        release {
            storeFile file("your-keystore.jks")
            storePassword "your-store-password"
            keyAlias "your-key-alias"
            keyPassword "your-key-password"
        }
    }
    
    buildTypes {
        release {
            signingConfig signingConfigs.release
            minifyEnabled true
            proguardFiles getDefaultProguardFile('proguard-android.txt'), 'proguard-rules.pro'
        }
    }
}
```

### 测试 APK

```bash
# 安装到连接的设备
adb install app/build/outputs/apk/release/app-release.apk

# 或在模拟器中测试
npx cap run android
```

---

## 🍎 iOS App 打包

### 方法一：使用 Xcode（推荐）

```bash
# 1. 打开 iOS 项目
npx cap open ios

# 2. 在 Xcode 中：
#    - 选择项目 Target
#    - Signing & Capabilities → 选择 Team
#    - Product → Archive
#    - Distribute App → App Store Connect / Ad Hoc
```

### 方法二：命令行打包

```bash
cd client/ios

# 安装 Pods
pod install

# 构建
xcodebuild -workspace App.xcworkspace \
  -scheme App \
  -configuration Release \
  -archivePath App.xcarchive \
  archive

# 导出 IPA
xcodebuild -exportArchive \
  -archivePath App.xcarchive \
  -exportPath ./export \
  -exportOptionsPlist ExportOptions.plist
```

### 配置签名

在 Xcode 中配置：
1. Project → Signing & Capabilities
2. 选择你的 Apple Developer Team
3. 确保 Bundle Identifier 正确

### 测试 iOS App

```bash
# 在模拟器中运行
npx cap run ios

# 或在真机上测试（需要开发者账号）
```

---

## 💻 桌面应用打包

### 使用 Electron

```bash
# 安装 Electron 适配器
npm install @capacitor-community/electron

# 添加 Electron 平台
npx cap add @capacitor-community/electron

# 同步代码
npx cap sync

# 打开 Electron 项目
npx cap open @capacitor-community/electron

# 构建桌面应用
cd electron
npm install
npm run electron:build
```

输出文件：
- Windows: `dist/*.exe`
- macOS: `dist/*.dmg`
- Linux: `dist/*.AppImage`

---

## 🔧 常用命令速查

```bash
# 构建 Web
npm run build

# 同步到所有平台
npx cap sync

# 打开特定平台 IDE
npx cap open android
npx cap open ios

# 在设备/模拟器上运行
npx cap run android
npx cap run ios

# 列出可用设备
npx cap ls

# 更新平台
npx cap update android
npx cap update ios

# 添加新平台
npx cap add android
npx cap add ios
```

---

## 📱 原生功能使用

### 推送通知

```typescript
import { PushNotifications } from '@capacitor/push-notifications'

// 注册推送
await PushNotifications.requestPermissions()
await PushNotifications.register()

// 监听通知
PushNotifications.addListener('pushNotificationReceived', (notification) => {
  console.log('Notification received:', notification)
})
```

### 相机

```typescript
import { Camera, CameraResultType } from '@capacitor/camera'

const image = await Camera.getPhoto({
  quality: 90,
  allowEditing: false,
  resultType: CameraResultType.Uri
})

console.log('Image URI:', image.webPath)
```

### 状态栏

```typescript
import { StatusBar, Style } from '@capacitor/status-bar'

await StatusBar.setStyle({ style: Style.Dark })
await StatusBar.setBackgroundColor({ color: '#0ea5e9' })
```

---

## 🚀 发布流程

### Android 发布到 Google Play

1. 构建 AAB 文件
2. 登录 [Google Play Console](https://play.google.com/console)
3. 创建应用
4. 上传 AAB 文件
5. 填写应用信息
6. 提交审核

### iOS 发布到 App Store

1. 在 Xcode 中 Archive
2. 上传到 App Store Connect
3. 登录 [App Store Connect](https://appstoreconnect.apple.com)
4. 填写应用信息
5. 提交审核

### 企业内部分发

**Android**:
- 直接分享 APK 文件
- 使用 Firebase App Distribution
- 搭建内部应用商店

**iOS**:
- 使用 TestFlight（需要开发者账号）
- 企业证书签名（Enterprise Program）
- Ad Hoc 分发（最多 100 台设备）

---

## ⚠️ 常见问题

### 1. Android 构建失败

**问题**: Gradle 同步失败

**解决**:
```bash
# 清理缓存
cd android
./gradlew clean
rm -rf .gradle
./gradlew build

# 检查 Java 版本
java -version  # 需要 JDK 11+
```

### 2. iOS 构建失败

**问题**: CocoaPods 错误

**解决**:
```bash
cd ios
pod deintegrate
pod install
```

### 3. 白屏问题

**原因**: Web 资源路径错误

**解决**: 检查 `capacitor.config.json` 中的 `webDir` 配置

### 4. 插件不工作

**解决**:
```bash
# 重新同步
npx cap sync

# 清理重建
npx cap clean
npx cap sync
```

### 5. 热重载不工作

Capacitor 不支持热重载，需要：
```bash
# 每次修改后
npm run build
npx cap sync
npx cap run android  # 或 ios
```

---

## 📊 性能优化

### Android 优化

```gradle
// android/app/build.gradle
android {
    buildTypes {
        release {
            minifyEnabled true          // 代码压缩
            shrinkResources true        // 资源压缩
            proguardFiles ...
        }
    }
}
```

### iOS 优化

- 启用 Bitcode
- 使用 App Thinning
- 优化图片资源

### Web 优化

- 代码分割
- 懒加载
- 图片压缩
- CDN 加速

---

## 🔐 安全建议

1. **不要硬编码密钥** - 使用环境变量
2. **启用 HTTPS** - 所有 API 请求
3. **代码混淆** - ProGuard/R8
4. **证书保护** - 妥善保管 Keystore
5. **权限最小化** - 只申请必要权限

---

## 📚 相关资源

- [Capacitor 官方文档](https://capacitorjs.com)
- [Android 开发者文档](https://developer.android.com)
- [iOS 开发者文档](https://developer.apple.com)
- [Electron 文档](https://www.electronjs.org)

---

## 🎯 快速开始示例

```bash
# 完整流程示例（Android）
cd client
npm install
npm run build
npx cap add android
npx cap sync
npx cap run android

# 完整流程示例（iOS）
cd client
npm install
npm run build
npx cap add ios
npx cap sync
npx cap run ios
```

---

**提示**: 首次构建可能需要较长时间，请耐心等待。后续增量构建会快很多。

祝您打包顺利！🚀
