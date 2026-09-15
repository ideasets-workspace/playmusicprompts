import * as THREE from 'three';
import {getScene} from './player-three-collection.js';
import {createAuroraAsset} from './player-three-aurora.js';
import {createOrbitalAsset} from './player-three-orbital.js';
import {createLiquidAsset} from './player-three-liquid.js';

export function createSceneCollection(scene){
 const factories={aurora:createAuroraAsset,orbital:createOrbitalAsset,liquid:createLiquidAsset},assets=new Map();
 let selected='record',palette=null;
 function select(id){selected=getScene(id).id;if(selected!=='record'&&!assets.has(selected)){const asset=factories[selected](THREE);asset.group.position.y=2.75;scene.add(asset.group);if(palette)asset.setPalette(palette);assets.set(selected,asset);}for(const[id,asset]of assets)asset.group.visible=id===selected;return selected;}
 return{select,get view(){return assets.get(selected)?.view||null;},setPalette(world){palette=world;for(const asset of assets.values())asset.setPalette(world);},update(frame){assets.get(selected)?.update(frame);},get diagnostics(){const detail=assets.get(selected)?.diagnostics;return{selected,created:[...assets.keys()],asset:typeof detail==='function'?detail():detail||null};},dispose(){for(const asset of assets.values()){scene.remove(asset.group);if(asset.dispose)asset.dispose();else{const geometries=new Set(),materials=new Set();asset.group.traverse(o=>{if(o.geometry)geometries.add(o.geometry);for(const material of Array.isArray(o.material)?o.material:o.material?[o.material]:[])materials.add(material);});for(const geometry of geometries)geometry.dispose();for(const material of materials)material.dispose();}}assets.clear();}};
}
