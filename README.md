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

## GitHub에 업로드하기

### 1. GitHub 저장소 생성

1. [GitHub](https://github.com)에 로그인
2. 우측 상단 "+" 아이콘 클릭 → "New repository" 선택
3. 저장소 이름 입력 (예: `심쿵-과외` 또는 `simkung-tutor`)
4. Public 또는 Private 선택
5. **"Initialize this repository with a README" 체크 해제** (이미 로컬에 파일이 있으므로)
6. "Create repository" 클릭

### 2. 로컬 저장소를 GitHub에 연결

GitHub에서 생성한 저장소의 URL을 복사한 후 아래 명령어를 실행하세요:

```bash
# GitHub 저장소 URL 추가 (아래 URL을 실제 저장소 URL로 변경하세요)
git remote add origin https://github.com/your-username/your-repo-name.git

# 브랜치 이름을 main으로 설정 (이미 main이면 생략 가능)
git branch -M main

# GitHub에 푸시
git push -u origin main
```

**또는 SSH를 사용하는 경우:**
```bash
git remote add origin git@github.com:your-username/your-repo-name.git
git branch -M main
git push -u origin main
```

### 3. 이후 변경사항 업로드

```bash
# 변경된 파일 추가
git add .

# 커밋
git commit -m "변경사항 설명"

# GitHub에 푸시
git push
```

### ⚠️ 주의사항

- `.env.local` 파일은 `.gitignore`에 포함되어 있어 자동으로 제외됩니다
- **절대 API 키를 GitHub에 올리지 마세요!**
- 환경 변수는 배포 플랫폼(Vercel, Netlify 등)에서 별도로 설정해야 합니다

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

**중요:** Vercel 대시보드에서 환경 변수를 반드시 설정해야 합니다.

**환경 변수 설정 방법:**
1. Vercel 프로젝트 대시보드로 이동
2. Settings → Environment Variables 클릭
3. 다음 중 하나를 추가:
   - **방법 1 (권장):** `VITE_GEMINI_API_KEY` = `your-api-key-here`
   - **방법 2:** `GEMINI_API_KEY` = `your-api-key-here`
4. **모든 환경** (Production, Preview, Development)에 적용되도록 선택
5. 저장 후 **재배포** 필요 (자동 재배포되지 않으므로 수동으로 재배포하거나 새 커밋 푸시)

**재배포 방법:**
- Vercel 대시보드에서 "Redeploy" 클릭
- 또는 새 커밋을 GitHub에 푸시하면 자동 재배포

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
