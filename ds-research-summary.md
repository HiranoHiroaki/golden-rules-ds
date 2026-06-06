# Design System Research Summary
# 6大DS調査要約 — コンパクト版（黄金律策定用）

---

## 1. Material Design 3 (Google)

### スペーシング
- ベースグリッド: **8dp**
- マイクロスペース: 4dp
- スケール: 4, 8, 12, 16, 24, 32, 40, 48, 56, 64, 72, 80px

### タイポグラフィ
- スケール: Display L/M/S → Headline L/M/S → Title L/M/S → Body L/M/S → Label L/M/S
- Display Large: 57sp / weight 400 / line-height 64sp
- Body Medium: 14sp / weight 400 / line-height 20sp
- フォント: Roboto（Google Fonts）

### タッチターゲット
- 最小: **48×48dp**（アクセシビリティ推奨）

### カラートークン構造
- 3階層: Reference → System → Component
- セマンティックロール: primary, secondary, tertiary, error, surface, background, outline

### Elevation / Shadow
- Level 0〜5（0dp〜12dp）
- Tonal surface color overlay（ダーク時）

### 特徴
- 3階層トークン体系が最も体系化されている
- Color scheme自動生成（Material Theme Builder）
- Dynamic Color（Android 12+）

---

## 2. Apple Human Interface Guidelines

### スペーシング
- ベースグリッド: **8pt**
- Safe area margins: 16pt（iPhone）、20pt（iPad）
- Standard spacing: 8, 16, 20, 44pt

### タイポグラフィ
- フォント: SF Pro（Text <20pt / Display ≥20pt）
- Dynamic Type 対応（11段階のテキストスタイル）
- スタイル: Large Title(34pt) → Title 1(28pt) → Title 2(22pt) → Title 3(20pt) → Headline(17pt/semibold) → Body(17pt) → Callout(16pt) → Subheadline(15pt) → Footnote(13pt) → Caption 1(12pt) → Caption 2(11pt)

### タッチターゲット
- 最小: **44×44pt**（HIG明記）

### カラー
- Semantic colors: label, secondaryLabel, systemBackground, systemFill等
- Adaptive colors（ライト/ダーク自動切替）
- Tint color = primary action

### 特徴
- 「直接操作」「フィードバック」「一貫性」が3大原則
- Vibrancy / Translucency（素材感）
- ユーザー設定（アクセシビリティ）最優先

---

## 3. Polaris (Shopify)

### スペーシング
- ベースユニット: **4px**（space-100 = 4px）
- スケール: 4, 8, 12, 16, 20, 24, 28, 32, 40, 48, 64, 80, 96px
- CSS変数: `--p-space-100`（400=16px, 800=32px）

### タイポグラフィ
- フォント: Inter
- Body: 14px / line-height 20px
- Heading: 20px（semibold）

### コンポーネント
- Button height: 36px（デフォルト）、44px（large）
- Input height: 36px
- Border radius: 8px（card）、4px（button）

### 特徴
- **管理画面特化**（情報密度高め）
- 4pxグリッド（より細かい制御）
- --p プレフィックスCSS変数

---

## 4. Primer (GitHub)

### スペーシング
- スケール: 4, 8, 12, 16, 24, 32, 40, 48, 64, 80, 96, 128px
- CSS変数: `--base-size-4` 〜 `--base-size-128`
- セマンティック: `--space-*`

### タイポグラフィ
- フォント: system-ui / -apple-system
- remベース（アクセシビリティ優先）
- ロール: display, title, body, subtitle, caption, codeBlock
- サイズ: small / medium / large

### カラー
- Semantic: `--fgColor-default`, `--bgColor-default`, `--borderColor-default`
- State: `--fgColor-accent`, `--fgColor-danger`, `--fgColor-success`, `--fgColor-attention`

### 特徴
- **開発者ツール特化**（コード・技術コンテンツに強い）
- system-fontスタック（OS依存）
- 徹底したアクセシビリティ

---

## 5. Linear

### スペーシング
- **8pxスケール**（8, 16, 32, 64）
- グリッドなし → モジュラーコンポーネント体系

