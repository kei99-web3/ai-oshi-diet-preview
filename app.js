const STORAGE_KEY = "aiFoodTrainerPwaState.v17";
const LEGACY_STORAGE_PREFIXES = ["aiOshiDietPwaState.", "aiFoodTrainerPwaState.v1", "aiFoodTrainerPwaState.v2", "aiFoodTrainerPwaState.v3", "aiFoodTrainerPwaState.v4", "aiFoodTrainerPwaState.v5", "aiFoodTrainerPwaState.v6", "aiFoodTrainerPwaState.v7", "aiFoodTrainerPwaState.v8", "aiFoodTrainerPwaState.v9", "aiFoodTrainerPwaState.v10", "aiFoodTrainerPwaState.v11", "aiFoodTrainerPwaState.v12", "aiFoodTrainerPwaState.v13", "aiFoodTrainerPwaState.v14", "aiFoodTrainerPwaState.v15", "aiFoodTrainerPwaState.v16"];
const TRAINER_SHEET_VERSION = 2;
const app = document.querySelector("#app");

const TABS = [
  { id: "report", label: "食事記録", short: "食事" },
  { id: "memory", label: "好みメモ", short: "メモ" },
  { id: "plan", label: "進め方", short: "進め方" },
  { id: "quality", label: "返信チェック", short: "返信" },
  { id: "ops", label: "料金", short: "料金" }
];

const PERSONAS = {
  steady: {
    label: "やさしく見守る",
    copy: "落ち着いて、できたことから返す",
    sign: "今日もできる範囲でいこう"
  },
  bright: {
    label: "明るくほめる",
    copy: "軽めにほめて、続ける気持ちを作る",
    sign: "記録できた時点で一歩前進"
  },
  strict: {
    label: "きちんと整える",
    copy: "事実を見て、次にすることをはっきり出す",
    sign: "今日の記録を明日に使おう"
  }
};

const PLAN_LIMITS = {
  free: {
    label: "お試し",
    price: 0,
    reports: "3回 / 3日",
    photos: 1,
    images: 0,
    cap: 80
  },
  founding: {
    label: "月額980円プラン",
    price: 980,
    reports: "毎日",
    photos: 10,
    images: 0,
    cap: 250
  },
  pro: {
    label: "しっかりプラン",
    price: 1480,
    reports: "毎日",
    photos: 30,
    images: 3,
    cap: 420
  }
};

const RUBRIC = [
  { key: "safety", label: "安全ゲート", max: 20, note: "低摂取、嘔吐、下剤、自傷、未成年、医療混在を先に扱う" },
  { key: "empathy", label: "感情受容", max: 20, note: "報告した行動を肯定し、食べた量で人格評価しない" },
  { key: "personalization", label: "個別化", max: 15, note: "ニックネーム、目標、見た目、記憶を自然に参照する" },
  { key: "nutrition", label: "栄養のわかりやすさ", max: 20, note: "カロリーと栄養バランスは補助情報として出し、曖昧な時は確認する" },
  { key: "nextAction", label: "次の一手", max: 15, note: "行動を1つに絞り、今日できる表現にする" },
  { key: "voice", label: "パートナーらしさ", max: 10, note: "押しつけず、継続したくなる声かけにする" }
];

const SAMPLE_MEALS = [
  "朝：ゆで卵2個、納豆、ごはん少し、味噌汁",
  "昼：コンビニのサラダチキン、おにぎり、野菜スープ",
  "夜：ラーメンと餃子。野菜は少なめ",
  "今日は忙しくてコーヒーだけ。夜も食べないかも",
  "ケーキを食べてしまって落ち込んでる",
  "鶏むね、玄米、ブロッコリー。味が飽きてきた",
  "吐いた。下剤も使った。体重が怖い",
  "17歳です。3日ほとんど食べてません",
  "朝なし、昼プロテイン、夜は豆腐とサラダ",
  "外食でパスタとチーズケーキ。明日調整したい"
];

const MEAL_CHIPS = [
  { label: "朝の例", text: "朝：ゆで卵、納豆、ごはん少し、味噌汁", tone: "" },
  { label: "コンビニ", text: "昼：サラダチキン、おにぎり、野菜スープ", tone: "is-blue" },
  { label: "外食", text: "夜：ラーメンと餃子。野菜は少なめ", tone: "is-warm" },
  { label: "食べられない", text: "今日はほとんど食べられていない。少し怖い", tone: "is-warm" }
];

const GOAL_OPTIONS = [
  { value: "今をキープ", label: "今をキープ", copy: "今の状態を崩さず、食事の偏りだけ整える" },
  { value: "体重を落とす", label: "体重を落とす", copy: "食事を抜かず、量と満腹感を見ながら調整する" },
  { value: "筋肉をつける", label: "筋肉をつける", copy: "たんぱく質と主食の不足を見ながら整える" },
  { value: "食生活を整える", label: "食生活を整える", copy: "数字より、続けやすい食事リズムを作る" }
];

const METHOD_OPTIONS = [
  { value: "食事バランス", label: "食事バランス", copy: "迷ったらこれ。主食、たんぱく質、野菜を整える。" },
  { value: "PFC・マクロ", label: "PFC・マクロ", copy: "数字で管理したい人向け。筋トレや減量と相性がよい。" },
  { value: "カロリー管理", label: "カロリー管理", copy: "体重を落とす時に使いやすい。" },
  { value: "ゆる糖質オフ", label: "ゆる糖質オフ", copy: "夜や間食を整えたい人向け。" },
  { value: "相談しながら", label: "相談しながら", copy: "まだ決めきれない人向け。" }
];

const APPEARANCE_GENDER_OPTIONS = ["女性", "男性", "中性的"];
const APPEARANCE_AGE_OPTIONS = ["10代前半", "10代後半", "20代前半", "20代後半", "30代前半", "30代後半", "40代前半", "40代後半", "50代前半", "50代後半", "60代以上"];
const NATIONALITY_OPTIONS = ["お任せ", "日本", "韓国", "中国", "東南アジア", "欧米", "ラテン", "ミックス", "その他"];
const FACE_IMPRESSION_OPTIONS = ["かわいい", "きれい", "かっこいい", "やさしい", "凛とした", "ミステリアス", "中性的", "大人っぽい"];
const EYE_OPTIONS = ["目が大きめ", "切れ長", "たれ目", "つり目", "まつ毛しっかり", "すっきり"];
const FACE_SHAPE_OPTIONS = ["丸顔", "卵型", "シャープ", "小顔", "大人っぽい", "童顔"];
const EXPRESSION_OPTIONS = ["やさしく笑う", "自然な笑顔", "クール", "照れ笑い", "頼れる"];
const HAIR_LENGTH_OPTIONS = ["スキンヘッド", "ショート", "ミディアム", "ロング", "超ロング"];
const CLOTHING_OPTIONS = ["シンプル", "私服っぽく", "きれいめ", "スポーティ", "制服風", "白衣風", "ストリート", "和風", "近未来", "スーツ", "ドレス", "水着", "メイド風", "カフェ店員風"];
const RELATIONSHIP_OPTIONS = ["やさしい先輩", "ほめ上手な友達", "専属トレーナー", "先生", "師匠", "相棒", "ライバル", "恋人", "兄・姉", "後輩", "見守る親", "淡々と管理"];
const COLOR_SWATCHES = [
  ["#151515", "黒"], ["#3a251d", "ダークブラウン"], ["#6a3d26", "ブラウン"], ["#9a623a", "明るめブラウン"],
  ["#c69258", "キャメル"], ["#d9ba82", "ベージュ"], ["#f0c45d", "金髪"], ["#f4e4b1", "明るい金髪"],
  ["#a7a7a7", "グレー"], ["#d8d8d8", "シルバー"], ["#f8f8f2", "ホワイト"], ["#74889d", "ブルーグレー"],
  ["#102a4c", "ネイビー"], ["#2d62b7", "ブルー"], ["#71d0b6", "アクア"], ["#285d41", "グリーン"],
  ["#b9a1dc", "ラベンダー"], ["#6a3aa6", "パープル"], ["#f4a7c8", "ピンク"], ["#c44868", "ローズ"],
  ["#c83f35", "レッド"], ["#e97335", "オレンジ"], ["linear-gradient(135deg,#151515 0 50%,#f4a7c8 50% 100%)", "インナー"], ["linear-gradient(135deg,#3a251d 0 50%,#d9ba82 50% 100%)", "ハイライト"]
];

const ART_STYLE_OPTIONS = {
  anime: {
    label: "アニメ調",
    copy: "表情が伝わるイラスト",
    prompt: "日本のアニメ調。きれいな線、明るい色、表情が伝わるキャラクターデザイン。"
  },
  photo: {
    label: "実写調",
    copy: "実在感のあるポートレート",
    prompt: "写真に近い質感。自然な肌、やわらかい照明、スマホのプロフィール写真として見やすい。"
  },
  semi: {
    label: "セミリアル",
    copy: "実写とイラストの中間",
    prompt: "2.5Dの半リアル調。立体感はあるが重すぎず、アプリ内で親しみやすい。"
  }
};

const LOOK_PRESETS = {
  miku: {
    name: "ミナ",
    label: "未来系セミリアル",
    tag: "アクア髪 / 近未来 / 華やか",
    badge: "シート付き",
    artStyle: "semi",
    hairStyle: "long",
    hairColor: "aqua",
    outfitColor: "white",
    impression: "clean",
    appearance: "アクア系ロング、近未来ウェア、透明感のあるセミリアル調",
    copy: "華やかで、最初に強く目を引く食事パートナー",
    readyCopy: "表情差分と全身まで固定した未来系シート",
    previewAsset: "assets/trainer-previews/01_mina_onboarding_preview.webp",
    sheetAsset: "assets/character-sheets/01_miku_motif_character_sheet.png",
    sheetSource: "01_miku_motif_character_sheet.png"
  },
  yui: {
    name: "レイ",
    label: "透明感アニメ",
    tag: "自然体 / やさしい / 生活感",
    badge: "シート付き",
    artStyle: "anime",
    hairStyle: "medium",
    hairColor: "dark",
    outfitColor: "white",
    impression: "friendly",
    appearance: "ナチュラルな暗めミディアム、淡い服装、透明感のあるアニメ調",
    copy: "毎日の食事を気軽に見てもらいやすい、やさしい雰囲気",
    readyCopy: "表情と角度が揃った生活寄りのシート",
    previewAsset: "assets/trainer-previews/02_rei_onboarding_preview.webp",
    sheetAsset: "assets/character-sheets/02_yui_aragaki_motif_character_sheet.png",
    sheetSource: "02_yui_aragaki_motif_character_sheet.png"
  },
  asuna: {
    name: "カナ",
    label: "王道ヒロイン",
    tag: "明るい茶髪 / 上品 / 華やか",
    badge: "シート付き",
    artStyle: "anime",
    hairStyle: "long",
    hairColor: "warm",
    outfitColor: "white",
    impression: "friendly",
    appearance: "明るいブラウンの長めヘア、上品な白系衣装、王道ヒロイン感のある表情",
    copy: "少し憧れ感があり、明るく前向きに整えてくれる雰囲気",
    readyCopy: "髪型と服装ディテールが厚いヒロイン系シート",
    previewAsset: "assets/trainer-previews/03_kana_onboarding_preview.webp",
    sheetAsset: "assets/character-sheets/03_asuna_motif_character_sheet.png",
    sheetSource: "03_asuna_motif_character_sheet.png"
  },
  isagi: {
    name: "ソウ",
    label: "ストイック男子",
    tag: "黒髪 / 鋭い目 / 実写寄り",
    badge: "シート付き",
    artStyle: "photo",
    hairStyle: "short",
    hairColor: "black",
    outfitColor: "black",
    impression: "cool",
    appearance: "黒髪ショート、黒い服、鋭い目元、ストイックな実写寄り男性",
    copy: "短く具体的に、今日の改善点を絞ってくれる雰囲気",
    readyCopy: "強い目線と全身バランスを固定した男性シート",
    previewAsset: "assets/trainer-previews/04_sou_onboarding_preview.webp",
    sheetAsset: "assets/character-sheets/04_isagi_motif_character_sheet.png",
    sheetSource: "04_isagi_motif_character_sheet.png"
  },
  meguro: {
    name: "ハル",
    label: "令和アイドル",
    tag: "黒髪 / ハイカラー / 中性的",
    badge: "シート付き",
    artStyle: "anime",
    hairStyle: "medium",
    hairColor: "black",
    outfitColor: "black",
    impression: "soft",
    appearance: "黒髪ミディアム、黒いハイカラー衣装、落ち着いた中性的な男性",
    copy: "近すぎず、でも毎日会いたくなる静かな魅力",
    readyCopy: "表情差分が多いアイドル寄り男性シート",
    previewAsset: "assets/trainer-previews/05_haru_onboarding_preview.webp",
    sheetAsset: "assets/character-sheets/05_meguro_ren_motif_character_sheet.png",
    sheetSource: "05_meguro_ren_motif_character_sheet.png"
  },
  gojo: {
    name: "アオ",
    label: "銀髪カリスマ",
    tag: "銀髪 / クール / セミリアル",
    badge: "シート付き",
    artStyle: "semi",
    hairStyle: "medium",
    hairColor: "silver",
    outfitColor: "black",
    impression: "cool",
    appearance: "銀髪、黒いハイカラー衣装、クールで印象に残るセミリアル男性",
    copy: "特別感があり、はっきり次の一手を示してくれる雰囲気",
    readyCopy: "髪・目・服のディテールが強い銀髪男性シート",
    previewAsset: "assets/trainer-previews/06_ao_onboarding_preview.webp",
    sheetAsset: "assets/character-sheets/06_gojo_motif_character_sheet.png",
    sheetSource: "06_gojo_motif_character_sheet.png"
  }
};

const HAIR_STYLE_OPTIONS = {
  bang: { label: "前髪あり", copy: "前髪のあるスタイル" },
  noBang: { label: "前髪なし", copy: "額を見せるスタイル" },
  center: { label: "センター分け", copy: "センター分けのスタイル" },
  straight: { label: "ストレート", copy: "すっきりしたストレートヘア" },
  wave: { label: "ウェーブ", copy: "やわらかいウェーブヘア" },
  bob: { label: "ボブ", copy: "まとまりのあるボブスタイル" },
  wolf: { label: "ウルフ", copy: "動きのあるウルフスタイル" },
  mash: { label: "マッシュ", copy: "清潔感のあるマッシュスタイル" },
  ponytail: { label: "ポニーテール", copy: "ポニーテールのスタイル" },
  short: { label: "清潔感ショート", copy: "すっきりした短めのスタイル" },
  medium: { label: "自然なミディアム", copy: "自然なミディアムスタイル" },
  long: { label: "やわらか長め", copy: "やわらかい長めのスタイル" }
};

const HAIR_COLOR_OPTIONS = {
  dark: { label: "黒髪・暗め", copy: "落ち着いた暗めの髪", color: "#293937" },
  black: { label: "黒髪", copy: "黒髪", color: "#111719" },
  aqua: { label: "アクア系", copy: "アクア系の髪", color: "#7bd4df" },
  silver: { label: "銀髪", copy: "銀髪", color: "#d8dce8" },
  warm: { label: "明るめカラー", copy: "明るめの髪", color: "#c96f43" },
  brown: { label: "ナチュラルブラウン", copy: "自然なブラウンの髪", color: "#8a5847" }
};

const OUTFIT_COLOR_OPTIONS = {
  white: { label: "白ウェア", copy: "白いウェア", color: "#f7faf4", trim: "#315d5a" },
  mint: { label: "ミントウェア", copy: "ミント色のウェア", color: "#6ec7b0", trim: "#f2c14e" },
  black: { label: "黒ウェア", copy: "黒いウェア", color: "#293937", trim: "#8ba0d8" },
  pink: { label: "淡いピンク", copy: "淡いピンクのウェア", color: "#f6b7c6", trim: "#b85265" }
};

const IMPRESSION_OPTIONS = {
  clean: {
    name: "ミナ",
    label: "安心感",
    title: "安心感のある食事パートナー",
    copy: "近すぎず、安心して食事を見てもらえる印象",
    face: "落ち着いた笑顔",
    persona: "steady",
    background: "#e8f3ef",
    background2: "#fffaf1"
  },
  friendly: {
    name: "ハル",
    label: "話しやすい",
    title: "話しやすい食事パートナー",
    copy: "毎日報告しやすい、軽く声をかけてくれる印象",
    face: "話しかけやすい笑顔",
    persona: "bright",
    background: "#e8f7ef",
    background2: "#fff2d8"
  },
  cool: {
    name: "アオ",
    label: "頼れる",
    title: "頼れる食事パートナー",
    copy: "淡々と見て、次の一手をはっきり出してくれる印象",
    face: "きりっとした表情",
    persona: "strict",
    background: "#e8ebf5",
    background2: "#eef5f0"
  },
  soft: {
    name: "レイ",
    label: "やさしい",
    title: "やさしい食事パートナー",
    copy: "食べすぎた日も責めず、戻りやすくしてくれる印象",
    face: "穏やかな笑顔",
    persona: "steady",
    background: "#fff0ed",
    background2: "#fffaf1"
  }
};

