FROM node AS builder

WORKDIR /app
COPY . /app
RUN npm install
RUN npm run build

FROM node:alpine
COPY --from=builder /app/dist/index.js /index.js

# Configure cron
RUN mkdir -p /etc/cron
RUN echo "* * * * * (cd / && node /index.js) \
          # crontab requires an empty line at the end of the file \
" > /etc/cron/crontab

# Init cron
RUN crontab /etc/cron/crontab

CMD ["crond", "-f"]
