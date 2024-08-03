INSERT INTO
  users (
    id,
    name,
    password,
    email,
    active,
    roles,
    created_at,
    updated_at
  )
VALUES
  (
    'a979c61f-9780-4a98-83ce-c933490c925f',
    'system',
    '$2a$10$lZzKUHY5zCIbCcfKmv2RaOH412mNfemffeQUBKpGqsWOrsZZGsJmO',
    'admin@admin.com',
    TRUE,
    '["super_admin","admin","creator"]'::jsonb,
    1707508500,
    1707511589
  ),
  (
    '5c66958c-a703-46d3-bab5-18d2eea1884d',
    'test',
    '$2a$10$lZzKUHY5zCIbCcfKmv2RaOH412mNfemffeQUBKpGqsWOrsZZGsJmO',
    'test@example.com',
    TRUE,
    '["admin","creator"]'::jsonb,
    1707508500,
    1707511589
  );

INSERT INTO
  posts (
    id,
    title,
    visibility,
    post_type,
    created_by_id,
    created_at,
    updated_at
  )
VALUES
  (
    '252a58d0-d2d3-4f08-9b1e-59322b5900ec',
    'Default Story',
    'public',
    'story',
    'a979c61f-9780-4a98-83ce-c933490c925f',
    1707508500,
    1707511590
  ),
  (
    '252a58d0-d2d3-4f08-9b2e-59322b5900ec',
    'Private Story',
    'private',
    'story',
    'a979c61f-9780-4a98-83ce-c933490c925f',
    1707508501,
    1707511591
  ),
  (
    '252a58d0-d2d3-4f08-9b3e-59322b5900ec',
    'Logged In Story',
    'logged_in',
    'story',
    'a979c61f-9780-4a98-83ce-c933490c925f',
    1707508502,
    1707511592
  ),
  (
    '252a58d0-d2d3-4f08-9b4e-59322b5900ec',
    'Story With Image',
    'public',
    'story',
    'a979c61f-9780-4a98-83ce-c933490c925f',
    1707508503,
    1707511593
  ),
  (
    '252a58d0-d2d3-4f08-9b5e-59322b5900ec',
    'Test Users Public Story',
    'public',
    'story',
    '5c66958c-a703-46d3-bab5-18d2eea1884d',
    1707508500,
    1707511590
  ),
  (
    '252a58d0-d2d3-4f08-9b6e-59322b5900ec',
    'Test Users Private Story',
    'private',
    'story',
    '5c66958c-a703-46d3-bab5-18d2eea1884d',
    1707508501,
    1707511591
  ),
  (
    '252a58d0-d2d3-4f08-9b7e-59322b5900ec',
    'Test Users Logged In Story',
    'logged_in',
    'story',
    '5c66958c-a703-46d3-bab5-18d2eea1884d',
    1707508502,
    1707511592
  );

INSERT INTO
  stories (
    id,
    body
  )
VALUES
  (
    '252a58d0-d2d3-4f08-9b1e-59322b5900ec',
    'Default story description'
  ),
  (
    '252a58d0-d2d3-4f08-9b2e-59322b5900ec',
    'This is an story visible only to its creator'
  ),
  (
    '252a58d0-d2d3-4f08-9b3e-59322b5900ec',
    'This story is only visible if youre logged in'
  ),
  (
    '252a58d0-d2d3-4f08-9b4e-59322b5900ec',
    'This story has an image attached to it'
  ),
  (
    '252a58d0-d2d3-4f08-9b5e-59322b5900ec',
    'This is an story created by the Test User that is visible to all'
  ),
  (
    '252a58d0-d2d3-4f08-9b6e-59322b5900ec',
    'This is an story visible only to its creator'
  ),
  (
    '252a58d0-d2d3-4f08-9b7e-59322b5900ec',
    'This story is only visible if youre logged in'
  );

INSERT INTO
  images (
    id,
    created_by_id,
    created_at
  )
VALUES
  (
    '66403c46-97db-45ba-a646-5e10f229f490',
    'a979c61f-9780-4a98-83ce-c933490c925f',
    1707499636
  )
ON CONFLICT (id) DO NOTHING;


INSERT INTO
  image_versions (
    id, image_id, storage_key, mime_type, size, is_current, is_staged, created_at)
VALUES
  (
    '77403c46-97db-45ba-a646-5e10f229f490',
    '66403c46-97db-45ba-a646-5e10f229f490',
    'story_cover_66403c46-97db-45ba-a646-5e10f229f490_77403c46-97db-45ba-a646-5e10f229f490_a979c61f-9780-4a98-83ce-c933490c925f.png',
    'image/png',
    1537565,
    TRUE,
    FALSE,
    1707506272
  )
ON CONFLICT (id) DO NOTHING;


