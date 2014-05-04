{Task, TaskGroup} = require('taskgroup')
debug = ->

class Chainy
	data: null
	runner: null
	parent: null

	constructor: (opts) ->
		@data = null

		@runner = TaskGroup.create(opts).run().on 'complete', (err) ->
			console.log('error:', err)  if err

		@

	fork: (opts) ->
		_ = Chainy.create(opts)
		_.parent = @
		_.data = JSON.parse JSON.stringify @data
		return _

	on: (args...) ->
		@runner.on.apply(@runner, args)
		@

	done: (cb) ->
		me = @
		@once 'complete', (err) ->
			return complete.call(me, err, me.data)
		@

	@create: ->
		return new Chainy()

	@addPlugin: (name, method) ->
		@::[name] = (args...) ->
			debug 'running plugin:', name, @data, @runner.config.name
			context = @
			task = Task.create({name, args, method, context})
			@runner.addTask(task)
			@
		@

Chainy.addPlugin 'set', (data) ->
	debug 'executing plugin: set', @data, @runner.config.name
	@data = data
	@

Chainy.addPlugin 'replace', (cb) ->
	debug 'executing plugin: replace', @data, @runner.config.name
	@data = cb?.call(@, @data)
	@

Chainy.addPlugin 'add', (items) ->
	debug 'executing plugin: add', @data, @runner.config.name
	@data ?= []
	@data.push(items...)
	@

Chainy.addPlugin 'flatten', ->
	debug 'executing plugin: flatten', @data, @runner.config.name
	@data = require('lodash.flatten')(@data)
	@

Chainy.addPlugin 'map', (iterator, next) ->
	debug 'executing plugin: map', @data, @runner.config.name

	me = @
	data = @data

	tasks = TaskGroup.create('map iterator group').once 'complete', (err, result) ->
		debug 'all map iterators finished'
		next(err)

	data.forEach (value, key) ->
		task = new Task(
			name: "map iterator for #{key}"
			method: iterator
			args: [value]
			next: (err, result) ->
				data[key] = result  unless err
		)
		tasks.addTask(task)

	tasks.run()
	@

Chainy.addPlugin 'removeDuplicates', (field) ->
	debug 'executing plugin: removeDuplicates', @data, @runner.config.name
	counts = {}
	@data = @data.filter (item) ->
		id = item[field]
		counts[id] = counts[id] or 0
		++counts[id]
		return counts[id] is 1
	@

Chainy.addPlugin 'hasField', (field) ->
	debug 'executing plugin: hasField', @data, @runner.config.name
	@data = @data.filter (item) ->
		return item[field]
	@

Chainy.addPlugin 'pipe', (destinationStream) ->
	debug 'executing plugin: pipe', @data, @runner.config.name
	{PassThrough} = require('stream')
	sourceStream = new PassThrough()
	sourceStream.pipe(destinationStream)
	data = @data
	data = JSON.stringify(data)  if typeof data isnt 'string'
	sourceStream.end(data)
	@

Chainy.addPlugin 'fn', (cb) ->
	debug 'executing plugin: fn', @data, @runner.config.name
	cb?.call(@, @data)
	@

Chainy.addPlugin 'count', ->
	debug 'executing plugin: count', @data, @runner.config.name
	console.log(@data.length)
	@

Chainy.addPlugin 'log', ->
	debug 'executing plugin: log', @data, @runner.config.name
	console.log @data
	@

Chainy.addPlugin 'request', (method, next) ->
	debug 'executing plugin: request', @data, @runner.config.name
	me = @
	feedr = require('feedr').create(cache: 'preferred')
	@fork()
		.map (item, complete) ->
			url = method(item)
			feedr.readFeed({url, parse:'json'}, complete)
		.fn (result) ->
			me.data = result
			next()
	@

module.exports = Chainy