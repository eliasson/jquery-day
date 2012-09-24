/**
 * Day - A jQuery date picker
 *
 * Copyright (C) 2012 by Markus Eliasson
 *
 * Licensed under the MIT license
 */
(function($) {

  $.fn.day = function(callback) {
    $.fn.day.month_names = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    $.fn.day.weekday_names = ['MO', 'TU', 'WE', 'TH', 'FR', 'SA', 'SU'];

    return this.each(function() {
      var $this = $(this),
           data = $this.data('daydata');

      if(!data) {
        var current_date = new Date();
        data = {
          current_date : new Date(),
          current_year : current_date.getFullYear(),
          current_month : current_date.getMonth(),
          visible : false
        };
        $this.data('daydata', data);
      }

      $(this).click(function(event) {
        if($.fn.day.picker !== undefined) {
          $($.fn.day.picker).fadeOut('fast', function() {
            $($.fn.day.picker).remove();
            visible = false;
          });
        }

        event.stopPropagation();

        $.fn.day.picker = build_picker_markup($this, data, callback);

        $.fn.day.picker.click(function(event){
          event.stopPropagation();
        });

        $('html').click(function() {
          $($.fn.day.picker).fadeOut('fast', function() {
            $($.fn.day.picker).remove();
            data.visible = false;
          });
        });
      });
    });
  };

  is_leap = function(year) {
    return (((year % 4 === 0) && (year % 100 !== 0)) || (year % 400 === 0));
  };

  days_in_month = function(year, month) {
    if(month === 1) {
      return is_leap(year) ? 29 : 28;
    }
    else {
      var days = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
      return days[month];
    }
  };

  build_picker_markup = function(self, data, callback) {
    var p1 = '<div class="popup_day_selector"><table><thead><tr class="day_header"><td><a href="#" class="date_prev">&lt;</a></td>',
        p2 = '<th colspan="5" class="day_month">{0}</th>',
        p3 = '<td><a href="#" class="date_next">&gt;</a></td></tr><tr>',
        p4 =  '<th>{0}</th>',
        p6 = '</tr></thead><tbody><tr><td>0</td><td>0</td><td>0</td><td>0</td><td>0</td><td>0</td><td>0</td></tr><tr><td>0</td><td>0</td><td>0</td><td>0</td><td>0</td><td>0</td><td>0</td></tr><tr><td>0</td><td>0</td><td>0</td><td>0</td><td>0</td><td>0</td><td>0</td></tr><tr><td>0</td><td>0</td><td>0</td><td>0</td><td>0</td><td>0</td><td>0</td></tr><tr><td>0</td><td>0</td><td>0</td><td>0</td><td>0</td><td>0</td><td>0</td></tr>',
        p7 = '</tbody></table></div>';

    var header = $.fn.day.month_names[data.current_month] + ' ' + data.current_year
        picker_code = p1 + format_string(p2, header) + p3;

    for(var i = 0; i < $.fn.day.weekday_names.length; i++) {
      picker_code += format_string(p4, $.fn.day.weekday_names[i]);
    }

    picker_code += p6 + p7;

    $(self).after(picker_code);

    var picker = $(self).siblings('.popup_day_selector');
    update_picker(picker, data, callback);

    data.visible = true;

    // Attach event listeners
    picker.find('a.date_prev').click(function() {
      if(data.current_month > 0) {
        data.current_month--;
      }
      else {
        data.current_month = 11;
        data.current_year--;
      }
      data.current_date = new Date(data.current_year, data.current_month, 1);
      update_picker(picker, data, callback);
    });

    picker.find('a.date_next').click(function() {
      if(data.current_month < 11) {
        data.current_month++;
      }
      else {
        data.current_month = 0;
        data.current_year++;
      }
      data.current_date = new Date(data.current_year, data.current_month, 1);
      update_picker(picker, data, callback);
    });

    self.data('daydata', data);
    return picker;
  };

  update_picker = function(root, data, callback) {
    // Construct a new date object used for drawing this month
    var current_calendar_date = new Date(data.current_date.getFullYear(), data.current_date.getMonth(), 1);

    // Update year and month
    var m = root.find('th.day_month');
    m.html($.fn.day.month_names[data.current_month] + ' ' + data.current_year);

    var month_starts_at_day = current_calendar_date.getDay() - 1;
    if(month_starts_at_day === -1) { // Sundays
      month_starts_at_day = 6;
    }

    var nr_days_in_month = days_in_month(data.current_year, data.current_month);
    var nr_days_in_prev_month = days_in_month(current_calendar_date.getMonth() ? current_calendar_date.getFullYear() : current_calendar_date.getFullYear() -1,
                                             current_calendar_date.getMonth() ? current_calendar_date.getMonth() -1 : current_calendar_date.getMonth());

    // How many days from the previous month do we need to draw?
    var remaining_days = month_starts_at_day;

    var days_to_draw = [];

    // Push the last remaining days from last month to days
    for(var i = remaining_days; i > 0; i--) {
      days_to_draw.push(nr_days_in_prev_month - i + 1);
    }

    // Add the days for this month
    for(var i = 0; i < nr_days_in_month; i++) {
      days_to_draw.push(i + 1);
    }

    // Add the visible days for next month (total calendar month is 5x7=35)
    var extra_days = 0;
    while((days_to_draw.length % 7) != 0) {
      days_to_draw.push(++extra_days);
    }

    var tbody = root.find('tbody');
    tbody.empty();
    tbody.append('<tr></tr>');

    for(var i = 0; i < days_to_draw.length; i++) {
      if( (i % 7) === 0) {
        if(i < days_to_draw.length) {
          tbody.append('<tr></tr>');
        }
      }
      var day_class = '';
      if((i < remaining_days) || (i >= (nr_days_in_month + remaining_days))) {
        day_class = 'date_off';
      }
      var cell = tbody.find('tr:last').append(format_string('<td class="{0}">{1}</td>', day_class, days_to_draw[i])).find('td:last');
      cell.click(function() {
        var selected_day = $(this).text();
        if($(this).hasClass('date_off')) {
          if(parseInt(selected_day) > 15) { // previous month
            if(data.current_month > 0) {
              data.current_month--;
            }
            else {
              data.current_month = 11;
              data.current_year--;
            }
          }
          else {
            if(data.current_month < 11) {
              data.current_month++;
            }
            else {
              data.current_month = 0;
              data.current_year++;
            }
          }
          data.current_date = new Date(data.current_year, data.current_month, 1);
        }

        var date = new Date(data.current_date.getFullYear(), data.current_date.getMonth(), selected_day);

        $($.fn.day.picker).fadeOut('fast', function() {
          $($.fn.day.picker).remove();
          data.visible = false;
          callback(date);
        });
      });
    }
  };

  function format_string() {
    var formatted = arguments[0],
        args = Array.prototype.slice.call(arguments, 1);

    for(var i = 0; i < args.length; i++) {
      var regexp = new RegExp('\\{'+i+'\\}', 'gi');
      formatted = formatted.replace(regexp, args[i]);
    }
    return formatted;
  };

})(jQuery);
