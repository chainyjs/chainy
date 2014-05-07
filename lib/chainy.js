(function(){
	// TaskGroup
	var taskgroup = require('taskgroup'), Task = taskgroup.Task, TaskGroup = taskgroup.TaskGroup;

	// Buid our chain while passing some options to the taskgroup constructor for our runner
	var Chainy = module.exports = function(opts){
		this.data = null
		this.runner = TaskGroup.create(opts).run()
			.once('error', this.defaultErrorHandler)
			.once('complete', this.defaultErrorHandler)
	}

	// Helper to help javascript users extend this class
	Chainy.extend = require('extendonclass').extendOnClass

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
	Chainy.prototype.done = function(callback){
		var chain = this

		handler = function(err){
			// ensure the done handler is ever only fired once and once only regardless of which event fires
			chain
				.off('error', handler)
				.off('complete', handler)

			// fire our user handler
			return callback.apply(chain, [err, chain.data])
		}

		chain
			// remove the default handler
			.off('error', this.defaultErrorHandler)
			.off('complete', this.defaultErrorHandler)

			// add our custom handler
			.on('error', handler)
			.on('complete', handler)

		return this
	}

	// Helper to create a new chainy instance
	Chainy.create = function(opts){
		return new this(opts)
	}

	// Create a child of this chain
	// NOTE: This not copy over any plugins loaded on the parent
	Chainy.prototype.create = function(opts){
		var _ = Chainy.create(opts)
		_.parent = this
		return _
	}

	// Clone the chain
	// Creates a child of this chain and deep clones the data into it
	Chainy.prototype.clone = function(opts){
		_ = this.create(opts)
		_.data = JSON.parse(JSON.stringify(this.data))
		return _
	}

	// Helper to get a plugin
	Chainy.getPlugin = Chainy.prototype.getPlugin = function(name){
		return (this.prototype || this)[name]
	}

	// Helper to add a plugin to this class
	Chainy.addPlugin = Chainy.prototype.addPlugin = function(name, method){
		(this.prototype || this)[name] = function(){
			var args = Array.prototype.slice(arguments)
			var context = this
			// ^ We use the context option to perform a delayed bind
			// Doing a straight bind `method = method.bind(@)` causes the context to get messed up
			// I have absolutely no idea why this occurs, it just is
			var task = Task.create({
				name: name,
				args: args,
				method: method,
				context: context
			})
			this.runner.addTask(task)
			return this
		}
		return this
	}

	// Require Plugins
	Chainy.prototype.require = Chainy.require = function(plugins){
		var chain = this
		if ( Array.isArray(plugins) === false ) {
			plugins = [plugins]
		}
		plugins.forEach(function(pluginName){
			// Continue if the plugin is already attached
			if ( chain.getPlugin(pluginName) != null )  return true

			var possiblePluginPath = __dirname+'/plugins/'+pluginName.toLowerCase()+'.js'

			if ( require('fs').existsSync(possiblePluginPath) === true ) {
				plugin = require(possiblePluginPath)
			}
			else {
				plugin = require('chainy-'+pluginName)
			}

			if ( plugin.addToChainy != null ) {
				plugin.addToChainy(chain)
			}
			else {
				chain.addPlugin(pluginName, plugin)
			}
		})
		return this
	}
})()