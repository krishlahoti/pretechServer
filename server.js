var firebase = require('firebase');
require('firebase/storage');
require("firebase/firestore");
var d3 = require('d3');
global.XMLHttpRequest = require("xhr2");
var express = require('express');
var app = express();

var idealDelta1 = 0;
var idealDelta10 = 0;
var idealRow = [];
var temp = [];
var csvResult = [];
var csvHeaderData = [];
var finalResult = [];
var BDATA_001 = 0;
var BDATA_002 = 0;
var BDATA_003 = 0;
var BDATA_004 = 0;
var tokenArray = [];


const VARIABLES = {
    PARA_001: 'Para-001',
    PARA_002: 'Para-002',
    PARA_003: 'Para-003',
    PARA_004: 'Para-004',
    PARA_005: 'Para-005',
    PARA_006: 'Para-006',
    PARA_007: 'Para-007',
    PARA_008: 'Para-008',
    PARA_009: 'Para-009',
    PARA_010: 'Para-010',
    PARA_011: 'Para-011',
    PARA_012: 'Para-012',
    PARA_013: 'Para-013',
    PARA_014: 'Para-014',
    PARA_015: 'Para-015',
    PARA_016: 'Para-016',
    PARA_017: 'Para-017',
    PARA_018: 'Para-018',
    TIME: 'Time',
    DATE: 'Date',
    BDATA_001: 'Bdata_001',
    BDATA_002: 'Bdata_002',
    BDATA_003: 'Bdata_003',
    BDATA_004: 'Bdata_004',
    DATA_001: 'Data-001',
    DATA_002: 'Data-002',
    DATA_003: 'Data-003',
    DATA_004: 'Data-004',
    DATA_005: 'Data-005',
    DATA_006: 'Data-006',
    DATA_007: 'Data-007',
    DATA_008: 'Data-008',
    DATA_009: 'Data-009',
    DATA_011: 'Data-011',
    BM_001: 'BM-001',
    BM_002: 'BM-002',
    BM_003: 'BM-003',
    BM_004: 'BM-004',
    BM_005: 'BM-005',
    BM_006: 'BM-006',
    BM_007: 'BM-007',
    BM_008: 'BM-008',
    BM_009: 'BM-009',
    BM_010: 'BM-010'
}


function firebaseInitialize() {
    const firebaseConfig = {
        apiKey: "AIzaSyBPRy468mWKldsZ2yx2dyzL8PSCE7rlMJk",
        authDomain: "sample-2216b.firebaseapp.com",
        databaseURL: "https://sample-2216b.firebaseio.com",
        projectId: "sample-2216b",
        storageBucket: "sample-2216b.appspot.com",
        messagingSenderId: "714106496514",
        appId: "1:714106496514:web:40a17f5f0af225dea1691b",
        measurementId: "G-60N4PNB2QH"
    };

    firebase.initializeApp(firebaseConfig);
    firebase.auth().signInWithEmailAndPassword("nileshrathi2dec@gmail.com", "123456");
}


function initialize() {
    console.log("initalize:=> Retrieving data from firebase...!!");
    firebase.firestore().collection("collections").doc("documents").onSnapshot((doc) => {
        if (doc.exists) {
            idealDelta1 = parseFloat(doc.data().idealDelta1);
            idealDelta10 = parseFloat(doc.data().idealDelta10);
            idealRow = doc.data().idealValues;
            BDATA_001 = parseFloat(doc.data().BDATA_001);
            BDATA_002 = parseFloat(doc.data().BDATA_002);
            BDATA_003 = parseFloat(doc.data().BDATA_003);
            BDATA_004 = parseFloat(doc.data().BDATA_004);

            calculatingPara();
        }
    })
}

