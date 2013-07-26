Expenditures = new Meteor.Collection("expenditures");

/*
user: user id (owner)
date: datetime
value: float
currency: string (3 letter code)
tags: array of strings
*/

Expenditures.allow({
	insert: function () {
		return false // use createExpenditure method
	},

	update: function (userId, expenditures, fieldNames) {
		// // Check that all expenditures to be updated are owned by the
		// // current user
		// return _.all(expenditures, function (expenditure) {
		// 	if (userId !== expenditure.user) {
		// 		return false // not the owner
		// 	}

		// 	var allowedFields = ['date', 'value', 'tags']
		// 	if (_.difference(fieldNames, allowedFields)) {
		// 		return false // user cannot update some of those fields
		// 	}

		// 	// TODO do some data validation/conversion here
		// 	return true
		// })

		return expenditures.user === userId
	},

	remove: function (userId, expenditure) {
		return expenditure.user === userId
	}
})

Meteor.methods({

	// options should include: date, value, currency, tags
	createExpenditure: function (options) {
		options = options || {};

		// Validation stuffs
		/*if (! (typeof options.title === "string" && options.title.length &&
					typeof options.description === "string" &&
					options.description.length &&
					typeof options.x === "number" && options.x >= 0 && options.x <= 1 &&
					typeof options.y === "number" && options.y >= 0 && options.y <= 1))
			throw new Meteor.Error(400, "Required parameter missing");
		if (options.title.length > 100)
			throw new Meteor.Error(413, "Title too long");
		if (options.description.length > 1000)
			throw new Meteor.Error(413, "Description too long");*/

		if (!this.userId) {
			throw new Meteor.Error(403, "You must be logged in.")
		}

		return Expenditures.insert({
			user: this.userId,
			date: options.date,
			value: options.value,
			currency: options.currency,
			tags: options.tags
		})
	}
})