### タイポグラフィ
- フォント: **Inter Variable**（weight 510 / 590）
- カスタムweight（Regular〜Mediumの間）
- headline tracking: **-0.022em**（72px時）、サイズに比例して調整
- 密度高め（instrument-panel感）

### デザイン特性
- **ダークモードファースト**
- 高コントラスト
- Bold typography
- Glassmorphism / complex gradients
- 認知負荷最小化（一方向スキャン）

### 特徴
- SaaSツールの「スタイルの基準」として業界に影響
- カスタムfont-weight（510）が特徴的

---

## 6. Notion

### スペーシング
- **8pxグリッド**
- サイドバー: 131px幅（固定）
- ページコンテンツ max-width: 900px

### タイポグラフィ
- フォント: ui-sans-serif / system-ui
- Body: 16px / line-height 1.5
- H1: ~1.875rem / H2: ~1.5rem / H3: ~1.25rem

### 特徴
- **エディタ特化**（読み書きに最適化）
- 余白を多く取る（集中・没入感）
- モノクロに近いカラー（コンテンツを主役に）
- ホバーで機能出現（常時非表示で整然）

---

## クロスDS共通値まとめ

| 項目 | M3 | Apple | Polaris | Primer | Linear | Notion | 採用値 |
|------|-----|-------|---------|--------|--------|--------|--------|
| ベースグリッド | 8px | 8pt | 4px | 4px | 8px | 8px | **8px** |
| マイクロ単位 | 4px | 4pt | 4px | 4px | 4px | 4px | **4px** |
| 最小タッチ | 48px | 44pt | 36-44px | 40px | 40px | 32px | **44px** |
| Body fontSize | 14px | 17pt | 14px | 14px | 14px | 16px | **15px** |
| Line height | 1.43 | 1.47 | 1.43 | 1.5 | 1.4 | 1.5 | **1.5** |
| Border radius(sm) | 4px | 8pt | 4px | 6px | 4px | 4px | **4px** |
| Border radius(md) | 8px | 10pt | 8px | 6px | 6px | 8px | **8px** |
| Border radius(lg) | 12px | 16pt | 8px | 8px | 8px | 8px | **12px** |
| Base font | Roboto | SF Pro | Inter | system | Inter | system | **Inter/system** |

---

## デバイス別推奨値

### PC Large（≥1440px）
- container max-width: 1200px
- base font: 16px
- H1: 3rem (48px)
- H2: 2.25rem (36px)
- H3: 1.875rem (30px)
- spacing-unit: 8px
- column grid: 12col / gutter 24px
- sidebar: 240px

### PC Small（1024–1439px）
- container max-width: 960px
- base font: 15px
- H1: 2.5rem (40px)
- H2: 2rem (32px)
- H3: 1.5rem (24px)
- spacing-unit: 8px
- column grid: 12col / gutter 20px
- sidebar: 220px

### Tablet（768–1023px）
- container max-width: 100% - 32px margin
- base font: 15px
- H1: 2rem (32px)
- H2: 1.75rem (28px)
- H3: 1.5rem (24px)
- spacing-unit: 8px
- column grid: 8col / gutter 16px
- min touch: 44px

### Mobile（<768px）
- container: 100% - 16px padding
- base font: 16px（iOS zoom防止）
- H1: 1.875rem (30px)
- H2: 1.5rem (24px)
- H3: 1.25rem (20px)
- spacing-unit: 4px
- column grid: 4col / gutter 8px
- min touch: 44px（推奨48px）

---

## 黄金律（8原則）草案

1. **8px Grid Law** — 全スペースは8の倍数。マイクロは4px許容
2. **3-Tier Token** — Reference値 → Semantic役割 → Component適用の3層
3. **44px Touch Law** — タッチ/クリックターゲットは44×44px以上
4. **Semantic Color** — 色はhexではなくrole名で参照（primary, danger等）
5. **Relative Type** — フォントサイズはremベース。pxは使わない
6. **Dark-First Token** — CSS変数でダーク/ライト切替。JS不要
7. **WCAG AA Contrast** — テキスト4.5:1 / 大テキスト3:1 / UI要素3:1
8. **Motion Respect** — prefers-reduced-motion でアニメーション無効化
