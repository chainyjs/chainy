###
Exec Plugin
Sets the chain data as the output of an executed script

``` javascript
Chainy.create()
	.exec('echo -n hello world').log()  // "hello world"
```
###
safeps = require('safeps')
module.exports = (command, opts={}, next) ->
	me = @

	command = command?(@data) or command

	safeps.spawn command, opts, (err, result) ->
		return next(err)  if err
		me.data = result
		return next()

	@