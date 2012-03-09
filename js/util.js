var loader = new PxLoader(); 
var Direction = {
	DOWN: 0,
	RIGHT_DOWN: 1,
	RIGHT: 2,
	RIGHT_UP: 3,
	UP: 4,
	LEFT_UP: 5,
	LEFT: 6,
	LEFT_DOWN: 7
};

var PlayerState = {
	STOP: 0,
	MOVE: 1,
	DIE: 2
};

//地图格子的大小
var grid = {
	width : 40,
	height: 40
};

function drawImage(ctx, Image, x, y, opposite){
	//将坐标转化成图片的左上角
	x = Math.ceil(x - Image.width / 2) + grid.width/2;
	y = Math.ceil(y - Image.height) + grid.height/2;
	if(opposite){
		for(var i = Image.width - 1; i >= 0 ; i--)
		{
			ctx.drawImage(Image, i, 0, 1, Image.height, x, y, 1, Image.height);
			x ++;
		}
	}else{
		ctx.drawImage(Image, x, y);
	}
}

