{Task, TaskGroup} = require('taskgroup')
{extendOnClass} = require('extendonclass')
debug = if false then console.log else ->


# =====================================
# Core

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
		plugins.forEach (plugin) ->
			require(plugin).addToChainy(@)
		@


# =====================================
# Plugins

###
Creating Plugins

Plugins are injected into the Chainy prototype using the `Chainy.addPlugin(name, method)` method:

- `name` is a string for the key that the plugin is inserted at, e.g. `Chainy.addPlugin('hello', function(){return 'world';})` has the plugin injected at `Chainy.prototype.hello`, making it availably via `chainyInstance.hello()`

- `method` is a synchronous or asynchronous method that you defined that will perform the action of your plugin

Things to know about the plugin method:

1. The context (what `this` means) is set to the chain that the plugin is executing on, e.g.

	``` javascript
	chainyInstance.hello()
	// the context of hello's plugin method when executed will be that of `chainyInstance`
	```

2. This context is important, as your plugin will use it to apply the changes of the data back to the chain:

	``` javascript
	Chainy.addPlugin('x5', function(){
		this.data = this.data.map(function(value){
			return value*5;
		});
	});
	Chainy.create().add([1,2,3]).x5().log() // [5, 10, 15]
	```

3. You can also accept arguments in your plugin:

	``` javascript
	Chainy.addPlugin('x', function(n){
		this.data = this.data.map(function(value){
			return value*n;
		});
	});
	Chainy.create().add([1,2,3]).x(10).log() // [10, 20, 30]

4. You can even make your plugin asynchronous by accepting an unspecified by the caller last argument called `next`:

	``` javascript
	Chainy.addPlugin('download', function(url, next){
		var chainyInstance = this;
		require('request')(url, function(err, response, body){
			if ( err ) {
				return next(err);
			}
			else {
				chainyInstance.data = body;
				return next();
			}
		});
	});
	Chainy.create().download('http://some.url').log() // outputs whatever http://some.url pointed to
	```
###

# Set the data for the chain
Chainy.addPlugin 'set', (data) ->
	debug 'executing plugin: set', @data, @runner.config.name
	@data = data
	@

# Set the data for the chain using the return value of a synchronous callback function
Chainy.addPlugin 'replace', (callback) ->
	debug 'executing plugin: replace', @data, @runner.config.name
	@data = callback?.call(@, @data)
	@

# Add each item of the passed array to the data
Chainy.addPlugin 'add', (items) ->
	debug 'executing plugin: add', @data, @runner.config.name
	@data ?= []
	@data.push(items...)
	@

###
Flatten Plugin
Flattens nested arrays into a single shallow array

Example usage:

``` javascript
require('chainy').create().add([1, [2], [3, [[4]]]])
	.flatten().log()  // [1, 2, 3, 4]
```
###
Chainy.addPlugin 'flatten', ->
	debug 'executing plugin: flatten', @data, @runner.config.name
	@data = require('lodash.flatten')(@data)
	@

###
Map Plugin
Replaces each item in the array with the result of an asynchronous or synchronous iterator

The iterator can operate synchronously:

``` javascript
function(value){
	return replacementValue;
}
```

Or asynchronously:

``` javascript
function(value, complete){
	complete(err, replacementValue);
}
```

The replacement value (or lack thereof) is used to replace the value of the item in the array the iterator was executing for. Be sure to always explicitly specify a replacement value (even if it is the same as the value), as otherwise the item in the array will be replaced with `undefined` and you'll be confused.

Example usage:

``` javascript
require('chainy').create().add([1,2,3])
	// Synchronous iterator
	.map(function(i){
		return i*5;
	}).log()  // [5, 10, 15]

	// Asynchronous iterator
	.map(function(i, next){
		return next(null, i*2);
	}).log()  // [10, 20, 30]
```
###
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

Chainy.addPlugin 'request', (opts={}, next) ->
	debug 'executing plugin: request', @data, @runner.config.name
	if typeof opts in ['function','string']
		opts = {url:opts}
	opts.cache = 'preferred'
	me = @
	feedr = require('feedr').create(opts)
	@fork()
		.map (item, complete) ->
			url = opts.url?(item) or opts.url
			feedr.readFeed({url, parse:'json'}, complete)
		.fn (result) ->
			me.data = result
			next()
	@

module.exports = Chainy