@echo off
chcp 65001 > nul
title DeadTown - تشغيل موقع سيرفر ديد تاون
echo ========================================================
echo   🌟 جارٍ تشغيل موقع سيرفر DeadTown بالكامل... 🌟
echo ========================================================
echo.

where node >nul 2>nul
if %ERRORLEVEL% EQU 0 (
    echo [✓] تم العثور على Node.js
    echo [✓] بدء تشغيل الخادم المحلي على المنفذ 3000...
    start "" http://localhost:3000
    node server.js
) else (
    echo [!] Node.js غير مثبت، جارٍ فتح الموقع مباشرة في المتصفح...
    start "" index.html
)

pause
