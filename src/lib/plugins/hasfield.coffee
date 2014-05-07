###
HasField Plugin
Filters out items in the chains data that do not have the specified field

``` javascript
Chainy.create().set([{id:1, name:1}, {name:2}])
	.hasField('id').log()  // [{id:1, name:1}]
```
###
module.exports = (field) ->
	@data = @data.filter (item) ->
		return item[field]?
	@