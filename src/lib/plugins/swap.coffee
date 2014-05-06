###
Swap Plugin
Executes an asynchronous or synchronous task on the chain, updating the chain's data with the result value

``` javascript
Chainy.create().set(1)
	.swap(function(currentValue){
		var newValue = currentValue*5;
		return newValue;
	}).log()  // 5
```
###
module.exports = (callback, next) ->
	me = @
	task = new Task(
		name: "task for chain"
		context: @
		method: callback
		args: [value]
		next: (err, value) ->
			return next(err)  if err
			me.data = value
			return next()
	)
	task.run()
	@
