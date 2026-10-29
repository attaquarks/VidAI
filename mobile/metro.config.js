const fs = require('fs')
const path = require('path')
const { getDefaultConfig } = require('expo/metro-config')

const config = getDefaultConfig(__dirname)

// react-native-screens and react-native-safe-area-context physically live at
// C:\b\sac / C:\b\scr (Windows MAX_PATH workaround) with junctions back into
// node_modules. Metro must treat every resolved path as its realpath so the
// app and those packages share ONE copy of react — and must watch C:\b.
config.watchFolders = [__dirname, 'C:\\b']
config.resolver.resolveRequest = (context, moduleName, platform) => {
  try {
    const resolved = context.resolveRequest(context, moduleName, platform)
    if (resolved && resolved.type === 'sourceFile') {
      return { type: 'sourceFile', filePath: fs.realpathSync(resolved.filePath) }
    }
    return resolved
  } catch (e) {
    return context.resolveRequest(context, moduleName, platform)
  }
}

module.exports = config
