import { pool } from "../../db"
import bcrypt from "bcryptjs"
import jwt, { type JwtPayload } from "jsonwebtoken"
import config from "../../config";

interface Auth {
    email: string;
    password: string;
}

interface User extends Auth {
    name: string;
    role: string
}


//! Signup User
const signupUserIntoDB = async (payload: User) => {
    const { name, email, password, role } = payload;

    const hashPassword = await bcrypt.hash(password, 10);

    const result = await pool.query(`
    INSERT INTO users(name, email, password, role)
    VALUES ($1, $2, $3, COALESCE($4, 'contributor'))
    RETURNING *
    `,
        [name, email, hashPassword, role]
    )
    delete result.rows[0].password;
    return result;
}


//! Login User
const loginUserIntoDB = async (payload: Auth) => {
    const { email, password } = payload;
    const userData = await pool.query(`
         SELECT * FROM users WHERE email = $1
        `, [email])

    if (userData.rows.length === 0) {
        throw new Error("You are not registered !")
    }

    const user = userData.rows[0]
    const isCorrectPassword = await bcrypt.compare(password, user.password)

    if (!isCorrectPassword) {
        throw new Error("Your password is incorrect !")
    }

    const jwtPayload = {
        id: user.id,
        name: user.name,
        role: user.role
    }

    const accessToken = jwt.sign(jwtPayload, config.jwt_secret as string, { expiresIn: "1d" })

    return {
        "token": accessToken,
        "user": {
            "id": user.id,
            "name": user.name,
            "email": user.email,
            "role": user.role,
            "created_at": user.created_at,
            "updated_at": user.updated_at
        }
    };

}


export const authService = {
    signupUserIntoDB,
    loginUserIntoDB
}