import { Migration } from '@mikro-orm/migrations';

export class Migration20260627145136 extends Migration {

  override up(): void | Promise<void> {
    this.addSql(`create table \`usuario\` (\`id\` int unsigned not null auto_increment primary key, \`name\` varchar(255) not null, \`es_admin\` tinyint(1) not null, \`esta_activo\` tinyint(1) not null) default character set utf8mb4 engine = InnoDB;`);
  }

  override down(): void | Promise<void> {
    this.addSql(`drop table if exists \`usuario\`;`);
  }

}
