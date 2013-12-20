#!/bin/bash
#script file to remove mongod.lock if it exists
if [ -f  /data/db/mongod.lock ];
then
	rm  /data/db/mongod.lock
	echo  "File deleted"
else
	echo  "File does not exist"
fi
cd Serialmango
mongod &
node app cs4