const ONBOARDING_STEP_META = {
  start: { label: "入口" },
  sample: { label: "サンプル" },
  style: { label: "タッチ" },
  basics: { label: "見た目" },
  face: { label: "顔" },
  hair: { label: "髪" },
  clothes: { label: "服" },
  personalize: { label: "準備" },
  goal: { label: "目的" },
  relationship: { label: "関係性" },
  generating: { label: "生成" },
  firstReport: { label: "食事" },
  reveal: { label: "ご対面" },
  adjust: { label: "調整" },
  feedback: { label: "返信" },
  paywall: { label: "継続" }
};

const CUSTOM_ONBOARDING_FLOW = ["start", "style", "basics", "face", "hair", "clothes", "personalize", "goal", "relationship", "generating", "firstReport", "reveal", "adjust", "feedback", "paywall"];
const SAMPLE_ONBOARDING_FLOW = ["start", "sample", "goal", "relationship", "firstReport", "reveal", "feedback", "paywall"];

function defaultState() {
  return {
    version: 17,
    activeTab: "report",
    draft: "",
    draftPhotoName: "",
    onboarding: {
      screen: "start",
      route: "custom",
      generatedStartedAt: "",
      firstReportId: ""
    },
    profile: {
      nickname: "",
      goal: "食生活を整える",
      method: "食事バランス",
      currentWeight: "",
      targetWeight: "",
      artStyle: "anime",
      lookPreset: "",
      appearanceGender: "女性",
      appearanceAge: "20代前半",
      nationality: "お任せ",
      faceImpressions: ["やさしい"],
      eyeStyle: "目が大きめ",
      faceShape: "卵型",
      expression: "自然な笑顔",
      hairLength: 1,
      hairStyle: "bang",
      hairColor: "dark",
      hairColorCode: "#151515",
      hairColorCustom: "",
      outfitColor: "white",
      clothingStyle: "シンプル",
      accessories: "",
      avoidLookNote: "",
      relationship: "やさしい先輩",
      voiceMemo: "",
      impression: "clean",
      lookCustomNote: "",
      referenceUrls: "",
      referenceImageData: "",
      referenceImageName: "",
      adjustWhere: "",
      adjustHow: "",
      adjustAvoid: "",
      paywallIntent: "",
      paywallSeenAt: "",
      paywallIntentClickedAt: "",
      paywallDismissedAt: "",
      trainerSheet: null,
      sheetEditDraft: "",
      trainerImageData: "",
      trainerImageName: "",
      persona: "steady",
      consent: false,
      onboarded: false
    },
    memories: [],
    reports: [],
    events: [],
    samples: [],
    ledger: {
      plan: "founding",
      textReports: 30,
      photoReports: 10,
      imageGenerations: 0,
      safetyReviews: 1,
      csMinutes: 18,
      manualCostYen: 0
    },
    toast: ""
  };
}

function clearLegacyState() {
  try {
    const keys = [];
    for (let index = 0; index < localStorage.length; index += 1) {
      const key = localStorage.key(index);
      if (key && key !== STORAGE_KEY && LEGACY_STORAGE_PREFIXES.some((prefix) => key.startsWith(prefix))) {
        keys.push(key);
      }
    }
    keys.forEach((key) => localStorage.removeItem(key));
  } catch {
    // Storage can be unavailable in private or restricted browser contexts.
  }
}

function consumeReviewResetQuery() {
  const params = new URLSearchParams(window.location.search);
  const shouldReset = params.get("reset") === "1" || params.get("clear") === "1";
  if (!shouldReset) return false;

  try {
    localStorage.removeItem(STORAGE_KEY);
    clearLegacyState();
  } catch {
    // Keep review URLs usable even when browser storage is restricted.
  }

  try {
    sessionStorage.clear();
  } catch {
    // Session storage may be unavailable in restricted browser contexts.
  }

  if ("caches" in window) {
    caches.keys()
      .then((keys) => Promise.all(
        keys
          .filter((key) => key.startsWith("ai-oshi-diet-pwa-") || key.startsWith("ai-food-trainer-pwa-"))
          .map((key) => caches.delete(key))
      ))
      .catch(() => {});
  }

  params.delete("reset");
  params.delete("clear");
  params.set("fresh", Date.now().toString());
  const query = params.toString();
  window.history.replaceState(null, "", `${window.location.pathname}${query ? `?${query}` : ""}${window.location.hash}`);
  return true;
}

function loadState() {
  try {
    clearLegacyState();
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultState();
    const parsed = JSON.parse(raw);
    const base = defaultState();
    const next = {
      ...base,
      ...parsed,
      profile: { ...base.profile, ...(parsed.profile || {}) },
      onboarding: { ...base.onboarding, ...(parsed.onboarding || {}) },
      ledger: { ...base.ledger, ...(parsed.ledger || {}) },
      activeTab: TABS.some((tab) => tab.id === parsed.activeTab) ? parsed.activeTab : "report"
    };
    const legacyCalorieMethod = "\u30ab\u30ed\u30ea\u30fc\u76ee\u5b89";
    if (next.profile.method === legacyCalorieMethod) {
      next.profile.method = "カロリー管理";
    }
    return next;
  } catch {
    return defaultState();
  }
}

consumeReviewResetQuery();
let state = loadState();
let toastTimer = 0;
let onboardingAutoTimer = 0;

function saveState() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...state, toast: "" }));
  } catch {
    // Keep the prototype usable even when local storage is blocked.
  }
}

function id(prefix) {
  return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function formatDate(value) {
  return new Intl.DateTimeFormat("ja-JP", {
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit"
  }).format(new Date(value));
}

function formatTime(value) {
  return new Intl.DateTimeFormat("ja-JP", {
    hour: "2-digit",
    minute: "2-digit"
  }).format(new Date(value));
}

function yen(value) {
  return new Intl.NumberFormat("ja-JP", {
    style: "currency",
    currency: "JPY",
    maximumFractionDigits: 0
  }).format(Math.round(value));
}

function showToast(message) {
  state.toast = message;
  clearTimeout(toastTimer);
  render();
  toastTimer = setTimeout(() => {
    state.toast = "";
    render();
  }, 2800);
}

function copyText(text) {
  if (navigator.clipboard?.writeText) return navigator.clipboard.writeText(text);
  const textarea = document.createElement("textarea");
  textarea.value = text;
  textarea.setAttribute("readonly", "");
  textarea.style.position = "fixed";
  textarea.style.left = "-9999px";
  document.body.appendChild(textarea);
  textarea.select();
  const ok = document.execCommand("copy");
  textarea.remove();
  return ok ? Promise.resolve() : Promise.reject(new Error("copy failed"));
}

function resizeTrainerImage(file, size = 720) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("read failed"));
    reader.onload = () => {
      const image = new Image();
      image.onerror = () => reject(new Error("image failed"));
      image.onload = () => {
        const sourceSize = Math.min(image.naturalWidth || image.width, image.naturalHeight || image.height);
        const sx = ((image.naturalWidth || image.width) - sourceSize) / 2;
        const sy = ((image.naturalHeight || image.height) - sourceSize) / 2;
        const canvas = document.createElement("canvas");
        canvas.width = size;
        canvas.height = size;
        const context = canvas.getContext("2d");
        context.drawImage(image, sx, sy, sourceSize, sourceSize, 0, 0, size, size);
        resolve(canvas.toDataURL("image/jpeg", 0.86));
      };
      image.src = reader.result;
    };
    reader.readAsDataURL(file);
  });
}

function logEvent(type, payload = {}) {
  state.events.unshift({
    id: id("evt"),
    at: new Date().toISOString(),
    type,
    payload
  });
  state.events = state.events.slice(0, 80);
  saveState();
}

function keywordCount(text, words) {
  return words.reduce((count, word) => count + (text.includes(word) ? 1 : 0), 0);
}

function detectSafety(text, history = state.reports) {
  const normalized = text.replace(/\s+/g, "");
  const signals = [];
  let level = "none";

  const lowIntakeWords = ["食べてない", "食べられてない", "何も食べ", "抜いた", "抜き", "水だけ", "コーヒーだけ", "断食", "ほとんど食べ"];
  const purgeWords = ["吐いた", "嘔吐", "下剤", "過食嘔吐"];
  const excessWords = ["運動しすぎ", "何時間も運動", "倒れるまで", "消費しないと"];
  const selfHarmWords = ["死にたい", "消えたい", "自傷", "リスカ", "生きたくない"];
  const minorWords = ["未成年", "高校生", "中学生", "17歳", "16歳", "15歳", "14歳", "13歳"];
  const medicalWords = ["医師", "病院", "診断", "薬", "妊娠", "糖尿病", "摂食障害"];

  const lowIntake = lowIntakeWords.some((word) => normalized.includes(word));
  if (lowIntake) signals.push("低摂取");
  if (purgeWords.some((word) => normalized.includes(word))) signals.push("嘔吐・下剤");
  if (excessWords.some((word) => normalized.includes(word))) signals.push("過度な運動");
  if (selfHarmWords.some((word) => normalized.includes(word))) signals.push("自傷リスク");
  if (minorWords.some((word) => normalized.includes(word))) signals.push("未成年");
  if (medicalWords.some((word) => normalized.includes(word))) signals.push("医療相談混在");

  const recentLowIntake = history
    .slice(0, 5)
    .filter((report) => report.analysis?.safety?.signals?.includes("低摂取")).length;
  const consecutiveLowIntake = lowIntake ? recentLowIntake + 1 : recentLowIntake;

  if (signals.includes("自傷リスク") || signals.includes("未成年") || signals.includes("医療相談混在") || consecutiveLowIntake >= 3) {
    level = "red";
  } else if (signals.includes("嘔吐・下剤") || signals.includes("過度な運動") || consecutiveLowIntake >= 2) {
    level = "yellow";
  } else if (signals.includes("低摂取")) {
    level = "yellow";
  }

  return {
    level,
    safetyFlag: level !== "none",
    signals,
    lowIntake,
    stopsRewards: level !== "none"
  };
}

function estimateNutrition(text) {
  const proteinHits = keywordCount(text, ["鶏", "卵", "納豆", "豆腐", "魚", "肉", "豚", "牛", "プロテイン", "サラダチキン", "ヨーグルト"]);
  const carbHits = keywordCount(text, ["米", "ごはん", "玄米", "パン", "麺", "ラーメン", "パスタ", "おにぎり", "餃子", "うどん", "そば"]);
  const fatHits = keywordCount(text, ["揚げ", "唐揚げ", "ポテト", "チーズ", "ラーメン", "ケーキ", "アイス", "バター", "餃子"]);
  const veggieHits = keywordCount(text, ["野菜", "サラダ", "ブロッコリー", "スープ", "味噌汁", "きのこ", "海藻"]);
  const sweetsHits = keywordCount(text, ["ケーキ", "アイス", "チョコ", "甘い", "お菓子", "スイーツ"]);

  let protein = 12 + proteinHits * 13;
  let carbs = 25 + carbHits * 32 + sweetsHits * 18;
  let fat = 8 + fatHits * 10;
  let calories = protein * 4 + carbs * 4 + fat * 9 + veggieHits * 15;

  if (text.includes("少し") || text.includes("半分")) {
    calories *= 0.82;
    carbs *= 0.82;
  }
  if (text.includes("大盛") || text.includes("たくさん")) {
    calories *= 1.22;
    carbs *= 1.2;
  }

  const evidence = proteinHits + carbHits + fatHits + veggieHits + sweetsHits;
  const confidence = Math.max(0.28, Math.min(0.9, 0.34 + evidence * 0.08 + Math.min(text.length, 80) / 400));

  return {
    calories: Math.round(calories / 10) * 10,
    protein: Math.round(protein),
    carbs: Math.round(carbs),
    fat: Math.round(fat),
    confidence,
    signals: {
      proteinHits,
      carbHits,
      fatHits,
      veggieHits,
      sweetsHits
    }
  };
}

function suggestMemory(text) {
  if (text.includes("夜") && (text.includes("甘") || text.includes("ケーキ") || text.includes("お菓子"))) {
    return "夜に甘いものが欲しくなりやすい";
  }
  if (text.includes("コンビニ")) {
    return "忙しい日はコンビニ食で整えたい";
  }
  if (text.includes("飽き")) {
    return "同じ食材が続くと飽きやすい";
  }
  if (text.includes("外食")) {
    return "外食の翌日は調整したい";
  }
  return "";
}

function analyzeMeal(text, options = {}) {
  const safety = detectSafety(text, options.history || state.reports);
  const nutrition = estimateNutrition(text);
  const lowConfidence = nutrition.confidence < 0.55;
  const memoryCandidate = suggestMemory(text);

  return {
    nutrition,
    safety,
    lowConfidence,
    memoryCandidate,
    at: new Date().toISOString()
  };
}

function inferPersona(profile = state.profile) {
  if (profile.relationship === "淡々と管理" || profile.relationship === "師匠" || profile.relationship === "ライバル") return "strict";
  if (profile.relationship === "ほめ上手な友達" || profile.relationship === "後輩" || profile.relationship === "恋人") return "bright";
  const impression = IMPRESSION_OPTIONS[profile.impression] || IMPRESSION_OPTIONS.clean;
  if (impression.persona) return impression.persona;
  const joined = `${profile.goal || ""}`;
  if (/筋トレ|たんぱく質|バランス|体重/.test(joined)) return "strict";
  return "steady";
}

function composeLookCustomNote(profile = state.profile) {
  const notes = [];
  if (profile.appearanceGender) notes.push(`見た目の性別: ${profile.appearanceGender}`);
  if (profile.appearanceAge) notes.push(`見た目年齢: ${profile.appearanceAge}`);
  if (profile.nationality && profile.nationality !== "お任せ") notes.push(`国籍・ルーツ: ${profile.nationality}`);
  if (Array.isArray(profile.faceImpressions) && profile.faceImpressions.length) notes.push(`顔の印象: ${profile.faceImpressions.join("、")}`);
  if (profile.eyeStyle) notes.push(`目元: ${profile.eyeStyle}`);
  if (profile.faceShape) notes.push(`輪郭: ${profile.faceShape}`);
  if (profile.expression) notes.push(`表情: ${profile.expression}`);
  if (typeof profile.hairLength !== "undefined") notes.push(`髪の長さ: ${HAIR_LENGTH_OPTIONS[Number(profile.hairLength)] || "ショート"}`);
  if (profile.hairColorCustom) notes.push(`髪色のこだわり: ${profile.hairColorCustom}`);
  if (profile.clothingStyle) notes.push(`服の雰囲気: ${profile.clothingStyle}`);
  if (profile.accessories) notes.push(`アクセサリー: ${profile.accessories}`);
  if (profile.lookCustomNote) notes.push(`追加のこだわり: ${profile.lookCustomNote}`);
  if (profile.referenceImageName) notes.push(`参考画像: ${profile.referenceImageName}`);
  if (profile.avoidLookNote) notes.push(`避けたいもの: ${profile.avoidLookNote}`);
  return notes.join(" / ");
}

function buildLookConfig(profile = state.profile) {
  const preset = LOOK_PRESETS[profile.lookPreset] || null;
  const artStyleKey = ART_STYLE_OPTIONS[profile.artStyle] ? profile.artStyle : preset?.artStyle || "photo";
  const hairStyleKey = HAIR_STYLE_OPTIONS[profile.hairStyle] ? profile.hairStyle : preset?.hairStyle || "short";
  const hairColorKey = HAIR_COLOR_OPTIONS[profile.hairColor] ? profile.hairColor : preset?.hairColor || "dark";
  const outfitColorKey = OUTFIT_COLOR_OPTIONS[profile.outfitColor] ? profile.outfitColor : preset?.outfitColor || "white";
  const impressionKey = IMPRESSION_OPTIONS[profile.impression] ? profile.impression : preset?.impression || "clean";
  const hairStyle = HAIR_STYLE_OPTIONS[hairStyleKey];
  const hairColor = {
    ...HAIR_COLOR_OPTIONS[hairColorKey],
    color: profile.hairColorCode || HAIR_COLOR_OPTIONS[hairColorKey].color,
    copy: profile.hairColorCustom || HAIR_COLOR_OPTIONS[hairColorKey].copy
  };
  const outfitColor = OUTFIT_COLOR_OPTIONS[outfitColorKey];
  const impression = IMPRESSION_OPTIONS[impressionKey];
  const artStyle = ART_STYLE_OPTIONS[artStyleKey];

  return {
    presetKey: preset ? profile.lookPreset : "",
    name: preset?.name || impression.name,
    label: preset?.label || impression.title,
    tag: preset?.tag || `${artStyle.label} / ${hairStyle.label} / ${outfitColor.label}`,
    artStyleKey,
    artStyleLabel: artStyle.label,
    artStyleCopy: artStyle.copy,
    artStylePrompt: artStyle.prompt,
    hairStyleKey,
    hairColorKey,
    outfitColorKey,
    impressionKey,
    appearance: preset?.appearance || `${artStyle.label}、${hairColor.copy}、${hairStyle.copy}、${outfitColor.copy}、${impression.face}`,
    copy: preset?.copy || impression.copy,
    previewAsset: preset?.previewAsset || LOOK_PRESETS[styleSamplePreset(artStyleKey)]?.previewAsset || "",
    sheetAsset: preset?.sheetAsset || "",
    sheetSource: preset?.sheetSource || "",
    sheetFormat: preset?.sheetAsset ? "multi_view_character_sheet_v1" : "",
    colors: {
      bg: impression.background,
      bg2: impression.background2,
      skin: "#f1bea0",
      hair: hairColor.color,
      wear: outfitColor.color,
      trim: outfitColor.trim
    }
  };
}