function calculatingPara() {

    console.log("Inside calaulatingPara()=>:::::")


    firebase.storage().ref('data.csv').getDownloadURL().then(function (url) {
        d3.csv(url).then(function (result) {

            let isEqual = JSON.stringify(csvResult) === JSON.stringify(result);

            console.log("are values equal: ", isEqual)
            if (isEqual) {
                console.log("CSV results are same hence need not make the calculations")
                return;
            }
            csvResult = [];
            temp = [];
            csvHeaderData = [];
            csvResult = [...result];
            let len = result.length;
            let currentDelta10 = 0;
            let currentDelta1 = 0;
            let currentidealRow = [];
            let flag = false;

            if (len === 0) {
                console.log("No data found");
            } else if (len === 1) {
                currentDelta10 = parseInt(result[0][VARIABLES.PARA_010]) / 5;
                currentDelta1 = parseInt(result[0][VARIABLES.PARA_001]) / 5;
                currentidealRow = result[0];
                flag = true;
            } else {
                // calculating delta 10
                currentDelta10 = ((parseInt(result[len - 1][VARIABLES.PARA_010]) - parseInt(result[len - 2][VARIABLES.PARA_010])) / 5);
                if (currentDelta10 > idealDelta10) {
                    // calculating delta 1
                    currentDelta1 = ((parseInt(result[len - 1][VARIABLES.PARA_001]) - parseInt(result[len - 2][VARIABLES.PARA_001])) / 5);
                    // current row is ideal one so update the ideal conditions
                    currentidealRow = result[len - 1];
                    flag = true;
                } else if (currentDelta10 < idealDelta10) {
                    // difference of two rows for all the parameters with ideal row
                    for (let i = 2; i < result.columns.length; i++) {
                        let key = result.columns[i];
                        temp[key] = parseInt(idealRow[key]) - parseInt(result[len - 1][key]);
                    }
                } else if (currentDelta10 === idealDelta10) {
                    console.log("In Para 6");
                    // comparing parameter 6
                    let currPara6 = parseInt(result[len - 1][VARIABLES.PARA_006]);
                    let prevPara6 = parseInt(idealRow[VARIABLES.PARA_006]);
                    if (currPara6 < prevPara6) {
                        // calculating delta 1
                        currentDelta1 = ((parseInt(result[len - 1][VARIABLES.PARA_001]) - parseInt(result[len - 2][VARIABLES.PARA_001])) / 5);
                        // current row is the ideal one
                        currentidealRow = result[len - 1];
                        flag = true;
                    } else if (currPara6 > prevPara6) {
                        // previous row was the ideal one
                        // difference of two rows for all the parameters
                        for (let i = 2; i < result.columns.length; i++) {
                            let key = result.columns[i];
                            temp[key] = parseInt(idealRow[key]) - parseInt(result[len - 1][key]);
                        }
                    } else if (currPara6 === prevPara6) {
                        console.log("In Para 1");
                        // calculating delta 1
                        currentDelta1 = (parseInt(result[len - 1][VARIABLES.PARA_001]) - parseInt(result[len - 2][VARIABLES.PARA_001])) / 5;
                        if (currentDelta1 < idealDelta1) {
                            // previous row was ideal one
                            // difference of two rows for all the parameters
                            for (let i = 2; i < result.columns.length; i++) {
                                let key = result.columns[i];
                                temp[key] = parseInt(idealRow[key]) - parseInt(result[len - 1][key]);
                            }
                        } else {
                            // current row is ideal one
                            currentidealRow = result[len - 1];
                            flag = true;
                        }
                    }
                }
            }

            if (flag === true) {
                console.log("Updating Firebase");
                firebase.firestore().collection("collections").doc("documents").update({
                    idealDelta10: currentDelta10,
                    idealDelta1: currentDelta1,
                    idealValues: currentidealRow
                });
            } else {
                //temp
            }

            firebase.storage().ref('benchmark.csv').getDownloadURL().then(function (url) {
                d3.csv(url).then(function (result) {
                    console.log("inside  benchmark()=>:::::")
                    csvHeaderData = result[result.length - 1];
                    finalResult = calculatingAllVariables(csvResult, csvHeaderData);
                });
            });
        });
    });

}

function doesCurrentRowStartNewShift(currentRowTime) {
    if (parseInt(currentRowTime[1]) === 0 && parseInt(currentRowTime[2]) === 0) {
        return (parseInt(currentRowTime[0]) === 7 || parseInt(currentRowTime[0]) === 15 || parseInt(currentRowTime[0]) === 23);
    } else {
        return false
    }
}

function doesCurrentRowStartNewBatch(currentRowTime) {
    return (parseInt(currentRowTime[0]) === 7 && parseInt(currentRowTime[1]) === 0 && parseInt(currentRowTime[2]) === 0);
}


function getStartIndex(data) {

    if (data.length > 0) {
        for (let i = 0; i < data.length - 1; i++) {
            if (data[i][VARIABLES.PARA_001] > 200) {
                return i;
            }
        }
        return data.length - 1
    }
    return 0;
}

function calculateTotalTime(data) {

    console.log("inside  calculateTotalTime()=>:::::")

    let startIndex = getStartIndex(data);
    let endIndex = data.length - 1;
    let startTime = data[startIndex][VARIABLES.TIME].split(':')
    let endTime = data[endIndex][VARIABLES.TIME].split(':')

    let startDate = data[startIndex][VARIABLES.DATE].split('/')
    let endDate = data[endIndex][VARIABLES.DATE].split('/')

    let startDateTime = new Date(parseInt(startDate[2]), parseInt(startDate[1]), parseInt(startDate[0]),
        parseInt(startTime[0]), parseInt(startTime[1]), parseInt(startTime[2]))

    let endDateTime = new Date(parseInt(endDate[2]), parseInt(endDate[1]), parseInt(endDate[0]),
        parseInt(endTime[0]), parseInt(endTime[1]), parseInt(endTime[2]))

    return (Math.round(((endDateTime - startDateTime) / 1000) / 60));
}

function calculate_P_Alt_Variables(currentRow, benchmarkRow, totalTimeDifferenceInMinutes) {

    console.log("inside  calculate_P_Alt_Variables()=>:::::")

    let P_ALT_001 = (parseFloat(benchmarkRow[VARIABLES.DATA_009]) - parseFloat(currentRow[VARIABLES.PARA_001])) / (parseFloat(currentRow[VARIABLES.PARA_001]) / parseFloat(totalTimeDifferenceInMinutes))

    let P_ALT_002 = (parseFloat(currentRow[VARIABLES.PARA_010]) / parseFloat(currentRow[VARIABLES.PARA_001])) * parseFloat(benchmarkRow[VARIABLES.DATA_009])

    return {
        P_ALT_001: parseFloat(P_ALT_001).toFixed(2),
        P_ALT_002: parseFloat(P_ALT_002).toFixed(2)
    }
}

