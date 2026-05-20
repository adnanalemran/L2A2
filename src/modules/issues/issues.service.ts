import { pool } from "../../db/index";
import HttpError from "../../utility/HttpError";
import type {
    CreateIssuePayload,
    GetAllIssuesQuery,
    Issue,
    IssueRow,
    IssueStatus,
    Reporter,
    UpdateIssuePayload,
} from "./issues.interfaces";

const createIssueIntoDB = async (payload: CreateIssuePayload): Promise<IssueRow> => {
    const { title, description, type, reporter_id } = payload;
    if (!title || !description || !type) {
        throw new HttpError(400, "Title, description and type are required");
    }

    // First test if user_id exists in users table
    const user = await pool.query(`SELECT * FROM users WHERE id = $1`, [reporter_id]);
    if (user.rows.length === 0) {
        throw new HttpError(404, "Reporter not found");
    }

    try {
        const result = await pool.query(
            `INSERT INTO issues (title, description, type, reporter_id) VALUES ($1, $2, $3, $4) RETURNING *`,
            [title, description, type, reporter_id]
        );
        return result.rows[0];
    } catch (err: unknown) {
        const message = err instanceof Error ? err.message : String(err);
        throw new Error(message || "Failed to create issue");
    }
}

const getIssueByIdIntoDB = async (id: string): Promise<Issue> => {
    try {
        const result = await pool.query(`SELECT * FROM issues WHERE id = $1`, [id]);
        if (result.rows.length === 0) {
            throw new Error("Issue not found");
        }
        const issue: IssueRow = result.rows[0];
        const reporterResult = await pool.query<Reporter>(`SELECT id, name, role FROM users WHERE id = $1`, [issue.reporter_id]);
        const reporter = reporterResult.rows[0] ?? null;

        return {
            id: issue.id,
            title: issue.title,
            description: issue.description,
            type: issue.type,
            status: issue.status,
            reporter,
            created_at: issue.created_at,
            updated_at: issue.updated_at,
        } as Issue;


    } catch (err: unknown) {
        const message = err instanceof Error ? err.message : String(err);
        throw new Error(message || "Failed to get issue");
    }
}

const getAllIssuesIntoDB = async (queryOptions: GetAllIssuesQuery): Promise<Issue[]> => {
    const {
        sort = "newest",
        type,
        status
    } = queryOptions ?? {};

    try {
        let query = `SELECT * FROM issues`;
        const conditions: string[] = [];
        const values: (string | IssueStatus)[] = [];

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

        const result = await pool.query<IssueRow>(query, values);
        const issues = result.rows as IssueRow[];

        if (issues.length === 0) {
            return [];
        }

        const reporterIds = [...new Set(issues.map((issue) => issue.reporter_id))];
        const reporterResult = await pool.query<Reporter>(
            `SELECT id, name, role FROM users WHERE id = ANY($1::int[])`,
            [reporterIds]
        );

        const reporterMap = new Map<number, Reporter | null>(
            reporterResult.rows.map((r) => [r.id, r])
        );

        return issues.map((issue) => {
            const reporter = reporterMap.get(issue.reporter_id) ?? null;
            return {
                id: issue.id,
                title: issue.title,
                description: issue.description,
                type: issue.type,
                status: issue.status,
                reporter,
                created_at: issue.created_at,
                updated_at: issue.updated_at,
            } as Issue;
        });
    } catch (err: unknown) {
        const message = err instanceof Error ? err.message : String(err);
        throw new Error(message || "Failed to get issues");
    }
};


const updateIssueInDB = async (
    id: string,
    user: Reporter | { id?: number; role?: string } | undefined,
    payload: UpdateIssuePayload
) => {
    try {

        const { title, description, type, status } = payload;
        //find issue by id
        const productResult = await pool.query(`SELECT * FROM issues WHERE id = $1`, [id]);
        if (productResult.rows.length === 0) {
            throw new Error("Issue not found");
        }
        //find user by user id and issue id
        const ownerResult = await pool.query(`SELECT * FROM users WHERE id = $1`, [productResult.rows[0].reporter_id]);
        if (ownerResult.rows[0].id === user?.id && ownerResult.rows[0].role === "maintainer") {
            //update issue
            const result = await pool.query(
                `UPDATE issues SET title = COALESCE($1, title), description = COALESCE($2, description), type = COALESCE($3, type), status = COALESCE($4, status) WHERE id = $5 RETURNING *`,
                [title, description, type, status, id]
            );
            return { data: result.rows[0], status: 200 };
        }
        if (ownerResult.rows[0].id !== user?.id) {
            return { data: "You are not this issue's reporter", status: 403 };
        }
        if (ownerResult.rows[0].role !== "maintainer") {
            return { data: "You are not a maintainer", status: 403 };
        }
        else {
            return { data: "You are not authorized to update this issue", status: 403 };
             
        }



    } catch (err: unknown) {
        const message = err instanceof Error ? err.message : String(err);
        throw new Error(message || "Failed to update issue");
    }
}
const deleteIssueFromDB = async (id: string) => {
    try {
        const result = await pool.query(`DELETE FROM issues WHERE id = $1 RETURNING *`, [id]);
        if (result.rows.length === 0) {
            throw new Error("Issue not found");
        }
        return result.rows[0];
    } catch (err: unknown) {
        const message = err instanceof Error ? err.message : String(err);
        throw new Error(message || "Failed to delete issue");
    }
}


export const issuesService = {
    createIssueIntoDB,
    getIssueByIdIntoDB,
    getAllIssuesIntoDB,
    updateIssueInDB,
    deleteIssueFromDB
}