/**
 * Cannot insert into images with current_version_id set
 * to that version UUID in the same step as creating the image
 * — the version row does not exist yet.
 * So we update the image after the version has been created.
 */
UPDATE images
SET current_version_id = '77403c46-97db-45ba-a646-5e10f229f490'
WHERE id = '66403c46-97db-45ba-a646-5e10f229f490';

INSERT INTO
  post_image_links (post_id, role, image_id, created_at)
VALUES
  (
    '252a58d0-d2d3-4f08-9b4e-59322b5900ec',
    'cover',
    '66403c46-97db-45ba-a646-5e10f229f490',
    1707499636
  );

INSERT INTO
  tags (id, slug, name, created_by_id, created_at, updated_at)
VALUES
  (
    '421a58d0-d2d3-4f08-9b1e-59322b5900ec',
    'recipe',
    'Recipe',
    'a979c61f-9780-4a98-83ce-c933490c925f',
    1707499636,
    1707499736
  ),
  (
    '421a58d0-d2d3-4f08-9b2e-59322b5900ec',
    'diary',
    'Diary',
    'a979c61f-9780-4a98-83ce-c933490c925f',
    1707499636,
    1707499736
  ),
  (
    '421a58d0-d2d3-4f08-9b3e-59322b5900ec',
    'chicken-recipe',
    'Chicken Recipe',
    'a979c61f-9780-4a98-83ce-c933490c925f',
    1707499636,
    1707499736
  ),
  (
    '421a58d0-d2d3-4f08-9b4e-59322b5900ec',
    'no-bullshit-recipe',
    'No Bullshit Recipe',
    'a979c61f-9780-4a98-83ce-c933490c925f',
    1707499636,
    1707499736
  ),
  (
    '421a58d0-d2d3-4f08-9b5e-59322b5900ec',
    'fine-dine-bullshit',
    'Fine Dine Bullshit',
    'a979c61f-9780-4a98-83ce-c933490c925f',
    1707499636,
    1707499736
  );


INSERT INTO
  post_tag_links (post_id, tag_id, created_at)
VALUES
  (
    '252a58d0-d2d3-4f08-9b4e-59322b5900ec',
    '421a58d0-d2d3-4f08-9b2e-59322b5900ec',
    1707499636
  ),
  (
    '252a58d0-d2d3-4f08-9b4e-59322b5900ec',
    '421a58d0-d2d3-4f08-9b1e-59322b5900ec',
    1707499636
  ),
  (
    '252a58d0-d2d3-4f08-9b4e-59322b5900ec',
    '421a58d0-d2d3-4f08-9b3e-59322b5900ec',
    1707499636
  );

INSERT INTO
  comments (id, post_id, author_id, body, parent_comment_id, created_at, updated_at)
VALUES
  (
    '123e4567-e89b-12d3-a456-426614174000',
    '252a58d0-d2d3-4f08-9b4e-59322b5900ec',
    'a979c61f-9780-4a98-83ce-c933490c925f',
    'This is a test comment',
    NULL,
    1707499636,
    1707499736
  ),
  (
    '123e4567-e89b-12d3-a456-426614174001',
    '252a58d0-d2d3-4f08-9b4e-59322b5900ec',
    'a979c61f-9780-4a98-83ce-c933490c925f',
    'This is a test reply',
    '123e4567-e89b-12d3-a456-426614174000',
    1707499637,
    1707499736
  ),
  (
    '123e4567-e89b-12d3-a456-426614174002',
    '252a58d0-d2d3-4f08-9b4e-59322b5900ec',
    'a979c61f-9780-4a98-83ce-c933490c925f',
    'This is a test reply #2',
    '123e4567-e89b-12d3-a456-426614174000',
    1707499638,
    1707499736
  ),
  (
    '123e4567-e89b-12d3-a456-426614174003',
    '252a58d0-d2d3-4f08-9b4e-59322b5900ec',
    'a979c61f-9780-4a98-83ce-c933490c925f',
    'This is a test reply #3',
    '123e4567-e89b-12d3-a456-426614174000',
    1707499639,
    1707499736
  ),
  (
    '123e4567-e89b-12d3-a456-426614174004',
    '252a58d0-d2d3-4f08-9b4e-59322b5900ec',
    'a979c61f-9780-4a98-83ce-c933490c925f',
    'This is a test reply #4',
    '123e4567-e89b-12d3-a456-426614174000',
    1707499640,
    1707499736
  ),
  (
    '123e4567-e89b-12d3-a456-426614174005',
    '252a58d0-d2d3-4f08-9b4e-59322b5900ec',
    'a979c61f-9780-4a98-83ce-c933490c925f',
    'This is a test reply #5',
    '123e4567-e89b-12d3-a456-426614174000',
    1707499641,
    1707499736
  );
