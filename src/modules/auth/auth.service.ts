import { pool } from "../../db"
import bcrypt from "bcryptjs"

interface User {
    name: string;
    email: string;
    password: string;
    role: string
}


const signUpUserIntoDB = async (payload: User) => {
    const { name, email, password, role } = payload;

    const hashPassword = await bcrypt.hash(password, 10);

    const result = await pool.query(`
    INSERT INTO users(name, email, password, role)
    VALUES ($1, $2, $3, COALESCE($4, 'contributor'))
    RETURNING *
    `,
        [name, email, hashPassword, role]
    )
    delete result.rows[0].password
    return result;
}


export const authService = {
    signUpUserIntoDB,
}