function buildPresetLookConfig(presetKey) {
  const preset = LOOK_PRESETS[presetKey];
  if (!preset) return buildLookConfig(state.profile);
  return buildLookConfig({
    ...state.profile,
    lookPreset: presetKey,
    artStyle: preset.artStyle,
    hairStyle: preset.hairStyle,
    hairColor: preset.hairColor,
    outfitColor: preset.outfitColor,
    impression: preset.impression
  });
}

function buildTrainerProfile(profile = state.profile) {
  const look = buildLookConfig(profile);
  const personaKey = inferPersona(profile);
  const persona = PERSONAS[personaKey] || PERSONAS.steady;
  const goal = profile.goal || "食生活を整える";

  let focus = "食事の量と栄養バランスを一緒に見る";
  if (goal.includes("落とす")) focus = "食事を抜かずに、体重管理につながる食べ方を見る";
  if (goal.includes("筋肉")) focus = "たんぱく質と主食の不足を一緒に見る";
  if (goal.includes("キープ")) focus = "今のリズムを崩さず、偏りだけ整える";
  if (goal.includes("食生活")) focus = "細かさより、続けやすい食事の形を作る";

  let support = "できたことを拾いながら、次にすることを1つに絞る";
  if (personaKey === "bright") support = "軽くほめながら、次に送る1食を決める";
  if (personaKey === "strict") support = "事実を見て、次に足すものをはっきり出す";
  if (personaKey === "steady") support = "食べすぎた日も責めずに、次の食事へ戻す";

  const purposeMap = {
    "今をキープ": "今の状態をキープするために",
    "体重を落とす": "体重を落とすために",
    "筋肉をつける": "筋肉をつけるために",
    "食生活を整える": "食生活を整えるために"
  };
  const purpose = purposeMap[goal] || `${goal}ために`;

  return {
    personaKey,
    persona,
    look,
    name: look.name,
    focus,
    support,
    summary: `${purpose}、${support}`
  };
}

function buildTrainerSheet(profile = state.profile) {
  const trainer = buildTrainerProfile(profile);
  const customNote = composeLookCustomNote(profile);
  const referenceUrls = normalizeReferenceUrls(profile.referenceUrls);
  const referenceImageName = String(profile.referenceImageName || "").trim();
  return {
    version: TRAINER_SHEET_VERSION,
    id: id("sheet"),
    createdAt: new Date().toISOString(),
    updatedAt: "",
    revision: 1,
    editInstruction: "",
    characterSheetText: "",
    source: profile.lookPreset ? "ready" : "custom",
    name: trainer.name,
    role: "あなた専用の食事パートナー",
    archetype: trainer.look.label,
    goalAtCreation: profile.goal || "食事バランスを整えたい",
    visual: {
      look: trainer.look,
      artStyle: trainer.look.artStyleLabel,
      appearance: trainer.look.appearance,
      vibe: trainer.look.copy,
      customNote,
      referenceUrls,
      referenceImageName,
      hasReferenceImage: Boolean(profile.referenceImageData)
    },
    voice: {
      personaKey: trainer.personaKey,
      personaLabel: trainer.persona.label,
      support: profile.voiceMemo ? `${trainer.support}。希望: ${profile.voiceMemo}` : trainer.support,
      sign: trainer.persona.sign
    },
    promptRules: {
      atmosphere: "清潔感があり、毎日食事を報告しやすい。やさしいが、必要なことは短く言ってくれる。",
      framing: "顔から上半身、明るい背景、スマホアプリのプロフィール画像として見やすい構図。",
      avoid: "文字、ロゴ、透かし、過度な露出、医療広告のような表現。"
    },
    characterSheetFormat: {
      mode: trainer.look.sheetAsset ? "user_provided_reference_sheet" : "generated_reference_sheet",
      format: trainer.look.sheetFormat || "multi_view_character_sheet_v1",
      sourceAsset: trainer.look.sheetAsset || "",
      sourceFile: trainer.look.sheetSource || "",
      requiredPanels: [
        "main portrait",
        "expression variations",
        "front and side angles",
        "full body",
        "eyes, hair, outfit, hands detail crops"
      ],
      generationRule: "以後の画像生成は、まずこの形式のキャラクターシートをlatestとして固定し、そのシートを参照してポートレートや差分画像を生成する。"
    }
  };
}

function trainerFromSheet(sheet = state.profile.trainerSheet) {
  if (!sheet || sheet.version !== TRAINER_SHEET_VERSION) return buildTrainerProfile(state.profile);
  const personaKey = sheet.voice?.personaKey || inferPersona(state.profile);
  const persona = PERSONAS[personaKey] || PERSONAS.steady;
  const look = sheet.visual?.look || buildLookConfig(state.profile);
  const support = sheet.voice?.support || "できたことを拾いながら、次にすることを1つに絞る";
  return {
    personaKey,
    persona,
    look,
    name: sheet.name || look.name,
    focus: "食事の量と栄養バランスを一緒に見る",
    support,
    summary: support,
    sheet
  };
}

function lockTrainerSheet() {
  state.profile.trainerSheet = buildTrainerSheet(state.profile);
  logEvent("trainer_sheet_created", trainerSheetEventPayload(state.profile.trainerSheet));
  return state.profile.trainerSheet;
}

function ensureTrainerSheet() {
  if (!state.profile.trainerSheet || state.profile.trainerSheet.version !== TRAINER_SHEET_VERSION) {
    lockTrainerSheet();
    saveState();
  }
  return state.profile.trainerSheet;
}

function trainerSheetEventPayload(sheet = state.profile.trainerSheet) {
  return {
    trainerSheetId: sheet?.id || "",
    trainerSheetVersion: Number(sheet?.version || TRAINER_SHEET_VERSION),
    trainerSheetRevision: Number(sheet?.revision || 0),
    trainerSheetSource: sheet?.source || "",
    trainerSheetSourceFile: sheet?.characterSheetFormat?.sourceFile || ""
  };
}

function invalidateTrainerSheet({ clearImage = true } = {}) {
  state.profile.trainerSheet = null;
  if (clearImage) {
    state.profile.trainerImageData = "";
    state.profile.trainerImageName = "";
  }
}

function updateTrainerSheetFromInstruction(value) {
  const instruction = String(value || "").trim();
  if (!instruction) {
    showToast("直したい内容を短く書いてください。");
    return;
  }
  const currentSheet = ensureTrainerSheet();
  const visual = currentSheet.visual || {};
  const voice = currentSheet.voice || {};
  const promptRules = currentSheet.promptRules || {};
  state.profile.trainerSheet = {
    ...currentSheet,
    updatedAt: new Date().toISOString(),
    revision: Number(currentSheet.revision || 1) + 1,
    editInstruction: instruction,
    characterSheetText: "",
    visual: {
      ...visual,
      customNote: visual.customNote || String(state.profile.lookCustomNote || "").trim(),
      referenceUrls: Array.isArray(visual.referenceUrls) ? visual.referenceUrls : normalizeReferenceUrls(state.profile.referenceUrls)
    },
    voice: { ...voice },
    promptRules: { ...promptRules }
  };
  state.profile.sheetEditDraft = "";
  state.profile.trainerImageData = "";
  state.profile.trainerImageName = "";
  logEvent("trainer_sheet_updated", {
    sheetId: state.profile.trainerSheet.id,
    revision: state.profile.trainerSheet.revision
  });
  saveState();
  render();
  showToast("食事パートナー設定を更新しました。");
}

function applyLookPreset(presetKey) {
  const preset = LOOK_PRESETS[presetKey];
  if (!preset) return false;
  state.profile.lookPreset = presetKey;
  state.profile.artStyle = preset.artStyle || state.profile.artStyle || "anime";
  state.profile.hairStyle = preset.hairStyle;
  state.profile.hairColor = preset.hairColor;
  state.profile.hairColorCode = HAIR_COLOR_OPTIONS[preset.hairColor]?.color || state.profile.hairColorCode || "#151515";
  state.profile.hairColorCustom = "";
  state.profile.outfitColor = preset.outfitColor;
  state.profile.impression = preset.impression;
  state.profile.lookCustomNote = "";
  state.profile.referenceUrls = "";
  invalidateTrainerSheet();
  state.profile.persona = inferPersona(state.profile);
  return true;
}

function renderTrainerAvatar(look = buildLookConfig(state.profile), size = "normal") {
  const style = [
    `--avatar-bg:${look.colors.bg}`,
    `--avatar-bg-2:${look.colors.bg2}`,
    `--skin:${look.colors.skin}`,
    `--hair:${look.colors.hair}`,
    `--wear:${look.colors.wear}`,
    `--trim:${look.colors.trim}`
  ].join(";");
  return `
    <div class="trainer-avatar is-style-${escapeHtml(look.artStyleKey)} is-${escapeHtml(look.hairStyleKey)} is-${escapeHtml(look.impressionKey)} is-${escapeHtml(size)}" style="${escapeHtml(style)}" role="img" aria-label="${escapeHtml(look.appearance)}">
      <span class="avatar-back"></span>
      <span class="avatar-neck"></span>
      <span class="avatar-body"><span></span></span>
      <span class="avatar-head">
        <span class="avatar-hair"></span>
        <span class="avatar-eye is-left"></span>
        <span class="avatar-eye is-right"></span>
        <span class="avatar-smile"></span>
      </span>
    </div>
  `;
}

function renderTrainerVisual(look = buildLookConfig(state.profile), size = "normal", { uploaded = true } = {}) {
  if (uploaded && state.profile.trainerImageData) {
    return `<img class="trainer-photo is-${escapeHtml(size)}" src="${escapeHtml(state.profile.trainerImageData)}" alt="${escapeHtml(look.appearance)}">`;
  }
  if (look.previewAsset) {
    return `<img class="trainer-photo is-${escapeHtml(size)}" src="${escapeHtml(look.previewAsset)}" alt="${escapeHtml(look.label)}">`;
  }
  if (look.sheetAsset) {
    return `<img class="trainer-photo is-${escapeHtml(size)} is-sheet-source" src="${escapeHtml(look.sheetAsset)}" alt="${escapeHtml(look.label)}のキャラクターシート">`;
  }
  return renderTrainerAvatar(look, size);
}

function normalizeReferenceUrls(value = "") {
  return String(value)
    .split(/\s+/)
    .map((item) => item.trim())
    .filter((item) => /^https?:\/\/[^\s]+$/i.test(item))
    .slice(0, 5);
}

function buildLocalCharacterSheetText(sheet = ensureTrainerSheet(), profile = state.profile) {
  const trainer = trainerFromSheet(sheet);
  const customNote = String(sheet.visual?.customNote || "").trim();
  const editInstruction = String(sheet.editInstruction || "").trim();
  const referenceUrls = sheet.visual?.referenceUrls || [];
  const sheetFormat = sheet.characterSheetFormat || {};
  const lines = [
    "固定プロフィール",
    `ID: ${sheet.id}`,
    `revision: ${sheet.revision || 1}`,
    `名前: ${trainer.name}`,
    `役割: ${sheet.role || "あなた専用の食事パートナー"}`,
    `担当する相手: ${(profile.nickname || "").trim() || "ユーザー"}`,
    `目的: ${profile.goal || "食事バランスを整えたい"}`,
    `画像のタッチ: ${trainer.look.artStyleLabel}`,
    `外見: ${sheet.visual?.appearance || trainer.look.appearance}`,
    `印象: ${sheet.visual?.vibe || trainer.look.copy}`,
    `話し方: ${sheet.voice?.support || trainer.support}`,
    `表情・距離感: ${sheet.promptRules?.atmosphere || "清潔感があり、毎日食事を報告しやすい。やさしいが、必要なことは短く言ってくれる。"}`,
    `キャラクターシート形式: ${sheetFormat.format || "multi_view_character_sheet_v1"}`,
    `シートに含める要素: ${(sheetFormat.requiredPanels || []).join("、") || "メインポートレート、表情差分、角度、全身、目・髪・服・手元のディテール"}`,
    `ポートレート画角: ${sheet.promptRules?.framing || "顔から上半身、明るい背景、スマホアプリのプロフィール画像として見やすい構図。"}`
  ];
  if (sheetFormat.sourceAsset) lines.push(`参照キャラクターシート画像: ${sheetFormat.sourceAsset}`);
  if (customNote) lines.push(`こだわり: ${customNote}`);
  if (editInstruction) lines.push(`最新の修正指示: ${editInstruction}`);
  if (referenceUrls.length) lines.push(`参考URL: ${referenceUrls.join(" / ")}`);
  return lines.join("\n");
}

function characterSheetTextForPrompt(sheet = ensureTrainerSheet(), profile = state.profile) {
  const savedText = String(sheet.characterSheetText || "").trim();
  const editInstruction = String(sheet.editInstruction || "").trim();
  const baseText = savedText || buildLocalCharacterSheetText(sheet, profile);
  if (!editInstruction || baseText.includes(editInstruction)) return baseText;
  return `${baseText}\n最新の修正指示: ${editInstruction}`;
}

function buildTrainerImagePrompt(sheet = ensureTrainerSheet(), profile = state.profile) {
  const fixedProfileText = characterSheetTextForPrompt(sheet, profile);
  const rules = sheet.promptRules || {};
  const sheetFormat = sheet.characterSheetFormat || {};
  const lines = [
    "日本向けのスマホアプリで使う、架空の食事パートナーの正方形ポートレートを1枚生成してください。",
    "このアプリでは、先にキャラクターシートをlatestとして固定し、そのシートから毎回の画像を生成します。",
    "下の固定プロフィールは画像内に文字として入れず、人物の見た目・雰囲気・一貫性の参照だけに使ってください。",
    sheetFormat.sourceAsset ? `可能な場合は、参照画像として次のキャラクターシートを添付して使ってください: ${sheetFormat.sourceAsset}` : "参照画像がない場合も、下のキャラクターシート形式に沿って人物の一貫性を固定してください。",
    "出力は1人の人物ポートレートだけにしてください。文字、比較表、設定資料風レイアウト、カードUI、説明文は画像に入れないでください。",
    `画角: ${rules.framing || "顔から上半身、明るい背景、スマホアプリのプロフィール画像として見やすい構図。"}`,
    `避けるもの: ${rules.avoid || "文字、ロゴ、透かし、過度な露出、医療広告のような表現。"}`,
    "",
    "固定プロフィール",
    fixedProfileText
  ];
  return lines.join("\n");
}

function profileForReply(profile = state.profile) {
  const nickname = profile.nickname?.trim() || "あなた";
  const trainer = profile === state.profile && state.profile.trainerSheet ? trainerFromSheet(state.profile.trainerSheet) : buildTrainerProfile(profile);
  const persona = trainer.persona;
  const memories = state.memories.slice(0, 2).map((memory) => memory.text).filter(Boolean);
  return { nickname, persona, goal: profile.goal, support: trainer.support, memories };
}

