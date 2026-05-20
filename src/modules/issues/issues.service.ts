import { pool } from "../../db/index.ts";

const createIssueIntoDB = async (payload: any) => {
    const { title, description, type, status = "open", reporter_id } = payload;
 

    // First test if user_id exists in users table
    const user = await pool.query(`SELECT * FROM users WHERE id = $1`, [reporter_id]);
    if (user.rows.length === 0) {
        throw new Error("User not found");
    }

    try {
        const result = await pool.query(
            `INSERT INTO issues (title, description, type, status, reporter_id) VALUES ($1, $2, $3, $4, $5) RETURNING *`,
            [title, description, type, status, reporter_id]
        );
        return result.rows[0];
    } catch (err: any) {
         
        throw new Error(err?.message || "Failed to create issue");
    }
}
export const issuesService = {
    createIssueIntoDB
}
