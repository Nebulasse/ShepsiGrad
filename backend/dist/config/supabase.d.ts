export declare const supabase: {
    from: (table: any) => {
        select: (fields?: string) => {
            eq: (field: any, value: any) => {
                single: () => {
                    data: any;
                    error: any;
                };
            };
            single: () => {
                data: any;
                error: any;
            };
        };
        insert: (items: any) => {
            select: () => {
                single: () => {
                    data: any;
                    error: any;
                };
            };
        };
        update: (item: any) => {
            eq: (field: any, value: any) => {
                select: () => {
                    single: () => {
                        data: any;
                        error: {
                            message: string;
                        };
                    } | {
                        data: any;
                        error: any;
                    };
                };
            };
        };
        delete: () => {
            eq: (field: any, value: any) => {
                error: any;
            };
        };
    };
};
export declare const getSupabaseClient: () => {
    from: (table: any) => {
        select: (fields?: string) => {
            eq: (field: any, value: any) => {
                single: () => {
                    data: any;
                    error: any;
                };
            };
            single: () => {
                data: any;
                error: any;
            };
        };
        insert: (items: any) => {
            select: () => {
                single: () => {
                    data: any;
                    error: any;
                };
            };
        };
        update: (item: any) => {
            eq: (field: any, value: any) => {
                select: () => {
                    single: () => {
                        data: any;
                        error: {
                            message: string;
                        };
                    } | {
                        data: any;
                        error: any;
                    };
                };
            };
        };
        delete: () => {
            eq: (field: any, value: any) => {
                error: any;
            };
        };
    };
};
