/* ============================================================
   flow.js — 診断フローの定義とエラーコードの変換
   購入者向けページと、管理側のコード確認の両方から読み込まれます。
   分岐を編集するときはこのファイルだけを直します。

   **このファイルは購入者のブラウザが必ず取得します。**
   誰でも中身を読めるので、管理ページのファイル名など、
   購入者に知られたくないことは書かないでください（コメントも含む）。
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
      { label:'AirPods', next:'ap.menu', image:'images/product-airpods.webp' },
      { label:'Apple Watch', next:'aw.menu', image:'images/product-apple-watch.png' },
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
      { label:'Apple Accountが解除されていない', next:'ap.mismatch' },
      { label:'その他の不具合', next:'ap.other' },
    ],
  },

  /* その他の不具合（問診フォーム。UIは index.html の Form コンポーネント）
     tried / phSymptom / phCondition は製品ごとに異なる文言。
     以前は Form 側に直接書かれていたが、Apple Watch 版（aw.other）を足すにあたり
     ノード側へ移した。表示内容は移設前と同一。 */
  'ap.other': {
    type:'form',
    title:'その他の不具合',
    lead:'現在の状況を正確に把握することで、適切な解決策をご案内いたします。発生している不具合の症状や、不具合を確認したタイミング、発生条件等を可能な限り詳しくご入力ください。',
    resetLink:'ap.gen',
    tried:[
      'AirPods の OS バージョンアップデート',
      'AirPods の接続解除／再接続',
      'AirPods のリセット（初期化を伴う再ペアリング）',
      'iPhone（ペアリング端末）の OS バージョンアップデート',
      'iPhone（ペアリング端末）の再起動',
    ],
    phSymptom:'例：装着時にノイズが聴こえる。通話で使用した際、相手に声が届いていない。など',
    phCondition:'例：外部音取込み機能をONにした時。室内では問題ないが、屋外で通話をした時だけ声を拾わない。など',
  },

  /* ---------- 探すアプリが正常に使えない（A〜D 振り分け） ---------- */
  'ap.findmy': {
    type:'question',
    title:'エラー内容を選んでください',
    hint:'「デバイスを探す」アプリ内に表示されている警告文から現在の状況を把握することで、適切な解決策をご案内いたします。',
    options:[
      { label:'AirPods の設定が完了していません', sub:'一部の機能が使用できません', icon:'warn', next:'a.setup' },
      { label:'AirPods の不一致', sub:'一部のパーツが見つかりません', icon:'alert', next:'ap.mismatch' },
      /* 上2つのアイコンを並べると個別の警告と紛らわしいため、アイコンは付けない
         （下の「いずれのエラーも表示されない」と同じ見た目にそろえる） */
      { label:'両方とも表示される', sub:'いずれの表示が同時、もしくは入れ違いで出ている', next:'ap.mismatch' },
      { label:'いずれのエラーも表示されない', sub:'エラー表示がない', next:'a.noerror' },
    ],
  },


  /* ---------- 不一致（はい/いいえ） ---------- */
  'ap.mismatch': {
    type:'question',
    title:'ペアリング時の状況を選んでください',
    hint:'AirPods を iPhone にペアリングした際の状況を把握することで、適切な解決策をご案内いたします。',
    /* image … ノード直下の画像。steps[].image（Figure 経由）と違い
       SHOW_IMAGES の影響を受けず常に表示される。
       imageNarrow … 幅いっぱいだと大きすぎるので、本文幅の75%に抑える */
    image:'images/dialog-owner-warning.webp',
    imageNarrow:true,
    options:[
      { label:'表示された', next:'a.owner' },
      { label:'表示されていない', next:'a.mismatch2' },
    ],
  },

  'a.owner': {
    type:'answer',
    title:'Apple Accountの解除が正しく反映されていない可能性があります',
    lead:'ほかの人の Apple Account と関連付けされている場合、もしくはネットワークの接続状況によっては、解除済みであっても初回のペアリング時に限り、警告メッセージが表示される場合があります。',
    steps:[
      { text:'リセットの手順を確認したいをもとに、AirPods本体をリセットしてください。', after:'リセットを行うことで、Apple Accountが最新の情報に更新されます。' },
      { text:'リセットが完了したら、再度ペアリングを行なってください。', after:'接続時に警告メッセージが表示されない場合は、正常に処理が完了しています。' },
      { text:'AirPods本体のリセットを行なっても警告メッセージが表示される場合、現在の状態では、お手元での解除ができません。', after:'ページ下部の「解決しない」を選択して表示される案内に従ってください。' },
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
      { pic:['images/ss-settings-top.webp', 'images/ss-settings-general.webp'], text:'一部の AirPods の「探す」機能は、ペアリングしている iPhone のソフトウェアが最新バージョンのときのみ動作します。最新バージョンの iOS がインストールされていることを確認してください。', image:'images/setup-incomplete-detail.png', caption:'「探す」アプリに表示される設定未完了',
        nav:['設定','一般','ソフトウェアアップデート'] },
      { pic:['images/ss-settings-top.webp', 'images/ss-apple-account.webp', 'images/ss-signin-security.webp', 'images/ss-two-factor.webp'], text:'Apple Account の2ファクタ認証が有効になっているかを確認してください。', image:'images/two-factor.png', caption:'設定 → アカウント名 → サインインとセキュリティ → 2ファクタ認証',
        nav:['設定','アカウント名','サインインとセキュリティ','2ファクタ認証'] },
      { pic:['images/ss-settings-top.webp', 'images/ss-apple-account.webp', 'images/ss-icloud.webp', 'images/ss-keychain-on.webp'], text:'iCloud キーチェーンが有効になっているかを確認してください。', image:'images/icloud-keychain.png', caption:'iCloud → パスワード → パスワードとキーチェーン',
        nav:['設定','アカウント名','iCloud','パスワード'] },
      { text:'1〜3 の設定が正しく完了していることを確認し、接続している AirPods の本体を両耳とも充電ケースへ収納し、蓋を閉じた状態で有線ケーブルによる充電を行ってください。' },
      { text:'ペアリングしている iPhone を、AirPods から 1m 以内の場所に置いて、数分待機してください。' },
      { text:'再度、AirPods の充電ケースの蓋を開けたまま、ペアリングしている iPhone で「探す」アプリを開いて、症状が改善しているかを確認してください。',
        nav:['探す','デバイスを探す'] },
    ],
    note:'<strong>1〜6 を実行しても改善しない場合</strong><br>「AirPods の高度なトラブルシューティング」へお進みください。',
    nextLink:{ label:'AirPods の高度なトラブルシューティング', to:'a.advanced' },
  },

  /* ---------- エラーは表示されない ---------- */
  'a.noerror': {
    type:'answer',
    title:'エラーが表示されない場合',
    lead:'「デバイスを探す」でいずれのエラーも表示されない場合は、製品の設定や仕様、ソフトウェアや通信環境を起因とする問題の可能性があります。',
    steps:[
      { text:'「その他の不具合」を選択して表示される案内に従ってください。' },
    ],
    nextLink:{ label:'その他の不具合', to:'ap.other' },
  },

  /* ---------- 高度なトラブルシューティング ---------- */
  'a.advanced': {
    type:'answer',
    eyebrow:'所要時間 約10分',
    title:'AirPods の高度なトラブルシューティング',
    lead:'AirPods の設定が完了できない原因として、Apple Account や「探す」ネットワーク、iPhone 側の接続エラーが考えられます。以下の手順に従って実行してください。',
    steps:[
      { text:'AirPods の本体を両耳とも充電ケースへ収納し、充電ケースの蓋を閉じてください。' },
      { pic:'images/ss-settings-top.webp', text:'ペアリングしている iPhone で設定アプリを開き、Bluetooth をタップしてください。', image:'images/bluetooth-airpods.png', caption:'設定 → Bluetooth（自分のデバイス一覧）',
        nav:['設定','Bluetooth'] },
      { pic:'images/ss-bluetooth.webp', text:'自分のデバイス一覧に表示されている、ペアリング済みの AirPods の {info} をタップしてください。' },
      { pic:'images/ss-airpods-info-unpair.webp', text:'AirPods のページ最下部にある「このデバイスの登録を解除」をタップしてください。', image:'images/airpods-info.png', caption:'AirPods 情報ページ最下部の「このデバイスの登録を解除」' },
      /* 「削除されていること」を示す手順なので、一覧から AirPods が消えた画像を使う。
         同じ「デバイスを探す」でも a.findmy_reset 手順2 は AirPods をこの後タップするため別の画像。 */
      { pic:'images/ss-findmy-devices-removed.webp', text:'ペアリングしている iPhone で「探す」アプリを開いて、「デバイスを探す」の一覧からペアリング済みの AirPods が削除されていることを確認してください。', image:'images/findmy-devices-list.png', caption:'「デバイスを探す」の一覧',
        nav:['探す','デバイスを探す'] },
      { pic:'images/ss-settings-faceid-row.webp', text:'設定アプリを開き、「Face ID とパスコード」をタップしてください。', image:'images/faceid-passcode-list.png', caption:'設定 → Face ID とパスコード',
        nav:['設定','Face ID とパスコード'] },
      { pic:'images/ss-faceid.webp', text:'「盗難デバイスの保護」をタップしてください。',
        nav:['Face ID とパスコード','盗難デバイスの保護'] },
      { pic:'images/ss-theft-off.webp', text:'盗難デバイスの保護がオンになっている場合は、この設定をオフにしてください。', image:'images/theft-protection-on.png', caption:'盗難デバイスの保護（オンの状態）' },
      { pic:'images/ss-settings-top.webp', text:'設定アプリのトップ画面に戻り、ページ最上部に表示されるご自身のアカウント名をタップしてください。' },
      { pic:'images/ss-apple-account.webp', text:'Apple Account ページの「探す」をタップしてください。',
        nav:['設定','アカウント名','探す'] },
      { pic:['images/ss-find-settings.webp', 'images/ss-find-iphone-off.webp'], text:'「iPhone を探す」をタップし、オンになっている場合はオフにしてください。', image:'images/find-iphone-off.png', caption:'「iPhone を探す」をオフにした状態',
        nav:['探す','iPhone を探す'] },
      { pic:['images/ss-apple-account.webp', 'images/ss-icloud.webp'], text:'Apple Account ページへ戻り、iCloud をタップしてください。',
        nav:['設定','アカウント名','iCloud'] },
      { pic:'images/ss-keychain-off.webp', text:'「パスワード」をタップし、「パスワードとキーチェーン」の「この iPhone を同期」がオンになっている場合は、オフにしてください。', image:'images/icloud-keychain.png', caption:'iCloud → パスワード → パスワードとキーチェーン',
        nav:['iCloud','パスワード'] },
      { text:'1〜13 の設定を保持したまま、iPhone を再起動させてください。', image:'images/power-off.png', caption:'スライドで電源オフ' },
      { text:'iPhone を再起動したら、設定アプリを開いてください。' },
      { pic:'images/ss-settings-top.webp', text:'ページ最上部に表示されるご自身のアカウント名をタップしてください。',
        nav:['設定','アカウント名'] },
      { pic:'images/ss-apple-account.webp', text:'Apple Account ページの「探す」をタップしてください。',
        nav:['設定','アカウント名','探す'] },
      { pic:'images/ss-find-iphone-on.webp', text:'「iPhone を探す」をタップしてオンにしてください。「探すネットワーク」がオフのままの場合は、オンにしてください。', image:'images/find-iphone-all-on.png', caption:'「iPhone を探す」「探すネットワーク」をオン' },
      { pic:['images/ss-apple-account.webp', 'images/ss-icloud.webp'], text:'Apple Account ページへ戻り、iCloud をタップしてください。',
        nav:['設定','アカウント名','iCloud'] },
      { pic:'images/ss-keychain-on.webp', text:'「パスワード」をタップして、「パスワードとキーチェーン」の「この iPhone を同期」をオンにしてください。',
        nav:['iCloud','パスワード'] },
      { text:'お使いの機種のリセット方法の手順（本体リセット以降）を実行し、AirPods 本体のリセットを完了させてください。',
        linkTo:'ap.gen', linkLabel:'機種を選んでリセット手順を見る' },
      { text:'再び AirPods と iPhone をペアリングしてください。' },
      { text:'設定アプリを開いてください。' },
      { pic:['images/ss-settings-top.webp', 'images/ss-bluetooth.webp'], text:'Bluetooth をタップし、自分のデバイス一覧に AirPods が表示されていることを確認してください。', image:'images/bluetooth-airpods.png', caption:'設定 → Bluetooth',
        nav:['設定','Bluetooth'] },
      { text:'自分のデバイス一覧に表示されている、ペアリング済みの AirPods の {info} をタップしてください。' },
      { pic:'images/ss-airpods.webp', text:'AirPods の設定画面の中ほどにある「バッテリー」をタップしてください。', image:'images/airpods-battery.png', caption:'AirPods → バッテリー（充電の最適化）',
        nav:['AirPods','バッテリー'] },
      { pic:'images/ss-airpods-battery.webp', text:'バッテリー充電の最適化がオフになっている場合は、オンに変更してください。' },
      { pic:'images/ss-airpods-info.webp', text:'ページを一つ戻り、AirPods ページの最下部にある情報から「バージョン」をタップしてください。', image:'images/airpods-info.png', caption:'AirPods 情報 → バージョン', image:'images/airpods-info.png', caption:'AirPods 情報 → バージョン' },
      { text:'バージョンページに表示されているファームウェアが最新であることを確認してください。',
        after:'「ファームウェアの詳細はこちら」から、デバイスごとの最新ファームウェアバージョンを確認できます。バージョンが最新ではない場合は、「AirPods のファームウェアをアップデートする」を実行してください。',
        linkTo:'a.firmware', linkLabel:'AirPods のファームウェアをアップデートする' },
      { text:'1〜29 の操作を実行して、症状が改善されたかを確認してください。' },
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
      { pic:['images/ss-settings-top.webp', 'images/ss-settings-general.webp'], text:'iPhone の設定アプリを開き、「一般」から「ソフトウェアアップデート」をタップしてください。ソフトウェアが最新ではない場合は、アップデートを行ってください。', image:'images/settings-general.png', caption:'設定 → 一般 → ソフトウェアアップデート',
        nav:['設定','一般','ソフトウェアアップデート'] },
      { pic:'images/ss-ios-uptodate.webp', text:'iPhone の iOS が最新版であることを確認し、Wi-Fi に接続してください。' },
      { text:'接続している AirPods の本体を両耳とも充電ケースに収納し、有線ケーブルで充電してください。' },
      { text:'AirPods の充電ケースの蓋を閉じたまま、ペアリングしている iPhone の Bluetooth の通信範囲内に置いておいてください。' },
      { text:'この状態で、ファームウェアがアップデートされるのを待機してください。',
        after:'アップデートには30分以上かかる場合があります。' },
      { text:'AirPods の充電ケースの蓋を開け、ペアリングしている iPhone と接続した状態にしてください。' },
      { pic:['images/ss-settings-top.webp', 'images/ss-bluetooth.webp'], text:'iPhone の設定アプリを開き、Bluetooth をタップして、自分のデバイス一覧に AirPods が表示されていることを確認してください。', image:'images/bluetooth-airpods.png', caption:'設定 → Bluetooth',
        nav:['設定','Bluetooth'] },
      { text:'自分のデバイス一覧に表示されている、ペアリング済みの AirPods の {info} をタップしてください。' },
      { pic:'images/ss-airpods-version.webp', text:'AirPods ページの最下部にある情報から「バージョン」をタップしてください。',
        nav:['AirPods','情報','バージョン'] },
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
      { label:'AirPods 第4世代', sub:'アクティブノイズキャンセリング搭載モデル', next:'a.rs.tap.anc' },
      { label:'AirPods Pro 第2世代', next:'a.rs.button' },
      { label:'AirPods Pro 第3世代', next:'a.rs.pro3' },
    ],
  },

  /* リセット手順の4ページ。本文はすべて RESET() から作られ、違うのは
     操作方法（kind）と手順5に出す充電ケースの画像だけ。
     **4ページとも見出しが「AirPods をリセットする」で同じなので、
     編集するときはタイトル文字列ではなく必ずこの ID で指定すること。**
     第4世代は kind だけが違う2ページ。'a.rs.tap' が非搭載モデルなのは、
     ページを分ける前のコード（KEY 'G'）の意味を変えないため。 */
  'a.rs.tap':     RESET('tap.mute', 'images/airpods4-case-led.webp'),      // 第4世代（ノイキャン非搭載）
  'a.rs.tap.anc': RESET('tap',      'images/airpods4-case-led.webp'),      // 第4世代（ノイキャン搭載）
  'a.rs.pro3':    RESET('tap',      'images/airpods-pro3-case-led.webp'),  // AirPods Pro 第3世代
  'a.rs.button':  RESET('button',   'images/airpods-pro2-case-button.webp'), // AirPods Pro 第2世代

  /* ---------- 探すアプリからリセットする（共通・末端の受け皿） ---------- */
  'a.findmy_reset': {
    type:'answer',
    eyebrow:'所要時間 約3分',
    title:'探すアプリからリセットする',
    lead:'本体リセットだけでは「デバイスを探す」から削除されない場合に、この手順で解除します。',
    steps:[
      { text:'接続している AirPods（もしくは、解除済みだが連携が残っている AirPods）の本体を両耳とも充電ケースへ収納し、充電ケースの蓋を開けてください。' },
      { pic:'images/ss-findmy-devices.webp', text:'充電ケースの蓋を開けたまま、「探す」アプリを開いてください。',
        nav:['探す','デバイスを探す'] },
      { pic:'images/ss-findmy-airpods.webp', text:'「デバイスを探す」の一覧から、削除したい AirPods のアイコンをタップしてください。', image:'images/findmy-map-airpods.png', caption:'「デバイスを探す」→ AirPods' },
      { text:'「解除」をタップしてください。次の画面でも「解除」をタップしてください。', pic:'images/ss-findmy-airpods-remove.webp', image:'images/airpods-remove-findmy.png', caption:'AirPods → 解除' },
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
      { label:'その他の不具合', next:'aw.other' },
    ],
  },

  /* Apple Watch 版「その他の不具合」。AirPods 版（ap.other）と同じ構成で、
     選択肢と例文だけを Apple Watch 向けに置き換えている。
     Apple Watch にはリセット手順のページが無いため resetLink は持たせない
     （「まだ試していない」を選んでも手順へのリンクは表示されない）。 */
  'aw.other': {
    type:'form',
    title:'その他の不具合',
    lead:'現在の状況を正確に把握することで、適切な解決策をご案内いたします。発生している不具合の症状や、不具合を確認したタイミング、発生条件等を可能な限り詳しくご入力ください。',
    tried:[
      'Apple Watch の OS バージョンアップデート',
      'Apple Watch の再起動',
      'Apple Watch の接続解除／再接続',
      'Apple Watch のリセット（初期化を伴う再ペアリング）',
      'iPhone（ペアリング端末）の OS バージョンアップデート',
      'iPhone（ペアリング端末）の再起動',
    ],
    phSymptom:'例：画面が反応しない。心拍数が計測できない。など',
    phCondition:'例：運動中に使用した時。室内では問題ないが、屋外で使用した時だけ計測が止まる。など',
  },
  /* ---------- 充電ができない：症状の切り分け ----------
     ID は 'a.' 始まりだが type は question。
     もともと対処法ページだったノードを入口の質問へ差し替えたもので、
     KEYS の 'K'（発行済みコードの意味）を保つため ID は変更していない。 */
  'a.aw.charge': {
    type:'question',
    title:'現在の状況を選んでください',
    hint:'サイドボタンを長押しした際の症状を把握することで、適切な解決策をご案内いたします。',
    options:[
      { label:'電源が入らない',                                 next:'a.aw.voltage' },
      { label:'電源は入るが充電がされず、初期設定が行えない',     next:'aw.screen' },
      { label:'電源が入り初期設定までは完了したが充電がされない', next:'a.aw.verify' },
    ],
  },

  'aw.screen': {
    type:'question',
    title:'画面の表示内容を選んでください',
    hint:'状態アイコンを把握することで、適切な解決策をご案内いたします。',
    /* image … 選択肢の文字の前に出す小さな画像。製品選択（start）と同じ仕組み。
       画面に出るアイコンそのものを載せて、文字だけより見分けやすくする。 */
    options:[
      { label:'赤い稲妻アイコンが表示される',       image:'images/aw-icon-bolt.webp',  next:'a.aw.batt.bolt' },
      { label:'充電ケーブルのアイコンが表示される', image:'images/aw-icon-cable.webp', next:'a.aw.batt.none' },
      { label:'何も表示されない',                  next:'a.aw.batt.none' },
    ],
  },

  'a.aw.voltage': {
    type:'answer',
    eyebrow:'所要時間 約30分',
    title:'本体の内部電圧が低下している可能性があります',
    lead:'内部電圧が低下すると、保護回路が働くことがあります。これは、本体が正常に動作していることの証でもあります。',
    steps:[
      { text:'Apple Watchに内蔵されているリチウムイオンバッテリーは、低温に弱い特性があります。人肌程度の温度を維持することで電力が回復しやすくなります。' },
      { text:'内部電圧が回復するまでには、時間がかかる場合があります。充電器へ接続後は、最低でも30分以上は時間をおいてください。' },
      { text:'画面に赤い稲妻アイコンが表示されたら、最低でも2時間以上は充電し続けてください。' },
      { text:'それでもApple Watchが起動しない場合（画面にアイコンが表示されない）は、こちらを実行してください。',
        linkTo:'a.aw.verify', linkLabel:'原因の検証が必要です' },
    ],
  },

  'a.aw.verify': {
    type:'answer',
    eyebrow:'所要時間 約10分',
    title:'原因の検証が必要です',
    lead:'すぐに実行できる解決策と、原因を確認する手順をご案内いたします。',
    steps:[
      { text:'Apple Watchの背面、充電ケーブルの接触面に指紋や汚れが残らないように綺麗に拭き取ってください。' },
      { text:'充電ケーブルを安定した場所に置き、ケーブルを伸ばした状態にしてください。' },
      { text:'充電ケーブルに接続しているACアダプタを、別の製品（5W以上）に交換してください。パソコンなどの機器から給電を行なっている場合は、ACアダプタを利用しコンセントから直接給電してください。' },
      { text:'お部屋にある別のコンセントで充電を行なってください。' },
      { text:'それでもApple Watchが充電されない場合は、強制的に再起動します。サイドボタンとDigital Crownの両方を10秒以上、またはAppleロゴが表示されるまで長押ししてください。' },
    ],
  },

  /* 赤い稲妻アイコン用。'a.aw.batt.none' とタイトル・リードが同一で手順1だけが異なる。
     title でのアンカーが効かないため、編集するときは ID で特定すること。 */
  'a.aw.batt.bolt': {
    type:'answer',
    eyebrow:'所要時間 約2時間',
    title:'起動に必要なバッテリーが不足しています',
    lead:'Apple Watchの起動、ペアリングには充電ケーブルに接続した状態、もしくはバッテリー残量が50%以上残っている必要があります。',
    /* images … ノード直下の画像（複数）。画面上のアイコンの見え方を小さく横並びで示す。
       丸で囲まれた表示と囲まれていない表示の両方があるため2枚並べる。 */
    images:[
      { src:'images/aw-charge-bolt-circle.png' },
      { src:'images/aw-charge-bolt.png' },
    ],
    steps:[
      { text:'画面に赤い稲妻アイコンが表示されたら、最低でも2時間以上は充電し続けてください。' },
      { text:'起動、ペアリングに必要な充電が蓄積されると、接続手順を案内するアニメーションが表示されます。' },
      { text:'アニメーションが表示されても、充電ケーブルから本体を離さないでください。' },
      { text:'充電を行なっているにも関わらず、Apple Watchが起動しない場合（画面にアイコンが表示されない）は、こちらを実行してください。',
        linkTo:'a.aw.verify', linkLabel:'原因の検証が必要です' },
    ],
  },

  /* 充電ケーブルのアイコン／何も表示されない 用。上の 'a.aw.batt.bolt' と対になる。 */
  'a.aw.batt.none': {
    type:'answer',
    eyebrow:'所要時間 約30分',
    title:'起動に必要なバッテリーが不足しています',
    lead:'Apple Watchの起動、ペアリングには充電ケーブルに接続した状態、もしくはバッテリー残量が50%以上残っている必要があります。',
    images:[
      { src:'images/aw-charge-cable.png' },
    ],
    steps:[
      { text:'サイドボタンを押しても画面に何も表示されない場合や、充電ケーブルのアイコンが表示される場合は、最低でも30分以上は充電し続けてください。' },
      { text:'起動、ペアリングに必要な充電が蓄積されると、接続手順を案内するアニメーションが表示されます。' },
      { text:'アニメーションが表示されても、充電ケーブルから本体を離さないでください。' },
      { text:'充電を行なっているにも関わらず、Apple Watchが起動しない場合（画面にアイコンが表示されない）は、こちらを実行してください。',
        linkTo:'a.aw.verify', linkLabel:'原因の検証が必要です' },
    ],
  },

  /* イラストが用意できたため、原稿どおりの書き方（矢印とボタンを文中に置く形）に戻している。
     {arrow} {btn} は StepList が小さな図形に置き換えるしるし。 */
  'a.aw.band': {
    type:'answer',
    eyebrow:'所要時間 約3分',
    title:'バンドの着脱が行えない',
    lead:'バンドの取り付け・取り外しは、力を加えず、ゆっくりとスライドさせるのが基本です。',
    image:'images/band-replace.jpg',
    steps:[
      { text:'バンドを取り付けるときは力を加えず、ゆっくりと {arrow} の方向にスライドしてください。' },
      { text:'バンドを取り付けることができないときは、もう一度正しい向きかを確認してください。' },
      { text:'取り外すときは {btn} を押し込みながら力を加えず、ゆっくりと {arrow} の方向にスライドしてください。' },
      { text:'取り外すことができないときは {btn} が奥まで沈み込んでいるかを確認してください。' },
      { text:'イラストの向きで着脱ができない場合は、反対方向から同じ方法で再度試してください。' },
    ],
  },
};

