export interface MbtaAlert {
    attributes: {
        active_period: { end: string; start: string }[];
        banner: string | null;
        cause: string;
        created_at: string;
        description: string;
        duration_certainty: string;
        effect: string;
        header: string;
        image: string | null;
        image_alternative_text: string | null;
        informed_entity: {
            stop: string;
            route_type: number;
            route: string;
            activities: string[];
        }[];
        lifecycle: string;
        service_effect: string;
        severity: number;
        short_header: string;
        timeframe: string;
        updated_at: string;
        url: string | null;
    };
    id: string;
    links: {
        self: string;
    };
    type: string;
}