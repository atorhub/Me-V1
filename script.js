// script.js - main app logic (parser, OCR, IndexedDB history, UI wiring)
// Uses: pdf.js, Tesseract, html2canvas + jsPDF, creatures.js

(async function(){
  // --- DOM references ---
  const fileInput = document.getElementById('fileInput');
  const parseBtn = document.getElementById('parseBtn');
  const ocrBtn = document.getElementById('ocrBtn');
  const extractDate = document.getElementById('fDate');
  const extractTotal = document.getElementById('fTotal');
  const extractMerchant = document.getElementById('fMerchant');
  const extractCat = document.getElementById('fCategory');
  const extractItems = document.getElementById('fItems');
  const saveHistory = document.getElementById('saveHistory');
  const historyList = document.getElementById('historyList');
  const downloadPdf = document.getElementById('downloadPdf');
  const printBtn = document.getElementById('printBtn');
  const exportAll = document.getElementById('exportAll');
  const clearHistory = document.getElementById('clearHistory');
  const creatureArea = document.getElementById('creatureArea');

  // --- Creature init ---
  Creatures.renderAll(creatureArea);

  // --- simple IndexedDB wrapper ---
  const IDB = (function(){
    const DBNAME='anj-invoice-db'; const STORE='bills'; let db;
    function open(){ return new Promise((res,rej)=>{
      const r = indexedDB.open(DBNAME,1);
      r.onupgradeneeded = ()=> r.result.createObjectStore(STORE,{keyPath:'id'});
      r.onsuccess = ()=>{db=r.result;res();};
      r.onerror = ()=> rej(r.error);
    });}
    function put(obj){ return new Promise((res,rej)=>{
      const tx=db.transaction(STORE,'readwrite'); const s=tx.objectStore(STORE);
      s.put(obj).onsuccess = ()=> res();
      tx.onerror = ()=> rej(tx.error);
    });}
    function all(){ return new Promise((res,rej)=>{
      const tx=db.transaction(STORE,'readonly'); const s=tx.objectStore(STORE);
      const r=s.getAll();
      r.onsuccess=()=>res(r.result);
      r.onerror=()=>rej(r.error);
    });}
    function clear(){ return new Promise((res,rej)=>{
      const tx=db.transaction(STORE,'readwrite'); const s=tx.objectStore(STORE);
      s.clear().onsuccess=()=>res(); s.clear().onerror=(e)=>rej(e);
    });}
    return { open, put, all, clear };
  })();

  await IDB.open().catch(e=>console.warn('IDB init failed', e));

  // --- utils: parse text heuristics ---
  function extractTotalFromText(text){
    // look for lines containing total or amount and a number
    const lines = text.split(/\r?\n/).map(l=>l.trim()).filter(Boolean);
    const totalRegex = /(total|amount|grand total|net amount)[^\d₹\d]*([₹]?\s*[\d,]+(?:\.\d+)?)/i;
    for(let i=lines.length-1;i>=0;i--){
      const m = lines[i].match(totalRegex);
      if(m) return (m[2]||'').replace(/\s+/,'');
    }
    // fallback: find largest number
    const nums = [];
    lines.forEach(l=>{
      const found = l.match(/₹?\s*([\d,]+(?:\.\d+)?)/g);
      if(found) found.forEach(f=>nums.push(parseFloat(f.replace(/[₹,\s]/g,''))));
    });
    if(nums.length) return nums.sort((a,b)=>b-a)[0];
    return null;
  }

  function extractDateFromText(text){
    const dateRegex = /\b(0?[1-9]|[12][0-9]|3[01])[-\/\s](0?[1-9]|1[012])[-\/\s](\d{2,4})\b/;
    const m = text.match(dateRegex);
    return m? m[0] : '-';
  }

  function extractMerchantFromText(text){
    // merchant often appears near top: take first line with letters & spaces
    const lines = text.split(/\r?\n/).map(l=>l.trim()).filter(Boolean);
    if(lines.length>0) return lines[0].slice(0,40);
    return '-';
  }

  function extractItemsFromText(text){
    // very simple heuristic: lines with qty/price/total or with tabs
    const lines = text.split(/\r?\n/).map(l=>l.trim()).filter(Boolean);
    const itemRegex = /(\d+)\s+([A-Za-z&\-\s]{3,})\s+([\d,]+(?:\.\d+)?)\s+([\d,]+(?:\.\d+)?)/;
    const items = [];
    for(let l of lines){
      const m = l.match(itemRegex);
      if(m) items.push({qty:m[1],desc:m[2].trim(),unit:m[3],total:m[4]});
    }
    return items;
  }

  // --- PDF text extraction ----------
  async function pdfToText(arrayBuffer){
    const loadingTask = pdfjsLib.getDocument({data:arrayBuffer});
    const pdf = await loadingTask.promise;
    let full = '';
    for(let i=1;i<=pdf.numPages;i++){
      const page = await pdf.getPage(i);
      const content = await page.getTextContent();
      const strs = content.items.map(it=>it.str);
      full += strs.join(' ') + '\n';
    }
    return full;
  }

  // --- OCR (Tesseract worker) ---
  async function ocrArrayBufferToText(arrayBuffer){
    // create blob URL
    const blob = new Blob([arrayBuffer]);
    const url = URL.createObjectURL(blob);
    // use Tesseract worker API
    const { createWorker } = Tesseract;
    const worker = createWorker({ logger: m => {/*console.log(m)*/} });
    await worker.load();
    await worker.loadLanguage('eng');
    await worker.initialize('eng');
    const { data: { text } } = await worker.recognize(url);
    await worker.terminate();
    URL.revokeObjectURL(url);
    return text;
  }

  // --- file handlers ---
  async function handleFileParse(file){
    if(!file) return alert('Please choose a file');
    const name = file.name;
    const ab = await file.arrayBuffer();

    let text = '';
    if(name.toLowerCase().endsWith('.pdf')){
      try{
        text = await pdfToText(ab);
      }catch(e){
        // fallback to OCR on first page if pdf.js fails to extract real text
        console.warn('pdf parse failed, fallback to OCR', e);
        text = await ocrArrayBufferToText(ab);
      }
    } else if(name.match(/\.(jpg|jpeg|png)$/i)){
      // image -> OCR
      text = await ocrArrayBufferToText(ab);
    } else {
      // assume plain text
      text = new TextDecoder().decode(ab);
    }
    return { text, ab, name };
  }

  // --- update UI from parsed text ---
  function updateUIFromText(text){
    const date = extractDateFromText(text) || '-';
    const total = extractTotalFromText(text) || '-';
    const merchant = extractMerchantFromText(text) || '-';
    const items = extractItemsFromText(text);
    extractDate.textContent = date;
    extractTotal.textContent = (typeof total === 'number')? `₹${total}` : total;
    extractMerchant.textContent = merchant;
    extractCat.textContent = categorizeByKeywords(text);
    extractItems.textContent = items.length? JSON.stringify(items,null,2): 'None detected';
  }

  // simple category mapping
  function categorizeByKeywords(text){
    const lower = text.toLowerCase();
    if(/grocery|veg|fruits|supermarket|mart|kirana/.test(lower)) return 'Groceries';
    if(/hotel|restaurant|cafe|dine|food|dominos|pizza|burger/.test(lower)) return 'Food';
    if(/fuel|petrol|diesel|gas/.test(lower)) return 'Transport';
    if(/pharma|medicine|clinic|hospital|drug/.test(lower)) return 'Health';
    if(/flight|rail|ticket|booking|uber|ola|taxi/.test(lower)) return 'Travel';
    if(/bank|upi|transaction|card|atm|netbanking/.test(lower)) return 'Finance';
    return 'General';
  }

  // --- events ---
  parseBtn.addEventListener('click', async ()=>{
    const file = fileInput.files[0];
    try{
      showMsg('Parsing...');
      const result = await handleFileParse(file);
      updateUIFromText(result.text);
      currentParsed = { id: generateId(), name: result.name, text: result.text, ab: result.ab, date: new Date().toISOString() };
      showMsg('Parsed OK', 'info');
    } catch(e){
      console.error(e);
      showMsg('Parse failed: '+(e.message||e), 'err');
    }
  });

  ocrBtn.addEventListener('click', async ()=>{
    const file = fileInput.files[0];
    try{
      showMsg('OCR running...');
      const ab = await file.arrayBuffer();
      const text = await ocrArrayBufferToText(ab);
      updateUIFromText(text);
      currentParsed = { id: generateId(), name:file.name, text, ab, date: new Date().toISOString() };
      showMsg('OCR complete', 'info');
    } catch(e){ console.error(e); showMsg('OCR failed: '+e, 'err'); }
  });

  saveHistory.addEventListener('click', async ()=>{
    if(!currentParsed) return alert('Nothing parsed yet');
    // compute simple xp for creatures based on total
    const totalValue = parseFloat((extractTotal.textContent||'').replace(/[^0-9.]/g,'')) || 0;
    const xpDelta = Math.min(200, Math.round(totalValue/10));
    // example: we give xp to creature by category
    const category = extractCat.textContent || 'General';
    // map category->creature id
    const map = { 'Groceries':'food', 'Food':'food', 'Shopping':'shopping', 'General':'shopping', 'Finance':'finance' };
    const cid = map[category] || 'shopping';
    // save to IDB
    const item = {
      id: currentParsed.id,
      name: currentParsed.name,
      text: currentParsed.text,
      date: currentParsed.date,
      xpGive: xpDelta,
      category
    };
    try{
      await IDB.put(item);
      showMsg('Saved to history', 'info');
      await refreshHistory();
      // update creature image (naive local xp store using localStorage)
      const key = 'creature-xp-'+cid;
      const prev = parseInt(localStorage.getItem(key)||'0',10);
      localStorage.setItem(key, prev + xpDelta);
      Creatures.updateCreatureImage(cid, prev + xpDelta);
    }catch(e){ console.error(e); showMsg('Save failed', 'err'); }
  });

  async function refreshHistory(){
    const arr = await IDB.all();
    if(!arr || !arr.length){ historyList.textContent = 'No saved bills yet.'; return; }
    historyList.innerHTML = '';
    arr.sort((a,b)=> b.date.localeCompare(a.date));
    arr.forEach(it=>{
      const el = document.createElement('div'); el.className='item';
      el.innerHTML = `<div><strong>${it.name}</strong><div style="font-size:12px;color:#aaa">${new Date(it.date).toLocaleString()}</div></div>
      <div><button data-id="${it.id}" class="btn btn-outline small open">Open</button></div>`;
      historyList.appendChild(el);
    });
    // wire open buttons
    [...historyList.querySelectorAll('.open')].forEach(b=>{
      b.addEventListener('click', async (e)=>{
        const id = e.target.dataset.id;
        const arr = await IDB.all();
        const it = arr.find(x=>x.id===id);
        if(it){
          updateUIFromText(it.text);
        }
      });
    });
  }
  await refreshHistory();

  clearHistory.addEventListener('click', async ()=>{
    if(!confirm('Clear all history?')) return;
    await IDB.clear();
    await refreshHistory();
    showMsg('History cleared','info');
  });

  exportAll.addEventListener('click', async ()=>{
    const all = await IDB.all();
    const blob = new Blob([JSON.stringify(all, null, 2)], {type:'application/json'});
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download='anj-invoice-history.json'; a.click();
    URL.revokeObjectURL(url);
  });

  // print / pdf export
  printBtn.addEventListener('click', ()=> window.print());
  downloadPdf.addEventListener('click', async ()=>{
    // render the extracted card to PDF
    const card = document.querySelector('.extract-card');
    const canvas = await html2canvas(card, {scale:2});
    const imgData = canvas.toDataURL('image/png');
    const { jsPDF } = window.jspdf;
    const pdf = new jsPDF({unit:'pt',format:'a4'});
    const w = pdf.internal.pageSize.getWidth();
    const h = pdf.internal.pageSize.getHeight();
    pdf.addImage(imgData, 'PNG', 20, 20, w-40, (canvas.height*(w-40))/canvas.width);
    pdf.save('invoice-extract.pdf');
  });

  // small UI helpers
  function showMsg(msg, type='info'){
    // quick browser alert fallback
    console.log(type, msg);
    const el = document.createElement('div');
    el.style.position='fixed'; el.style.bottom='18px'; el.style.left='18px';
    el.style.padding='8px 12px'; el.style.borderRadius='8px';
    el.style.background = (type==='err')? 'rgba(200,60,60,0.95)' : 'rgba(40,40,40,0.95)';
    el.style.color='#fff'; el.style.zIndex = 9999;
    el.innerText = msg;
    document.body.appendChild(el);
    setTimeout(()=>el.remove(), 1800);
  }

  function generateId(){ return 'b-'+Date.now()+'-'+Math.random().toString(36).slice(2,8); }

  // keep a small currentParsed object
  let currentParsed = null;

  // when the app loads, restore creature XP and update images
  function initCreatureImages(){
    const regs = Creatures.getRegistry();
    regs.forEach(r=>{
      const xp = parseInt(localStorage.getItem('creature-xp-'+r.id)||'0',10);
      Creatures.updateCreatureImage(r.id, xp);
    });
  }
  initCreatureImages();

  // expose small debug hook
  window._anj = { IDB, Creatures };

})();
