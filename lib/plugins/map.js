/**
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

Iterators are executed in parallel.

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
		return next(null, i*10);
	}).log()  // [10, 20, 30]
```
*/
module.exports = function(iterator, opts, next){
	var taskgroup = require('taskgroup'), TaskGroup = taskgroup.TaskGroup, Task = taskgroup.Task;
	var chain = this;

	if ( !opts ) {
		opts = {}
	}
	if ( !opts.name ) {
		opts.name = 'map iterator group'
	}
	if ( opts.concurrency == null ) {
		opts.concurrency = 0
	}

	var tasks = TaskGroup.create(opts).once('complete', function(err, result){
		return next(err)
	})

	chain.data.forEach(function(value, key){
		var task = Task.create({
			name: "map iterator for: "+key,
			method: iterator,
			context: chain,
			args: [value],
			next: function(err, result){
				// the taskgroup will handle errors automatically for us
				if ( !err ) {
					chain.data[key] = result
				}
			}
		})
		tasks.addTask(task)
	})

	tasks.run()
}