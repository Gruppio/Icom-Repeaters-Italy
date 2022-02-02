const { locatorToLatLng } = require("./QthLocator")
const fs = require('fs')
const readline = require('readline')

// You can increase if you want to reserve the first groups for your own use
var initialGroupNumber = 1
const columnSeparator = ','
const onlyVhfAndUhf = true
const useRegionPrefixInName = false
const useRepeaterNameInLocation = true
// Add your hotspot here if you want to add it to the list, leave "" if you don't
// Use the group 1 for the hotspot
// Example
// 1,Hotspot,Hotspot,PiStar,xxxxxxxB,xxxxxxxG,430.321,OFF,0.000000,DV,OFF,88.5Hz,YES,Approximate,41.818333,12.715000,+1:00
const hotspot = "01,Hotspot,Hotspot,PiStar,xxxxxxxB,xxxxxxxG,433.111,OFF,0.000000,DV,OFF,88.5Hz,YES,Approximate,41.818333,12.715000,+1:00" 

const maxDVRegion = 14
var writerFM = fs.createWriteStream('../Italy_FM_Repeaters.csv', { flags: 'w' })
var writerFMDV = fs.createWriteStream('../Italy_DV_FM_Repeaters.csv', { flags: 'w' })
var writerDV = fs.createWriteStream('../Italy_DV_Repeaters.csv', { flags: 'w' })

write("Group No,Group Name,Name,Sub Name,Repeater Call Sign,Gateway Call Sign,Frequency,Dup,Offset,Mode,TONE,Repeater Tone,RPT1USE,Position,Latitude,Longitude,UTC Offset\n")

function addHotspot() {
    if (hotspot == "")
        return
    
    write(hotspot)
    write("\n")
    initialGroupNumber += 1
}

async function addRepeatersDV() {
    const fileStream = fs.createReadStream('PONTI-DSTAR-ITALIA-14012022.csv');

    const rl = readline.createInterface({
        input: fileStream,
        crlfDelay: Infinity
    });

    for await (const line of rl) {
        const elements = line.split(',')

        const region = getRegionDV(elements[3])
        const groupName = [getRegionPrefix(region), "DV", getRegionName(region)].join(' ').trim()
        const groupNumberDV = initialGroupNumber + region
        const groupNumberFMDV = initialGroupNumber + (region * 2)
        
        writerDV.write(zeroPad(groupNumberDV, 2))
        writerFMDV.write(zeroPad(groupNumberFMDV, 2))
        writeDV(columnSeparator)
        writeDV(groupName)
        writeDV(columnSeparator)
        writeDV(elements[2])
        writeDV(columnSeparator)
        writeDV(elements[4].substring(0, elements[3].length - 1).trim())
        writeDV(columnSeparator)
        for (var i = 4; i < elements.length; i++) {
            writeDV(elements[i])
            if (i != elements.length - 1)
                writeDV(columnSeparator)
        }
        writeDV("\n")
    }
}

async function addRepeatersFM() {
    const fileStream = fs.createReadStream('PONTI-FM-ITALIA-IK2ANE.csv');

    const rl = readline.createInterface({
        input: fileStream,
        crlfDelay: Infinity
    });

    for await (const line of rl) {
        const data = parseLine(line)
        writeData(data)
    }
}

function parseLine(line) {
    const elements = line.split(';')

    return {
        name: elements[1],
        freq: elements[2],
        shift: elements[3],
        tone: elements[4],
        region: elements[5],
        province: elements[6],
        city: elements[7],
        mode: elements[8],
        qth: elements[12]
    }
}

function writeData(data) {
    // keep just the FM repeaters
    if (data.mode.trim() != '') {
        return
    }

    const freq = getFrequency(data)
    if (onlyVhfAndUhf && freq.length != 10) {
        return 
    }

    const region = getRegionFM(data)
    const groupName = [getRegionPrefix(region), "FM", getRegionName(region)].join(' ').trim()
    const groupNumberFM = initialGroupNumber + region
    const groupNumberFMDV = region <= maxDVRegion  ?
      initialGroupNumber + (region * 2) + 1 : initialGroupNumber + (maxDVRegion * 2)+ (region - maxDVRegion) + 1
    
    writerFM.write(zeroPad(groupNumberFM,2))
    writerFMDV.write(zeroPad(groupNumberFMDV,2))
    writeFM(columnSeparator)
    writeFM(groupName)
    writeFM(columnSeparator)
    writeFM(getName(data))
    writeFM(columnSeparator)
    writeFM(data.name.trim())
    writeFM(columnSeparator)
    writeFM(columnSeparator)
    writeFM(columnSeparator)
    writeFM(freq)
    writeFM(columnSeparator)
    writeFM(getShiftDirection(data))
    writeFM(columnSeparator)
    writeFM(getShiftValue(data))
    writeFM(columnSeparator)
    writeFM("FM")
    writeFM(columnSeparator)
    writeFM(getTone(data))
    writeFM(columnSeparator)
    writeFM(getToneValue(data))
    writeFM(columnSeparator)
    writeFM("YES")
    writeFM(columnSeparator)
    writeFM("Approximate")
    writeFM(columnSeparator)
    writeFM(getLatitude(data))
    writeFM(columnSeparator)
    writeFM(getLongitude(data))
    writeFM(columnSeparator)
    writeFM("--:--")
    writeFM("\n")
    //console.log(data)
}

