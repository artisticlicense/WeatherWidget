//Create application
App = Ember.Application.create({});

//Model
App.Weather = Em.Object.extend({


});

App.Weather.reopenClass({
	getWeather: function(){
		var weatherItems = Ember.A();
		$.support.cors = true;
		
		$.ajax({
			type: "POST",
			url: "http://query.yahooapis.com/v1/public/yql?q=select%20item%20from%20weather.forecast%20where%20location%3D%2222102%22&format=json",
			dataType: "json",
			success: function(response) {
				//Get the item of data, aka the location and all its weather related data
				var weatherData = response["query"]["results"]["channel"];
				var item = weatherData["item"];
				
				//Extract data for the 5 day forecast and make it more easily accessible
				for(var i=0; i<item["forecast"].length; i++){
					var f = item["forecast"][i];
					var count = i+1;
					item["forecast" + count + "day"] = f["day"];
					item["forecast" + count + "high"] = f["high"];
					item["forecast" + count + "low"] = f["low"];
				}

				//Extract the image url from the description data
				var tempDiv = document.createElement("div");
				tempDiv.innerHTML = item.description;
				item["imageurl"] = tempDiv.getElementsByTagName("img")[0].src;
				
				//Extract the location from the title "Conditions for [City, State] at [Time]"
				var location = item["title"];
				var startIndex = location.indexOf("for") + 4;
				var endIndex = location.indexOf("at") - 1;
				item["location"] = location.substring(startIndex, endIndex);
				//Change the title of the widget
				document.title = item["title"];
				
				
				weatherItems.pushObject(App.Weather.create(item));
			},
			error: function (xhr, ajaxOptions, thrownError) {
				console.log("Error updating Weather Widget.");
			}
		});
		return weatherItems;
	}
});

//Controller
App.IndexController = Ember.ObjectController.extend( {
	loadWeather: function() {
		this.set( 'model', App.Weather.getWeather() );
	}
})

//Default Route
App.IndexRoute = Ember.Route.extend({
	model: function() {
		return App.Weather.getWeather();
	}
});
