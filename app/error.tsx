'use client';
export default function ErrorPage({reset}:{error:Error;reset:()=>void}){return <main className="empty"><h1>Workspace belum bisa ditampilkan.</h1><p>Data yang tersimpan tidak dihapus. Coba muat ulang halaman.</p><button className="btn primary" onClick={reset}>Coba lagi</button></main>}
