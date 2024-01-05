#!/bin/bash

db_name="data_management"
BACKUP_DIR="/data/db/dump/${db_name}"

# Define MongoDB username and password
USERNAME="adminUser"
PASSWORD="StudentAdmin1EHB"

# Execute mongorestore command
if [ -d $BACKUP_DIR ]; then
  echo "Restoring database ${db_name}"
  mongorestore -u $USERNAME -p $PASSWORD --db $db_name --drop --preserveUUID $BACKUP_DIR
  if [ $? -eq 0 ]; then
    echo "Restore successful"
  else
    echo "Restore failed"
  fi
else
  echo "Backup directory does not exist."
fi