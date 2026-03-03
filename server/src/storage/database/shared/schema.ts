import { pgTable, serial, timestamp, index, unique, varchar, text, boolean, foreignKey, numeric, integer, uuid } from "drizzle-orm/pg-core"
import { sql } from "drizzle-orm"

// 定义 PostgreSQL 函数
const gen_random_uuid = () => sql`gen_random_uuid()`



export const healthCheck = pgTable("health_check", {
	id: serial().notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow(),
});

export const users = pgTable("users", {
	id: varchar({ length: 36 }).default(gen_random_uuid()).primaryKey().notNull(),
	username: varchar({ length: 50 }).notNull(),
	password: text().notNull(),
	role: varchar({ length: 20 }).default('user').notNull(),
	isActive: boolean("is_active").default(true).notNull(),
	secondaryAdmin: varchar("secondary_admin", { length: 100 }), // 次级管理员（手机号或人名）
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }),
}, (table) => [
	index("users_username_idx").using("btree", table.username.asc().nullsLast().op("text_ops")),
	unique("users_username_unique").on(table.username),
	index("users_secondary_admin_idx").using("btree", table.secondaryAdmin.asc().nullsLast().op("text_ops")), // 按次级管理员索引
]);

export const userPermissions = pgTable("user_permissions", {
	id: varchar({ length: 36 }).default(gen_random_uuid()).primaryKey().notNull(),
	userId: varchar("user_id", { length: 36 }).notNull(),
	authorizedBy: varchar("authorized_by", { length: 36 }),
	expiresAt: timestamp("expires_at", { withTimezone: true, mode: 'string' }),
	isActive: boolean("is_active").default(true).notNull(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }),
}, (table) => [
	index("user_permissions_expires_at_idx").using("btree", table.expiresAt.asc().nullsLast().op("timestamptz_ops")),
	index("user_permissions_user_id_idx").using("btree", table.userId.asc().nullsLast().op("text_ops")),
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "user_permissions_user_id_users_id_fk"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.authorizedBy],
			foreignColumns: [users.id],
			name: "user_permissions_authorized_by_users_id_fk"
		}).onDelete("set null"),
]);

export const rechargeOrders = pgTable("recharge_orders", {
	id: varchar({ length: 36 }).default(gen_random_uuid()).primaryKey().notNull(),
	userId: varchar("user_id", { length: 36 }).notNull(),
	orderNo: varchar("order_no", { length: 64 }).notNull(),
	amount: numeric({ precision: 10, scale:  2 }).notNull(),
	paymentMethod: varchar("payment_method", { length: 20 }).notNull(),
	status: varchar({ length: 20 }).default('pending').notNull(),
	transactionId: varchar("transaction_id", { length: 128 }),
	paidAt: timestamp("paid_at", { withTimezone: true, mode: 'string' }),
	screenshotUrl: varchar("screenshot_url", { length: 512 }),
	auditStatus: varchar("audit_status", { length: 20 }).default('pending').notNull(),
	auditRemark: text("audit_remark"),
	auditedBy: varchar("audited_by", { length: 36 }),
	auditedAt: timestamp("audited_at", { withTimezone: true, mode: 'string' }),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	index("recharge_orders_order_no_idx").using("btree", table.orderNo.asc().nullsLast().op("text_ops")),
	index("recharge_orders_status_idx").using("btree", table.status.asc().nullsLast().op("text_ops")),
	index("recharge_orders_audit_status_idx").using("btree", table.auditStatus.asc().nullsLast().op("text_ops")),
	index("recharge_orders_user_id_idx").using("btree", table.userId.asc().nullsLast().op("text_ops")),
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "recharge_orders_user_id_users_id_fk"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.auditedBy],
			foreignColumns: [users.id],
			name: "recharge_orders_audited_by_users_id_fk"
		}).onDelete("set null"),
	unique("recharge_orders_order_no_unique").on(table.orderNo),
]);

