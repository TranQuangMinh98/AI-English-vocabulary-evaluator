@echo off
echo ========================================
echo CEFR English Writing Evaluator
echo ========================================
echo.
echo Starting backend server...
cd server
start "CEFR Backend" cmd /k "npm start"
timeout /t 5 /nobreak > nul
echo.
echo Starting frontend application...
cd ..\client
start "CEFR Frontend" cmd /k "npm run dev"
echo.
echo ========================================
echo Application is starting!
echo ========================================
echo.
echo Backend:  http://localhost:3001
echo Frontend: http://localhost:5173
echo.
echo Wait a few seconds, then open your browser to:
echo http://localhost:5173
echo.
echo Press any key to exit this window...
pause > nul
