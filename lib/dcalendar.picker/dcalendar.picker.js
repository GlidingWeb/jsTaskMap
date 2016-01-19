/* -- DO NOT REMOVE --
 * jQuery DCalendar 1.1 and DCalendar Picker 1.1 plugin
 * 
 * Author: Dionlee Uy
 * Email: dionleeuy@gmail.com
 *
 * Date: Sat Mar 2 2013
 *
 * @requires jQuery
 * -- DO NOT REMOVE --
 */
if (typeof jQuery === 'undefined') { throw new Error('DCalendar.Picker: This plugin requires jQuery'); }
 
+function ($) {

	Date.prototype.getDays = function() { return new Date(this.getFullYear(), this.getMonth() + 1, 0).getDate(); };
	var months = ['January','February','March','April','May','June','July','August','September','October','November','December'],
		short_months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'],
		daysofweek = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'],

		DCalendar = function(elem, options) {
		    this.calendar = $(elem);
			this.today = new Date();	//system date
			this.date = this.today;		//current selected date, default is today
			this.viewMode = 'days';
			this.options = options;
			this.selected = (this.date.getMonth() + 1) + "/" + this.date.getDate() + "/" + this.date.getFullYear();
			
			if(options.mode === 'calendar')
				this.tHead = $('<thead><tr><th id="prev">&lsaquo;</th><th colspan="5" id="currM"></th><th id="next">&rsaquo;</th></tr><tr><th>Su</th><th>Mo</th><th>Tu</th><th>We</th><th>Th</th><th>Fr</th><th>Sa</th></tr></thead>');
			else if (options.mode === 'datepicker')
				this.tHead = $('<thead><tr><th id="prev">&lsaquo;</th><th colspan="5" id="currM"></th><th id="next">&rsaquo;</th></tr><tr><th>S</th><th>M</th><th>T</th><th>W</th><th>T</th><th>F</th><th>S</th></tr></thead>');
			this.tHead.find('#currM').text(months[this.today.getMonth()] +" " + this.today.getFullYear());
			this.calendar.prepend(this.tHead);
			var that = this;

			this.calendar.on('click', '#next', function() { initCreate('next'); })
				.on('click', '#prev', function() { initCreate('prev'); })
				.on('click', '#today', function() {
					that.viewMode = 'days';
					var curr = new Date(that.date),
						sys = new Date(that.today);
					if(curr.toString() != sys.toString()) { that.date = sys; }
					that.create('days');
				}).on('click', '.date, .pMDate, .nMDate', function() {
					var tClass = $(this).attr('class'),
						sdate = $(this).text(),
						cmonth = that.date.getMonth(),
						cyear = that.date.getFullYear();

					/* Calculate year */
					if(tClass === 'pMDate') { cyear = (cmonth === 0 ? cyear - 1 : cyear); }
					else if(tClass === 'nMDate') { cyear = (cmonth + 2 === 13 ? cyear + 1 : cyear); }
					/* Calculate month */
					if(tClass === 'pMDate'){ cmonth = (cmonth === 0 ? '12' : cmonth); }
					else if (tClass === 'nMDate') { cmonth = (cmonth + 2 === 13 ? '1' : cmonth + 2); }
					else { cmonth = cmonth + 1; }

					// Selected date
					that.selected = cmonth + '/' + sdate + '/' + cyear;

					if(that.options.mode === 'datepicker') {
						that.calendar.find('td').removeClass('selected');
						$(this).addClass('selected');
					}
					selectDate();
					return true;
				}).on('click', '#currM', function(){
					that.viewMode = 'months';
					that.create(that.viewMode);
				}).on('click', '.month', function(e){
					that.viewMode = 'days';
					var curr = new Date(that.date), y = that.calendar.find('#currM').text();
					curr.setMonth($(e.currentTarget).attr('num'));
					that.date = curr;
					that.create(that.viewMode);
				});

			function selectDate () {
				var newDate = formatDate(that.options.format);
				var e = $.Event('selectdate', {date: newDate});
				that.calendar.trigger(e);
			}

			function formatDate (format) {
				var d = new Date(that.selected), day = d.getDate(), m = d.getMonth(), y = d.getFullYear();
				return format.replace(/(yyyy|yy|mmmm|mmm|mm|m|dd|d|w)/gi, function (e) {
					switch(e.toLowerCase()){
                                                case 'w': return daysofweek[d.getDay()];
						case 'd': return day;
						case 'dd': return (day < 10 ? "0"+day: day);
						case 'm': return m+1;
						case 'mm': return (m+1 < 10 ? "0"+(m+1): (m+1));
						case 'mmm': return short_months[m];
						case 'mmmm': return months[m];
						case 'yy': return y.toString().substr(2,2);
						case 'yyyy': return y;
					}
				});
			}

			function initCreate(o){
				var curr = new Date(that.date),
					currMonth = curr.getMonth(),
					currYear = curr.getFullYear();
				curr.setDate(1);
				if(that.viewMode === 'days') {
					curr.setMonth(currMonth + (o === 'next' ? 1 : -1));
				} else {
					curr.setFullYear(currYear + (o === 'next' ? 1 : - 1));
				}
				that.date = curr;
				that.create(that.viewMode);
			}

			this.create(this.viewMode);
		}

	DCalendar.prototype = {

		constructor : DCalendar, 

		//setDate : function(){},

		create : function(mode){
			var that = this, cal = [], tBody = $('<tbody></tbody>'), d = new Date(that.date), days = that.date.getDays(), day = 1, nStartDate = 1, selDate = that.selected.split('/');
			that.calendar.empty();
			if(mode === "days") {
				if(that.options.mode === 'calendar') {
					that.tHead = $('<thead><tr><th id="prev">&lsaquo;</th><th colspan="5" id="currM"></th><th id="next">&rsaquo;</th></tr><tr><th>Su</th><th>Mo</th><th>Tu</th><th>We</th><th>Th</th><th>Fr</th><th>Sa</th></tr></thead>');
				} else if (that.options.mode === 'datepicker') {
					that.tHead = $('<thead><tr><th id="prev">&lsaquo;</th><th colspan="5" id="currM"></th><th id="next">&rsaquo;</th></tr><tr><th>S</th><th>M</th><th>T</th><th>W</th><th>T</th><th>F</th><th>S</th></tr></thead>');
				}
				that.tHead.find('#currM').text(months[that.date.getMonth()] +" " + that.date.getFullYear());
				that.calendar.append(that.tHead);

				for(var i = 1; i <= 6; i++){
					var temp = [$('<td></td>'),$('<td></td>'),$('<td></td>'),$('<td></td>'),$('<td></td>'),$('<td></td>'),$('<td></td>')];

					while(day <= days){
						d.setDate(day);
						var dayOfWeek = d.getDay();
						if(day === that.today.getDate() 
							&& d.getMonth() === that.today.getMonth() 
							&& d.getFullYear() === that.today.getFullYear()) {
							temp[dayOfWeek].attr('id', 'currDay');
						} 
						if(that.options.mode === 'datepicker'
							&& (((d.getMonth() + 1) + "/" + day + "/" + d.getFullYear()) === (selDate[0] + "/" + selDate[1] + "/" + selDate[2]))) {
							temp[dayOfWeek].addClass('selected');
						}
						if(i === 1 && dayOfWeek === 0){
							break;
						} else if(dayOfWeek < 6){
							temp[dayOfWeek].html('<span>'+(day++)+'</span>').addClass('date');
						} else {
							temp[dayOfWeek].html('<span>'+(day++)+'</span>').addClass('date');
							break;
						}
					}
					/* For days of previous and next month */
					if (i === 1 || i > 4) {
						var p = new Date(that.date);
						// First week
						if (i === 1) {
							var pMonth = p.getMonth(), pDays = 0;
							p.setDate(1);
							p.setMonth(pMonth - 1);
							pDays = p.getDays();
							for (var a = 6; a >= 0; a--) {
								if (temp[a].text() === ''){
									temp[a].html('<span>' + (pDays--) + '</span>').addClass('pMDate');
									if (that.options.mode === 'datepicker' 
										&& (((d.getMonth()) + "/" + (pDays + 1) + "/" + d.getFullYear()) === (selDate[0] + "/" + selDate[1] + "/" + selDate[2]))) {
										temp[a].addClass('selected');
									}
								}
							}
						} 
						// Last week
						else if (i > 4) {
							for (var a = 0; a <= 6; a++) {
								if (temp[a].text() === ''){
									temp[a].html('<span>' + (nStartDate++) + '</span>').addClass('nMDate');
									if (that.options.mode === 'datepicker' 
										&& (((d.getMonth()+2) + "/" + (nStartDate - 1) + "/" + d.getFullYear()) === (selDate[0] + "/" + selDate[1] + "/" + selDate[2]))) {
										temp[a].addClass('selected');
									}
								}
							}
						}
					}
					cal.push(temp);
				}

				$.each(cal, function(i, v){
					var row = $('<tr></tr>'), l = v.length;
					for(var i = 0; i < l; i++) { row.append(v[i]); }
					tBody.append(row);
				});

				var sysDate = "Today: " + daysofweek[that.today.getDay()] + ", " + months[that.today.getMonth()] + " " + that.today.getDate() + ", " + that.today.getFullYear();
				tBody.append('<tr><td colspan="7" id="today">' + sysDate + '</td></tr>').appendTo(that.calendar);
			} else {
				this.tHead = $('<thead><tr><th id="prev">&lsaquo;</th><th colspan="2" id="currM"></th><th id="next">&rsaquo;</th></tr>');
				that.tHead.find('#currM').text(that.date.getFullYear());
				that.tHead.appendTo(that.calendar);
				var currI = 0;
				for (var i = 0; i < 3; i++) {
					var row = $('<tr></tr>');
					for (var x = 0; x < 4; x++) {
						var col = $('<td align="center"></td>');
						var m = $('<span class="month" num="' + currI + '">' + short_months[currI] + '</span>');
						col.append(m).appendTo(row);
						currI++;
					}
					tBody.append(row);
				}
				var sysDate = "Today: " + daysofweek[that.today.getDay()] + ", "+ months[that.today.getMonth()] + " " + that.today.getDate() + ", " + that.today.getFullYear();
				tBody.append('<tr><td colspan="4" id="today">' + sysDate + '</td></tr>').appendTo(that.calendar);
			}
		}
	}

	/* DEFINITION FOR DCALENDAR */
	$.fn.dcalendar = function(opts){
		return $(this).each(function(index, elem){
			var that = this;
 			var $this = $(that),
 				data = $(that).data('dcalendar'),
 				options = $.extend({}, $.fn.dcalendar.defaults, $this.data(), typeof opts === 'object' && opts);
 			if(!data){
 				$this.data('dcalendar', (data = new DCalendar(this, options)));
 			}
 			if(typeof opts === 'string') data[opts]();
		});
	}

	$.fn.dcalendar.defaults = {
		mode : 'calendar',
		format: 'mm/dd/yyyy',
	};

	$.fn.dcalendar.Constructor = DCalendar;

	/* DEFINITION FOR DCALENDAR PICKER */
	$.fn.dcalendarpicker = function(opts){
		return $(this).each(function(){
			var that = $(this);
			var cal = $('<table class="calendar"></table>'), hovered = false, selectedDate = false;
			that.wrap($('<div class="datepicker" style="display:inline-block;position:relative;"></div>'));
			cal.css({
				position:'absolute',
				left:0, display:'none',
				'box-shadow':'0 4px 6px 1px rgba(0, 0, 0, 0.14)',
				width:'230px',
			}).appendTo(that.parent());
			if(opts){
				opts.mode = 'datepicker';
				cal.dcalendar(opts);
			} else{
				cal.dcalendar({mode: 'datepicker'});
			}
			cal.hover(function(){
				hovered = true;
			}, function(){
				hovered = false;
			}).on('click', function(){
				if(!selectedDate)
					that.focus();
				else {
					selectedDate = false;
					$(this).hide();
				}
			}).on('selectdate', function(e){
				that.val(e.date).trigger('onchange');
			    that.trigger($.Event('dateselected', {date: e.date, elem: that}));
				selectedDate = true;
			});
			that.on('keydown', function(e){ if(e.which) return false; })
				.on('focus', function(){
					$('.datepicker').find('.calendar').not(cal).hide();
					cal.show();
				})
				.on('blur', function(){ if(!hovered) cal.hide(); });
		});
	}

}(jQuery);