function calculateProjectionScreenGraphData(startIndex, lastOneHourData, completeData, benchmarkRow) {

    console.log("inside  calculateProjectionScreenGraphData()=>:::::")

    let finalDataForP_ALT_01 = [];
    let finalDataForP_ALT_02 = [];
    let finalDataForC_PARA_01 = [];

    let initialCompleteData = [...completeData];
    let lastOneHourDataLength = lastOneHourData.length;

    console.log("lastOneHourDataLength", lastOneHourDataLength)

    for (let i = 0; i < lastOneHourDataLength; i++) {

        let endIndex = i + startIndex;
        let totalTime = calculateTotalTime(initialCompleteData.splice(0, endIndex));

        let P_ALT = calculate_P_Alt_Variables(lastOneHourData[i], benchmarkRow, totalTime);
        let C_PARA_001 = (lastOneHourData[i][VARIABLES.PARA_001]) / totalTime;
        finalDataForC_PARA_01[i] = C_PARA_001;
        finalDataForP_ALT_01[i] = P_ALT.P_ALT_001;
        finalDataForP_ALT_02[i] = P_ALT.P_ALT_002;
        initialCompleteData = [...completeData];

    }
    return {
        P_ALT_001: finalDataForP_ALT_01,
        P_ALT_002: finalDataForP_ALT_02,
        C_PARA_001: finalDataForC_PARA_01,
        LAST_ONE_HR_PARA_001: lastOneHourData[lastOneHourDataLength - 1][VARIABLES.PARA_001] - lastOneHourData[0][VARIABLES.PARA_001],
        LAST_ONE_HR_PARA_010: lastOneHourData[lastOneHourDataLength - 1][VARIABLES.PARA_010] - lastOneHourData[0][VARIABLES.PARA_010],
        LAST_ONE_HR_PARA_012: lastOneHourData[lastOneHourDataLength - 1][VARIABLES.PARA_012] - lastOneHourData[0][VARIABLES.PARA_012],
        LAST_ONE_HR_PARA_001_START: parseInt(lastOneHourData[0][VARIABLES.PARA_001]),
        LAST_ONE_HR_PARA_010_START: parseInt(lastOneHourData[0][VARIABLES.PARA_010]),
        LAST_ONE_HR_PARA_012_START: parseInt(lastOneHourData[0][VARIABLES.PARA_012]),
        LAST_ONE_HR_PARA_001_END: parseInt(lastOneHourData[lastOneHourDataLength - 1][VARIABLES.PARA_001]),
        LAST_ONE_HR_PARA_010_END: parseInt(lastOneHourData[lastOneHourDataLength - 1][VARIABLES.PARA_010]),
        LAST_ONE_HR_PARA_012_END: parseInt(lastOneHourData[lastOneHourDataLength - 1][VARIABLES.PARA_012])
    }
}

function parseGraphData(data, benchmarkRow) {

    console.log("inside  parseGraphData()=>:::::")

    let label = [];
    let completeData = [...data];
    const dataLength = data.length;
    let startIndex = 0;
    let endIndex = dataLength;

    if (data.length >= 13) {
        startIndex = dataLength - 13;
    }

    //extracting labels
    let graphData = data.splice(startIndex, endIndex);
    let projectionScreenData = calculateProjectionScreenGraphData(startIndex, graphData, completeData, benchmarkRow);
    let labelArray = graphData.map(item => item[VARIABLES.TIME]);
    label = labelArray.map(item => item.split(':')[1]);

    let productRecovered = graphData.map(item => parseInt(item[VARIABLES.PARA_010]));
    let rmConsumed = graphData.map(item => parseInt(item[VARIABLES.PARA_001]));
    let energyConsumed = graphData.map(item => parseInt(item[VARIABLES.PARA_009]));
    let effluentToETP = graphData.map(item => parseInt(item[VARIABLES.PARA_012]));

    return {
        label: label,
        productRecovered: productRecovered,
        rmConsumed: rmConsumed,
        energyConsumed: energyConsumed,
        effluentToETP: effluentToETP,
        P_ALT_001: projectionScreenData.P_ALT_001,
        P_ALT_002: projectionScreenData.P_ALT_002,
        C_PARA_001: projectionScreenData.C_PARA_001,
        C_PARA_008: projectionScreenData.C_PARA_008,
        LAST_ONE_HR_PARA_001: projectionScreenData.LAST_ONE_HR_PARA_001,
        LAST_ONE_HR_PARA_010: projectionScreenData.LAST_ONE_HR_PARA_010,
        LAST_ONE_HR_PARA_012: projectionScreenData.LAST_ONE_HR_PARA_012,
        LAST_ONE_HR_C_PARA_008: projectionScreenData.LAST_ONE_HR_PARA_001 - projectionScreenData.LAST_ONE_HR_PARA_010 - projectionScreenData.LAST_ONE_HR_PARA_012,
        LAST_ONE_HR_PARA_001_START: projectionScreenData.LAST_ONE_HR_PARA_001_START,
        LAST_ONE_HR_PARA_010_START: projectionScreenData.LAST_ONE_HR_PARA_010_START,
        LAST_ONE_HR_PARA_012_START: projectionScreenData.LAST_ONE_HR_PARA_012_START,
        LAST_ONE_HR_C_PARA_008_START: projectionScreenData.LAST_ONE_HR_PARA_001_START - projectionScreenData.LAST_ONE_HR_PARA_010_START - projectionScreenData.LAST_ONE_HR_PARA_012_START,
        LAST_ONE_HR_PARA_001_END: projectionScreenData.LAST_ONE_HR_PARA_001_END,
        LAST_ONE_HR_PARA_010_END: projectionScreenData.LAST_ONE_HR_PARA_010_END,
        LAST_ONE_HR_PARA_012_END: projectionScreenData.LAST_ONE_HR_PARA_012_END,
        LAST_ONE_HR_C_PARA_008_END: projectionScreenData.LAST_ONE_HR_PARA_001_END - projectionScreenData.LAST_ONE_HR_PARA_010_END - projectionScreenData.LAST_ONE_HR_PARA_012_END
    }
}

