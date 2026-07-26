import { createDb } from '@flarekit/db'
import { user as userTable } from '@flarekit/db/schema/auth'
import { and, asc, count, desc, eq, like, or, sql, type SQL } from 'drizzle-orm'
import z from 'zod'

import { protectedProcedure } from '../index'

const listUsersInput = z.object({
  page: z.number().int().min(1).default(1),
  pageSize: z.number().int().min(1).max(50).default(10),
  search: z.string().trim().max(100).default(''),
  status: z.enum(['all', 'verified', 'unverified']).default('all'),
})

export const usersRouter = {
  list: protectedProcedure.input(listUsersInput).handler(async ({ input }) => {
    const db = createDb()
    const conditions: SQL[] = []

    if (input.search) {
      const pattern = `%${input.search}%`
      const searchCondition = or(like(userTable.name, pattern), like(userTable.email, pattern))
      if (searchCondition) {
        conditions.push(searchCondition)
      }
    }

    if (input.status !== 'all') {
      conditions.push(eq(userTable.emailVerified, input.status === 'verified'))
    }

    const where = conditions.length > 0 ? and(...conditions) : undefined
    const offset = (input.page - 1) * input.pageSize

    const [items, filteredCount, summary] = await Promise.all([
      db
        .select({
          id: userTable.id,
          name: userTable.name,
          email: userTable.email,
          emailVerified: userTable.emailVerified,
          image: userTable.image,
          createdAt: userTable.createdAt,
          updatedAt: userTable.updatedAt,
        })
        .from(userTable)
        .where(where)
        .orderBy(desc(userTable.createdAt), asc(userTable.name))
        .limit(input.pageSize)
        .offset(offset),
      db.select({ value: count() }).from(userTable).where(where),
      db
        .select({
          total: count(),
          verified: sql<number>`cast(
            coalesce(sum(case when ${userTable.emailVerified} = 1 then 1 else 0 end), 0)
            as integer
          )`,
        })
        .from(userTable),
    ])

    const totalUsers = summary[0]?.total ?? 0
    const verifiedUsers = summary[0]?.verified ?? 0

    return {
      items: items.map((item) => ({
        ...item,
        createdAt: item.createdAt.getTime(),
        updatedAt: item.updatedAt.getTime(),
      })),
      total: filteredCount[0]?.value ?? 0,
      summary: {
        total: totalUsers,
        verified: verifiedUsers,
        unverified: totalUsers - verifiedUsers,
      },
    }
  }),
}
