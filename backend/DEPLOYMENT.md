# ROE MVP 백엔드 배포 가이드 (Render)

## 📋 배포 전 체크리스트

- [x] .gitignore 설정 완료
- [x] 데이터베이스 스키마 준비 (init.sql)
- [x] 환경변수 설정 준비 (.env.example)
- [x] DATABASE_URL 지원 추가

## 🚀 Render 배포 단계별 가이드

### Step 1: GitHub에 코드 푸시

```bash
cd backend

# Git 초기화 (아직 안했다면)
git init
git add .
git commit -m "Backend deployment ready"

# GitHub 원격 저장소 추가 (본인의 저장소 URL로 변경)
git remote add origin https://github.com/YOUR_USERNAME/roe-mvp.git
git branch -M main
git push -u origin main
```

### Step 2: Render 계정 생성

1. [Render](https://render.com) 방문
2. "Get Started for Free" 클릭
3. GitHub 계정으로 가입

### Step 3: PostgreSQL 데이터베이스 생성

1. Render 대시보드에서 **"New +"** 클릭
2. **"PostgreSQL"** 선택
3. 설정:
   - **Name**: `roe-mvp-db`
   - **Database**: `roe_mvp`
   - **User**: (자동 생성됨)
   - **Region**: `Singapore` (한국과 가장 가까움)
   - **Plan**: **Free** 선택
4. **"Create Database"** 클릭

#### 데이터베이스 초기화

1. 데이터베이스 생성 후 대시보드에서 **"Connect"** 섹션 찾기
2. **"External Connection"** 정보 확인:
   - Hostname
   - Port
   - Database
   - Username
   - Password

3. PostgreSQL 클라이언트로 접속 (예: DBeaver, psql, TablePlus)
   ```bash
   psql -h <hostname> -U <username> -d <database> -p <port>
   ```

4. 스키마 실행:
   ```bash
   # 로컬에서 실행
   psql -h <hostname> -U <username> -d <database> -p <port> -f database/init.sql
   ```
   
   또는 Render 대시보드에서:
   - **"Connect"** → **"PSQL Command"** 복사
   - 터미널에서 실행
   - init.sql 내용을 복사하여 붙여넣기

### Step 4: Web Service 생성 (백엔드 서버)

1. Render 대시보드에서 **"New +"** → **"Web Service"** 클릭
2. GitHub 저장소 연결
3. 설정:
   - **Name**: `roe-mvp-backend`
   - **Region**: `Singapore`
   - **Branch**: `main`
   - **Root Directory**: `backend` (중요!)
   - **Runtime**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Plan**: **Free**

#### 환경변수 설정

"Environment" 탭에서 다음 변수들을 추가:

| Key | Value | 설명 |
|-----|-------|------|
| `DATABASE_URL` | (Step 3의 Internal Database URL 복사) | Render DB 내부 URL |
| `JWT_SECRET` | `roe-production-secret-key-2024` | 임의의 긴 문자열 |
| `NODE_ENV` | `production` | 프로덕션 환경 |
| `PORT` | `3000` | 포트 번호 |

**중요:** `DATABASE_URL`은 PostgreSQL 대시보드의 **"Internal Database URL"**을 사용하세요 (External이 아닌 Internal!)

4. **"Create Web Service"** 클릭

### Step 5: 배포 확인

1. 배포 로그 확인
   - "Logs" 탭에서 실시간 로그 확인
   - `✅ ROE MVP API 서버 시작!` 메시지 확인

2. API 테스트
   ```bash
   # 헬스체크
   curl https://roe-mvp-backend.onrender.com
   
   # 응답 예시:
   # {
   #   "success": true,
   #   "message": "ROE MVP API 서버가 실행 중입니다",
   #   "version": "1.0.0"
   # }
   ```

3. 배포 URL 확인
   - 대시보드에서 URL 복사: `https://roe-mvp-backend.onrender.com`
   - 이 URL을 프론트엔드 `API_BASE_URL`에 설정

## 📱 프론트엔드 연결

`frontend/src/api/client.js` 수정:
```javascript
// 로컬 테스트
// export const API_BASE_URL = 'http://192.168.45.214:3000';

// 배포 환경
export const API_BASE_URL = 'https://roe-mvp-backend.onrender.com';
```

## 🔄 코드 수정 후 재배포

1. 코드 수정
2. Git 커밋 & 푸시
   ```bash
   git add .
   git commit -m "Fix: 버그 수정"
   git push
   ```
3. Render가 자동으로 감지하고 재배포 (약 1-2분 소요)

## ⚠️ 주의사항

### Free Plan 제한사항

1. **15분 슬립 모드**
   - 15분간 요청이 없으면 서버가 슬립
   - 첫 요청 시 30초-1분 정도 느림
   - 해결: $7/월 유료 플랜 사용

2. **데이터베이스 90일 제한**
   - 무료 DB는 90일 후 삭제됨
   - 미리 백업 필요
   - 해결: $7/월 유료 DB 사용

3. **업로드 파일 영구 저장 불가**
   - Render는 서버 재시작 시 `uploads/` 폴더 내용 삭제
   - 해결 방법:
     - AWS S3 사용
     - Cloudinary 사용 (추천)
     - 또는 Render Disk ($7/월)

## 🐛 트러블슈팅

### 1. 데이터베이스 연결 실패
```
Error: connect ECONNREFUSED
```
**해결:** DATABASE_URL이 **Internal URL**인지 확인

### 2. 빌드 실패
```
npm ERR! Cannot find module 'xxx'
```
**해결:** `package.json`의 dependencies 확인

### 3. 환경변수 누락
```
JWT_SECRET is not defined
```
**해결:** Environment 탭에서 환경변수 추가

### 4. 포트 오류
```
Error: listen EADDRINUSE
```
**해결:** Start Command가 `npm start`인지 확인

## 📊 배포 후 모니터링

1. **로그 확인**: Render 대시보드 → Logs 탭
2. **성능 모니터링**: Render 대시보드 → Metrics 탭
3. **알림 설정**: Settings → Notifications

## 🎯 다음 단계

- [ ] 프론트엔드 배포 (Expo 또는 Vercel)
- [ ] 이미지 업로드를 Cloudinary로 변경
- [ ] 에러 로깅 추가 (Sentry)
- [ ] API 문서 작성 (Swagger)

## 📞 도움이 필요하면

- [Render 공식 문서](https://render.com/docs)
- [Render Community](https://community.render.com)
