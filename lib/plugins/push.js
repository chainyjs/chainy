/**
Push Plugin
Add each argument to the chain's data

Will make the chain's data an array if it isn't already

``` javascript
Chainy.create().set(1)
	.push([2, 3]).log()  // 1, 2, 3
```
*/
module.exports = function(){
	var items = Array.prototype.slice.call(arguments)
	if ( this.data == null ) {
		this.data = []
	}
	if ( Array.isArray(this.data) === false ) {
		this.data = [this.data]
	}
	this.data.push.apply(this, items)
}