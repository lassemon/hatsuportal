export enum UserRoleEnum {
  SuperAdmin = 'super_admin', // Has unrestricted access to all parts of the application, including user management, content approval, system settings, and more.
  Admin = 'admin', // Manages user accounts, can deactivate users, and has oversight over content but with some restrictions compared to SuperAdmin.
  Creator = 'creator', // Can create new items, recipes, blogposts etc. This role focuses on content creation without access to administrative functions.
  Editor = 'editor', //  Can edit existing content but may not have the permissions to create new top-level items. Useful for collaborative content development where certain users are responsible for refining and updating content.
  Viewer = 'viewer', // Has read-only access to public content. Cannot create or edit content but can view content shared by others.
  Moderator = 'moderator' // Can review user-generated content for appropriateness, adherence to community guidelines, and quality before it becomes publicly available. This role focuses on maintaining the quality and safety of the platform's content.
}
