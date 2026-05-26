docker run --name ps8-dsw-h4g ^
-v "C:\docker-volumes\ps8-dsw-h4g:/var/lib/mysql" ^
-e MYSQL_ALLOW_EMPTY_PASSWORD="yes" ^
-e MYSQL_PASSWORD="dsw" ^
-e MYSQL_USER="dsw" ^
-e MYSQL_DATABASE="entreno2" ^
-p 3307:3306 ^
-d percona/percona-server
