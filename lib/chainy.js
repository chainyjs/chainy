(function(){
	// TaskGroup
	var taskgroup = require('taskgroup'), Task = taskgroup.Task, TaskGroup = taskgroup.TaskGroup

	// Buid our chain while passing some options to the taskgroup constructor for our runner
	var Chainy = module.exports = function(opts){
		this.data = null
		this.runner = TaskGroup.create(opts).run()
			.once('error', this.defaultErrorHandler)
			.once('complete', this.defaultErrorHandler)
	}

	// The data of this chain
	Chainy.prototype.data = null

	// The TaskGroup runner for this chain
	Chainy.prototype.runner = null

	// Parent chain if this is a fork
	Chainy.prototype.parent = null

	// By default throw the error if present if no other completion callback has been set
	Chainy.prototype.defaultErrorHandler = function(err){
		console.log(err.stack || err)
		if (err)  throw err
		return this
	}

	// Apply a listener to the runner
	Chainy.prototype.on = function(){
		var args = Array.prototype.slice.call(arguments)
		this.runner.on.apply(this.runner, args)
		return this
	}

	// Remove a listener from the runner
	Chainy.prototype.off = function(){
		var args = Array.prototype.slice.call(arguments)
		this.runner.removeListener.apply(this.runner, args)
		return this
	}

	// Fire the passed callback once all tasks have fired on the chain
	// or when an error occurs that haults execution of the rest of the tasks
	// note: does not catch uncaught errors, for that, use .on('error', function(err){})
	// next(err, data)
	Chainy.prototype.done = function(handler){
		var chain = this

		var wrappedHandler = function(err){
			// ensure the done handler is ever only fired once and once only regardless of which event fires
			chain
				.off('error', wrappedHandler)
				.off('complete', wrappedHandler)

			// fire our user handler
			return handler.apply(chain, [err, chain.data])
		}

		chain
			// remove the default handler
			.off('error', this.defaultErrorHandler)
			.off('complete', this.defaultErrorHandler)

			// add our wrapped handler
			.on('error', wrappedHandler)
			.on('complete', wrappedHandler)

		return this
	}

	// Helper to create a new chainy instance
	Chainy.create = function(opts){
		return new this(opts)
	}

	// Create a child of this chain
	// NOTE: This will not copy over any plugins loaded on the parent
	Chainy.prototype.create = function(opts){
		var _ = Chainy.create(opts)
		_.parent = this
		return _
	}

	// Clone the chain
	// Creates a child of this chain and deep clones the data into it
	Chainy.prototype.clone = function(opts){
		var _ = this.create(opts)
		_.data = JSON.parse(JSON.stringify(this.data))
		return _
	}

	// Helper to help javascript users create a subclass
	Chainy.subclass = Chainy.extend = require('extendonclass').extendOnClass

	// Helper to get an extension on our chain instance or prototype
	Chainy.getExtension = Chainy.prototype.getExtension = function(name){
		var where = (this.prototype || this)
		return where[name]
	}

	// Helper to add an extension to our chain instance or prototype
	Chainy.addExtension = Chainy.prototype.addExtension = function(name, value){
		var where = (this.prototype || this)
		where[name] = value
		return this
	}

	// Helper to add multiple extensions to our chain instance or prototype
	Chainy.addExtensions = Chainy.prototype.addExtensions = function(extensions){
		var key, value;
		for ( key in extensions ) {
			if ( extensions.hasOwnProperty(key) === false )  continue;
			value = extensions[key]
			this.addExtension(key, value)
		}
		return this
	}

	// Chainy.subclass().create().addExtensions().addPlugins().require()

	// Helper to add a plugin to the chain instance or prototype
	Chainy.addPlugin = Chainy.prototype.addPlugin = function(name, method){
		if ( method.extension !== true ) {
			var _method = method
			method = function(){
				var args = Array.prototype.slice.call(arguments)
				var task = Task.create({
					name: name,
					args: args,
					method: _method.bind(this)
				})
				this.runner.addTask(task)
				return this
			}
		}
		return this.addExtension(name, method)
	}

	// Helper to add multiple plugins to our chain instance or prototype
	Chainy.addPlugins = Chainy.prototype.addPlugins = function(plugins){
		var key, value;
		for ( key in plugins ) {
			if ( plugins.hasOwnProperty(key) === false )  continue;
			value = plugins[key]
			this.addPlugin(key, value)
		}
		return this
	}

	// Helper to require plugins into our chain instance or prototype
	Chainy.require = Chainy.prototype.require = function(){
		var chain = this
		var plugins = Array.prototype.slice.call(arguments)
		if ( Array.isArray(plugins[0]) ) {
			plugins = plugins.concat(plugins[0]).slice(1)
		}
		plugins.forEach(function(pluginName){
			var plugin = null;

			// Continue if the plugin is already attached
			if ( chain.getExtension(pluginName) != null )  return true

			// Fetch our local path for the plugin
			var possiblePluginPath = __dirname+'/plugins/'+pluginName.toLowerCase()+'.js'

			// Require the path if it exists
			if ( require('fs').existsSync(possiblePluginPath) === true ) {
				plugin = require(possiblePluginPath)
			}

			// Otherwise require the chainy plugin via node_modules
			else {
				plugin = require('chainy-'+pluginName)
			}

			// Does the plugin add itself?
			if ( plugin.setupPlugin != null ) {
				plugin.setupPlugin(chain)
			}
			else {
				chain.addPlugin(pluginName, plugin)
			}
		})
		return this
	}
})()
