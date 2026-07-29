param(
    [string]$Token
)

$username = "nirmal2155"
$repoName = "smart-waste-management"

$headers = @{
    "Authorization" = "token $Token"
    "User-Agent" = "EcoFlow-Uploader"
    "Accept" = "application/vnd.github.v3+json"
}

# 1. Create Repository if it doesn't exist
$createRepoUrl = "https://api.github.com/user/repos"
$repoBody = @{
    name = $repoName
    description = "EcoFlow — Smart Waste Management, IoT Sensor Fusion & Edge AI Platform"
    private = $false
    auto_init = $true
} | ConvertTo-Json

Write-Host "Creating GitHub repository '$repoName' under '$username'..." -ForegroundColor Cyan
try {
    $res = Invoke-RestMethod -Uri $createRepoUrl -Method Post -Headers $headers -Body $repoBody -ContentType "application/json"
    Write-Host "Repository created successfully!" -ForegroundColor Green
} catch {
    Write-Host "Repository may already exist or responded: $($_.Exception.Message)" -ForegroundColor Yellow
}

# Get list of files to upload
$projectPath = Get-Location
$files = Get-ChildItem -Path $projectPath -Recurse -File | Where-Object { 
    $_.FullName -notmatch "\\\.git\\" -and 
    $_.Name -ne "push-to-github.bat" -and 
    $_.Name -ne "upload-script.ps1" 
}

Write-Host "Uploading $($files.Count) project files to GitHub via API..." -ForegroundColor Cyan

foreach ($file in $files) {
    $relativePath = $file.FullName.Substring($projectPath.Path.Length + 1).Replace("\", "/")
    $contentBytes = [System.IO.File]::ReadAllBytes($file.FullName)
    $base64Content = [Convert]::ToBase64String($contentBytes)

    $fileApiUrl = "https://api.github.com/repos/$username/$repoName/contents/$relativePath"
    
    # Check if file exists to get SHA for update
    $sha = $null
    try {
        $existing = Invoke-RestMethod -Uri $fileApiUrl -Method Get -Headers $headers
        $sha = $existing.sha
    } catch {}

    $uploadBody = @{
        message = "Upload $relativePath via EcoFlow Automated Agent"
        content = $base64Content
    }
    if ($sha) { $uploadBody["sha"] = $sha }

    $jsonBody = $uploadBody | ConvertTo-Json

    try {
        $null = Invoke-RestMethod -Uri $fileApiUrl -Method Put -Headers $headers -Body $jsonBody -ContentType "application/json"
        Write-Host " [✓] Uploaded: $relativePath" -ForegroundColor Green
    } catch {
        Write-Host " [✕] Failed to upload: $relativePath ($($_.Exception.Message))" -ForegroundColor Red
    }
}

Write-Host "`nAll files uploaded to: https://github.com/$username/$repoName" -ForegroundColor Green
