var Chainy = require('chainy-core').subclass()

// Package path
var packagePath = process.cwd()+'/package.json';

// Overwrite the default way to require a package
Chainy.requirePluginPackage = Chainy.prototype.requirePluginPackage = function(pluginPackageName){
	var plugin = null
	var pluginName = pluginPackageName.replace('chainy-plugin-', '')
	var spawnSync = null
	var fail = true
	var spawnResult = null

	// Require our plugin package
	try {
		plugin = require(pluginPackageName)
		fail = false
	}
	catch (err) {
		if ( process.browser !== true &&
			(spawnSync = require('child_process').spawnSync) &&
			(require('fs').existsSync(packagePath) === true)
		) {
			console.log('Attempting to automatically install the missing plugin: '+pluginName)
			spawnResult = spawnSync('npm', ['install', '--save', pluginPackageName], {cwd: process.cwd()});
			if ( !spawnResult.error ) {
				// Attempt install again
				try {
					plugin = require(process.cwd()+'/node_modules/'+pluginPackageName)
					console.log('Automatic install successful')
					fail = false
				} catch (err) {}
			}
		}
	}

	if ( !plugin || fail === true ) {
		throw new Error(
			'Failed to require the plugin: '+pluginName+'\n'+
			'You may need to install it manually: npm install --save '+pluginPackageName
		)
	}

	// Return the required package
	return plugin
}

// Require the autoload plugin, and freeze, and export
module.exports = Chainy.require('autoload').freeze()