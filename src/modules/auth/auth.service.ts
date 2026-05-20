import { pool } from "../../db/index.ts";
import { IUser } from "./auth.interfaces.ts";
import bcrypt from "bcryptjs";

const createUserIntoDB = async (payload: IUser) => {
    const { name, email, password, role } = payload
    const hashedPassword = await bcrypt.hash(password, 10);

    const result = await pool.query(`
    INSERT INTO users(name, email, password, role) VALUES ($1, $2, $3, COALESCE($4, 'user')) 
    RETURNING *
  `, [name, email, hashedPassword, role])
    delete result.rows[0].password
    return result.rows[0]
}
export const authService = {
    createUserIntoDB
}