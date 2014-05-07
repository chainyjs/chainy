/**
Flatten Plugin
Flattens nested arrays into a single shallow array

``` javascript
Chainy.create().set([1, [2], [3, [[4]]]])
	.flatten().log()  // [1, 2, 3, 4]
```
*/
module.exports = function(){
	this.data = require('lodash.flatten')(this.data)
}
