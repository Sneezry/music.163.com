document.body.style.height = '480px';
window.onhashchange = function(){
	action(location.hash.substr(1));
}

var change;
var playingid = 0;
var sound;
var showmsgcount;

document.getElementById('searchbox').onkeydown = function(){
	e = event.keyCode;
	if(e == 13){
		action('search');
		event.returnValue = false;
	}
}

document.getElementById('controlswitch').onclick = function(){
	if(document.getElementById('control').getAttribute('open')){
		document.getElementById('control').removeAttribute('open');
		document.getElementById('control').className = 'ctlclose';
	}
	else{
		document.getElementById('control').setAttribute('open', 'true');
		document.getElementById('control').className = 'ctlopen';
	}
}

document.getElementById('controlstop').onclick = function(){
	document.getElementById('controlplay').setAttribute('pause', 'false');
	chrome.runtime.sendMessage({action: 'stop'});
}

document.getElementById('controlplay').onclick = function(){
	if(!playingid){
		return;
	}
	if(this.getAttribute('pause') == 'true'){
		this.setAttribute('pause', 'false');
		chrome.runtime.sendMessage({action: 'pause'});
	}
	else{
		this.setAttribute('pause', 'true');
		chrome.runtime.sendMessage({action: 'play'});
	}
}

document.getElementById('controlnext').onclick = function(){
	chrome.runtime.sendMessage({action: 'next'});
}

document.getElementById('controlmode').onclick = function(){
	mode = this.getAttribute('mode');
	switch(mode){
		case 'one':{
			this.setAttribute('mode', 'random');
			chrome.runtime.sendMessage({mode: 'random'});
			break;
		}
		case 'random':{
			this.setAttribute('mode', 'all');
			chrome.runtime.sendMessage({mode: 'all'});
			break;
		}
		default :{
			this.setAttribute('mode', 'one');
			chrome.runtime.sendMessage({mode: 'one'});
		}
	}
}

document.getElementById('controlsound').onchange = function(){
	chrome.runtime.sendMessage({sound: this.value});
}

action('playlist');

chrome.runtime.sendMessage({action: 'isplaying'}, function(playing){
	if(playing.playing){
		document.getElementById('controlplay').setAttribute('pause', 'true');
	}
	else{
		document.getElementById('controlplay').setAttribute('pause', 'false');
	}
	document.getElementById('controlmode').setAttribute('mode', playing.mode);
	sound = playing.sound;
	document.getElementById('controlsound').value = sound;
});

chrome.runtime.onMessage.addListener(
	function(request, sender, sendResponse){
		if(request.b_list){
			if(request.b_list.length){
				playingid = request.playingid;
				if(request.b_list.length <= request.p_list){
					api.song(request.p_list, true);
					chrome.runtime.sendMessage({action: 'update'});
				}
				else{
					ui.song(request.b_list, true);
				}
			}
			else{
				document.getElementById('main').innerHTML = '';
				var noresult = document.createElement('div');
				noresult.className = 'noresult';
				noresult.innerHTML = '啊哦，你的播放列表里什么都没有啊 :-S';
				document.getElementById('main').appendChild(noresult);
			}
		}
		else if(request.action == 'playlist'){
			action('playlist');
		}
		else if(request.action == 'playnext'){
			playingid = request.playingid;
			var songlinkplay = document.getElementsByClassName('songlinkplay')[0];
			if(songlinkplay){
				songlinkplay.className = 'songlink';
			}
			var songlinks = document.getElementsByClassName('songlink');
			if(songlinks && songlinks.length){
				for(var i=0; i<songlinks.length; i++){
					if(songlinks[i].hash == '#play-'+playingid && songlinks[i].getAttribute('play') == 'true'){
						songlinks[i].className = 'songlinkplay';
					}
				}
			}
		}
		else if(request.action == 'ended'){
			playingid = 0;
			document.getElementById('controlplay').setAttribute('pause', 'false');
			var songlinkplay = document.getElementsByClassName('songlinkplay')[0];
			if(songlinkplay){
				songlinkplay.className = 'songlink';
			}
		}
});

