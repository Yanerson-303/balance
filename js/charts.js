"use strict";
Nexo.charts = (() => {
 const {e,num}=Nexo.util;
 function bars(items,{height=182,colors=['#7b64e8'],labels=true}={}){
   if(!items.length)return '<div class="empty-small">No hay datos aún.</div>';
   const max=Math.max(1,...items.flatMap(x=>x.values||[x.value||0]));
   const svgHeight=height-27,barw= Math.min(26, Math.max(7, 600/items.length/2)), gap=6;
   const w=Math.max(300,items.length*50),unit=w/items.length;
   let out=`<svg class="chart-svg" viewBox="0 0 ${w} ${height}" role="img" aria-label="Gráfico de barras" preserveAspectRatio="none">`;
   for(let i=0;i<4;i++){const y=12+(svgHeight-12)*i/3;out+=`<line x1="0" y1="${y}" x2="${w}" y2="${y}" stroke="#e9edf3" stroke-dasharray="4 5"/>`;}
   items.forEach((x,i)=>{
     const vals=x.values||[x.value||0], bw=Math.min(barw,(unit-9)/vals.length),total=vals.length*bw+(vals.length-1)*gap,x0=i*unit+(unit-total)/2;
     vals.forEach((v,j)=>{const bh=Math.max(v>0?2:0,(v/max)*(svgHeight-19)), y=svgHeight-bh;out+=`<rect x="${x0+j*(bw+gap)}" y="${y}" width="${bw}" height="${bh}" rx="${Math.min(5,bw/2)}" fill="${colors[j%colors.length]}"><title>${e(x.label)}: ${num(v)}</title></rect>`;});
     if(labels)out+=`<text x="${i*unit+unit/2}" y="${height-3}" text-anchor="middle" fill="#8190a3" font-size="12" font-family="inherit">${e(x.label)}</text>`;
   });
   return out+'</svg>';
 }
 function donut(items,{size=166}={}){
   const total=items.reduce((a,x)=>a+(+x.value||0),0);
   if(!total)return `<div class="donut-empty">Sin gastos</div>`;
   let cumulative=0;const r=61,cx=82,cy=82,circ=2*Math.PI*r;
   const sectors=items.map((x,i)=>{const fraction=x.value/total, offset=circ*cumulative;cumulative+=fraction;return `<circle cx="${cx}" cy="${cy}" r="${r}" stroke="${x.color||'#7b64e8'}" stroke-width="20" fill="none" stroke-dasharray="${fraction*circ} ${circ}" stroke-dashoffset="${-offset}" transform="rotate(-90 ${cx} ${cy})"/>`;}).join('');
   return `<svg class="donut" style="width:${size}px" viewBox="0 0 164 164" aria-label="Distribución por categorías"><circle cx="82" cy="82" r="61" fill="none" stroke="#eef1f7" stroke-width="20"/>${sectors}<text x="82" y="76" text-anchor="middle" class="donut-label">Total</text><text x="82" y="97" text-anchor="middle" class="donut-number">100%</text></svg>`;
 }
 function line(items,{height=145,color='#7b64e8'}={}){
   if(items.length<2)return `<div class="empty-small">Agrega al menos dos registros para ver la evolución.</div>`;
   const w=600,px=15,py=16, usable=height-42,max=Math.max(...items.map(x=>+x.value||0),1),min=Math.min(...items.map(x=>+x.value||0),0),rng=Math.max(1,max-min);
   const coords=items.map((x,i)=>({x:px+i*(w-2*px)/(items.length-1),y:py+usable-(x.value-min)/rng*usable}));
   const poly=coords.map(p=>`${p.x},${p.y}`).join(' '),fill=coords.map(p=>`${p.x},${p.y}`).join(' ')+` ${coords[coords.length-1].x},${height-22} ${coords[0].x},${height-22}`;
   return `<svg class="chart-svg" viewBox="0 0 ${w} ${height}" role="img" aria-label="Gráfico de evolución" preserveAspectRatio="none"><polygon points="${fill}" fill="${color}" opacity=".10"/><polyline points="${poly}" fill="none" stroke="${color}" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"/>${coords.map((p,i)=>`<circle cx="${p.x}" cy="${p.y}" r="4" fill="${color}"><title>${e(items[i].label)}: ${num(items[i].value,2)}</title></circle>`).join('')}</svg>`;
 }
 return {bars,donut,line};
})();
