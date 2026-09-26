import {env} from "cloudflare:workers";
import {readStore,account,saveStore} from "@/lib/demo-access";
export const dynamic="force-dynamic";
const fields=["phone","birthPlace","birthDate","gender","address","city","postalCode","parentName","parentPhone","emergencyName","emergencyPhone","school","position","jersey","licenseName","licenseNumber","licenseIssuer","licenseExpires","experience","specialty","notes"];
const kinds=["Kartu keluarga","KTP / identitas","Akta kelahiran","Foto profil","Lisensi pelatih","Sertifikat","Dokumen lain"];
const json=(data:unknown,status=200)=>Response.json(data,{status,headers:{"Cache-Control":"no-store"}});
async function context(req:Request){
 const store=await readStore(req),a=account(req,store.data);if(!a)throw Error("401");
 const url=new URL(req.url),kind=url.searchParams.get("kind"),subject=url.searchParams.get("subject");
 if(!["Members","Coaches"].includes(kind||""))throw Error("404");
 const base=store.data.records[kind!].find((r:any)=>r.id===subject && r.club===a.club);if(!base)throw Error("404");
 if(a.role!=="Admin" && !((kind==="Members"&&a.role==="Member"&&a.member===subject)||(kind==="Coaches"&&a.role==="Coach"&&a.coach===subject)))throw Error("403");
 return {store,a,base,kind:kind!,subject:subject!};
}
const fail=(e:unknown)=>{const m=e instanceof Error?e.message:"";return json({error:m==="401"?"Session berakhir. Masuk kembali.":["403","404"].includes(m)?"Profil tidak tersedia untuk akun ini.":m||"Profil belum dapat diproses."},["401","403","404"].includes(m)?Number(m):400)};
export async function GET(req:Request){try{const {store,base,kind,subject}=await context(req);const id=new URL(req.url).searchParams.get("file");
 if(id){const file=await (env.DB as D1Database).prepare("SELECT name,mime,content FROM profile_files WHERE owner=? AND subject=? AND kind=? AND id=?").bind(store.who,subject,kind,id).first<any>();if(!file)return json({error:"Dokumen tidak ditemukan."},404);return new Response(Array.isArray(file.content)?new Uint8Array(file.content):file.content,{headers:{"Content-Type":file.mime,"Content-Disposition":"attachment; filename*=UTF-8''"+encodeURIComponent(file.name),"Cache-Control":"no-store","X-Content-Type-Options":"nosniff"}})}
 const docs=await (env.DB as D1Database).prepare("SELECT id,name,mime,size,category,created_at FROM profile_files WHERE owner=? AND subject=? AND kind=? ORDER BY created_at DESC").bind(store.who,subject,kind).all();
 return json({base,profile:store.data.records.Profiles.find((p:any)=>p.id===subject&&p.kind===kind)||{},documents:docs.results});
 }catch(e){return fail(e)}}
export async function PUT(req:Request){try{if(req.headers.get("origin")!==new URL(req.url).origin)throw Error("403");const {store,base,kind,subject}=await context(req);const raw=await req.text();if(raw.length>16000)throw Error("Profil terlalu panjang.");const body=JSON.parse(raw);const profile:any={id:subject,club:base.club,kind};for(const key of fields){if(body[key]!==undefined && typeof body[key]!=="string")throw Error("Isian profil tidak valid.");profile[key]=(body[key]||"").trim().slice(0,key==="notes"?1500:500)}
 for(const key of ["birthDate","licenseExpires"])if(profile[key]&&!/^\d{4}-\d{2}-\d{2}$/.test(profile[key]))throw Error("Tanggal tidak valid.");
 const index=store.data.records.Profiles.findIndex((p:any)=>p.id===subject&&p.kind===kind);if(index<0)store.data.records.Profiles.push(profile);else store.data.records.Profiles[index]=profile;await saveStore(store);return json({ok:true});
 }catch(e){return fail(e)}}
export async function POST(req:Request){try{if(req.headers.get("origin")!==new URL(req.url).origin)throw Error("403");const {store,kind,subject}=await context(req);if(Number(req.headers.get("content-length"))>2200000)throw Error("Maksimum file 2 MB.");const form=await req.formData(),file=form.get("file") as File|null,category=String(form.get("category"));if(!file||typeof file.arrayBuffer!=="function"||!kinds.includes(category))throw Error("Pilih dokumen dan kategori.");if(file.size>2000000||file.size<8)throw Error("Ukuran dokumen harus 8 byte sampai 2 MB.");const bytes=new Uint8Array(await file.arrayBuffer());const pdf=String.fromCharCode(...bytes.slice(0,5))==="%PDF-",png=bytes.slice(0,8).join() === "137,80,78,71,13,10,26,10",jpg=bytes[0]===255&&bytes[1]===216&&bytes[2]===255;const mime=pdf?"application/pdf":png?"image/png":jpg?"image/jpeg":"";if(!mime||mime!==file.type)throw Error("Gunakan PDF, JPG, atau PNG yang valid.");
 const db=env.DB as D1Database;const id=crypto.randomUUID();const result=await db.prepare("INSERT INTO profile_files(id,owner,subject,kind,name,mime,size,category,content,created_at) SELECT ?,?,?,?,?,?,?,?,?,? WHERE (SELECT COUNT(*) FROM profile_files WHERE owner=? AND subject=? AND kind=?) < 12").bind(id,store.who,subject,kind,file.name.slice(0,150),mime,file.size,category,bytes.buffer,new Date().toISOString(),store.who,subject,kind).run();if(!result.meta.changes)throw Error("Maksimum 12 dokumen per profil. Hapus dokumen lama terlebih dahulu.");return json({id},201);
 }catch(e){return fail(e)}}
export async function DELETE(req:Request){try{if(req.headers.get("origin")!==new URL(req.url).origin)throw Error("403");const {store,kind,subject}=await context(req),id=new URL(req.url).searchParams.get("file");const result=await (env.DB as D1Database).prepare("DELETE FROM profile_files WHERE id=? AND owner=? AND kind=? AND subject=?").bind(id,store.who,kind,subject).run();if(!result.meta.changes)return json({error:"Dokumen sudah tidak tersedia."},404);return json({ok:true})}catch(e){return fail(e)}}
