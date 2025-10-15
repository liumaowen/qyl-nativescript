import { NativeScriptConfig } from '@nativescript/core';

export default {
  id: 'com.qyl.shunle',
  appResourcesPath: 'App_Resources',
  android: {
    v8Flags: '--expose_gc',
    markingMode: 'none'
  },
  ios: {
    discardUncaughtJsExceptions: true
  },
  appPath: 'src',
  cli: {
    packageManager: 'npm'
  },
  hooks: [
    {
      type: 'after-prepareNativeApp',
      script: 'scripts/after-prepare.js'
    }
  ]
} as NativeScriptConfig;