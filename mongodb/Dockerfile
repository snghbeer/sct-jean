# Use the MongoDB image
FROM mongo:latest

# Install cron && curl
RUN apt-get update && apt-get install -y cron curl nano

# Copy the backup script
COPY backup.sh /usr/local/bin/backup.sh

# Copy the init script
COPY init-mongo.js /docker-entrypoint-initdb.d/
COPY restore.sh /docker-entrypoint-initdb.d/


RUN chmod +x /docker-entrypoint-initdb.d/init-mongo.js
RUN chmod +x /docker-entrypoint-initdb.d/restore.sh

# Create the log file to be able to run tail
RUN touch /var/log/cron.log

# Add the scheduler job entry to crontab
RUN echo '*/5 * * * * root /usr/local/bin/backup.sh >> /var/log/cron.log 2>&1' > /etc/cron.d/my-cron

# Give execution rights on the cron job
RUN chmod 0644 /etc/cron.d/my-cron

# Start cron in the background
CMD cron && tail -f /var/log/cron.log 

# Set the entrypoint script
COPY entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh
ENTRYPOINT ["/entrypoint.sh"]

