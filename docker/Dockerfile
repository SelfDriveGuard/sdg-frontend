FROM ubuntu:18.04

RUN useradd -ms /bin/bash carla

USER root

# non-interactive setting for tzdata
ENV DEBIAN_FRONTEND=noninteractive

RUN apt update && \
  apt install -y git curl wget

# install nodejs 12.x
RUN curl -sL https://deb.nodesource.com/setup_12.x |  bash - && \
  apt-get install -y nodejs

# install yarn
RUN curl -sS https://dl.yarnpkg.com/debian/pubkey.gpg | apt-key add - && \
  echo "deb https://dl.yarnpkg.com/debian/ stable main" | tee /etc/apt/sources.list.d/yarn.list && \
  apt-get update && apt-get install -y yarn

RUN echo "latest"

RUN apt-get update && \
  apt-get install -y tcptraceroute bc net-tools

RUN mkdir /root/.ssh/

ADD id_rsa /root/.ssh/id_rsa

RUN chmod 600 /root/.ssh/* && \
  touch /root/.ssh/known_hosts && \
  ssh-keyscan codeup.aliyun.com >> /root/.ssh/known_hosts

RUN cd /home/carla/ && \
  git clone git@codeup.aliyun.com:5f3f374f6207a1a8b17f933f/ADTest/ADTest_frontend.git

RUN cd /home/carla/ADTest_frontend/ && \
  yarn --version && \
  yarn config set registry 'https://registry.npm.taobao.org' && \
  yarn config get registry && \
  yarn install

EXPOSE 8090
EXPOSE 8091
EXPOSE 8092
EXPOSE 8093

USER carla

COPY run.sh /home/carla/
WORKDIR /home/carla

CMD ["./run.sh"]

ENTRYPOINT ["/bin/bash", "-c"]
