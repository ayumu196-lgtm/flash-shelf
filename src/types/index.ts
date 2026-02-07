export interface Book {
    id: string;
    isbn: string | null;
    title: string;
    cover_url: string | null;
    tags: string[] | null;
    rating: number | null;
    comment: string | null;
    created_at: string;
}

export interface NewBook {
    isbn?: string;
    title: string;
    cover_url?: string;
    tags?: string[];
    rating?: number;
    comment?: string;
}
