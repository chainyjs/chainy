/**
Exec Plugin
Sets the chain data as the output of an executed script

``` javascript
Chainy.create()
	.exec('echo -n hello world').log()  // "hello world"
```
*/
module.exports = function(command, opts, next){
	var chain = this
	if ( typeof command === 'function' ) {
		command = command(this.data)
	}
	require('safeps').spawn(command, opts, function(err, result){
		if (err)  return next(err)
		chain.data = result
		return next()
	})
}