module.exports = (destinationStream) ->
	{PassThrough} = require('stream')
	sourceStream = new PassThrough()
	sourceStream.pipe(destinationStream)
	data = @data
	data = JSON.stringify(data)  if typeof data isnt 'string'
	sourceStream.end(data)
	@