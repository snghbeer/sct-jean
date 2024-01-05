#!/bin/bash

# Define MongoDB username and password
USERNAME="adminUser"
PASSWORD="StudentAdmin1EHB"
db_name="data_management"

# Execute mongodump command
BACKUP_DIR="/data/db/dump/"

if [ ! -d $BACKUP_DIR ]; then
  mkdir -p $BACKUP_DIR
fi

echo "Back up for ${db_name}"

mongodump --username $USERNAME --password $PASSWORD --db $db_name  --out $BACKUP_DIR