function buildReply(text, analysis, profile = state.profile) {
  const { nickname, persona, goal, support, memories } = profileForReply(profile);
  const n = analysis.nutrition;
  const confidenceLabel = n.confidence >= 0.72 ? "中程度" : "低め";
  const hasProtein = n.protein >= 22;
  const hasVeggie = n.signals.veggieHits > 0;
  const hasCarb = n.carbs >= 45;

  if (analysis.safety.level === "red") {
    return `${nickname}さん、報告してくれてありがとう。今はダイエットの点数化より安全を最優先にしたいです。\n\n` +
      `今回の内容には「${analysis.safety.signals.join("、")}」が含まれています。食事量をさらに減らす提案、体重を急いで落とす提案、がんばりの評価はここでは止めます。\n\n` +
      `すぐにできる次の一手は、信頼できる人、医療機関、地域の相談窓口のどれか1つに連絡すること。緊急性がある場合は119番や最寄りの救急相談を優先してください。${persona.sign}`;
  }

  if (analysis.safety.level === "yellow") {
    return `${nickname}さん、正直に書いてくれてありがとう。食べられなかった日や吐き気・下剤・過度な運動が絡む日は、減量の成果として扱わず、体を守る日として見ます。\n\n` +
      `栄養の推定は出せますが、今日は数字より回復が先です。水分と、食べられそうなら消化の軽いものを少量。明日も低摂取が続くなら、ひとりで抱えず相談先につなぎましょう。\n\n` +
      `報告できたこと自体は大事です。${persona.sign}`;
  }

  const pfcLine = `カロリーは約${n.calories}kcalです。たんぱく質 ${n.protein}g / 脂質 ${n.fat}g / 炭水化物 ${n.carbs}g。推定の自信度は${confidenceLabel}なので参考値として見てください。`;
  const positive = hasProtein ? "たんぱく質の軸は作れています。" : "次はたんぱく質を1品足すと安定します。";
  const veggie = hasVeggie ? "野菜・汁物も入っていて、続けやすい形です。" : "野菜か汁物を足すと満足感が伸びます。";
  const carb = hasCarb ? "炭水化物も入っているので、極端に削らず進められます。" : "主食が少ない日は、夜の反動が出やすいので小さく足してOKです。";
  const memoryLine = memories.length ? `前に覚えた「${memories.join(" / ")}」も見ると、` : "";
  const next = hasProtein && hasVeggie
    ? "次の一手は、同じ型をもう1食だけ再現すること。"
    : hasProtein
      ? "次の一手は、汁物か野菜を足して満腹感を作ること。"
      : "次の一手は、卵・豆腐・魚・鶏のどれかを小さく足すこと。";

  return `${nickname}さん、記録ありがとう。${goal}に向けて、今日の食事はちゃんと材料になります。\n\n` +
    `${pfcLine}\n${memoryLine}${positive}${veggie}${carb}\n\n` +
    `${next}${support}。完璧より報告優先でいこう。${persona.sign}`;
}

function scoreReply(text, analysis, profile = state.profile) {
  const parts = {
    safety: 0,
    empathy: 0,
    personalization: 0,
    nutrition: 0,
    nextAction: 0,
    voice: 0
  };

  const unsafePromise = /(必ず痩せ|絶対痩せ|食べるな|もっと減ら|我慢しろ|体重だけ)/.test(text);
  const safetyHandled = !analysis.safety.safetyFlag || /(安全|医療|相談|119|止めます|守る)/.test(text);
  parts.safety = safetyHandled && !unsafePromise ? 20 : 0;
  parts.empathy = /(ありがとう|報告|大事|材料|正直)/.test(text) ? 20 : 10;
  const trainer = buildTrainerProfile(profile);
  parts.personalization = text.includes(profile.nickname || "あなた") || text.includes(profile.goal) || text.includes(trainer.name) ? 15 : 8;
  parts.nutrition = analysis.safety.safetyFlag ? 14 : /(たんぱく質|脂質|炭水化物|カロリー|参考値|確度)/.test(text) ? 20 : 8;
  parts.nextAction = /(次の一手|どれか1つ|少量|足す|連絡)/.test(text) ? 15 : 6;
  parts.voice = Object.values(PERSONAS).some((persona) => text.includes(persona.sign)) ? 10 : 6;

  return {
    safetyGate: parts.safety === 20,
    parts,
    total: Object.values(parts).reduce((sum, value) => sum + value, 0)
  };
}

function calculateLedger() {
  const rates = {
    textReport: 2,
    photoReport: 8,
    imageGeneration: 40,
    safetyReview: 20,
    csMinute: 2
  };
  const total =
    Number(state.ledger.textReports || 0) * rates.textReport +
    Number(state.ledger.photoReports || 0) * rates.photoReport +
    Number(state.ledger.imageGenerations || 0) * rates.imageGeneration +
    Number(state.ledger.safetyReviews || 0) * rates.safetyReview +
    Number(state.ledger.csMinutes || 0) * rates.csMinute +
    Number(state.ledger.manualCostYen || 0);
  const plan = PLAN_LIMITS[state.ledger.plan] || PLAN_LIMITS.founding;
  return {
    total,
    plan,
    cap: plan.cap,
    ok: total <= plan.cap,
    rates
  };
}

function latestReport() {
  return state.reports[0] || null;
}

function safetyLabel(level) {
  if (level === "red") return "要相談サイン";
  if (level === "yellow") return "注意サイン";
  return "安全チェックOK";
}

function render() {
  if (!state.profile.onboarded) {
    app.innerHTML = `
      ${renderOnboarding()}
      ${state.toast ? `<div class="toast" role="status">${escapeHtml(state.toast)}</div>` : ""}
    `;
    scheduleOnboardingAutoAdvance();
    return;
  }
  clearTimeout(onboardingAutoTimer);

  const latest = latestReport();
  app.innerHTML = `
    ${renderHeader(latest)}
    ${renderTabs()}
    <main class="main-grid">
      ${renderCompanion(latest)}
      <section class="workbench" aria-label="AI食事パートナー workspace">
        ${renderActiveTab()}
      </section>
    </main>
    ${state.toast ? `<div class="toast" role="status">${escapeHtml(state.toast)}</div>` : ""}
  `;
}

function renderHeader(latest) {
  const safety = latest?.analysis?.safety?.level || "none";
  const safetyClass = safety === "red" ? "is-red" : safety === "yellow" ? "is-yellow" : "is-safe";
  const currentPlan = PLAN_LIMITS[state.ledger.plan] || PLAN_LIMITS.founding;
  return `
    <header class="app-header">
      <div class="brand-lockup">
        <img class="brand-icon" src="assets/icon.svg" width="46" height="46" alt="">
        <div>
          <h1 class="brand-title">AI食事パートナー</h1>
          <p class="brand-subtitle">あなたに合わせて食事記録を続けるための試作アプリ</p>
        </div>
      </div>
      <div class="header-status">
        <span class="status-pill ${state.profile.onboarded ? "is-safe" : "is-yellow"}">${state.profile.onboarded ? "設定済み" : "はじめに設定"}</span>
        <span class="status-pill ${safetyClass}">${safetyLabel(safety)}</span>
        <span class="status-pill">${escapeHtml(currentPlan.label)}</span>
        <span class="status-pill">記録 ${state.reports.length}件</span>
      </div>
    </header>
  `;
}

function renderTabs() {
  return `
    <nav class="tabs" aria-label="Primary">
      ${TABS.map((tab) => `
        <button class="tab-button" type="button" data-tab="${tab.id}" aria-selected="${state.activeTab === tab.id}">
          <span>${escapeHtml(tab.short)}</span>
          <small>${escapeHtml(tab.label)}</small>
        </button>
      `).join("")}
    </nav>
  `;
}

function renderCompanion(latest) {
  const trainer = state.profile.trainerSheet ? trainerFromSheet(state.profile.trainerSheet) : buildTrainerProfile(state.profile);
  const persona = trainer.persona;
  const score = latest?.score?.total || 76;
  const meter = Math.max(18, Math.min(100, score));
  const safety = latest?.analysis?.safety?.level || "none";
  const memoryCount = state.memories.length;
  return `
    <aside class="companion-rail" aria-label="companion summary">
      <div class="avatar-frame">
        ${renderTrainerVisual(trainer.look, "rail")}
      </div>
      <div class="companion-body">
        <div class="companion-name">
          <h2>${escapeHtml(state.profile.nickname || "あなた")}専用 ${escapeHtml(trainer.name)}</h2>
          <span class="pill">${escapeHtml(persona.label)}</span>
        </div>
        <p class="panel-copy">${escapeHtml(trainer.look.appearance)}。${escapeHtml(persona.copy)}</p>
        <div class="mood-meter" aria-label="latest quality score">
          <div class="meter-track"><div class="meter-fill" style="--meter: ${meter}%"></div></div>
          <span class="pill">返信スコア ${score}/100</span>
        </div>
        <ul class="rail-list">
          <li><strong>目的</strong><span>${escapeHtml(state.profile.goal || "未設定")}</span></li>
          <li><strong>見た目</strong><span>${escapeHtml(trainer.look.label)}</span></li>
          <li><strong>安全</strong><span>${escapeHtml(safetyLabel(safety))}</span></li>
          <li><strong>メモ</strong><span>${memoryCount}件</span></li>
          <li><strong>返信</strong><span>初回80点以上でチェック</span></li>
        </ul>
      </div>
    </aside>
  `;
}

function renderActiveTab() {
  if (state.activeTab === "memory") return renderMemoryTab();
  if (state.activeTab === "plan") return renderPlanTab();
  if (state.activeTab === "quality") return renderQualityTab();
  if (state.activeTab === "ops") return renderOpsTab();
  return renderReportTab();
}

function renderReportTab() {
  const latest = latestReport();
  return `
    <section class="section-panel">
      <div class="section-header">
        <div>
          <h2>食事を記録</h2>
          <p>食べたものを1行で入れてください。量はざっくりで大丈夫です。</p>
        </div>
        <button class="button secondary" type="button" data-action="reset-demo">履歴を消す</button>
      </div>
      <form class="composer" data-form="report">
        <textarea class="textarea" data-draft placeholder="食べたもの、量、気分をざっくり書く">${escapeHtml(state.draft)}</textarea>
        <div class="chip-row">
          ${MEAL_CHIPS.map((chip) => `<button class="chip ${chip.tone}" type="button" data-chip="${escapeHtml(chip.text)}">${escapeHtml(chip.label)}</button>`).join("")}
        </div>
        <div class="composer-tools">
          <label class="button secondary" for="photo-input">写真を添える</label>
          <input class="file-input" id="photo-input" type="file" accept="image/*" data-photo>
          ${state.draftPhotoName ? `<span class="pill">${escapeHtml(state.draftPhotoName)}</span>` : `<span class="pill">外部送信なし</span>`}
          <button class="button" type="submit">記録する</button>
        </div>
      </form>
    </section>
    ${latest ? renderSafetyBanner(latest) : ""}
    ${latest ? renderReportItem(latest, true) : `<div class="empty">食事を記録すると、カロリー・栄養バランス・返信がここに出ます。</div>`}
    ${state.reports.length > 1 ? `
      <section class="section-panel">
        <div class="section-header"><h3>前の記録</h3><span class="pill">${state.reports.length - 1}件</span></div>
        <div class="reply-list">
          ${state.reports.slice(1, 6).map((report) => renderReportItem(report, false)).join("")}
        </div>
      </section>
    ` : ""}
  `;
}

function renderSafetyBanner(report) {
  const safety = report.analysis.safety;
  if (!safety.safetyFlag) return "";
  const isRed = safety.level === "red";
  return `
    <section class="safety-banner ${isRed ? "is-red" : ""}" role="alert">
      <h3>${isRed ? "安全を最優先に切り替えました" : "今日は安全側に寄せています"}</h3>
      <p>検出: ${escapeHtml(safety.signals.join("、") || "低摂取")}${safety.stopsRewards ? "。報酬・連続記録・褒めカードは停止します。" : ""}</p>
      ${isRed ? `<p><a href="https://www.mhlw.go.jp/mamorouyokokoro/" target="_blank" rel="noreferrer">まもろうよこころ</a> など、信頼できる相談先を優先してください。</p>` : ""}
    </section>
  `;
}

function renderReportItem(report, expanded) {
  const n = report.analysis.nutrition;
  const safety = report.analysis.safety;
  const score = report.score.total;
  const memoryCandidate = report.analysis.memoryCandidate;
  const memoryAlreadyExists = memoryCandidate && state.memories.some((memory) => memory.text === memoryCandidate);
  return `
    <article class="reply-item">
      <div class="reply-meta">
        <span class="pill">${formatDate(report.at)}</span>
        <span class="pill">${safetyLabel(safety.level)}</span>
        <span class="pill">返信スコア ${score}/100</span>
        ${report.hadPhoto ? `<span class="pill">写真あり</span>` : ""}
      </div>
      <p class="reply-text"><strong>入力した食事</strong><br>${escapeHtml(report.text)}</p>
      ${expanded ? `
        <div class="pfc-grid" aria-label="nutrition estimate">
          <div class="pfc-item"><strong>${n.calories}</strong><span>カロリー</span></div>
          <div class="pfc-item"><strong>${n.protein}g</strong><span>たんぱく質</span></div>
          <div class="pfc-item"><strong>${n.fat}g</strong><span>脂質</span></div>
          <div class="pfc-item"><strong>${n.carbs}g</strong><span>炭水化物</span></div>
        </div>
      ` : ""}
      <p class="reply-text"><strong>食事パートナーからの返信</strong><br>${escapeHtml(report.reply)}</p>
      <p class="disclaimer-link"><a href="disclaimer.html" target="_blank" rel="noopener">免責事項</a></p>
      ${memoryCandidate ? `
        <div class="action-row" style="margin-top: 12px;">
          <span class="pill">覚えておくこと: ${escapeHtml(memoryCandidate)}</span>
          ${memoryAlreadyExists ? `<span class="pill">保存済み</span>` : `<button class="button secondary" type="button" data-action="remember-candidate" data-report-id="${report.id}">保存する</button>`}
        </div>
      ` : ""}
      <div class="score-bar" style="margin-top: 12px;"><div class="score-fill" style="--score: ${score}%"></div></div>
    </article>
  `;
}

function renderMemoryTab() {
  return `
    <section class="section-panel">
      <div class="section-header">
        <div>
          <h2>好みメモ</h2>
          <p>苦手なこと、続けやすい食べ方、覚えてほしいことを保存します。</p>
        </div>
        <span class="pill">${state.memories.length}件</span>
      </div>
      <form class="inline-fields" data-form="memory">
        <div class="field">
          <label for="memory-input">覚えてほしいこと</label>
          <input class="input" id="memory-input" name="memory" placeholder="例：夜に甘いものが欲しくなる">
        </div>
        <button class="button" type="submit">追加</button>
      </form>
    </section>
    <div class="memory-list">
      ${state.memories.length ? state.memories.map((memory) => renderMemoryItem(memory)).join("") : `<div class="empty">まだメモはありません。</div>`}
    </div>
  `;
}

function renderMemoryItem(memory) {
  return `
    <article class="memory-item">
      <div class="item-meta">
        <span class="pill">${memory.pinned ? "優先" : "通常"}</span>
        <span>${formatDate(memory.createdAt)}</span>
      </div>
      <div class="memory-edit">
        <input class="input" value="${escapeHtml(memory.text)}" data-memory-field="${memory.id}">
        <button class="button secondary" type="button" data-action="toggle-memory" data-memory-id="${memory.id}">${memory.pinned ? "固定解除" : "固定"}</button>
        <button class="button danger" type="button" data-action="delete-memory" data-memory-id="${memory.id}">削除</button>
      </div>
    </article>
  `;
}

function renderPlanTab() {
  return `
    <section class="section-panel">
      <div class="section-header">
        <div>
          <h2>プラン</h2>
          <p>無料お試しから、毎日の食事記録まで段階的に使えます。</p>
        </div>
        <span class="pill">試作中</span>
      </div>
      <div class="pricing-grid">
        ${Object.entries(PLAN_LIMITS).map(([key, plan]) => `
          <article class="pricing-card ${state.ledger.plan === key ? "is-active" : ""}">
            <strong>${escapeHtml(plan.label)} / ${yen(plan.price)}</strong>
            <span>食事記録: ${escapeHtml(plan.reports)} / 写真: ${plan.photos} / 画像生成: ${plan.images}</span>
          </article>
        `).join("")}
      </div>
    </section>
    <section class="section-panel">
      <div class="section-header"><h3>まず見ること</h3><span class="pill">無料で確認</span></div>
      <div class="metric-grid">
        <div class="metric-tile"><span>最初の利用者</span><strong>ChatGPT併用者</strong></div>
        <div class="metric-tile"><span>最初の価値</span><strong>返信1回</strong></div>
        <div class="metric-tile"><span>料金</span><strong>980円</strong></div>
        <div class="metric-tile"><span>返信チェック</span><strong>80+</strong></div>
      </div>
    </section>
    <section class="section-panel">
      <div class="section-header"><h3>今できること / まだしないこと</h3><span class="pill">有料ツールなし</span></div>
      <table class="rubric">
        <thead><tr><th>項目</th><th>今できること</th><th>承認が必要なこと</th></tr></thead>
        <tbody>
          <tr><td>AI</td><td>ルールベース返信、品質採点、100件サンプル生成</td><td>OpenAI API課金、画像生成課金</td></tr>
          <tr><td>使い方</td><td>PWA、ローカル保存、手動テスト</td><td>LINE公式アカウント連携、公開運用</td></tr>
          <tr><td>料金</td><td>料金表、コスト台帳、月額980円プランの単価上限</td><td>Stripe本番決済、実課金募集</td></tr>
          <tr><td>安全</td><td>注意/要相談サイン、報酬停止、相談リンク</td><td>医療監修、有人相談運用</td></tr>
        </tbody>
      </table>
    </section>
  `;
}

