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
	    },

	    draw: function() {
	    	var that = this;
	    	var img = this.album.photos[this.avatar_index];
	    	
	    	this.canvas.width = img.width;
	    	this.canvas.height = img.height;
	    	this.axis_canvas.width = this.canvas.width;
	    	this.axis_canvas.height = this.canvas.height;

	    	this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
	    	this.context.drawImage(img, 0, 0, img.width, img.height);

	    	$("#count_av").text(that.avatar_index+1 + ' / ' + that.album.photos.length);
	    },

	    leftReflect: function() {
	    	var img = this.album.photos[this.avatar_index];

	    	this.context.drawImage(img, 0, 0, img.width, img.height);
	    	var image_data = this.context.getImageData(0, 0, this.canvas.width, this.canvas.height);

	    	for(var i = 0; i < image_data.height; i++) {
	  			c_pix = i*image_data.width*4;
	    		for(var j = c_pix; j < image_data.width/2*4 + c_pix; j += 4) {
	    			image_data.data[c_pix+image_data.width*4-j+c_pix] = image_data.data[j];
					image_data.data[c_pix+image_data.width*4-j+c_pix+1] = image_data.data[j+1];
					image_data.data[c_pix+image_data.width*4-j+c_pix+2] = image_data.data[j+2];
					image_data.data[c_pix+image_data.width*4-j+c_pix+3] = image_data.data[j+3];					
	    		}
	    	}
    		this.context.putImageData(image_data, 0, 0);
	    },

	    rightReflect: function() {
	    	var img = this.album.photos[this.avatar_index];

	    	this.context.drawImage(img, 0, 0, img.width, img.height);
	    	var image_data = this.context.getImageData(0, 0, this.canvas.width, this.canvas.height);

	    	for(var i = 0; i < image_data.height; i++) {
	  			c_pix = i*image_data.width*4;
	    		for(var j = c_pix; j < image_data.width/2*4 + c_pix; j += 4) {
	    			image_data.data[j] = image_data.data[c_pix+image_data.width*4-j+c_pix];
					image_data.data[j+1] = image_data.data[c_pix+image_data.width*4-j+c_pix+1];
					image_data.data[j+2] = image_data.data[c_pix+image_data.width*4-j+c_pix+2];
					image_data.data[j+3] = image_data.data[c_pix+image_data.width*4-j+c_pix+3];
	    		}
	    	}
	    	this.context.putImageData(image_data, 0, 0);
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

  		$("#or_original").click(function() { canvas.draw(); });
  		$("#or_left").click(function() { canvas.leftReflect(); });
  		$("#or_right").click(function() { canvas.rightReflect(); });
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