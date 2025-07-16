import React, { useEffect, useState } from 'react';
import Mapbox, {
  Camera,
  LocationPuck,
  MapView,
} from '@rnmapbox/maps';
import LineRoute from './LineRoute';
import { useBicycle } from '~/providers/BicycleProvider';
import BicycleMarkers from './BicyclesMarkers'
import {featureCollection, point } from '@turf/helpers';
import { database } from '~/utils/firebase';
import { onValue, ref, update } from 'firebase/database';
import pin from '~/assets/pin.png';
import { query, orderByChild, limitToLast } from "firebase/database";


Mapbox.setAccessToken(process.env.EXPO_PUBLIC_MAPBOX_KEY || '');


export default function Map(){
    const {directionCoordinates, routeTime} = useBicycle();
    console.log('Time: ', routeTime);

    const [bikePoints, setBikePoints] = useState<any[]>([]);

    useEffect(() => {
        const gpsQuery = query(
        ref(database, 'gps_data'),
        orderByChild('timestamp'),
        limitToLast(1)
    );

        const unsubscribe = onValue(gpsQuery, (snapshot) => {
            const data = snapshot.val();
            console.log("🔥 Firebase response:", data);

            if (data) {
            const [key, latestRaw] = Object.entries(data)[0];
            const latest = latestRaw as { latitude?: number; longitude?: number };

            if (latest.latitude && latest.longitude) {
                const latestPoint = point([latest.longitude, latest.latitude], { id: 'bike01' });
                setBikePoints([latestPoint]);
            } else {
                console.warn("⚠️ Data exists but missing lat/lon:", latest);
            }
            } else {
            console.warn("⚠️ No data received from Firebase.");
            }
        });

        return () => unsubscribe();
        }, []);


    // useEffect(() => {
    //     const locationRef = ref(database, 'gps_data');
    //     const unsubscribe = onValue(locationRef, (snapshot) => {
    //         const data = snapshot.val();
    //         if (data) {
    //           const points = Object.entries(data).map(([bikeId, coords]) => {
    //             if (
    //               typeof coords === 'object' && coords !== null && 
    //               'latitude' in coords && 'longitude' in coords
    //             ) {
    //               const { latitude, longitude } = coords as { latitude: number; longitude: number };
    //               if (latitude && longitude) {
    //                 return point([longitude, latitude], { id: bikeId });
    //               }
    //             }
    //           }).filter(Boolean); // remove undefined/null
    //           setBikePoints(points);
    //           }});

    //     // Cleanup subscription on unmount
    //     return () => unsubscribe();
    // }, []);

    
    return (
        <MapView style={{flex:1}} styleURL="mapbox://styles/mapbox/navigation-night-v1">
            <Camera followZoomLevel={16} followUserLocation />
            <LocationPuck puckBearingEnabled puckBearing="heading" pulsing={{ isEnabled: true }} />

        <BicycleMarkers/>

        {directionCoordinates && <LineRoute coordinates={directionCoordinates} /> }
    </MapView>
    );
}