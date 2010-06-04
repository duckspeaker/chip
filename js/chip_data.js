
var tile_width = 32;

/* Map. */
function Map() {
	this.data = [];

	this.level_number;
	this.time;
	this.chips_left;
}

/* Chip. */
function Chip() {
	this.inventory = new Array();
}

/* Enums. */
var Orientation = {
	UP : 0,
	LEFT : 270,
	DOWN : 180,
	RIGHT : 90
};

var Color = {
	RED :    '#FF0000',
	BLUE :   '#00FFFF',
	GREEN :  '#00FF00',
	YELLOW : '#FFFF00',
	DBLUE :  '#0000FF',
	BROWN :  '#808000'
};

var ItemType = {
	ENEMY: 0,
	INVENTORY: 1,
	CHIP: 2 // The item, not the protagonist.
};

var SourceType = {
	FLOOR : 0,
	ITEM : 1
};

var Source = {
	BLOCK_MUD : 0,
	BLOCK_NORMAL : 1,
	BLOCK_QUESTIONABLE : 2,
	BLOCK_SWITCHABLE : 3,
	CHIP_DOWN : 4,
	CHIP_LEFT : 5,
	CHIP_RIGHT : 6,
	CHIP_UP : 7,
	CHIP : 8,
	CLEAR : 9,
	DASH : 10,
	DASH_BOOTS : 35,
	BALL : 11,
	BOMB : 12,
	BUG : 13,
	FIREBALL : 14,
	GHOST : 15,
	TANK : 16,
	FIRE_BOOTS : 17,
	FIRE : 18,
	FIREBALL_GENERATOR : 19,
	FLIPPERS : 20,
	FLOOR_MUD : 21,
	FLOOR_NORMAL : 22,
	GATE_GOAL : 23,
	GATE : 24,
	GOAL : 25,
	HELP : 26,
	ICE_CENTER : 27,
	ICE_CORNER : 28,
	ICE_SKATES : 29,
	KEY : 30,
	SPLASH : 31,
	SWITCH_ : 32,
	TELEPORTER : 33,
	TRAP : 34
};

var FileToSource = {
	'block_mud.png' : Source.BLOCK_MUD,
	'block_normal.png' : Source.BLOCK_NORMAL,
	'block_questionable.png' : Source.BLOCK_QUESTIONABLE, 
	'block_switchable.png' : Source.BLOCK_SWITCHABLE,
	'chip_down.png' : Source.CHIP_DOWN,
	'chip_left.png' : Source.CHIP_LEFT,
	'chip_right.png' : Source.CHIP_RIGHT,
	'chip_up.png' : Source.CHIP_UP,
	'chip.png' : Source.CHIP,
	'clear.png' : Source.CLEAR,
	'dash.png' : Source.DASH,
	'dash_boots.png' : Source.DASH_BOOTS,
	'ball.png' : Source.BALL,
	'bomb.png' : Source.BOMB,
	'bug.png' : Source.BUG,
	'fireball.png' : Source.FIREBALL,
	'ghost.png' : Source.GHOST,
	'tank.png' : Source.TANK,
	'fire_boots.png' : Source.FIRE_BOOTS,
	'fire.png' : Source.FIRE,
	'fireball_generator.png' : Source.FIREBALL_GENERATOR,
	'flippers.png' : Source.FLIPPERS,
	'floor_mud.png' : Source.FLOOR_MUD,
	'floor_normal.png' : Source.FLOOR_NORMAL,
	'gate_goal.png' : Source.GATE_GOAL,
	'gate.png' : Source.GATE,
	'goal.png' : Source.GOAL,
	'help.png' : Source.HELP,
	'ice_center.png' : Source.ICE_CENTER,
	'ice_corner.png' : Source.ICE_CORNER,
	'ice_skates.png' : Source.ICE_SKATES,
	'key.png' : Source.KEY,
	'splash.png' : Source.SPLASH,
	'switch.png' : Source.SWITCH_,
	'teleporter.png' : Source.TELEPORTER,
	'trap.png' : Source.TRAP,
};

var Floors = new Array(
	Source.BLOCK_MUD,
	Source.BLOCK_NORMAL,
	Source.BLOCK_QUESTIONABLE,
	Source.BLOCK_SWITCHABLE,
	Source.CLEAR,
	Source.DASH,
	Source.FIRE,
	Source.FIREBALL_GENERATOR,
	Source.FLOOR_MUD,
	Source.FLOOR_NORMAL,
	Source.GOAL,
	Source.HELP,
	Source.ICE_CENTER,
	Source.ICE_CORNER,
	Source.SPLASH,
	Source.SWITCH_,
	Source.TELEPORTER,
	Source.TRAP
);

var Items = new Array(
	Source.CHIP_DOWN,
	Source.CHIP_LEFT,
	Source.CHIP_RIGHT,
	Source.CHIP_UP,
	Source.CHIP,
	Source.DASH_BOOTS,
	Source.BALL,
	Source.BOMB,
	Source.BUG,
	Source.FIREBALL,
	Source.GHOST,
	Source.TANK,
	Source.FIRE_BOOTS,
	Source.FLIPPERS,
	Source.GATE_GOAL,
	Source.GATE,
	Source.ICE_SKATES,
	Source.KEY
);

var InventoryItems = new Array(
	Source.DASH_BOOTS,
	Source.FIRE_BOOTS,
	Source.FLIPPERS,
	Source.ICE_SKATES,
	Source.KEY
)

var Enemies = new Array(
	Source.BALL,
	Source.BOMB,
	Source.BUG,
	Source.FIREBALL,
	Source.GHOST,
	Source.TANK
);

/* Objects. */
function Item() {
	this.orientation = Orientation.UP;
	this.color;
	this.source;
	this.type;
}

function Tile() {
	this.source = Source.FLOOR_NORMAL;
	this.items = new Array();
}