function calculate_C_Para_Variables(currentRow, benchmarkRow, totalTimeDifferenceInMinutes, P_ALT) {

    console.log("inside  calculate_C_Para_Variables()=>:::::")

    let C_PARA_001 = currentRow[VARIABLES.PARA_001] / totalTimeDifferenceInMinutes;

    //Change PARA_002 to as discussed with business
    let C_PARA_002 = ((currentRow[VARIABLES.PARA_002] - BDATA_003) + (currentRow[VARIABLES.PARA_018] * BDATA_004) + (currentRow[VARIABLES.PARA_001] * BDATA_001)) * (benchmarkRow[VARIABLES.DATA_009]) / (currentRow[VARIABLES.PARA_001])

    let C_PARA_003 = (benchmarkRow[VARIABLES.DATA_009] * benchmarkRow[VARIABLES.BM_010]) / 100
    let C_PARA_004 = ((benchmarkRow[VARIABLES.DATA_009] * benchmarkRow[VARIABLES.BM_010]) - currentRow[VARIABLES.PARA_010]) / C_PARA_001
    let C_PARA_005 = P_ALT.P_ALT_001 > C_PARA_004 ? P_ALT.P_ALT_001 : C_PARA_004
    let C_PARA_008 = currentRow[VARIABLES.PARA_001] - currentRow[VARIABLES.PARA_010] - currentRow[VARIABLES.PARA_012]

    //Change PARA_002 to as discussed with business
    let C_PARA_009 = currentRow[VARIABLES.PARA_004] + currentRow[VARIABLES.PARA_002]

    //Change PARA_002 to as discussed with business
    let C_PARA_010 = currentRow[VARIABLES.PARA_003] + currentRow[VARIABLES.PARA_002]

    let C_PARA_011 = currentRow[VARIABLES.PARA_001] + currentRow[VARIABLES.PARA_002] - C_PARA_009 - C_PARA_010

    //Change C_PARA_002 to as discussed with business
    let C_PARA_012 = currentRow[VARIABLES.PARA_003] - C_PARA_011 - C_PARA_002

    let C_PARA_013 = currentRow[VARIABLES.PARA_004] - C_PARA_009 - C_PARA_010

    return {
        C_PARA_001: parseFloat(C_PARA_001).toFixed(2),
        C_PARA_002: parseFloat(C_PARA_002).toFixed(2),
        C_PARA_003: parseFloat(C_PARA_003).toFixed(2),
        C_PARA_004: parseFloat(C_PARA_004).toFixed(2),
        C_PARA_005: parseFloat(C_PARA_005).toFixed(2),
        C_PARA_008: parseFloat(C_PARA_008).toFixed(2),
        C_PARA_009: parseFloat(C_PARA_009).toFixed(2),
        C_PARA_010: parseFloat(C_PARA_010).toFixed(2),
        C_PARA_011: parseFloat(C_PARA_011).toFixed(2),
        C_PARA_012: parseFloat(C_PARA_012).toFixed(2),
        C_PARA_013: parseFloat(C_PARA_013).toFixed(2),
    }
}

