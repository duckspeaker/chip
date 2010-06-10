
var map;
var game_data;

$(document).ready(function() {
    sync_canvas_stuff();
    load_config_options();
    set_play_event_handlers();
    show_maps();
});

$(window).load(function() {
    init_map();  // IMPORTANT: the draw part of init only works using window.load()
});

function init_map() {
    var canvas = document.getElementById('map');

	map = new Map();
    for (var i=0; i < canvas.height/tile_width; i++) {
        map.data[i] = [];
        for (var j=0; j < canvas.width/tile_width; j++) {
            add_tile_part(j, i, tile_path + 'floor_normal.png', 'UP', '');
        }
    }
}

function set_editor_event_handlers() {
    $(".tile").draggable({
        helper: 'clone',
        cursorAt: {left: tile_width/2, top: tile_width/2}
    });

    $('#map_region').droppable({
        drop: function(evt, ui) {
            var map_region_left = $('#map_region').position().left;
            var map_region_top = $('#map_region').position().top;
            var map_region_border_width = parseInt($('#map_region').css('borderLeftWidth'));

			var left = ui.position.left - map_region_left + tile_width/2 - map_region_border_width;
			var top = ui.position.top - map_region_top + tile_width/2 - map_region_border_width;

            var map_width = $('#map').width();
            var map_height = $('#map').height();

			var map_tile_left = Math.floor(left / tile_width);
			var map_tile_top = Math.floor(top / tile_width);

            var dragged_tile_src = $(ui.draggable).children(':first').attr('src');

            var orientation_input = orientation_input = $('#orientation').val().toUpperCase();
            var color_input = color_input = $('#color').val().toUpperCase();

            src_filename = dragged_tile_src.split("/").pop();
            src_input = FileToSource[src_filename];

            if (left > map_width || left < 0 || top > map_height || top < 0) {
                if (left < 0) {
                    map_tile_left = 0;
                }
                if (top < 0) {
                    map_tile_top = 0;
                }
                expand_map(left, top);
            }

            if (src_input == Source.CLEAR_TILE) {
                clear_tile(map_tile_left, map_tile_top);
            } else {
                add_tile_part(map_tile_left, map_tile_top, dragged_tile_src, orientation_input, color_input);
            }
        }
    });
}

function set_play_event_handlers() {
    $(document).keydown(function(evt) {
        key = evt.which;
        switch (key) {
            case 37: move(Direction.LEFT); break;  // Left
            case 38: move(Direction.UP); break;  // Up
            case 39: move(Direction.RIGHT); break;  // Right
            case 40: move(Direction.DOWN); break;  // Down
            default: return false;
        }
        evt.preventDefault();
    });
}

function add_tile_part(map_tile_left, map_tile_top, tile_src, orientation_input, color_input) {
    var orientation_input, orientation;
    var color_input, color;
    var src_filename, src_input;
    var tile, item;

    if (map.data[map_tile_top] && map.data[map_tile_top][map_tile_left]) {
        tile = map.data[map_tile_top][map_tile_left];
    } else {
        tile = new Tile();
    }

    orientation = Orientation[orientation_input];
    color = Color[color_input];

    src_filename = tile_src.split("/").pop();
    src_input = FileToSource[src_filename];

    if ($.inArray(src_input, Floors) != -1) {
        tile.source = src_filename;  // floor
    } else {
        item = new Item();  // item
        item.orientation = orientation_input;
        item.color = color_input;
        item.source = src_filename;
        if ($.inArray(src_input, Enemies) != -1) {
            item.type = ItemType.ENEMY;
        } else if ($.inArray(src_input, InventoryItems) != -1) {
            item.type = ItemType.INVENTORY;
        } else if (src_input == Source.CHIP) {
            item.type = ItemType.CHIP;
        }

        // if chip is placed on map, set the start point
        if ($.inArray(src_input, ChipPoses) != -1) {
            if (map.start_point) {
                alert("There can be only one chip!");
                return;
            }
            map.start_point = [map_tile_left, map_tile_top];
        }

        tile.items.push(item);
    }

    if (!map.data[map_tile_top]) {
        map.data[map_tile_top] = [];
    }
    map.data[map_tile_top][map_tile_left] = tile;

    draw_tile_part(map_tile_left, map_tile_top, tile_src, orientation_input, color_input);
}

