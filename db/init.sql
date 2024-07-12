CREATE TABLE IF NOT EXISTS users (
  id           VARCHAR(255)    NOT NULL,
  name         VARCHAR(255)    NOT NULL,
  password     VARCHAR(255)    NOT NULL,
  email        VARCHAR(255)    NOT NULL,
  active       tinyint(1)      NOT NULL,
  roles        longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL CHECK (json_valid(roles)),
  createdAt    INT(11)         NOT NULL,
  updatedAt    INT(11),
  PRIMARY KEY (id)
);

INSERT INTO users (id, name, password, email, active, roles, createdAt, updatedAt) VALUES
  ('0','system','$2a$10$lZzKUHY5zCIbCcfKmv2RaOH412mNfemffeQUBKpGqsWOrsZZGsJmO','admin@admin.com',1,'["superAdmin", "admin", "creator"]',1707508500,1707511589),
  ('1','test','$2a$10$lZzKUHY5zCIbCcfKmv2RaOH412mNfemffeQUBKpGqsWOrsZZGsJmO','test@example.com',1,'["admin", "creator"]',1707508500,1707511589);


CREATE TABLE IF NOT EXISTS items  (
  id                    VARCHAR(255)      NOT NULL,
  name                  VARCHAR(255)      NOT NULL,
  visibility            VARCHAR(255)      NOT NULL,
  imageId               VARCHAR(255),
  description           TEXT,
  createdBy             VARCHAR(255)      NOT NULL,
  createdAt             INT(11)           NOT NULL,
  updatedAt             INT(11),
  PRIMARY KEY (id),
  KEY visibility (visibility),
  KEY updated (updatedAt)
);

INSERT INTO items (
  id,
  name,
  visibility,
  imageId,
  description,
  createdBy,
  createdAt,
  updatedAt) VALUES
  (
    'defaultItem',
    'Default Item',
    'public',
    'defaultItemImage',
    'Wondrous item',
    '0',
    1707508500,
    1707511589
    );


CREATE TABLE IF NOT EXISTS images  (
  id            VARCHAR(255)    NOT NULL,
  fileName      VARCHAR(255)    NOT NULL,
  mimeType      VARCHAR(255)    NOT NULL,
  size          INT             NOT NULL,
  visibility    VARCHAR(255)    NOT NULL,
  ownerId       VARCHAR(255),
  ownerType     VARCHAR(255),
  createdBy     VARCHAR(255)      NOT NULL,
  createdAt     INT(11)         NOT NULL,
  updatedAt     INT(11),
  PRIMARY KEY (id),
  KEY visibility (visibility),
  KEY updated (updatedAt)
);

INSERT INTO images (id, fileName, mimeType, size, visibility, ownerId, ownerType, createdBy, createdAt, updatedAt) VALUES
  ('defaultItemImage','defaultitem.png','image/png',1537565,'public','defaultItem','item','0',1707499636,1707506272);
