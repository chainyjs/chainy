###
Add Plugin
Add each item of the passed array to the data

``` javascript
Chainy.create().set(1)
	.add([2, 3]).log()  // 1, 2, 3
```
###
module.exports = (items) ->
	@data ?= []
	@data = [@data]  unless Array.isArray(@data)
	@data.push(items...)
	@
