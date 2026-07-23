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
   画像は images/ に配置。未配置のあいだ自動で仮ボックスを表示。
   ============================================================ */
const NODES = {

  /* ---------- 製品選択 ---------- */
  start: {
    type:'question',
    title:'お困りの製品を選んでください',
    hint:'当てはまるものを選んでください。',
    product:true,
    options:[
      { label:'AirPods', sub:'すべてのモデル', next:'ap.menu' },
      { label:'Apple Watch', sub:'すべてのモデル', next:'aw.menu' },
    ],
  },

  /* ================= AirPods 入口 ================= */
  'ap.menu': {
    type:'question',
    title:'症状を選んでください',
    hint:'当てはまるものを選んでください。',
    options:[
      { label:'「デバイスを探す」が使えない', next:'ap.findmy' },
    ],
  },

  /* ---------- 探すアプリが正常に使えない（A〜D 振り分け） ---------- */
  'ap.findmy': {
    type:'question',
    title:'「デバイスを探す」を開いてください',
    hint:'エラー表示の内容を選んでください。',
    options:[
      { label:'AirPods の設定が完了していません', sub:'一部の機能が使用できません', icon:'warn', next:'a.setup' },
      { label:'AirPods の不一致', sub:'一部のパーツが見つかりません', icon:'alert', next:'ap.mismatch' },
      { label:'両方とも表示される', sub:'いずれの表示が同時、もしくは入れ違いで出ている', next:'ap.mismatch' },
      { label:'いずれのエラーも表示されない', sub:'エラー表示がない', next:'a.noerror' },
    ],
  },


  /* ---------- 不一致（はい/いいえ） ---------- */
  'ap.mismatch': {
    type:'question',
    title:'AirPods を iPhone にペアリングした際に、警告メッセージは表示されましたか？',
    hint:'「ほかの人の Apple ID に関連付けられた持ち物に接続しています」という内容のメッセージです。',
    options:[
      { label:'表示された', sub:'前の所有者の Apple Account に紐付いています', next:'a.owner' },
      { label:'表示されていない', sub:'接続時の不具合の可能性があります', next:'a.mismatch2' },
    ],
  },

  'a.owner': {
    type:'answer',
    eyebrow:'ご連絡が必要です',
    title:'ほかの人の Apple ID に関連付けられています',
    lead:'ほかの人の Apple Account と紐付いている場合、初回接続時に警告メッセージが表示されます。',
    steps:[
      { text:'表示された警告メッセージの内容をご確認ください。', image:'images/owner-warning.png', caption:'「ほかの人の Apple ID に関連付けられた持ち物に接続しています」' },
      { text:'この場合、表示されているアカウントの持ち主に、遠隔での Apple ID の関連付け解除を依頼する必要があります。', image:'images/airpods-remove-account.png', caption:'前の所有者側での解除画面' },
    ],
    callout:'お手元での解除はできません。ご購入いただいた取引メッセージより、警告が表示された旨をご連絡ください。こちらで対応いたします。',
  },

  'a.mismatch2': {
    type:'answer',
    eyebrow:'対処法',
    title:'警告メッセージが表示されない場合',
    lead:'AirPods を iPhone にペアリングした初回接続時に警告メッセージが表示されない場合は、OS の不具合や iPhone 側の設定によって、初回の接続に失敗している可能性があります。',
    steps:[
      { text:'「AirPods の設定が完了していません」の手順を実行してください。' },
    ],
    nextLink:{ label:'AirPods の設定が完了していません', to:'a.setup' },
  },

  /* ---------- 設定が完了していません ---------- */
  'a.setup': {
    type:'answer',
    eyebrow:'対処法',
    title:'AirPods の設定が完了していません',
    lead:'接続しペアリングしている iPhone の「デバイスを探す」の一覧で、この警告が表示されている場合は、設定が正しく完了できていない可能性があります。',
    steps:[
      { text:'一部の AirPods の「探す」機能は、ペアリングしている iPhone のソフトウェアが最新バージョンのときのみ動作します。最新バージョンの iOS がインストールされていることを確認してください。', image:'images/setup-incomplete-detail.png', caption:'「探す」アプリに表示される設定未完了',
        nav:['設定','一般','ソフトウェアアップデート'] },
      { text:'ペアリングしている iPhone の「探す」アプリの設定が、正しく完了しているかを確認してください。' },
      { text:'Apple Account の2ファクタ認証が有効になっているかを確認してください。', image:'images/two-factor.png', caption:'設定 → アカウント名 → サインインとセキュリティ → 2ファクタ認証' },
      { text:'iCloud キーチェーンが有効になっているかを確認してください。', image:'images/icloud-keychain.png', caption:'iCloud → パスワード → パスワードとキーチェーン' },
      { text:'1〜4 の設定が正しく完了していることを確認し、接続している AirPods の本体を両耳とも充電ケースへ収納し、蓋を閉じた状態で有線ケーブルによる充電を行ってください。' },
      { text:'ペアリングしている iPhone を、AirPods から 1m 以内の場所に置いて、数分待機してください。' },
      { text:'再度、AirPods の充電ケースの蓋を開けたまま、ペアリングしている iPhone で「探す」アプリを開いて、症状が改善しているかを確認してください。',
        nav:['探す','デバイスを探す'] },
    ],
    note:'<strong>1〜7 を実行しても改善しない場合：</strong>「AirPods の高度なトラブルシューティング」へお進みください。',
    nextLink:{ label:'AirPods の高度なトラブルシューティング', to:'a.advanced' },
  },

  /* ---------- エラーは表示されない ---------- */
  'a.noerror': {
    type:'answer',
    eyebrow:'ご連絡が必要です',
    title:'エラーが表示されない場合',
    lead:'「デバイスを探す」でいずれのエラーも表示されない場合について、ご案内します。',
    steps:[
      { text:'現在発生している不具合の症状について、出品者へ取引メッセージよりご連絡ください。' },
    ],
    callout:'症状の内容をできるだけ詳しくお知らせいただくと、スムーズに対応できます。',
  },

  /* ---------- 高度なトラブルシューティング ---------- */
  'a.advanced': {
    type:'answer',
    eyebrow:'対処法',
    title:'AirPods の高度なトラブルシューティング',
    lead:'AirPods の設定が完了できない原因として、Apple Account や「探す」ネットワーク、iPhone 側の接続エラーが考えられます。以下の手順に従って実行してください。',
    steps:[
      { text:'AirPods の本体を両耳とも充電ケースへ収納し、充電ケースの蓋を閉じてください。' },
      { text:'ペアリングしている iPhone で設定アプリを開き、Bluetooth をタップしてください。', image:'images/bluetooth-airpods.png', caption:'設定 → Bluetooth（自分のデバイス一覧）',
        nav:['設定','Bluetooth'] },
      { text:'自分のデバイス一覧に表示されている、ペアリング済みの AirPods の「i マーク」をタップしてください。' },
      { text:'AirPods のページ最下部にある「このデバイスの登録を解除」をタップしてください。', image:'images/airpods-info.png', caption:'AirPods 情報ページ最下部の「このデバイスの登録を解除」' },
      { text:'Bluetooth の自分のデバイス一覧から、ペアリング済みの AirPods が削除されていることを確認してください。' },
      { text:'ペアリングしている iPhone で「探す」アプリを開いて、「デバイスを探す」の一覧からペアリング済みの AirPods が削除されていることを確認してください。', image:'images/findmy-devices-list.png', caption:'「デバイスを探す」の一覧',
        nav:['探す','デバイスを探す'] },
      { text:'設定アプリを開き、「Face ID とパスコード」をタップしてください。', image:'images/faceid-passcode-list.png', caption:'設定 → Face ID とパスコード',
        nav:['設定','Face ID とパスコード'] },
      { text:'「盗難デバイスの保護」をタップしてください。' },
      { text:'盗難デバイスの保護がオンになっている場合は、この設定をオフにしてください。', image:'images/theft-protection-on.png', caption:'盗難デバイスの保護（オンの状態）' },
      { text:'設定アプリのトップ画面に戻り、ページ最上部に表示されるご自身のアカウント名をタップしてください。' },
      { text:'Apple Account ページの「探す」をタップしてください。',
        nav:['設定','アカウント名','探す'] },
      { text:'「iPhone を探す」をタップし、オンになっている場合はオフにしてください。', image:'images/find-iphone-off.png', caption:'「iPhone を探す」をオフにした状態' },
      { text:'Apple Account ページへ戻り、iCloud をタップしてください。',
        nav:['設定','アカウント名','iCloud'] },
      { text:'「パスワード」をタップし、「パスワードとキーチェーン」の「この iPhone を同期」がオンになっている場合は、オフにしてください。', image:'images/icloud-keychain.png', caption:'iCloud → パスワード → パスワードとキーチェーン',
        nav:['iCloud','パスワード'] },
      { text:'1〜14 の設定を保持したまま、iPhone を再起動させてください。', image:'images/power-off.png', caption:'スライドで電源オフ' },
      { text:'iPhone を再起動したら、設定アプリを開いてください。' },
      { text:'ページ最上部に表示されるご自身のアカウント名をタップしてください。' },
      { text:'Apple Account ページの「探す」をタップしてください。',
        nav:['設定','アカウント名','探す'] },
      { text:'「iPhone を探す」をタップしてオンにしてください。「探すネットワーク」がオフのままの場合は、オンにしてください。', image:'images/find-iphone-all-on.png', caption:'「iPhone を探す」「探すネットワーク」をオン' },
      { text:'Apple Account ページへ戻り、iCloud をタップしてください。',
        nav:['設定','アカウント名','iCloud'] },
      { text:'「パスワード」をタップして、「パスワードとキーチェーン」の「この iPhone を同期」をオンにしてください。',
        nav:['iCloud','パスワード'] },
      { text:'お使いの機種のリセット方法の手順（本体リセット以降）を実行し、AirPods 本体のリセットを完了させてください。',
        linkTo:'ap.gen', linkLabel:'機種を選んでリセット手順を見る' },
      { text:'再び AirPods と iPhone をペアリングしてください。' },
      { text:'設定アプリを開いてください。' },
      { text:'Bluetooth をタップし、自分のデバイス一覧に AirPods が表示されていることを確認してください。', image:'images/bluetooth-airpods.png', caption:'設定 → Bluetooth',
        nav:['設定','Bluetooth'] },
      { text:'自分のデバイス一覧に表示されている、ペアリング済みの AirPods の「i マーク」をタップしてください。' },
      { text:'AirPods の設定画面の中ほどにある「バッテリー」をタップしてください。', image:'images/airpods-battery.png', caption:'AirPods → バッテリー（充電の最適化）' },
      { text:'バッテリー充電の最適化がオフになっている場合は、オンに変更してください。' },
      { text:'ページを一つ戻り、AirPods ページの最下部にある情報から「バージョン」をタップしてください。', image:'images/airpods-info.png', caption:'AirPods 情報 → バージョン', image:'images/airpods-info.png', caption:'AirPods 情報 → バージョン' },
      { text:'バージョンページに表示されているファームウェアが最新であることを確認してください。',
        after:'「ファームウェアの詳細はこちら」から、デバイスごとの最新ファームウェアバージョンを確認できます。バージョンが最新ではない場合は、「AirPods のファームウェアをアップデートする」を実行してください。',
        linkTo:'a.firmware', linkLabel:'AirPods のファームウェアをアップデートする' },
      { text:'1〜30 の操作を実行して、症状が改善されたかを確認してください。' },
    ],
    note:'<strong>症状が改善されない場合：</strong>デバイスや AirPods の物理的な故障、もしくは AirPods の内部ソフトウェアに何らかの不具合が発生している可能性があります。一部の AirPods では、特定の Apple Account にペアリングした場合のみこの現象が発生することが報告されています。身近な方の力を借りられる場合は、ご自身とは別の Apple Account に AirPods をペアリングし、同じ症状が出るかを確認してください。',
  },

  /* ---------- ファームウェアをアップデートする ---------- */
  'a.firmware': {
    type:'answer',
    eyebrow:'手順',
    title:'AirPods のファームウェアをアップデートする',
    lead:'ファームウェアは、AirPods を iPhone に接続した状態で自動的に更新されます。',
    steps:[
      { text:'iPhone の設定アプリを開き、「一般」から「ソフトウェアアップデート」をタップしてください。ソフトウェアが最新ではない場合は、アップデートを行ってください。', image:'images/settings-general.png', caption:'設定 → 一般 → ソフトウェアアップデート',
        nav:['設定','一般','ソフトウェアアップデート'] },
      { text:'iPhone の iOS が最新版であることを確認し、Wi-Fi に接続してください。' },
      { text:'接続している AirPods の本体を両耳とも充電ケースに収納し、有線ケーブルで充電してください。' },
      { text:'AirPods の充電ケースの蓋を閉じたまま、ペアリングしている iPhone の Bluetooth の通信範囲内に置いておいてください。' },
      { text:'この状態で、ファームウェアがアップデートされるのを待機してください。',
        after:'アップデートには30分以上かかる場合があります。' },
      { text:'AirPods の充電ケースの蓋を開け、ペアリングしている iPhone と接続した状態にしてください。' },
      { text:'iPhone の設定アプリを開き、Bluetooth をタップして、自分のデバイス一覧に AirPods が表示されていることを確認してください。', image:'images/bluetooth-airpods.png', caption:'設定 → Bluetooth',
        nav:['設定','Bluetooth'] },
      { text:'自分のデバイス一覧に表示されている、ペアリング済みの AirPods の「i マーク」をタップしてください。' },
      { text:'AirPods ページの最下部にある情報から「バージョン」をタップしてください。' },
      { text:'バージョンページに表示されているファームウェアが最新版になっていれば、完了です。' },
    ],
    note:'<strong>アップデートが完了しない場合：</strong>手順1から再度やり直してください。',
  },

  /* ================= リセット：機種選択 ================= */
  'ap.gen': {
    type:'question',
    title:'お使いの機種を選んでください',
    hint:'機種によって、本体をリセットする操作が異なります。',
    options:[
      { label:'AirPods 第4世代', sub:'アクティブノイズキャンセリング非搭載モデル', next:'a.rs.tap' },
      { label:'AirPods 第4世代', sub:'アクティブノイズキャンセリング搭載モデル', next:'a.rs.tap' },
      { label:'AirPods Pro 第2世代', next:'a.rs.button' },
      { label:'AirPods Pro 第3世代', next:'a.rs.tap' },
    ],
  },

  'a.rs.tap':    RESET('tap'),
  'a.rs.button': RESET('button'),

  /* ---------- 探すアプリからリセットする（共通・末端の受け皿） ---------- */
  'a.findmy_reset': {
    type:'answer',
    eyebrow:'手順',
    title:'探すアプリからリセットする',
    lead:'本体リセットだけでは「デバイスを探す」から削除されない場合に、この手順で解除します。',
    steps:[
      { text:'接続している AirPods（もしくは、解除済みだが連携が残っている AirPods）の本体を両耳とも充電ケースへ収納し、充電ケースの蓋を開けてください。' },
      { text:'充電ケースの蓋を開けたまま、「探す」アプリを開いてください。',
        nav:['探す','デバイスを探す'] },
      { text:'「デバイスを探す」の一覧から、削除したい AirPods のアイコンをタップしてください。', image:'images/findmy-map-airpods.png', caption:'「デバイスを探す」→ AirPods' },
      { text:'設定ページの最下部に表示される「このデバイスを削除」をタップしてください。', image:'images/airpods-remove-findmy.png', caption:'AirPods → 解除' },
      { text:'充電ケースの蓋を閉じて30秒ほど待機すると、「デバイスを探す」の一覧から AirPods が削除されます。' },
    ],
    note:'<strong>一覧から消えない場合：</strong>「デバイスを探す」の更新には数分かかることがあります。時間が経っても表示が残る場合は、「探す」アプリを終了したあと iPhone を再起動してください。それでも改善しない場合は、iPhone にペアリングを直して最初からやり直し、なお解消しなければ、お使いの機種のリセット方法を再度実行してください。',
    nextLink:{ label:'機種を選んでリセット手順を見る', to:'ap.gen' },
  },

  /* ================= Apple Watch（土台） ================= */
  'aw.menu': {
    type:'question',
    title:'Apple Watch のどの症状ですか？',
    hint:'当てはまるものを選んでください。',
    options:[
      { label:'Apple Watch の充電ができない', next:'a.aw.charge' },
      { label:'バンドの着脱が行えない', next:'a.aw.band' },
    ],
  },
  'a.aw.charge': { type:'answer', draft:true, eyebrow:'対処法', title:'Apple Watch の充電ができない',
    lead:'（本文作成中）', steps:[{ text:'【本文作成中】' }] },
  'a.aw.band': { type:'answer', draft:true, eyebrow:'対処法', title:'バンドの着脱が行えない',
    lead:'（本文作成中）', steps:[{ text:'【本文作成中】' }] },
};

