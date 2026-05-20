export type IssueType = "bug" | "feature_request";
export type IssueStatus = "open" | "in_progress" | "resolved";

export interface Reporter {
    id: number;
    name: string;
    role?: "contributor" | "maintainer";
}

 
export interface IssueRow {
    id: number;
    title: string;
    description: string;
    type: IssueType;
    status: IssueStatus;
    reporter_id: number;
    created_at: string;
    updated_at: string;
}

 
export interface Issue {
    id: number;
    title: string;
    description: string;
    type: IssueType;
    status: IssueStatus;
    reporter: Reporter | null;
    created_at: string;
    updated_at: string;
}

export interface CreateIssuePayload {
    title: string;
    description: string;
    type: IssueType;
    reporter_id?: number;
}

export interface GetAllIssuesQuery {
    sort?: "newest" | "oldest";
    type?: IssueType;
    status?: IssueStatus;
}

export interface UpdateIssuePayload {
    title?: string;
    description?: string;
    type?: IssueType;
    status?: IssueStatus;
}
