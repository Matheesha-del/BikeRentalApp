import { useEffect, useState } from 'react';

import { ShapeSource, Images, CircleLayer, SymbolLayer, FillLayer, LineLayer } from "@rnmapbox/maps";
import { OnPressEvent } from '@rnmapbox/maps/lib/typescript/src/types/OnPressEvent';
import pin from '~/assets/pin.png';
import { featureCollection, point } from '@turf/helpers';
import { useBicycle } from '~/providers/BicycleProvider';
import { database } from '~/utils/firebase'; 
import { onValue, ref } from 'firebase/database';

import geofenceData from '~/data/geofencedata.json'; // adjust path if needed

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

    const WORLD_BOUNDS = [
        [-180, -90],
        [-180, 90],
        [180, 90],
        [180, -90],
        [-180, -90],
    ];

    const geoFeature = geofenceData.features[0];
    const innerRing = geoFeature?.geometry?.coordinates?.[0];

    const maskShape = {
        type: 'Feature',
        geometry: {
            type: 'Polygon',
            coordinates: [WORLD_BOUNDS, innerRing], // [outer boundary, hole]
        },
    };

    // For the geofence outline, create a Feature for just the inner ring as a LineString
    const geofenceLineFeature = {
        type: 'Feature',
        geometry: {
            type: 'LineString',
            coordinates: innerRing || [],
        },
    };

    return (
        <>
            {/* Faded red mask outside geofence */}
            {innerRing && (
                <>
                    <ShapeSource 
                    id="mask-source" 
                    shape={maskShape}>
                        <FillLayer
                            id="mask-layer"
                            style={{
                                fillColor: 'red',
                                fillOpacity: 0.2,
                            }}
                        />
                    </ShapeSource>
                    {/* Red dashed outline around geofence */}
                    <ShapeSource 
                    id="geofence-outline-source" 
                    shape={geofenceLineFeature}>
                        <LineLayer
                            id="geofence-outline"
                            style={{
                                lineColor: 'red',
                                lineWidth: 2,
                                lineDasharray: [4, 2],  // dashed pattern: 4 units line, 2 units gap
                            }}
                        />
                    </ShapeSource>
                </>
            )}
            {/* Bike Markers and Clusters */}
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
        </>
    );
}
