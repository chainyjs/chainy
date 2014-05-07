###
Log Plugin
Logs the current data of the chain to stdout

``` javascript
Chainy.create()
	.set("some data").log()  // "some data"
```
###
module.exports = ->
	console.log(@data)
	@