/* ---------- リセット手順のテンプレート ----------
   本体リセット操作（手順5）だけが機種で異なるため、共通化する。
   kind:'tap'    … LED ランプを3回連続でダブルタップ
   kind:'button' … 背面の設定ボタンを15秒押し続ける
--------------------------------------------------- */
function RESET(kind){
  const op = (kind === 'button')
    ? '充電ケースの蓋を開けたまま、充電ケース背面にある「設定ボタン」を15秒ほど押し続けてください。オレンジ色に点滅し「プップップ」と音が鳴ったら、設定ボタンから指を離して充電ケースの蓋を閉じてください。'
    : '充電ケースの蓋を開けたまま、充電ケース正面の LED ランプを3回連続でダブルタップしてください。オレンジ色に点滅し「プップップ」と音が鳴ったら、充電ケースの蓋を閉じてください。';
  const opRetry = (kind === 'button')
    ? 'その状態で、充電ケース背面にある「設定ボタン」を15秒ほど押し続けてください。'
    : 'その状態で、ダブルタップを1回行ってください。';
  const title = (kind === 'button')
    ? 'AirPods Pro 第2世代をリセットする'
    : 'AirPods をリセットする';

  return {
    type:'answer',
    eyebrow:'リセットの手順',
    title:title,
    lead:'AirPods 本体をリセットします。手順1〜4で登録を解除し、手順5から本体をリセットします。',
    steps:[
      { text:'AirPods の両耳を充電ケースに収納し、蓋を閉めて30秒待ちます。' },
      { text:'接続している iPhone で設定アプリを開き、Bluetooth をタップします。',
        nav:['設定','Bluetooth'] },
      { text:'自分のデバイス一覧から AirPods の「i マーク」をタップし、「このデバイスの登録を解除」をタップしてください。' },
      { text:'自分のデバイス一覧から AirPods が削除されたことを確認したら、充電ケースの蓋を開けてください。' },
      { text:op, image:(kind==='button'?'images/reset-button.png':'images/reset-tap.png'), reset:true },
      { text:'30秒ほど待機して再び蓋を開けると、LED ランプが白く点滅し、接続できる状態になります。' },
      { text:'接続していた iPhone で「探す」アプリを開いてください。',
        nav:['探す','デバイスを探す'] },
      { text:'接続していた AirPods が「デバイスを探す」の一覧から削除されていれば、リセットは完了です。' },
    ],
    variants:[
      { name:'オレンジ点滅のまま、エラー音が鳴る場合', text:'蓋を開けてもオレンジ色に点滅したまま「ピコン」とエラー音が鳴る場合（緑やオレンジが点灯したままの場合）は、'+opRetry+'30秒ほど待機すると、白い点滅に変わり接続できるようになります。' },
      { name:'それでも白い点滅に変わらない場合', text:'蓋を閉じて30秒ほど待機し、再び蓋を開けて、同じリセット操作をもう一度行ってください。30秒ほど待機すると、白い点滅に変わります。' },
    ],
    note:'<strong>「デバイスを探す」から消えない場合：</strong>更新には数分かかることがあります。時間が経っても表示が残る場合は「探すアプリからリセットする」を実行してください。<br><strong>本体のリセットがうまくいかない場合：</strong>手順5から再度やり直してください。改善しない場合は、iPhone にペアリングを直したうえで、もう一度この手順を実行してください。',
    nextLink:{ label:'探すアプリからリセットする', to:'a.findmy_reset' },
  };
}

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
  'ap.menu'      : '1',
  'ap.findmy'    : '2',
  'ap.mismatch'  : '3',
  'ap.gen'       : '4',
  'aw.menu'      : '5',
  'a.setup'      : 'A',
  'a.owner'      : 'B',
  'a.mismatch2'  : 'C',
  'a.noerror'    : 'D',
  'a.advanced'   : 'E',
  'a.firmware'   : 'F',
  'a.rs.tap'     : 'G',
  'a.rs.button'  : 'H',
  'a.findmy_reset':'J',
  'a.aw.charge'  : 'K',
  'a.aw.band'    : 'M',
};const KEY_TO_ID = Object.keys(KEYS).reduce(function(m,id){ m[KEYS[id]] = id; return m; }, {});

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
