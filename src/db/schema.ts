import { relations, sql } from 'drizzle-orm'
import {
  integer,
  pgTable,
  primaryKey,
  text,
  timestamp,
} from 'drizzle-orm/pg-core'

export const User = pgTable('users', {
  id: text('id')
    .primaryKey()
    .notNull()
    .default(sql`gen_random_uuid()`),
  user_name: text('user_name').notNull(),
  email: text('email').notNull(),
  password: text('password').notNull(),
  bio: text('bio'),
  image_url: text('image_url'),
  banner_url: text('banner_url'),
  created_at: timestamp('created_at').defaultNow(),
})

export const Community = pgTable('communities', {
  id: text('id')
    .primaryKey()
    .notNull()
    .default(sql`gen_random_uuid()`),
  name: text('name').notNull(),
  description: text('description').notNull(),
  image_url: text('image_url').notNull(),
  banner_url: text('banner_url').notNull(),
  members_count: integer('members_count').default(0),
  created_at: timestamp('created_at').defaultNow(),
})

export const Post = pgTable('posts', {
  id: text('id')
    .primaryKey()
    .notNull()
    .default(sql`gen_random_uuid()`),
  content: text('content'),
  author_id: text('author_id')
    .notNull()
    .references(() => User.id),
  community_id: text('Community_id')
    .notNull()
    .references(() => Community.id),
  likes_count: integer('likes_count').default(0),
  comments_count: integer('comments_count').default(0),
  created_at: timestamp('created_at').defaultNow(),
})

export const Comment = pgTable(
  'comments',
  {
    user_id: text('user_id')
      .notNull()
      .references(() => User.id),
    post_id: text('post_id')
      .notNull()
      .references(() => Post.id),
    content: text('content').notNull(),
    image_url: text('image_url'),
    created_at: timestamp('created_at').defaultNow(),
  },
  table => ({
    pk: primaryKey({ columns: [table.user_id, table.post_id] }),
  }),
)

export const Like = pgTable(
  'likes',
  {
    user_id: text('user_id')
      .notNull()
      .references(() => User.id),
    post_id: text('post_id')
      .notNull()
      .references(() => Post.id),
  },
  table => ({
    pk: primaryKey({ columns: [table.user_id, table.post_id] }),
  }),
)

export const Badge = pgTable('badges', {
  id: text('id')
    .primaryKey()
    .notNull()
    .default(sql`gen_random_uuid()`),
  name: text('name').notNull(),
  description: text('description').notNull(),
  image_url: text('image_url').notNull(),
  created_at: timestamp('created_at').defaultNow(),
})

export const Save = pgTable(
  'saves',
  {
    user_id: text('user_id')
      .notNull()
      .references(() => User.id),
    post_id: text('post_id')
      .notNull()
      .references(() => Post.id),
  },
  table => ({
    pk: primaryKey({ columns: [table.user_id, table.post_id] }),
  }),
)

export const Follower = pgTable(
  'followers',
  {
    user_id: text('user_id')
      .notNull()
      .references(() => User.id),
    follower_id: text('follower_id')
      .notNull()
      .references(() => User.id),
  },
  table => ({
    pk: primaryKey({ columns: [table.user_id, table.follower_id] }),
  }),
)

export const Following = pgTable(
  'followings',
  {
    user_id: text('user_id')
      .notNull()
      .references(() => User.id),
    following_id: text('following_id')
      .notNull()
      .references(() => User.id),
  },
  table => ({
    pk: primaryKey({ columns: [table.user_id, table.following_id] }),
  }),
)

export const User_Badge = pgTable(
  'user_badges',
  {
    user_id: text('user_id')
      .notNull()
      .references(() => User.id),
    badge_id: text('badge_id')
      .notNull()
      .references(() => Badge.id),
    created_at: timestamp('created_at').defaultNow(),
  },
  table => ({
    pk: primaryKey({ columns: [table.user_id, table.badge_id] }),
  }),
)

