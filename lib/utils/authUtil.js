module.exports.authCheck = function(req, res) {
	if(!req.session || !req.session.userid) {
		return false;
	}
	return true;
}