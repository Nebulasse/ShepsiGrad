export interface GeoCoordinates {
    latitude: number;
    longitude: number;
}
export interface LocationDetails {
    coordinates: GeoCoordinates;
    address: string;
    city: string;
    country: string;
    postcode?: string;
    state?: string;
    formattedAddress: string;
}
export interface NearbyPlace {
    id: string;
    name: string;
    type: string;
    coordinates: GeoCoordinates;
    address?: string;
    distance: number;
    rating?: number;
}
export interface DistanceResult {
    distance: {
        value: number;
        text: string;
    };
    duration: {
        value: number;
        text: string;
    };
    origin: string;
    destination: string;
}
export declare class MapService {
    /**
     * Получение координат по адресу (геокодирование)
     */
    static geocode(address: string): Promise<LocationDetails>;
    /**
     * Получение адреса по координатам (обратное геокодирование)
     */
    static reverseGeocode(coords: GeoCoordinates): Promise<LocationDetails>;
    /**
     * Поиск ближайших мест определенного типа
     */
    static findNearbyPlaces(coords: GeoCoordinates, type: string, radius?: number): Promise<NearbyPlace[]>;
    /**
     * Расчет маршрута и расстояния между двумя точками
     */
    static getDistance(origin: GeoCoordinates | string, destination: GeoCoordinates | string, mode?: 'driving' | 'walking' | 'bicycling' | 'transit'): Promise<DistanceResult>;
}
