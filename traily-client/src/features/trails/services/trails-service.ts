import type {
    LngLat,
    Trail,
    TrailCreator,
    TrailDetails,
    TrailPhoto,
} from "../types";
import { pointAlongRoute, routeFromSketch } from "./route-geometry";

// TODO(api): mock data until the trails endpoints exist (TRA-83). Real
// places around Annecy, where the map opens; the figures, routes and
// creators are made up.

/** Photo from Wikimedia Commons, credited as its license requires. */
function commonsPhoto(file: string, credit: string): TrailPhoto {
    return {
        url: `https://commons.wikimedia.org/wiki/Special:FilePath/${encodeURIComponent(file)}?width=640`,
        credit,
    };
}

const VELLUT = "Guilhem Vellut, CC BY 2.0";
const PEPELLIN = "Florian Pépellin, CC BY-SA";

const CAMILLE: TrailCreator = { id: "camille-rey", name: "Camille Rey" };
const HUGO: TrailCreator = { id: "hugo-martin", name: "Hugo Martin" };
const LEA: TrailCreator = { id: "lea-fontaine", name: "Léa Fontaine" };

interface MockPointOfInterest {
    id: string;
    title: string;
    description: string;
    photo: TrailPhoto;
    /** Where it sits along the route, 0 = start, 1 = end. */
    at: number;
}

interface MockTrail extends Trail {
    /** First point of the route; the rest is drawn from the sketch. */
    start: LngLat;
    description: string;
    creator: TrailCreator;
    pointsOfInterest: MockPointOfInterest[];
}

