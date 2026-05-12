$BASE = "http://localhost:3000"
$rand = Get-Random -Maximum 99999
$email = "testlovenest$rand@example.com"
$pass  = "Test@1234Ab"
$script:feedUserId = $null

Write-Host "=== LoveNest API Test Suite ==="
Write-Host "Test user: $email"
Write-Host ""

function Run-Test {
    param($Name, [scriptblock]$Block)
    Write-Host "--- $Name ---"
    try { & $Block }
    catch {
        $code = $_.Exception.Response.StatusCode.value__
        $msg  = $_.ErrorDetails.Message
        if (-not $msg) { $msg = $_.Exception.Message }
        Write-Host "FAIL [$code]: $msg"
    }
    Write-Host ""
}

$session = New-Object Microsoft.PowerShell.Commands.WebRequestSession

Run-Test "1. POST /signup" {
    $b = "firstName=Test&lastName=User&emailId=$email&password=$pass&age=25&gender=male&about=TestBio"
    $r = Invoke-WebRequest -Uri "$BASE/signup" -Method POST -ContentType "application/x-www-form-urlencoded" -Body $b -WebSession $session -UseBasicParsing
    Write-Host "PASS [$($r.StatusCode)]: $($r.Content)"
}

Run-Test "2. POST /login" {
    $body = '{"emailId":"' + $email + '","password":"' + $pass + '"}'
    $r = Invoke-WebRequest -Uri "$BASE/login" -Method POST -ContentType "application/json" -Body $body -WebSession $session -UseBasicParsing
    $data = $r.Content | ConvertFrom-Json
    $script:userId = $data._id
    Write-Host "PASS [$($r.StatusCode)]: Logged in as $($data.firstName) id=$($data._id)"
    Write-Host "  Cookies: $($session.Cookies.Count)"
}

Run-Test "3. GET /profile/view" {
    $r = Invoke-WebRequest -Uri "$BASE/profile/view" -Method GET -WebSession $session -UseBasicParsing
    $data = $r.Content | ConvertFrom-Json
    Write-Host "PASS [$($r.StatusCode)]: firstName=$($data.firstName) email=$($data.emailId)"
}

Run-Test "4. PATCH /profile/edit" {
    $body = '{"firstName":"TestEdited","About":"Updated bio"}'
    $r = Invoke-WebRequest -Uri "$BASE/profile/edit" -Method PATCH -ContentType "application/json" -Body $body -WebSession $session -UseBasicParsing
    $data = $r.Content | ConvertFrom-Json
    Write-Host "PASS [$($r.StatusCode)]: $($data.Message)"
}

Run-Test "5. GET /feed" {
    $r = Invoke-WebRequest -Uri "$BASE/feed" -Method GET -WebSession $session -UseBasicParsing
    $data = $r.Content | ConvertFrom-Json
    Write-Host "PASS [$($r.StatusCode)]: $($data.results) users in feed"
    if ($data.data.Count -gt 0) {
        $script:feedUserId = $data.data[0]._id
        Write-Host "  First: $($data.data[0].firstName) id=$($data.data[0]._id)"
    } else {
        Write-Host "  NOTE: No other users in DB for feed"
    }
}

Run-Test "6. POST /request/send/interested" {
    if (-not $script:feedUserId) { Write-Host "SKIP: no other users in feed"; return }
    $r = Invoke-WebRequest -Uri "$BASE/request/send/interested/$($script:feedUserId)" -Method POST -WebSession $session -UseBasicParsing
    $data = $r.Content | ConvertFrom-Json
    Write-Host "PASS [$($r.StatusCode)]: $($data.message)"
}

Run-Test "7. POST /request/send INVALID status (expect 400)" {
    try {
        $r = Invoke-WebRequest -Uri "$BASE/request/send/liked/000000000000000000000001" -Method POST -WebSession $session -UseBasicParsing
        Write-Host "UNEXPECTED [200]: Should have been rejected"
    } catch {
        $code = $_.Exception.Response.StatusCode.value__
        if ($code -ge 400) { Write-Host "PASS [$code]: Correctly rejected invalid status" }
        else { Write-Host "FAIL [$code]: $($_.ErrorDetails.Message)" }
    }
}

Run-Test "8. GET /user/requests/received" {
    $r = Invoke-WebRequest -Uri "$BASE/user/requests/received" -Method GET -WebSession $session -UseBasicParsing
    $data = $r.Content | ConvertFrom-Json
    Write-Host "PASS [$($r.StatusCode)]: $($data.data.Count) pending requests"
    if ($data.data.Count -gt 0) {
        $script:incomingReqId = $data.data[0]._id
        Write-Host "  req id=$($data.data[0]._id)"
    }
}

Run-Test "9. GET /user/connections" {
    $r = Invoke-WebRequest -Uri "$BASE/user/connections" -Method GET -WebSession $session -UseBasicParsing
    $data = $r.Content | ConvertFrom-Json
    Write-Host "PASS [$($r.StatusCode)]: $($data.data.Count) connections"
}

Run-Test "10. PATCH /profile/password" {
    $body = '{"password":"' + $pass + '","newPassword":"NewTest@5678Ab"}'
    $r = Invoke-WebRequest -Uri "$BASE/profile/password" -Method PATCH -ContentType "application/json" -Body $body -WebSession $session -UseBasicParsing
    Write-Host "PASS [$($r.StatusCode)]: $($r.Content)"
}

Run-Test "11. GET /payment/varify" {
    $r = Invoke-WebRequest -Uri "$BASE/payment/varify" -Method GET -WebSession $session -UseBasicParsing
    $data = $r.Content | ConvertFrom-Json
    Write-Host "PASS [$($r.StatusCode)]: isPremium=$($data.isPremium)"
}

Run-Test "12. POST /logout" {
    $r = Invoke-WebRequest -Uri "$BASE/logout" -Method POST -WebSession $session -UseBasicParsing
    Write-Host "PASS [$($r.StatusCode)]: $($r.Content)"
}

Run-Test "13. GET /profile/view AFTER logout (expect 401)" {
    try {
        $r = Invoke-WebRequest -Uri "$BASE/profile/view" -Method GET -WebSession $session -UseBasicParsing
        Write-Host "FAIL: Still authenticated after logout!"
    } catch {
        $code = $_.Exception.Response.StatusCode.value__
        if ($code -eq 401) { Write-Host "PASS [401]: Correctly blocked after logout" }
        else { Write-Host "FAIL [$code]: $($_.ErrorDetails.Message)" }
    }
}

Run-Test "14. POST /login wrong password (expect 400)" {
    try {
        $body = '{"emailId":"' + $email + '","password":"wrongpassword"}'
        $r = Invoke-WebRequest -Uri "$BASE/login" -Method POST -ContentType "application/json" -Body $body -WebSession $session -UseBasicParsing
        Write-Host "UNEXPECTED [200]: Should have been rejected"
    } catch {
        $code = $_.Exception.Response.StatusCode.value__
        if ($code -ge 400) { Write-Host "PASS [$code]: Correctly rejected bad credentials" }
        else { Write-Host "FAIL [$code]: $($_.ErrorDetails.Message)" }
    }
}

Write-Host "=== Complete ==="
