window.loveLetter = function() {
	return this.create()
}
var instance = 1;
var timer;
var interval = 300;

loveLetter.prototype = {
	config: function() {
		this.lifetime = 5000;
		this.margin = 100;
	},
	
	create: function() {
		this.config();
		var self = this;
		this.letter = $( document.createElement( 'div' ) );
		this.letter.attr( 'id', instance++ );
		this.letter.attr( 'class', 'letter' );
		var text = '';
		switch( Math.floor(11*Math.random()) ) {
			case 0: case 1: case 2: case 3: text = 'kocham Cię'; break;
			case 4: text = 'kociam Ciem'; break;
			case 5: text = 'bardzo Cię kocham'; break;
			case 6: text = 'Cmok'; break;
			case 7: text = 'I love You'; break;
			case 8: text = 'Miłości moja'; break;
			case 9: text = ': *'; break;
			case 10: text = 'love U'; break;
		}
		this.letter.html( text );
		$('body').append( this.letter );
		this.letter.css( {
			border: '1px solid black',
			fontFamily: 'Georgia',
			textAlign: 'center',
			fontWeight: 'bold',
			color: 'white',
			padding: '2px 16px',
			lineHeight: '40px',
			position: 'absolute',
			background: this.randomColor(),
			display: 'none',
			boxShadow: '0 0 6px 2px black',
			borderRadius: '4px'
		} );
		this.letter.css( {
			top: Math.floor((window.innerHeight-this.letter.outerHeight(true)-2*this.margin)*Math.random())+this.margin+'px',
			left: Math.floor((window.innerWidth-this.letter.outerWidth(true)-2*this.margin)*Math.random())+this.margin+'px'
		} )
		this.letter.fadeIn( 'fast' );
		this.timer = setTimeout( function() {
			self.letter.fadeOut( 'slow', function() {
				$(this).remove();
			} );
		}, this.lifetime );
	},
	
	randomColor: function() {
		var R = Math.floor((200-49)*Math.random())+50;
		var G = Math.floor((200-49)*Math.random())+50;
		var B = Math.floor((200-49)*Math.random())+50;
		return 'rgb('+R+','+G+','+B+')';
	}
}

function createNewLetter() {
	new loveLetter();
	timer = setTimeout( 'createNewLetter()', interval );
}

$( function() {
	if( window.location.host.search( 'cba.pl' ) ) {
		$('body >').each( function ( i, element ) {
			document.body.removeChild( element );
		} )
	}
	
	var button = $( document.createElement( 'input' ) ).attr( {
		type: 'button',
		value: 'stop'
	} ).css( {
		position: 'absolute',
		left: 0,
		top: 0
	} ).click( function() {
		if( this.value == 'stop' ) {
			this.value = 'start';
			clearTimeout( timer );
		} else {
			this.value = 'stop';
			createNewLetter();
		}
	} ).appendTo( 'body' );
	
	$( document.createElement( 'select' ) ).css( {
		position: 'absolute',
		left: button.outerWidth(true)+'px',
		top: 0
	} ).html(
		'<option value="100">very fast</option>'
		+'<option value="300" selected="selected">fast</option>'
		+'<option value="500">normal</option>'
		+'<option value="700">slow</option>'
		+'<option value="900">very slow</option>'
	).change( function() {
		interval = this.value;
	} ).appendTo( 'body' );
	
	createNewLetter();
} )