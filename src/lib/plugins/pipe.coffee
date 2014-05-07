###
Pipe Plugin
Pipe the chain's data to the passed stream

Note: This still returns the chain, and does not replace the chain data, if you don't want this, use the swap plugin instead

``` javascript
Chainy.create().set('some data')
	.pipe(
		require('fs').createWriteStream(__dirname+'/out.txt')
	)  // will write "some data" to the file "out.txt"
```
###
{PassThrough} = require('stream')
module.exports = (destinationStream) ->
	sourceStream = new PassThrough()
	sourceStream.pipe(destinationStream)

	data = @data
	data = JSON.stringify(data)  if typeof data isnt 'string'

	sourceStream.end(data)

	@