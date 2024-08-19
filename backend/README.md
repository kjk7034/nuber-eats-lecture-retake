# Backend 강의 

## 설치

### 사전 설치

- `MongoDB` 환경이 필요해서 나는 `MongoDB Compass`를 이용해서 로컬에서 사용함.
- Email 관련 서비스는 [`mailersend`](https://www.mailersend.com/)을 사용함(템플릿 활용).

### .env.dev 

```
NODE_TLS_REJECT_UNAUTHORIZED=0
DB_URI=mongodb://localhost:27017/nuber-eats
PRIVATE_KEY=
MAIL_API_TOKEN=
MAIL_FROM_EMAIL=
MAIL_FROM_NAME=
MAIL_TEMPLATE_VERIFICATION=
```
