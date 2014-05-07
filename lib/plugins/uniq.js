/**
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
*/
module.exports = function(opts, next){
	if ( !opts ) {
		opts = {}
	}
	if ( (typeof opts) === 'string' ) {
		opts = {field: opts}
	}

	var counts = {}
	this.data = this.data.filter(function(item){
		if ( opts.field != null ) {
			qualifier = item[opts.field]
		}
		else {
			qualifier = item
		}

		counts[qualifier] = counts[qualifier] || 0
		++counts[qualifier]

		return counts[qualifier] === 1
	})

	next()
	// ^ because the opts argument is optional, we must manually specify next so opts doesn't get confused with it when running without it
}