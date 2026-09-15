import {execFile} from 'node:child_process';
import {promisify} from 'node:util';
import {resolve} from 'node:path';
import {GoogleAuth} from 'google-auth-library';
import {SecretsManagerClient, GetSecretValueCommand} from '@aws-sdk/client-secrets-manager';
import {appRoot} from './config.mjs';
const exec=promisify(execFile);
const childEnv={...process.env,PSModulePath:`${process.env.SystemRoot||'C:\\Windows'}\\System32\\WindowsPowerShell\\v1.0\\Modules`};

export function createCredentials(config) {
  let identity, key, pending;
  async function refresh() {
    if (!key) {
      if(config.production) {
        if(!config.apiKeySecretId) throw Error('CREDENTIALS_UNAVAILABLE');
        const secrets=new SecretsManagerClient({});
        const response=await secrets.send(new GetSecretValueCommand({SecretId:config.apiKeySecretId}));
        key=response.SecretString?.trim();
      } else {
        const result=await exec('powershell.exe',['-NoProfile','-NonInteractive','-ExecutionPolicy','Bypass','-File',resolve(appRoot,'scripts/read-key.ps1')],{env:childEnv,windowsHide:true,timeout:15000,maxBuffer:4096});
        key=result.stdout.trim();
      }
      if(!/^pmp_[A-Za-z0-9_-]{43}$/.test(key||'')){key=null;throw Error('CREDENTIALS_UNAVAILABLE');}
    }
    if(!identity || identity.expiresAt<Date.now()+60000) {
      let token;
      if(config.credentialsMode==='gcloud-developer' && !config.production) {
        const result=await exec('powershell.exe',['-NoProfile','-NonInteractive','-ExecutionPolicy','Bypass','-File',resolve(appRoot,'scripts/identity-token.ps1')],{env:childEnv,windowsHide:true,timeout:50000,maxBuffer:16384});
        token=result.stdout.trim();
      } else if(config.credentialsMode==='aws-wif') {
        const auth=new GoogleAuth({projectId:'playmusicprompts',scopes:['https://www.googleapis.com/auth/cloud-platform']});
        const client=await auth.getClient();
        const access=await client.getAccessToken();
        const response=await fetch(`https://iamcredentials.googleapis.com/v1/projects/-/serviceAccounts/${config.googleServiceAccount}:generateIdToken`,{
          method:'POST',headers:{Authorization:`Bearer ${access.token}`,'Content-Type':'application/json'},
          body:JSON.stringify({audience:config.engineBase,includeEmail:true}),signal:AbortSignal.timeout(30000),redirect:'error'
        });
        if(!response.ok)throw Error('CREDENTIALS_UNAVAILABLE');
        token=(await response.json()).token;
      } else throw Error('CREDENTIALS_UNAVAILABLE');
      if(!/^[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+$/.test(token||''))throw Error('CREDENTIALS_UNAVAILABLE');
      const claim=JSON.parse(Buffer.from(token.split('.')[1],'base64url').toString());
      if(!Number.isFinite(claim.exp)||claim.exp*1000<Date.now()+60000)throw Error('CREDENTIALS_UNAVAILABLE');
      if(config.production&&claim.aud!==config.engineBase)throw Error('CREDENTIALS_UNAVAILABLE');
      identity={token,expiresAt:claim.exp*1000};
    }
    return {identityToken:identity.token,apiKey:key};
  }
  return async ()=>{
    if(!pending)pending=refresh().catch(()=>{throw Object.assign(Error('Music connection is unavailable.'),{status:503,code:'CREDENTIALS_UNAVAILABLE'});}).finally(()=>pending=null);
    return pending;
  };
}
