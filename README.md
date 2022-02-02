# Italian Repeaters for ICom Radios

In this repo you can find the list of Italian FM and DStar repeater unified and divided by region to be used in your Icom radio.

I've tested them with a Icom ID52.

# Files

`Italy_DV_FM_Repeaters_Icom.csv` Contains both FM and DStar repeaters
`Italy_FM_Repeaters_Icom.csv` Contains just FM repeaters
`Italy_DV_Repeaters_Icom.csv` Contains just DStar repeaters

# Details
    * Every repeater has the associated location so it can be searched in the `Nearby Repeaters`
    * I've reserved the First group for your `Hotspot`, please fill it with your Hotspot info if you have one
    * Repeaters are divided by region and mode

# Usage

**Before import the files please perform a backup of your existing repeater list**
You can simply copy the file of your interest in the SD card, then on your radio
`Menu -> Set -> SD Card -> Import/Export -> Import -> Repeater List`

# Script
If you want to generate the output or update the files you just have to install node then run
`node index.js` from the `src` folder

# Data Source

The FM Repeaters are from [IK2ANE](http://www.ik2ane.it/ham.htm) 
The DV Repeaters are from `Gruppo DStar Agrigento`
Thanks to both these source to provide these informations!

Gruppio