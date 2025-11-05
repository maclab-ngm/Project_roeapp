# 데이터베이스 권한 오류 해결 방법

## 문제
"permission denied for table users" 오류가 발생합니다.

## 원인
테이블의 소유자가 `roe` 사용자인데, `.env` 파일에서 `DB_USER=postgres`로 설정되어 있어 권한이 없습니다.

## 해결 방법

### 방법 1: DB_USER를 roe로 변경 (가장 간단)

`.env` 파일을 열어서 다음 줄을 수정하세요:

```
DB_USER=roe
```

기존:
```
DB_USER=postgres
```

### 방법 2: roe 사용자로 권한 부여

터미널에서 다음 명령어를 실행하세요:

```bash
psql -h localhost -U roe -d roe_mvp
```

그 다음 다음 SQL을 실행:

```sql
GRANT ALL PRIVILEGES ON users TO postgres;
GRANT ALL PRIVILEGES ON ads TO postgres;
GRANT ALL PRIVILEGES ON ad_views TO postgres;
GRANT USAGE, SELECT ON SEQUENCE users_id_seq TO postgres;
GRANT USAGE, SELECT ON SEQUENCE ads_id_seq TO postgres;
GRANT USAGE, SELECT ON SEQUENCE ad_views_id_seq TO postgres;
```

### 방법 3: 테이블 소유자를 postgres로 변경

터미널에서 다음 명령어를 실행하세요:

```bash
psql -h localhost -U roe -d roe_mvp
```

그 다음 다음 SQL을 실행:

```sql
ALTER TABLE users OWNER TO postgres;
ALTER TABLE ads OWNER TO postgres;
ALTER TABLE ad_views OWNER TO postgres;
ALTER SEQUENCE users_id_seq OWNER TO postgres;
ALTER SEQUENCE ads_id_seq OWNER TO postgres;
ALTER SEQUENCE ad_views_id_seq OWNER TO postgres;
```

## 권장 방법
**방법 1을 권장합니다.** `.env` 파일에서 `DB_USER=roe`로 변경하면 가장 간단하게 해결됩니다.

변경 후 서버를 재시작하세요.


