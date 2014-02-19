/*!
 * jQuery Youtube Search Plugin v1.0.0 (alpha)
 * https://github.com/edgarskohs/jquery-ysearch
 *
 * Copyright 2014 Edgars Kohs
 * Released under the MIT license
 */

(function($){

	$.fn.youtubeSearch = function(options){
		var opts = $.extend({}, $.fn.youtubeSearch.defaults, options);
		// register callback id with this element
		$.fn.youtubeSearch.callbacks.push(opts.done);
		this.data('youtube-search-callback-done', $.fn.youtubeSearch.callbacks.length-1);
		$.fn.youtubeSearch.callbacks.push(opts.error);
		this.data('youtube-search-callback-error', $.fn.youtubeSearch.callbacks.length-1);
		$.fn.youtubeSearch.callbacks.push(opts.beforeSearch);
		this.data('youtube-search-callback-beforeSearch', $.fn.youtubeSearch.callbacks.length-1);
		this.data('youtube-search-rows', opts.rows);
		this.data('youtube-search-min', opts.min);

		// unbind any keyup elements
		this.unbind('keyup');

		// bind our function
		this.bind('keyup', function(){
			var v = $(this).val();

			// make sure our minimum is reached
			v = v.replace(/ /g,'').replace(/\n/g,'').replace(/\r/g,'').replace(/\t/g,'');
			if(v.length < $(this).data('youtube-search-min')){ return true; }

			$.fn.youtubeSearch.tmp.last_id = Math.round(new Date().getTime());
			$(this).attr('data-youtube-search-last-id',$.fn.youtubeSearch.tmp.last_id);
			setTimeout(function(){
				if(!$.fn.youtubeSearch.tmp.last_id){ return; }
				var c = $('[data-youtube-search-last-id="'+$.fn.youtubeSearch.tmp.last_id+'"]');
				if(!$(c).size()){ return; }
				$(c).removeAttr('data-youtube-search-last-id');
				$(c).youtubeSearch_exec();
			}, 700);
		});

	};

	$.fn.youtubeSearch.defaults = {
		rows: 10, // rows to return
		min: 3, // minimum count of symbols to execute a search
		done : function(){},
		error : function(){},
		beforeSearch : function(){}
	};

	$.fn.youtubeSearch.callbacks = [];
	$.fn.youtubeSearch.tmp = {active:false};

	$.fn.youtubeSearch_exec = function(){
		var search_query = $(this).val();

		callback_id = $(this).data('youtube-search-callback-beforeSearch');
		if(!callback_id){ return; }
		if(!$.fn.youtubeSearch.callbacks[callback_id]){ return; }
		$.fn.youtubeSearch.callbacks[callback_id]($(this), search_query);
		$.fn.youtubeSearch.tmp.active = $(this);

		$.ajax({
			url: 'http://gdata.youtube.com/feeds/mobile/videos?alt=json-in-script&q='+search_query,
			dataType: 'jsonp',
			success: function(data){

				// prepare variables
				var rows = [],current_row,row_template = {
					title : null,
					description : null,
					links : {
						main : null,
						mobile : null,
						atom : {
							self : null,
							related : null
						}
					},
					author : {
						name : null,
						url : null
					},
					meta : {
						comments : 0,
						favourited : 0,
						rating : 0,
						views : 0,
						time: '00:00'
					},
					thumbnail : null
				}, that = $.fn.youtubeSearch.tmp.active;

				// go trough rows
				for(var i = 0; i < data.feed.entry.length; i++){
					if(parseInt($(that).data('youtube-search-rows')) <= i){ break; }
					c = data.feed.entry[i];
					current_row = row_template;

					if(c.author && c.author[0] && c.author[0].name){
						current_row.author.name = c.author[0].name.$t;
					}
					if(c.author && c.author[0] && c.author[0].uri){
						current_row.author.url = c.author[0].uri.$t;
					}
					if(c.link && c.link[0]){
						current_row.links.main = c.link[0].href;
					}
					if(c.link && c.link[2]){
						current_row.links.mobile = c.link[2].href;
					}
					if(c.link && c.link[1]){
						current_row.links.atom.related = c.link[1].href;
					}
					if(c.link && c.link[3]){
						current_row.links.atom.self = c.link[3].href;
					}
					if(c.title){
						current_row.title = c.title.$t;
					}
					if(c.media$group && c.media$group.media$description){
						current_row.description = c.media$group.media$description.$t;
					}
					if(c.media$group && c.media$group.media$thumbnail && c.media$group.media$thumbnail[0]){
						current_row.thumbnail = c.media$group.media$thumbnail[0].url;
					}
					if(c.gd$rating){
						current_row.meta.rating = c.gd$rating.average;
					}
					if(c.gd$comments && c.gd$comments.gd$feedLink){
						current_row.meta.comments = c.gd$comments.gd$feedLink.countHint;
					}
					if(c.yt$statistics){
						current_row.meta.views = c.yt$statistics.viewCount;
						current_row.meta.favourited = c.yt$statistics.favoriteCount;
					}
					if(c.media$group && c.media$group.yt$duration && c.media$group.yt$duration.seconds){
						hours = minutes = seconds = 0;
						t = parseInt(data.feed.entry[i].media$group.yt$duration.seconds);
						if(t < 60){ seconds = t; }
						else{
							hours = parseInt(t/3600)%24;
							minutes = parseInt(t/60)%60;
							seconds = parseInt(t%60);
						}
						current_row.meta.time = (hours?(hours<10?'0'+hours:hours)+':':'')+(minutes<10?'0'+minutes:minutes)+':'+(seconds<10?'0'+seconds:seconds);
					}
					rows.push(current_row);
				}

				if(!$(that).size()){ return; }
				callback_id = $(that).data('youtube-search-callback-done');
				if(!$.fn.youtubeSearch.callbacks[callback_id]){ return; }
				$.fn.youtubeSearch.callbacks[callback_id](rows);
				$.fn.youtubeSearch.tmp.active = false;
			},error: function(){
				c = $.fn.youtubeSearch.tmp.active;
				if(!$(c).size()){ return; }
				callback_id = $(c).data('youtube-search-callback-error');
				if(!$.fn.youtubeSearch.callbacks[callback_id]){ return; }
				$.fn.youtubeSearch.callbacks[callback_id]('There was an error loading results from YouTube');
				$.fn.youtubeSearch.tmp.active = false;
			},
			ajaxError: function(){
				c = $.fn.youtubeSearch.tmp.active;
				if(!$(c).size()){ return; }
				callback_id = $(c).data('youtube-search-callback-error');
				if(!$.fn.youtubeSearch.callbacks[callback_id]){ return; }
				$.fn.youtubeSearch.callbacks[callback_id]('There was an error loading results from YouTube');
				$.fn.youtubeSearch.tmp.active = false;
			}
		});
	};

}( jQuery ));