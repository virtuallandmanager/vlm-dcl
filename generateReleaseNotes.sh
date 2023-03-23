#!/bin/bash
#This script will generate the release notes from the commits
#It will discard prints oF automatic Merges and Pull Requests commits. 
#It will show all the Commits date wise and sorted

DATE=
git log --pretty=format:"%ad || %h || %s || Author:%an " --date=short | sort -r | while read line
do
temp=`echo $line | egrep -v '(Automatic merge from|Merge pull request|Merge conflict from|Resolve Conflict From)'`
if [ "$temp" = "" ]
then
    continue
else
    NEWDATE=`echo $temp |  awk  '{print $1}'`
    if [ "$NEWDATE" = "$DATE" ]
    then
        echo $temp | awk '{$1="";$2="";print}' >> releaseNotes.txt
    else
        echo >> releaseNotes.txt
        DATE=$NEWDATE
        echo `date --date=$DATE +%d-%B-%Y` >> releaseNotes.txt
        echo $temp | awk '{$1="";$2="";print}' >> releaseNotes.txt
    fi
fi
done
