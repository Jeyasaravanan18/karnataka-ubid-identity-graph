# AWS Hosting (Free-Tier Friendly, No Domain)

This app is a static Vite build. The most "real-world deployable" AWS setup (without a domain) is:

- S3 bucket (private) to store the build artifacts
- CloudFront distribution (HTTPS, caching, SPA routing)
- GitHub Actions deployment using GitHub OIDC (no stored AWS access keys)

You will get a URL like:

`https://dxxxxxxxxxxxxx.cloudfront.net`

## Why Not EC2

EC2 is a real server, but for a static SPA it adds risk: certificates, Nginx config, process management, and security updates. S3 + CloudFront is the production pattern for static frontends.

## AWS Setup (Console)

### 1) Create an S3 bucket

1. S3 -> Create bucket
2. Name: something like `karnataka-ubid-identity-graph-web`
3. Region: `ap-south-1` (Mumbai) is fine
4. Keep "Block all public access" ON (recommended)

Do not enable S3 website hosting if you are using CloudFront + private bucket.

### 2) Create a CloudFront distribution

1. CloudFront -> Create distribution
2. Origin domain: select your S3 bucket
3. Origin access: use **Origin Access Control (OAC)** (recommended)
4. Default root object: `index.html`

SPA routing (important):

- Add custom error response:
  - 403 -> `/index.html` with response code 200
  - 404 -> `/index.html` with response code 200

### 3) Note these values

- S3 bucket name (example): `karnataka-ubid-identity-graph-web`
- CloudFront distribution ID (example): `E1ABCDEF234567`

## GitHub Actions Deploy (No AWS Keys)

This uses GitHub OIDC to assume an AWS role at deploy time.

### 4) Create an IAM role for GitHub OIDC

1. IAM -> Identity providers:
   - Add provider: `token.actions.githubusercontent.com`
   - Audience: `sts.amazonaws.com`
2. IAM -> Roles -> Create role:
   - Trusted entity type: Web identity
   - Identity provider: `token.actions.githubusercontent.com`
   - Permission policy: create a least-privilege policy:
     - allow S3 sync to your bucket
     - allow CloudFront invalidation on your distribution

You will need:

- Role ARN, example:
  - `arn:aws:iam::<account-id>:role/github-deploy-ubid-web`

### 5) Add GitHub Secrets

Repo -> Settings -> Secrets and variables -> Actions:

- `AWS_ROLE_ARN`: role ARN created above
- `AWS_REGION`: e.g. `ap-south-1`
- `AWS_S3_BUCKET`: your bucket name
- `AWS_CLOUDFRONT_DISTRIBUTION_ID`: your distribution ID

### 6) Deploy

Push to `master` and the workflow will:

1. install deps
2. build (`npm run build`)
3. sync `dist/` to S3
4. invalidate CloudFront

## Free-Tier Notes (Be Honest)

AWS pricing changes over time. This approach is typically free-tier friendly for hackathon traffic, but AWS can charge if you exceed free allowances.

To avoid surprises:

- Enable AWS Billing alerts (Budgets)
- Keep CloudFront + S3 usage modest

