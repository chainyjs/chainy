(function(){
	// Import
	var expect = require('chai').expect,
		joe = require('joe')

	// Test
	joe.describe('uniq plugin', function(describe,it){
		var Chainy = require('../../').extend().require(['set', 'uniq', 'done'])
		
		it("should work without arguments", function(next){
			Chainy.create()
				.set([1, 1, 2, 3])
				.uniq()
				.done(function(err, result){
					if (err)  return next(err)
					expect(result).to.deep.equal([1, 2, 3])
					return next()
				})
		})

		it("should work with a field argument", function(next){
			Chainy.create()
				.set([{id:1}, {id:1}, {id:2}])
				.uniq('id')
				.done(function(err, result){
					if (err)  return next(err)
					expect(result).to.deep.equal([{id:1}, {id:2}])
					return next()
				})
		})
	})
})()
