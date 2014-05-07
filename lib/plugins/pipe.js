/**
Pipe Plugin
Pipe the chain's data to the passed stream

Note: This still returns the chain, and does not replace the chain data, if you don't want this, use the swap plugin instead

``` javascript
Chainy.create().set('some data')
	.pipe(
		require('fs').createWriteStream(__dirname+'/out.txt')
	)  // will write "some data" to the file "out.txt"
```
*/
module.exports = function(destinationStream){
	var PassThrough = require('stream').PassThrough;
	var sourceStream = new PassThrough()

	sourceStream.pipe(destinationStream)

	var data = this.data
	if ( typeof data !== 'string' ) {
		data = JSON.stringify(data)
	}

	sourceStream.end(data)
}