/* ============================================================
   code-check.js — 購入者から届いたコードを経路に戻して表示する部品
   管理コンソールから使います。
   flow.js を先に読み込んでから mountCodeCheck(要素) を呼んでください。

   **この処理を他のページに書き写さないこと。**
   片方だけ直して食い違う事故を防ぐため、見た目も処理もこのファイルにまとめています。

   このファイル名は推測しやすく、誰でも中身を読めます。
   管理ページのファイル名は書かないでください（コメントも含む）。
   ============================================================ */
(function(global){
'use strict';

/* 差し込む CSS はすべて .codecheck の下に入れ子で書く。
   素の要素名（input / button / h2 / ol）で書くと、読み込んだページの
   他の部分まで巻き込んで見た目が崩れるため。 */
var CSS = [
  '.codecheck{--cc-ink:#1d1d1f;--cc-sub:#6e6e73;--cc-line:#e5e5ea;--cc-fill:#f5f5f7;',
  '  --cc-accent:#0071e3;--cc-ng:#c7500f;color:var(--cc-ink);}',
  '.codecheck .field{display:flex;gap:8px;}',
  '.codecheck input{flex:1;font-family:ui-monospace,SFMono-Regular,Menlo,monospace;font-size:19px;',
  '  letter-spacing:.08em;padding:13px 15px;border:1px solid var(--cc-line);border-radius:12px;',
  '  background:var(--cc-fill);color:var(--cc-ink);text-transform:uppercase;min-width:0;}',
  '.codecheck input:focus{outline:2px solid var(--cc-accent);outline-offset:1px;background:#fff;}',
  '.codecheck button{font-family:inherit;font-size:15px;cursor:pointer;border-radius:12px;border:0;',
  '  background:var(--cc-accent);color:#fff;padding:13px 22px;}',
  '.codecheck .out{margin-top:26px;}',
  '.codecheck .out:empty{margin-top:0;}',
  '.codecheck .err{background:#fdf6f1;border-left:3px solid var(--cc-ng);border-radius:0 10px 10px 0;',
  '  padding:14px 16px;font-size:14.5px;}',
  '.codecheck .meta{display:flex;flex-wrap:wrap;gap:8px;margin:0 0 20px;}',
  '.codecheck .chip{background:var(--cc-fill);border-radius:999px;padding:6px 13px;font-size:12.5px;color:var(--cc-sub);}',
  '.codecheck h2{font-size:13px;font-weight:600;color:var(--cc-sub);letter-spacing:.04em;margin:24px 0 12px;}',
  '.codecheck ol{list-style:none;counter-reset:s;margin:0;padding:0;}',
  '.codecheck ol li{counter-increment:s;position:relative;padding:0 0 18px 38px;}',
  '.codecheck ol li::before{content:counter(s);position:absolute;left:0;top:2px;width:24px;height:24px;',
  '  border-radius:50%;background:var(--cc-ink);color:#fff;font-size:12px;font-weight:600;',
  '  display:flex;align-items:center;justify-content:center;}',
  '.codecheck ol li:not(:last-child)::after{content:"";position:absolute;left:11.5px;top:30px;bottom:4px;',
  '  width:1px;background:var(--cc-line);}',
  '.codecheck ol .lb{font-size:15.5px;margin:0;}',
  '.codecheck ol .id{font-family:ui-monospace,Menlo,monospace;font-size:11.5px;color:#a1a1a6;margin:2px 0 0;}',
  '.codecheck .final{background:var(--cc-fill);border-radius:14px;padding:16px 18px;margin-top:4px;}',
  '.codecheck .final .t{font-size:16px;font-weight:600;margin:0 0 4px;}',
  '.codecheck .final a{color:var(--cc-accent);font-size:14px;text-decoration:none;}',
  '.codecheck .back{color:var(--cc-ng);font-size:12px;font-weight:600;margin-left:6px;}'
].join('\n');

var styled = false;
function injectStyle(doc){
  if (styled) return;
  styled = true;
  var s = doc.createElement('style');
  s.textContent = CSS;
  doc.head.appendChild(s);
}

function esc(s){ return String(s).replace(/[&<>"]/g, function(c){
  return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]; }); }

function renderPath(r){
  var html = '<div class="meta">';
  html += '<span class="chip">フロー改訂 ' + esc(r.version) + '</span>';
  if (r.version !== FLOW_VERSION) {
    html += '<span class="chip" style="color:#c7500f">現在は改訂 ' + esc(FLOW_VERSION) + '：当時の文言と異なります</span>';
  }
  html += '<span class="chip">経路 ' + r.segs.length + ' ステップ</span>';
  html += '</div>';

  if (!r.segs.length) { return html + '<div class="err">' + esc(r.note) + '</div>'; }

  html += '<h2>購入者が選んだ内容（最終経路）</h2><ol>';
  r.trail.forEach(function(s){
    html += '<li><p class="lb">' + esc(s.label) + '</p><p class="id">' + esc(s.id) +
            (s.idx === 9 ? '（関連リンク・直接リンク経由）' : '') + '</p></li>';
  });
  html += '</ol>';

  var lastId = r.segs[r.segs.length-1];
  var last = NODES[lastId];
  html += '<h2>最後に開いたページ</h2><div class="final">';
  html += '<p class="t">' + esc(last.title) + '</p>';
  html += '<a href="index.html' + buildHash(r.segs, false) + '" target="_blank" rel="noopener">同じ画面を開く →</a>';
  html += '</div>';
  return html;
}

function renderJourney(j){
  var html = '<h2>たどった道のり（全行程・戻りや寄り道も含む）</h2><ol>';
  j.steps.forEach(function(s){
    html += '<li><p class="lb">' + esc(s.title) +
            (s.back ? '<span class="back">↩ この画面へ戻った</span>' : '') +
            '</p><p class="id">' + esc(s.id) + '</p></li>';
  });
  html += '</ol>';
  return html;
}

/* 入力窓・確認ボタン・結果欄を el の中に組み立てて、動くようにする */
global.mountCodeCheck = function(el){
  if (!el) return;
  var doc = el.ownerDocument;
  injectStyle(doc);
  el.classList.add('codecheck');
  el.innerHTML =
    '<div class="field">' +
      '<input placeholder="TS-112D-U" autocomplete="off" autocapitalize="characters" spellcheck="false">' +
      '<button type="button">確認</button>' +
    '</div>' +
    '<div class="out"></div>';

  var input = el.querySelector('input');
  var btn   = el.querySelector('button');
  var out   = el.querySelector('.out');

  function render(){
    var up = (input.value || '').toUpperCase();

    /* まず購入者向けの結合コード（TS-…）を試す。分解できれば経路＋全行程を表示 */
    var cm0 = up.match(/TS[-0-9A-Z]+/);
    if (cm0) {
      var full = decodeFullCode(cm0[0]);
      if (full.ok) {
        out.innerHTML =
          renderPath({ ok:true, version:full.version, segs:full.path.segs, trail:full.path.trail, note:'' }) +
          renderJourney({ ok:true, steps:full.journey.steps });
        return;
      }
    }

    /* 旧形式（エラーコード TS- ／履歴コード TSH- が分離）フォールバック */
    var jm = up.match(/TSH[-0-9A-Z]+/);
    var journeyCode = jm ? jm[0] : null;
    var rest = journeyCode ? up.replace(journeyCode, ' ') : up;
    var cm = rest.match(/TS[-0-9A-Z]+/);
    var errCode = cm ? cm[0] : null;

    if (!errCode && !journeyCode) {
      out.innerHTML = '<div class="err">コードを入力してください</div>';
      return;
    }

    var html = '';
    if (errCode) {
      var r = decodeCode(errCode);
      html += r.ok ? renderPath(r) : '<div class="err">エラーコード：' + esc(r.reason) + '</div>';
    }
    if (journeyCode) {
      var j = decodeJourneyCode(journeyCode);
      html += j.ok ? renderJourney(j) : '<div class="err">履歴コード：' + esc(j.reason) + '</div>';
    }
    out.innerHTML = html;
  }

  btn.addEventListener('click', render);
  input.addEventListener('keydown', function(e){ if (e.key === 'Enter') render(); });
};

})(window);