export const Community_User = pgTable(
  'community_users',
  {
    user_id: text('user_id')
      .notNull()
      .references(() => User.id),
    community_id: text('community_id')
      .notNull()
      .references(() => Community.id),
    created_at: timestamp('created_at').defaultNow(),
  },
  table => ({
    pk: primaryKey({ columns: [table.user_id, table.community_id] }),
  }),
)

export const SourceUrl = pgTable('source_urls', {
  id: text('id')
    .primaryKey()
    .notNull()
    .default(sql`gen_random_uuid()`),
  url: text('url').notNull(),
  post_id: text('post_id')
    .notNull()
    .references(() => Post.id),
  created_at: timestamp('created_at').defaultNow(),
})

export const userRelations = relations(User, ({ many }) => ({
  posts: many(Post),
  comments: many(Comment),
  likes: many(Like),
  saves: many(Save),
  userBadges: many(User_Badge),
  communityUsers: many(Community_User),
}))

export const postRelations = relations(Post, ({ one, many }) => ({
  author: one(User, {
    fields: [Post.author_id],
    references: [User.id],
  }),
  community: one(Community, {
    fields: [Post.community_id],
    references: [Community.id],
  }),
  comments: many(Comment),
  likes: many(Like),
  saves: many(Save),
  sourceUrls: many(SourceUrl),
}))

export const commentRelations = relations(Comment, ({ one }) => ({
  user: one(User, {
    fields: [Comment.user_id],
    references: [User.id],
  }),
  post: one(Post, {
    fields: [Comment.post_id],
    references: [Post.id],
  }),
}))

export const badgeRelations = relations(Badge, ({ many }) => ({
  userBadges: many(User_Badge),
}))

export const userBadgeRelations = relations(User_Badge, ({ one }) => ({
  user: one(User, {
    fields: [User_Badge.user_id],
    references: [User.id],
  }),
  badge: one(Badge, {
    fields: [User_Badge.badge_id],
    references: [Badge.id],
  }),
}))

export const communityRelations = relations(Community, ({ many }) => ({
  posts: many(Post),
  communityUsers: many(Community_User),
}))

export const communityUserRelations = relations(Community_User, ({ one }) => ({
  user: one(User, {
    fields: [Community_User.user_id],
    references: [User.id],
  }),
  community: one(Community, {
    fields: [Community_User.community_id],
    references: [Community.id],
  }),
}))

export type UserSelect = typeof User.$inferSelect
export type UserInsert = typeof User.$inferInsert
export type PostSelect = typeof Post.$inferSelect
export type PostInsert = typeof Post.$inferInsert
export type CommentSelect = typeof Comment.$inferSelect
export type CommentInsert = typeof Comment.$inferInsert
export type LikeSelect = typeof Like.$inferSelect
export type LikeInsert = typeof Like.$inferInsert
export type BadgeSelect = typeof Badge.$inferSelect
export type BadgeInsert = typeof Badge.$inferInsert
export type SaveSelect = typeof Save.$inferSelect
export type SaveInsert = typeof Save.$inferInsert
export type FollowerSelect = typeof Follower.$inferSelect
export type FollowerInsert = typeof Follower.$inferInsert
export type FollowingSelect = typeof Following.$inferSelect
export type FollowingInsert = typeof Following.$inferInsert
export type CommunitySelect = typeof Community.$inferSelect
export type CommunityInsert = typeof Community.$inferInsert
export type User_BadgeSelect = typeof User_Badge.$inferSelect
export type User_BadgeInsert = typeof User_Badge.$inferInsert
export type Community_UserSelect = typeof Community_User.$inferSelect
export type Community_UserInsert = typeof Community_User.$inferInsert
export type SourceUrlSelect = typeof SourceUrl.$inferSelect
export type SourceUrlInsert = typeof SourceUrl.$inferInsert
