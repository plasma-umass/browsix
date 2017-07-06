FROM ubuntu:14.04

SHELL ["/bin/bash", "-c"]
ENV DEBIAN_FRONTEND noninteractive
# ENV DEBIAN_FRONTEND newt
ENV CLICOLOR=1
ENV LSCOLORS=GxFxCxDxBxegedabagaced
ENV GREP_OPTIONS='--color=auto'

RUN \
  echo America/Los_Angeles | sudo tee /etc/timezone && \
  sudo dpkg-reconfigure --frontend noninteractive tzdata

RUN \
  apt-get update -qq -y && \
  apt-get upgrade -qq -y

RUN apt-get install -qq -y  \
  software-properties-common \
  vim \
  curl \
  wget \
  gawk \
  sed \
  findutils \
  bc \
  less \
  htop \
  man \
  unzip \
  git \
  lsb-release \
  build-essential \
  make \
  python-all \
  libssl-dev

RUN apt-get install -qq -y \
  openssh-server

ENV HOME /root
ENV NVM_DIR $HOME/.nvm
ENV NODE_VERSION v4.3.0
ENV YARN_VERSION 0.17.8

RUN wget -qO- https://raw.githubusercontent.com/creationix/nvm/v0.31.1/install.sh | /bin/bash
RUN source $NVM_DIR/nvm.sh; \
  nvm install $NODE_VERSION && \
  nvm alias default $NODE_VERSION && \
  nvm use default

RUN apt-get install -qq -y \
  ca-certificates \
  g++ \
  gcc \
  libc6-dev \
  curl \
  mercurial \
  bzr \
  git-core

ENV GOLANG_VERSION 1.6.4
ENV GOLANG_DOWNLOAD_URL https://storage.googleapis.com/golang/go$GOLANG_VERSION.linux-amd64.tar.gz

RUN curl -s $GOLANG_DOWNLOAD_URL | tar -C /usr/local -xz

ENV GOPATH /go
ENV GOROOT /usr/local/go
ENV PATH /usr/local/go/bin:/go/bin:/usr/local/bin:$PATH

RUN go get -u -x -v -a github.com/bpowers/browsix-gopherjs

RUN \
  source $NVM_DIR/nvm.sh; \
  echo "nvm: " `nvm --version` && \
  echo "node: " `node --version` && \
  echo "npm: " `npm --version` && \
  npm install -g \
    gulp@"^3.9.1" \
    bower@"^1.7.9" \
    source-map-support

RUN echo -e \
'{'\
'\n'\
'  "allow_root": true'\
'\n'\
'}' \
  >> $HOME/.bowerrc

RUN cat $HOME/.bowerrc

RUN \
  source $NVM_DIR/nvm.sh; \
  npm install -g \
    bfs-buffer@"^0.1.7" \
    bfs-path@"^0.1.2" \
    bower@"^1.7.9" \
    browser-sync@"^2.13.0" \
    browserfs@"0.5.15" \
    browserify@"^13.0.1" \
    chai@"^3.5.0" \
    connect-history-api-fallback@"^1.1.0" \
    del@"^2.2.1" \
    gulp@"^3.9.1" \
    gulp-autoprefixer@"^3.1.0" \
    gulp-cache@"^0.4.5" \
    gulp-changed@"^1.3.0" \
    gulp-chmod@"^1.3.0" \
    gulp-copy@"0.0.2" \
    gulp-cssmin@"^0.1.7" \
    gulp-if@"^2.0.0" \
    gulp-load-plugins@"^1.2.0" \
    gulp-minify-html@"^1.0.5" \
    gulp-mocha@"^2.2.0" \
    gulp-rename@"^1.2.2" \
    gulp-replace@"^0.5.4" \
    gulp-run@"^1.6.12" \
    gulp-size@"^2.0.0" \
    gulp-typescript@"2.13.6" \
    gulp-uglify@"^1.5.4" \
    gulp-useref@"^2.1.0" \
    gulp-util@"^3.0.6" \
    gulp-vulcanize@"^6.1.0" \
    karma@"^1.1.1" \
    karma-chai@"^0.1.0" \
    karma-chrome-launcher@"^1.0.1" \
    karma-firefox-launcher@"^1.0.0" \
    karma-mocha@"^1.1.1" \
    merge2@"^1.0.0" \
    mocha@"^2.5.3" \
    proxy-middleware@"^0.15.0" \
    through2@"^2.0.1" \
    typescript@"^1.8.10" \
    typings@"^1.3.1" \
    vinyl-buffer@"^1.0.0" \
    vinyl-source-stream@"^1.1.0" \
    node-binary-marshal@"^0.4.2" \
    term.js@"github:bpowers/term.js"

RUN \
  source $NVM_DIR/nvm.sh; \
  npm install -g \
    tsd@"^0.6.5" \
    gulp-tslint@"^6.0.1" \
    gulp-imagemin@"^2.4.0" \
    tslint@"^3.13.0"

# RUN \
#   source $NVM_DIR/nvm.sh; \
#   npm install -g \
#     node-pipe2@"^0.2.0" \
#     node-priority@"^0.1.5"

RUN mkdir -p $HOME/browsix $HOME/browsix-test

COPY . $HOME/browsix
WORKDIR $HOME/browsix
RUN ls

CMD /bin/bash
