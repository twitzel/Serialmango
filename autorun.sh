#!/bin/bash
#script file to remove mongod.lock if it exists

#script file - notes
#         /home/pi/Serialmango/autorun.sh
#MUST : chmod 755 sutorun.sh
#TO RUN Manually:  /home/pi/Serialmango/autorun.sh


if [ -f  /data/db/mongod.lock ];
then
        rm  /data/db/mongod.lock
        echo  "File deleted"
else
        echo  "File does not exist"
fi
mongod &
node app cs4
