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


//! Update Issue
const updateIssueIntoDB = async (payload: Issue, id: string) => {
    const { title, description, type } = payload;
    const updatedResult = await pool.query(`
    UPDATE issues 
    SET 
    title = COALESCE($1, title),
    description = COALESCE($2, description),
    type = COALESCE($3, type),
    updated_at = NOW()
    WHERE id = $4
    RETURNING *
    `,
        [title, description, type, id]
    )
    return updatedResult;
}


//! Delete Issue
const deleteIssueFromDB = async (id: string) => {
    const result = await pool.query(`
      DELETE FROM issues
      WHERE id = $1
      `, [id])
    return result;
}


export const issueService = {
    createIssueIntoDB,
    getAllIssuesFromDB,
    getSingleIssueFromDB,
    updateIssueIntoDB,
    deleteIssueFromDB
}