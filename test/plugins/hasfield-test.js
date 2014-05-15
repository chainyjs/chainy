(function(){
	// Import
	var expect = require('chai').expect,
		joe = require('joe')

	// Test
	joe.describe("hasfield plugin", function(describe,it){
		var Chainy = require('../../').extend().require(['set', 'hasField', 'done'])
		
		it("should work", function(next){
			var a = {id:1, name:1}
			var b = {name:2}
			Chainy.create()
				.set([a, b])
				.hasField('id')
				.done(function(err, result){
					if (err)  return next(err)
					expect(result).to.eql([a])
					// ^ shallow comparison, so checks to see if the object is actually the same object
					return next()
				})
		})
	})
})()
