# デザインライブラリ 黄金律
# Golden Rules — 8原則

> 策定根拠: Material 3 / Apple HIG / Polaris / Primer / Linear / Notion の共通原則から抽出

---

## Rule 1 — 8px Grid Law
**「全スペースは8の倍数。マイクロは4px許容」**

### 採用理由
6DS中5つが8pxをベースグリッドとして採用（Polaris/Primerは4pxだが8の因数）。
8は4の倍数でもあり、両者を統合できる最小公倍数。
ディスプレイのサブピクセルレンダリングと相性が良く、整数比で収まる。

### 捨てた代替案
- **5pxグリッド**: Goldenratio系UIで採用例あるが、24や40などよく使う値と割り切れない
- **10pxグリッド**: 計算は簡単だが4の倍数でなく細粒度が出せない
- **完全フリー**: Tailwindのデフォルト（4px刻み）は細かすぎて選択肢過多になる

### UX効果
- 要素間の視覚的リズムが統一される（目が無意識に規則を検出）
- デザイナー↔エンジニアの認識ズレがなくなる
- コンポーネント間の余白が一貫し「作られた感」が消える

### 数値定義
```
4px  = --space-1  (マイクロ: アイコン余白、ラベル間)
8px  = --space-2  (タイト: 同グループ内要素間)
12px = --space-3  (スモール: フォーム要素の内側)
16px = --space-4  (ベース: 基本パディング)
24px = --space-5  (ミディアム: セクション内余白)
32px = --space-6  (ラージ: カード間・セクション間)
48px = --space-7  (XL: ページセクション区切り)
64px = --space-8  (2XL: ヒーロー・大見出し余白)
96px = --space-9  (3XL: ランディング余白)
```

---

## Rule 2 — 3-Tier Token
**「Reference → Semantic → Component の3層でトークンを管理する」**

### 採用理由
Material 3が最も体系化しており、Primer・Polarisも同構造を採用。
「色を変えたい」「ブランドを差し替えたい」「コンポーネントだけ調整したい」
の3つのニーズがそれぞれ独立したレイヤーに対応する。

### 捨てた代替案
- **フラットトークン**: `button-primary-bg: #6200ee` のようにコンポーネント直書き。ブランド変更時に全箇所修正が必要
- **2層（Reference + Component）**: Semanticを省くとボタンとリンクで同じ「primary色」が別定義になる
- **CSS-in-JS変数のみ**: ビルドツール依存でVanillaHTML使用不可

### UX効果
- テーマ切替（ダーク/ライト/ブランド変更）が1箇所の変更で波及
- 開発者がデザインの「意図」を読みやすくなり実装ミスが減る
- A/Bテストでのビジュアル変更コストが激減

### 構造定義
```
Layer 1 - Reference（静的な値）
  --ref-blue-500: #3b82f6
  --ref-red-500:  #ef4444

Layer 2 - Semantic（役割）
  --color-primary:     var(--ref-blue-500)
  --color-danger:      var(--ref-red-500)
  --color-bg:          #ffffff  (light) / #0f0f0f  (dark)

Layer 3 - Component（コンポーネント適用）
  --btn-primary-bg:    var(--color-primary)
  --input-border:      var(--color-border)
```

---

## Rule 3 — 44px Touch Law
**「インタラクティブ要素のタッチ/クリック領域は44×44px以上」**

### 採用理由
- Apple HIG: 44×44pt（明示的に規定）
- Material 3: 48×48dp（推奨）
- WCAG 2.5.8: 24×24px（最低基準、AAレベル）
- WCAG 2.5.5: 44×44px（AAA推奨）
- University of Maryland研究: 44px未満で誤タップ率3倍

6DSのうち4つが44〜48pxを採用。44pxを最低ラインとする。

### 捨てた代替案
- **32px**: デスクトップのみ対象なら許容されるケースもあるが、モバイルで頻繁にミスタップ
- **36px**: Polarisのデフォルトボタン高だがlarge variantで44px確保
- **視覚サイズ=タッチ領域**: ボタンが小さく見えても良いが、裏側に44pxの当たり判定を持たせるべき

### UX効果
- 高齢者・運動障害ユーザーの操作精度向上
- 誤タップによるフラストレーション（rage tap）の削減
- スマホ親指操作での片手使用性向上

### 実装方法
```css
/* 視覚的に小さいボタンでもmin-heightで担保 */
.btn { min-height: 44px; min-width: 44px; }

/* アイコンボタンはpaddingで当たり判定拡張 */
.btn-icon { padding: 10px; /* 24px icon + 10px*2 = 44px */ }
```

---

## Rule 4 — Semantic Color
**「色はhex値ではなくrole名で参照する」**

### 採用理由
全6DSが実装。色の「何のため」を名前に持たせることで、
ダーク/ライト切替・ブランド変更・アクセシビリティ調整が
コードを書き直さずに実現できる。

### 捨てた代替案
- **直接hex参照**: `color: #6200ee` — ブランド変更時に全ファイル検索置換
- **色名参照**: `color: var(--blue-500)` — 「なぜblue-500を使うか」の意図が消える
- **Tailwindクラス直打ち**: `text-blue-500` — デザイン変更がHTML全体の修正になる

### UX効果
- ダークモード対応が「CSS変数差し替え」だけで完結
- 意味が伝わる名前でコードレビューが速い
- デザインシステムの拡張（新ブランドカラー追加）がトークン追記で済む

### カラーロール定義
```
アクション系:  primary / secondary / tertiary
状態系:       success / warning / danger / info
テキスト系:   text-primary / text-secondary / text-muted / text-inverse
背景系:       bg-base / bg-surface / bg-overlay / bg-subtle
ボーダー系:   border-default / border-strong / border-subtle
```

