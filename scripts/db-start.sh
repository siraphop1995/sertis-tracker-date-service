#!/bin/bash

# Check if container exists
if docker inspect stt-mongo &>/dev/null
then
    # Check if container is running
    if ! docker top stt-mongo &>/dev/null
    then
        # Container is not running, start it back up
        docker start stt-mongo
    else
        echo "Mongodb is already running"
    fi
else
    # Container does not exist, start a new one
    docker run --name stt-mongo -p 27017:27017 -d mongo
fi
