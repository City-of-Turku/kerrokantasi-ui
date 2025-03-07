# ===============================================
FROM helsinkitest/node:14-slim as staticbuilder
# ===============================================

# Offical image has npm log verbosity as info. More info - https://github.com/nodejs/docker-node#verbosity
ENV NPM_CONFIG_LOGLEVEL warn

# set our node environment, either development or production
# defaults to production, compose overrides this to development on build and run
ARG NODE_ENV=development
ENV NODE_ENV $NODE_ENV

# Yarn
ENV YARN_VERSION 1.19.1
RUN yarn policies set-version $YARN_VERSION

USER root
RUN apt-install.sh build-essential
RUN git clone -c http.sslverify=false https://github.com/markushhgo/kerrokantasi-ui-turku /kerrokantasi-ui-turku

# Install dependencies
COPY package.json yarn.lock /app/
RUN yarn install --frozen-lockfile && yarn cache clean --force
RUN yarn add /kerrokantasi-ui-turku

# Copy all files
COPY . .

# Compile bundle
RUN yarn build

# Start express server
CMD [ "yarn", "start" ]

# Expose port 8086
EXPOSE 8086
