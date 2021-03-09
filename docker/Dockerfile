FROM ubuntu:18.04

RUN useradd -ms /bin/bash sdg

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

# clone source code
RUN cd /home/sdg/ && \
  git clone git://github.com/SelfDriveGuard/sdg-frontend.git && \
  cd /home/sdg/sdg-frontend/ && \
  yarn --version && \
  yarn install

EXPOSE 8090-8093

USER sdg

COPY run.sh /home/sdg/
WORKDIR /home/sdg

CMD ["./run.sh"]

ENTRYPOINT ["/bin/bash", "-c"]
