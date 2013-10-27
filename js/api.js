var api = {
	httpRequest: function(method, action, query, urlencoded, callback, timeout){
		var url = "GET" == method ? (query ? action+"?"+query : action) : action;
		var timecounter;

		if(this.debug){
			this.outputDebug("httpRequest: method("+method+") action("+action+") query("+query+") urlencoded("+(urlencoded?1:0)+")");
		}

		var xhr = new XMLHttpRequest();
		xhr.open(method, url, true);
		if("POST" == method && urlencoded){
			xhr.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
		}
		xhr.onreadystatechange = function() {
		  if (xhr.readyState == 4) {
		  	if(timecounter){
		  		clearTimeout(timecounter);
		  	}
		  	if(this.debug){
		  		this.outputDebug(xhr.responseText);
		  	}
		  	if(callback){
		    	callback(xhr.responseText);
		    }
		  }
		}
		xhr.addEventListener('error', function(){callback(-1)}, false);
		xhr.addEventListener('abort', function(){callback(-2)}, false);
		if("POST" == method && query){
			xhr.send(query);
		}
		else{
			xhr.send();
		}
		if(timeout){
			timecounter = setTimeout(function(){
				if(xhr.readyState != 4){
					xhr.abort();
				}
			}, timeout);
		}
	},
	new: function(offset, limit){
		offset = offset?offser:0;
		limit = limit?limit:20;
		var url = 'http://music.163.com/api/album/new?area=ALL&offset='+offset+'&total=true&limit='+limit;
		this.httpRequest('GET', url, null, false, function(result){
			if(result == -1){
				showMsg('请求错误，请稍后重试。');
			}
			else if(result == -2){
				showMsg('请求超时，请稍后重试。');
			}
			else{
				ui.new(JSON.parse(result));
			}
		}, 5000);
	},
	rank: function(order, offset, limit){
		order = order?order:'hot';
		offset = offset?offser:0;
		limit = limit?limit:20;
		var url = 'http://music.163.com/api/playlist/list?cat=%E6%A6%9C%E5%8D%95&order='+order+'&offset='+offset+'&total='+(offset?'false':'true')+'&limit='+limit;
		this.httpRequest('GET', url, null, false, function(result){
			if(result == -1){
				showMsg('请求错误，请稍后重试。');
			}
			else if(result == -2){
				showMsg('请求超时，请稍后重试。');
			}
			else{
				ui.rank(JSON.parse(result));
			}
		}, 5000);
	},
	list: function(order, offset, limit){
		order = order?order:'hot';
		offset = offset?offser:0;
		limit = limit?limit:20;
		var url = 'http://music.163.com/api/playlist/list?cat=%E5%85%A8%E9%83%A8&order='+order+'&offset='+offset+'&total='+(offset?'false':'true')+'&limit='+limit;
		this.httpRequest('GET', url, null, false, function(result){
			if(result == -1){
				showMsg('请求错误，请稍后重试。');
			}
			else if(result == -2){
				showMsg('请求超时，请稍后重试。');
			}
			else{
				ui.list(JSON.parse(result));
			}
		}, 5000);
	},
	topsinger: function(offset, limit){
		offset = offset?offser:0;
		limit = limit?limit:20;
		var url = 'http://music.163.com/api/artist/top?offset='+offset+'&total=false&limit='+limit+'&csrf_token=';
		this.httpRequest('GET', url, null, false, function(result){
			if(result == -1){
				showMsg('请求错误，请稍后重试。');
			}
			else if(result == -2){
				showMsg('请求超时，请稍后重试。');
			}
			else{
				ui.topsinger(JSON.parse(result));
			}
		}, 5000);
	},
	singer: function(id){
		var url = 'http://music.163.com/artist?id='+id;
		this.httpRequest('GET', url, null, false, function(result){
			if(result == -1){
				showMsg('请求错误，请稍后重试。');
			}
			else if(result == -2){
				showMsg('请求超时，请稍后重试。');
			}
			else{
				result = result.split('g_hotsongs = ')[1].split(';</script>')[0];
				ui.singer(JSON.parse(result));
			}
		}, 5000);
	},
	album: function(id){
		var url = 'http://music.163.com/album?id='+id;
		this.httpRequest('GET', url, null, false, function(result){
			if(result == -1){
				showMsg('请求错误，请稍后重试。');
			}
			else if(result == -2){
				showMsg('请求超时，请稍后重试。');
			}
			else{
				var reg = /song\?id=([0-9]+)/ig;
				var ids = new Array();
				while(subs = reg.exec(result)){
					ids.push(subs[1]);
				}
				api.song(ids);
			}
		}, 5000);
	},
	search: function(s){
		var url = 'http://music.163.com/api/search/suggest/web?csrf_token=';
		this.httpRequest('POST', url, 's='+s+'&limit=8', true, function(result){
			if(result == -1){
				showMsg('请求错误，请稍后重试。');
			}
			else if(result == -2){
				showMsg('请求超时，请稍后重试。');
			}
			else{
				ui.search(JSON.parse(result));
			}
		}, 5000);
	},
	song: function(ids, play, offset, songs){
		if(!offset){
			offset = 0;
		}
		if(!songs){
			songs = new Array();
		}
		var tmpids = new Array();
		for(var i=0; i<100 && i+offset<ids.length; i++){
			tmpids.push(ids[i+offset]);
		}
		var url = 'http://music.163.com/api/song/detail?ids=['+tmpids.join(',')+']';
		this.httpRequest('GET', url, null, false, function(result){
			if(result == -1){
				showMsg('请求错误，请稍后重试。');
			}
			else if(result == -2){
				showMsg('请求超时，请稍后重试。');
			}
			else{
				result = JSON.parse(result);
				songs = songs.concat(result.songs);
			}
			if(offset+100<ids.length){
				api.song(ids, play, offset+100, songs);
			}
			else{
				ui.song(songs, play);
			}
		}, 5000);
	},
	list_detail: function(id){
		var url = 'http://music.163.com/api/playlist/detail?id='+id;
		this.httpRequest('GET', url, null, false, function(result){
			if(result == -1){
				showMsg('请求错误，请稍后重试。');
			}
			else if(result == -2){
				showMsg('请求超时，请稍后重试。');
			}
			else{
				ui.list_detail(JSON.parse(result));
			}
		}, 5000);
	}
};

