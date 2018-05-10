var WeatherChatApp = function() {
    var STORAGE_ID = 'spacebook';

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

    // render posts to page
    // this function empties the posts div, 
    // then adds each post them from the posts array 
    // along with the appropriate HTML
    var _renderCityWeatherInfo = function(isNewCity) {
        // variable for storing our posts div
        var citiesList = $('.cities');
        citiesList.empty();

        // Grab the template script
        var theTemplateScript = $("#list-item-template").html();

        // Compile the template
        var listItemTemplate = Handlebars.compile(theTemplateScript);

        for (let cityIndex = 0; cityIndex < cities.length; cityIndex++) {
            // Create a single item in the list
            var city = cities[cityIndex].data;
            var date = new Date(city.dt * 1000);
            console.log("date: " + date);
            let cityData = {
                    "city-name": city.name,
                    "celsius": Math.floor(city.main.temp),
                    "fahrenheit": Math.floor(city.main.temp * 9 / 5 + 32),
                    "last-update-time": date.getHours() + ':' + date.getMinutes(),
                    "last-update-date": weekdayNames[date.getDay()] + ', ' + monthNames[date.getMonth() - 1] + ' ' + date.getDate() + ', ' + date.getFullYear()
                }
                // Pass our data to the template
            var listItemHtml = listItemTemplate(cityData);

            // Add the compiled html to the page
            $(listItemHtml).appendTo(citiesList);
        }

        // var commentsContainer = '<div class="comments-container">' + '<ul class=comments-list></ul>' +
        //     '<input type="text" class="comment-name">' +
        //     '<button class="btn btn-sm btn-primary add-comment">Post Comment</button> </div>';
        // var weatherData = ""

        // $cities.append('<li class="city">' +
        //     '<a href="#" class="show-comments">Toggle Comments </a> ' +
        //     city.text + '<button class="btn btn-danger btn-sm remove">Remove Post</button> ' + commentsContainer + '</li>');
    }

    var _renderComments = function() {
        //empty all the comments - from all cities!!!
        $('.comments-list').empty();

        for (var i = 0; i < cities.length; i += 1) {
            // the current city in the iteration
            var city = cities[i];

            // finding the "city" element in the page that is "equal" to the
            // current city we're iterating on
            var $city = $('.cities').find('.city').eq(i);

            // iterate through each comment in our city's comments array
            for (var j = 0; j < city.comments.length; j += 1) {
                // the current comment in the iteration
                var comment = city.comments[j];

                // append the comment to the post we wanted to comment on
                $city.find('.comments-list').append(
                    '<li class="comment">' + comment.text +
                    '<button class="btn btn-danger btn-sm remove-comment">Remove Comment</button>' +
                    '</li>'
                );
            };
        };
    };

    let _getWeatherSuccess = function(data) {
        cities.unshift({ data: data, comments: [] });
        saveToLocalStorage();
        _renderCityWeatherInfo();
        _renderComments();
    };

    // build a single city object and push it to array
    let getWeatherInfo = function(text) {
        if (text == "") {
            $("#error").html("City cannot be empty");
        } else {
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

    var removeCity = function($clickedCity, cityIndex) {
        cities.splice(cityIndex, 1);
        saveToLocalStorage();

        // removing the post from the page
        $clickedCity.remove();
    };

    var createComment = function(text, cityIndex) {
        var comment = { text: text };

        // pushing the comment into the correct city array
        cities[cityIndex].comments.push(comment);
        saveToLocalStorage();

        //render comments
        _renderComments();
    };

    var removeComment = function($clickedComment, commentIndex, cityIndex) {
        // remove the comment from the comments array on the correct city object
        cities[cityIndex].comments.splice(commentIndex, 1);
        saveToLocalStorage();

        // removing the comment from the page
        $clickedComment.remove();
    };

    //  invoke the render method on app load
    _renderCityWeatherInfo(false);
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
    var text = $('#city-name').val();
    app.getWeatherInfo(text);
});

$('.cities').on('click', '.remove', function() {
    var $clickedCity = $(this).closest('.city');
    var index = $clickedCity.index();

    app.removeCity($clickedCity, index);
});

$('.cities').on('click', '.add-comment', function() {
    var text = $(this).siblings('.comment-name').val();
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

$('.cities').on('click', '.show-comments', function() {
    var $clickedCity = $(this).closest('.city');
    $clickedCity.find('.comments-container').toggleClass('show');
});