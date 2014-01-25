var list = [];
var errs;

chrome.runtime.sendMessage({action: 'list'});
chrome.runtime.onMessage.addListener(
	function(request, sender, sendResponse){
		if(request.b_list){
			list = request.b_list;
			var table = showlist();
			document.getElementById('list').innerHTML = table;
			document.getElementById('checkAll').onclick = checkAll;
			document.getElementById('downloadAll').onclick = downloadAll;
			for(var i=0; i<list.length; i++){
				document.getElementsByName('list')[i].onclick = isCheckAll;
			}
			for(var i=0; i<list.length; i++){
				document.getElementsByName('nmline')[i].onclick = checkThis;
				document.getElementsByName('atline')[i].onclick = checkThis;
				document.getElementsByName('alline')[i].onclick = checkThis;
			}
		}
	}
);

function showlist(){
	if(!list.length){
		return '<h2>播放列表为空。</h2>';
	}
	document.getElementById('downloadAll').style.display = 'block';
	var table = '<table><thead><tr><th><input type="checkbox" id="checkAll" /></th><th>歌名</th><th>歌手</th><th>专辑</th></tr></thead><tbody>';
	for(var i=0; i<list.length; i++){
		table += '<tr>';
		table += '<td><input type="checkbox" name="list" /></td>';
		table += '<td name="nmline" l="'+i+'">'+list[i].name+'</td>';
		table += '<td name="atline" l="'+i+'">'+list[i].artists[0].name+'</td>';
		table += '<td name="alline" l="'+i+'">'+list[i].album.name+'</td>';
		table += '</tr>';
	}
	table += '</tbody><table>';
	return table;
}

function downloadAll(){
	var musicName, musicPath, musicUrl, show=false, count=0;
	var listboxes = document.getElementsByName('list');
	window.errs = 0;
	for(var i=0; i<listboxes.length; i++){
		if(!listboxes[i].checked){
			continue;
		}
		count++;
		musicName = list[i].name.replace(/[\\\/:*?"<>|]/g, '#')+'.mp3';
		musicPath = '163music/';
		musicUrl = list[i].mp3Url;
		chrome.downloads.download({
			'url': musicUrl,
			'filename': musicPath+musicName,
			'conflictAction': 'uniquify',
			'saveAs': false
		}, function(downloadId){
			if(downloadId == undefined) {
				console.log(chrome.runtime.lastError);
				errs++;
				return;
			}
			if(!show){
				show = downloadId;
			}
			console.log(downloadId);
		});
	}
	if(count){
		alert(count + '项下载任务添加完毕，请至下载目录下“163music”文件夹下查看。');
		chrome.downloads.show(show);
	}
	else{
		alert('没有可下载的项目。');
	}
}

function checkAll(){
	var listboxes = document.getElementsByName('list');
	var allchecked = true;
	for(var i=0; i<listboxes.length; i++){
		if(!listboxes[i].checked){
			allchecked = false;
			break;
		}
	}
	for(var i in listboxes){
		listboxes[i].checked = !allchecked;
	}
	document.getElementById('checkAll').indeterminate = false;
}

function isCheckAll(){
	console.log(1);
	var listboxes = document.getElementsByName('list');
	var allchecked = true;
	var indeterminate = false;
	for(var i=0; i<listboxes.length; i++){
		if(!listboxes[i].checked){
			if(i!=0 && allchecked){
				indeterminate = true;
				allchecked = false;
				break;
			}
			else{
				allchecked = false;
			}
		}
		else if(listboxes[i].checked && !allchecked){
			allchecked = false;
			break;
		}
	}
	if(indeterminate){
		document.getElementById('checkAll').indeterminate = true;
		document.getElementById('checkAll').checked = allchecked;
	}
	else{
		document.getElementById('checkAll').indeterminate = false;
		document.getElementById('checkAll').checked = allchecked;
	}
}

function checkThis(){
	console.log(2);
	var checkbox = document.getElementsByName('list')[Number(this.getAttribute('l'))];
	checkbox.checked = !checkbox.checked;
	isCheckAll();
}
