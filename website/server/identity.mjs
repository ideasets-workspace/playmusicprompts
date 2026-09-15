import * as oidc from 'openid-client';
import {problem,nonce} from './store.mjs';

export function createIdentity(config,store){
  let cached;
  async function client(){
    if(!config.oidc)throw problem(503,'IDENTITY_NOT_CONFIGURED','Account sign-in is not connected yet. You can still create and listen.');
    if(!cached){
      const issuer=new URL(config.oidc.issuer);
      if(issuer.protocol!=='https:'||issuer.username||issuer.password)throw problem(503,'IDENTITY_UNAVAILABLE','Account sign-in is unavailable.');
      cached=oidc.discovery(issuer,config.oidc.clientId,config.oidc.clientSecret,undefined,{timeout:20,execute:[oidc.enableNonRepudiationChecks]}).catch(()=>{cached=null;throw problem(503,'IDENTITY_UNAVAILABLE','Account sign-in is unavailable.');});
    }
    return cached;
  }
  return {
    async start(session){
      const c=await client(),verifier=oidc.randomPKCECodeVerifier(),state=nonce(),n=nonce();
      store.db.prepare('DELETE FROM oidc_attempts WHERE session_hash=?').run(session.token_hash);
      store.db.prepare('INSERT INTO oidc_attempts VALUES (?,?,?,?,?)').run(state,session.token_hash,verifier,n,Date.now()+600000);
      const url=oidc.buildAuthorizationUrl(c,{scope:'openid profile email',redirect_uri:`${config.origin}/auth/callback`,code_challenge:await oidc.calculatePKCECodeChallenge(verifier),code_challenge_method:'S256',state,nonce:n});
      return {url:url.href};
    },
    async callback(url,session){
      if(!session)throw problem(401,'SIGNIN_EXPIRED','Your sign-in session expired. Please start again.');
      const state=url.searchParams.get('state');if(!state||state.length>100)throw problem(401,'SIGNIN_INVALID','This sign-in response could not be verified.');
      const attempt=store.db.prepare('SELECT * FROM oidc_attempts WHERE state=? AND session_hash=? AND expires>?').get(state,session.token_hash,Date.now());
      if(!attempt)throw problem(401,'SIGNIN_INVALID','This sign-in response could not be verified.');
      store.db.prepare('DELETE FROM oidc_attempts WHERE state=?').run(state);
      let claims;try{const tokens=await oidc.authorizationCodeGrant(await client(),url,{pkceCodeVerifier:attempt.verifier,expectedState:state,expectedNonce:attempt.nonce,idTokenExpected:true});claims=tokens.claims();}catch{throw problem(401,'SIGNIN_INVALID','Account sign-in could not be verified. Please try again.');}
      if(!claims?.sub||claims.iss!==config.oidc.issuer)throw problem(401,'SIGNIN_INVALID','Account sign-in could not be verified.');
      const user=store.identity(claims.iss,claims.sub,claims.name||claims.preferred_username);
      return {...store.newSession(user,session),user};
    }
  };
}
