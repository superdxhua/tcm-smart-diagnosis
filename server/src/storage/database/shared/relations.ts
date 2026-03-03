import { relations } from "drizzle-orm/relations";
import { users, userPermissions, rechargeOrders, fileRecords, userBalance } from "./schema";

export const userPermissionsRelations = relations(userPermissions, ({one}) => ({
	user_userId: one(users, {
		fields: [userPermissions.userId],
		references: [users.id],
		relationName: "userPermissions_userId_users_id"
	}),
	user_authorizedBy: one(users, {
		fields: [userPermissions.authorizedBy],
		references: [users.id],
		relationName: "userPermissions_authorizedBy_users_id"
	}),
}));

export const usersRelations = relations(users, ({many}) => ({
	userPermissions_userId: many(userPermissions, {
		relationName: "userPermissions_userId_users_id"
	}),
	userPermissions_authorizedBy: many(userPermissions, {
		relationName: "userPermissions_authorizedBy_users_id"
	}),
	rechargeOrders: many(rechargeOrders),
	fileRecords: many(fileRecords),
	userBalances: many(userBalance),
}));

export const rechargeOrdersRelations = relations(rechargeOrders, ({one}) => ({
	user: one(users, {
		fields: [rechargeOrders.userId],
		references: [users.id]
	}),
}));

export const fileRecordsRelations = relations(fileRecords, ({one}) => ({
	user: one(users, {
		fields: [fileRecords.userId],
		references: [users.id]
	}),
}));

export const userBalanceRelations = relations(userBalance, ({one}) => ({
	user: one(users, {
		fields: [userBalance.userId],
		references: [users.id]
	}),
}));