# Import
{expect} = require('chai')
joe = require('joe')
Chainy = require('../../../').extend().require(['set', 'hasField', 'done'])

# Task
joe.describe 'hasfield plugin', (describe,it) ->
	it "should work", (next) ->
		a = {id:1, name:1}
		b = {name:2}
		Chainy.create()
			.set([a, b])
			.hasField('id')
			.done (err, result) ->
				return next(err)  if err
				expect(result).to.eql([a])  # shallow comparison, so checks to see if the object is actually the same object
				return next()