function calculateBatchAndShiftDifference(result) {

    console.log("inside  calculateBatchAndShiftDifference()=>:::::")

    let len = result.length;
    let currentRowTime = result[len - 1][VARIABLES.TIME].split(':');

    let batchStartIndex;
    let rowDifferenceForBatchStart;
    let batchStartParaVariables = [];
    let BATCH_PARA_001 = 0;
    let BATCH_PARA_010 = 0;
    let BATCH_PARA_012 = 0;
    let BATCH_C_PARA_008 = 0;

    let shiftStartIndex;
    let rowDifferenceForShiftStart;
    let shiftStartParaVariables = [];
    let SHIFT_PARA_001 = 0;
    let SHIFT_PARA_010 = 0;
    let SHIFT_PARA_012 = 0;
    let SHIFT_C_PARA_008 = 0;

    let SHIFT_PARA_001_START = 0;
    let SHIFT_PARA_010_START = 0;
    let SHIFT_PARA_012_START = 0;
    let SHIFT_C_PARA_008_START = 0;
    let SHIFT_PARA_001_END = 0;
    let SHIFT_PARA_010_END = 0;
    let SHIFT_PARA_012_END = 0;
    let SHIFT_C_PARA_008_END = 0;

    let BATCH_PARA_001_START = 0;
    let BATCH_PARA_010_START = 0;
    let BATCH_PARA_012_START = 0;
    let BATCH_C_PARA_008_START = 0;
    let BATCH_PARA_001_END = 0;
    let BATCH_PARA_010_END = 0;
    let BATCH_PARA_012_END = 0;
    let BATCH_C_PARA_008_END = 0;

    let hourTime = parseInt(currentRowTime[0]);
    let minuteTime = parseInt(currentRowTime[1]);

    if (!doesCurrentRowStartNewBatch(currentRowTime)) {

        if (hourTime > 7) {
            rowDifferenceForBatchStart = (minuteTime / 5) + ((hourTime - 7) * 12)
        } else {
            rowDifferenceForBatchStart = (minuteTime / 5) + ((hourTime - 7) * 12) + 288
        }

        batchStartIndex = len - 1 - rowDifferenceForBatchStart;

        if (batchStartIndex <= 0) {
            batchStartParaVariables = result[0]
        } else {
            batchStartParaVariables = result[batchStartIndex]
        }

        BATCH_PARA_001_START = parseInt(batchStartParaVariables[VARIABLES.PARA_001]);
        BATCH_PARA_010_START = parseInt(batchStartParaVariables[VARIABLES.PARA_010]);
        BATCH_PARA_012_START = parseInt(batchStartParaVariables[VARIABLES.PARA_012]);
        BATCH_C_PARA_008_START = BATCH_PARA_001_START - BATCH_PARA_010_START - BATCH_PARA_012_START;
        BATCH_PARA_001_END = parseInt(result[len - 1][VARIABLES.PARA_001]);
        BATCH_PARA_010_END = parseInt(result[len - 1][VARIABLES.PARA_010]);
        BATCH_PARA_012_END = parseInt(result[len - 1][VARIABLES.PARA_012]);
        BATCH_C_PARA_008_END = BATCH_PARA_001_END - BATCH_PARA_010_END - BATCH_PARA_012_END;

        BATCH_PARA_001 = BATCH_PARA_001_END - BATCH_PARA_001_START;
        BATCH_PARA_010 = BATCH_PARA_010_END - BATCH_PARA_010_START;
        BATCH_PARA_012 = BATCH_PARA_012_END - BATCH_PARA_012_START;
        BATCH_C_PARA_008 = BATCH_C_PARA_008_END - BATCH_C_PARA_008_START;
    }

    if (!doesCurrentRowStartNewShift(currentRowTime)) {

        if ((hourTime >= 7) && (hourTime < 15)) {
            rowDifferenceForShiftStart = minuteTime / 5 + (hourTime - 7) * 12;
        } else if ((hourTime >= 15) && (hourTime < 23)) {
            rowDifferenceForShiftStart = minuteTime / 5 + (hourTime - 15) * 12;
        } else if (hourTime === 23) {
            rowDifferenceForShiftStart = minuteTime / 5;
        } else if ((hourTime >= 0) && (hourTime < 7)) {
            rowDifferenceForShiftStart = minuteTime / 5 + hourTime * 12 + 12;
        } else {
            rowDifferenceForShiftStart = 0; //to be validates for the default case
        }

        shiftStartIndex = len - 1 - rowDifferenceForShiftStart;

        if (shiftStartIndex <= 0) {
            shiftStartParaVariables = result[0]
        } else {
            shiftStartParaVariables = result[shiftStartIndex]
        }

        SHIFT_PARA_001_START = parseInt(shiftStartParaVariables[VARIABLES.PARA_001]);
        SHIFT_PARA_010_START = parseInt(shiftStartParaVariables[VARIABLES.PARA_010]);
        SHIFT_PARA_012_START = parseInt(shiftStartParaVariables[VARIABLES.PARA_012]);
        SHIFT_C_PARA_008_START = SHIFT_PARA_001_START - SHIFT_PARA_010_START - SHIFT_PARA_012_START;
        SHIFT_PARA_001_END = parseInt(result[len - 1][VARIABLES.PARA_001]);
        SHIFT_PARA_010_END = parseInt(result[len - 1][VARIABLES.PARA_010]);
        SHIFT_PARA_012_END = parseInt(result[len - 1][VARIABLES.PARA_012]);
        SHIFT_C_PARA_008_END = SHIFT_PARA_001_END - SHIFT_PARA_010_END - SHIFT_PARA_012_END;

        SHIFT_PARA_001 = SHIFT_PARA_001_END - SHIFT_PARA_001_START;
        SHIFT_PARA_010 = SHIFT_PARA_010_END - SHIFT_PARA_010_START;
        SHIFT_PARA_012 = SHIFT_PARA_012_END - SHIFT_PARA_012_START;
        SHIFT_C_PARA_008 = SHIFT_C_PARA_008_END - SHIFT_C_PARA_008_START;
    }

    return {
        SHIFT_PARA_001: SHIFT_PARA_001,
        SHIFT_PARA_010: SHIFT_PARA_010,
        SHIFT_PARA_012: SHIFT_PARA_012,
        SHIFT_C_PARA_008: SHIFT_C_PARA_008,
        BATCH_PARA_001: BATCH_PARA_001,
        BATCH_PARA_010: BATCH_PARA_010,
        BATCH_PARA_012: BATCH_PARA_012,
        BATCH_C_PARA_008: BATCH_C_PARA_008,
        SHIFT_PARA_001_START: SHIFT_PARA_001_START,
        SHIFT_PARA_010_START: SHIFT_PARA_010_START,
        SHIFT_PARA_012_START: SHIFT_PARA_012_START,
        SHIFT_C_PARA_008_START: SHIFT_C_PARA_008_START,
        SHIFT_PARA_001_END: SHIFT_PARA_001_END,
        SHIFT_PARA_010_END: SHIFT_PARA_010_END,
        SHIFT_PARA_012_END: SHIFT_PARA_012_END,
        SHIFT_C_PARA_008_END: SHIFT_C_PARA_008_END,
        BATCH_PARA_001_START: BATCH_PARA_001_START,
        BATCH_PARA_010_START: BATCH_PARA_010_START,
        BATCH_PARA_012_START: BATCH_PARA_012_START,
        BATCH_C_PARA_008_START: BATCH_C_PARA_008_START,
        BATCH_PARA_001_END: BATCH_PARA_001_END,
        BATCH_PARA_010_END: BATCH_PARA_010_END,
        BATCH_PARA_012_END: BATCH_PARA_012_END,
        BATCH_C_PARA_008_END: BATCH_C_PARA_008_END

    }
}

