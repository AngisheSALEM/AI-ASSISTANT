import { pgTable, text, integer, boolean, timestamp, json, pgEnum } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { relations } from "drizzle-orm";

export const planEnum = pgEnum("plan", ["FREE", "STANDARD", "PREMIUM"]);
export const roleEnum = pgEnum("role", ["USER", "ADMIN"]);
export const agentStatusEnum = pgEnum("agent_status", ["ACTIVE", "INACTIVE", "CONFIGURING"]);

export const organizationsTable = pgTable("organizations", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  name: text("name").notNull(),
  plan: planEnum("plan").notNull().default("STANDARD"),
  credits: integer("credits").notNull().default(100),
  whatsappPhoneNumberId: text("whatsapp_phone_number_id"),
  whatsappAccessToken: text("whatsapp_access_token"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const usersTable = pgTable("users", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  name: text("name"),
  email: text("email").notNull().unique(),
  password: text("password"),
  role: roleEnum("role").notNull().default("USER"),
  organizationId: text("organization_id").references(() => organizationsTable.id),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const agentTemplatesTable = pgTable("agent_templates", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  name: text("name").notNull(),
  description: text("description").notNull(),
  category: text("category").notNull(),
  pricePerMonth: integer("price_per_month").notNull(),
  icon: text("icon"),
  systemPrompt: text("system_prompt").notNull(),
  uiData: json("ui_data"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const agentsTable = pgTable("agents", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  name: text("name").notNull(),
  role: text("role").notNull(),
  systemPrompt: text("system_prompt").notNull(),
  status: agentStatusEnum("status").notNull().default("ACTIVE"),
  organizationId: text("organization_id").notNull().references(() => organizationsTable.id),
  templateId: text("template_id"),
  temperature: integer("temperature").notNull().default(7),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const conversationsTable = pgTable("conversations", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  agentId: text("agent_id").references(() => agentsTable.id),
  userId: text("user_id").references(() => usersTable.id),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const messagesTable = pgTable("messages", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  role: text("role").notNull(),
  content: text("content"),
  uiType: text("ui_type"),
  uiData: json("ui_data"),
  conversationId: text("conversation_id").notNull().references(() => conversationsTable.id),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const organizationsRelations = relations(organizationsTable, ({ many }) => ({
  users: many(usersTable),
  agents: many(agentsTable),
}));

export const usersRelations = relations(usersTable, ({ one }) => ({
  organization: one(organizationsTable, {
    fields: [usersTable.organizationId],
    references: [organizationsTable.id],
  }),
}));

export const agentsRelations = relations(agentsTable, ({ one, many }) => ({
  organization: one(organizationsTable, {
    fields: [agentsTable.organizationId],
    references: [organizationsTable.id],
  }),
  template: one(agentTemplatesTable, {
    fields: [agentsTable.templateId],
    references: [agentTemplatesTable.id],
  }),
  conversations: many(conversationsTable),
}));

export const conversationsRelations = relations(conversationsTable, ({ one, many }) => ({
  agent: one(agentsTable, { fields: [conversationsTable.agentId], references: [agentsTable.id] }),
  messages: many(messagesTable),
}));

export const messagesRelations = relations(messagesTable, ({ one }) => ({
  conversation: one(conversationsTable, { fields: [messagesTable.conversationId], references: [conversationsTable.id] }),
}));

export const insertOrganizationSchema = createInsertSchema(organizationsTable).omit({ id: true, createdAt: true, updatedAt: true });
export const insertUserSchema = createInsertSchema(usersTable).omit({ id: true, createdAt: true, updatedAt: true });
export const insertAgentSchema = createInsertSchema(agentsTable).omit({ id: true, createdAt: true, updatedAt: true });
export const insertAgentTemplateSchema = createInsertSchema(agentTemplatesTable).omit({ id: true, createdAt: true });
export const insertConversationSchema = createInsertSchema(conversationsTable).omit({ id: true, createdAt: true });
export const insertMessageSchema = createInsertSchema(messagesTable).omit({ id: true, createdAt: true });

export type Organization = typeof organizationsTable.$inferSelect;
export type User = typeof usersTable.$inferSelect;
export type Agent = typeof agentsTable.$inferSelect;
export type AgentTemplate = typeof agentTemplatesTable.$inferSelect;
export type Conversation = typeof conversationsTable.$inferSelect;
export type Message = typeof messagesTable.$inferSelect;
