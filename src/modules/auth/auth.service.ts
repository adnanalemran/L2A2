import config from "../../config/index";
import { pool } from "../../db/index";
import type { IUser } from "./auth.interfaces";
import bcrypt from "bcryptjs";
import jwt from 'jsonwebtoken'
import type { JwtPayload, SignOptions } from 'jsonwebtoken'
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

const loginUserIntoDB = async (payload: {
    email: string,
    password: string
}) => {


    const { email, password } = payload;
    const userData = await pool.query(`
        SELECT * FROM users WHERE email = $1
        `,
        [email])
    const user = userData.rows[0]
    if (!user) {
        throw new Error("Invalid credentials")
    }
    const matchPassword = await bcrypt.compare(password, user.password)
    if (!matchPassword) {
        throw new Error("Invalid credentials")
    }

    // generate token
    const jwtPayload = {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
    }
    const token = jwt.sign(jwtPayload, config.jwtSecretKey as string, { expiresIn: config.accessTokenExpiresIn } as SignOptions)
 
    const { password: _,  ...userinfo } = user

    return { token, ...userinfo, }


}

export const authService = {
    createUserIntoDB,
    loginUserIntoDB
}