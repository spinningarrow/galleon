Expensive = new Meteor.Collection('expensive_data');

if (Meteor.is_client) {

	Meteor.startup(function () {

		$('.container').hide().eq(0).show();

		/*$('.container-toggle').bind('click', function (event) {
			event.preventDefault();

			var toggleElementID = '#' + $(this).data('toggle');
			$(this).parents('.container').slideUp();
			$(toggleElementID).slideDown();

			console.log('clicked');
			return false;
		});*/
	});

	var toggleContainersHandler = function (event) {
		event.preventDefault();

		var toggleElementID = '#' + $(event.target).data('toggle');

		$(event.target).parents('.container').slideUp();
		$(toggleElementID).slideDown();
	};

	var listTags = function () {
		var tags = [];

		Expensive.find().forEach(function (data) {
			$.each(data.tags, function (index, value) {
				($.inArray(value, tags) === -1) && tags.push(value);
			});
		})

		return tags.sort();
	};

	// ---- Main (home) Page ----
	Template.main.events = {

		/*'keyup #tags' : function (event) {

			var typedTags = event.target.value.split(' ');
			var currentTag = typedTags[typedTags.length - 1];
			// console.log(currentTag);

			currentTag && $.each(listTags(), function (index, value) {
				if (value.indexOf(currentTag) === 0) {
					console.log(value);
					// event.target.value = value + event.target.value;
					// return false;
				}
			});
		},*/

		'click .container-toggle' : toggleContainersHandler,

		'click .submit' : function (event) {

			if ($('#amount').val() && $('#tags').val()) {

				var data = {
					date : $('#date').val() ? new Date($('#date').val()) : new Date(),
					amount : parseFloat($('#amount').val()),
					tags : $('#tags').val().split(' '),
				};

				Expensive.insert(data);

				$('#amount').val('');
				$('#tags').val('');
			}

			else {
				if (!$('#amount').val()) {
					$('#amount').focus();
				}
				else if (!$('#tags').val()) {
					$('#tags').focus();
				}
			}
		}
	};

	Template.main.date_today = function () {
		return new Date().toISOString().split("T")[0]; // looks hacky, but works so whatever
	};

	// Total (all time)
	Template.main.total = function () {

		var amounts = Expensive.find().map(function (data) {
			return data.amount;
		});

		return amounts.reduce(function (memo, num) { return memo + num }, 0).toFixed(2);
/*
		var total = 0;

		Expensive.find().forEach(function (data) {
			total += data.amount;
		});

		return total.toFixed(2);*/
	};

	// Total (current month)
	Template.main.total_month = function () {

		var today = new Date(),
			current_year = today.getFullYear(),
			current_month = today.getMonth(),
			start_date = new Date(current_year, current_month, 1),
			end_date = new Date(current_year, current_month + 1, 1);

		// var current_month = new Date().getMonth();

		var amounts = Expensive.find({ 'date': { $gte: start_date , $lt: end_date } })
						.map(function (data) { return data.amount; });

		return amounts.reduce(function (memo, num) { return memo + num }, 0).toFixed(2);

		/*var total = 0;

		Expensive.find(function () {
			return (new Date(this.date)).getMonth() === (new Date()).getMonth();
		}).forEach(function (data) {
			total += data.amount;
		});

		return total.toFixed(2);*/
	};

	// Total (previous day)
	Template.main.total_yesterday = function () {

		var total = 0;

		Expensive.find(function () {
			return (new Date(this.date)).getDate() === (new Date()).getDate() - 1;
		}).forEach(function (data) {
			total += data.amount;
		});

		return total.toFixed(2);
	};

	// Total (today)
	Template.main.total_today = function () {

		var today = new Date(),

			current_year = today.getFullYear(),
			current_month = today.getMonth(),
			current_date = today.getDate(),

			start_date = new Date(current_year, current_month, current_date),
			end_date = new Date(current_year, current_month, current_date + 1),

			amounts = Expensive.find({ 'date': { $gte: start_date , $lt: end_date } })
						.map(function (data) { return data.amount; });

		return amounts.reduce(function (memo, num) { return memo + num }, 0).toFixed(2);

		/*var total = 0;

		Expensive.find(function () {

			var date = new Date(this.date);
			var today = new Date();
			return date.getDate() === today.getDate() && date.getMonth() === today.getMonth() && date.getFullYear() === today.getFullYear(); // date comparison sucks
		}).forEach(function (data) {
			total += data.amount;
		});

		return total.toFixed(2);*/
	};

	// ---- Details Page ----
	Template.view_details.events = {

		'click .container-toggle' : toggleContainersHandler,

		'click .tag' : function () {
			/*$(event.target)
				// .prop('readonly', false)
				// .addClass('editable');
				.hide()
				.after('<input type="text" class="tag editable">')
				.next().focus();*/

			var id = $(event.target).parent('li').data('id'),
				document = Expensive.findOne({ _id: id }),
				tags = document.tags;

			var updated_tags = prompt('Enter updated tags (comma-separated) for \n$' + document.amount.toFixed(2) + ' spent on ' + new Date(document.date).toDateString() + ':', tags.join(', '));

			if (updated_tags != null) {

				updated_tags = updated_tags.split(/,\s/);

				if (!_.isEqual(updated_tags, tags)) { // is there a better way?
					Expensive.update({ _id: id }, { $set: { tags: updated_tags } });
				}
			}

			return false;
		},

		'blur input.tag' : function () {
			$(event.target)
				// .prop('readonly', true)
				// .removeClass('editable');
				.prev().show()
					.next().remove();
		},

		'click .day-title' : function () {
			var $target = $(event.currentTarget);
			// console.log($target.hasClass('day-title') || $target.parent().hasClass('.day-title'));
			$target.toggleClass('collapsed').find('.items').slideToggle('fast');
		}
	};

	/*Template.view_details.day = function () {
		return Expensive.find();
	};

	Template.view_details.day2 = function () {

		var result = [];

		Expensive.find({}, {sort : {date : 1}}).forEach(function (data) {

			var d = (new Date(data.date));

			result.push({
				date: d.getDate() + '/' +  (d.getMonth() + 1) + '/' + d.getFullYear(),
				amount:  data.amount.toFixed(2),
				tags: data.tags
			});
		});

		return result;
	};*/

	Template.view_details.list_by_date = function () {

		var grouped_data = {},
			result = [];

		// Group all the data by day
		Expensive.find({}, {sort: {date: 1}}).forEach(function (data) {

			var date_key = new Date(data.date).toDateString();

			!grouped_data[date_key] && (grouped_data[date_key] = []);
			data.amount = data.amount.toFixed(2); // format amount
			grouped_data[date_key].push(data);
		});

		window.g_d = grouped_data;

		// Convert to an array for templating, and include the sum for each day
		for (var property in grouped_data) {

			var amounts = grouped_data[property].map(function (data) {
				return parseFloat(data.amount);
			});

			var total = amounts.reduce(function (memo, num) {
				return memo + num;
			}, 0);

			result.push({
				date: property,
				total: total.toFixed(2),
				list_data: grouped_data[property]
			});
		}

		return result;

		// moar groups
		var rr = Expensive.find({}, {sort: {date: 1}}).fetch();
		var q = _.groupBy(rr, function (d) { return new Date(d.date).getFullYear() });
		_.each(q, function (value, key, list) {
		  q[key] = _.groupBy(value, function (d) { return new Date(d.date).getMonth(); });
		});
		_.each(q, function (value, key, list) {
		  _.each(value, function (v, k, l) {
		    q[key][k] = _.groupBy(v, function (d) { return new Date(d.date).toDateString(); });
		  });
		});

		window.qq = q;

		return [q];
	};

	Template.view_details.grouped_data = function () {

		var months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

		var days = {
			mon: 'Monday',
			tue: 'Tuesday',
			wed: 'Wednesday',
			thu: 'Thursday',
			fri: 'Friday',
			sat: 'Saturday',
			sun: 'Sunday'
		};

		// Get all the data from the database
		var data = Expensive.find({}, {sort: {date: 1}}).fetch();

		// Add formatted amount to each data item
		_.each(data, function (item) {
			item.display_amount = item.amount.toFixed(2);
		});

		// Group by day
		var dates_group = _.groupBy(data, function (item) {
			return new Date(item.date).toDateString();
		});

		// Group into array for dates
		var daily_data = _.map(dates_group, function (value, key, list) {

			var date = new Date(key),
				day = days[key.match(/^\w{3}/)[0].toLowerCase()],
				month = months[date.getMonth()],
				date = date.getDate();

			return {
				day: key,
				display_day: day,
				display_month: month,
				display_date: date,
				total: _.reduce(value, function (memo, num) { return memo + num.amount; }, 0).toFixed(2),
				data: value
			}
		});

		// Group by month
		var months_group = _.groupBy(daily_data, function (item) {
			var date = new Date(item.day);
			return date.getMonth() + '/' + date.getFullYear();
		});

		// Group into array for months
		var monthly_data = _.map(months_group, function (value, key, list) {
			var matches = key.match(/(\d{1,2})\/(\d{4})/);
			return {
				month: months[parseInt(matches[1], 10)],
				year: parseInt(matches[2], 10),
				data: value,
				monthly_total: _.reduce(value, function (memo, num) { return memo + parseFloat(num.total); }, 0).toFixed(2)
			}
		});

		// Group by year
		var years_group = _.groupBy(monthly_data, function (item) {
			return item.year;
		});

		// Group into array for years
		var result = _.map(years_group, function (value, key, list) {
			return {
				year: key,
				data: value
			}
		});

		window.yd = result;

		return result;
	};

	/*Template.hello.greeting = function () {
		return "Welcome to Expensive!";
	};

	Template.hello.events = {

		'click input' : function () {
			// template data, if any, is available in 'this'
			if (typeof console !== 'undefined')
				console.log("You pressed the button");
		}
	};

	// Colors
	Template.color_list.colors = function () {
		return Colors.find({}, { sort: { likes: -1, name: 1 } });
	};

	Template.color_list.events = {

		'click button' : function () {
			Colors.update(Session.get('session_color'), { $inc: { likes: 1 } });
		}
	};

	Template.color_info.maybe_selected = function () {
		return Session.equals('session_color', this._id) ? 'selected' : '';
	};

	Template.color_info.how_many = function () {

		if (!this.likes) { return "no"; }
		if (this.likes < 5) { return "a few"; }
		if (this.likes < 20) { return "some"; }
		return "a lot of";
	};

	Template.color_info.events = {

		'click' : function () {
			Session.set('session_color', this._id);
		}
	};*/
}

if (Meteor.is_server) {
	Meteor.startup(function () {
		// code to run on server at startup
	});
}