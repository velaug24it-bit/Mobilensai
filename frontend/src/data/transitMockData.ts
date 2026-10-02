import { TransitRoute, TransitStop, TransitVehicle, StopArrival } from '../services/api';

export const INITIAL_STOPS: TransitStop[] = [
  {
    stop_id: 'STOP-TCR-01',
    stop_name: 'Thoothukudi Airport (TCR) Terminal',
    lat: 8.7242,
    lng: 78.0264,
    zone_id: 'ZONE-TCR-01',
    routes_served: ['15', '7B'],
    is_accessible: true,
    shelter_type: 'Air-Conditioned Airport Canopy'
  },
  {
    stop_id: 'STOP-VAG-02',
    stop_name: 'Vagaikulam Feeder Stop (NH 138)',
    lat: 8.7258,
    lng: 77.9850,
    zone_id: 'ZONE-17',
    routes_served: ['15', '7B', '33'],
    is_accessible: false,
    shelter_type: 'Uncovered Highway Post'
  },
  {
    stop_id: 'STOP-VAL-03',
    stop_name: 'Vallanadu Highway Junction',
    lat: 8.7275,
    lng: 77.8820,
    zone_id: 'ZONE-VAL-02',
    routes_served: ['15', '33'],
    is_accessible: true,
    shelter_type: 'Covered Rural Shelter'
  },
  {
    stop_id: 'STOP-THM-04',
    stop_name: 'Thamirabarani River Bridge',
    lat: 8.7290,
    lng: 77.7850,
    zone_id: 'ZONE-TN-03',
    routes_served: ['15', '21'],
    is_accessible: true,
    shelter_type: 'Standard Shelter'
  },
  {
    stop_id: 'STOP-VAN-05',
    stop_name: 'Vannarpettai Bypass (FXEC Campus Gate)',
    lat: 8.7300,
    lng: 77.7126,
    zone_id: 'ZONE-TN-01',
    routes_served: ['15', '7B', '21'],
    is_accessible: true,
    shelter_type: 'Student Ramp Shelter'
  },
  {
    stop_id: 'STOP-NBS-06',
    stop_name: 'Tirunelveli New Bus Stand',
    lat: 8.7050,
    lng: 77.7280,
    zone_id: 'ZONE-TN-04',
    routes_served: ['15', '21', '33'],
    is_accessible: true,
    shelter_type: 'Central Bus Terminal'
  },
  {
    stop_id: 'STOP-GND-01',
    stop_name: 'Gandhipuram Central Terminal',
    lat: 11.0168,
    lng: 76.9680,
    zone_id: 'ZONE-U-01',
    routes_served: ['12A', '21'],
    is_accessible: true,
    shelter_type: 'Metro Terminal'
  },
  {
    stop_id: 'STOP-RSP-03',
    stop_name: 'RS Puram West',
    lat: 11.0080,
    lng: 76.9510,
    zone_id: 'ZONE-U-02',
    routes_served: ['12A'],
    is_accessible: true,
    shelter_type: 'Step-Free Bus Bay'
  },
  {
    stop_id: 'STOP-RLY-05',
    stop_name: 'Railway Station Junction Interchange',
    lat: 8.7289,
    lng: 77.7180,
    zone_id: 'ZONE-TN-02',
    routes_served: ['15', '12A', '21'],
    is_accessible: true,
    shelter_type: 'Intermodal Skywalk'
  }
];

export const INITIAL_ROUTES: TransitRoute[] = [
  {
    route_id: 'ROUTE-15',
    short_name: '15',
    long_name: 'TCR Airport ➔ FXEC Engineering Corridor',
    route_type: 'bus',
    color: '#06b6d4',
    frequency_min: 15,
    stops: INITIAL_STOPS.slice(0, 6),
    waypoints: [
      [8.7242, 78.0264],
      [8.7258, 77.9850],
      [8.7275, 77.8820],
      [8.7290, 77.7850],
      [8.7300, 77.7126],
      [8.7050, 77.7280]
    ]
  },
  {
    route_id: 'ROUTE-12A',
    short_name: '12A',
    long_name: 'Gandhipuram ➔ RS Puram ➔ Junction Express',
    route_type: 'bus',
    color: '#10b981',
    frequency_min: 10,
    stops: [INITIAL_STOPS[6], INITIAL_STOPS[7], INITIAL_STOPS[8]],
    waypoints: [
      [11.0168, 76.9680],
      [11.0120, 76.9620],
      [11.0080, 76.9510],
      [10.9980, 76.9600],
      [10.9850, 76.9620]
    ]
  },
  {
    route_id: 'ROUTE-7B',
    short_name: '7B',
    long_name: 'Vagaikulam ➔ Vallanadu Feeder Shuttle',
    route_type: 'feeder',
    color: '#f59e0b',
    frequency_min: 8,
    stops: [INITIAL_STOPS[1], INITIAL_STOPS[2]],
    waypoints: [
      [8.7258, 77.9850],
      [8.7265, 77.9300],
      [8.7275, 77.8820]
    ]
  }
];

