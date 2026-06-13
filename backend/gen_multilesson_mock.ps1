# Script to dynamically scan all Excel files in tai_lieu/ and compile them into website/backend/src/db/mockDb.js
# Usage in PowerShell: powershell -ExecutionPolicy Bypass -File gen_multilesson_mock.ps1

$files = Get-ChildItem -Path "d:\AI\japanese_learning\tai_lieu\*.xlsx" | Sort-Object Name
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
        
        $lessons += [PSCustomObject]@{
            id = $lessonId
            title = $title
            description = "Bai hoc tu dong nhap tu tep $($file.Name)"
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
        for ($i = 14; $i -le 25; $i++) {
            $speaker = $sheet.Cells.Item($i, 2).Text
            $japanese = $sheet.Cells.Item($i, 3).Text
            $romaji = $sheet.Cells.Item($i, 4).Text
            $vietnamese = $sheet.Cells.Item($i, 5).Text
            if (-not [string]::IsNullOrEmpty($speaker)) {
                $kaiwaDialog += [PSCustomObject]@{
                    id = $kaiwaDialog.Count + 1
                    lesson_id = $lessonId
                    speaker = $speaker
                    japanese = $japanese
                    romaji = $romaji
                    vietnamese = $vietnamese
                }
            }
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
$lessonsJson = $lessons | ConvertTo-Json -Depth 5
$vocabularyJson = $vocabulary | ConvertTo-Json -Depth 5
$kanjiJson = $kanji | ConvertTo-Json -Depth 5
$grammarJson = $grammar | ConvertTo-Json -Depth 5
$kaiwaJson = $kaiwaDialog | ConvertTo-Json -Depth 5

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
