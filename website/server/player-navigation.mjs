import {nonce,sha,problem} from './store.mjs';

// Navigation contexts select a publicly listenable song. They confer no access
// to generation records, master files, account data or download entitlements.
export function createPlayerNavigation(store,{now=Date.now,ttl=10*60000}={}){
  store.db.exec(`CREATE TABLE IF NOT EXISTS player_navigation(
    handle_hash TEXT PRIMARY KEY,session_hash TEXT NOT NULL REFERENCES sessions(token_hash) ON DELETE CASCADE,
    track_id TEXT NOT NULL REFERENCES tracks(id),expires INTEGER NOT NULL);
    CREATE INDEX IF NOT EXISTS player_navigation_expiry ON player_navigation(expires);
    CREATE TABLE IF NOT EXISTS public_song_links(alias TEXT PRIMARY KEY,track_id TEXT NOT NULL UNIQUE REFERENCES tracks(id));`);
  const required=session=>{if(!session||session.expires<=now())throw problem(401,'SESSION_REQUIRED','Refresh this page before opening the listening room.');};
  const track=id=>{if(typeof id!=='string'||!/^[a-f0-9]{64}$/.test(id))throw problem(400,'INVALID_REQUEST','Choose an available song.');const value=store.track(id);if(!value)throw problem(404,'NOT_FOUND','Song not found.');return value;};
  function open(session,id){required(session);track(id);const handle=nonce(),expires=Math.min(now()+ttl,session.expires);
    store.transaction(()=>{store.consume('player-navigation:'+session.token_hash,60,60000);store.db.prepare('DELETE FROM player_navigation WHERE expires<=?').run(now());store.db.prepare('INSERT INTO player_navigation VALUES (?,?,?,?)').run(sha(handle),session.token_hash,id,expires);});
    return {handle,expiresAt:expires};
  }
  function resolve(session,handle){required(session);if(typeof handle!=='string'||!/^[A-Za-z0-9_-]{43}$/.test(handle))throw problem(404,'NOT_FOUND','This listening-room selection is unavailable. Choose the song again.');
    const row=store.db.prepare('SELECT track_id FROM player_navigation WHERE handle_hash=? AND session_hash=? AND expires>?').get(sha(handle),session.token_hash,now());
    if(!row)throw problem(404,'NOT_FOUND','This listening-room selection is unavailable. Choose the song again.');
    return {track:track(row.track_id)};
  }
  function share(session,id){required(session);track(id);return store.transaction(()=>{store.consume('song-share:'+session.token_hash,30,60000);let row=store.db.prepare('SELECT alias FROM public_song_links WHERE track_id=?').get(id);if(!row){row={alias:nonce()};store.db.prepare('INSERT INTO public_song_links VALUES (?,?)').run(row.alias,id);}return {path:'/s/'+row.alias};});}
  function publicTrack(alias){if(!/^[A-Za-z0-9_-]{43}$/.test(alias))throw problem(404,'NOT_FOUND','Song link not found.');const row=store.db.prepare('SELECT track_id FROM public_song_links WHERE alias=?').get(alias);if(!row)throw problem(404,'NOT_FOUND','Song link not found.');return track(row.track_id);}
  return Object.freeze({open,resolve,share,publicTrack});
}
