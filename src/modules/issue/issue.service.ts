import { pool } from "../../db"
import type { Issue } from "./issue.interface";


const createIssueIntoDB = async (payload: Issue, id: number) => {
    const { title, description, type } = payload;

    const result = await pool.query(`
    INSERT INTO issues(title, description, type, reporter_id)
    VALUES ($1, $2, $3, $4)
    RETURNING *
    `,
        [title, description, type, id]
    )
    return result;
}


// const getAllIssuesFromDB = async () => {
//     const result = await pool.query(`
//       SELECT id, name, email, age, created_at, updated_at, role FROM issues
//       `)
//     return result;
// }


// const getSingleIssueFromDB = async (id: string) => {
//     const result = await pool.query(`
//       SELECT * FROM issues
//       WHERE id = $1
//       `,
//         [id])
//     delete result.rows[0].password
//     delete result.rows[0].is_active
//     return result;
// }


// const updateIssueIntoDB = async (payload: Issue, id: string) => {
//     const { name, password, age, is_active, role } = payload;
//     const result = await pool.query(`
//     UPDATE issues 
//     SET 
//     name = COALESCE($1, name),
//     password = COALESCE($2, password),
//     age = COALESCE($3, age),
//     is_active = COALESCE($4, is_active),
//     role = COALESCE($6, role)
//     WHERE id = $5
//     RETURNING *
//     `,
//         [name, password, age, is_active, id, role]
//     )
//     delete result.rows[0].password
//     delete result.rows[0].is_active
//     return result;
// }


// const deleteIssueFromDB = async (id: string) => {
//     const result = await pool.query(`
//       DELETE FROM issues
//       WHERE id = $1
//       `, [id])
//     return result;
// }


export const issueService = {
    createIssueIntoDB,
    // getAllIssuesFromDB,
    // getSingleIssueFromDB,
    // updateIssueIntoDB,
    // deleteIssueFromDB
}