function action(cmd){
	if(!cmd){
		return;
	}
	if(cmd.substr(0,5) == 'song-'){
		var sid = cmd.substr(5);
		playingid = sid;
		document.getElementById('controlplay').setAttribute('pause', 'true');
		chrome.runtime.sendMessage({song: sid});
		return;
	}
	else if(cmd.substr(0,5) == 'play-'){
		var sid = cmd.substr(5);
		playingid = sid;
		document.getElementById('controlplay').setAttribute('pause', 'true');
		chrome.runtime.sendMessage({play: sid});
		var songlinkplay = document.getElementsByClassName('songlinkplay')[0];
		if(songlinkplay){
			songlinkplay.className = 'songlink';
		}
		var songlinks = document.getElementsByClassName('songlink');
		for(var i=0; i<songlinks.length; i++){
			if(songlinks[i].hash == '#'+cmd){
				songlinks[i].className = 'songlinkplay';
			}
		}
		return;
	}
	else if(cmd.substr(0,7) == 'remove-'){
		var sid = cmd.substr(7);
		chrome.runtime.sendMessage({remove: sid});
		return;
	}
	else if(cmd.substr(0,4) == 'add-'){
		var sid = cmd.substr(4);
		chrome.runtime.sendMessage({add: [sid]});
		showMsg('已添加至列表。');
		return;
	}
	else if(cmd == 'search' && document.getElementById('searchbox').value){
		document.getElementById('main').innerHTML = '';
		api.search(document.getElementById('searchbox').value);
		return;
	}
	document.getElementById('main').className ='slideOut';
	setTimeout(function(){
		document.getElementById('main').innerHTML = '';
		document.getElementById('main').scrollTop = 0;
		document.getElementById('main').className = '';
		document.getElementById('main').style.display = 'none';
		if(cmd == 'new'){
			document.getElementById('new').className = 'select';
			document.getElementById('rank').className = '';
			document.getElementById('list').className = '';
			document.getElementById('singer').className = '';
			api.new(0, 20);
		}
		else if(cmd == 'rank'){
			document.getElementById('new').className = '';
			document.getElementById('rank').className = 'select';
			document.getElementById('list').className = '';
			document.getElementById('singer').className = '';
			api.rank('hot', 0, 20);
		}
		else if(cmd == 'list'){
			document.getElementById('new').className = '';
			document.getElementById('rank').className = '';
			document.getElementById('list').className = 'select';
			document.getElementById('singer').className = '';
			api.list('hot', 0, 20);
		}
		else if(cmd == 'singer'){
			document.getElementById('new').className = '';
			document.getElementById('rank').className = '';
			document.getElementById('list').className = '';
			document.getElementById('singer').className = 'select';
			api.topsinger(0, 20);
		}
		else if(cmd.substr(0, 5) == 'list-'){
			api.list_detail(cmd.substr(5));
		}
		else if(cmd.substr(0, 7) == 'singer-'){
			api.singer(cmd.substr(7));
		}
		else if(cmd.substr(0, 6) == 'album-'){
			api.album(cmd.substr(6));
		}
		else if(cmd == 'playlist'){
			document.getElementById('new').className = '';
			document.getElementById('rank').className = '';
			document.getElementById('list').className = '';
			document.getElementById('singer').className = '';
			chrome.runtime.sendMessage({action: 'list'});
		}
		else{
			document.getElementById('new').className = '';
			document.getElementById('rank').className = '';
			document.getElementById('list').className = 'select';
			document.getElementById('singer').className = '';
			api.list('hot', 0, 20);
		}
		setTimeout(function(){
			document.getElementById('main').className ='slideIn';
			document.getElementById('main').style.display = 'block';
		},200);
	},200);
}

function showMsg(msg){
	clearTimeout(showmsgcount);
	document.getElementById('msg').innerHTML = msg;
	document.getElementById('msg').className = 'slideIn';
	document.getElementById('msg').style.display = 'block';
	showmsgcount = setTimeout(function(){
		document.getElementById('msg').className = 'slideOut';
		setTimeout(function(){document.getElementById('msg').style.display = 'none';},200);
	}, 3000);
}