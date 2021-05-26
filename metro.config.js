const { getDefaultConfig } = require('@expo/metro-config');

const defaultConfig = getDefaultConfig('C:\\Users\\asus\\HEAL');

defaultConfig.resolver.assetExts.push('bin','json');

module.exports = defaultConfig;