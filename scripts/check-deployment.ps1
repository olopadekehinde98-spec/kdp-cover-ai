# KDP Cover AI — Deployment Status Check
# Run this at the start of any Claude session to get a live snapshot

Write-Host "`n=== KDP Cover AI — Live Deployment Status ===" -ForegroundColor Cyan

# Latest deployments
Write-Host "`n[Deployments]" -ForegroundColor Yellow
npx vercel ls 2>&1 | Select-Object -First 10

# What kdpcoverai.site is currently pointing at
Write-Host "`n[Domain Aliases]" -ForegroundColor Yellow
npx vercel alias ls 2>&1 | Select-String "kdpcoverai"

# HTTP check — is the site actually up?
Write-Host "`n[Site Health]" -ForegroundColor Yellow
try {
    $res = Invoke-WebRequest -Uri "https://kdpcoverai.site" -UseBasicParsing -TimeoutSec 10 -ErrorAction Stop
    Write-Host "kdpcoverai.site => HTTP $($res.StatusCode) OK" -ForegroundColor Green
} catch {
    Write-Host "kdpcoverai.site => FAILED: $_" -ForegroundColor Red
}

try {
    $res = Invoke-WebRequest -Uri "https://kdpcoverai.site/sign-in" -UseBasicParsing -TimeoutSec 10 -ErrorAction Stop
    Write-Host "kdpcoverai.site/sign-in => HTTP $($res.StatusCode) OK" -ForegroundColor Green
} catch {
    Write-Host "kdpcoverai.site/sign-in => FAILED: $_" -ForegroundColor Red
}

Write-Host "`n[Important Project Facts]" -ForegroundColor Yellow
Write-Host "  Vercel project: kdp-cover-ai (NOT kdp-cover-ai-f1kw)" -ForegroundColor White
Write-Host "  Git repo: github.com/olopadekehinde98-spec/kdp-cover-ai" -ForegroundColor White
Write-Host "  Domain: kdpcoverai.site (Vercel DNS)" -ForegroundColor White
Write-Host "  Owner email: olopadekehinde98@gmail.com (auto-gets AGENCY plan)" -ForegroundColor White
Write-Host "  Clerk: PRODUCTION instance (pk_live_ keys)" -ForegroundColor White
Write-Host ""