/* ---------- リセット手順のテンプレート ----------
   本体リセット操作（手順5）だけが機種で異なるため、共通化する。
   kind:'tap'      … LED ランプを3回連続でダブルタップ
   kind:'tap.mute' … 同上。ただしスピーカー非搭載モデル用で、通知音の記述を省く
   kind:'button'   … 背面の設定ボタンを15秒押し続ける
--------------------------------------------------- */
function RESET(kind, pic){
  /* ノイズキャンセリング非搭載モデルはスピーカーを内蔵しておらず、
     「プップップ」「ピコン」といった通知音が鳴らないため文言から外す */
  const mute = (kind === 'tap.mute');
  const op = (kind === 'button')
    ? '充電ケースの蓋を開けたまま、充電ケース背面にある「設定ボタン」を15秒ほど押し続けてください。オレンジ色に点滅し「プップップ」と音が鳴ったら、設定ボタンから指を離して充電ケースの蓋を閉じてください。'
    : mute
      ? '充電ケースの蓋を開けたまま、充電ケース正面の LED ランプを3回連続でダブルタップしてください。オレンジ色に点滅したら、充電ケースの蓋を閉じてください。'
      : '充電ケースの蓋を開けたまま、充電ケース正面の LED ランプを3回連続でダブルタップしてください。オレンジ色に点滅し「プップップ」と音が鳴ったら、充電ケースの蓋を閉じてください。';
  const opRetry = (kind === 'button')
    ? 'その状態で、充電ケース背面にある「設定ボタン」を15秒ほど押し続けてください。'
    : 'その状態で、ダブルタップを1回行ってください。';
  const vName = mute ? 'オレンジ点滅のままになる場合' : 'オレンジ点滅のまま、エラー音が鳴る場合';
  const vHead = mute
    ? '蓋を開けてもオレンジ色に点滅したままの場合（緑やオレンジが点灯したままの場合）は、'
    : '蓋を開けてもオレンジ色に点滅したまま「ピコン」とエラー音が鳴る場合（緑やオレンジが点灯したままの場合）は、';
  return {
    type:'answer',
    eyebrow:'所要時間 約5分',
    /* 見出しは3ページ共通。機種名は選択肢のラベル（＝パンくず）で分かるため入れない */
    title:'AirPods をリセットする',
    lead:'AirPods 本体をリセットします。手順1〜4で登録を解除し、手順5から本体をリセットします。',
    steps:[
      { text:'AirPods の両耳を充電ケースに収納し、蓋を閉めて30秒待ちます。' },
      { text:'接続している iPhone で設定アプリを開き、Bluetooth をタップします。',
        nav:['設定','Bluetooth'] },
      { pic:['images/ss-settings-top.webp', 'images/ss-bluetooth.webp'], text:'自分のデバイス一覧から AirPods の {info} をタップし、「このデバイスの登録を解除」をタップしてください。',
        nav:['設定','Bluetooth','AirPods'] },
      { text:'自分のデバイス一覧から AirPods が削除されたことを確認したら、充電ケースの蓋を開けてください。' },
      /* pic … SHOW_IMAGES の影響を受けない手順内画像。機種ごとの充電ケースを示す。
         既存の image / images は原稿準備中の手順画像で、SHOW_IMAGES で一括非表示のまま残す。 */
      (kind === 'button')
        ? { text:op, pic:pic, image:'images/reset-button.png', reset:true }
        : { text:op, pic:pic, reset:true, images:[
            { src:'images/reset-tap.png',   caption:'縦長タイプ' },
            { src:'images/reset-tap-2.png', caption:'横長タイプ' },
          ] },
      { text:'30秒ほど待機して再び蓋を開けると、LED ランプが白く点滅し、接続できる状態になります。' },
      /* 次の手順8で「一覧から削除されていれば完了」と続くため、AirPods が消えた一覧を出す */
      { pic:'images/ss-findmy-devices-removed.webp', text:'接続していた iPhone で「探す」アプリを開いてください。',
        nav:['探す','デバイスを探す'] },
      { text:'接続していた AirPods が「デバイスを探す」の一覧から削除されていれば、リセットは完了です。' },
    ],
    variants:[
      { name:vName, text:vHead+opRetry+'30秒ほど待機すると、白い点滅に変わり接続できるようになります。' },
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
   さらに次の3文字も使わないこと。
     0 … 履歴コードで start を表す予約文字
     L … 結合コードで経路部と履歴部を区切る文字
     X … makeCode の `KEYS[s.id] || 'X'` フォールバック用。
          正規のキーにすると KEYS の登録漏れが検出できなくなる
   次に使える文字：Z / 6 7 8 9
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
  'aw.screen'    : 'P',
  'a.aw.voltage' : 'Q',
  'a.aw.verify'  : 'R',
  'a.aw.batt.bolt':'S',
  'a.aw.batt.none':'T',
  'aw.other'     : 'V',
  'a.rs.pro3'    : 'W',
  /* 第4世代をノイキャン搭載／非搭載に分けたときの新設ノード。
     'a.rs.tap'（'G'）は非搭載側として残したので、搭載側に新しい文字を割り当てている。 */
  'a.rs.tap.anc' : 'Y',
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
