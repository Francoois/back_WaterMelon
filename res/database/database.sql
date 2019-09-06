create table users (
  id bigint(20) unsigned not null AUTO_INCREMENT,
  first_name VARCHAR(255) NOT NULL,
  last_name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  is_admin BOOLEAN NOT NULL,
  api_key VARCHAR(64),
  PRIMARY KEY (id)
) ENGINE=InnoDB;

CREATE TABLE wallets (
  id BIGINT(20) UNSIGNED NOT NULL AUTO_INCREMENT,
  user_id BIGINT(20) UNSIGNED NOT NULL,
  PRIMARY KEY (id)
) ENGINE=InnoDB;

CREATE TABLE cards (
  id BIGINT(20) UNSIGNED NOT NULL AUTO_INCREMENT,
  user_id BIGINT(20) UNSIGNED NOT NULL,
  last_4 CHAR(4) NOT NULL,
  brand ENUM('visa', 'master_card', 'american_express', 'union_pay', jcb) NOT NULL,
  expired_at DATE NOT NULL,
  PRIMARY KEY (id),
  FOREIGN KEY (user_id) REFERENCES users (id)
)