function renderQualityTab() {
  const latest = latestReport();
  const score = latest?.score || {
    total: 0,
    safetyGate: false,
    parts: Object.fromEntries(RUBRIC.map((item) => [item.key, 0]))
  };
  return `
    <section class="section-panel">
      <div class="section-header">
        <div>
          <h2>返信チェック</h2>
          <p>初回の返信がわかりやすいか、安全か、続けたくなるかを確認します。</p>
        </div>
        <span class="pill">${latest ? `最新 ${score.total}/100` : "記録なし"}</span>
      </div>
      <div class="metric-grid">
        <div class="metric-tile"><span>安全</span><strong>${score.safetyGate ? "OK" : "確認"}</strong></div>
        <div class="metric-tile"><span>初回返信</span><strong>${score.total || "--"}</strong></div>
        <div class="metric-tile"><span>続けたい</span><strong>4.0+</strong></div>
        <div class="metric-tile"><span>楽に使える</span><strong>4.0+</strong></div>
      </div>
      <div class="score-bar" style="margin-top: 14px;"><div class="score-fill" style="--score: ${score.total}%"></div></div>
    </section>
    <section class="section-panel">
      <div class="section-header">
        <h3>採点項目</h3>
        <span class="pill">100点</span>
      </div>
      <table class="rubric">
        <thead><tr><th>項目</th><th>点数</th><th>見るところ</th></tr></thead>
        <tbody>
          ${RUBRIC.map((item) => `
            <tr>
              <td>${escapeHtml(item.label)} / ${item.max}</td>
              <td>${score.parts[item.key] || 0}</td>
              <td>${escapeHtml(item.note)}</td>
            </tr>
          `).join("")}
        </tbody>
      </table>
    </section>
    <section class="section-panel">
      <div class="section-header">
        <div>
          <h3>返信サンプル</h3>
          <p>初回返信の確認用に、100件のサンプルを作れます。</p>
        </div>
        <span class="pill">${state.samples.length}件</span>
      </div>
      <div class="sample-toolbar">
        <button class="button" type="button" data-action="generate-samples">100件生成</button>
        <button class="button secondary" type="button" data-action="download-samples" ${state.samples.length ? "" : "disabled"}>サンプルを保存</button>
      </div>
      <div class="sample-list" style="margin-top: 12px;">
        ${state.samples.slice(0, 5).map((sample) => `
          <article class="sample-row">
            <div class="item-meta"><span class="pill">#${sample.index}</span><span class="pill">${sample.score.total}/100</span><span class="pill">${safetyLabel(sample.analysis.safety.level)}</span></div>
            <p class="reply-text">${escapeHtml(sample.meal)}</p>
          </article>
        `).join("") || `<div class="empty">生成すると先頭5件をプレビューします。</div>`}
      </div>
    </section>
  `;
}

function renderOpsTab() {
  const ledger = calculateLedger();
  const researchRows = buildResearchInputRows();
  return `
    <section class="section-panel">
      <div class="section-header">
        <div>
          <h2>料金</h2>
          <p>月額980円で続けられるか、1人あたりの変動費を見ます。</p>
        </div>
        <span class="pill">${ledger.ok ? "上限内" : "上限超え"}</span>
      </div>
      <div class="cost-total">
        <div>
          <span class="pill">${escapeHtml(ledger.plan.label)} 上限 ${yen(ledger.cap)}</span>
          <strong>${yen(ledger.total)}</strong>
        </div>
        <button class="button secondary" type="button" data-action="reset-ledger">標準値に戻す</button>
      </div>
      <div class="ledger-list">
        ${renderLedgerRow("plan", "プラン", "料金プラン別の変動費上限", "select")}
        ${renderLedgerRow("textReports", "食事記録", `${ledger.rates.textReport}円 / 1回`, "number")}
        ${renderLedgerRow("photoReports", "写真つき記録", `${ledger.rates.photoReport}円 / 1回`, "number")}
        ${renderLedgerRow("imageGenerations", "画像生成", `${ledger.rates.imageGeneration}円 / 1回`, "number")}
        ${renderLedgerRow("safetyReviews", "安全確認", `${ledger.rates.safetyReview}円 / 1回`, "number")}
        ${renderLedgerRow("csMinutes", "手動対応", `${ledger.rates.csMinute}円 / 1分`, "number")}
        ${renderLedgerRow("manualCostYen", "その他コスト", "その他の手動変動費", "number")}
      </div>
    </section>
    <section class="section-panel">
      <div class="section-header">
        <div>
          <h3>研究用入力ログ</h3>
          <p>この端末に保存された自由記述、参考URL、食事本文を初期分析用に確認します。外部送信はまだありません。</p>
        </div>
        <span class="pill">${researchRows.length}件</span>
      </div>
      <div class="sample-toolbar">
        <button class="button" type="button" data-action="copy-research-export">コピー</button>
        <button class="button secondary" type="button" data-action="download-research-export">JSON保存</button>
      </div>
      <div class="event-list" style="margin-top: 12px;">
        ${researchRows.slice(0, 8).map((row) => `
          <article class="event-row">
            <div class="event-meta"><span class="pill">${escapeHtml(row.label)}</span><span>${escapeHtml(row.source)}</span></div>
            <code>${escapeHtml(row.value)}</code>
          </article>
        `).join("") || `<div class="empty">自由記述や食事本文が入るとここに表示されます。</div>`}
      </div>
      <p class="mini-note">複数ユーザー分を自動で見るには、次フェーズでDB/APIへの保存先を追加します。</p>
    </section>
    <section class="section-panel">
      <div class="section-header">
        <h3>動作ログ</h3>
        <span class="pill">${state.events.length}件</span>
      </div>
      <div class="event-list">
        ${state.events.slice(0, 12).map((event) => `
          <article class="event-row">
            <div class="event-meta"><span class="pill">${escapeHtml(event.type)}</span><span>${formatDate(event.at)}</span></div>
            <code>${escapeHtml(JSON.stringify(event.payload))}</code>
          </article>
        `).join("") || `<div class="empty">まだイベントはありません。</div>`}
      </div>
    </section>
  `;
}

function renderLedgerRow(key, label, note, type) {
  if (type === "select") {
    return `
      <div class="ledger-row">
        <label for="ledger-${key}">${label}</label>
        <select class="select" id="ledger-${key}" data-ledger="${key}">
          ${Object.entries(PLAN_LIMITS).map(([planKey, plan]) => `<option value="${planKey}" ${state.ledger.plan === planKey ? "selected" : ""}>${escapeHtml(plan.label)}</option>`).join("")}
        </select>
        <small>${escapeHtml(note)}</small>
      </div>
    `;
  }
  return `
    <div class="ledger-row">
      <label for="ledger-${key}">${label}</label>
      <input class="input" id="ledger-${key}" type="number" min="0" step="1" value="${Number(state.ledger[key] || 0)}" data-ledger="${key}">
      <small>${escapeHtml(note)}</small>
    </div>
  `;
}

function renderOnboarding() {
  const screen = getOnboardingScreen();
  return `
    <div class="onboarding-mobile" role="dialog" aria-modal="true" aria-labelledby="onboarding-title">
      <section class="onboarding-phone is-${escapeHtml(screen)}">
        <header class="onboarding-topbar">
          <div class="mini-brand">
            <img src="assets/icon.svg" width="34" height="34" alt="">
            <span>食事パートナー</span>
          </div>
          <button class="button ghost onboarding-demo" type="button" data-action="load-demo">デモ</button>
        </header>
        ${renderOnboardingProgress(screen)}
        ${renderOnboardingStep(screen)}
      </section>
    </div>
  `;
}

function getOnboardingRoute() {
  return state.onboarding.route === "sample" ? "sample" : "custom";
}

function getOnboardingFlow() {
  return getOnboardingRoute() === "sample" ? SAMPLE_ONBOARDING_FLOW : CUSTOM_ONBOARDING_FLOW;
}

function getOnboardingScreen() {
  const flow = getOnboardingFlow();
  const screen = typeof state.onboarding.screen === "string" ? state.onboarding.screen : "start";
  return flow.includes(screen) ? screen : "start";
}

function onboardingIndex(screen = getOnboardingScreen()) {
  return Math.max(0, getOnboardingFlow().indexOf(screen));
}

function renderOnboardingProgress(screen) {
  const flow = getOnboardingFlow();
  const current = onboardingIndex(screen);
  return `
    <div class="onboarding-progress" style="grid-template-columns: repeat(${flow.length}, minmax(0, 1fr));" aria-label="onboarding progress">
      ${flow.map((key, index) => `
        <span class="progress-dot ${index <= current ? "is-active" : ""}" aria-label="${escapeHtml(ONBOARDING_STEP_META[key]?.label || key)}"></span>
      `).join("")}
    </div>
  `;
}

function renderOnboardingStep(screen) {
  if (screen === "sample") return renderSampleStep();
  if (screen === "style") return renderStyleStep();
  if (screen === "basics") return renderBasicsStep();
  if (screen === "face") return renderFaceStep();
  if (screen === "hair") return renderHairStep();
  if (screen === "clothes") return renderClothesStep();
  if (screen === "personalize") return renderPersonalizeStep();
  if (screen === "goal") return renderGoalStep();
  if (screen === "relationship") return renderRelationshipStep();
  if (screen === "generating") return renderGeneratingStep();
  if (screen === "firstReport") return renderFirstReportStep();
  if (screen === "reveal") return renderRevealStep();
  if (screen === "adjust") return renderAdjustStep();
  if (screen === "feedback") return renderFeedbackStep();
  if (screen === "paywall") return renderPaywallStep();
  return renderStartStep();
}

function stepKicker(screen = getOnboardingScreen()) {
  return `${onboardingIndex(screen) + 1} / ${getOnboardingFlow().length}`;
}

function renderOnboardingActions({ nextLabel = "次へ", nextAction = "onboarding-next", back = true, secondary = "" } = {}) {
  return `
    <div class="onboarding-actions">
      ${secondary}
      <button class="button onboarding-primary" type="button" data-action="${nextAction}">${nextLabel}</button>
      ${back ? `<button class="button ghost onboarding-back" type="button" data-action="onboarding-back">戻る</button>` : ""}
    </div>
  `;
}

function fieldLabel(kind = "任意") {
  return `<span class="field-label ${kind === "必須" ? "required" : ""}">${kind}</span>`;
}

function renderChipButtons(options, selected, { key = "", action = "profile-set", multi = false, className = "" } = {}) {
  const selectedList = Array.isArray(selected) ? selected : [selected];
  return `
    <div class="chip-row ${className}">
      ${options.map((option) => {
        const value = typeof option === "string" ? option : option.value;
        const label = typeof option === "string" ? option : option.label;
        const pressed = selectedList.includes(value);
        const attr = multi
          ? `data-toggle-list="${escapeHtml(key)}" data-toggle-value="${escapeHtml(value)}"`
          : `data-profile-set="${escapeHtml(key)}" data-profile-value="${escapeHtml(value)}"`;
        return `<button class="chip-choice ${pressed ? "is-selected" : ""}" type="button" ${attr} aria-pressed="${pressed}">${escapeHtml(label)}</button>`;
      }).join("")}
    </div>
  `;
}

function renderStartStep() {
  return `
    <div class="onboarding-screen start-screen g3-canon-screen">
      <div class="g3-canon-stage is-start" role="group" aria-labelledby="onboarding-title">
        <div class="sr-only">
          <p class="step-kicker">${stepKicker("start")}</p>
          <h2 id="onboarding-title">痩せたいから、ひとりで頑張らない。</h2>
          <p>あなた専用の食事パートナーが、今日のごはんを一緒に見ます。</p>
          <p>ダイエットを続けやすく。写真1枚で返事。1回まで修正無料。</p>
        </div>
        <button class="g3-image-button is-start-custom" type="button" data-action="start-custom" aria-label="じぶんの担当をつくる">
          <img src="assets/g3-ui-buttons/g3-btn-001-start-custom.png" alt="">
        </button>
        <button class="g3-image-button is-start-sample" type="button" data-action="start-sample" aria-label="サンプルから選ぶ">
          <img src="assets/g3-ui-buttons/g3-btn-001-start-sample.png" alt="">
        </button>
      </div>
    </div>
  `;
}

function startIcon(name) {
  const common = `viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"`;
  const icons = {
    food: `<svg ${common}><path d="M4 3v8"/><path d="M8 3v8"/><path d="M6 3v18"/><path d="M14 4h5v7h-5z"/><path d="M19 11v10"/></svg>`,
    camera: `<svg ${common}><path d="M4 8h4l2-3h4l2 3h4v10H4z"/><circle cx="12" cy="13" r="3"/></svg>`,
    refresh: `<svg ${common}><path d="M20 12a8 8 0 1 1-2.34-5.66"/><path d="M20 4v6h-6"/></svg>`,
    wand: `<svg ${common}><path d="M15 4l5 5"/><path d="M13 6l5 5"/><path d="M3 21l12-12"/><path d="M6 4h.01"/><path d="M4 8h.01"/><path d="M10 3h.01"/></svg>`,
    users: `<svg ${common}><path d="M16 11a4 4 0 1 0-8 0"/><path d="M4 20a8 8 0 0 1 16 0"/><path d="M18 8a3 3 0 0 1 3 3"/><path d="M21 20a6 6 0 0 0-3-5.2"/></svg>`
  };
  return icons[name] || "";
}

function renderSampleStep() {
  if (!state.profile.lookPreset) applyLookPreset("asuna");
  const selected = state.profile.lookPreset || "asuna";
  const selectedLook = buildPresetLookConfig(selected);
  const selectedPreset = LOOK_PRESETS[selected] || LOOK_PRESETS.yui;
  const selectedImage = selectedLook.previewAsset || selectedLook.sheetAsset;
  return `
    <div class="onboarding-screen sample-screen sample-canon-screen">
      <div class="sample-step-dots" aria-label="ステップ 2 / 7"><span>1</span><span class="is-active">2</span><span>3</span><span>4</span><span>5</span><span>6</span><span>7</span></div>
      <div class="onboarding-copy sample-title">
        <h2 id="onboarding-title">気になる人を1人選ぶ</h2>
      </div>
      <div class="sample-hero-canon">
        <img src="${escapeHtml(selectedImage)}" alt="${escapeHtml(selectedPreset.name)}">
        <span class="sample-name-badge">${escapeHtml(selectedPreset.name)} ✦</span>
        <span class="sample-check" aria-hidden="true">✓</span>
      </div>
      <div class="sample-grid">
        ${Object.entries(LOOK_PRESETS).map(([key, preset]) => {
          const look = buildPresetLookConfig(key);
          const src = look.previewAsset || look.sheetAsset;
          return `
            <button class="sample-card ${selected === key ? "is-selected" : ""}" type="button" data-ready-character="${escapeHtml(key)}" aria-pressed="${selected === key}">
              <img src="${escapeHtml(src)}" alt="${escapeHtml(preset.name)}">
              <span class="sr-only">${escapeHtml(preset.name)}</span>
            </button>
          `;
        }).join("")}
      </div>
      ${renderOnboardingActions({
        nextLabel: "この人にする",
        secondary: `<button class="sample-custom-link" type="button" data-action="start-custom">自分で作る</button>`
      })}
    </div>
  `;
}

function styleSamplePreset(styleKey) {
  if (styleKey === "photo") return "isagi";
  if (styleKey === "semi") return "miku";
  return "yui";
}

function renderStyleStep() {
  const selected = state.profile.artStyle;
  return `
    <div class="onboarding-screen style-screen">
      <div class="onboarding-copy">
        <p class="step-kicker">${stepKicker("style")}</p>
        <h2 id="onboarding-title">絵のタッチは？</h2>
        <p>あとから変えられます。まずは見た時の好みで選んでください。</p>
      </div>
      <div class="style-grid">
        ${Object.entries(ART_STYLE_OPTIONS).map(([key, item]) => `
          <button class="style-card is-${escapeHtml(key)}" type="button" data-art-style="${escapeHtml(key)}" aria-pressed="${selected === key}">
            <span class="style-swatch">${renderTrainerVisual(buildPresetLookConfig(styleSamplePreset(key)), "card", { uploaded: false })}</span>
            <strong>${escapeHtml(item.label)}</strong>
            <span>${escapeHtml(item.copy)}</span>
          </button>
        `).join("")}
      </div>
      ${renderOnboardingActions({ nextLabel: "このタッチで進む" })}
    </div>
  `;
}

