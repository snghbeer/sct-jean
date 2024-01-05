# Step 1
FROM node:18.16.0-slim as build-step
RUN mkdir /app
COPY . /app

FROM nginx:1.17.1-alpine
# Remove default nginx website
RUN rm -rf /usr/share/nginx/html/*
# Copy the build output to replace the default Nginx website
COPY --from=build-step /app/build /usr/share/nginx/html

COPY env.sh /
#RUN chmod +x /usr/share/nginx/env.sh

CMD ["/bin/sh", "/env.sh"]

COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
