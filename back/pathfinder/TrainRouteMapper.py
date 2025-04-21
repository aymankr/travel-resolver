import pandas as pd
import networkx as nx
from collections import defaultdict
import itertools
import datetime
import json
from pyxdameraulevenshtein import damerau_levenshtein_distance
from models import City

class TrainRouteMapper:
    def __init__(self, stops_file, stop_times_file):
        self.G = nx.DiGraph()
        self.stops = self._read_gtfs_file(stops_file)
        self.stop_times = self._read_gtfs_file(stop_times_file)
        self._process_stops()
        self._process_trips()
        self._create_graph()

    def _parse_time(self, time_str):
        hours, minutes, seconds = map(int, time_str.split(':'))
        return datetime.timedelta(hours=hours, minutes=minutes, seconds=seconds)

    def _read_gtfs_file(self, filename):
        df = pd.read_csv(filename, dtype=str)
        if 'arrival_time' in df.columns and 'departure_time' in df.columns:
            df['arrival_time'] = df['arrival_time'].apply(self._parse_time)
            df['departure_time'] = df['departure_time'].apply(self._parse_time)
        return df

    def _format_duration(self, minutes):
        if minutes >= 60:
            hours = int(minutes // 60)
            remaining_minutes = int(minutes % 60)
            return f"{hours}h {remaining_minutes:02d}min"
        else:
            return f"{int(minutes)}min"

    def _process_stops(self):
        self.stops = self.stops.to_dict('records')
        print(f"Loaded {len(self.stops)} stops")

    def _process_trips(self):
        self.trips = defaultdict(list)
        for _, row in self.stop_times.iterrows():
            self.trips[row['trip_id']].append({
                'stop_id': row['stop_id'],
                'stop_sequence': int(row['stop_sequence']),
                'arrival_time': row['arrival_time'],
                'departure_time': row['departure_time']
            })
        print(f"Loaded {len(self.trips)} trips")

    def _create_graph(self):
        for stop in self.stops:
            if 'stop_lat' in stop and 'stop_lon' in stop:
                try:
                    self.G.add_node(stop['stop_id'],
                                    lat=float(stop['stop_lat']),
                                    lon=float(stop['stop_lon']),
                                    name=stop.get('stop_name', 'Unknown'))
                except ValueError:
                    print(f"Warning: Invalid coordinates for stop {stop['stop_id']}")

        for trip_id, stops_in_trip in self.trips.items():
            sorted_stops = sorted(stops_in_trip, key=lambda x: x['stop_sequence'])
            for i in range(len(sorted_stops) - 1):
                start = sorted_stops[i]
                end = sorted_stops[i+1]
                duration = (end['arrival_time'] - start['departure_time']).total_seconds() / 60
                self.G.add_edge(start['stop_id'], end['stop_id'], 
                                weight=duration, 
                                trip_id=trip_id,
                                departure_time=start['departure_time'],
                                arrival_time=end['arrival_time'])

    def find_stations(self, name):
        return [stop['stop_id'] for stop in self.stops if stop.get('stop_name', '').lower().startswith(name.lower())]

    def get_path_info(self, path):
        total_duration = 0
        segments = []
        for i in range(len(path) - 1):
            edge_data = self.G.get_edge_data(path[i], path[i+1])
            if edge_data:
                if isinstance(edge_data, dict):
                    duration = edge_data['weight']
                    departure_time = edge_data['departure_time']
                    arrival_time = edge_data['arrival_time']
                    trip_id = edge_data['trip_id']
                elif isinstance(edge_data, list):
                    duration = edge_data[0]['weight']
                    departure_time = edge_data[0]['departure_time']
                    arrival_time = edge_data[0]['arrival_time']
                    trip_id = edge_data[0]['trip_id']
                else:
                    print(f"Unexpected edge data format: {edge_data}")
                    continue

                total_duration += duration
                segments.append({
                    'from': self.G.nodes[path[i]]['name'],
                    'to': self.G.nodes[path[i+1]]['name'],
                    'departure': departure_time,
                    'arrival': arrival_time,
                    'duration': duration,
                    'trip_id': trip_id
                })
        return total_duration, segments

    def format_path_info_in_json(self, start_name, end_name, path, segments, total_duration):
        route_info = {
            "from": start_name,
            "to": end_name,
            "total_duration_formatted": self._format_duration(total_duration),
            "total_duration": (total_duration),
            "segments": []
        }

        current_trip_id = None
        current_segment = None
        intermediate_stops = []

        for segment in segments:
            if current_trip_id != segment['trip_id']:
                if current_segment:
                    stops = [
                        {
                            "name": stop,
                            "id": self.get_stop_id(stop),
                            "lat": self.G.nodes[self.get_stop_id(stop)]['lat'],
                            "lon": self.G.nodes[self.get_stop_id(stop)]['lon']
                        } 
                        for stop in [current_segment['from']] + intermediate_stops + [current_segment['to']]
                    ]
                    route_info["segments"].append({
                        "stops": stops,
                        "departure": str(current_segment['departure']).split(', ')[-1],
                        "arrival": str(current_segment['arrival']).split(', ')[-1],
                        "duration": self._format_duration(current_segment['duration']),
                        "trip_id": current_segment['trip_id']
                    })

                current_trip_id = segment['trip_id']
                current_segment = segment.copy()
                intermediate_stops = []
            else:
                intermediate_stops.append(segment['from'])
                current_segment['to'] = segment['to']
                current_segment['arrival'] = segment['arrival']
                current_segment['duration'] += segment['duration']

        if current_segment:
            stops = [
                {
                    "name": stop,
                    "id": self.get_stop_id(stop),
                    "lat": self.G.nodes[self.get_stop_id(stop)]['lat'],
                    "lon": self.G.nodes[self.get_stop_id(stop)]['lon']
                } 
                for stop in [current_segment['from']] + intermediate_stops + [current_segment['to']]
            ]
            route_info["segments"].append({
                "stops": stops,
                "departure": str(current_segment['departure']).split(', ')[-1],
                "arrival": str(current_segment['arrival']).split(', ')[-1],
                "duration": self._format_duration(current_segment['duration']),
                "trip_id": current_segment['trip_id']
            })

        return route_info

    def get_stop_id(self, stop_name):
        for stop in self.stops:
            if stop['stop_name'] == stop_name:
                return stop['stop_id']
        return None

    def find_closest_city(self, input_city, threshold=7):
        """Find closest matching city in database."""
        input_city = input_city.lower()
        cities = City.query.all()
        
        closest_city = None
        min_distance = float('inf')
        
        for city in cities:
            distance = damerau_levenshtein_distance(input_city, city.name.lower())
            if distance < min_distance and distance <= threshold:
                min_distance = distance
                closest_city = city.name
                
        return closest_city

    def find_shorter_paths(self, start_name, end_name):
        start_stations = self.find_stations(start_name)
        end_stations = self.find_stations(end_name)
        
        if not start_stations:
            closest_city = self.find_closest_city(start_name)
            if closest_city:
                start_stations = self.find_stations(closest_city)
            if not start_stations:
                return json.dumps({"error": f"No stations found similar to '{start_name}'"})
                
        if not end_stations:
            closest_city = self.find_closest_city(end_name)
            if closest_city:
                end_stations = self.find_stations(closest_city)
            if not end_stations:
                return json.dumps({"error": f"No stations found similar to '{end_name}'"})

        trip_data = {
            "start_stations": list(set(self.G.nodes[s]['name'] for s in start_stations)),
            "end_stations": list(set(self.G.nodes[e]['name'] for e in end_stations)),
            "routes": []
        }

        for start_id, end_id in itertools.product(start_stations, end_stations):
            if start_id == end_id:
                continue
            try:
                path = nx.dijkstra_path(self.G, start_id, end_id, weight='weight')
            except nx.NetworkXNoPath:
                continue
                
            total_duration, segments = self.get_path_info(path)
            route_info = self.format_path_info_in_json(
                self.G.nodes[start_id]['name'],
                self.G.nodes[end_id]['name'],
                path,
                segments,
                total_duration
            )
            trip_data["routes"].append(route_info)
            
        return json.dumps(trip_data, ensure_ascii=False, indent=2)