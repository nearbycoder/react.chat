module.exports = {
	getRoom: function() {
	    var results = location.search.replace('?', '');
	    return results === null ? "" : results;
	}
}


