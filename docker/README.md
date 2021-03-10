# sdg-frontend
这是sdg-frontend的镜像文件。其中，Dockerfile用于docker build。

## Build From Docker

Run following command to pull this image.

```bash
# pull the image based on version
sudo docker pull selfdriveguard/sdg-frontend:[version tag]
```

## How to run it with docker
```sh
# On Linux system
docker run -it --network="host" selfdriveguard/sdg-frontend:[version tag]

# On Windows/MacOS system
docker run -it -p 8090-8093:8090-8093 selfdriveguard/sdg-frontend:[version tag]
```

## how to build image
```sh
# build image
docker build -f /your/path/to/dockerfile -t [REPOSITORY:tag] .
# push image
docker login -u username -p password
docker push [REPOSITORY:tag]
```

