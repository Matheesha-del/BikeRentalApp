import Mapbox, {
  Camera,
  Images,
  LocationPuck,
  MapView,
  SymbolLayer,
} from '@rnmapbox/maps';
import LineRoute from './LineRoute';
import { useBicycle } from '~/providers/BicycleProvider';
import BicycleMarkers from './BicyclesMarkers'
import * as Location from 'expo-location';
import { useEffect, useRef } from 'react';
import { point, featureCollection } from '@turf/helpers';
import { ShapeSource, CircleLayer } from '@rnmapbox/maps';
import React from 'react';


Mapbox.setAccessToken(process.env.EXPO_PUBLIC_MAPBOX_KEY || '');


export default function Map(){
  const cameraRef = useRef<Camera>(null);
  const {directionCoordinates, routeTime} = useBicycle();
  console.log('Time: ', routeTime);

  // Maintain zoom level in state
  const [zoom, setZoom] = React.useState(16);

    const zoomIn = () => {
    const newZoom = zoom + 1;
    setZoom(newZoom);
    cameraRef.current?.zoomTo(newZoom, 500); // 500ms animation
  };

    const zoomOut = () => {
    const newZoom = zoom - 1;
    setZoom(newZoom);
    cameraRef.current?.zoomTo(newZoom, 500);
  };

    useEffect(() => {
    (async () => {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
        console.warn('Permission to access location was denied');
        }
    })();
    }, []);
      
    return (
        <MapView 
            style={{flex:1}} 
            styleURL="mapbox://styles/mapbox/navigation-night-v1">
            <Camera followZoomLevel={16} followUserLocation />
            <LocationPuck puckBearingEnabled puckBearing="heading" pulsing={{ isEnabled: true }} />
            

        <BicycleMarkers/>

        {directionCoordinates && <LineRoute coordinates={directionCoordinates} /> }
        <Images images={{ stationIcon: require('~/assets/station.png') }} />
        <ShapeSource 
            id="station" 
            shape={featureCollection([
            point([ 79.899003, 6.79570 ]) 
        ])}>
            <SymbolLayer
            id="station-marker"
            style={{
                iconImage: 'stationIcon',
                iconSize: 0.1,
                iconAllowOverlap: true,
                iconAnchor: 'bottom',
                textField: ['get', 'name'],
            }}
            />
        </ShapeSource>
    </MapView>
 );
}

