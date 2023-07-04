#!/bin/sh
set -e

data_dir=$DATA_DIR
port=$RCLONE_PORT

# local is where all of our data will be stored
mkdir -p $data_dir/local;

# start rclone damon
cd $data_dir && rclone rcd $data_dir --rc-addr :$port --rc-no-auth &

exec "$@"
