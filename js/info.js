chrome.runtime.sendMessage({action: 'list'});
chrome.runtime.onMessage.addListener(
	function(request, sender, sendResponse){
		if(request.b_list){
			var table = showlist(request.b_list);
			document.getElementById('list').innerHTML = table;
		}
	}
);

function showlist(list){
	if(!list.length){
		return '<h2>播放列表为空。</h2>'
	}
	var table = '<table><thead><tr><th>歌名</th><th>歌手</th><th>专辑</th><th>下载地址</th></tr></thead><tbody>';
	for(var i in list){
		table += '<tr>';
		table += '<td>'+list[i].name+'</td>';
		table += '<td>'+list[i].artists[0].name+'</td>';
		table += '<td>'+list[i].album.name+'</td>';
		table += '<td><a href="'+list[i].mp3Url+'" target="_blank">'+list[i].mp3Url+'</a></td>';
		table += '</tr>';
	}
	table += '</tbody><table>';
	return table;
}