export const INITIAL_VEHICLES: TransitVehicle[] = [
  {
    vehicle_id: 'BUS-15-01',
    route_id: 'ROUTE-15',
    route_short_name: '15',
    route_color: '#06b6d4',
    headsign: 'Francis Xavier Engg College',
    lat: 8.7251,
    lng: 78.0050,
    speed_kmh: 42,
    bearing_deg: 265,
    next_stop_id: 'STOP-VAG-02',
    next_stop_name: 'Vagaikulam Feeder Stop',
    stops_remaining: 1,
    eta_next_stop_min: 4,
    distance_from_user_km: 1.8,
    delay_minutes: 0,
    status: 'On Time',
    crowding_level: 'Moderate',
    is_accessible: true,
    last_updated: 'Just now'
  },
  {
    vehicle_id: 'BUS-15-02',
    route_id: 'ROUTE-15',
    route_short_name: '15',
    route_color: '#06b6d4',
    headsign: 'Tirunelveli Junction',
    lat: 8.7282,
    lng: 77.8300,
    speed_kmh: 48,
    bearing_deg: 268,
    next_stop_id: 'STOP-THM-04',
    next_stop_name: 'Thamirabarani River Bridge',
    stops_remaining: 2,
    eta_next_stop_min: 9,
    distance_from_user_km: 8.4,
    delay_minutes: 0,
    status: 'On Time',
    crowding_level: 'Low',
    is_accessible: true,
    last_updated: 'Just now'
  },
  {
    vehicle_id: 'BUS-12A-01',
    route_id: 'ROUTE-12A',
    route_short_name: '12A',
    route_color: '#10b981',
    headsign: 'Gandhipuram Terminal',
    lat: 11.0100,
    lng: 76.9560,
    speed_kmh: 34,
    bearing_deg: 45,
    next_stop_id: 'STOP-GND-01',
    next_stop_name: 'Gandhipuram Central Terminal',
    stops_remaining: 2,
    eta_next_stop_min: 6,
    distance_from_user_km: 1.9,
    delay_minutes: 0,
    status: 'On Time',
    crowding_level: 'Low',
    is_accessible: true,
    last_updated: 'Just now'
  },
  {
    vehicle_id: 'FEEDER-7B-01',
    route_id: 'ROUTE-7B',
    route_short_name: '7B',
    route_color: '#f59e0b',
    headsign: 'Vallanadu Feeder',
    lat: 8.7262,
    lng: 77.9550,
    speed_kmh: 30,
    bearing_deg: 260,
    next_stop_id: 'STOP-VAL-03',
    next_stop_name: 'Vallanadu Highway Junction',
    stops_remaining: 1,
    eta_next_stop_min: 8,
    distance_from_user_km: 4.1,
    delay_minutes: 0,
    status: 'On Time',
    crowding_level: 'Low',
    is_accessible: true,
    last_updated: 'Just now'
  }
];

export const INITIAL_ARRIVALS: StopArrival[] = [
  {
    route_id: 'ROUTE-15',
    route_short_name: '15',
    vehicle_id: 'BUS-15-01',
    headsign: 'Francis Xavier Engg College',
    eta_minutes: 4,
    scheduled_time: '08:20 AM',
    delay_minutes: 0,
    distance_km: 1.8,
    crowding: 'Moderate',
    is_accessible: true,
    status: 'Approaching'
  },
  {
    route_id: 'ROUTE-7B',
    route_short_name: '7B',
    vehicle_id: 'FEEDER-7B-01',
    headsign: 'Vallanadu Feeder',
    eta_minutes: 8,
    scheduled_time: '08:24 AM',
    delay_minutes: 0,
    distance_km: 4.1,
    crowding: 'Low',
    is_accessible: true,
    status: 'En Route'
  },
  {
    route_id: 'ROUTE-15',
    route_short_name: '15',
    vehicle_id: 'BUS-15-02',
    headsign: 'Tirunelveli Junction',
    eta_minutes: 16,
    scheduled_time: '08:32 AM',
    delay_minutes: 0,
    distance_km: 8.4,
    crowding: 'Low',
    is_accessible: true,
    status: 'Scheduled'
  }
];
