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

Example:

``` javascript
Chainy.create().set([1,2,3])
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
module.exports = (iterator, next) ->
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