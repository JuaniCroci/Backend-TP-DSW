create database if not exists entreno2;
 
 use entreno2;
 
## uncomment if you are not using docker
create user if not exists dsw@'%' identified by 'dsw';
grant select, update, insert, delete on entreno2.* to dsw@'%';
 
 