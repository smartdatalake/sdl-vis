import os

import matplotlib.pyplot as plt
import networkx as nx
import numpy as np
import scipy.cluster
import scipy.spatial
from tools import fancy_dendrogram, scipy_tree_to_dict


def cluster_graph_hierarchical(graph, max_depth=4, plot_path=None):
    # Since connected graph_copys are handled seperately from now on, relabel nodes 0,1,...
    # Same numbering is used as indices of the similarity matrix
    nx.relabel_nodes(graph, dict(zip(graph.nodes(), range(len(graph)))), copy=False)

    if len(graph) > 1:
        distance_matrix = __compute_distance_matrix(graph)

        # Convert a vector-form distance vector to a square-form distance matrix, and vice-versa.
        condensed_distance_matrix = scipy.spatial.distance.squareform(distance_matrix)
        z = scipy.cluster.hierarchy.linkage(condensed_distance_matrix, method='ward')

        # Create dendrogram for each graph
        plt.figure()
        fancy_dendrogram(z, annotate_above=10)
        if plot_path:
            if os.path.isdir(plot_path):
                plt.savefig(os.path.join(plot_path, "graph_plot.eps"))
            elif os.path.isfile(plot_path):
                plt.savefig(plot_path)

        h_tree = scipy_tree_to_dict(scipy.cluster.hierarchy.to_tree(z), graph.edges(), max_depth)
    else:
        # If graph contains only 1 node, build dummy tree
        root_node = scipy.cluster.hierarchy.ClusterNode(0)

        h_tree = scipy_tree_to_dict(root_node, graph.edges(), max_depth)

    return {"hierarchical": h_tree, "nodelink": nx.node_link_data(graph)}


def __compute_distance_matrix(graph):
    shortest_path_length_dict = dict(nx.all_pairs_shortest_path_length(graph))

    distance_matrix = np.zeros(shape=(len(graph), len(graph)))

    for idx1, n1 in enumerate(graph.nodes()):
        for idx2, n2 in enumerate(graph.nodes()):
            try:
                distance_matrix[idx1][idx2] = shortest_path_length_dict[n1][n2]
            except KeyError:
                pass

    return distance_matrix
