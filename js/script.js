$(document).ready(function() {
	var persons = {
	}

	var user = {
		initialize: function(data) {
			this.uid = data['response']['0'].uid;
			this.first_name = data['response']['0'].first_name;
			this.last_name = data['response']['0'].last_name;
			this.photo_50 = data['response']['0'].photo_50;

			persons[this.uid] = new Person(data['response']['0']);
		},

		getFriendList: function(data) {
			this.friends_ids = data['response'].join();
			postRequest('users.get', {user_ids: this.friends_ids, fields: 'photo_50'}, this.getFriendsInfo, this);
		},

		getFriendsInfo: function(data) {
			this.friends = data['response'];
			$.each(this.friends, function(i, val) {
				persons[val['uid']] = new Person(val);
			});

			$.each(persons, function(i, val) {
				persons[i].addToList();
			});

			persons[user.uid].pick();

			set_handlers();
		}
	}

	var canvas = {
		initialize: function() {
	        this.canvas = document.getElementById("canvas");
	        this.context = this.canvas.getContext("2d");

	        this.axis_canvas = document.getElementById("axis");
	        this.axis_context = this.axis_canvas.getContext("2d");
	        this.album = [];

	        this.ref_method = 0;
	        this.orientation = 0;
	    },

	    draw: function() {
	    	var that = this;
	    	var img = this.album.photos[this.avatar_index];

	    	this.canvas.width = img.width;
	    	this.canvas.height = img.height;
	    	this.axis_canvas.width = this.canvas.width;
	    	this.axis_canvas.height = this.canvas.height;
	    	this.offset = $("#canvas_div").width()/2 - this.canvas.width/2;
	    	this.axis_pos = this.canvas.width/2;

	    	$(this.canvas).css("margin-left", this.offset + 'px');
	    	$(this.axis_canvas).css("margin-left", this.offset + 'px');

	    	this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
	    	this.context.drawImage(img, 0, 0, img.width, img.height);

	    	if(this.ref_method == 1)
	    		this.orientation = 0;

    		if(this.orientation == 1)
    			this.leftReflect();
    		else if (this.orientation == 2)
    			this.rightReflect();

	    	$("#count_av").text(that.avatar_index+1 + ' / ' + that.album.photos.length);
	    	console.log(this.orientation);
	    },

	    center: function() {
	    	this.ref_method = 0;
	    	$("#axis").unbind('mousemove');
	    	$("#axis").unbind('mouseout');
	    	$("#axis").unbind('click');
	    	$(".or_sw").bind('click', function() {
  				$(".or_sw").css("background-color", "#F1F1F1");
  				$(this).css("background-color", "#E1E1E1");
  			});
			$("#or_left").bind('click', function() { canvas.leftReflect(); });
  			$("#or_right").bind('click', function() { canvas.rightReflect(); });

  			this.draw();
	    },

	    custom: function() {
	    	this.ref_method = 1;
	    	this.orientation = 0;
	    	this.axis_pos = null;
	    	
	    	this.draw();

  			$(".or_sw").css("background-color", "#F1F1F1");
  			$("#or_original").css("background-color", "#E1E1E1");
	    	this.draw();
	    	$("#axis").bind('mousemove', function(e) { canvas.moveAxis(e); });
  			$("#axis").bind('mouseout', function() { 
  				canvas.axis_context.clearRect(0, 0, canvas.axis_canvas.width, canvas.axis_canvas.height);
  			});
  			$("#axis").bind('click', function(e) { canvas.axisPosition(e); });
	    },

	    moveAxis: function(e) {
	    	this.axis_context.clearRect(0, 0, this.axis_canvas.width, this.axis_canvas.height);
	    	this.axis_context.beginPath();
	    	this.axis_context.moveTo(e.pageX - this.offset - 10, 0);
	    	this.axis_context.lineTo(e.pageX - this.offset - 10, this.axis_canvas.height);
	    	this.axis_context.stroke();
	    },

	    axisPosition: function(e) {
	    	this.axis_pos = e.pageX - this.offset - 10;
	    	this.orientation = 1;
	    	this.leftReflect();
	    },

	    leftReflect: function() {
	    	if(this.axisPosition == null)
	    		alert("Установите ось");
	    	this.orientation = 1;
	    	var img = this.album.photos[this.avatar_index];

	    	this.context.drawImage(img, 0, 0, img.width, img.height);
	    	var image_data = this.context.getImageData(0, 0, this.axis_pos, this.canvas.height);
	    	var new_image_data = this.context.createImageData(image_data.width, this.canvas.height);

	    	for(var i = 0; i < image_data.height; i++) {
	  			c_pix = i*image_data.width*4;
	    		for(var j = 0; j < image_data.width*4; j += 4) {
	    			new_image_data.data[c_pix+j] = image_data.data[c_pix+image_data.width*4-j-4];
	    			new_image_data.data[c_pix+j+1] = image_data.data[c_pix+image_data.width*4-j-3];
	    			new_image_data.data[c_pix+j+2] = image_data.data[c_pix+image_data.width*4-j-2];
	    			new_image_data.data[c_pix+j+3] = image_data.data[c_pix+image_data.width*4-j-1];		
	    		}
	    	}

	    	this.canvas.width = image_data.width*2;
	    	this.context.putImageData(image_data, 0, 0);
	    	this.context.putImageData(new_image_data, this.axis_pos, 0);
	    },

	    rightReflect: function() {
	    	if(this.axisPosition == null)
	    		alert("Установите ось");
	    	this.orientation = 1;
	    	var img = this.album.photos[this.avatar_index];

	    	this.context.drawImage(img, 0, 0, img.width, img.height);
	    	var image_data = this.context.getImageData(this.axis_pos, 0, this.canvas.width - this.axis_pos, this.canvas.height);
	    	var new_image_data = this.context.createImageData(image_data.width, this.canvas.height);

	    	for(var i = 0; i < image_data.height; i++) {
	  			c_pix = i*image_data.width*4;
	    		for(var j = 0; j < image_data.width*4; j += 4) {
	    			new_image_data.data[c_pix+j] = image_data.data[c_pix+image_data.width*4-j-4];
	    			new_image_data.data[c_pix+j+1] = image_data.data[c_pix+image_data.width*4-j-3];
	    			new_image_data.data[c_pix+j+2] = image_data.data[c_pix+image_data.width*4-j-2];
	    			new_image_data.data[c_pix+j+3] = image_data.data[c_pix+image_data.width*4-j-1];		
	    		}
	    	}

	    	console.log(image_data);
	    	console.log(new_image_data);

	    	this.canvas.width = image_data.width*2;
	    	this.context.putImageData(new_image_data, 0, 0);
	    	this.context.putImageData(image_data, this.axis_pos, 0);
	    }	
	}

	/*PERSON*/
	/////////////////////////////////////////////////////////////////////////////////////////

	function Person(friend) {
		this.uid = friend.uid;
		this.first_name = friend.first_name;
		this.last_name = friend.last_name;
		this.avatar = friend.photo_50;
		this.albums = [];
	}

	Person.prototype.addToList = function() {
		$("#friend_list").append("<div class='person' id='" + this.uid + "'><div class='avatar_small'></div><div class='person_name'>" + this.first_name + " " + this.last_name + "</div></div>");
		$("#" + this.uid).children('.avatar_small').css("backgroundImage", "url(" + this.avatar + ")");
	}

	Person.prototype.pick = function() {
		canvas.user = this;
		canvas.avatar_index = 0;
		
		$("#picked").html("<div id='picked_person'><div class='avatar_small'></div><div class='person_name'>" + this.first_name + " " + this.last_name + "</div></div>");
		$("#picked_person").children('.avatar_small').css("backgroundImage", "url(" + this.avatar + ")");
		if(!this.albums.length) {
			postRequest('photos.getAlbums', {owner_id: this.uid, need_system: 1}, this.albumsList, this);
		}
		else {
			this.albumSelector();
		}
	}

	Person.prototype.albumsList = function(data) {
		if(data['error']) {
			if(data['error']['error_code'] == 15) {
				canvas.context.clearRect(0, 0, canvas.canvas.width, canvas.canvas.height);
				$("#album_selector").html("<option disabled>Нет альбомов</option>");
				return;
			}
		}
		for(var i = 0; i < data['response'].length; i++) {
			if(data['response'][i].size && (data['response'][i].aid > 0 || data['response'][i].aid == -6 || data['response'][i].aid == -7))
				this.albums.push(new Album(data['response'][i]));
		}
		this.albumSelector();
	}

	Person.prototype.albumSelector = function() {
		if(!this.albums.length) {
			canvas.context.clearRect(0, 0, canvas.canvas.width, canvas.canvas.height);
			$("#album_selector").html("<option disabled>Нет альбомов</option>");
		}
		else {
			$("#album_selector").empty();
			for(var i = 0; i < this.albums.length; i++) {
				$("#album_selector").append("<option value='" + i + "'>" + this.albums[i].title + " (" + this.albums[i].size + ")" + "</option>");
			}
			this.pickAlbum();		
		}
		$("#album_selector").width($("#photo_panel").width());
		$("#album_selector").height(20);
	}

	Person.prototype.pickAlbum = function() {
		var id = $("#album_selector").val();
		canvas.avatar_index = 0;
		canvas.album = this.albums[id];

		if(!canvas.album.photos.length)
			postRequest('photos.get', {owner_id: this.uid, album_id: canvas.album.id}, this.avatarList, this);
		else
			canvas.draw();
	}

	Person.prototype.avatarList = function(data) {
		var album_array = [];
		$.each(data['response'], function(i, val) {
			album_array.unshift(val['src_big']);
		});

		/*for(var i = 0; i < data['response'].length; i+=10) {
			album_array = [];		
			for(var j = 0; j < 10; j++) {
				console.log(i+j);
				if(data['response'][i+j])
					album_array.unshift(data['response'][i+j]['src_big']);
			}

		}*/

		$.ajax({
			url: 'img_upload.php',
			type: 'POST',
			data: {'images': album_array},
			success: this.loadImages,
			error: function(data, textStatus, errorThrown) {
				console.log(data);
				console.log(textStatus);
				console.log(errorThrown);
			},
			dataType: 'json',
			context: this
		});		
	}

	Person.prototype.loadImages = function(data) {
		var album_array = canvas.album.photos;
		$.each(data, function(i, val) {
			new_image = new Image();
			new_image.src = val;
			album_array.push(new_image);
		});
		this.waitForImages();
	}

	Person.prototype.waitForImages = function() {
		var that = this;
		var album = canvas.album.photos;
	  	for(var i = 0; i <album.length; i++) {
	  		if(!album[i].complete) {
	  			setTimeout(function() { that.waitForImages(); }, 100);
	  			return;
	  		}
	  		else {
	  			if(album[i].width > 500 || album[i].height > 500) {
	  				var k;
	  				if(album[i].width > album[i].height) {
	  					k = album[i].width/500;
		        		album[i].width /= k;
		        		album[i].height /= k;       		
		        	}
			    	else {
			    		k = album[i].height/500;
		        		album[i].width /= k;
		        		album[i].height /= k;      		
			    	}
	  			}
	  		}
	  	}
	  	this.clearTemp();
	  	canvas.draw();
	}

	Person.prototype.clearTemp = function() {
		var temp = [];
		var array = canvas.album.photos;
		
		$.each(array, function(i, val) {
			temp.push(val.src);
		});

		$.ajax({
			url: 'clear_temp.php',
			type: 'POST',
			data: {'images': temp},
			error: function(data, textStatus, errorThrown) {
				console.log(data);
				console.log(textStatus);
				console.log(errorThrown);
			}
		});	
	}

	/*ALBUM*/
	/////////////////////////////////////////////////////////////////////////////////////////

	function Album(album) {
		this.id = album.aid;
		this.owner = album.owner_id;
		this.title = album.title;
		this.size = album.size;
		this.photos = [];
	}

	/////////////////////////////////////////////////////////////////////////////////////////
	/////////////////////////////////////////////////////////////////////////////////////////

	function prevAvatar() {
		if(canvas.avatar_index == 0) {
			canvas.avatar_index = canvas.album.photos.length - 1;
			canvas.draw();
		}
		else {
			canvas.avatar_index--;
			canvas.draw();
		}
	}

	function nextAvatar() {
		if(canvas.avatar_index == canvas.album.photos.length - 1) {
			canvas.avatar_index = 0;
			canvas.draw();
		}
		else {
			canvas.avatar_index++;
			canvas.draw();
		}
	}

	function postRequest(method, data, callback, context) {
		$.ajax({
			url: 'https://api.vk.com/method/' + method,
			type: 'POST',
			data: data,
			success: callback,
			error: function() {
				alert("error");
			},
			dataType: 'jsonp',
			context: context
		});
	}

	function set_handlers() {
		$(".person").click(function() {
			persons[this.id].pick();
			$("#friend_list").toggle();
		});

		$("#picked").click(function() {
			$("#friend_list").toggle();
		});

		$("#album_selector").change(function() { canvas.user.pickAlbum(); });

		$("#prev_av").click(prevAvatar);
  		$("#next_av").click(nextAvatar);

		$("#ref_center").click(function() { 
			$(".ref_meth").css("background-color", "#F1F1F1");
			$(this).css("background-color", "#E1E1E1");
			canvas.center(); 
		});
  		$("#ref_custom").click(function() { 
  			$(".ref_meth").css("background-color", "#F1F1F1");
  			$(this).css("background-color", "#E1E1E1");
  			canvas.custom(); 
  		});

  		$(".or_sw").bind('click', function() {
  			$(".or_sw").css("background-color", "#F1F1F1");
  			$(this).css("background-color", "#E1E1E1");
  		});
  		$("#or_original").click(function() { 
  			canvas.orientation = 0;
  			canvas.draw(); 
  		});
  		$("#or_left").bind('click', function() { canvas.leftReflect(); });
  		$("#or_right").bind('click', function() { canvas.rightReflect(); });
	}

	VK.init(function() { 
		$("#friend_list").hide();
		VK.loadParams(document.location.href);
		user.uid = VK.params.viewer_id;
		canvas.initialize();
		postRequest('users.get', {user_ids: user.uid, fields: 'photo_50'}, user.initialize, user);
		postRequest('friends.get', {user_id: user.uid}, user.getFriendList, user);
	},
	function() { 
     	// API initialization failed 
    	// Can reload page here 
	}, '5.24');
});