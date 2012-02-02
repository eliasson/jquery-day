day:
	lessc jquery.day.less > jquery.day.min.css
	uglifyjs -nc jquery.day.js > jquery.day.min.js

.PHONY: day
