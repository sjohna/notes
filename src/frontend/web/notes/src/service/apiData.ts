export interface APIResponse<T> {
    response?: T;
    error?: string;
}

// represents data from an external API
export interface APIData<T> {
    data?: T;
    inProgress: boolean;
    error?: string;
}

export function Default<T>(): APIData<T> {
    return {
        data: null,
        inProgress: false,
        error: null,
    }
}

export function InProgress<T>(): APIData<T> {
    return {
        data: null,
        inProgress: true,
        error: null,
    }
}

export function FromData<T>(data: T): APIData<T> {
    return {
        data,
        inProgress: false,
        error: null,
    }
}

export function FromError<T>(error: string): APIData<T> {
    return {
        data: null,
        inProgress: false,
        error,
    }
}

export function FromErrorOrData<T>(error?: string, data?: T): APIData<T> {
    if (error) {
        return FromError(error);
    }

    return FromData(data);
}