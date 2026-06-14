# Script to dynamically scan all Excel files in tai_lieu/ and compile them into website/backend/src/db/mockDb.js
# Usage in PowerShell: powershell -ExecutionPolicy Bypass -File gen_multilesson_mock.ps1

$files = Get-ChildItem -Path "d:\AI\japanese_learning\tai_lieu\*.xlsx" | Where-Object { $_.Name -notlike "~$*" } | Sort-Object { [int]($_.BaseName -replace '^Bai(\d+).*', '$1') }
if ($files.Count -eq 0) {
    Write-Error "No Excel files found in d:\AI\japanese_learning\tai_lieu\"
    exit 1
}

Write-Output "Scanning $($files.Count) Excel files..."

$excel = New-Object -ComObject Excel.Application
$excel.Visible = $false
$excel.DisplayAlerts = $false

$lessons = @()
$vocabulary = @()
$kanji = @()
$grammar = @()
$kaiwaDialog = @()

$lessonId = 1
try {
    foreach ($file in $files) {
        $filePath = $file.FullName
        Write-Output "Processing Lesson ${lessonId}: $($file.Name)..."
        $wb = $excel.Workbooks.Open($filePath)
        
        # Determine Title
        # Bai1_Hajimemashite -> "Bài 1: Hajimemashite"
        $baseName = $file.BaseName
        $title = $baseName -replace "Bai(\d+)", "$([char]0x0042)$([char]0x00E0)i `$1" -replace "_", ": "
        
        # Read Kaiwa validation options
        $kaiwaSheet = $wb.Sheets.Item("Kaiwa")
        $namesOpt = @()
        try {
            $val = $kaiwaSheet.Cells.Item(5, 3).Validation.Formula1
            if (-not [string]::IsNullOrEmpty($val)) {
                $namesOpt = $val.Split(",").ForEach({ $_.Trim() })
            }
        } catch {}
        if ($namesOpt.Count -eq 0) { $namesOpt = @("ナム", "タイン", "アン", "リン", "クオン") }

        $countriesOpt = @()
        try {
            $val = $kaiwaSheet.Cells.Item(6, 3).Validation.Formula1
            if (-not [string]::IsNullOrEmpty($val)) {
                $countriesOpt = $val.Split(",").ForEach({ $_.Trim() })
            }
        } catch {}
        if ($countriesOpt.Count -eq 0) { $countriesOpt = @("ベトナム", "アメリカ", "日本", "イギリス", "フランス") }

        $jobsOpt = @()
        try {
            $val = $kaiwaSheet.Cells.Item(7, 3).Validation.Formula1
            if (-not [string]::IsNullOrEmpty($val)) {
                $jobsOpt = $val.Split(",").ForEach({ $_.Trim() })
            }
        } catch {}
        if ($jobsOpt.Count -eq 0) { $jobsOpt = @("エンジニア", "学生", "教師", "会社員", "医者") }

        $orgsOpt = @()
        try {
            $val = $kaiwaSheet.Cells.Item(8, 3).Validation.Formula1
            if (-not [string]::IsNullOrEmpty($val)) {
                $orgsOpt = $val.Split(",").ForEach({ $_.Trim() })
            }
        } catch {}
        if ($orgsOpt.Count -eq 0) { $orgsOpt = @("FPT", "IMC", "さくら大学", "トヨタ", "マック") }

        # Scan dialogue formulas to check references to C5, C6, C7, C8
        $refC5 = $false
        $refC6 = $false
        $refC7 = $false
        $refC8 = $false

        $row = 14
        while ($true) {
            $speaker = $kaiwaSheet.Cells.Item($row, 3).Text
            if ([string]::IsNullOrEmpty($speaker)) { break }
            $jaFormula = $kaiwaSheet.Cells.Item($row, 4).Formula
            $viFormula = $kaiwaSheet.Cells.Item($row, 6).Formula
            $combinedFormula = "$jaFormula | $viFormula"

            if ($combinedFormula -match "\bC5\b") { $refC5 = $true }
            if ($combinedFormula -match "\bC6\b") { $refC6 = $true }
            if ($combinedFormula -match "\bC7\b") { $refC7 = $true }
            if ($combinedFormula -match "\bC8\b") { $refC8 = $true }
            $row++
        }

        # Build roleplay options only for referenced cells. Otherwise leave them empty/null.
        $roleplayOptions = $null
        if ($refC5 -or $refC6 -or $refC7 -or $refC8) {
            $roleplayOptions = [PSCustomObject]@{
                names = if ($refC5) { $namesOpt } else { @() }
                countries = if ($refC6) { $countriesOpt } else { @() }
                occupations = if ($refC7) { $jobsOpt } else { @() }
                organizations = if ($refC8) { $orgsOpt } else { @() }
            }
        }

        $lessons += [PSCustomObject]@{
            id = $lessonId
            title = $title
            description = "Bai hoc tu dong nhap tu tep $($file.Name)"
            roleplay_options = $roleplayOptions
        }
        
        # Read Tu_Vung
        $sheet = $wb.Sheets.Item("Tu_Vung")
        $row = 3
        while ($true) {
            $hiragana = $sheet.Cells.Item($row, 1).Text
            if ([string]::IsNullOrEmpty($hiragana)) { break }
            $romaji = $sheet.Cells.Item($row, 2).Text
            $meaning = $sheet.Cells.Item($row, 3).Text
            $type = $sheet.Cells.Item($row, 4).Text
            $example = $sheet.Cells.Item($row, 5).Text
            $ex_meaning = $sheet.Cells.Item($row, 6).Text
            $mnemonic = $sheet.Cells.Item($row, 7).Text
            
            $vocabulary += [PSCustomObject]@{
                id = $vocabulary.Count + 1
                lesson_id = $lessonId
                hiragana = $hiragana
                romaji = $romaji
                vietnamese_meaning = $meaning
                word_type = $type
                japanese_example = $example
                example_meaning = $ex_meaning
                mnemonic_tip = $mnemonic
                image_url = ""
            }
            $row++
        }
        
        # Read Kanji
        $sheet = $wb.Sheets.Item("Kanji")
        $row = 3
        while ($true) {
            $character = $sheet.Cells.Item($row, 1).Text
            if ([string]::IsNullOrEmpty($character)) { break }
            $strokes = $sheet.Cells.Item($row, 2).Text
            $onyomi = $sheet.Cells.Item($row, 3).Text
            $kunyomi = $sheet.Cells.Item($row, 4).Text
            $hanviet = $sheet.Cells.Item($row, 5).Text
            $meaning = $sheet.Cells.Item($row, 6).Text
            $mnemonic = $sheet.Cells.Item($row, 7).Text
            $compounds = $sheet.Cells.Item($row, 8).Text
            
            $kanji += [PSCustomObject]@{
                id = $kanji.Count + 1
                lesson_id = $lessonId
                character = $character
                stroke_count = $strokes
                onyomi = $onyomi
                kunyomi = $kunyomi
                sino_vietnamese = $hanviet
                vietnamese_meaning = $meaning
                mnemonic_tip = $mnemonic
                compounds = $compounds
            }
            $row++
        }
        
        # Read Ngu_Phap
        $sheet = $wb.Sheets.Item("Ngu_Phap")
        $row = 3
        while ($true) {
            $pattern = $sheet.Cells.Item($row, 1).Text
            if ([string]::IsNullOrEmpty($pattern)) { break }
            $meaning = $sheet.Cells.Item($row, 2).Text
            $structure = $sheet.Cells.Item($row, 3).Text
            $explanation = $sheet.Cells.Item($row, 4).Text
            $example = $sheet.Cells.Item($row, 5).Text
            $ex_meaning = $sheet.Cells.Item($row, 6).Text
            $notes = $sheet.Cells.Item($row, 7).Text
            
            $grammar += [PSCustomObject]@{
                id = $grammar.Count + 1
                lesson_id = $lessonId
                title = $pattern
                meaning = $meaning
                structure = $structure
                vietnamese_explanation = $explanation
                japanese_example = $example
                example_meaning = $ex_meaning
                notes = $notes
            }
            $row++
        }
        
        # Read Kaiwa
        $sheet = $wb.Sheets.Item("Kaiwa")
        # Temporarily force Romaji checkbox to true to read raw Romaji values from the formulas
        $sheet.Cells.Item(10, 8) = $true
        $sheet.Cells.Item(11, 3) = $true
        
        $row = 14
        while ($true) {
            $speaker = $sheet.Cells.Item($row, 3).Text
            if ([string]::IsNullOrEmpty($speaker)) { break }
            $topic = $sheet.Cells.Item($row, 2).Text
            $japanese = $sheet.Cells.Item($row, 4).Text
            $romaji = $sheet.Cells.Item($row, 5).Text
            $vietnamese = $sheet.Cells.Item($row, 6).Text
            
            $kaiwaDialog += [PSCustomObject]@{
                id = $kaiwaDialog.Count + 1
                lesson_id = $lessonId
                topic = $topic
                speaker = $speaker
                japanese = $japanese
                romaji = $romaji
                vietnamese = $vietnamese
            }
            $row++
        }
        
        $wb.Close($false)
        $lessonId++
    }
} finally {
    $excel.Quit()
    if ($wb) { [System.Runtime.InteropServices.Marshal]::ReleaseComObject($wb) | Out-Null }
    if ($excel) { [System.Runtime.InteropServices.Marshal]::ReleaseComObject($excel) | Out-Null }
    [System.GC]::Collect()
    [System.GC]::WaitForPendingFinalizers()
}

