"use client";
import { FormEvent, useEffect, useMemo, useState } from "react";

type Person={id:number;name:string;company:string;department:string;position:string;created_at:string;updated_at:string};
type Form=Pick<Person,"name"|"company"|"department"|"position">;
const blank:Form={name:"",company:"",department:"",position:""};

export default function Home(){
 const [people,setPeople]=useState<Person[]>([]),[query,setQuery]=useState(""),[form,setForm]=useState<Form>(blank),[editing,setEditing]=useState<number|null>(null),[modal,setModal]=useState(false),[loading,setLoading]=useState(true),[saving,setSaving]=useState(false),[message,setMessage]=useState("");
 async function load(){setLoading(true);const response=await fetch("/api/people",{cache:"no-store"});const result=await response.json();if(!response.ok)setMessage(`목록을 불러오지 못했습니다: ${result.error}`);else{setMessage("");setPeople(result as Person[])}setLoading(false)}
 useEffect(()=>{void load()},[]);
 const shown=useMemo(()=>{const q=query.toLowerCase().trim();return people.filter(p=>!q||[p.name,p.company,p.department,p.position].some(v=>v.toLowerCase().includes(q)))},[people,query]);
 const create=()=>{setEditing(null);setForm(blank);setModal(true)};
 const edit=(p:Person)=>{setEditing(p.id);setForm({name:p.name,company:p.company,department:p.department,position:p.position});setModal(true)};
 const close=()=>{setModal(false);setEditing(null)};
 async function save(e:FormEvent){e.preventDefault();setSaving(true);setMessage("");const response=await fetch(editing===null?"/api/people":`/api/people?id=${editing}`,{method:editing===null?"POST":"PATCH",headers:{"Content-Type":"application/json"},body:JSON.stringify(form)});const result=await response.json();setSaving(false);if(!response.ok){setMessage(`저장하지 못했습니다: ${result.error}`);return}close();await load()}
 async function remove(p:Person){if(!confirm(`${p.name} 님을 삭제하시겠습니까?`))return;const response=await fetch(`/api/people?id=${p.id}`,{method:"DELETE"});const result=await response.json();if(!response.ok)setMessage(`삭제하지 못했습니다: ${result.error}`);else await load()}
 return <main className="shell">
  <aside><div className="brand"><b>P</b> People Manager</div><button className="nav">♙　인명 관리</button><div className="account"><i>관</i><span><strong>관리자</strong><small>Supabase 연결</small></span></div></aside>
  <section className="content"><header><div><h1>인명 관리</h1><p>회사 구성원 정보를 한곳에서 관리하세요.</p></div><button className="primary" onClick={create}>＋ 신규 등록</button></header>
   {message&&<div className="notice error">{message}</div>}
   <div className="stats"><article><span>전체 인원</span><strong>{people.length}</strong> 명</article><article><span>회사</span><strong>{new Set(people.map(p=>p.company)).size}</strong> 개</article><article><span>부서</span><strong>{new Set(people.map(p=>p.department)).size}</strong> 개</article></div>
   <div className="panel"><div className="toolbar"><div><h2>인명 목록</h2><span>총 {shown.length}명</span></div><label className="search">⌕<input aria-label="인명 검색" placeholder="이름, 회사, 부서, 직책 검색" value={query} onChange={e=>setQuery(e.target.value)}/></label></div><div className="table"><table><thead><tr><th>이름</th><th>회사</th><th>부서</th><th>직책</th><th>등록일</th><th/></tr></thead><tbody>
    {shown.map(p=><tr key={p.id}><td><div className="person"><i>{p.name[0]}</i><span><strong>{p.name}</strong></span></div></td><td>{p.company}</td><td>{p.department}</td><td><b className="badge">{p.position}</b></td><td>{new Date(p.created_at).toLocaleDateString("ko-KR")}</td><td className="actions"><button onClick={()=>edit(p)}>수정</button><button className="delete" onClick={()=>void remove(p)}>삭제</button></td></tr>)}
    {loading&&<tr><td colSpan={6} className="empty">목록을 불러오는 중입니다...</td></tr>}{!loading&&!shown.length&&<tr><td colSpan={6} className="empty">등록된 인명이 없습니다.</td></tr>}
   </tbody></table></div></div>
  </section>
  {modal&&<div className="overlay" onMouseDown={e=>e.target===e.currentTarget&&close()}><form className="modal" onSubmit={save}><div className="modalHead"><div><h2>{editing===null?"신규 인명 등록":"인명 정보 수정"}</h2><p>회사와 소속 정보를 입력하세요.</p></div><button type="button" onClick={close}>×</button></div><div className="fields">
   <label>이름<input required value={form.name} onChange={e=>setForm({...form,name:e.target.value})} placeholder="홍길동"/></label><label>회사<input required value={form.company} onChange={e=>setForm({...form,company:e.target.value})} placeholder="회사명"/></label><label>부서<input required value={form.department} onChange={e=>setForm({...form,department:e.target.value})} placeholder="개발팀"/></label><label>직책<input required value={form.position} onChange={e=>setForm({...form,position:e.target.value})} placeholder="팀장"/></label>
  </div><footer><button type="button" onClick={close}>취소</button><button className="primary" disabled={saving}>{saving?"저장 중...":editing===null?"등록하기":"저장하기"}</button></footer></form></div>}
 </main>
}
