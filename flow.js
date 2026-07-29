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
    title:'製品を選んでください',
    hint:'モデルごとに詳しくご案内いたします。',
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
    hint:'具体的な解決策をご案内いたします。',
    options:[
      { label:'デバイスを探すが使えない', next:'ap.findmy' },
      { label:'リセットの手順を確認したい', next:'ap.gen' },
      { label:'その他の不具合', next:'ap.other' },
    ],
  },

  /* その他の不具合（問診フォーム。UIは index.html の Form コンポーネント） */
  'ap.other': {
    type:'form',
    title:'その他の不具合',
    lead:'現在の状況を正確に把握することで、適切な解決策をご案内いたします。発生している不具合の症状や、不具合を確認したタイミング、発生条件等を可能な限り詳しくご入力ください。',
    resetLink:'ap.gen',
  },

  /* ---------- 探すアプリが正常に使えない（A〜D 振り分け） ---------- */
  'ap.findmy': {
    type:'question',
    title:'エラー内容を選んでください',
    hint:'「デバイスを探す」アプリ内に表示されている警告文から現在の状況を把握することで、適切な解決策をご案内いたします。',
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
    title:'ペアリング時の状況を選んでください',
    hint:'AirPods を iPhone にペアリングした際の状況を把握することで、適切な解決策をご案内いたします。',
    options:[
      { label:'表示された', next:'a.owner' },
      { label:'表示されていない', next:'a.mismatch2' },
    ],
  },

  'a.owner': {
    type:'answer',
    title:'Apple ID が正常に解除できていない可能性があります',
    lead:'ほかの人の Apple Account と紐付いている場合、初回接続時に警告メッセージが表示されます。',
    steps:[
      { text:'現在の状態では、お手元での解除ができません。ページ下部の「解決しない」を選択して表示される案内に従ってください。' },
    ],
  },

  'a.mismatch2': {
    type:'answer',
    eyebrow:'所要時間 約3分',
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
    eyebrow:'所要時間 約3分',
    title:'AirPods の設定が完了していません',
    lead:'この警告が表示されている場合は、設定が正しく完了できていない可能性があります。',
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
    note:'<strong>1〜7 を実行しても改善しない場合</strong><br>「AirPods の高度なトラブルシューティング」へお進みください。',
    nextLink:{ label:'AirPods の高度なトラブルシューティング', to:'a.advanced' },
  },

  /* ---------- エラーは表示されない ---------- */
  'a.noerror': {
    type:'answer',
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
    eyebrow:'所要時間 約10分',
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
    note:'<strong>症状が改善されない場合</strong><br>デバイスや AirPods の物理的な故障、もしくは AirPods の内部ソフトウェアに何らかの不具合が発生している可能性があります。<br>一部の AirPods では、特定の Apple Account にペアリングした場合のみこの現象が発生することが報告されています。<br>身近な方の力を借りられる場合は、ご自身とは別の Apple Account に AirPods をペアリングし、同じ症状が出るかを確認してください。',
  },

  /* ---------- ファームウェアをアップデートする ---------- */
  'a.firmware': {
    type:'answer',
    eyebrow:'所要時間 約10分',
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
    note:'<strong>アップデートが完了しない場合</strong><br>手順1から再度やり直してください。',
  },

  /* ================= リセット：機種選択 ================= */
  'ap.gen': {
    type:'question',
    title:'製品のモデルを選んでください',
    hint:'モデルごとの適切な手順をご案内いたします。',
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
    eyebrow:'所要時間 約3分',
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
    note:'<strong>一覧から消えない場合</strong><br>「デバイスを探す」の更新には数分かかることがあります。<br>時間が経っても表示が残る場合は、「探す」アプリを終了したあと iPhone を再起動してください。<br>それでも改善しない場合は、iPhone にペアリングを直して最初からやり直し、なお解消しなければ、お使いの機種のリセット方法を再度実行してください。',
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
  'a.aw.charge': { type:'answer', draft:true, eyebrow:'所要時間 約3分', title:'Apple Watch の充電ができない',
    lead:'（本文作成中）', steps:[{ text:'【本文作成中】' }] },
  'a.aw.band': { type:'answer', draft:true, eyebrow:'所要時間 約3分', title:'バンドの着脱が行えない',
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
    eyebrow:'所要時間 約5分',
    title:title,
    lead:'AirPods 本体をリセットします。手順1〜4で登録を解除し、手順5から本体をリセットします。',
    steps:[
      { text:'AirPods の両耳を充電ケースに収納し、蓋を閉めて30秒待ちます。' },
      { text:'接続している iPhone で設定アプリを開き、Bluetooth をタップします。',
        nav:['設定','Bluetooth'] },
      { text:'自分のデバイス一覧から AirPods の「i マーク」をタップし、「このデバイスの登録を解除」をタップしてください。' },
      { text:'自分のデバイス一覧から AirPods が削除されたことを確認したら、充電ケースの蓋を開けてください。' },
      (kind === 'button')
        ? { text:op, image:'images/reset-button.png', reset:true }
        : { text:op, reset:true, images:[
            { src:'images/reset-tap.png',   caption:'縦長タイプ' },
            { src:'images/reset-tap-2.png', caption:'横長タイプ' },
          ] },
      { text:'30秒ほど待機して再び蓋を開けると、LED ランプが白く点滅し、接続できる状態になります。' },
      { text:'接続していた iPhone で「探す」アプリを開いてください。',
        nav:['探す','デバイスを探す'] },
      { text:'接続していた AirPods が「デバイスを探す」の一覧から削除されていれば、リセットは完了です。' },
    ],
    variants:[
      { name:'オレンジ点滅のまま、エラー音が鳴る場合', text:'蓋を開けてもオレンジ色に点滅したまま「ピコン」とエラー音が鳴る場合（緑やオレンジが点灯したままの場合）は、'+opRetry+'30秒ほど待機すると、白い点滅に変わり接続できるようになります。' },
      { name:'それでも白い点滅に変わらない場合', text:'蓋を閉じて30秒ほど待機し、再び蓋を開けて、同じリセット操作をもう一度行ってください。30秒ほど待機すると、白い点滅に変わります。' },
    ],
    note:'<strong>「デバイスを探す」から消えない場合</strong><br>更新には数分かかることがあります。<br>時間が経っても表示が残る場合は「探すアプリからリセットする」を実行してください。<br><br><strong>本体のリセットがうまくいかない場合</strong><br>手順5から再度やり直してください。<br>改善しない場合は、iPhone にペアリングを直したうえで、もう一度この手順を実行してください。',
    nextLink:{ label:'探すアプリからリセットする', to:'a.findmy_reset' },
  };
}

