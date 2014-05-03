{Task, TaskGroup} = require('TaskGroup')
debug = ->

class Chainy
	data: null
	runner: null

	constructor: ->
		@data = null
		@runner = TaskGroup.create().run().on 'complete', (err) ->
			console.log('error:', err)  if err
		@

	fork: ->
		_ = Chainy.create()
		_.data = JSON.parse JSON.stringify @data
		return _

	@create: ->
		return new Chainy()

	@use: (pluginAddMethod) ->
		pluginAddMethod(@)
		@

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

Chainy.create()
	.add(['bevry','browserstate','ideashare','interconnectapp','docpad'])

	.request (org) ->
		return "https://api.github.com/orgs/#{org}/public_members"

	.flatten().count()

	.removeDuplicates('id').count()

	.request (user) ->
		return user.url

	.hasField('location').count()

	.map (user, complete) ->
		Chainy.create()
			.add([user])
			.request (user) ->
				return "https://api.tiles.mapbox.com/v3/examples.map-zr0njcqy/geocode/#{user.location}.json"
			.map (geo) ->
				result = geo.results[0][0]
				user.coordinates = [result.lon, result.lat]  if result
				return geo
			.fn -> complete(null, user)

	.hasField('coordinates').count()

	.map (user) ->
		return {
			type: 'Feature'
			properties:
				githubUsername: user.login
			geometry:
				type: 'Point'
				coordinates: user.coordinates
		}

	.replace (data) ->
		return {
			type: 'FeatureCollection'
			features: data
		}

	.log()

	.replace (data) ->
		JSON.stringify(data, null, '\t')

	.pipe(
		require('fs').createWriteStream('./out.geojson')
	)
