//构造方法
function echarts_ext(charts) {
	this.charts = charts;
};

// 图表初始化
echarts_ext.init = function(id) {
	var echarts_p = echarts.init(document.getElementById(id));
	var echarts_ext_x = new echarts_ext(echarts_p);
	return echarts_ext_x;
};

// 公共方法
echarts_ext.prototype.setOption = function(title, arg, type, idea) {
	this.charts.showLoading({
		text : 'loading',
		effect : 'spin',
		textStyle : {
			fontSize : 20
		}
	});
	if (type == '圆形') {
		type = 'pie';
	} else if (type == '柱形') {
		type = 'bar';
	} else if (type == '线形') {
		type = 'line';
	} else {
		type = type;
	}
	if (idea = 'json') {
		var option;
		if (type == 'pie') {
			option = {
				title : {
					text : title,
				},
				tooltip : {
					trigger : 'item',
					formatter : "{b} : {c} ({d}%)"
				},
				series : [ {
					type : type,
					radius : '70%',
					center : [ '50%', '50%' ],
					itemStyle : {
						normal : {
							label : {
								formatter : "{b} : {c} ({d}%)"
							}
						}
					},
					data : arg
				} ]
			};
		} else if (type == 'bar') {
			option = {
				title : {
					text : title
				},
				tooltip : {
					trigger : 'item'
				},
				xAxis : [ {
					type : 'category',
					data : arg.category
				} ],
				yAxis : [ {
					type : 'value',
					splitArea : {
						show : true
					}
				} ],
				series : []
			};
			for ( var d1 in arg.data) {
				option.series.push({
					name : arg.data[d1].name, // 系列名称
					type : type, // 图表类型，折线图line、散点图scatter、柱状图bar、饼图pie、雷达图radar
					data : arg.data[d1].value
				});
			}
		} else if (type = 'line') {
			option = {
				title : {
					text : title
				},
				tooltip : {
					trigger : 'item'
				},
				xAxis : [ {
					type : 'category',
					data : arg.category
				} ],
				yAxis : [ {
					type : 'value',
					axisLabel : {
						formatter : '{value} '
					}
				} ],
				series : []
			};
			for ( var d1 in arg.data) {
				option.series.push({
					name : arg.data[d1].name, // 系列名称
					type : type, // 图表类型，折线图line、散点图scatter、柱状图bar、饼图pie、雷达图radar
					data : arg.data[d1].value
				});
			}
		}
		this.charts.setOption(option);
		this.charts.hideLoading();
	};
};