import { pool } from "../../db/index";

const createIssueIntoDB = async (payload: any) => {
    const { title, description, type, reporter_id } = payload;
    if (!title || !description || !type) {
        throw new Error("Title, description and type are required");
    }

    // First test if user_id exists in users table
    const user = await pool.query(`SELECT * FROM users WHERE id = $1`, [reporter_id]);
    if (user.rows.length === 0) {
        throw new Error("User not found");
    }

    try {
        const result = await pool.query(
            `INSERT INTO issues (title, description, type, reporter_id) VALUES ($1, $2, $3, $4) RETURNING *`,
            [title, description, type, reporter_id]
        );
        return result.rows[0];
    } catch (err: any) {

        throw new Error(err?.message || "Failed to create issue");
    }
}

const getIssueByIdIntoDB = async (id: string) => {
    try {
        const result = await pool.query(`SELECT * FROM issues WHERE id = $1`, [id]);
        if (result.rows.length === 0) {
            throw new Error("Issue not found");
        }
        const issue = result.rows[0];
        //find reporter details
        const reporterResult = await pool.query(`SELECT id, name, email FROM users WHERE id = $1`, [issue.reporter_id]);
        issue.reporter = reporterResult.rows[0]

        return issue;


    } catch (err: any) {
        throw new Error(err?.message || "Failed to get issue");
    }
}

const getAllIssuesIntoDB = async (queryOptions: any) => {
    const {
        sort = "newest",
        type,
        status
    } = queryOptions;

    try {
        let query = `SELECT * FROM issues`;
        const conditions: string[] = [];
        const values: any[] = [];

        // type filter
        if (type && ["bug", "feature_request"].includes(type)) {
            values.push(type);
            conditions.push(`type = $${values.length}`);
        }

        // status filter
        if (
            status &&
            ["open", "in_progress", "resolved"].includes(status)
        ) {
            values.push(status);
            conditions.push(`status = $${values.length}`);
        }

        // add WHERE clause
        if (conditions.length > 0) {
            query += ` WHERE ${conditions.join(" AND ")}`;
        }

        // sorting
        if (sort === "newest") {
            query += ` ORDER BY created_at DESC`;
        } else if (sort === "oldest") {
            query += ` ORDER BY created_at ASC`;
        }

        const result = await pool.query(query, values);
        const issues = result.rows;

        if (issues.length === 0) {
            return [];
        }

        const reporterIds = [...new Set(issues.map((issue) => issue.reporter_id))];
        const reporterResult = await pool.query(
            `SELECT id, name, role FROM users WHERE id = ANY($1::int[])`,
            [reporterIds]
        );

        const reporterMap = new Map(
            reporterResult.rows.map((reporter) => [reporter.id, reporter])
        );

        return issues.map((issue) => {
            const { reporter_id, ...issueData } = issue;
            return {
                ...issueData,
                reporter: reporterMap.get(reporter_id) ?? null,
            };
        });
    } catch (err: any) {
        throw new Error(err?.message || "Failed to get issues");
    }
};

export const issuesService = {
    createIssueIntoDB,
    getIssueByIdIntoDB,
    getAllIssuesIntoDB
}
