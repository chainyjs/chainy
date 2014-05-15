module.exports = function(){
	var me = this
	var queue = []
	var checks = setInterval(function(){
		console.log(queue[0].getNames(), 'taking longer than expected')
	}, 1000*10)

	this.runner
		/*.on('item.add', function(item){
			var names = me.runner.getNames()
			console.log(names, 'added', item.config.name)
		})*/
		.on('item.run', function(item){
			queue.push(item)
			console.log(item.getNames(), 'started')
		})
		.on('item.complete', function(item){
			queue.pop()
			console.log(item.getNames(), 'completed')
		})
		.on('complete', function(){
			clearInterval(checks)
			checks = null
		})

	return this;
}

module.exports.extensionType = 'utility'
