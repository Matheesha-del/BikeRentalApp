import Mapbox, {
  Camera,
  LocationPuck,
  MapView,
} from '@rnmapbox/maps';
import LineRoute from './LineRoute';
import { useBicycle } from '~/providers/BicycleProvider';
import BicycleMarkers from './BicyclesMarkers'

Mapbox.setAccessToken(process.env.EXPO_PUBLIC_MAPBOX_KEY || '');


export default function Map(){
    const {directionCoordinates, routeTime} = useBicycle();
    console.log('Time: ', routeTime);



    return (
    <MapView style={{flex:1}} styleURL="mapbox://styles/mapbox/navigation-night-v1">
        <Camera followZoomLevel={16} followUserLocation />
        <LocationPuck puckBearingEnabled puckBearing="heading" pulsing={{ isEnabled: true }} />

        <BicycleMarkers/>

        {directionCoordinates && <LineRoute coordinates={directionCoordinates} /> }
    </MapView>
    );
}