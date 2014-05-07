###
Push Plugin
Add each argument to the chain's data

Will make the chain's data an array if it isn't already

``` javascript
Chainy.create().set(1)
	.push([2, 3]).log()  // 1, 2, 3
```
###
module.exports = (items...) ->
	@data ?= []
	@data = [@data]  unless Array.isArray(@data)
	@data.push(items...)
	@
