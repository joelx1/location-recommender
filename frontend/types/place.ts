export type PlaceSource = "db" | "google";

export type PlaceResult = {
  id: string;
  name: string;
  address: string;
  category: string;
  latitude?: number;
  longitude?: number;
  source: PlaceSource;
  googlePlaceId?: string;
};

export type BackendCoordinates = {
  type: string;
  coordinates: [number, number];
};

export type BackendLocation = {
  id: string;
  name: string;
  address: string | null;
  category: string;
  coordinates: BackendCoordinates | null;
};
