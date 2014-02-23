//--------------------------------------------------------------------
// Template: Create
//--------------------------------------------------------------------

Template.create.rendered = function () {
	var placeholder = $('#tags').attr('placeholder')

	var tagsArray = _.uniq(_.flatten(_.map(Expenditures.find().fetch(), function (expenditureItem) {
		return expenditureItem.tags
	})))

	$('#tags').select2({
		placeholder: placeholder,
		width: 'element',
		tags: tagsArray,
		tokenSeparators: [',', ' ']
	})
}

Template.create.todayDate = function () {
	return new Date().toISOString().split("T")[0]; // looks hacky, but works so whatever
}

Template.create.lastInsertedExpenditure = function () {
	return Session.get('lastInsertedExpenditure')
}

Template.create.events({

	'submit #form-create': function (event, template) {

		var amount = template.find('#amount').value.split(/\s+/)
		var tags = template.find('#tags').value
		var date = template.find('#date').value

		var value = +amount[0] || 0
		var currency = amount[1] && amount[1].length === 3 ? amount[1] : 'SGD'

		if (value && tags) {

			date = date ? new Date(date) : new Date()
			tags = tags.trim().split(/\s+/)

			// Reset values
			template.find('#amount').value = ''
			template.find('#tags').value = ''

			// Insert data
			Meteor.call('createExpenditure', {
				date: date,
				value: value,
				currency: currency.toUpperCase(),
				tags: tags
			}, function (error, insertedId) {
				if (!error) {
					Session.set('lastInsertedExpenditure', Expenditures.findOne({
						_id: insertedId
					}))

					// Remove after 10 seconds
					window.setTimeout(function () {
						if (Session.get('lastInsertedExpenditure')._id === insertedId) {
							Session.set('lastInsertedExpenditure', null)
						}
					}, 10000)
				}/* else {
					Session.set('lastInsertedExpenditure', 'An error occurred.')
				}*/
			})
		}

		/*else {
			if (!amountVal) {
				$amount.focus();
			}
			else if (!$tags.val()) {
				$tags.focus();
			}
		}*/

		// Don't reload page
		return false
	}
})