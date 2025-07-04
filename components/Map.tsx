
import Mapbox, {
  Camera,
  LocationPuck,
  MapView,
  ShapeSource,
  CircleLayer,
  SymbolLayer,
  Images
} from '@rnmapbox/maps';
//import MapboxGL from '@rnmapbox/maps';
import {featureCollection, point } from '@turf/helpers';


import pin from '~/assets/pin.png';

import bicycles from '~/data/bicycles.json';

Mapbox.setAccessToken(process.env.EXPO_PUBLIC_MAPBOX_KEY || '');


export default function Map(){
    const points =bicycles.map((bicycle) => point([bicycle.longitude, bicycle.latitude ]));


    return (
    <MapView style={{flex:1}} styleURL="mapbox://styles/mapbox/navigation-night-v1">
        <Camera followZoomLevel={16} followUserLocation />
        <LocationPuck puckBearingEnabled puckBearing="heading" pulsing={{ isEnabled: true }} />

        <ShapeSource 
            id="bicycles" cluster 
            shape={featureCollection(points)} 
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