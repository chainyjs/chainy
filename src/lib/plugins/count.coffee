###
Count Plugin
Outputs the length of the chainy data

``` javascript
Chainy.create()
	.set([1, 2, 3]).count()  // 3
```
###
module.exports = ->
	console.log(@data.length)
	@