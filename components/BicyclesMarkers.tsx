import { ShapeSource, Images, CircleLayer, SymbolLayer } from "@rnmapbox/maps";
import { OnPressEvent } from '@rnmapbox/maps/lib/typescript/src/types/OnPressEvent';
import pin from '~/assets/pin.png';
import bicycles from '~/data/bicycles.json';
import {featureCollection, point } from '@turf/helpers';
import { useBicycle } from '~/providers/BicycleProvider';

export default function BicycleMarkers() {
    const { setSelectedBicycle} = useBicycle();
    const points =bicycles.map((bicycle) => point([bicycle.longitude, bicycle.latitude ], {bicycle}));

    const onPointPress = async (event : OnPressEvent) => {
        
        if (event.features[0].properties.bicycle) {
            setSelectedBicycle(event.features[0].properties.bicycle);
        }
        

    };


    return(
        <ShapeSource 
            id="bicycles" 
            cluster 
            shape={featureCollection(points)} 
            onPress={onPointPress}>
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
    )
}