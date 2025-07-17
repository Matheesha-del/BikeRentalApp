import { useEffect, useState } from 'react';
import { ShapeSource, Images, CircleLayer, SymbolLayer } from "@rnmapbox/maps";
import { OnPressEvent } from '@rnmapbox/maps/lib/typescript/src/types/OnPressEvent';
import pin from '~/assets/pin.png';
import { featureCollection, point } from '@turf/helpers';
import { useBicycle } from '~/providers/BicycleProvider';
import { database } from '~/utils/firebase'; 
import { onValue, ref } from 'firebase/database';

export default function BicycleMarkers() {
    const { setSelectedBicycle } = useBicycle();
    const [features, setFeatures] = useState<GeoJSON.Feature<GeoJSON.Point, any>[]>([]);

    useEffect(() => {
        const bikesRef = ref(database, 'gps_data');
        const unsubscribe = onValue(bikesRef, (snapshot) => {
            const data = snapshot.val();
            if (data) {
                const points = Object.keys(data).map((key) => {
                    const bike = data[key];
                    return point([bike.longitude, bike.latitude], { bicycle: { ...bike, id: key } });
                });
                setFeatures(points);
            }
        });

        return () => unsubscribe();
    }, []);

    const onPointPress = async (event: OnPressEvent) => {
        if (
            event.features &&
            event.features[0] &&
            event.features[0].properties &&
            event.features[0].properties.bicycle
        ) {
            const raw = event.features[0].properties.bicycle;
            setSelectedBicycle(typeof raw === 'string' ? JSON.parse(raw) : raw);
        }
    };

    return (
        <ShapeSource
            id="bicycles"
            cluster
            shape={featureCollection(features)}
            onPress={onPointPress}
        >
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
                    iconAnchor: 'bottom',
                }}
              
            />
            <Images images={{ pin }} />
  
        </ShapeSource>        
    );
}
