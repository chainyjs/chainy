###
Task Plugin
Executes an asynchronous or synchronous task on the chain

``` javascript
Chainy.create().set(1)
	.task(function(currentValue){
		// do something with the current value
	}).log()  // 1
```
###
{Task} = require('taskgroup')
module.exports = (callback, next) ->
	task = Task.create(
		name: "task for chain"
		method: callback
		context: @
		args: [value]
		next: next
	)
	task.run()
	@
