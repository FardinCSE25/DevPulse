import type { Roles } from "../../types/user.types";

type Category = "bug" | "feature_request"
type Status = "open" | "in_progress" | "resolved"

export interface Issue {
    id: number;
    title: string;
    description: string;
    type: Category;
    status: Status;
    reporter: {
        id: number;
        name: string;
        role: Roles;
    },
    created_at: string;
    updated_at: string
}