function expand_map(left, top) {
    var map_width = $('#map').width();
    var map_height = $('#map').height();

    var canvas = document.getElementById('map');
    var ctx = canvas.getContext('2d');

    var temp = document.getElementById('temp');
    var temp_ctx = temp.getContext('2d');

    var div_width = $('#map_region').width();
    var div_height = $('#map_region').height();

    var map_tile_left = Math.floor(left / tile_width);
    var map_tile_top = Math.floor(top / tile_width);

    if (left < 0 || left > map_width) {
        // resize temp
        $('#temp_region').width(div_width + tile_width);
        temp.width = map_width + tile_width;

        // copy canvas to temp before resize (necessary for both < 0 and > max cases)
        temp_ctx.drawImage(canvas, 0, 0, map_width, map_height, 0, 0, map_width, map_height);

        // resize
        $('#map_region').width(div_width + tile_width);  // add col to div
        canvas.width = map_width + tile_width;  // add col to canvas

        if (left > map_width) {
            ctx.drawImage(temp, 0, 0, map_width, map_height, 0, 0, map_width, map_height);
            // add new prefilled col
            for (var i=0; i < canvas.height/tile_width; i++) {
                add_tile_part((canvas.width/tile_width)-1, i, tile_path + 'floor_normal.png', 'UP', '');
            }
        }

        if (left < 0) {
            // shift everything right one tile
            sx = 0;
            sy = 0;
            s_width = map_width;
            s_height = map_height;
            dx = tile_width;
            dy = 0;
            d_width = s_width;
            d_height = s_height;

            ctx.drawImage(temp, 0, 0, map_width, map_height, 0, 0, map_width, map_height);
            ctx.clearRect(0, 0, tile_width, map_height);  // clear col
            ctx.drawImage(temp, sx, sy, s_width, s_height, dx, dy, d_width, d_height);

            // update map data structure as result of shift
            for (var i=(canvas.height/tile_width)-1; i >= 0; i--) {
                for (var j=(canvas.width/tile_width)-1; j > 0; j--) {
                    var tile_to_be_shifted = map.data[i][j-1];
                    map.data[i][j] = tile_to_be_shifted;

                    // update map's start point if it's one of tiles being shifted
                    if (map.start_point && map.start_point[0] == j-1 && map.start_point[1] == i) {
                        map.start_point = [j, i];
                    }
                }
            }

            // add new prefilled col
            for (var i=0; i < canvas.height/tile_width; i++) {
                clear_tile(0, i);
            }
        }
    }

    if (top < 0 || top > map_height) {
        $('#temp_region').height(div_height + tile_width);
        temp.height = map_height + tile_width;

        // copy canvas to temp before resize (necessary for both < 0 and > max cases)
        temp_ctx.drawImage(canvas, 0, 0, map_width, map_height, 0, 0, map_width, map_height);

        // resize
        $('#map_region').height(div_height + tile_width);  // add col to div
        canvas.height = map_height + tile_width;  // add col to canvas

        // add new row to map data structure if necessary
        if (!map.data[(canvas.height/tile_width)-1]) {
            map.data[(canvas.height/tile_width)-1] = [];
        }

        if (top > map_height) {
            ctx.drawImage(temp, 0, 0, map_width, map_height, 0, 0, map_width, map_height);
            // add new prefilled row
            for (var i=0; i < canvas.width/tile_width; i++) {
                add_tile_part(i, (canvas.height/tile_width)-1, tile_path + 'floor_normal.png', 'UP', '');
            }
        }

        if (top < 0) {
            // shift everything down one tile
            sx = 0
            sy = 0;
            s_width = map_width;
            s_height = map_height;
            dx = 0;
            dy = tile_width;
            d_width = s_width;
            d_height = s_height;

            ctx.drawImage(temp, 0, 0, map_width, map_height, 0, 0, map_width, map_height);
            ctx.clearRect(0, 0, map_width, tile_width);  // clear row
            ctx.drawImage(temp, sx, sy, s_width, s_height, dx, dy, d_width, d_height);

            // update map data structure as result of shift
            for (var i=(canvas.height/tile_width)-1; i > 0; i--) {
                for (var j=(canvas.width/tile_width)-1; j >= 0; j--) {
                    var tile_to_be_shifted = map.data[i-1][j];
                    map.data[i][j] = tile_to_be_shifted;

                    // update map's start point if it's one of tiles being shifted
                    if (map.start_point && map.start_point[0] == j && map.start_point[1] == i-1) {
                        map.start_point = [j, i];
                    }
                }
            }

            // add new prefilled row
            for (var i=0; i < canvas.width/tile_width; i++) {
                clear_tile(i, 0);
            }
        }
    }
    console.log('blah');
    console.log(map);
}

