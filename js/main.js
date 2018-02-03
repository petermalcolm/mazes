/**
 * A self-building maze
 */

'use strict';

(function iife($){
	const NUM_COLS = 55;
	const NUM_ROWS = 20;

	const START_X = 10;
	const START_Y = 0;

	const END_X = 16;
	const END_Y = 19;

	const deltas =[ {dir: 'n', del: { x: 0, y: -1 }, weight: 1, opposite: 's'},
					{dir: 's', del: { x: 0, y:  1 }, weight: 1, opposite: 'n'},
					{dir: 'e', del: { x: 1, y:  0 }, weight: 1, opposite: 'w'},
					{dir: 'w', del: { x:-1, y:  0 }, weight: 1, opposite: 'e'}
				  ];
	var main = function() {
		var makeRow = function() {
			$('#root').append('<div class="row" data-y="'+$('.row').length+'"></div>')
		};
		var makeCell = function( rowId ) {
			$('.row').eq(rowId).append('<div class="cell" data-x="'+$('.cell').length%NUM_COLS+'"></div>')
		};
		var walkIt = function ( x, y, fromDirection='' ) {
			var on_solution_path = false;
			var nexts = [];
			if( !stuck(x,y) ) {
				var nexts = prune(scramble(pickIfPassable(1,x,y)));
			}
			for( var direction in nexts ) {
				on_solution_path = branchTo(x,y,nexts[direction]) || on_solution_path || madeIt(x,y);	
			}
			if(on_solution_path) { cellAt(x,y).addClass('hilit'); }
			if(x===START_X && y===START_Y) { cellAt(x,y).addClass('start').html('Start'); }
			return on_solution_path;
		};
		// private
		var cellAt = function ( x, y ) {
			if( x < 0 || x > NUM_COLS || y < 0 || y > NUM_ROWS ) {
				return $([]);
			}
			return $('.row').eq(y).children('.cell').eq(x);
		};
		var xyInDirection = function ( x, y, direction ) {
			return { x: x+deltaOf(direction).del.x, 
					 y: y+deltaOf(direction).del.y };
		};
		var opposite = function( direction ) {
			return deltaOf(direction).opposite;
		}
		var deltaOf = function ( direction ) {
			return deltas.filter(function sameDir(d){ return d.dir === direction; })[0];
		}
		var notPassableCoords = function( x, y ) {
			return notPassableCell(cellAt(x,y));
		};
		var notPassableCell = function( c ) {
			return 	c.length === 0 || 
					c.hasClass('n') || 
					c.hasClass('s') || 
					c.hasClass('e') || 
					c.hasClass('w') ||
					c.hasClass('x'); // x for impassable
		}
		var stuck = function( x, y ) {
			return !pickIfPassable(1,x,y).length;
		};
		var madeIt = function( x, y ) {
			return (x===END_X && y===END_Y);
			// return notPassableCoords( x,y-1 );
		};
		var pickIfPassable = function( likelihood, x, y ) {
			return deltas.reduce( function picking( accum, curVal, curIdx ){
				var direction = curVal.dir,
					newX = x+curVal.del.x,
					newY = y+curVal.del.y;
				if(Math.random() < likelihood && !notPassableCoords(newX,newY)) { 
					return accum.concat(direction);
				} else {
					return accum;
				}
			}, [] );
		};
		var scramble = function( arr ) {
			return arr.reduce( function beforeOrAfter( accum, curVal, curIdx ){
				return (Math.random() < .5) ? accum + curVal : curVal + accum;
			},[]).split('');
		};
		var prune = function( arr ) {
			return arr.reduce( function keepOrRemove( accum, curVal, curIdx ){
				return (Math.random() < deltaOf(curVal).weight) ? accum + curVal : accum;
			},[]);
		};
		var density = function() {
			var ratio = { denom: $('.cell').length,
						  num: $('.cell').filter(function addUsedCells( curIdx, curVal ){
							return notPassableCell( $(curVal) );
						  }).length
						}
			return ratio.num / ratio.denom;
		};
		var branchTo = function( x,y,direction ) {
			connectTwoCells( x,y,direction );
			var coords = xyInDirection( x,y,direction );
			if( (coords.x===END_X && coords.y===END_Y) ) {
				cellAt( coords.x, coords.y ).addClass('finish').html('End');
			}
			return madeIt( coords.x, coords.y ) || walkIt( coords.x, coords.y );
		};
		var connectTwoCells = function( x, y, direction ) {
			if( !direction ) { return; }
			var coords = xyInDirection(x,y,direction);
			if( !notPassableCoords(coords.x,coords.y) ) {
				cellAt(x,y).addClass(direction);
				cellAt(coords.x,coords.y).addClass(opposite(direction));
			}
		}
		// interface
		var _handle = {
			makeRow : makeRow,
			makeCell : makeCell,
			walkIt : walkIt,
			cellAt : cellAt
		}
		return _handle;
	};

	var maze = main();
	// build the maze:
	for(var i=0; i<NUM_ROWS; i++ ) {
		maze.makeRow();
		for( var j=0; j<NUM_COLS; j++ ) {
			maze.makeCell( i );
		}
	}

	// walk it!
	// maze.walkIt( START_X, START_Y );
	// flesh it out
	$('.cell').on('click',function(e){
		var hitCoords = {
			x: $(e.target).attr('data-x'),
			y: $(e.target).closest('.row').attr('data-y')
		};
		console.log( hitCoords );
		// maze.walkIt( parseInt(hitCoords.x), parseInt(hitCoords.y) );
		maze.cellAt( parseInt(hitCoords.x), parseInt(hitCoords.y) ).toggleClass('x').toggleClass('no-print');
		maze.cellAt( NUM_COLS - parseInt(hitCoords.x), parseInt(hitCoords.y) ).toggleClass('x').toggleClass('no-print');
	});
	$('h1').on('click',function(e){
		maze.walkIt( START_X, START_Y );
	})
}(jQuery));