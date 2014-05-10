/**
Swap Plugin
Executes an asynchronous or synchronous task on the chain, updating the chain's data with the result value

``` javascript
Chainy.create().set(1)
	.swap(function(currentValue){
		var newValue = currentValue*5;
		return newValue;
	}).log()  // 5
```
*/
module.exports = function(callback, next){
	var chain = this
	var task = require('taskgroup').Task.create({
		name: "task for chain",
		method: callback.bind(chain),
		args: [this.data],
		next: function(err, value){
			if (err)  return next(err)
			chain.data = value
			return next()
		}
	})
	task.run()
}
