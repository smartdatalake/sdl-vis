###############################################################################################
# Sources:                                                                                    #
# https://joernhees.de/blog/2015/08/26/scipy-hierarchical-clustering-and-dendrogram-tutorial/ #
###############################################################################################

import matplotlib.pyplot as plt
import numpy as np
from scipy.cluster.hierarchy import dendrogram


def fancy_dendrogram(*args, **kwargs):
    max_d = kwargs.pop('max_d', None)
    if max_d and 'color_threshold' not in kwargs:
        kwargs['color_threshold'] = max_d
    annotate_above = kwargs.pop('annotate_above', 0)

    ddata = dendrogram(*args, **kwargs)

    if not kwargs.get('no_plot', False):
        plt.title('Hierarchical Clustering Dendrogram (truncated)')
        plt.xlabel('sample index or (cluster size)')
        plt.ylabel('distance')
        for i, d, c in zip(ddata['icoord'], ddata['dcoord'], ddata['color_list']):
            x = 0.5 * sum(i[1:3])
            y = d[1]
            if y > annotate_above:
                plt.plot(x, y, 'o', c=c)
                plt.annotate("%.3g" % y, (x, y), xytext=(0, -5),
                             textcoords='offset points',
                             va='top', ha='center')
        if max_d:
            plt.axhline(y=max_d, c='k')
    return ddata


def scipy_tree_to_dict(root_node, graph_edges, max_depth):
    if root_node:
        if max_depth is not None and max_depth <= 0:
            children = __scipy_tree_gather_all_leaf_children(root_node)

            return {"id": root_node.id,
                    "dist": root_node.dist,
                    "count": root_node.count,
                    "children": children,
                    "linkage": __get_linkage_matrix(children, graph_edges)}

        else:
            if root_node.is_leaf():
                return {"id": root_node.id,
                        "dist": root_node.dist,
                        "count": root_node.count}

            else:
                next_depth = max_depth - 1 if max_depth is not None else None

                left_child = scipy_tree_to_dict(root_node.left, graph_edges, next_depth)
                right_child = scipy_tree_to_dict(root_node.right, graph_edges, next_depth)

                children = []
                children += [left_child] if left_child is not None else []
                children += [right_child] if right_child is not None else []

                return {"id": root_node.id,
                        "dist": root_node.dist,
                        "count": root_node.count,
                        "children": children,
                        "linkage": __get_linkage_matrix(children, graph_edges)}
    else:
        return None


# Traverse descendants of root_node and merge all of them in one list on the same level
# NOTE THAT THIS EXCLUDES THE root_node ITSELF!
def __scipy_tree_gather_all_leaf_children(root_node):
    acc = []

    if root_node:
        # Traverse left child
        if root_node.left and root_node.left.is_leaf():
            acc.append({"id": root_node.left.id,
                        "dist": root_node.left.dist,
                        "count": root_node.left.count})
        else:
            acc += __scipy_tree_gather_all_leaf_children(root_node.left)

        # Traverse right child
        if root_node.right and root_node.right.is_leaf():
            acc.append({"id": root_node.right.id,
                        "dist": root_node.right.dist,
                        "count": root_node.right.count})
        else:
            acc += __scipy_tree_gather_all_leaf_children(root_node.right)

    return acc


def __dict_tree_gather_all_leaf_children(root_node):
    acc = []

    if "children" in root_node:
        for c in root_node["children"]:
            acc += __dict_tree_gather_all_leaf_children(c)
    else:
        acc.append(root_node)

    return acc


def __get_linkage_matrix(nodes, graph_edges):
    linkage_matrix = np.zeros(shape=(len(nodes), len(nodes)))

    for id1, n1 in enumerate(nodes):
        for id2, n2 in enumerate(nodes):
            if id1 != id2:
                linkage_matrix[id1][id2] = __get_linkage(n1, n2, graph_edges)

    return linkage_matrix.tolist()


def __get_linkage(n1, n2, graph_edges):
    n1_leafs = __dict_tree_gather_all_leaf_children(n1)
    n2_leafs = __dict_tree_gather_all_leaf_children(n2)

    count = 0

    # Check, how many connections are between the leaf groups
    for l1 in n1_leafs:
        for l2 in n2_leafs:
            if (l1["id"], l2["id"]) in graph_edges or (l2["id"], l1["id"]) in graph_edges:
                count = count + 1

    return count
