#!/bin/bash

cd src
node index.js
sort -o ../Italy_DV_FM_Repeaters.csv ../Italy_DV_FM_Repeaters.csv
sort -o ../Italy_DV_Repeaters.csv ../Italy_DV_Repeaters.csv
sort -o ../Italy_FM_Repeaters.csv ../Italy_FM_Repeaters.csv

sed -i -- '1h;1d;$!H;$!d;G' ../Italy_DV_FM_Repeaters.csv
sed -i -- '1h;1d;$!H;$!d;G' ../Italy_DV_Repeaters.csv
sed -i -- '1h;1d;$!H;$!d;G' ../Italy_FM_Repeaters.csv

rm ../Italy_DV_FM_Repeaters.csv--
rm ../Italy_DV_Repeaters.csv--
rm ../Italy_FM_Repeaters.csv--

cd --
echo "Done"