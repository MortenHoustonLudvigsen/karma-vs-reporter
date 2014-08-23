@echo off
setlocal
cd /d %~dp0

call init.cmd
del *.xml
call node_modules\.bin\karma-vs-reporter run -o testrun.xml -p 53983
dir /b *.xml