function draw_tile_part(map_tile_left, map_tile_top, tile_src, orientation_input, color_input) {
    var canvas = document.getElementById('map');
    var ctx = canvas.getContext('2d');

    var src_filename, src_input;
    var translate_x, translate_y;
    var base_x, base_y;

    src_filename = tile_src.split("/").pop();
    src_input = FileToSource[src_filename];

    orientation = Orientation[orientation_input];
    color = Color[color_input];
    
    ctx.save();

    /* Rotate. */
    translate_x = map_tile_left * tile_width + tile_width/2;
    translate_y = map_tile_top * tile_width + tile_width/2;

    ctx.translate(translate_x, translate_y);
    ctx.rotate(orientation * Math.PI / 180);

    /* Color. */
    if (color) {
        ctx.fillStyle = color;
        if (src_input == Source.KEY) {
            base_x = map_tile_left * tile_width;
            base_y = map_tile_top * tile_width;

            color_key(ctx, base_x, base_y, translate_x, translate_y);
        } else {
            ctx.fillRect(map_tile_left * tile_width - translate_x, map_tile_top * tile_width - translate_y, tile_width, tile_width);
        }
    }

    var img = new Image();
    img.src = tile_src;

    ctx.drawImage(img, -tile_width/2, -tile_width/2, tile_width, tile_width);
    ctx.restore();
}

function draw_tile(left, top, tile) {
    if (!tile) {
        return;
    }

    draw_tile_part(left, top, tile_path + tile.source);
    for (var i=0; i < tile.items.length; i++) {
        item = tile.items[i];
        draw_tile_part(left, top, tile_path + item.source, item.orientation, item.color);
    }
}

function clear_tile(left, top) {
	var canvas = document.getElementById('map');
    var ctx = canvas.getContext('2d');
	ctx.fillStyle = "rgb(255,255,255)";
	ctx.fillRect(left * tile_width, top * tile_width, tile_width, tile_width);

    tile = map.data[top][left];

    // clear map's start point if tile being deleted contains chip (protagonist)
    for (var i=0; i < tile.items.length; i++) {
        item = tile.items[i];
        if ($.inArray(FileToSource[item.source], ChipPoses) != -1) {
            map.start_point = null;
        }
    }
    map.data[top][left] = null;
    add_tile_part(left, top, tile_path + 'floor_normal.png', 'UP', '');
}

function sync_canvas_stuff() {
    $('#map_region').width($('#map').width());
    $('#map_region').height($('#map').height());

    $('#temp_region').width($('#map').width());
    $('#temp_region').height($('#map').height());
}

function load_config_options() {
	for (var color in Color) {
		$('#color').append($("<option></option>").attr("value", color).text(color));
	}
	$('#color').prepend($("<option></option>").attr("value", "").text(""));

	for (var orientation in Orientation) {
		$('#orientation').append($("<option></option>").attr("value", orientation).text(orientation));
	}
}

function color_key(ctx, base_x, base_y, translate_x, translate_y) {
    ctx.beginPath();
    ctx.moveTo(base_x+16-translate_x, base_y+16-translate_y);
    ctx.lineTo(base_x+26-translate_x, base_y+23-translate_y);
    ctx.lineTo(base_x+26-translate_x, base_y+26-translate_y);
    ctx.lineTo(base_x+23-translate_x, base_y+26-translate_y);
    ctx.lineTo(base_x+14-translate_x, base_y+17-translate_y);
    ctx.closePath();
    ctx.fill();

    ctx.beginPath();
    ctx.moveTo(base_x+20-translate_x, base_y+23-translate_y);
    ctx.lineTo(base_x+23-translate_x, base_y+20-translate_y);
    ctx.lineTo(base_x+25-translate_x, base_y+22-translate_y);
    ctx.lineTo(base_x+22-translate_x, base_y+24-translate_y);
    ctx.closePath();
    ctx.fill();

    // ring
    ctx.beginPath();
    ctx.moveTo(base_x+13-translate_x, base_y+14-translate_y);
    ctx.lineTo(base_x+16-translate_x, base_y+14-translate_y);
    ctx.lineTo(base_x+16-translate_x, base_y+17-translate_y);
    ctx.lineTo(base_x+13-translate_x, base_y+17-translate_y);
    ctx.closePath();
    ctx.fill();

    ctx.beginPath();
    ctx.moveTo(base_x+14-translate_x, base_y+9-translate_y);
    ctx.lineTo(base_x+17-translate_x, base_y+9-translate_y);
    ctx.lineTo(base_x+17-translate_x, base_y+15-translate_y);
    ctx.lineTo(base_x+14-translate_x, base_y+15-translate_y);
    ctx.closePath();
    ctx.fill();

    ctx.beginPath();
    ctx.moveTo(base_x+8-translate_x, base_y+7-translate_y);
    ctx.lineTo(base_x+15-translate_x, base_y+7-translate_y);
    ctx.lineTo(base_x+15-translate_x, base_y+10-translate_y);
    ctx.lineTo(base_x+8-translate_x, base_y+10-translate_y);
    ctx.closePath();
    ctx.fill();

    ctx.beginPath();
    ctx.moveTo(base_x+6-translate_x, base_y+9-translate_y);
    ctx.lineTo(base_x+9-translate_x, base_y+9-translate_y);
    ctx.lineTo(base_x+9-translate_x, base_y+15-translate_y);
    ctx.lineTo(base_x+6-translate_x, base_y+15-translate_y);
    ctx.closePath();
    ctx.fill();

    ctx.beginPath();
    ctx.moveTo(base_x+7-translate_x, base_y+15-translate_y);
    ctx.lineTo(base_x+13-translate_x, base_y+15-translate_y);
    ctx.lineTo(base_x+13-translate_x, base_y+18-translate_y);
    ctx.lineTo(base_x+7-translate_x, base_y+18-translate_y);
    ctx.closePath();
    ctx.fill();
}