function renderBasicsStep() {
  const hasUrl = normalizeReferenceUrls(state.profile.referenceUrls).length > 0;
  return `
    <div class="onboarding-screen">
      <div class="onboarding-copy">
        <p class="step-kicker">${stepKicker("basics")}</p>
        <h2 id="onboarding-title">見た目はどんな人？</h2>
      </div>
      <div class="input-card">
        <h3>見た目の性別${fieldLabel("必須")}</h3>
        ${renderChipButtons(APPEARANCE_GENDER_OPTIONS, state.profile.appearanceGender, { key: "appearanceGender" })}
      </div>
      <div class="input-card">
        <h3>見た目年齢${fieldLabel("必須")}</h3>
        ${renderChipButtons(APPEARANCE_AGE_OPTIONS, state.profile.appearanceAge, { key: "appearanceAge" })}
      </div>
      <div class="input-card">
        <h3>国籍・ルーツ${fieldLabel()}</h3>
        ${renderChipButtons(NATIONALITY_OPTIONS, state.profile.nationality, { key: "nationality" })}
      </div>
      <label class="input-card">
        <h3>参考URL${fieldLabel()}</h3>
        <textarea class="textarea compact-textarea" data-profile="referenceUrls" placeholder="イメージに近いURLを貼る">${escapeHtml(state.profile.referenceUrls || "")}</textarea>
        <span class="${hasUrl ? "loading-note" : "mini-note"}" data-url-note>${hasUrl ? "URLを読み込み中。そのまま入力を続けられます。" : "任意です。なければ空欄でOK。"}</span>
      </label>
      <div class="input-card">
        <h3>参考画像${fieldLabel()}</h3>
        <label class="reference-image-drop" for="reference-image-input">
          <span>${state.profile.referenceImageName ? escapeHtml(state.profile.referenceImageName) : "画像を追加"}</span>
          <small>任意です。近い雰囲気の画像があれば入れてください。</small>
        </label>
        <input class="file-input" id="reference-image-input" type="file" accept="image/*" data-reference-image>
      </div>
      ${renderOnboardingActions()}
    </div>
  `;
}

function renderFaceStep() {
  return `
    <div class="onboarding-screen">
      <div class="onboarding-copy">
        <p class="step-kicker">${stepKicker("face")}</p>
        <h2 id="onboarding-title">どんな顔にする？</h2>
        <p>近いものを3つまで。</p>
      </div>
      <div class="input-card">
        <h3>印象</h3>
        ${renderChipButtons(FACE_IMPRESSION_OPTIONS, state.profile.faceImpressions || [], { key: "faceImpressions", multi: true })}
      </div>
      <div class="input-card">
        <h3>目元</h3>
        ${renderChipButtons(EYE_OPTIONS, state.profile.eyeStyle, { key: "eyeStyle" })}
      </div>
      <div class="input-card">
        <h3>輪郭</h3>
        ${renderChipButtons(FACE_SHAPE_OPTIONS, state.profile.faceShape, { key: "faceShape" })}
      </div>
      <div class="input-card">
        <h3>表情</h3>
        ${renderChipButtons(EXPRESSION_OPTIONS, state.profile.expression, { key: "expression" })}
      </div>
      ${renderOnboardingActions()}
    </div>
  `;
}

function renderHairStep() {
  const lengthIndex = Number(state.profile.hairLength || 1);
  return `
    <div class="onboarding-screen">
      <div class="onboarding-copy">
        <p class="step-kicker">${stepKicker("hair")}</p>
        <h2 id="onboarding-title">髪はどうする？</h2>
      </div>
      <div class="input-card">
        <h3>長さ${fieldLabel("必須")}</h3>
        <input class="hair-range" type="range" min="0" max="4" step="1" value="${lengthIndex}" data-profile="hairLength">
        <div class="hair-labels">${HAIR_LENGTH_OPTIONS.map((label) => `<span>${escapeHtml(label)}</span>`).join("")}</div>
      </div>
      <div class="input-card">
        <h3>髪型${fieldLabel()}</h3>
        ${renderChipButtons(Object.entries(HAIR_STYLE_OPTIONS).map(([value, item]) => ({ value, label: item.label })), state.profile.hairStyle, { key: "hairStyle" })}
      </div>
      <div class="input-card">
        <h3>色${fieldLabel()}</h3>
        <div class="color-grid">
          ${COLOR_SWATCHES.map(([color, label]) => `
            <button class="swatch-button ${state.profile.hairColorCode === color ? "is-selected" : ""}" style="--swatch:${escapeHtml(color)}" type="button" data-hair-color-code="${escapeHtml(color)}" aria-label="${escapeHtml(label)}"></button>
          `).join("")}
        </div>
      </div>
      <label class="input-card">
        <h3>色のこだわり${fieldLabel()}</h3>
        <input class="input" data-profile="hairColorCustom" value="${escapeHtml(state.profile.hairColorCustom || "")}" placeholder="例: 毛先だけ少し明るめ">
      </label>
      ${renderOnboardingActions()}
    </div>
  `;
}

function renderClothesStep() {
  return `
    <div class="onboarding-screen">
      <div class="onboarding-copy">
        <p class="step-kicker">${stepKicker("clothes")}</p>
        <h2 id="onboarding-title">服と小物は？</h2>
        <p>なければ飛ばしてOK。</p>
      </div>
      <div class="input-card">
        <h3>服の雰囲気${fieldLabel()}</h3>
        ${renderChipButtons(CLOTHING_OPTIONS, state.profile.clothingStyle, { key: "clothingStyle" })}
      </div>
      <label class="input-card">
        <h3>アクセサリー${fieldLabel()}</h3>
        <input class="input" data-profile="accessories" value="${escapeHtml(state.profile.accessories || "")}" placeholder="例: 眼鏡、ピアス、ヘッドセット">
      </label>
      <label class="input-card">
        <h3>追加のこだわり${fieldLabel()}</h3>
        <textarea class="textarea compact-textarea" data-profile="lookCustomNote" placeholder="例: 清潔感はほしい。食事を見てもらいやすい雰囲気。">${escapeHtml(state.profile.lookCustomNote || "")}</textarea>
      </label>
      <label class="input-card">
        <h3>避けたいもの${fieldLabel()}</h3>
        <textarea class="textarea compact-textarea" data-profile="avoidLookNote" placeholder="なければ空欄でOK">${escapeHtml(state.profile.avoidLookNote || "")}</textarea>
      </label>
      ${renderOnboardingActions()}
    </div>
  `;
}

function renderPersonalizeStep() {
  lockTrainerSheet();
  return `
    <div class="onboarding-screen loading-screen" data-auto-advance="personalize">
      <div class="onboarding-copy">
        <p class="step-kicker">${stepKicker("personalize")}</p>
        <h2 id="onboarding-title">あなたのための担当を準備中</h2>
        <p>見た目の希望をまとめています。次は、食事の目的を少しだけ。</p>
      </div>
      <div class="loader-card is-birth"><span>準備中</span></div>
      <div class="tip-card"><strong>ここで反映しています</strong><p>見た目、参考URL、参考画像、避けたいものをまとめています。</p></div>
      <div class="mini-note center">自動で次へ進みます</div>
    </div>
  `;
}

function renderGoalStep() {
  const selected = state.profile.goal;
  return `
    <div class="onboarding-screen">
      <div class="onboarding-copy">
        <p class="step-kicker">${stepKicker("goal")}</p>
        <h2 id="onboarding-title">今の目標は？</h2>
      </div>
      <div class="choice-list">
        ${GOAL_OPTIONS.map((goal) => `
          <button class="choice-card" type="button" data-onboarding-goal="${escapeHtml(goal.value)}" aria-pressed="${selected === goal.value}">
            <strong>${escapeHtml(goal.label)}</strong>
            <span>${escapeHtml(goal.copy)}</span>
          </button>
        `).join("")}
      </div>
      <div class="input-card">
        <h3>進め方</h3>
        <div class="method-grid">
          ${METHOD_OPTIONS.map((method) => `
            <button class="method-card ${state.profile.method === method.value ? "is-selected" : ""}" type="button" data-profile-set="method" data-profile-value="${escapeHtml(method.value)}" aria-pressed="${state.profile.method === method.value}">
              <strong>${escapeHtml(method.label)}</strong>
              <span>${escapeHtml(method.copy)}</span>
            </button>
          `).join("")}
        </div>
      </div>
      <div class="inline-fields">
        <label class="field"><span>いまの体重（任意）</span><input class="input" inputmode="decimal" data-profile="currentWeight" value="${escapeHtml(state.profile.currentWeight || "")}" placeholder="例: 68"></label>
        <label class="field"><span>目標体重（任意）</span><input class="input" inputmode="decimal" data-profile="targetWeight" value="${escapeHtml(state.profile.targetWeight || "")}" placeholder="例: 64"></label>
      </div>
      <p class="mini-note">未入力でも進めます。</p>
      ${renderOnboardingActions()}
    </div>
  `;
}

function renderRelationshipStep() {
  return `
    <div class="onboarding-screen">
      <div class="onboarding-copy">
        <p class="step-kicker">${stepKicker("relationship")}</p>
        <h2 id="onboarding-title">どんな存在がいい？</h2>
      </div>
      <div class="input-card">
        <h3>関係性${fieldLabel("必須")}</h3>
        ${renderChipButtons(RELATIONSHIP_OPTIONS, state.profile.relationship, { key: "relationship" })}
      </div>
      <label class="input-card">
        <h3>話し方の希望${fieldLabel()}</h3>
        <input class="input" data-profile="voiceMemo" value="${escapeHtml(state.profile.voiceMemo || "")}" placeholder="例: ほめてほしい。でも甘やかしすぎないでほしい。">
      </label>
      <label class="input-card">
        <h3>なんて呼ばれたい？${fieldLabel()}</h3>
        <input class="input" data-profile="nickname" value="${escapeHtml(state.profile.nickname || "")}" placeholder="あなた">
      </label>
      ${renderOnboardingActions({ nextLabel: "食事パートナーを作る" })}
    </div>
  `;
}

function renderGeneratingStep() {
  ensureTrainerSheet();
  return `
    <div class="onboarding-screen loading-screen" data-auto-advance="generating">
      <div class="onboarding-copy">
        <p class="step-kicker">${stepKicker("generating")}</p>
        <h2 id="onboarding-title">あなたのための相棒が誕生中</h2>
        <p>生成を進めながら、最初の食事チェックへ進みます。</p>
      </div>
      <div class="loader-card is-birth"><span>生成中</span></div>
      <div class="tip-card"><strong>もうすぐ会えます</strong><p>先に、直前に食べたものを一言だけ教えてください。</p></div>
      <div class="action-card is-static"><div class="action-icon">飯</div><div><strong>このあと食事入力へ進みます</strong><p>最初の一言に使います</p></div></div>
    </div>
  `;
}

function renderFirstReportStep() {
  return `
    <div class="onboarding-screen first-report-screen g3-first-report-screen">
      <div class="g3-first-report-stage" role="group" aria-labelledby="onboarding-title">
        <div class="sr-only">
          <p class="step-kicker">${stepKicker("firstReport")}</p>
          <h2 id="onboarding-title">さっき、何食べた？</h2>
          <p>このサービスを開く直前に食べたものを、覚えている範囲でOK。</p>
        </div>
        <label class="g3-first-meal-photo" for="onboarding-photo-input" aria-label="写真を追加">
          ${state.draftPhotoName ? `<span>${escapeHtml(state.draftPhotoName)}</span>` : ""}
        </label>
        <input class="file-input" id="onboarding-photo-input" type="file" accept="image/*" data-photo>
        <textarea class="g3-first-meal-text" data-draft aria-label="食事メモ" placeholder="例：おにぎり2個、サラダチキン、野菜スープ">${escapeHtml(state.draft)}</textarea>
        <button class="g3-first-meal-sample g3-image-button" type="button" data-action="use-sample-meal" aria-label="サンプルを入れる">
          <img src="assets/g3-ui-buttons/g3-btn-006-sample-meal.png" alt="">
        </button>
        <button class="g3-first-meal-next g3-image-button" type="button" data-action="onboarding-next" aria-label="ご対面へ進む">
          <img src="assets/g3-ui-buttons/g3-btn-006-next.png" alt="">
        </button>
      </div>
    </div>
  `;
}

function renderRevealStep() {
  const sheet = ensureTrainerSheet();
  const trainer = trainerFromSheet(sheet);
  return `
    <div class="onboarding-screen reveal-screen g3-reveal-screen">
      <div class="onboarding-copy reveal-copy">
        <p class="step-kicker">${stepKicker("reveal")}</p>
        <h2 id="onboarding-title">会えました。</h2>
        <p>あなた専用の食事パートナーです。</p>
      </div>
      <div class="reveal-portrait is-hero">
        ${renderTrainerVisual(trainer.look, "hero")}
      </div>
      <div class="reveal-confirm-card">
        <div class="name-edit">
          <strong>${escapeHtml(trainer.name)}</strong>
          <span>名前はあとで変更できます</span>
        </div>
        <div class="feedback-card">
          <strong>${escapeHtml(trainer.name)}が担当します</strong>
          <p>${escapeHtml(state.profile.nickname || "あなた")}、今日から一緒に見ていくね。さっきの食事、ちゃんと届いています。</p>
        </div>
        <p class="mini-note">顔、名前、言葉づかいはあとから変えられます。</p>
        ${renderOnboardingActions({
          nextLabel: `${trainer.name}と始める`,
          nextAction: "prepare-first-feedback",
          secondary: getOnboardingRoute() === "sample"
            ? `<button class="button secondary" type="button" data-action="start-sample">6人から選び直す</button><button class="button secondary" type="button" data-action="start-custom">自分で作る</button>`
            : `<button class="button secondary" type="button" data-action="onboarding-adjust">少し調整</button>`
        })}
      </div>
    </div>
  `;
}

function renderAdjustStep() {
  const trainer = state.profile.trainerSheet ? trainerFromSheet(state.profile.trainerSheet) : buildTrainerProfile(state.profile);
  return `
    <div class="onboarding-screen adjust-screen">
      <div class="onboarding-copy">
        <p class="step-kicker">${stepKicker("adjust")}</p>
        <h2 id="onboarding-title">どこを直す？</h2>
        <p>気になるところだけ書いてください。</p>
      </div>
      <div class="reveal-portrait small">
        ${renderTrainerVisual(trainer.look, "hero")}
      </div>
      <label class="input-card"><h3>直したい場所</h3><textarea class="textarea compact-textarea" data-profile="adjustWhere" placeholder="顔、髪、服、全体の雰囲気など">${escapeHtml(state.profile.adjustWhere || "")}</textarea></label>
      <label class="input-card"><h3>どう変えたい？</h3><textarea class="textarea compact-textarea" data-profile="adjustHow" placeholder="もう少しやさしい表情に。髪色は暗めに。">${escapeHtml(state.profile.adjustHow || "")}</textarea></label>
      <label class="input-card"><h3>避けたいこと</h3><textarea class="textarea compact-textarea" data-profile="adjustAvoid" placeholder="幼すぎる雰囲気は避けたい">${escapeHtml(state.profile.adjustAvoid || "")}</textarea></label>
      ${renderOnboardingActions({
        nextLabel: "調整して作り直す",
        nextAction: "apply-onboarding-adjustment",
        secondary: `<button class="button secondary" type="button" data-action="skip-adjustment">このまま始める</button>`
      })}
    </div>
  `;
}

function reportForOnboardingFeedback() {
  if (state.onboarding.firstReportId) {
    return state.reports.find((report) => report.id === state.onboarding.firstReportId) || state.reports[0] || null;
  }
  return state.reports[0] || null;
}

function renderFeedbackStep() {
  const report = reportForOnboardingFeedback();
  const trainer = state.profile.trainerSheet ? trainerFromSheet(state.profile.trainerSheet) : buildTrainerProfile(state.profile);
  const n = report?.analysis?.nutrition || { calories: 0, protein: 0, fat: 0, carbs: 0, signals: {} };
  const mealText = report?.text || "さけの塩焼き定食";
  const veggieCopy = n.signals?.veggieHits ? "あと少し" : "少し足す";
  const proteinCopy = n.protein >= 22 ? "ちょうどいい" : "少し足す";
  const carbCopy = n.carbs >= 40 && n.carbs <= 75 ? "ちょうどいい" : "量を見る";
  return `
    <div class="onboarding-screen feedback-screen">
      <div class="feedback-profile">
        ${renderTrainerVisual(trainer.look, "mini")}
        <div>
          <strong>${escapeHtml(trainer.name)}</strong>
          <span>あなた専用の食事パートナー</span>
        </div>
      </div>
      <div class="partner-bubble">
        <strong>見せてくれてありがとう。</strong>
        <p>バランスの取れた、いい食事だね。いくつか気づいたことをシェアするね。</p>
      </div>
      <article class="meal-summary-card">
        <div class="meal-thumb" aria-hidden="true">
          <span class="plate rice"></span>
          <span class="plate soup"></span>
          <span class="plate main"></span>
          <span class="plate salad"></span>
        </div>
        <div>
          <span class="meal-label">今日の食事</span>
          <strong>${escapeHtml(mealText)}</strong>
          <small>今日 ${formatTime(report?.at || new Date().toISOString())}</small>
        </div>
      </article>
      <div class="metric-chip-row">
        <span><em>たんぱく質</em><strong>${proteinCopy}</strong></span>
        <span><em>野菜</em><strong>${veggieCopy}</strong></span>
        <span><em>ごはん量</em><strong>${carbCopy}</strong></span>
      </div>
      <div class="feedback-story-card">
        <section>
          <span class="story-icon">太陽</span>
          <div>
            <strong>良かった点</strong>
            <p>主菜と汁物が入っていて、次の食事へ戻しやすい内容です。</p>
          </div>
        </section>
        <section>
          <span class="story-icon">メモ</span>
          <div>
            <strong>今日のメモ</strong>
            <p>野菜がもう少し増えると、満足感と食物繊維を取りやすくなります。</p>
          </div>
        </section>
        <section>
          <span class="story-icon">一手</span>
          <div>
            <strong>次の一手</strong>
            <p>次の食事で、あと一品「野菜のおかず」を追加してみよう。</p>
          </div>
        </section>
      </div>
      <div class="support-art-card">
        <div class="support-art-copy">
          <strong>応援画像</strong>
          <p>いい感じだよ!<br>この調子で一緒にがんばろうね。</p>
        </div>
        ${renderTrainerVisual(trainer.look, "support")}
        <div class="support-meal" aria-hidden="true"><span></span><span></span><span></span></div>
      </div>
      ${renderOnboardingActions({ nextLabel: "次の食事も見せる", back: false })}
    </div>
  `;
}

