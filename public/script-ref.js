var WeatherChatApp = function() {
    var STORAGE_ID = 'spacebook';

    var saveToLocalStorage = function() {
        localStorage.setItem(STORAGE_ID, JSON.stringify(posts));
    }

    var getFromLocalStorage = function() {
        return JSON.parse(localStorage.getItem(STORAGE_ID) || '[]');
    }

    var cities = getFromLocalStorage();

    // render posts to page
    // this function empties the posts div, 
    // then adds each post them from the posts array 
    // along with the appropriate HTML
    var _renderCityWeatherInfo = function() {
        // variable for storing our posts div
        var $posts = $('.posts');

        $posts.empty();

        for (var i = 0; i < cities.length; i += 1) {
            var city = cities[i];
            var commentsContainer = '<div class="comments-container">' + '<ul class=comments-list></ul>' +
                '<input type="text" class="comment-name">' +
                '<button class="btn btn-sm btn-primary add-comment">Post Comment</button> </div>';

            $posts.append('<li class="post">' +
                '<a href="#" class="show-comments">Toggle Comments </a> ' +
                post.text + '<button class="btn btn-danger btn-sm remove">Remove Post</button> ' + commentsContainer + '</li>');
        }
    }

    var _renderComments = function() {
        //empty all the comments - from all posts!!!
        $('.comments-list').empty();

        for (var i = 0; i < cities.length; i += 1) {
            // the current post in the iteration
            var post = cities[i];

            // finding the "post" element in the page that is "equal" to the
            // current post we're iterating on
            var $post = $('.posts').find('.post').eq(i);

            // iterate through each comment in our post's comments array
            for (var j = 0; j < post.comments.length; j += 1) {
                // the current comment in the iteration
                var comment = post.comments[j];

                // append the comment to the post we wanted to comment on
                $post.find('.comments-list').append(
                    '<li class="comment">' + comment.text +
                    '<button class="btn btn-danger btn-sm remove-comment">Remove Comment</button>' +
                    '</li>'
                );
            };
        };
    };

    /*
    {"coord":
    {"lon":145.77,"lat":-16.92},
    "weather":[{"id":803,"main":"Clouds","description":"broken clouds","icon":"04n"}],
    "base":"cmc stations",
    "main":{"temp":293.25,"pressure":1019,"humidity":83,"temp_min":289.82,"temp_max":295.37},
    "wind":{"speed":5.1,"deg":150},
    "clouds":{"all":75},
    "rain":{"3h":3},
    "dt":1435658272,
    "sys":{"type":1,"id":8166,"message":0.0166,"country":"AU","sunrise":1435610796,"sunset":1435650870},
    "id":2172797,
    "name":"Cairns",
    "cod":200}

    Parameters:
    coord
    coord.lon City geo location, longitude
    coord.lat City geo location, latitude
    weather (more info Weather condition codes)
    weather.id Weather condition id
    weather.main Group of weather parameters (Rain, Snow, Extreme etc.)
    weather.description Weather condition within the group
    weather.icon Weather icon id
    base Internal parameter
    main
    main.temp Temperature. Unit Default: Kelvin, Metric: Celsius, Imperial: Fahrenheit.
    main.pressure Atmospheric pressure (on the sea level, if there is no sea_level or grnd_level data), hPa
    main.humidity Humidity, %
    main.temp_min Minimum temperature at the moment. This is deviation from current temp that is possible for large cities and megalopolises geographically expanded (use these parameter optionally). Unit Default: Kelvin, Metric: Celsius, Imperial: Fahrenheit.
    main.temp_max Maximum temperature at the moment. This is deviation from current temp that is possible for large cities and megalopolises geographically expanded (use these parameter optionally). Unit Default: Kelvin, Metric: Celsius, Imperial: Fahrenheit.
    main.sea_level Atmospheric pressure on the sea level, hPa
    main.grnd_level Atmospheric pressure on the ground level, hPa
    wind
    wind.speed Wind speed. Unit Default: meter/sec, Metric: meter/sec, Imperial: miles/hour.
    wind.deg Wind direction, degrees (meteorological)
    clouds
    clouds.all Cloudiness, %
    rain
    rain.3h Rain volume for the last 3 hours
    snow
    snow.3h Snow volume for the last 3 hours
    dt Time of data calculation, unix, UTC
    sys
    sys.type Internal parameter
    sys.id Internal parameter
    sys.message Internal parameter
    sys.country Country code (GB, JP etc.)
    sys.sunrise Sunrise time, unix, UTC
    sys.sunset Sunset time, unix, UTC
    id City ID
    name City name
    cod Internal parameter
    */

    // build a single post object and push it to array
    var getWeatherInfo = function(text) {
        // posts = getFromLocalStorage();
        $.get('api.openweathermap.org/data/2.5/weather?q=' + text + '&units=metric', {
            success: function(data) {
                cities.push({ text: text, temp: data.main.temp, comments: [] });
            },
            error: function(data) {
                console.log('Error: ' + data);
            }
        });

        saveToLocalStorage();
        _renderCityWeatherInfo();
        _renderComments();
    };

    var removePost = function($clickedPost, index) {
        // posts = getFromLocalStorage();
        cities.splice(index, 1);
        saveToLocalStorage();

        // removing the post from the page
        $clickedPost.remove();
    };

    var createComment = function(text, postIndex) {
        var comment = { text: text };

        // pushing the comment into the correct posts array
        // posts = getFromLocalStorage();
        cities[postIndex].comments.push(comment);
        saveToLocalStorage();

        //render comments
        _renderComments();
    };

    var removeComment = function($clickedComment, commentIndex, postIndex) {
        // remove the comment from the comments array on the correct post object
        // posts = getFromLocalStorage();
        cities[postIndex].comments.splice(commentIndex, 1);
        saveToLocalStorage();

        // removing the comment from the page
        $clickedComment.remove();
    };

    //  invoke the render method on app load
    _renderCityWeatherInfo();
    _renderComments();

    return {
        getWeatherInfo: getWeatherInfo,
        removePost: removePost,
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

$('.posts').on('click', '.remove', function() {
    var $clickedPost = $(this).closest('.post');
    var index = $clickedPost.index();

    app.removePost($clickedPost, index);
});

$('.posts').on('click', '.add-comment', function() {
    var text = $(this).siblings('.comment-name').val();
    // finding the index of the post in the page... will use it in #createComment
    var postIndex = $(this).closest('.post').index();

    app.createComment(text, postIndex);
});

$('.posts').on('click', '.remove-comment', function() {
    // the comment element that we're wanting to remove
    var $clickedComment = $(this).closest('.comment');
    // index of the comment element on the page
    var commentIndex = $clickedComment.index();
    // index of the post in the posts div that the comment belongs to
    var postIndex = $clickedComment.closest('.post').index();

    app.removeComment($clickedComment, commentIndex, postIndex);
});

$('.posts').on('click', '.show-comments', function() {
    var $clickedPost = $(this).closest('.post');
    $clickedPost.find('.comments-container').toggleClass('show');
});