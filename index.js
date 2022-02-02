const { locatorToLatLng } = require("./QthLocator")
const fs = require('fs');
const readline = require('readline');

// You can increase if you want to reserve the first groups for your own use
var initialGroupNumber = 1
const columnSeparator = ','

var writer = fs.createWriteStream('italy_repeaters_FM_Icom.csv', { flags: 'w' })
writer.write("Group No,Group Name,Name,Sub Name,Repeater Call Sign,Gateway Call Sign,Frequency,Dup,Offset,Mode,TONE,Repeater Tone,RPT1USE,Position,Latitude,Longitude,UTC Offset\n")

// async function addRepeatersDV() {
//     const fileStream = fs.createReadStream('PONTI-DSTAR-ITALIA-14012022.csv');

//     const rl = readline.createInterface({
//         input: fileStream,
//         crlfDelay: Infinity
//     });

//     for await (const line of rl) {
//         writer.write(line)
//     }
// }

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
    const region = getRegion(data)
    writer.write(`${initialGroupNumber + region}`)
    writer.write(columnSeparator)
    writer.write(`${getRegionName(region)} FM`)
    writer.write(columnSeparator)
    writer.write(data.city)
    writer.write(columnSeparator)
    writer.write(data.name)
    writer.write(columnSeparator)

    writer.write("\n")
    //console.log(data)
}

const Region = {
    valle_aosta: 0,
    liguria: 1,
    piemonte: 2,
    lombardia: 3,
    veneto: 4,
    marche: 5,
    emilia_romagna: 6,
    toscana: 7,
    puglia: 8,
    basilicata: 9,
    trentino: 10,
    friuli: 11,
    umbria: 12,
    lazio: 13,
    calabria: 14,
    sicilia: 15,
    abruzzo: 16,
    molise: 17,
    sardegna: 18,
    campania: 19,
    san_marino: 20,
    svizzera: 21,
    austria: 22,
    slovenia: 23,
    croazia: 24,
    germania: 25,
    france: 26,
    montenegro: 27
}

function getRegion(data) {
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

function getRegionName(region) {
    switch (region) {
        case Region.valle_aosta:
            return 'X1 Valle d\'Aosta'
        case Region.sicilia:
            return 'T9 Sicilia'
        case Region.sardegna:
            return 'S0 Sardegna'
        case Region.calabria:
            return '8 Calabria'
        case Region.emilia_romagna:
            return 'Emilia Romagna'
        case Region.liguria:
            return '1 Liguria'
        case Region.toscana:
            return '5 Toscana'
        case Region.piemonte:
            return '1 Piemonte'
        case Region.lombardia:
            return '2 Lombardia'
        case Region.veneto:
            return '3 Veneto'
        case Region.marche:
            return '6 Marche'
        case Region.abruzzo:
            return '6 Abruzzo'
        case Region.molise:
            return '8 Molise'
        case Region.campania:
            return '8 Campania'
        case Region.puglia:
            return '7 Puglia'
        case Region.basilicata:
            return '7/8 Basilicata'
        case Region.trentino:
            return 'N3 Trentino'
        case Region.friuli:
            return 'V3 Friuli'
        case Region.umbria:
            return '0 Umbria'
        case Region.lazio:
            return '0 Lazio'
        case Region.san_marino:
            return 'T7 San Marino'
        case Region.svizzera:
            return "HB Svizzera"
        case Region.austria:
            return "OE Austria"
        case Region.slovenia:
            return "S5 Slovenia"
        case Region.croazia:
            return "9A Croazia"
        case Region.germania:
            return "DA-DR Germania"
        case Region.france:
            return "F Francia"
        case Region.montenegro:
            return "4O Montenegro"
    }
    throw new Error(`Unknown region ${data.region}`)
}



addRepeatersFM()

//console.log(locatorToLatLng("IO91wm"))