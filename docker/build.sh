#!/bin/sh

# hack to invalidate Docker cache
touch README.md

echo "-------"
echo "tagging: "
REPO_NAME=$(basename `git rev-parse --show-toplevel`)
GIT_REV=$(git rev-parse --short HEAD)

IMAGE_NAME="$REPO_NAME:$GIT_REV"
echo $IMAGE_NAME
echo "-------"

echo "---------"
echo "building: "
docker \
  build -t $IMAGE_NAME \
  -f ./docker/Dockerfile \
  .
echo "---------"

echo "-------"
echo "running: "
docker run -t -i $IMAGE_NAME
echo "-------"
