A simple, lightweight jQuery plugin for searching youtube videos from your website.

## Installation

Include script *after* the jQuery library (unless you are packaging scripts somehow else):

```html
<script src="/path/to/jquery.ysearch.js"></script>
```

## Usage

Create input field
```html
<input type="text" id="my_youtube_search" />
```

```javascript
$('#my_youtube_search').youtubeSearch();
```

Default options are:
```javascript
$.fn.youtubeSearch.defaults = {
	// HOW MANY ROWS SHOULD WE RETURN
	rows: 10,
	// HOW MANY SYMBOLS INPUT HAS TO HOLD BEFORE WE PERFORM A SEARCH
	min: 3,
	// CALLBACK - When we have received list of videos
	// Argument[0] = rows array
	done : function(){},
	// CALLBACK - When we receive a Ajax / Internal error
	error : function(){},
	// CALLBACK - Triggers informing that we're about to send request
	// Argument[0] - jQuery(element)
	// Argument[1] - search query
	beforeSearch : function(){}
};
```

You may override defaults by passing your arguments when assigning plugin
```javascript
$('#my_youtube_search').youtubeSearch({
	min : 5,
	rows: 3,
	done : function(rows){
		console.log('Got '+rows.length+' rows!');
	}
});
```

## Response Object

```javascript
response_row = {
	title : 'Youtube video title',
	description : 'description',
	links : {
		main : 'url to browser version of video viewing page',
		mobile : 'url to mobile version of video viewing page',
		atom : {
			self : 'url to atom version of video',
			related : 'url to atom version of videos related content'
		}
	},
	author : {
		name : 'Author name',
		url : 'url to author channel page'
	},
	meta : {
		comments : 0, // counter
		favourited : 0, // counter
		rating : 0, // decimal 0-5
		views : 0, // counter
		time: '00:00' // can be with hours as well 02:42:31
	},
	thumbnail : 'url to main video thumbnail 480x360'
};
```

## Authors

[Edgars Kohs](https://github.com/edgarskohs)