function getVectorGraphFormat(data) {

    let loopingData = [...data]
    let finalData = [];
    for (let i = 0; i <= 60; i = i + 5) {
        finalData[i / 5] = {x: parseInt(i), y: parseFloat(loopingData[i / 5])};
    }
    return finalData;
}

function getVectorFormatForNormalizedData(data) {

    let maximum = Math.max(...data);
    let minimum = Math.min(...data);
    let finalData = [];

    if (maximum === minimum) {
        return data;
    }

    for (let i = 0; i <= 60; i = i + 5) {
        let calculatedData = (((data[i / 5] - minimum) / (maximum - minimum)) * 100)
        finalData[i / 5] = {x: parseInt(i), y: parseFloat(calculatedData)};
    }
    return finalData;
}

function getBarGraphDataForMaterialBalance(graphData, batchAndShiftData) {

    let PARA_001 = [];
    let PARA_010 = [];
    let PARA_012 = [];
    let C_PARA_008 = [];

    PARA_001[0] = {x: 'Last one hour', y: graphData.LAST_ONE_HR_PARA_001_END, y0: graphData.LAST_ONE_HR_PARA_001_START}
    PARA_001[1] = {
        x: 'Current Shift',
        y: batchAndShiftData.SHIFT_PARA_001_END,
        y0: batchAndShiftData.SHIFT_PARA_001_START
    }
    PARA_001[2] = {
        x: 'Current Batch',
        y: batchAndShiftData.BATCH_PARA_001_END,
        y0: batchAndShiftData.BATCH_PARA_001_START
    }

    PARA_010[0] = {x: 'Last one hour', y: graphData.LAST_ONE_HR_PARA_010_END, y0: graphData.LAST_ONE_HR_PARA_010_START}
    PARA_010[1] = {
        x: 'Current Shift',
        y: batchAndShiftData.SHIFT_PARA_010_END,
        y0: batchAndShiftData.SHIFT_PARA_010_START
    }
    PARA_010[2] = {
        x: 'Current Batch',
        y: batchAndShiftData.BATCH_PARA_010_END,
        y0: batchAndShiftData.BATCH_PARA_010_START
    }

    PARA_012[0] = {x: 'Last one hour', y: graphData.LAST_ONE_HR_PARA_012_END, y0: graphData.LAST_ONE_HR_PARA_012_START}
    PARA_012[1] = {
        x: 'Current Shift',
        y: batchAndShiftData.SHIFT_PARA_012_END,
        y0: batchAndShiftData.SHIFT_PARA_012_START
    }
    PARA_012[2] = {
        x: 'Current Batch',
        y: batchAndShiftData.BATCH_PARA_012_END,
        y0: batchAndShiftData.BATCH_PARA_012_START
    }

    C_PARA_008[0] = {
        x: 'Last one hour',
        y: graphData.LAST_ONE_HR_C_PARA_008_END,
        y0: graphData.LAST_ONE_HR_C_PARA_008_START
    }
    C_PARA_008[1] = {
        x: 'Current Shift',
        y: batchAndShiftData.SHIFT_C_PARA_008_END,
        y0: batchAndShiftData.SHIFT_C_PARA_008_START
    }
    C_PARA_008[2] = {
        x: 'Current Batch',
        y: batchAndShiftData.BATCH_C_PARA_008_END,
        y0: batchAndShiftData.BATCH_PARA_012_START
    }

    return {
        BAR_GRAPH_PARA_001: PARA_001,
        BAR_GRAPH_PARA_010: PARA_010,
        BAR_GRAPH_PARA_012: PARA_012,
        BAR_GRAPH_C_PARA_008: C_PARA_008,
    }
}

