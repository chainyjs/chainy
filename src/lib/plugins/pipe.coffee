{PassThrough} = require('stream')
module.exports = (destinationStream) ->
	sourceStream = new PassThrough()
	sourceStream.pipe(destinationStream)

	data = @data
	data = JSON.stringify(data)  if typeof data isnt 'string'

	sourceStream.end(data)

	@