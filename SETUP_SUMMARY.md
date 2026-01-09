# Wall Write Open Graph Lambda - 설정 및 배포 작업 요약

## 작업 개요
기존 AWS Lambda 함수 `set-open-graph-to-wall-write-document-on-origin-response`를 코드베이스로 관리하고, SAM CLI 배포 지원 및 GitHub 저장소 설정을 완료했습니다.

## 완료된 작업

### 1. 런타임 업데이트
- **기존**: Node.js 14.x (지원 종료)
- **변경**: Node.js 18.x
- **방법**: AWS CLI를 통한 직접 업데이트

### 2. SAM CLI 설치 및 설정
- **설치**: Homebrew를 통한 SAM CLI 1.151.0 설치
- **설정**: `samconfig.toml` 파일 생성 및 구성
- **빌드**: SAM 빌드 시스템 구성 완료

### 3. 코드베이스 동기화
- **현재 배포된 함수 코드 다운로드**: AWS Lambda에서 실제 배포된 코드 추출
- **로컬 코드 업데이트**: 배포된 코드와 로컬 코드 동기화
- **기능 보장**: 기존 동작 완전 보존

### 4. SAM 템플릿 구성
- **파일**: `template.yaml`
- **설정**: 기존 IAM 역할 사용 (`arn:aws:iam::476364780248:role/service-role/cloudfront-edge-role`)
- **리전**: us-east-1 (Edge Lambda 요구사항)

### 5. GitHub 저장소 생성
- **조직**: jober-lab
- **저장소명**: wall-write-open-graph-lambda
- **URL**: https://github.com/jober-lab/wall-write-open-graph-lambda
- **가시성**: Public

### 6. GitHub Actions 워크플로우
- **파일**: `.github/workflows/deploy.yml`
- **트리거**: main 브랜치 push, PR 생성
- **기능**: 자동 빌드 및 배포
- **요구사항**: AWS 자격증명 시크릿 설정 필요

### 7. 배포 스크립트
- **파일**: `deploy.sh`
- **기능**: SAM 빌드 및 배포 자동화
- **사용법**: `./deploy.sh`

## 프로젝트 구조

```
wall-write-open-graph-lambda/
├── .github/
│   └── workflows/
│       └── deploy.yml          # GitHub Actions 워크플로우
├── src/
│   └── index.js               # Lambda 함수 코드
├── .gitignore                 # Git 무시 파일
├── README.md                  # 프로젝트 문서
├── deploy.sh                  # 배포 스크립트
├── package.json               # Node.js 패키지 설정
├── samconfig.toml            # SAM 설정 (gitignore됨)
└── template.yaml             # SAM 템플릿
```

## 배포 방법

### 로컬 배포
```bash
# SAM CLI 사용
./deploy.sh

# 또는 수동
sam build
sam deploy --region us-east-1
```

### AWS CLI 직접 배포
```bash
cd src && zip -r ../function.zip . && cd ..
aws lambda update-function-code \
  --function-name set-open-graph-to-wall-write-document-on-origin-response \
  --zip-file fileb://function.zip \
  --region us-east-1
rm function.zip
```

### GitHub Actions 자동 배포
- main 브랜치에 push하면 자동 배포
- PR 생성 시에도 배포 테스트 실행

## 필요한 추가 설정

### GitHub Secrets
다음 시크릿을 GitHub 저장소에 추가해야 합니다:
- `AWS_ACCESS_KEY_ID`: AWS 액세스 키
- `AWS_SECRET_ACCESS_KEY`: AWS 시크릿 키

### SAM 초기 설정
첫 배포 시 다음 명령어로 guided 설정:
```bash
sam deploy --guided
```

## 함수 정보

- **함수명**: `set-open-graph-to-wall-write-document-on-origin-response`
- **런타임**: Node.js 18.x
- **메모리**: 128MB
- **타임아웃**: 3초
- **타입**: CloudFront Edge Lambda (Origin Response)
- **리전**: us-east-1

## 모니터링

- **CloudWatch Logs**: `/aws/lambda/us-east-1.set-open-graph-to-wall-write-document-on-origin-response`
- **로그 확인**: `aws logs tail /aws/lambda/us-east-1.set-open-graph-to-wall-write-document-on-origin-response --follow`

## 주요 특징

1. **기존 동작 보장**: 모든 기존 기능이 그대로 유지됨
2. **현대적 런타임**: Node.js 18.x로 업데이트
3. **자동화된 배포**: GitHub Actions 및 SAM CLI 지원
4. **버전 관리**: Git을 통한 코드 변경 추적
5. **문서화**: 완전한 README 및 배포 가이드

## 다음 단계

1. GitHub Secrets 설정
2. 첫 SAM 배포 테스트
3. CloudFront 배포와 연동 확인
4. 모니터링 및 로그 확인

---

**작업 완료일**: 2026-01-09  
**작업자**: Kiro CLI  
**저장소**: https://github.com/jober-lab/wall-write-open-graph-lambda
