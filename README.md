<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/drive/1BG5K7qVw2wHanLfWwhyc6ZC0kFUIdFw0

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   `npm run dev`

## 배포하기 (Deploy)

### 1. Vercel 배포 (추천)

**방법 A: Vercel CLI 사용**
```bash
# Vercel CLI 설치
npm i -g vercel

# 프로젝트 루트에서 배포
vercel

# 프로덕션 배포
vercel --prod
```

**방법 B: Vercel 웹 대시보드 사용**
1. [Vercel](https://vercel.com)에 가입/로그인
2. "Add New Project" 클릭
3. GitHub 저장소 연결 또는 프로젝트 업로드
4. 환경 변수 설정:
   - `GEMINI_API_KEY`: Gemini API 키 입력
5. "Deploy" 클릭

**중요:** Vercel 대시보드에서 환경 변수 `GEMINI_API_KEY`를 반드시 설정해야 합니다.
- Settings → Environment Variables → `GEMINI_API_KEY` 추가

### 2. Netlify 배포

**방법 A: Netlify CLI**
```bash
# Netlify CLI 설치
npm i -g netlify-cli

# 배포
netlify deploy --prod
```

**방법 B: Netlify 웹 대시보드**
1. [Netlify](https://www.netlify.com)에 가입/로그인
2. "Add new site" → "Import an existing project"
3. GitHub 저장소 연결
4. 빌드 설정:
   - Build command: `npm run build`
   - Publish directory: `dist`
5. 환경 변수 설정: `GEMINI_API_KEY`
6. "Deploy site" 클릭

### 3. GitHub Pages 배포

**vite.config.ts 수정 필요:**
```typescript
export default defineConfig({
  base: '/your-repo-name/', // 저장소 이름으로 변경
  // ... 나머지 설정
})
```

**배포 스크립트 추가 (package.json):**
```json
"scripts": {
  "deploy": "npm run build && gh-pages -d dist"
}
```

```bash
npm install --save-dev gh-pages
npm run deploy
```

### 4. Cloudflare Pages 배포

1. [Cloudflare Pages](https://pages.cloudflare.com)에 로그인
2. "Create a project" 클릭
3. GitHub 저장소 연결
4. 빌드 설정:
   - Build command: `npm run build`
   - Build output directory: `dist`
5. 환경 변수 설정: `GEMINI_API_KEY`
6. "Save and Deploy" 클릭

### 5. Firebase Hosting 배포

```bash
# Firebase CLI 설치
npm i -g firebase-tools

# Firebase 로그인 및 초기화
firebase login
firebase init hosting

# 배포
npm run build
firebase deploy
```

### 6. AWS Amplify 배포

1. [AWS Amplify Console](https://console.aws.amazon.com/amplify) 접속
2. "New app" → "Host web app"
3. GitHub 저장소 연결
4. 빌드 설정 자동 감지 (Vite)
5. 환경 변수 설정: `GEMINI_API_KEY`
6. "Save and deploy" 클릭

---

## 배포 플랫폼 비교

| 플랫폼 | 무료 티어 | 배포 속도 | 설정 난이도 | 추천도 |
|--------|----------|----------|------------|--------|
| **Vercel** | ✅ 넉넉함 | ⚡ 매우 빠름 | ⭐ 쉬움 | ⭐⭐⭐⭐⭐ |
| **Netlify** | ✅ 넉넉함 | ⚡ 빠름 | ⭐ 쉬움 | ⭐⭐⭐⭐ |
| **Cloudflare Pages** | ✅ 넉넉함 | ⚡ 매우 빠름 | ⭐ 쉬움 | ⭐⭐⭐⭐ |
| **GitHub Pages** | ✅ 무료 | 🐌 느림 | ⭐⭐ 보통 | ⭐⭐⭐ |
| **Firebase Hosting** | ✅ 제한적 | ⚡ 빠름 | ⭐⭐ 보통 | ⭐⭐⭐ |
| **AWS Amplify** | ✅ 제한적 | ⚡ 빠름 | ⭐⭐⭐ 어려움 | ⭐⭐ |

**추천:** Vercel이 가장 간단하고 빠르며, Vite 프로젝트와 완벽하게 호환됩니다!
