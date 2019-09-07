create table users 
(
  id bigint(20) unsigned not null AUTO_INCREMENT,
  first_name varchar(255) not null,
  last_name varchar(255) not null,
  email varchar(255) UNIQUE not null,
  password varchar(255) not null,
  is_admin boolean not null,
  api_key varchar(64),
  primary key (id)
) ENGINE=InnoDB;

create table wallets
(
  id bigint(20) unsigned not null AUTO_INCREMENT,
  user_id bigint(20) unsigned not null,
  primary key (id)
) ENGINE=InnoDB;

create table cards
(
  id bigint(20) unsigned not null AUTO_INCREMENT,
  user_id bigint(20) unsigned not null,
  last_4 char(4) not null,
  brand ENUM('visa', 'master_card', 'american_express', 'union_pay', 'jcb') not null,
  expired_at date not null,
  primary key (id)
) ENGINE=InnoDB;

create table payins
(
  id bigint(20) unsigned not null AUTO_INCREMENT,
  wallet_id bigint(20) unsigned not null,
  amount bigint(20) not null,
  primary key (id)
) ENGINE=InnoDB;

create table payouts
(
  id bigint(20) unsigned not null AUTO_INCREMENT,
  wallet_id bigint(20) unsigned not null,
  amount bigint(20) not null,
  primary key (id)
) ENGINE=InnoDB;

create table transfers
(
  id bigint(20) unsigned not null AUTO_INCREMENT,
  debited_wallet_id bigint(20) unsigned not null,
  credited_wallet_id bigint(20) unsigned not null,
  amount bigint(20) not null,
  primary key (id)
) ENGINE=InnoDB;

ALTER TABLE `wallets` ADD FOREIGN KEY (`user_id`) REFERENCES `users` (`id`);
ALTER TABLE `cards` ADD FOREIGN KEY (`user_id`) REFERENCES `users` (`id`);
ALTER TABLE `payins` ADD FOREIGN KEY (`wallet_id`) REFERENCES `wallets` (`id`);
ALTER TABLE `payouts` ADD FOREIGN KEY (`wallet_id`) REFERENCES `wallets` (`id`);
ALTER TABLE `transfers` ADD FOREIGN KEY (`debited_wallet_id`) REFERENCES `wallets` (`id`);
ALTER TABLE `transfers` ADD FOREIGN KEY (`credited_wallet_id`) REFERENCES `wallets` (`id`);