const TRAILS: MockTrail[] = [
    {
        id: "semnoz",
        name: "Tour du Semnoz par le Crêt de Châtillon",
        location: "Semnoz",
        distanceKm: 11.2,
        elevationGainM: 620,
        durationMin: 240,
        difficulty: "medium",
        sketch: [
            [0.1, 0.85],
            [0.25, 0.7],
            [0.2, 0.45],
            [0.4, 0.3],
            [0.55, 0.4],
            [0.75, 0.2],
            [0.9, 0.1],
        ],
        cover: commonsPhoto(
            "Crêt de Chatillon @ Semnoz (35510695155).jpg",
            VELLUT,
        ),
        start: [6.03, 45.75],
        description:
            "Une longue montée en forêt puis les alpages du plateau, jusqu'au point culminant du Semnoz. Par temps clair, la vue porte du lac d'Annecy au Mont-Blanc.",
        creator: CAMILLE,
        pointsOfInterest: [
            {
                id: "semnoz-sainte-catherine",
                title: "Belvédère de Sainte-Catherine",
                description:
                    "Premier balcon sur le bassin annécien, à la sortie de la forêt.",
                photo: commonsPhoto(
                    "Belvédère de Sainte-Catherine @ Semnoz (50040383377).jpg",
                    VELLUT,
                ),
                at: 0.25,
            },
            {
                id: "semnoz-cret-des-bruyeres",
                title: "Crêt des Bruyères",
                description:
                    "Vue dégagée sur les Bauges. Gentianes jaunes en été.",
                photo: commonsPhoto(
                    "Belvédère du Crêt des Bruyères @ Semnoz (50937823708).jpg",
                    VELLUT,
                ),
                at: 0.55,
            },
            {
                id: "semnoz-chatillon",
                title: "Crêt de Châtillon",
                description:
                    "Sommet du Semnoz à 1 699 m, table d'orientation et panorama à 360°.",
                photo: commonsPhoto(
                    "Crêt de Châtillon @ Plateau du Semnoz (50933000081).jpg",
                    VELLUT,
                ),
                at: 0.95,
            },
        ],
    },
    {
        id: "mont-veyrier",
        name: "Mont Veyrier par le col des Contrebandiers",
        location: "Veyrier-du-Lac",
        distanceKm: 8.4,
        elevationGainM: 860,
        durationMin: 270,
        difficulty: "hard",
        sketch: [
            [0.15, 0.9],
            [0.3, 0.75],
            [0.25, 0.6],
            [0.45, 0.5],
            [0.4, 0.35],
            [0.6, 0.25],
            [0.85, 0.15],
        ],
        cover: commonsPhoto(
            "Hike to Mont Veyrier & Mont Baron (35924335873).jpg",
            VELLUT,
        ),
        start: [6.16, 45.88],
        description:
            "Montée raide et rocheuse par le col des Contrebandiers, puis une crête aérienne au-dessus du lac. Quelques passages demandent les mains.",
        creator: HUGO,
        pointsOfInterest: [
            {
                id: "veyrier-falaises",
                title: "Falaises du Mont Baron",
                description:
                    "Parois calcaires où nichent faucons pèlerins et martinets à ventre blanc.",
                photo: commonsPhoto(
                    "Falaises @ Mont Baron & Mont Veyrier (51341191473).jpg",
                    VELLUT,
                ),
                at: 0.35,
            },
            {
                id: "veyrier-talabar",
                title: "Prairie du Talabar",
                description:
                    "Clairière sommitale, idéale pour une pause face au lac.",
                photo: commonsPhoto(
                    "Lac d'Annecy @ Talabar @ Mont Veyrier (51122826768).jpg",
                    VELLUT,
                ),
                at: 0.7,
            },
            {
                id: "veyrier-baron",
                title: "Plateforme du Mont Baron",
                description:
                    "Ancienne gare du téléphérique, vue plongeante sur Annecy.",
                photo: commonsPhoto(
                    "Annecy @ Plateforme de l'Ancien Téléphérique du Mont Baron (51000641806).jpg",
                    VELLUT,
                ),
                at: 0.95,
            },
        ],
    },
    {
        id: "roc-de-chere",
        name: "Réserve du Roc de Chère",
        location: "Talloires",
        distanceKm: 5.1,
        elevationGainM: 180,
        durationMin: 105,
        difficulty: "easy",
        sketch: [
            [0.2, 0.2],
            [0.45, 0.15],
            [0.75, 0.3],
            [0.8, 0.6],
            [0.55, 0.8],
            [0.3, 0.7],
            [0.25, 0.45],
        ],
        cover: commonsPhoto(
            "Lac d'Annecy at Talloires-Montmin.jpg",
            "Karlheinz Klingbeil, CC BY 4.0",
        ),
        start: [6.205, 45.835],
        description:
            "Boucle facile dans une réserve naturelle : forêt de pins, tourbières et falaises plongeant dans le lac. Restez sur les sentiers balisés.",
        creator: LEA,
        pointsOfInterest: [
            {
                id: "roc-belvedere",
                title: "Belvédère de Talloires",
                description:
                    "Vue sur le village, la baie de Talloires et les Dents de Lanfon.",
                photo: commonsPhoto(
                    "Village of Talloires @ Belvédère @ Roc de Chère @ Talloires (34836816143).jpg",
                    VELLUT,
                ),
                at: 0.4,
            },
        ],
    },
    {
        id: "cascade-angon",
        name: "Cascade d'Angon",
        location: "Talloires",
        distanceKm: 3.2,
        elevationGainM: 140,
        durationMin: 75,
        difficulty: "easy",
        sketch: [
            [0.1, 0.6],
            [0.3, 0.55],
            [0.45, 0.65],
            [0.6, 0.45],
            [0.8, 0.4],
            [0.9, 0.25],
        ],
        cover: commonsPhoto(
            "Cascade d'Angon @ Hike to Angon Waterfall & Ermitage de Saint-Germain (15152710487).jpg",
            VELLUT,
        ),
        start: [6.2, 45.822],
        description:
            "Un sentier en balcon taillé dans la falaise mène au pied d'une cascade de 40 m. Parfait en famille, frais même en été.",
        creator: CAMILLE,
        pointsOfInterest: [
            {
                id: "angon-balcon",
                title: "Sentier en balcon",
                description:
                    "Passage sous les surplombs, sécurisé par une main courante.",
                photo: commonsPhoto(
                    "Path to Cascade d'Angon @ Hike to Angon Waterfall & Ermitage de Saint-Germain (15152536889).jpg",
                    VELLUT,
                ),
                at: 0.5,
            },
            {
                id: "angon-cascade",
                title: "Pied de la cascade",
                description:
                    "Mousses et fougères sur la roche humide : cherchez la scolopendre.",
                photo: commonsPhoto(
                    "Cascade d'Angon @ Hike to Angon Waterfall & Ermitage de Saint-Germain (15338242852).jpg",
                    VELLUT,
                ),
                at: 0.95,
            },
        ],
    },
    {
        id: "dents-de-lanfon",
        name: "Dents de Lanfon",
        location: "Col de Bluffy",
        distanceKm: 7.6,
        elevationGainM: 720,
        durationMin: 225,
        difficulty: "hard",
        sketch: [
            [0.1, 0.8],
            [0.3, 0.8],
            [0.4, 0.6],
            [0.35, 0.4],
            [0.55, 0.35],
            [0.7, 0.15],
            [0.9, 0.2],
        ],
        cover: commonsPhoto(
            "Dents de Lanfon depuis Menthon en automne (novembre 2024).JPG",
            PEPELLIN,
        ),
        start: [6.225, 45.86],
        description:
            "Montée soutenue jusqu'au pied des Dents, puis l'alpage de Lanfonnet. Terrain caillouteux, chaussures de randonnée indispensables.",
        creator: HUGO,
        pointsOfInterest: [
            {
                id: "lanfon-lanfonnet",
                title: "Crête du Lanfonnet",
                description:
                    "Lapiaz et pelouses d'altitude, territoire des chamois.",
                photo: commonsPhoto("Lanfonnet (50950586716).jpg", VELLUT),
                at: 0.45,
            },
            {
                id: "lanfon-dents",
                title: "Pied des Dents",
                description:
                    "Vue rapprochée sur les aiguilles calcaires, tournées vers le lac.",
                photo: commonsPhoto(
                    "Dents de Lanfon @ Saint-Jorioz (53120904567).jpg",
                    VELLUT,
                ),
                at: 0.85,
            },
        ],
    },
    {
        id: "parmelan",
        name: "Le Parmelan par le chalet de l'Anglettaz",
        location: "Villaz",
        distanceKm: 9.8,
        elevationGainM: 680,
        durationMin: 255,
        difficulty: "medium",
        sketch: [
            [0.15, 0.85],
            [0.2, 0.6],
            [0.4, 0.55],
            [0.5, 0.35],
            [0.7, 0.3],
            [0.85, 0.12],
        ],
        cover: commonsPhoto(
            "Parmelan @ Nâves-Parmelan (51105459256).jpg",
            VELLUT,
        ),
        start: [6.22, 45.94],
        description:
            "Des alpages de l'Anglettaz au grand plateau calcaire du Parmelan, crevassé de lapiaz. Refuge gardé en été près du sommet.",
        creator: LEA,
        pointsOfInterest: [
            {
                id: "parmelan-montoir",
                title: "Le Grand Montoir",
                description:
                    "Passage équipé dans la falaise pour rejoindre le plateau.",
                photo: commonsPhoto(
                    "Grand Montoir @ Hike to Tête du Parmelan & Grotte de l'Enfer (15138471879).jpg",
                    VELLUT,
                ),
                at: 0.55,
            },
            {
                id: "parmelan-cable",
                title: "Ancien câble du refuge",
                description:
                    "Pylône du câble qui ravitaillait le refuge, au bord du vide.",
                photo: commonsPhoto(
                    "Hike to Tête du Parmelan & Grotte de l'Enfer (15305636886).jpg",
                    VELLUT,
                ),
                at: 0.85,
            },
        ],
    },
    {
        id: "lac-de-la-thuile",
        name: "Tour du lac de la Thuile",
        location: "Bauges",
        distanceKm: 4.3,
        elevationGainM: 60,
        durationMin: 80,
        difficulty: "easy",
        sketch: [
            [0.3, 0.2],
            [0.65, 0.2],
            [0.85, 0.45],
            [0.7, 0.75],
            [0.35, 0.8],
            [0.15, 0.55],
            [0.25, 0.3],
        ],
        cover: commonsPhoto(
            "Lac de la Thuile - Bauges (22114782435).jpg",
            "Ylliab Photo, CC BY 2.0",
        ),
        start: [6.055, 45.645],
        description:
            "Tour paisible d'un petit lac de montagne entouré de prairies. Hérons et libellules au bord de l'eau.",
        creator: CAMILLE,
        pointsOfInterest: [
            {
                id: "thuile-rive-nord",
                title: "Rive nord",
                description:
                    "Roselière fréquentée par les hérons cendrés au petit matin.",
                photo: commonsPhoto(
                    "Lac de la Thuile (nord-est).JPG",
                    PEPELLIN,
                ),
                at: 0.3,
            },
            {
                id: "thuile-prairies",
                title: "Prairies fleuries",
                description:
                    "Orchidées sauvages en mai et juin : observez sans cueillir.",
                photo: commonsPhoto(
                    "La Thuile, Le Lac (mai 2015).JPG",
                    PEPELLIN,
                ),
                at: 0.65,
            },
        ],
    },
];

/** Strips case and accents so "chere" matches "Chère". */
function normalize(text: string): string {
    return text.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
}

export function getRecommendedTrails(): Trail[] {
    return TRAILS;
}

/** Trails whose name or location contains the query. */
export function searchTrails(query: string): Trail[] {
    const needle = normalize(query.trim());
    return TRAILS.filter(
        (trail) =>
            normalize(trail.name).includes(needle) ||
            normalize(trail.location).includes(needle),
    );
}

// Built once per trail, so the screens get the same object (and the map the
// same route) on every render.
const detailsCache = new Map<string, TrailDetails>();

export function getTrailDetails(id: string): TrailDetails | undefined {
    const cached = detailsCache.get(id);
    if (cached) return cached;
    const trail = TRAILS.find((candidate) => candidate.id === id);
    if (!trail) return undefined;
    const { start, pointsOfInterest, ...rest } = trail;
    const route = routeFromSketch(trail.sketch, start, trail.distanceKm);
    const details: TrailDetails = {
        ...rest,
        route,
        pointsOfInterest: pointsOfInterest.map(({ at, ...point }) => ({
            ...point,
            lngLat: pointAlongRoute(route, at),
        })),
    };
    detailsCache.set(id, details);
    return details;
}
