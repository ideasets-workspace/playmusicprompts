const fs=require('fs');
const path='website_html_templates/player-three-scene.js';
let source=fs.readFileSync(path,'utf8');
function replace(from,to){if(!source.includes(from))throw Error('Expected source missing: '+from);source=source.replace(from,()=>to);}
replace('setModel(id){model=collection.select(id);diagnostics.model=model;showModel();}', 'setModel(id){if(id===model&&pendingModel===null)return;if(frames<2||!motion){pendingModel=null;applyModel(id);}else pendingModel=id;}');
replace('setMotion(value){motion=value;diagnostics.motion=value;}', 'setMotion(value){motion=value;diagnostics.motion=value;if(!motion){transitionAnimation?.cancel();transitionCanvas.style.display=\'none\';changeScene();}}');
replace('dispose(){disposed=true;resize.disconnect();', 'dispose(){disposed=true;transitionAnimation?.cancel();transitionCanvas.remove();resize.disconnect();');
fs.writeFileSync(path,source);
console.log('Integrated bounded host transitions and motion cleanup.');
