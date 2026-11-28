@echo off
cd /d "%~dp0"
if not exist out mkdir out
if not exist database mkdir database
javac --add-modules jdk.httpserver -cp "lib\sqlite-jdbc-3.54.1.0.jar" -d out src\main\java\campusiq\faculty\*.java
if errorlevel 1 (
  echo.
  echo Compilation failed. Check the error above.
  pause
  exit /b 1
)
java --add-modules jdk.httpserver -cp "out;lib\sqlite-jdbc-3.54.1.0.jar" campusiq.faculty.CampusServer
pause
