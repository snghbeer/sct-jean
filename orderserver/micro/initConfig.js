// dynamicConfig.js
const fs = require('fs');

let config = {};

function loadConfig() {
  try {
    const configFile = fs.readFileSync('/shared/config.txt', 'utf8');
    const parsedConfig = parseConfig(configFile);
    if (Object.keys(parsedConfig).length > 0) {
      config = parsedConfig;
      return config;
    } else {
      console.error('Configuration file is empty');
      return null;
    }
  } catch (error) {
    console.error('Error loading configuration:', error);
    return null;
  }
}

function parseConfig(configString) {
  const lines = configString.split('\n');
  return lines.reduce((acc, line) => {
    if (line.includes('=')) {
      const [key, value] = line.split('=');
      acc[key.trim()] = value.trim();
    }
    return acc;
  }, {});
}


module.exports = {
  loadConfig,
  getConfig: () => config,
};
