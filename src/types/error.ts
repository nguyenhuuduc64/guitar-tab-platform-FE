export interface ApiError {
    message: string;
    statusCode: number;
    error?: string; // Optional field for additional error details
}