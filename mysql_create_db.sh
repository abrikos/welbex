#!/bin/bash
source .env
read -p 'password: ' password
params=()
if ! test -z "$password"
then
    params+=(--password=$password)
    set -- "$@" --param2
fi

mysql --user=root "${params[@]}" -e  "CREATE USER IF NOT EXISTS '${MYSQL_USER}'@'${MYSQL_HOST}' IDENTIFIED BY '${MYSQL_PASSWORD}';"
mysql --user=root "${params[@]}" -e  "CREATE DATABASE IF NOT EXISTS  ${MYSQL_DB};"
mysql --user=root "${params[@]}" -e  "GRANT ALL PRIVILEGES ON ${MYSQL_DB}.* TO '${MYSQL_USER}'@'${MYSQL_HOST}';"
mysql --user=root "${params[@]}" -e "FLUSH PRIVILEGES;"
