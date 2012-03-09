function Player() {

	this.id = 0;
	//玩家的当前坐标
	this.pos = {
		x: 5,
		y: 5
	};
	
	// 玩家的面向
	this.direction = Direction.DOWN;
	// 状态
	this.state = PlayerState.STOP;
	// 速度
	this.speed = 200;	// 每个格子所花的时间(ms)
	// 移动路径
	this.movePath = new Array();
	
	this.imageIndex = 0;
}

/* 
 * ***************
 * 成员函数定义
 * ***************
 */

// 计算玩家的移动路线
Player.prototype.calcMovePath = function(dx, dy) {
	// 清除原先的路径
	this.movePath = new Array();
	var x = this.pos.x;
	var y = this.pos.y;
	while(x < dx){
		this.movePath.push(Direction.RIGHT);
		x ++;
	}
	while(x > dx){
		this.movePath.push(Direction.LEFT);
		x --;
	}
	while(y < dy){
		this.movePath.push(Direction.DOWN);
		y ++;
	}
	while(y > dy){
		this.movePath.push(Direction.UP);
		y --;
	}
		
}
// 计算玩家的下一个动作
Player.prototype.nextAction = function() {
	switch(this.state){
		case PlayerState.MOVE:
			if(this.movePath.length == 0)
			{
				this.state = PlayerState.STOP;
				this.imageIndex = 0;
			}
			else
				this.direction = this.movePath.shift();
			break;
		case PlayerState.STOP:
			if(this.movePath.length != 0){
				this.state = PlayerState.MOVE;
				this.direction = this.movePath.shift();
				this.imageIndex = 0;
			}
			break;
		}
		// 根据移动路径修改坐标
		this._nextPos();
		this._nextImageIndex();
}

/*
 * 私有函数
 */
 
Player.prototype._nextImageIndex = function() {
	var indexMax = 0;
	this.imageIndex ++;
	switch(this.state) {
		case PlayerState.DIE: 
			indexMax = 4;
			break;
		default :
			indexMax = 6;
	}
	if(this.imageIndex == indexMax)
		this.imageIndex = 0;
}

Player.prototype._nextPos = function() {
	if(this.state == PlayerState.MOVE) {
		switch(this.direction){
			case Direction.DOWN :
				this.pos.y += 1;
				break;
			case Direction.UP :
				this.pos.y -= 1;
				break;
			case Direction.LEFT :
				this.pos.x -= 1;
				break;
			case Direction.RIGHT :
				this.pos.x += 1;
				break;
		}
	}
}
