import networkx as nx

def calculate_routes(graph, origin, destination):
    try:
        paths = nx.shortest_simple_paths(graph, origin, destination, weight='weight')
        route_list = []
        for path in paths:
            route = {
                'path': path,
                'total_time': sum(graph[path[i]][path[i+1]]['weight'] for i in range(len(path) - 1))
            }
            route_list.append(route)
            if len(route_list) >= 5:
                break
        return route_list
    except nx.NetworkXNoPath:
        return []
