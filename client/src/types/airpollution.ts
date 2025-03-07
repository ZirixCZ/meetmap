
export interface AirPollutionFeature {
    geometry: {
        coordinates: [number, number];
        type: string;
    };
    properties: {
        measurement: {
            AQ_hourly_index: string;
            components: {
                averaged_time: {
                    averaged_hours: string;
                    value: number;
                };
                type: string;
            }[];
        };
        id: string;
        name: string;
        updated_at: string;
        district: string;
    };
    type: string;
}

export interface AirPollutionFeatureCollection {
    features: AirPollutionFeature[];
    type: string;
}


export type AQ_Hourly_Index_Translation = {
    id: number;
    index_code: string;
    limit_gte: number | null;
    limit_lt: number | null;
    color: string;
    color_text: string;
    description_cs: string;
    description_en: string;
};