# Serialize arrays into JavaScript format
function Serialize-AsArray($arr) {
    if ($null -eq $arr -or $arr.Count -eq 0) {
        return "[]"
    }
    $json = $arr | ConvertTo-Json -Depth 5
    if ($arr.Count -eq 1 -and -not $json.StartsWith("[")) {
        return "[$json]"
    }
    return $json
}

$lessonsJson = Serialize-AsArray $lessons
$vocabularyJson = Serialize-AsArray $vocabulary
$kanjiJson = Serialize-AsArray $kanji
$grammarJson = Serialize-AsArray $grammar
$kaiwaJson = Serialize-AsArray $kaiwaDialog

$jsCode = @"
// In-memory Mock Database generated from Excel workbooks in tai_lieu/
// Generated on: $((Get-Date).ToString("yyyy-MM-dd HH:mm:ss"))
// Serves as the mock database for local API Console testing.

const lessons = $lessonsJson;

const vocabulary = $vocabularyJson;

const kanji = $kanjiJson;

const grammar = $grammarJson;

const kaiwaDialog = $kaiwaJson;

const students = [
  { 
    id: 'user123', 
    email: 'user@nihongoflow.com', 
    display_name: 'H\u1ecdc Vi\u00ean A', 
    created_at: new Date().toISOString() 
  }
];