export const registerQrcodes = pgTable("register_qrcodes", {
	id: varchar({ length: 36 }).default(gen_random_uuid()).primaryKey().notNull(),
	qrCode: varchar("qr_code", { length: 64 }).notNull(),
	platform: varchar({ length: 20 }).notNull(),
	referrerId: varchar("referrer_id", { length: 36 }),
	expiresAt: timestamp("expires_at", { withTimezone: true, mode: 'string' }),
	isActive: boolean("is_active").default(true).notNull(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	index("register_qrcodes_platform_idx").using("btree", table.platform.asc().nullsLast().op("text_ops")),
	index("register_qrcodes_qr_code_idx").using("btree", table.qrCode.asc().nullsLast().op("text_ops")),
	unique("register_qrcodes_qr_code_unique").on(table.qrCode),
]);

export const fileRecords = pgTable("file_records", {
	id: varchar({ length: 36 }).default(gen_random_uuid()).primaryKey().notNull(),
	userId: varchar("user_id", { length: 36 }).notNull(),
	fileName: varchar("file_name", { length: 255 }).notNull(),
	fileKey: varchar("file_key", { length: 512 }).notNull(),
	fileType: varchar("file_type", { length: 50 }).notNull(),
	fileSize: integer("file_size").notNull(),
	mimeType: varchar("mime_type", { length: 100 }).notNull(),
	fileUrl: varchar("file_url", { length: 512 }),
	isProcessed: boolean("is_processed").default(false).notNull(),
	processingResult: text("processing_result"),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	index("file_records_file_key_idx").using("btree", table.fileKey.asc().nullsLast().op("text_ops")),
	index("file_records_file_type_idx").using("btree", table.fileType.asc().nullsLast().op("text_ops")),
	index("file_records_user_id_idx").using("btree", table.userId.asc().nullsLast().op("text_ops")),
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "file_records_user_id_users_id_fk"
		}).onDelete("cascade"),
]);

export const userBalance = pgTable("user_balance", {
	id: varchar({ length: 36 }).default(gen_random_uuid()).primaryKey().notNull(),
	userId: varchar("user_id", { length: 36 }).notNull(),
	balance: numeric({ precision: 10, scale:  2 }).default('0.00').notNull(),
	totalRecharge: numeric("total_recharge", { precision: 10, scale:  2 }).default('0.00').notNull(),
	totalConsumed: numeric("total_consumed", { precision: 10, scale:  2 }).default('0.00').notNull(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	index("user_balance_user_id_idx").using("btree", table.userId.asc().nullsLast().op("text_ops")),
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "user_balance_user_id_users_id_fk"
		}).onDelete("cascade"),
	unique("user_balance_user_id_unique").on(table.userId),
]);

