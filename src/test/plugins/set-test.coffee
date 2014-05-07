# Import
{expect} = require('chai')
joe = require('joe')
Chainy = require('../../../').extend().require(['set', 'done'])

# Task
joe.describe 'set plugin', (describe,it) ->
	it "should work", (next) ->
		value = {a:1, b:2}
		Chainy.create()
			.set(value)
			.done (err, result) ->
				return next(err)  if err
				expect(result).to.eql(value)  # shallow comparison, so checks to see if th eobject is actually the same object
				return next()
