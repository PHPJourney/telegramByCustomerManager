import { Capacitor } from '@capacitor/core'
import { App } from '@capacitor/app'
import { StatusBar, Style } from '@capacitor/status-bar'
import { SplashScreen } from '@capacitor/splash-screen'

/**
 * Capacitor 原生功能封装
 */
export class NativeService {
  /**
   * 检查是否在原生应用中运行
   */
  static isNative(): boolean {
    return Capacitor.isNativePlatform()
  }

  /**
   * 获取平台信息
   */
  static getPlatform(): 'ios' | 'android' | 'web' {
    return Capacitor.getPlatform() as 'ios' | 'android' | 'web'
  }

  /**
   * 初始化应用
   */
  static async initialize() {
    if (!this.isNative()) {
      console.log('Running in web mode')
      return
    }

    try {
      // 设置状态栏样式
      await StatusBar.setStyle({ 
        style: Style.Light 
      })
      
      await StatusBar.setBackgroundColor({ 
        color: '#0ea5e9' 
      })

      // 隐藏启动屏
      setTimeout(async () => {
        await SplashScreen.hide()
      }, 2000)

      // 监听返回按钮（Android）
      if (this.getPlatform() === 'android') {
        App.addListener('backButton', ({ canGoBack }: { canGoBack: boolean }) => {
          if (!canGoBack) {
            // 退出应用或显示确认对话框
            App.exitApp()
          } else {
            window.history.back()
          }
        })
      }

      // 监听应用状态变化
      App.addListener('appStateChange', ({ isActive }) => {
        console.log('App state changed:', isActive ? 'active' : 'inactive')
      })

      console.log('Native platform initialized successfully')
    } catch (error) {
      console.error('Failed to initialize native platform:', error)
    }
  }

  /**
   * 最小化应用
   */
  static async minimizeApp() {
    if (this.getPlatform() === 'android') {
      await App.minimizeApp()
    }
  }

  /**
   * 退出应用
   */
  static async exitApp() {
    if (this.getPlatform() === 'android') {
      await App.exitApp()
    }
  }

  /**
   * 打开系统设置
   */
  static async openSettings() {
    await App.openSettings()
  }

  /**
   * 获取应用信息
   */
  static async getAppInfo() {
    const info = await App.getInfo()
    return info
  }
}
