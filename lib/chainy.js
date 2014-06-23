"use strict";
// Require the autoload and autinstall plugins, and freeze, and export
module.exports = require('chainy-core').subclass().require('autoload autoinstall').freeze()