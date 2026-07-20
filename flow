/* ============================================================
   flow.js — 診断フローの定義とエラーコードの変換
   index.html（購入者向け）と admin.html（確認用）の両方から
   読み込まれます。分岐を編集するときはこのファイルだけを直します。
   ============================================================ */
(function(global){
'use strict';

/* ============================================================
   診断フロー定義
   type:'question' … 質問画面
   type:'answer'   … 対処法画面（steps / variants / image / note）
   type:'pending'  … 原稿準備中のプレースホルダ
   画像は images/ に配置。未配置のあいだは自動で仮ボックスを表示。
   ============================================================ */
const NODES = {

  /* ---------- 製品選択 ---------- */
  start: {
    type:'question',
    title:'製品を選んでください',
    hint:'お困りの製品はどちらですか。',
    product:true,
    options:[
      { label:'AirPods', sub:'すべてのモデル', next:'ap.menu' },
      { label:'Apple Watch', sub:'すべてのモデル', next:'aw.menu' },
    ],
  },

  /* ================= AirPods ================= */
  'ap.menu': {
    type:'question',
    title:'AirPods のどの症状ですか？',
    hint:'当てはまるものを選んでください。',
    options:[
      { label:'「AirPods の不一致」と表示される', sub:'「探す」アプリでの警告', next:'ap.mismatch' },
      { label:'「AirPods の設定が完了していません」と表示される', sub:'「探す」アプリでの警告', next:'a.setup' },
      { label:'AirPods のリセットを行う', sub:'機種・世代ごとの手順', next:'ap.gen' },
    ],
  },

  /* ---------- ① 不一致 ---------- */
  'ap.mismatch': {
    type:'question',
    title:'初回の接続時に、警告メッセージは表示されましたか？',
    hint:'「ほかの人の Apple ID に関連付けられた持ち物に接続しています」という内容のメッセージです。',
    options:[
      { label:'表示された', sub:'前の所有者の Apple Account に紐付いています', next:'a.owner' },
      { label:'表示されていない', sub:'接続時の不具合の可能性があります', next:'a.setup' },
    ],
  },

  'a.owner': {
    type:'answer',
    draft:true,
    eyebrow:'ご連絡が必要です',
    title:'遠隔でのリセットが必要です',
    lead:'（本文作成中）前の所有者の Apple Account に紐付いているため、遠隔でのリセットを依頼する必要がある旨をご案内します。',
    steps:[
      { text:'【本文作成中】警告メッセージの意味の説明。' },
      { text:'【本文作成中】出品者へご連絡いただく手順。' },
    ],
  },

  /* ---------- ② 設定が完了していません ---------- */
  'a.setup': {
    type:'answer',
    draft:true,
    eyebrow:'対処法',
    title:'AirPods の設定が完了していません',
    lead:'（本文作成中）「探す」アプリでこの警告が表示された場合の対処方法を記載します。',
    steps:[
      { text:'【本文作成中】対処の手順。' },
    ],
    note:'<strong>改善しない場合：</strong>AirPods のリセットへお進みください。',
    nextLink:{ label:'AirPods のリセットを行う', to:'ap.gen' },
  },

  /* ---------- ③ リセット ---------- */
  'ap.gen': {
    type:'question',
    title:'お使いの機種を選んでください',
    hint:'機種と世代によってリセットの手順が異なります。',
    options:[
      { label:'AirPods 第4世代', sub:'アクティブノイズキャンセリング非搭載モデル', next:'a.rs.ap4' },
      { label:'AirPods 第4世代', sub:'アクティブノイズキャンセリング搭載モデル', next:'a.rs.ap4anc' },
      { label:'AirPods Pro 第2世代', next:'a.rs.pro2' },
      { label:'AirPods Pro 第3世代', next:'a.rs.pro3' },
    ],
  },

  'a.rs.ap4': {
    type:'answer', draft:true,
    eyebrow:'リセットの手順',
    title:'AirPods 第4世代をリセットする',
    lead:'（本文作成中）',
    steps:[{ text:'【本文作成中】この世代のリセット手順。' }],
    nextLink:{ label:'リセットがうまくできない', to:'a.rs.fail' },
  },
  'a.rs.ap4anc': {
    type:'answer', draft:true,
    eyebrow:'リセットの手順',
    title:'AirPods 第4世代（ANC 搭載モデル）をリセットする',
    lead:'（本文作成中）',
    steps:[{ text:'【本文作成中】この世代のリセット手順。' }],
    nextLink:{ label:'リセットがうまくできない', to:'a.rs.fail' },
  },
  'a.rs.pro2': {
    type:'answer', draft:true,
    eyebrow:'リセットの手順',
    title:'AirPods Pro 第2世代をリセットする',
    lead:'（本文作成中）',
    steps:[{ text:'【本文作成中】この世代のリセット手順。' }],
    nextLink:{ label:'リセットがうまくできない', to:'a.rs.fail' },
  },
  'a.rs.pro3': {
    type:'answer', draft:true,
    eyebrow:'リセットの手順',
    title:'AirPods Pro 第3世代をリセットする',
    lead:'（本文作成中）',
    steps:[{ text:'【本文作成中】この世代のリセット手順。' }],
    nextLink:{ label:'リセットがうまくできない', to:'a.rs.fail' },
  },

  /* ---------- リセットがうまくできない（全世代共通） ---------- */
  'a.rs.fail': {
    type:'answer', draft:true,
    eyebrow:'対処法',
    title:'リセットがうまくできない場合',
    lead:'（本文作成中）全世代に共通する内容を記載し、必要に応じて世代ごとの補足を添えます。',
    steps:[{ text:'【本文作成中】共通の対処内容。' }],
  },

  /* ================= Apple Watch ================= */
  'aw.menu': {
    type:'question',
    title:'Apple Watch のどの症状ですか？',
    hint:'当てはまるものを選んでください。',
    options:[
      { label:'Apple Watch の充電ができない', next:'a.aw.charge' },
      { label:'バンドの着脱が行えない', next:'a.aw.band' },
    ],
  },

  /* 以下2つは、詳細な分岐が決まりしだい質問ノードへ差し替える想定 */
  'a.aw.charge': {
    type:'answer', draft:true,
    eyebrow:'対処法',
    title:'Apple Watch の充電ができない',
    lead:'（本文作成中）詳細な分岐は今後決定します。',
    steps:[{ text:'【本文作成中】' }],
  },
  'a.aw.band': {
    type:'answer', draft:true,
    eyebrow:'対処法',
    title:'バンドの着脱が行えない',
    lead:'（本文作成中）詳細な分岐は今後決定します。',
    steps:[{ text:'【本文作成中】' }],
  },
};

const CONTACT = 'ご購入いただいた取引メッセージよりご連絡ください。';

/* ---------- URL（ハッシュルーティング） ----------
   #/ap.menu/ap.pair/a.owner  … 選んだ順にノードIDを連ねた形
   #/a.reset_settings         … 途中の手順へ直接リンクすることも可能
   末尾に /unresolved が付くとエラーコード画面
-------------------------------------------------- */
function parseHash(){
  const raw = (location.hash || '').replace(/^#\/?/, '');
  if (!raw) return { segs:[], unres:false };
  let parts = raw.split('/').filter(Boolean);
  let unres = false;
  if (parts[parts.length-1] === 'unresolved') { unres = true; parts.pop(); }
  return { segs: parts.filter(p => NODES[p]), unres: unres };   // 不正なIDは捨てる
}
function buildHash(segs, unres){
  return '#/' + (unres ? segs.concat(['unresolved']) : segs).join('/');
}
/* ノードIDの並びから、経路トレイル（表示名・選択肢番号）を復元する */
function deriveTrail(segs){
  const trail = [];
  let prev = 'start';
  segs.forEach(function(id){
    const p = NODES[prev];
    let label = null, idx = 9;   // 9 = 関連リンク・直接リンク経由
    if (p && p.options) {
      const i = p.options.findIndex(o => o.next === id);
      if (i >= 0) {
        const o = p.options[i];
        label = o.label;
        /* 同じ表示名の選択肢が複数ある場合（例：第4世代の2機種）は補足を添える */
        if (o.sub && p.options.filter(x => x.label === o.label).length > 1) {
          label = o.label + '（' + o.sub + '）';
        }
        idx = i;
      }
    }
    trail.push({ label: label || NODES[id].title, id:id, idx:idx });
    prev = id;
  });
  return trail;
}

/* ---------- ノード固定キー（永続・再利用禁止） ----------
   ここで割り当てた文字は、そのノードを削除しても他へ回さないこと。
   過去に発行されたコードの意味が変わってしまうためです。
   使用可能文字：0-9 A-Z（紛れやすい I L O U は除外）
--------------------------------------------------------- */
const KEYS = {
  'ap.menu'     : '1',
  'ap.mismatch' : '2',
  'ap.gen'      : '3',
  'aw.menu'     : '4',
  'a.owner'     : 'A',
  'a.setup'     : 'B',
  'a.rs.ap4'    : 'C',
  'a.rs.ap4anc' : 'D',
  'a.rs.pro2'   : 'E',
  'a.rs.pro3'   : 'F',
  'a.rs.fail'   : 'G',
  'a.aw.charge' : 'H',
  'a.aw.band'   : 'J',
};
const KEY_TO_ID = Object.keys(KEYS).reduce(function(m,id){ m[KEYS[id]] = id; return m; }, {});

/* フロー改訂番号。文言や手順を大きく変えたときだけ上げる。
   経路の意味はキーで保たれるため、通常は上げる必要はありません。 */
const FLOW_VERSION = '1';

/* 検査文字。読み間違いやすい I L O U を除いた32文字を使用 */
const CS_ALPHA = '0123456789ABCDEFGHJKMNPQRSTVWXYZ';
function checksum(str){
  let sum = 0;
  for (let i=0;i<str.length;i++) sum = (sum * 31 + str.charCodeAt(i)) % 32;
  return CS_ALPHA[sum];
}

/* 経路 → エラーコード（同じ経路なら常に同じコードになります） */
function makeCode(path){
  const body = path.map(function(s){ return KEYS[s.id] || 'X'; }).join('');
  const core = FLOW_VERSION + (body || '0');
  return 'TS-' + core + '-' + checksum(core);
}

/* エラーコード → 経路（管理者側で使用） */
function decodeCode(input){
  const raw = String(input || '').toUpperCase().replace(/[^0-9A-Z]/g, '');
  const m = raw.match(/^TS(.+)$/);
  if (!m) return { ok:false, reason:'形式が違います（TS- から始まるコードを入力してください）' };
  const rest = m[1];
  if (rest.length < 2) return { ok:false, reason:'コードが短すぎます' };
  const core  = rest.slice(0, -1);
  const check = rest.slice(-1);
  if (checksum(core) !== check) return { ok:false, reason:'コードが正しくありません（入力ミスの可能性があります）' };
  const version = core[0];
  const body = core.slice(1);
  if (body === '0') return { ok:true, version:version, segs:[], trail:[], note:'トップ画面のまま送信されています' };
  const segs = [];
  for (const ch of body) {
    if (!KEY_TO_ID[ch]) return { ok:false, reason:'未知のノードが含まれています（コード：' + ch + '）' };
    segs.push(KEY_TO_ID[ch]);
  }
  return { ok:true, version:version, segs:segs, trail:deriveTrail(segs) };
}


  global.NODES       = NODES;
  global.CONTACT     = CONTACT;
  global.KEYS        = KEYS;
  global.FLOW_VERSION= FLOW_VERSION;
  global.parseHash   = parseHash;
  global.buildHash   = buildHash;
  global.deriveTrail = deriveTrail;
  global.makeCode    = makeCode;
  global.decodeCode  = decodeCode;
})(window);

