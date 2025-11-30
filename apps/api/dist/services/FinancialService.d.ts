import { ExpenseCategory } from '@rightfit/database';
interface CreateTransactionInput {
    propertyId: string;
    type: 'INCOME' | 'EXPENSE';
    category?: ExpenseCategory;
    amount: number;
    date: Date;
    description: string;
    receiptUrl?: string;
    notes?: string;
}
interface UpdateTransactionInput {
    type?: 'INCOME' | 'EXPENSE';
    category?: ExpenseCategory;
    amount?: number;
    date?: Date;
    description?: string;
    receiptUrl?: string;
    notes?: string;
}
interface PropertyFinancialSummary {
    propertyId: string;
    propertyName: string;
    totalIncome: number;
    totalExpenses: number;
    netIncome: number;
    expensesByCategory: Array<{
        category: string;
        amount: number;
        percentage: number;
    }>;
    transactions: number;
}
interface SetBudgetInput {
    propertyId: string;
    monthlyBudget: number;
    alertThreshold?: number;
}
export declare class FinancialService {
    /**
     * Create a new financial transaction
     */
    createTransaction(input: CreateTransactionInput, tenantId: string): Promise<{
        id: string;
        tenant_id: string;
        created_at: Date;
        updated_at: Date;
        deleted_at: Date | null;
        property_id: string;
        type: import(".prisma/client").$Enums.TransactionType;
        description: string;
        category: import(".prisma/client").$Enums.ExpenseCategory | null;
        notes: string | null;
        amount: import("@prisma/client/runtime/library").Decimal;
        date: Date;
        receipt_url: string | null;
    }>;
    /**
     * List transactions with filtering and pagination
     */
    listTransactions(tenantId: string, options?: {
        propertyId?: string;
        type?: 'INCOME' | 'EXPENSE';
        category?: ExpenseCategory;
        startDate?: Date;
        endDate?: Date;
        page?: number;
        limit?: number;
    }): Promise<{
        data: ({
            property: {
                id: string;
                name: string;
            };
        } & {
            id: string;
            tenant_id: string;
            created_at: Date;
            updated_at: Date;
            deleted_at: Date | null;
            property_id: string;
            type: import(".prisma/client").$Enums.TransactionType;
            description: string;
            category: import(".prisma/client").$Enums.ExpenseCategory | null;
            notes: string | null;
            amount: import("@prisma/client/runtime/library").Decimal;
            date: Date;
            receipt_url: string | null;
        })[];
        pagination: {
            page: number;
            limit: number;
            total: number;
            totalPages: number;
        };
    }>;
    /**
     * Get financial summary for a property
     */
    getPropertySummary(propertyId: string, tenantId: string, startDate?: Date, endDate?: Date): Promise<PropertyFinancialSummary>;
    /**
     * Update a transaction
     */
    updateTransaction(id: string, input: UpdateTransactionInput, tenantId: string): Promise<{
        id: string;
        tenant_id: string;
        created_at: Date;
        updated_at: Date;
        deleted_at: Date | null;
        property_id: string;
        type: import(".prisma/client").$Enums.TransactionType;
        description: string;
        category: import(".prisma/client").$Enums.ExpenseCategory | null;
        notes: string | null;
        amount: import("@prisma/client/runtime/library").Decimal;
        date: Date;
        receipt_url: string | null;
    }>;
    /**
     * Soft delete a transaction
     */
    deleteTransaction(id: string, tenantId: string): Promise<void>;
    /**
     * Set or update budget for a property
     */
    setBudget(input: SetBudgetInput, tenantId: string): Promise<{
        id: string;
        tenant_id: string;
        created_at: Date;
        updated_at: Date;
        property_id: string;
        monthly_budget: import("@prisma/client/runtime/library").Decimal;
        alert_threshold: import("@prisma/client/runtime/library").Decimal;
    }>;
    /**
     * Get budget status for a property
     */
    getBudgetStatus(propertyId: string, tenantId: string): Promise<{
        budget: {
            id: string;
            propertyId: string;
            propertyName: string;
            monthlyBudget: number;
            alertThreshold: number;
        };
        currentMonth: {
            startDate: Date;
            endDate: Date;
            totalSpent: number;
            remaining: number;
            percentageUsed: number;
        };
        alerts: {
            isOverBudget: boolean;
            isNearThreshold: boolean;
            message: string | null;
        };
    } | null>;
    /**
     * Generate CSV export of transactions
     */
    exportTransactionsCSV(tenantId: string, options?: {
        propertyId?: string;
        startDate?: Date;
        endDate?: Date;
    }): Promise<string>;
    /**
     * Get properties that are over budget (for cron job alerts)
     */
    getPropertiesOverBudget(tenantId: string): Promise<{
        isOverBudget: boolean;
        isNearThreshold: boolean;
        message: string | null;
        propertyId: string;
        propertyName: string;
        ownerUserId: string;
    }[]>;
}
export declare const financialService: FinancialService;
export {};
//# sourceMappingURL=FinancialService.d.ts.map