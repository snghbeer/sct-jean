#!/bin/bash

# Start cron in the background
cron && tail -f /var/log/cron.log &

# Run the restore script in the background
/docker-entrypoint-initdb.d/restore.sh &

# Start MongoDB as the main process
exec docker-entrypoint.sh mongod --auth 