window.whtBx = function() {
	return this.init();
};

whtBx.prototype = {
	cnfg: function() {
		this.mrgn = 40;
	},
    
	bndKs: function() {
		var slf = this;
		window.onkeyup = function (e) {
			switch(e.keyCode) {
				case 27: slf.hd(); break;
				case 37: slf.prvs(); break;
				case 39: slf.nxt(); break;
			}
		};
	},
	
	unBndKs: function() {
		window.onkeyup = function () {};
	},
	
	init: function() {
		this.lst = new Array();
		this.crnt = new Number();
		this.bndImgs();
		this.bndElmnts();
		this.cnfg();
	},
    
	bndImgs: function() {
		var slf = this;
		var aLst = document.getElementsByTagName('a');
		for(var i = 0; i < aLst.length; i++) {
			if(aLst[i].className === 'whtBx') {
				aLst[i].onclick = function(evnt) {
					evnt = evnt || window.event;
					evnt.stopPropagation ? evnt.stopPropagation() : evnt.cancelBubble = true;
					evnt.preventDefault ? evnt.preventDefault() : evnt.returnValue = false;
					slf.shw(this.getAttribute("href"));
				};
				this.lst.push(aLst[i]);
			}
		}
	},
	
	bndElmnts: function() {
		var slf = this;
		
		this.bckgrd = document.getElementById('bckgrd');
		this.bckgrd.onclick = function () {
			slf.hd();
		};
		this.bx = document.getElementById('bx');
		this.phto = document.getElementById('phto');
		this.dsc = document.getElementById('dsc');
		this.nbx = document.getElementsByClassName('bttn')[0];
		this.nbx.onclick = function () {
			slf.nxt();
		};
		this.pbx = document.getElementsByClassName('bttn')[1];
		this.pbx.onclick = function () {
			slf.prvs();
		};
	},
	
	dsply: function() {
		$(this.bx).fadeIn(600);
		this.dsc.style.display = 'block';
	},
	
	shw: function(url) {
		this.bndKs();
		var slf = this;
		this.bx.style.display = 'none';
		for(var i in this.lst) {
			if(this.lst[i].getAttribute("href") === url) {
				this.crnt = parseInt(i, 10);
			}
		}
		this.stBckgrd();
		this.phto.src = url;
		this.phto.onload = function () {
			var hght = this.naturalHeight;
			var wdth = this.naturalWidth;
			var prprtns = wdth/hght;
			var mxHght = window.innerHeight-slf.mrgn*2;
			var mxWdth = window.innerWidth-slf.mrgn*2;
			
			if( wdth > mxWdth ) {
				wdth = mxWdth;
				hght = mxWdth/prprtns;
			}
			if( hght > mxHght ) {
				wdth = mxHght*prprtns;
				hght = mxHght;
			}
			this.height = hght;
			this.width = wdth;
			slf.dsply();
			slf.stBxs();
		};
		if(typeof(whtBxDscObj[this.crnt+1]) !== 'undefined') {
			this.dsc.innerHTML = whtBxDscObj[this.crnt+1];
		} else {
			this.dsc.innerHTML = '';
		}
	},

	stBckgrd: function() {
		this.bckgrd.style.background = 'black url("files/loading.gif") no-repeat fixed '+(window.innerWidth-300)/2+'px 48%';
		this.bckgrd.style.height = +this.gtDocHght()+'px';
		this.bckgrd.style.display = 'block';
	},

	stBxs: function() {
		this.bx.style.display = 'block';
		this.bx.style.top = (document.documentElement.scrollTop || document.body.scrollTop)+(window.innerHeight-this.bx.offsetHeight)/2+'px';
		this.bx.style.left = (window.innerWidth-this.bx.offsetWidth)/2+'px';
		
		var l = (window.innerWidth+this.bx.offsetWidth)/2+10+'px';
		var t = (document.documentElement.scrollTop || document.body.scrollTop)+window.innerHeight/2-50+'px';
		this.nbx.style.display = 'block';
		if(!this.nbx.style.top)
			this.nbx.style.top = t;
		if(!this.nbx.style.left)
			this.nbx.style.left = l;
		$(this.nbx).animate({left: l, top: t}, 400);
		
		this.pbx.style.display = 'block';
		l = (window.innerWidth-this.bx.offsetWidth)/2-110+'px';
		if(!this.pbx.style.top)
			this.pbx.style.top = t;
		if(!this.pbx.style.left)
			this.pbx.style.left = l;
		$(this.pbx).animate({left: l, top: t}, 400);
		this.bckgrd.style.background = 'black';
	},

	hd: function() {
		this.unBndKs();
		this.phto.onload = '';
		this.phto.src = '';
		this.dsc.style.display = 'none';
		this.bx.style.display = 'none';
		this.nbx.style.display = 'none';
		this.pbx.style.display = 'none';
		this.bckgrd.style.display = 'none';
	},
	
	nxt: function() {
		if(this.lst[this.crnt+1])
			this.shw(this.lst[this.crnt+1].getAttribute("href"));
		else
			this.shw(this.lst[0].getAttribute("href"));
	},
	
	prvs: function() {
		if(this.lst[this.crnt-1])
			this.shw(this.lst[this.crnt-1].getAttribute("href"));
		else
			this.shw(this.lst[this.lst.length-1].getAttribute("href"));
	},
	
	gtDocHght: function() {
		var D = document;
		return Math.max(
			D.body.scrollHeight, D.documentElement.scrollHeight,
			D.body.offsetHeight, D.documentElement.offsetHeight,
			D.body.clientHeight, D.documentElement.clientHeight
		);
	}
};

whtBx.fire = function () {
	var wb = new whtBx();
};

var list = document.getElementsByClassName('whtBx');
var evalThis = 'var whtBxDscObj = {';
for(var i=0; i<=list.length; i++) {
	var key = i+1;
	evalThis += key+': \'';
		if(typeof(prewhtBxDscObj[key]) !== 'undefined') {
		for(var prop in __protwhtBxDscObj) {
			if(typeof(prewhtBxDscObj[key][prop]) !== 'undefined') {
				evalThis += prop+': '+prewhtBxDscObj[key][prop];
			} else if(__protwhtBxDscObj[prop] !== '') {
				evalThis += prop+': '+__protwhtBxDscObj[prop];
			} else {
				continue;
			}
			if(evalThis.length) evalThis += '<br>';
		}
	}
	evalThis += '<br>autor: Ewelina Krawczyk\',';
};
evalThis += '};';
eval(evalThis);