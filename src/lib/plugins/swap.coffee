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
{Task} = require('taskgroup')
module.exports = (callback, next) ->
	chain = @
	task = Task.create(
		name: "task for chain"
		method: callback
		context: @
		args: [@data]
		next: (err, value) ->
			return next(err)  if err
			chain.data = value
			return next()
	)
	task.run()
	@
