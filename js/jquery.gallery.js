/**
 * jquery.gallery.js
 * http://www.codrops.com
 *
 * Copyright 2011, Pedro Botelho / Codrops
 * Free to use under the MIT license.
 *
 * Date: Mon Jan 30 2012
 */

(function($, undefined) {

	/*
	 * Gallery object.
	 */
	$.Gallery = function(options, element) {

		this.$el = $(element);
		this._init(options);

	};

	$.Gallery.defaults = {
		current: 0, // index of current item
		autoplay: false, // slideshow on / off
		interval: 2000 // time between transitions
	};

	$.Gallery.prototype = {
		_init: function(options) {

			this.options = $.extend(true, {}, $.Gallery.defaults, options);
           // console.log("reWidth1="+this.options.reWidth)
			// support for 3d / 2d transforms and transitions
			this.support3d = Modernizr.csstransforms3d;
			this.support2d = Modernizr.csstransforms;
			this.supportTrans = Modernizr.csstransitions;

			this.$wrapper = this.$el.find('.dg-wrapper');

			this.$items = this.$wrapper.children();
			this.itemsCount = this.$items.length;

			this.$nav = this.$el.find('nav');
			this.$navPrev = this.$nav.find('.dg-prev');
			this.$navNext = this.$nav.find('.dg-next');
			
            this.$tr350Factor = 350/1349;
            this.$tr450Factor = 450/1349;
            
			// minimum of 3 items
//			if(this.itemsCount < 3) {
//
//				this.$nav.remove();
//				return false;
//
//			}

			this.current = this.options.current;

			this.isAnim = false;

			this.$items.css({
				'opacity': 0,
				'visibility': 'hidden'
			});

			this._validate();

			this._layout();

			// load the events
			this._loadEvents();

			// slideshow
			if(this.options.autoplay) {

				this._startSlideshow();

			}

		},
		_validate: function() {

			if(this.options.current < 0 || this.options.current > this.itemsCount - 1) {

				this.current = 0;

			}

		},
		_layout: function() {

			// current, left and right items
			this._setItems();

			// current item is not changed
			// left and right one are rotated and translated
			var leftCSS, rightCSS, currentCSS;
           	var tr350Width = this._getTr350Width();
			//console.log("tr350Width="+tr350Width)
			if(this.support3d && this.supportTrans) {

				leftCSS = {
					'-webkit-transform': 'translateX(-'+tr350Width+'px) translateZ(-200px) rotateY(45deg)',
					'-moz-transform': 'translateX(-'+tr350Width+'px) translateZ(-200px) rotateY(45deg)',
					'-o-transform': 'translateX(-'+tr350Width+'px) translateZ(-200px) rotateY(45deg)',
					'-ms-transform': 'translateX(-'+tr350Width+'px) translateZ(-200px) rotateY(45deg)',
					'transform': 'translateX(-'+tr350Width+'px) translateZ(-200px) rotateY(45deg)'
				};

				rightCSS = {
					'-webkit-transform': 'translateX('+tr350Width+'px) translateZ(-200px) rotateY(-45deg)',
					'-moz-transform': 'translateX('+tr350Width+'px) translateZ(-200px) rotateY(-45deg)',
					'-o-transform': 'translateX('+tr350Width+'px) translateZ(-200px) rotateY(-45deg)',
					'-ms-transform': 'translateX('+tr350Width+'px) translateZ(-200px) rotateY(-45deg)',
					'transform': 'translateX('+tr350Width+'px) translateZ(-200px) rotateY(-45deg)'
				};

				leftCSS.opacity = 1;
				leftCSS.visibility = 'visible';
				rightCSS.opacity = 1;
				rightCSS.visibility = 'visible';

			} else if(this.support2d && this.supportTrans) {

				leftCSS = {
					'-webkit-transform': 'translate(-'+tr350Width+'px) scale(0.8)',
					'-moz-transform': 'translate(-'+tr350Width+'px) scale(0.8)',
					'-o-transform': 'translate(-'+tr350Width+'px) scale(0.8)',
					'-ms-transform': 'translate(-'+tr350Width+'px) scale(0.8)',
					'transform': 'translate(-'+tr350Width+'px) scale(0.8)'
				};

				rightCSS = {
					'-webkit-transform': 'translate('+tr350Width+'px) scale(0.8)',
					'-moz-transform': 'translate('+tr350Width+'px) scale(0.8)',
					'-o-transform': 'translate('+tr350Width+'px) scale(0.8)',
					'-ms-transform': 'translate('+tr350Width+'px) scale(0.8)',
					'transform': 'translate('+tr350Width+'px) scale(0.8)'
				};

				currentCSS = {
					'z-index': 999
				};

				leftCSS.opacity = 1;
				leftCSS.visibility = 'visible';
				rightCSS.opacity = 1;
				rightCSS.visibility = 'visible';

			}

          if(this.itemsCount > 1)//2017-04-14 添加，1个面板时，会跑到右侧
          {
          	this.$leftItm.css(leftCSS || {});
			this.$rightItm.css(rightCSS || {});
          }
			

			this.$currentItm.css(currentCSS || {}).css({
				'opacity': 1,
				'visibility': 'visible'
			}).addClass('dg-center');

		},
		_setItems: function() {

			this.$items.removeClass('dg-center');
			/*2017-03-27 添加*/
			this.$items.removeClass('dg-left');
			this.$items.removeClass('dg-right');
			/*2017-04-01 添加*/
			this.$items.removeClass('dg-left-out');
			this.$items.removeClass('dg-right-out');

			this.$currentItm = this.$items.eq(this.current);
			this.$leftItm = (this.current === 0) ? this.$items.eq(this.itemsCount - 1) : this.$items.eq(this.current - 1);
			this.$rightItm = (this.current === this.itemsCount - 1) ? this.$items.eq(0) : this.$items.eq(this.current + 1);
               
			if(!this.support3d && this.support2d && this.supportTrans) {

				this.$items.css('z-index', 1);
				this.$currentItm.css('z-index', 999);

			}
			/*2017-03-29 添加 解决ie11下中间面板下凹的bug*/
             var a1 = navigator.userAgent;
             var yesIE11 = a1.search(/Trident/i);
             if(yesIE11 > 0){
             	this.$items.css('z-index', 1);
				this.$currentItm.css('z-index', 999);
             }
			// next & previous items
			if(this.itemsCount > 3) {

				// next item
				this.$nextItm = (this.$rightItm.index() === this.itemsCount - 1) ? this.$items.eq(0) : this.$rightItm.next();
				this.$nextItm.addClass('dg-right-out').css(this._getCoordinates('outright'));

				// previous item
				this.$prevItm = (this.$leftItm.index() === 0) ? this.$items.eq(this.itemsCount - 1) : this.$leftItm.prev();
				this.$prevItm.addClass('dg-left-out').css(this._getCoordinates('outleft'));

			}
            /*2017-03-27 添加*/
           this.$leftItm.addClass('dg-left');
           this.$rightItm.addClass('dg-right');
		},
		_loadEvents: function() {

			var _self = this;

			this.$navPrev.on('click.gallery', function(event) {

				if(_self.index == 0) {
					return false;
				}
				if(_self.options.autoplay) {

					clearTimeout(_self.slideshow);
					_self.options.autoplay = false;

				}
				console.log("$navPrev")
				_self._navigate('prev');
				return false;

			});

			this.$navNext.on('click.gallery', function(event) {

				if(_self.options.autoplay) {

					clearTimeout(_self.slideshow);
					_self.options.autoplay = false;

				}
				console.log("$navNext")
				_self._navigate('next');
				return false;

			});

			this.$wrapper.on('webkitTransitionEnd.gallery transitionend.gallery OTransitionEnd.gallery', function(event) {

				_self.$currentItm.addClass('dg-center');
				_self.$items.removeClass('dg-transition');
				_self.isAnim = false;

			});
		},
		_getTr350Width:function(){
			 // console.log('this.options.reWidth='+this.options.reWidth+"this.tr350Factor="+this.tr350Factor)
			return this.options.reWidth * this.$tr350Factor;
		},
		_getTr450Width:function(){
			return this.options.reWidth * this.$tr450Factor;
		},
		_getCoordinates: function(position) {
            	var tr350Width = this._getTr350Width();
				var tr450Width = this._getTr450Width();
				//console.log("tr350Width1="+tr350Width)
				//console.log("tr450Width1="+tr450Width)
			if(this.support3d && this.supportTrans) {

				switch(position) {
					case 'outleft':
						return {
							'-webkit-transform': 'translateX(-'+tr450Width+'px) translateZ(-300px) rotateY(45deg)',
							'-moz-transform': 'translateX(-'+tr450Width+'px) translateZ(-300px) rotateY(45deg)',
							'-o-transform': 'translateX(-'+tr450Width+'px) translateZ(-300px) rotateY(45deg)',
							'-ms-transform': 'translateX(-'+tr450Width+'px) translateZ(-300px) rotateY(45deg)',
							'transform': 'translateX(-'+tr450Width+'px) translateZ(-300px) rotateY(45deg)',
							'opacity': 0,
							'visibility': 'hidden'
						};
						break;
					case 'outright':
						return {
							'-webkit-transform': 'translateX('+tr450Width+'px) translateZ(-300px) rotateY(-45deg)',
							'-moz-transform': 'translateX('+tr450Width+'px) translateZ(-300px) rotateY(-45deg)',
							'-o-transform': 'translateX('+tr450Width+'px) translateZ(-300px) rotateY(-45deg)',
							'-ms-transform': 'translateX('+tr450Width+'px) translateZ(-300px) rotateY(-45deg)',
							'transform': 'translateX('+tr450Width+'px) translateZ(-300px) rotateY(-45deg)',
							'opacity': 0,
							'visibility': 'hidden'
						};
						break;
					case 'left':
						return {
							'-webkit-transform': 'translateX(-'+tr350Width+'px) translateZ(-200px) rotateY(45deg)',
							'-moz-transform': 'translateX(-'+tr350Width+'px) translateZ(-200px) rotateY(45deg)',
							'-o-transform': 'translateX(-'+tr350Width+'px) translateZ(-200px) rotateY(45deg)',
							'-ms-transform': 'translateX(-'+tr350Width+'px) translateZ(-200px) rotateY(45deg)',
							'transform': 'translateX(-'+tr350Width+'px) translateZ(-200px) rotateY(45deg)',
							'opacity': 1,
							'visibility': 'visible'
						};
						break;
					case 'right':
						return {
							'-webkit-transform': 'translateX('+tr350Width+'px) translateZ(-200px) rotateY(-45deg)',
							'-moz-transform': 'translateX('+tr350Width+'px) translateZ(-200px) rotateY(-45deg)',
							'-o-transform': 'translateX('+tr350Width+'px) translateZ(-200px) rotateY(-45deg)',
							'-ms-transform': 'translateX('+tr350Width+'px) translateZ(-200px) rotateY(-45deg)',
							'transform': 'translateX('+tr350Width+'px) translateZ(-200px) rotateY(-45deg)',
							'opacity': 1,
							'visibility': 'visible'
						};
						break;
					case 'center':
						return {
							'-webkit-transform': 'translateX(0px) translateZ(0px) rotateY(0deg)',
							'-moz-transform': 'translateX(0px) translateZ(0px) rotateY(0deg)',
							'-o-transform': 'translateX(0px) translateZ(0px) rotateY(0deg)',
							'-ms-transform': 'translateX(0px) translateZ(0px) rotateY(0deg)',
							'transform': 'translateX(0px) translateZ(0px) rotateY(0deg)',
							'opacity': 1,
							'visibility': 'visible'
						};
						break;
				};

			} else if(this.support2d && this.supportTrans) {

				switch(position) {
					case 'outleft':
						return {
							'-webkit-transform': 'translate(-'+tr450Width+'px) scale(0.7)',
							'-moz-transform': 'translate(-'+tr450Width+'px) scale(0.7)',
							'-o-transform': 'translate(-'+tr450Width+'px) scale(0.7)',
							'-ms-transform': 'translate(-'+tr450Width+'px) scale(0.7)',
							'transform': 'translate(-'+tr450Width+'px) scale(0.7)',
							'opacity': 0,
							'visibility': 'hidden'
						};
						break;
					case 'outright':
						return {
							'-webkit-transform': 'translate('+tr450Width+'px) scale(0.7)',
							'-moz-transform': 'translate('+tr450Width+'px) scale(0.7)',
							'-o-transform': 'translate('+tr450Width+'px) scale(0.7)',
							'-ms-transform': 'translate('+tr450Width+'px) scale(0.7)',
							'transform': 'translate('+tr450Width+'px) scale(0.7)',
							'opacity': 0,
							'visibility': 'hidden'
						};
						break;
					case 'left':
						return {
							'-webkit-transform': 'translate(-'+tr350Width+'px) scale(0.8)',
							'-moz-transform': 'translate(-'+tr350Width+'px) scale(0.8)',
							'-o-transform': 'translate(-'+tr350Width+'px) scale(0.8)',
							'-ms-transform': 'translate(-'+tr350Width+'px) scale(0.8)',
							'transform': 'translate(-'+tr350Width+'px) scale(0.8)',
							'opacity': 1,
							'visibility': 'visible'
						};
						break;
					case 'right':
						return {
							'-webkit-transform': 'translate('+tr350Width+'px) scale(0.8)',
							'-moz-transform': 'translate('+tr350Width+'px) scale(0.8)',
							'-o-transform': 'translate('+tr350Width+'px) scale(0.8)',
							'-ms-transform': 'translate('+tr350Width+'px) scale(0.8)',
							'transform': 'translate('+tr350Width+'px) scale(0.8)',
							'opacity': 1,
							'visibility': 'visible'
						};
						break;
					case 'center':
						return {
							'-webkit-transform': 'translate(0px) scale(1)',
							'-moz-transform': 'translate(0px) scale(1)',
							'-o-transform': 'translate(0px) scale(1)',
							'-ms-transform': 'translate(0px) scale(1)',
							'transform': 'translate(0px) scale(1)',
							'opacity': 1,
							'visibility': 'visible'
						};
						break;
				};

			} else {
              
				switch(position) {
					case 'outleft':
					case 'outright':
					case 'left':
					case 'right':
						return {
							'opacity': 0,
							'visibility': 'hidden'
						};
						break;
					case 'center':
						return {
							'opacity': 1,
							'visibility': 'visible'
						};
						break;
				};

			}

		},
		_navigate: function(dir, index) {

			if(this.supportTrans && this.isAnim)
			{
				console.log("进入")
				return false;
			}
			

			//this.isAnim = true;  注释，频繁点击 切换图片时，会空白的bug

			switch(dir) {

				case 'next':

					this.current = this.$rightItm.index();

					// current item moves left
					this.$currentItm.addClass('dg-transition').css(this._getCoordinates('left'));

					// right item moves to the center
					this.$rightItm.addClass('dg-transition').css(this._getCoordinates('center'));

					// next item moves to the right
					if(this.$nextItm) {

						// left item moves out
						this.$leftItm.addClass('dg-transition').css(this._getCoordinates('outleft'));

						this.$nextItm.addClass('dg-transition').css(this._getCoordinates('right'));

					} else {

						// left item moves right
						this.$leftItm.addClass('dg-transition').css(this._getCoordinates('right'));

					}
					break;

				case 'prev':
					this.current = this.$leftItm.index();

					// current item moves right
					this.$currentItm.addClass('dg-transition').css(this._getCoordinates('right'));

					// left item moves to the center
					this.$leftItm.addClass('dg-transition').css(this._getCoordinates('center'));

					// prev item moves to the left
					if(this.$prevItm) {

						// right item moves out
						this.$rightItm.addClass('dg-transition').css(this._getCoordinates('outright'));

						this.$prevItm.addClass('dg-transition').css(this._getCoordinates('left'));

					} else {

						// right item moves left
						this.$rightItm.addClass('dg-transition').css(this._getCoordinates('left'));

					}
					break;

				case 'random':
                    //console.log("coor:Center="+this._getCoordinates('center'))
					this.$currentItm.addClass('dg-transition').css(this._getCoordinates('center'));

					this.$rightItm.addClass('dg-transition').css(this._getCoordinates('right'));

					this.$leftItm.addClass('dg-transition').css(this._getCoordinates('left'));

					break;
			};
			if(dir == 'prev' || dir == 'next') {
				this._setItems();
			}

			if(!this.supportTrans) {
				this.$currentItm.addClass('dg-center');
			}

		},
		_startSlideshow: function() {

			var _self = this;

			this.slideshow = setTimeout(function() {

				_self._navigate('next');

				if(_self.options.autoplay) {

					_self._startSlideshow();

				}

			}, this.options.interval);

		},
		destroy: function() {

			this.$navPrev.off('.gallery');
			this.$navNext.off('.gallery');
			this.$wrapper.off('.gallery');

		},
		randomAccess: function(index) {
			//现将原来的图片隐藏掉
			console.log("this.current =" + this.current + "index=" + index)
			if(this.current == index) //防止用户对同一个图片，连续单击多次，图片都不显示的bug
			{
				return false;
			}
			if(this.itemsCount == 1){//只有1个元素时，不需要旋转
				return false;
			}
			this.$currentItm.addClass('dg-transition').css(this._getCoordinates('outleft'));
			this.$leftItm.addClass('dg-transition').css(this._getCoordinates('outleft'));
			this.$rightItm.addClass('dg-transition').css(this._getCoordinates('outright'));

			this.current = index;
			this._setItems();
			this._navigate('random', index);
		},
		reinit:function(index){
			
			this.$items = this.$wrapper.children();
			this.itemsCount = this.$items.length;
			// minimum of 3 items
//			if(this.itemsCount < 3) {
//
//				this.$nav.remove();
//				return false;
//
//			}
			this.current = 0;
			this.$items.css({
				'opacity': 0,
				'visibility': 'hidden'
			});
			this._layout();
		},
		navigate:function(name){
			this._navigate(name);
		},
		setClientWidth:function(w){
			this.options.reWidth = w;
		}
	};

	var logError = function(message) {
		if(this.console) {
			console.error(message);
		}
	};

	$.fn.gallery = function(options) {

		if(typeof options === 'string') {
			var args = Array.prototype.slice.call(arguments, 1);

			this.each(function() {

				var instance = $.data(this, 'gallery');

				if(!instance) {
					logError("cannot call methods on gallery prior to initialization; " +
						"attempted to call method '" + options + "'");
					return;
				}

				if(!$.isFunction(instance[options]) || options.charAt(0) === "_") {
					logError("no such method '" + options + "' for gallery instance");
					return;
				}

				instance[options].apply(instance, args);

			});

		} else {
			this.each(function() {

				var instance = $.data(this, 'gallery');
				if(!instance) {
					$.data(this, 'gallery', new $.Gallery(options, this));
				}

			});

		}
		return this;

	};

})(jQuery);