var ui = {
	new: function(result){
		var mainbg = document.createElement('div');
		mainbg.id = 'mainbg';
		document.getElementById('main').appendChild(mainbg);
		var albums = result.albums;
		for(var i in albums){
			var albumslink = document.createElement('a');
			albumslink.href = '#album-'+albums[i].id;
			document.getElementById('mainbg').appendChild(albumslink);
			var albumsbox = document.createElement('div');
			albumsbox.className = 'albums';
			albumslink.appendChild(albumsbox);
			var albumssonger = document.createElement('div');
			albumssonger.className = 'songer';
			albumssonger.innerHTML = '<span>'+albums[i].artist.name+'</span>';
			albumsbox.appendChild(albumssonger);
			var albumsname = document.createElement('div');
			albumsname.className = 'name';
			albumsname.innerHTML = '<span>'+albums[i].name+'</span>';
			albumsbox.appendChild(albumsname);
			var albumsimg = document.createElement('img');
			albumsimg.src = albums[i].picUrl+'?param=140y140';
			albumsbox.appendChild(albumsimg);
		}
	},
	rank: function(result){
		var mainbg = document.createElement('div');
		mainbg.id = 'mainbg';
		document.getElementById('main').appendChild(mainbg);
		var playlists = result.playlists;
		for(var i in playlists){
			var listlink = document.createElement('a');
			listlink.href = '#list-'+playlists[i].id;
			document.getElementById('mainbg').appendChild(listlink);
			var listbox = document.createElement('div');
			listbox.className = 'list';
			listlink.appendChild(listbox);
			var listcount = document.createElement('div');
			listcount.className = 'count';
			listcount.innerHTML = '<span>'+playlists[i].playCount+'</span>';
			listbox.appendChild(listcount);
			var listname = document.createElement('div');
			listname.className = 'name';
			listname.innerHTML = '<span>'+playlists[i].name+'</span>';
			listbox.appendChild(listname);
			var listimg = document.createElement('img');
			listimg.src = playlists[i].coverImgUrl+'?param=140y140';
			listbox.appendChild(listimg);
		}
	},
	list: function(result){
		var mainbg = document.createElement('div');
		mainbg.id = 'mainbg';
		document.getElementById('main').appendChild(mainbg);
		var playlists = result.playlists;
		for(var i in playlists){
			var listlink = document.createElement('a');
			listlink.href = '#list-'+playlists[i].id;
			document.getElementById('mainbg').appendChild(listlink);
			var listbox = document.createElement('div');
			listbox.className = 'list';
			listlink.appendChild(listbox);
			var listcount = document.createElement('div');
			listcount.className = 'count';
			listcount.innerHTML = '<span>'+playlists[i].playCount+'</span>';
			listbox.appendChild(listcount);
			var listname = document.createElement('div');
			listname.className = 'name';
			listname.innerHTML = '<span>'+playlists[i].name+'</span>';
			listbox.appendChild(listname);
			var listimg = document.createElement('img');
			listimg.src = playlists[i].coverImgUrl+'?param=140y140';
			listbox.appendChild(listimg);
		}
	},
	topsinger: function(result){
		var mainbg = document.createElement('div');
		mainbg.id = 'mainbg';
		document.getElementById('main').appendChild(mainbg);
		var artists = result.artists;
		for(var i in artists){
			var artistlink = document.createElement('a');
			artistlink.href = '#singer-'+artists[i].id;
			document.getElementById('mainbg').appendChild(artistlink);
			var artistbox = document.createElement('div');
			artistbox.className = 'list';
			artistlink.appendChild(artistbox);
			var artistname = document.createElement('div');
			artistname.className = 'name';
			artistname.innerHTML = '<span>'+artists[i].name+'</span>';
			artistbox.appendChild(artistname);
			var artistimg = document.createElement('img');
			artistimg.src = artists[i].picUrl+'?param=140y140';
			artistbox.appendChild(artistimg);
		}
	},
	singer: function(result){
		var songlist = new Array();
		for(var i in result){
			songlist.push({
				"id": result[i].id,
				"name": result[i].name,
				"url": result[i].mp3Url,
				"time": result[i].duration,
				"album": result[i].album,
				"artists": result[i].artists
			});
		}
		this.song_list(songlist);
	},
	search: function(result){
		result = result.result;
		var artists = result.artists;
		var albums = result.albums;
		var songs = result.songs;
		var playlists = result.playlists;
		var rl = 0;
		if(songs && songs.length){
			rl++;
			var searchlist = document.createElement('div');
			searchlist.className = 'searchlist';
			document.getElementById('main').appendChild(searchlist);
			var icon = document.createElement('div');
			icon.className = 'iconsong';
			icon.innerHTML = '单曲';
			searchlist.appendChild(icon);
			var slist = document.createElement('div');
			slist.className = 'slist';
			searchlist.appendChild(slist);
			for(var i in songs){
				var slistlink = document.createElement('a');
				slistlink.href = '#song-'+songs[i].id;
				slistlink.innerHTML = '<div>'+songs[i].name+' - '+songs[i].artists[0].name+'</div>';
				slist.appendChild(slistlink);
			}
		}
		if(artists && artists.length){
			rl++;
			var searchlist = document.createElement('div');
			searchlist.className = 'searchlist';
			document.getElementById('main').appendChild(searchlist);
			var icon = document.createElement('div');
			icon.className = 'iconsinger';
			icon.innerHTML = '歌手';
			searchlist.appendChild(icon);
			var slist = document.createElement('div');
			slist.className = 'slist';
			searchlist.appendChild(slist);
			for(var i in artists){
				var slistlink = document.createElement('a');
				slistlink.href = '#singer-'+artists[i].id;
				slistlink.innerHTML = '<div>'+artists[i].name+'</div>';
				slist.appendChild(slistlink);
			}
		}
		if(albums && albums.length){
			rl++;
			var searchlist = document.createElement('div');
			searchlist.className = 'searchlist';
			document.getElementById('main').appendChild(searchlist);
			var icon = document.createElement('div');
			icon.className = 'iconalbum';
			icon.innerHTML = '专辑';
			searchlist.appendChild(icon);
			var slist = document.createElement('div');
			slist.className = 'slist';
			searchlist.appendChild(slist);
			for(var i in albums){
				var slistlink = document.createElement('a');
				slistlink.href = '#album-'+albums[i].id;
				slistlink.innerHTML = '<div>'+albums[i].name+' - '+albums[i].artist.name+'</div>';
				slist.appendChild(slistlink);
			}
		}
		if(playlists && playlists.length){
			rl++;
			var searchlist = document.createElement('div');
			searchlist.className = 'searchlist';
			document.getElementById('main').appendChild(searchlist);
			var icon = document.createElement('div');
			icon.className = 'iconlist';
			icon.innerHTML = '歌单';
			searchlist.appendChild(icon);
			var slist = document.createElement('div');
			slist.className = 'slist';
			searchlist.appendChild(slist);
			for(var i in playlists){
				var slistlink = document.createElement('a');
				slistlink.href = '#list-'+playlists[i].id;
				slistlink.innerHTML = '<div>'+playlists[i].name+'</div>';
				slist.appendChild(slistlink);
			}
		}
		if(!rl){
			var noresult = document.createElement('div');
			noresult.className = 'noresult';
			noresult.innerHTML = '啊哦，没找到呀 :-S';
			document.getElementById('main').appendChild(noresult);
		}
	},
	song: function(songs, play){
		var songlist = new Array();
		for(var i in songs){
			songlist.push({
				"id": songs[i].id,
				"name": songs[i].name,
				"url": songs[i].mp3Url,
				"time": songs[i].duration,
				"album": songs[i].album,
				"artists": songs[i].artists
			});
		}
		this.song_list(songlist, play);
	},
	list_detail: function(result){
		var tracks = result.result.tracks;
		var songlist = new Array();
		for(var i in tracks){
			songlist.push({
				"id": tracks[i].id,
				"name": tracks[i].name,
				"url": tracks[i].mp3Url,
				"time": tracks[i].duration,
				"album": tracks[i].album,
				"artists": tracks[i].artists
			});
		}
		this.song_list(songlist);
	},
	song_list: function(songlist, play){
		if(!play){
			var ids = new Array();
			for(var i in songlist){
				ids.push(songlist[i].id);
			}
			var addall = document.createElement('div');
			addall.className = 'addall';
			addall.innerHTML = '将全部音乐加入播放列表';
			addall.onclick = function(){
				showMsg('已全部添加至列表。');
				chrome.runtime.sendMessage({add: ids});
			}
			document.getElementById('main').appendChild(addall);
		}
		else{
			var removeall = document.createElement('div');
			removeall.className = 'removeall';
			removeall.innerHTML = '清空播放列表';
			removeall.onclick = function(){
				this.innerHTML = '再次点击确定清空播放列表';
				this.onclick = function(){
					chrome.runtime.sendMessage({remove: 'all'});
				}
			}
			document.getElementById('main').appendChild(removeall);
		}
		for(var i in songlist){
			var songlistbox = document.createElement('div');
			songlistbox.className = 'songlist';
			document.getElementById('main').appendChild(songlistbox);
			var songlistlink = document.createElement('a');
			songlistlink.href = '#'+(play?'play':'song')+'-'+songlist[i].id;
			songlistlink.className = ((play&&playingid==songlist[i].id)?'songlinkplay':'songlink');
			if(play){
				songlistlink.setAttribute('play', 'true');
			}
			songlistbox.appendChild(songlistlink);
			var songlistsongno = document.createElement('div');
			songlistsongno.className = 'songno';
			songlistsongno.innerHTML = Number(i)+1;
			songlistlink.appendChild(songlistsongno);
			var songlistname = document.createElement('div');
			songlistname.className = 'name';
			songlistname.innerHTML = songlist[i].name;
			songlistlink.appendChild(songlistname);
			var songlistinfo = document.createElement('div');
			songlistinfo.className = 'info';
			songlistinfo.innerHTML = this.format(songlist[i].artists)+' - '+'<a href="#album-'+songlist[i].album.id+'">'+songlist[i].album.name+'</a>';
			songlistlink.appendChild(songlistinfo);
			var songlistremove = document.createElement('a');
			songlistremove.className = 'listrightbtn';
			songlistremove.href = '#'+(play?'remove':'add')+'-'+songlist[i].id;
			songlistlink.appendChild(songlistremove);
		}
	},
	format: function(artists){
		var html = '';
		for(var i in artists){
			html += (i == 0) ? '' : ', ';
			html += '<a href="#singer-' + artists[i].id + '">' + artists[i].name + '</a>';
		}
		return html;
	}
};
