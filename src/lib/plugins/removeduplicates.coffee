module.exports = (field) ->
	counts = {}
	@data = @data.filter (item) ->
		id = item[field]
		counts[id] = counts[id] or 0
		++counts[id]
		return counts[id] is 1
	@