@echo off
set IMAGE=us-central1-docker.pkg.dev/anvil-private/nextjs-repo/nextjs-app
set SERVICE=private-nextjs-site
set REGION=us-central1

echo Building image...
docker build -t %IMAGE% .
if %errorlevel% neq 0 exit /b %errorlevel%

echo Pushing image...
docker push %IMAGE%
if %errorlevel% neq 0 exit /b %errorlevel%

echo Deploying to Cloud Run...
gcloud run services update %SERVICE% --region=%REGION% --image=%IMAGE%
if %errorlevel% neq 0 exit /b %errorlevel%

echo Done! Deployed successfully.
