// BicycleProvider.tsx
import {
  createContext,
  useContext,
  useState,
  useEffect,
  PropsWithChildren,
} from 'react';
import * as Location from 'expo-location';
import { getDirections } from '~/services/directions';
import getDistance  from '@turf/distance';
import { point } from '@turf/helpers';

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
  isNearby:boolean;
};

const BicycleContext = createContext<BicycleContextType | undefined>(undefined);

export const BicycleProvider = ({ children }: PropsWithChildren) => {
  const [selectedBicycle, setSelectedBicycle] = useState<Bicycle | null>(null);
  const [direction, setDirection] = useState<any>(null);
  const [isNearby, setIsNearby] = useState(false);

  useEffect(() => {
  if (!selectedBicycle) return;

  let subscription: Location.LocationSubscription;

  const startWatching = async () => {
    subscription = await Location.watchPositionAsync(
      { distanceInterval: 50 },
      (newLocation) => {
        const from = point([newLocation.coords.longitude, newLocation.coords.latitude]);
        const to = point([selectedBicycle.longitude, selectedBicycle.latitude]);
        const distance = getDistance(from, to, { units: 'meters' });
        setIsNearby(distance < 100);
      }
    );
  };

  startWatching();

  return () => {
    subscription?.remove();
  };
}, [selectedBicycle]);


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
