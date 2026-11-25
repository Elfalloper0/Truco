const http=require('http'),fs=require('fs'),path=require('path'),{WebSocketServer}=require('ws');
const srv=http.createServer((q,r)=>{r.writeHead(200,{'content-type':'text/html; charset=utf-8'});r.end(fs.readFileSync(path.join(__dirname,'index.html')))});
const wss=new WebSocketServer({server:srv}),rooms=new Map();
wss.on('connection',w=>{let room=null;
  w.on('message',b=>{let m;try{m=JSON.parse(b)}catch{return}
    if(m.j&&!room){const n=String(m.j).slice(0,48),s=rooms.get(n)||new Set();
      if(s.size>=2){w.send('{"err":"full"}');return}
      s.add(w);rooms.set(n,s);room=n;w.send('{"ok":1}');return}
    if(room&&typeof m.t=='string'&&b.length<20000)
      for(const o of rooms.get(room))if(o!==w&&o.readyState==1)o.send(JSON.stringify({topic:m.t,data:m.d}))});
  w.on('close',()=>{if(!room)return;const s=rooms.get(room);s.delete(w);if(!s.size)rooms.delete(room)})});
setInterval(()=>wss.clients.forEach(c=>c.ping()),30000);
srv.listen(process.env.PORT||3000,()=>console.log('Truco listo'));
