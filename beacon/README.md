# Client beacon

#### nodes = stylesheets + rules + properties

## Node types
###CSS rule types
  * 0 - unknown rule
  * 1 - style
  * 2 - charset
  * 3 - import
  * 4 - media
  * 5 - font-face
  * 6 - page
  * 7 - keyframes
  * 8 - keyframe
  * 9 - *reserved (color profile, svg/css4)*
  * 10 - namespace
  * 11 - counter style
  * 12 - supports
  * 13 - document
  * 14 - font feature values
  * 15 - viewport
  * 16 - region style
  * 1000 - text transform
  * 1001 - host  

Source: [wiki.csswg.org](
http://wiki.csswg.org/spec/cssom-constants)
  
### Custom node types
  * -1 - property
  * -2 - file stylesheet
  * -3 - inline stylesheet
  
## Structure
  * ref - reference to CSS object (except for property nodes)
  * type - (int) node type
  * name
  * value (property nodes)
  * important (property nodes)
  * children[] (all nodes that contain other nodes)
  * hash
  * parentHash (stylesheet nodes have null)
  * parent - reference to the parent node