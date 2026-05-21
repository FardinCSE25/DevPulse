import { pool } from "../../db"
import type { Issue } from "./issue.interface";


//! Create Issue
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


//! Get All Issues
const getAllIssuesFromDB = async () => {
    const issues = await pool.query(`
      SELECT * FROM issues
      `)

    const reporterIdFromIssues = issues.rows.map((issue) => issue.reporter_id)

    const reporters = await pool.query(`
      SELECT id, name, role FROM users
      WHERE id IN (${reporterIdFromIssues.join(",")})
      `)

    const targetedIssues = issues.rows.map(issue => {

        const reporter = reporters.rows.find(
            r => r.id === issue.reporter_id
        );

        const result = {
            id: issue.id,
            title: issue.title,
            description: issue.description,
            type: issue.type,
            status: issue.status,

            reporter: {
                id: reporter?.id,
                name: reporter?.name,
                role: reporter?.role
            },

            created_at: issue.created_at,
            updated_at: issue.updated_at
        };

        return result;
    });
    return targetedIssues
}


//! Get a Single Issue
const getSingleIssueFromDB = async (id: string) => {
    const issueResult = await pool.query(`
      SELECT * FROM issues
      WHERE id = $1
      `,
        [id])

    const issue = issueResult.rows[0]

    if (!issue) {
        throw new Error("Issue not found !")
    }

    const reporterResult = await pool.query(`
      SELECT id, name, role FROM users
      WHERE id IN (${issue.reporter_id})
      `)

    const reporter = reporterResult.rows[0]

    const result = {
        id: issue.id,
        title: issue.title,
        description: issue.description,
        type: issue.type,
        status: issue.status,

        reporter: {
            id: reporter?.id,
            name: reporter?.name,
            role: reporter?.role
        },

        created_at: issue.created_at,
        updated_at: issue.updated_at
    };

    return result;
}


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
    getAllIssuesFromDB,
    getSingleIssueFromDB,
    // updateIssueIntoDB,
    // deleteIssueFromDB
}