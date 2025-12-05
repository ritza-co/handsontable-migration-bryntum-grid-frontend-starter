const path = require('path');

module.exports = (config, env) => {
  const fs = require('fs');
  
  const handsontablePath = path.resolve('../node_modules/handsontable');
  
  // Only apply custom configuration if the parent directory has handsontable (monorepo setup)
  if (fs.existsSync(handsontablePath) && fs.lstatSync(handsontablePath).isSymbolicLink()) {
    config.resolve.alias = {
      ...config.resolve.alias,
      react: path.resolve('../node_modules/react'),
      'react-dom': path.resolve('../node_modules/react-dom'),
    };

    config.resolve.plugins = config.resolve.plugins.filter(
      plugin => plugin.constructor.name !== 'ModuleScopePlugin'
    );
  }

  return config;
};