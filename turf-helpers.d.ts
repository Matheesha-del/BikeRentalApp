declare module '@turf/helpers' {
  export function point(
    coordinates: number[],
    properties?: Record<string, any>
  ): any;

  export function featureCollection(features: any[]): any;
}
