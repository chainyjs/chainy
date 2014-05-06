###
Set Plugin
Sets the data for the chain with the data that is passed over to the plugin

``` javascript
Chainy.create()
	.set("some data").log()  // "some data"
```
###
module.exports = (data) ->
	@data = data
	@