function calculatingAllVariables(result, benchmarkRow) {

    console.log("inside  calculatingAllVariables()=>:::::")

    let graphData = parseGraphData([...result], benchmarkRow);
    let totalTimeDifferenceInMinutes = calculateTotalTime([...result]);

    let cloneResult = [...result];
    let lastRow = cloneResult[cloneResult.length - 1];
    let previousRow = cloneResult[cloneResult.length - 2];

    let P_ALT = calculate_P_Alt_Variables(lastRow, benchmarkRow, totalTimeDifferenceInMinutes)
    let C_PARA = calculate_C_Para_Variables(lastRow, benchmarkRow, totalTimeDifferenceInMinutes, P_ALT)
    let BATCH_AND_SHIFT_DATA = calculateBatchAndShiftDifference([...result])

    let BAR_GRAPH_DATA = getBarGraphDataForMaterialBalance(graphData, BATCH_AND_SHIFT_DATA)

    sendRealTimeAlert(lastRow, csvHeaderData, previousRow)

    return {
        currentRow: lastRow,
        benchmarkRow: csvHeaderData,
        graphLabel: graphData.label, //need to change
        productRecovered: getVectorGraphFormat(graphData.productRecovered),
        rmConsumed: getVectorGraphFormat(graphData.rmConsumed),
        energyConsumed: getVectorGraphFormat(graphData.energyConsumed),
        normalizedProductRecovered: getVectorFormatForNormalizedData(graphData.productRecovered),
        normalizedRMConsumed: getVectorFormatForNormalizedData(graphData.rmConsumed),
        normalizedEnergyConsumed: getVectorFormatForNormalizedData(graphData.energyConsumed),
        effluentToETP: graphData.effluentToETP,
        totalTimeDifferenceInMinutes: totalTimeDifferenceInMinutes,
        P_ALT: P_ALT,
        C_PARA: C_PARA,
        GRAPH_P_ALT_001: getVectorGraphFormat(graphData.P_ALT_001),
        GRAPH_P_ALT_002: getVectorGraphFormat(graphData.P_ALT_002),
        GRAPH_C_PARA_001: getVectorGraphFormat(graphData.C_PARA_001),
        normalizedGRAPH_P_ALT_001: getVectorFormatForNormalizedData(graphData.P_ALT_001),
        normalizedGRAPH_P_ALT_002: getVectorFormatForNormalizedData(graphData.P_ALT_002),
        normalizedGRAPH_C_PARA_001: getVectorFormatForNormalizedData(graphData.C_PARA_001),
        GRAPH_C_PARA_008: graphData.C_PARA_008,
        LAST_ONE_HR_PARA_001: graphData.LAST_ONE_HR_PARA_001,
        LAST_ONE_HR_PARA_010: graphData.LAST_ONE_HR_PARA_010,
        LAST_ONE_HR_PARA_012: graphData.LAST_ONE_HR_PARA_012,
        LAST_ONE_HR_C_PARA_008: graphData.LAST_ONE_HR_C_PARA_008,
        LAST_ONE_HR_PARA_001_START: graphData.LAST_ONE_HR_PARA_001_START,
        LAST_ONE_HR_PARA_010_START: graphData.LAST_ONE_HR_PARA_010_START,
        LAST_ONE_HR_PARA_012_START: graphData.LAST_ONE_HR_PARA_012_START,
        LAST_ONE_HR_C_PARA_008_START: graphData.LAST_ONE_HR_C_PARA_008_START,
        LAST_ONE_HR_PARA_001_END: graphData.LAST_ONE_HR_PARA_001_END,
        LAST_ONE_HR_PARA_010_END: graphData.LAST_ONE_HR_PARA_010_END,
        LAST_ONE_HR_PARA_012_END: graphData.LAST_ONE_HR_PARA_012_END,
        LAST_ONE_HR_C_PARA_008_END: graphData.LAST_ONE_HR_C_PARA_008_END,
        SHIFT_PARA_001: BATCH_AND_SHIFT_DATA.SHIFT_PARA_001,
        SHIFT_PARA_010: BATCH_AND_SHIFT_DATA.SHIFT_PARA_010,
        SHIFT_PARA_012: BATCH_AND_SHIFT_DATA.SHIFT_PARA_012,
        SHIFT_C_PARA_008: BATCH_AND_SHIFT_DATA.SHIFT_C_PARA_008,
        BATCH_PARA_001: BATCH_AND_SHIFT_DATA.BATCH_PARA_001,
        BATCH_PARA_010: BATCH_AND_SHIFT_DATA.BATCH_PARA_010,
        BATCH_PARA_012: BATCH_AND_SHIFT_DATA.BATCH_PARA_012,
        BATCH_C_PARA_008: BATCH_AND_SHIFT_DATA.BATCH_C_PARA_008,
        SHIFT_PARA_001_START: BATCH_AND_SHIFT_DATA.SHIFT_PARA_001_START,
        SHIFT_PARA_010_START: BATCH_AND_SHIFT_DATA.SHIFT_PARA_010_START,
        SHIFT_PARA_012_START: BATCH_AND_SHIFT_DATA.SHIFT_PARA_012_START,
        SHIFT_C_PARA_008_START: BATCH_AND_SHIFT_DATA.SHIFT_C_PARA_008_START,
        SHIFT_PARA_001_END: BATCH_AND_SHIFT_DATA.SHIFT_PARA_001_END,
        SHIFT_PARA_010_END: BATCH_AND_SHIFT_DATA.SHIFT_PARA_010_END,
        SHIFT_PARA_012_END: BATCH_AND_SHIFT_DATA.SHIFT_PARA_012_END,
        SHIFT_C_PARA_008_END: BATCH_AND_SHIFT_DATA.SHIFT_C_PARA_008_END,
        BATCH_PARA_001_START: BATCH_AND_SHIFT_DATA.BATCH_PARA_001_START,
        BATCH_PARA_010_START: BATCH_AND_SHIFT_DATA.BATCH_PARA_010_START,
        BATCH_PARA_012_START: BATCH_AND_SHIFT_DATA.BATCH_PARA_012_START,
        BATCH_C_PARA_008_START: BATCH_AND_SHIFT_DATA.BATCH_C_PARA_008_START,
        BATCH_PARA_001_END: BATCH_AND_SHIFT_DATA.BATCH_PARA_001_END,
        BATCH_PARA_010_END: BATCH_AND_SHIFT_DATA.BATCH_PARA_010_END,
        BATCH_PARA_012_END: BATCH_AND_SHIFT_DATA.BATCH_PARA_012_END,
        BATCH_C_PARA_008_END: BATCH_AND_SHIFT_DATA.BATCH_C_PARA_008_END,
        BAR_GRAPH_PARA_001: BAR_GRAPH_DATA.BAR_GRAPH_PARA_001,
        BAR_GRAPH_PARA_010: BAR_GRAPH_DATA.BAR_GRAPH_PARA_010,
        BAR_GRAPH_PARA_012: BAR_GRAPH_DATA.BAR_GRAPH_PARA_012,
        BAR_GRAPH_C_PARA_008: BAR_GRAPH_DATA.BAR_GRAPH_C_PARA_008,
    }
}

