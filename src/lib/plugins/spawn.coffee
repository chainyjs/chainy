safeps = require('safeps')
module.exports = (opts={}, next) ->
	me = @

	opts = {command: opts}  if typeof opts in ['string', 'function']
	command = opts.command?(@data) or opts.command
	delete opts.command

	safeps.spawn command, opts, (err, result) ->
		return next(err)  if err
		me.data = result
		return next()

	@