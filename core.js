//game engine
(function(){
	var Engine = function(options) {
		this.init(options);
	}
	var scale = 2;
	var eventObjects = [];
	var p = Engine.prototype;

	p.defaults = {
		scale:2,
	}

	p.canvas = null;

	p.ctx = null;

	p.stage = {};

	p.sprites = [];
	p.texts = [];

	//main loop interval
	p.loopInterval = null;
	//use to caculate FPS
	p.count = 0;
	//the game client height
	p.clientHeight = 0;
	//the game client width
	p.clientWidth = 0;

	p.FPS = null;

	p.assets = [];
	p.loadedCount = 0;

	p.loadProgressText = null;

	//p.scale = scale;
	//event handler object set
	

	//init the game
	p.init = function(options){
		this.defaults = this.merge(this.defaults,options);
		scale = this.defaults.scale;
		this.createCanvas();
		this.addTouchEvent();
	}
	p.merge = function(objA,objB){
		for(var attrname in objB){
			objA[attrname] = objB[attrname];
		}
		return objA;
	}
	//create canvas used to draw game
	p.createCanvas = function(){
		canvas = document.createElement('canvas');
		this.clientWidth = canvas.width = window.innerWidth*this.defaults.scale;
		this.clientHeight = canvas.height = window.innerHeight*this.defaults.scale;

		//alert( window.innerWidth+":"+window.innerHeight);
		document.body.appendChild(canvas);
		this.canvas = canvas;
		if(canvas.getContext){
			this.ctx = canvas.getContext('2d');
		}
		console.log(this.ctx);
	}
	p.addTouchEvent = function(){
		this.canvas.addEventListener('touchstart',this.handleTouchStart);
		this.canvas.addEventListener('touchmove',this.handleTouchMove);
		this.canvas.addEventListener('touchend',this.handleTouchEnd);
	}
	p.handleTouchStart = function(event){
		console.log(event.targetTouches[0].pageX*scale);
		console.log(event.targetTouches[0].pageY*scale);
		var touchX = event.targetTouches[0].pageX*scale;
		var touchY = event.targetTouches[0].pageY*scale;
		for(var index in eventObjects){
			var object = eventObjects[index];
			var target = object.target;
			//console.log('tap');
			if(object.eventType == 'tap'){
				if(p.isPointInRect({x:touchX,y:touchY},target.rect)){
					object.callback();
					break;
				}
			}
		}
	}	
	p.handleTouchMove = function(event){

	}
	p.handleTouchEnd = function(event){

	}
	p.addListener = function(eventType, sprite, callback){
		eventObjects.push({
			eventType:eventType,
			target:sprite,
			callback:callback
		});
		eventObjects.sort(function(a,b){
			if(a.target.z > b.target.z){
				return -1;
			}else if(a.target.z < b.target.z){
				return 1;
			}
			return 0;
		});
		console.log(eventObjects);
	}
	p.removeListener = function(eventType, sprite){
		for(var index in eventObjects){
			var object = eventObjects[index];
			if(object.eventType == eventType&& object.target == sprite){
				eventObjects.splice(index,1);
			}
		}
	}
	p.isPointInRect = function(point,rect){
		if(point.x>rect.x&&point.x<(rect.x+rect.width)&&point.y>rect.y&&point.y<(rect.y+rect.height)){
			return true;
		}
		return false;
	}
	//run the game

	p.run = function(){
		var self = this;
		this.FPS = this.newText('60',30,30,50);
		this.add(this.FPS);

		this.FPS.tap(function(){
			console.log('taped me!');
		});

		this.loadProgressText = this.newText('0%',40,100,300);
		this.loadProgressText.color = '#000';
		this.add(this.loadProgressText);

		this.loopInterval = setInterval(function(){
			///console.log('hhh');
			self.update();
			self.clear();
			self.draw();
			self.calFrameRate();
		},parseFloat(1000)/60);
		var sprites = this.sprites;
	}

	p.destroy = function(){
		clearInterval(this.loopInterval);

	}
	//game main update
	p.update = function(sprites){
		var sprites = sprites || this.sprites;
		for(var index in sprites){
			var sprite = sprites[index];
			sprite.update();
			if(sprite.childs){
				this.update(sprite.childs);
			}
		}
		
	}
	p.draw = function(sprites){

		var sprites = sprites || this.sprites;
		for(var index in sprites){
			var sprite = sprites[index];
			

			if(sprite.type == 'sprite'){
				var x = sprite.position.x;

				var y = sprite.position.y;
				if(sprite.parent){
					var x = sprite.position.x + sprite.parent.position.x;

					var y = sprite.position.y + sprite.parent.position.y;	
				}	

				
				
				if(!sprite.sWidth||!sprite.sHeight||!sprite.dWidth||!sprite.dHeight){
					if(sprite.dWidth&&sprite.dHeight){
						this.ctx.drawImage(sprite.img,x,y,sprite.dWidth,sprite.dHeight);
					}else{
						this.ctx.drawImage(sprite.img,x,y);
					}
				}
				else{
					this.ctx.drawImage(sprite.img,sprite.sx,sprite.sy,sprite.sWidth,sprite.sHeight,x,y,sprite.dWidth,sprite.dHeight);
				}
			}else if(sprite.type == 'text'){
				this.ctx.font = sprite.fontSize+"px serif";
				this.ctx.fillStyle = sprite.color;
				this.drawText(sprite.content,sprite.position.x,sprite.position.y);
			}
			if(sprite.childs){
				//console.log(typeof sprite.childs);
				this.draw(sprite.childs);
			}
		}
	}
	//use to caculate the FPS
	var last = 0;
	p.calFrameRate = function(){
		var now = (new Date()).getMilliseconds();
		if(last){
			var fps = (1000/(now-last)).toFixed(0);
			this.FPS.content = 'FPS:'+fps;
			//this.drawText(FPS, 5, 20);
		}
		last = now;
	}
	//create the sprite
	p.newSprite = function(imgPath,width,height,left,top){
		var game = this;
		function Sprite(imgPath,width,height){
			this.imagePath = imgPath;
			this.dWidth = width;
			this.dHeight = height;
		}
		var p = Sprite.prototype;
		p.imagePath = '';
		p.img = null;
		p.width = 0;
		p.height = 0;
		p.position = {x:0,y:0};
		p.sourcePosition = {x:0,y:0};
		p.sx = 0;
		p.sy = 0;
		p.sWidth = null;
		p.sHeight = null;
		p.dWidth = null;
		p.dHeight = null;
		p.moveAltaY = 0;
		p.moveAltaX = 0;
		p.z = 0;
		p.type = 'sprite';
		p.rect = {
			x:0,
			y:0,
			height:0,
			width:0
		};
		p.childs = null;
		p.parent = null;
		p.moveFinished = null;
		p.move = function(){
			if(this.moveAltaY) this.position.y += this.moveAltaY;
			if(this.moveAltaX) this.position.x += this.moveAltaX;
			if(this.destination){
				if(Math.abs(this.position.x - this.destination.x)<this.moveAltaX){
					this.position.x = this.destination.x;
				}
				if(Math.abs(this.position.y - this.destination.y)<this.moveAltaY){
					this.position.y = this.destination.y;
				}
				if(this.position.x == this.destination.x && this.position.y == this.destination.y){
					this.destination = null;
					this.moveAltaY = 0;
					this.moveAltaX = 0;
					this.moveFinished();
				}

			}
		}
		p.moveTo = function(point,speed,cb){
			this.destination = point;
			var dx = point.x - this.position.x,
			    dy = point.y - this.position.y;
			speed = speed || 1;
			this.moveAltaY = speed * (dy/Math.sqrt(dy*dy+dx*dx));
			this.moveAltaX = speed * (dx/Math.sqrt(dy*dy+dx*dx));
			this.moveFinished = cb;
		}
		p.update = function(){
			this.move();
			var x = 0;
			var y = 0;
			if(this.parent){
				x = this.parent.position.x;
				y = this.parent.position.y;
			}
			this.rect = {
				x:this.position.x + x,
				y:this.position.y + y,
				height:this.dHeight,
				width:this.dWidth
			}
			//console.log(this.position);

		}
		p.add = function(child){
			this.childs = this.childs || [];
			this.childs.push(child);
			this.childs.sort(game.sortFunction);
			child.parent = this;
		}
		p.remove = function(child){
			for(var index in this.childs){
				var _sprite = this.childs[index];
				if(_sprite == child){
					this.childs.splice(index,1);
				}
			}
		}
		p.tap = function(callback){
			game.addListener('tap',this,callback);
		}
		p.onload = function(){}

        var sprite = new Sprite(imgPath,width,height);
        var img = new Image();
        img.src = imgPath;
        sprite.img = img;
        sprite.destination = null;
        sprite.position = {
        	x:left,
        	y:top
        }
        
        if(!height&&width){
        	img.onload = function(){
        		sprite.dHeight = parseInt(parseFloat(width)/(parseFloat(img.width))*img.height);
        		sprite.onload();
        	};
        	//console.log(img.width+':'+img.height);
        }else if(height&&!width){
        	img.onload = function(){
        		sprite.dWidth = parseInt(parseFloat(height)/(parseFloat(img.height))*img.width);
        		sprite.onload();
        	}
        }

        sprite.onload = function(){

        }

        sprite.rect = {
        	x:left,
        	y:top,
        	width:width,
        	height:height
        }
		return sprite; 
	}
	//create the text
	p.newText = function(content,fontSize,left,top){
		var game = this;
		function Text(content,fontSize){
			this.content = content;
			this.fontSize = fontSize;
		}
		var p = Text.prototype;
		p.content = '';
		p.color = '#fff';
		p.position = {x:0,y:0};
		p.type = 'text';
		p.z = 0;
		p.rect = {x:0,y:0,width:0,height:0};
		p.length = 0;
		p.update = function(){
			this.length = this.content.length;
			this.rect = {
				x:this.position.x,
				y:this.position.y - this.fontSize,
				width:game.ctx.measureText(this.content).width,
				height:fontSize
			}
		};
		p.tap = function(callback){
			game.addListener('tap',this,callback);
		}
        var text = new Text(content,fontSize);
        text.position = {
        	x:left,
        	y:top
        }
        text.length = content.length;
        text.rect = {
        	x:left,
        	y:top - fontSize,
        	width:fontSize*content.length,
        	height:fontSize
        }
		return text; 
	}
	p.add = function(sprite){
		this.sprites.push(sprite);	
		this.sort();
	}
	p.remove = function(sprite){
		for(var index in this.sprites){
			var _sprite = this.sprites[index];
			if(_sprite == sprite){
				this.sprites.splice(index,1);
			}
		}
	}
	//draw text
	p.drawText = function(text,right,top){
		this.ctx.fillText(text, right, top);
	}
	//clear canvas
	p.clear = function(){
		this.ctx.clearRect(0,0,this.clientWidth,this.clientHeight);
	}
	p.sort = function(){
		this.sprites.sort(this.sortFunction);
	}
	p.sortFunction = function(a,b){
		if(a.z > b.z){
			return 1;
		}else if(a.z < b.z){
			return -1;
		}
		return 0;
	}
	p.loadImage = function(images){
		var self = this;
		for(var index in images){
			var img = new Image();
			img.src = images[index];
			img.addEventListener('load',function(){
				self.loadedCount ++;
				console.log(this);
				self.loaderUpdate(self.loadedCount);
			});
			this.assets.push(img);
		}	
	}
	p.loaderUpdate = function(count){
		this.loadProgressText.content = ((parseFloat(this.loadedCount)/this.assets.length)*100).toFixed(0) + '%';
		if(this.assets.length == this.loadedCount){
			this.loadedF();
			this.remove(this.loadProgressText);
		}
	}
	p.loaded = function(callback){
		this.loadedF = callback; 
	}
	window['Engine'] = Engine;
})();