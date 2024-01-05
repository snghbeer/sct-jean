#!/bin/bash

# Define the search string and the replacement string
search="SERVERENDPOINT"

# Define the directory containing the JavaScript files
dir="/usr/share/nginx/html/static/js"

# Loop over all JavaScript files in the directory
for file in $dir/*.js
do
 echo "Processing $file file..."
 # Use sed to replace the search string with the replacement string in each file
 sed -i "s|$search|${REACT_APP_SERVER_URL}|g" $file
done

exec nginx -g 'daemon off;'