app.get('/', function (req, res) {
    res.end(JSON.stringify(finalResult));
})

function sendPushNotification(title, messageBody) {

    console.log("Inside send Push notifications")
    var request = require('request');

    request.post(
        'https://exp.host/--/api/v2/push/send',
        {json: {"to": tokenArray, "title": title, "body": messageBody}},
        function (error, response, body) {
            if (!error && response.statusCode === 200) {
                console.log("Success Body:", body);
            } else {
                console.log("Error: ", error)
                console.log("Response status", response.statusCode)
                console.log("Body: ", body);
                console.log("Error Body: ", body.errors[0].details)
            }
        }
    );

    // curl -H "Content-Type: application/json" -X POST "https://exp.host/--/api/v2/push/send" -d '{"to":"ExponentPushToken[ZDy-LzLA7e4k8OddWFS3KG]","title":"hello","body":"world"}'
}


function sendRealTimeAlert(lastRow, benchmarkRow, previousRow, timeDuration = 35) {

    tokenArray = [];

    firebase.firestore().collection("collections").doc("notifications").onSnapshot((doc) => {
        if (doc.exists) {

            doc.data().token.forEach((key) => {
                tokenArray.push(key);
            });

            if ((lastRow[VARIABLES.PARA_001] + lastRow[VARIABLES.PARA_002] - lastRow[VARIABLES.PARA_003] - lastRow[VARIABLES.PARA_004] + lastRow[VARIABLES.PARA_005]) >= benchmarkRow[VARIABLES.BM_002]) {
                sendPushNotification("RTA-001", "Real Time Alert 1")
            }

            if ((lastRow[VARIABLES.PARA_001] <= benchmarkRow[VARIABLES.BM_001]) && (lastRow[VARIABLES.PARA_002] > previousRow[VARIABLES.PARA_002])) {
                if (timeDuration >= 30) {
                    sendPushNotification("RTA-002", "Real Time Alert 2")
                }
            }

            if ((lastRow[VARIABLES.PARA_006] >= benchmarkRow[VARIABLES.BM_003]) && (lastRow[VARIABLES.PARA_007] < 5) && (lastRow[VARIABLES.PARA_008] < 100)) {
                if (timeDuration >= 30) {
                    sendPushNotification("RTA-003", "Real Time Alert 3")
                }
            }

            if ((lastRow[VARIABLES.PARA_003] - lastRow[VARIABLES.PARA_011] - lastRow[VARIABLES.PARA_012]) >= benchmarkRow[VARIABLES.BM_004]) {
                sendPushNotification("RTA-004", "Real Time Alert 4")
            }

            if ((lastRow[VARIABLES.PARA_013] <= benchmarkRow[VARIABLES.BM_005])) {
                sendPushNotification("RTA-005", "Real Time Alert 5")
            }

            if ((lastRow[VARIABLES.PARA_014] >= benchmarkRow[VARIABLES.BM_006]) && (lastRow[VARIABLES.PARA_015] < 60) && (lastRow[VARIABLES.PARA_016] < 50)) {
                if (timeDuration >= 30) {
                    sendPushNotification("RTA-006", "Real Time Alert 6  ")
                }
            }

            if ((lastRow[VARIABLES.PARA_004] - lastRow[VARIABLES.PARA_009] - lastRow[VARIABLES.PARA_004]) >= benchmarkRow[VARIABLES.BM_007]) {
                sendPushNotification("RTA-007", "Real Time Alert 7")
            }

            if (lastRow[VARIABLES.PARA_017] <= benchmarkRow[VARIABLES.BM_008]) {
                sendPushNotification("RTA-008", "Real Time Alert 8")
            }
        }

    })
}

var server = app.listen(process.env.PORT, function () {
    firebaseInitialize();
    // sendPushNotification("Hello Krishna", "Welcome to Pretech-UI");
    setInterval(() => {
        initialize();
    }, 15000);
})
