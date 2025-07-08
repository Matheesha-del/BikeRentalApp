import React, { useEffect, useState } from 'react';
import Mapbox, {
  Camera,
  LocationPuck,
  MapView,
  ShapeSource,
  CircleLayer,
  SymbolLayer,
  Images
} from '@rnmapbox/maps';
import {featureCollection, point } from '@turf/helpers';
import { database } from '~/utils/firebase';
import { onValue, ref, update } from 'firebase/database';
import pin from '~/assets/pin.png';
import { query, orderByChild, limitToLast } from "firebase/database";


Mapbox.setAccessToken(process.env.EXPO_PUBLIC_MAPBOX_KEY || '');


export default function Map(){
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

            <ShapeSource 
                id="bicycles" cluster 
                shape={featureCollection(bikePoints)} 
                onPress={(e) => console.log(JSON.stringify(e, null, 2))}>
                <SymbolLayer
                    id="clusters-count"
                    style={{
                        textField: ['get', 'point_count'],
                        textSize: 18,
                        textColor: '#ffffff',
                        textPitchAlignment: 'map',
                    }}
                />

                <CircleLayer
                    id="clusters"
                    belowLayerID="clusters-count"
                    filter={['has', 'point_count']}
                    style={{
                        circleColor: '#59e8f1',
                        circlePitchAlignment: 'map',
                        circleRadius: 20,
                        circleOpacity: 1,
                        circleStrokeWidth: 2,
                        circleStrokeColor: 'white',
                    }}
                />
                <SymbolLayer
                    id="bicycle-icons"
                    filter={['!', ['has', 'point_count']]}
                    style={{
                        iconImage: 'pin',
                        iconSize: 0.1,
                        iconAllowOverlap: true,
                        iconAnchor: 'bottom'
                    }}
                />
                <Images images={{ pin }} />
            </ShapeSource>
        </MapView>
    );
}