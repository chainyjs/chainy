###
Unique Plugin
Ensure that only given instance of an item exists in the chain's array

Can also pass a string of a field name to use as the unique identifier against the items

``` javascript
Chainy.create()
	.set([1, 1, 2, 3])
	.uniq().log()  // [1, 2, 3]

Chainy.create()
	.set([{id:1}, {id:1}, {id:2}])
	.uniq('id').log()  // [{id:1}, {id:2}]
```
###
module.exports = (opts={}, next) ->
	opts = {field: opts}  if typeof opts is 'string'

	counts = {}
	@data = @data.filter (item) ->
		if opts.field?
			qualifier = item[opts.field]
		else
			qualifier = item

		counts[qualifier] = counts[qualifier] or 0
		++counts[qualifier]

		return counts[qualifier] is 1

	next()  # as the opts argument is optional, we must manually specify next so opts doesn't get confused with it when running without it

	@