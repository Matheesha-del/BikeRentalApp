import {
  createContext,
  useContext,
  useState,
  useEffect,
  PropsWithChildren,
} from 'react';
import * as Location from 'expo-location';
import { getDirections } from '~/services/directions';
import getDistance from '@turf/distance';
import { point } from '@turf/helpers';
import booleanPointInPolygon from '@turf/boolean-point-in-polygon';
import type { FeatureCollection, Polygon } from 'geojson';
import geofenceDataRaw from '../data/geofencedata.json';

const geofenceData = geofenceDataRaw as FeatureCollection<Polygon>;

type Bicycle = {
  id: number;
  latitude: number;
  longitude: number;
};

type BicycleContextType = {
  selectedBicycle: Bicycle | null;
  setSelectedBicycle: (bike: Bicycle) => void;
  direction: any;
  directionCoordinates: [number, number][] | null;
  duration: number | null;
  distance: number | null;
  isNearby: boolean;
  isOutsideGeofence: boolean;
};

const BicycleContext = createContext<BicycleContextType | undefined>(undefined);

export const BicycleProvider = ({ children }: PropsWithChildren) => {
  const [selectedBicycle, setSelectedBicycle] = useState<Bicycle | null>(null);
  const [direction, setDirection] = useState<any>(null);
  const [isNearby, setIsNearby] = useState(false);
  const [isOutsideGeofence, setIsOutsideGeofence] = useState(false);

  // Nearby tracking
  useEffect(() => {
    if (!selectedBicycle) return;

    let subscription: Location.LocationSubscription;

    const startWatching = async () => {
      subscription = await Location.watchPositionAsync(
        { distanceInterval: 50 },
        (newLocation) => {
          const from = point([
            newLocation.coords.longitude,
            newLocation.coords.latitude,
          ]);
          const to = point([selectedBicycle.longitude, selectedBicycle.latitude]);
          const distance = getDistance(from, to, { units: 'meters' });
          setIsNearby(distance < 10000);
        }
      );
    };

    startWatching();

    return () => {
      subscription?.remove();
    };
  }, [selectedBicycle]);

  // ✅ Geofence logic (moved outside)
  useEffect(() => {
  if (!selectedBicycle) return;

  let subscription: Location.LocationSubscription;

  const startGeofenceWatcher = async () => {
    try {
      subscription = await Location.watchPositionAsync(
        { distanceInterval: 10 }, // check every 10m movement
        (newLocation) => {
          const userLocation = point([
            selectedBicycle.longitude,
            selectedBicycle.latitude,
          ]);

          const polygon = geofenceData.features[0];
          const inside = booleanPointInPolygon(userLocation, polygon);

          if (inside) {
            console.log('✅ User is inside the geofence zone');
            setIsOutsideGeofence(false);
          } else {
            console.log('❌ User is outside the geofence zone');
            setIsOutsideGeofence(true);
          }
        }
      );
    } catch (err) {
      console.error('Geofence watcher failed:', err);
    }
  };

  startGeofenceWatcher();

  return () => {
    subscription?.remove(); // clean up when unmount or bike change
  };
}, [selectedBicycle]);


  // Directions fetch
  useEffect(() => {
    const fetchDirections = async () => {
      const myLocation = await Location.getCurrentPositionAsync();

      const newDirection = await getDirections(
        [myLocation.coords.longitude, myLocation.coords.latitude],
        [selectedBicycle!.longitude, selectedBicycle!.latitude]
      );
      setDirection(newDirection);
    };

    if (selectedBicycle) {
      fetchDirections();
    }
  }, [selectedBicycle]);

  return (
    <BicycleContext.Provider
      value={{
        selectedBicycle,
        setSelectedBicycle,
        direction,
        directionCoordinates: direction?.routes?.[0]?.geometry?.coordinates ?? null,
        duration: direction?.routes?.[0]?.duration ?? null,
        distance: direction?.routes?.[0]?.distance ?? null,
        isNearby,
        isOutsideGeofence,
      }}
    >
      {children}
    </BicycleContext.Provider>
  );
};

export const useBicycle = () => {
  const context = useContext(BicycleContext);
  if (!context) {
    throw new Error('useBicycle must be used within a BicycleProvider');
  }
  return context;
};