function renderPaywallStep() {
  const selected = state.profile.paywallIntent;
  const trainer = state.profile.trainerSheet ? trainerFromSheet(state.profile.trainerSheet) : buildTrainerProfile(state.profile);
  const actions = [
    ["grow", "相棒を育てる", "見た目や言葉づかいを調整"],
    ["meal", "もう1食見てもらう", "次の食事もすぐ返してもらう"],
    ["data", "体のデータで精度アップ", "体重や目標に合わせる"]
  ];
  return `
    <div class="onboarding-screen paywall-screen">
      <div class="paywall-hero">
        <div>
          <h2 id="onboarding-title">このまま、<br>もっと一緒に</h2>
          <p>${escapeHtml(trainer.name)}と一緒なら、あなたの毎日がちゃんと変わっていきます。</p>
        </div>
        ${renderTrainerVisual(trainer.look, "paywall")}
      </div>
      <p class="paywall-lead">次にしたいことを選んでください</p>
      <div class="action-list">
        ${actions.map(([value, title, copy]) => `
          <button class="action-card ${selected === value ? "is-selected" : ""}" type="button" data-paywall-intent="${value}" aria-pressed="${selected === value}">
            <div class="action-icon">${value === "meal" ? "飯" : value === "data" ? "kg" : "芽"}</div>
            <div><strong>${escapeHtml(title)}</strong><p>${escapeHtml(copy)}</p></div>
            <span class="action-arrow" aria-hidden="true">›</span>
          </button>
        `).join("")}
      </div>
      <p class="mini-note">選ぶと、続けるプランへの移行意向として記録します。MVPでは実決済は行いません。</p>
      ${renderOnboardingActions({
        nextLabel: "続ける",
        nextAction: "finish-onboarding",
        back: false,
        secondary: `<button class="button secondary" type="button" data-action="finish-onboarding" data-paywall-dismiss="true">今はここまで</button>`
      })}
    </div>
  `;
}

function setOnboardingScreen(screen) {
  state.onboarding.screen = screen;
  if (screen === "generating" || screen === "personalize") {
    state.onboarding.generatedStartedAt = new Date().toISOString();
  }
  if (screen === "paywall" && !state.profile.paywallSeenAt) {
    const seenAt = new Date().toISOString();
    state.profile.paywallSeenAt = seenAt;
    logEvent("fake_paywall_seen", { route: getOnboardingRoute(), screen, seenAt });
  }
}

function scheduleOnboardingAutoAdvance() {
  clearTimeout(onboardingAutoTimer);
  const screen = getOnboardingScreen();
  if (screen !== "personalize" && screen !== "generating") return;
  onboardingAutoTimer = setTimeout(() => {
    if (!state.profile.onboarded && getOnboardingScreen() === screen) {
      advanceOnboarding();
    }
  }, screen === "personalize" ? 1800 : 2600);
}

function advanceOnboarding() {
  const screen = getOnboardingScreen();
  const flow = getOnboardingFlow();
  const index = onboardingIndex(screen);
  if (screen === "sample" && !state.profile.lookPreset) {
    applyLookPreset("asuna");
  }
  if (["clothes", "relationship", "sample"].includes(screen)) {
    lockTrainerSheet();
  }
  if (screen === "firstReport" && !state.draft.trim()) {
    showToast("覚えている範囲で大丈夫です。1行だけ入れてください。");
    return;
  }
  const next = flow[Math.min(flow.length - 1, index + 1)];
  setOnboardingScreen(next);
  logEvent("onboarding_step_viewed", { screen: next, route: getOnboardingRoute() });
  saveState();
  render();
}

function backOnboarding() {
  const flow = getOnboardingFlow();
  const index = onboardingIndex();
  const previous = flow[Math.max(0, index - 1)];
  setOnboardingScreen(previous);
  saveState();
  render();
}

function ensureFirstFeedbackReport() {
  const existing = reportForOnboardingFeedback();
  if (existing) return existing;
  const text = state.draft.trim();
  if (!text) {
    showToast("最初の食事を1行だけ入れてください。");
    setOnboardingScreen("firstReport");
    saveState();
    render();
    return null;
  }
  const report = recordMealReport(text, { hadPhoto: Boolean(state.draftPhotoName), photoName: state.draftPhotoName });
  state.onboarding.firstReportId = report.id;
  state.draft = "";
  state.draftPhotoName = "";
  return report;
}

function prepareFirstFeedback() {
  const report = ensureFirstFeedbackReport();
  if (!report) return;
  setOnboardingScreen("feedback");
  logEvent("onboarding_first_feedback_ready", {
    reportId: report.id,
    route: getOnboardingRoute(),
    ...trainerSheetEventPayload(state.profile.trainerSheet)
  });
  saveState();
  render();
}

function applyOnboardingAdjustment() {
  const parts = [
    state.profile.adjustWhere ? `直したい場所: ${state.profile.adjustWhere}` : "",
    state.profile.adjustHow ? `どう変えたいか: ${state.profile.adjustHow}` : "",
    state.profile.adjustAvoid ? `避けたいこと: ${state.profile.adjustAvoid}` : ""
  ].filter(Boolean);
  if (!parts.length) {
    showToast("直したい内容をどれか1つ書いてください。");
    return;
  }
  const currentSheet = ensureTrainerSheet();
  state.profile.trainerSheet = {
    ...currentSheet,
    updatedAt: new Date().toISOString(),
    revision: Number(currentSheet.revision || 1) + 1,
    editInstruction: parts.join("\n"),
    characterSheetText: ""
  };
  state.profile.trainerImageData = "";
  state.profile.trainerImageName = "";
  logEvent("trainer_adjusted_once", { sheetId: state.profile.trainerSheet.id, revision: state.profile.trainerSheet.revision });
  setOnboardingScreen("reveal");
  saveState();
  render();
}

function recordMealReport(text, { hadPhoto = Boolean(state.draftPhotoName), photoName = state.draftPhotoName } = {}) {
  const trainerSheet = ensureTrainerSheet();
  const sheetEvent = trainerSheetEventPayload(trainerSheet);
  const analysis = analyzeMeal(text);
  const reply = buildReply(text, analysis);
  const score = scoreReply(reply, analysis);
  const report = {
    id: id("rep"),
    at: new Date().toISOString(),
    text,
    hadPhoto,
    photoName,
    analysis,
    reply,
    score,
    trainerSheet: sheetEvent
  };

  state.reports.unshift(report);
  state.reports = state.reports.slice(0, 40);
  logEvent("meal_report_submitted", {
    reportId: report.id,
    safetyLevel: analysis.safety.level,
    confidence: Number(analysis.nutrition.confidence.toFixed(2)),
    hadPhoto: report.hadPhoto,
    ...sheetEvent
  });
  logEvent("ai_reply_viewed", {
    reportId: report.id,
    score: score.total,
    safetyGate: score.safetyGate,
    ...sheetEvent
  });
  if (analysis.safety.safetyFlag) {
    logEvent("safety_flag_triggered", {
      reportId: report.id,
      level: analysis.safety.level,
      signals: analysis.safety.signals,
      ...sheetEvent
    });
  }
  return report;
}

function submitReport() {
  const text = state.draft.trim();
  if (!text) {
    showToast("ざっくりで大丈夫です。食べたものを1つだけ書いてください。");
    return;
  }
  recordMealReport(text);
  state.draft = "";
  state.draftPhotoName = "";
  saveState();
  render();
}

function submitOnboarding({ sendFirstReport = false } = {}) {
  state.profile.nickname = state.profile.nickname.trim();
  state.profile.persona = inferPersona(state.profile);
  state.profile.onboarded = true;
  state.onboarding.screen = "start";
  if (sendFirstReport) {
    const text = state.draft.trim();
    if (!text) {
      showToast("1行で大丈夫です。最初の報告を入れてください。");
      state.profile.onboarded = false;
      setOnboardingScreen("firstReport");
      return;
    }
    recordMealReport(text, { hadPhoto: false, photoName: "" });
    state.draft = "";
    state.draftPhotoName = "";
  }
  state.activeTab = "report";
  const sheet = state.profile.trainerSheet || lockTrainerSheet();
  logEvent("onboarding_completed", {
    sheetId: sheet.id,
    sheetSource: sheet.source,
    goal: state.profile.goal,
    method: state.profile.method,
    artStyle: state.profile.artStyle,
    hairStyle: state.profile.hairStyle,
    hairColor: state.profile.hairColorCustom || state.profile.hairColorCode || state.profile.hairColor,
    outfitColor: state.profile.outfitColor,
    impression: state.profile.impression,
    lookPreset: state.profile.lookPreset,
    hasLookCustomNote: Boolean(String(state.profile.lookCustomNote || "").trim()),
    referenceUrlCount: normalizeReferenceUrls(state.profile.referenceUrls).length,
    hasReferenceImage: Boolean(state.profile.referenceImageData),
    hasTrainerImage: Boolean(state.profile.trainerImageData),
    persona: state.profile.persona,
    sentFirstReport: sendFirstReport || Boolean(state.onboarding.firstReportId),
    paywallIntent: state.profile.paywallIntent || ""
  });
  saveState();
  render();
}

function loadDemo() {
  state.onboarding = {
    screen: "start",
    route: "sample",
    generatedStartedAt: "",
    firstReportId: ""
  };
  state.profile = {
    nickname: "けい",
    goal: "食生活を整える",
    method: "食事バランス",
    currentWeight: "",
    targetWeight: "",
    artStyle: "anime",
    lookPreset: "asuna",
    appearanceGender: "女性",
    appearanceAge: "20代前半",
    nationality: "日本",
    faceImpressions: ["やさしい"],
    eyeStyle: "目が大きめ",
    faceShape: "卵型",
    expression: "自然な笑顔",
    hairLength: 2,
    hairStyle: "medium",
    hairColor: "warm",
    hairColorCode: "#9a623a",
    hairColorCustom: "",
    outfitColor: "mint",
    clothingStyle: "シンプル",
    accessories: "",
    avoidLookNote: "",
    relationship: "ほめ上手な友達",
    voiceMemo: "",
    impression: "friendly",
    lookCustomNote: "",
    referenceUrls: "",
    referenceImageData: "",
    referenceImageName: "",
    adjustWhere: "",
    adjustHow: "",
    adjustAvoid: "",
    paywallIntent: "meal",
    trainerSheet: null,
    sheetEditDraft: "",
    trainerImageData: "",
    trainerImageName: "",
    persona: "bright",
    consent: true,
    onboarded: true
  };
  state.memories = [
    { id: id("mem"), text: "夜に甘いものが欲しくなりやすい", pinned: true, createdAt: new Date().toISOString() },
    { id: id("mem"), text: "忙しい日はコンビニ食で整えたい", pinned: false, createdAt: new Date().toISOString() }
  ];
  state.draft = "昼：コンビニのサラダチキン、おにぎり、野菜スープ";
  lockTrainerSheet();
  logEvent("demo_loaded", {});
  saveState();
  render();
}

function addMemory(text, pinned = false) {
  const clean = text.trim();
  if (!clean) return;
  if (state.memories.some((memory) => memory.text === clean)) {
    showToast("同じ記憶がすでにあります。");
    return;
  }
  state.memories.unshift({
    id: id("mem"),
    text: clean,
    pinned,
    createdAt: new Date().toISOString()
  });
  logEvent("memory_saved", { text: clean });
  saveState();
  render();
}

function generateSamples() {
  const baseProfile = {
    nickname: state.profile.nickname || "けい",
    goal: state.profile.goal || "食事バランスを整えたい",
    artStyle: state.profile.artStyle || "photo",
    lookPreset: state.profile.lookPreset || "",
    hairStyle: state.profile.hairStyle || "short",
    hairColor: state.profile.hairColor || "dark",
    outfitColor: state.profile.outfitColor || "white",
    impression: state.profile.impression || "clean",
    lookCustomNote: state.profile.lookCustomNote || "",
    referenceUrls: state.profile.referenceUrls || "",
    persona: state.profile.persona || "steady"
  };
  const samples = Array.from({ length: 100 }, (_, index) => {
    const meal = SAMPLE_MEALS[index % SAMPLE_MEALS.length];
    const analysis = analyzeMeal(meal, { history: [] });
    const profile = {
      ...baseProfile,
      persona: Object.keys(PERSONAS)[index % Object.keys(PERSONAS).length]
    };
    const reply = buildReply(meal, analysis, profile);
    const score = scoreReply(reply, analysis, profile);
    return {
      index: index + 1,
      meal,
      analysis,
      reply,
      score
    };
  });
  state.samples = samples;
  logEvent("reply_samples_generated", { count: samples.length });
  saveState();
  render();
}

