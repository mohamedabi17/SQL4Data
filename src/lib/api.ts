const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8001';

export interface ExecuteQueryRequest {
    query: string;
    task_id: number;
}

export interface ExecuteQueryResponse {
    is_correct: boolean;
    user_data: any[];
    expected_data: any[];
    user_columns: string[];
    expected_columns: string[];
    error_message?: string;
    execution_time_ms?: number;
    row_count: number;
    expected_row_count: number;
}

export interface ExplainErrorRequest {
    query: string;
    task_id: number;
    error_message?: string;
}

export interface ExplainErrorResponse {
    explanation: string;
    hints: string[];
    suggested_concepts: string[];
}

export interface Task {
    task_id: number;
    title: string;
    description: string;
    difficulty: string;
    category: string;
    database_schema: string;
    gold_query: string;
    tables_involved: string;
    created_at: string;
    updated_at: string;
}

export interface TaskListResponse {
    tasks: Task[];
    total: number;
}

export async function executeQuery(
    request: ExecuteQueryRequest
): Promise<ExecuteQueryResponse> {
    try {
        const response = await fetch(`${API_BASE_URL}/api/execute`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(request),
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.detail || `HTTP error! status: ${response.status}`);
        }

        return response.json();
    } catch (error) {
        console.error('Execute query error:', error);
        throw error;
    }
}

export async function getAIExplanation(
    request: ExplainErrorRequest
): Promise<ExplainErrorResponse> {
    try {
        const response = await fetch(`${API_BASE_URL}/api/explain`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(request),
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        return response.json();
    } catch (error) {
        console.error('AI explanation error:', error);
        throw error;
    }
}

export async function getTasks(
    category?: string,
    difficulty?: string
): Promise<TaskListResponse> {
    try {
        const params = new URLSearchParams();
        if (category) params.append('category', category);
        if (difficulty) params.append('difficulty', difficulty);

        const url = `${API_BASE_URL}/api/tasks${params.toString() ? '?' + params.toString() : ''}`;
        const response = await fetch(url);

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        return response.json();
    } catch (error) {
        console.error('Get tasks error:', error);
        throw error;
    }
}

export async function getTask(taskId: number): Promise<Task> {
    try {
        const response = await fetch(`${API_BASE_URL}/api/tasks/${taskId}`);

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        return response.json();
    } catch (error) {
        console.error('Get task error:', error);
        throw error;
    }
}

export async function checkHealth(): Promise<{ status: string; database: string; ai_service: string }> {
    try {
        const response = await fetch(`${API_BASE_URL}/health`);

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        return response.json();
    } catch (error) {
        console.error('Health check error:', error);
        throw error;
    }
}
