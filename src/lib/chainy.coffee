{Task, TaskGroup} = require('taskgroup')
{extendOnClass} = require('extendonclass')

class Chainy
	# The data of this chain
	data: null

	# The TaskGroup runner for this chain
	runner: null

	# Parent chain if this is a fork
	parent: null

	# Buid our chain while passing some options to the taskgroup constructor for our runner
	constructor: (opts) ->
		@data = null
		@runner = TaskGroup.create(opts).run()
			.once('error', @defaultErrorHandler)
			.once('complete', @defaultErrorHandler)
		@

	# By default throw the error if present if no other completion callback has been set
	defaultErrorHandler: (err) ->
		console.log(err.stack or err)
		throw err  if err
		@

	# Apply a listener to the runner
	on: (args...) ->
		@runner.on.apply(@runner, args)
		@

	# Remove a listener from the runner
	off: (args...) ->
		@runner.removeListener.apply(@runner, args)
		@

	# Fire the passed callback once all tasks have fired on the chain
	# or when an error occurs that haults execution of the rest of the tasks
	# note: does not catch uncaught errors, for that, use .on('error', function(err){})
	# next(err, data)
	done: (callback) ->
		chain = @

		handler = (err) ->
			# ensure the done handler is ever only fired once and once only regardless of which event fires
			chain
				.off('error', handler)
				.off('complete', handler)

			# fire our user handler
			return callback.apply(chain, [err, chain.data])

		chain
			# remove the default handler
			.off('error', @defaultErrorHandler)
			.off('complete', @defaultErrorHandler)

			# add our custom handler
			.on('error', handler)
			.on('complete', handler)

		@

	# Helper to help javascript users extend this class
	@extend: extendOnClass

	# Helper to create a new chainy instance
	@create: (opts) -> new @(opts)

	# Create a child of this chain
	# NOTE: This not copy over any plugins loaded on the parent
	create: (opts) ->
		_ = Chainy.create(opts)
		_.parent = @
		return _

	# Clone the chain
	# Creates a child of this chain and deep clones the data into it
	clone: (opts={}) ->
		_ = @create(opts)
		_.data = JSON.parse JSON.stringify @data
		return _

	# Helper to get a plugin
	@getPlugin: (name) ->
		return (@prototype or @)[name]
	getPlugin: @getPlugin

	# Helper to add a plugin to this class
	@addPlugin: (name, method) ->
		(@prototype or @)[name] = (args...) ->
			context = @
			# ^ We use the context option to perform a delayed bind
			# Doing a straight bind `method = method.bind(@)` causes the context to get messed up
			# I have absolutely no idea why this occurs, it just is
			task = Task.create({name, args, method, context})
			@runner.addTask(task)
			@
		@
	addPlugin: @addPlugin

	# Require Plugins
	@require: (plugins) ->
		chain = @
		plugins = [plugins]  unless Array.isArray(plugins)
		plugins.forEach (pluginName) ->
			# Continue if the plugin is already attached
			return true  if chain.getPlugin(pluginName)? is true

			possiblePluginPath = __dirname+'/plugins/'+pluginName.toLowerCase()+'.js'

			if require('fs').existsSync(possiblePluginPath)
				plugin = require(possiblePluginPath)
			else
				plugin = require('chainy-'+pluginName)

			if plugin.addToChainy?
				plugin.addToChainy(chain)
			else
				chain.addPlugin(pluginName, plugin)
		@
	require: @require


module.exports = Chainy