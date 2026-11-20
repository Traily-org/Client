import "maplibre-gl/dist/maplibre-gl.css";

import {
    type GeoJSONSource,
    type GeoJSONSourceSpecification,
    type LayerSpecification,
    Map,
    type Map as MapLibreMap,
    Marker,
    type PointLike,
    type StyleSpecification,
} from "maplibre-gl";
import { useEffect, useEffectEvent, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { MAP_MIN_ZOOM } from "@/constants/config";
import { getBounds, type Viewport } from "@/utils/bounds";

import { HikePositionMarker } from "./hike-position-marker";
import { MapLegalNotices } from "./map-legal-notices";
import { PhotoPinMarker } from "./photo-pin-marker";
import { RouteEndMarker } from "./route-end-marker";
import { setupMapLibreForWeb } from "./setup-maplibre-web";
import {
    getTrailFocusPadding,
    TRAIL_FOCUS_DURATION,
    TRAIL_HIT_RADIUS,
} from "./trail-focus-camera";
import { useHikeCamera } from "../hooks/use-hike-camera";
import { useMapMode } from "../hooks/use-map-mode";
import {
    type HikeFeatureCollection,
    toHikeGeoJSON,
} from "../services/hike-geojson";
import {
    getTrailId,
    type TrailFeatureCollection,
    toTrailsGeoJSON,
} from "../services/trails-geojson";
import {
    getHikeLayers,
    getMapStyle,
    getTrailLayers,
    HIKE_SOURCE_ID,
    SHOW_MAPTILER_LEGAL_NOTICES,
    TRAIL_TOUCH_LAYER_IDS,
    TRAILS_SOURCE_ID,
} from "../style/map-styles";
import type { MapTrail, PhotoPin, TrailyMapProps } from "../types";

// Shared defaults, so the data stays the same object between renders.
const NO_TRAILS: MapTrail[] = [];
const NO_PINS: PhotoPin[] = [];

/**
 * A maplibre-gl marker element, and what to portal into it: the focused
 * trail's end, or a photo pin.
 */
interface MarkerSlot {
    key: string;
    element: HTMLElement;
    marker: "end" | PhotoPin;
}

/** Where the map opens: Annecy, until it follows the user's position. */
const INITIAL_VIEW = {
    center: [6.1296, 45.8992] as [number, number],
    zoom: 11,
};

/** A click hits a trail a few pixels around its line. */
const CLICK_HIT_RADIUS = 10;

function getViewport(map: MapLibreMap): Viewport {
    const bounds = map.getBounds();
    return {
        bounds: [
            bounds.getWest(),
            bounds.getSouth(),
            bounds.getEast(),
            bounds.getNorth(),
        ],
        zoom: map.getZoom(),
    };
}

/** Trail drawn within `radius` pixels of the point, topmost first. */
function getTrailAt(
    map: MapLibreMap,
    { x, y }: { x: number; y: number },
    radius: number,
): string | null {
    // Before the trail layers exist, querying them is an error.
    if (!map.getLayer(TRAIL_TOUCH_LAYER_IDS[0])) return null;
    const box: [PointLike, PointLike] = [
        [x - radius, y - radius],
        [x + radius, y + radius],
    ];
    const features = map.queryRenderedFeatures(box, {
        layers: TRAIL_TOUCH_LAYER_IDS,
    });
    return features.map(getTrailId).find((id) => id !== null) ?? null;
}

export function TrailyMap({
    bottomOffset = 0,
    trails = NO_TRAILS,
    highlightedTrailId,
    focusedTrailId,
    framedTrailId,
    pins = NO_PINS,
    onPressTrail,
    onPressPin,
    onPressMap,
    onViewportChange,
    hike,
    onStopFollowing,
}: TrailyMapProps) {
    const insets = useSafeAreaInsets();
    const containerRef = useRef<HTMLDivElement>(null);
    const mapRef = useRef<MapLibreMap | null>(null);
    const mode = useMapMode();
    const [styleError, setStyleError] = useState<Error | null>(null);
    const [styleLoaded, setStyleLoaded] = useState(false);
    // Latest trails and hike, for the style built on a mode switch.
    const trailsDataRef = useRef<TrailFeatureCollection>(
        toTrailsGeoJSON([], undefined),
    );
    const hikeDataRef = useRef<HikeFeatureCollection>(
        toHikeGeoJSON(undefined, undefined),
    );

    // Fits the trail between the controls. False for a trail not on the map.
    // The padding replaces the one left by following a hike.
    const frameTrail = useEffectEvent((trailId: string): boolean => {
        const trail = trails.find((candidate) => candidate.id === trailId);
        if (!trail) return false;
        mapRef.current?.fitBounds(getBounds(trail.route), {
            padding: getTrailFocusPadding(insets, bottomOffset),
            absolutePadding: true,
            duration: TRAIL_FOCUS_DURATION,
        });
        return true;
    });
    // Frames the trail, then reports the press. During a hike, the camera
    // belongs to the hike.
    const handlePressTrail = useEffectEvent((trailId: string) => {
        if (!hike && frameTrail(trailId)) onPressTrail?.(trailId);
    });
    const handlePressMap = useEffectEvent(() => onPressMap?.());
    const handleViewportChange = useEffectEvent((viewport: Viewport) => {
        onViewportChange?.(viewport);
    });

    const hikeCamera = useHikeCamera({
        hike,
        bottomOffset,
        onStopFollowing,
        controls: {
            // maplibre-gl eases by default, but only when `easing` is left
            // out: set to undefined, it is called anyway and throws.
            follow: ({ easing, ...stop }) =>
                mapRef.current?.easeTo(
                    easing === "linear"
                        ? { ...stop, easing: (t: number) => t }
                        : stop,
                ),
            frame: (route, padding, duration) =>
                mapRef.current?.fitBounds(getBounds(route), {
                    padding,
                    absolutePadding: true,
                    bearing: 0,
                    pitch: 0,
                    duration,
                }),
        },
    });
    // Only a move made by hand carries the browser event behind it.
    const handleMoveStart = useEffectEvent((byHand: boolean) => {
        hikeCamera.handleMoveStart(byHand);
    });
    const handleMoveEnd = useEffectEvent((zoom: number, byHand: boolean) => {
        hikeCamera.handleMoveEnd(zoom, byHand);
    });

    useEffect(() => {
        setupMapLibreForWeb();

        if (!containerRef.current) return;

        const map = new Map({
            container: containerRef.current,
            // Empty placeholder until the MapTiler style arrives (see the
            // mode effect below).
            style: { version: 8, sources: {}, layers: [] },
            center: INITIAL_VIEW.center,
            zoom: INITIAL_VIEW.zoom,
            minZoom: MAP_MIN_ZOOM,
            // Keeps more already-fetched tiles around in memory, so
            // panning/zooming back to a spot you've already visited redraws
            // instantly instead of re-fetching.
            maxTileCacheZoomLevels: 8,
            // No built-in nav (zoom +/- + compass) — this app renders its
            // own map chrome (MapControls). The default attribution control
            // is replaced by MapLegalNotices when those are enabled. Without
            // them, the web build (development only, never shipped) shows
            // no attribution: MapLibre's compact one opens expanded over the
            // corner buttons.
            attributionControl: false,
        });
        mapRef.current = map;

        // Once at load, then each time the map comes to rest.
        map.on("load", () => handleViewportChange(getViewport(map)));
        map.on("moveend", (event) => {
            handleMoveEnd(map.getZoom(), event.originalEvent !== undefined);
            handleViewportChange(getViewport(map));
        });
        map.on("movestart", (event) =>
            handleMoveStart(event.originalEvent !== undefined),
        );

        map.on("click", (event) => {
            // A pin handles its own touch.
            const target = event.originalEvent.target;
            if (
                target instanceof Element &&
                target.closest(".maplibregl-marker")
            ) {
                return;
            }
            const trailId = getTrailAt(map, event.point, CLICK_HIT_RADIUS);
            if (trailId) handlePressTrail(trailId);
            else handlePressMap();
        });
        // Right click, or a long touch in a mobile browser.
        map.on("contextmenu", (event) => {
            const trailId = getTrailAt(map, event.point, TRAIL_HIT_RADIUS);
            if (!trailId) return;
            event.originalEvent.preventDefault();
            handlePressTrail(trailId);
        });
        // Listeners by layer id survive the style switches.
        map.on("mouseenter", TRAIL_TOUCH_LAYER_IDS, () => {
            map.getCanvas().style.cursor = "pointer";
        });
        map.on("mouseleave", TRAIL_TOUCH_LAYER_IDS, () => {
            map.getCanvas().style.cursor = "";
        });
        // A full style reload may have missed a data update made meanwhile.
        map.on("style.load", () => {
            map.getSource<GeoJSONSource>(TRAILS_SOURCE_ID)?.setData(
                trailsDataRef.current as GeoJSON.FeatureCollection,
            );
            map.getSource<GeoJSONSource>(HIKE_SOURCE_ID)?.setData(
                hikeDataRef.current as GeoJSON.FeatureCollection,
            );
        });

        return () => {
            mapRef.current = null;
            map.remove();
        };
    }, []);

    useEffect(() => {
        // Ignore a slower, older fetch resolving after a newer mode switch.
        let cancelled = false;
        getMapStyle(mode).then(
            (style) => {
                if (cancelled) return;
                setStyleError(null);
                setStyleLoaded(true);
                // The trails and the hike are part of the style, so they come
                // back with each mode, in that mode's colors.
                mapRef.current?.setStyle({
                    ...style,
                    sources: {
                        ...style.sources,
                        [TRAILS_SOURCE_ID]: {
                            type: "geojson",
                            data: trailsDataRef.current,
                        } as GeoJSONSourceSpecification,
                        [HIKE_SOURCE_ID]: {
                            type: "geojson",
                            data: hikeDataRef.current,
                        } as GeoJSONSourceSpecification,
                    },
                    layers: [
                        ...style.layers,
                        ...(getTrailLayers(mode) as LayerSpecification[]),
                        ...(getHikeLayers() as LayerSpecification[]),
                    ],
                } as StyleSpecification);
            },
            (error: Error) => {
                if (!cancelled) setStyleError(error);
            },
        );
        return () => {
            cancelled = true;
        };
    }, [mode]);

    const trailsData = toTrailsGeoJSON(
        trails,
        highlightedTrailId,
        focusedTrailId,
    );
    useEffect(() => {
        trailsDataRef.current = trailsData;
        mapRef.current
            ?.getSource<GeoJSONSource>(TRAILS_SOURCE_ID)
            ?.setData(trailsData as GeoJSON.FeatureCollection);
    }, [trailsData]);

    const hikeData = toHikeGeoJSON(hike?.walkedRoute, hike?.track);
    useEffect(() => {
        hikeDataRef.current = hikeData;
        mapRef.current
            ?.getSource<GeoJSONSource>(HIKE_SOURCE_ID)
            ?.setData(hikeData as GeoJSON.FeatureCollection);
    }, [hikeData]);

    useEffect(() => {
        if (framedTrailId) frameTrail(framedTrailId);
    }, [framedTrailId]);

    const { min: minZoom, max: maxZoom } = hikeCamera.zoomRange;
    useEffect(() => {
        mapRef.current?.setMinZoom(minZoom).setMaxZoom(maxZoom);
    }, [minZoom, maxZoom]);

    // The walker, turned and laid flat by maplibre-gl with the map: the
    // arrow inside points north.
    const hikeActive = hike !== undefined;
    const [walkerElement, setWalkerElement] = useState<HTMLElement | null>(
        null,
    );
    const walkerMarkerRef = useRef<Marker | null>(null);
    useEffect(() => {
        const map = mapRef.current;
        if (!map || !hikeActive) return;
        const element = document.createElement("div");
        const marker = new Marker({
            element,
            rotationAlignment: "map",
            pitchAlignment: "map",
        });
        walkerMarkerRef.current = marker;
        setWalkerElement(element);
        return () => {
            marker.remove();
            walkerMarkerRef.current = null;
            setWalkerElement(null);
        };
    }, [hikeActive]);
    const walkerLngLat = hike?.position.lngLat;
    const walkerHeading = hike?.position.heading ?? 0;
    useEffect(() => {
        const marker = walkerMarkerRef.current;
        const map = mapRef.current;
        if (!marker || !map || !walkerLngLat) return;
        marker.setLngLat(walkerLngLat).setRotation(walkerHeading);
        // Added once it has a position: maplibre-gl needs one to draw it.
        if (!marker.getElement().isConnected) marker.addTo(map);
    }, [walkerLngLat, walkerHeading, walkerElement]);

    // Surface a missing/invalid MapTiler key to the error boundary instead of
    // leaving a blank map, but only before any style has loaded — a failed
    // mode switch just keeps the current style.
    if (styleError && !styleLoaded) throw styleError;

    // As on the trail sheet's map: photo pins along the focused trail, its
    // end above them (later markers are drawn on top).
    const focusedTrail = trails.find((trail) => trail.id === focusedTrailId);
    const endPoint = focusedTrail?.route[focusedTrail.route.length - 1];
    const [slots, setSlots] = useState<MarkerSlot[]>([]);
    useEffect(() => {
        const map = mapRef.current;
        if (!map) return;
        const items = [
            ...pins.map((pin) => ({
                key: pin.id,
                lngLat: pin.lngLat,
                anchor: "bottom" as const,
                marker: pin,
            })),
            ...(endPoint
                ? [
                      {
                          key: "end",
                          lngLat: endPoint,
                          anchor: "center" as const,
                          marker: "end" as const,
                      },
                  ]
                : []),
        ];
        const created = items.map((item) => {
            const element = document.createElement("div");
            const marker = new Marker({ element, anchor: item.anchor })
                .setLngLat(item.lngLat)
                .addTo(map);
            return {
                key: item.key,
                element,
                marker: item.marker,
                instance: marker,
            };
        });
        // The marker elements only exist once maplibre-gl has created them.
        // Nothing to show twice in a row: keep the state as is.
        setSlots((current) =>
            current.length === 0 && created.length === 0 ? current : created,
        );
        return () => {
            created.forEach(({ instance }) => instance.remove());
            setSlots((current) => (current.length === 0 ? current : []));
        };
    }, [pins, endPoint]);

    return (
        <div style={{ position: "relative", display: "flex", flex: 1 }}>
            <div ref={containerRef} style={{ display: "flex", flex: 1 }} />
            {slots.map(({ key, element, marker }) =>
                createPortal(
                    marker === "end" ? (
                        <RouteEndMarker color={focusedTrail?.color} />
                    ) : (
                        <PhotoPinMarker
                            photoUrl={marker.photoUrl}
                            label={marker.label}
                            onPress={
                                onPressPin
                                    ? () => onPressPin(marker.id)
                                    : undefined
                            }
                        />
                    ),
                    element,
                    key,
                ),
            )}
            {walkerElement &&
                createPortal(<HikePositionMarker heading={0} />, walkerElement)}
            {SHOW_MAPTILER_LEGAL_NOTICES && (
                <MapLegalNotices bottomOffset={bottomOffset} />
            )}
        </div>
    );
}
