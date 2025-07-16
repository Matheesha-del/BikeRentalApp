import { ShapeSource, LineLayer} from "@rnmapbox/maps"

export default function LineRoute({ coordinates }: {coordinates: [number, number][]
}) {
    return(
        <ShapeSource
                id="routeSource"
                lineMetrics
                shape={{
                    properties: {},
                    type: 'Feature',
                    geometry: {
                        type: 'LineString',
                        coordinates,
                    },
                }}>
                <LineLayer
                    id="exampleLineLayer"
                    style={{
                        lineColor: '#59e8f1',
                        lineDasharray: [2, 4],
                        lineCap:'round',
                        lineJoin: 'round',
                        lineWidth: 7,
                    }}
                />
                </ShapeSource>

    )
}