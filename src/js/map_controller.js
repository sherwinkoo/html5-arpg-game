function mapClass(mapId) {
	// 地图的单位是像素
	// 地图的大小
	this.mapId = mapId;
	this.width = 95.5;
	this.height = 67.5;
	
	this.left = 0;
	this.up = 0;
	
	// 主玩家的位置
	this.pos = {
		x: 0,
		y: 0
	};

	// 视野大小
	this.sight = {
		width: 15,
		height: 7.5
	};
	
	/*
	 * 地图显示相关
	 * 以像素为单位
	 */
	// 地图图片资源的大小
	this.quad = {
		width: 300,
		height: 300
	};

	this.images = new Array();
	this.ctx = getMapContext();
}

// 加载地图图像资源
mapClass.prototype.loadResource = function(loader) {
	var baseName = "img/" + this.mapId.toString() + "/";
	var xCount = Math.ceil((this.width * grid.width ) / this.quad.width);
	var yCount = Math.ceil((this.height * grid.width) / this.quad.height);
	for(var i = 0; i < xCount; i++) {
		this.images[i] = new Array();
		for(var j = 0; j < yCount; j++) {
			var imgName = baseName + j.toString() + "_" + i.toString() + ".jpg";
			this.images[i][j] = loader.addImage(imgName);
		}
	}
}

// 显示地图
mapClass.prototype.show = function() {
	var leftMax = this.width - this.sight.width * 2;
	var upMax = this.height - this.sight.height * 2;
	this.left = Math.max(0, this.pos.x - this.sight.width);
	this.left = Math.floor(Math.min(this.left, leftMax));
	this.up = Math.max(0, this.pos.y - this.sight.height);
	this.up = Math.floor(Math.min(this.up, upMax));
	var right = Math.floor(this.left + this.sight.width * 2);
	var down = Math.floor(this.up + this.sight.height * 2);
	
	//计算图片的索引
	var xStart = Math.floor((this.left * grid.width) / this.quad.width);
	var xEnd = Math.floor((right * grid.width) / this.quad.width);
	var yStart = Math.floor((this.up * grid.height) / this.quad.height);
	var yEnd = Math.floor((down * grid.height) / this.quad.height);
	
	//描绘地图
	var sWidth, sHeight;
	var flipx = (this.left * grid.width) % this.quad.width;
	var flipy = (this.up * grid.height) % this.quad.height;
	for(var i = xStart, x = 0; i <= xEnd; i++, x += sWidth){
		for(var j = yStart, y = 0; j <= yEnd; j++, y += sHeight){
			//计算图片切割位置
			var sx = 0;
			var sy = 0;
			if(i == xStart)	sx = flipx;
			if(j == yStart)	sy = flipy;
			sWidth = this.quad.width - sx, sHeight = this.quad.height - sy;
			this.ctx.drawImage(this.images[i][j], sx, sy, sWidth, sHeight, x, y, sWidth, sHeight);
		}
	}
}

// 地图移动
// offsetX,offsetY 分别表示离视图左上点的偏移
// return 地图的左上点的坐标变化值
mapClass.prototype.moveTo = function(newPos) {
	if(newPos != this.pos) {
		this.pos.x = newPos.x;
		this.pos.y = newPos.y;
		this.show();
	}
}

// 将鼠标点击的像素偏移转化为地图的绝对坐标
mapClass.prototype.offset2pos = function(offsetX, offsetY) {
	// 偏移的格子数
	var gridX = Math.floor(offsetX / grid.width) + this.left;
	var gridY = Math.floor(offsetY / grid.height) + this.up;
	return {x: gridX, y: gridY};
}

function getMapContext()
{
	var canvas = document.getElementById("game_map");
    var ctx = 0;
	if (canvas.getContext) {
		ctx = canvas.getContext("2d");
	}
	return ctx;
}

/* 
 * ********************
 *	地图调试辅助函数
 * ********************
 */

function drawGrid() {
	var ctx = document.getElementById("debug_canvas").getContext("2d");
	ctx.strokeStyle = "rgb(255,0,0)";
	ctx. setLineWidth(2);
	ctx.beginPath();
	for(var i = 0; i < 600; i += grid.height) {
		ctx.moveTo(0,i);
		ctx.lineTo(1200,i);
	}
	ctx.stroke();

	ctx.beginPath();
	for(var i = 0; i < 1200; i += grid.width) {
		ctx.moveTo(i, 0);
		ctx.lineTo(i, 600);
	}
	ctx.stroke();
}