// In-memory store for user progress: key is "userId:itemType:itemId" -> status
const userProgress = {
  "user123:vocabulary:1": "mastered",
  "user123:vocabulary:2": "mastered",
  "user123:vocabulary:3": "mastered",
  "user123:vocabulary:4": "mastered",
  "user123:vocabulary:5": "mastered",
  "user123:vocabulary:6": "learning",
  "user123:vocabulary:7": "learning",
  "user123:vocabulary:8": "learning",
  "user123:kanji:1": "mastered",
  "user123:kanji:2": "mastered",
  "user123:kanji:3": "learning"
};

// In-memory store for target plans: key is userId -> targetPlanObject
const targetPlan = {
  "user123": {
    user_id: "user123",
    start_date: "2026-06-13",
    end_date: "2026-06-20",
    vocabulary_target: 30,
    kanji_target: 10,
    self_evaluation: "T\u1ed1t",
    updated_at: new Date().toISOString()
  }
};

module.exports = {
  lessons,
  vocabulary,
  kanji,
  grammar,
  kaiwaDialog,
  students,
  userProgress,
  targetPlan
};
"@

$destPath = "d:\AI\japanese_learning\website\backend\src\db\mockDb.js"
$jsCode | Out-File -FilePath $destPath -Encoding utf8
Write-Output "Successfully compiled mockDb.js with $($lessons.Count) lessons at: $destPath"
