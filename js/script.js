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
				//postRequest('photos.get', {owner_id: val['uid'], album_id: 'profile'}, friends1.showFriendList, val);
				persons[val['uid']] = new Person(val);
			});

			$.each(persons, function(i, val) {
				persons[i].addToList();
			});

			persons[user.uid].pick();

			set_handlers();
		}
	}

	function Person(friend) {
		this.uid = friend.uid;
		this.first_name = friend.first_name;
		this.last_name = friend.last_name;
		this.avatar = friend.photo_50;
		this.album_profile = [];
	}

	Person.prototype.addToList = function() {
		$("#friend_list").append("<div class='person' id='" + this.uid + "'><div class='avatar_small'></div><div class='person_name'>" + this.first_name + " " + this.last_name + "</div></div>");
		$("#" + this.uid).children('.avatar_small').css("backgroundImage", "url(" + this.avatar + ")");
	}

	Person.prototype.pick = function() {
		canvas.person = this;
		canvas.avatar_index = 0;
		$("#picked").html("<div id='picked_person'><div class='avatar_small'></div><div class='person_name'>" + this.first_name + " " + this.last_name + "</div></div>");
		$("#picked_person").children('.avatar_small').css("backgroundImage", "url(" + this.avatar + ")");
		if(this.album_profile.length)
			canvas.draw();
		else
			postRequest('photos.get', {owner_id: this.uid, album_id: 'profile'}, this.avatarList, this);
	}

	Person.prototype.avatarList = function(data) {
		var new_image;
		var album_array = [];
		$.each(data['response'], function(i, val) {
			album_array.unshift(val['src_big']);
		});

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
		var album_array = this.album_profile;
		$.each(data, function(i, val) {
			new_image = new Image();
			new_image.src = val;
			album_array.push(new_image);
		});
		this.waitForImages();
	}

	Person.prototype.waitForImages = function() {
		var that = this;
	  	for(var i = 0; i < this.album_profile.length; i++) {
	  		if(!this.album_profile[i].complete) {
	  			setTimeout(function() { that.waitForImages(); }, 100);
	  			return;
	  		}
	  		else {
	  			if(this.album_profile[i].width > 500 || this.album_profile[i].height > 500) {
	  				var k;
	  				if(this.album_profile[i].width > this.album_profile[i].height) {
	  					k = this.album_profile[i].width/500;
		        		this.album_profile[i].width /= k;
		        		this.album_profile[i].height /= k;       		
		        	}
			    	else {
			    		k = this.album_profile[i].height/500;
		        		this.album_profile[i].width /= k;
		        		this.album_profile[i].height /= k;      		
			    	}
	  			}
	  		}
	  	}
	  	this.clearTemp();
	  	canvas.draw();
	}

	Person.prototype.clearTemp = function() {
		var temp = [];
		var array = this.album_profile;
		
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

	function Album() {
		
	}

	function prevAvatar() {
		if(canvas.avatar_index == 0) {
			canvas.avatar_index = canvas.person.album_profile.length - 1;
			canvas.draw();
		}
		else {
			canvas.avatar_index--;
			canvas.draw();
		}
	}

	function nextAvatar() {
		if(canvas.avatar_index == canvas.person.album_profile.length - 1) {
			canvas.avatar_index = 0;
			canvas.draw();
		}
		else {
			canvas.avatar_index++;
			canvas.draw();
		}
	}

	var canvas = {
		initialize: function() {
	        this.canvas = document.getElementById("canvas");
	        this.context = this.canvas.getContext("2d");
	    },

	    draw: function() {
	    	var that = this;
	    	var img = this.person.album_profile[this.avatar_index];
	    	this.canvas.width = img.width;
	    	this.canvas.height = img.height;

	    	this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
	    	this.context.drawImage(img, 0, 0, img.width, img.height);

	    	$("#count_av").text(that.avatar_index+1 + ' / ' + that.person.album_profile.length);
	    },

	    leftReflect: function() {
	    	var img = this.person.album_profile[this.avatar_index];

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
	    	var img = this.person.album_profile[this.avatar_index];

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

		$("#prev_av").click(prevAvatar);
  		$("#next_av").click(nextAvatar);

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