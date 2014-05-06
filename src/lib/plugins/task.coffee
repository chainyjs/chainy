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
module.exports = (callback, next) ->
	task = new Task(
		name: "task for chain"
		context: @
		method: callback
		args: [value]
		next: next
	)
	task.run()
	@
