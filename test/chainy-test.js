(function(){
	"use strict";

	// Import
	var expect = require('chai').expect,
		joe = require('joe')

	// Test Chainy
	joe.describe('chainy', function(describe,it){
		var Chainy = require('../')

		it("should fail when attempting to extend the base class", function(){
			var err;
			try {
				Chainy.addExtension('test', 'action', function(){})
			}
			catch (_err) {
				err = _err;
			}
			expect(err && err.message).to.contain('frozen')
		})

		it("should pass when attempting to extend a child class", function(){
			var extension = function(){}
			var MyChainy = Chainy.subclass().addExtension('test', 'utility', extension)
			expect(MyChainy.prototype.test).to.eql(extension)
		})

		it("it should have autoloaded the installed set plugin", function(next){
			var a = {id:1, name:1}
			Chainy.create()
				.set(a)
				.done(function(err, result){
					if (err)  return next(err)
					expect(result).to.deep.equal(a)
					// ^ shallow comparison, so checks to see if the object is actually the same object
					return next()
				})
		})
	});
})()