export const medicationFeedback = pgTable("medication_feedback", {
	id: varchar({ length: 36 }).default(gen_random_uuid()).primaryKey().notNull(),
	patientId: varchar("patient_id", { length: 36 }).notNull(),
	recordId: varchar("record_id", { length: 36 }).notNull(),
	feedbackDate: timestamp("feedback_date", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	compliance: varchar({ length: 20 }).notNull(),
	symptoms: text(),
	sideEffects: text("side_effects"),
	overallSatisfaction: integer("overall_satisfaction"),
	notes: text(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
});

export const patients = pgTable("patients", {
	id: varchar({ length: 36 }).default(gen_random_uuid()).primaryKey().notNull(),
	doctorId: varchar("doctor_id", { length: 36 }).notNull(),
	name: varchar({ length: 100 }).notNull(),
	gender: varchar({ length: 10 }),
	age: integer(),
	phone: varchar({ length: 20 }),
	address: text(),
	medicalHistory: text("medical_history"),
	allergies: text(),
	visitCount: integer("visit_count").default(0).notNull(),
	lastVisitAt: timestamp("last_visit_at", { withTimezone: true, mode: 'string' }),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow(),
	birthYear: integer("birth_year"),
	height: numeric({ precision: 5, scale:  2 }),
	weight: numeric({ precision: 5, scale:  2 }),
	contactInfo: text("contact_info"),
	isPregnant: boolean("is_pregnant").default(false),
	isChild: boolean("is_child").default(false),
	tongueCondition: text("tongue_condition"),
	sleepCondition: text("sleep_condition"),
	digestionCondition: text("digestion_condition"),
});

export const patientRecords = pgTable("patient_records", {
	id: varchar({ length: 36 }).default(gen_random_uuid()).primaryKey().notNull(),
	patientId: varchar("patient_id", { length: 36 }).notNull(),
	doctorId: varchar("doctor_id", { length: 36 }),
	visitNumber: integer("visit_number").notNull(),
	chiefComplaint: text("chief_complaint").notNull(),
	history: text(),
	pastHistory: text("past_history"),
	diagnosis: text(),
	differentiation: text(),
	treatmentPrinciple: text("treatment_principle"),
	prescription: text().notNull(),
	advice: text(),
	status: varchar({ length: 20 }).default('active').notNull(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow(),
});

export const prescriptionAdjustments = pgTable("prescription_adjustments", {
	id: varchar({ length: 36 }).default(gen_random_uuid()).primaryKey().notNull(),
	patientId: varchar("patient_id", { length: 36 }).notNull(),
	recordId: varchar("record_id", { length: 36 }).notNull(),
	feedbackId: varchar("feedback_id", { length: 36 }),
	doctorId: varchar("doctor_id", { length: 36 }).notNull(),
	adjustmentReason: text("adjustment_reason").notNull(),
	originalPrescription: text("original_prescription").notNull(),
	adjustedPrescription: text("adjusted_prescription").notNull(),
	adjustmentNotes: text("adjustment_notes"),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
});

export const appVersions = pgTable("app_versions", {
	id: varchar({ length: 36 }).default(gen_random_uuid()).primaryKey().notNull(),
	version: varchar({ length: 20 }).notNull(),
	versionCode: integer("version_code").notNull(),
	releaseDate: timestamp("release_date", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	changeLog: text("change_log").notNull(),
	downloadUrl: varchar("download_url", { length: 512 }),
	fileSize: integer("file_size"),
	isForced: boolean("is_forced").default(false).notNull(),
	platform: varchar({ length: 20 }).notNull(),
	isActive: boolean("is_active").default(true).notNull(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	unique("app_versions_version_key").on(table.version),
	unique("app_versions_version_code_key").on(table.versionCode),
]);

export const packages = pgTable("packages", {
	id: uuid().default(sql`uuid_generate_v4()`).primaryKey().notNull(),
	name: varchar({ length: 100 }).notNull(),
	duration: integer().notNull(),
	price: numeric({ precision: 10, scale:  2 }).notNull(),
	description: text(),
	isActive: boolean("is_active").default(true),
	sortOrder: integer("sort_order").default(0),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow(),
}, (table) => [
	index("idx_packages_is_active").using("btree", table.isActive.asc().nullsLast().op("bool_ops")),
]);

export const orders = pgTable("orders", {
	id: uuid().default(sql`uuid_generate_v4()`).primaryKey().notNull(),
	userId: uuid("user_id").notNull(),
	orderNo: varchar("order_no", { length: 50 }).notNull(),
	packageId: uuid("package_id"),
	amount: numeric({ precision: 10, scale:  2 }).notNull(),
	paymentMethod: varchar("payment_method", { length: 20 }).notNull(),
	status: varchar({ length: 20 }).default('pending'),
	transactionId: varchar("transaction_id", { length: 100 }),
	paidAt: timestamp("paid_at", { withTimezone: true, mode: 'string' }),
	expiresAt: timestamp("expires_at", { withTimezone: true, mode: 'string' }),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow(),
}, (table) => [
	index("idx_orders_order_no").using("btree", table.orderNo.asc().nullsLast().op("text_ops")),
	index("idx_orders_user_id").using("btree", table.userId.asc().nullsLast().op("uuid_ops")),
	unique("orders_order_no_key").on(table.orderNo),
]);

export const userFeedback = pgTable("user_feedback", {
	id: varchar({ length: 36 }).default(gen_random_uuid()).primaryKey().notNull(),
	userId: varchar("user_id", { length: 36 }).notNull(),
	feedbackType: varchar("feedback_type", { length: 20 }).notNull(),
	title: varchar({ length: 200 }).notNull(),
	content: text().notNull(),
	screenshots: text(),
	deviceInfo: text("device_info"),
	appVersion: varchar("app_version", { length: 20 }),
	status: varchar({ length: 20 }).default('pending').notNull(),
	priority: varchar({ length: 10 }).default('normal').notNull(),
	adminReply: text("admin_reply"),
	replyAt: timestamp("reply_at", { withTimezone: true, mode: 'string' }),
	processedBy: varchar("processed_by", { length: 36 }),
	processedAt: timestamp("processed_at", { withTimezone: true, mode: 'string' }),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow(),
});

export const refunds = pgTable("refunds", {
	id: uuid().default(sql`uuid_generate_v4()`).primaryKey().notNull(),
	orderNo: varchar("order_no", { length: 50 }).notNull(),
	refundId: varchar("refund_id", { length: 50 }).notNull(),
	refundAmount: numeric("refund_amount", { precision: 10, scale:  2 }).notNull(),
	refundReason: text("refund_reason"),
	status: varchar({ length: 20 }).default('PROCESSING'),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow(),
}, (table) => [
	index("idx_refunds_order_no").using("btree", table.orderNo.asc().nullsLast().op("text_ops")),
	index("idx_refunds_refund_id").using("btree", table.refundId.asc().nullsLast().op("text_ops")),
	unique("refunds_refund_id_key").on(table.refundId),
]);

export const medicalCases = pgTable("medical_cases", {
	id: varchar({ length: 36 }).default(gen_random_uuid()).primaryKey().notNull(),
	doctorName: varchar("doctor_name", { length: 100 }).notNull(),
	doctorEra: varchar("doctor_era", { length: 50 }),
	patientGender: varchar("patient_gender", { length: 10 }),
	patientAge: integer("patient_age"),
	mainSymptoms: text("main_symptoms").notNull(),
	currentIllness: text("current_illness"),
	pastHistory: text("past_history"),
	tongue: varchar({ length: 200 }),
	pulse: varchar({ length: 200 }),
	diagnosis: text().notNull(),
	prescriptionName: varchar("prescription_name", { length: 200 }),
	prescriptionComposition: text("prescription_composition"),
	prescriptionDosage: text("prescription_dosage"),
	prescriptionUsage: text("prescription_usage"),
	treatmentResult: text("treatment_result"),
	notes: text(),
	source: varchar({ length: 200 }),
	tags: text().$type<string[]>().default([]),
	symptomKeywords: text("symptom_keywords").$type<string[]>().default([]),
	diagnosisPattern: varchar("diagnosis_pattern", { length: 200 }),
	effectivenessScore: numeric("effectiveness_score", { precision: 3, scale: 2 }).default('0.00'),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
});

export const medicalCaseFeedback = pgTable("medical_case_feedback", {
	id: varchar({ length: 36 }).default(gen_random_uuid()).primaryKey().notNull(),
	caseId: varchar("case_id", { length: 36 }).notNull(),
	userId: varchar("user_id", { length: 36 }),
	success: boolean().notNull(),
	feedbackDate: timestamp("feedback_date", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	notes: text(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	foreignKey({
		columns: [table.caseId],
		foreignColumns: [medicalCases.id],
		name: "medical_case_feedback_case_id_medical_cases_id_fk"
	}).onDelete("cascade"),
]);