function getName(data) {
    const city = data.city.split('(')[0].trim()
    const province = data.province.trim()
    const name = data.name.trim()
    
    if (!useRepeaterNameInLocation) {
        return [city, province].join(' ')
    }

    return [name, city, province].join(' ')
}

function getLatitude(data) {
    const qth = data.qth.trim()
    return `${locatorToLatLng(qth)[0].toFixed(6)}`
}

function getLongitude(data) {
    const qth = data.qth.trim()
    return `${locatorToLatLng(qth)[1].toFixed(6)}`
}

function getTone(data) {
    var tone = getToneValue(data)
    if (tone == "88.5Hz") {
        return "OFF"
    }
    return "TONE"
}

function getToneValue(data) {
    var tone = data.tone.trim().replace(',','.')
    let isToneNumeric = /^\d+\.\d+$/.test(tone)
    if (tone.length == 0 || !isToneNumeric) {
        return "88.5Hz"
    }
    return tone + "Hz"
}

function getShiftDirection(data) {
    var shift = data.shift.trim()
    if (shift == '0') {
        return "OFF"
    }

    if (shift.startsWith('-')) {
        return "DUP-"
    }

    if (shift.startsWith('+')) {
        return "DUP+"
    }
    
    throw new Error(`Unknown shift direction -${shift}- for ${data.city}`)
}

function getShiftValue(data) {
    var shift = data.shift.trim()
    if (shift == '0') {
        return "0.000000"
    }

    const shiftStringNumber = shift.substring(1, shift.length - 3)
    var shiftValue = parseFloat(shiftStringNumber)

    if (shift.endsWith('kHz')) {
        return (shiftValue / 1000).toFixed(6)
    }

    if (shift.endsWith('MHz')) {
        return shiftValue.toFixed(6)
    }
    
    throw new Error(`Unknown shift unit -${shift}- for ${data.city}`)
}

function getFrequency(data) {
    var freq = data.freq.trim().replace(',','')
    freq = freq + "00"
    return freq
}

const Region = {
    liguria: 0,
    piemonte: 1,
    lombardia: 2,
    veneto: 3,
    emilia_romagna: 4,
    toscana: 5,
    puglia: 6,
    trentino: 7,
    friuli: 8,
    umbria: 9,
    lazio: 10,
    calabria: 11,
    sicilia: 12,
    abruzzo: 13,  
    campania: 14,
    valle_aosta: 15,
    marche: 16,
    basilicata: 17,
    molise: 18,
    sardegna: 19,
    san_marino: 20,
    svizzera: 21,
    austria: 22,
    slovenia: 23,
    croazia: 24,
    germania: 25,
    france: 26,
    montenegro: 27
}

function getRegionFM(data) {
    switch (data.region.trim()) {
        case '1x v.aosta':
            return Region.valle_aosta
        case '9t sicilia':
            return Region.sicilia
        case '0s sardegna':
            return Region.sardegna
        case '8 calabria':
            return Region.calabria
        case '4 emilia r.':
            return Region.emilia_romagna
        case '1 liguria':
            return Region.liguria
        case '5 toscana':
            return Region.toscana
        case '1 piemonte':
            return Region.piemonte
        case '2 lombardia':
            return Region.lombardia
        case '3 veneto':
            return Region.veneto
        case '6 marche':
            return Region.marche
        case '6 abruzzo':
            return Region.abruzzo
        case '8 molise':
            return Region.molise
        case '8 campania':
            return Region.campania
        case '7 puglia':
            return Region.puglia
        case '7/8 basilicata':
            return Region.basilicata
        case '3n trentino a.a.':
            return Region.trentino
        case '3v friuli v.g.':
            return Region.friuli
        case '0 umbria':
            return Region.umbria
        case '0 lazio':
            return Region.lazio
        case 'San Marino':
            return Region.san_marino
        case 'svizzera':
            return Region.svizzera
        case 'austria':
            return Region.austria
        case 'slovenia':
            return Region.slovenia
        case 'croazia':
            return Region.croazia
        case 'germania':
            return Region.germania
        case 'francia':
            return Region.france
        case 'Montenegro':
            return Region.montenegro
    }
    throw new Error(`Unknown region -${data.region}-`)
}

