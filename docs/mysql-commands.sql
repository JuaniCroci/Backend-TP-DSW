create database if not exists entreno2;
 
 use entreno2;
 
 ## uncomment if you are not using conteinerized mysql and you want to create a user for this database
##create user if not exists dsw@'%' identified by 'dsw';
##grant select, update, insert, delete on entreno2.* to dsw@'%';
 
 
 create table if not exists `entreno2`.`usuarios` (
 `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
 `name` VARCHAR(255) NULL,
 `esAdmin` TINYINT(1) NOT NULL,
 `estaActivo` TINYINT(1) NOT NULL DEFAULT 1,
 PRIMARY KEY (`id`));
 ## mysql usa TINYINT(1) para representar booleanos, donde 0 es falso  y 1 es verdadero.

 
 insert into entreno2.usuarios values(1,'Carlos',1,1);

 