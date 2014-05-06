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

		@runner = TaskGroup.create(opts).run().on 'complete', (err) ->
			console.log('error:', err.stack, '\n', err)  if err

		@

	# Fork the chain
	# Does a deep clone of the data into a new chain and returns it
	fork: (opts={}) ->
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
		@once 'complete', (err) ->
			return callback.apply(me, [err, me.data])
		@

	# Helper to help javascript users extend this class
	@extend: extendOnClass

	# Helper to create a new chainy instance
	@create: (opts) -> new Chainy(opts)

	# Helper to add a plugin to this class
	@addPlugin: (name, method) ->
		@::[name] = (args...) ->
			debug 'running plugin:', name, @data, @runner.config.name
			context = @
			task = Task.create({name, args, method, context})
			@runner.addTask(task)
			@
		@

	# Require Plugins
	@require: (plugins) ->
		me = @
		plugins = [plugins]  unless Array.isArray(plugins)
		plugins.forEach (pluginName) ->
			possiblePluginPath = __dirname+'/plugins/'+pluginName.toLowerCase()

			if require('fs').existsSync(possiblePluginPath)
				plugin = require(possiblePluginPath)
			else
				plugin = require('chainy-'+pluginName)

			if plugin.addToChainy?
				plugin.addToChainy(me)
			else
				me.addPlugin(pluginName, method)
		@


module.exports = Chainy