function getRegionDV(data) {
    switch (data.trim()) {
        case 'V-Aosta':
            return Region.valle_aosta
        case 'Sicilia':
            return Region.sicilia
        case 'Sardegna':
            return Region.sardegna
        case 'Calabria':
            return Region.calabria
        case 'E-Romagn':
            return Region.emilia_romagna
        case 'Liguria':
            return Region.liguria
        case 'Toscana':
            return Region.toscana
        case 'Piemonte':
            return Region.piemonte
        case 'Lombardi':
            return Region.lombardia
        case 'Veneto':
            return Region.veneto
        case 'Marche':
            return Region.marche
        case 'Abruzzo':
            return Region.abruzzo
        case 'Molise':
            return Region.molise
        case 'Basilica':
            return Region.campania
        case 'Puglia':
            return Region.puglia
        case 'Basilicata':
            return Region.basilicata
        case 'Trentino':
            return Region.trentino
        case 'Campania':
            return Region.campania
        case 'Friuli-V':
            return Region.friuli
        case 'Umbria':
            return Region.umbria
        case 'Lazio':
            return Region.lazio
        case 'San Marino':
            return Region.san_marino
        case 'Svizzera':
            return Region.svizzera
        case 'Austria':
            return Region.austria
        case 'Slovenia':
            return Region.slovenia
        case 'Croazia':
            return Region.croazia
        case 'Germania':
            return Region.germania
        case 'Francia':
            return Region.france
        case 'Montenegro':
            return Region.montenegro
    }
    throw new Error(`Unknown DV region -${data}-`)
}

function getRegionName(region) {
    switch (region) {
        case Region.valle_aosta:
            return 'Valle d\'Aosta'
        case Region.sicilia:
            return 'Sicilia'
        case Region.sardegna:
            return 'Sardegna'
        case Region.calabria:
            return 'Calabria'
        case Region.emilia_romagna:
            return 'Emilia Romagna'
        case Region.liguria:
            return 'Liguria'
        case Region.toscana:
            return 'Toscana'
        case Region.piemonte:
            return 'Piemonte'
        case Region.lombardia:
            return 'Lombardia'
        case Region.veneto:
            return 'Veneto'
        case Region.marche:
            return 'Marche'
        case Region.abruzzo:
            return 'Abruzzo'
        case Region.molise:
            return 'Molise'
        case Region.campania:
            return 'Campania'
        case Region.puglia:
            return 'Puglia'
        case Region.basilicata:
            return 'Basilicata'
        case Region.trentino:
            return 'Trentino'
        case Region.friuli:
            return 'Friuli'
        case Region.umbria:
            return 'Umbria'
        case Region.lazio:
            return 'Lazio'
        case Region.san_marino:
            return 'San Marino'
        case Region.svizzera:
            return "Svizzera"
        case Region.austria:
            return "Austria"
        case Region.slovenia:
            return "Slovenia"
        case Region.croazia:
            return "Croazia"
        case Region.germania:
            return "Germania"
        case Region.france:
            return "Francia"
        case Region.montenegro:
            return "Montenegro"
    }
    throw new Error(`Unknown region ${data.region}`)
}

function getRegionPrefix(region) {
    if (!useRegionPrefixInName) {
        return ""
    }
    switch (region) {
        case Region.valle_aosta:
            return 'X1'
        case Region.sicilia:
            return 'T9'
        case Region.sardegna:
            return 'S0'
        case Region.calabria:
            return '8'
        case Region.emilia_romagna:
            return '4'
        case Region.liguria:
            return '1'
        case Region.toscana:
            return '5'
        case Region.piemonte:
            return '1'
        case Region.lombardia:
            return '2'
        case Region.veneto:
            return '3'
        case Region.marche:
            return '6'
        case Region.abruzzo:
            return '6'
        case Region.molise:
            return '8'
        case Region.campania:
            return '8'
        case Region.puglia:
            return '7'
        case Region.basilicata:
            return '7/8'
        case Region.trentino:
            return 'N3'
        case Region.friuli:
            return 'V3'
        case Region.umbria:
            return '0'
        case Region.lazio:
            return '0'
        case Region.san_marino:
            return 'T7'
        case Region.svizzera:
            return "HB"
        case Region.austria:
            return "OE"
        case Region.slovenia:
            return "S5"
        case Region.croazia:
            return "9A"
        case Region.germania:
            return "DA-DR"
        case Region.france:
            return "F"
        case Region.montenegro:
            return "4O"
    }
    throw new Error(`Unknown region ${data.region}`)
}

function write(string) {
    writerFM.write(string)
    writerDV.write(string)
    writerFMDV.write(string)
}

function writeFM(string) {
    writerFM.write(string)
    writerFMDV.write(string)
}

function writeDV(string) {
    writerDV.write(string)
    writerFMDV.write(string)
}

const zeroPad = (num, places) => String(num).padStart(places, '0')

addHotspot()
addRepeatersDV()
addRepeatersFM()
