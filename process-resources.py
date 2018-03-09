import json

##################
# Resource types
BOOKMARK="bookmark"
PAPER="paper"
#################

# A Firefox-exported bookmarks.json file
BOOKMARKS="bookmarks-2018-03-09.json"

TAGS_TO_IGNORE = ["Mobile", "bh_h"]

# extra 'child <- parent' relations to add
ONTOLOGY = {
        "object_recognition": "recognition",
        "speech_recognition": "recognition",
        "action_recognition": "recognition",
        "face_recognition": "recognition",
        "_3d_reconstruction": "reconstruction",
        "eevee": "blender",
        "blender":"software",
        "kaldi":"software",
        "vulkan":"_3d_api",
        "opengl":"_3d_api",
        "_3d_api":"_3d",
        "recognition": "machine_learning",
        "javascript": "programming_language",
        "python": "programming_language",
        "cpp": "programming_language",
        "rust": "programming_language",
        "haskell": "programming_language",
        "latex": "programming_language",
        "cmake": "programming_language",
        "deep_learning": "machine_learning",
        "cnns": "deep_learning",
        "anns": "machine_learning",
        "machine_learning": "ai",
            }

TAGS_MAPPINGS = {"graph": "graph_",
                 "lecture": "teaching",
                 "ia": "ai",
                 "convolutional_networks": "cnns",
                 "neural_network": "anns",
                 "asr": "speech_recognition",
                 "machine_lerning": "machine_learning",
                 "deep_neural_network": "deep_learning",
                 "3d_tracking": "_3d_tracking",
                 "3d_modelling": "_3d_modelling",
                 "3d_recognition": "object_recognition",
                 "3d_reconstruction": "_3d_reconstruction",
                 "3d_building": "_3d_building",
                 "3d_printing": "_3d_printing",
                 "3d_printer": "_3d_printing",
                 "c++": "cpp",
                 "2d": "_2d",
                 "3d": "_3d"}
resources = {}


def clean(tag):
    cleantag = tag.strip().replace(" ","_").replace("-","_").replace('"','\\"')
    if cleantag in TAGS_MAPPINGS:
        return TAGS_MAPPINGS[cleantag]
    return cleantag

def shorten(label):
    return label if len(label) < 15 else label[:12] + "..."

with open(BOOKMARKS, 'r') as bookmarks_file:
    ff_bookmarks = json.load(bookmarks_file)["children"]
    
    for children in ff_bookmarks:

        if "children" in children:
            for res in children["children"]:
                if "tags" in res:
                    tags = res["tags"].replace(";",",")
                    for tag in tags.split(","):
                        tag = clean(tag)
                        if tag not in TAGS_TO_IGNORE:
                            label = res["title"].replace('"','\\"')
                            resources.setdefault(tag, []).append({"id":res["id"], 
                                                                  "type":BOOKMARK, 
                                                                  "label":label, 
                                                                  "uri": res["uri"], 
                                                                  "modified": res["lastModified"]})

with open("resources_by_tags.json", 'w') as outfile:
        json.dump(resources, outfile)

def generate_dot_file(resources_list):

    id_already_present = []

    print("digraph bookmarks {")
    for tag, resources in resources_list.items():
        if tag not in id_already_present:
            print("%s [shape=ellipse label=\"%s\" style=filled fillcolor=\"0.3 0.8 0.8\" fontname=\"bold\"];" % (tag, tag.replace("_", " ")))
            id_already_present.append(tag)

        for res in resources:
            if res["id"] not in id_already_present:
                if res["type"] == BOOKMARK:
                    print("%s [shape=box label=\"%s\" URL=\"%s\" style=filled fillcolor=\"0.8 0.4 0.9\"];"% (res["id"], shorten(res["label"]), res["uri"]))
                else:
                    print("%s [shape=box label=\"%s\" URL=\"%s\"];"% (res["id"], shorten(res["label"]), res["uri"]))
                id_already_present.append(res["id"])
            print("%s -> %s;"% (tag, res["id"]))

    for child, parent in ONTOLOGY.items():
        if child not in id_already_present:
            print("%s [shape=ellipse label=\"%s\" style=filled fillcolor=\"0.3 0.8 0.8\"];" % (child, child.replace("_", " ")))
            id_already_present.append(child)
        if parent not in id_already_present:
            print("%s [shape=ellipse label=\"%s\" style=filled fillcolor=\"0.3 0.8 0.8\"];" % (parent, parent.replace("_", " ")))
            id_already_present.append(parent)
        print("%s -> %s;"% (parent, child))
    print("}")

generate_dot_file(resources)
