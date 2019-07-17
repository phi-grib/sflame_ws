@echo off
@CALL "%userprofile%\Anaconda3\Library\bin\conda.bat" activate flame
START /B python sflame-ws.py
"C:\Program Files\Mozilla Firefox\firefox.exe" http://localhost:8081