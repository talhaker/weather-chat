"use strict";
var WeatherChatApp = function() {
    var STORAGE_ID = 'weather-chat';

    var saveToLocalStorage = function() {
        localStorage.setItem(STORAGE_ID, JSON.stringify(cities));
    }

    var getFromLocalStorage = function() {
        return JSON.parse(localStorage.getItem(STORAGE_ID) || '[]');
    }

    var cities = getFromLocalStorage();

    var weekdayNames = [
        "Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"
    ];

    var monthNames = [
        "Jan", "Feb", "Mar", "Apr", "May", "Jun",
        "Jul", "Aug", "Sept", "Oct", "Nov", "Dec"
    ];

    // render cities to page
    // this function empties the cities div, 
    // then adds each city from the cities array 
    // along with the appropriate HTML (using handlebars)
    var _renderCityWeatherInfo = function() {
        // variable for storing our cities div
        var citiesList = $('.cities');
        citiesList.empty();

        // Grab the template script
        var theTemplateScript = $("#city-item-template").html();

        // Compile the template
        var listItemTemplate = Handlebars.compile(theTemplateScript);

        // Loop to create individual list items
        for (let cityIndex = 0; cityIndex < cities.length; cityIndex++) {
            var city = cities[cityIndex].data;
            var date = new Date(city.dt * 1000);
            let cityData = {
                "city-name": city.name,
                "city-id": cityIndex,
                "celsius": Math.floor(city.main.temp),
                "fahrenheit": Math.floor(city.main.temp * 9 / 5 + 32),
                "weather-description": city.weather[0].description,
                "weather-icon": city.weather[0].icon,
                "last-update-time": date.getHours() + ':' + date.getMinutes(),
                "last-update-date": weekdayNames[date.getDay()] + ', ' + monthNames[date.getMonth()] + ' ' + date.getDate() + ', ' + date.getFullYear()
            };
            // Pass our data to the template
            var listItemHtml = listItemTemplate(cityData);

            // Add the compiled html to the page
            $(listItemHtml).appendTo(citiesList);
        }
    }

    var _renderComments = function() {
        // Grab the template script
        var theTemplateScript = $("#comment-template").html();

        // Compile the template
        var listItemTemplate = Handlebars.compile(theTemplateScript);

        // For every city
        for (var cityIx = 0; cityIx < cities.length; cityIx += 1) {
            // the current city in the iteration
            var city = cities[cityIx];

            // finding the "city" element in the page that is "equal" to the
            // current city we're iterating on
            var $city = $('.cities').find('.city').eq(cityIx);
            var commentList = $city.find('.comments-list');
            // empty all the comments - from all cities!!!
            commentList.empty();

            // iterate through each comment in our city's comments array
            for (var commentIx = 0; commentIx < city.comments.length; commentIx += 1) {
                // the current comment in the iteration
                var commentData = {
                    "comment-text": city.comments[commentIx].text
                };
                // Pass our data to the template
                var listItemHtml = listItemTemplate(commentData);

                // Add the compiled html to the page
                $(listItemHtml).appendTo(commentList);
            };
        };
    };

    let _getWeatherSuccess = function(data) {
        var cityIx = cities.findIndex(city => city.data.name === data.name);
        if (cityIx !== -1) {
            // Discard previous weather info - only keep latest info
            cities.splice(cityIx, 1);
        }
        // Insert lated city data into array
        cities.unshift({ data: data, comments: [] });

        saveToLocalStorage();
        _renderCityWeatherInfo();
        _renderComments();
    };

    // Get weather info for requested city
    let getWeatherInfo = function(text) {
        if (text == "") {
            $("#error").html("ERROR: City cannot be empty! Please enter a valid city name");
        } else {
            $("#error").html("");
            $.get({
                url: "http://api.openweathermap.org/data/2.5/weather?q=" + text + "&units=metric" + "&APPID=ebd926499f1f8920359ceb4e29afc9eb",
                success: function(data) {
                    _getWeatherSuccess(data);
                },
                error: function(data) {
                    console.log('Error: ' + data);
                }
            });
        }
    };

    // Remove city info from page
    var removeCity = function($clickedCity, cityIndex) {
        cities.splice(cityIndex, 1);
        saveToLocalStorage();

        // removing the info from the page
        $clickedCity.remove();
    };

    // Create a new comment
    var createComment = function(newText, cityIndex) {
        var comment = { text: newText };

        // pushing the comment into the correct city array
        cities[cityIndex].comments.push(comment);
        saveToLocalStorage();

        //render comments
        _renderComments();
    };

    // Remove requested comment
    var removeComment = function($clickedComment, commentIndex, cityIndex) {
        // remove the comment from the comments array on the correct city object
        cities[cityIndex].comments.splice(commentIndex, 1);
        saveToLocalStorage();

        // removing the comment from the page
        $clickedComment.remove();
    };

    //  invoke the render method on app load (uses info from saved queries)
    _renderCityWeatherInfo();
    _renderComments();

    return {
        getWeatherInfo: getWeatherInfo,
        removeCity: removeCity,
        createComment: createComment,
        removeComment: removeComment
    };
};

var app = WeatherChatApp();

// Event Handlers below

$('.get-temp').on('click', function(e) {
    event.preventDefault();
    var text = $('#city-name').val();
    app.getWeatherInfo(text);
});

$('.cities').on('click', '.remove-city', function() {
    var $clickedCity = $(this).closest('.city');
    var index = $clickedCity.index();

    app.removeCity($clickedCity, index);
});

$('.cities').on('click', '.add-comment', function() {
    var text = $(this).closest('.add-comments-container').find('.comment-text').val();
    // finding the index of the city in the page... will use it in #createComment
    var cityIndex = $(this).closest('.city').index();

    app.createComment(text, cityIndex);
});

$('.cities').on('click', '.remove-comment', function() {
    // the comment element that we're wanting to remove
    var $clickedComment = $(this).closest('.comment');
    // index of the comment element on the page
    var commentIndex = $clickedComment.index();
    // index of the post in the posts div that the comment belongs to
    var cityIndex = $clickedComment.closest('.city').index();

    app.removeComment($clickedComment, commentIndex, cityIndex);
});

$('.cities').on('click', '.toggle-comments', function() {
    var clickedCity = $(this).closest('.city');
    clickedCity.find('.comments-container').toggleClass('show');
    clickedCity.find('.add-comments-container').toggleClass('show');

    // $(clickedCity).find('.toggle-comments').text(function(_, existingText) {
    var toggleBtn = $(clickedCity).find('.toggle-comments')[0];
    if ($(toggleBtn).text() === "  Show Comments") {
        $(toggleBtn).text("  Hide Comments");
        $(toggleBtn).removeClass("fa-toggle-down");
        $(toggleBtn).addClass("fa-toggle-up");
    } else {
        $(toggleBtn).text("  Show Comments");
        $(toggleBtn).removeClass("fa-toggle-up");
        $(toggleBtn).addClass("fa-toggle-down");
    }
});

//