const CONTACT = 'ご購入いただいた取引メッセージよりご連絡ください。';

/* ---------- URL（ハッシュルーティング） ----------
   #/ap.menu/ap.pair/a.owner  … 選んだ順にノードIDを連ねた形
   #/a.reset_settings         … 途中の手順へ直接リンクすることも可能
   末尾に /unresolved でエラーコード画面、/resolved で解決完了画面
-------------------------------------------------- */
function parseHash(){
  const raw = (location.hash || '').replace(/^#\/?/, '');
  if (!raw) return { segs:[], unres:false, res:false };
  let parts = raw.split('/').filter(Boolean);
  let unres = false, res = false;
  const last = parts[parts.length-1];
  if (last === 'unresolved') { unres = true; parts.pop(); }
  else if (last === 'resolved') { res = true; parts.pop(); }
  return { segs: parts.filter(p => NODES[p]), unres: unres, res: res };   // 不正なIDは捨てる
}
function buildHash(segs, unres, res){
  const suffix = unres ? ['unresolved'] : (res ? ['resolved'] : []);
  return '#/' + segs.concat(suffix).join('/');
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
  'ap.other'     : 'N',
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

/* ---------- 訪問履歴コード（そのセッションで訪れた画面を順番どおり保持） ----------
   TSH- + 改訂番号 + 各ノードのキー連結 + - + 検査文字
   ・最初の画面（製品選択／最初から）は '0' で表す
   ・同じノードが再度現れたら「その画面へ戻った」ことを示す（寄り道の判別に使う）
   ・エラーコード（TS-）は最終地点、こちら（TSH-）は道のり全体を表す
------------------------------------------------------------------- */
function journeyKey(id){ return id === 'start' ? '0' : (KEYS[id] || 'X'); }
function makeJourneyCode(ids){
  const body = (ids || []).map(journeyKey).join('');
  const core = FLOW_VERSION + (body || '0');
  return 'TSH-' + core + '-' + checksum(core);
}
function decodeJourneyCode(input){
  const raw = String(input || '').toUpperCase().replace(/[^0-9A-Z]/g, '');
  const m = raw.match(/^TSH(.+)$/);
  if (!m) return { ok:false, reason:'形式が違います（TSH- から始まる履歴コードを入力してください）' };
  const rest = m[1];
  if (rest.length < 2) return { ok:false, reason:'コードが短すぎます' };
  const core  = rest.slice(0, -1);
  const check = rest.slice(-1);
  if (checksum(core) !== check) return { ok:false, reason:'コードが正しくありません（入力ミスの可能性があります）' };
  const version = core[0];
  const body = core.slice(1);
  const steps = [], seen = [];
  for (const ch of body) {
    if (ch === '0') { steps.push({ id:'start', title:'（最初の画面）', back:false }); seen.push('start'); continue; }
    const id = KEY_TO_ID[ch];
    if (!id) return { ok:false, reason:'未知のノードが含まれています（コード：' + ch + '）' };
    const back = seen.indexOf(id) >= 0;   // 既出＝その画面へ戻ってきた
    steps.push({ id:id, title:(NODES[id] ? NODES[id].title : id), back:back });
    seen.push(id);
  }
  return { ok:true, version:version, steps:steps, ids:steps.map(function(s){ return s.id; }) };
}

/* ---------- 購入者向け結合コード（エラーコード＋訪問履歴を1つに） ----------
   購入者には1つの不透明なコードに見え、エラーコードと訪問履歴の区別がつかない。
   内部は 'L'（CS_ALPHA に無くコード中に出ない文字）で経路部と履歴部を区切る。
   管理者側は decodeFullCode で経路と全行程に分解できる。 */
function makeFullCode(pathIds, journeyIds){
  const pathBody = (pathIds || []).map(function(id){ return KEYS[id] || 'X'; }).join('');
  const jBody = (journeyIds || []).map(journeyKey).join('');
  const core = FLOW_VERSION + pathBody + 'L' + jBody;
  return 'TS-' + core + '-' + checksum(core);
}
function decodeFullCode(input){
  const raw = String(input || '').toUpperCase().replace(/[^0-9A-Z]/g, '');
  const m = raw.match(/^TS(.+)$/);
  if (!m) return { ok:false, reason:'形式が違います' };
  const rest = m[1];
  if (rest.length < 2) return { ok:false, reason:'コードが短すぎます' };
  const core  = rest.slice(0, -1);
  const check = rest.slice(-1);
  if (checksum(core) !== check) return { ok:false, reason:'コードが正しくありません（入力ミスの可能性があります）' };
  if (core.indexOf('L') < 0) return { ok:false, reason:'結合コードではありません' };
  const version  = core[0];
  const afterVer = core.slice(1);
  const li       = afterVer.indexOf('L');
  const pathBody = afterVer.slice(0, li);
  const jBody    = afterVer.slice(li + 1);
  // 経路部
  const segs = [];
  for (const ch of pathBody) {
    const id = KEY_TO_ID[ch];
    if (!id) return { ok:false, reason:'未知の経路キー: ' + ch };
    segs.push(id);
  }
  // 履歴部
  const steps = [], seen = [];
  for (const ch of jBody) {
    if (ch === '0') { steps.push({ id:'start', title:'（最初の画面）', back:false }); seen.push('start'); continue; }
    const id = KEY_TO_ID[ch];
    if (!id) return { ok:false, reason:'未知の履歴キー: ' + ch };
    const back = seen.indexOf(id) >= 0;
    steps.push({ id:id, title:(NODES[id] ? NODES[id].title : id), back:back });
    seen.push(id);
  }
  return { ok:true, version:version,
    path:{ segs:segs, trail:deriveTrail(segs) },
    journey:{ steps:steps } };
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
  global.makeJourneyCode   = makeJourneyCode;
  global.decodeJourneyCode = decodeJourneyCode;
  global.makeFullCode      = makeFullCode;
  global.decodeFullCode    = decodeFullCode;
})(window);
