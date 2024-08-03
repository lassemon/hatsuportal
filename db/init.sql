CREATE TABLE IF NOT EXISTS users (
  id           VARCHAR(255)    NOT NULL,
  name         VARCHAR(255)    NOT NULL,
  password     VARCHAR(255)    NOT NULL,
  email        VARCHAR(255)    NOT NULL,
  active       tinyint(1)      NOT NULL,
  roles        longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL CHECK (json_valid(roles)),
  createdAt    BIGINT UNSIGNED         NOT NULL,
  updatedAt    BIGINT UNSIGNED,
  PRIMARY KEY (id)
);

INSERT INTO users (id, name, password, email, active, roles, createdAt, updatedAt) VALUES
  ('a979c61f-9780-4a98-83ce-c933490c925f','system','$2a$10$lZzKUHY5zCIbCcfKmv2RaOH412mNfemffeQUBKpGqsWOrsZZGsJmO','admin@admin.com',1,'["super_admin", "admin", "creator"]',1707508500,1707511589),
  ('5c66958c-a703-46d3-bab5-18d2eea1884d','test','$2a$10$lZzKUHY5zCIbCcfKmv2RaOH412mNfemffeQUBKpGqsWOrsZZGsJmO','test@example.com',1,'["admin", "creator"]',1707508500,1707511589);


CREATE TABLE IF NOT EXISTS stories  (
  id                    VARCHAR(255)      NOT NULL,
  name                  VARCHAR(255)      NOT NULL,
  visibility            VARCHAR(255)      NOT NULL,
  imageId               VARCHAR(255),
  description           TEXT,
  createdBy             VARCHAR(255)      NOT NULL,
  createdAt             BIGINT UNSIGNED   NOT NULL,
  updatedAt             BIGINT UNSIGNED,
  PRIMARY KEY (id),
  KEY visibility (visibility),
  KEY updated (updatedAt)
);

INSERT INTO stories (
  id,
  name,
  visibility,
  imageId,
  description,
  createdBy,
  createdAt,
  updatedAt) VALUES
  ('252a58d0-d2d3-4f08-9b1e-59322b5900ec','Default Story','public',null,'Default story description','a979c61f-9780-4a98-83ce-c933490c925f',1707508500,1707511590),
  ('252a58d0-d2d3-4f08-9b2e-59322b5900ec','Private Story','private',null,'This is an story visible only to its creator','a979c61f-9780-4a98-83ce-c933490c925f',1707508501,1707511591),
  ('252a58d0-d2d3-4f08-9b3e-59322b5900ec','Logged In Story','logged_in',null,'This story is only visible if youre logged in','a979c61f-9780-4a98-83ce-c933490c925f',1707508502,1707511592),
  ('252a58d0-d2d3-4f08-9b4e-59322b5900ec','Story With Image','public','66403c46-97db-45ba-a646-5e10f229f490','This story has an image attached to it','a979c61f-9780-4a98-83ce-c933490c925f',1707508503,1707511593),
  ('252a58d0-d2d3-4f08-9b5e-59322b5900ec','Test Users Public Story','public',null,'This is an story created by the Test User that is visible to all','5c66958c-a703-46d3-bab5-18d2eea1884d',1707508500,1707511590),
  ('252a58d0-d2d3-4f08-9b6e-59322b5900ec','Test Users Private Story','private',null,'This is an story visible only to its creator','5c66958c-a703-46d3-bab5-18d2eea1884d',1707508501,1707511591),
  ('252a58d0-d2d3-4f08-9b7e-59322b5900ec','Test Users Logged In Story','logged_in',null,'This story is only visible if youre logged in','5c66958c-a703-46d3-bab5-18d2eea1884d',1707508502,1707511592);


CREATE TABLE IF NOT EXISTS images  (
  id            VARCHAR(255)    NOT NULL,
  fileName      VARCHAR(255)    NOT NULL,
  mimeType      VARCHAR(255)    NOT NULL,
  size          INT             NOT NULL,
  visibility    VARCHAR(255)    NOT NULL,
  ownerId       VARCHAR(255),
  ownerType     VARCHAR(255),
  createdBy     VARCHAR(255)      NOT NULL,
  createdAt     BIGINT UNSIGNED   NOT NULL,
  updatedAt     BIGINT UNSIGNED,
  PRIMARY KEY (id),
  KEY visibility (visibility),
  KEY updated (updatedAt)
);

INSERT INTO images (id, fileName, mimeType, size, visibility, ownerId, ownerType, createdBy, createdAt, updatedAt) VALUES
  ('66403c46-97db-45ba-a646-5e10f229f490','default','image/png',1537565,'public','252a58d0-d2d3-4f08-9b2e-59322b5900ec','story','a979c61f-9780-4a98-83ce-c933490c925f',1707499636,1707506272);