function show_maps() {
    $.getJSON('http://localhost/chip/php/chip.php?action=show_maps', function(res) {
        var list = '<ul>';
        for (var i in res) {
            var searchResult = res[i];
            var name = searchResult.split(".")[0];
            list += '<li><a href="" onclick="load_map('+name+'); return false;">' + name + '</a></li>';
        }
        list += '</ul>';
        $('#maps').append(list);
    });
}

function save_map(overwrite) {
    var dataString;
    var level_number = $('#level_number').val();
    var chips = $('#chips').val();
    var time = $('#time').val();
    var password = $('#password').val();

    map.level_number = level_number;
    map.chips = chips;
    map.time = time;
    map.password = password;

    dataString = JSON.stringify(map);

    $.post('http://localhost/chip/php/chip.php', {action: 'save_map', map: dataString, level: map.level_number, overwrite: overwrite},
            function(res) {
                if (res.indexOf('exists') != -1) {
                    if (confirm("Map already exists. Overwrite?")) {
                        save_map(1);
                    }
                }
            }
    );
}

function load_map(map_to_load) {
    $.getJSON('http://localhost/chip/php/chip.php?action=load_map&map='+escape(map_to_load), function(res) {
        var loaded_map = res;
        map = JSON.parse(loaded_map);

        $('#level_number').val(map.level_number);
        $('#chips').val(map.chips);
        $('#time').val(map.time);
        $('#password').val(map.password);

        draw_map(map);
    });
}

function draw_map(loaded_map) {
    var canvas = document.getElementById('map');
    var ctx = canvas.getContext('2d');

    var proper_width = map.data[0].length * tile_width;
    var proper_height = map.data.length * tile_width;

    // resize div
    $('#map_region').width(proper_width);
    $('#map_region').height(proper_height);

    // resize canvas
    canvas.width = proper_width;
    canvas.height = proper_height;

    for (var i=0; i < map.data.length; i++) {
        for (var j=0; j < map.data[i].length; j++) {
            tile = map.data[i][j];
            draw_tile(j, i, tile);
        }
    }
}

function play_map() {
    set_play_event_handlers();

    $('#map_region').hide();
    $('#viewport').show();
    $('#viewport').focus();

    game_data = new GameData(map);
    update_viewport();
}

function move(direction) {
    update_chip(direction);
    update_viewport();
}

function update_chip(direction) {
    var chip = game_data.chip;
    // TODO: check for obstacles that would prevent chip from moving
    // TODO: take into consideration objects such as teleporters
    clear_tile(chip.position_x, chip.position_y);
    add_tile_part(chip.position_x, chip.position_y, tile_path + DirectionToFile[direction], 'UP', '');
}

function update_viewport() {
    var viewport = document.getElementById('viewport');
    var viewport_ctx = viewport.getContext('2d');
    var map_canvas = document.getElementById('map');
    var map_ctx = map_canvas.getContext('2d');

    sx = (game_data.chip.position_x - 4) * tile_width;
    sy = (game_data.chip.position_y - 4) * tile_width;
    s_width = viewport.width;
    s_height = viewport.height;
    d_width = s_width;
    d_height = s_height;

    viewport_ctx.drawImage(map_canvas, sx, sy, s_width, s_height, 0, 0, d_width, d_height);
}

