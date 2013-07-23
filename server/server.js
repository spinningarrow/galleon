// Server

Meteor.publish('expenditures', function () {
	return Expenditures.find({ user: this.userId })
})