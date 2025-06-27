/**
 * Геокодирование адреса
 */
async geocodeAddress(address: string): Promise<GeocodingResult> {
  try {
    // Запрос к API геокодирования
    const response = await axios.get(
      `https://maps.googleapis.com/maps/api/geocode/json`,
      {
        params: {
          address,
          key: this.apiKey
        }
      }
    );

    // Проверка результата
    if (response.data.status !== 'OK') {
      throw new Error(`Geocoding API error: ${response.data.status}`);
    }

    const result = response.data.results[0];
    return {
      formattedAddress: result.formatted_address,
      location: {
        lat: result.geometry.location.lat,
        lng: result.geometry.location.lng
      },
      placeId: result.place_id,
      addressComponents: result.address_components.map((component: any) => ({
        longName: component.long_name,
        shortName: component.short_name,
        types: component.types
      }))
    };
  } catch (error: unknown) {
    logger.error('Ошибка геокодирования', { address, error: error instanceof Error ? error.message : String(error) });
    throw new Error(`Failed to geocode address: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Обратное геокодирование (координаты в адрес)
 */
async reverseGeocode(lat: number, lng: number): Promise<GeocodingResult> {
  try {
    // Запрос к API обратного геокодирования
    const response = await axios.get(
      `https://maps.googleapis.com/maps/api/geocode/json`,
      {
        params: {
          latlng: `${lat},${lng}`,
          key: this.apiKey
        }
      }
    );

    // Проверка результата
    if (response.data.status !== 'OK') {
      throw new Error(`Reverse Geocoding API error: ${response.data.status}`);
    }

    const result = response.data.results[0];
    return {
      formattedAddress: result.formatted_address,
      location: {
        lat: result.geometry.location.lat,
        lng: result.geometry.location.lng
      },
      placeId: result.place_id,
      addressComponents: result.address_components.map((component: any) => ({
        longName: component.long_name,
        shortName: component.short_name,
        types: component.types
      }))
    };
  } catch (error: unknown) {
    logger.error('Ошибка обратного геокодирования', { lat, lng, error: error instanceof Error ? error.message : String(error) });
    throw new Error(`Failed to reverse geocode: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Поиск мест поблизости
 */
async findNearbyPlaces(lat: number, lng: number, radius: number = 1000, type?: string): Promise<PlaceResult[]> {
  try {
    // Параметры запроса
    const params: any = {
      location: `${lat},${lng}`,
      radius,
      key: this.apiKey
    };

    // Добавляем тип места, если указан
    if (type) {
      params.type = type;
    }

    // Запрос к API поиска мест
    const response = await axios.get(
      `https://maps.googleapis.com/maps/api/place/nearbysearch/json`,
      { params }
    );

    // Проверка результата
    if (response.data.status !== 'OK' && response.data.status !== 'ZERO_RESULTS') {
      throw new Error(`Places API error: ${response.data.status}`);
    }

    // Если нет результатов, возвращаем пустой массив
    if (response.data.status === 'ZERO_RESULTS') {
      return [];
    }

    // Преобразуем результаты
    return response.data.results.map((place: any) => ({
      placeId: place.place_id,
      name: place.name,
      location: {
        lat: place.geometry.location.lat,
        lng: place.geometry.location.lng
      },
      vicinity: place.vicinity,
      rating: place.rating,
      types: place.types,
      photos: place.photos ? place.photos.map((photo: any) => ({
        reference: photo.photo_reference,
        width: photo.width,
        height: photo.height
      })) : []
    }));
  } catch (error: unknown) {
    logger.error('Ошибка поиска мест', { lat, lng, radius, type, error: error instanceof Error ? error.message : String(error) });
    throw new Error(`Failed to find nearby places: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Расчет маршрута между двумя точками
 */
async calculateRoute(origin: string | LatLng, destination: string | LatLng, mode: TravelMode = 'driving'): Promise<RouteResult> {
  try {
    // Преобразуем точки в строковый формат для API
    const originStr = typeof origin === 'string' ? origin : `${origin.lat},${origin.lng}`;
    const destStr = typeof destination === 'string' ? destination : `${destination.lat},${destination.lng}`;

    // Запрос к API построения маршрутов
    const response = await axios.get(
      `https://maps.googleapis.com/maps/api/directions/json`,
      {
        params: {
          origin: originStr,
          destination: destStr,
          mode,
          key: this.apiKey
        }
      }
    );

    // Проверка результата
    if (response.data.status !== 'OK') {
      throw new Error(`Directions API error: ${response.data.status}`);
    }

    const route = response.data.routes[0];
    return {
      distance: route.legs[0].distance.value,
      duration: route.legs[0].duration.value,
      startAddress: route.legs[0].start_address,
      endAddress: route.legs[0].end_address,
      steps: route.legs[0].steps.map((step: any) => ({
        distance: step.distance.value,
        duration: step.duration.value,
        instructions: step.html_instructions,
        travelMode: step.travel_mode.toLowerCase(),
        polyline: step.polyline.points
      })),
      polyline: route.overview_polyline.points
    };
  } catch (error: unknown) {
    logger.error('Ошибка расчета маршрута', { 
      origin, 
      destination, 
      mode, 
      error: error instanceof Error ? error.message : String(error) 
    });
    throw new Error(`Failed to calculate route: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
} 