---

## Rule 5 — Relative Type
**「フォントサイズはremベース。本文16px = 1rem を基準とする」**

### 採用理由
Primer（GitHub）が最も厳格に適用。Appleも「Dynamic Type」でユーザー設定を優先。
px固定はブラウザのフォントサイズ設定を無視し、
視覚障害ユーザーが自分の設定を使えなくなる。

### 捨てた代替案
- **px固定**: 計算が簡単だが、ユーザーのブラウザ設定を上書き。WCAG 1.4.4違反リスク
- **em（親要素依存）**: コンポーネント内でネストするたびに計算が複雑になる
- **vw（ビューポート依存）**: 流体タイポは表現的だが可読性の保証が難しい

### UX効果
- OS・ブラウザのフォントサイズ設定が反映される
- ズームしても比率が崩れない
- 低視力ユーザーの自己調整が可能

### スケール定義（1rem = 16px基準）
```
--text-xs:   0.75rem   (12px)
--text-sm:   0.875rem  (14px)
--text-base: 1rem      (16px)
--text-lg:   1.125rem  (18px)
--text-xl:   1.25rem   (20px)
--text-2xl:  1.5rem    (24px)
--text-3xl:  1.875rem  (30px)
--text-4xl:  2.25rem   (36px)
--text-5xl:  3rem      (48px)
```

---

## Rule 6 — Dark-First Token
**「CSS変数でダーク/ライト両対応。JSによるクラス切替も可能にする」**

### 採用理由
Linear・Apple HIGがダークモード設計に最も力を入れている。
`prefers-color-scheme` でOS設定を自動反映しつつ、
ユーザーが手動切替できるよう `data-theme` 属性も併用。

### 捨てた代替案
- **別CSSファイル（light.css / dark.css）**: 同期漏れが発生しやすい
- **JSで全カラー書き換え**: 非同期で一瞬白飛び（FOUC）が起きる
- **ライトモードのみ**: 2024年以降ユーザーの約50%がダークモード使用

### UX効果
- 目の疲労軽減（暗環境での長時間使用）
- OLED端末での消費電力削減
- OS設定を尊重し「アプリが自分に合わせてくれる」体験

### 実装方式
```css
/* OS設定を優先 */
@media (prefers-color-scheme: dark) {
  :root { --color-bg: #0f0f0f; }
}
/* 手動切替 */
[data-theme="dark"] { --color-bg: #0f0f0f; }
[data-theme="light"] { --color-bg: #ffffff; }
```

---

## Rule 7 — WCAG AA Contrast
**「テキスト4.5:1 / 大テキスト3:1 / UIコンポーネント3:1 のコントラスト比を確保する」**

### 採用理由
全6DSがアクセシビリティ対応を明記。
法的要件（ADA、EAA等）にも関係し、対応しないことのリスクが高い。
また、コントラストが高いUIは健常者にとっても「読みやすい」。

### 捨てた代替案
- **AAAレベル（7:1）**: 理想的だが、ビジュアルデザインの表現幅が大幅に制限される
- **無チェック**: 法的リスク + ユーザー離脱の双方でコスト大
- **自動補正ツール任せ**: 最終確認は人間/ツールで行う必要あり

### UX効果
- 低視力・色覚多様性ユーザーへの対応
- 屋外・直射日光下での視認性向上
- 高齢者ユーザーの読みやすさ改善

### 最低基準
```
通常テキスト（<18px / <14px bold）: 4.5 : 1
大テキスト（≥18px / ≥14px bold）:  3.0 : 1
UIコンポーネント・グラフィック:     3.0 : 1
```

---

## Rule 8 — Motion Respect
**「アニメーションは prefers-reduced-motion で無効化できるようにする」**

### 採用理由
Apple HIG・Material 3ともに明示。
前庭障害（めまい・乗り物酔い）を持つユーザーにとってアニメーションが
身体的苦痛を引き起こすケースがある。

### 捨てた代替案
- **全アニメーション廃止**: UXが単調になりフィードバックが失われる
- **ユーザー設定内でOFF化**: 発見されにくく、OSレベルの設定を無視する
- **アニメーションなし設計**: Linearのような密度重視UIでは有効だが汎用ライブラリには不向き

### UX効果
- 前庭障害ユーザーの身体的苦痛を防ぐ
- 集中したいユーザーへの配慮（モーションがないと情報処理が速い）
- バッテリー消費低減

### 実装
```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

---

## デバイス別推奨値まとめ

| 項目 | PC Large (≥1440) | PC Small (1024-1439) | Tablet (768-1023) | Mobile (<768) |
|------|-----------------|---------------------|-------------------|--------------|
| container max-w | 1200px | 960px | 100%-32px | 100%-16px |
| base font | 16px | 15px | 15px | 16px |
| H1 | 3rem/48px | 2.5rem/40px | 2rem/32px | 1.875rem/30px |
| H2 | 2.25rem/36px | 2rem/32px | 1.75rem/28px | 1.5rem/24px |
| H3 | 1.875rem/30px | 1.5rem/24px | 1.5rem/24px | 1.25rem/20px |
| grid cols | 12 | 12 | 8 | 4 |
| gutter | 24px | 20px | 16px | 8px |
| min touch | 36px | 36px | 44px | 44px |
| sidebar w | 240px | 220px | 折りたたみ | drawer |
| spacing base | 8px | 8px | 8px | 4px |
| line-height | 1.5 | 1.5 | 1.5 | 1.6 |
| letter-spacing h | -0.02em | -0.02em | -0.01em | 0 |

---

*次フェーズ: この数値を 01-tokens.css に変換する*
