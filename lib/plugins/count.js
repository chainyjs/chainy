/**
Count Plugin
Outputs the length of the chain data to stdout

``` javascript
Chainy.create()
	.set([1, 2, 3]).count()  // 3
```
*/
module.exports = function(){
	console.log(this.data.length)
}