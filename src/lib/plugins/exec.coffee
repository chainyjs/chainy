safeps = require('safeps')
module.exports = (command, opts={}, next) ->
	me = @

	command = command?(@data) or command

	safeps.spawn command, opts, (err, result) ->
		return next(err)  if err
		me.data = result
		return next()

	@