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
		@runner.once('error', @defaultErrorHandler)
		@runner.once('complete', @defaultErrorHandler)
		@

	# By default throw the error if present if no other completion callback has been set
	defaultErrorHandler: (err) ->
		console.log(err.stack or err)
		throw err  if err
		@

	# Clone the chain
	# Does a deep clone of the data into a new chain and returns it
	clone: (opts={}) ->
		_ = Chainy.create(opts)
		_.parent = @
		_.data = JSON.parse JSON.stringify @data
		return _

	# Apply a listener to the runner
	on: (args...) ->
		@runner.on.apply(@runner, args)
		@

	# Fire the passed callback once all tasks have fired on the chain
	# or when an error occurs that haults execution of the rest of the tasks
	# note: does not catch uncaught errors, for that, use .on('error', function(err){})
	# next(err, data)
	done: (callback) ->
		me = @

		handler = (err) ->
			# ensure the done handler is ever only fired once and once only regardless of which event fires
			me.runner
				.removeListener('error', handler)
				.removeListener('complete', handler)

			# fire our user handler
			return callback.apply(me, [err, me.data])

		@runner
			# remove the default handler
			.removeListener('error', @defaultErrorHandler)
			.removeListener('complete', @defaultErrorHandler)

			# add our custom handler
			.on('error', handler)
			.on('complete', handler)

		@

	# Helper to help javascript users extend this class
	@extend: extendOnClass

	# Helper to create a new chainy instance
	@create: (opts) -> new @(opts)

	# Helper to see if we have a plugin
	@hasPlugin: (name) ->
		return (@prototype or @)[name]?
	hasPlugin: @hasPlugin

	# Helper to add a plugin to this class
	@addPlugin: (name, method) ->
		(@prototype or @)[name] = (args...) ->
			context = @
			task = Task.create({name, args, method, context})
			@runner.addTask(task)
			@
		@
	addPlugin: @addPlugin

	# Require Plugins
	@require: (plugins) ->
		me = @
		plugins = [plugins]  unless Array.isArray(plugins)
		plugins.forEach (pluginName) ->
			# Continue if the plugin is already attached
			return true  if me.hasPlugin(pluginName) is true

			possiblePluginPath = __dirname+'/plugins/'+pluginName.toLowerCase()+'.js'

			if require('fs').existsSync(possiblePluginPath)
				plugin = require(possiblePluginPath)
			else
				plugin = require('chainy-'+pluginName)

			if plugin.addToChainy?
				plugin.addToChainy(me)
			else
				me.addPlugin(pluginName, plugin)
		@
	require: @require


module.exports = Chainy