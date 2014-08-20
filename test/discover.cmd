@echo off
setlocal
cd /d %~dp0

call init.cmd
del *.xml
call node_modules\.bin\karma-vs-reporter discover

dir /b karma-vs-reporter.xml
