/**
 * Day - A jQuery date picker
 *
 * Copyright (C) 2011 by Markus Eliasson
 *
 * Licensed under the MIT license
 */
(function($){
  $.fn.day = function(callback) {
    var picker = undefined;
    var current_date = new Date();
    var current_year = current_date.getFullYear();
    var current_month = current_date.getMonth();
    var current_day = current_date.getDay();

    var month_names = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    var weekday_names = ['MO', 'TU', 'WE', 'TH', 'FR', 'SA', 'SU'];
    var visible = false;

    is_leap = function(year) {
      return (((year % 4 === 0) && (year % 100 !== 0)) ||
               (year % 400 === 0));
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

    generate_picker = function() {
      var p1 = '<div class="popup_day_selector"><table><thead><tr class="day_header"><td><a href="#" class="date_prev">&lt;</a></td>';
      var p2 = '<th colspan="5" class="day_month">{0}</th>';
      var p3 = '<td><a href="#" class="date_next">&gt;</a></td></tr><tr>';
      var p4 =  '<th>{0}</th>';
      var p6 = '</tr></thead><tbody><tr><td>0</td><td>0</td><td>0</td><td>0</td><td>0</td><td>0</td><td>0</td></tr><tr><td>0</td><td>0</td><td>0</td><td>0</td><td>0</td><td>0</td><td>0</td></tr><tr><td>0</td><td>0</td><td>0</td><td>0</td><td>0</td><td>0</td><td>0</td></tr><tr><td>0</td><td>0</td><td>0</td><td>0</td><td>0</td><td>0</td><td>0</td></tr><tr><td>0</td><td>0</td><td>0</td><td>0</td><td>0</td><td>0</td><td>0</td></tr>';

      var p7 = '</tbody></table></div>';

      var header = month_names[current_month] + ' ' + current_year;
      var picker_code = p1 + format_string(p2, header) + p3;
      for(var i = 0; i < weekday_names.length; i++) {
        picker_code += format_string(p4, weekday_names[i]);
      }
      picker_code += p6 + p7;
      return picker_code;
    };

    show_picker = function(source) {
      var picker_code = generate_picker();
      $(source).after(picker_code);
      var picker = $(source).siblings('.popup_day_selector');
      update_picker(picker);


      // Position the picker
      var position = $(source).position();
      var top = position.top - 40;
      var left = position.left + $(source).width() + 10;
      picker.css({
        'top': top,
        'left': left
      }).fadeIn('fast');
      visible = true;

      // Attach event listeners
      picker.find('a.date_prev').click(function() {
        if(current_month > 0) {
          current_month--;
        }
        else {
          current_month = 11;
          current_year--;
        }
        current_date = new Date(current_year, current_month, 1);
        update_picker(picker);
      });

      picker.find('a.date_next').click(function() {
        if(current_month < 11) {
          current_month++;
        }
        else {
          current_month = 0;
          current_year++;
        }
        current_date = new Date(current_year, current_month, 1);
        update_picker(picker);
      });
      return picker;
    };

    update_picker = function(root) {
      // Construct a new date object used for drawing this month
      var current_calendar_date = new Date(current_date.getFullYear(), current_date.getMonth(), 1);

      // Update year and month
      var m = root.find('th.day_month');
      m.html(month_names[current_month] + ' ' + current_year);

      var month_starts_at_day = current_calendar_date.getDay() - 1;
      if(month_starts_at_day === -1) { // Sundays
        month_starts_at_day = 6;
      }

      var nr_days_in_month = days_in_month(current_year, current_month);
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
        cell.click(select_date);
      }
    };

    select_date = function() {
      var selected_day =$(this).text();
      var date = new Date(current_date.getFullYear(), current_date.getMonth(), selected_day);

      $(picker).fadeOut('fast', function() {
        $(picker).remove();
        visible = false;
        callback(date);
      });
    };

    format_string = function() {
      var formatted = arguments[0];
      var args = Array.prototype.slice.call(arguments, 1);
      for(var i = 0; i < args.length; i++) {
        var regexp = new RegExp('\\{'+i+'\\}', 'gi');
        formatted = formatted.replace(regexp, args[i]);
      }
      return formatted;
    }

    // Add functionality to all datepickers
    return this.each(function() {
      source = this;

      // Launch calendar when clicked
      $(source).click(function(event) {
        event.stopPropagation();

        picker = show_picker(source);

        // Hide picker on click outside picker area
        picker.click(function(event){
          event.stopPropagation();
        });
        $('html').click(function() {
          $(picker).fadeOut('fast', function() {
            $(picker).remove();
            visible = false;
          });
        });

      });
    });
  };
})(jQuery);
