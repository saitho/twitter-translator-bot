FROM node AS builder

COPY . /
RUN npm install
RUN npm run build

FROM node:alpine
COPY --from=builder /dist /

# Configure cron
COPY docker/crontab /etc/cron/crontab

# Init cron
RUN crontab /etc/cron/crontab

CMD ["crond", "-f"]
