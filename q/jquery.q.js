/**
 * 基于于jquery开发的读取url查询参数
 * 根据给定的key去查询给定的URL
 * 示例url:http://www.xxx.com/?foo=bar&age=20
 * $.q("foo"); //返回 bar
 * $.q(); // 返回[{foo:"bar"},{age:"20"}]
 * $.q('foo',"http://www.abc.com/?foo=bar");//返回bar
 * @param  {[key],[target]} $ [key] 键名, [target]值名
 * @return {[type]}   [description]
 */
(function($) {
	$.q = function(key,target) {//key:键的名字,target:目标网址的名字
		if(typeof target == 'undefined') {
			target = window.location.search; //默认目标网址为当前页面网址
		}

		if(typeof key =="undefined") {
			var query = target.substr(1,window.location.search.length-1).split('&');
			var data = [];
			for (var i = 0; i < query.length;i++) {
				var params = query[i].split('=');
				data.push({
					key:params[0], //键
					data:decodeURIComponent(params[1]) //值
				});
			}

			return data;
		}
		else {
			//获取指定key
			try {
				var regex = new RegExp(key+='([^&]+)?');
				return decodeURIComponent(target.match(regex)[1]);
			}catch(e) {
				return null;
			}
		}
	};
})(jQuery);