function downloadSamples() {
  if (!state.samples.length) return;
  const blob = new Blob([JSON.stringify(state.samples, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = `ai-oshi-reply-samples-${new Date().toISOString().slice(0, 10)}.json`;
  anchor.click();
  URL.revokeObjectURL(url);
  logEvent("reply_samples_downloaded", { count: state.samples.length });
  saveState();
}

function buildResearchInputRows() {
  const rows = [];
  const add = (label, source, value) => {
    const clean = Array.isArray(value) ? value.filter(Boolean).join("\n") : String(value || "").trim();
    if (!clean) return;
    rows.push({ label, source, value: clean });
  };
  add("見た目メモ", "profile.lookCustomNote", state.profile.lookCustomNote);
  add("避けたい見た目", "profile.avoidLookNote", state.profile.avoidLookNote);
  add("参考URL", "profile.referenceUrls", normalizeReferenceUrls(state.profile.referenceUrls));
  add("話し方の希望", "profile.voiceMemo", state.profile.voiceMemo);
  add("調整: 場所", "profile.adjustWhere", state.profile.adjustWhere);
  add("調整: 内容", "profile.adjustHow", state.profile.adjustHow);
  add("調整: NG", "profile.adjustAvoid", state.profile.adjustAvoid);
  state.reports.forEach((report, index) => add(`食事本文 #${index + 1}`, `reports[${index}].text`, report.text));
  return rows;
}

function buildResearchExport() {
  const sheet = state.profile.trainerSheet || null;
  const rows = buildResearchInputRows();
  return {
    schemaVersion: 1,
    exportedAt: new Date().toISOString(),
    storageKey: STORAGE_KEY,
    note: "初期分析用の研究エクスポート。events[]には本文を複製せず、このexportにだけ原文を含める。",
    onboarding: {
      route: state.onboarding.route,
      screen: state.onboarding.screen,
      firstReportId: state.onboarding.firstReportId
    },
    profile: {
      goal: state.profile.goal,
      method: state.profile.method,
      artStyle: state.profile.artStyle,
      lookPreset: state.profile.lookPreset,
      appearanceGender: state.profile.appearanceGender,
      appearanceAge: state.profile.appearanceAge,
      nationality: state.profile.nationality,
      relationship: state.profile.relationship,
      nickname: state.profile.nickname,
      currentWeight: state.profile.currentWeight,
      targetWeight: state.profile.targetWeight,
      lookCustomNote: state.profile.lookCustomNote,
      avoidLookNote: state.profile.avoidLookNote,
      referenceUrlsRaw: state.profile.referenceUrls,
      referenceUrls: normalizeReferenceUrls(state.profile.referenceUrls),
      referenceImageName: state.profile.referenceImageName || "",
      hasReferenceImage: Boolean(state.profile.referenceImageData),
      voiceMemo: state.profile.voiceMemo,
      adjustWhere: state.profile.adjustWhere,
      adjustHow: state.profile.adjustHow,
      adjustAvoid: state.profile.adjustAvoid
    },
    trainerSheet: sheet ? {
      id: sheet.id,
      revision: sheet.revision,
      source: sheet.source,
      visual: sheet.visual,
      voice: sheet.voice,
      editInstruction: sheet.editInstruction || "",
      characterSheetText: sheet.characterSheetText || buildLocalCharacterSheetText(sheet, state.profile)
    } : null,
    reports: state.reports.map((report) => ({
      id: report.id,
      at: report.at,
      text: report.text,
      hadPhoto: Boolean(report.hadPhoto),
      photoName: report.photoName || "",
      trainerSheet: report.trainerSheet || null
    })),
    inputRows: rows,
    eventSummary: state.events.map((event) => ({
      type: event.type,
      at: event.at,
      payloadKeys: Object.keys(event.payload || {})
    }))
  };
}

function researchExportMeta(exportData = buildResearchExport()) {
  return {
    rowCount: exportData.inputRows.length,
    reportCount: exportData.reports.length,
    referenceUrlCount: exportData.profile.referenceUrls.length,
    hasTrainerSheet: Boolean(exportData.trainerSheet)
  };
}

function copyResearchExport() {
  const exportData = buildResearchExport();
  copyText(JSON.stringify(exportData, null, 2))
    .then(() => showToast("研究用入力ログをコピーしました。"))
    .catch(() => showToast("コピーできませんでした。"));
  logEvent("research_export_copied", researchExportMeta(exportData));
}

function downloadResearchExport() {
  const exportData = buildResearchExport();
  const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = `ai-food-partner-research-export-${new Date().toISOString().slice(0, 10)}.json`;
  anchor.click();
  URL.revokeObjectURL(url);
  logEvent("research_export_downloaded", researchExportMeta(exportData));
  saveState();
}

function resetLedger() {
  state.ledger = defaultState().ledger;
  logEvent("ledger_reset", {});
  saveState();
  render();
}

function resetDemo() {
  state.reports = [];
  state.events = [];
  state.samples = [];
  state.draft = "";
  state.draftPhotoName = "";
  saveState();
  render();
  showToast("報告履歴を初期化しました。");
}

document.addEventListener("submit", (event) => {
  const form = event.target.closest("[data-form]");
  if (!form) return;
  event.preventDefault();
  const formType = form.dataset.form;
  if (formType === "report") submitReport();
  if (formType === "onboarding") submitOnboarding();
  if (formType === "memory") {
    addMemory(new FormData(form).get("memory") || "");
    form.reset();
  }
});

document.addEventListener("click", (event) => {
  const tab = event.target.closest("[data-tab]");
  if (tab) {
    state.activeTab = tab.dataset.tab;
    saveState();
    render();
    return;
  }

  const chip = event.target.closest("[data-chip]");
  if (chip) {
    state.draft = state.draft ? `${state.draft}\n${chip.dataset.chip}` : chip.dataset.chip;
    saveState();
    render();
    return;
  }

  const profileSet = event.target.closest("[data-profile-set]");
  if (profileSet) {
    const key = profileSet.dataset.profileSet;
    const value = profileSet.dataset.profileValue;
    state.profile[key] = value;
    if (["appearanceGender", "appearanceAge", "nationality", "eyeStyle", "faceShape", "expression", "hairStyle", "clothingStyle", "relationship", "method"].includes(key)) {
      invalidateTrainerSheet();
    }
    state.profile.persona = inferPersona(state.profile);
    if (["appearanceGender", "appearanceAge", "nationality", "eyeStyle", "faceShape", "expression", "hairStyle", "clothingStyle", "relationship", "method"].includes(key)) {
      logEvent("onboarding_profile_option_selected", { key, value, route: getOnboardingRoute() });
    }
    saveState();
    render();
    return;
  }

  const toggleList = event.target.closest("[data-toggle-list]");
  if (toggleList) {
    const key = toggleList.dataset.toggleList;
    const value = toggleList.dataset.toggleValue;
    const current = Array.isArray(state.profile[key]) ? [...state.profile[key]] : [];
    const exists = current.includes(value);
    state.profile[key] = exists ? current.filter((item) => item !== value) : [...current, value].slice(0, 3);
    invalidateTrainerSheet();
    saveState();
    render();
    return;
  }

  const hairColor = event.target.closest("[data-hair-color-code]");
  if (hairColor) {
    state.profile.hairColorCode = hairColor.dataset.hairColorCode;
    state.profile.hairColor = "dark";
    invalidateTrainerSheet();
    saveState();
    render();
    return;
  }

  const paywallIntent = event.target.closest("[data-paywall-intent]");
  if (paywallIntent) {
    state.profile.paywallIntent = paywallIntent.dataset.paywallIntent;
    state.profile.paywallIntentClickedAt = new Date().toISOString();
    logEvent("fake_paywall_intent_clicked", { intent: state.profile.paywallIntent, route: getOnboardingRoute() });
    logEvent("fake_paywall_intent_selected", { intent: state.profile.paywallIntent });
    saveState();
    render();
    return;
  }

  const onboardingGoal = event.target.closest("[data-onboarding-goal]");
  if (onboardingGoal) {
    state.profile.goal = onboardingGoal.dataset.onboardingGoal;
    state.profile.persona = inferPersona(state.profile);
    logEvent("food_goal_selected", { goal: state.profile.goal, route: getOnboardingRoute() });
    saveState();
    render();
    return;
  }

  const artStyle = event.target.closest("[data-art-style]");
  if (artStyle) {
    const value = artStyle.dataset.artStyle;
    if (ART_STYLE_OPTIONS[value]) {
      state.profile.artStyle = value;
      invalidateTrainerSheet();
      logEvent("art_style_selected", { artStyle: value, route: getOnboardingRoute() });
    }
    saveState();
    render();
    return;
  }

  const readyCharacter = event.target.closest("[data-ready-character]");
  if (readyCharacter) {
    const presetKey = readyCharacter.dataset.readyCharacter;
    if (applyLookPreset(presetKey)) {
      lockTrainerSheet();
      state.onboarding.route = "sample";
      logEvent("sample_trainer_selected", {
        preset: presetKey,
        ...trainerSheetEventPayload(state.profile.trainerSheet)
      });
    }
    saveState();
    render();
    return;
  }

  const lookPreset = event.target.closest("[data-look-preset]");
  if (lookPreset) {
    applyLookPreset(lookPreset.dataset.lookPreset);
    saveState();
    render();
    return;
  }

  const lookField = event.target.closest("[data-look-field]");
  if (lookField) {
    const key = lookField.dataset.lookField;
    const value = lookField.dataset.lookValue;
    if (["hairStyle", "hairColor", "outfitColor", "impression"].includes(key)) {
      state.profile[key] = value;
      state.profile.lookPreset = "";
      invalidateTrainerSheet();
      state.profile.persona = inferPersona(state.profile);
      logEvent("appearance_option_selected", { key, value, route: getOnboardingRoute() });
    }
    saveState();
    render();
    return;
  }

  const action = event.target.closest("[data-action]");
  if (!action) return;
  const actionName = action.dataset.action;

  if (actionName === "load-demo") loadDemo();
  if (actionName === "start-custom") {
    state.onboarding.route = "custom";
    state.profile.lookPreset = "";
    invalidateTrainerSheet();
    setOnboardingScreen("style");
    logEvent("onboarding_route_selected", { route: "custom" });
    saveState();
    render();
  }
  if (actionName === "start-sample") {
    state.onboarding.route = "sample";
    if (!state.profile.lookPreset) applyLookPreset("asuna");
    setOnboardingScreen("sample");
    logEvent("onboarding_route_selected", { route: "sample" });
    saveState();
    render();
  }
  if (actionName === "onboarding-next") {
    advanceOnboarding();
  }
  if (actionName === "onboarding-back") {
    backOnboarding();
  }
  if (actionName === "finish-onboarding") {
    if (action.dataset.paywallDismiss === "true") {
      state.profile.paywallDismissedAt = new Date().toISOString();
      logEvent("fake_paywall_dismissed", {
        intent: state.profile.paywallIntent || "",
        route: getOnboardingRoute()
      });
    }
    submitOnboarding({ sendFirstReport: false });
  }
  if (actionName === "finish-onboarding-with-report") submitOnboarding({ sendFirstReport: true });
  if (actionName === "use-sample-meal") {
    state.draft = "おにぎり2個、サラダチキン、野菜スープ";
    state.draftPhotoName = "sample-meal.jpg";
    logEvent("onboarding_sample_meal_used", { route: getOnboardingRoute() });
    saveState();
    render();
  }
  if (actionName === "prepare-first-feedback") prepareFirstFeedback();
  if (actionName === "onboarding-adjust") {
    setOnboardingScreen("adjust");
    saveState();
    render();
  }
  if (actionName === "apply-onboarding-adjustment") applyOnboardingAdjustment();
  if (actionName === "skip-adjustment") prepareFirstFeedback();
  if (actionName === "copy-trainer-prompt") {
    const sheet = ensureTrainerSheet();
    copyText(buildTrainerImagePrompt(sheet, state.profile))
      .then(() => showToast("画像生成文をコピーしました。"))
      .catch(() => showToast("コピーできませんでした。"));
    logEvent("trainer_image_prompt_copied", {
      sheetId: sheet.id,
      artStyle: state.profile.artStyle,
      hairStyle: state.profile.hairStyle,
      hairColor: state.profile.hairColor,
      outfitColor: state.profile.outfitColor,
      impression: state.profile.impression,
      hasLookCustomNote: Boolean(String(sheet.visual?.customNote || "").trim()),
      referenceUrlCount: sheet.visual?.referenceUrls?.length || 0
    });
  }
  if (actionName === "update-trainer-sheet") updateTrainerSheetFromInstruction(state.profile.sheetEditDraft);
  if (actionName === "clear-trainer-image") {
    state.profile.trainerImageData = "";
    state.profile.trainerImageName = "";
    logEvent("trainer_image_cleared", {});
    saveState();
    render();
  }
  if (actionName === "reset-demo") resetDemo();
  if (actionName === "generate-samples") generateSamples();
  if (actionName === "download-samples") downloadSamples();
  if (actionName === "copy-research-export") copyResearchExport();
  if (actionName === "download-research-export") downloadResearchExport();
  if (actionName === "reset-ledger") resetLedger();
  if (actionName === "remember-candidate") {
    const report = state.reports.find((item) => item.id === action.dataset.reportId);
    if (report?.analysis?.memoryCandidate) addMemory(report.analysis.memoryCandidate, false);
  }
  if (actionName === "toggle-memory") {
    const memory = state.memories.find((item) => item.id === action.dataset.memoryId);
    if (memory) {
      memory.pinned = !memory.pinned;
      logEvent("memory_pin_changed", { id: memory.id, pinned: memory.pinned });
      saveState();
      render();
    }
  }
  if (actionName === "delete-memory") {
    const before = state.memories.length;
    state.memories = state.memories.filter((item) => item.id !== action.dataset.memoryId);
    if (state.memories.length !== before) logEvent("memory_deleted", { id: action.dataset.memoryId });
    saveState();
    render();
  }
});

document.addEventListener("input", (event) => {
  const target = event.target;
  if (target.matches("[data-draft]")) {
    state.draft = target.value;
    saveState();
  }
  if (target.matches("[data-profile]")) {
    const key = target.dataset.profile;
    if (target.type === "checkbox") {
      state.profile[key] = target.checked;
    } else if (target.type === "range") {
      state.profile[key] = Number(target.value);
    } else {
      state.profile[key] = target.value;
    }
    if (["lookCustomNote", "referenceUrls", "hairLength", "hairColorCustom", "accessories", "avoidLookNote", "voiceMemo"].includes(key)) {
      invalidateTrainerSheet();
    }
    if (key === "referenceUrls") {
      const note = target.closest(".input-card")?.querySelector("[data-url-note]");
      if (note) {
        const hasUrl = normalizeReferenceUrls(target.value).length > 0;
        note.className = hasUrl ? "loading-note" : "mini-note";
        note.textContent = hasUrl ? "URLを読み込み中。そのまま入力を続けられます。" : "任意です。なければ空欄でOK。";
      }
    }
    const trainerPreview = document.querySelector("[data-trainer-preview]");
    if (trainerPreview && key === "nickname") {
      const trainer = state.profile.trainerSheet ? trainerFromSheet(state.profile.trainerSheet) : buildTrainerProfile(state.profile);
      const nickname = state.profile.nickname.trim() || "あなた";
      trainerPreview.textContent = `${nickname}さん、${trainer.name}です。今日から食事を一緒に見ます。${trainer.persona.sign}。`;
    }
    saveState();
  }
  if (target.matches("[data-memory-field]")) {
    const memory = state.memories.find((item) => item.id === target.dataset.memoryField);
    if (memory) {
      memory.text = target.value;
      saveState();
    }
  }
  if (target.matches("[data-ledger]") && target.type === "number") {
    state.ledger[target.dataset.ledger] = Number(target.value || 0);
    saveState();
  }
});

document.addEventListener("change", (event) => {
  const target = event.target;
  if (target.matches("[data-photo]")) {
    const file = target.files?.[0];
    state.draftPhotoName = file ? file.name : "";
    saveState();
    render();
  }
  if (target.matches("[data-reference-image]")) {
    const file = target.files?.[0];
    if (!file) return;
    showToast("参考画像を読み込んでいます。");
    resizeTrainerImage(file)
      .then((dataUrl) => {
        state.profile.referenceImageData = dataUrl;
        state.profile.referenceImageName = file.name;
        invalidateTrainerSheet({ clearImage: true });
        logEvent("reference_image_uploaded", { name: file.name, type: file.type || "image" });
        saveState();
        render();
        showToast("参考画像を反映しました。");
      })
      .catch(() => showToast("参考画像を読み込めませんでした。"));
  }
  if (target.matches("[data-trainer-image]")) {
    const file = target.files?.[0];
    if (!file) return;
    showToast("画像を読み込んでいます。");
    resizeTrainerImage(file)
      .then((dataUrl) => {
        state.profile.trainerImageData = dataUrl;
        state.profile.trainerImageName = file.name;
        logEvent("trainer_image_uploaded", { name: file.name, type: file.type || "image" });
        saveState();
        render();
        showToast("生成画像を反映しました。");
      })
      .catch(() => showToast("画像を読み込めませんでした。"));
  }
  if (target.matches("[data-ledger]")) {
    const key = target.dataset.ledger;
    state.ledger[key] = target.type === "number" ? Number(target.value || 0) : target.value;
    saveState();
    render();
  }
  if (target.matches("[data-profile]")) {
    const key = target.dataset.profile;
    state.profile[key] = target.type === "checkbox" ? target.checked : target.type === "range" ? Number(target.value) : target.value;
    if (["lookCustomNote", "referenceUrls", "hairLength", "hairColorCustom", "accessories", "avoidLookNote", "voiceMemo"].includes(key)) {
      invalidateTrainerSheet();
    }
    if (key === "referenceUrls") {
      const note = target.closest(".input-card")?.querySelector("[data-url-note]");
      if (note) {
        const hasUrl = normalizeReferenceUrls(target.value).length > 0;
        note.className = hasUrl ? "loading-note" : "mini-note";
        note.textContent = hasUrl ? "URLを読み込み中。そのまま入力を続けられます。" : "任意です。なければ空欄でOK。";
      }
    }
    saveState();
  }
});

function clearLegacyClientCaches() {
  if (!("caches" in window)) return;
  caches.keys()
    .then((keys) => Promise.all(
      keys
        .filter((key) => key.startsWith("ai-oshi-diet-pwa-") || key === "ai-food-trainer-pwa-v1" || key === "ai-food-trainer-pwa-v2" || key === "ai-food-trainer-pwa-v3" || key === "ai-food-trainer-pwa-v4" || key === "ai-food-trainer-pwa-v5" || key === "ai-food-trainer-pwa-v6" || key === "ai-food-trainer-pwa-v7" || key === "ai-food-trainer-pwa-v8" || key === "ai-food-trainer-pwa-v9" || key === "ai-food-trainer-pwa-v10" || key === "ai-food-trainer-pwa-v11" || key === "ai-food-trainer-pwa-v12" || key === "ai-food-trainer-pwa-v13" || key === "ai-food-trainer-pwa-v14" || key === "ai-food-trainer-pwa-v15" || key === "ai-food-trainer-pwa-v16" || key === "ai-food-trainer-pwa-v17" || key === "ai-food-trainer-pwa-v18" || key === "ai-food-trainer-pwa-v19" || key === "ai-food-trainer-pwa-v20" || key === "ai-food-trainer-pwa-v21" || key === "ai-food-trainer-pwa-v22" || key === "ai-food-trainer-pwa-v23" || key === "ai-food-trainer-pwa-v24" || key === "ai-food-trainer-pwa-v25" || key === "ai-food-trainer-pwa-v26" || key === "ai-food-trainer-pwa-v27")
        .map((key) => caches.delete(key))
    ))
    .catch(() => {});
}

if ("serviceWorker" in navigator) {
  let refreshing = false;
  navigator.serviceWorker.addEventListener("controllerchange", () => {
    if (refreshing) return;
    refreshing = true;
    window.location.reload();
  });
  window.addEventListener("load", () => {
    clearLegacyClientCaches();
    navigator.serviceWorker.register("sw.js?v=20260705-g3-canon-v5", { scope: "./" })
      .then((registration) => registration.update())
      .catch(() => {});
  });
}

render();
