/**
Task Plugin
Executes an asynchronous or synchronous task on the chain

``` javascript
Chainy.create().set(1)
	.task(function(currentValue){
		// do something with the current value
	}).log()  // 1
```
*/
module.exports = function(callback, next){
	var task = require('taskgroup').create({
		name: "task for chain",
		method: callback.bind(this),
		args: [this.data],
		next: next
	})
	task.run()
}
