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
import { getDatabase, ref, onValue, off } from 'firebase/database';

const geofenceData = geofenceDataRaw as FeatureCollection<Polygon>;

type Bicycle = {
  id: number;
  latitude: number;
  longitude: number;
};

type BicycleContextType = {
  selectedBicycle: Bicycle | null;
  setSelectedBicycle: (bike: Bicycle) => void;
  startNavigation: () => Promise<void>;
  direction: any;
  directionCoordinates: [number, number][] | null;
  duration: number | null;
  distance: number | null;
  isNearby: boolean;
  isOutsideGeofence: boolean;
  isBikeInStation: boolean | null;
};

const BicycleContext = createContext<BicycleContextType | undefined>(undefined);

export const BicycleProvider = ({ children }: PropsWithChildren) => {
  const [selectedBicycle, setSelectedBicycle] = useState<Bicycle | null>(null);
  const [direction, setDirection] = useState<any>(null);
  const [isNearby, setIsNearby] = useState(false);
  const [isOutsideGeofence, setIsOutsideGeofence] = useState(false);
  const [isBikeInStation, setIsBikeInStation] = useState<boolean | null>(null);

  // ✅ Listen to bike status in Firebase
  useEffect(() => {
    if (!selectedBicycle) return;

    const db = getDatabase();
    const statusRef = ref(db, `bike_status/${selectedBicycle.id}/status`);

    const unsubscribe = onValue(statusRef, (snapshot) => {
      const status = snapshot.val();
      if (status === 'in_station') {
        console.log('✅ Bike is in station');
        setIsBikeInStation(true);
      } else {
        console.log('❌ Bike is not in station');
        setIsBikeInStation(false);
      }
    });

    return () => off(statusRef);
  }, [selectedBicycle]);

  // ✅ Nearby tracking
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

  // ✅ Geofence logic
  useEffect(() => {
    if (!selectedBicycle) return;

    let subscription: Location.LocationSubscription;

    const startGeofenceWatcher = async () => {
      try {
        subscription = await Location.watchPositionAsync(
          { distanceInterval: 10 },
          (newLocation) => {
            const bikeLocation = point([
              selectedBicycle.longitude,
              selectedBicycle.latitude,
            ]);

            const polygon = geofenceData.features[0];
            const inside = booleanPointInPolygon(bikeLocation, polygon);

            setIsOutsideGeofence(!inside);
          }
        );
      } catch (err) {
        console.error('Geofence watcher failed:', err);
      }
    };

    startGeofenceWatcher();

    return () => {
      subscription?.remove();
    };
  }, [selectedBicycle]);

  // ✅ Navigation start function (only called when pressing "Navigate")
  const startNavigation = async () => {
    if (!selectedBicycle) return;

    try {
      const myLocation = await Location.getCurrentPositionAsync();

      const newDirection = await getDirections(
        [myLocation.coords.longitude, myLocation.coords.latitude],
        [selectedBicycle.longitude, selectedBicycle.latitude]
      );
      setDirection(newDirection);
    } catch (err) {
      console.error('Failed to fetch directions:', err);
    }
  };

  return (
    <BicycleContext.Provider
      value={{
        selectedBicycle,
        setSelectedBicycle,
        startNavigation, // <-- exposed here
        direction,
        directionCoordinates: direction?.routes?.[0]?.geometry?.coordinates ?? null,
        duration: direction?.routes?.[0]?.duration ?? null,
        distance: direction?.routes?.[0]?.distance ?? null,
        isNearby,
        isOutsideGeofence,
        isBikeInStation,
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
